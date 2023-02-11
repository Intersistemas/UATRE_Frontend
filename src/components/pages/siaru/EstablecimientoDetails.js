import React from "react";
import styles from "./EstablecimientoDetails.module.css";

const EstablecimientoDetails = (props) => {
	const config = props.config;
	const data = {...config.data};

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
	if (data.domicilioPiso !=="") {
		if (domicilio) domicilio = `${domicilio} `;
		domicilio = `${domicilio} Piso ${data.domicilioPiso}`;
	}
	if (data.domicilioDpto !== "") {
		if (domicilio) domicilio = `${domicilio} `;
		domicilio = `${domicilio} Dpto ${data.domicilioDpto}`;
	}

	return (
		<div className={styles.details}>
			<div><span>Nro. sucursal:</span> {data.nroSucursal}</div>
			<div><span>Nombre:</span> {data.nombre}</div>
			<div><span>Cant. trabajadores:</span> {data.cantTrabajadores}</div>
			<div><span>Teléfono:</span> {data.telefono}</div>
			<div><span>E-mail:</span> {data.email}</div>
			<div><span>Domicilio:</span> {domicilio}</div>
		</div>
	);
};

export default EstablecimientoDetails;
