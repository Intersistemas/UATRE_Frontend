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
			dataField: "id",
			text: "id",
			hidden: true,
		},
		{
			dataField: "AmbitoTipo",
			text: "Ambito",
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			style: { ...cs },
			//SI EL TIPO ES "T", debo resaltar en color la fila.
		},
		{
			dataField: "AmbitoId",
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
