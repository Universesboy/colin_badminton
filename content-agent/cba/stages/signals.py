"""Stage 5a: machine signals used to find rallies and candidate moments.

These are measurements, not conclusions:
- audio "hit" candidates: sharp high-frequency transients (racket-shuttle impact
  is a short broadband click). Squeaks and claps also trigger it.
- motion energy: mean frame difference at 5 fps.
- scene cuts: ffmpeg scdet (useful for already-edited input).
- rally candidates: clusters of hit candidates with short gaps.
Everything is labelled source="auto" so it is never mixed with verified stats.
"""
from __future__ import annotations

import numpy as np

from .. import media

SR = 16000
HOP = 160          # 10 ms
WIN = 512


def hit_candidates(pcm: np.ndarray) -> list[dict]:
    if pcm.size < WIN * 4:
        return []
    n = 1 + (len(pcm) - WIN) // HOP
    idx = np.arange(WIN)[None, :] + HOP * np.arange(n)[:, None]
    frames = pcm[idx] * np.hanning(WIN)[None, :]
    spec = np.abs(np.fft.rfft(frames, axis=1))
    freqs = np.fft.rfftfreq(WIN, 1 / SR)
    band = (freqs >= 2000) & (freqs <= 7000)
    e = np.log1p(spec[:, band].sum(axis=1) * 100)
    flux = np.maximum(0, np.diff(e, prepend=e[0]))
    # adaptive threshold: rolling median + k * MAD over ~3 s
    w = 300
    pad = np.pad(flux, (w // 2, w // 2), mode="edge")
    from numpy.lib.stride_tricks import sliding_window_view
    win = sliding_window_view(pad, w + 1)[: len(flux)]
    med = np.median(win, axis=1)
    mad = np.median(np.abs(win - med[:, None]), axis=1) + 1e-6
    score = (flux - med) / mad
    hits, last = [], -1e9
    for i in np.argsort(-score):
        if score[i] < 12:
            break
        t = i * HOP / SR
        if all(abs(t - h["t"]) >= 0.3 for h in hits):
            hits.append({"t": round(t, 2), "strength": round(float(score[i]), 1)})
    hits.sort(key=lambda h: h["t"])
    return hits


def rallies_from_hits(hits, duration, max_gap=2.6, min_hits=3) -> list[dict]:
    out, cur = [], []
    for h in hits:
        if cur and h["t"] - cur[-1]["t"] > max_gap:
            if len(cur) >= min_hits:
                out.append(cur)
            cur = []
        cur.append(h)
    if len(cur) >= min_hits:
        out.append(cur)
    rallies = []
    for i, c in enumerate(out, 1):
        s = max(0.0, c[0]["t"] - 1.2)
        e = min(duration, c[-1]["t"] + 1.8)
        rallies.append({"id": f"r{i:03d}", "start": round(s, 2), "end": round(e, 2),
                        "hit_candidates": len(c), "length_sec": round(e - s, 2), "source": "auto"})
    return rallies


def rallies_from_motion(motion_sec, duration, min_len=4, max_gap=2) -> list[dict]:
    """Fallback when audio is unusable: sustained movement on the filmed court."""
    if not motion_sec:
        return []
    m = np.array(motion_sec)
    # adaptive: compare with the quiet baseline of the surrounding minute (light/zoom changes over a match)
    base = np.array([np.percentile(m[max(0, i - 30): i + 30], 20) for i in range(len(m))])
    active = (m > np.maximum(0.9, base * 2.2))
    spans, start, gap = [], None, 0
    for i, a in enumerate(active):
        if a:
            start = i if start is None else start
            gap = 0
        elif start is not None:
            gap += 1
            if gap > max_gap:
                spans.append((start, i - gap + 1))
                start, gap = None, 0
    if start is not None:
        spans.append((start, len(m)))
    out = []
    for n, (a, b) in enumerate([s for s in spans if s[1] - s[0] >= min_len], 1):
        s0, e0 = max(0, a - 1), min(duration, b + 1)
        out.append({"id": f"r{n:03d}", "start": float(s0), "end": float(e0), "length_sec": float(e0 - s0),
                    "peak_motion": round(float(m[a:b].max()), 1), "source": "auto-motion"})
    return out


def scene_cuts(motion) -> list[float]:
    """Hard cuts = isolated spikes in frame difference (a pan or a fast run is not isolated)."""
    if len(motion) < 3:
        return []
    vals = np.array([m for _, m in motion])
    floor = max(18.0, 6 * float(np.median(vals)))
    cuts = []
    for i in range(1, len(vals) - 1):
        if vals[i] > floor and vals[i - 1] < vals[i] / 2.5 and vals[i + 1] < vals[i] / 2.5:
            cuts.append(round(motion[i][0], 2))
    return cuts


def run(job):
    meta = job.read_json("metadata.json")
    dur = meta["duration_sec"]
    pcm = media.audio_pcm(job.raw, SR)
    hits = hit_candidates(pcm)
    # loudness per second (crowd / speech / silence context)
    loud = []
    if pcm.size:
        for s in range(int(np.ceil(len(pcm) / SR))):
            seg = pcm[s * SR:(s + 1) * SR]
            loud.append(round(float(20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9)), 1))
    motion, prev = [], None
    for t, fr in media.gray_frames(job.raw, fps=5, width=160):
        cur = fr.astype(np.int16)
        if prev is not None:
            # lower 65% of the frame = the filmed court; the top is ceiling / far courts
            roi = slice(int(cur.shape[0] * 0.35), None)
            motion.append((round(t, 2), round(float(np.mean(np.abs(cur[roi] - prev[roi]))), 2)))
        prev = cur
    # per-second motion
    per_sec = {}
    for t, m in motion:
        per_sec.setdefault(int(t), []).append(m)
    motion_sec = [round(float(np.mean(per_sec.get(s, [0]))), 2) for s in range(int(np.ceil(dur)))]
    cuts = scene_cuts(motion)
    # Edited clips with music produce a steady beat that looks like "hits".
    audio_profile = "natural"
    if len(hits) >= 12:
        iv = np.diff([h["t"] for h in hits])
        if len(hits) / max(dur, 1) > 1.2 and float(np.std(iv) / np.mean(iv)) < 0.35:
            audio_profile = "dense regular onsets (background music or a multi-court hall)"
    rallies = rallies_from_hits(hits, dur) if audio_profile == "natural" else []
    if not rallies:
        rallies = rallies_from_motion(motion_sec, dur)
    # mark idle stretches (no hits, low motion, >= 8 s): pickup / waiting candidates
    idle, start = [], None
    thr = float(np.percentile(motion_sec, 30)) if motion_sec else 0
    for s, m in enumerate(motion_sec):
        busy = m > thr or any(s <= h["t"] < s + 1 for h in hits)
        if not busy and start is None:
            start = s
        if busy and start is not None:
            if s - start >= 8:
                idle.append({"start": start, "end": s})
            start = None
    if start is not None and len(motion_sec) - start >= 8:
        idle.append({"start": start, "end": len(motion_sec)})
    out = {
        "note": "automatic measurements; not verified statistics",
        "duration_sec": dur,
        "audio_profile": audio_profile,
        "hit_candidates": hits if audio_profile == "natural" else [],
        "rally_candidates": rallies,
        "idle_candidates": idle,
        "scene_cuts": cuts,
        "motion_per_sec": motion_sec,
        "loudness_db_per_sec": loud,
    }
    job.write_json("signals.json", out)
    return {"hits": len(hits), "rallies": len(rallies), "cuts": len(cuts)}
