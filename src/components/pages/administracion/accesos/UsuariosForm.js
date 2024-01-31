import React from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import UseKeyPress from "components/helpers/UseKeyPress";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const UsuariosForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};
	data.codigoUsuario ??= "";
	data.nombre ??= "";

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
			<Modal.Header closeButton>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="15px">
						<Grid width="25%">
							{hide.codigoUsuario ? null : (
								<InputMaterial
									label="Cód. delegación"
									error={!!errors.codigoUsuario}
									helperText={errors.codigoUsuario ?? ""}
									value={data.codigoUsuario}
									disabled={disabled.codigoUsuario ?? false}
									onChange={(value, _id) =>
										onChange({ codigoUsuario: value })
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

export default UsuariosForm;