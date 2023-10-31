import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import { Collapse, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
	handleSetNavFunction,
} from "redux/actions";
import useQueryQueue from "components/hooks/useQueryQueue";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import Button from "components/ui/Button/Button";
import Modal from "components/ui/Modal/Modal";
import Tentativas from "../tentativas/Handler";
import NominaTable from "./NominaTable";
import NominaForm from "./NominaForm";

const Handler = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const empresa = useSelector((state) => state.empresa);
	const { periodo } = useSelector((state) => state.liquidacionProcesar.manual);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) {
		dispatch(handleSetNavFunction()); // Limpio navFunction
		navigate(redirect.to, redirect.options);
	}

	useEffect(() => {
		if (!empresa?.cuit) setRedirect({ to: "Siaru" });
		else if (!periodo)
			setRedirect({ to: "Procesar" });
	}, [empresa, periodo]);

	const [modal, setModal] = useState();

	//#region Establezco la navFunction para esta página
	useEffect(() => {
		dispatch(
			handleSetNavFunction(({ go }) => {
				setModal(
					<Modal onClose={() => setModal(null)}>
						<Grid col width="full" gap="15px">
							<Grid width="full" justify="evenly">
								<h3>Se perderán los datos cargados</h3>
							</Grid>
							<Grid width="full" justify="evenly">
								<Grid width="370px">
									<Button className="botonAzul" onClick={() => go()}>
										Continúa
									</Button>
								</Grid>
								<Grid width="370px">
									<Button
										className="botonAmarillo"
										onClick={() => setModal(null)}
									>
										Cancela
									</Button>
								</Grid>
							</Grid>
						</Grid>
					</Modal>
				);
			})
		);
	}, [dispatch]);
	//#endregion

	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetTentativas":
				return {
					config: {
						baseURL: "SIARU",
						method: "POST",
						endpoint: "/Liquidaciones/TentativasManual",
					},
				};
			default:
				return null;
		}
	});

	const [alerts, setAlerts] = useState([]);
	let alertsRender = null;
	if (alerts.length > 0) {
		alertsRender = (
			<Grid gap="15px" full="width">
				<Grid col grow>
					{alerts?.map((r, ix) => (
						<Collapse key={ix} in={true} style={{ width: "100%" }}>
							<Alert
								severity={r.severity}
								action={
									<IconButton
										aria-label="close"
										color="inherit"
										size="small"
										onClick={() => {
											const newAlerts = [...alerts];
											newAlerts.splice(ix, 1);
											setAlerts(newAlerts);
										}}
									>
										<CloseIcon fontSize="inherit" />
									</IconButton>
								}
								sx={{ mb: 2 }}
								style={{ marginBottom: "0" }}
							>
								<AlertTitle>{r.title}</AlertTitle>
								{r.message}
							</Alert>
						</Collapse>
					))}
				</Grid>
			</Grid>
		);
	}

	const [nomina, setNomina] = useState({
		list: [],
		selected: {},
		form: null,
	});
	const [tentativas, setTentativas] = useState({
		loading: null,
		body: { cuit: empresa?.cuit, periodo: periodo, nominas: nomina.list },
		data: null,
		error: null,
	});
	useEffect(() => {
		if (!tentativas.loading) return;
		pushQuery({
			action: "GetTentativas",
			config: { body: tentativas.body },
			onOk: async (res) =>
				setTentativas((old) => ({
					...old,
					loading: null,
					data: res,
					error: null,
				})),
			onError: async (err) => {
				setAlerts((old) => [
					...old,
					{
						severity: "error",
						title: `${err.type} cargando tentativas de liquidación`,
						message: err.message,
					},
				]);
				setTentativas((old) => ({
					...old,
					loading: null,
					data: null,
					error: err,
				}));
			},
		});
	}, [tentativas, pushQuery]);

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [],
	};

	const descTrabajador = `${Formato.Cuit(nomina.selected.row?.cuil)}`;
	if (tentativas.data == null) {
		moduloInfo.acciones.push({ name: `Agrega trabajador` });
		if (descTrabajador) {
			moduloInfo.acciones.push({
				name: `Modifica trabajador ${descTrabajador}`,
			});
			moduloInfo.acciones.push({ name: `Borra trabajador ${descTrabajador}` });
		}
	}

	if (redirect.to) moduloInfo.acciones = [];
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		const abreFormularioTrabajador = (request = "") =>
			setNomina((old) => ({
				...old,
				form: (
					<NominaForm
						data={request === "A" ? null : old.selected.row}
						request={request}
						onClose={({ request, data }) =>
							setNomina((old) => {
								const newData = {
									...old,
									list: [...old.list],
									form: null,
								};
								switch (request) {
									case "A":
										newData.selected = {
											index: newData.list.length,
											row: data,
										};
										newData.list.push(data);
										break;
									case "M":
										newData.selected = {
											...newData.selected,
											row: data,
										};
										newData.list.splice(newData.selected.index, 1, data);
										break;
									case "B":
										let i = newData.selected.index;
										newData.list.splice(i, 1);
										if (i === 0) i = newData.list.length > 0 ? 1 : 0;
										i -= 1;
										if (i < 0) newData.selected = {};
										else
											newData.selected = {
												index: i,
												row: { ...newData.list[newData.selected.index] },
											};
										break;
									default:
										break;
								}
								if (
									["A", "M"].includes(request) &&
									old.list.filter(
										(r, i) =>
											newData.selected.index !== i && r.cuil === data.cuil
									).length
								) {
									setModal(
										<Modal onClose={() => setModal(null)}>
											<Grid col width="full" gap="15px">
												<Grid width="full" justify="evenly">
													<h3>{`Ya existe trabajador con cuil ${Formato.Cuit(
														data.cuil
													)}`}</h3>
												</Grid>
												<Grid width="full" justify="evenly">
													<Grid width="370px">
														<Button
															className="botonAzul"
															onClick={() => {
																setModal(null);
																setNomina(newData);
															}}
														>
															Agrega trabajador de todas formas
														</Button>
													</Grid>
													<Grid width="370px">
														<Button
															className="botonAmarillo"
															onClick={() => setModal(null)}
														>
															Cancela
														</Button>
													</Grid>
												</Grid>
											</Grid>
										</Modal>
									);
									return old;
								}
								return newData;
							})
						}
					/>
				),
			}));
		switch (moduloAccion?.name) {
			case `Agrega trabajador`:
				abreFormularioTrabajador("A");
				break;
			case `Modifica trabajador ${descTrabajador}`:
				abreFormularioTrabajador("M");
				break;
			case `Borra trabajador ${descTrabajador}`:
				abreFormularioTrabajador("B");
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, descTrabajador, dispatch]);
	//#endregion

	let contenido = null;
	if (tentativas.loading) {
		contenido = <h1>Cargando tentativas...</h1>;
	} else if (tentativas?.data != null) {
		contenido = <Tentativas periodo={periodo} tentativas={tentativas.data} />;
	} else {
		contenido = (
			<Grid
				col
				full
				style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
			>
				<h2 className="subtitulo">
					Generación manual de liquidaciones de
					{` ${Formato.Cuit(empresa?.cuit)} ${empresa?.razonSocial ?? ""} `}
					para el período
					{` ${Formato.Periodo(periodo)}`}
				</h2>
				<Grid width="full">
					<NominaTable
						records={nomina.list}
						mostrarBuscar={false}
						selected={[nomina.selected.row]}
						onSelect={(selected) =>
							setNomina((old) => ({ ...old, selected: selected }))
						}
					/>
					{nomina.form}
				</Grid>
				{alertsRender}
				<Grid justify="center">
					<Grid width="350px" height="50px">
						<Button
							className="botonAmarillo"
							disabled={!descTrabajador}
							onClick={() => {
								setModal(
									<Modal onClose={() => setModal(null)}>
										<Grid col width="full" gap="20px">
											<Grid width="full" justify="center">
												<h3>
													Al continuar no se podrá modificar la lista de
													trabajadores.
												</h3>
											</Grid>
											<Grid width="full" gap="200px" justify="center">
												<Grid width="150px">
													<Button
														className="botonAzul"
														onClick={() => {
															setModal(null);
															setTentativas((old) => ({
																...old,
																loading: "Cargando...",
																body: { ...old.body, nominas: nomina.list },
															}));
														}}
													>
														Continúa
													</Button>
												</Grid>
												<Grid width="150px">
													<Button
														className="botonAmarillo"
														onClick={() => setModal(null)}
													>
														Cancela
													</Button>
												</Grid>
											</Grid>
										</Grid>
									</Modal>
								);
							}}
						>
							Inicia proceso de liquidación
						</Button>
					</Grid>
				</Grid>
			</Grid>
		);
	}

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				{contenido}
				{modal}
			</div>
		</>
	);
};

export default Handler;
