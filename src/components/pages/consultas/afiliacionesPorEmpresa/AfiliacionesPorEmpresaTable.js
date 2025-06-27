import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const EmpresasTable = ({ columns, ...x } = {}) => {
	//#region declaracion de columnas
	const columnsDef = [

		{
			dataField: "id",
			text: "Nro Solicitud",
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
			dataField: "empresaCUIT",
			text: "CUIT",
			sort: true,
			formatter: Formato.Cuit,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
		},
		{
			dataField: "empresaDescripcion",
			text: "RAZON SOCIAL EMPRESA",
			sort: false,
			style: { textAlign: "left" },
		},
		{
			dataField: "seccionalCodigo",
			text: "Codigo Seccional",
			sort: false,
		},
		{
			dataField: "periodo",
			text: "Período",
			sort: false,
		},
		{
			dataField: "total_Trab_Rurales_NoAfiliados",
			text: "Trabajadores Rurales No Afiliados",
			sort: false,
		},
		{
			dataField: "estado",
			text: "Estado",
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
		}
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
