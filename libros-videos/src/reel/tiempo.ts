import type {Palabra, Tramo} from './tipos';

// Paso del tiempo del vídeo original al del reel ya cortado.

/** Duración del reel en ms (lo que suman los tramos). */
export function duracionMs(tramos: Tramo[]): number {
	return tramos.reduce((n, [a, b]) => n + Math.max(0, b - a), 0);
}

/** Un instante del original en el reel. Si cae en un trozo cortado, va al
 *  principio de lo siguiente que se queda. */
export function aReel(ms: number, tramos: Tramo[]): number {
	let acc = 0;
	for (const [a, b] of tramos) {
		if (ms < a) return acc;
		if (ms <= b) return acc + (ms - a);
		acc += b - a;
	}
	return acc;
}

/** Las palabras con su tiempo ya en el reel. Se quitan las que caen en un
 *  trozo cortado (por su punto medio). */
export function palabrasEnReel(palabras: Palabra[], tramos: Tramo[]): Palabra[] {
	const dentro = (ms: number) => tramos.some(([a, b]) => ms >= a && ms <= b);
	return palabras
		.filter((p) => dentro((p.desdeMs + p.hastaMs) / 2))
		.map((p) => ({...p, desdeMs: aReel(p.desdeMs, tramos), hastaMs: aReel(p.hastaMs, tramos)}));
}

export const normal = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^\p{L}\p{N}€%]/gu, '');

/** Grupos de 2-3 palabras para los subtítulos: se corta al llegar a tres, en
 *  un punto o coma, si hay una pausa o si el grupo se alarga demasiado. */
export function gruposDeSubtitulos(palabras: Palabra[], max = 3): Palabra[][] {
	const grupos: Palabra[][] = [];
	let actual: Palabra[] = [];
	for (const p of palabras) {
		const ultima = actual[actual.length - 1];
		const pausa = ultima ? p.desdeMs - ultima.hastaMs : 0;
		const largo = actual.length ? p.hastaMs - actual[0].desdeMs : 0;
		if (actual.length && (actual.length >= max || pausa > 300 || largo > 1400)) {
			grupos.push(actual);
			actual = [];
		}
		actual.push(p);
		if (/[.,;:?!…]$/.test(p.texto.trim())) {
			grupos.push(actual);
			actual = [];
		}
	}
	if (actual.length) grupos.push(actual);
	return grupos;
}
