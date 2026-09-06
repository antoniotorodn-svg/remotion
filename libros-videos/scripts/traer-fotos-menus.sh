#!/usr/bin/env bash
# Baja las fotos de los platos que salen en MenusPromo y las deja recortadas en
# public/menus/<id>.jpg.
#
# Las originales del bucket son PNG de ~2,4 MB cada una: metidas tal cual en el
# vídeo son 140 MB en el repo y 60 imágenes de 1024 px descodificadas a la vez
# en el render. Aquí salen a 520×520 y JPEG 82, que es más de lo que ocupa un
# azulejo del mosaico (300 px) incluso con el zoom.
#
# Uso:  ./scripts/traer-fotos-menus.sh
# Necesita curl e ImageMagick (`magick` o `convert`).

set -euo pipefail
cd "$(dirname "$0")/.."

BUCKET='https://txaexpjichriufttoufw.supabase.co/storage/v1/object/public/recipe-images'
DESTINO='public/menus'
LADO=520

if command -v magick >/dev/null 2>&1; then
	IM=(magick)
elif command -v convert >/dev/null 2>&1; then
	IM=(convert)
else
	echo "Falta ImageMagick (magick o convert)." >&2
	exit 1
fi

# Los ids salen del propio src/menus-platos.ts, así no hay dos listas que
# mantener: si se añade un plato allí, aquí se baja solo.
IDS=$(sed -n "/export const PLATOS/,/] as const/p" src/menus-platos.ts \
	| grep -o "'[a-z0-9-]\+'" | tr -d "'")

mkdir -p "$DESTINO"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

nuevas=0
for id in $IDS; do
	destino="$DESTINO/$id.jpg"
	[ -s "$destino" ] && continue
	echo "· $id"
	curl -fsS --retry 3 --retry-delay 2 -o "$tmp/$id.png" "$BUCKET/$id.png"
	# Recorte cuadrado centrado: las fotos ya son 1:1, pero alguna suelta no lo
	# es y el mosaico las pinta en cuadrado.
	"${IM[@]}" "$tmp/$id.png" -resize "${LADO}x${LADO}^" -gravity center \
		-extent "${LADO}x${LADO}" -quality 82 -strip "$destino"
	nuevas=$((nuevas + 1))
done

total=$(find "$DESTINO" -name '*.jpg' | wc -l | tr -d ' ')
echo "Fotos en $DESTINO: $total (nuevas: $nuevas)"
