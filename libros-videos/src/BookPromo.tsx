import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	Book,
	FLIP_DUR,
	FLIP_DWELL,
	INTRO,
	LAST_DWELL,
	OPEN,
	OUTRO,
	PER_FLIP,
	flipsOf,
	totalDuration,
} from './books';

// Paleta de la colección (idéntica a las portadas y a la web)
const SAND = '#F6F3EE';
const INK = '#141414';
const BANDA = '#FEC902';
const TEXT_LIGHT = '#6B6B6B';
const PAPER_BACK = '#FBFAF7';

const PAGE_H = 640;
const PAGE_RATIO = 0.7048; // A5
const PAGE_W = Math.round(PAGE_H * PAGE_RATIO); // 451

// Nº de tiras verticales de la hoja: más tiras = curva más suave
const NS = 12;

const pageSrc = (slug: string, i: number) =>
	staticFile(`books/${slug}/page-${String(i + 1).padStart(2, '0')}.jpg`);

/**
 * Una hoja del libro que gira sobre el lomo doblándose como papel.
 * Se divide en NS tiras verticales anidadas: la primera gira `rot` y cada
 * una de las siguientes añade `curl / NS`, lo que curva la superficie.
 * Cada tira tiene anverso (front) y reverso (back, ya girado 180º).
 */
const Leaf: React.FC<{
	front: string;
	back: string | null;
	rot: number; // 0 → -180
	curl: number; // curvatura total en grados (+ = la hoja se comba)
	shade: number; // 0..1 sombreado del doblez
}> = ({front, back, rot, curl, shade}) => {
	const stripW = PAGE_W / NS;
	let child: React.ReactNode = null;
	for (let j = NS - 1; j >= 0; j--) {
		child = (
			<div
				style={{
					position: 'absolute',
					left: j === 0 ? 0 : stripW,
					top: 0,
					width: stripW + 0.7,
					height: PAGE_H,
					transformOrigin: 'left center',
					transformStyle: 'preserve-3d',
					rotate: `y ${j === 0 ? rot : curl / NS}deg`,
				}}
			>
				{/* anverso */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backfaceVisibility: 'hidden',
						backgroundColor: '#fff',
						backgroundImage: `url(${front})`,
						backgroundSize: `${PAGE_W}px ${PAGE_H}px`,
						backgroundPosition: `${-j * stripW}px 0px`,
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundColor: '#000',
							opacity: shade * 0.16 * (j / NS),
						}}
					/>
				</div>
				{/* reverso */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backfaceVisibility: 'hidden',
						rotate: 'y 180deg',
						backgroundColor: PAPER_BACK,
						backgroundImage: back ? `url(${back})` : undefined,
						backgroundSize: `${PAGE_W}px ${PAGE_H}px`,
						backgroundPosition: `${-(NS - 1 - j) * stripW}px 0px`,
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundColor: '#000',
							opacity: shade * 0.1 * ((NS - j) / NS),
						}}
					/>
				</div>
				{child}
			</div>
		);
	}
	return (
		<div
			style={{
				position: 'absolute',
				left: PAGE_W,
				top: 0,
				width: PAGE_W,
				height: PAGE_H,
				transformStyle: 'preserve-3d',
				zIndex: 30,
			}}
		>
			{child}
		</div>
	);
};

// Progreso 0..1 → rotación con látigo de papel: la hoja se comba al
// levantarse (curl +) y se estira al caer (curl -).
const flipMotion = (p: number) => {
	const eased = Easing.bezier(0.42, 0, 0.3, 1)(p);
	const rot = -180 * eased;
	const curl = 34 * Math.sin(p * Math.PI) * Math.cos(p * Math.PI) * 2;
	const shade = Math.sin(p * Math.PI);
	return {rot, curl, shade};
};

