import React from "react";

const renderDef = (p) => <div {...p}/>;

/**
 * Representa un div con atajos a propiedades de estilos comunes.
 * @param {object} props
 * @param {object} [props.style] Se espera recibir una propiedad de estilos, si no la recibe, inicializo con un objeto vacío.
 * @param {string} [props.display] Se espera recibir una propiedad de estilos, si no la recibe, inicializo con un objeto vacío.
 * @param {string} [props.direction] Por defecto la dirección del flex es fila.
 *
 * 	Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
 * @param {boolean} [props.reverse] Determina si aplica "reverse" a `direction`.
 * @param {boolean} [props.col] Abreviatura para direction="column".
 *
 * 	Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
 * @param {string} [props.gap] Atajo para establecer `column-gap` y `row-gap`
 * @param {string} [props.rowGap] Espacio de fila entre componentes hijos (`row-gap`)
 * @param {string} [props.colGap] Espacio de columna entre componentes hijos. (`column-gap`)
 * @param {string} [props.flex] Abreviatura que aplica `grow`, `shrink` y `basis`. (`flex`)
 * @param {string} [props.grow] Factor de crecimiento. (`flex-grow`)
 *
 * 	Si hay componentes hermanos con esta propiedad, el espacio restante se promedia entre ellos.
 *
 * 	Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
 * @param {string} [props.shrink] Factor de contracción. (`flex-shrink`)
 *
 * 	Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
 * @param {string} [props.basis] Tamaño inicial. (`flex-basis`)
 *
 * Posibles valores:
 * * "width": Ocupar la misma cantidad que la propiedad width.
 * * "height": Ocupar la misma cantidad que la propiedad height.
 * * "full": Ocupar la misma cantidad que la propiedad full.
 * * Cualquier otro valor: Asume unidad con medida.
 * @param {string} [props.wrap] Especifica si los elementos "hijos" son obligados a permanecer en una misma línea o pueden fluir en varias líneas.. (`flex-wrap`)
 *
 * Posibles valores:
 * * "wrap": Los elementos flex son colocados en varias líneas. El valor cross-start es equivalente a start o before según el valor de `direction`.
 * * "no": Los elementos flex son distribuidos en una sola línea, lo cual puede llevar a que se desborde el contenedor flex. El valor cross-start es equivalente a start o before según el valor de `direction`.
 * * "reverse": Actúa como wrap pero cross-start y cross-end están intercambiados.
 * 
 * 	Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
 * @param {string} [props.justify] Especifica el alineado de los componentes hijos.
 *
 * Posibles valores:
 * * "start": alineados al inicio del componente. (`flex-start`)
 * * "end": alineados al final del componente.	(`flex-end`)
 * * "center": alineados al centro del componente.
 * * "around": espaciado alrededor. (`space-around`)
 * * "between": espaciado entre componentes. (`space-between`)
 * * "evenly": espaciado equitativamente. (`space-evenly`)
 *
 * Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
 * @param {boolean} [props.block] Abreviatura para display="block".
 * @param {string} [props.width] Especifica el ancho que tendrá el componente.
 *
 * Se puede indicar "full" para ocupar el 100% del componente padre. o un tamaño específico.
 * @param {string} [props.height] Especifica el alto que tendrá el componente.
 *
 * Se puede indicar "full" para ocupar el 100% del componente padre. o un tamaño específico.
 * @param {string} [props.full] Abreviatura.
 * * Si full="width" ocupará el ancho que se especifique en la propiedad width. Si no se especifica la propiedad width, ocupa el 100% del ancho.
 * * Si full="height" ocupará el alto que se especifique en la propiedad height. Si no se especifica la propiedad height, ocupa el 100% del alto.
 * * Si full=string se puede especificar en cualquier unidad y ocupará esa medida en ancho y alto. (%, px, vh, etc.). ej: full="50px".
 * * Si full=numero, ocupará n% de ancho y alto.
 * * Si full="full" o no se especifica medida, ocupará el 100% de ancho y alto.
 * @param {function} [props.render] Componente a utilizar para renderizar. Por defecto `div`
 * @returns div
 **/
