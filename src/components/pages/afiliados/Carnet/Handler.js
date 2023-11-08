import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import Button from "components/ui/Button/Button";
import useQueryQueue from "components/hooks/useQueryQueue";
import PDF from "./PDF";

const Handler = ({ afiliado = {}, onClose = () => {} } = {}) => {
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetSeccionales": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/GetSeccionalesSpecs`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});

	//#region declaracion y carga de seccionales
	const [seccional, setSeccional] = useState({
		loading: "Cargando...",
		// params: { localidadId: afiliado.refLocalidadId },
		params: {},
		seccionalId: afiliado.seccionalId,
		data: {},
		error: {},
	});
	useEffect(() => {
		if (!seccional.loading) return;
		pushQuery({
			action: "GetSeccionales",
			params: seccional.params,
			onOk: async (res) =>
				setSeccional((old) => ({
					...old,
					loading: null,
					data: res.find((r) => r.id === seccional.seccionalId) ?? {},
					error: null,
				})),
			onError: async (err) =>
				setSeccional((old) => ({
					...old,
					loading: null,
					data: {},
					error: err,
				})),
		});
	}, [pushQuery, seccional]);
	//#endregion

	let pdfRender;
	if (seccional.loading) pdfRender = seccional.loading;
	else
		pdfRender = (
			<PDFViewer style={{ flexGrow: "1" }}>
				<PDF afiliado={afiliado} seccional={seccional.data} />
			</PDFViewer>
		);

	return (
		<Modal onClose={onClose}>
			<Grid col gap="10px" full>
				<Grid gap="inherit" grow full="width">
					{pdfRender}
				</Grid>
				<Grid gap="inherit" full="width">
					<Grid grow />
					<Grid col width="30%" justify="end" gap="inherit">
						<Grid gap="inherit">
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
