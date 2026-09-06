import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {platosDeFila} from './menus-platos';

// Mosaico de platos en movimiento para promocionar los menús semanales.
//
// El vídeo va EN BUCLE en la web, así que todo lo que se mueve tiene que valer
// lo mismo en el fotograma 0 que en el `durationInFrames`:
//   · cada fila recorre exactamente el ancho de sus platos únicos;
//   · el latido de los azulejos es un seno con un número entero de vueltas;
//   · el destello entra y sale de cuadro dentro del bucle;
//   · los mensajes duran 120 fotogramas y hay 4, que es justo la duración.
// Si se toca cualquiera de esas cuatro cosas, el corte se nota al reiniciar.

const PALETA = {
	sand: '#f6f3ee',
	cream: '#faf9f7',
	ink: '#1c1c1c',
	texto: '#6b6b6b',
	oro: '#c77d0a',
};

// ─── Mosaico ─────────────────────────────────────────────────────────
const LADO = 330; // azulejo
const HUECO = 24;
const PASO = LADO + HUECO;
const FILAS = 5;
// Platos únicos por fila. Distintos entre sí para que cada fila corra a su
// velocidad (recorre `UNICOS × PASO` px por bucle) y se vea profundidad.
const UNICOS = [5, 7, 6, 8, 5];
const COPIAS = 3; // la tira se repite: dos copias no bastan al desplazarse
const ANCHO_RIG = 2600; // el mosaico va girado, así que sobra por los lados

const Fila: React.FC<{fila: number; progreso: number}> = ({fila, progreso}) => {
	const unicos = UNICOS[fila];
	const recorrido = unicos * PASO;
	const haciaLaDerecha = fila % 2 === 1;
	// Hacia la izquierda: de 0 a -recorrido. Hacia la derecha: de -recorrido a 0.
	// En los dos casos la tira (COPIAS × recorrido) tapa el ancho visible.
	const x = haciaLaDerecha
		? -recorrido + progreso * recorrido
		: -progreso * recorrido;

	const platos = platosDeFila(fila, unicos);

	return (
		<div
			style={{
				position: 'absolute',
				top: fila * PASO,
				left: 0,
				display: 'flex',
				gap: HUECO,
				transform: `translateX(${x}px)`,
				willChange: 'transform',
			}}
		>
			{Array.from({length: COPIAS * unicos}, (_, i) => {
				const plato = platos[i % unicos];
				// Latido: dos vueltas por bucle, desfasado por azulejo.
				const fase = (fila * 2.1 + i * 0.7) % (Math.PI * 2);
				const escala =
					1 + 0.02 * Math.sin(progreso * Math.PI * 4 + fase);
				return (
					<div
						key={`${fila}-${i}`}
						style={{
							width: LADO,
							height: LADO,
							flex: '0 0 auto',
							borderRadius: 28,
							overflow: 'hidden',
							transform: `scale(${escala})`,
							boxShadow: '0 18px 40px rgba(28,28,28,.10)',
							background: PALETA.sand,
						}}
					>
						<Img
							src={staticFile(`menus/${plato}.jpg`)}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								display: 'block',
							}}
						/>
					</div>
				);
			})}
		</div>
	);
};

// ─── Mensajes de la tarjeta ──────────────────────────────────────────
type Mensaje = {titulo: React.ReactNode; pie: string};

const MENSAJES: Mensaje[] = [
	{
		titulo: (
			<>
				<span style={{color: PALETA.oro}}>21 platos</span> cada semana
			</>
		),
		pie: 'Desayuno, comida y cena, de lunes a domingo.',
	},
	{
		titulo: <>La compra, ya hecha</>,
		pie: 'La lista ordenada por pasillo. Una vuelta y la semana resuelta.',
	},
	{
		titulo: (
			<>
				Más de <span style={{color: PALETA.oro}}>400 recetas</span>
			</>
		),
		pie: 'Las mismas que damos en consulta, con sus macros.',
	},
	{
		titulo: (
			<>
				La primera semana, <span style={{color: PALETA.oro}}>gratis</span>
			</>
		),
		pie: 'nutricionista.io/menus',
	},
];

