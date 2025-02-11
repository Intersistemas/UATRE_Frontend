import React from "react";
import Table from "components/ui/Table/Table";

 
const DatosDevueltosForm  = ({
	columns: columnsInit = [],
	...x
} = {}) => {
	const columns = [
		{
		headerTitle: (column, colIndex) => `Id`,
		dataField: "id",
		text: "Id",
		sort: true,
		hidden: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
			},
		},
		{
		headerTitle: (column, colIndex) => `texto`,
		dataField: "Texto",
		text: "texto",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
			},
		}
	]

	return (
			<Table
				keyField="id"
				mostrarBuscar={false}
				columns={columns}
				{...x}
			/>
	);
};

export default DatosDevueltosForm;
