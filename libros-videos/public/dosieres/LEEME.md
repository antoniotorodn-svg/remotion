# Páginas de los dosieres

Una carpeta por dosier, con el mismo `slug` que en `DOSIERES`
(src/books.ts) y la misma estructura que los libros:

    public/dosieres/metabolismo/cover.png    ← la portada del PDF
    public/dosieres/metabolismo/page-01.png
    public/dosieres/metabolismo/page-02.png
    ...

**En PNG, no en JPG** como los libros: es como salen del conversor
`pdf2png` de Antonio, que es quien exporta las páginas (aquí no se puede,
PDFium no dibuja en headless). Por eso el tipo `Book` lleva `ext`.

Vienen a 1656x2339 y se reducen a 850x1200, que es lo que pide la
composición. El reducido se hace con Chromium porque el ffmpeg del
contenedor no trae decodificador de PNG.

Diez páginas bastan: el vídeo dura lo que dura y nadie ve el dosier entero
en el feed. Se eligen las que mejor se ven, no las diez primeras. El campo
`pages` de `DOSIERES` tiene que coincidir con el número de `page-*.png`.

**La portada no siempre es la página 1.** En `errores` es la 5: ese dosier
es la parte II de la serie de metabolismo y su página 1 lleva por título
«MI METABOLISMO ES LENTO», que en el vídeo de errores confundiría.

Los seis son exactamente los seis del feed que tienen dosier. «Empieza por
aquí» ya no está: se cayo del feed porque decía lo mismo que «Qué importa
y en qué orden», y su hueco lo ocupa la app, que no es un dosier.