const CICLO = 120; // 4 s por mensaje
const CAMBIO = 20; // fotogramas de relevo
// Medio ciclo de adelanto para que el fotograma 0 (el póster del vídeo) pille
// un mensaje quieto y no a mitad de transición.
const DESFASE = CICLO / 2;

const Texto: React.FC<{mensaje: Mensaje; opacidad: number; y: number}> = ({
	mensaje,
	opacidad,
	y,
}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			opacity: opacidad,
			transform: `translateY(${y}px)`,
		}}
	>
		<h1
			style={{
				margin: 0,
				fontFamily: 'DM Sans',
				fontWeight: 700,
				fontSize: 82,
				lineHeight: 1.06,
				letterSpacing: -1.5,
				color: PALETA.ink,
			}}
		>
			{mensaje.titulo}
		</h1>
		<p
			style={{
				margin: '20px 0 0',
				fontFamily: 'DM Sans',
				fontWeight: 400,
				fontSize: 31,
				lineHeight: 1.35,
				color: PALETA.texto,
			}}
		>
			{mensaje.pie}
		</p>
	</div>
);

export const MenusPromo: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();
	const progreso = frame / durationInFrames;

	const t = frame + DESFASE;
	const indice = Math.floor(t / CICLO) % MENSAJES.length;
	const anterior = (indice - 1 + MENSAJES.length) % MENSAJES.length;
	const local = t % CICLO;
	const suave = {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'} as const;
	const entra = interpolate(local, [0, CAMBIO], [0, 1], suave);
	const sale = interpolate(local, [0, CAMBIO], [1, 0], suave);

	// Destello: cruza el cuadro entero dentro del bucle, así que en el
	// fotograma 0 y en el último está fuera y no se ve el salto.
	const destello = interpolate(progreso, [0, 1], [-900, width + 900]);

	return (
		<AbsoluteFill style={{background: PALETA.sand}}>
			{/* Mosaico girado, más grande que el cuadro para tapar las esquinas */}
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: ANCHO_RIG,
						height: FILAS * PASO,
						position: 'relative',
						transform: 'rotate(-7deg) scale(1.06)',
					}}
				>
					{Array.from({length: FILAS}, (_, f) => (
						<Fila key={f} fila={f} progreso={progreso} />
					))}
				</div>
			</AbsoluteFill>

			{/* Destello que barre el mosaico */}
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<div
					style={{
						position: 'absolute',
						top: -200,
						left: destello,
						width: 520,
						height: height + 400,
						transform: 'rotate(14deg)',
						background:
							'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.34) 50%, rgba(255,255,255,0) 100%)',
					}}
				/>
			</AbsoluteFill>

			{/* Viñeta: los platos se van fundiendo en el fondo por los bordes */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(120% 92% at 50% 50%, rgba(246,243,238,0) 38%, rgba(246,243,238,.55) 68%, ${PALETA.sand} 100%)`,
				}}
			/>

			{/* Tarjeta */}
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						width: 1080,
						padding: '58px 70px 64px',
						borderRadius: 40,
						background: PALETA.cream,
						boxShadow: '0 44px 110px rgba(28,28,28,.20)',
					}}
				>
					{/* Marca */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 16,
							marginBottom: 34,
						}}
					>
						<Img
							src={staticFile('marca/isotipo.png')}
							style={{width: 52, height: 52, objectFit: 'contain'}}
						/>
						<span
							style={{
								fontFamily: 'DM Sans',
								fontWeight: 700,
								fontSize: 23,
								letterSpacing: 2.6,
								textTransform: 'uppercase',
								color: PALETA.oro,
							}}
						>
							Menús semanales · Nutricionista.io
						</span>
					</div>

					{/* Los mensajes se relevan en un alto fijo para que la tarjeta
					    no dé saltos al cambiar de texto. */}
					<div style={{position: 'relative', height: 232}}>
						<Texto
							mensaje={MENSAJES[anterior]}
							opacidad={sale}
							y={interpolate(local, [0, CAMBIO], [0, -34], suave)}
						/>
						<Texto
							mensaje={MENSAJES[indice]}
							opacidad={entra}
							y={interpolate(local, [0, CAMBIO], [34, 0], suave)}
						/>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
