import React from "react";
import Table from "../ui/Table/Table";

const selectionOnSelectDef = (_row, _isSelect, _index, _e) => {};

const DocumentacionTable = ({
	tipoList = [],
	data: initData = [],
	selection: initSelection = { onSelect: selectionOnSelectDef },
	...x
}) => {
	const data = [];
	initData.forEach((value, index) => {
		data.push({ index: index, value: value });
	});
	initSelection.onSelect ??= selectionOnSelectDef;
	const selection = {
		...initSelection,
		selected: initSelection.selected
			?.map((r) => data.find((d) => d.value.id === r)?.index)
			.filter((r) => r != null),
		onSelect: (row, isSelect, index, e) =>
			initSelection.onSelect(row.value, isSelect, index, e),
	};

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "refTipoDocumentacionId",
			isDummyField: true,
			text: "Tipo documentacion",
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			formatter: (_cell, row, _rowIndex, _formatExtraDatas) =>
				tipoList.find((r) => r.id === row.value.refTipoDocumentacionId)
					?.descripcion ?? "",
			style: { ...cs },
		},
		{
			dataField: "value",
			text: "Nombre del archivo",
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			formatter: (v) => v.nombreArchivo ?? "",
			style: { ...cs },
		},
	];

	return (
		<Table
			keyField="index"
			data={data}
			columns={columns}
			selection={selection}
			mostrarBuscar={true}
			{...x}
		/>
	);
};

export default DocumentacionTable;
