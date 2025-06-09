import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import AsArray from "components/helpers/AsArray";
import useQueryQueue from "components/hooks/useQueryQueue";
import FormaPagoPDF from "./FormaPagoPDF";
import Formato from "components/helpers/Formato";
import { insertString } from "components/helpers/Utils";
import useCalculoResarcitorios from "components/hooks/useCalculoResarcitorios";
import Round from "components/helpers/Round";

const FormaPagoViewer = ({ cabecera = {}, formasPago = [], modelo = 0 }) => {
	const { calculoResumen } = useCalculoResarcitorios();
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
			AsArray(formasPago, true).forEach((formaPago) =>
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

	const newCabecera = { ...cabecera };
	const newFormasPago = [];
	formasPago.forEach((formaPago) => {
		const newFormaPago = (() => {
			if (newFormasPago.length) {
				const r = newFormasPago[0];
				r.seccionalId = seccional.id;
				r.seccionalCodigo = seccional.codigo;
				r.seccionalDescripcion = seccional.descripcion;
				r.trabajadores += formaPago.trabajadores ?? 0;
				r.remuneraciones += formaPago.remuneraciones ?? 0;
				r.capital += formaPago.capital ?? 0;
				// r.intereses += formaPago.intereses ?? 0;
				// r.total += formaPago.total ?? 0;
				(
					{
						interes: r.intereses
					} = calculoResumen(
						newCabecera.fechaVencimiento,
						newCabecera.fechaPagoEstimada,
						r.capital
					)
				);
				r.total = Round(r.capital + r.intereses, 2);
				Object.entries(formaPago).forEach(([k, v]) => {
					if (r[k] !== undefined) return;
					r[k] = v;
				});
				return r;
			}
			const r = {
				...formaPago,
				liquidacionTipoPagoId: 4,
				liquidacionTipoPagoDescripcion: "Union",
				lineas: []
			};
			r.trabajadores ??= 0;
			r.remuneraciones ??= 0;
			r.capital ??= 0;
			r.intereses ??= 0;
			r.total ??= 0;
			newFormasPago.push(r);
			return r;
		})();
		AsArray(formaPago.lineas).forEach((linea) => {
			linea.seccional = seccionales.find(({ id }) => id === linea.seccionalId) ?? seccional;
			//unifico lineas por seccional
			const newFormaPagolineaIx = newFormaPago.lineas.findIndex(l => l.seccional?.id === linea.seccional.id);
			if (newFormaPagolineaIx === -1)
			{
				const newLinea = { ...linea };
				newLinea.trabajadores ??= 0;
				newLinea.remuneraciones ??= 0;
				newLinea.capital ??= 0;
				newLinea.intereses ??= 0;
				newLinea.total ??= 0;
				newFormaPago.lineas.push(newLinea);
				return;
			}
			const oldLinea = newFormaPago.lineas[newFormaPagolineaIx];
			oldLinea.trabajadores += linea.trabajadores ?? 0;
			oldLinea.remuneraciones += linea.remuneraciones ?? 0;
			oldLinea.capital += linea.capital ?? 0;
			// oldLinea.intereses += linea.intereses ?? 0;
			// oldLinea.total += linea.total ?? 0;
			(
				{
					interes: oldLinea.intereses
				} = calculoResumen(
					newCabecera.fechaVencimiento,
					newCabecera.fechaPagoEstimada,
					oldLinea.capital
				)
			);
			oldLinea.total = Round(oldLinea.capital + oldLinea.intereses, 2);
		});
	});
	const newFormaPago = newFormasPago.length ? newFormasPago[0] : {};
	if (formasPago.length > 1 && newFormaPago.codigoBarra?.length === 80) {
		// Rearmo codigo de barras de acuerdo al recálulo producto de la union de las formas de pago.
		newFormaPago.codigoBarra = insertString(newFormaPago.codigoBarra, 4, Formato.Mascara(newFormaPago.liquidacionTipoPagoId, "#"));
		newFormaPago.codigoBarra = insertString(newFormaPago.codigoBarra, 39, Formato.Mascara(newFormaPago.total * 100, "#########"));
		newFormaPago.codigoBarra = insertString(newFormaPago.codigoBarra, 48, Formato.Mascara(newFormaPago.trabajadores, "#####"));
		newFormaPago.codigoBarra = insertString(newFormaPago.codigoBarra, 53, Formato.Mascara(seccional.codigo.substring(1), "####"));
	}
	return (
		<PDFViewer style={{ flexGrow: 1 }}>
			<FormaPagoPDF
				cabecera={newCabecera}
				empresa={empresa}
				formasPago={newFormasPago}
				modelo={modelo}
			/>
		</PDFViewer>
	);
};

export default FormaPagoViewer;
