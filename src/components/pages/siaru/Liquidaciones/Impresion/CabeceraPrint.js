import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AsArray from "components/helpers/AsArray";
import Round from "components/helpers/Round";
import useQueryQueue from "components/hooks/useQueryQueue";
import CabeceraPDF from "./CabeceraPDF";
import Formato from "components/helpers/Formato";
import dayjs from "dayjs";

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
			case "GetSeccional": {
				const { id, ...others } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/${id}`,
						method: "GET",
					},
					params: others,
				};
			}
			case "GetProvincias": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Provincia`,
						method: "GET",
					},
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
			case "GetSeccionalesSpecs": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/GetSeccionalesSpecs`,
						method: "POST",
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
			SeccionalIdPorDefecto: 0,
		},
		cuit: data.empresaCUIT,
		establecimientos: AsArray(data?.liquidaciones)
			.map((r) => r.empresaEstablecimientoId)
			.filter((v, i, a) => v && a.indexOf(v) === i),
		liquidaciones: AsArray(data?.liquidaciones).map(({ id }) => id),
		tiposPago: AsArray(data?.liquidaciones)
			.map(({ liquidacionTipoPagoId }) => liquidacionTipoPagoId)
			.filter((v, i, a) => a.indexOf(v) === i),
		data: {
			parametros: null,
			seccional: null,
			empresa: null,
			establecimientos: null,
			seccionales: null,
			tiposPago: null,
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
		const setData = (value, error = {}) => {
			Object.keys(value).forEach((k) => {
				changes.data[k] = value[k];
				if (!error[k]) return;
				changes.errors ??= {};
				changes.errors[k] = error[k];
			});
		};
		const applyChanges = () => {
			if (Object.keys(changes.data).filter((k) => !changes.data[k]).length)
				return;
			setDependencias((o) => ({ ...o, ...changes }));
		};
		if (!changes.data.parametros) {
			const onLoadParam = (paramName) => {
				switch (paramName) {
					case "SeccionalIdPorDefecto": {
						if (changes.data.seccional) return;
						return pushQuery({
							action: "GetSeccional",
							params: { id: changes.data.parametros[paramName] },
							onOk: async (seccional) => setData({ seccional }),
							onError: async (seccional) =>
								setData({ seccional: {} }, { seccional }),
							onFinally: async () => applyChanges(),
						});
					}
					default:
						return;
				}
			};
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
						setData(
							{ parametros },
							{ parametros: errores.length ? errores : null }
						);
						onLoadParam(paramName);
					},
				});
			});
		}
		if (!changes.data.provincias) {
			pushQuery({
				action: "GetProvincias",
				onOk: async (provincias) => setData({ provincias }),
				onError: async (provincias) =>
					setData({ provincias: [] }, { provincias }),
				onFinally: async () => applyChanges(),
			});
		}
		if (!changes.data.empresa) {
			const cuit = dependencias.cuit;
			pushQuery({
				action: "GetEmpresa",
				params: { cuit },
				onOk: async (empresa) => setData({ empresa }),
				onError: async (empresa) => setData({ empresa: {} }, { empresa }),
				onFinally: async () => applyChanges(),
			});
		}
		if (!changes.data.establecimientos) {
			const establecimientos = [];
			const erroresEstab = [];
			const seccionales = [];
			const erroresSecc = [];
			dependencias.establecimientos.forEach((id) => {
				pushQuery({
					action: "GetEstablecimiento",
					params: { id },
					onOk: async (establecimiento) =>
						establecimientos.push(establecimiento),
					onError: async (error) => erroresEstab.push(error),
					onFinally: async () => {
						if (
							dependencias.establecimientos.length !==
							establecimientos.length + erroresEstab.length
						)
							return;
						const estabLoc = establecimientos
							.map((r) => r.domicilioLocalidadesId)
							.filter((v, i, a) => v && i === a.indexOf(v));
						const estabLocSecc = [];
						const applyEstab = () => {
							setData(
								{
									establecimientos,
									seccionales: seccionales.filter(
										(v, i, a) =>
											i === a.indexOf(seccionales.find(({ id }) => id === v.id))
									),
								},
								{
									establecimientos: erroresEstab.length ? erroresEstab : null,
									seccionales: erroresSecc.length ? erroresSecc : null,
								}
							);
							applyChanges();
						};
						estabLoc.forEach((localidadId) => {
							pushQuery({
								action: "GetSeccionalesSpecs",
								config: {
									body: {
										localidadId,
										soloActivos: true,
										pageIndex: 1,
										pageSize: 1,
									},
								},
								onOk: async ({ data }) => {
									if (!Array.isArray(data) || !data.length) return;
									establecimientos
										.filter((r) => r.domicilioLocalidadesId === localidadId)
										.forEach((estab) => (estab.seccionalId = data[0].id));
									seccionales.push(data[0]);
								},
								onError: async (error) => erroresSecc.push(error),
								onFinally: async () => {
									estabLocSecc.push(localidadId);
									if (estabLocSecc.length !== estabLoc.length) return;
									applyEstab();
								},
							});
						});
						if (estabLoc.length === 0) {
							applyEstab();
						}
					},
				});
			});
			if (!dependencias.establecimientos.length) {
				setData({ establecimientos, seccionales });
				applyChanges();
			}
		}
		if (!changes.data.tiposPago) {
			pushQuery({
				action: "GetLiquidacionesTiposPagos",
				onOk: async (tiposPagoList) =>
					setData({
						tiposPago: dependencias.tiposPago.map(
							(tipoPagoId) =>
								AsArray(tiposPagoList).find(({ id }) => id === tipoPagoId) ?? {
									id: tipoPagoId,
								}
						),
					}),
				onError: async (tiposPago) => setData({ tiposPago: [] }, { tiposPago }),
				onFinally: async () => applyChanges(),
			});
		}
	}, [dependencias, pushQuery]);
	//#endregion

	if (dependencias.loading) return <h4>Cargando datos...</h4>;

	if (dependencias.errors) console.error({ errors: dependencias.errors });

	const {
		empresa,
		tiposPago,
		seccional,
		seccionales,
		establecimientos /*, parametros*/,
	} = dependencias.data;

	const liquidaciones = AsArray(data.liquidaciones);

	tiposPago.forEach((tipoPago) => {
		tipoPago.trabajadores = 0;
		tipoPago.remuneraciones = 0;
		tipoPago.capital = 0;
		tipoPago.intereses = 0;
		tipoPago.total = 0;
		tipoPago.seccionales = [];
		liquidaciones
			.filter(
				({ liquidacionTipoPagoId }) => liquidacionTipoPagoId === tipoPago.id
			)
			.forEach((liquidacion) => {
				tipoPago.trabajadores += liquidacion.cantidadTrabajadores ?? 0;
				tipoPago.remuneraciones += liquidacion.totalRemuneraciones ?? 0;
				tipoPago.capital += liquidacion.interesNeto ?? 0;
				tipoPago.intereses += liquidacion.interesImporte ?? 0;

				const establecimiento =
					establecimientos.find(
						({ id }) => id === liquidacion.empresaEstablecimientoId
					) ?? {};
				const estabSecc =
					seccionales.find(({ id }) => id === establecimiento.seccionalId) ??
					seccional;
				let tipoPagoSecc = tipoPago.seccionales.find(
					({ id }) => id === estabSecc.id
				);
				if (!tipoPagoSecc) {
					tipoPagoSecc = {
						...estabSecc,
						trabajadores: 0,
						remuneraciones: 0,
						capital: 0,
						intereses: 0,
						total: 0,
					};
					tipoPago.seccionales.push(tipoPagoSecc);
				}

				tipoPagoSecc.trabajadores += liquidacion.cantidadTrabajadores ?? 0;
				tipoPagoSecc.remuneraciones += liquidacion.totalRemuneraciones ?? 0;
				tipoPagoSecc.capital += liquidacion.interesNeto ?? 0;
				tipoPagoSecc.intereses += liquidacion.interesImporte ?? 0;
			});
		tipoPago.remuneraciones = Round(tipoPago.remuneraciones, 2);
		tipoPago.capital = Round(tipoPago.capital, 2);
		tipoPago.intereses = Round(tipoPago.intereses, 2);
		tipoPago.total = Round(tipoPago.capital + tipoPago.intereses, 2);
		tipoPago.codigoBarra = (({
			convenio = "0080",
			concepto = `${tipoPago.id ?? 0}`[0],
			tipoLiquidacion = data.tipoLiquidacion ?? 0,
			periodoActa = Formato.Mascara(
				(data.tipoLiquidacion ?? 0) === 0 ? data.periodo ?? 0 : data.acta ?? 0,
				"######"
			),
			cuit = Formato.Mascara(data.empresaCUIT, "###########"),
			fechVto = dayjs(data.fechaVencimiento)?.format("YYYYMMDD") ?? "00000000",
			nroBoleta = Formato.Mascara(data.id, "########"),
			totalPagar = Formato.Mascara(Round(tipoPago.total * 100, 0), "#########"),
			cantTrab = Formato.Mascara(tipoPago.trabajadores, "#####"),
			secc = `${seccional.codigo ?? ""}`.slice(1),
			digitoVerif = "0",
			completa = "0".repeat(22),
		} = {}) =>
			convenio +
			concepto +
			tipoLiquidacion +
			periodoActa +
			cuit +
			fechVto +
			nroBoleta +
			totalPagar +
			cantTrab +
			secc +
			digitoVerif +
			completa)();
		tipoPago.seccionales.forEach((tipoPagoSecc) => {
			tipoPagoSecc.remuneraciones = Round(tipoPagoSecc.remuneraciones, 2);
			tipoPagoSecc.capital = Round(tipoPagoSecc.capital, 2);
			tipoPagoSecc.intereses = Round(tipoPagoSecc.intereses, 2);
			tipoPagoSecc.total = Round(
				tipoPagoSecc.capital + tipoPagoSecc.intereses,
				2
			);
		});
	});

	const cabecera = { ...data, empresa, tiposPago, seccional };

	return (
		<PDFViewer style={{ flexGrow: 1 }}>
			<CabeceraPDF data={cabecera} />
		</PDFViewer>
	);
};

export default CabeceraPrint;
