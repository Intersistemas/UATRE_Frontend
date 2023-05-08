import React from "react";
import styles from "./LiquidacionDetails.module.css";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import dayjs from "dayjs";
import { TextField } from "@mui/material";

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
	const inputLabelStyles = { color: "#186090" };

	let importeTotal;
	if (data.interesImporte != null || data.interesNeto != null)
	{
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
					Datos de la liquidacion
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Fecha"
					value={Formato.Fecha(data.fecha) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Tipo de liquidación"
					value={
						tiposLiquidacion.find((r) => r.codigo === data.tipoLiquidacion)
							?.descripcion ?? ""
					}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Tipo de pago"
					value={
						tiposPago.find((r) => r.codigo === data.liquidacionTipoPagoId)
							?.descripcion ?? ""
					}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Establecimiento"
					value={`${data.empresaEstablecimientoId ?? ""} ${
						data.empresaEstablecimiento_Nombre ?? ""
					}`}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Periodo"
					value={Formato.Periodo(data.periodo) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Fecha de Vencimiento"
					value={Formato.Fecha(calc.vencimientoFecha) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Fecha de pago estimada"
					value={Formato.Fecha(data.fechaPagoEstimada) ?? ""}
					style={{ width: "100%" }}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Cantidad de trabajadores"
					value={Formato.Entero(data.cantidadTrabajadores) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Total de remuneraciones"
					value={Formato.Moneda(data.totalRemuneraciones) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Aporte"
					value={Formato.Moneda(data.interesNeto) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Importe intereses"
					value={Formato.Moneda(data.interesImporte) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Total a pagar"
					value={Formato.Moneda(importeTotal) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Secuencia rectificacion"
					value={Formato.Entero(data.rectificativa) ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Fecha de baja"
					value={Formato.Fecha(data.bajaFecha) ?? ""}
					style={{ width: "100%" }}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Motivo de baja"
					value={data.refMotivoBaja_Descripcion ?? ""}
					style={{ width: "100%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Observaciones de baja"
					value={data.bajaObservaciones ?? ""}
					style={{ width: "100%" }}
				/>
			</Grid>
		</Grid>
	);
};

export default LiquidacionDetails;
