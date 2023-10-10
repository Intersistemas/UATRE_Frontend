import React from "react";
import Formato from "components/helpers/Formato";
import Button from "components/ui/Button/Button";
import Table from "components/ui/Table/Table";

const LiquidacionList = ({
	records = [], // Lista de liquidaciones
	tiposPagos = [], // Lista de tipos de pagos
	loading = true,
	noData = <h4>No hay informacion a mostrar</h4>,
	selected = [],
	onSelect = (_isSelect, _record) => {},
	onSelectAll = (_isSelect) => {},
	onOpenForm = (_record) => {},
	...otherProps
}) => {
	records ??= [];
	const selectedKeys = [];
	(selected ?? [])
		.forEach((r) => selectedKeys.push(r.index));
	tiposPagos ??= [];
	const tiposLiquidaciones = ["Periodo", "Acta"];

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
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
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "tipoLiquidacion",
			text: "T. liquidación",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			formatter: (v) => tiposLiquidaciones[v],
			style: { ...cs },
		},
		{
			dataField: "liquidacionTipoPagoId",
			text: "T. pago",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			formatter: (v) => tiposPagos.find((r) => r.id === v)?.descripcion ?? "",
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "cantidadTrabajadores",
			text: "Cant. Trabajadores",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "totalRemuneraciones",
			text: "Total remuneraciones",
			sort: true,
			formatter: Formato.Moneda,
			headerStyle: (_colum, _colIndex) => ({ width: "220px" }),
			style: { ...cs },
		},
		{
			dataField: "interesNeto",
			text: "Total aporte",
			formatter: Formato.Moneda,
			headerStyle: (_colum, _colIndex) => ({ width: "220px" }),
		},
		{
			dataField: "acciones",
			text: "Acciones",
			isDummyField: true,
			formatter: (_cell, row, _rowIndex, _formatExtraDatas) => {
				return (
					<Button onClick={() => onOpenForm(row)} width={95} style={{ padding: 0 }}>Modifica</Button>
				);
			},
			headerStyle: (_colum, _colIndex) => ({ width: "120px" }),
			style: { padding: 0 },
		},
	];

	return (
		<Table
			keyField="index"
			loading={loading}
			data={records}
			columns={columns}
			noDataIndication={noData}
			mostrarBuscar={false}
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

export default LiquidacionList;
