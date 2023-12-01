import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Modal } from "react-bootstrap";
import useQueryQueue from "components/hooks/useQueryQueue";
import Action from "components/helpers/Action";
import Formato from "components/helpers/Formato";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import useLiquidacionesCabecera from "./useLiquidacionesCabecera";
import useLiquidaciones from "./useLiquidaciones";
import CabeceraPrint from "./impresion/CabeceraPrint";
import LiquidacionDetails from "./LiquidacionDetails";

const LiquidacionesHandler = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const empresa = useSelector((state) => state.empresa);
	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);
	useEffect(() => {
		if (!empresa?.id) setRedirect({ to: "Siaru" });
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
			case "GetLiquidaciones": {
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/Liquidaciones`,
					},
				};
			}
			case "CreateLiquidacion": {
				return {
					config: {
						baseURL: "SIARU",
						method: "POST",
						endpoint: `/Liquidaciones`,
					},
				};
			}
			case "UpdateLiquidacion": {
				return {
					config: {
						baseURL: "SIARU",
						method: "PATCH",
						endpoint: `/Liquidaciones`,
					},
				};
			}
			case "GetEstablecimientosByEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region declaración y carga de periodos
	const [periodos, setPeriodos] = useState({
		loading: "Cargando...",
		params: { empresaId: empresa.id ?? 0 },
		data: [{ label: "Todos", value: 0 }],
		error: null,
	});
	useEffect(() => {
		if (!periodos.loading) return;
		const changes = {
			loading: null,
			data: [{ label: "Todos", value: 0 }],
			error: null,
		};
		pushQuery({
			action: "GetLiquidacionPeriodos",
			params: periodos.params,
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un array", data);
				changes.data.push(
					...data.map((value) => ({
						label: Formato.Periodo(value),
						value,
					}))
				);
			},
			onError: async (error) => {
				if (error?.code === 404) return;
				changes.error = error;
			},
			onFinally: async () => setPeriodos((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, periodos]);
	//#endregion

	//#region declaracion y carga de tipos de pago
	const [liquidacionesTiposPagos, setLiquidacionesTiposPagos] = useState({
		loading: "Cargando...",
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!liquidacionesTiposPagos.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetLiquidacionTipoPagoList",
			onOk: async (data) => changes.data.push(...data),
			onError: async (error) => (changes.error = error),
			onFinally: async () =>
				setLiquidacionesTiposPagos((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, liquidacionesTiposPagos]);
	//#endregion

	//#region declaracion y carga de cabeceras de liquidaciones
	const {
		render: liqCabRender,
		request: liqCabChanger,
		selected: liqCabSelected,
	} = useLiquidacionesCabecera({ pagination: { size: 10 } });
	const [liqCabActions, setLiqCabActions] = useState([]);
	const [liqCabParams, setLiqCabParams] = useState({ cuit: empresa.cuit, sort: "-id" });

	//#region ImprimePDF
	const [despliegaPDF, setDespliegaPDF] = useState();
	let liquidacionPDFRender;
	if (despliegaPDF) {
		liquidacionPDFRender = (
			<Modal size="xl" centered show onHide={() => setDespliegaPDF(null)}>
				<Modal.Header closeButton>Impresión de liquidación</Modal.Header>
				<Modal.Body style={{ height: "80vh" }}>
					<Grid full>
						<CabeceraPrint data={despliegaPDF} />
					</Grid>
				</Modal.Body>
			</Modal>
		);
	}
	//#endregion

	useEffect(() => {
		const createAction = ({ action: name, request, ...x }) =>
			new Action({
				name,
				onExecute: (action) => liqCabChanger("selected", { request, action }),
				combination: "AltKey",
				...x,
			});
		const actions = [];
		const desc = ((v) => (v ? `liquidacion número ${v}` : ""))(
			liqCabSelected?.id
		);
		if (!desc) {
			setLiqCabActions(actions);
			return;
		}
		actions.push(
			createAction({
				action: `Consulta ${desc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		if (!liqCabSelected.deletedDate) {
			actions.push(
				createAction({
					action: `Imprime ${desc}`,
					keys: "i",
					underlineindex: 0,
					onExecute: (_) => setDespliegaPDF(liqCabSelected),
				})
			);
			actions.push(
				createAction({
					action: `Paga ${desc}`,
					keys: "a",
					underlineindex: 0,
					onExecute: (_) => alert("Proximamente"),
				})
			);
		}
		setLiqCabActions(actions);
	}, [liqCabChanger, liqCabSelected]);
	useEffect(() => {
		liqCabChanger("list", { params: liqCabParams });
	}, [liqCabChanger, liqCabParams]);
	//#endregion

	//#region declaracion y carga de liquidaciones
	const {
		render: liqRender,
		request: liqChanger,
		selected: liqSelected,
	} = useLiquidaciones({
		remote: false,
		pagination: { size: 10 },
	});
	const [liqActions, setLiqActions] = useState([]);
	useEffect(() => {
		const createAction = ({ action: name, request, ...x }) =>
			new Action({
				name,
				onExecute: (action) => liqChanger("selected", { request, action }),
				combination: "AltKey",
				...x,
			});
		const actions = [];
		const desc = ((v) => (v ? `liquidacion detalle ${v}` : ""))(
			liqSelected?.id
		);
		if (!desc) {
			setLiqActions(actions);
			return;
		}
		// actions.push(
		// 	createAction({
		// 		action: `Consulta ${desc}`,
		// 		request: "C",
		// 		keys: "n",
		// 		underlineindex: 2,
		// 	})
		// );
		// if (!liqSelected.deletedDate) {
		// 	actions.push(
		// 		createAction({
		// 			action: `Imprime ${desc}`,
		// 			keys: "m",
		// 			underlineindex: 1,
		// 			onExecute: (_) => setDespliegaPDF(liqSelected),
		// 		})
		// 	);
		// }
		setLiqActions(actions);
	}, [liqChanger, liqSelected]);

	// Si cambia cabecera, refresco lista de liquidaciones
	useEffect(() => {
		liqChanger("list", {
			clear: !liqCabSelected?.id,
			data: Array.isArray(liqCabSelected?.liquidaciones)
				? liqCabSelected?.liquidaciones
				: [],
		});
	}, [liqCabSelected, liqChanger]);
	//#endregion

	//#region modulo y acciones
	const acciones = useMemo(
		() => [
			new Action({
				name: "Procesa liquidaciones",
				keys: "p",
				underlineindex: 0,
				combination: "AltKey",
				onExecute: (_) => setRedirect({ to: "Procesar" }),
			}),
			...liqCabActions,
			...liqActions,
		],
		[liqCabActions, liqActions]
	);
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "SIARU", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<>
			<Grid className="titulo" width="full">
				<h1>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid className="contenido" width="full">
				<Grid
					col
					full
					style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
				>
					<Grid full="width">
						<h2 className="subtitulo">
							{[
								"Liquidaciones de",
								Formato.Cuit(empresa.cuit),
								empresa.razonSocial,
							]
								.filter((r) => r)
								.join(" ")}
						</h2>
					</Grid>
					<Grid full="width" gap="5px" style={{ padding: "5px" }}>
						<Grid width="50%">
							<SelectMaterial
								name="periodo"
								label="Periodo"
								error={periodos.loading ?? periodos.error?.message ?? ""}
								value={liqCabParams.periodo ?? 0}
								options={periodos.data}
								onChange={(periodo) =>
									setLiqCabParams((o) => {
										const params = { ...o, periodo };
										if (!periodo) delete params.periodo;
										return params;
									})
								}
							/>
						</Grid>
					</Grid>
					<Grid full="width">{liqCabRender()}</Grid>
					<Grid full="width" grow>
						{liqRender()}
					</Grid>
					<Grid full="width">
						<LiquidacionDetails data={liqSelected} cabecera={liqCabSelected} />
					</Grid>
				</Grid>
				{liquidacionPDFRender}
			</Grid>
			<KeyPress items={acciones} />
		</>
	);
};

export default LiquidacionesHandler;
