import React from "react";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import InputMaterial from "components/ui/Input/InputMaterial";
import styles from "./LiquidacionesCabeceraDetails.module.css";

const LiquidacionesCabeceraDetails = ({ data = {} }) => {
	data ??= {};

	const MyInputMaterial = (p) => (
		<InputMaterial variant="standard" padding="0rem 0.5rem" {...p} />
	);

	let importeTotal;
	if (data.totalIntereses != null || data.totalAporte != null) {
		importeTotal = 0;
		if (data.totalIntereses != null) importeTotal += data.totalIntereses;
		if (data.totalAporte != null) importeTotal += data.totalAporte;
		importeTotal = Math.round((importeTotal + Number.EPSILON) * 100) / 100;
	}

	return (
		<Grid
			className={`${styles.fondo} ${styles.grupo}`}
			col
			full="width"
			gap="5px"
		>
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos de la liquidación {data.id}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<MyInputMaterial
					label="Fecha"
					value={Formato.Fecha(data.createdDate)}
				/>
				<MyInputMaterial
					label="Tipo de liquidación"
					value={["Periodo", "Acta"].at(data.tipoLiquidacion)}
				/>
				<MyInputMaterial
					label="Periodo"
					value={Formato.Periodo(data.periodo)}
				/>
				<MyInputMaterial
					label="Fecha de Vencimiento"
					value={Formato.Fecha(data.fechaVencimiento)}
				/>
				<MyInputMaterial
					label="Fecha de pago estimada"
					value={Formato.Fecha(data.fechaPagoEstimada)}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<MyInputMaterial
					label="Cantidad de trabajadores"
					value={Formato.Entero(data.cantidadTrabajadores)}
				/>
				<MyInputMaterial
					label="Total de remuneraciones"
					value={Formato.Moneda(data.totalRemuneraciones)}
				/>
				<MyInputMaterial
					label="Aporte"
					value={Formato.Moneda(data.totalAporte)}
				/>
				<MyInputMaterial
					label="Importe intereses"
					value={Formato.Moneda(data.totalIntereses)}
				/>
				<MyInputMaterial
					label="Total a pagar"
					value={Formato.Moneda(importeTotal)}
				/>
				<MyInputMaterial
					label="Secuencia rectificación"
					value={Formato.Entero(data.rectificativa)}
				/>
				<MyInputMaterial
					label="Fecha de baja"
					value={Formato.Fecha(data.deletedDate)}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<MyInputMaterial
					label="Motivo de baja"
					value={data.refMotivoBaja_Descripcion}
				/>
				<MyInputMaterial
					label="Observaciones de baja"
					value={data.deletedObs}
				/>
			</Grid>
		</Grid>
	);
};

export default LiquidacionesCabeceraDetails;
