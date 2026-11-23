"""Stage 10: bilingual subtitles.

Source-time subtitle lines from analysis.json are mapped onto each rendered
cut's timeline, written as .srt (zh, en, zh+en) for platform caption upload,
and burned into a separate "subtitled" render with an ASS style sized for
phones. Lines are not shown during slow-motion repeats (they would repeat).
"""
from __future__ import annotations

import pysubs2

from .. import config, media


def map_lines(lines, tl):
    out = []
    for ln in lines:
        a, b = float(ln["start"]), float(ln["end"])
        for seg in tl:
            if seg["speed"] != 1.0:
                continue
            s, e = max(a, seg["src_start"]), min(b, seg["src_end"])
            if e - s < 0.3:
                continue
            os_ = seg["out_start"] + (s - seg["src_start"])
            oe = seg["out_start"] + (e - seg["src_start"])
            out.append({"start": round(os_, 3), "end": round(oe, 3), "zh": ln["zh"], "en": ln["en"],
                        "source": ln.get("source", "speech")})
    return out


def write_srt(path, lines, key):
    with open(path, "w", encoding="utf-8") as f:
        for i, ln in enumerate(lines, 1):
            text = ln[key] if key != "both" else f"{ln['zh']}\n{ln['en']}"
            f.write(f"{i}\n{media.ts(ln['start'])} --> {media.ts(ln['end'])}\n{text}\n\n")


def write_ass(path, lines, w, h, vertical):
    subs = pysubs2.SSAFile()
    subs.info["PlayResX"], subs.info["PlayResY"] = str(w), str(h)
    base = h / 1080 if not vertical else w / 1080
    zh = pysubs2.SSAStyle(fontname=config.SUBTITLE_FONT_NAME, fontsize=int((66 if vertical else 54) * base),
                          primarycolor=pysubs2.Color(255, 255, 255), outlinecolor=pysubs2.Color(0, 0, 0),
                          backcolor=pysubs2.Color(0, 0, 0, 120), bold=True, outline=3, shadow=0,
                          alignment=pysubs2.Alignment.BOTTOM_CENTER,
                          marginv=int(h * (0.20 if vertical else 0.075)))
    en = zh.copy()
    en.fontsize = int(zh.fontsize * 0.8)
    en.bold = False
    en.primarycolor = pysubs2.Color(255, 230, 120)
    en.marginv = zh.marginv - int(zh.fontsize * 1.05)
    subs.styles["ZH"], subs.styles["EN"] = zh, en
    for ln in lines:
        s, e = int(ln["start"] * 1000), int(ln["end"] * 1000)
        subs.append(pysubs2.SSAEvent(start=s, end=e, text=ln["zh"], style="ZH"))
        subs.append(pysubs2.SSAEvent(start=s, end=e, text=ln["en"], style="EN"))
    subs.save(str(path))


def run(job):
    a = job.read_json("analysis.json")
    dec = job.read_json("edit_decisions.json")
    lines = a.get("subtitles") or []
    out = {}
    for kind, r in dec["outputs"].items():
        mapped = map_lines(lines, r["timeline"])
        d = job.file("subs", kind)
        d.mkdir(parents=True, exist_ok=True)
        for key, name in (("zh", "zh-Hans"), ("en", "en"), ("both", "zh-en")):
            write_srt(d / f"{kind}.{name}.srt", mapped, key)
        clean = job.dir / r["file"]
        subbed = job.file("renders", f"{kind}_subtitled.mp4")
        if mapped:
            info = media.probe(clean)
            v = next(s for s in info["streams"] if s["codec_type"] == "video")
            ass = d / f"{kind}.ass"
            write_ass(ass, mapped, int(v["width"]), int(v["height"]), kind == "short")
            fontsdir = str(__import__("pathlib").Path(config.font_path()).parent)
            media.run(["ffmpeg", "-v", "error", "-y", "-i", str(clean), "-vf",
                       f"ass={ass}:fontsdir={fontsdir}", "-c:v", "libx264", "-preset", "medium",
                       "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart",
                       str(subbed)])
        else:
            subbed.unlink(missing_ok=True)
        out[kind] = {"lines": len(mapped), "subtitled": str(subbed.relative_to(job.dir)) if mapped else None}
    job.write_json("subtitles.json", out)
    return out
