"""Stage 9: render the long and short cuts from analysis.edit_plan with ffmpeg.

The edit is fully described by the segment list (reproducible edit parameters),
saved as edit_decisions.json together with a source->output timeline map used
to re-time subtitles and chapters. Renders are "clean" (no subtitles); the
subtitles stage burns captions into separate files.
"""
from __future__ import annotations

from .. import media


def _filter(segments, meta, kind, crop_x, mode="crop", zoom=1.0):
    w, h = meta["width"], meta["height"]
    portrait = h > w
    if kind == "short":
        tw, th = 1080, 1920
        if portrait:
            vf = f"scale={tw}:{th}:force_original_aspect_ratio=increase,crop={tw}:{th}"
        else:
            cw = f"ih*9/16"
            x = f"max(0\\,min(iw-{cw}\\,iw*{crop_x}-{cw}/2))"
            vf = f"crop={cw}:ih:{x}:0,scale={tw}:{th}"
    else:
        tw, th = (1080, 1920) if portrait else (1920, 1080)
        vf = f"scale={tw}:{th}:force_original_aspect_ratio=decrease,pad={tw}:{th}:(ow-iw)/2:(oh-ih)/2"
    parts, labels = [], []
    for i, s in enumerate(segments):
        sp = float(s.get("speed", 1.0))
        a, b = float(s["start"]), float(s["end"])
        if kind == "short" and mode == "fit_blur" and not portrait:
            # whole court stays visible: the 16:9 frame (optionally zoomed) over a blurred 9:16 fill
            parts.append(f"[{i}:v]setpts=(PTS-STARTPTS)/{sp},split[s{i}a][s{i}b];"
                         f"[s{i}a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
                         f"boxblur=20:2,eq=brightness=-0.08[bg{i}];"
                         f"[s{i}b]crop=iw/{zoom}:ih/{zoom},scale=1080:-2[fg{i}];"
                         f"[bg{i}][fg{i}]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1[v{i}]")
        else:
            parts.append(f"[{i}:v]setpts=(PTS-STARTPTS)/{sp},{vf},fps=30,setsar=1[v{i}]")
        if meta["has_audio"]:
            # Slow-motion repeats are muted: stretched gym audio misleads more than it helps.
            vol = "" if sp == 1.0 else ",volume=0"
            tempo = ""
            r = sp
            while r < 0.999:
                step = max(0.5, r)
                tempo += f",atempo={step}"
                r /= step
            parts.append(f"[{i}:a]asetpts=PTS-STARTPTS{tempo}{vol},"
                         f"aresample=48000,aformat=channel_layouts=stereo[a{i}]")
        else:
            dur = (b - a) / sp
            parts.append(f"anullsrc=r=48000:cl=stereo,atrim=duration={dur}[a{i}]")
        labels.append(f"[v{i}][a{i}]")
    parts.append("".join(labels) + f"concat=n={len(segments)}:v=1:a=1[vout][aout]")
    return ";".join(parts)


def timeline(segments):
    out, t = [], 0.0
    for s in segments:
        a, b, sp = float(s["start"]), float(s["end"]), float(s.get("speed", 1.0))
        d = (b - a) / sp
        out.append({"src_start": a, "src_end": b, "speed": sp, "out_start": round(t, 3),
                    "out_end": round(t + d, 3), "label": s.get("label", "")})
        t += d
    return out


def render(job, kind, plan, meta) -> dict:
    segs = plan["segments"]
    out = job.file("renders", f"{kind}_clean.mp4")
    fc = _filter(segs, meta, kind, float(plan.get("crop_x_center", 0.5)), plan.get("mode", "crop"),
                 float(plan.get("zoom", 1.0)))
    job.file("renders", f"{kind}.filtergraph.txt").write_text(fc, "utf-8")
    inputs = []
    for sg in segs:  # one seeked input per segment keeps memory flat on long sources
        inputs += ["-ss", f"{float(sg['start']):.3f}", "-t", f"{float(sg['end']) - float(sg['start']):.3f}",
                   "-i", str(job.raw)]
    media.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc,
               "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
               "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out)])
    tl = timeline(segs)
    return {"file": str(out.relative_to(job.dir)), "duration": tl[-1]["out_end"], "timeline": tl}


def run(job):
    a = job.read_json("analysis.json")
    meta = job.read_json("metadata.json")
    job.snapshot("edit_decisions.json")
    decisions = {"source": str(job.raw), "outputs": {}}
    for kind in ("long", "short"):
        plan = a["edit_plan"].get(kind) or {}
        if not plan.get("make"):
            continue
        r = render(job, kind, plan, meta)
        if kind == "short" and r["duration"] > 60.5:
            raise ValueError(f"short is {r['duration']:.1f}s; must be <= 60s")
        decisions["outputs"][kind] = r
    job.write_json("edit_decisions.json", decisions)
    return {k: round(v["duration"], 1) for k, v in decisions["outputs"].items()}
