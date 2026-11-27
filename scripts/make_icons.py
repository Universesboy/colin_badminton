"""Render the shuttle brand mark (Chalk tile, see docs/brand) to favicon.ico and the PWA icons in public/."""
from pathlib import Path
from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parent.parent / "public"


def mark(size):
    s = size / 32
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=8 * s, fill="#1F5C45")
    w = max(1, round(2.2 * s))
    tri = [(16 * s, 6.5 * s), (22.6 * s, 19.5 * s), (9.4 * s, 19.5 * s)]
    d.line(tri + [tri[0]], fill="white", width=w, joint="curve")
    d.line([(16 * s, 6.5 * s), (16 * s, 19.5 * s)], fill=(255, 255, 255, 150), width=max(1, round(1.3 * s)))
    d.line([(12.3 * s, 13.5 * s), (19.7 * s, 13.5 * s)], fill=(255, 255, 255, 150), width=max(1, round(1.3 * s)))
    r = 3.2 * s
    d.ellipse([16 * s - r, 23.6 * s - r, 16 * s + r, 23.6 * s + r], fill="#C8E86B")
    return im


big = mark(512)
big.save(PUBLIC / "logo512.png")
mark(192).save(PUBLIC / "logo192.png")
mark(256).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("icons written")
