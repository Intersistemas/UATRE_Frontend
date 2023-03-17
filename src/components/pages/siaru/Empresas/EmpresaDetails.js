import React from "react";
import Formato from "../../../helpers/Formato";
import Grid from "../../../ui/Grid/Grid";
import styles from "./EmpresaDetails.module.css";

const EmpresaDetails = ({config}) => {
	const data = config.data ?? {};

	return (
		<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos de la empresa
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="051px" className={styles.label}>
					CUIT:
				</Grid>
				<Grid block basis="125px" className={styles.data}>
					{Formato.Cuit(data.cuit)}
				</Grid>
				<Grid block basis="110px" className={styles.label}>
					Razon Social:
				</Grid>
				<Grid block basis="calc(100% - 286px)" className={styles.data}>
					{data.razonSocial}
				</Grid>
			</Grid>
			<Grid full="width">
				<Grid className={styles.grupo} col full>
					<Grid full="width">
						<Grid className={styles.titulo} grow>
							Domicilio administrativo
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<Grid block basis="055px" className={styles.label}>
							Calle:
						</Grid>
						<Grid block basis="calc(100% - 055px)" className={styles.data}>
							{data.domicilioCalle ?? ""}
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<Grid block basis="055px" className={styles.label}>
							Nro:
						</Grid>
						<Grid block basis="calc(100% - 055px)" className={styles.data}>
							{data.domicilioNumero ?? ""}
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

export default EmpresaDetails;
