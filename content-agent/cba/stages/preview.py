"""Stage 14: one review page per job (preview/index.html) with every output.

Links are relative, so the job folder can be zipped or copied anywhere and
opened in a browser. A small 540p copy of the original is included for context.
"""
from __future__ import annotations

import html
import json

from .. import media
from ..analysis_schema import VIDEO_TYPES

CSS = """
:root{--bg:#f6f7f5;--fg:#16201a;--muted:#5b6660;--card:#fff;--line:#dfe4e0;--acc:#0f7b4f;--warn:#a15c00}
@media (prefers-color-scheme:dark){:root{--bg:#121614;--fg:#e8ede9;--muted:#9aa59f;--card:#1b211e;--line:#2b332f;--acc:#4ccf8f;--warn:#f0b35a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}h1{font-size:26px;margin:0 0 4px}h2{margin:36px 0 10px;font-size:19px}
.muted{color:var(--muted)}.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:10px 0}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}video,img{max-width:100%;border-radius:10px;background:#000}
table{width:100%;border-collapse:collapse;font-size:14px}td,th{border-bottom:1px solid var(--line);padding:7px 6px;text-align:left;vertical-align:top}
.tag{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:1px 9px;margin:2px;font-size:12px}
.warn{color:var(--warn)}pre{white-space:pre-wrap;background:var(--bg);padding:12px;border-radius:8px;border:1px solid var(--line)}
.status{font-weight:600;color:var(--acc)}
"""


def e(x) -> str:
    return html.escape(str(x if x is not None else "—"))


