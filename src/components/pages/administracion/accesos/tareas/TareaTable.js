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
			dataField: "nombreModulo",
			text: "Modulo",
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "nombreTarea",
			text: "Tarea",
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
