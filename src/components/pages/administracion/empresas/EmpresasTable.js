import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const EmpresasTable = ({ columns, ...x } = {}) => {
	//#region declaracion de columnas
	const columnsDef = [
		{
			dataField: "cuit",
			text: "CUIT",
			sort: true,
			formatter: Formato.Cuit,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
		},
		{
			dataField: "razonSocial",
			text: "Razon Social",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "actividadPrincipalDescripcion",
			text: "Actividad Principal",
			style: { textAlign: "left" },
		},
		{
			dataField: "domicilioCalle",
			text: "Domicilio",
			style: { textAlign: "left" },
		},
		{
			dataField: "telefono",
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			text: "Teléfono",
			style: { textAlign: "left" },
		},
		{
			dataField: "deletedDate",
			text: "Fecha baja",
			formatter: Formato.Fecha,
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

	//#endregion

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

export default EmpresasTable;
