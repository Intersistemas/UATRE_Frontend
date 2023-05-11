import React from "react";
import Formato from "../../../../../helpers/Formato";
import Table from "../../../../../ui/Table/Table";

const DDJJList = ({
	records = [],	// Lista de Nominas
	loading = true,
	noData = <h4>No hay informacion a mostrar</h4>,
	onSelect = (_record) => {}
}) => {
	records ??= [];

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
			loading={loading}
			data={records}
			columns={columns}
			noDataIndication={noData}
			onSelected={onSelect}
		/>
	);
};

export default DDJJList;
