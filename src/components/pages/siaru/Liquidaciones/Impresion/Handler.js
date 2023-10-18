import { PDFViewer } from "@react-pdf/renderer";
import React, { useEffect, useState } from "react";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import Button from "components/ui/Button/Button";
import PDF from "./PDF";
import styles from "./Handler.module.css";
import useQueryQueue from "components/hooks/useQueryQueue";

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
			default:
				return null;
		}
	});

	//#region declaracion y carga de establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		loading: true,
		data: [],
	});
	useEffect(() => {
		const newData = [];
		const query = {
			action: "GetEstablecimientos",
			params: { empresaId: empresa.id, pageIndex: 1 },
		};
		query.onOk = async (res) => {
			let { index, pages, data } = res;
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
	}, [pushQuery, empresa]);

	//#region declaracion y carga de tiposPago
	const [tiposPago, setTiposPago] = useState({ loading: true, data: [] });
	useEffect(() => {
		pushQuery({
			action: "GetLiquidacionesTiposPagos",
			onOk: async (res) => setTiposPago({ data: res }),
			onError: async (err) => setTiposPago({ error: { ...err }, data: [] }),
		});
	}, [pushQuery]);

	let pdfRender;
	if (establecimientos.loading || tiposPago.loading) {
		pdfRender = <h4>Cargando datos...</h4>;
	} else if (establecimientos.error) {
		pdfRender = (
			<h4 style={{ color: "red" }}>
				Error cargando datos... {establecimientos?.error?.Mensaje ?? ""}
			</h4>
		);
	} else {
		pdfRender = (
			<PDFViewer style={{ flexGrow: "1" }}>
				<PDF
					empresa={empresa}
					data={liquidaciones.map((liquidacion) => ({
						liquidacion: liquidacion,
						establecimiento: establecimientos.data.find(
							(establecimiento) =>
								establecimiento.id === liquidacion.empresaEstablecimientoId ?? 0
						) ?? {},
						tipoPago: tiposPago.data.find(
							(tipoPago) =>
								tipoPago.id === liquidacion?.liquidacionTipoPagoId ?? 0
						) ?? {},
					}))}
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
								FINALIZA
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default Handler;
