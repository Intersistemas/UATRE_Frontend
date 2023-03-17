import React from "react";
import styles from "./LiquidacionDetails.module.css";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import dayjs from "dayjs";

const LiquidacionDetails = ({ config }) => {
	const data = config.data ?? {};
	const tiposPago = config.tiposPagos ? [...config.tiposPagos] : [];
	const tiposLiquidacion = [
		{ codigo: 0, descripcion: "Periodo" },
		{ codigo: 1, descripcion: "Acta" },
	];

	const calc = {
		vencimientoFecha: null,
		importeTotal:
			Math.round(
				(data.interesImporte + data.interesNeto + Number.EPSILON) * 100
			) / 100,
	};
	if (data.periodo > 100) {
		calc.vencimientoFecha = dayjs(Formato.Mascara(data.periodo, "####-##-15"))
			.add(1, "month")
			.format("YYYY-MM-DD");
	}

	console.log("data", data, "calc", calc);

	return (
		<Grid
			className={`${styles.fondo} ${styles.grupo}`}
			col
			full="width"
			gap="5px"
		>
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos de la liquidacion
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="50px" className={styles.label}>
					Fecha:
				</Grid>
				<Grid block basis="90px" className={styles.data}>
					{Formato.Fecha(data.fecha)}
				</Grid>
				<Grid block basis="150px" className={styles.label}>
					Tipo de liquidación:
				</Grid>
				<Grid block basis="55px" className={styles.data}>
					{tiposLiquidacion.find((r) => r.codigo === data.tipoLiquidacion)
						?.descripcion ?? ""}
				</Grid>
				<Grid block basis="105px" className={styles.label}>
					Tipo de pago:
				</Grid>
				<Grid block basis="65px" className={styles.data}>
					{tiposPago.find((r) => r.codigo === data.liquidacionesTiposPagosId)
						?.descripcion ?? ""}
				</Grid>
				<Grid block basis="130px" className={styles.label}>
					Establecimiento:
				</Grid>
				<Grid basis="35px" className={styles.data} justify="end">
					{data.empresasEstablecimientosId ?? ""}
				</Grid>
				<Grid grow className={styles.data}>
					{data.empresasEstablecimientos_Nombre ?? ""}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="65px" className={styles.label}>
					Periodo:
				</Grid>
				<Grid block basis="60px" className={styles.data}>
					{Formato.Periodo(data.periodo)}
				</Grid>
				<Grid block basis="115px" className={styles.label}>
					Fecha de Vto:
				</Grid>
				<Grid block basis="090px" className={styles.data}>
					{Formato.Fecha(calc.vencimientoFecha)}
				</Grid>
				<Grid block basis="190px" className={styles.label}>
					Fecha de pago estimada:
				</Grid>
				<Grid block basis="090px" className={styles.data}>
					{Formato.Fecha(data.fechaPagoEstimada)}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="195px" className={styles.label}>
					Cantidad de trabajadores:
				</Grid>
				<Grid block basis="060px" className={styles.data}>
					{Formato.Entero(data.cantidadTrabajadores)}
				</Grid>
				<Grid block basis="200px" className={styles.label}>
					Total de remuneraciones:
				</Grid>
				<Grid block basis="110px" className={styles.data}>
					{Formato.Moneda(data.totalRemuneraciones)}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="060px" className={styles.label}>
					Aporte:
				</Grid>
				<Grid block basis="110px" className={styles.data}>
					{Formato.Moneda(data.interesNeto)}
				</Grid>
				<Grid block basis="140px" className={styles.label}>
					Importe intereses:
				</Grid>
				<Grid block basis="110px" className={styles.data}>
					{Formato.Moneda(data.interesImporte)}
				</Grid>
				<Grid block basis="140px" className={styles.label}>
					Total a pagar:
				</Grid>
				<Grid block basis="110px" className={styles.data}>
					{Formato.Moneda(data.interesImporte)}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="175px" className={styles.label}>
					Secuencia rectificaicon:
				</Grid>
				<Grid block basis="065px" className={styles.data}>
					{Formato.Entero(data.rectificativa)}
				</Grid>
				<Grid block basis="110px" className={styles.label}>
					Fecha de baja:
				</Grid>
				<Grid block basis="090px" className={styles.data}>
					{Formato.Fecha(data.bajaFecha)}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="175px" className={styles.label}>
					Motivo de baja:
				</Grid>
				<Grid grow className={styles.data}>
					{data.refMotivosBaja_Descripcion}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="175px" className={styles.label}>
					Observaciones de baja:
				</Grid>
				<Grid grow className={styles.data}>
					{data.bajaObservaciones}
				</Grid>
			</Grid>
		</Grid>
	);
};

export default LiquidacionDetails;
