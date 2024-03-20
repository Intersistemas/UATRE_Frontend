import React from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const DelegacionesForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};
	data.codigoDelegacion ??= "";
	data.nombre ??= "";

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show /*onHide={() => onClose()}*/>
			<Modal.Header className={modalCss.modalCabecera}>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="15px">
						<Grid width="25%">
							{hide.codigoDelegacion ? null : (
								<InputMaterial
									label="Cód. delegación"
									error={!!errors.codigoDelegacion}
									helperText={errors.codigoDelegacion ?? ""}
									value={data.codigoDelegacion}
									disabled={disabled.codigoDelegacion ?? false}
									onChange={(value, _id) =>
										onChange({ codigoDelegacion: value })
									}
								/>
							)}
						</Grid>
						<Grid width="75%">
							{hide.nombre ? null : (
								<InputMaterial
									label="Nombre"
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={data.nombre}
									disabled={disabled.nombre ?? false}
									onChange={(value, _id) => onChange({ nombre: value })}
								/>
							)}
						</Grid>
					</Grid>
					<Grid width="full" gap="15px">
						{hide.deletedObs ? null : (
							<InputMaterial
								label="Observaciones de baja"
								error={!!errors.deletedObs}
								helperText={errors.deletedObs ?? ""}
								value={data.deletedObs}
								disabled={disabled.deletedObs ?? false}
								onChange={(value, _id) => onChange({ deletedObs: value })}
							/>
						)}
					</Grid>
				</Grid>
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

export default DelegacionesForm;
