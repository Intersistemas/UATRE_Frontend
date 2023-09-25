import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useHttp from "../../../hooks/useHttp";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../redux/actions";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import SelectMaterial from "../../../ui/Select/SelectMaterial";
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

	const { sendRequest } = useHttp();

	//#region declaración y carga de periodos
	const [periodos, setPeriodos] = useState({
		data: [{ valor: 0, descipcion: "Todos" }],
		loading: true,
	});
	const [periodo, setPeriodo] = useState(0);
	useEffect(() => {
		sendRequest(
			{
				baseURL: "SIARU",
				endpoint: `/Liquidaciones/Periodos?EmpresaId=${empresa.id ?? 0}`,
				method: "GET",
			},
			async (res) =>
				setPeriodos({
					data: [
						{ descipcion: "Todos", valor: 0 },
						...res.map((r) => ({
							descipcion: Formato.Periodo(r),
							valor: r,
						})),
					],
				}),
			async (err) =>
				setPeriodos({ data: [{ valor: 0, descipcion: "Todos" }], error: err })
		);
	}, [empresa.id, sendRequest]);
	//#endregion

	//#region declaracion y carga de establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		data: [{ descipcion: "Todos", valor: { id: 0 } }],
		loading: true,
	});
	const [establecimiento, setEstablecimiento] = useState({ id: 0 });
	useEffect(() => {
		sendRequest(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetByEmpresa?EmpresaId=${
					empresa.id ?? 0
				}`,
				method: "GET",
			},
			async (res) =>
				setEstablecimientos({
					data: [
						{ descipcion: "Todos", valor: { id: 0 } },
						...res.data.map((r) => ({ descipcion: r.nombre, valor: r })),
					],
				}),
			async (err) => {
				err = err?.code === 404 ? null : err;
				setEstablecimientos({
					data: [{ descipcion: "Todos", valor: { id: 0 } }],
					error: err,
				});
			}
		);
	}, [empresa.id, sendRequest]);
	//#endregion

	//#region declaracion y carga de tipos de pago
	const [liquidacionesTiposPagos, setLiquidacionesTiposPagos] = useState({
		loading: true,
	});
	useEffect(() => {
		sendRequest(
			{
				baseURL: "SIARU",
				endpoint: `/LiquidacionesTiposPagos`,
				method: "GET",
			},
			async (res) => setLiquidacionesTiposPagos({ data: res }),
			async (err) => setLiquidacionesTiposPagos({ error: err })
		);
	}, [sendRequest]);
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

		let params = `EmpresaId=${empresa.id}`;
		params = `${params}&Page=${pagination.index},${pagination.size}`;
		params = `${params}&Sort=-Id`;
		if (periodo) params = `${params}&Periodo=${periodo}`;
		if (establecimiento?.id)
			params = `${params}&EmpresaEstablecimientoId=${establecimiento.id}`;
		sendRequest(
			{
				baseURL: "SIARU",
				endpoint: `/Liquidaciones?${params}`,
				method: "GET",
			},
			async (res) => {
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
			async (err) => setLiquidaciones({ error: err })
		);
	}, [
		refreshLiqudaciones,
		pagination.index,
		pagination.size,
		periodo,
		establecimiento.id,
		empresa.id,
		sendRequest,
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
			disabled.bajaObservaciones = false;
		}
		liquidacionForm = (
			<LiquidacionForm
				request={formRequest}
				record={liquidacion}
				empresa={empresa}
				disabled={disabled}
				onConfirm={(_record, _request) => {
					setFormRequest(null);
					setRefreshLiquidaciones(true);
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
				liquidacion={liquidacion}
				empresa={empresa}
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
