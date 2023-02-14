import React, { useState } from "react";
import styles from "./BoletaDetails.module.css";
import {Renglon, Celda} from "../../ui/Grilla/Grilla";
import Formato from "../../helpers/Formato";

const BoletaDetails = (props) => {
	const config = props.config;
	const data = config.data;

	return (
		<Renglon className={styles.details}>
			<Celda width={25}>
				<span>Periodo:</span> {data.periodo}
			</Celda>
			<Celda width={25}>
				<span>Fecha:</span> {Formato.Fecha(data.fecha)}
			</Celda>
			<Celda width={25}>
				<span>Cant. trabajadores:</span> {data.cantidadTrabajadores}
			</Celda>
			<Celda width={25}>
				<span>Total remuneraciones:</span> {data.totalRemuneraciones}
			</Celda>
		</Renglon>
	);
};

export default BoletaDetails;
