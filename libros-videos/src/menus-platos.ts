// Los platos que salen en el mosaico de MenusPromo.
//
// Son recetas reales de los menús, elegidas por color y variedad: hay verde,
// rojo, naranja y crema repartidos para que el mosaico no se apelmace en un
// solo tono. El id es el `recipe_id` de la tabla `recipe_images` de la app, que
// es también el nombre del fichero en el bucket público `recipe-images`.
//
// Las fotos NO se descargan desde el vídeo: `scripts/traer-fotos-menus.sh` las
// baja una vez, las recorta a 520×520 y las deja en `public/menus/<id>.jpg`.

export const PLATOS = [
	'bowl-boniato-verduras-huevos-plancha',
	'ensalada-sandia-feta',
	'salmon-cherrys-feta',
	'tacos-pollo-aguacate-cebolla-morada',
	'crema-fria-remolacha-yogur',
	'wok-verduras-salmon',
	'ensalada-tomate-burrata-nectarina',
	'pad-thai-pollo',
	'huevos-rotos-jamon-airfryer',
	'crepes-avena-chocolate-frutos-rojos',
	'bowl-garbanzos-boniato',
	'ensalada-burrata-cherry-aguacate',
	'noodles-langostinos-verduras',
	'garbanzos-especiados-cherrys-huevos-plancha',
	'parrillada-verduras-burrata',
	'pudding-chia-mango',
	'ensalada-fresas-asadas',
	'wok-ternera-verduras',
	'lasana-calabacin',
	'crema-mango-zanahoria',
	'burrito-aguacate-salmon',
	'tortita-arandanos',
	'ensalada-lentejas-cerezas-feta',
	'espaguetis-calabacin-langostinos',
	'pollo-curry-verduras-arroz',
	'bruschetta-burrata-cherrys',
	'ceviche-langostinos',
	'gazpacho-cerezas',
	'fajitas-pollo-guacamole',
	'tortilla-boniato',
	'ensalada-aguacate-mango',
	'quinoa-setas-gambas',
	'salmon-marinado-arroz',
	'berenjenas-gratinadas-mediterraneo',
	'curry-lentejas-verduras',
	'burrata-granada',
	'tallarines-calabacin-cherry-gambas',
	'brochetas-pulpo-gallega',
	'ensalada-griega-sandia',
	'batata-rellena',
	'wok-judias-gambones-cherrys',
	'pizza-queso-cottage',
	'crema-langostinos-zanahoria',
	'ensalada-salmon-nectarina-queso',
	'ramen-expres',
	'puerros-asados-burrata-jamon',
	'pimientos-rellenos-verano',
	'avena-arroz-leche',
	'canelones-berenjena-atun-queso',
	'ensalada-pimientos-aguacate-queso-feta',
	'tacos-aguacate-huevos',
	'guiso-alubias-langostinos',
	'carpaccio-calabacin-burrata-jamon',
	'pasta-cremosa-pollo-verduras',
	'huevos-rotos-verduras-boniato',
	'milhojas-pera-gorgonzola',
	'brochetas-pollo-airfryer',
	'ensalada-pasta-salmon-ahumado-aceitunas-alcaparras',
	'garbanzos-curry',
	'revuelto-calabacin-jamon',
] as const;

// Cada fila del mosaico coge sus platos salteando la lista con un paso distinto
// (y primo con 60), así dos filas nunca enseñan la misma secuencia y ningún
// plato se repite dentro de una fila.
export function platosDeFila(fila: number, cuantos: number): string[] {
	const paso = [7, 11, 13, 17, 19][fila % 5];
	const inicio = fila * 5;
	return Array.from(
		{length: cuantos},
		(_, i) => PLATOS[(inicio + i * paso) % PLATOS.length],
	);
}
