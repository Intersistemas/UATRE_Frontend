import React, { useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import Table from "components/ui/Table/Table";

const LiquidacionesTable = ({ columns: columnsInit = [], ...x } = {}) => {
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetTiposPago": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesTiposPagos/`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});

	//#region declaración y carga de tipos de pago
	const [tiposPago, setTiposPago] = useState({
		loading: "Cargando...",
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!tiposPago.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetTiposPago",
			onOk: async (data) => changes.data.push(...data),
			onError: async (error) => (changes.error = error),
			onFinally: setTiposPago((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, tiposPago]);
	//#endregion

	return (
		<Table
			keyField="id"
			columns={[
				{
					dataField: "id",
					text: "Número",
					sort: true,
					headerStyle: { width: "100px" },
					style: { textAlign: "center" },
				},
				{
					dataField: "empresaEstablecimiento_Nombre",
					text: "Establecimiento",
					sort: true,
					style: { textAlign: "left" },
				},
				{
					dataField: "liquidacionTipoPagoId",
					text: "Tipo de pago",
					sort: true,
					formatExtraData: tiposPago,
					formatter: (v, r, i, e) =>
						e.loading ??
						e.error?.message ??
						e.data.find((r) => r.codigo === v)?.descripcion ??
						"",
					headerStyle: { width: "150px" },
					style: { textAlign: "left" },
				},
			]}
			mostrarBuscar={false}
			{...x}
		/>
	);
};

export default LiquidacionesTable;
