import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	type CalculateMetadataFunction,
} from 'remotion';
import type {PropsReel, Recurso} from './tipos';
import {aReel, duracionMs, gruposDeSubtitulos, normal, palabrasEnReel} from './tiempo';

// Reel hablado al estilo de @diegoabreuuu_. Las reglas del brief:
//   · 9:16, plano medio fijo; la variedad no la da la cámara sino lo que sale
//     en la MITAD DE ABAJO (miniatura con la cifra, captura, pizarra con la
//     lista de pasos). Cuando no hay recurso, la cara ocupa toda la pantalla.
//   · Subtítulos grandes de 2-3 palabras, blancos, con la clave en amarillo.
//   · Gancho con cifra arriba los primeros segundos.
//   · Cierre siempre igual: cuadro amarillo «Comenta X y te envío…».
//   · Cortes secos y jump cuts que quitan los silencios (`tramos`).

const ANCHO = 1080;
const ALTO = 1920;
const MITAD = ALTO / 2;

const C = {
	amarillo: '#F2B705',
	tinta: '#141414',
	blanco: '#ffffff',
	pizarra: '#1f2421',
	tiza: '#f3f1ea',
};

const FUENTE = '"DM Sans", system-ui, sans-serif';
const SOMBRA = '0 3px 0 rgba(0,0,0,.55), 0 0 18px rgba(0,0,0,.45)';

const src = (s: string) => (/^https?:\/\//.test(s) ? s : staticFile(s));

export const calcularReel: CalculateMetadataFunction<PropsReel> = ({props}) => {
	const fps = 30;
	const ms = props.tramos.length ? duracionMs(props.tramos) : 30000;
	return {durationInFrames: Math.max(1, Math.round((ms / 1000) * fps)), fps, width: ANCHO, height: ALTO};
};

export const ReelHablado: React.FC<PropsReel> = (props) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tramos = props.tramos.length ? props.tramos : [[0, 30000] as [number, number]];
	const enReel = (s: number) => aReel(s * 1000, tramos) / 1000; // segundos del original → reel
	const t = frame / fps;

	const recursos = props.recursos.map((r) => ({...r, ini: enReel(r.desde), fin: enReel(r.hasta)}));
	const activo = recursos.find((r) => t >= r.ini && t < r.fin) || null;

	// Partida (cara arriba + recurso) o cara a pantalla completa, con un paso
	// de 6 fotogramas entre una y otra.
	const partida = (() => {
		let v = 0;
		for (const r of recursos) {
			const a = r.ini * fps;
			const b = r.fin * fps;
			const entra = interpolate(frame, [a - 6, a], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
			const sale = interpolate(frame, [b - 6, b], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
			v = Math.max(v, Math.min(entra, sale));
		}
		return v;
	})();
	const altoCara = interpolate(partida, [0, 1], [ALTO, MITAD], {easing: Easing.inOut(Easing.cubic)});

	const palabras = palabrasEnReel(props.subtitulos, tramos);
	const grupos = gruposDeSubtitulos(palabras);
	const claves = new Set(props.claves.map(normal));

	return (
		<AbsoluteFill style={{backgroundColor: C.tinta, fontFamily: FUENTE}}>
			{/* La cara */}
			<div style={{position: 'absolute', left: 0, top: 0, width: ANCHO, height: altoCara, overflow: 'hidden'}}>
				<Cara props={props} tramos={tramos} />
			</div>

			{/* El recurso de abajo */}
			{recursos.map((r, k) => (
				<Sequence key={k} from={Math.round(r.ini * fps)} durationInFrames={Math.max(1, Math.round((r.fin - r.ini) * fps))} layout="none">
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: altoCara,
							width: ANCHO,
							height: ALTO - altoCara,
							overflow: 'hidden',
							background: '#0d0d0d',
						}}
					>
						<RecursoAbajo r={r} enReel={enReel} />
					</div>
				</Sequence>
			))}

			{/* Subtítulos, sobre la parte baja de la cara */}
			{grupos.map((g, k) => {
				const ini = g[0].desdeMs / 1000;
				const fin = (grupos[k + 1]?.[0].desdeMs ?? g[g.length - 1].hastaMs + 400) / 1000;
				if (t < ini || t >= fin) return null;
				const pop = spring({frame: frame - Math.round(ini * fps), fps, config: {damping: 14, stiffness: 220}, durationInFrames: 8});
				const y = activo ? MITAD - 210 : ALTO * 0.66;
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: 60,
							right: 60,
							top: y,
							textAlign: 'center',
							fontSize: 84,
							fontWeight: 700,
							lineHeight: 1.05,
							letterSpacing: -1,
							color: C.blanco,
							textShadow: SOMBRA,
							transform: `scale(${0.82 + 0.18 * pop})`,
						}}
					>
						{g.map((p, j) => (
							<span key={j} style={{color: claves.has(normal(p.texto)) ? C.amarillo : C.blanco}}>
								{p.texto.replace(/[,;:]$/, '')}
								{j < g.length - 1 ? ' ' : ''}
							</span>
						))}
					</div>
				);
			})}

			{props.gancho && t < enReel(props.gancho.hasta) && <Gancho {...props.gancho} />}
			{props.cta && t >= enReel(props.cta.desde) && (
				<Sequence from={Math.round(enReel(props.cta.desde) * fps)} layout="none">
					<Cta {...props.cta} />
				</Sequence>
			)}
		</AbsoluteFill>
	);
};

