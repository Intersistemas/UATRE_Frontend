import { Document, Page, View, Text } from "@react-pdf/renderer";
import React, { useEffect, useState } from "react";
import Formato from "../../helpers/Formato";
import useHttp from "../../hooks/useHttp";
import styles from "./BoletaPDF.module.css";

const BoletaPDF = (props) => {
	const { config, ...rest } = props;
	const data = config.data;
	const [tiposPagos, setTiposPagos] = useState([]);
	const tiposLiquidaciones = [
		{ id: 1, codigo: 0, descripcion: "Periodo" },
		{ id: 2, codigo: 1, descripcion: "Acta" },
	];
	const empresa = config.empresa ?? {
		razonSocial: "",
	};
	const establecimiento = config.establecimiento ?? {
		nombre: "",
	};
	const { isLoading, error, sendRequest: request } = useHttp();

	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_TiposPagos`,
				method: "GET",
			},
			async (response) => setTiposPagos(response)
		);
	}, [request]);

	const tipoLiquidacion = tiposLiquidaciones.find(
		(r) => r.codigo === data.tipoLiquidacion
	) ?? { descripcion: "" };

	const tipoPago = tiposPagos.find((r) => r.id === data.tiposPagosId) ?? {
		descripcion: "",
	};

	const otros = {
		importeNeto: 0,
	};

	otros.importeNeto = data.interesImporte + data.interesNeto;
	otros.importeNeto =
		Math.round((otros.importeNeto + Number.EPSILON) * 100) / 100;

	return (
		<Document className={styles.document}>
			<Page className={styles.page} size="A4">
				<View className={styles.section}>
					<Text>Empresa {Formato.Cuit(empresa.cuit)} {empresa.razonSocial}</Text>
					<Text> </Text>
					<Text>Establecimiento {establecimiento.nombre}</Text>
					<Text> </Text>
				</View>
				<View className={styles.section}>
					<Text>Tipo de liquidacion: {tipoLiquidacion.descripcion}</Text>
					<Text>Tipo de pago: {tipoPago.descripcion}</Text>
					<Text>Fecha de emision: {Formato.Fecha(data.fecha)}</Text>
					<Text>Periodo: {Formato.Periodo(data.periodo)}</Text>
					<Text>
						Fecha estimada de pago: {Formato.Fecha(data.fechaPagoEstimada)}
					</Text>
					<Text>
						Cantidad de trabajadores:{" "}
						{Formato.Entero(data.cantidadTrabajadores)}
					</Text>
					<Text>
						Total remuneraciones: {Formato.Decimal(data.totalRemuneraciones)}
					</Text>
					<Text> </Text>
				</View>
				<View className={styles.section}>
					<Text>Subtotales</Text>
					<Text> </Text>
					<Text>Procentaje: {Formato.Decimal(data.interesPorcentaje)}</Text>
					<Text>Aporte: {Formato.Decimal(data.interesNeto)}</Text>
					<Text> </Text>
				</View>
				<View className={styles.section}>
					<Text>Intereses</Text>
					<Text> </Text>
					<Text>Importe intereses: {Formato.Decimal(data.interesImporte)}</Text>
				</View>
				<View className={styles.section}>
					<Text> </Text>
					<Text>Total a pagar: {Formato.Decimal(otros.importeNeto)}</Text>
				</View>
			</Page>
		</Document>
	);
};

export default BoletaPDF;
