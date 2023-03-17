import React from "react";
import Formato from "../../../../../helpers/Formato";
import Table from "../../../../../ui/Table/Table";

const LiquidacionList = ({ config }) => {
	const onSelect = config.onSelect ?? ((registro) => {});
	const tiposPagos = [
		{ id: 1, descripcion: "Sindical" },
		{ id: 2, descripcion: "Solidario" },
		{ id: 3, descripcion: "Sepelio" },
	];
	const tiposLiquidaciones = ["Periodo", "Acta"];

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "empresasEstablecimientosId",
			text: "Estab. Nro.",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "150px" }),
			style: { ...cs },
		},
		{
			dataField: "empresasEstablecimientos_Nombre",
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
			dataField: "liquidacionesTiposPagosId",
			text: "Tipo de pago",
			sort: true,
			formatter: (v) => tiposPagos.find(r => r.id === v)?.descripcion ?? "",
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
	];

	return (
		<Table
			keyField="index"
			loading={config.loading ?? false}
			data={config.data ? [...config.data] : []}
			columns={columns}
			noDataIndication={config.noData}
			onSelected={onSelect}
		/>
	);
};

export default LiquidacionList;
