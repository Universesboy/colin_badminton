"""YouTube publishing (YouTube Data API v3), adapted from Google's official
resumable-upload sample (google-api-python-client MediaFileUpload).

Setup (once, by Colin): create an OAuth client "Desktop app" in Google Cloud
Console with the YouTube Data API v3 enabled, save it as
~/.config/colin-badminton/client_secret.json, then run `cba youtube-auth`.
The refresh token is stored next to it, never in the repo.

Safety:
- refuses to run without a recorded approval (or --direct, Colin's "直接发布")
- automated pre-flight checks always run (privacy flags, claim flags, files)
- --dry-run prints exactly what would be sent
- the result (video id + URL) is written to publish_log.json; on failure the
  error is recorded and nothing is reported as published
"""
from __future__ import annotations

import json
import random
import time

from . import config
from .job import now

SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube.force-ssl"]
RETRIABLE_STATUS = {500, 502, 503, 504}


def _creds():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    tok = config.SECRETS_DIR / "youtube_token.json"
    creds = Credentials.from_authorized_user_file(str(tok), SCOPES) if tok.exists() else None
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    if not creds or not creds.valid:
        secret = config.SECRETS_DIR / "client_secret.json"
        if not secret.exists():
            raise FileNotFoundError(f"missing {secret}; see content-agent/README.md 'YouTube setup'")
        creds = InstalledAppFlow.from_client_secrets_file(str(secret), SCOPES).run_local_server(port=0)
    config.SECRETS_DIR.mkdir(parents=True, exist_ok=True)
    tok.write_text(creds.to_json(), "utf-8")
    try:
        tok.chmod(0o600)
    except OSError:
        pass
    return creds


def service():
    from googleapiclient.discovery import build
    return build("youtube", "v3", credentials=_creds(), cache_discovery=False)


def preflight(job, kind: str) -> list[str]:
    a = job.read_json("analysis.json")
    problems = []
    priv = a["people_and_privacy"]
    if priv.get("possible_minors"):
        problems.append("possible minors on screen: needs Colin's explicit privacy confirmation")
    if priv.get("names_or_contacts_visible"):
        problems.append("names/contacts visible on screen")
    if priv.get("private_location_risk"):
        problems.append("private location risk")
    flags = job.read_json("copy_flags.json") or []
    problems += [f"claim check: {f}" for f in flags]
    dec = job.read_json("edit_decisions.json")
    if kind not in dec["outputs"]:
        problems.append(f"no {kind} render")
    return problems


def upload(job, kind: str, privacy: str, dry_run: bool, accept: list[str]) -> dict:
    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload
    copy = job.read_json("copy.json")
    meta = copy["youtube"] if kind == "long" else copy["shorts"]
    subs = job.read_json("subtitles.json") or {}
    dec = job.read_json("edit_decisions.json")
    video_file = job.dir / (subs.get(kind, {}).get("subtitled") or dec["outputs"][kind]["file"])
    body = {
        "snippet": {"title": meta["title"][:100], "description": meta["description"][:5000],
                    "tags": meta.get("tags", [])[:30], "categoryId": "17",
                    "defaultLanguage": copy["youtube"].get("defaultLanguage", "zh")},
        "status": {"privacyStatus": privacy, "selfDeclaredMadeForKids": False},
    }
    problems = [p for p in preflight(job, kind) if p not in accept]
    if problems:
        raise RuntimeError("pre-flight checks failed:\n- " + "\n- ".join(problems))
    plan = {"file": str(video_file), "body": body,
            "captions": [str(job.dir / f"subs/{kind}/{kind}.{l}.srt") for l in ("zh-Hans", "en")],
            "thumbnail": str(job.dir / "covers/youtube_1280x720.jpg") if kind == "long" else None}
    if dry_run:
        return {"dry_run": True, **plan}
    yt = service()
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(str(video_file), chunksize=8 << 20, resumable=True))
    response, retry = None, 0
    while response is None:
        try:
            status, response = req.next_chunk()
            if status:
                job.log(f"[publish:{kind}] upload {int(status.progress() * 100)}%")
        except HttpError as e:
            if e.resp.status not in RETRIABLE_STATUS or retry >= 8:
                raise
            retry += 1
            time.sleep(min(64, 2 ** retry) * random.random())
    vid = response["id"]
    result = {"platform": "youtube" if kind == "long" else "youtube_shorts", "video_id": vid,
              "url": f"https://www.youtube.com/watch?v={vid}" if kind == "long" else f"https://youtube.com/shorts/{vid}",
              "privacy": privacy, "uploaded_at": now(), "warnings": []}
    # Captions (400 units each) and custom thumbnail (needs a verified channel) are best effort.
    for path, lang, name in ((plan["captions"][0], "zh-Hans", "中文"), (plan["captions"][1], "en", "English")):
        try:
            yt.captions().insert(part="snippet", body={"snippet": {"videoId": vid, "language": lang, "name": name}},
                                 media_body=MediaFileUpload(path, mimetype="application/octet-stream")).execute()
        except HttpError as e:
            result["warnings"].append(f"caption {lang}: {e}")
    if plan["thumbnail"]:
        try:
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(plan["thumbnail"])).execute()
        except HttpError as e:
            result["warnings"].append(f"thumbnail: {e}")
    # Read back the real status from YouTube instead of assuming success.
    got = yt.videos().list(part="status,processingDetails", id=vid).execute()
    if got.get("items"):
        result["platform_status"] = got["items"][0].get("status", {})
    return result


def record(job, result: dict) -> None:
    p = job.dir / "publish_log.json"
    log = json.loads(p.read_text("utf-8")) if p.exists() else []
    log.append(result)
    p.write_text(json.dumps(log, ensure_ascii=False, indent=2), "utf-8")
