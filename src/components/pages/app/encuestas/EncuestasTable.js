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

	dataField: "estadoCalculado",
	text: "Estado",
	headerTitle: () => `Estado`,
	sort: false,
	formatter: (_, row) => {
		const hoy = new Date();
		const fechaFin = row.fechaFinalizacion ? new Date(row.fechaFinalizacion) : null;
		const fechaBaja = row.deletedDate;

		if (fechaBaja) return "Inactiva";
		if (!fechaFin) return "Sin fecha";
		return fechaFin > hoy ? "Activa" : "Finalizada";
	},
	//achicar columna
	headerStyle: { width: "4rem", textAlign: "center" },
	},
	{
		dataField: "fecha",
		text: "Fecha inicio",
		headerTitle: () => `Fecha`,
		sort: true,
		formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
		headerStyle: { width: "6rem", textAlign: "center" },
	}, 
	// {
	// 	dataField: "tema",
	// 	text: "Tema",
	// 	headerTitle: () => `Tema`,
	// 	sort: true,
		
	// 	headerStyle: { width: "10rem", textAlign: "center" },
	// },
	{
		dataField: "tema",
		text: "Tema",
		headerTitle: () => `Tema`,
		sort: true,
		headerStyle: { width: "10rem", textAlign: "center" },
		style: { textAlign: "left" }, 
	},
	{
		dataField: "fechaFinalizacion",
		text: "Fecha finalización",
		headerTitle: () => `Fecha Fin`,
		sort: true,
		formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
			headerStyle: { width: "6rem", textAlign: "center" },
	},
	{
		dataField: "deletedDate",
		text: "Fecha baja",
		headerTitle: () => `Fecha baja`,
		sort: true,
		formatter: (cell) => (cell ? FormatearFecha(cell) : "-"),
		headerStyle: { width: "6rem", textAlign: "center" },
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
