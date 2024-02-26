import React from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import CheckboxMaterial from "components/ui/Checkbox/CheckboxMaterial";
import UseKeyPress from "components/helpers/UseKeyPress";

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

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
			<Modal.Header closeButton>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="15px">
						<Grid width="220px">
							{hide.afiliadoCUIL ? null : (
								<InputMaterial
									id="afiliadoCUIL"
									label="CUIL del afiliado"
									disabled={disabled.afiliadoCUIL}
									error={!!errors.afiliadoCUIL}
									helperText={errors.afiliadoCUIL ?? ""}
									value={getValue("afiliadoCUIL")}
									onChange={(v) =>
										onChange({
											afiliadoCUIL: Number(v.replace(/[^\d]/gim, "")),
										})
									}
									
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

export default ColaboradoresForm;
