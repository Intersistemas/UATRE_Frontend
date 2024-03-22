import React from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import { pick } from "components/helpers/Utils";

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
		<Modal size="lg" centered show>
			<Modal.Header className={modalCss.modalCabecera}>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<Grid width="200px">
							{hide.codigoDelegacion ? null : (
								<InputMaterial
									label="Delegación - Código"
									error={!!errors.codigoDelegacion}
									helperText={errors.codigoDelegacion ?? ""}
									value={data.codigoDelegacion}
									disabled={!!disabled.codigoDelegacion}
									onChange={(v) => onChange({ codigoDelegacion: v })}
								/>
							)}
						</Grid>
						<Grid grow>
							{hide.nombre ? null : (
								<InputMaterial
									label="Delegación - Nombre"
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={data.nombre}
									disabled={!!disabled.nombre}
									onChange={(v) => onChange({ nombre: v })}
								/>
							)}
						</Grid>
					</Grid>
					{hide.delegado ? null : (
						<Grid width gap="inherit">
							<Grid width="200px">
								<InputMaterial
									label="Delegado - Nro. Afil."
									error={!!errors.delegadoNumero}
									helperText={errors.delegadoNumero ?? ""}
									value={data.delegadoNumero}
									disabled={!!disabled.delegadoNumero}
									onChange={(v) => onChange({ delegadoNumero: v })}
								/>
							</Grid>
							<Grid width="100px">
								<Button
									className="botonAmarillo"
									disabled={!!disabled.delegadoNumero}
									onClick={() => onChange(pick(data, "delegadoNumero"))}
								>
									Valida
								</Button>
							</Grid>
							<Grid grow>
								<InputMaterial
									label="Delegado - Nombre"
									error={!!errors.delegadoNombre}
									helperText={errors.delegadoNombre ?? ""}
									value={data.delegadoNombre}
									disabled={!!disabled.delegadoNombre}
									onChange={(v) => onChange({ delegadoNombre: v })}
								/>
							</Grid>
						</Grid>
					)}
					{hide.subDelegado ? null : (
						<Grid width gap="inherit">
							<Grid width="200px">
								<InputMaterial
									label="Subdelegado - Nro. Afil."
									error={!!errors.subDelegadoNumero}
									helperText={errors.subDelegadoNumero ?? ""}
									value={data.subDelegadoNumero}
									disabled={!!disabled.subDelegadoNumero}
									onChange={(v) => onChange({ subDelegadoNumero: v })}
								/>
							</Grid>
							<Grid width="100px">
								<Button
									className="botonAmarillo"
									disabled={!!disabled.subDelegadoNumero}
									onClick={() => onChange(pick(data, "subDelegadoNumero"))}
								>
									Valida
								</Button>
							</Grid>
							<Grid grow>
								<InputMaterial
									label="Subdelegado - Nombre"
									error={!!errors.subDelegadoNombre}
									helperText={errors.subDelegadoNombre ?? ""}
									value={data.subDelegadoNombre}
									disabled={!!disabled.subDelegadoNombre}
									onChange={(v) => onChange({ subDelegadoNombre: v })}
								/>
							</Grid>
						</Grid>
					)}
					<Grid width gap="inherit">
						{hide.deletedObs ? null : (
							<InputMaterial
								label="Observaciones de baja"
								error={!!errors.deletedObs}
								helperText={errors.deletedObs ?? ""}
								value={data.deletedObs}
								disabled={!!disabled.deletedObs}
								onChange={(v) => onChange({ deletedObs: v })}
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
