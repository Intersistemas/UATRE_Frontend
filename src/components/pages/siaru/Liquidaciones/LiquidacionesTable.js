import React, { useEffect, useState } from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import Table from "components/ui/Table/Table";

const LiquidacionesTable = ({ columns, ...x } = {}) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetTiposPago": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/v1/LiquidacionesTiposPagos/`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region declaración tipos de pago
	const [tiposPago, setTiposPago] = useState({
		loading: null,
		data: null,
		error: null,
	});
	useEffect(() => {
		if (!tiposPago.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetTiposPago",
			onOk: async (data) => changes.data.push(...data),
			onError: async (error) => (changes.error = error),
			onFinally: async () => setTiposPago((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, tiposPago]);
	//#endregion

	const columnsDef = [
		// {
		// 	dataField: "id",
		// 	text: "Número",
		// 	sort: true,
		// 	headerStyle: { width: "100px" },
		// 	style: { textAlign: "center" },
		// },
		{
			dataField: "empresaEstablecimientoId",
			text: "Estab. Nro.",
			sort: true,
			headerStyle: { width: "150px" },
		},
		{
			dataField: "empresaEstablecimiento_Descripcion",
			text: "Estab. nombre",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "liquidacionTipoPagoId",
			text: "T. pago",
			sort: true,
			formatExtraData: tiposPago,
			formatter: (v, r, i, e = tiposPago) =>
				e.loading ??
				e.error?.message ??
				e.data?.find(({ id }) => id === v)?.descripcion ??
				"",
			headerStyle: { width: "150px" },
			style: { textAlign: "left" },
		},
		{
			dataField: "totalRemuneraciones",
			text: "Total remuneraciones",
			sort: true,
			formatter: Formato.Moneda,
			headerStyle: (_colum, _colIndex) => ({ width: "220px" }),
			style: { textAlign: "right" },
		},
		{
			dataField: "interesNeto",
			text: "Total aporte",
			formatter: Formato.Moneda,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			style: { textAlign: "right" },
		},
	];

	const columnsArr =
		typeof columns === "function"
			? AsArray(columns(columnsDef), true)
			: Array.isArray(columns) && columns.length
			? columns.map((r) => ({
					...columnsDef.find((d) => d.dataField === r.dataField),
					...r,
			  }))
			: columnsDef;

	useEffect(() => {
		if (
			columnsArr.find((r) => r.formatExtraData === tiposPago) &&
			!tiposPago.loading &&
			!tiposPago.data
		) {
			setTiposPago((o) => ({ ...o, loading: "Cargando... " }));
		}
	}, [columnsArr, tiposPago]);

	return (
		<Table keyField="id" columns={columnsArr} mostrarBuscar={false} {...x} />
	);
};

export default LiquidacionesTable;
