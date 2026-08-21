# Páginas de los dosieres

Una carpeta por dosier, con el mismo `slug` que en `DOSIERES` (src/books.ts)
y la misma estructura que los libros:

    public/dosieres/metabolismo/cover.jpg    ← la portada del PDF
    public/dosieres/metabolismo/page-01.jpg
    public/dosieres/metabolismo/page-02.jpg
    ...

Se extraen igual que las de los libros: PyMuPDF a 150 dpi, redimensionadas a
1200 px de alto. El campo `pages` de `DOSIERES` tiene que coincidir con el
número de `page-*.jpg` que haya aquí.

Diez páginas bastan: el vídeo dura lo que dura y nadie ve el dosier entero
en el feed. Se eligen las que mejor se ven, no las diez primeras.
