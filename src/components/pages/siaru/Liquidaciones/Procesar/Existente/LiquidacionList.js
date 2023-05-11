import React from "react";
import Formato from "../../../../../helpers/Formato";
import Button from "../../../../../ui/Button/Button";
import Table from "../../../../../ui/Table/Table";

const LiquidacionList = ({
	records = [], // Lista de liquidaciones
	tiposPagos = [], // Lista de tipos de pagos
	loading = true,
	noData = <h4>No hay informacion a mostrar</h4>,
	onSelect = (_record) => {},
	onOpenForm = (_record) => {},
}) => {
	records ??= [];
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
			headerStyle: (colum, colIndex) => ({ width: "150px" }),
			style: { ...cs },
		},
		{
			dataField: "empresaEstablecimiento_Nombre",
			text: "Estab. nombre",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "250px" }),
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "tipoLiquidacion",
			text: "Tipo de liquidacion",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "150px" }),
			formatter: (v) => tiposLiquidaciones[v],
			style: { ...cs },
		},
		{
			dataField: "liquidacionTipoPagoId",
			text: "Tipo de pago",
			sort: true,
			formatter: (v) => tiposPagos.find((r) => r.id === v)?.descripcion ?? "",
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "cantidadTrabajadores",
			text: "Cant. Trabajadores",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "totalRemuneraciones",
			text: "Total Remuneraciones",
			sort: true,
			formatter: Formato.Moneda,
			headerStyle: (colum, colIndex) => ({ width: "120px" }),
			style: { ...cs },
		},
		{
			dataField: "acciones",
			text: "Acciones",
			isDummyField: true,
			formatter: (cell, row, rowIndex, formatExtraDatas) => {
				return (
					<Button onClick={() => onOpenForm(row)}>
						{row.id ? "Consulta" : "Genera"}
					</Button>
				);
			},
			headerStyle: (colum, colIndex) => ({ width: "120px" }),
		},
	];

	return (
		<Table
			keyField="index"
			loading={loading}
			data={records}
			columns={columns}
			noDataIndication={noData}
			onSelected={onSelect}
		/>
	);
};

export default LiquidacionList;
