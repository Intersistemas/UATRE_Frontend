import React from "react";
import Formato from "../../../../../helpers/Formato";
import Table from "../../../../../ui/Table/Table";

const DDJJList = ({
	records = [],	// Lista de Nominas
	loading = true,
	noData = <h4>No hay informacion a mostrar</h4>,
	selected = [],
	onSelect = (_isSelect, _records) => {},
	onSelectAll = (_isSelect) => {},
	...otherProps
}) => {
	records ??= [];
	const selectedKeys = [];
	(selected ?? []).forEach(r => selectedKeys.push(r.cuil));

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "cuil",
			text: "CUIL",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			formatter: Formato.Cuit,
			style: { ...cs },
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "remuneracionImponible",
			text: "Remuneración imponible",
			sort: true,
			formatter: Formato.Moneda,
			headerStyle: (_colum, _colIndex) => ({ width: "250px" }),
			style: { ...cs },
		},
		{
			dataField: "esRural",
			text: "Es Rural",
			sort: true,
			formatter: (v) => Formato.Booleano(v ?? false),
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "afiliadoId",
			text: "Es Afiliado",
			sort: true,
			formatter: (v) => Formato.Booleano(v > 0),
			headerStyle: (_colum, _colIndex) => ({ width: "120px" }),
			style: { ...cs },
		},
		{
			dataField: "empresaEstablecimientoId",
			text: "Estab. Nro.",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			style: { ...cs },
		},
		{
			dataField: "empresaEstablecimiento_Nombre",
			text: "Estab. nombre",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "250px" }),
			style: { ...cs, textAlign: "left" },
		},
	];

	return (
		<Table
			keyField="cuil"
			loading={loading}
			data={records}
			columns={columns}
			noDataIndication={noData}
			selection={{
				mode: "checkbox",
				hideSelectColumn: false,
				selected: selectedKeys,
				onSelect: (row, isSelect, _index, _e) => onSelect(isSelect, [row]),
				onSelectAll: (isSelect, _rows, _e) => onSelectAll(isSelect),
			}}
			{...otherProps}
		/>
	);
};

export default DDJJList;
