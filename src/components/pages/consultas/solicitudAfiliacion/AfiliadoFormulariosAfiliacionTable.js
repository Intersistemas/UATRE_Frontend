import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const AfiliadoFormulariosAfiliacionTable = ({ columns, ...x } = {}) => {
	//#region declaracion de columnas
	const columnsDef = [
		{
			dataField: "cuil",
			text: "CUIL",
			sort: true,
			formatter: Formato.Cuit,
			headerStyle: (_colum, _colIndex) => ({ width: "10rem" }),
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "apellido",
			text: "Apellido",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "fecha",
			text: "Fecha Solicitud",
			formatter: Formato.Fecha,
			headerStyle: { width: "9rem" },
		},
		{
			dataField: "afiliadoIdAsignado",
			text: "Estado",
			headerStyle: { width: "8rem" },

			formatter: (cell,row) => {
				if (row.deletedDate){
					return (<div
						style={{backgroundColor: '#ff6464cc',color: "#FFF" }}
					>Rechazado</div>)
				}else{
					if (cell) {
						return (<div
							style={{}}
						>Aceptado</div>)
					} else{
						return (<div
							style={{backgroundColor: '#ffff64cc'}}
						>Pendiente</div>)
					}
				}
			}
		},
		{
			dataField: "fechaIncorporacion",
			text: "Fecha Incorporación",
			formatter: Formato.Fecha,
			headerStyle: { width: "9rem" },
		},
		{
			dataField: "domicilio",
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
			dataField: "seccional",
			text: "Seccional",
			style: { textAlign: "left" },
		},
		
		{
			dataField: "cuitEmpresa",
			text: "CUIT",
			sort: true,
			formatter: Formato.Cuit,
			headerStyle: (_colum, _colIndex) => ({ width: "10rem" }),
		},
		{
			dataField: "razonSocial",
			text: "Razón Social",
			sort: true,
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
		{
			dataField: "observaciones",
			text: "Observaciones",
			style: { textAlign: "left" },
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

export default AfiliadoFormulariosAfiliacionTable;