import React, { useEffect, useState } from "react";
import styles from "./EstablecimientoForm.module.css";
import Formato from "../../../helpers/Formato";
import useHttp from "../../../hooks/useHttp";
import Button from "../../../ui/Button/Button";
import Modal from "../../../ui/Modal/Modal";
import Grid from "../../../ui/Grid/Grid";
import TextField from "@mui/material/TextField";
import Select from "../../../ui/Select/Select";
import DateTimePicker from "../../../ui/DateTimePicker/DateTimePicker";
import dayjs from "dayjs";
import { Alert, AlertTitle, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Form = (props) => {
	const config = { ...props.config };
	const action = config.action ? `${config.action}` : "C"; //ABMC
	const [data, setData] = useState({ ...config.data });
	const joinData = (newData) => setData({ ...data, ...newData });
	const onCancela = config.onCancela ?? (() => {});
	const onConfirma = config.onConfirma ?? ((data) => {});
	const [motivosBaja, setMotivosBaja] = useState([]);
	const { isLoading, error, sendRequest: request } = useHttp();

	let actionMsg;
	switch (action) {
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

	const [err, setErr] = useState({
		empresasId: "",
		nroSucursal: "",
		nombre: "",
		refMotivosBajaId: "",
	});

	const handleConfirma = () => {
		//validaciones
		let tieneErr = false;
		const newErr = { ...err };

		if ("AM".split("").indexOf(action) !== -1) {
			if (!data.empresasId) {
				tieneErr = true;
				newErr.empresasId = "Debe especificar la empresa";
			} else newErr.empresasId = "";

			if (!data.nroSucursal) {
				tieneErr = true;
				newErr.nroSucursal = "Debe ingresar el Nro. Sucursal";
			} else newErr.nroSucursal = "";

			if (!data.nombre) {
				tieneErr = true;
				newErr.nombre = "Debe ingresar el nombre";
			} else newErr.nombre = "";
		} else if (action === "B") {
			if (!data.refMotivosBajaId) {
				tieneErr = true;
				newErr.refMotivosBajaId = "Debe especificar el motivo de baja";
			} else newErr.refMotivosBajaId = "";
		}

		if (tieneErr) {
			setErr(newErr);
			return;
		}

		const req = {
			baseURL: "SIARU",
			headers: { "Content-Type": "application/json" },
			body: data,
		};

		switch (action) {
			case "A":
				req.method = "POST";
				req.endpoint = `/EmpresasEstablecimientos`;
				break;
			case "B":
				req.method = "PUT";
				req.endpoint = `/EmpresasEstablecimientos/${data.id}`;
				break;
			case "M":
				req.method = "PUT";
				req.endpoint = `/EmpresasEstablecimientos/${data.id}`;
				break;
			default:
				onCancela();
				return;
		}

		request(req, async (response) => onConfirma(response));
	};

	useEffect(() => {
		setMotivosBaja([
			{ id: 0, tipo: "E", descripcion: "Activo" },
			{ id: 1, tipo: "E", descripcion: "Otro" },
		]);
	});

	if (isLoading) {
		return (
			<Modal onClose={onCancela}>
				<div>Cargando</div>
			</Modal>
		);
	}

	let errorMsg;
	if (error) {
		errorMsg = (
			<Collapse in={true} style={{ width: "100%" }}>
				<Alert
					severity="error"
					action={
						<IconButton aria-label="close" color="inherit" size="small">
							<CloseIcon fontSize="inherit" />
						</IconButton>
					}
					sx={{ mb: 2 }}
				>
					<AlertTitle>
						<strong>Error</strong>
					</AlertTitle>
					{error}
				</Alert>
			</Collapse>
		);
	}

	const gridGapPx = 15;
	return (
		<Modal onClose={onCancela}>
			<Grid col full gap={`${gridGapPx}px`}>
				<Grid full="width" gap={`${gridGapPx}px`}>
					<Grid grow>
						<h3>{actionMsg} Establecimiento</h3>
					</Grid>
					<Grid style={{ color: "transparent" }}>
						<h3>[empresasId: {data.empresasId ?? ""}]</h3>
					</Grid>
					<Grid style={{ color: "transparent" }}>
						<h3>{data.id ?? ""}</h3>
					</Grid>
				</Grid>
				<Grid full="width" gap={`${gridGapPx}px`}>
					<Grid width="25%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							type="number"
							label="Nro. sucursal"
							required
							error={err.nroSucursal}
							helperText={err.nroSucursal}
							value={data.nroSucursal}
							onChange={(e) =>
								joinData({
									nroSucursal: Formato.Entero(e.target.value),
								})
							}
						/>
					</Grid>
					<Grid width="75%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Nombre"
							required
							helperText={err.nombre}
							error={err.nombre}
							value={data.nombre}
							onChange={(e) =>
								joinData({
									nombre: `${e.target.value}`,
								})
							}
						/>
					</Grid>
				</Grid>
				<Grid full="width" gap={`${gridGapPx}px`}>
					<Grid width="50%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Teléfono"
							value={data.telefono}
							onChange={(e) =>
								joinData({
									telefono: `${e.target.value}`,
								})
							}
						/>
					</Grid>
					<Grid width="50%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Correo"
							value={data.email}
							onChange={(e) =>
								joinData({
									email: `${e.target.value}`,
								})
							}
						/>
					</Grid>
				</Grid>
				<Grid
					col
					full="width"
					style={{
						border: "solid 1px #cccccc",
						borderRadius: `${gridGapPx}px`,
						padding: `${gridGapPx}px`,
					}}
					gap={`${gridGapPx}px`}
				>
					<Grid grow style={{ borderBottom: "dashed 1px #cccccc" }}>
						<h4>Domicilio</h4>
					</Grid>
					<Grid full="width">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Calle"
							value={data.domicilioCalle}
							onChange={(e) =>
								joinData({
									domicilioCalle: `${e.target.value}`,
								})
							}
						/>
					</Grid>
					<Grid full="width">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Número"
							value={data.domicilioNumero ? data.domicilioNumero : ""}
							onChange={(e) =>
								joinData({
									domicilioNumero: `${e.target.value}`,
								})
							}
						/>
					</Grid>
					<Grid full="width" gap={`${gridGapPx}px`}>
						<Grid block basis="180px" className={styles.label}>
							<TextField
								size="small"
								style={{ width: "100%" }}
								label="Piso"
								value={data.domicilioPiso}
								onChange={(e) =>
									joinData({
										domicilioPiso: `${e.target.value}`,
									})
								}
							/>
						</Grid>
						<Grid block basis="calc(100% - 180px)" className={styles.data}>
							<TextField
								size="small"
								style={{ width: "100%" }}
								label="Dpto"
								value={data.domicilioDpto}
								onChange={(e) =>
									joinData({
										domicilioDpto: `${e.target.value}`,
									})
								}
							/>
						</Grid>
					</Grid>
				</Grid>
				<Grid col full="width" gap={`${gridGapPx}`}>
					<Grid full="width">
					<Select
							name="refMotivosBajaId"
							label="Motivo de baja"
							required={action === "B"}
							error={err.refMotivosBajaId}
							value={data.refMotivosBajaId ? data.refMotivosBajaId : 0}
							options={motivosBaja.map((r) => ({
								label: r.descripcion,
								value: r.id,
							}))}
							onChange={(v) => joinData({ refMotivosBajaId: v })}
						/>
					</Grid>
				</Grid>
				<Grid col grow justify="end">
					<Grid gap={`${gridGapPx * 2}px`}>
						<Grid grow>{errorMsg}</Grid>
						<Grid width="15%">
							<Button className="botonBlanco" onClick={() => onCancela()}>
								Cancelar
							</Button>
						</Grid>
						<Grid width="15%">
							<Button
								disabled={"ABM".split("").indexOf(action) === -1}
								onClick={handleConfirma}
							>
								Confirmar
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default Form;
