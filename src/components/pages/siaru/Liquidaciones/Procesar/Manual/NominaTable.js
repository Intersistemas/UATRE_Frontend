import React from "react";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const NominaTable = ({
	records = [],
	selected: selectedInit = [],
	onSelect = ({ index, row }) => {},
	...x
} = {}) => {
	const selected = [];
	selectedInit.filter((e) => e).forEach((e) => selected.push(e.cuil));

	const columns = [
		{
			dataField: "cuil",
			text: "CUIL",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			formatter: Formato.Cuit,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "remuneracion",
			text: "Remuneración",
			sort: true,
			formatter: Formato.Moneda,
			headerStyle: (_colum, _colIndex) => ({ width: "180px" }),
			style: { textAlign: "right" },
		},
	];

	return (
		<Table
			data={records}
			keyField="cuil"
			columns={columns}
			selection={{
				selected: selected,
				onSelect: (row, _isSelect, index, _e) =>
					onSelect({ index: index, row: row }),
			}}
			{...x}
		/>
	);
};

export default NominaTable;
