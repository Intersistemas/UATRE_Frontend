import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AsArray from "components/helpers/AsArray";
import useQueryQueue from "components/hooks/useQueryQueue";
import FormaPagoPDF from "./FormaPagoPDF";

const FormaPagoViewer = ({ cabecera = {}, formasPago = [] }) => {
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
			case "GetEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/GetEmpresaSpecs`,
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
		parametros: { SeccionalIdPorDefecto: 0 },
		cuit: cabecera.empresaCUIT,
		seccionales: (() => {
			const seccionales = [];
			formasPago.forEach((formaPago) =>
				seccionales.push(...AsArray(formaPago.lineas).map((r) => r.seccionalId))
			);
			return seccionales.filter((v, i, a) => a.indexOf(v) === i);
		})(),
		data: {
			parametros: null,
			empresa: null,
			seccional: null,
			seccionales: null,
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
		if (!changes.data.seccionales) {
			const seccionales = [];
			const erroresSecc = [];
			dependencias.seccionales.forEach((id) => {
				pushQuery({
					action: "GetSeccional",
					params: { id },
					onOk: async (seccional) => seccionales.push(seccional),
					onError: async (error) => erroresSecc.push(error),
					onFinally: async () => {
						if (
							dependencias.seccionales.length !==
							seccionales.length + erroresSecc.length
						)
							return;
						setData(
							{ seccionales },
							{ seccionales: erroresSecc.length ? erroresSecc : null }
						);
						applyChanges();
					},
				});
			});
			if (!dependencias.seccionales.length) {
				setData({ seccionales });
				applyChanges();
			}
		}
	}, [dependencias, pushQuery]);
	//#endregion

	if (dependencias.loading) return <h4>Cargando datos...</h4>;

	if (dependencias.errors) console.error({ errors: dependencias.errors });

	const { empresa, seccional, seccionales } = dependencias.data;

	formasPago.forEach((formaPago) =>
		AsArray(formaPago.lineas).forEach(
			(linea) =>
				(linea.seccional =
					seccionales.find((id) => id === linea.seccionalId) ?? seccional)
		)
	);

	return (
		<PDFViewer style={{ flexGrow: 1 }}>
			<FormaPagoPDF
				cabecera={cabecera}
				empresa={empresa}
				formasPago={formasPago}
			/>
		</PDFViewer>
	);
};

export default FormaPagoViewer;
