"""Render the shuttle brand mark to favicon.ico and the PWA icons in public/."""
from pathlib import Path
from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parent.parent / "public"


def mark(size):
    s = size / 32
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=7 * s, fill="#07090c")
    w = max(1, round(2 * s))
    tri = [(16 * s, 4.5 * s), (24 * s, 20 * s), (8 * s, 20 * s)]
    d.line(tri + [tri[0]], fill="white", width=w, joint="curve")
    d.line([(16 * s, 4.5 * s), (16 * s, 20 * s)], fill=(255, 255, 255, 150), width=max(1, round(1.3 * s)))
    d.line([(11.8 * s, 12.3 * s), (20.2 * s, 12.3 * s)], fill=(255, 255, 255, 150), width=max(1, round(1.3 * s)))
    r = 4 * s
    d.ellipse([16 * s - r, 24 * s - r, 16 * s + r, 24 * s + r], fill="#e8452c")
    return im


big = mark(512)
big.save(PUBLIC / "logo512.png")
mark(192).save(PUBLIC / "logo192.png")
mark(256).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("icons written")
