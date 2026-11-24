"""Stage 5b: keyframes and contact sheets for the visual/technical analysis.

- overview sheets: one frame every N seconds over the whole video, timestamped
- rally sheets: frames at every hit candidate of each rally (where the action is)
The analyst (Claude) reads these images; each tile carries its timestamp so any
claim can cite a time.
"""
from __future__ import annotations

from PIL import Image, ImageDraw, ImageFont

from .. import config, media


def grab(job, t: float, width: int = 480) -> Image.Image:
    out = job.file("frames", f"t{t:08.2f}_{width}.jpg")
    if not out.exists():
        media.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(job.raw),
                   "-frames:v", "1", "-vf", f"scale={width}:-2", "-q:v", "3", str(out)])
    return Image.open(out).convert("RGB")


def sheet(frames: list[tuple[float, Image.Image]], cols: int, path):
    w, h = frames[0][1].size
    rows = (len(frames) + cols - 1) // cols
    canvas = Image.new("RGB", (cols * w, rows * h), "black")
    font = ImageFont.truetype(config.font_path(), max(16, w // 18))
    d = ImageDraw.Draw(canvas)
    for i, (t, im) in enumerate(frames):
        x, y = (i % cols) * w, (i // cols) * h
        canvas.paste(im, (x, y))
        label = media.mmss(t) + f" ({t:.1f}s)"
        d.rectangle([x, y, x + font.getlength(label) + 10, y + font.size + 8], fill=(0, 0, 0))
        d.text((x + 5, y + 3), label, font=font, fill=(255, 230, 0))
    canvas.save(path, quality=85)


def run(job):
    meta = job.read_json("metadata.json")
    sig = job.read_json("signals.json")
    dur = meta["duration_sec"]
    portrait = meta["orientation"] == "portrait"
    width = 270 if portrait else 480
    cols = 6 if portrait else 4
    step = max(2.0, round(dur / 48, 1))         # at most ~48 overview tiles per sheet set
    times = [round(i * step, 2) for i in range(int(dur // step) + 1) if i * step < dur - 0.2]
    sheets = []
    per = cols * 4
    for n in range(0, len(times), per):
        chunk = [(t, grab(job, t, width)) for t in times[n:n + per]]
        p = job.file("sheets", f"overview_{n // per + 1:02d}.jpg")
        sheet(chunk, cols, p)
        sheets.append(str(p.relative_to(job.dir)))
    rally_sheets = []
    for r in sig["rally_candidates"][:80]:
        hits = [h["t"] for h in sig["hit_candidates"] if r["start"] <= h["t"] <= r["end"]]
        if hits:
            ts = [r["start"] + 0.5] + hits[:14] + [r["end"] - 0.3]
        else:  # no usable audio hits: sample the rally evenly
            n = 12
            rstep = (r["end"] - r["start"]) / n
            ts = [round(r["start"] + rstep * (i + 0.5), 2) for i in range(n)]
        chunk = [(t, grab(job, t, width)) for t in ts]
        p = job.file("sheets", f"rally_{r['id']}.jpg")
        sheet(chunk, cols, p)
        rally_sheets.append(str(p.relative_to(job.dir)))
    job.write_json("keyframes.json", {"overview_step_sec": step, "overview_sheets": sheets,
                                      "rally_sheets": rally_sheets})
    return {"overview_sheets": len(sheets), "rally_sheets": len(rally_sheets)}
