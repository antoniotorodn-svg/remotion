# Vídeos de los libros — Nutricionista.io

Proyecto Remotion independiente (no forma parte del monorepo: está fuera de `packages/**`)
que genera un vídeo cuadrado (1080×1080, 30 fps, ~14 s) por cada guía de la colección
«Comer con—»: la portada entra, el libro se abre, pasan las páginas reales con un giro 3D
y cierra con el CTA «Cómpralo en Amazon».

## Estructura

- `src/books.ts` — datos y timing de cada libro (título, banda amarilla, nº de páginas…).
- `src/BookPromo.tsx` — la composición (una sola, parametrizada por libro).
- `public/books/<slug>/` — `cover.jpg` (portada ebook) y `page-XX.jpg` (páginas del PDF web,
  extraídas con PyMuPDF a 150 dpi y redimensionadas a 1200 px de alto).
- `public/fonts/` — las fuentes reales de la maquetación de los libros (Spectral, DM Sans,
  DM Serif Display).

## Renderizar

```bash
npm install
# En el contenedor de Claude Code el Chromium normal ya no trae el headless antiguo;
# usa el headless shell preinstalado:
REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  npm run render:all -- --timeout=180000
```

Sin esa variable, Remotion descarga/usa su propio Chrome (válido en local).

**Después de renderizar, ejecuta siempre `./encode-web.sh`**: convierte los MP4 a
yuv420p rango limitado BT.709, quita la pista de audio muda y aplica faststart.
El render sale en yuvj420p full-range (por los frames JPEG), y ese formato falla
o se ve mal en algunos decodificadores.

Los MP4 resultantes se copian a `nutricionistaio/public/libros/<slug>/video.mp4`, donde los
usa la ficha de producto `/libros/<slug>/`.

## Portadas

Las portadas de la colección se generan desde `covers/covers.html` (HTML + SVG con las
fuentes reales) capturado con Playwright en dos tamaños: A5 (vídeo, misma proporción que
las páginas para que el libro cerrado no se descuadre) y 1600×2560 (eBook para web y KDP).
La dirección de arte está en `covers/PHILOSOPHY.md`.

## Añadir un libro nuevo (p. ej. «Comer sin hambre»)

1. Exporta portada (`cover.jpg`) y ~15 páginas (`page-01.jpg`…) a `public/books/<slug>/`.
2. Añade la entrada en `src/books.ts` (el campo `pages` = nº de imágenes).
3. Añade la línea de render en el script `render:all` de `package.json`.
