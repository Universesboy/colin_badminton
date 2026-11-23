"""cba — command line for the Colin Badminton content agent.

  cba ingest VIDEO [--source upload|youtube|drive|website|xiaohongshu] [--note TEXT]
  cba run JOB [--from STAGE] [--only STAGE]      run / resume the pipeline
  cba status [JOB]                                inbox / job detail
  cba approve JOB --by NAME [--privacy private|unlisted|public] [--accept "flag text"]
  cba publish JOB [--kind long|short|all] [--dry-run] [--direct]
  cba site JOB [--pr]                             add the published video to colinbadminton.com
  cba site-check YOUTUBE_ID                       verify the live site after deploy
  cba kb-apply JOB                                write the KB proposal into knowledge/
  cba kb-confirm MODULE CLAIM_ID --by NAME        mark a claim confirmed (Colin only)
  cba youtube-auth                                one-time OAuth
"""
from __future__ import annotations

import argparse
import importlib
import json
import sys
from pathlib import Path

from . import config, kb
from .job import APPROVED, GATED, PUBLISHED, READY, STAGES, Job, now


def _stage_fn(name):
    return importlib.import_module(f"cba.stages.{name}").run


def cmd_ingest(a):
    job = Job.ingest(Path(a.video), source=a.source, note=a.note or "", link=a.link)
    print(job.id)
    if a.run:
        a.job, a.from_, a.only, a.force = job.id, None, None, False
        cmd_run(a)


def cmd_run(a):
    job = Job(a.job)
    stages = [a.only] if a.only else STAGES[STAGES.index(a.from_):] if a.from_ else STAGES
    if a.from_ or a.only:
        job.invalidate_from(stages[0])
    for s in stages:
        ok = job.run_stage(s, _stage_fn(s), force=bool(a.only or a.from_))
        st = job.stage(s)
        print(f"{s:12s} {st['status']:16s} {json.dumps(st.get('outputs') or st.get('error') or '', ensure_ascii=False)[:160]}")
        if not ok:
            print(f"\nstopped at '{s}' ({job.data['status']}). Fix and re-run `cba run {job.id}` to resume.")
            return 2
    job.data["status"] = READY
    job.save()
    print(f"\nReady for review: {job.dir / 'preview' / 'index.html'}")
    return 0


def cmd_status(a):
    if a.job:
        job = Job(a.job)
        print(json.dumps({k: job.data[k] for k in ("id", "original_filename", "status", "received_at")},
                         ensure_ascii=False, indent=2))
        for s in STAGES + GATED:
            st = job.stage(s)
            print(f"  {s:16s} {st.get('status')}  {st.get('error') or ''}")
        return 0
    print(f"{'JOB':15s} {'STATUS':18s} {'DUR':>7s}  {'TYPE':22s} FILE")
    for j in Job.all():
        an = j.read_json("analysis.json") or {}
        dur = (j.data.get("metadata") or {}).get("duration_sec")
        print(f"{j.id:15s} {j.data['status']:18s} {(f'{dur:.0f}s' if dur else '-'):>7s}  "
              f"{','.join(an.get('video_types', []))[:22]:22s} {j.data['original_filename']}")
    return 0


def cmd_approve(a):
    job = Job(a.job)
    if job.data["status"] not in (READY, APPROVED):
        print(f"job is '{job.data['status']}', not Ready for Review")
        return 2
    job.set_stage("approval", status="done", by=a.by, at=now(), privacy=a.privacy, accepted_flags=a.accept or [],
                  note=a.note)
    job.data["status"] = APPROVED
    job.data["history"].append({"at": now(), "event": f"approved by {a.by} ({a.privacy})"})
    job.save()
    print(f"approved: {job.id} privacy={a.privacy}")
    return 0


def cmd_publish(a):
    from . import publish_youtube as yt
    job = Job(a.job)
    appr = job.stage("approval")
    if appr.get("status") != "done" and not a.direct:
        print("refused: no approval recorded. Run `cba approve` (or pass --direct when Colin said 直接发布).")
        return 2
    privacy = appr.get("privacy") or a.privacy
    accept = appr.get("accepted_flags", []) + (a.accept or [])
    kinds = ["long", "short"] if a.kind == "all" else [a.kind]
    rc = 0
    for kind in kinds:
        if kind not in (job.read_json("edit_decisions.json") or {}).get("outputs", {}):
            continue
        try:
            res = yt.upload(job, kind, privacy, a.dry_run, accept)
            print(json.dumps(res, ensure_ascii=False, indent=2))
            if not a.dry_run:
                yt.record(job, res)
                job.set_stage("publish_youtube", status="done", outputs=res)
                job.data["status"] = PUBLISHED
                job.save()
        except Exception as e:  # noqa: BLE001
            job.log(f"[publish:{kind}] FAILED {e}")
            yt.record(job, {"platform": "youtube", "kind": kind, "failed": True, "error": str(e), "at": now()})
            job.set_stage("publish_youtube", status="failed", error=str(e))
            print(f"NOT published ({kind}): {e}")
            rc = 2
    return rc


