import React from "react";
import Formato from "components/helpers/Formato";
import Table, { asColumnArray } from "components/ui/Table/Table";

//#region declaracion de columnas
const columnsDef = [
	{
		dataField: "id",
		text: "Id",
		headerStyle: { width: "100px" },
		style: { textAlign: "center" },
		sort: true,
		hidden: true,
	},
	{
		dataField: "cuit",
		text: "CUIT/CUIL",
		headerStyle: { width: "70px" },
		style: { textAlign: "center" },
		formatter: (v) => Formato.Cuit(v),
		sort: true,
	},
	{
		dataField: "userName",
		text: "Usuario",
		headerStyle: { width: "60px" },
		style: { textAlign: "right" },
		sort: true,
	},
	{
		dataField: "nombre",
		text: "Nombre",
		style: { textAlign: "left" },
		sort: true,
	},
	{
		dataField: "email",
		text: "Email",
		headerStyle: { width: "100px" },
		style: { textAlign: "left" },
	},
	{
		dataField: "emailConfirmed",
		text: "Email Confirmado",
		headerStyle: { width: "70px" },
		style: { textAlign: "center" },
		formatter: (v) => Formato.Booleano(!!v),
	},
	{
		dataField: "phoneNumber",
		text: "Teléfono",
		headerStyle: { width: "50px" },
		style: { textAlign: "center" },
	},
	{
		dataField: "deletedDate",
		text: "Fecha Baja",
		formatter: (v) => Formato.Fecha(v),
		headerStyle: { width: "50px" },
		style: (v) => {
			const r = { textAlign: "center" };
			if (v) {
				r.background = "#ff6464cc";
				r.color = "#FFF";
			}
			return r;
		},
		sort: true,
	},
].map((r) => ({
	searchable: false,
	headerTitle: () => r.text,
	headerStyle: { width: "7rem", textAlign: "center", ...r.headerStyle },
	...r,
}));
//#endregion

/** @type {Table} */
const UsuariosTable = ({ columns, ...x } = {}) => (
	<Table
		keyField="id"
		columns={asColumnArray(columns, columnsDef)}
		mostrarBuscar={false}
		{...x}
	/>
);

export default UsuariosTable;
