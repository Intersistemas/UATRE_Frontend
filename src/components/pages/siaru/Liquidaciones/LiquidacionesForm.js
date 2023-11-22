import React from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import UseKeyPress from "components/helpers/UseKeyPress";
import { useSelector } from "react-redux";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const LiquidacionesForm = ({
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

	const empresa = useSelector((state) => state.empresa);
	if (empresa?.id == null) onClose();

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
			<Modal.Header closeButton>{title}</Modal.Header>
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

export default LiquidacionesForm;