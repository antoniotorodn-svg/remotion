import React from 'react';
import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {BookPromo} from './BookPromo';
import {MenusPromo} from './MenusPromo';
import {BOOKS, totalDuration} from './books';

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
			{BOOKS.map((book) => (
				<Composition
					key={book.slug}
					id={book.compositionId}
					component={BookPromo}
					durationInFrames={totalDuration(book)}
					fps={30}
					width={1080}
					height={1080}
					defaultProps={{book}}
				/>
			))}
			{/* Mosaico de platos de /menus/. 16 s en bucle: la duración tiene que
			    seguir siendo múltiplo de 120 (los cuatro mensajes de la tarjeta). */}
			<Composition
				id="MenusPromo"
				component={MenusPromo}
				durationInFrames={480}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{conTarjeta: true}}
			/>
			{/* Solo el mosaico, sin la tarjeta: es la cabecera del banner de los
			    menús en la newsletter, donde el texto lo pone el propio correo.
			    Se saca como imagen fija, no como vídeo. */}
			<Composition
				id="MenusTira"
				component={MenusPromo}
				durationInFrames={480}
				fps={30}
				width={1120}
				height={420}
				defaultProps={{conTarjeta: false}}
			/>
		</>
	);
};
