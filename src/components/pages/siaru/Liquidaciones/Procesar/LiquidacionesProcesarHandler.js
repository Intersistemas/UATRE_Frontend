import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
	handleLiquidacionProcesarSeleccionar,
	handleModuloSeleccionar,
} from "redux/actions";
import Formato from "components/helpers/Formato";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import styles from "./LiquidacionesProcesarHandler.module.css";

const LiquidacionesProcesarHandler = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const empresa = useSelector((state) => state.empresa);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);

	useEffect(() => {
		if (!empresa?.id) setRedirect({ to: "/inicio/siaru" });
	}, [empresa]);

	const { desdeArchivo, manual } = useSelector(
		(state) => state.liquidacionProcesar
	);
	// Limpio el estado al ingresar a esta página
	useEffect(() => {
		dispatch(handleLiquidacionProcesarSeleccionar());
		dispatch(handleModuloSeleccionar({ nombre: "SIARU" }));
	}, [dispatch]);

	const archivoRef = useRef(null);

	const [errores, setErrores] = useState({ archivo: [], manual: [] });

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
							{` ${Formato.Cuit(empresa?.cuit)} ${empresa?.razonSocial ?? ""}`}
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
										value={
											Formato.Mascara(desdeArchivo?.periodo, "####-##-01") ?? ""
										}
										disableFuture
										minDate="1994-01-01"
										maxDate={dayjs().format("YYYY-MM-DD")}
										onChange={(fecha) =>
											dispatch(
												handleLiquidacionProcesarSeleccionar({
													desdeArchivo: {
														...desdeArchivo,
														periodo: Formato.Entero(fecha?.format("YYYYMM")),
													},
												})
											)
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
											dispatch(
												handleLiquidacionProcesarSeleccionar({
													desdeArchivo: {
														...desdeArchivo,
														archivo: e.target.files[0],
													},
												})
											);
										}}
									/>
									<Button
										className="botonAmarillo"
										onClick={() => archivoRef.current?.click()}
									>
										Selecciona archivo a liquidar
									</Button>
								</Grid>
								<Grid grow>{desdeArchivo?.archivo?.name ?? ""}</Grid>
								<Grid block basis="200px">
									<Button
										className="botonAmarillo"
										onClick={() => {
											const newErrores = [];
											if (!desdeArchivo?.archivo)
												newErrores.push(
													<Grid>Debe ingresar un archivo LSD.</Grid>
												);
											if (!desdeArchivo?.periodo)
												newErrores.push(
													<Grid>
														Debe ingresar un período para el archivo LSD.
													</Grid>
												);
											setErrores((old) => ({ ...old, archivo: newErrores }));
											if (newErrores.length === 0)
												setRedirect({ to: "archivo" });
										}}
									>
										Inicia
									</Button>
								</Grid>
							</Grid>
							<Grid col full="width" style={{ color: "red" }}>
								{errores.archivo}
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
										value={Formato.Mascara(manual?.periodo, "####-##-01") ?? ""}
										disableFuture
										minDate="1994-01-01"
										maxDate={dayjs().format("YYYY-MM-DD")}
										onChange={(fecha) =>
											dispatch(
												handleLiquidacionProcesarSeleccionar({
													manual: {
														...manual,
														periodo: Formato.Entero(fecha?.format("YYYYMM")),
													},
												})
											)
										}
									/>
								</Grid>
								<Grid grow />
								<Grid block basis="200px">
									<Button
										className="botonAmarillo"
										onClick={() => {
											const newErrores = [];
											if (!manual?.periodo)
												newErrores.push(
													<Grid>
														Debe ingresar un período para la liquidación manual.
													</Grid>
												);
											setErrores((old) => ({ ...old, manual: newErrores }));
											if (newErrores.length === 0)
												setRedirect({ to: "manual" });
										}}
									>
										Inicia
									</Button>
								</Grid>
							</Grid>
							<Grid col full="width" style={{ color: "red" }}>
								{errores.manual}
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
