import React from "react";
import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import LoadingButtonCustom from "components/ui/LoadingButtonCustom/LoadingButtonCustom";
import InputMaterial from "components/ui/Input/InputMaterial";

const DelegacionesForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errores = {},
	onChange = (changes = {}) => {},
	onClose = (confirm = false) => {},
}) => {
	data ??= {};
	data.codigoDelegacion ??= "";
	data.nombre ??= "";

	disabled ??= {};
	hide ??= {};
	errores ??= {};

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
								error={!!errores.codigoDelegacion}
								helperText={errores.codigoDelegacion ?? ""}
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
								error={!!errores.nombre}
								helperText={errores.nombre ?? ""}
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
							error={!!errores.deletedObs}
							helperText={errores.deletedObs ?? ""}
							value={data.deletedObs}
							disabled={disabled.deletedObs ?? false}
							onChange={(value, _id) => onChange({ deletedObs: value })}
						/>
					)}
				</Grid>
				<Grid width="100%" gap="200px" justify="center">
					<Grid width="200px">
						<LoadingButtonCustom onClick={() => onClose(true)}>CONFIRMA</LoadingButtonCustom>
					</Grid>
					<Grid width="200px">
						<Button onClick={() => onClose(false)}>
							CANCELA
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default DelegacionesForm;
