import React from "react";
import { Modal } from "react-bootstrap";
import { PDFViewer as ReactPDFViewer } from "@react-pdf/renderer";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import PDF from "./PDF";

/**
 * @typedef {import("components/pages/afiliados/Padron/PadronPDF").SeccionalAfiliados} SeccionalAfiliados
 */

const onCloseDef = () => {};

/**
 * @param {object} props
 * @param {SeccionalAfiliados[]} props.data Datos de seccionales a imprimir su padron de afiliados.
 * @param {onCloseDef} props.onClose Handler al cerrar el modal
 * @param {ambitoUser{}} props.ambitoUser dato del ambito del usuario
 */
const PDFViewer = ({ data, onClose = onCloseDef, ambitoUser }) => {
	// const { audit } = useAuditoriaProceso();
	// audit({
	// 	proceso: "AfiliadoCarnet",
	// 	parametros: data.map((r) =>
	// 		pick(r, ["id", "cuil", "nroAfiliado", "nombre"])
	// 	),
	// });
	//console.log("ambitoUser_pdfViewer", ambitoUser);
	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				Afiliados por seccional
			</Modal.Header>
			<Modal.Body style={{ height: "70vh" }}>
				<Grid col full gap="15px">
					<ReactPDFViewer style={{ flexGrow: "1" }}>
						<PDF data={data} ambitoUser={ambitoUser}/>
					</ReactPDFViewer>
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid col gap="5px">
					<Grid gap="20px" justify="end">
						<Grid width="150px">
							<Button className="botonAmarillo" onClick={onClose}>
								FINALIZA
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default PDFViewer;