def run(job):
    meta = job.read_json("metadata.json")
    a = job.read_json("analysis.json")
    dec = job.read_json("edit_decisions.json")
    subs = job.read_json("subtitles.json")
    copy = job.read_json("copy.json")
    flags = job.read_json("copy_flags.json") or []
    kbp = job.read_json("kb_proposal.json")
    tr = job.read_json("transcript.json")
    sig = job.read_json("signals.json")
    orig = job.file("renders", "original_540p.mp4")
    if not orig.exists():
        media.run(["ffmpeg", "-v", "error", "-y", "-i", str(job.raw), "-vf", "scale=-2:540", "-c:v", "libx264",
                   "-preset", "veryfast", "-crf", "28", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
                   str(orig)])
    p = []
    p.append(f"<h1>{e(meta['original_filename'])}</h1><p class=muted>Job {e(job.id)} · "
             f"{meta['duration_sec']:.1f}s · {meta['width']}×{meta['height']} · {e(meta['fps'])} fps · "
             f"camera time {e(meta['recorded_at_container'])} (unconfirmed)</p>")
    p.append(f"<p class=status>Status: {e(job.data['status'])}</p>")
    p.append("<p>" + "".join(f"<span class=tag>{e(VIDEO_TYPES.get(t, t))} · {e(t)}</span>" for t in a["video_types"])
             + "</p>")
    p.append(f"<div class=card><b>摘要</b> {e(a['summary']['zh'])}<br><b>Summary</b> {e(a['summary']['en'])}</div>")
    priv = a["people_and_privacy"]
    risky = [k for k in ("possible_minors", "names_or_contacts_visible", "private_location_risk") if priv.get(k)]
    p.append(f"<div class=card><b>Privacy check</b> {'<span class=warn>' + e(', '.join(risky)) + '</span>' if risky else 'no flags'}"
             f" · other people visible: {e(priv.get('other_people_visible'))}<br><span class=muted>{e(priv.get('notes'))}</span></div>")
    if a.get("needs_colin"):
        p.append("<div class=card><b>需要你确认 / Questions for Colin</b><ul>"
                 + "".join(f"<li>{e(q)}</li>" for q in a["needs_colin"]) + "</ul></div>")

    p.append("<h2>1. 原始视频 Original</h2><video controls preload=metadata src='../renders/original_540p.mp4'></video>")

    p.append("<h2>2. 成片 Exports</h2><div class=grid>")
    for kind, r in dec["outputs"].items():
        sub = (subs or {}).get(kind, {}).get("subtitled")
        src = "../" + (sub or r["file"])
        p.append(f"<div class=card><b>{'长视频 Long' if kind == 'long' else 'Shorts 竖版'}</b> "
                 f"<span class=muted>{r['duration']:.1f}s</span><video controls preload=metadata src='{e(src)}'></video>"
                 f"<p class=muted>clean: <a href='../{e(r['file'])}'>{e(r['file'])}</a><br>subtitles: "
                 f"<a href='../subs/{kind}/{kind}.zh-en.srt'>zh-en.srt</a> · "
                 f"<a href='../subs/{kind}/{kind}.zh-Hans.srt'>zh.srt</a> · <a href='../subs/{kind}/{kind}.en.srt'>en.srt</a></p></div>")
    p.append("</div>")

    p.append("<h2>3. 剪辑方案 Edit decisions</h2><div class=card><p>" + e(a["edit_plan"].get("rationale")) + "</p><table>"
             "<tr><th>Cut</th><th>Source</th><th>Output</th><th>Speed</th><th>Label</th></tr>")
    for kind, r in dec["outputs"].items():
        for s in r["timeline"]:
            p.append(f"<tr><td>{kind}</td><td>{media.mmss(s['src_start'])}–{media.mmss(s['src_end'])} "
                     f"({s['src_start']:.1f}–{s['src_end']:.1f}s)</td><td>{s['out_start']:.1f}–{s['out_end']:.1f}s</td>"
                     f"<td>{'slow ×' + str(s['speed']) if s['speed'] != 1 else '1×'}</td><td>{e(s['label'])}</td></tr>")
    p.append("</table></div>")

    p.append("<h2>4. 关键时刻 Key moments</h2><div class=card><table><tr><th>Time</th><th>Kind</th><th>Moment</th>"
             "<th>What is visible</th><th>Imp.</th><th>Use</th></tr>")
    for m in a["key_moments"]:
        p.append(f"<tr><td>{media.mmss(m['start'])}–{media.mmss(m['end'])}</td><td>{e(m['kind'])}</td>"
                 f"<td>{e(m['title']['zh'])}<br><span class=muted>{e(m['title']['en'])}</span></td>"
                 f"<td>{e(m['what_happens'])}</td><td>{e(m['importance'])}</td><td>{e(', '.join(m.get('uses', [])))}"
                 f"{' · short ✓' if m.get('short_suitable') else ''}</td></tr>")
    p.append("</table></div>")

    p.append("<h2>5. 技术分析 Technical observations</h2><div class=card><p class=muted>Camera limits: "
             + e("; ".join(a["camera_and_limits"])) + "</p><table><tr><th>Dimension</th><th>Observation</th>"
             "<th>Timestamps</th><th>Basis</th><th>Conf.</th><th>Limits</th></tr>")
    for o in a["technical_observations"]:
        p.append(f"<tr><td>{e(o['dimension'])}</td><td>{e(o['observation'])}</td>"
                 f"<td>{e(', '.join(media.mmss(t) for t in o.get('timestamps', [])))}</td><td>{e(o['basis'])}</td>"
                 f"<td>{e(o['confidence'])}</td><td>{e(o.get('visibility_limits'))}</td></tr>")
    p.append("</table>")
    st = a.get("stats") or {}
    p.append(f"<p class=muted>Automatic signals (not verified): {len(sig['hit_candidates'])} hit candidates, "
             f"{len(sig['rally_candidates'])} rally candidates. Stats source: {e(st.get('source'))}</p></div>")

    p.append("<h2>6. 封面 Covers</h2><div class=grid>"
             "<div class=card><b>YouTube 16:9</b><img src='../covers/youtube_1280x720.jpg'></div>"
             "<div class=card><b>小红书 / Shorts 3:4</b><img src='../covers/xiaohongshu_1080x1440.jpg'></div>"
             "<div class=card><b>Website poster</b><img src='../covers/site_poster.webp'></div></div>")

    p.append("<h2>7. 发布文案 Copy</h2>")
    if flags:
        p.append("<div class='card warn'><b>Check before publishing</b><ul>" + "".join(f"<li>{e(f)}</li>" for f in flags)
                 + "</ul></div>")
    for k, label in (("youtube", "YouTube"), ("shorts", "YouTube Shorts"), ("xiaohongshu", "小红书"),
                     ("website", "colinbadminton.com")):
        p.append(f"<div class=card><b>{label}</b><pre>{e(json.dumps(copy[k], ensure_ascii=False, indent=2))}</pre></div>")

    p.append("<h2>8. 字幕与转写 Subtitles & transcript</h2><div class=card>"
             f"<p class=muted>ASR: {e(tr['engine'])} · speech {tr['speech_seconds']}s · has speech: {tr['has_speech']} · "
             "machine transcript, not human-verified</p><table><tr><th>Time</th><th>ASR text</th></tr>"
             + "".join(f"<tr><td>{media.mmss(s['start'])}</td><td>{e(s['text'])}</td></tr>" for s in tr["segments"][:200])
             + "</table><p><b>Subtitle lines used</b></p><table><tr><th>Time</th><th>中文</th><th>English</th><th>Source</th></tr>"
             + "".join(f"<tr><td>{media.mmss(s['start'])}</td><td>{e(s['zh'])}</td><td>{e(s['en'])}</td><td>{e(s.get('source'))}</td></tr>"
                       for s in a.get("subtitles", [])) + "</table></div>")

    p.append("<h2>9. 知识库更新 Knowledge base proposal</h2><div class=card><table>"
             "<tr><th>Op</th><th>Module / dimension</th><th>Claim</th><th>Status</th><th>Evidence</th></tr>")
    for ch in kbp["changes"]:
        ev = "<br>".join(f"{media.mmss(x['start'])}: {e(x['observation'])}" for x in ch["evidence"])
        p.append(f"<tr><td>{e(ch['op'])}</td><td>{e(ch['module'])}<br>{e(ch['dimension'])}</td><td>{e(ch['claim'])}</td>"
                 f"<td>{e(ch.get('status', ''))} {e(ch.get('confidence', ''))}</td><td>{ev}</td></tr>")
    for ch in kbp.get("pending", []):
        ev = "<br>".join(f"{media.mmss(x['start'])}: {e(x['observation'])}" for x in ch["evidence"])
        p.append(f"<tr><td>pending<br><span class=muted>{e(ch.get('waiting_for'))}</span></td><td>{e(ch['module'])}<br>"
                 f"{e(ch['dimension'])}</td><td>{e(ch['claim'])}</td><td>{e(ch.get('status'))} {e(ch.get('confidence'))}</td>"
                 f"<td>{ev}</td></tr>")
    p.append(f"</table><p class=muted>Applied to knowledge/: {kbp.get('applied')} · pending items are not written "
             "until the open question is answered</p></div>")

    page = (f"<!doctype html><html lang=zh><head><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
            f"<title>Preview {e(job.id)}</title><style>{CSS}</style></head><body><main>{''.join(p)}</main></body></html>")
    job.file("preview", "index.html").write_text(page, "utf-8")
    from ..job import READY
    job.data["status"] = READY
    job.save()
    return {"preview": "preview/index.html"}
