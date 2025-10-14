import React from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial, { PorcentajeMask } from "components/ui/Input/InputMaterial";
import UseKeyPress from "components/helpers/UseKeyPress";
import modalCss from "components/ui/Modal/Modal.module.css";

const onChangeDef = (changes = {}) => { };
const onCloseDef = (confirm = false) => { };


//Agregado Mauro
//Normalizar fechas a YYYY-MM-DD
const toYMD = (val) => {
	if (!val) return null;
	if (val instanceof Date && !isNaN(val)) {
		const y = val.getFullYear();
		const m = String(val.getMonth() + 1).padStart(2, "0");
		const d = String(val.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}
	const s = String(val).trim();

	let m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
	if (m) return `${m[1]}-${m[2]}-${m[3]}`;

	m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;

	m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
	if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;

	return null;
};

const pickDateValue = (v) => {
	if (v == null) return "";
	if (v && v.target && typeof v.target.value === "string") return v.target.value;
	if (v.$d instanceof Date && typeof v.format === "function") return v.format("YYYY-MM-DD");
	if (typeof v === "string") return v;
	if (v instanceof Date && !isNaN(v)) {
		const y = v.getFullYear();
		const m = String(v.getMonth() + 1).padStart(2, "0");
		const d = String(v.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}
	return "";
};

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
									label="Desde"
									disabled={disabled.desdeFecha}
									error={!!errors.desdeFecha}
									helperText={errors.desdeFecha ?? ""}
									value={data.desdeFecha ?? ""}
									onChange={(v) => onChange({ desdeFecha: pickDateValue(v) })}
								/>
							)}
						</Grid>
						<Grid width="25%">
							{hide.hastaFecha ? null : (
								<InputMaterial
									id="hastaFecha"
									type="date"
									label="Hasta"
									disabled={disabled.hastaFecha}
									error={!!errors.hastaFecha}
									helperText={errors.hastaFecha ?? ""}
									value={data.hastaFecha ?? ""}
									onChange={(v) => onChange({ hastaFecha: pickDateValue(v) })}
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
									onChange={(resarcitorioMensual) => onChange({ resarcitorioMensual })}
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
									onChange={(resarcitorioDiario) => onChange({ resarcitorioDiario })}
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
									onChange={(punitorioMensual) => onChange({ punitorioMensual })}
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
									onChange={(punitorioDiario) => onChange({ punitorioDiario })}
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
					{errors?._global && (
						<div
							role="alert"
							style={{
								color: "#f00e0eff",
								fontSize: "0.95rem",
								fontWeight: 350,
								marginTop: -8,
							}}
							aria-live="polite"
						>
							{errors._global}
						</div>
					)}
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