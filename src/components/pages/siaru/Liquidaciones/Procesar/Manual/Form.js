import React, { useEffect, useState } from "react";
import styles from "./Form.module.css";
import Formato from "../../../../../helpers/Formato";
import useHttp from "../../../../../hooks/useHttp";
import Button from "../../../../../ui/Button/Button";
import Modal from "../../../../../ui/Modal/Modal";
import Grid from "../../../../../ui/Grid/Grid";
import Select from "../../../../../ui/Select/Select";
import DateTimePicker from "../../../../../ui/DateTimePicker/DateTimePicker";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import { Alert, AlertTitle, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Form = (props) => {
	const config = { ...props.config };
	const empresa = { ...config.empresa };
	const onCancela = config.onCancela ?? (() => {});
	const onConfirma = config.onConfirma ?? ((data) => {});
	const { sendRequest: request } = useHttp();
	const tiposLiquidaciones = ["Periodo", "Acta"];
	const [errors, setErrors] = useState([]);

	// Cargo parametros
	const [params, setParams] = useState();
	useEffect(() => {
		const requestParam = (param) => {
			request(
				{
					baseURL: "SIARU",
					endpoint: `/Parametros?Nombre=${param}`,
					method: "GET",
				},
				async (resp) => {
					setParams((p) => ({
						...p,
						[param]: Formato.Decimal(resp.valor ?? 0),
					}));
				},
				async (error) => {
					error.message = `${error.message} (${param})`;
					setErrors((e) => [...e, error]);
				}
			);
		};
		if (!params) {
			requestParam("interesesDiariosPosteriorVencimiento");
			requestParam("refMotivosBajaIdRectificaLiquidacion");
		}
	}, [request, params]);

	// Cargo tipos de liquidacion
	const [tiposPagos, setTiposPagos] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_LiquidacionesTiposPagos`,
				method: "GET",
			},
			async (resp) => setTiposPagos({ data: resp }),
			async (error) => setTiposPagos({ error: error })
		);
	}, [request]);

	// Cargo establecimientos
	const [estabList, setEstabList] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/EmpresasEstablecimientos?EmpresasId=${empresa.id}`,
				method: "GET",
			},
			async (resp) => setEstabList({ data: resp }),
			async (error) => setEstabList({ error: error })
		);
	}, [request, empresa.id]);

	const [data, setData] = useState({
		empresasEstablecimientosId: null,
		rectificativa: 0,
		periodo: 0,
		fecha: dayjs().format("YYYY-MM-DD"),
		cantidadTrabajadores: 0,
		totalRemuneraciones: 0,
		fechaPagoEstimada: null,
		interesImporte: 0,
		interesPorcentaje: 0,
		interesNeto: 0,
		conveniosId: 80,
		liquidacionesTiposPagosId: null,
		tipoLiquidacion: null,
	});

	const [err, setErr] = useState({
		empresasEstablecimientosId: "",
		tipoLiquidacion: "",
		liquidacionesTiposPagosId: "",
		periodo: "",
		cantidadTrabajadores: "",
		totalRemuneraciones: "",
		fechaPagoEstimada: "",
	});

	const calcularOtros = (nData) => {
		const r = {
			periodo: "",
			vencimientoFecha: null,
			vencimientoDias: 0,
			importeTotal: 0,
		};

		if (nData.periodo > 100) {
			r.periodo = Formato.Mascara(nData.periodo, "####-##-01");
			r.vencimientoFecha = dayjs(Formato.Mascara(nData.periodo, "####-##-15"))
				.add(1, "month")
				.format("YYYY-MM-DD");

			if (nData.fechaPagoEstimada != null) {
				let d = dayjs(nData.fechaPagoEstimada).diff(r.vencimientoFecha, "days");
				if (d > 0) r.vencimientoDias = d;
			}
		}

		r.importeTotal = nData.interesImporte + nData.interesNeto;
		r.importeTotal = Math.round((r.importeTotal + Number.EPSILON) * 100) / 100;

		return r;
	};

	const otros = calcularOtros(data);

	const calcularData = (nData) => {
		const r = { ...nData };
		const tipoPago = tiposPagos.data?.find(
			(tp) => tp.id === r.liquidacionesTiposPagosId
		);
		//calculo intereses
		r.interesPorcentaje = tipoPago?.porcentaje ?? 0;
		r.interesNeto = r.totalRemuneraciones * (r.interesPorcentaje / 100);
		r.interesNeto = Math.round((r.interesNeto + Number.EPSILON) * 100) / 100;
		const o = calcularOtros(r);
		if (o.vencimientoDias) {
			r.interesImporte =
				r.totalRemuneraciones *
				(params.interesesDiariosPosteriorVencimiento / 100) *
				o.vencimientoDias;
			r.interesImporte =
				Math.round((r.interesImporte + Number.EPSILON) * 100) / 100;
		}
		return r;
	};

	const joinData = (nData) => setData(calcularData({ ...data, ...nData }));

	// Continuar con el alta
	const handleAgregar = (nData) => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_Liquidaciones`,
				method: "POST",
				body: nData,
				headers: { "Content-Type": "application/json" },
			},
			async (resp) => onConfirma(resp),
			async (error) => {
				setErrors((e) => [...e, error]);
				setModalExistente(null);
			}
		);
	};

	// Mensaje de alerta para dar de baja liquidación existente
	const [modalExistente, setModalExistente] = useState();
	const handleExistente = (anterior) => {
		const handleCancelar = () => setModalExistente(null);
		const handleBajaContinuar = () => {
			anterior.refMotivosBajaId = params.refMotivosBajaIdRectificaLiquidacion;
			anterior.bajaObservaciones = "Rectificación de liquidación";
			request(
				{
					baseURL: "SIARU",
					endpoint: `/Siaru_Liquidaciones/${anterior.id}`,
					method: "PUT",
					body: anterior,
					headers: { "Content-Type": "application/json" },
				},
				async (_resp) => {
					handleAgregar({ ...data, rectificativa: anterior.rectificativa + 1 });
				},
				async (error) => {
					setErrors((e) => [...e, error]);
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
									Modificar generación de nueva liquidación
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

	const handleConfirma = () => {
		//validaciones
		let tieneErr = false;
		const newErr = { ...err };

		if (data.empresasEstablecimientosId == null) {
			tieneErr = true;
			newErr.empresasEstablecimientosId = "Dato requerido";
		} else newErr.empresasEstablecimientosId = "";

		if (data.tipoLiquidacion == null) {
			tieneErr = true;
			newErr.tipoLiquidacion = "Dato requerido";
		} else newErr.tipoLiquidacion = "";

		if (data.liquidacionesTiposPagosId == null) {
			tieneErr = true;
			newErr.liquidacionesTiposPagosId = "Dato requerido";
		} else newErr.liquidacionesTiposPagosId = "";

		if (data.periodo === 0) {
			tieneErr = true;
			newErr.periodo = "Dato requerido";
		} else newErr.periodo = "";

		if (data.cantidadTrabajadores === 0) {
			tieneErr = true;
			newErr.cantidadTrabajadores = "Dato requerido";
		} else newErr.cantidadTrabajadores = "";

		if (data.totalRemuneraciones === 0) {
			tieneErr = true;
			newErr.totalRemuneraciones = "Dato requerido";
		} else newErr.totalRemuneraciones = "";

		if (data.fechaPagoEstimada == null) {
			tieneErr = true;
			newErr.fechaPagoEstimada = "Dato requerido";
		} else newErr.fechaPagoEstimada = "";

		if (tieneErr) {
			setErr(newErr);
			return;
		}

		// verificar existencia
		let pars = `EmpresasId=${empresa.id}`;
		pars = `${pars}&EmpresasEstablecimientosId=${data.empresasEstablecimientosId}`;
		pars = `${pars}&LiquidacionesTiposPagosId=${data.liquidacionesTiposPagosId}`;
		pars = `${pars}&Periodo=${data.periodo}`;
		pars = `${pars}&RefMotivosBajaId=0`;
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_Liquidaciones?${pars}`,
				method: "GET",
			},
			async (resp) =>
				resp.length > 0 ? handleExistente(resp[0]) : handleAgregar(data),
			async (error) => setEstabList({ error: error })
		);
	};

	const gap = 10;
	return (
		<Modal onClose={onCancela}>
			<Grid className={styles.content} col gap={`${gap}px`} full>
				<Grid className={styles.titulo} full="width" justify="center">
				<span>Generando liquidacion</span>
				</Grid>
				<Grid full="width">
					<div className={styles.subtitulo}>
						<span>Empresa</span> {Formato.Cuit(empresa.cuit)}{" "}
						{empresa.razonSocial}
					</div>
				</Grid>
				<Grid full="width">
					<Select
						name="empresasEstablecimientosId"
						label="Establecimiento"
						required
						error={
							estabList.loading
								? "cargando"
								: estabList.error
								? `Error ${estabList.error.code} - ${estabList.error.message}`
								: err.empresasEstablecimientosId
						}
						value={data.empresasEstablecimientosId}
						options={
							estabList.data?.map((r) => ({
								label: r.nombre,
								value: r.id,
							})) ?? []
						}
						onChange={(v) => joinData({ empresasEstablecimientosId: v })}
					/>
				</Grid>
				<Grid gap={`${gap}px`} full="width">
					<Grid width="50%">
						<Select
							name="tipoLiquidacion"
							label="Tipo de liquidacion"
							required
							error={err.tipoLiquidacion}
							value={data.tipoLiquidacion}
							options={tiposLiquidaciones.map((r, index) => ({
								label: r,
								value: index,
							}))}
							onChange={(v) => joinData({ tipoLiquidacion: v })}
						/>
					</Grid>
					<Grid width="50%">
						<Select
							name="liquidacionesTiposPagosId"
							label="Tipo de pago"
							required
							error={
								tiposPagos.loading
									? "cargando"
									: tiposPagos.error
									? `Error ${tiposPagos.error.code} - ${tiposPagos.error.message}`
									: err.liquidacionesTiposPagosId
							}
							value={data.liquidacionesTiposPagosId}
							options={
								tiposPagos.data?.map((r) => ({
									label: r.descripcion,
									value: r.id,
								})) ?? []
							}
							onChange={(v) => joinData({ liquidacionesTiposPagosId: v })}
						/>
					</Grid>
				</Grid>
				<Grid gap={`${gap}px`} full="width">
					<Grid width="25%">
						<DateTimePicker
							type="month"
							label="Periodo"
							InputLabelProps={{ shrink: true }}
							value={otros.periodo}
							disableFuture
							required
							minDate="1994-01-01"
							maxDate={dayjs().format("YYYY-MM-DD")}
							error={err.periodo}
							onChange={(f) =>
								joinData({ periodo: Formato.Entero(f?.format("YYYYMM") ?? 0) })
							}
						/>
					</Grid>
					<Grid width="25%">
						<DateTimePicker
							type="date"
							label="Fecha de vencimiento"
							InputLabelProps={{ shrink: true }}
							disabled
							value={otros.vencimientoFecha}
						/>
					</Grid>
					<Grid width="25%">
						<DateTimePicker
							type="date"
							label="Fecha pago estimada"
							InputLabelProps={{ shrink: true }}
							value={data.fechaPagoEstimada}
							minDate={dayjs().format("YYYY-MM-DD")}
							required
							error={err.fechaPagoEstimada}
							onChange={(f) =>
								joinData({ fechaPagoEstimada: f?.format("YYYY-MM-DD") ?? null })
							}
						/>
					</Grid>
					<Grid width="25%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							type="number"
							label="Cant. trabajadores"
							required
							error={err.cantidadTrabajadores}
							InputLabelProps={{
								shrink: true,
							}}
							value={data.cantidadTrabajadores}
							onChange={(e) =>
								joinData({
									cantidadTrabajadores: Formato.Entero(e.target.value),
								})
							}
						/>
					</Grid>
				</Grid>
				<Grid gap={`${gap}px`} full="width">
					<Grid width="25%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							type="number"
							label="Total remuneraciones"
							required
							error={err.totalRemuneraciones}
							InputLabelProps={{ shrink: true }}
							value={data.totalRemuneraciones}
							onChange={(e) =>
								joinData({
									totalRemuneraciones: Formato.Decimal(e.target.value),
								})
							}
						/>
					</Grid>
					<Grid width="77%" />
				</Grid>
				<Grid full="width">
					<div className={styles.subtitulo}>
						<span>Subtotales</span>
					</div>
				</Grid>
				<Grid gap={`${gap}px`} full="width">
					<Grid width="50%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							type="number"
							label="Aporte"
							InputLabelProps={{ shrink: true }}
							disabled
							value={data.interesNeto}
						/>
					</Grid>
				</Grid>
				<Grid full="width">
					<div className={styles.subtitulo}>
						<span>Intereses</span>
					</div>
				</Grid>
				<Grid gap={`${gap}px`} full="width">
					<Grid width="50%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							type="number"
							label="Importe interes"
							InputLabelProps={{ shrink: true }}
							disabled
							value={data.interesImporte}
						/>
					</Grid>
					<Grid width="50%" />
				</Grid>
				<Grid full="width">
					<div className={styles.subtitulo}>
						<span>Total a pagar</span>
					</div>
				</Grid>
				<Grid gap={`${gap}px`} full="width">
					<Grid width="50%">
						<TextField
							size="small"
							style={{ width: "100%" }}
							type="number"
							label="importe"
							InputLabelProps={{ shrink: true }}
							disabled
							value={otros.importeTotal}
						/>
					</Grid>
					<Grid width="50%" />
				</Grid>
				<Grid col grow full="width" justify="end">
					<Grid gap={`${gap}px`} full="width">
						<Grid col grow>
							{errors.map((error, ix) => (
								<Collapse in={true} style={{ width: "100%" }}>
									<Alert
										severity="error"
										action={
											<IconButton
												aria-label="close"
												color="inherit"
												size="small"
												onClick={() => {
													const newErrors = [...errors];
													delete newErrors[ix];
													setErrors(newErrors);
												}}
											>
												<CloseIcon fontSize="inherit" />
											</IconButton>
										}
										sx={{ mb: 2 }}
										style={{ marginBottom: "0" }}
									>
										<AlertTitle>
											<strong>Error</strong>
										</AlertTitle>
										{error.message}
									</Alert>
								</Collapse>
							))}
						</Grid>
						<Grid col width="30%" justify="end">
							<Grid gap={`${gap}px`}>
								<Grid width="50%">
									<Button className="botonBlanco" onClick={() => onCancela()}>
										Cerrar
									</Button>
								</Grid>
								<Grid width="50%">
									<Button onClick={handleConfirma}>Generar</Button>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				{modalExistente}
			</Grid>
		</Modal>
	);
};

export default Form;
