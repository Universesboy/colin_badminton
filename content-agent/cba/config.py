"""Paths and settings. Everything can be overridden with environment variables.

Secrets (API keys, OAuth tokens) are never read from or written to the repo:
they live under CBA_SECRETS_DIR (default ~/.config/colin-badminton).
"""
from __future__ import annotations

import os
from pathlib import Path

AGENT_DIR = Path(__file__).resolve().parent.parent          # content-agent/
REPO_ROOT = AGENT_DIR.parent                                 # colin_badminton/
KNOWLEDGE_DIR = Path(os.environ.get("CBA_KNOWLEDGE_DIR", REPO_ROOT / "knowledge"))

# Large, private working data (raw videos, renders). Git-ignored.
DATA_DIR = Path(os.environ.get("CBA_DATA_DIR", AGENT_DIR / "data"))
RAW_DIR = DATA_DIR / "raw"
JOBS_DIR = DATA_DIR / "jobs"

MODELS_DIR = Path(os.environ.get("CBA_MODELS_DIR", AGENT_DIR / "models"))
SECRETS_DIR = Path(os.environ.get("CBA_SECRETS_DIR", Path.home() / ".config" / "colin-badminton"))

# A CJK-capable font for subtitles and covers.
FONT_CANDIDATES = [
    os.environ.get("CBA_FONT", ""),
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "C:/Windows/Fonts/msyhbd.ttc",
    "C:/Windows/Fonts/msyh.ttc",
]
SUBTITLE_FONT_NAME = os.environ.get("CBA_FONT_NAME", "WenQuanYi Zen Hei")

SITE_URL = "https://colinbadminton.com"
YOUTUBE_CHANNEL = "https://www.youtube.com/@zhoukeyu9105"


def font_path() -> str:
    for p in FONT_CANDIDATES:
        if p and Path(p).exists():
            return p
    raise FileNotFoundError("No CJK font found; set CBA_FONT to a .ttf/.ttc path")
