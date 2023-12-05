import React from "react";
import { Modal } from "react-bootstrap";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import UseKeyPress from "components/helpers/UseKeyPress";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const LiquidacionesNominaForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};
	
	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>{title}</Modal.Header>
			<Modal.Body>
				En desarrollo
			</Modal.Body>
			<Modal.Footer>
				<Grid gap="20px">
					<Grid width="150px">
						<Button className="botonAzul" onClick={() => onClose(true)}>
							CONFIRMA
						</Button>
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={() => onClose()}>
							CANCELA
						</Button>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default LiquidacionesNominaForm;