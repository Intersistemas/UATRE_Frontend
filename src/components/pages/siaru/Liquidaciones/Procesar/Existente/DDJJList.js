import React from "react";
import Formato from "../../../../../helpers/Formato";
import Table from "../../../../../ui/Table/Table";

const DDJJList = ({ config }) => {
	const onSelect = config.onSelect ?? ((registro) => {});

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
			dataField: "cuil",
			text: "CUIL",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "150px" }),
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
			dataField: "condicionRural",
			text: "Es Rural",
			sort: true,
			formatter: (v) => Formato.Booleano(v === "RU"),
			headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "afiliadoId",
			text: "Es Afiliado",
			sort: true,
			formatter: (v) => Formato.Booleano(v > 0),
			headerStyle: (colum, colIndex) => ({ width: "120px" }),
			style: { ...cs },
		},
	];

	return (
		<Table
			keyField="cuil"
			loading={config.loading ?? false}
			data={config.data ? [...config.data] : []}
			columns={columns}
			noDataIndication={config.noData}
			onSelected={onSelect}
		/>
	);
};

export default DDJJList;
