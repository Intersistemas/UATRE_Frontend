import Table, { asColumnArray } from "components/ui/Table/Table";
import React from "react";
import Formato from "components/helpers/Formato";

//#region declaracion de columnas
const columnsDef = [
	{
		dataField: "codigo",
		text: "Código",
		headerTitle: () => `Codigo Seccional`,
		headerStyle: { width: "3rem" },
	},
	{
		dataField: "descripcion",
		text: "Nombre",
		headerTitle: () => `Nombre Seccional`,
	},
	{
		dataField: "seccionalEstadoDescripcion",
		text: "Estado",
		headerStyle: { width: "5rem" },
		formatter: (value, row) =>
			row.deletedDate ? `Baja - (${Formato.Fecha(row.deletedDate)})` : value,
	},
	{
		dataField: "domicilio",
		text: "Dirección",
	},
	{
		dataField: "email",
		text: "Email",
		headerStyle: { width: "4rem" },
	},
	{
		dataField: "localidadNombre",
		text: "Localidad",
		headerTitle: () => `Localidad Seccional`,
	},
	{
		dataField: "observaciones",
		text: "Observaciones",
	},
	{
		dataField: "id",
		text: "Id",
		hidden: true,
	},
	{
		dataField: "deletedDate",
		text: "deletedDate",
		hidden: true,
		headerTitle: () => `Id`,
	},
	{
		dataField: "refDelegacionDescripcion",
		text: "Delegación",
	},
].map((r) => ({
	sort: true,
	searchable: false,
	headerTitle: () => r.text,
	headerStyle: { width: "7rem", textAlign: "center", ...r.headerStyle },
	...r,
}));
//#endregion

/**
 * @type {Table}
 */
const SeccionalesTable = ({ columns, ...x } = {}) => (
	<Table
		keyField="id"
		columns={asColumnArray(columns, columnsDef)}
		mostrarBuscar={false}
		{...x}
	/>
);

export default SeccionalesTable;
