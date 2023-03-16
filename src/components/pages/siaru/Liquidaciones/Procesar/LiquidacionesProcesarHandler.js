import React, { useEffect, useState } from "react";
import styles from "./LiquidacionesProcesarHandler.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import useHttp from "../../../../hooks/useHttp";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../../redux/actions";
import Formato from "../../../../helpers/Formato";
import Grid from "../../../../ui/Grid/Grid";
import Select from "../../../../ui/Select/Select";
import Button from "../../../../ui/Button/Button";
import DateTimePicker from "../../../../ui/DateTimePicker/DateTimePicker";
import LiquidacionForm from "./Manual/Form";
import dayjs from "dayjs";

const LiquidacionesProcesarHandler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = location.state?.empresa ? location.state.empresa : {};
	if (empresa.id == null) navigate("/");

	const [periodos, setPeriodos] = useState([]);
	const [periodoSelect, setPeriodoSelect] = useState();
	const [periodoSelectErr, setPeriodoSelectErr] = useState("");
	const [periodoAnterior, setPeriodoAnterior] = useState();
	const [periodoAnteriorErr, setPeriodoAnteriorErr] = useState("");
	const [periodoNuevo, setPeriodoNuevo] = useState();
	const [periodoNuevoErr, setPeriodoNuevoErr] = useState("");
	const [archivoF931, setArchivoF931] = useState();
	const [archivoF931Err, setArchivoF931Err] = useState("");
	const [liquidacionForm, setLiquidacionForm] = useState();
	const { isLoading, error, sendRequest: request } = useHttp();

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ nombre: `Empresas` }, { nombre: `Liquidaciones` }],
	};
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	//#endregion

	useEffect(() => {
		if (periodos.length === 0) {
			request(
				{
					baseURL: "SIARU",
					endpoint: `/DDJJUatre?CUIT=${empresa.cuit ?? 0}&Sort=-Periodo`,
					method: "GET",
				},
				async (respuesta) => {
					setPeriodos(respuesta);
				}
			);
		}

		switch (moduloAccion) {
			case `Empresas`:
				navigate("/siaru", { state: { empresa: empresa } });
				break;
			case `Liquidaciones`:
				navigate("/siaru/liquidaciones", { state: { empresa: empresa } });
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [periodos.length, empresa, moduloAccion, request, navigate, dispatch]);

	if (isLoading) return <h1>Cargando...</h1>;
	if (error) return <h1>{error}</h1>;

	return (
		<Grid col gap="5px" full>
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid full="width">
				<h2 className="subtitulo">
					Procesar liquidaciones de
					{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial ?? ""}`}
				</h2>
			</Grid>
			<Grid col gap="5px">
				{/* Grupo "Seleccione un periodo existente a liquidar" */}
				<Grid
					className={`${styles.fondo} ${styles.grupo}`}
					col
					full="width"
					style={{ minWidth: "310px" }}
					gap="10px"
				>
					<Grid full="width">
						<Grid className={styles.cabecera} grow>
							Seleccione un periodo existente a liquidar
						</Grid>
					</Grid>
					<Grid full="width" gap="10px">
						<Grid grow>
							<Select
								name="periodo"
								label="Periodo"
								value={periodoSelect}
								options={periodos.map((r) => ({
									label: `${Formato.Periodo(r.periodo)} - ${
										r.liquidacionIdUltima
											? "Periodo con liquidaciones asociadas"
											: "Periodo sin liquidaciones asociadas"
									}`,
									value: r.periodo,
								}))}
								onChange={(v) => {
									setPeriodoSelect(v);
									setPeriodoSelectErr("");
								}}
							/>
						</Grid>
						<Grid block basis="200px">
							<Button
								onClick={() => {
									if (periodoSelect == null) {
										setPeriodoSelectErr("Debe seleccionar un periodo");
									} else {
										setPeriodoSelectErr("");
										navigate("/siaru/liquidaciones/procesar/existente", {
											state: { empresa: empresa, periodo: periodoSelect },
										});
									}
								}}
							>
								Iniciar
							</Button>
						</Grid>
					</Grid>
					<Grid full="width" style={{ color: "red" }}>
						{periodoSelectErr}
					</Grid>
				</Grid>

				{/* Grupo "Copiar liquidación de un período anterior" */}
				<Grid
					className={`${styles.fondo} ${styles.grupo}`}
					col
					full="width"
					style={{ minWidth: "310px" }}
					gap="10px"
				>
					<Grid full="width">
						<Grid className={styles.cabecera} grow>
							Copiar liquidación de un período anterior
						</Grid>
					</Grid>
					<Grid full="width" gap="10px">
						<Grid grow>
							<Select
								name="periodo"
								label="Periodo anterior"
								value={periodoAnterior}
								options={periodos.map((r) => ({
									label: `${Formato.Periodo(r.periodo)} - ${
										r.liquidacionIdUltima
											? "Periodo con liquidaciones asociadas"
											: "Periodo sin liquidaciones asociadas"
									}`,
									value: r.periodo,
								}))}
								onChange={(v) => {
									setPeriodoAnterior(v);
									setPeriodoAnteriorErr("");
								}}
							/>
						</Grid>
						<Grid block basis="250px">
							<DateTimePicker
								type="month"
								label="Ingrese período a liquidar"
								value={periodoNuevo}
								disableFuture
								minDate="1994-01-01"
								maxDate={dayjs().format("YYYY-MM-DD")}
								onChange={(fecha) => {
									setPeriodoNuevo(Formato.Entero(fecha?.format("YYYYMM")));
									setPeriodoNuevoErr("");
								}}
							/>
						</Grid>
						<Grid block basis="200px">
							<Button
								onClick={() => {
									if (periodoNuevo == null) {
										setPeriodoNuevoErr("Debe ingresar un periodo a liquidar");
									} else {
										setPeriodoNuevoErr("");
									}
								}}
							>
								Iniciar
							</Button>
						</Grid>
					</Grid>
					<Grid full="width" style={{ color: "red" }}>
						{periodoNuevoErr}
					</Grid>
				</Grid>

				{/* Grupo "Liquidar desde archivo" */}
				<Grid
					className={`${styles.fondo} ${styles.grupo}`}
					col
					full="width"
					style={{ minWidth: "310px" }}
					gap="10px"
				>
					<Grid full="width">
						<Grid className={styles.cabecera} grow>
							Liquidar desde archivo
						</Grid>
					</Grid>
					<Grid full="width" gap="10px">
						<Grid block basis="300px">
							<Button>
								Seleccionar archivo a liquidar
								<input hidden accept=".txt" type="file" />
							</Button>
						</Grid>
						<Grid grow />
						<Grid block basis="200px">
							<Button
								onClick={() => {
									if (archivoF931 == null) {
										setArchivoF931Err("Debe ingresar un archivo F931");
									} else {
										setArchivoF931Err("");
									}
								}}
							>
								Iniciar
							</Button>
						</Grid>
					</Grid>
					<Grid full="width" style={{ color: "red" }}>
						{archivoF931Err}
					</Grid>
				</Grid>

				{/* Grupo "Liquidación manual" */}
				<Grid
					className={`${styles.fondo} ${styles.grupo}`}
					col
					full="width"
					style={{ minWidth: "310px" }}
					gap="10px"
				>
					<Grid full="width">
						<Grid className={styles.cabecera} grow>
							Liquidación manual
						</Grid>
					</Grid>
					<Grid full="width" gap="10px">
						<Grid block basis="300px">
							<Button
								onClick={() =>
									setLiquidacionForm(
										<LiquidacionForm
											config={{
												empresa: empresa,
												onCancela: () => setLiquidacionForm(null),
												onConfirma: () => navigate("/siaru/liquidaciones", { state: { empresa: empresa } }),
											}}
										/>
									)
								}
							>
								Ingresar liquidacion manual
							</Button>
						</Grid>
					</Grid>
					{liquidacionForm}
				</Grid>
			</Grid>
			<Grid full></Grid>
		</Grid>
	);
};

export default LiquidacionesProcesarHandler;
