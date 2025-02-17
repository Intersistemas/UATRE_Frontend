import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloSeleccionar,
	handleSetNavFunction,
} from "redux/actions";
import { Modal } from "react-bootstrap";
import Action from "components/helpers/Action";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import KeyPress from "components/keyPress/KeyPress";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import Tentativas from "../tentativas/Handler";
import useLiquidacionesNomina from "../../useLiquidacionesNomina";

const Handler = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const empresa = useSelector((state) => state.empresa);
	const { periodoDesde, periodoHacia } = useSelector(
		(state) => state.liquidacionProcesar.existente
	);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) {
		dispatch(handleSetNavFunction()); // Limpio navFunction
		navigate(redirect.to, redirect.options);
	}

	useEffect(() => {

		if (!empresa?.id) setRedirect({ to: "/Inicio/Empresas" });
		else if (!periodoDesde || !periodoHacia)
			setRedirect({ to: "/Inicio/Empresas/Liquidaciones/Procesar" });
	}, [empresa, periodoDesde, periodoHacia]);

	const [modal, setModal] = useState();

	//#region Establezco la navFunction para esta página
	useEffect(() => {
		dispatch(
			handleSetNavFunction(({ go }) => {
				setModal(
					<Modal size="lg" centered show>
						<Modal.Header
							className={modalCss.modalCabecera}
							closeButton
						/>
						<Modal.Body>
							<Grid width="full" justify="center">
								<h4>Se perderán los datos cargados</h4>
							</Grid>
						</Modal.Body>
						<Modal.Footer>
							<Grid gap="20px">
								<Grid width="150px">
									<Button
										className="botonAzul"
										onClick={() => go()}
									>
										CONTINÚA
									</Button>
								</Grid>
								<Grid width="150px">
									<Button
										className="botonAmarillo"
										onClick={() => setModal(null)}
									>
										CANCELA
									</Button>
								</Grid>
							</Grid>
						</Modal.Footer>
					</Modal>
				);
			})
		);
	}, [dispatch]);
	//#endregion

	const pushQuery = useQueryQueue((action, _params) => {
		switch (action) {
			case "GetLiquidaciones":
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: "/LiquidacionesCabecera",
					},
				};
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

	//#region declaración y carga de nomina
	const [nomina, setNomina] = useState({
		loading: "Cargando...",
		params: {
			cuit: empresa?.cuit,
			periodo: periodoDesde,
			sort: "-id",
			page: "1,1",
		},
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!nomina.loading) return;
		const changes = { loading: null, data: [], error: null }
		pushQuery({
			action: "GetLiquidaciones",
			params: nomina.params,
			onOk: async ({ data }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				data.forEach(({ liquidaciones }) => {
					AsArray(liquidaciones).forEach(({ nominas }) =>
						changes.data.push(...AsArray(nominas))
					);
				});
				changes.data = changes.data.filter(
					(v, i, a) => a.indexOf(a.find(({ id }) => id === v.id)) === i
				);
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setNomina((o) => ({ ...o, ...changes })),
		});
	}, [nomina, pushQuery]);
	//#endregion

	//#region mantenimiento de nomina
	const {
		render: liqNomRender,
		request: liqNomRequest,
		selected: liqNomSelected,
	} = useLiquidacionesNomina({
		remote: false,
		mostrarBuscar: true,
		columns: (def = []) => def.filter((r) => r.dataField !== "afiliadoId"),
		onDataChange: (data) =>
			setNomina((o) => ({
				...o,
				data: data
					.filter((r) => !r.deletedDate)
					.filter(
						({ cuil }, i, a) =>
							a.map(({ cuil }) => cuil).lastIndexOf(cuil) === i
					)
				})),
	});
	const [liqNomActions, setLiqNomActions] = useState([]);
	useEffect(() => {
		const createAction = ({ action: name, request, ...x }) =>
			new Action({
				name,
				onExecute: (action) => liqNomRequest("selected", (() => {
					const r = { request, action };
					if ("record" in x) r.record = x.record;
					return r;
				})()),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				action: `Agrega trabajador`,
				request: "A",
				record: { esRural: true },
				keys: "a",
				underlineindex: 1,
			}),
		];
		const desc = ((v) => (v ? `trabajador ${v}` : ""))(
			Formato.Cuit(liqNomSelected?.cuil)
		);
		if (!desc) {
			setLiqNomActions(actions);
			return;
		}
		actions.push(
			createAction({
				action: `Modifica ${desc}`,
				request: "M",
				keys: "m",
				underlineindex: 0,
			})
		);
		actions.push(
			createAction({
				action: `Borra ${desc}`,
				request: "B",
				keys: "b",
				underlineindex: 0,
			})
		);
		setLiqNomActions(actions);
	}, [liqNomRequest, liqNomSelected]);
	useEffect(() => {
		liqNomRequest("list", {
			data: nomina.data,
			loading: nomina.loading,
			error: nomina.error,
		});
	}, [nomina, liqNomRequest])
	//#endregion

	//#region declaración y carga de tentativas
	const [tentativas, setTentativas] = useState({
		loading: null,
		body: { cuit: empresa?.cuit, periodo: periodoHacia, nominas: nomina.data },
		data: null,
		error: null,
	});
	useEffect(() => {
		if (!tentativas.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetTentativas",
			config: { body: tentativas.body },
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data.push(...data);
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setTentativas((o) => ({ ...o, ...changes })),
		});
	}, [tentativas, pushQuery]);
	//#endregion

	//#region modulo y acciones
	const acciones = tentativas?.data == null ? liqNomActions : [];
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "SIARU", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	let contenido = null;
	if (tentativas?.data != null) {
		contenido = (
			<Tentativas periodo={periodoHacia} tentativas={tentativas.data} />
		);
	} else {
		contenido = (
			<Grid
				col
				full
				style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
			>
				<h2 className="subtitulo" style={{ margin: 0 }}>
					Generación liquidaciones de
					{` ${Formato.Cuit(empresa?.cuit)} ${empresa?.razonSocial ?? ""} `}
					para el período
					{` ${Formato.Periodo(periodoHacia)} `}a partir del período
					{` ${Formato.Periodo(periodoDesde)}`}
				</h2>
				<Grid col width="full" grow>
					<Grid width="full" style={{ marginTop: "50px" }}>{liqNomRender()}</Grid>
					<Grid justify="center">
						<Grid width="350px" height="50px">
							<Button
								className="botonAmarillo"
								disabled={!liqNomSelected}
								onClick={() => {
									setModal(
										<Modal size="lg" centered show >
											<Modal.Header
												className={modalCss.modalCabecera}
												closeButton
											>
												Inicia proceso de liquidación
											</Modal.Header>
											<Modal.Body>
												<Grid width="full" justify="center">
													<h4>
														Al continuar no se podrá modificar la lista de
														trabajadores.
													</h4>
												</Grid>
											</Modal.Body>
											<Modal.Footer>
												<Grid gap="20px">
													<Grid width="150px">
														<Button
															className="botonAzul"
															onClick={() => {
																setModal(null);
																setTentativas((o) => ({
																	...o,
																	loading: "Cargando...",
																	body: {
																		...o.body,
																		nominas: nomina.data.map((r) => ({
																			cuil: r.cuil,
																			nombre: r.nombre,
																			remuneracion: r.remuneracionImponible,
																		})),
																	},
																}));
															}}
														>
															CONTINÚA
														</Button>
													</Grid>
													<Grid width="150px">
														<Button
															className="botonAmarillo"
															onClick={() => setModal(null)}
														>
															CANCELA
														</Button>
													</Grid>
												</Grid>
											</Modal.Footer>
										</Modal>
									);
								}}
							>
								Inicia proceso de liquidación
							</Button>
						</Grid>
					</Grid>
				</Grid>
				<KeyPress items={acciones} />
			</Grid>
		);
	}

	return (
		<Grid col height="100vh" gap="10px">
			<Grid className="titulo" width="full">
				<h1>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid className="contenido" width="full" grow>
				{contenido}
				{modal}
			</Grid>
		</Grid>
	);
};

export default Handler;
