import type {Palabra, PropsReel} from './tipos';

// Demo sin vídeo, para ver la plantilla (y sacar fotogramas en CI) antes de
// tener una grabación: subtítulos con tiempos inventados a ritmo de habla.

const FRASES = [
	'Así se bajan 12 kilos sin pasar hambre (ejemplo).',
	'Sin ninguna dieta milagro.',
	'Con tres cambios.',
	'Una: comer cada día a la misma hora.',
	'Dos: el plato mitad verdura, siempre.',
	'Tres: la cena, dos horas antes de dormir.',
	'Comenta MENÚ y te envío un menú de ejemplo.',
];

function palabrasDe(frases: string[], msPorPalabra = 330, pausa = 380): Palabra[] {
	const out: Palabra[] = [];
	let t = 500;
	for (const f of frases) {
		for (const w of f.split(' ')) {
			out.push({texto: w, desdeMs: t, hastaMs: t + msPorPalabra - 30});
			t += msPorPalabra;
		}
		t += pausa;
	}
	return out;
}

const palabras = palabrasDe(FRASES);
const fin = palabras[palabras.length - 1].hastaMs + 2600;
const seg = (i: number) => palabras[i].desdeMs / 1000;

export const DEMO_REEL: PropsReel = {
	video: null,
	tramos: [[0, fin]],
	subtitulos: palabras,
	claves: ['12', 'kilos', 'hambre', 'tres', 'verdura', 'MENÚ'],
	gancho: {texto: '12 kilos en 5 meses sin pasar hambre', resaltado: '12 kilos', hasta: 3},
	recursos: [
		{tipo: 'cifra', desde: seg(0), hasta: seg(9), etiqueta: 'Ejemplo', cifra: '-12 kg', texto: 'en 5 meses, sin dieta milagro'},
		{
			tipo: 'pizarra',
			desde: seg(13),
			hasta: seg(38),
			titulo: 'Lo que cambió',
			puntos: [
				{texto: 'Comer a la misma hora', aparece: seg(16)},
				{texto: 'Medio plato de verdura', aparece: seg(24)},
				{texto: 'Cenar 2 h antes de dormir', aparece: seg(30)},
			],
		},
	],
	cta: {palabra: 'MENÚ', texto: 'un menú de ejemplo', desde: seg(38)},
};
