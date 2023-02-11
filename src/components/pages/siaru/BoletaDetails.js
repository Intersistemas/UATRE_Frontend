import React from "react";
import styles from "./BoletaDetails.module.css";

const BoletaDetails = (props) => {
	const config = props.config;
	const data = { ...config.data };

	return (
		<div className={styles.details}>
			<div>
				<span>Periodo:</span> {data.periodo}
			</div>
			<div>
				<span>Fecha:</span> {data.fecha}
			</div>
			<div>
				<span>Cant. trabajadores:</span> {data.cantTrabajadores}
			</div>
			<div>
				<span>Total remuneraciones:</span> {data.totalRemuneraciones}
			</div>
			<div>
				<span>Codigo de barras:</span> {data.codigoBarra}
			</div>
		</div>
	);
};

export default BoletaDetails;
