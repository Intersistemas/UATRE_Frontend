import React, { useEffect, useState } from "react";
import styles from "./GenerarBoletaForm.module.css";
import Formato from "../../helpers/Formato";
import useHttp from "../../hooks/useHttp";
import Button from "../../ui/Button/Button";
import Modal from "../../ui/Modal/Modal";
import { Renglon, Celda } from "../../ui/Grilla/Grilla";
import Select from "../../ui/Select/Select";
import DateTimePicker from "../../ui/DateTimePicker/DateTimePicker";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import { Alert, AlertTitle, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const GenerarBoletaForm = (props) => {
	const config = { ...props.config };
	const empresa = { ...config.empresa };
	const establecimiento = { ...config.establecimiento };
	const onCancela = config.onCancela ?? (() => {});
	const onConfirma = config.onConfirma ?? ((data) => {});
	const [tiposPagos, setTiposPagos] = useState([]);
	const tiposLiquidaciones = [
		{ id: 1, codigo: 0, descripcion: "Periodo" },
		{ id: 2, codigo: 1, descripcion: "Acta" },
	];
	const { isLoading, error, sendRequest: request } = useHttp();
	const [params, setParams] = useState({
		interesesDiariosPosteriorFechaPago: 0,
	});
	const joinParams = (nParams) => setParams({ ...params, ...nParams });

	const calcularData = (nData) => {
		let r = { ...nData };
		const tipoPago = tiposPagos.find((tp) => tp.id === r.tiposPagosId);
		//calculo intereses
		console.log(
			"tiposPagos",
			tiposPagos,
			"tipoPago",
			tipoPago,
			"r.tiposPagosId",
			r.tiposPagosId
		);
		r.interesPorcentaje = tipoPago?.porcentaje ?? 0;
		r.interesImporte = r.totalRemuneraciones * (r.interesPorcentaje / 100);
		r.interesImporte =
			Math.round((r.interesImporte + Number.EPSILON) * 100) / 100;
		if (r.periodo > 0 && r.fechaPagoEstimada != null) {
			let fpeDjs = dayjs(r.fechaPagoEstimada);
			let dias = fpeDjs.diff(Formato.Mascara(r.periodo, "####-##-15"), "day");
			if (dias > 0) {
				r.interesNeto =
					r.totalRemuneraciones *
					(params.interesesDiariosPosteriorFechaPago / 100) *
					dias;
				console.log("r.interesNeto", r.interesNeto);
				r.interesNeto += r.interesImporte;
				r.interesNeto =
					Math.round((r.interesNeto + Number.EPSILON) * 100) / 100;
			}
		}
		return r;
	};

	const [data, setData] = useState(
		calcularData({
			empresasEstablecimientosId: establecimiento.id,
			periodo: 0,
			fecha: dayjs().format("YYYY-MM-DD"),
			cantidadTrabajadores: establecimiento.cantTrabajadores,
			totalRemuneraciones: 0,
			fechaPagoEstimada: null,
			interesImporte: 0,
			interesPorcentaje: 0,
			interesNeto: 0,
			conveniosId: 80,
			tiposPagosId: 0,
			tipoLiquidacion: null,
		})
	);

	const joinData = (nData) => setData(calcularData({ ...data, ...nData }));

	const [err, setErr] = useState({
		tipoLiquidacion: "",
		tiposPagosId: "",
		periodo: "",
		cantidadTrabajadores: "",
		totalRemuneraciones: "",
		fechaPagoEstimada: "",
	});

	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Parametros?Nombre=InteresesDiariosPosteriorFechaPago`,
				method: "GET",
			},
			async (response) =>
				joinParams({
					interesesDiariosPosteriorFechaPago: Formato.Decimal(
						response?.valor ?? 0
					),
				})
		);
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_TiposPagos`,
				method: "GET",
			},
			async (response) => setTiposPagos(response)
		);
	}, [request]);

	const handleConfirma = () => {
		//validaciones
		let tieneErr = false;
		const newErr = { ...err };

		if (data.tipoLiquidacion == null) {
			tieneErr = true;
			newErr.tipoLiquidacion = "Dato requerido";
		} else newErr.tipoLiquidacion = "";

		if (data.tiposPagosId === 0) {
			tieneErr = true;
			newErr.tiposPagosId = "Dato requerido";
		} else newErr.tiposPagosId = "";

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

		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_BoletasDeposito`,
				method: "POST",
				body: data,
				headers: { "Content-Type": "application/json" },
			},
			async (response) => onConfirma(response)
		);
	};

	if (isLoading)
		return (
			<Modal onClose={onCancela}>
				<div>Cargando</div>
			</Modal>
		);

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

	let periodo = "";
	if (data.periodo > 100) periodo = Formato.Mascara(data.periodo, "####-##-01");

	const otrosDatos = {
		importeNeto: 0,
	};
	otrosDatos.importeNeto =
		data.totalRemuneraciones + data.interesImporte + data.interesNeto;
	otrosDatos.importeNeto =
		Math.round((otrosDatos.importeNeto + Number.EPSILON) * 100) / 100;

	return (
		<Modal onClose={onCancela}>
			<Renglon centro>
				<h3>Generando boleta</h3>
			</Renglon>
			<Renglon>
				<div className={styles.subtitulo}>
					<span>Empresa</span> {empresa.razonSocial}
				</div>
			</Renglon>
			<Renglon>
				<div className={styles.subtitulo}>
					<span>Establecimiento</span> {establecimiento.nombre}
				</div>
			</Renglon>
			<Renglon>
				<Celda width={50}>
					<Select
						name="tipoLiquidacion"
						label="Tipo de liquidacion"
						required
						error={err.tipoLiquidacion}
						value={
							tiposLiquidaciones.find((r) => r.codigo === data.tipoLiquidacion)
								?.id
						}
						options={tiposLiquidaciones.map((r) => ({
							label: r.descripcion,
							value: r.id,
						}))}
						onChange={(v) =>
							joinData({
								tipoLiquidacion: tiposLiquidaciones.find((r) => r.id === v)
									?.codigo,
							})
						}
					/>
				</Celda>
				<Celda width={50}>
					<Select
						name="tiposPagosId"
						label="Tipo de pago"
						required
						error={err.tiposPagosId}
						value={data.tiposPagosId}
						options={tiposPagos.map((r) => ({
							label: r.descripcion,
							value: r.id,
						}))}
						onChange={(v) => joinData({ tiposPagosId: v })}
					/>
				</Celda>
			</Renglon>
			<Renglon>
				<Celda width={25}>
					<DateTimePicker
						type="month"
						label="Periodo"
						value={periodo}
						disableFuture
						required
						minDate="1994-01-01"
						maxDate={dayjs().format("YYYY-MM-DD")}
						error={err.periodo}
						onChange={(f) =>
							joinData({ periodo: Formato.Entero(f?.format("YYYYMM") ?? 0) })
						}
					/>
				</Celda>
				<Celda width={25}>
					<DateTimePicker
						type="date"
						label="Fecha pago estimada"
						value={data.fechaPagoEstimada}
						minDate={dayjs().format("YYYY-MM-DD")}
						required
						error={err.fechaPagoEstimada}
						onChange={(f) =>
							joinData({ fechaPagoEstimada: f?.format("YYYY-MM-DD") ?? null })
						}
					/>
				</Celda>
				<Celda width={25}>
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
				</Celda>
				<Celda width={25}>
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
				</Celda>
			</Renglon>
			<Renglon>
				<h3>Intereses</h3>
			</Renglon>
			<Renglon>
				<Celda width={25}>
					<TextField
						size="small"
						style={{ width: "100%" }}
						type="number"
						label="Porcentaje"
						InputLabelProps={{ shrink: true }}
						value={data.interesPorcentaje}
					/>
				</Celda>
				<Celda width={25}>
					<TextField
						size="small"
						style={{ width: "100%" }}
						type="number"
						label="Importe"
						InputLabelProps={{ shrink: true }}
						value={data.interesImporte}
					/>
				</Celda>
				<Celda width={25}>
					<TextField
						size="small"
						style={{ width: "100%" }}
						type="number"
						label="Neto"
						InputLabelProps={{ shrink: true }}
						value={data.interesNeto}
					/>
				</Celda>
				<Celda width={25}>
					<TextField
						size="small"
						style={{ width: "100%" }}
						type="number"
						label="Importe neto"
						InputLabelProps={{ shrink: true }}
						value={otrosDatos.importeNeto}
					/>
				</Celda>
			</Renglon>
			<div className={styles.botones}>
				<Renglon derecha>
					<Celda width={70}>{errorMsg}</Celda>
					<Celda width={15}>
						<Button className="botonBlanco" onClick={() => onCancela()}>
							Cerrar
						</Button>
					</Celda>
					<Celda width={15}>
						<Button onClick={handleConfirma}>Generar</Button>
					</Celda>
				</Renglon>
			</div>
		</Modal>
	);
};

export default GenerarBoletaForm;
