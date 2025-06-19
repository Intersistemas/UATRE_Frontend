import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const CIIUTable = ({ columns, ...x } = {}) => {
	const columnsDef = [
		{
			dataField: "ciiu",
			text: "CIIU",
			sort: true,
			headerStyle: { width: "150px" },
			style: { textAlign: "center" },
		},
		{
			dataField: "descripcion",
			text: "Descripción",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "formulario",
			text: "Formulario",
			sort: true,
			headerStyle: { width: "120px" },
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

export default CIIUTable;