def cmd_site(a):
    from . import site_sync
    job = Job(a.job)
    log = job.read_json("publish_log.json") or []
    ok = [r for r in log if r.get("video_id") and not r.get("failed")]
    yid = a.youtube_id or (ok[-1]["video_id"] if ok else None)
    if not yid:
        print("no published YouTube id for this job; publish first or pass --youtube-id")
        return 2
    orient = "portrait" if any(r.get("platform") == "youtube_shorts" and r["video_id"] == yid for r in ok) else \
        (job.read_json("metadata.json") or {}).get("orientation", "landscape")
    info = site_sync.add_video(job, yid, orient)
    print(json.dumps(info, ensure_ascii=False, indent=2))
    if info.get("changed") and a.pr:
        print(site_sync.open_pr(job, yid, info))
    job.set_stage("site_sync", status="done" if info.get("changed") else "skipped", outputs=info)
    return 0


def cmd_site_check(a):
    from . import site_sync
    print(json.dumps(site_sync.check_live(a.youtube_id), indent=2))
    return 0


def cmd_kb_apply(a):
    job = Job(a.job)
    prop = job.read_json("kb_proposal.json")
    if not prop:
        print("no kb_proposal.json; run the pipeline first")
        return 2
    if prop.get("applied"):
        print("already applied")
        return 0
    for line in kb.apply(prop):
        print(line)
    prop["applied"] = True
    prop["applied_at"] = now()
    job.write_json("kb_proposal.json", prop)
    job.set_stage("kb_apply", status="done")
    return 0


def cmd_kb_confirm(a):
    data = kb.load(a.module)
    for dim in data.get("dimensions", {}).values():
        for node in [dim, *dim.get("aspects", {}).values()]:
            for c in node.get("claims", []):
                if c["id"] == a.claim_id:
                    c["history"].append({"date": kb.today(), "from": c["status"], "to": "confirmed",
                                         "reason": f"confirmed by {a.by}"})
                    c["status"] = "confirmed"
                    kb.dump(a.module, data)
                    print("confirmed", a.claim_id)
                    return 0
    print("claim not found")
    return 2


def cmd_youtube_auth(_a):
    from . import publish_youtube as yt
    me = yt.service().channels().list(part="snippet", mine=True).execute()
    for ch in me.get("items", []):
        print("authorized channel:", ch["snippet"]["title"], ch["id"])
    return 0


def main(argv=None):
    p = argparse.ArgumentParser(prog="cba", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("ingest"); s.add_argument("video"); s.add_argument("--source", default="upload")
    s.add_argument("--note"); s.add_argument("--link", action="store_true", help="symlink instead of copy")
    s.add_argument("--run", action="store_true"); s.set_defaults(f=cmd_ingest)
    s = sub.add_parser("run"); s.add_argument("job"); s.add_argument("--from", dest="from_", choices=STAGES)
    s.add_argument("--only", choices=STAGES); s.set_defaults(f=cmd_run)
    s = sub.add_parser("status"); s.add_argument("job", nargs="?"); s.set_defaults(f=cmd_status)
    s = sub.add_parser("approve"); s.add_argument("job"); s.add_argument("--by", required=True)
    s.add_argument("--privacy", default="private", choices=["private", "unlisted", "public"])
    s.add_argument("--accept", action="append", help="exact pre-flight flag text Colin accepted")
    s.add_argument("--note"); s.set_defaults(f=cmd_approve)
    s = sub.add_parser("publish"); s.add_argument("job"); s.add_argument("--kind", default="all",
                                                                          choices=["long", "short", "all"])
    s.add_argument("--dry-run", action="store_true"); s.add_argument("--direct", action="store_true")
    s.add_argument("--privacy", default="private"); s.add_argument("--accept", action="append")
    s.set_defaults(f=cmd_publish)
    s = sub.add_parser("site"); s.add_argument("job"); s.add_argument("--youtube-id")
    s.add_argument("--pr", action="store_true"); s.set_defaults(f=cmd_site)
    s = sub.add_parser("site-check"); s.add_argument("youtube_id"); s.set_defaults(f=cmd_site_check)
    s = sub.add_parser("kb-apply"); s.add_argument("job"); s.set_defaults(f=cmd_kb_apply)
    s = sub.add_parser("kb-confirm"); s.add_argument("module", choices=list(kb.MODULE_FILES))
    s.add_argument("claim_id"); s.add_argument("--by", required=True); s.set_defaults(f=cmd_kb_confirm)
    s = sub.add_parser("youtube-auth"); s.set_defaults(f=cmd_youtube_auth)
    a = p.parse_args(argv)
    return a.f(a) or 0


if __name__ == "__main__":
    sys.exit(main())
