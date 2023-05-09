import React, { useEffect, useState } from "react";
import styles from "./Form.module.css";
import Formato from "../../../../helpers/Formato";
import useHttp from "../../../../hooks/useHttp";
import Button from "../../../../ui/Button/Button";
import Grid from "../../../../ui/Grid/Grid";
import Modal from "../../../../ui/Modal/Modal";
import Controles from "./Controles";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, AlertTitle } from "@mui/lab";
import { IconButton, Collapse } from "@mui/material";

const Form = ({
	request: action = "C", //"A" = Alta, "B" = Baja, "M" = Modificacion, "C" = Consulta
	titulo = null,
	subtitulo = null,
	record = {}, // Registro de liquidacion a realizar baja/modificaicon/consulta. Si es alta, se toman estos datos como iniciales.
	empresa = {}, // Empresa a la que pertenece la liquidacion
	onConfirm = (_record, _request) => {}, // Acción a realizar al confirmar
	onCancel = (_request) => {}, // Accion a realizar al cancelar
}) => {
	record = { ...record };
	if (action === "A") record.id = 0;
	if (record.tipoLiquidacion === undefined) record.tipoLiquidacion = 0;

	const [liquidacion, setLiquidacion] = useState(record);
	const [errores, setErrores] = useState({});
	const [alerts, setAlerts] = useState([]);
	const { sendRequest: request } = useHttp();

	// Cargo parametros
	const [params, setParams] = useState();
	useEffect(() => {
		const requestParam = (param) => {
			request(
				{
					baseURL: "Comunes",
					endpoint: `/Parametros/${param}`,
					method: "GET",
				},
				async (res) => {
					setParams((p) => ({
						...p,
						[param]: Formato.Decimal(res.valor ?? 0),
					}));
				},
				async (err) =>
					setAlerts((old) => [
						...old,
						{ severity: "error", title: err.type, message: err.message },
					])
			);
		};
		if (!params) {
			requestParam("RefMotivosBajaIdRectificaLiquidacion");
		}
	}, [request, params]);

	const gap = 10;

	// Aplicar cambios permanentes
	const applyRequest = (data) => {
		const method = action === "A" ? "POST" : "PATCH";
		if (data.refMotivosBajaId) data.bajaFecha = dayjs().format("YYYY-MM-DD");
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Liquidaciones`,
				method: method,
				body: data,
				headers: { "Content-Type": "application/json" },
			},
			async (res) => onConfirm(res, action),
			async (err) => {
				setAlerts((old) => [
					...old,
					{ severity: "error", title: err.type, message: err.message },
				]);
				setModalExistente(null);
			}
		);
	};

	// Mensaje de alerta para dar de baja liquidación existente
	const [modalExistente, setModalExistente] = useState();
	const handleExistente = (anterior) => {
		const handleCancelar = () => setModalExistente(null);
		const handleBajaContinuar = () => {
			anterior.refMotivosBajaId = params.RefMotivosBajaIdRectificaLiquidacion;
			anterior.bajaObservaciones = "Rectificación de liquidación";
			anterior.bajaFecha = dayjs().format("YYYY-MM-DD");
			request(
				{
					baseURL: "SIARU",
					endpoint: `/Liquidaciones`,
					method: "PATCH",
					body: anterior,
					headers: { "Content-Type": "application/json" },
				},
				async (_res) => {
					const datosEnvio = { ...liquidacion };
					datosEnvio.rectificativa =
						Formato.Entero(anterior.rectificativa ?? 0) + 1;
					datosEnvio.refMotivosBajaId = 0;
					datosEnvio.bajaObservaciones = "";
					applyRequest(datosEnvio);
				},
				async (err) => {
					setAlerts((old) => [
						...old,
						{ severity: "error", title: err.type, message: err.message },
					]);
					setModalExistente(null);
				}
			);
		};
		setModalExistente(
			<Modal onClose={handleCancelar}>
				<Grid col gap={`${gap}px`} full>
					<Grid full="width" justify="center">
						<h3>
							Ya existe una liquidación para el establecimiento y el período
							indicado
						</h3>
					</Grid>
					<Grid col full justify="end">
						<Grid gap={`${gap}px`}>
							<Grid width="50%">
								<Button className="botonBlanco" onClick={handleCancelar}>
									Volver para modificar datos
								</Button>
							</Grid>
							<Grid width="50%">
								<Button onClick={handleBajaContinuar}>
									Dar de baja liquidación anterior y continuar
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Modal>
		);
	};

	const validar = () => {
		if (!["A", "B", "M"].includes(action)) {
			onCancel(action);
			return;
		}

		let tieneErrores = false;
		const newErrores = {};

		if (liquidacion.empresaEstablecimientoId) {
			newErrores.empresaEstablecimientoId = "";
		} else {
			tieneErrores = true;
			newErrores.empresaEstablecimientoId = "Dato requerido";
		}

		if (liquidacion.tipoLiquidacion !== undefined) {
			newErrores.tipoLiquidacion = "";
		} else {
			tieneErrores = true;
			newErrores.tipoLiquidacion = "Dato requerido";
		}

		if (liquidacion.liquidacionTipoPagoId) {
			newErrores.liquidacionTipoPagoId = "";
		} else {
			tieneErrores = true;
			newErrores.liquidacionTipoPagoId = "Dato requerido";
		}

		if (liquidacion.periodo) {
			newErrores.periodo = "";
		} else {
			tieneErrores = true;
			newErrores.periodo = "Dato requerido";
		}

		if (liquidacion.cantidadTrabajadores) {
			newErrores.cantidadTrabajadores = "";
		} else {
			tieneErrores = true;
			newErrores.cantidadTrabajadores = "Dato requerido";
		}

		if (liquidacion.totalRemuneraciones) {
			newErrores.totalRemuneraciones = "";
		} else {
			tieneErrores = true;
			newErrores.totalRemuneraciones = "Dato requerido";
		}

		if (liquidacion.fechaPagoEstimada) {
			newErrores.fechaPagoEstimada = "";
		} else {
			tieneErrores = true;
			newErrores.fechaPagoEstimada = "Dato requerido";
		}

		switch (
			action // Controles específicos segun request
		) {
			case "A": // Alta
				break;
			case "B": // Baja
				if (liquidacion.refMotivosBajaId) {
					newErrores.refMotivosBajaId = "";
				} else {
					tieneErrores = true;
					newErrores.refMotivosBajaId = "Dato requerido cuando es una baja";
				}
				break;
			case "M": // Modificaicon
				break;
			default: // No se reconoce request
				onCancel(action);
				return;
		}

		setErrores((old) => ({ ...old, ...newErrores }));
		if (tieneErrores) return;

		console.log("liquidacion", liquidacion);
		if (liquidacion.refMotivosBajaId) {
			// Si se agrega o modifica con información de baja,
			// no hace falta controlar si exite anterior activo
			applyRequest(liquidacion);
			return;
		}

		// verificar existencia de activo
		let pars = `EmpresaId=${empresa.id}`;
		pars = `${pars}&EmpresaEstablecimientoId=${liquidacion.empresaEstablecimientoId}`;
		pars = `${pars}&LiquidacionTipoPagoId=${liquidacion.liquidacionTipoPagoId}`;
		pars = `${pars}&Periodo=${liquidacion.periodo}`;
		pars = `${pars}&RefMotivosBajaId=0`;
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Liquidaciones?${pars}`,
				method: "GET",
			},
			async (res) => {
				console.log("res", res);
				const liq = res.data.find((r) => r.id !== liquidacion.id);
				if (liq != null) handleExistente(liq);
				else applyRequest(liquidacion);
			},
			async (err) =>
				setAlerts((old) => [
					...old,
					{ severity: "error", title: err.type, message: err.message },
				])
		);
	};

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
											delete newAlerts[ix];
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

	if (titulo == null) {
		switch (action) {
			case "A":
				titulo = <span>Agregando liquidacion</span>;
				break;
			case "B":
				titulo = <span>Dando de baja liquidacion</span>;
				break;
			case "M":
				titulo = <span>Modificando liquidacion</span>;
				break;
			default:
				titulo = <span>Consultando liquidacion</span>;
				break;
		}
	}

	if (subtitulo == null) {
		subtitulo = (
			<div className={styles.subtitulo}>
				<span>Empresa</span>
				{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial}`}
			</div>
		);
	}

	return (
		<Modal onClose={() => onCancel(action)}>
			<Grid className={styles.content} col gap={`${gap}px`} full>
				<Grid full="width" className={styles.titulo} justify="center">
					{titulo}
				</Grid>
				<Grid full="width">{subtitulo}</Grid>
				<Controles
					record={liquidacion} // Registro liquidacion.
					empresaId={empresa.id}
					error={errores} // Descripciones de errores. Cada uno debe tener el mimo nombre del campo al que refiere.
					onChange={(cambios) =>
						setLiquidacion((old) => ({ ...old, ...cambios }))
					}
				/>
				<Grid gap={`${gap}px`} grow full="width">
					<Grid grow />
					<Grid col width="30%" justify="end">
						<Grid gap={`${gap}px`}>
							<Button className="botonBlanco" onClick={() => onCancel(action)}>
								Cancela
							</Button>
							<Button onClick={validar}>Confirma</Button>
						</Grid>
					</Grid>
				</Grid>
				{alertsRender}
				{modalExistente}
			</Grid>
		</Modal>
	);
};

export default Form;
