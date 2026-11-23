# Colin Badminton knowledge base

Structured, versioned (git) knowledge about Colin Zhou, built from evidence.

| File | Module |
|---|---|
| `technical_profile.yaml` | Colin Technical Profile — technique (16 dimensions) + tactics (11) |
| `playing_style.yaml` | Colin Playing Style |
| `coaching_philosophy.yaml` | Colin Coaching Philosophy — stated principles (from the site) vs. observed in video |
| `content_style.yaml` | Colin Content Style |
| `public_facts.yaml` | The only allowed source for honours and history in public copy |
| `evidence/log.jsonl` | Append-only log of every evidence item added |
| `CHANGELOG.md` | Human-readable history of KB changes |

**Rules.** Every claim has evidence (video + timestamps + observation), a status and a confidence.
`needs_verification` = no evidence yet; nothing is filled in by guessing.

Status: `observed` (seen once) · `hypothesis` · `repeated_pattern` (≥3 different videos, set automatically) ·
`confirmed` (only Colin, `cba kb-confirm`) · `revised` (old text kept in `history`). Claims are never deleted.

Changes arrive through the pipeline: each video produces `kb_proposal.json`, shown in the preview, and
`cba kb-apply <job>` writes it here.
