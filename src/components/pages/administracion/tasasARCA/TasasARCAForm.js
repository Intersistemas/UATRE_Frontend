import React from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial, { PorcentajeMask } from "components/ui/Input/InputMaterial";
import UseKeyPress from "components/helpers/UseKeyPress";
import modalCss from "components/ui/Modal/Modal.module.css";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

export default function Form({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

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
							{hide.desdeFecha ? null : (
								<InputMaterial
									id="desdeFecha"
									type="date"
									format="string"
									label="Desde"
									disabled={disabled.desdeFecha}
									error={!!errors.desdeFecha}
									helperText={errors.desdeFecha ?? ""}
									value={data.desdeFecha || ""}
									onChange={( desdeFecha ) => onChange({ desdeFecha })}
								/>
							)}
						</Grid>
						<Grid width="25%">
							{hide.hastaFecha ? null : (
								<InputMaterial
									id="hastaFecha"
									type="date"
									format="string"
									label="Hasta"
									disabled={disabled.hastaFecha}
									error={!!errors.hastaFecha}
									helperText={errors.hastaFecha ?? ""}
									value={data.hastaFecha || ""}
									onChange={( hastaFecha ) => onChange({ hastaFecha })}
								/>
							)}
						</Grid>
						<Grid width="50%">
							{hide.norma ? null : (
								<InputMaterial
									id="norma"
									label="Norma"
									disabled={disabled.norma}
									error={!!errors.norma}
									helperText={errors.norma ?? ""}
									value={data.norma}
									onChange={(norma) => onChange({ norma })}
								/>
							)}
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="25%">
							{hide.resarcitorioMensual ? null : (
								<InputMaterial
									id="resarcitorioMensual"
									label="Resarcitorio Mensual"
									value={data.resarcitorioMensual}
									disabled={!!disabled.resarcitorioMensual}
									error={!!errors.resarcitorioMensual}
									helperText={errors.resarcitorioMensual}
									mask={PorcentajeMask}
									onChange={(resarcitorioMensual) => onChange({ resarcitorioMensual }) }
								/>
							)}
						</Grid>
						<Grid width="25%">
							{hide.resarcitorioDiario ? null : (
								<InputMaterial
									id="resarcitorioDiario"
									label="Resarcitorio Diario"
									value={data.resarcitorioDiario}
									disabled={!!disabled.resarcitorioDiario}
									error={!!errors.resarcitorioDiario}
									helperText={errors.resarcitorioDiario}
									mask={PorcentajeMask}
									onChange={(resarcitorioDiario) => onChange({ resarcitorioDiario }) }
								/>
							)}
						</Grid>
						<Grid width="25%">
							{hide.punitorioMensual ? null : (
								<InputMaterial
									id="punitorioMensual"
									label="Punitorio Mensual"
									value={data.punitorioMensual}
									disabled={!!disabled.punitorioMensual}
									error={!!errors.punitorioMensual}
									helperText={errors.punitorioMensual}
									mask={PorcentajeMask}
									onChange={(punitorioMensual) => onChange({ punitorioMensual }) }
								/>
							)}
						</Grid>
						<Grid width="25%">
							{hide.punitorioDiario ? null : (
								<InputMaterial
									id="punitorioDiario"
									label="Punitorio Diario"
									value={data.punitorioDiario}
									disabled={!!disabled.punitorioDiario}
									error={!!errors.punitorioDiario}
									helperText={errors.punitorioDiario}
									mask={PorcentajeMask}
									onChange={(punitorioDiario) => onChange({ punitorioDiario }) }
								/>
							)}
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<InputMaterial
							id="deletedObs"
							label="Observaciones Baja"
							error={!!errors.deletedObs}
							helperText={errors.deletedObs ?? ""}
							value={data.deletedObs}
							disabled={disabled.deletedObs ?? false}
							onChange={(deletedObs) => onChange({ deletedObs })}
						/>
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