"""Knowledge base: structured YAML modules in knowledge/, plus an append-only
evidence log and changelog. Git history is the version history.

Claim lifecycle (spec section 8.3):
  observed          seen in one video
  hypothesis        some basis, needs more evidence
  repeated_pattern  evidence from >= 3 different videos and no open counter-evidence (automatic)
  confirmed         only set by Colin (`cba kb-confirm`)
  revised           a claim was changed after new evidence; the old text stays in `history`
Claims are never deleted.
"""
from __future__ import annotations

import datetime as dt
import json

import yaml

from . import config

MODULE_FILES = {
    "technical_profile": "technical_profile.yaml",
    "playing_style": "playing_style.yaml",
    "coaching_philosophy": "coaching_philosophy.yaml",
    "content_style": "content_style.yaml",
}
RANK = {"hypothesis": 0, "observed": 1, "repeated_pattern": 2, "confirmed": 3, "revised": 1}


def today() -> str:
    return dt.date.today().isoformat()


def load(module: str) -> dict:
    return yaml.safe_load((config.KNOWLEDGE_DIR / MODULE_FILES[module]).read_text("utf-8"))


def dump(module: str, data: dict) -> None:
    data["updated"] = today()
    (config.KNOWLEDGE_DIR / MODULE_FILES[module]).write_text(
        yaml.safe_dump(data, allow_unicode=True, sort_keys=False, width=100), "utf-8")


def _find_dimension(data: dict, dim: str) -> dict:
    """dimension keys may be dotted: 'footwork.recovery' -> dimensions.footwork.aspects.recovery"""
    head, _, tail = dim.partition(".")
    dims = data.setdefault("dimensions", {})
    node = dims.setdefault(head, {"label": {"zh": head, "en": head}, "status": "needs_verification", "claims": []})
    if tail:
        node = node.setdefault("aspects", {}).setdefault(
            tail, {"label": {"zh": tail, "en": tail}, "status": "needs_verification", "claims": []})
    node.setdefault("claims", [])
    return node


def _videos(claim) -> set:
    return {e["video"] for e in claim.get("evidence", [])}


def _auto_status(claim) -> str:
    if claim.get("status") == "confirmed":
        return "confirmed"
    open_counter = [c for c in claim.get("counter_evidence", []) if not c.get("resolved")]
    if len(_videos(claim)) >= 3 and not open_counter:
        return "repeated_pattern"
    return claim.get("status", "observed")


def propose(video_id: str, meta: dict, analysis: dict) -> dict:
    changes = []
    for u in analysis.get("kb_updates", []):
        data = load(u["module"])
        node = _find_dimension(data, u["dimension"])
        ev = [{"video": video_id, "start": e["start"], "end": e.get("end", e["start"]),
               "observation": e["observation"], "added": today()} for e in u["evidence"]]
        target = next((c for c in node["claims"] if c["id"] == u.get("claim_id")), None)
        if target:
            changes.append({"op": "add_evidence", "module": u["module"], "dimension": u["dimension"],
                            "claim_id": target["id"], "claim": target["claim"], "evidence": ev,
                            "counter": bool(u.get("is_counter_evidence"))})
        else:
            changes.append({"op": "new_claim", "module": u["module"], "dimension": u["dimension"],
                            "claim": u["claim"], "status": u["status"], "confidence": u["confidence"],
                            "evidence": ev, "counter_evidence_note": u.get("counter_evidence", "")})
    # Player-specific claims wait until Colin confirms which player he is (or similar open questions).
    pending = [{"op": "pending", "module": u["module"], "dimension": u["dimension"], "claim": u["claim"],
                "status": u.get("status"), "confidence": u.get("confidence"), "waiting_for": u.get("waiting_for", ""),
                "evidence": [{"video": video_id, "start": e["start"], "end": e.get("end", e["start"]),
                              "observation": e["observation"], "added": today()} for e in u["evidence"]]}
               for u in analysis.get("pending_kb_updates", [])]
    return {"video": video_id, "source_file": meta["original_filename"], "created": today(),
            "changes": changes, "pending": pending, "applied": False}


def apply(proposal: dict) -> list[str]:
    log = []
    touched = {}
    for ch in proposal["changes"]:
        data = touched.get(ch["module"]) or load(ch["module"])
        touched[ch["module"]] = data
        node = _find_dimension(data, ch["dimension"])
        if ch["op"] == "new_claim":
            n = len(node["claims"]) + 1
            cid = f"{ch['dimension']}-{n:02d}"
            claim = {"id": cid, "claim": ch["claim"], "status": ch["status"], "confidence": ch["confidence"],
                     "evidence": ch["evidence"], "counter_evidence": [], "history": [],
                     "created": today(), "updated": today()}
            if ch.get("counter_evidence_note"):
                claim["notes"] = ch["counter_evidence_note"]
            node["claims"].append(claim)
            log.append(f"+ {ch['module']}/{cid} [{ch['status']}] {ch['claim']}")
        else:
            claim = next(c for c in node["claims"] if c["id"] == ch["claim_id"])
            key = "counter_evidence" if ch.get("counter") else "evidence"
            claim.setdefault(key, []).extend(ch["evidence"])
            old = claim["status"]
            claim["status"] = _auto_status(claim)
            claim["updated"] = today()
            if old != claim["status"]:
                claim["history"].append({"date": today(), "from": old, "to": claim["status"],
                                         "reason": f"evidence from {proposal['video']}"})
            log.append(f"~ {ch['module']}/{claim['id']} {key} +{len(ch['evidence'])} ({old} -> {claim['status']})")
        node["status"] = "has_evidence"
    for m, data in touched.items():
        dump(m, data)
    evlog = config.KNOWLEDGE_DIR / "evidence" / "log.jsonl"
    evlog.parent.mkdir(parents=True, exist_ok=True)
    with open(evlog, "a", encoding="utf-8") as f:
        for ch in proposal["changes"]:
            f.write(json.dumps({"date": today(), "video": proposal["video"], **ch}, ensure_ascii=False) + "\n")
    cl = config.KNOWLEDGE_DIR / "CHANGELOG.md"
    with open(cl, "a", encoding="utf-8") as f:
        f.write(f"\n## {today()} — video {proposal['video']} ({proposal['source_file']})\n")
        f.writelines(f"- {line}\n" for line in log)
    return log
