import React, { useEffect, useState } from "react";
import styles from "./EstablecimientoForm.module.css";
import Formato from "../../../helpers/Formato";
import useHttp from "../../../hooks/useHttp";
import Button from "../../../ui/Button/Button";
import Modal from "../../../ui/Modal/Modal";
import Grid from "../../../ui/Grid/Grid";
import TextField from "@mui/material/TextField";
import Select from "../../../ui/Select/Select";
import { Alert, AlertTitle, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Form = ({
	request: requestParam = "C", //"A" = Alta, "B" = Baja, "M" = Modificacion, "C" = Consulta
	record = {}, // Registro de establecimiento a realizar baja/modificaicon/consulta. Si es alta, se toman estos datos como iniciales.
	disabled = {}, // Controles deshabilitados. Cada uno debe tener el mismo nombre del campo al que refiere.
	onConfirm = (_request, _record) => {}, // Acción a realizar al confirmar
	onCancel = (_request) => {}, // Accion a realizar al cancelar
}) => {
	record = { ...record };
	if (requestParam === "A") record.id = 0;

	const [establecimiento, setEstablecimiento] = useState(record);
	const [errores, setErrores] = useState({});
	const [alerts, setAlerts] = useState([]);

	const [motivosBaja, setMotivosBaja] = useState([]);
	const { sendRequest: request } = useHttp();

	let actionMsg;
	switch (requestParam) {
		case "A":
			actionMsg = "Agregando";
			break;
		case "B":
			actionMsg = "Realizando baja";
			break;
		case "M":
			actionMsg = "Modificando";
			break;
		default:
			actionMsg = "Consultando";
			break;
	}

	const validar = () => {
		//validaciones
		let noValida = false;
		const newErrores = {};
		const newAlerts = [];

		if (["A", "M"].includes(requestParam)) {
			// Alta / Modificacion
			if (establecimiento.empresaId) {
				newErrores.empresaId = "";
			} else {
				noValida = true;
				newErrores.empresaId = "Dato requerido";
			}

			if (establecimiento.nroSucursal) {
				newErrores.nroSucursal = "";
			} else {
				noValida = true;
				newErrores.nroSucursal = "Dato requerido";
			}

			if (establecimiento.nombre) {
				newErrores.nombre = "";
			} else {
				noValida = true;
				newErrores.nombre = "Dato requerido";
			}
		} else if (requestParam === "B") {
			// Baja
			if (establecimiento.refMotivosBajaId) {
				newErrores.refMotivosBajaId = "";
			} else {
				noValida = true;
				newErrores.refMotivosBajaId = "Dato requerido";
			}
		} else {
			// No se reconoce request
			onCancel(requestParam);
			return;
		}

		setErrores((old) => ({ ...old, ...newErrores }));
		setAlerts((old) => [...old, ...newAlerts]);
		if (noValida) return;

		const method = requestParam === "A" ? "POST" : "PUT";
		request(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos`,
				method: method,
				body: establecimiento,
				headers: { "Content-Type": "application/json" },
			},
			async (res) => onConfirm(requestParam, res),
			async (err) => {
				setAlerts((old) => [
					...old,
					{ severity: "error", title: err.type, message: err.message },
				]);
			}
		);
	};

	useEffect(() => {
		setMotivosBaja([
			{ id: 0, tipo: "E", descripcion: "Activo" },
			{ id: 1, tipo: "E", descripcion: "Otro" },
		]);
	});

	const gap = 15;

	let alertsRender = null;
	if (alerts.length > 0) {
		alertsRender = (
			<Grid gap={`${gap}px`} full="width">
				<Grid col grow>
					{alerts?.map((r, ix) => (
						<Collapse in={true} style={{ width: "100%" }}>
							<Alert
								severity={r.severity}
								action={
									<IconButton
										aria-label="close"
										color="inherit"
										size="small"
										onClick={() => {
											const newAlerts = [...alerts];
											newAlerts.splice(ix, 1);
											setAlerts(newAlerts);
										}}
									>
										<CloseIcon fontSize="inherit" />
									</IconButton>
								}
								sx={{ mb: 2 }}
								style={{ marginBottom: "0" }}
							>
								<AlertTitle>{r.title}</AlertTitle>
								{r.message}
							</Alert>
						</Collapse>
					))}
				</Grid>
			</Grid>
		);
	}

	const renderConfirmaButton = ["A", "B", "M"].includes(requestParam) ? (
		<Button onClick={validar}>Confirma</Button>
	) : null;

	return (
		<Modal onClose={() => onCancel(requestParam)}>
			<Grid col full gap={`${gap}px`}>
				<Grid full="width" gap={`${gap}px`}>
					<Grid grow>
						<h3>{actionMsg} Establecimiento</h3>
					</Grid>
					<Grid style={{ color: "transparent" }}>
						<h3>[empresaId: {establecimiento.empresaId ?? ""}]</h3>
					</Grid>
					<Grid style={{ color: "transparent" }}>
						<h3>{establecimiento.id ?? ""}</h3>
					</Grid>
				</Grid>
				<Grid full="width" gap={`${gap}px`}>
					<Grid width="25%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							type="number"
							label="Nro. sucursal"
							required
							error={errores.nroSucursal ?? ""}
							helperText={errores.nroSucursal ?? ""}
							value={establecimiento.nroSucursal}
							disabled={disabled.nroSucursal ?? false}
							onChange={(e) =>
								setEstablecimiento((old) => ({
									...old,
									nroSucursal: Formato.Entero(e.target.value),
								}))
							}
						/>
					</Grid>
					<Grid width="75%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Nombre"
							required
							error={errores.nombre ?? ""}
							helperText={errores.nombre ?? ""}
							value={establecimiento.nombre}
							disabled={disabled.nombre ?? false}
							onChange={(e) =>
								setEstablecimiento((old) => ({
									...old,
									nombre: `${e.target.value}`,
								}))
							}
						/>
					</Grid>
				</Grid>
				<Grid full="width" gap={`${gap}px`}>
					<Grid width="50%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Teléfono"
							value={establecimiento.telefono}
							disabled={disabled.telefono ?? false}
							onChange={(e) =>
								setEstablecimiento((old) => ({
									...old,
									telefono: `${e.target.value}`,
								}))
							}
						/>
					</Grid>
					<Grid width="50%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Correo"
							value={establecimiento.email}
							disabled={disabled.email ?? false}
							onChange={(e) =>
								setEstablecimiento((old) => ({
									...old,
									email: `${e.target.value}`,
								}))
							}
						/>
					</Grid>
				</Grid>
				<Grid
					col
					full="width"
					style={{
						border: "solid 1px #cccccc",
						borderRadius: `${gap}px`,
						padding: `${gap}px`,
					}}
					gap={`${gap}px`}
				>
					<Grid grow style={{ borderBottom: "dashed 1px #cccccc" }}>
						<h4>Domicilio</h4>
					</Grid>
					<Grid full="width">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Calle"
							value={establecimiento.domicilioCalle}
							disabled={disabled.domicilioCalle ?? false}
							onChange={(e) =>
								setEstablecimiento((old) => ({
									...old,
									domicilioCalle: `${e.target.value}`,
								}))
							}
						/>
					</Grid>
					<Grid full="width">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Número"
							value={
								establecimiento.domicilioNumero
									? establecimiento.domicilioNumero
									: ""
							}
							disabled={disabled.domicilioNumero ?? false}
							onChange={(e) =>
								setEstablecimiento((old) => ({
									...old,
									domicilioNumero: `${e.target.value}`,
								}))
							}
						/>
					</Grid>
					<Grid full="width" gap={`${gap}px`}>
						<Grid block basis="180px" className={styles.label}>
							<TextField
								size="small"
								style={{ width: "100%" }}
								label="Piso"
								value={establecimiento.domicilioPiso}
								disabled={disabled.domicilioPiso ?? false}
								onChange={(e) =>
									setEstablecimiento((old) => ({
										...old,
										domicilioPiso: `${e.target.value}`,
									}))
								}
							/>
						</Grid>
						<Grid block basis="calc(100% - 180px)" className={styles.data}>
							<TextField
								size="small"
								style={{ width: "100%" }}
								label="Dpto"
								value={establecimiento.domicilioDpto}
								disabled={disabled.domicilioDpto ?? false}
								onChange={(e) =>
									setEstablecimiento((old) => ({
										...old,
										domicilioDpto: `${e.target.value}`,
									}))
								}
							/>
						</Grid>
					</Grid>
				</Grid>
				<Grid col full="width" gap={`${gap}`}>
					<Grid full="width">
						<Select
							name="refMotivosBajaId"
							label="Motivo de baja"
							required={requestParam === "B"}
							error={errores.refMotivosBajaId ?? ""}
							value={
								establecimiento.refMotivosBajaId
									? establecimiento.refMotivosBajaId
									: 0
							}
							disabled={disabled.refMotivosBajaId ?? false}
							options={motivosBaja.map((r) => ({
								label: r.descripcion,
								value: r.id,
							}))}
							onChange={(v) =>
								setEstablecimiento((old) => ({
									...old,
									refMotivosBajaId: v,
								}))
							}
						/>
					</Grid>
				</Grid>
				<Grid col grow justify="end">
					<Grid gap={`${gap * 2}px`}>
						<Grid grow />
						<Grid col width="30%" justify="end">
							<Grid gap={`${gap}px`}>
								<Button
									className="botonBlanco"
									onClick={() => onCancel(requestParam)}
								>
									Cancela
								</Button>
								{renderConfirmaButton}
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				{alertsRender}
			</Grid>
		</Modal>
	);
};

export default Form;
