import React from "react";
import Table from "components/ui/Table/Table";
import FormatearFecha from "components/helpers/FormatearFecha";
 
const DelegacionesTable = ({
	columns: columnsInit = [],
	...x
} = {}) => {
	//#region declaracion de columnas
	const columns = [
		{
			dataField: "codigoDelegacion",
			text: "Código",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			style: { textAlign: "left" },
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			headerTitle: (column, colIndex) => `Fecha Baja`,
			dataField: "deletedDate",
			text: "Fecha Baja",
			sort: true,
			formatter:FormatearFecha,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
		},
		...columnsInit
	];
	//#endregion

	return (
		<Table
			keyField="id"
			columns={columns}
			{...x}
		/>
	);
};

export default DelegacionesTable;