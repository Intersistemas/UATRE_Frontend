import Table from "components/ui/Table/Table";
import React from "react";

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