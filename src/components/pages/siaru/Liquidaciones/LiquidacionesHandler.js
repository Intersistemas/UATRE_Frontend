import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useQueryQueue from "components/hooks/useQueryQueue";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "redux/actions";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import LiquidacionesList from "./LiquidacionesList";
import LiquidacionDetails from "./LiquidacionDetails";
import LiquidacionForm from "./Formulario/Form";
import LiquidacionPDF from "./Impresion/Handler";

const LiquidacionesHandler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = useMemo(
		() => (location.state?.empresa ? location.state.empresa : {}),
		[location.state?.empresa]
	);
	if (empresa?.id == null) navigate("/ingreso");

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetLiquidacionPeriodos":
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/Liquidaciones/Periodos`,
					},
				};
			case "GetLiquidacionTipoPagoList":
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/LiquidacionesTiposPagos`,
					},
				};
			case "GetLiquidaciones":
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/Liquidaciones`,
					},
				};
			case "CreateLiquidacion":
				return {
					config: {
						baseURL: "SIARU",
						method: "POST",
						endpoint: `/Liquidaciones`,
					},
				};
			case "UpdateLiquidacion":
				return {
					config: {
						baseURL: "SIARU",
						method: "PATCH",
						endpoint: `/Liquidaciones`,
					},
				};
			case "GetEstablecimientosByEmpresa":
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
					},
				};
			default:
				return null;
		}
	});
	//#endregion

	//#region declaración y carga de periodos
	const [periodos, setPeriodos] = useState({
		data: [{ valor: 0, descipcion: "Todos" }],
		loading: true,
	});
	const [periodo, setPeriodo] = useState(0);
	useEffect(
		() =>
			pushQuery({
				action: "GetLiquidacionPeriodos",
				params: { empresaId: empresa.id ?? 0 },
				onOk: async (res) =>
					setPeriodos({
						data: [
							{ descipcion: "Todos", valor: 0 },
							...res.map((r) => ({
								descipcion: Formato.Periodo(r),
								valor: r,
							})),
						],
					}),
				onError: async (err) =>
					setPeriodos({
						data: [{ valor: 0, descipcion: "Todos" }],
						error: err,
					}),
			}),
		[pushQuery, empresa]
	);
	//#endregion

	//#region declaracion y carga de establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		data: [{ descipcion: "Todos", valor: { id: 0 } }],
		loading: true,
	});
	const [establecimiento, setEstablecimiento] = useState({ id: 0 });
	useEffect(
		() =>
			pushQuery({
				action: "GetEstablecimientosByEmpresa",
				params: { empresaId: empresa.id ?? 0 },
				onOk: async (res) =>
					setEstablecimientos({
						data: [
							{ descipcion: "Todos", valor: { id: 0 } },
							...res.data.map((r) => ({ descipcion: r.nombre, valor: r })),
						],
					}),
				onError: async (err) => {
					err = err?.code === 404 ? null : err;
					setEstablecimientos({
						data: [{ descipcion: "Todos", valor: { id: 0 } }],
						error: err,
					});
				},
			}),
		[pushQuery, empresa]
	);
	//#endregion

	//#region declaracion y carga de tipos de pago
	const [liquidacionesTiposPagos, setLiquidacionesTiposPagos] = useState({
		loading: true,
	});
	useEffect(
		() =>
			pushQuery({
				action: "GetLiquidacionTipoPagoList",
				onOk: async (res) => setLiquidacionesTiposPagos({ data: res }),
				onError: async (err) => setLiquidacionesTiposPagos({ error: err }),
			}),
		[pushQuery]
	);
	//#endregion

	//#region declaracion y carga de liquidaciones
	const [refreshLiqudaciones, setRefreshLiquidaciones] = useState(true);
	const [liquidaciones, setLiquidaciones] = useState({ loading: true });
	const [pagination, setPagination] = useState({
		index: 1,
		size: 10,
		onChange: (changes) => {
			setPagination((old) => ({ ...old, ...changes }));
			setRefreshLiquidaciones(true);
		},
	});
	const [liquidacion, setLiquidacion] = useState(null);
	useEffect(() => {
		if (!refreshLiqudaciones) return;
		const newApiQuery = {
			action: "GetLiquidaciones",
			params: {
				empresaId: empresa.id,
				page: `${pagination.index},${pagination.size}`,
				sort: `-Id`,
				todos: true,
			},
			onOk: async (res) => {
				setLiquidaciones({ data: res.data });
				if (res.data.length > 0) setLiquidacion(res.data[0]);
				setPagination((old) => ({
					...old,
					index: res.index,
					size: res.size,
					count: res.count,
					pages: res.pages,
				}));
				if (refreshLiqudaciones) setRefreshLiquidaciones(false);
			},
			onError: async (err) => setLiquidaciones({ error: err }),
		};
		if (periodo) newApiQuery.params.periodo = periodo;
		if (establecimiento?.id)
			newApiQuery.params.empresaEstablecimientoId = establecimiento.id;
		pushQuery(newApiQuery);
	}, [
		refreshLiqudaciones,
		pagination.index,
		pagination.size,
		periodo,
		establecimiento.id,
		empresa.id,
		pushQuery
	]);

	// Información si ocurrió algún error durante la carga de liquidaciones
	let liqNoData = <h4>No hay informacion a mostrar</h4>;
	if (liquidaciones.error) {
		switch (liquidaciones.error.code ?? 0) {
			case 0:
				liqNoData = <h4>{liquidaciones.error.message}</h4>;
				break;
			default:
				liqNoData = (
					<h4 style={{ color: "red" }}>
						{"Error "}
						{liquidaciones.error.code ? `${liquidaciones.error.code} - ` : ""}
						{liquidaciones.error.message}
					</h4>
				);
				break;
		}
	}
	//#endregion

	//#region declaracion y carga de formulario de liquidacion
	const [formRequest, setFormRequest] = useState();
	let liquidacionForm;
	if (formRequest) {
		const disabled = {};
		Object.keys(liquidacion).forEach((k) => (disabled[`${k}`] = true));
		if (formRequest === "B") {
			disabled.refMotivoBajaId = false;
			disabled.deletedObs = false;
		}
		liquidacionForm = (
			<LiquidacionForm
				request={formRequest}
				record={liquidacion}
				empresa={empresa}
				disabled={disabled}
				onConfirm={(record, request) => {
					pushQuery({
						action: request === "A" ? "CreateLiquidacion" : "UpdateLiquidacion",
						config: { body: record },
						onOk: (_res) => {
							setFormRequest(null);
							setRefreshLiquidaciones(true);
						},
						onError: (error) =>
							console.log({ tag: "LiquidacionForm.onConfirm", error: error }),
					});
				}}
				onCancel={(_request) => setFormRequest(null)}
			/>
		);
	}
	//#endregion

	//#region ImprimePDF
	const [despliegaPDF, setDespliegaPDF] = useState(false);
	let liquidacionPDFRender;
	if (despliegaPDF) {
		liquidacionPDFRender = (
			<LiquidacionPDF
				empresa={empresa}
				liquidaciones={[liquidacion]}
				onClose={() => setDespliegaPDF(false)}
			/>
		);
	}
	//#endregion

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ name: `Empresas` }, { name: `Procesa liquidaciones` }],
	};
	const liquidacionDesc = liquidacion
		? `liquidacion número ${liquidacion.id}`
		: ``;
	if (liquidacion) {
		moduloInfo.acciones.push({ name: `Consulta ${liquidacionDesc}` });
		if (!liquidacion.refMotivoBajaId) {
			moduloInfo.acciones.push({ name: `Baja ${liquidacionDesc}` });
			moduloInfo.acciones.push({ name: `Imprime ${liquidacionDesc}` });
			moduloInfo.acciones.push({ name: `Paga ${liquidacionDesc}` });
		}
	}
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		switch (moduloAccion) {
			case `Empresas`:
				navigate("/siaru");
				break;
			case `Procesa liquidaciones`:
				navigate("/siaru/liquidaciones/procesar", {
					state: { empresa: empresa },
				});
				break;
			case `Consulta ${liquidacionDesc}`:
				setFormRequest("C");
				break;
			case `Baja ${liquidacionDesc}`:
				setFormRequest("B");
				break;
			case `Imprime ${liquidacionDesc}`:
				// alert("Proximamente");
				setDespliegaPDF(true);
				break;
			case `Paga ${liquidacionDesc}`:
				alert("Proximamente");
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, liquidacionDesc, empresa, navigate, dispatch]);
	// #endregion

	const selection = {
		onSelect: (row, _isSelect, _rowIndex, _e) => setLiquidacion(row),
	};
	if (liquidacion) {
		selection.selected = [liquidacion.id];
	}

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				<Grid
					col
					full
					style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
				>
					<Grid full="width">
						<h2 className="subtitulo">
							Liquidaciones de
							{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial ?? ""}`}
						</h2>
					</Grid>
					<Grid
						full="width"
						gap="5px"
						style={{ background: "#ffffffe0", padding: "5px" }}
					>
						<Grid width="50%">
							<SelectMaterial
								name="periodo"
								label="Periodo"
								error={
									periodos.loading ? "Cargando" : periodos.error?.message ?? ""
								}
								value={periodo}
								options={periodos.data.map((r) => ({
									label: r.descipcion,
									value: r.valor,
								}))}
								onChange={(value, _id) => {
									setPeriodo(value);
									setRefreshLiquidaciones(true);
								}}
							/>
						</Grid>
						<Grid width="50%">
							<SelectMaterial
								name="establecimiento"
								label="Establecimiento"
								error={
									establecimientos.loading
										? "Cargando"
										: establecimientos.error?.message ?? ""
								}
								value={establecimiento.id}
								options={establecimientos.data.map((r) => ({
									label: r.descipcion,
									value: r.valor?.id,
								}))}
								onChange={(value, _id) => {
									setEstablecimiento(
										establecimientos.data.find((r) => r.valor.id === value)
											.valor
									);
									setRefreshLiquidaciones(true);
								}}
							/>
						</Grid>
					</Grid>
					<Grid full="width" grow>
						<LiquidacionesList
							loading={liquidaciones.loading}
							data={liquidaciones.data}
							noData={liqNoData}
							pagination={pagination}
							selection={selection}
						/>
					</Grid>
					<Grid full="width">
						<LiquidacionDetails
							data={liquidacion}
							tiposPagos={liquidacionesTiposPagos.data}
						/>
					</Grid>
				</Grid>
				{liquidacionForm}
				{liquidacionPDFRender}
			</div>
		</>
	);
};

export default LiquidacionesHandler;
