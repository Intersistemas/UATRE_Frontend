import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import styles from "./Controles.module.css";
import useHttp from "../../../../hooks/useHttp";
import Formato from "../../../../helpers/Formato";
import Grid from "../../../../ui/Grid/Grid";
import DateTimePicker from "../../../../ui/DateTimePicker/DateTimePicker";
import SelectMaterial from "../../../../ui/Select/SelectMaterial";
import InputMaterial from "../../../../ui/Input/InputMaterial";
import Table from "../../../../ui/Table/Table";
import { Collapse, IconButton, Tabs, Tab } from "@mui/material";
import { Alert, AlertTitle } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";

const Controles = ({
	record = {}, // Registro liquidacion.
	empresaId = 0,
	error = {}, // Descripciones de errores. Cada uno debe tener el mismo nombre del campo al que refiere.
	disabled: disabledInit = {}, // Controles deshabilitados. Cada uno debe tener el mismo nombre del campo al que refiere.
	onChange = (_cambios) => {}, // Evento cuando cambia de valor un campo { campoNombre: valor }.
	forzarCalculos: forzarCalculosParam = false,
}) => {
	record ??= {};
	error ??= {};
	disabledInit ??= {};
	disabledInit.bajaObservaciones =
		disabledInit.refMotivoBajaId || !record.refMotivoBajaId;
	const [disabled, setDisabled] = useState(disabledInit);

	const [alerts, setAlerts] = useState([]);
	const { sendRequest } = useHttp();
	const [currentTab, setCurrentTab] = useState(0);

	//#region Cargo establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		loading: "Cargando...",
		data: [],
	});
	useEffect(() => {
		sendRequest(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetByEmpresa?EmpresaId=${empresaId}&PageSize=5000`,
				method: "GET",
			},
			async (res) => {
				setEstablecimientos({ data: [...res.data] });
			},
			async (err) => {
				setEstablecimientos({
					error: err.message ?? "Ocurrió un error.",
					data: [],
				});
				setAlerts((old) => [
					...old,
					{
						severity: "error",
						title: `${err.type} cargando establecimientos`,
						message: err.message,
					},
				]);
			}
		);
	}, [sendRequest, empresaId]);
	//#endregion

	const tiposLiquidaciones = [
		{ id: 0, nombre: "Periodo" },
		{ id: 1, nombre: "Acta" },
	];

	//#region Cargo tipos de pago
	const [tiposPagos, setTiposPagos] = useState({
		loading: "Cargando...",
		data: [],
	});
	useEffect(() => {
		sendRequest(
			{
				baseURL: "SIARU",
				endpoint: `/LiquidacionesTiposPagos`,
				method: "GET",
			},
			async (res) => {
				setTiposPagos({ data: [...res] });
			},
			async (err) => {
				setTiposPagos({ error: err.message ?? "Ocurrió un error." });
				setAlerts((old) => [
					...old,
					{
						severity: "error",
						title: `${err.type} cargando tipos de pago`,
						message: err.message,
					},
				]);
			}
		);
	}, [sendRequest]);
	//#endregion

	//#region Cargo parametros
	const [pendingParams, setPendingParams] = useState([
		"InteresesDiariosPosteriorVencimiento",
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
			sendRequest(
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
	}, [sendRequest, params, pendingParams]);
	//#endregion

	const calcularOtros = (data) => {
		const r = {
			periodo: "",
			vencimientoFecha: data.vencimientoFecha ?? null,
			fechaPagoEstimada: data.fechaPagoEstimada ?? null,
			vencimientoDias: 0,
			interesImporte: data.interesImporte ?? 0,
			interesNeto: data.interesNeto ?? 0,
			importeTotal: 0,
		};

		if (data.periodo > 100) {
			r.periodo = Formato.Mascara(data.periodo, "####-##-01");
			r.vencimientoFecha = dayjs(Formato.Mascara(data.periodo, "####-##-15"))
				.add(1, "month")
				.format("YYYY-MM-DD");

			if (data.fechaPagoEstimada != null) {
				let d = dayjs(data.fechaPagoEstimada).diff(r.vencimientoFecha, "days");
				if (d > 0) r.vencimientoDias = d;
			}
		}

		r.importeTotal = r.interesImporte + r.interesNeto;
		r.importeTotal = Math.round((r.importeTotal + Number.EPSILON) * 100) / 100;

		return r;
	};

	const calculados = calcularOtros(record);

	const handleChange = (cambios) => {
		const recordCambios = { ...record, ...cambios };
		if (recordCambios.totalRemuneraciones === undefined)
			recordCambios.totalRemuneraciones = 0;
		if (recordCambios.interesPorcentaje === undefined)
			recordCambios.interesPorcentaje = 0;

		if ("liquidacionTipoPagoId" in cambios) {
			recordCambios.interesPorcentaje =
				tiposPagos.data.find(
					(r) => r.id === recordCambios.liquidacionTipoPagoId
				)?.porcentaje ?? 0;
			cambios.interesPorcentaje = recordCambios.interesPorcentaje;
		}

		if ("totalRemuneraciones" in cambios || "interesPorcentaje" in cambios) {
			recordCambios.interesNeto =
				recordCambios.totalRemuneraciones *
				(recordCambios.interesPorcentaje / 100);
			recordCambios.interesNeto =
				Math.round((recordCambios.interesNeto + Number.EPSILON) * 100) / 100;
			cambios.interesNeto = recordCambios.interesNeto;
		}
		// Calculo los campos calculados
		const o = calcularOtros(recordCambios);
		recordCambios.interesImporte =
			recordCambios.totalRemuneraciones *
			(params.InteresesDiariosPosteriorVencimiento / 100) *
			o.vencimientoDias;
		recordCambios.interesImporte =
			Math.round((recordCambios.interesImporte + Number.EPSILON) * 100) / 100;
		// Verifico si cambiaron los campos calculados
		if (record.interesImporte !== recordCambios.interesImporte) {
			cambios.interesImporte = recordCambios.interesImporte;
		}
		if (record.vencimientoFecha !== recordCambios.vencimientoFecha) {
			cambios.vencimientoFecha = recordCambios.vencimientoFecha;
		}
		onChange(cambios);
	};

	const [forzarCalculos, setForzarCalculos] = useState(forzarCalculosParam);
	if (forzarCalculos && pendingParams.length === 0 && !tiposPagos.loading) {
		setForzarCalculos(false);
		handleChange(record);
	}

	const gap = 10;
	const valor = (value) => (value ? value : " ");

	let alertsRender;
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

	//#region carga de motivos de baja
	//ToDo: cargar desde api
	const [motivosBaja, setMotivosBaja] = useState({
		loading: "Cargando...",
		data: [],
	});
	useEffect(() => {
		sendRequest(
			{
				baseURL: "Comunes",
				// endpoint: `/RefMotivoBaja/GetByTipo?Tipo=L`,
				endpoint: `/RefMotivoBaja/GetAll`, //Por ahora utilizo GetAll hasta que GetByTipo retorne una lista en vez de un solo registro
				method: "GET",
			},
			async (res) => {
				//Una vez que GetByTipo retorne una lista, quitar el bloque hasta ---FIN HACK---
				res = [...res].filter((r) => (r?.tipo ?? "") === "L");
				//---FIN HACK---
				setMotivosBaja({
					data: [{ id: 0, tipo: "L", descripcion: "Activo" }, ...res],
				});
			},
			async (err) => {
				setMotivosBaja({ error: err.message ?? "Ocurrió un error", data: [] });
			}
		);
	}, [sendRequest]);
	//#endregion

	let content;
	switch (currentTab) {
		case 1:
			const cs = {
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
			};
			const columns = [
				{
					dataField: "cuil",
					text: "CUIL",
					sort: true,
					headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
					formatter: Formato.Cuit,
					style: { ...cs },
				},
				{
					dataField: "nombre",
					text: "Nombre",
					sort: true,
					style: { ...cs, textAlign: "left" },
				},
			];
			content = (
				<Table
					keyField="cuil"
					loading={false}
					data={record.nominas ?? []}
					columns={columns}
					onSelected={(_) => {}}
				/>
			);
			break;
		default:
			let renderMotvoBaja = null;
			if (!disabled.refMotivoBajaId)
				renderMotvoBaja = (
					<Grid gap={`${gap}px`} full="width">
						<SelectMaterial
							name="refMotivoBajaId"
							label="Motivo de baja"
							value={record.refMotivoBajaId ?? 0}
							error={[
								error.refMotivoBajaId,
								motivosBaja.loading,
								motivosBaja.error,
							]
								.filter((r) => r)
								.join(" ")}
							disabled={!!disabled.refMotivoBajaId}
							options={motivosBaja.data.map((r) => ({
								label: r.descripcion,
								value: r.id,
							}))}
							onChange={(value, _id) => {
								handleChange({ refMotivoBajaId: value });
								setDisabled((old) => ({
									...old,
									bajaObservaciones: value === 0,
								}));
							}}
						/>
					</Grid>
				);
			let renderObservaciones = null;
			if (!disabled.bajaObservaciones)
				renderObservaciones = (
					<Grid gap={`${gap}px`} full="width">
						<InputMaterial
							label="Observaciones de baja"
							value={valor(record.bajaObservaciones)}
							disabled={!!disabled.bajaObservaciones}
							onChange={(value, _id) =>
								handleChange({ bajaObservaciones: `${value}` })
							}
						/>
					</Grid>
				);
			content = (
				<>
					<Grid full="width">
						<SelectMaterial
							name="empresaEstablecimientoId"
							label="Establecimiento"
							value={record.empresaEstablecimientoId ?? 0}
							error={[
								error.empresaEstablecimientoId,
								establecimientos.loading,
								establecimientos.error,
							]
								.filter((r) => r)
								.join(" ")}
							disabled={!!disabled.empresaEstablecimientoId}
							options={establecimientos.data.map((r) => ({
								label: r.nombre,
								value: r.id,
							}))}
							onChange={(value, _id) =>
								handleChange({ empresaEstablecimientoId: value })
							}
						/>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<SelectMaterial
							name="tipoLiquidacion"
							label="Tipo de liquidación"
							value={tiposLiquidaciones.find(
								(r) => r.id === record.tipoLiquidacion
							)}
							error={error.tipoLiquidacion ?? ""}
							disabled={!!disabled.tipoLiquidacion}
							options={tiposLiquidaciones.map((r) => ({
								label: r.nombre,
								value: r,
							}))}
							onChange={(value, _id) =>
								handleChange({ tipoLiquidacion: value.id })
							}
						/>
						<SelectMaterial
							name="liquidacionTipoPagoId"
							label="Tipo de pago"
							value={record.liquidacionTipoPagoId ?? 0}
							error={[
								error.liquidacionTipoPagoId,
								tiposPagos.loading,
								tiposPagos.error,
							]
								.filter((r) => r)
								.join(" ")}
							disabled={!!disabled.liquidacionTipoPagoId}
							options={tiposPagos.data.map((r) => ({
								label: r.descripcion,
								value: r.id,
							}))}
							onChange={(value, _id) =>
								handleChange({
									liquidacionTipoPagoId: value,
								})
							}
						/>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<DateTimePicker
							type="month"
							label="Período"
							disableFuture
							minDate="1994-01-01"
							maxDate={dayjs().format("YYYY-MM-DD")}
							value={calculados.periodo ?? ""}
							disabled={disabled.periodo ?? false}
							error={error.periodo ?? ""}
							required
							onChange={(f) =>
								handleChange({
									periodo: Formato.Entero(f?.format("YYYYMM") ?? 0),
								})
							}
						/>
						<DateTimePicker
							type="date"
							label="Fecha de vencimiento"
							disabled
							value={calculados.vencimientoFecha ?? ""}
						/>
						<DateTimePicker
							type="date"
							label="Fecha pago estimada"
							minDate={dayjs().format("YYYY-MM-DD")}
							value={calculados.fechaPagoEstimada ?? ""}
							disabled={!!disabled.fechaPagoEstimada}
							error={error.fechaPagoEstimada ?? ""}
							required
							onChange={(f) =>
								handleChange({
									fechaPagoEstimada: f?.format("YYYY-MM-DD") ?? null,
								})
							}
						/>
						<InputMaterial
							type="number"
							label="Cantidad de trabajadores"
							value={valor(record.cantidadTrabajadores)}
							error={!!error.cantidadTrabajadores}
							helperText={error.cantidadTrabajadores ?? ""}
							disabled={!!disabled.cantidadTrabajadores}
							onChange={(value, _id) =>
								handleChange({
									cantidadTrabajadores: Formato.Entero(value),
								})
							}
						/>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<Grid width="25">
							<InputMaterial
								type="number"
								label="Total remuneraciones"
								value={valor(record.totalRemuneraciones)}
								error={!!error.totalRemuneraciones}
								helperText={error.totalRemuneraciones ?? ""}
								disabled={!!disabled.totalRemuneraciones}
								onChange={(value, _id) =>
									handleChange({
										totalRemuneraciones: Formato.Decimal(value),
									})
								}
							/>
						</Grid>
					</Grid>
					{renderMotvoBaja}
					{renderObservaciones}
					<Grid full="width">
						<div className={styles.subtitulo}>
							<span>Subtotales</span>
						</div>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<InputMaterial
							label="Aporte"
							value={valor(Formato.Moneda(calculados.interesNeto))}
							disabled
						/>
						<InputMaterial
							label="Intereses"
							value={valor(Formato.Moneda(calculados.interesImporte))}
							disabled
						/>
						<InputMaterial
							label="Total a pagar"
							value={valor(Formato.Moneda(calculados.importeTotal))}
							disabled
						/>
					</Grid>
				</>
			);
			break;
	}

	return (
		<Grid col gap={`${gap}px`} full="width">
			<Tabs
				value={currentTab}
				onChange={(_event, newValue) => setCurrentTab(newValue)}
				aria-label="basic tabs example"
			>
				<Tab label="Datos generales" />
				<Tab label="Nomina" />
			</Tabs>
			{content}
			{alertsRender}
		</Grid>
	);
};

export default Controles;
