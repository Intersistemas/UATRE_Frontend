import React from "react";
import { Modal } from "react-bootstrap";
import { PDFViewer } from "@react-pdf/renderer";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import LotePDF from "./LotePDF";
import useAuditoriaProceso from "components/hooks/useAuditoriaProceso";
import { pick } from "components/helpers/Utils";

const onCloseDef = () => {};

/**
 * @param {object} props
 * @param {array} props.data Datos de afiliados a imprimirles credenciales.
 * @param {onCloseDef} props.onClose Handler al cerrar el modal
 */
const LotePDFViewer = ({ data, onClose = onCloseDef }) => {
	const { audit } = useAuditoriaProceso();
	audit({
		proceso: "AfiliadoCarnet",
		parametros: data.map((r) =>
			pick(r, ["id", "cuil", "nroAfiliado", "nombre"])
		),
	});
	return (
		<Modal size="xl" centered show onHide={onClose}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Credenciales de afiliados
			</Modal.Header>
			<Modal.Body style={{ height: "70vh" }}>
				<Grid col full gap="15px">
					<PDFViewer style={{ flexGrow: "1" }}>
						<LotePDF data={data} />
					</PDFViewer>
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

export default LotePDFViewer;
