import React from "react";
import AsArray from "components/helpers/AsArray";
import Table from "components/ui/Table/Table";
import FormatearFecha from "../../../helpers/FormatearFecha";

const MetricaTable = ({ columns, ...x } = {}) => {
	const columnsDef = [
		{
		
			dataField: "fecha",
			text: "Fecha",
			sort: true,
			formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
		},
		{
			dataField: "afiliadoNombre", 
			text: "Nombre",
			sort: true,
			// style: { textAlign: "left" },
		},
		{
			dataField: "afiliadoCUIL",
			text: "CUIL",
			sort: true,
			// style: { textAlign: "left" },
		},
		{
			dataField: "afiliadoId",
			text: "Nº Afiliado",
			sort: true,
			// style: { textAlign: "left" },º
		},
		{
			dataField: "appOpcionesDescripcion",
			text: "Opcione Descripcion",
			sort: true,
			// style: { textAlign: "left" },º
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

export default MetricaTable;