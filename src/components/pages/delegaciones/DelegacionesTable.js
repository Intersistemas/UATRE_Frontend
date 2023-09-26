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
			text: "Cód. delegación",
			sort: true,
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