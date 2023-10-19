import React, { useState } from "react";
import styles from "./Form.module.css";
import Controles from "./Controles";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import modalStyles from "components/ui/Modal/Modal.module.css";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, AlertTitle } from "@mui/lab";
import { IconButton, Collapse } from "@mui/material";

const Form = ({
	request = "C", //"A" = Alta, "B" = Baja, "M" = Modificacion, "C" = Consulta
	titulo = null,
	subtitulo = null,
	record = {}, // Registro de liquidacion a realizar baja/modificaicon/consulta. Si es alta, se toman estos datos como iniciales.
	empresa = {}, // Empresa a la que pertenece la liquidacion
	disabled = {}, // Controles deshabilitados. Cada uno debe tener el mismo nombre del campo al que refiere.
	onConfirm = (_record, _request) => {}, // Acción a realizar al confirmar
	onCancel = (_request) => {}, // Accion a realizar al cancelar
}) => {
	record = { ...record };
	disabled ??= {};
	if (!["M", "B", "C"].includes(request)) {
		if (request === "A") record.id = 0;
		disabled.refMotivoBajaId = true;
		disabled.deletedObs = true;
	}
	if (record.tipoLiquidacion === undefined) record.tipoLiquidacion = 0;

	const [liquidacion, setLiquidacion] = useState(record);
	const [errores, setErrores] = useState({});
	const [alerts, setAlerts] = useState([]);

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, _params) => {
		switch (action) {
			case "GetLiquidacionList":
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/Liquidaciones`,
					},
				};
			default:
				return null;
		}
	});
	//#endregion

	const gap = 10;

	// Aplicar cambios permanentes
	const applyRequest = (data) => {
		if (data.refMotivoBajaId) data.deletedDate = dayjs().format("YYYY-MM-DD");
		onConfirm(data, request);
	};

	// Mensaje de alerta para dar de baja liquidación existente
	const [modalExistente, setModalExistente] = useState();
	const handleExistente = (anterior) => {
		const handleCancelar = () => setModalExistente(null);
		const handleBajaContinuar = () =>
			applyRequest({
				...liquidacion,
				rectificativa: Formato.Entero(anterior.rectificativa ?? 0) + 1,
				refMotivoBajaId: 0,
				deletedObs: "Rectificación de liquidación",
			});
		setModalExistente(
			<Modal onClose={handleCancelar}>
				<Grid col gap={`${gap}px`} full>
					<Grid width="full" justify="center">
						<h3>
							Ya existe una liquidación para el establecimiento y el período
							indicado
						</h3>
					</Grid>
					<Grid width="full" gap="200px" justify="center">
						<Grid width="150px">
							<Button className="botonAzul" onClick={handleBajaContinuar}>
								Dar de baja liquidación anterior y continuar
							</Button>
						</Grid>
						<Grid width="150px">
							<Button className="botonAmarillo" onClick={handleCancelar}>
								Volver para modificar datos
							</Button>
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
			request // Validaciones específicas segun request
		) {
			case "A": // Alta
				break;
			case "B": // Baja
				if (liquidacion.refMotivoBajaId) {
					newErrores.refMotivoBajaId = "";
				} else {
					noValida = true;
					newErrores.refMotivoBajaId = "Dato requerido cuando es una baja";
				}
				break;
			case "M": // Modificaicon
				break;
			default: // No se reconoce request
				onCancel(request);
				return;
		}

		setErrores((old) => ({ ...old, ...newErrores }));

		if (request !== "B" && !liquidacion.nominas?.length) {
			noValida = true;
			newAlerts.push({
				severity: "error",
				title: "Sin nominas",
				message: "Debe especificar nominas",
			});
		}

		setAlerts((old) => [...old, ...newAlerts]);

		if (noValida) return;

		if (liquidacion.refMotivoBajaId) {
			// Si se agrega o modifica con información de baja,
			// no hace falta controlar si exite anterior activo
			applyRequest(liquidacion);
			return;
		}

		// verificar existencia de activo
		pushQuery({
			action: "GetLiquidacionList",
			params: {
				empresaId: empresa.id,
				empresaEstablecimientoId: liquidacion.empresaEstablecimientoId,
				liquidacionTipoPagoId: liquidacion.liquidacionTipoPagoId,
				tipoLiquidacion: liquidacion.tipoLiquidacion,
				periodo: liquidacion.periodo,
				refMotivoBajaId: 0,
			},
			onOk: async (res) => {
				const liq = res.data.find((r) => r.id !== liquidacion.id);
				if (liq != null) handleExistente(liq);
				else applyRequest(liquidacion);
			},
		});
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
		switch (request) {
			case "A":
				titulo = "Agregando liquidación";
				break;
			case "B":
				titulo = "Dando de baja liquidación";
				break;
			case "M":
				titulo = "Modificando liquidación";
				break;
			default:
				titulo = "Consultando liquidación";
				break;
		}
		if (request !== "A") {
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

	return (
		<Modal onClose={() => onCancel(request)}>
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
					forzarCalculos={request === "A"}
				/>
				<Grid width="full" gap="200px" justify="center">
					<Grid width="150px">
						{["A", "B", "M"].includes(request) ? (
							<Button className="botonAzul" onClick={validar}>
								CONFIRMA
							</Button>
						) : null}
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={() => onCancel(request)}>
							CANCELA
						</Button>
					</Grid>
				</Grid>
				{alertsRender}
				{modalExistente}
			</Grid>
		</Modal>
	);
};

export default Form;
