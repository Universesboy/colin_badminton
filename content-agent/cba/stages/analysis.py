"""Stages 3/6/7/8: classification, technical analysis, key moments, content plan.

Two backends, chosen with CBA_ANALYST:
- "agent" (default): the stage writes analysis_request.md listing the inputs and
  stops with Needs Attention. Claude working in this project reads the sheets
  and writes analysis.json, then the pipeline continues. No API key needed.
- "api": sends the same inputs to the Claude API (needs ANTHROPIC_API_KEY;
  billed per call) and validates the JSON it returns.
Either way analysis.json is validated before anything downstream runs.
"""
from __future__ import annotations

import base64
import json
import os

from .. import config
from ..analysis_schema import TEMPLATE, validate
from ..job import NeedsAttention

MODEL = os.environ.get("CBA_MODEL", "claude-opus-5-5")


def _kb_snapshot() -> str:
    parts = []
    for p in sorted(config.KNOWLEDGE_DIR.glob("*.yaml")):
        parts.append(f"### {p.name}\n{p.read_text('utf-8')}")
    return "\n\n".join(parts)


def _inputs_text(job) -> str:
    meta = job.read_json("metadata.json")
    tr = job.read_json("transcript.json")
    sig = job.read_json("signals.json")
    sig_small = {k: v for k, v in sig.items() if k not in ("motion_per_sec", "loudness_db_per_sec")}
    return (f"## metadata.json\n{json.dumps(meta, ensure_ascii=False)}\n\n"
            f"## transcript.json\n{json.dumps(tr, ensure_ascii=False)}\n\n"
            f"## signals.json (motion/loudness arrays omitted)\n{json.dumps(sig_small, ensure_ascii=False)}\n\n"
            f"## motion_per_sec\n{sig['motion_per_sec']}\n")


def _write_request(job) -> None:
    kf = job.read_json("keyframes.json")
    sheets = kf["overview_sheets"] + kf["rally_sheets"]
    job.file("analysis_request.md").write_text(
        (config.AGENT_DIR / "prompts" / "analysis.md").read_text("utf-8")
        + f"\n\n## This job\n- job dir: `{job.dir}`\n- sheets to view:\n"
        + "".join(f"  - `{job.dir / s}`\n" for s in sheets)
        + "\n## Template\n```json\n" + json.dumps(TEMPLATE, ensure_ascii=False, indent=2) + "\n```\n",
        "utf-8")


def _call_api(job) -> dict:
    import anthropic
    client = anthropic.Anthropic()
    kf = job.read_json("keyframes.json")
    content = []
    for s in (kf["overview_sheets"] + kf["rally_sheets"])[:20]:
        data = base64.standard_b64encode((job.dir / s).read_bytes()).decode()
        content.append({"type": "text", "text": f"Contact sheet {s} (tiles stamped with timestamps):"})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": data}})
    content.append({"type": "text", "text": _inputs_text(job)
                    + "\n\n## Template\n" + json.dumps(TEMPLATE, ensure_ascii=False)})
    system = ((config.AGENT_DIR / "prompts" / "analysis.md").read_text("utf-8")
              + "\n\n# Knowledge base\n" + _kb_snapshot())
    messages = [{"role": "user", "content": content}]
    meta = job.read_json("metadata.json")
    for attempt in range(2):
        with client.beta.messages.stream(
            model=MODEL, max_tokens=64000, system=system, messages=messages,
            output_config={"effort": "high"},
            betas=["server-side-fallback-2026-07-01"], fallbacks="default",
        ) as stream:
            msg = stream.get_final_message()
        if msg.stop_reason == "refusal":
            raise RuntimeError(f"model declined: {msg.stop_details}")
        text = next((b.text for b in msg.content if b.type == "text"), "")
        text = text.strip().removeprefix("```json").removesuffix("```").strip()
        try:
            a = json.loads(text)
        except json.JSONDecodeError as e:
            errs = [f"invalid JSON: {e}"]
        else:
            errs = validate(a, meta["duration_sec"])
            if not errs:
                a["analyst"] = f"{msg.model} (api mode)"
                return a
        messages += [{"role": "assistant", "content": msg.content},
                     {"role": "user", "content": "Fix these problems and return the full JSON again:\n- "
                      + "\n- ".join(errs)}]
    raise RuntimeError("analysis failed validation twice: " + "; ".join(errs))


def run(job):
    meta = job.read_json("metadata.json")
    p = job.dir / "analysis.json"
    if not p.exists():
        if os.environ.get("CBA_ANALYST", "agent") == "api":
            job.write_json("analysis.json", _call_api(job))
        else:
            _write_request(job)
            raise NeedsAttention("waiting for analysis.json (agent mode): see analysis_request.md")
    a = json.loads(p.read_text("utf-8"))
    errs = validate(a, meta["duration_sec"])
    if errs:
        raise NeedsAttention("analysis.json invalid: " + "; ".join(errs[:12]))
    return {"video_types": a["video_types"], "key_moments": len(a["key_moments"]),
            "observations": len(a["technical_observations"])}
