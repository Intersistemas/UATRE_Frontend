import React from "react";
import AsArray from "components/helpers/AsArray";
import Table from "components/ui/Table/Table";
import Formato from "components/helpers/Formato";

const LocalidadesTable = ({ columns, ...x } = {}) => {
	const columnsDef = [
		{
			dataField: "codPostal",
			text: "C.P.",
			sort: true,
			headerStyle: { width: "80px" },
			formatter: Formato.Numero,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "provincia",
			text: "Provincia",
			sort: true,
			headerStyle: { width: "200px" },
			style: { textAlign: "left" },
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

export default LocalidadesTable;