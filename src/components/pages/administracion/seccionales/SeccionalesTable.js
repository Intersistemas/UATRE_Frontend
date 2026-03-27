// import Table, { asColumnArray } from "components/ui/Table/Table";
// import React from "react";
// import Formato from "components/helpers/Formato";

// //#region declaracion de columnas
// const columnsDef = [
// 	{
// 		dataField: "codigo",
// 		text: "Código",
// 		headerTitle: () => `Codigo Seccional`,
// 		headerStyle: { width: "3rem" },
// 		sort: true,
// 	},
// 	{
// 		dataField: "descripcion",
// 		text: "Nombre",
// 		headerTitle: () => `Nombre Seccional`,
// 		sort: true,
// 	},
// 	{
// 		dataField: "seccionalEstadoDescripcion",
// 		text: "Estado",
// 		headerStyle: { width: "5rem" },
// 		formatter : (value, row) =>
// 			row.deletedDate ? `Baja - (${Formato.Fecha(row.deletedDate)})` : value,
// 		//style: (value, row) => row.deletedDate ? {color: "red"} : ''
// 	},
// 	{
// 		dataField: "domicilio",
// 		text: "Dirección",
// 	},
// 	{ 
// 		dataField: "email",
// 		text: "Email",
// 		headerStyle: { width: "4rem" },
// 	},
// 	{
// 		dataField: "localidadNombre",
// 		text: "Localidad",
// 		headerTitle: () => `Localidad Seccional`,
// 	},
// 	{
// 		dataField: "provinciaDescripcion",
// 		text: "Provincia",
// 	},
// 	{
// 		dataField: "id",
// 		text: "Id",
// 		hidden: true,
// 	},
// 	{
// 		dataField: "deletedDate",
// 		text: "deletedDate",
// 		hidden: true,
// 		headerTitle: () => `Id`,
// 	},
// 	{
// 		dataField: "refDelegacionDescripcion",
// 		text: "Delegación",
// 	},
// ].map((r) => ({
// 	searchable: false,
// 	headerTitle: () => r.text,
// 	headerStyle: { width: "7rem", textAlign: "center", ...r.headerStyle },
// 	style: (value, row) => row.deletedDate ? {color: "red"} : '',
// 	...r,
// }));
// //#endregion

// /**
//  * @type {Table}
//  */
// const SeccionalesTable = ({ columns, ...x } = {}) => (
// 	<Table
// 		keyField="id"
// 		columns={asColumnArray(columns, columnsDef)}
// 		mostrarBuscar={false}
// 		{...x}
// 	/>
// );

// export default SeccionalesTable;



import Table, { asColumnArray } from "components/ui/Table/Table";
import React from "react";
import Formato from "components/helpers/Formato";



const columnsDef = [
	{
		dataField: "codigo",
		text: "Código",
		headerTitle: () => `Codigo Seccional`,
		headerStyle: { width: "3rem" },
		sort: true, 
	},





	
	{
    dataField: "descripcion",
    text: "Nombre",
    headerTitle: () => `Nombre Seccional`,
    sort: true,
    formatter: (value, row) => {
        // Array con todas las variaciones posibles del marcador
        const marcadoresVariaciones = [
            "En Secc. ",
            "En Secc",
            "EN SECC.",
            "EN SECC",
            "En secc",
            "En secc.",
            "en Secc",
            "en Secc.",
            "en secc",
            "en secc.",
            "EN SEC.",
            "EN SEC",
            "En Sec.",
            "En Sec",
            "en SECC.",
            "en SECC",
            "en secc."
        ];

        // Verificar si ya contiene alguna variación del marcador
        const yaContieneMarcador = marcadoresVariaciones.some(marcador => 
            row.descripcion.includes(marcador)
        );

        if (row.seccionalEstadoDescripcion === "ABSORBIDA") {
            // Si ya contiene el marcador, devolver la descripción original
            if (yaContieneMarcador) {
                return row.descripcion;
            }
            // Si no contiene el marcador, agregarlo
            return `${value} (En Secc. ${row.seccionalAbsorbenteCodigo})`;
        }

        // Si no es estado 6, devolver el valor original
        return value;
    },
},







	{
		dataField: "seccionalEstadoDescripcion",
		text: "Estado",
		// headerStyle: { width: "4rem" },
		formatter : (value, row) =>
			row.seccionalEstadoDescripcion === "ABSORBIDA" ? `ABSORBIDA` : value,
		
	},
	{
		dataField: "domicilio",
		text: "Dirección",
	},
	{ 
		dataField: "telefono",
		text: "Teléfono",
		headerStyle: { width: "5rem" },
	},
	{
		dataField: "localidadNombre",
		text: "Localidad",
		headerTitle: () => `Localidad Seccional`,
	},
	{
		dataField: "provinciaDescripcion",
		text: "Provincia",
	},
	{
		dataField: "id",
		text: "Id",
		hidden: true,
	},
	{
		dataField: "deletedDate",
		text: "deletedDate",
		hidden: true,
		headerTitle: () => `Id`,
	},
	{
		dataField: "refDelegacionDescripcion",
		text: "Delegación",
	},
].map((r) => ({
	searchable: false,
	headerTitle: () => r.text,
	headerStyle: { width: "7rem", textAlign: "center", ...r.headerStyle },
	style: (value, row) => row.deletedDate ? {color: "red"} : '',
	...r,
}));
//#endregion

/**
 * @type {Table}
 */
const SeccionalesTable = ({ columns, ...x } = {}) => (
	<Table
		keyField="id"
		columns={asColumnArray(columns, columnsDef)}
		mostrarBuscar={false}
		{...x}
	/>
);

export default SeccionalesTable;