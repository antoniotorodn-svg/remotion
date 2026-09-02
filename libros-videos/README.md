# Vídeos de los libros — Nutricionista.io

Proyecto Remotion independiente (no forma parte del monorepo: está fuera de `packages/**`)
que genera un vídeo cuadrado (1080×1080, 30 fps, ~14 s) por cada guía de la colección
«Comer con—»: la portada entra, el libro se abre, pasan las páginas reales con un giro 3D
y cierra con el CTA «Consíguelo en PDF» (desde el 2-sep-2026 no se enlaza a Amazon).

## Estructura

- `src/books.ts` — datos y timing de cada libro (título, banda amarilla, nº de páginas…).
- `src/BookPromo.tsx` — la composición (una sola, parametrizada por libro).
- `public/books/<slug>/` — `cover.jpg` (la portada nueva de 2-sep-2026, tal cual la imagen original) y `page-XX.jpg` (páginas del PDF web,
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

Los MP4 resultantes se copian a `nutricionistaio/public/libros/<slug>/video.mp4`, donde los
usa la ficha de producto `/libros/<slug>/`.

## Añadir un libro nuevo (p. ej. «Comer sin hambre»)

1. Exporta portada (`cover.jpg`) y ~15 páginas (`page-01.jpg`…) a `public/books/<slug>/`.
2. Añade la entrada en `src/books.ts` (el campo `pages` = nº de imágenes).
3. Añade la línea de render en el script `render:all` de `package.json`.

## Renderizar sin npm a mano: GitHub Actions

`.github/workflows/render-libros-videos.yml` renderiza los cuatro vídeos en
GitHub Actions (`workflow_dispatch`) y deja los MP4 en la rama
`libros-videos-out`, además de subirlos como artefacto del run. Es lo que se usa
cuando el entorno no puede instalar paquetes (el registro npm bloqueado).
