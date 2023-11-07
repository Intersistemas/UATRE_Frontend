import React from "react";
import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import CheckboxMaterial from "components/ui/Checkbox/CheckboxMaterial";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const ColaboradoresForm = ({
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

	const getValue = (v) => data[v] ?? "";

	return (
		<Modal onClose={() => onClose(false)}>
			<Grid col full gap="15px">
				<Grid className={modalCss.modalCabecera} width="full" justify="center">
					<h3>{title}</h3>
				</Grid>
				<Grid width="full" gap="15px">
					<Grid width="20%">
						{hide.afiliadoCuil ? null : (
							<InputMaterial
								id="afiliadoCuil"
								type="number"
								label="CUIL del afiliado"
								disabled={disabled.afiliadoCuil}
								error={!!errors.afiliadoCuil}
								helperText={errors.afiliadoCuil ?? ""}
								value={getValue("afiliadoCuil")}
								onChange={(afiliadoCuil) => onChange({ afiliadoCuil })}
								width={100}
							/>
						)}
					</Grid>
					<Grid width="60%">
						{hide.afiliadoNombre ? null : (
							<InputMaterial
								id="afiliadoNombre"
								label="Nombre del afiliado"
								disabled={disabled.afiliadoNombre}
								error={!!errors.afiliadoNombre}
								helperText={errors.afiliadoNombre ?? ""}
								value={getValue("afiliadoNombre")}
								width={100}
							/>
						)}
					</Grid>
					<Grid width="20%">
						{hide.esAuxiliar ? null : (
							<CheckboxMaterial
								id="esAuxiliar"
								label="Es auxiliar"
								disabled={disabled.esAuxiliar}
								error={!!errors.esAuxiliar}
								helperText={errors.esAuxiliar ?? ""}
								value={data.esAuxiliar}
								onChange={(esAuxiliar) => onChange({ esAuxiliar })}
							/>
						)}
					</Grid>
				</Grid>
				<Grid full="width">
					{hide.deletedObs ? null : (
						<InputMaterial
							id="deletedObs"
							label="Observación de baja"
							disabled={disabled.deletedObs}
							error={!!errors.deletedObs}
							helperText={errors.deletedObs ?? ""}
							value={getValue("deletedObs")}
							onChange={(deletedObs) => onChange({ deletedObs })}
							width={100}
						/>
					)}
				</Grid>
				<Grid full="width">
					{hide.obs ? null : (
						<InputMaterial
							id="obs"
							label="Observación de reactivación"
							disabled={disabled.obs}
							error={!!errors.obs}
							helperText={errors.obs ?? ""}
							value={getValue("obs")}
							onChange={(obs) => onChange({ obs })}
							width={100}
						/>
					)}
				</Grid>
				<Grid width="full" gap="200px" justify="center">
					<Grid width="200px">
						<Button className="botonAzul" onClick={() => onClose(true)}>
							CONFIRMA
						</Button>
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

export default ColaboradoresForm;