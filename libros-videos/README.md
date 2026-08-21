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

Los MP4 resultantes se copian a `nutricionistaio/public/libros/<slug>/video.mp4`, donde los
usa la ficha de producto `/libros/<slug>/`.

## Los dosieres de Instagram

Las doce publicaciones fijas del feed usan **la misma composición**: portada,
páginas pasando y cierre. Lo único que cambia es que el cierre no vende un
libro, pide un comentario (`cta.palabra`), y que el lienzo va a 4:5
(1080×1350) en vez de cuadrado, que es lo que más ocupa en el feed.

- Datos: `DOSIERES` en `src/books.ts`.
- Imágenes: `public/dosieres/<slug>/cover.jpg` + `page-01.jpg`…, extraídas
  igual que las de los libros.
- Render: `npm run render:dosieres`.

La palabra del cierre tiene que existir en `instagram_automations` del panel
o quien comente no recibirá nada. Eso se comprueba en el panel, no aquí.

## Añadir un libro nuevo (p. ej. «Comer sin hambre»)

1. Exporta portada (`cover.jpg`) y ~15 páginas (`page-01.jpg`…) a `public/books/<slug>/`.
2. Añade la entrada en `src/books.ts` (el campo `pages` = nº de imágenes).
3. Añade la línea de render en el script `render:all` de `package.json`.
