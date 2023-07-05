import React, { useEffect, useState } from "react";
import styles from "./Form.module.css";
import Controles from "./Controles";
import Formato from "../../../../helpers/Formato";
import useHttp from "../../../../hooks/useHttp";
import Button from "../../../../ui/Button/Button";
import Grid from "../../../../ui/Grid/Grid";
import Modal from "../../../../ui/Modal/Modal";
import modalStyles from "../../../../ui/Modal/Modal.module.css";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, AlertTitle } from "@mui/lab";
import { IconButton, Collapse } from "@mui/material";

const Form = ({
	request: requestParam = "C", //"A" = Alta, "B" = Baja, "M" = Modificacion, "C" = Consulta
	titulo = null,
	subtitulo = null,
	record = {}, // Registro de liquidacion a realizar baja/modificaicon/consulta. Si es alta, se toman estos datos como iniciales.
	empresa = {}, // Empresa a la que pertenece la liquidacion
	disabled = {}, // Controles deshabilitados. Cada uno debe tener el mismo nombre del campo al que refiere.
	onConfirm = (_record, _request) => {}, // Acción a realizar al confirmar
	onCancel = (_request) => {}, // Accion a realizar al cancelar
}) => {
	record = { ...record };
	if (requestParam === "A") record.id = 0;
	if (record.tipoLiquidacion === undefined) record.tipoLiquidacion = 0;

	const [liquidacion, setLiquidacion] = useState(record);
	const [errores, setErrores] = useState({});
	const [alerts, setAlerts] = useState([]);
	const { sendRequest: request } = useHttp();

	// Cargo parametros
	const [pendingParams, setPendingParams] = useState([
		"RefMotivosBajaIdRectificaLiquidacion",
	]);
	const [params, setParams] = useState();
	useEffect(() => {
		const removePendingParam = (param) =>
			setPendingParams((old) => {
				const newPendingParams = [...old];
				const ix = newPendingParams.indexOf(param);
				if (ix > -1) newPendingParams.splice(ix, 1);
				return newPendingParams;
			});
		const requestParam = (param) => {
			request(
				{
					baseURL: "Comunes",
					endpoint: `/Parametros/${param}`,
					method: "GET",
				},
				async (res) => {
					setParams((old) => ({
						...old,
						[param]: Formato.Decimal(res.valor ?? 0),
					}));
					removePendingParam(param);
				},
				async (err) => {
					setAlerts((old) => [
						...old,
						{
							severity: "error",
							title: `${err.type} cargando parametro "${param}"`,
							message: err.message,
						},
					]);
					removePendingParam(param);
				}
			);
		};
		if (!params) pendingParams.forEach((param) => requestParam(param));
	}, [request, params, pendingParams]);

	const gap = 10;

	// Aplicar cambios permanentes
	const applyRequest = (data) => {
		if (data.refMotivosBajaId) data.bajaFecha = dayjs().format("YYYY-MM-DD");

		const endpoint = `/Liquidaciones`;
		const { nominas, ...liq } = data;
		let method;
		let body;
		if (requestParam === "A") {
			method = "POST";
			body = data;
		} else {
			method = "PATCH";
			body = liq;
		}

		request(
			{
				baseURL: "SIARU",
				endpoint: endpoint,
				method: method,
				body: body,
				headers: { "Content-Type": "application/json" },
			},
			async (res) => onConfirm(res, requestParam),
			async (err) => {
				setAlerts((old) => [
					...old,
					{ severity: "error", title: "Error", message: err.message },
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
		let noValida = false;
		const newErrores = {};
		const newAlerts = [];

		if (liquidacion.empresaEstablecimientoId) {
			newErrores.empresaEstablecimientoId = "";
		} else {
			noValida = true;
			newErrores.empresaEstablecimientoId = "Dato requerido";
		}

		if (liquidacion.tipoLiquidacion !== undefined) {
			newErrores.tipoLiquidacion = "";
		} else {
			noValida = true;
			newErrores.tipoLiquidacion = "Dato requerido";
		}

		if (liquidacion.liquidacionTipoPagoId) {
			newErrores.liquidacionTipoPagoId = "";
		} else {
			noValida = true;
			newErrores.liquidacionTipoPagoId = "Dato requerido";
		}

		if (liquidacion.periodo) {
			newErrores.periodo = "";
		} else {
			noValida = true;
			newErrores.periodo = "Dato requerido";
		}

		if (liquidacion.cantidadTrabajadores) {
			newErrores.cantidadTrabajadores = "";
		} else {
			noValida = true;
			newErrores.cantidadTrabajadores = "Dato requerido";
		}

		if (liquidacion.totalRemuneraciones) {
			newErrores.totalRemuneraciones = "";
		} else {
			noValida = true;
			newErrores.totalRemuneraciones = "Dato requerido";
		}

		if (liquidacion.fechaPagoEstimada) {
			newErrores.fechaPagoEstimada = "";
		} else {
			noValida = true;
			newErrores.fechaPagoEstimada = "Dato requerido";
		}

		switch (
			requestParam // Validaciones específicas segun request
		) {
			case "A": // Alta
				break;
			case "B": // Baja
				if (liquidacion.refMotivosBajaId) {
					newErrores.refMotivosBajaId = "";
				} else {
					noValida = true;
					newErrores.refMotivosBajaId = "Dato requerido cuando es una baja";
				}
				break;
			case "M": // Modificaicon
				break;
			default: // No se reconoce request
				onCancel(requestParam);
				return;
		}

		setErrores((old) => ({ ...old, ...newErrores }));

		if (!liquidacion.nominas?.length) {
			noValida = true;
			newAlerts.push({
				severity: "error",
				title: "Sin nominas",
				message: "Debe especificar nominas",
			});
		}

		setAlerts((old) => [...old, ...newAlerts]);

		if (noValida) return;

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

	if (titulo == null) {
		switch (requestParam) {
			case "A":
				titulo = "Agregando Liquidación";
				break;
			case "B":
				titulo = "Dando de baja Liquidación";
				break;
			case "M":
				titulo = "Modificando Liquidación";
				break;
			default:
				titulo = "Consultando Liquidación";
				break;
		}
		if (requestParam !== "A") {
			titulo = `${titulo} Nro. ${record.id} - ${Formato.Fecha(record.fecha)}`;
		}
	} 
	if (!React.isValidElement(titulo)) {
		titulo = <h3>{titulo}</h3>;
	}

	if (subtitulo == null) {
		subtitulo = (
			<div className={styles.subtitulo}>
				<span>Empresa</span>
				{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial}`}
			</div>
		);
	}

	const renderConfirmaButton = ["A", "B", "M"].includes(requestParam) ? (
		<Button onClick={validar}>Confirma</Button>
	) : null;
	return (
		<Modal onClose={() => onCancel(requestParam)}>
			<Grid className={styles.content} col gap={`${gap}px`} full>
				<Grid
					className={modalStyles.modalCabecera}
					full="width"
					justify="center"
				>
					{titulo}
				</Grid>
				<Grid full="width">{subtitulo}</Grid>
				<Controles
					record={liquidacion} // Registro liquidacion.
					empresaId={empresa.id}
					error={errores} // Descripciones de errores. Cada uno debe tener el mismo nombre del campo al que refiere.
					disabled={disabled}
					onChange={(cambios) => {
						setLiquidacion((old) => ({ ...old, ...cambios }));
					}}
					forzarCalculos={requestParam === "A"}
				/>
				<Grid gap={`${gap}px`} grow full="width">
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
				{alertsRender}
				{modalExistente}
			</Grid>
		</Modal>
	);
};

export default Form;
