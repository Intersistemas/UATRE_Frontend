import Table, { asColumnArray } from "components/ui/Table/Table";
import React from "react";
import FormatearFecha from "../../helpers/FormatearFecha"
import Formato from "components/helpers/Formato";

 
//#region declaracion de columnas
const columnsDef = [
	{ 
			headerTitle: (column, colIndex) => `Id`,
			dataField: "id",
			text: "Id", 
			sort: true,
			hidden: true,
			headerStyle: (colum, colIndex) => {
				return {textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Seccional`,
			dataField: "seccionalId",
			text: "Seccional",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return {textAlign: "center", width: "8rem" };
			},
		},
		
		{
			headerTitle: (column, colIndex) => `Nombre de Seccional`,
			dataField: "seccionalId",
			text: "Nombre de Seccional",
			sort: true,
			headerStyle: (colum, colIndex) => {
				// Header centrado, contenido de celdas alineado a la izquierda (configurado en el mapeo final)
				return {textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Empleador`,
			dataField: "establecimientoRazonSocial",
			text: "Empleador",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return {textAlign: "center" };
			},
		},
		

		{
		headerTitle: (column, colIndex) => `Cuit`,
		dataField: "establecimientoCUIT",
		text: "Cuit",
		sort: true,
		formatter: (cell) => Formato.Cuit(cell),
		headerStyle: () => ({ textAlign: "center", width: "10rem" }),
		},


		//////////////////////////////////////////
		{
			headerTitle: () => `Fecha`,
			dataField: "fecha",
			text: "Fecha",
			sort: true,
			formatter:FormatearFecha,
			headerStyle: {textAlign: "center", width: "8rem" },
		},
		/////////////////////////////////////////////
		{
			headerTitle: (column, colIndex) => `Usuario`,
			dataField: "inspector",
			text: "Usuario",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return {textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Delegacion`,
			dataField: "seccionalId",
			text: "Delegacion",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Provincia`,
			dataField: "seccionalId",
			text: "Provincia",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { textAlign: "center" };
			},
		},
		
].map((r) => ({
	searchable: false,
	headerTitle: () => r.text,
	headerStyle: { textAlign: "center", ...r.headerStyle },
	style: (value, row) => ({
		textAlign: "left", // Contenido alineado a la izquierda
		...(row.deletedDate ? {color: "red"} : {})
	}),
	...r,
}));
//#endregion

/**
 * @type {Table}
 */
const RelevamientoTable = ({ columns, seccionales, seccionalesLoading, seccionalesError, ...x } = {}) => {
	
	//  LOG: Verificar todos los parámetros que llegan al componente RelevamientoTable
	console.log(" [RelevamientoTable] TODOS los parámetros recibidos:", {
		columns,
		seccionales,
		seccionalesLoading,
		seccionalesError,
		data: x.data,
		loading: x.loading,
		pagination: x.pagination,
		selection: x.selection,
		otrosParams: Object.keys(x)
	});

	//  LOG: Detalles específicos de seccionales
	if (seccionales) {
		console.log(" [RelevamientoTable] Seccionales recibidas - Cantidad:", seccionales.length);
		console.log(" [RelevamientoTable] Seccionales recibidas - Datos completos:", seccionales);
		
		// Mostrar cada seccional individual con sus campos clave
		seccionales.forEach((seccional, index) => {
			console.log(` [RelevamientoTable] Seccional ${index + 1}:`, {
				id: seccional.id,
				localidadNombre: seccional.localidadNombre,
				refDelegacionDescripcion: seccional.refDelegacionDescripcion,
				provinciaDescripcion: seccional.provinciaDescripcion,
				todosLosCampos: seccional
			});
		});
	} else {
		console.log(" [RelevamientoTable] No se recibieron datos de seccionales");
	}

	//  LOG: Estados de carga y errores
	console.log(" [RelevamientoTable] Estado de carga seccionales:", seccionalesLoading);
	console.log(" [RelevamientoTable] Error seccionales:", seccionalesError);

	//////////////////////////////


	const seccionalesById = React.useMemo(() => {
	const map = new Map();
	if (Array.isArray(seccionales)) {
		seccionales.forEach(s => map.set(String(s.id), s));
	}
	return map;
	}, [seccionales]); 


	// Crear columnas dinámicas con acceso a seccionales
	const columnasConSeccionales = columnsDef.map(col => {

		 // Mostrar "codigo" cuando la columna es "Seccional"
  if (col.dataField === "seccionalId" && col.text === "Seccional") {
    return {
      ...col,
      formatter: (cellContent) => {
        const s = seccionalesById.get(String(cellContent));
        // si la encuentro, muestro su "codigo"; si no, dejo el valor original o 'N/A'
        return (s && (s.codigo ?? s.codigoseccional ?? s.codigoSeccional))
          ?? (cellContent ?? 'N/A');
      }
    };
	}

		if (col.dataField === "seccionalId" && col.text === "Nombre de Seccional") {
			return {
				...col, 
				formatter: (cellContent, row, rowIndex) => {
					console.log(" [Formatter] Buscando seccional para ID:", cellContent);
					console.log(" [Formatter] Seccionales disponibles:", seccionales);
					
					if (!seccionales || !Array.isArray(seccionales)) {
						console.log(" [Formatter] No hay datos de seccionales disponibles");
						return cellContent || 'N/A';
					}
					
					// Buscar la seccional que coincida con el seccionalId
					const seccionalEncontrada = seccionales.find(seccional => seccional.id === cellContent);
					
					if (seccionalEncontrada) {
						console.log(" [Formatter] Seccional encontrada:", seccionalEncontrada);
						console.log(" [Formatter] localidadNombre:", seccionalEncontrada.localidadNombre);
						return seccionalEncontrada.localidadNombre || seccionalEncontrada.nombre || `Seccional ${cellContent}`;
					} else {
						console.log(" [Formatter] No se encontró seccional con ID:", cellContent);
						
					}
				}
			};
		}
		
		// Formatter para "Delegacion" - usa refDelegacionDescripcion
		if (col.dataField === "seccionalId" && col.text === "Delegacion") {
			return {
				...col,
				formatter: (cellContent, row, rowIndex) => {
					console.log(" [Formatter Delegacion] Buscando delegación para seccional ID:", cellContent);
					
					if (!seccionales || !Array.isArray(seccionales)) {
						console.log(" [Formatter Delegacion] No hay datos de seccionales disponibles");
						return cellContent || 'N/A';
					}
					
					const seccionalEncontrada = seccionales.find(seccional => seccional.id === cellContent);
					
					if (seccionalEncontrada) {
						console.log(" [Formatter Delegacion] refDelegacionDescripcion:", seccionalEncontrada.refDelegacionDescripcion);
						return seccionalEncontrada.refDelegacionDescripcion || `Delegación ${cellContent}`;
					} else {
						console.log(" [Formatter Delegacion] No se encontró seccional con ID:", cellContent);
						
					}
				}
			};
		}
		
		// Formatter para "Provincia" - usa provinciaDescripcion  
		if (col.dataField === "seccionalId" && col.text === "Provincia") {
			return {
				...col,
				formatter: (cellContent, row, rowIndex) => {
					console.log(" [Formatter Provincia] Buscando provincia para seccional ID:", cellContent);
					
					if (!seccionales || !Array.isArray(seccionales)) {
						console.log(" [Formatter Provincia] No hay datos de seccionales disponibles");
						return cellContent || 'N/A';
					}
					
					const seccionalEncontrada = seccionales.find(seccional => seccional.id === cellContent);
					
					if (seccionalEncontrada) {
						console.log(" [Formatter Provincia] provinciaDescripcion:", seccionalEncontrada.provinciaDescripcion);
						return seccionalEncontrada.provinciaDescripcion || `Provincia ${cellContent}`;
					} else {
						console.log(" [Formatter Provincia] No se encontró seccional con ID:", cellContent);
						
					}
				}
			};
		}
		
		return col;
	});

	return (
		<Table
			keyField="id"
			columns={asColumnArray(columns, columnasConSeccionales)}
			mostrarBuscar={false}
			{...x}
		/>
	);
};

export default RelevamientoTable;
