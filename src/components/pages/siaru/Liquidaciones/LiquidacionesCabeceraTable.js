import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const LiquidacionesCabeceraTable = ({ columns, ...x } = {}) => {
	const columnsDef = [
		{
			dataField: "id",
			text: "Número",
			sort: true,
			headerStyle: { width: "100px" },
			style: { textAlign: "center" },
		},
		{
			dataField: "periodo",
			text: "Periodo",
			formatter: Formato.Periodo,
			sort: true,
			headerStyle: { width: "100px" },
		},
		{
			dataField: "createdDate",
			text: "Fecha",
			formatter: Formato.Fecha,
			sort: true,
			headerStyle: { width: "100px" },
		},
		// {
		// 	dataField: "tipoLiquidacion",
		// 	text: "Tipo",
		// 	sort: true,
		// 	formatExtraData: ["Periodo", "Acta"],
		// 	formatter: (v, r, i, e) => e.at(v) ?? "",
		// 	style: { textAlign: "left" },
		// },
		{
			dataField: "cantidadTrabajadores",
			text: "Cant. Trab.",
			sort: true,
			// headerStyle: { width: "140px" },
			style: { textAlign: "center" },
		},
		{
			dataField: "totalRemuneraciones",
			text: "T. Remun.",
			formatter: Formato.Moneda,
			sort: true,
			headerStyle: { width: "120px" },
			style: { textAlign: "right" },
		},
		{
			dataField: "totalAporte",
			text: "T. aporte",
			formatter: Formato.Moneda,
			sort: true,
			headerStyle: { width: "120px" },
			style: { textAlign: "right" },
		},
		{
			dataField: "totalIntereses",
			text: "T. intereses",
			formatter: Formato.Moneda,
			sort: true,
			headerStyle: { width: "140px" },
			style: { textAlign: "right" },
		},
		{
			dataField: "fechaPagoEstimada",
			text: "F. pago",
			formatter: Formato.Fecha,
			sort: true,
			headerStyle: { width: "100px" },
		},
		{
			dataField: "fechaVencimiento",
			text: "F. vencimiento",
			formatter: Formato.Fecha,
			sort: true,
			headerStyle: { width: "160px" },
		},
		{
			dataField: "deletedDate",
			text: "F. baja",
			formatter: Formato.Fecha,
			sort: true,
			headerStyle: { width: "100px" },
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

	return (
		<Table
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

export default LiquidacionesCabeceraTable;
