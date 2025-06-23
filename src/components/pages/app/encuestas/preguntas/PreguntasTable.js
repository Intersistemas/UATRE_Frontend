

import React from "react";
import Table from "components/ui/Table/Table";

const PreguntasTable = ({
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
			formatter: (cell) => {
				// Convierte los valores de tipoPregunta en nombres más legibles
				if (cell === "MC") return "Multiple Choice";
				if (cell === "OP") return "Opción Libre";
				if (cell === "TX") return "Texto Libre"
				return cell; // Retorna el valor original si no es MC u OP
			},
			headerStyle: (colum, colIndex) => {
				return { width: "10rem", textAlign: "center" };
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
	];

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
