"""Stage 11: covers from a real frame (no generated imagery).

- youtube 1280x720 (16:9), shorts/xiaohongshu 1080x1440 (3:4), website poster webp
Text is short; a soft dark gradient keeps it readable without hiding the action.
"""
from __future__ import annotations

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .. import config, media


def _frame(job, t):
    p = job.file("covers", f"frame_{t:.2f}.png")
    media.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(job.raw),
               "-frames:v", "1", str(p)])
    return Image.open(p).convert("RGB")


def _fit(im, w, h, cx=0.5):
    r = max(w / im.width, h / im.height)
    im = im.resize((int(im.width * r + 0.5), int(im.height * r + 0.5)), Image.LANCZOS)
    x = int(min(max(0, im.width * cx - w / 2), im.width - w))
    y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def _text(im, zh, en, top=False):
    w, h = im.size
    grad = Image.new("L", (1, 256))
    for i in range(256):
        grad.putpixel((0, i), int(200 * (i / 255) ** 1.6))
    gh = int(h * 0.42)
    mask = grad.resize((w, gh))
    if top:
        mask = mask.transpose(Image.FLIP_TOP_BOTTOM)
    shade = Image.new("RGB", (w, gh), (0, 0, 0))
    y0 = 0 if top else h - gh
    im.paste(shade, (0, y0), mask)
    d = ImageDraw.Draw(im)
    fp = config.font_path()
    size = int(w * (0.085 if h > w else 0.062))
    f1 = ImageFont.truetype(fp, size)
    f2 = ImageFont.truetype(fp, int(size * 0.5))
    pad = int(w * 0.05)
    y = (pad if top else h - pad - int(size * 1.9))
    d.text((pad, y), zh, font=f1, fill=(255, 255, 255), stroke_width=max(2, size // 18), stroke_fill=(0, 0, 0))
    d.text((pad, y + int(size * 1.15)), en, font=f2, fill=(255, 222, 89), stroke_width=2, stroke_fill=(0, 0, 0))
    return im


def run(job):
    a = job.read_json("analysis.json")
    th = a["thumbnail"]
    crop_x = float(a["edit_plan"].get("short", {}).get("crop_x_center", 0.5))
    src = _frame(job, float(th["time"]))
    z = float(th.get("zoom", 1.0))
    if z > 1.0:  # punch in on the action around (center_x, center_y)
        cx, cy = float(th.get("center_x", 0.5)), float(th.get("center_y", 0.5))
        w, h = src.width / z, src.height / z
        x0 = min(max(0, src.width * cx - w / 2), src.width - w)
        y0 = min(max(0, src.height * cy - h / 2), src.height - h)
        src = src.crop((int(x0), int(y0), int(x0 + w), int(y0 + h)))
        crop_x = 0.5 + (crop_x - cx) * z if "center_x" in th else crop_x
    zh, en = th["text"].get("zh", ""), th["text"].get("en", "")
    yt = _text(_fit(src, 1280, 720), zh, en)
    yt.save(job.file("covers", "youtube_1280x720.jpg"), quality=92)
    vert = _text(_fit(src, 1080, 1440, crop_x), zh, en)
    vert.save(job.file("covers", "xiaohongshu_1080x1440.jpg"), quality=92)
    # website poster: clean frame (the site overlays its own text), same style as existing thumbs
    poster = _fit(src, 960, 540) if src.width >= src.height else _fit(src, 540, 960, crop_x)
    poster.save(job.file("covers", "site_poster.webp"), "WEBP", quality=74, method=6)
    return {"time": th["time"]}
