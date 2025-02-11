import React from "react";
import Table from "components/ui/Table/Table";
import FormatearFecha from "../../../../helpers/FormatearFecha"

const RespuestasTable  = ({
	columns: columnsInit = [],
	...x
} = {}) => { 

	console.log("data respuestastable:",x)
	const columns = [
		{
			headerTitle: (column, colIndex) => `id`,
			dataField: "id",
			text: "Id",
			sort: true,
			hidden: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
				},
			},
		{
			headerTitle: (column, colIndex) => `fecha`,
			dataField: "fecha",
			text: "Fecha",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
		},
		{
			headerTitle: (column, colIndex) => `afiliadoNombre`,
			dataField: "afiliadoNombre",
			text: "Nombre",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `afiliadoCUIL`, 
			dataField: "afiliadoCUIL",
			text: "CUIL",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `afiliadoNro`,
			dataField: "afiliadoId",
			text: "Afiliado",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
		},
		
	]

	return (
			<Table
				keyField="id"
				//mostrarBuscar={true}
				columns={columns}
				{...x}
			/>
	);
};

export default RespuestasTable;
