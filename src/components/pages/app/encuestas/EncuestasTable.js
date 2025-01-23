import Table, { asColumnArray } from "components/ui/Table/Table";
import React from "react";
import Formato from "components/helpers/Formato";

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
	},
	{
		dataField: "fechaFinalizacion",
		text: "Fecha Fin",
		headerTitle: () => `Fecha Fin`,
		sort: true,
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
