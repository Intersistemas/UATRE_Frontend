import React, { useEffect, useState } from "react";
import Tipos from "./Tipos";
import styles from "./Controles.module.css";
import useHttp from "../../../../hooks/useHttp";
import Formato from "../../../../helpers/Formato";
import Grid from "../../../../ui/Grid/Grid";
import DateTimePicker from "../../../../ui/DateTimePicker/DateTimePicker";
import Select from "../../../../ui/Select/Select";
import Table from "../../../../ui/Table/Table";
import dayjs from "dayjs";
import { TextField, Collapse, IconButton, Tabs, Tab } from "@mui/material";
import { Alert, AlertTitle } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";

const Controles = ({
	record = {}, // Registro liquidacion.
	tipo = Tipos.Liquidacion,
	empresaId = 0,
	error = {}, // Descripciones de errores. Cada uno debe tener el mismo nombre del campo al que refiere.
	disabled = {}, // Controles deshabilitados. Cada uno debe tener el mismo nombre del campo al que refiere.
	onChange = (_cambios) => {}, // Evento cuando cambia de valor un campo { campoNombre: valor }.
	forzarCalculos: forzarCalculosParam = false,
}) => {
	const [alerts, setAlerts] = useState([]);
	const { sendRequest: request } = useHttp();
	const [currentTab, setCurrentTab] = useState(0);

	// Cargo establecimientos
	const [establecimientos, setEstablecimientos] = useState([]);
	useEffect(() => {
		request(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetByEmpresa?EmpresaId=${empresaId}&PageSize=5000`,
				method: "GET",
			},
			async (res) => {
				setEstablecimientos(res.data);
			},
			async (err) =>
				setAlerts((old) => [
					...old,
					{
						severity: "error",
						title: `${err.type} cargando establecimientos`,
						message: err.message,
					},
				])
		);
	}, [request, empresaId]);

	const tiposLiquidaciones = [
		{ id: 0, nombre: "Periodo" },
		{ id: 1, nombre: "Acta" },
	];

	// Cargo tipos de pago
	const [tiposPagos, setTiposPagos] = useState({ loading: true, data: [] });
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/LiquidacionesTiposPagos`,
				method: "GET",
			},
			async (res) => {
				setTiposPagos({ data: res });
			},
			async (err) => {
				setTiposPagos({ error: err, data: [] });
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
	}, [request]);

	// Cargo parametros
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

	const calcularOtros = (data) => {
		const r = {
			periodo: "",
			vencimientoFecha: null,
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
		onChange(cambios);
	};

	const [forzarCalculos, setForzarCalculos] = useState(forzarCalculosParam);
	if (forzarCalculos && pendingParams.length === 0 && !tiposPagos.loading) {
		setForzarCalculos(false);
		handleChange(record);
	}

	const gap = 10;

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

	let tabsRender;
	if (tipo === Tipos.Tentativa) {
		tabsRender = (
			<Tabs
				value={currentTab}
				onChange={(_event, newValue) => setCurrentTab(newValue)}
				aria-label="basic tabs example"
			>
				<Tab label="Datos generales" />
				<Tab label="Nomina" />
			</Tabs>
		);
	}

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
					headerStyle: (colum, colIndex) => ({ width: "150px" }),
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
			content = (
				<>
					<Grid full="width">
						<Select
							label="Establecimiento"
							name="empresaEstablecimientoId"
							required
							value={establecimientos.find(
								(r) => r.id === record.empresaEstablecimientoId
							)}
							error={error.empresaEstablecimientoId ?? ""}
							disabled={disabled.empresaEstablecimientoId ?? false}
							options={establecimientos.map((r) => ({
								label: r.nombre,
								value: r,
							}))}
							onChange={(v) => handleChange({ empresaEstablecimientoId: v.id })}
						/>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<Select
							label="Tipo de liquidacion"
							name="tipoLiquidacion"
							required
							value={tiposLiquidaciones.find(
								(r) => r.id === record.tipoLiquidacion
							)}
							error={error.tipoLiquidacion ?? ""}
							disabled={disabled.tipoLiquidacion ?? false}
							options={tiposLiquidaciones.map((r) => ({
								label: r.nombre,
								value: r,
							}))}
							onChange={(v) => handleChange({ tipoLiquidacion: v.id })}
							style={{ width: "100%" }}
						/>
						<Select
							name="liquidacionTipoPagoId"
							label="Tipo de pago"
							required
							value={tiposPagos.data.find(
								(r) => r.id === record.liquidacionTipoPagoId
							)}
							error={error.liquidacionTipoPagoId ?? ""}
							disabled={disabled.liquidacionTipoPagoId ?? false}
							options={tiposPagos.data.map((r) => ({
								label: r.descripcion,
								value: r,
							}))}
							onChange={(v) =>
								handleChange({
									liquidacionTipoPagoId: v.id,
								})
							}
							style={{ width: "100%" }}
						/>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<DateTimePicker
							type="month"
							label="Periodo"
							disableFuture
							minDate="1994-01-01"
							maxDate={dayjs().format("YYYY-MM-DD")}
							value={calculados.periodo ?? ""}
							error={error.periodo ?? ""}
							disabled={disabled.periodo ?? false}
							required
							onChange={(f) =>
								handleChange({
									periodo: Formato.Entero(f?.format("YYYYMM") ?? 0),
								})
							}
							InputLabelProps={{ shrink: true }}
							style={{ width: "100%" }}
						/>
						<DateTimePicker
							type="date"
							label="Fecha de vencimiento"
							InputLabelProps={{ shrink: true }}
							disabled
							value={calculados.vencimientoFecha ?? ""}
							style={{ width: "100%" }}
						/>
						<DateTimePicker
							type="date"
							label="Fecha pago estimada"
							minDate={dayjs().format("YYYY-MM-DD")}
							value={calculados.fechaPagoEstimada ?? ""}
							error={error.fechaPagoEstimada ?? ""}
							disabled={disabled.fechaPagoEstimada ?? false}
							required
							onChange={(f) =>
								handleChange({
									fechaPagoEstimada: f?.format("YYYY-MM-DD") ?? null,
								})
							}
							InputLabelProps={{ shrink: true }}
							style={{ width: "100%" }}
						/>
						<TextField
							size="small"
							type="number"
							label="Cant. trabajadores"
							required
							value={record.cantidadTrabajadores}
							error={error.cantidadTrabajadores ?? ""}
							disabled={disabled.cantidadTrabajadores ?? false}
							onChange={(e) =>
								handleChange({
									cantidadTrabajadores: Formato.Entero(e.target.value),
								})
							}
							InputLabelProps={{ shrink: true }}
							style={{ width: "100%" }}
						/>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<TextField
							size="small"
							type="number"
							label="Total remuneraciones"
							required
							value={record.totalRemuneraciones}
							error={error.totalRemuneraciones ?? ""}
							disabled={disabled.totalRemuneraciones ?? false}
							onChange={(e) =>
								handleChange({
									totalRemuneraciones: Formato.Decimal(e.target.value),
								})
							}
							InputLabelProps={{ shrink: true }}
							style={{ width: `calc(25% - ${gap}px)` }}
						/>
					</Grid>
					<Grid full="width">
						<div className={styles.subtitulo}>
							<span>Subtotales</span>
						</div>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<TextField
							size="small"
							type="number"
							label="Aporte"
							value={calculados.interesNeto}
							disabled
							InputLabelProps={{ shrink: true }}
							style={{ width: "50%" }}
						/>
					</Grid>
					<Grid full="width">
						<div className={styles.subtitulo}>
							<span>Intereses</span>
						</div>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<TextField
							size="small"
							type="number"
							label="Importe interes"
							value={calculados.interesImporte}
							disabled
							InputLabelProps={{ shrink: true }}
							style={{ width: "50%" }}
						/>
					</Grid>
					<Grid full="width">
						<div className={styles.subtitulo}>
							<span>Total a pagar</span>
						</div>
					</Grid>
					<Grid gap={`${gap}px`} full="width">
						<TextField
							size="small"
							type="number"
							label="Importe"
							disabled
							value={calculados.importeTotal}
							InputLabelProps={{ shrink: true }}
							style={{ width: "50%" }}
						/>
					</Grid>
				</>
			);
			break;
	}

	return (
		<Grid col gap={`${gap}px`} full="width">
			{tabsRender}
			{content}
			{alertsRender}
		</Grid>
	);
};

export default Controles;
