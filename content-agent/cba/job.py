"""Job state: one folder per video, one job.json, one log file.

Every stage is independent and idempotent. A stage that finished is skipped on
re-run unless forced, so a crashed or interrupted run resumes where it stopped.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import shutil
import traceback
from pathlib import Path

from . import config

# Pipeline order. Each name maps to a module in cba.stages.
STAGES = [
    "metadata",     # 2  Metadata Extraction
    "transcribe",   # 4  Speech Transcription
    "signals",      # 5  Visual / audio signals (motion, hits, scene cuts, rallies)
    "keyframes",    # 5  Keyframes + contact sheets for visual analysis
    "analysis",     # 3,6,7,8  Classification, technical analysis, key moments, content plan
    "edit",         # 9  Video Editing (long + short)
    "subtitles",    # 10 Bilingual subtitles (srt + burned-in)
    "thumbnail",    # 11 Cover images
    "copy",         # 12 Titles, descriptions, SEO per platform
    "kb_proposal",  # 13 Knowledge base update proposal
    "preview",      # 14 Preview page
]
# Gated stages run only through explicit commands (approve / publish / site / kb-apply).
GATED = ["approval", "publish_youtube", "site_sync", "kb_apply"]

# Overall job statuses (spec section 10)
RECEIVED, PROCESSING, ANALYZING, EDITING, GENERATING = (
    "Received", "Processing", "Analyzing", "Editing", "Generating Assets")
READY, APPROVED, PUBLISHING, PUBLISHED, FAILED, ATTENTION = (
    "Ready for Review", "Approved", "Publishing", "Published", "Failed", "Needs Attention")

STAGE_TO_STATUS = {
    "metadata": PROCESSING, "transcribe": PROCESSING, "signals": ANALYZING,
    "keyframes": ANALYZING, "analysis": ANALYZING, "edit": EDITING,
    "subtitles": GENERATING, "thumbnail": GENERATING, "copy": GENERATING,
    "kb_proposal": GENERATING, "preview": GENERATING,
}


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def sha256_file(path: Path, chunk: int = 8 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            b = f.read(chunk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


class NeedsAttention(Exception):
    """Raised by a stage that cannot continue without a human or agent input."""


class Job:
    def __init__(self, job_id: str):
        self.id = job_id
        self.dir = config.JOBS_DIR / job_id
        self.path = self.dir / "job.json"
        self.data = json.loads(self.path.read_text("utf-8"))

    # ---------- creation ----------
    @classmethod
    def ingest(cls, src: Path, source: str = "upload", note: str = "", link: bool = False) -> "Job":
        src = Path(src).resolve()
        if not src.exists():
            raise FileNotFoundError(src)
        digest = sha256_file(src)
        job_id = "v" + digest[:12]
        jdir = config.JOBS_DIR / job_id
        if (jdir / "job.json").exists():           # duplicate protection
            job = cls(job_id)
            job.log(f"duplicate ingest of {src.name}; existing job reused")
            return job
        config.RAW_DIR.mkdir(parents=True, exist_ok=True)
        raw = config.RAW_DIR / f"{job_id}{src.suffix.lower()}"
        if not raw.exists():
            if link:
                raw.symlink_to(src)
            else:
                shutil.copy2(src, raw)               # the original is never modified
        jdir.mkdir(parents=True, exist_ok=True)
        data = {
            "id": job_id,
            "sha256": digest,
            "original_filename": src.name,
            "source": source,
            "note": note,
            "received_at": now(),
            "raw_path": str(raw),
            "status": RECEIVED,
            "stages": {s: {"status": "pending"} for s in STAGES + GATED},
            "history": [],
        }
        (jdir / "job.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")
        job = cls(job_id)
        job.log(f"received {src.name} ({src.stat().st_size} bytes) from {source}")
        return job

    @classmethod
    def all(cls) -> list["Job"]:
        if not config.JOBS_DIR.exists():
            return []
        return [cls(p.name) for p in sorted(config.JOBS_DIR.iterdir()) if (p / "job.json").exists()]

    # ---------- state ----------
    @property
    def raw(self) -> Path:
        return Path(self.data["raw_path"])

    def save(self) -> None:
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.data, ensure_ascii=False, indent=2), "utf-8")
        tmp.replace(self.path)

    def log(self, msg: str) -> None:
        with open(self.dir / "pipeline.log", "a", encoding="utf-8") as f:
            f.write(f"{now()} {msg}\n")

    def stage(self, name: str) -> dict:
        return self.data["stages"].setdefault(name, {"status": "pending"})

    def set_stage(self, name: str, **kw) -> None:
        st = self.stage(name)
        st.update(kw)
        self.save()

    def file(self, *parts: str) -> Path:
        p = self.dir.joinpath(*parts)
        p.parent.mkdir(parents=True, exist_ok=True)
        return p

    def read_json(self, name: str):
        p = self.dir / name
        return json.loads(p.read_text("utf-8")) if p.exists() else None

    def write_json(self, name: str, obj) -> Path:
        p = self.file(name)
        p.write_text(json.dumps(obj, ensure_ascii=False, indent=2), "utf-8")
        return p

    def snapshot(self, name: str) -> None:
        """Keep a versioned copy before an output is regenerated (rollback)."""
        p = self.dir / name
        if p.exists():
            vdir = self.file("versions")
            stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
            target = vdir / f"{stamp}-{p.name}"
            if p.is_dir():
                shutil.copytree(p, target)
            else:
                shutil.copy2(p, target)

    # ---------- running ----------
    def run_stage(self, name: str, fn, force: bool = False, retries: int = 1) -> bool:
        st = self.stage(name)
        if st.get("status") == "done" and not force:
            return True
        self.data["status"] = STAGE_TO_STATUS.get(name, self.data["status"])
        attempts = st.get("attempts", 0)
        for i in range(retries + 1):
            attempts += 1
            self.set_stage(name, status="running", started=now(), attempts=attempts, error=None)
            self.log(f"[{name}] start (attempt {attempts})")
            try:
                outputs = fn(self) or {}
                self.set_stage(name, status="done", finished=now(), outputs=outputs)
                self.log(f"[{name}] done {outputs}")
                return True
            except NeedsAttention as e:
                self.set_stage(name, status="needs_attention", error=str(e))
                self.data["status"] = ATTENTION
                self.save()
                self.log(f"[{name}] needs attention: {e}")
                return False
            except Exception as e:  # noqa: BLE001
                tb = traceback.format_exc()
                self.log(f"[{name}] error: {e}\n{tb}")
                self.set_stage(name, status="failed", error=f"{type(e).__name__}: {e}")
                if i == retries:
                    self.data["status"] = FAILED
                    self.save()
                    return False
        return False

    def invalidate_from(self, name: str) -> None:
        """Mark a stage and every later stage pending (after a manual edit)."""
        order = STAGES + GATED
        for s in order[order.index(name):]:
            if s in ("approval", "publish_youtube", "site_sync", "kb_apply") and \
                    self.stage(s).get("status") == "done" and s != "approval":
                continue  # never silently "un-publish" history
            self.stage(s)["status"] = "pending"
        if self.stage("approval").get("status") == "done":
            self.data["history"].append({"at": now(), "event": "approval revoked: content changed"})
            self.stage("approval")["status"] = "pending"
        self.save()
