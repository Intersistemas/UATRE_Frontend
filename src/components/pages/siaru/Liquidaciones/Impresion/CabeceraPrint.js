import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AsArray from "components/helpers/AsArray";
import Round from "components/helpers/Round";
import useQueryQueue from "components/hooks/useQueryQueue";
import CabeceraPDF from "./CabeceraPDF";

const CabeceraPrint = ({ data }) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetParameter": {
				const { paramName, ...paramOthers } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Parametros/${paramName}`,
						method: "GET",
					},
					params: paramOthers,
				};
			}
			case "GetEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/GetEmpresaSpecs`,
						method: "GET",
					},
				};
			}
			case "GetEstablecimiento": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/EmpresaEstablecimientos/GetById`,
						method: "GET",
					},
				};
			}
			case "GetLiquidacionesTiposPagos": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/v1/LiquidacionesTiposPagos`,
						method: "GET",
					},
				};
			}
			case "GetBarcode": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/Liquidaciones/GenerarCodigoBarras`,
						method: "PATCH",
						okType: "text",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region declaración y carga de dependencias
	const [dependencias, setDependencias] = useState({
		loading: "Cargando...",
		parametros: {
			LiquidacionTipoPagoIdSindical: 0,
			LiquidacionTipoPagoIdSolidario: 0,
		},
		cuit: data.empresaCUIT,
		establecimientos: AsArray(data?.liquidaciones)
			.map((r) => r.empresaEstablecimientoId)
			.filter((v, i, a) => v && a.indexOf(v) === i),
		liquidaciones: AsArray(data?.liquidaciones).map(({ id }) => id),
		data: {
			parametros: null,
			empresa: null,
			establecimientos: null,
			tiposPago: null,
			codigosBarra: null,
		},
		errors: null,
	});
	useEffect(() => {
		if (!dependencias.loading) return;
		const changes = {
			loading: null,
			data: { ...dependencias.data },
			errors: null,
		};
		const setData = (value, error) => {
			Object.keys(value).forEach((k) => {
				changes.data[k] = value[k];
				if (!error) return;
				changes.errors ??= {};
				changes.errors[k] = error;
			});
		};
		const applyChanges = () => {
			if (Object.keys(changes.data).filter((k) => !changes.data[k]).length)
				return;
			setDependencias((o) => ({ ...o, ...changes }));
		};
		if (!changes.data.parametros) {
			const parametros = {};
			const errores = [];
			const setParam = ({ nombre, valor }) =>
				(parametros[nombre] =
					{ number: Number(valor), boolean: !!valor }[
						typeof dependencias.parametros[nombre]
					] ?? valor);
			Object.keys(dependencias.parametros).forEach((paramName) => {
				pushQuery({
					action: "GetParameter",
					params: { paramName },
					onOk: async (ok) => setParam(ok),
					onError: async (error) => {
						setParam({
							nombre: paramName,
							valor: dependencias.parametros[paramName],
						});
						errores.push(error);
					},
					onFinally: async () => {
						if (
							Object.keys(dependencias.parametros).length !==
							Object.keys(parametros).length
						)
							return;
						setData({ parametros }, errores.length ? errores : null);
					},
				});
			});
		}
		if (!changes.data.empresa) {
			const cuit = dependencias.cuit;
			pushQuery({
				action: "GetEmpresa",
				params: { cuit },
				onOk: async (empresa) => setData({ empresa }),
				onError: async (error) => setData({ empresa: {} }, error),
				onFinally: async () => applyChanges(),
			});
		}
		if (!changes.data.establecimientos) {
			const establecimientos = [];
			const errores = [];
			dependencias.establecimientos.forEach((id) => {
				pushQuery({
					action: "GetEstablecimiento",
					params: { id },
					onOk: async (ok) => establecimientos.push(ok),
					onError: async (error) => errores.push(error),
					onFinally: async () => {
						if (
							dependencias.establecimientos.length !==
							establecimientos.length + errores.length
						)
							return;
						setData({ establecimientos }, errores.length ? errores : null);
						applyChanges();
					},
				});
			});
			if (!dependencias.establecimientos.length) {
				setData({ establecimientos });
				applyChanges();
			}
		}
		if (!changes.data.tiposPago) {
			pushQuery({
				action: "GetLiquidacionesTiposPagos",
				onOk: async (tiposPago) => setData({ tiposPago }),
				onError: async (error) => setData({ tiposPago: [] }, error),
				onFinally: async () => applyChanges(),
			});
		}
		if (!changes.data.codigosBarra) {
			const codigosBarra = [];
			const errores = [];
			dependencias.liquidaciones.forEach((id) => {
				pushQuery({
					action: "GetBarcode",
					params: { liquidacionId: id },
					onOk: async (codigoBarra) => codigosBarra.push({ id, codigoBarra }),
					onError: async (error) => errores.push(error),
					onFinally: async () => {
						if (
							dependencias.liquidaciones.length !=
							codigosBarra.length + errores.length
						)
							return;
						setData({ codigosBarra }, errores.length ? errores : null);
						applyChanges();
					},
				});
			});
		}
	}, [dependencias, pushQuery]);
	//#endregion

	if (dependencias.loading) return <h4>Cargando datos...</h4>;

	if (dependencias.errors) console.error({ errors: dependencias.errors });

	const { empresa, establecimientos, tiposPago, parametros, codigosBarra } =
		dependencias.data;

	const { totalAporte, totalIntereses } = data;
	data.totalImporte = Round(totalAporte + totalIntereses, 2)

	data.totalSindical = 0;
	data.totalSolidario = 0;
	const liquidaciones = AsArray(data.liquidaciones);
	liquidaciones.forEach((liquidacion) => {
		liquidacion.establecimiento =
			establecimientos.find(
				({ id }) => id === liquidacion.empresaEstablecimientoId
			) ?? {};

		liquidacion.tipoPago =
			tiposPago.find(({ id }) => id === liquidacion.liquidacionTipoPagoId) ??
			{};

		const { interesImporte = 0, interesNeto = 0 } = liquidacion;
		const { LiquidacionTipoPagoIdSindical, LiquidacionTipoPagoIdSolidario } =
			parametros;

		liquidacion.importeTotal = Round(interesImporte + interesNeto, 2);
		liquidacion.codigoBarra =
			codigosBarra.find(({ id }) => id === liquidacion.id)?.codigoBarra ?? "";

		switch (liquidacion.liquidacionTipoPagoId) {
			case LiquidacionTipoPagoIdSindical: {
				data.totalSindical += liquidacion.importeTotal;
				break;
			}
			case LiquidacionTipoPagoIdSolidario: {
				data.totalSolidario += liquidacion.importeTotal;
				break;
			}
			default: {
				break;
			}
		}
	});
	data.totalSindical = Round(data.totalSindical, 2);
	data.totalSolidario = Round(data.totalSolidario, 2);

	const cabecera = { ...data, empresa, liquidaciones };
	console.log({ cabecera });

	return (
		<PDFViewer style={{ flexGrow: 1 }}>
			<CabeceraPDF data={cabecera} />
		</PDFViewer>
	);
};

export default CabeceraPrint;
