import React, { useEffect, useState } from "react";
import Formato from "../../../helpers/Formato";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";

const LiquidacionesList = ({
	data = [],
	selection = {},
	pagination = {},
	loading = false,
	noData,
}) => {
	data ??= [];
	selection ??= {};
	pagination ??= {};

	const tiposLiquidacion = [
		{ codigo: 0, descripcion: "Periodo"},
		{ codigo: 1, descripcion: "Acta"},
	];

	const [tiposPago, setTiposPago] = useState([]);
	const { sendRequest } = useHttp();

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "id",
			text: "Número",
			formatter: Formato.Entero,
			sort: true,
      headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs, textAlign: "right" },
		},
		{
			dataField: "periodo",
			text: "Periodo",
			formatter: Formato.Periodo,
			sort: true,
      headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "fecha",
			text: "Fecha",
			formatter: Formato.Fecha,
			sort: true,
      headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "tipoLiquidacion",
			text: "Tipo",
			sort: true,
			formatter: (v) => tiposLiquidacion.find(r => r.codigo === v)?.descripcion ?? "",
      headerStyle: (colum, colIndex) => ({ width: "80px" }),
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "liquidacionTipoPagoId",
			text: "Tipo de pago",
			sort: true,
			formatter: (v) => tiposPago.find(r => r.codigo === v)?.descripcion ?? "",
      headerStyle: (colum, colIndex) => ({ width: "150px" }),
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "empresaEstablecimiento_Nombre",
			text: "Establecimiento",
			sort: true,
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "bajaFecha",
			text: "Baja fecha",
			formatter: Formato.Fecha,
			sort: true,
      headerStyle: (colum, colIndex) => ({ width: "120px" }),
			style: { ...cs },
		},
		{
			dataField: "refMotivoBaja_Descripcion",
			text: "Baja motivo",
			sort: true,
			style: { ...cs, textAlign: "left" },
		},
	];

	useEffect(() => {
		if (tiposPago.length === 0) {
			sendRequest(
				{
					baseURL: "SIARU",
					endpoint: `/LiquidacionesTiposPagos/`,
					method: "GET",
				},
				async (resp) => setTiposPago([...resp])
			);
		}
	}, [tiposPago.length, sendRequest]);

	return (
		<Table
			remote
			keyField="id"
			loading={loading}
			data={data}
			columns={columns}
			pagination={pagination}
			selection={selection}
			noDataIndication={noData}
		/>
	);
};

export default LiquidacionesList;
