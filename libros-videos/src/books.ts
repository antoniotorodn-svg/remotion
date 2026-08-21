export type Book = {
	slug: string;
	compositionId: string;
	// Título partido en líneas, tal y como se pinta en la portada.
	titleLines: string[];
	// Palabras que llevan la banda amarilla detrás (subcadena del título).
	accent: string;
	subtitle: string;
	pages: number; // páginas del vídeo (imágenes en public/books/<slug>)
	paperPages: number; // páginas reales del libro en papel
	claim: string; // frase corta del cierre
	// Carpeta de las imágenes dentro de public/. Por defecto 'books'; los
	// dosieres de Instagram viven en 'dosieres' para no mezclarse con la
	// colección, que es producto de pago.
	carpeta?: string;
	// Alto del lienzo. Los libros van cuadrados (1080) porque se ven en la
	// ficha de producto; los dosieres van a 4:5 (1350), que es lo que más
	// ocupa en el feed de Instagram.
	alto?: number;
	// Cierre. Sin `cta` se pinta el de Amazon, que es el de la colección.
	// Los dosieres cierran con la palabra que hay que comentar.
	cta?: {palabra: string; pie: string};
	// Extensión de las imágenes. Los libros van en JPG; los dosieres en PNG,
	// que es como salen del conversor de páginas de los PDF.
	ext?: 'jpg' | 'png';
};

export const BOOKS: Book[] = [
	{
		slug: 'comer-con-sibo',
		compositionId: 'ComerConSibo',
		titleLines: ['Comer', 'con SIBO'],
		accent: 'con SIBO',
		subtitle: 'La dieta baja en FODMAP, bien hecha, bien medida y con fecha de caducidad',
		pages: 17,
		paperPages: 156,
		claim: 'No hay alimentos prohibidos. Hay cantidades.',
	},
	{
		slug: 'comer-con-diabetes',
		compositionId: 'ComerConDiabetes',
		titleLines: ['Comer con', 'diabetes'],
		accent: 'diabetes',
		subtitle: 'Qué le hace cada comida a tu glucosa, y qué hacer con ello',
		pages: 14,
		paperPages: 124,
		claim: 'No es solo cuánto sube. Es cuánto tiempo pasas arriba.',
	},
	{
		slug: 'comer-con-sop',
		compositionId: 'ComerConSop',
		titleLines: ['Comer', 'con SOP'],
		accent: 'con SOP',
		subtitle: 'Ninguna dieta es superior. Lo dice la guía internacional. Esto es lo que sí funciona',
		pages: 15,
		paperPages: 84,
		claim: 'No existe una dieta del SOP. Lo dice la guía.',
	},
	{
		slug: 'la-menopausia-no-engorda',
		compositionId: 'LaMenopausiaNoEngorda',
		titleLines: ['La menopausia', 'no engorda'],
		accent: 'no engorda',
		subtitle: 'Lo que de verdad cambia en tu cuerpo a partir de los cuarenta, y qué hacer con ello',
		pages: 15,
		paperPages: 84,
		claim: 'No engordas por la menopausia. Cambias de sitio la grasa.',
	},
];

// ─── Los dosieres de Instagram ──────────────────────────────────
//
// Misma pieza que los libros —portada, páginas pasando y cierre— pero el
// cierre no vende un libro: pide un comentario. `palabra` tiene que existir
// en `instagram_automations` del panel o quien comente no recibirá nada.
//
// Las imágenes van en public/dosieres/<slug>/: `cover.jpg` es la portada del
// PDF y `page-01.jpg`… las páginas, extraídas igual que las de los libros.

export const DOSIERES: Book[] = [
	{
		slug: 'metabolismo',
		compositionId: 'DosierMetabolismo',
		titleLines: ['«Tengo el', 'metabolismo lento»'],
		accent: 'metabolismo lento»',
		subtitle: 'De qué se compone de verdad tu gasto diario, y qué parte puedes mover tú',
		pages: 10,
		paperPages: 24,
		claim: 'Comer menos cada vez no es la salida.',
		carpeta: 'dosieres',
		alto: 1350,
		ext: 'png',
		cta: {palabra: 'METABOLISMO', pie: 'Comenta la palabra y te lo mando por privado'},
	},
	{
		slug: 'prioridades',
		compositionId: 'DosierPrioridades',
		titleLines: ['Qué importa', 'y en qué orden'],
		accent: 'y en qué orden',
		subtitle: 'La pirámide real de la pérdida de grasa: qué mueve la aguja y qué es ruido',
		pages: 10,
		paperPages: 21,
		claim: 'Casi todo el mundo empieza por el escalón de arriba.',
		carpeta: 'dosieres',
		alto: 1350,
		ext: 'png',
		cta: {palabra: 'PRIORIDADES', pie: 'Comenta la palabra y te lo mando por privado'},
	},
	{
		slug: 'progreso',
		compositionId: 'DosierProgreso',
		titleLines: ['La báscula', 'no lo es todo'],
		accent: 'no lo es todo',
		subtitle: 'Las otras formas de medir el progreso, para no tirar la toalla antes de tiempo',
		pages: 10,
		paperPages: 16,
		claim: 'El número no se mueve. Tú sí.',
		carpeta: 'dosieres',
		alto: 1350,
		ext: 'png',
		cta: {palabra: 'PROGRESO', pie: 'Comenta la palabra y te lo mando por privado'},
	},
	{
		slug: 'mentalidad',
		compositionId: 'DosierMentalidad',
		titleLines: ['«Empiezo', 'el lunes»'],
		accent: 'el lunes»',
		subtitle: 'Los patrones que te boicotean y cómo sostener el cambio sin fuerza de voluntad',
		pages: 10,
		paperPages: 24,
		claim: 'La fuerza de voluntad se acaba. El entorno no.',
		carpeta: 'dosieres',
		alto: 1350,
		ext: 'png',
		cta: {palabra: 'MENTALIDAD', pie: 'Comenta la palabra y te lo mando por privado'},
	},
	{
		slug: 'fuera-de-casa',
		compositionId: 'DosierFueraDeCasa',
		titleLines: ['Comer fuera', 'sin descarrilar'],
		accent: 'sin descarrilar',
		subtitle: 'El restaurante, la cena con amigos y la comida de empresa, resueltos',
		pages: 10,
		paperPages: 16,
		claim: 'Salir a comer no tiene por qué costarte la semana.',
		carpeta: 'dosieres',
		alto: 1350,
		ext: 'png',
		cta: {palabra: 'FUERA', pie: 'Comenta la palabra y te lo mando por privado'},
	},
	{
		slug: 'errores',
		compositionId: 'DosierErrores',
		titleLines: ['Los fallos', 'de siempre'],
		accent: 'de siempre',
		subtitle: 'Los errores que frenan tus resultados, y qué hacer en su lugar',
		pages: 10,
		paperPages: 16,
		claim: 'No es que te falte voluntad.',
		carpeta: 'dosieres',
		alto: 1350,
		ext: 'png',
		cta: {palabra: 'ERRORES', pie: 'Comenta la palabra y te lo mando por privado'},
	},
];

// Timing del vídeo (30 fps)
export const INTRO = 70; // portada entrando
export const COVER_FLIP = 14; // la portada se abre
export const PER_PAGE = 14; // dwell + giro por página
export const LAST_DWELL = 18; // última página quieta
export const OUTRO = 100; // cierre con CTA

export const totalDuration = (book: Book) =>
	INTRO + COVER_FLIP + book.pages * PER_PAGE + LAST_DWELL + OUTRO;
