import React from "react";
import Table from "../../../ui/Table/Table";

const DocumentacionList = ({ config }) => {
	const data = config.data ? [...config.data] : [];
	const onSelect = config.onSelect ?? ((registro) => {});
	const noData = config.noData ?? <h4>No hay informacion para mostrar</h4>

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "tipo",
			text: "Tipo documentacion",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "nombre",
			text: "Nombre del archivo",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
	];

	return (
		<Table
			keyField="id"
			loading={config.loading}
			data={data}
			columns={columns}
			noDataIndication={noData}
			onSelected={onSelect}
		/>
	);
};

export default DocumentacionList;
