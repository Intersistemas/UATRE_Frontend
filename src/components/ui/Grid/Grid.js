import React from "react";

// representa un div con atajos a propiedades de estilos comunes.
export const Grid = (props) => {
	let {
		// Se espera recibir una propiedad de estilos, si no la recibe, inicializo con un objeto vacío.
		style = {},
		// Por defecto el display es flex, pero puede especificarse otro.
		display = "flex",
		// Por defecto la dirección del flex es fila.
		// Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
		direction = "row",
		// Abreviatura para direction="column".
		// Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
		col,
		// Espacio entre componentes hijos.
		// column-gap si direction="row", row-gap si direction="column"
		// Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
		gap,
		// Permite expandir el div hasta ocupar el resto del espacio del componente padre.
		// Si hay componentes hermanos con esta propiedad, el espacio restante se promedia entre ellos.
		// Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
		grow,
		// Especifica el alineado de los comonentes hijos.
		// Posibles valores:
		//	"start": alineados al inicio del componente. (flex-start)
		//	"end": alineados al final del componente.	(flex-end)
		//	"center": alineados al centro del componente.
		//	"around": espaciado alrededor. (space-around)
		//	"between": espaciado entre componentes. (space-between)
		//	"evenly": espaciado equitativamente. (space-evenly)
		// Aplicable solo cuando display="flex". Para cualquier otro display se pasa la propiedad como otro parámetro.
		justify,

		// Abreviatura para display="block".
		block,
		// Especifica el ancho que tendrá el componente.
		// Se puede indicar "full" para ocupar el 100% del componente padre. o un tamaño específico.
		width,
		// Especifica el alto que tendrá el componente.
		// Se puede indicar "full" para ocupar el 100% del componente padre. o un tamaño específico.
		height,
		// Abreviatura.
		// Si full="width" ocupará el ancho que se especifique en la propiedad width. Si no se especifica la propiedad width, ocupa el 100% del ancho.
		// Si full="height" ocupará el alto que se especifique en la propiedad height. Si no se especifica la propiedad height, ocupa el 100% del alto.
		// Si full se puede especificar en cualquier unidad y ocupará esa medida en ancho y alto. (%, px, vh, etc.). ej: full="50px".
		// Si full=n, ocupará n% de ancho y alto.
		// Si full="full" o no se especifica medida, ocupará el 100% de ancho y alto.
		full,
		// Tamaño inicial. (flex-basis)
		// Posibles valores:
		//	"width": Ocupar la misma cantidad que la propiedad width.
		//	"height": Ocupar la misma cantidad que la propiedad height.
		//	"full": Ocupar la misma cantidad que la propiedad full.
		//	Cualquier otro valor: Asume unidad con medida.
		basis,
		// Todos los componentes hijos.
		children,
		// Otras propiedades que se pasarán directamente al div.
		...otherProps
	} = props;

	if (width) {
		if (parseInt(width) === width)
			width = `${width}%`; // Especifica unidad sin medida, significa %.
		else if (`${width}`.toLowerCase() === "full") width = "100%"; // Especifica tamaño completo.
		// Cualquier otro caso, asume unidad con medida.
	}

	if (height) {
		if (parseInt(height) === height)
			height = `${height}%`; // Especifica unidad sin medida, significa %.
		else if (`${height}`.toLowerCase() === "full") height = "100%"; // Especifica tamaño completo.
		// Cualquier otro caso, asume unidad con medida.
	}

	if (full) {
		if (full === true)
			full = "100%"; // full sin especificar unidad ni medida, asume 100%.
		else if (parseInt(full) === full) full = `${full}%`; // full sin especificar medida, asume %.

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
				if (full === "full") full = "100%";
				// Unidad y medida de alto y ancho.
				width = full;
				height = full;
				break;
		}
	}

	// Aplico ancho y alto en caso de corresponder.
	if (width) style.width = width;
	if (height) style.height = height;

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
		style.flexBasis = basis;
	}

	// Abreviatura para display="block".
	if (block) display = "block";

	if (display === "flex") {
		// Abreviatura para direction="column".
		if (col) direction = "column";

		switch (direction) {
			case "row":
				style.flexDirection = "row";
				// Si se especifica gap, aplicarlo como espaciado de columna.
				if (gap) style.columnGap = gap;
				break;
			case "column":
				style.flexDirection = "column";
				// Si se especifica gap, aplicarlo como espaciado de fila.
				if (gap) style.rowGap = gap;
				break;
			default:
				break;
		}

		// Aplico expandir en caso de corresponder.
		if (grow) style.flexGrow = 1;

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
	} else {
		// Se especifica display="block", no incluir porque por defecto los div tienen ese display.
		if (display === "block") display = null;
		// Variable de descarte.
		let _;
		({
			style: _, // Ya se procesó. no incluir en el resto de propiedades.
			display: _, // Ya se procesó. no incluir en el resto de propiedades.
			block: _, // Ya se procesó. no incluir en el resto de propiedades.
			width: _, // Ya se procesó. no incluir en el resto de propiedades.
			height: _, // Ya se procesó. no incluir en el resto de propiedades.
			full: _, // Ya se procesó. no incluir en el resto de propiedades.
			basis: _, // Ya se procesó. no incluir en el resto de propiedades.
			children: _, // Ya se procesó. no incluir en el resto de propiedades.
			// Las demás propiedades se pasarán directamente al div.
			...otherProps
		} = props);
	}

	// Aplico display en caso de corresponder.
	if (display) style.display = display;

	return (
		<div style={style} {...otherProps}>
			{children}
		</div>
	);
};

export default Grid;
