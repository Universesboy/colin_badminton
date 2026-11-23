"""Thin wrappers around ffmpeg / ffprobe."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        raise RuntimeError(f"command failed ({r.returncode}): {' '.join(map(str, cmd))[:400]}\n{r.stderr[-2000:]}")
    return r


def probe(path: Path) -> dict:
    r = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)])
    return json.loads(r.stdout)


def fps_of(stream: dict) -> float | None:
    rate = stream.get("avg_frame_rate") or stream.get("r_frame_rate") or "0/0"
    n, d = rate.split("/")
    return round(float(n) / float(d), 3) if float(d) else None


def rotation_of(stream: dict) -> int:
    for sd in stream.get("side_data_list", []) or []:
        if "rotation" in sd:
            return int(sd["rotation"])
    tag = (stream.get("tags") or {}).get("rotate")
    return int(tag) if tag else 0


def audio_pcm(path: Path, sr: int = 16000) -> np.ndarray:
    """Mono float32 PCM. Empty array if the file has no audio."""
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", str(sr),
                        "-f", "f32le", "-"], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        return np.zeros(0, dtype=np.float32)
    return np.frombuffer(r.stdout, dtype=np.float32)


def gray_frames(path: Path, fps: float = 5, width: int = 160):
    """Yield (t, HxW uint8) grayscale frames at a low rate for motion analysis."""
    info = probe(path)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    w, h = int(v["width"]), int(v["height"])
    if abs(rotation_of(v)) in (90, 270):
        w, h = h, w
    height = int(round(h * width / w / 2) * 2)
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(path), "-vf",
                             f"fps={fps},scale={width}:{height},format=gray", "-f", "rawvideo", "-"],
                            stdout=subprocess.PIPE)
    size = width * height
    i = 0
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        yield i / fps, np.frombuffer(buf, dtype=np.uint8).reshape(height, width)
        i += 1
    proc.wait()


def ts(sec: float, sep: str = ",") -> str:
    """Seconds -> HH:MM:SS,mmm (srt)."""
    sec = max(0.0, sec)
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"


def mmss(sec: float) -> str:
    sec = int(round(sec))
    h, r = divmod(sec, 3600)
    m, s = divmod(r, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"
