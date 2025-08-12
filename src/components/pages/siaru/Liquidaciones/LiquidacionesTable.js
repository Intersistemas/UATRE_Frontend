import React, { useEffect, useState } from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import Table from "components/ui/Table/Table";
import useTareasUsuario from "components/hooks/useTareasUsuario";

const LiquidacionesTable = ({ columns, ...x } = {}) => {
	const tarea = useTareasUsuario();	
	const disableColTipoPago = !tarea.hasTarea("Siaru_DetalleTipoPago");

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
      dataField: "empresaEstablecimientoNroSucursal",
      text: "Estab. Nro.",
      sort: true,
      headerStyle: { width: "120px" },
      style: { textAlign: "center" },
    },
    {
      dataField: "empresaEstablecimiento_Descripcion",
      text: "Estab. nombre",
      sort: true,
      style: { textAlign: "left" },
    },
    {
      dataField: "seccionalDescripcion",
      text: "Seccional",
      sort: true,
	  hidden: x.data[0]?.seccionalId > 0 ? false : true,
      style: { textAlign: "left" },
    },
    {
      dataField: "cantidadTrabajadores",
      text: "Cant. Trab.",
      sort: true,
      headerStyle: { width: "120px" },
      style: { textAlign: "center" },
    },
    {
      dataField: "liquidacionTipoPago_Descripcion",
      text: "Tipo de Pago",
      sort: false,
      hidden: !!disableColTipoPago,
      headerStyle: { width: "120px" },
      style: { textAlign: "center" },
    },
    {
      dataField: "totalRemuneraciones",
      text: "Total remuneraciones",
      sort: true,
      formatter: (v) => Formato.Moneda(v),
      headerStyle: { width: "220px" },
      style: { textAlign: "right" },
    },
    {
      dataField: "interesNeto",
      text: "Capital",
      formatter: (v) => Formato.Moneda(v),
      headerStyle: { width: "150px" },
      style: { textAlign: "right" },
    },
  ];

	const columnsArr =
		typeof columns === "function"
			? AsArray(columns(columnsDef.map((r) => ({ ...r }))), true)
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
