import React, { useEffect, useState } from "react";
import styles from "./LiquidacionForm.module.css";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import { TextField } from "@mui/material";
import useQueryQueue from "components/hooks/useQueryQueue";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import dayjs from "dayjs";
import Button from "components/ui/Button/Button";
import Modal from "components/ui/Modal/Modal";

const onChangeDef = (_changes = {}) => {};
const onConfirmDef = () => {};

const LiquidacionForm = ({
	records = [],
	disabled = false,
	onChange = onChangeDef,
	onConfirm = onConfirmDef,
}) => {
	if (disabled) onChange = onChangeDef;
	const [liqErrors, setliqErrors] = useState([]);

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetParameter":
				return (() => {
					const { paramName, ...other } = params;
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/Parametros/${paramName}`,
							method: "GET",
						},
						params: other,
					};
				})();
			default:
				return null;
		}
	});
	//#endregion

	//#region Cargo parametros
	const [params, setParams] = useState(null);
	useEffect(() => {
		const pending = {
			LiquidacionTipoPagoIdSindical: -1,
			LiquidacionTipoPagoIdSolidario: -1,
		};
		const result = {};
		const assignParam = (param, value) => {
			switch (param) {
				case "LiquidacionTipoPagoIdSindical":
				case "LiquidacionTipoPagoIdSolidario":
					return Formato.Decimal(value ?? 0);
				default:
					return value;
			}
		};
		const queryParam = (param) =>
			pushQuery({
				action: "GetParameter",
				params: { paramName: param },
				onOk: async (res) => {
					result[param] = assignParam(param, res.valor);
				},
				onError: async (err) => {
					result[param] = pending[param];
				},
				onFinally: async () => {
					delete pending[param];
					if (Object.keys(pending).length === 0) setParams(result);
				},
			});
		Object.keys(pending).forEach((param) => queryParam(param));
	}, [pushQuery]);
	//#endregion

	//#region Cargo datos de despliegue
	const datos = {
		sindicalTotal: 0,
		solidarioTotal: 0,
		fechaPagoEstimada: null,
	};
	const diferencias = {
		fechaPagoEstimada: ""
	};
	records.forEach((liq, ix) => {
		if (liq.liquidacionTipoPagoId === params.LiquidacionTipoPagoIdSindical) {
			datos.sindicalTotal += liq.totalRemuneraciones ?? 0;
		} else if (liq.liquidacionTipoPagoId === params.LiquidacionTipoPagoIdSolidario) {
			datos.solidarioTotal += liq.totalRemuneraciones ?? 0;
		}
		Object.keys(datos).forEach((k) => {
			if (datos[k] === undefined) return;
			switch (k) {
				case "fechaPagoEstimada":
					break;
				default:
					return;
			}
			if (ix === 0) {
				datos[k] = liq[k];
				return;
			}
			if (datos[k] === liq[k]) return;
			else datos[k] = undefined;
		});
	});
	if (datos.fechaPagoEstimada === undefined) {
		diferencias.fechaPagoEstimada = "Las fechas difieren"
	}
	datos.fechaPagoEstimada ??= "";
	//#endregion

	const generarLiquidacion = () => {
		// Validaciones primero
		const errores = [];

		if (!records?.length) {
			errores.push("Debe seleccionar las liquidaciones a generar.");
		} else {
			if (records.find((r) => !r.vencimientoFecha))
				errores.push("Una de las liquidaciones a generar no tiene fecha de vencimiento.");
			if (records.find((r) => !r.fechaPagoEstimada))
				errores.push("Una de las liquidaciones a generar no tiene fecha de pago estimada.");
			if (records.find((r) => !r.cantidadTrabajadores))
				errores.push("Una de las liquidaciones a generar no tiene cantidad de trabajadores.");
			if (records.find((r) => !r.totalRemuneraciones))
				errores.push("Una de las liquidaciones a generar no tiene total de remuneraciones.");
		}

		setliqErrors(
			<Modal onClose={() => setliqErrors(null)}>
				<Grid col gap="10px" width="full">
					<Grid col width="full">
						{errores.map((v, i) => (<Grid id={i} justify="center"><h4>{v}</h4></Grid>))}
					</Grid>
					<Grid width="full" gap="200px" justify="center">
						<Grid width="350px">
							<Button className="botonAmarillo" onClick={() => setliqErrors(null)}>
								Volver para modificar datos
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Modal>
		);
		if (errores.length) return;

		onConfirm();
	};

	const inputLabelStyles = { color: "#186090" };

	return (
		<Grid
			className={`${styles.fondo} ${styles.grupo}`}
			col
			width="full"
			style={{ minWidth: "310px" }}
			gap="10px"
		>
			<Grid width="full">
				<Grid className={styles.cabecera} grow>
					{`Liquidaciones seleccionadas: ${records.length}`}
				</Grid>
			</Grid>
			<Grid width="full" gap="5px">
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Total sindical"
					value={Formato.Moneda(datos.sindicalTotal)}
					style={{ width: "50%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Total solidario"
					value={Formato.Moneda(datos.solidarioTotal)}
					style={{ width: "50%" }}
				/>
			</Grid>
			<Grid width="full">
				<Grid width="200px">
					<DateTimePicker
						type="date"
						label="Asigna fecha de pago estimada"
						minDate={dayjs().format("YYYY-MM-DD")}
						value={datos.fechaPagoEstimada}
						InputRenderProps={{ helperText: diferencias.fechaPagoEstimada }}
						onChange={(f) =>
							onChange({
								fechaPagoEstimada: f?.format("YYYY-MM-DD") ?? null,
							})
						}
					/>
				</Grid>
				<Grid grow/>
				<Grid>
					<Button className="botonAmarillo" onClick={generarLiquidacion} disabled={!records?.length}>
						Genera liquidación
					</Button>
				</Grid>
			</Grid>
			<Grid width="full" style={{ color: "red" }}>
				{liqErrors}
			</Grid>
		</Grid>
	);
};

export default LiquidacionForm;
