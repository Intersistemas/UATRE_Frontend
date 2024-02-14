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
import useQueryQueue from "components/hooks/useQueryQueue";

const LiquidacionesProcesarHandler = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const empresa = useSelector((state) => state.empresa);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);

	useEffect(() => {
		if (!empresa?.id) setRedirect({ to: "Empresas" });
	}, [empresa]);

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetLiquidacionPeriodos": {
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/Liquidaciones/Periodos`,
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion
	
	//#region declaración y carga de dependencias
	const [dependencias, setDependencias] = useState({
		loading: "Cargando...",
		empresaId: empresa.id,
		data: {
			periodos: null,
		},
		errors: null,
	});
	useEffect(() => {
		if (!dependencias.loading) return;
		const changes = {
			loading: null,
			data: { ...dependencias.data },
			errors: null,
		};
		const setData = (value, error) => {
			Object.keys(value).forEach((k) => {
				changes.data[k] = value[k];
				if (!error) return;
				changes.errors ??= {};
				changes.errors[k] = error;
			});
		};
		const applyChanges = () => {
			if (Object.keys(changes.data).filter((k) => !changes.data[k]).length)
				return;
			setDependencias((o) => ({ ...o, ...changes }));
		};
		if (!changes.data.periodos) {
			const empresaId = dependencias.empresaId;
			pushQuery({
				action: "GetLiquidacionPeriodos",
				params: { empresaId, bajas: false },
				onOk: async (periodos) => setData({ periodos }),
				onError: async (error) => setData({ periodos: [] }, error),
				onFinally: async () => applyChanges(),
			});
		}
	}, [dependencias, pushQuery]);
	//#endregion

	const { desdeArchivo, manual, existente } = useSelector(
		(state) => state.liquidacionProcesar
	);
	// Limpio el estado al ingresar a esta página
	useEffect(() => {
		dispatch(handleLiquidacionProcesarSeleccionar());
		dispatch(handleModuloSeleccionar({ nombre: "SIARU" }));
	}, [dispatch]);

	const archivoRef = useRef(null);

	const [errores, setErrores] = useState({
		archivo: [],
		manual: [],
		existente: [],
	});

	const [avisos, setAvisos] = useState({
		archivo: [],
		manual: [],
		existente: [],
	});

	let dependenciasRender
	if (dependencias.loading) {
		dependenciasRender = <Grid width="full">Cargando...</Grid>;
	} else if (dependencias.errors) {
		dependenciasRender = (
			<Grid width="full" style={{ color: "red" }}>
				Ocurrieron errores cargando dependencias
			</Grid>
		);
	}

	useEffect(() => {
		if (dependencias.loading) return;
		const changes = {
			archivo: [],
			manual: [],
			existente: [],
		};
		const getDescripcion = (periodo) => (
			<Grid>
				Se realizará baja de la liquidación existente con período {Formato.Periodo(periodo)}
			</Grid>
		);
		if (
			desdeArchivo?.periodo &&
			dependencias.data.periodos.includes(desdeArchivo.periodo)
		) {
			changes.archivo.push(getDescripcion(desdeArchivo.periodo));
		}
		if (
			manual?.periodo &&
			dependencias.data.periodos.includes(manual.periodo)
		) {
			changes.manual.push(getDescripcion(manual.periodo));
		}
		if (
			existente?.periodoHacia &&
			dependencias.data.periodos.includes(existente.periodoHacia)
		) {
			changes.existente.push(getDescripcion(existente.periodoHacia));
		}
		setAvisos((o) => ({ ...o, ...changes }));
	}, [
		dependencias.loading,
		dependencias.data.periodos,
		desdeArchivo?.periodo,
		manual?.periodo,
		existente?.periodoHacia,
	]);

	return (
		<Grid col height="100vh" gap="10px">
			<Grid className="titulo" width="full">
				<h1>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid className="contenido" width="full" grow>
				<Grid col gap="5px" full>
					<Grid full="width">
						<h2 className="subtitulo" style={{ margin: 0 }}>
							Procesar liquidaciones de
							{` ${Formato.Cuit(empresa?.cuit)} ${empresa?.razonSocial ?? ""}`}
						</h2>
					</Grid>
					<Grid col gap="5px">
						{dependenciasRender}
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
												setRedirect({ to: "Archivo" });
										}}
										tarea="Siaru_EmpresaLiquidacionArchivo"
									>
										Inicia
									</Button>
								</Grid>
							</Grid>
							<Grid col full="width" style={{ color: "red" }}>
								{errores.archivo}
							</Grid>
							<Grid col full="width" style={{ color: "orange" }}>
								{avisos.archivo}
							</Grid>
						</Grid>

						{/* Grupo "Liquidación por copia de período" */}
						<Grid
							className={`${styles.fondo} ${styles.grupo}`}
							col
							full="width"
							style={{ minWidth: "310px" }}
							gap="10px"
						>
							<Grid full="width">
								<Grid className={styles.cabecera} grow>
									Liquidación por copia de período
								</Grid>
							</Grid>
							<Grid full="width" gap="10px">
								<Grid block basis="250px">
									<DateTimePicker
										type="month"
										label="Ingrese período a liquidar"
										value={
											Formato.Mascara(existente?.periodoHacia, "####-##-01") ??
											""
										}
										disableFuture
										minDate="1994-01-01"
										maxDate={dayjs().format("YYYY-MM-DD")}
										onChange={(fecha) =>
											dispatch(
												handleLiquidacionProcesarSeleccionar({
													existente: {
														...existente,
														periodoHacia: Formato.Entero(
															fecha?.format("YYYYMM")
														),
													},
												})
											)
										}
									/>
								</Grid>
								<Grid block basis="300px">
									<DateTimePicker
										type="month"
										label="Ingrese período desde el cual liquidar"
										value={
											Formato.Mascara(existente?.periodoDesde, "####-##-01") ??
											""
										}
										disableFuture
										minDate="1994-01-01"
										maxDate={dayjs().format("YYYY-MM-DD")}
										onChange={(fecha) =>
											dispatch(
												handleLiquidacionProcesarSeleccionar({
													existente: {
														...existente,
														periodoDesde: Formato.Entero(
															fecha?.format("YYYYMM")
														),
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
											if (!existente?.periodoHacia)
												newErrores.push(
													<Grid>Debe ingresar un período a liquidar.</Grid>
												);
											if (!existente?.periodoDesde)
												newErrores.push(
													<Grid>
														Debe ingresar un período desde el cual liquidar.
													</Grid>
												);
											setErrores((old) => ({ ...old, existente: newErrores }));
											if (newErrores.length === 0)
												setRedirect({ to: "Existente" });
										}}
										tarea="Siaru_EmpresaLiquidacionCopia"
									>
										Inicia
									</Button>
								</Grid>
							</Grid>
							<Grid col full="width" style={{ color: "red" }}>
								{errores.existente}
							</Grid>
							<Grid col full="width" style={{ color: "orange" }}>
								{avisos.existente}
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
												setRedirect({ to: "Manual" });
										}}
										tarea="Siaru_EmpresaLiquidacionManual"
									>
										Inicia
									</Button>
								</Grid>
							</Grid>
							<Grid col full="width" style={{ color: "red" }}>
								{errores.manual}
							</Grid>
							<Grid col full="width" style={{ color: "orange" }}>
								{avisos.manual}
							</Grid>
						</Grid>
					</Grid>
					<Grid full></Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default LiquidacionesProcesarHandler;
