#!/usr/bin/env bash
# Normaliza los MP4 renderizados para máxima compatibilidad web:
# yuv420p rango limitado BT.709 (el yuvj420p full-range de origen falla o se ve
# lavado en algunos decodificadores), sin pista de audio (son vídeos mudos) y
# con faststart. Usa el ffmpeg que trae el compositor de Remotion.
set -euo pipefail
cd "$(dirname "$0")"
FF=node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg
for f in out/*.mp4; do
  tmp="${f%.mp4}-web.mp4"
  "$FF" -hide_banner -v error -y -i "$f" -an \
    -vf "scale=in_range=pc:out_range=tv,format=yuv420p" \
    -c:v libx264 -crf 19 -preset medium \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -movflags +faststart "$tmp"
  mv "$tmp" "$f"
  echo "ok $f"
done