export const Grid = ({
	style = {},
	display = "flex",
	direction = "row",
	reverse = false,
	col,
	gap,
	rowGap,
	colGap,
	flex,
	grow,
	shrink,
	basis,
	justify,
	block,
	width,
	height,
	full,
	render: MyRender = renderDef,
	// Todos los componentes hijos.
	children,
	// Otras propiedades que se pasarán directamente al div.
	...otherProps
}) => {
	MyRender ??= renderDef;
	if (width) {
		if (parseInt(width) === width)
			width = `${width}%`; // Especifica unidad sin medida, significa %.
		else if (width === true || `${width}`.toLowerCase() === "full")
			width = "100%"; // Especifica ancho completo.
		// Cualquier otro caso, asume unidad con medida.
	}

	if (height) {
		if (parseInt(height) === height)
			height = `${height}%`; // Especifica unidad sin medida, significa %.
		else if (height === true || `${height}`.toLowerCase() === "full")
			height = "100%"; // Especifica tamaño completo.
		// Cualquier otro caso, asume unidad con medida.
	}

	if (full) {
		if (parseInt(full) === full)
			full = `${full}%`; // Especifica unidad sin medida, significa %.
		else if (full === true || `${full}`.toLowerCase() === "full") full = "100%"; // Especifica tamaño completo.

		switch (full) {
			case "width":
				if (width) full = width; // full mismo que el ancho.
				else full = "100%"; // No se especifica ancho, asume 100%.
				width = full;
				break;
			case "height":
				if (height) full = height; // full mismo que el alto.
				full = "100%"; // No se especifica alto, asume 100%.
				height = full;
				break;
			default: // full="full", 100% de ancho y alto.
				// Unidad y medida de alto y ancho.
				width = full;
				height = full;
				break;
		}
	}

	// Aplico ancho y alto en caso de corresponder.
	if (width) style.width = width;
	if (height) style.height = height;

	// Abreviatura para display="block".
	if (block) display = "block";

	// Aplico display en caso de corresponder.
	if (display) style.display = display;

	// Aplico expandir en caso de corresponder.
	if (flex) {
		style.flex = flex;
	} else {
		if (grow) style.flexGrow = typeof grow === "boolean" ? 1 : grow;
		if (shrink) style.flexShrink = typeof shrink === "boolean" ? 1 : shrink;
		// Aplico tamaño inicial en caso de corresponder.
		if (basis) {
			switch (basis) {
				case "width":
					basis = width; // Mismo que width.
					break;
				case "height":
					basis = height; // Mismo que height.
					break;
				case "full":
					basis = full; // Mismo que full.
					break;
				default:
					break;
			}
			style.flexBasis = typeof basis === "boolean" ? 1 : basis;
		}
	}
	
	// Abreviatura para direction="column".
	if (col) direction = "column";

	switch (direction) {
		case "row":
		case "column":
			if (reverse) reverse = "reverse";
			style.flexDirection = [direction, reverse].filter((r) => r).join("-");
			break;
		default:
			break;
	}

	if (gap) {
		rowGap = gap;
		colGap = gap;
	}
	if (rowGap) style.rowGap = rowGap;
	if (colGap) style.columnGap = colGap;
	
	// Aplico alineado en caso de corresponder.
	switch (justify) {
		case "start":
			style.justifyContent = "flex-start";
			break;
		case "end":
			style.justifyContent = "flex-end";
			break;
		case "center":
			style.justifyContent = "center";
			break;
		case "around":
			style.justifyContent = "space-around";
			break;
		case "between":
			style.justifyContent = "space-between";
			break;
		case "evenly":
			style.justifyContent = "space-evenly";
			break;
		default:
			break;
	}

	return (
		<MyRender style={style} {...otherProps}>
			{children}
		</MyRender>
	);
};

export default Grid;
