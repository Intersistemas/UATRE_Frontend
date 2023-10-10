import React, { useEffect, useRef, useState } from "react";
import styles from "./LiquidacionesProcesarHandler.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../../redux/actions";
import Formato from "../../../../helpers/Formato";
import Grid from "../../../../ui/Grid/Grid";
import Button from "../../../../ui/Button/Button";
import DateTimePicker from "../../../../ui/DateTimePicker/DateTimePicker";
import dayjs from "dayjs";

const LiquidacionesProcesarHandler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = location.state?.empresa ? location.state.empresa : {};
	if (empresa.id == null) navigate("/ingreso");

	const archivoRef = useRef(null);

	const [liqArchivo, setLiqArchivo] = useState({
		periodo: null,
		archivo: null,
		errores: [],
	})
	const [liqManual, setLiqManual] = useState({
		periodo: null,
		errores: [],
	});

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ name: `Empresas` }, { name: `Liquidaciones` }],
	};
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
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
	}, [empresa, moduloAccion, navigate, dispatch]);
	//#endregion

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				<Grid col gap="5px" full>
					<Grid full="width">
						<h2 className="subtitulo">
							Procesar liquidaciones de
							{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial ?? ""}`}
						</h2>
					</Grid>
					<Grid col gap="5px">
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
								<Grid block basis="250px">
									<DateTimePicker
										type="month"
										label="Ingrese período a liquidar"
										value={Formato.Mascara(liqArchivo.periodo, "####-##-01") ?? ""}
										disableFuture
										minDate="1994-01-01"
										maxDate={dayjs().format("YYYY-MM-DD")}
										onChange={(fecha) =>
											setLiqArchivo((old) => ({...old, periodo: Formato.Entero(fecha?.format("YYYYMM"))}))
										}
									/>
								</Grid>
								<Grid block basis="300px">
									<input
										ref={archivoRef}
										type="file"
										accept=".txt,.zip"
										hidden
										onChange={(e) => {
											if (e.target.files.length < 1) return;
											setLiqArchivo((old) => ({...old, archivo: e.target.files[0]}));
										}}
									/>
									<Button onClick={() => archivoRef.current?.click()}>
										Selecciona archivo a liquidar
										{/* <input hidden accept=".txt" type="file" /> */}
									</Button>
								</Grid>
								<Grid grow>{liqArchivo.archivo != null ? liqArchivo.archivo.name : ""}</Grid>
								<Grid block basis="200px">
									<Button
										onClick={() => {
											const errores = [];
											if (liqArchivo.archivo == null)
												errores.push(<Grid>Debe ingresar un archivo LSD.</Grid>);
											if (!liqArchivo.periodo)
												errores.push(<Grid>Debe ingresar un período para el archivo LSD.</Grid>);
											setLiqArchivo((old) => ({...old, errores: errores}));
											if (errores.length === 0) {
												navigate("/siaru/liquidaciones/procesar/archivo", {
													state: {
														empresa: empresa,
														periodo: liqArchivo.periodo,
														archivo: liqArchivo.archivo,
													},
												});
											}
										}}
									>
										Inicia
									</Button>
								</Grid>
							</Grid>
							<Grid col full="width" style={{ color: "red" }}>
								{liqArchivo.errores}
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
								<Grid block basis="250px">
									<DateTimePicker
										type="month"
										label="Ingrese período a liquidar"
										value={
											Formato.Mascara(liqManual.periodo, "####-##-01") ?? ""
										}
										disableFuture
										minDate="1994-01-01"
										maxDate={dayjs().format("YYYY-MM-DD")}
										onChange={(fecha) =>
											setLiqManual((old) => ({
												...old,
												periodo: Formato.Entero(fecha?.format("YYYYMM")),
											}))
										}
									/>
								</Grid>
								<Grid grow />
								<Grid block basis="200px">
									<Button
										onClick={() => {
											const errores = [];
											if (!liqManual.periodo)
												errores.push(<Grid>Debe ingresar un período para la liquidación manual.</Grid>);
											setLiqManual((old) => ({...old, errores: errores}));
											if (errores.length === 0) {
												navigate("/siaru/liquidaciones/procesar/manual", {
													state: {
														empresa: empresa,
														periodo: liqManual.periodo,
													},
												});
											}
										}}
									>
										Inicia
									</Button>
								</Grid>
							</Grid>
							<Grid col full="width" style={{ color: "red" }}>
								{liqManual.errores}
							</Grid>
						</Grid>

					</Grid>
					<Grid full></Grid>
				</Grid>
			</div>
		</>
	);
};

export default LiquidacionesProcesarHandler;
