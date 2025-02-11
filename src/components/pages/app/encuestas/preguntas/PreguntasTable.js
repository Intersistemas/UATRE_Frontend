import React from "react";
import Table from "components/ui/Table/Table";

 
const PreguntasTable  = ({
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
		headerTitle: (column, colIndex) => `Orden`,
		dataField: "ordenPregunta",
		text: "Orden",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
			},
		},
		{
		headerTitle: (column, colIndex) => `Tipo`,
		dataField: "tipoPregunta",
		text: "Tipo",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
			},
		},
		{
		headerTitle: (column, colIndex) => `Enunciado`,
		dataField: "enunciado",
		text: "Enunciado",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
			},
		},

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

export default PreguntasTable;
