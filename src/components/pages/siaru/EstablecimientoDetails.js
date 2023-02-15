import React from "react";
import styles from "./EstablecimientoDetails.module.css";
import Grilla, { Renglon, Celda } from "../../ui/Grilla/Grilla";

const EstablecimientoDetails = (props) => {
	const config = props.config;
	const data = { ...config.data };

	if (data.domicilioCalle == null) data.domicilioCalle = "";
	if (data.domicilioNumero == null) data.domicilioNumero = 0;
	if (data.domicilioPiso == null) data.domicilioPiso = "";
	if (data.domicilioDpto == null) data.domicilioDpto = "";
	if (data.domicilioSector == null) data.domicilioSector = "";
	if (data.domicilioTorre == null) data.domicilioTorre = "";
	if (data.domicilioManzana == null) data.domicilioManzana = "";

	let domicilio = "";

	if (data.domicilioCalle !== 0) {
		if (domicilio) domicilio = `${domicilio} `;
		domicilio = `${domicilio} Calle ${data.domicilioCalle}`;
	}
	if (data.domicilioNumero !== 0) {
		if (domicilio) domicilio = `${domicilio} `;
		domicilio = `${domicilio} Nro ${data.domicilioNumero}`;
	}
	if (data.domicilioPiso !== "") {
		if (domicilio) domicilio = `${domicilio} `;
		domicilio = `${domicilio} Piso ${data.domicilioPiso}`;
	}
	if (data.domicilioDpto !== "") {
		if (domicilio) domicilio = `${domicilio} `;
		domicilio = `${domicilio} Dpto ${data.domicilioDpto}`;
	}

	return (
		<Grilla>
			<Renglon className={styles.details}>
				<Celda expandir>
					<span>Nombre:</span> {data.nombre}
				</Celda>
				<Celda width={25}>
					<span>Nro. sucursal:</span> {data.nroSucursal}
				</Celda>
				<Celda width={25}>
					<span>Cant. trabajadores:</span> {data.cantTrabajadores}
				</Celda>
			</Renglon>
			<Renglon className={styles.details}>
				<Celda expandir>
					<span>Domicilio:</span> {domicilio}
				</Celda>
				<Celda width={25}>
					<span>Teléfono:</span> {data.telefono}
				</Celda>
				<Celda width={25}>
					<span>E-mail:</span> {data.email}
				</Celda>
			</Renglon>
		</Grilla>
	);
};

export default EstablecimientoDetails;
