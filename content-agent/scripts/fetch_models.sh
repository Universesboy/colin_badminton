#!/usr/bin/env bash
# Downloads the offline speech models (~165 MB) from the sherpa-onnx GitHub releases.
set -euo pipefail
DIR="${CBA_MODELS_DIR:-$(cd "$(dirname "$0")/.." && pwd)/models}"
mkdir -p "$DIR" && cd "$DIR"
BASE=https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models
SV=sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17
[ -f "$SV/model.int8.onnx" ] || { curl -fL -o sv.tar.bz2 "$BASE/$SV.tar.bz2" && tar xjf sv.tar.bz2 && rm sv.tar.bz2; }
[ -f silero_vad.onnx ] || curl -fL -o silero_vad.onnx "$BASE/silero_vad.onnx"
echo "models ready in $DIR"
