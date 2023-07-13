import { PDFViewer } from "@react-pdf/renderer";
import React, { useEffect, useState } from "react";
import Grid from "../../../../ui/Grid/Grid";
import Modal from "../../../../ui/Modal/Modal";
import Button from "../../../../ui/Button/Button";
import PDF from "./PDF";
import styles from "./Handler.module.css";
import useHttp from "../../../../hooks/useHttp";

const Handler = ({
	liquidacion,
	empresa,
	onClose = () => {},
} = {}) => {
	const { sendRequest } = useHttp();

	//#region declaracion e inicializacion de establecimiento
	const establecimientoId = liquidacion?.empresaEstablecimientoId ?? 0;
	const [establecimiento, setEstablecimiento] = useState({ loading: true, data: {}});
	useEffect(() => {
		sendRequest(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetById?Id=${establecimientoId}`,
				method: "GET",
			},
			async (res) => setEstablecimiento({ data: { ...res } }),
			async (err) => setEstablecimiento({ error: { ...err } })
		);
	}, [establecimientoId, sendRequest]);
	//#endregion

	//#region declaracion e inicializacion de tipo de pago
	const tipoPagoId = liquidacion?.liquidacionTipoPagoId ?? 0;
	const [tipoPago, setTipoPago] = useState({ loading: true, data: {}});
	useEffect(() => {
		sendRequest(
			{
				baseURL: "SIARU",
				endpoint: `/LiquidacionesTiposPagos/${tipoPagoId}`,
				method: "GET",
			},
			async (res) => setTipoPago({ data: { ...res } }),
			async (err) => setTipoPago({ error: { ...err }, data: {} })
		);
	}, [tipoPagoId, sendRequest]);
	//#endregion

	let pdfRender;
	if (establecimiento.loading || tipoPago.loading) {
		pdfRender = <h4>Cargando datos...</h4>;
	} else if (establecimiento.error) {
		pdfRender = (
			<h4 style={{ color: "red" }}>
				Error cargando datos... {establecimiento?.error?.Mensaje ?? ""}
			</h4>
		);
	} else {
		pdfRender = (
			<PDFViewer style={{ flexGrow: "1" }}>
				<PDF
					liquidacion={liquidacion}
					empresa={empresa}
					establecimiento={establecimiento.data}
					tipoPago={tipoPago.data}
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
							<Button className="botonBlanco" onClick={onClose}>
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
