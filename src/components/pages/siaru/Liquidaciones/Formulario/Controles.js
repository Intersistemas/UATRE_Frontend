import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import styles from "./Controles.module.css";
import useQueryQueue from "components/hooks/useQueryQueue";
import Formato from "components/helpers/Formato";
import Grid from "components/ui/Grid/Grid";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import InputMaterial from "components/ui/Input/InputMaterial";
import Table from "components/ui/Table/Table";
import { Collapse, IconButton, Tabs, Tab } from "@mui/material";
import { Alert, AlertTitle } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import CalcularCampos from "./CalcularCampos";

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
	disabledInit.deletedObs =
		disabledInit.refMotivoBajaId || !record.refMotivoBajaId;
	const [disabled, setDisabled] = useState(disabledInit);

	const [alerts, setAlerts] = useState([]);
	const [currentTab, setCurrentTab] = useState(0);

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetLiquidacionesTiposPagos":
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesTiposPagos`,
						method: "GET",
					},
				};
			case "GetEstablecimientosByEmpresa":
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
					},
				};
			case "GetParameter":
				const { paramName, ...other } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Parametros/${paramName}`,
						method: "GET",
					},
					params: other,
				};
			case "GetMotivosBaja":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefMotivoBaja/GetByTipo`,
						method: "GET",
					},
				};
			default:
				return null;
		}
	});
	//#endregion

	//#region Cargo establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		loading: "Cargando...",
		data: [],
	});
	useEffect(() => {
		pushQuery({
			action: "GetEstablecimientosByEmpresa",
			params: {
				empresaId: empresaId,
				pageSize: 5000,
			},
			onOk: async (res) => setEstablecimientos({ data: [...res.data] }),
			onError: async (err) => {
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
			},
		});
	}, [empresaId, pushQuery]);
	//#endregion

	const tiposLiquidaciones = [
		{ id: 0, nombre: "Periodo" },
		{ id: 1, nombre: "Acta" },
	];

	//#region Cargo parametros
	const [params, setParams] = useState({
		loading: "Cargando...",
		data: {
			InteresesDiariosPosteriorVencimiento: 0
		},
		error: {},
	});
	useEffect(() => {
		if (!params.loading) return;
		const pending = Object.keys(params.data);
		const result = {...params.data};
		const errors = {};
		const formatParamValue = (param, value) => {
			switch (param) {
				case "InteresesDiariosPosteriorVencimiento":
					return Formato.Decimal(value ?? 0);
				default:
					return value;
			}
		};
		const queryParam = (param) =>
			pushQuery({
				action: "GetParameter",
				params: { paramName: param },
				onOk: async (res) => {
					result[param] = formatParamValue(param, res.valor);
				},
				onError: async (err) => {
					errors[param] = err;
				},
				onFinally: async () => {
					pending.splice(pending.indexOf(param), 1);
					if (pending.length === 0) {
						setParams({
							data: result,
							error: Object.keys(errors).length ? errors : null,
						});
					}
				},
			});
		pending.forEach((param) => queryParam(param));
	}, [pushQuery, params]);
	//#endregion

	//#region Cargo tipos de pago
	const [tiposPagos, setTiposPagos] = useState({
		loading: "Cargando...",
		data: [],
	});
	useEffect(() => {
		if (!tiposPagos.loading) return;
		pushQuery({
			action: "GetLiquidacionesTiposPagos",
			onOk: async (res) => setTiposPagos({ data: [...res] }),
			onError: async (err) => {
				setTiposPagos({ error: err.message ?? "Ocurrió un error." });
				setAlerts((old) => [
					...old,
					{
						severity: "error",
						title: `${err.type} cargando tipos de pago`,
						message: err.message,
					},
				]);
			},
		});
	}, [pushQuery, tiposPagos]);
	//#endregion

	const calculados = CalcularCampos(record, params.data);
	calculados.periodo = record.periodo
		? (calculados.periodo = Formato.Mascara(record.periodo, "####-##-01"))
		: null;

	const handleChange = (cambios) => {
		const recordCambios = { ...record, ...cambios };

		if ("liquidacionTipoPagoId" in cambios) {
			recordCambios.interesPorcentaje =
				tiposPagos.data.find(
					(r) => r.id === recordCambios.liquidacionTipoPagoId
				)?.porcentaje ?? 0;
			cambios.interesPorcentaje = recordCambios.interesPorcentaje;
		}

		// Calculo los campos calculados
		const o = CalcularCampos(recordCambios, params.data);
		recordCambios.interesNeto = o.interesNeto
		recordCambios.interesImporte = o.interesImporte

		// Verifico si cambiaron los campos calculados
		if ("totalRemuneraciones" in cambios || "interesPorcentaje" in cambios) {
			cambios.interesNeto = recordCambios.interesNeto;
		}
		if (record.interesImporte !== recordCambios.interesImporte) {
			cambios.interesImporte = recordCambios.interesImporte;
		}
		if (record.vencimientoFecha !== recordCambios.vencimientoFecha) {
			cambios.vencimientoFecha = recordCambios.vencimientoFecha;
		}
		onChange(cambios);
	};

	const [forzarCalculos, setForzarCalculos] = useState(forzarCalculosParam);
	if (forzarCalculos && params != null && !tiposPagos.loading) {
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
	const [motivosBaja, setMotivosBaja] = useState({
		loading: "Cargando...",
		data: [],
	});
	useEffect(() => {
		pushQuery({
			action: "GetMotivosBaja",
			params: { tipo: "L" },
			onOk: async (res) => setMotivosBaja({ data: [{ id: 0, tipo: "L", descripcion: "Activo" }, ...res] }),
			onError: async (err) => setMotivosBaja({ error: err.message ?? "Ocurrió un error", data: [] }),
		});
	}, [pushQuery]);
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
				{
					dataField: "afiliadoId",
					text: "Es Afiliado",
					sort: true,
					headerStyle: (_colum, _colIndex) => ({ width: "110px" }),
					formatter: (value) => Formato.Booleano(value != null ? value != 0 : null),
					style: { ...cs, textAlign: "center" },
				},
				{
					dataField: "esRural",
					text: "Es Rural",
					sort: true,
					headerStyle: (_colum, _colIndex) => ({ width: "90px" }),
					formatter: Formato.Booleano,
					style: { ...cs, textAlign: "center" },
				},
				{
					dataField: "remuneracionImponible",
					text: "Remuneración",
					sort: true,
					headerStyle: (_colum, _colIndex) => ({ width: "140px" }),
					formatter: Formato.Moneda,
					style: { ...cs, textAlign: "right" },
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
									deletedObs: value === 0,
								}));
							}}
						/>
						<DateTimePicker
							type="date"
							label="Fecha de baja"
							disabled
							value={record.deletedDate ?? ""}
						/>
					</Grid>
				);
			let renderObservaciones = null;
			if (!disabled.deletedObs)
				renderObservaciones = (
					<Grid gap={`${gap}px`} full="width">
						<InputMaterial
							label="Observaciones de baja"
							value={valor(record.deletedObs)}
							disabled={!!disabled.deletedObs}
							onChange={(value, _id) =>
								handleChange({ deletedObs: `${value}` })
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
