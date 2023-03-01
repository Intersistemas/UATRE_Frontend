import React from "react";
import styles from "./EstablecimientoDetails.module.css";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";

const EstablecimientoDetails = (props) => {
	const config = props.config;
	const data = config.data ?? {};

	return (
		<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos del Establecimiento
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="110px" className={styles.label}>
					Nro. Sucursal:
				</Grid>
				<Grid block basis="50px" className={styles.data}>
					{Formato.Entero(data.nroSucursal)}
				</Grid>
				<Grid block basis="72px" className={styles.label}>
					Nombre:
				</Grid>
				<Grid block basis="calc(100% - 232px)" className={styles.data}>
					{data.nombre}
				</Grid>
			</Grid>
			<Grid full="width">
				<Grid className={styles.grupo} col full>
					<Grid full="width">
						<Grid className={styles.titulo} grow>
							Domicilio
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<Grid block basis="055px" className={styles.label}>
							Calle:
						</Grid>
						<Grid block basis="calc(100% - 286px)" className={styles.data}>
							{data.domicilioCalle ?? ""}
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<Grid block basis="055px" className={styles.label}>
							Nro:
						</Grid>
						<Grid block basis="calc(100% - 055px)" className={styles.data}>
							{data.domicilioNumero ? data.domicilioNumero : ""}
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<Grid block basis="055px" className={styles.label}>
							Piso:
						</Grid>
						<Grid block basis="125px" className={styles.data}>
							{data.domicilioPiso ?? ""}
						</Grid>
						<Grid block basis="055px" className={styles.label}>
							Dpto:
						</Grid>
						<Grid block basis="calc(100% - 235px)" className={styles.data}>
							{data.domicilioDpto ?? ""}
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<Grid block basis="095px" className={styles.label}>
							Provincia:
						</Grid>
						<Grid block basis="calc(100% - 095px)" className={styles.data}>
							{data.domicilioProvincia ?? ""}
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<Grid block basis="095px" className={styles.label}>
							Localidad:
						</Grid>
						<Grid block basis="calc(100% - 095px)" className={styles.data}>
							{data.domicilioProvincia ?? ""}
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default EstablecimientoDetails;
