import React from "react";
import styles from "./LiquidacionDetails.module.css";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import dayjs from "dayjs";
import InputMaterial from "../../../ui/Input/InputMaterial";

const LiquidacionDetails = ({ data = {}, tiposPagos = [] }) => {
	data ??= {};
	tiposPagos ??= [];

	const tiposLiquidacion = [
		{ codigo: 0, descripcion: "Periodo" },
		{ codigo: 1, descripcion: "Acta" },
	];

	const im = {
		variant: "standard",
		padding: "0rem 0.5rem",
	};

	const valor = (valor) => (valor ? valor : " ");

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

	let importeTotal;
	if (data.interesImporte != null || data.interesNeto != null) {
		importeTotal = 0;
		if (data.interesImporte != null) importeTotal += data.interesImporte;
		if (data.interesNeto != null) importeTotal += data.interesNeto;
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
					Datos de la liquidacion {data.id}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<InputMaterial
					label="Fecha"
					value={valor(Formato.Fecha(data.fecha))}
					{...im}
				/>
				<InputMaterial
					label="Tipo de liquidación"
					value={valor(
						tiposLiquidacion.find((r) => r.codigo === data.tipoLiquidacion)
							?.descripcion ?? ""
					)}
					{...im}
				/>
				<InputMaterial
					label="Tipo de pago"
					value={valor(
						tiposPagos.find((r) => r.codigo === data.liquidacionTipoPagoId)
							?.descripcion ?? ""
					)}
					{...im}
				/>
				<InputMaterial
					label="Establecimiento"
					value={valor(
						`${data.empresaEstablecimientoId ?? ""} ${
							data.empresaEstablecimiento_Nombre ?? ""
						}`
					)}
					{...im}
				/>
				<InputMaterial
					label="Periodo"
					value={valor(Formato.Periodo(data.periodo) ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Fecha de Vencimiento"
					value={valor(Formato.Fecha(calc.vencimientoFecha) ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Fecha de pago estimada"
					value={valor(Formato.Fecha(data.fechaPagoEstimada) ?? "")}
					{...im}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<InputMaterial
					label="Cantidad de trabajadores"
					value={valor(Formato.Entero(data.cantidadTrabajadores) ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Total de remuneraciones"
					value={valor(Formato.Moneda(data.totalRemuneraciones) ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Aporte"
					value={valor(Formato.Moneda(data.interesNeto) ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Importe intereses"
					value={valor(Formato.Moneda(data.interesImporte) ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Total a pagar"
					value={valor(Formato.Moneda(importeTotal) ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Secuencia rectificacion"
					value={valor(Formato.Entero(data.rectificativa) ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Fecha de baja"
					value={valor(Formato.Fecha(data.bajaFecha) ?? "")}
					{...im}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<InputMaterial
					label="Motivo de baja"
					value={valor(data.refMotivoBaja_Descripcion ?? "")}
					{...im}
				/>
				<InputMaterial
					label="Observaciones de baja"
					value={valor(data.bajaObservaciones ?? "")}
					{...im}
				/>
			</Grid>
		</Grid>
	);
};

export default LiquidacionDetails;
