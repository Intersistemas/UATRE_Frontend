import Table, { asColumnArray } from "components/ui/Table/Table";
import React from "react";
import FormatearFecha from "../../../helpers/FormatearFecha"

//#region declaracion de columnas
const columnsDef = [
	{
		dataField: "id",
		text: "Id",
		hidden: true,
	},
	{
		dataField: "tema",
		text: "Tema",
		headerTitle: () => `Tema`,
		sort: true,
	},
	{
		dataField: "fecha",
		text: "Fecha",
		headerTitle: () => `Fecha`,
		sort: true,
		formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
	},
	{
		dataField: "fechaFinalizacion",
		text: "Fecha Fin",
		headerTitle: () => `Fecha Fin`,
		sort: true,
		formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
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
