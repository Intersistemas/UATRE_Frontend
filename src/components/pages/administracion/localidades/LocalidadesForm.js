import React from "react";
import { Modal } from "react-bootstrap";

//#region components/helpers
// import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
//#endregion

//#region components/ui
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
// import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import InputMaterial from "components/ui/Input/InputMaterial";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
//#endregion

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const LocalidadesForm = ({
	data = {},
	title = <></>,
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
						<Grid width="35%">
							{hide.codPostal ? null : (
								<InputMaterial
									type="number"
									label="C.P."
									disabled={disabled.codPostal}
									error={!!errors.codPostal}
									helperText={errors.codPostal ?? ""}
									value={data.codPostal}
									onChange={(codPostal) => onChange({ codPostal })}
								/>
							)}
						</Grid>
						<Grid width>
							{hide.nombre ? null : (
								<InputMaterial
									label="Nombre"
									disabled={disabled.nombre}
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={data.nombre}
									onChange={(nombre) => onChange({ nombre })}
								/>
							)}
						</Grid>
					</Grid>
					<Grid width>
						{hide.provincia ? null : (
							<InputMaterial
								label="Provincia"
								disabled={disabled.provincia}
								error={!!errors.provincia}
								helperText={errors.provincia ?? ""}
								value={data.provincia}
								onChange={(provincia) => onChange({ provincia })}
							/>
						)}
					</Grid>
					{hide.deletedDate ? null : (
						<Grid width gap="inherit" col>
							<Grid width gap="inherit">
								<Grid width="35%">
									{hide.deletedDate ? null : (
										<DateTimePicker
											type="date"
											label="Fecha de baja"
											value={data.deletedDate}
											disabled={disabled.deletedDate}
										/>
									)}
								</Grid>
								<Grid width>
									{hide.deletedBy ? null : (
										<InputMaterial
											label="Baja realizada por"
											disabled={disabled.deletedBy}
											error={!!errors.deletedBy}
											helperText={errors.deletedBy ?? ""}
											value={data.deletedBy}
											onChange={(deletedBy) => onChange({ deletedBy })}
										/>
									)}
								</Grid>
							</Grid>
							<Grid width>
								<InputMaterial
									label="Observaciones de baja"
									disabled={disabled.deletedObs}
									error={!!errors.deletedObs}
									helperText={errors.deletedObs ?? ""}
									value={data.deletedObs}
									onChange={(deletedObs) => onChange({ deletedObs })}
								/>
							</Grid>
						</Grid>
					)}
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

export default LocalidadesForm;
