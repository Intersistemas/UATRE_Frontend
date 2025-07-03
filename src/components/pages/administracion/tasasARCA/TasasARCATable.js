import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import UITable from "components/ui/Table/Table";

const columnsDef = [
	{
		dataField: "desdeFecha",
		text: "Desde",
		sort: true,
		headerStyle: { width: "150px" },
		formatter: Formato.Fecha,
	},
	{
		dataField: "hastaFecha",
		text: "Hasta",
		sort: true,
		headerStyle: { width: "150px" },
		formatter: Formato.Fecha,
	},
	{
		dataField: "norma",
		text: "Norma",
		sort: true,
		style: { textAlign: "left" },
	},
	{
		dataField: "resarcitorioMensual",
		text: "Resarcitorio Mensual",
		sort: true,
		headerStyle: { width: "220px" },
		formatter: (v) => Formato.Porcentaje(v / 100.0),
		style: { textAlign: "right" },
	},
	{
		dataField: "punitorioMensual",
		text: "Punitorio Mensual",
		sort: true,
		headerStyle: { width: "220px" },
		formatter: (v) => Formato.Porcentaje(v / 100.0),
		style: { textAlign: "right" },
	},
	{
		dataField: "deletedDate",
		text: "Fecha baja",
		sort: true,
		formatter: Formato.Fecha,
		headerStyle: { width: "125px" },
		style: (v) => {
			const r = { textAlign: "center" };
			if (v) {
				r.background = "#ff6464cc";
				r.color = "#FFF";
			}
			return r;
		},
	},
];

const Table = ({ columns, ...x } = {}) => {
	return (
		<UITable
			keyField="id"
			columns={
				typeof columns === "function"
					? AsArray(columns(columnsDef.map((r) => ({ ...r }))), true)
					: Array.isArray(columns) && columns.length
					? columns.map((r) => ({
							...columnsDef.find((d) => d.dataField === r.dataField),
							...r,
					  }))
					: columnsDef
			}
			mostrarBuscar={false}
			{...x}
		/>
	);
};

export default Table;
