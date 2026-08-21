import React from 'react';
import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {BookPromo} from './BookPromo';
import {BOOKS, DOSIERES, totalDuration} from './books';

// Fuentes reales de los libros (mismas que la maquetación de los PDFs)
loadFont({family: 'Spectral', url: staticFile('fonts/Spectral-ExtraBold.ttf'), weight: '800'});
loadFont({family: 'Spectral', url: staticFile('fonts/Spectral-Regular.ttf'), weight: '400'});
loadFont({
	family: 'Spectral',
	url: staticFile('fonts/Spectral-Italic.ttf'),
	weight: '400',
	style: 'italic',
});
loadFont({family: 'DM Sans', url: staticFile('fonts/DMSans-400.ttf'), weight: '400'});
loadFont({family: 'DM Sans', url: staticFile('fonts/DMSans-700.ttf'), weight: '700'});

export const RemotionRoot: React.FC = () => {
	return (
		<>
			{/*
				Libros y dosieres comparten composición: el vídeo es el mismo
				—portada, páginas pasando y cierre— y solo cambia qué pide el
				cierre. Los libros van cuadrados; los dosieres, a 4:5, que es
				lo que más ocupa en el feed de Instagram.
			*/}
			{[...BOOKS, ...DOSIERES].map((book) => (
				<Composition
					key={book.compositionId}
					id={book.compositionId}
					component={BookPromo}
					durationInFrames={totalDuration(book)}
					fps={30}
					width={1080}
					height={book.alto ?? 1080}
					defaultProps={{book}}
				/>
			))}
		</>
	);
};