/** Tu vídeo, ya con los silencios fuera: un trozo detrás de otro. */
const Cara: React.FC<{props: PropsReel; tramos: Array<[number, number]>}> = ({props, tramos}) => {
	const {fps} = useVideoConfig();
	const y = props.encuadreY ?? 35;
	if (!props.video) return <CaraDeMuestra />;
	let desde = 0;
	return (
		<>
			{tramos.map(([a, b], k) => {
				const dur = Math.max(1, Math.round(((b - a) / 1000) * fps));
				const el = (
					<Sequence key={k} from={desde} durationInFrames={dur}>
						<OffthreadVideo
							src={src(props.video!)}
							trimBefore={Math.round((a / 1000) * fps)}
							trimAfter={Math.round((b / 1000) * fps)}
							style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${y}%`}}
						/>
					</Sequence>
				);
				desde += dur;
				return el;
			})}
		</>
	);
};

/** Para la demo sin vídeo: un fondo que marca dónde va la cara. */
const CaraDeMuestra: React.FC = () => (
	<AbsoluteFill
		style={{
			background: 'radial-gradient(ellipse at 50% 35%, #6d6a63 0%, #3a3833 45%, #1b1a18 100%)',
			alignItems: 'center',
			justifyContent: 'flex-start',
			paddingTop: 260,
		}}
	>
		<div style={{width: 340, height: 420, borderRadius: '50% 50% 46% 46%', background: 'rgba(255,255,255,.10)'}} />
		<div style={{width: 640, height: 600, marginTop: 30, borderRadius: '300px 300px 0 0', background: 'rgba(255,255,255,.07)'}} />
	</AbsoluteFill>
);

const RecursoAbajo: React.FC<{r: Recurso; enReel: (s: number) => number}> = ({r, enReel}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const entra = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
	const estilo: React.CSSProperties = {position: 'absolute', inset: 0, opacity: entra};

	if (r.tipo === 'imagen') {
		return (
			<div style={{...estilo, padding: r.ajuste === 'contain' ? 50 : 0, display: 'flex', flexDirection: 'column', gap: 24}}>
				<Img
					src={src(r.src)}
					style={{
						flex: 1,
						minHeight: 0,
						width: '100%',
						objectFit: r.ajuste ?? 'cover',
						borderRadius: r.ajuste === 'contain' ? 24 : 0,
					}}
				/>
				{r.pie && (
					<div style={{color: C.blanco, fontSize: 40, fontWeight: 700, textAlign: 'center', paddingBottom: 20}}>{r.pie}</div>
				)}
			</div>
		);
	}

	if (r.tipo === 'video') {
		return (
			<div style={estilo}>
				<OffthreadVideo src={src(r.src)} muted={!r.conAudio} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</div>
		);
	}

	if (r.tipo === 'cifra') {
		return (
			<div
				style={{
					...estilo,
					background: 'linear-gradient(160deg, #262626 0%, #0b0b0b 100%)',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					padding: '0 80px',
					gap: 30,
				}}
			>
				{r.etiqueta && (
					<div style={{color: C.amarillo, fontSize: 34, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase'}}>{r.etiqueta}</div>
				)}
				<div
					style={{
						color: C.amarillo,
						fontSize: 190,
						fontWeight: 700,
						lineHeight: 0.95,
						letterSpacing: -6,
						transform: `scale(${0.9 + 0.1 * spring({frame, fps, config: {damping: 12}})})`,
						transformOrigin: 'left center',
					}}
				>
					{r.cifra}
				</div>
				<div style={{color: C.blanco, fontSize: 64, fontWeight: 700, lineHeight: 1.05, textTransform: 'uppercase'}}>{r.texto}</div>
			</div>
		);
	}

	// Pizarra: los pasos van apareciendo (y tachándose) mientras hablas.
	const inicio = enReel(r.desde);
	return (
		<div
			style={{
				...estilo,
				background: `radial-gradient(ellipse at 30% 20%, #2b322d 0%, ${C.pizarra} 60%, #151917 100%)`,
				padding: '70px 80px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: 34,
				color: C.tiza,
			}}
		>
			{r.titulo && <div style={{fontSize: 52, fontWeight: 700, opacity: 0.85}}>{r.titulo}</div>}
			{r.puntos.map((p, k) => {
				const aparece = Math.round((enReel(p.aparece) - inicio) * fps);
				const v = spring({frame: frame - aparece, fps, config: {damping: 15}, durationInFrames: 10});
				const tacha = p.tachado == null ? 0 : interpolate(frame, [Math.round((enReel(p.tachado) - inicio) * fps), Math.round((enReel(p.tachado) - inicio) * fps) + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				if (frame < aparece) return null;
				return (
					<div key={k} style={{display: 'flex', alignItems: 'baseline', gap: 26, opacity: v, transform: `translateX(${(1 - v) * -30}px)`}}>
						<span style={{fontSize: 64, fontWeight: 700, color: C.amarillo, minWidth: 50}}>{k + 1}</span>
						<span style={{position: 'relative', fontSize: 56, fontWeight: 700, lineHeight: 1.12, opacity: tacha ? 1 - 0.45 * tacha : 1}}>
							{p.texto}
							{tacha > 0 && (
								<span style={{position: 'absolute', left: 0, top: '55%', height: 6, width: `${tacha * 100}%`, background: C.tiza, borderRadius: 3}} />
							)}
						</span>
					</div>
				);
			})}
		</div>
	);
};

const Gancho: React.FC<{texto: string; resaltado?: string}> = ({texto, resaltado}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const v = spring({frame, fps, config: {damping: 14}});
	const partes = resaltado && texto.includes(resaltado) ? texto.split(resaltado) : [texto];
	return (
		<div
			style={{
				position: 'absolute',
				top: 150,
				left: 60,
				right: 60,
				padding: '28px 36px',
				borderRadius: 26,
				background: 'rgba(10,10,10,.78)',
				color: C.blanco,
				fontSize: 62,
				fontWeight: 700,
				lineHeight: 1.12,
				textAlign: 'center',
				transform: `translateY(${(1 - v) * -40}px)`,
				opacity: v,
			}}
		>
			{partes[0]}
			{partes.length > 1 && <span style={{color: C.amarillo}}>{resaltado}</span>}
			{partes.length > 1 && partes.slice(1).join(resaltado)}
		</div>
	);
};

const Cta: React.FC<{palabra: string; texto: string}> = ({palabra, texto}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const v = spring({frame, fps, config: {damping: 12, stiffness: 160}});
	return (
		<div
			style={{
				position: 'absolute',
				left: 70,
				right: 70,
				bottom: 230,
				padding: '34px 40px',
				borderRadius: 28,
				background: C.amarillo,
				color: C.tinta,
				textAlign: 'center',
				boxShadow: '0 18px 50px rgba(0,0,0,.45)',
				transform: `translateY(${(1 - v) * 120}px) scale(${0.92 + 0.08 * v})`,
				opacity: Math.min(1, v * 1.4),
			}}
		>
			<div style={{fontSize: 58, fontWeight: 700, lineHeight: 1.1}}>
				Comenta <span style={{background: C.tinta, color: C.amarillo, padding: '2px 18px', borderRadius: 12}}>{palabra}</span>
			</div>
			<div style={{fontSize: 42, fontWeight: 700, marginTop: 12, lineHeight: 1.15}}>y te envío {texto}</div>
		</div>
	);
};
