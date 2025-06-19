import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const LiquidacionesNominaTable = ({ columns, ...x } = {}) => {
	const columnsDef = [
		{
			dataField: "cuil",
			text: "CUIL",
			sort: true,
			headerStyle: { width: "150px" },
			formatter: Formato.Cuit,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "afiliadoId",
			text: "Es Afiliado",
			sort: true,
			headerStyle: { width: "120px" },
			formatter: (value) =>
				Formato.Booleano(!!value),
			style: { textAlign: "center" },
		},
		{
			dataField: "esRural",
			text: "Es Rural",
			sort: true,
			headerStyle: { width: "100px" },
			formatter: Formato.Booleano,
			style: { textAlign: "center" },
		},
		{
			dataField: "remuneracionImponible",
			text: "Remuneración",
			sort: true,
			headerStyle: { width: "155px" },
			formatter: (v) => Formato.Moneda(v),
			style: { textAlign: "right" },
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

export default LiquidacionesNominaTable;
