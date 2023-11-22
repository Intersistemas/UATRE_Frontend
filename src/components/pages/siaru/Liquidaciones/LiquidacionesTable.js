import React, { useEffect } from "react";
import Table from "components/ui/Table/Table";
import useQueryQueue from "components/hooks/useQueryQueue";

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
		}
	});

	const tiposLiquidacion = ["Periodo", "Acta"];

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
					formatExtraData: tiposLiquidacion,
					formatter: (v, r, i, e) => e.at(v) ?? "",
					headerStyle: (colum, colIndex) => ({ width: "80px" }),
					style: { ...cs, textAlign: "left" },
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
					dataField: "deletedDate",
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
			]}
			{...x}
		/>
	);
};

export default LiquidacionesTable;
