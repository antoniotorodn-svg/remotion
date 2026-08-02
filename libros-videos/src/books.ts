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

// Timing del vídeo (30 fps). El libro se abre a doble página y cada
// pase de hoja consume dos imágenes (anverso y reverso de la hoja).
export const INTRO = 60; // libro cerrado entrando
export const OPEN = 26; // la cubierta se abre (180º)
export const FLIP_DUR = 16; // giro de cada hoja
export const FLIP_DWELL = 9; // pausa con la doble página quieta
export const PER_FLIP = FLIP_DUR + FLIP_DWELL;
export const LAST_DWELL = 20; // última doble página quieta
export const OUTRO = 100; // cierre con CTA

export const flipsOf = (book: Book) => Math.floor((book.pages - 1) / 2);

export const totalDuration = (book: Book) =>
	INTRO + OPEN + flipsOf(book) * PER_FLIP + LAST_DWELL + OUTRO;