export const BookPromo: React.FC<{book: Book}> = ({book}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const total = totalDuration(book);
	const outroStart = total - OUTRO;
	const flips = flipsOf(book);
	const flipsStart = INTRO + OPEN;

	const enter = spring({frame, fps, config: {damping: 16, mass: 0.9}, durationInFrames: 34});

	// Apertura de la cubierta
	const openP = interpolate(frame, [INTRO, INTRO + OPEN], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// ¿Qué pase de hoja está activo y cuántos se han completado?
	const flipFloat = (frame - flipsStart) / PER_FLIP;
	const active = frame >= flipsStart && flipFloat < flips ? Math.floor(flipFloat) : -1;
	const activeP =
		active >= 0
			? interpolate(frame - flipsStart - active * PER_FLIP, [FLIP_DWELL, FLIP_DWELL + FLIP_DUR], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})
			: 0;
	const completed =
		frame < flipsStart ? 0 : Math.min(flips, Math.floor(flipFloat) + (activeP >= 1 ? 1 : 0));

	// Imágenes de cada plano
	const imgs = (i: number) => (i < book.pages ? pageSrc(book.slug, i) : null);
	const flipping = active >= 0 && activeP > 0 && activeP < 1;
	const s = flipping ? active : completed;
	const leftImg = s === 0 ? null : imgs(2 * s - 1);
	const rightImg = flipping ? imgs(2 * s + 2) : imgs(2 * s);

	// El libro cerrado está centrado; al abrirse, el lomo viaja al centro.
	const bookShift = interpolate(openP, [0, 1], [-PAGE_W / 2, 0], {
		easing: Easing.bezier(0.35, 0, 0.3, 1),
	});

	// Transición al cierre
	const outroT = interpolate(frame, [outroStart, outroStart + 22], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 0.61, 0.36, 1),
	});

	const cover = flipMotion(openP);
	const leaf = flipMotion(activeP);
	const coverOpen = openP > 0;
	const leftRevealed = openP > 0.52;

	return (
		<AbsoluteFill style={{backgroundColor: SAND, fontFamily: 'DM Sans, sans-serif'}}>
			{/* ===== Libro abierto ===== */}
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					opacity: 1 - outroT,
					scale: String(1 - outroT * 0.06),
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: 74,
						left: 0,
						right: 0,
						textAlign: 'center',
						fontWeight: 700,
						fontSize: 26,
						letterSpacing: 8,
						color: INK,
						opacity: interpolate(frame, [8, 26], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					NUTRICIONISTA.IO&nbsp;&nbsp;·&nbsp;&nbsp;NUEVO
				</div>

				<div
					style={{
						position: 'absolute',
						bottom: 74,
						left: 0,
						right: 0,
						textAlign: 'center',
						fontSize: 27,
						color: TEXT_LIGHT,
						opacity: interpolate(frame, [flipsStart, flipsStart + 16], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					{book.paperPages} páginas · eBook y papel
				</div>

				{/* Escenario 3D */}
				<div
					style={{
						position: 'relative',
						width: PAGE_W * 2,
						height: PAGE_H,
						perspective: 2600,
						perspectiveOrigin: '50% 42%',
						translate: `${bookShift}px 0px`,
						scale: String(0.92 + enter * 0.08),
						opacity: enter,
					}}
				>
					{/* Sombra bajo el libro */}
					<div
						style={{
							position: 'absolute',
							left: coverOpen ? '2%' : '46%',
							right: '2%',
							bottom: -30,
							height: 44,
							borderRadius: '50%',
							background:
								'radial-gradient(ellipse at center, rgba(0,0,0,0.20), rgba(0,0,0,0) 70%)',
							transition: 'none',
						}}
					/>

					{/* Página izquierda (reverso de la última hoja pasada) */}
					{leftRevealed && (
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								width: PAGE_W,
								height: PAGE_H,
								background: PAPER_BACK,
								backgroundImage: leftImg ? `url(${leftImg})` : undefined,
								backgroundSize: `${PAGE_W}px ${PAGE_H}px`,
								boxShadow: '0 3px 14px rgba(0,0,0,0.12)',
							}}
						>
							{/* sombra del lomo */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background:
										'linear-gradient(270deg, rgba(0,0,0,0.14), rgba(0,0,0,0) 22%)',
								}}
							/>
							{/* sombra que proyecta la hoja al caer */}
							{flipping && leaf.rot < -90 && (
								<div
									style={{
										position: 'absolute',
										inset: 0,
										background:
											'linear-gradient(270deg, rgba(0,0,0,0.22), rgba(0,0,0,0) 70%)',
										opacity: leaf.shade,
									}}
								/>
							)}
						</div>
					)}

					{/* Canto de páginas apiladas, lado derecho */}
					{coverOpen && (
						<div
							style={{
								position: 'absolute',
								left: PAGE_W * 2,
								top: 5,
								width: 7,
								height: PAGE_H - 10,
								background:
									'repeating-linear-gradient(90deg, #fff 0px, #fff 1px, #d8d3ca 1.6px, #fff 2.4px)',
								borderRadius: '0 3px 3px 0',
							}}
						/>
					)}

					{/* Página derecha (debajo de la hoja que gira) */}
					{coverOpen && (
						<div
							style={{
								position: 'absolute',
								left: PAGE_W,
								top: 0,
								width: PAGE_W,
								height: PAGE_H,
								background: '#fff',
								backgroundImage: rightImg ? `url(${rightImg})` : undefined,
								backgroundSize: `${PAGE_W}px ${PAGE_H}px`,
								boxShadow: '0 3px 14px rgba(0,0,0,0.12)',
							}}
						>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background:
										'linear-gradient(90deg, rgba(0,0,0,0.13), rgba(0,0,0,0) 20%)',
								}}
							/>
							{/* sombra de la hoja levantándose */}
							{flipping && leaf.rot >= -90 && (
								<div
									style={{
										position: 'absolute',
										inset: 0,
										background:
											'linear-gradient(90deg, rgba(0,0,0,0.20), rgba(0,0,0,0) 65%)',
										opacity: leaf.shade,
									}}
								/>
							)}
						</div>
					)}

					{/* Cubierta abriéndose */}
					{openP < 1 && (
						<Leaf
							front={staticFile(`books/${book.slug}/cover.jpg`)}
							back={null}
							rot={cover.rot}
							curl={cover.curl * 0.55}
							shade={cover.shade}
						/>
					)}

					{/* Hoja girando */}
					{flipping && (
						<Leaf
							front={imgs(2 * s)!}
							back={imgs(2 * s + 1)}
							rot={leaf.rot}
							curl={leaf.curl}
							shade={leaf.shade}
						/>
					)}

					{/* Lomo */}
					{coverOpen && (
						<div
							style={{
								position: 'absolute',
								left: PAGE_W - 1,
								top: 0,
								width: 2,
								height: PAGE_H,
								background: 'rgba(0,0,0,0.28)',
								zIndex: 40,
							}}
						/>
					)}
				</div>
			</AbsoluteFill>

			{/* ===== Cierre con CTA ===== */}
			{frame >= outroStart && (
				<AbsoluteFill
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 70,
						padding: '0 90px',
						opacity: outroT,
					}}
				>
					<Img
						src={staticFile(`books/${book.slug}/cover.jpg`)}
						style={{
							height: 600,
							boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
							translate: `0px ${(1 - outroT) * 30}px`,
						}}
					/>
					<div style={{maxWidth: 520, translate: `0px ${(1 - outroT) * 40}px`}}>
						<div
							style={{
								fontWeight: 700,
								fontSize: 22,
								letterSpacing: 6,
								color: TEXT_LIGHT,
								marginBottom: 26,
							}}
						>
							YA DISPONIBLE
						</div>
						<div
							style={{
								fontFamily: 'Spectral, serif',
								fontWeight: 800,
								fontSize: 72,
								lineHeight: 1.08,
								color: INK,
								marginBottom: 26,
							}}
						>
							{book.titleLines.map((line) => (
								<div key={line}>
									{line === book.accent ? (
										<span style={{background: BANDA, padding: '0 10px', marginLeft: -10}}>
											{line}
										</span>
									) : (
										line
									)}
								</div>
							))}
						</div>
						<div
							style={{
								fontFamily: 'Spectral, serif',
								fontStyle: 'italic',
								fontSize: 29,
								lineHeight: 1.4,
								color: TEXT_LIGHT,
								marginBottom: 40,
							}}
						>
							{book.claim}
						</div>
						<div
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								background: INK,
								color: '#fff',
								fontWeight: 700,
								fontSize: 30,
								padding: '24px 52px',
								borderRadius: 999,
								scale: String(
									spring({
										frame: frame - outroStart - 14,
										fps,
										config: {damping: 13},
										durationInFrames: 30,
									}),
								),
							}}
						>
							Cómpralo en Amazon
						</div>
						<div style={{marginTop: 34, fontSize: 24, color: TEXT_LIGHT}}>
							nutricionista.io/libros
						</div>
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
