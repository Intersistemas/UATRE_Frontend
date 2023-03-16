import React from "react";
import styles from "./LiquidacionDetails.module.css";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";

const LiquidacionDetails = (props) => {
	const config = props.config;
	const data = config.data ?? {};
	const tiposLiquidacion = [
		{ codigo: 0, descripcion: "Periodo"},
		{ codigo: 1, descripcion: "Acta"},
	];

	return (
		<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos de la liquidacion
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="70px" className={styles.label}>
					Periodo:
				</Grid>
				<Grid block basis="60px" className={styles.data}>
					{Formato.Periodo(data.periodo)}
				</Grid>
				<Grid block basis="50px" className={styles.label}>
					Tipo:
				</Grid>
				<Grid block basis="55px" className={styles.data}>
					{tiposLiquidacion.find(r => r.codigo === data.tipoLiquidacion)?.descripcion ?? ""}
				</Grid>
				<Grid block basis="130px" className={styles.label}>
					Establecimiento:
				</Grid>
				<Grid basis="35px" className={styles.data} justify="end">
					{data.empresasEstablecimientosId ?? ""}
				</Grid>
				<Grid block className={styles.data}>
					{data.empresasEstablecimientos_Nombre ?? ""}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="135px" className={styles.label}>
					Remuneraciones:
				</Grid>
				<Grid block basis="135px" className={styles.data}>
					{Formato.Moneda(data.totalRemuneraciones)}
				</Grid>
			</Grid>
		</Grid>
	);
};

export default LiquidacionDetails;
