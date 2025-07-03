import React from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CUITMask, PesosMask } from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import NominaDetailsAFIP from "./procesar/manual/NominaDetailsAFIP";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const dependeciesDef = {
	datosAFIP: {
		loading: "",
		data: null,
		error: null,
	},
};
const LiquidacionesNominaForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	dependecies = dependeciesDef,
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	dependecies ??= {};
	dependecies = dependecies === dependeciesDef ? {} : { ...dependecies };

	// dependecies.datosAFIP ??= { data: {} };
	const datosAFIP = dependecies.datosAFIP;
	if (datosAFIP == null) {
		hide.datosAFIP = true;
	}

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				{title}
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="inherit">
						<Grid width="25%">
							{hide.cuil ? null : (
								<InputMaterial
									required
									label="CUIL"
									disabled={disabled.cuil}
									error={!!errors.cuil}
									helperText={errors.cuil ?? ""}
									value={data.cuil || ""}
									mask={CUITMask}
									onChange={(v) => onChange({ cuil: Number(v) })}
								/>
							)}
						</Grid>
						<Grid width="75%">
							{hide.nombre ? null : (
								<InputMaterial
									id="nombre"
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
					<Grid width="full">
						{hide.remuneracionImponible ? null : (
							<InputMaterial
								required
								label="Remuneracion Bruta + SAC"
								value={data.remuneracionImponible}
								disabled={!!disabled.remuneracionImponible}
								error={!!errors.remuneracionImponible}
								helperText={errors.remuneracionImponible}
								mask={PesosMask}
								onChange={(v) => onChange({ remuneracionImponible: Number(v) }) }
							/>
						)}
					</Grid>
					{hide.datosAFIP ? null : (
						<NominaDetailsAFIP
							data={datosAFIP.data}
							loading={datosAFIP.loading}
							error={datosAFIP.error}
						/>
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

export default LiquidacionesNominaForm;
