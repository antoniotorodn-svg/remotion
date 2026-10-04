#!/usr/bin/env python3
"""Prepara un reel hablado para la plantilla ReelHablado (src/reel/).

Toma tu grabación y deja en public/reels/<slug>/:

  subtitulos.json   cada palabra con su tiempo (Whisper, marcas por palabra)
  tramos.json       los trozos que se quedan: fuera los silencios (jump cuts)
  transcripcion.txt lo que dices, frase a frase con su segundo, para colocar
                    los recursos (pizarra, cifra, capturas) en reel.json
  props.json        reel.json + lo anterior: lo que se le pasa a Remotion

Uso:
  pip install faster-whisper
  python scripts/preparar-reel.py <slug> [--modelo medium] [--silencio 0.55]

Necesita public/reels/<slug>/video.mp4. reel.json es opcional la primera vez
(se transcribe igual); los recursos se escriben después mirando la
transcripción. Todos los tiempos de reel.json van en segundos del VÍDEO
ORIGINAL: la plantilla los recoloca tras los cortes.
"""

import argparse
import json
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MARGEN_MS = 120  # aire que se deja antes y después de cada trozo hablado


def transcribir(video: pathlib.Path, modelo: str):
    from faster_whisper import WhisperModel

    m = WhisperModel(modelo, device="cpu", compute_type="int8")
    segmentos, _ = m.transcribe(
        str(video), language="es", word_timestamps=True, vad_filter=True, beam_size=5
    )
    palabras, frases = [], []
    for s in segmentos:
        frases.append((s.start, s.text.strip()))
        for w in s.words or []:
            texto = w.word.strip()
            if texto:
                palabras.append(
                    {"texto": texto, "desdeMs": int(w.start * 1000), "hastaMs": int(w.end * 1000)}
                )
    return palabras, frases


def tramos_sin_silencios(palabras, silencio_s: float):
    """Junta las palabras en trozos; un hueco de más de `silencio_s` es un corte."""
    if not palabras:
        return []
    hueco = int(silencio_s * 1000)
    tramos = []
    ini, fin = palabras[0]["desdeMs"], palabras[0]["hastaMs"]
    for p in palabras[1:]:
        if p["desdeMs"] - fin > hueco:
            tramos.append([ini, fin])
            ini = p["desdeMs"]
        fin = max(fin, p["hastaMs"])
    tramos.append([ini, fin])
    # Aire en los bordes, sin solapar trozos.
    out = []
    for a, b in tramos:
        a = max(0, a - MARGEN_MS)
        b = b + MARGEN_MS
        if out and a <= out[-1][1]:
            out[-1][1] = b
        else:
            out.append([a, b])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--modelo", default="medium")
    ap.add_argument("--silencio", type=float, default=0.55)
    ap.add_argument("--solo-props", action="store_true", help="no transcribe: reusa subtitulos/tramos")
    a = ap.parse_args()

    carpeta = RAIZ / "public" / "reels" / a.slug
    video = carpeta / "video.mp4"
    if not video.exists():
        sys.exit(f"Falta {video}")

    if a.solo_props and (carpeta / "subtitulos.json").exists():
        palabras = json.loads((carpeta / "subtitulos.json").read_text())
        tramos = json.loads((carpeta / "tramos.json").read_text())
    else:
        palabras, frases = transcribir(video, a.modelo)
        tramos = tramos_sin_silencios(palabras, a.silencio)
        (carpeta / "subtitulos.json").write_text(json.dumps(palabras, ensure_ascii=False, indent=1))
        (carpeta / "tramos.json").write_text(json.dumps(tramos))
        (carpeta / "transcripcion.txt").write_text(
            "\n".join(f"[{t:6.2f}] {x}" for t, x in frases) + "\n"
        )

    reel_json = carpeta / "reel.json"
    reel = json.loads(reel_json.read_text()) if reel_json.exists() else {}
    props = {
        "video": f"reels/{a.slug}/video.mp4",
        "encuadreY": 35,
        "claves": [],
        "recursos": [],
        **reel,
        "tramos": tramos,
        "subtitulos": palabras,
    }
    # Las rutas de las imágenes/vídeos de los recursos, relativas a la carpeta del reel.
    for r in props["recursos"]:
        if r.get("src") and not r["src"].startswith(("http", "reels/")):
            r["src"] = f"reels/{a.slug}/{r['src']}"
    (carpeta / "props.json").write_text(json.dumps(props, ensure_ascii=False))

    total = sum(b - a for a, b in tramos) / 1000
    original = (palabras[-1]["hastaMs"] / 1000) if palabras else 0
    print(f"{len(palabras)} palabras · {len(tramos)} trozos · {total:.1f} s de reel (hablado hasta {original:.1f} s)")


if __name__ == "__main__":
    main()
