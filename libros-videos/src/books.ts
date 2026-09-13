export type Book = {
	slug: string;
	compositionId: string;
	// Título partido en líneas, tal y como se pinta en la portada.
	titleLines: string[];
	// Palabras que llevan la banda de color detrás (subcadena del título).
	accent: string;
	subtitle: string;
	pages: number; // páginas del vídeo (imágenes en public/books/<slug>)
	paperPages: number; // páginas reales del libro
	claim: string; // frase corta del cierre
	// Color de fondo de la portada nueva (2-sep-2026): tiñe la banda del título
	// y el botón del cierre, para que el vídeo vaya a juego con la cubierta.
	color: string;
	// Proporción ancho/alto de cover.jpg: las portadas nuevas no son todas iguales.
	coverRatio: number;
	// Proporción ancho/alto de las páginas. Por defecto el A5 de los PDF de las
	// guías; los recetarios son 6×9 pulgadas, que es más estrecho.
	pageRatio?: number;
	// Color del texto sobre la banda de `color`. Por defecto crema, que es lo
	// que piden las portadas oscuras; las claras (el amarillo de «Comer con
	// ganas») necesitan tinta o no se lee nada.
	textoBanda?: string;
};

export const BOOKS: Book[] = [
	{
		slug: 'comer-con-sibo',
		compositionId: 'ComerConSibo',
		titleLines: ['Comer', 'con SIBO'],
		accent: 'con SIBO',
		subtitle: 'La dieta baja en FODMAP, bien hecha, bien medida y con fecha de caducidad',
		pages: 17,
		paperPages: 164,
		claim: 'No hay alimentos prohibidos. Hay cantidades.',
		color: '#89120e',
		coverRatio: 1024 / 1536,
	},
	{
		slug: 'comer-con-diabetes',
		compositionId: 'ComerConDiabetes',
		titleLines: ['Comer con', 'diabetes'],
		accent: 'diabetes',
		subtitle: 'La dieta que estabiliza tu glucosa, sin picos, sin restricciones y para toda la vida',
		pages: 14,
		paperPages: 132,
		claim: 'No es solo cuánto sube. Es cuánto tiempo pasas arriba.',
		color: '#0c6a64',
		coverRatio: 992 / 1586,
	},
	{
		slug: 'comer-con-sop',
		compositionId: 'ComerConSop',
		titleLines: ['Comer', 'con SOP'],
		accent: 'con SOP',
		subtitle: 'Guía nutricional para mejorar tus síntomas, equilibrar tus hormonas y recuperar tu energía',
		pages: 15,
		paperPages: 84,
		claim: 'No existe una dieta del SOP. Lo dice la guía.',
		color: '#573060',
		coverRatio: 1024 / 1536,
	},
	{
		// Antes «La menopausia no engorda»; el libro se llama «Comer en la menopausia»
		// en la tienda y la portada nueva pone «Comer con menopausia».
		slug: 'comer-en-la-menopausia',
		compositionId: 'ComerEnLaMenopausia',
		titleLines: ['Comer con', 'menopausia'],
		accent: 'menopausia',
		subtitle: 'Guía nutricional para sentirte mejor, cuidar tu salud hormonal y ganar bienestar',
		pages: 15,
		paperPages: 88,
		claim: 'No engordas por la menopausia. Cambias de sitio la grasa.',
		color: '#bc5537',
		coverRatio: 1024 / 1536,
	},
	{
		slug: 'comer-sin-complicarte',
		compositionId: 'ComerSinComplicarte',
		titleLines: ['Comer', 'sin complicarte'],
		accent: 'sin complicarte',
		subtitle: '100 recetas para tu día a día',
		pages: 16,
		paperPages: 108,
		claim: 'Resolver la comida también puede ser fácil.',
		color: '#1c1c1c',
		coverRatio: 2 / 3,
		pageRatio: 432 / 648,
	},
	{
		slug: 'comer-con-ganas',
		compositionId: 'ComerConGanas',
		titleLines: ['Comer', 'con ganas'],
		accent: 'con ganas',
		subtitle: '100 recetas para salir de la rutina',
		pages: 16,
		paperPages: 108,
		claim: 'Que cocinar vuelva a darte ideas.',
		// El amarillo de su cubierta. Con texto crema encima no se leería nada,
		// así que esta banda va con tinta.
		color: '#f2b705',
		textoBanda: '#1c1c1c',
		coverRatio: 2 / 3,
		pageRatio: 432 / 648,
	},
	{
		slug: 'comer-y-repetir',
		compositionId: 'ComerYRepetir',
		titleLines: ['Comer', 'y repetir'],
		accent: 'y repetir',
		subtitle: '100 recetas para disfrutar cocinando',
		pages: 16,
		paperPages: 108,
		claim: 'Hay platos que merecen quedarse.',
		// Su cubierta es arena y sobre el fondo del cierre no se vería; se usa el
		// oro de la línea que llevan las tres portadas.
		color: '#8a6a17',
		coverRatio: 2 / 3,
		pageRatio: 432 / 648,
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
