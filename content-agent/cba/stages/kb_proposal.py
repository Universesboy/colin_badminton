"""Stage 13: turn analysis.kb_updates into a reviewable knowledge-base change.

Nothing is written to knowledge/ here; `cba kb-apply <job>` applies it (after
Colin reviewed it with the rest of the preview). See cba/kb.py for the rules.
"""
from __future__ import annotations

from .. import kb


def run(job):
    a = job.read_json("analysis.json")
    meta = job.read_json("metadata.json")
    proposal = kb.propose(job.id, meta, a)
    job.write_json("kb_proposal.json", proposal)
    return {"changes": len(proposal["changes"])}
