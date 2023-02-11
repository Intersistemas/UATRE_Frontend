import React, { useEffect, useState } from "react";
import styles from "./GenerarBoletaForm.module.css";
import Formato from "../../helpers/Formato";
import useHttp from "../../hooks/useHttp";
import Button from "../../ui/Button/Button";
import Modal from "../../ui/Modal/Modal";
import Renglon from "../../ui/Grilla/Renglon";
import Celda from "../../ui/Grilla/Celda";
import Select from "../../ui/Select/Select";
import DateTimePicker from "../../ui/DateTimePicker/DateTimePicker";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

const GenerarBoletaForm = (props) => {
	const config = { ...props.config };
	const empresa = { ...config.empresa };
	const establecimiento = { ...config.establecimiento };
	const onCancela = config.onCancela ?? (() => {});
	const onConfirma = config.onConfirma ?? ((data) => {});
	const [tiposPagos, setTiposPagos] = useState([]);
	const { isLoading, error, sendRequest: request } = useHttp();
	const [params, setParams] = useState({
		interesesDiariosPosteriorFechaPago: 0,
	});
	const joinParams = (nParams) => setParams({ ...params, ...nParams });
	const [data, setData] = useState({
		empresasEstablecimientosId: establecimiento.id,
		periodo: 0,
		fecha: dayjs().format("YYYY-MM-DD"),
		cantidadTrabajadores: 0,
		totalRemuneraciones: 0,
		fechaPagoEstimada: null,
		interesImporte: 0,
		interesPorcentaje: 0,
		interesNeto: 0,
		codigoBarra: "",
		conveniosId: 0,
		tipoLiquidacion: null,
	});
	const joinData = (nData) => {
		let newData = { ...data, ...nData };
		// calculos
		newData.interesPorcentaje =
			tiposPagos.find((r) => r.id === newData.tipoLiquidacion)?.porcentaje ?? 0;
		newData.interesImporte =
			newData.totalRemuneraciones * newData.interesPorcentaje;
		if (newData.periodo > 0 && newData.fechaPagoEstimada != null) {
			let fpeDjs = dayjs(newData.fechaPagoEstimada);
			let dias = fpeDjs.diff(
				Formato.Mascara(newData.periodo, "####-##-15"),
				"day"
			);
			if (dias > 0) {
				newData.interesNeto =
					newData.totalRemuneraciones *
					params.interesesDiariosPosteriorFechaPago *
					dias;
				console.log("newData.interesNeto", newData.interesNeto);
				newData.interesNeto += newData.interesImporte;
			}
		}
		setData(newData);
	};

	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Parametros?Nombre=InteresesDiariosPosteriorFechaPago`,
				method: "GET",
			},
			async (response) =>
				joinParams({
					interesesDiariosPosteriorFechaPago: Formato.Decimal(response?.valor ?? 0),
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
		onConfirma(data);
	};

	const handleTipoLiquidacionChange = (tipoPagoId) => {
		joinData({ tipoLiquidacion: tipoPagoId });
	};

	let periodo = "";
	if (data.periodo > 100) periodo = Formato.Mascara(data.periodo, "####-##-01");

	return (
		<Modal onClose={onCancela}>
			<Renglon centro>
				<div className={styles.titulo}>Generando boleta</div>
			</Renglon>
			<Renglon>
				<div className={styles.subtitulo}>
					<span>Eempresa</span> {empresa.razonSocial}
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
						label="Tipo de pago"
						value={data.tipoLiquidacion}
						options={tiposPagos.map((r) => ({
							label: r.descripcion,
							value: r.id,
						}))}
						onChange={handleTipoLiquidacionChange}
					/>
				</Celda>
				<Celda width={50}>
					<DateTimePicker
						type="month"
						label="Periodo"
						value={periodo}
						onChange={(f) =>
							joinData({ periodo: Formato.Entero(f?.format("YYYYMM") ?? 0) })
						}
					/>
				</Celda>
			</Renglon>
			<Renglon>
				<Celda width={50}>
					<TextField
						size="small"
						style={{ width: "100%" }}
						type="number"
						label="Cant. trabajadores"
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
				<Celda width={50}>
					<TextField
						size="small"
						style={{ width: "100%" }}
						type="number"
						label="Total remuneraciones"
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
				<Celda width={50}>
					<DateTimePicker
						type="date"
						label="Fecha pago estimada"
						value={data.fechaPagoEstimada}
						onChange={(f) =>
							joinData({ fechaPagoEstimada: f?.format("YYYY-MM-DD") ?? null })
						}
					/>
				</Celda>
			</Renglon>
			<Renglon derecha>
				<Celda width={15}>
					<Button className="botonBlanco" onClick={() => onCancela()}>
						Cerrar
					</Button>
				</Celda>
				<Celda width={15}>
					<Button onClick={handleConfirma}>Generar</Button>
				</Celda>
			</Renglon>
		</Modal>
	);
};

export default GenerarBoletaForm;
