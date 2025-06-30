import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";
import Grid from "components/ui/Grid/Grid";

const AfiliacionesPorEmpresaDetalleTable = ({ columns, ...x } = {}) => {
	//#region declaracion de columnas
	const columnsDef = [

		{
			dataField: "periodo",
			text: "Periodo",
			style: { textAlign: "center" },
			formatter: (periodo) => {
				if (!periodo) return "";
				const anio = String(periodo).substring(0, 4);
				const mes = String(periodo).substring(4, 6);
				return `${mes}/${anio}`;
			},
		},
		{
			dataField: "total_Trabajadores",
			text: "Total General",
			style: { textAlign: "center" },
		},
		{
			dataField: "total_Trab_Rurales",
			text: "Totales",
			style: { textAlign: "center" },
		},
		{
			dataField: "total_Trab_Rurales_Afiliados",
			text: "Afiliados",
			style: { textAlign: "center" },
		},
		{
			dataField: "total_Trab_Rurales_NoAfiliados",
			text: "No Afiliados",
			style: { textAlign: "center" },
		},

		{
			dataField: "total_Trab_NoRurales",
			text: "Totales",
			style: { textAlign: "center" },
		},
		{
			dataField: "total_Trab_NoRurales_Afiliados",
			text: "Afiliados",
			style: { textAlign: "center" },
		},
		{
			dataField: "total_Trab_NoRurales_NoAfiliados",
			text: "No Afiliados",
			style: { textAlign: "center" },
		},
	];

	//#endregion

	return (
		 <Grid col full>
			 <Grid width="100%" display="flex" justifyContent="center">
				<th style={{  width: "33.3%"}} className="text-center">
						
				</th>
				<th style={{ border: "1px solid black", borderBottom: "none", width:"50%", backgroundColor: "white"}} className="text-center">
					TRABAJADORES RURALES
				</th>
				<th style={{ border: "1px solid black", borderBottom: "none", width:"50%", backgroundColor: "white"}} className="text-center">
					TRABAJADORES NO RURALES
				</th>
			</Grid>
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
		</Grid>
		
	);
};

export default AfiliacionesPorEmpresaDetalleTable;
