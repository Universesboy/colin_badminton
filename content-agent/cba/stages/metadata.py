"""Stage 2: metadata. Only facts read from the file; unknowns stay null."""
from __future__ import annotations

from .. import media


def run(job):
    info = media.probe(job.raw)
    fmt = info["format"]
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    if v is None:
        raise ValueError("file has no video stream")
    w, h = int(v["width"]), int(v["height"])
    rot = media.rotation_of(v)
    if abs(rot) in (90, 270):
        w, h = h, w
    tags = fmt.get("tags") or {}
    meta = {
        "video_id": job.id,
        "original_filename": job.data["original_filename"],
        "uploaded_at": job.data["received_at"],
        # creation_time is what the camera wrote; it is a recording date only if the clock was right.
        "recorded_at_container": tags.get("creation_time") or (v.get("tags") or {}).get("creation_time"),
        "recorded_at_confirmed": False,
        "duration_sec": round(float(fmt.get("duration", 0)), 3),
        "width": w,
        "height": h,
        "orientation": "portrait" if h > w else "landscape",
        "rotation": rot,
        "fps": media.fps_of(v),
        "video_codec": v.get("codec_name"),
        "bitrate": int(fmt["bit_rate"]) if fmt.get("bit_rate") else None,
        "has_audio": a is not None,
        "audio_codec": a.get("codec_name") if a else None,
        "size_bytes": int(fmt.get("size", 0)),
        "device": tags.get("encoder") or tags.get("com.apple.quicktime.model") or None,
        "source": job.data["source"],
        "raw_path": str(job.raw),
        # Context fields Colin can fill in; never guessed.
        "location": None,
        "participants": None,
        "event_context": None,
        "related_players": None,
        "note": job.data.get("note") or None,
    }
    job.write_json("metadata.json", meta)
    job.data["metadata"] = {k: meta[k] for k in ("duration_sec", "width", "height", "fps", "orientation")}
    job.save()
    return {"metadata": "metadata.json"}
