import React from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import CheckboxMaterial from "components/ui/Checkbox/CheckboxMaterial";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const CIIUForm = ({
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
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				{title}
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="inherit">
						<Grid width="25%">
							{hide.ciiu ? null : (
								<InputMaterial
									type="number"
									label="CIIU"
									disabled={disabled.ciiu}
									error={!!errors.ciiu}
									helperText={errors.ciiu ?? ""}
									value={data.ciiu}
									onChange={(ciiu) => onChange({ ciiu })}
								/>
							)}
						</Grid>
						<Grid width="50%">
							{hide.descripcion ? null : (
								<InputMaterial
									id="descripcion"
									label="Descripción"
									disabled={disabled.descripcion}
									error={!!errors.descripcion}
									helperText={errors.descripcion ?? ""}
									value={data.descripcion}
									onChange={(descripcion) => onChange({ descripcion })}
								/>
							)}
						</Grid>
						<Grid width="25%" gap="inherit">
							{hide.formulario ? null : (
								<InputMaterial
									type="number"
									label="Formulario"
									value={data.formulario}
									disabled={!!disabled.formulario}
									error={!!errors.formulario}
									helperText={errors.formulario}
									onChange={(formulario) => onChange({ formulario })}
								/>
							)}
							{hide.esRural ? null : (
								<CheckboxMaterial
									id="esRural"
									label="Es Rural"
									disabled={disabled.esRural}
									error={!!errors.esRural}
									helperText={errors.esRural ?? ""}
									value={data.esRural}
									onChange={(esRural) => onChange({ esRural })}
								/>
							)}
						</Grid>
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

export default CIIUForm;
