import React from "react";
import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";

const DelegacionesForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = (changes = {}) => {},
	onClose = (confirm = false) => {},
}) => {
	data ??= {};
	data.codigoDelegacion ??= "";
	data.nombre ??= "";

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	return (
		<Modal onClose={() => onClose(false)}>
			<Grid col full gap="15px">
				<Grid className={modalCss.modalCabecera} width="full" justify="center">
					<h3>{title}</h3>
				</Grid>
				<Grid width="full" gap="15px">
					<Grid width="25%">
						{hide.codigoDelegacion ? null : (
							<InputMaterial
								label="Cód. delegación"
								error={!!errors.codigoDelegacion}
								helperText={errors.codigoDelegacion ?? ""}
								value={data.codigoDelegacion}
								disabled={disabled.codigoDelegacion ?? false}
								onChange={(value, _id) => onChange({ codigoDelegacion: value })}
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
				<Grid width="100%" gap="200px" justify="center">
					<Grid width="200px">
						<Button className="botonAzul" onClick={() => onClose(true)}>CONFIRMA</Button>
					</Grid>
					<Grid width="200px">
						<Button className="botonAmarillo" onClick={() => onClose(false)}>
							CANCELA
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default DelegacionesForm;
