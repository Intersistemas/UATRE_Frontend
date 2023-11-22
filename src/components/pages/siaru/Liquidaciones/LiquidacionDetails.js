import React, { useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import Formato from "components/helpers/Formato";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import styles from "./LiquidacionDetails.module.css";

const LiquidacionDetails = ({ data = {}, cabecera = {} }) => {
	data ??= {};
	cabecera ??= {};

	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetTiposPagos": {
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/v1/LiquidacionesTiposPagos`,
					},
				};
			}
			default:
				return null;
		}
	});

	const MyInputMaterial = (p) => (
		<InputMaterial variant="standard" padding="0rem 0.5rem" {...p} />
	);

	//#region declaración y carga de tipos de pagos
	const [tiposPagos, setTiposPagos] = useState({
		loading: "Cargando...",
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!tiposPagos.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetTiposPagos",
			onOk: async (data) => changes.data.push(...data),
			onError: async (error) => (changes.error = error),
			onFinally: async () => setTiposPagos((o) => ({ ...o, ...changes })),
		});
	}, [tiposPagos, pushQuery]);
	//#endregion

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
					{[
						"Datos de",
						[
							((v) => (v ? `la liquidación ${v}` : ""))(cabecera.id),
							((v) => (v ? `el detalle ${v}` : ""))(data.id),
						]
							.filter((r) => r)
							.join(", "),
					]
						.filter((r) => r)
						.join(" ")}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<MyInputMaterial label="Fecha" value={Formato.Fecha(cabecera.createdDate)} />
				<MyInputMaterial
					label="Tipo de liquidación"
					value={["Periodo", "Acta"].at(cabecera.tipoLiquidacion) ?? ""}
				/>
				<MyInputMaterial
					label="Tipo de pago"
					value={
						tiposPagos.data.find((r) => r.codigo === data.liquidacionTipoPagoId)
							?.descripcion ?? ""
					}
					error={!!tiposPagos.error}
					helperText={tiposPagos.loading ?? tiposPagos.error?.message}
				/>
				<MyInputMaterial
					label="Establecimiento"
					value={[
						data.empresaEstablecimientoId,
						data.empresaEstablecimiento_Nombre,
					]
						.filter((r) => r)
						.join(" ")}
				/>
				<MyInputMaterial
					label="Periodo"
					value={Formato.Periodo(cabecera.periodo)}
				/>
				<MyInputMaterial
					label="Fecha de Vencimiento"
					value={Formato.Fecha(cabecera.fechaVencimiento)}
				/>
				<MyInputMaterial
					label="Fecha de pago estimada"
					value={Formato.Fecha(cabecera.fechaPagoEstimada)}
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
					value={Formato.Moneda(data.interesNeto)}
				/>
				<MyInputMaterial
					label="Importe intereses"
					value={Formato.Moneda(data.interesImporte)}
				/>
				<MyInputMaterial
					label="Total a pagar"
					value={Formato.Moneda(importeTotal)}
				/>
				<MyInputMaterial
					label="Secuencia rectificación"
					value={Formato.Entero(cabecera.rectificativa)}
				/>
				<MyInputMaterial
					label="Fecha de baja"
					value={Formato.Fecha(cabecera.deletedDate)}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<MyInputMaterial
					label="Motivo de baja"
					value={cabecera.refMotivoBaja_Descripcion}
				/>
				<MyInputMaterial
					label="Observaciones de baja"
					value={cabecera.deletedObs}
				/>
			</Grid>
		</Grid>
	);
};

export default LiquidacionDetails;
