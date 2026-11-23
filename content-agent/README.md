# Colin Badminton content agent (`cba`)

Turns one raw badminton video into: an analysis report with timestamped evidence, a long cut and a
≤60 s vertical Short, bilingual (中文/English) subtitles, covers, per-platform copy, a review page, and
a knowledge-base update proposal. Publishing to YouTube and the website only happens after Colin's
approval is recorded.

```
video ─ ingest ─ metadata ─ transcribe ─ signals ─ keyframes ─ analysis ─ edit ─ subtitles
      ─ thumbnail ─ copy ─ kb_proposal ─ preview ──▶ [Colin reviews]
      ─ approve ─ publish (YouTube) ─ site (PR to colinbadminton.com) ─ kb-apply ─ site-check
```

Every stage is a separate, resumable step with its own status in `data/jobs/<id>/job.json` and a log
in `pipeline.log`. Re-running skips finished stages; `--from STAGE` regenerates from a point (older
outputs are kept in `versions/`). The same file hashed twice is recognised as a duplicate.

## Quick start

```bash
pip install -r content-agent/requirements.txt          # needs ffmpeg on PATH
content-agent/scripts/fetch_models.sh                  # offline speech model, ~165 MB
cd content-agent
python -m cba ingest /path/to/match.mp4 --note "OCAA final vs X" --run
# analysis step: in agent mode Claude writes data/jobs/<id>/analysis.json (see analysis_request.md)
python -m cba run <id>                                 # finishes edit → preview
open data/jobs/<id>/preview/index.html
python -m cba approve <id> --by Colin --privacy unlisted
python -m cba publish <id> --dry-run                   # shows exactly what would be uploaded
python -m cba publish <id>
python -m cba site <id> --pr                           # opens a PR; merging deploys the site
python -m cba kb-apply <id>
```

## What each stage uses

| Stage | Tool | Notes |
|---|---|---|
| metadata | ffprobe | only facts from the file; context fields stay empty until Colin fills them |
| transcribe | sherpa-onnx + SenseVoice-Small int8 + Silero VAD | offline, CPU, zh/en/mixed; machine transcript, marked unverified |
| signals | numpy on ffmpeg PCM/frames | hit candidates (racket-impact transients), rally candidates, idle stretches, cuts, music detection |
| keyframes | ffmpeg + Pillow | timestamp-stamped contact sheets, overview + per rally |
| analysis | Claude | `CBA_ANALYST=agent` (default: Claude in the project writes `analysis.json`) or `api` (Claude API, needs `ANTHROPIC_API_KEY`) |
| edit | ffmpeg filtergraph | segment list → long 16:9 + Short 9:16; slow motion only as 0.5×/0.25× repeats, muted |
| subtitles | pysubs2 + libass | srt (zh, en, zh-en) for caption upload + burned-in version |
| thumbnail | Pillow on a real frame | 1280×720, 1080×1440, site poster webp |
| copy | analysis.copy | per platform; honours checked against `knowledge/public_facts.yaml` |
| publish | YouTube Data API v3 | OAuth desktop client; resumable upload; captions + thumbnail best effort |
| site | `src/data/site.js` + poster | branch + PR; GitHub Actions deploys on merge |

## YouTube setup (Colin, once)

1. Google Cloud Console → new project → enable **YouTube Data API v3**.
2. OAuth consent screen (External, add yourself as test user) → Credentials → **OAuth client ID → Desktop app**.
3. Save the JSON as `~/.config/colin-badminton/client_secret.json` (never in the repo).
4. `python -m cba youtube-auth` — sign in with the channel's Google account once; the refresh token is stored next to it.

Quota (checked 2026-11-23 on developers.google.com): uploads have their own bucket of 100 `videos.insert`
calls/day; `captions.insert` costs 400 and `thumbnails.set` 50 of the 10,000 daily units. Custom
thumbnails need a verified channel. Xiaohongshu has no public posting API for personal accounts, so its
copy and cover are prepared for manual posting.

## Safety rules built in

- No publish without `cba approve` (or `--direct` when Colin says 直接发布); pre-flight checks still run.
- Privacy flags (possible minors, names/contacts, private venues) and unverified honours block publishing
  until explicitly accepted with `--accept`.
- A failed upload is logged as failed; only a real video id from YouTube is reported as published.
- Secrets live in `~/.config/colin-badminton/`; raw videos, renders and models are git-ignored.
