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

const GenerarBoletaForm = (props) => {
	const config = { ...props.config };
	const empresa = { ...config.empresa };
	const establecimiento = { ...config.establecimiento };
	const onCancela = config.onCancela ?? (() => {});
	const onConfirma = config.onConfirma ?? ((data) => {});
	const [tiposPagos, setTiposPagos] = useState([]);
	const { isLoading, error, sendRequest: request } = useHttp();
	const [data, setData] = useState({
		empresasEstablecimientosId: establecimiento.id,
		periodo: 0,
		fecha: "",
		cantidadTrabajadores: 0,
		totalRemuneraciones: 0,
		fechaPagoEstimada: "",
		interesImporte: 0,
		interesPorcentaje: 0,
		interesNeto: 0,
		codigoBarra: "",
		conveniosId: 0,
		tipoLiquidacion: null,
	});

	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_TiposPagos`,
				method: "GET",
			},
			async (response) => {
				console.log("response", response);
				setTiposPagos(response);
			}
		);
	}, [request]);

	const handleConfirma = () => {
		//validaciones
		onConfirma(data);
	};

	const handleTipoLiquidacionChange = (tipoPagoId) => {
		setData({ ...data, tipoLiquidacion: tipoPagoId });
	};

	const handlePeriodoChange = (fecha) => {
		let newData = { ...data };
		console.log("fecha", fecha);
		if (fecha == null || isNaN(fecha.$y)) newData.periodo = 0;
		else
			newData.periodo = parseInt(
				Formato.Mascara(fecha.$y, "####") + Formato.Mascara(fecha.$M + 1, "##"),
				10
			);
		console.log("newData.periodo", newData.periodo);
		setData(newData);
	};

	let periodo = "";
	if (data.periodo > 100) periodo = Formato.Mascara(data.periodo, "####-##-01");

	return (
		<Modal onClose={onCancela}>
			<Renglon centro>
				<div className={styles.titulo}>
					Generando boleta
					<br />
					Eempresa {empresa.razonSocial}
					<br />
					Establecimiento {establecimiento.nombre}
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
						onChange={handlePeriodoChange}
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
							setData({
								...data,
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
							setData({
								...data,
								totalRemuneraciones: Formato.Decimal(e.target.value),
							})
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
