#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <video_url> <audio_url> [output.mp4]" >&2
  exit 1
fi

VIDEO_URL="$1"
AUDIO_URL="$2"
OUTPUT_PATH="${3:-stitched-output.mp4}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required" >&2
  exit 1
fi

WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

VIDEO_FILE="$WORKDIR/video.mp4"
AUDIO_FILE="$WORKDIR/audio.mp3"

echo "Downloading video..."
curl -fL "$VIDEO_URL" -o "$VIDEO_FILE"

echo "Downloading audio..."
curl -fL "$AUDIO_URL" -o "$AUDIO_FILE"

echo "Stitching with ffmpeg..."
ffmpeg -y -i "$VIDEO_FILE" -i "$AUDIO_FILE" -c:v copy -c:a aac -shortest "$OUTPUT_PATH"

echo "Done. Output: $OUTPUT_PATH"
