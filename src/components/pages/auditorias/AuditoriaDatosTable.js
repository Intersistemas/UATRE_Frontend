import React from "react";
import Formato from "components/helpers/Formato";
import Table, { asColumnArray } from "components/ui/Table/Table";

const columnsDef = [
	{
		dataField: "fechaHoraAuditoria",
		text: "Fecha y hora de movimiento",
		headerStyle: { width: "17em", textAlign: "center" },
		formatter: (v) => Formato.FechaHora(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "tabla",
		text: "Tabla",
		headerStyle: { width: "17em", textAlign: "center" },
		style: { textAlign: "left" },
	},
	{
		dataField: "accion",
		text: "Acción",
		headerStyle: { width: "8em", textAlign: "center" },
		style: { textAlign: "center" },
	},
	{
		dataField: "usuario",
		text: "Usuario",
		headerStyle: { textAlign: "left" },
		style: { textAlign: "left" },
	},
];

/** @type {Table} */
const AuditoriaDatosTable = ({ columns, ...x }) => (
	<Table
		keyField="id"
		columns={asColumnArray(columns, columnsDef)}
		mostrarBuscar={false}
		{...x}
	/>
);

export default AuditoriaDatosTable;
