// Reel hablado al estilo de @diegoabreuuu_ (brief en la carpeta de Drive
// «Estilo diegoabreuuu_», 4-oct-2026): tú hablando arriba, un recurso abajo
// que cambia según lo que dices, subtítulos de 2-3 palabras con la palabra
// clave en amarillo, un gancho al principio y el «Comenta X» al final.
//
// TODOS los tiempos (recursos, gancho, CTA, subtítulos) van en el tiempo del
// VÍDEO ORIGINAL, tal cual lo grabaste. Los cortes de silencios (`tramos`) se
// aplican después y la plantilla recoloca todo sola, así que si cambian los
// cortes no hay que tocar nada más.

/** Una palabra dicha, con su tiempo en el vídeo original (ms). Sale de
 *  scripts/preparar-reel.py (Whisper con marcas por palabra). */
export interface Palabra {
	texto: string;
	desdeMs: number;
	hastaMs: number;
}

/** Trozo del vídeo original que se queda, en ms. Lo que no está en ningún
 *  tramo se corta (los silencios: el «jump cut» del brief). */
export type Tramo = [number, number];

interface RecursoBase {
	/** Segundos del vídeo original. */
	desde: number;
	hasta: number;
}

export type Recurso =
	| (RecursoBase & {
			tipo: 'imagen';
			/** Ruta dentro de public/ (p. ej. «reels/mi-reel/captura.jpg») o URL. */
			src: string;
			ajuste?: 'cover' | 'contain';
			/** Una línea debajo, opcional. */
			pie?: string;
	  })
	| (RecursoBase & {
			tipo: 'video';
			src: string;
			/** Por defecto sin sonido (el que habla eres tú). */
			conAudio?: boolean;
	  })
	| (RecursoBase & {
			tipo: 'pizarra';
			titulo?: string;
			/** Cada punto aparece en su segundo y, si quieres, se tacha después. */
			puntos: Array<{texto: string; aparece: number; tachado?: number}>;
	  })
	| (RecursoBase & {
			/** La «miniatura de YouTube» con la cifra: prueba social. */
			tipo: 'cifra';
			cifra: string;
			texto: string;
			/** Línea pequeña encima, p. ej. «Caso real · Getafe». */
			etiqueta?: string;
	  });

export type PropsReel = {
	/** Ruta dentro de public/ o URL. null = demo con un fondo en su lugar. */
	video: string | null;
	/** Altura del encuadre de la cara cuando la pantalla va partida (0 = arriba,
	 *  100 = abajo). Con el plano medio del brief, ~35 deja los ojos en su sitio. */
	encuadreY?: number;
	tramos: Tramo[];
	subtitulos: Palabra[];
	/** Palabras que salen en amarillo (sin tildes ni mayúsculas, da igual). */
	claves: string[];
	gancho?: {texto: string; resaltado?: string; hasta: number};
	recursos: Recurso[];
	cta?: {palabra: string; texto: string; desde: number};
};
