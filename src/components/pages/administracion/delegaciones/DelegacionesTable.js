import React from "react";
import Table, { asColumnArray } from "components/ui/Table/Table";
import FormatearFecha from "components/helpers/FormatearFecha";
 
	//#region declaracion de columnas
	const columnsDef = [
		{
			dataField: "codigoDelegacion",
			text: "Código",
			sort: true,
			headerStyle: { width: "100px" },
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			headerTitle: () => `Fecha Baja`,
			dataField: "deletedDate",
			text: "Fecha Baja",
			sort: true,
			formatter:FormatearFecha,
			headerStyle: { width: "7rem", textAlign: "center" },
		}
	].map((r) => ({
		headerTitle: () => r.text,
		headerStyle: { width: "7rem", textAlign: "center", ...r.headerStyle },
		style: (value, row) => row.deletedDate ? {color: "red"} : '',
		...r,
	}));
	//#endregion

	/**
	 * @type {Table}
	 */

	const DelegacionesTable = ({ columns, ...x } = {}) => (
		<Table
			keyField="id"
			columns={asColumnArray(columns, columnsDef)}
			mostrarBuscar={false}
			{...x}
		/>
	);


export default DelegacionesTable;