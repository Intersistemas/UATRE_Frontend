import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const EmpresasTable = ({ columns, ...x } = {}) => {
	//#region declaracion de columnas
	const columnsDef = [

		{
			dataField: "id",
			text: "Nro Gestión",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
		},
		{
			dataField: "fecha",
			text: "Fecha",
			sort: true,
			formatter: (v) => Formato.Fecha(v),
			headerStyle: { width: "120px", textAlign: "center" },
		},
		{
			dataField: "cuitTitular",
			text: "CUIL Titular",
			sort: true,
			formatter: Formato.Cuit,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
		},
		{
			dataField: "apellidoTitular",
			text: "Titular",
			sort: false,
			formatter : (value, row) => `${row.apellidoTitular} ${row.nombreTitular}`,
			style: { textAlign: "left" },
		},
		{
			dataField: "apellidoPaciente",
			text: "Paciente",
			sort: false,
			formatter : (value, row) => `${row.apellidoPaciente} ${row.nombrePaciente}`,
			style: { textAlign: "left" },
		},
		{
			dataField: "dniPaciente",
			text: "DNI Paciente",
			formatter: Formato.DNI,
			style: { textAlign: "left"},
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
		},
		{
			dataField: "fechaNacimiento",
			text: "Fecha Nacimiento",
			formatter: (v) => Formato.Fecha(v),
			headerStyle: { width: "120px", textAlign: "center" },
		},
		{
			dataField: "texto",
			text: "Texto",
			style: { textAlign: "left" },
		},
		{
			dataField: "deletedDate",
			text: "Fecha baja",
			formatter: Formato.Fecha,
			headerStyle: { width: "120px" },
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
