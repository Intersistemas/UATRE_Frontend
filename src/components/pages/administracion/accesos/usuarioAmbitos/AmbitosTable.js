import React from "react";
import Table from "components/ui/Table/Table";


const TareaTable = ({
		columns: columnsInit = [],
	...x
}) => {

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "usuarioId",
			text: "Id",
			hidden: true,
		},
		{
			dataField: "ambitoTipo",
			text: "Ambito",
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			style: { ...cs },
			formatter: (v) => {
				console.log("v*",v)
				switch(v){
					case "S": return "Seccional";
					case "P": return "Provincia";
					case "D": return "Delegación";
					case "T": return "Todos";
				}
			},
			//SI EL TIPO ES "T", debo resaltar en color la fila.
		},
		{
			dataField: "ambitoId",
			text: "Cod.Ambito",
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
	];

	return (
		<Table
			keyField="id"
			columns={columns}
			{...x}
		/>
	);
};

export default TareaTable;
