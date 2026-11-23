"""Stage 4: speech transcription with sherpa-onnx (SenseVoice + Silero VAD).

SenseVoice-Small handles Mandarin, English and code-switching offline on CPU.
Silero VAD cuts speech into segments, which gives segment timestamps. If the
video has no speech, the transcript is empty and the pipeline continues with
visual analysis only.

Models are downloaded by scripts/fetch_models.sh into content-agent/models.
"""
from __future__ import annotations

import re

from .. import config, media

SV_DIR = "sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17"
SR = 16000

# SenseVoice emits tags such as <|zh|><|NEUTRAL|><|Speech|><|woitn|>
TAG = re.compile(r"<\|[^|]*\|>")


def _recognizer():
    import sherpa_onnx
    d = config.MODELS_DIR / SV_DIR
    model = d / "model.int8.onnx"
    if not model.exists():
        raise FileNotFoundError(f"missing {model}; run content-agent/scripts/fetch_models.sh")
    return sherpa_onnx.OfflineRecognizer.from_sense_voice(
        model=str(model), tokens=str(d / "tokens.txt"), use_itn=True, num_threads=4, language="auto")


def _vad():
    import sherpa_onnx
    cfg = sherpa_onnx.VadModelConfig()
    cfg.silero_vad.model = str(config.MODELS_DIR / "silero_vad.onnx")
    cfg.silero_vad.threshold = 0.5
    cfg.silero_vad.min_silence_duration = 0.4
    cfg.silero_vad.min_speech_duration = 0.3
    cfg.silero_vad.max_speech_duration = 12
    cfg.sample_rate = SR
    return sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=600)


def run(job):
    pcm = media.audio_pcm(job.raw, SR)
    segments = []
    if pcm.size:
        rec, vad = _recognizer(), _vad()
        win = 512
        spans = []
        for i in range(0, len(pcm), win):
            vad.accept_waveform(pcm[i:i + win])
            while not vad.empty():
                spans.append((vad.front.start, vad.front.samples))
                vad.pop()
        vad.flush()
        while not vad.empty():
            spans.append((vad.front.start, vad.front.samples))
            vad.pop()
        for start, samples in spans:
            s = rec.create_stream()
            s.accept_waveform(SR, samples)
            rec.decode_stream(s)
            res = s.result
            raw_text = res.text if hasattr(res, "text") else str(res)
            lang = getattr(res, "lang", "") or ""
            text = TAG.sub("", raw_text).strip()
            if not re.search(r"\w", text):
                continue
            t0 = start / SR
            segments.append({
                "start": round(t0, 2),
                "end": round(t0 + len(samples) / SR, 2),
                "text": text,
                "lang": TAG.sub("", lang).strip("<|>") or None,
                "event": (getattr(res, "event", "") or "").strip("<|>") or None,
                "speaker": None,            # diarization not enabled: not claimed
                "source": "asr",            # machine transcription, not yet human-checked
            })
    # Short non-speech outputs (e.g. "嗯", "the") on noisy gym audio are usually noise.
    speechy = [s for s in segments if len(s["text"]) > 1]
    speech_sec = sum(s["end"] - s["start"] for s in speechy)
    out = {
        "engine": "sherpa-onnx SenseVoice-Small int8 + silero-vad",
        "has_speech": speech_sec >= 3.0,
        "speech_seconds": round(speech_sec, 1),
        "segments": segments,
        "verified_by_human": False,
    }
    job.write_json("transcript.json", out)
    with open(job.file("subs", "source.srt"), "w", encoding="utf-8") as f:
        for i, s in enumerate(segments, 1):
            f.write(f"{i}\n{media.ts(s['start'])} --> {media.ts(s['end'])}\n{s['text']}\n\n")
    return {"segments": len(segments), "has_speech": out["has_speech"]}
