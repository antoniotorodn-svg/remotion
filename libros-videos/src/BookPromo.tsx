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
import {Book, COVER_FLIP, INTRO, LAST_DWELL, OUTRO, PER_PAGE, totalDuration} from './books';

// Paleta de la colección (idéntica a las portadas y a la web)
const SAND = '#F6F3EE';
const INK = '#141414';
const BANDA = '#FEC902';
const TEXT_LIGHT = '#6B6B6B';

const PAGE_H = 760;
const PAGE_RATIO = 0.7048; // A5 de los PDFs web
const COVER_RATIO = 0.625; // portada ebook 1600×2560

const FLIP_DUR = 10;
const DWELL = 4;

const pageSrc = (book: Book, i: number) =>
	staticFile(
		`${book.carpeta ?? 'books'}/${book.slug}/page-${String(i + 1).padStart(2, '0')}.${book.ext ?? 'jpg'}`,
	);

const coverSrc = (book: Book) =>
	staticFile(`${book.carpeta ?? 'books'}/${book.slug}/cover.${book.ext ?? 'jpg'}`);

export const BookPromo: React.FC<{book: Book}> = ({book}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const total = totalDuration(book);
	const outroStart = total - OUTRO;

	const flipPhaseStart = INTRO; // la portada gira primero
	const coverFlipStart = INTRO;
	const pagesStart = INTRO + COVER_FLIP;

	// Entrada de la portada
	const enter = spring({frame, fps, config: {damping: 16, mass: 0.9}, durationInFrames: 34});

	// Giro de la portada (se "abre" el libro)
	const coverRot = interpolate(frame, [coverFlipStart, coverFlipStart + COVER_FLIP], [0, -115], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.55, 0, 0.4, 1),
	});

	// Transición al cierre
	const outroT = interpolate(frame, [outroStart, outroStart + 22], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 0.61, 0.36, 1),
	});

	const coverW = Math.round(PAGE_H * COVER_RATIO);
	const pageW = Math.round(PAGE_H * PAGE_RATIO);

	return (
		<AbsoluteFill style={{backgroundColor: SAND, fontFamily: 'DM Sans, sans-serif'}}>
			{/* ===== Libro (portada + páginas) ===== */}
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					opacity: 1 - outroT,
					scale: String(1 - outroT * 0.06),
				}}
			>
				{/* Eyebrow superior */}
				<div
					style={{
						position: 'absolute',
						top: 84,
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

				{/* Pie: páginas y formatos */}
				<div
					style={{
						position: 'absolute',
						bottom: 84,
						left: 0,
						right: 0,
						textAlign: 'center',
						fontSize: 27,
						color: TEXT_LIGHT,
						opacity: interpolate(frame, [pagesStart, pagesStart + 16], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					{book.paperPages} páginas · eBook y papel
				</div>

				{/* Escenario con perspectiva */}
				<div
					style={{
						position: 'relative',
						width: pageW,
						height: PAGE_H,
						perspective: 2200,
						scale: String(0.9 + enter * 0.1),
						opacity: enter,
					}}
				>
					{/* Sombra bajo el libro */}
					<div
						style={{
							position: 'absolute',
							left: '4%',
							right: '4%',
							bottom: -34,
							height: 48,
							borderRadius: '50%',
							background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.22), rgba(0,0,0,0) 70%)',
						}}
					/>

					{/* Páginas interiores, apiladas. La de índice i gira en su turno. */}
					{Array.from({length: book.pages}).map((_, i) => {
						const isLast = i === book.pages - 1;
						const myFlipStart = pagesStart + i * PER_PAGE + DWELL;
						const rot = isLast
							? 0
							: interpolate(frame, [myFlipStart, myFlipStart + FLIP_DUR], [0, -115], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
									easing: Easing.bezier(0.55, 0, 0.4, 1),
								});
						// No renderizar páginas ya giradas ni las muy lejanas (rendimiento)
						if (rot <= -114) return null;
						const turning = rot < 0 ? Math.min(1, -rot / 115) : 0;
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									inset: 0,
									zIndex: book.pages - i,
									transformOrigin: 'left center',
									transformStyle: 'preserve-3d',
									backfaceVisibility: 'hidden',
									rotate: `y ${rot}deg`,
									background: '#fff',
									boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
								}}
							>
								<Img
									src={pageSrc(book, i)}
									style={{width: '100%', height: '100%', objectFit: 'cover'}}
								/>
								{/* La página se oscurece un poco al girar */}
								<div
									style={{
										position: 'absolute',
										inset: 0,
										background: 'linear-gradient(90deg, rgba(0,0,0,0.16), rgba(0,0,0,0))',
										opacity: turning,
									}}
								/>
							</div>
						);
					})}

					{/* Portada, encima de todo hasta que gira */}
					{coverRot > -114 && (
						<div
							style={{
								position: 'absolute',
								top: 0,
								bottom: 0,
								left: '50%',
								width: coverW,
								marginLeft: -coverW / 2,
								zIndex: book.pages + 5,
								transformOrigin: 'left center',
								backfaceVisibility: 'hidden',
								rotate: `y ${coverRot}deg`,
								boxShadow: '0 18px 50px rgba(0,0,0,0.20)',
								background: '#fff',
							}}
						>
							<Img
								src={coverSrc(book)}
								style={{width: '100%', height: '100%', objectFit: 'cover'}}
							/>
						</div>
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
						src={coverSrc(book)}
						style={{
							height: 560,
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
							{book.cta ? 'DESCÁRGALO GRATIS' : 'YA DISPONIBLE'}
						</div>
						<div
							style={{
								fontFamily: 'Spectral, serif',
								fontWeight: 800,
								fontSize: 74,
								lineHeight: 1.06,
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
							{book.cta ? book.cta.palabra : 'Cómpralo en Amazon'}
						</div>
						<div style={{marginTop: 34, fontSize: 24, color: TEXT_LIGHT}}>
							{book.cta ? book.cta.pie : 'nutricionista.io/libros'}
						</div>
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
