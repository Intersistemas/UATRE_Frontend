import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import Button from "components/ui/Button/Button";
import useQueryQueue from "components/hooks/useQueryQueue";
import PDF from "./PDF";
import styles from "./Handler.module.css";

const Handler = ({
	empresa = {},
	liquidaciones = [],
	onClose = () => {},
} = {}) => {
	empresa ??= {};
	liquidaciones ??= [];
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetLiquidacionesTiposPagos":
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesTiposPagos`,
						method: "GET",
					},
				};
			case "GetEstablecimientos":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
						method: "GET",
					},
				};
			case "GetSeccionales":
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/GetSeccionalesSpecs`,
						method: "GET",
					},
				};
			default:
				return null;
		}
	});

	//#region declaracion y carga de tiposPago
	const [tiposPago, setTiposPago] = useState({ loading: true, data: [] });
	useEffect(() => {
		if (!tiposPago.loading) return;
		pushQuery({
			action: "GetLiquidacionesTiposPagos",
			onOk: async (res) => setTiposPago({ data: res }),
			onError: async (err) => setTiposPago({ error: { ...err }, data: [] }),
		});
	}, [pushQuery, tiposPago]);
	//#endregion

	//#region declaracion y carga de establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		loading: true,
		params: { empresaId: empresa.id, pageIndex: 1 },
		data: [],
	});
	useEffect(() => {
		if (!establecimientos.loading) return;
		const newData = [];
		const query = {
			action: "GetEstablecimientos",
			params: {...establecimientos.params},
		};
		query.onOk = async ({ index, pages, data }) => {
			data.forEach((r) => newData.push(r));
			if (index < pages) {
				query.params = { ...query.params, pageIndex: index + 1 };
				pushQuery(query);
			} else {
				setEstablecimientos({ data: newData });
			}
		};
		query.onError = async (err) => setEstablecimientos({ error: err });
		pushQuery(query);
	}, [pushQuery, establecimientos]);
	//#endregion

	//#region declaracion y carga de seccionales
	const [seccionales, setSeccionales] = useState({ loading: true, data: [] });
	useEffect(() => {
		if (!seccionales.loading) return;
		if (establecimientos.loading) return;
		const localidades = establecimientos.data
			.filter((r) => r?.domicilioLocalidadesId)
			.map((r) => r.domicilioLocalidadesId)
			.filter((v, i, a) => a.indexOf(v) === i);
		const newData = [];
		if (localidades.length === 0) {
			setSeccionales({ data: newData });
			return;
		}
		localidades.forEach((localidadId) => {
			pushQuery({
				action: "GetSeccionales",
				params: { localidadId: localidadId },
				onOk: async (res) =>
					newData.push({ localidadId: localidadId, seccional: res.shift() }),
				onError: async (err) =>
					newData.push({ localidadId: localidadId, error: err }),
				onFinally: () => {
					if (newData.length === localidades.length)
						setSeccionales({ data: newData });
				},
			});
		});
	}, [pushQuery, seccionales, establecimientos]);
	//#endregion

	let pdfRender;
	if (establecimientos.loading || tiposPago.loading || seccionales.loading) {
		pdfRender = <h4>Cargando datos...</h4>;
	} else if (establecimientos.error || tiposPago.error || seccionales.data.find(r => r?.error)) {
		pdfRender = (
			<h4 style={{ color: "red" }}>
				Error cargando datos... {establecimientos?.error?.message ?? ""}
			</h4>
		);
	} else {
		pdfRender = (
			<PDFViewer style={{ flexGrow: "1" }}>
				<PDF
					empresa={empresa}
					data={liquidaciones.map((liquidacion) => {
						const retorno = {
							liquidacion: liquidacion,
							establecimiento:
								establecimientos.data.find(
									(establecimiento) =>
										establecimiento.id ===
											liquidacion.empresaEstablecimientoId ?? 0
								) ?? {},
							tipoPago:
								tiposPago.data.find(
									(tipoPago) =>
										tipoPago.id === liquidacion?.liquidacionTipoPagoId ?? 0
								) ?? {},
						};
						retorno.seccional =
							seccionales.data.find(
								(seccional) =>
									seccional.localidadId ===
										retorno.establecimiento.domicilioLocalidadesId ?? 0
							)?.seccional ?? {};
						return retorno;
					})}
				/>
			</PDFViewer>
		);
	}

	const gap = 10;
	return (
		<Modal onClose={onClose}>
			<Grid className={styles.content} col gap={`${gap}px`} full>
				<Grid gap={`${gap}px`} grow full="width">
					{pdfRender}
				</Grid>
				<Grid gap={`${gap}px`} full="width">
					<Grid grow />
					<Grid col width="30%" justify="end">
						<Grid gap={`${gap}px`}>
							<Button className="botonAmarillo" onClick={onClose}>
								Finaliza
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default Handler;
