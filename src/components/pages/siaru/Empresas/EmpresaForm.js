import React, { useEffect, useState } from "react";
import styles from "./EmpresaForm.module.css";
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
		cuit: "",
		razonSocial: "",
	});

	const handleConfirma = () => {
		//validaciones
		let tieneErr = false;
		const newErr = { ...err };

		if (!data.cuit) {
			tieneErr = true;
			newErr.cuit = "Debe ingresar una CUIT válida";
		} else newErr.cuit = "";

		if (!data.razonSocial) {
			tieneErr = true;
			newErr.razonSocial = "Debe ingresar una razon social";
		} else newErr.razonSocial = "";

		if (tieneErr) {
			setErr(newErr);
			return;
		}

		//ToDo: Implementar aplicar cambios Empresa según "action"
		// request(
		// 	{
		// 		baseURL: "SIARU",
		// 		endpoint: `/Siaru_BoletasDeposito`,
		// 		method: "POST",
		// 		body: data,
		// 		headers: { "Content-Type": "application/json" },
		// 	},
		// 	async (response) => onConfirma(response)
		// );
		onConfirma(data);
	};

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
						<h3>{actionMsg} Empresa</h3>
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
							label="CUIT"
							required
							error={err.cuit}
							value={data.cuit}
							onChange={(e) =>
								joinData({
									cuit: Formato.Entero(e.target.value),
								})
							}
						/>
					</Grid>
					<Grid width="75%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							label="Razon Social"
							required
							error={err.razonSocial}
							value={data.razonSocial}
							onChange={(e) =>
								joinData({
									razonSocial: `${e.target.value}`,
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
					<Grid
						grow
						style={{ borderBottom: "dashed 1px #cccccc" }}
					>
						<h4>Domicilio administrativo</h4>
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
							value={data.domicilioNumero}
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
