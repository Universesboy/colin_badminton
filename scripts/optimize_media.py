"""Generate web-sized WebP copies of the site's photos into public/media.

Originals are left untouched. Run from the repo root:
    python scripts/optimize_media.py
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "media"

# (source, output name, max long edge)
JOBS = [
    ("src/components/assets/national_champion.jpg", "national-champion", 1400),
    ("src/components/assets/ocaa_awards.jpg", "ocaa-awards", 1400),
    ("src/components/assets/champion_flag.jpg", "champion-banner", 1400),
    ("src/components/assets/provincial_jump_smash.jpg", "jump-smash", 1400),
    ("src/components/assets/frontcourt.jpg", "frontcourt", 1400),
    ("src/components/assets/ocaa.jpg", "ocaa-ceremony", 1400),
    ("src/components/assets/colin_poster.jpg", "coach-poster", 1400),
    ("src/components/assets/wechat-qr.png", "wechat-qr", 900),
]
THUMBS = ROOT / "public" / "videos" / "thumbnails"


def save(src, name, long_edge, quality=74):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((long_edge, long_edge), Image.LANCZOS)
    dest = OUT / f"{name}.webp"
    im.save(dest, "WEBP", quality=quality, method=6)
    return dest, im.size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for src, name, edge in JOBS:
        dest, size = save(ROOT / src, name, edge)
        print(f"{dest.name:32} {size}  {dest.stat().st_size // 1024} KB")
    (OUT / "thumbs").mkdir(exist_ok=True)
    for p in sorted(THUMBS.glob("*.jpg")):
        dest, size = save(p, "thumbs/" + p.stem.replace(".", "-").lower(), 900, quality=70)
        print(f"{dest.name:32} {size}  {dest.stat().st_size // 1024} KB")
    # 1200x630 social share image cropped from the jump smash
    im = ImageOps.exif_transpose(Image.open(ROOT / "src/components/assets/provincial_jump_smash.jpg")).convert("RGB")
    og = ImageOps.fit(im, (1200, 630), Image.LANCZOS, centering=(0.45, 0.35))
    og.save(OUT / "og-image.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print("og-image.jpg", (OUT / "og-image.jpg").stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
