import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { Tab, Tabs } from "@mui/material";
import styles from "./Handler.module.css";
import Grid from "../../../../../ui/Grid/Grid";
import Formato from "../../../../../helpers/Formato";
import useHttp from "../../../../../hooks/useHttp";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../../../redux/actions";
import LiquidacionList from "./LiquidacionList";
import DDJJList from "./DDJJList";
import DDJJForm from "./DDJJForm";
import LiquidacionesTipos from "../../Formulario/Tipos";
import LiquidacionesForm from "../../Formulario/Form";

const Handler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = useMemo(
		() => (location.state?.empresa ? location.state.empresa : {}),
		[location.state?.empresa]
	);
	const periodo = location.state?.periodo;
	if (empresa.id == null || periodo == null) navigate("/");

	const [currentTab, setCurrentTab] = useState(0);
	const [formRender, setFormRender] = useState();
	const { sendRequest: request } = useHttp();

	//#region declaracion y carga de tipos de liquidacion
	const [tiposPagos, setTiposPagos] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/LiquidacionesTiposPagos`,
				method: "GET",
			},
			async (res) => setTiposPagos({ data: res }),
			async (err) => setTiposPagos({ error: err })
		);
	}, [request]);
	//#endregion

	//#region declaración y carga de ddjj y liquidaciones
	const [ddjjList, setDDJJList] = useState({ loading: true });
	const [ddjj, setDDJJ] = useState({});
	const [liqList, setLiqList] = useState({ loading: true });
	// const [liq, setLiq] = useState({});
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Liquidaciones/Tentativas?CUIT=${empresa.cuit}&Periodo=${periodo}`,
				method: "GET",
			},
			async (resp) => {
				const rta = [...resp];
				let newLiquidaciones = [];
				let newDDJJ = [];
				rta.forEach((tent, index) => {
					// Si tiene establecimiento y tipo de pago, entonces es una sugerencia de liquidacion válida
					// En caso contrario, es solo a modo informativo de nomina
					const { nominas, ...liq } = tent;
					if (liq.empresaEstablecimientoId && liq.liquidacionTipoPagoId) {
						liq.id = 0;	// El ws me informa el id de liquidacion cuando existe. Este Id lo estoy usando de marca para cuando confirmo una generación.
						liq.nominas = [];
						if (nominas?.length) {
							nominas.forEach((nomina) =>
								liq.nominas.push({
									cuil: nomina.cuil,
									nombre: nomina.nombre,
								})
							);
						}
						newLiquidaciones.push({ index: newLiquidaciones.length, ...liq });
					}
					nominas.forEach((nom) => {
						newDDJJ.push({
							...nom,
							empresaEstablecimientoId: tent.empresaEstablecimientoId,
							empresaEstablecimiento_Nombre: tent.empresaEstablecimiento_Nombre,
						});
					});
				});
				setDDJJList({ data: newDDJJ });
				setLiqList({ data: newLiquidaciones });
			},
			async (error) => {
				setDDJJList({ error: error });
				setLiqList({ error: error });
			}
		);
	}, [periodo, empresa.cuit, request]);
	//#endregion

	/** Retorna información de error o mensaje "sin datos" */
	const getNoData = (rq) => {
		if (rq?.loading) return <h4>Cargando...</h4>;
		if (!rq?.error) return <h4>No hay informacion a mostrar</h4>;
		switch (rq.error.type) {
			case "Body":
				return <h4>{rq.error.message}</h4>;
			default:
				return (
					<h4 style={{ color: "red" }}>
						{"Error "}
						{rq.error.code ? `${rq.error.code} - ` : ""}
						{rq.error.message}
					</h4>
				);
		}
	};

	/** Retorna ddjjList aplicando filtro */
	const filtrarDDJJList = () => {
		if (ddjjList.loading) return [];
		if (ddjjList.error) return [];
		let ret = [...ddjjList.data];
		///ToDo: Aplicar filtros;
		return ret;
	};

	/** Retorna liqList aplicando filtro */
	const filtrarLiqList = () => {
		if (liqList.loading) return [];
		if (liqList.error) return [];
		let ret = [...liqList.data];
		///ToDo: Aplicar filtros;
		return ret;
	};

	//#region declaración y carga de esablecimientos
	const [establecimientos, setEstablecimientos] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetByEmpresa?EmpresaId=${empresa.id}&PageSize=5000`,
				method: "GET",
			},
			async (resp) => setEstablecimientos({ data: resp.data }),
			async (error) => setEstablecimientos({ error: error })
		);
	}, [empresa.id, request]);
	//#endregion

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ name: `Empresas` }, { name: `Procesar liquidaciones` }],
	};
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		switch (moduloAccion) {
			case `Empresas`:
				navigate("/siaru", { state: { empresa: empresa } });
				break;
			case `Procesar liquidaciones`:
				navigate("/siaru/liquidaciones/procesar", {
					state: { empresa: empresa },
				});
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, empresa, navigate, dispatch]);
	// #endregion

	const newLiq = (ddjjRecord, index) => {
		if (ddjjRecord.empresaEstablecimientoId === 0) return null;
		if (ddjjRecord.condicionRural !== "RU") return null;
		const ret = {
			index: index,
			empresaEstablecimientoId: ddjjRecord.empresaEstablecimientoId,
			periodo: periodo,
			fecha: dayjs().format("YYYY-MM-DD") ?? null,
			cantidadTrabajadores: 1,
			totalRemuneraciones: ddjjRecord.remuneracionImponible,
			tipoLiquidacion: 0,
			refMotivoBajaId: 0,
			liquidacionTipoPagoId: ddjjRecord.afiliadoId ? 1 : 3, ///ToDo: Parametrizar tipos de pago Sindical y Solidario
			empresaEstablecimiento_Nombre: ddjjRecord.empresaEstablecimiento_Nombre,
			nominas: [{ cuil: ddjjRecord.cuil, nombre: ddjjRecord.nombre }],
		};
		ret.interesPorcentaje = tiposPagos.data?.find(r => r.id === ret.liquidacionTipoPagoId)?.porcentaje ?? 0;
		ret.interesNeto = ret.totalRemuneraciones * (ret.interesPorcentaje / 100);
		return ret;
	};

	const calcLiqListDesdeDDJJList = () => {
		let newLiqList = [];
		if (!ddjjList.data) return setLiqList({ data: newLiqList });
		ddjjList.data.forEach((ddjj) => {
			if (ddjj.empresaEstablecimientoId === 0) return;
			if (ddjj.condicionRural !== "RU") return;
			const estab = establecimientos.data?.find(
				(r) => r.id === ddjj.empresaEstablecimientoId
			);
			if (!estab) return;

			const liqCalc = newLiq(ddjj, newLiqList.length);
			let liq = newLiqList.find(
				(r) =>
					r.empresaEstablecimientoId === liqCalc.empresaEstablecimientoId &&
					r.liquidacionTipoPagoId === liqCalc.liquidacionTipoPagoId
			);
			if (liq) {
				liq.cantidadTrabajadores += liqCalc.cantidadTrabajadores;
				liq.nominas.push(...liqCalc.nominas);
				liq.totalRemuneraciones =
					Math.round(
						(liq.totalRemuneraciones +
							liqCalc.totalRemuneraciones +
							Number.EPSILON) *
							100
					) / 100;
				liq.interesNeto = 
					Math.round(
						(liq.interesNeto +
							liqCalc.interesNeto +
							Number.EPSILON) *
							100
					) / 100;
			} else {
				newLiqList.push(liqCalc);
			}
		});
		return setLiqList({ data: newLiqList });
	};

	const handleDDJJFormOnChange = (record) => {
		if (!ddjjList.data) return;
		const recordIx = ddjjList.data.findIndex((r) => r.cuil === record.cuil);
		if (recordIx < 0) return;
		ddjjList.data[recordIx] = record;
		calcLiqListDesdeDDJJList();
		setDDJJ(record);
	};
	const [ddjjFormDisabled, setDDJJFormDisabled] = useState(false);

	let currentTabContent;
	switch (currentTab) {
		case 0:
			currentTabContent = (
				<Grid col full="width">
					<Grid full="width">
						<DDJJList
							records={filtrarDDJJList()}
							loading={ddjjList.loading}
							noData={getNoData(ddjjList)}
							onSelect={(r) => setDDJJ(r)}
						/>
					</Grid>
					<Grid full="width">
						<DDJJForm
							data={ddjj}
							establecimientos={establecimientos.data}
							disabled={ddjjFormDisabled}
							onChange={handleDDJJFormOnChange}
						/>
					</Grid>
				</Grid>
			);
			break;
		case 1:
			currentTabContent = (
				<LiquidacionList
					records={filtrarLiqList()}
					tiposPagos={tiposPagos.data}
					loading={liqList.loading}
					noData={getNoData(liqList)}
					onOpenForm={(record) => {
						// Deshabilitar controles de datos que ya se cargaron.
						const disabled = {};
						Object.keys(record).forEach((k) => (disabled[`${k}`] = true));
						disabled.totalRemuneraciones = false;
						setFormRender(
							<LiquidacionesForm
								request={record.id ? "C" : "A"}
								tipo={LiquidacionesTipos.Tentativa}
								record={record}
								empresa={empresa}
								titulo={<span>{record.id ? "Consultando" : "Generando"} liqudacion</span>}
								disabled={disabled}
								onConfirm={(newRecord, request) => {
									// Actualizo lista
									setLiqList((old) => {
										const data = [...old.data];
										data[record.index] = { ...newRecord, index: record.index };
										return { ...old, data: data };
									});
									// Inhabilitar cambio en DDJJList
									setDDJJFormDisabled(true);
									// Oculto formulario
									setFormRender(null);
								}}
								onCancel={() => setFormRender(null)}
							/>
						);
					}}
				/>
			);
			break;
		default:
			break;
	}

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				<Grid col full gap="5px">
					<Grid full="width">
						<h2 className="subtitulo">
							Liquidar periodo {Formato.Periodo(periodo)} de
							{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial ?? ""}`}
						</h2>
					</Grid>
					<Grid block full="width">
						<Tabs
							value={currentTab}
							onChange={(_event, newValue) => setCurrentTab(newValue)}
							aria-label="basic tabs example"
							style={{ position: "fixed" }}
						>
							<Tab
								className={styles.tab}
								style={{ backgroundColor: "#186090" }}
								label="Detalle de la liquidacion"
							/>
							<Tab
								className={styles.tab}
								style={{ backgroundColor: "#186090" }}
								label="Liquidacion a generar por establecimiento"
							/>
						</Tabs>
						{currentTabContent}
					</Grid>
				</Grid>
				{formRender}
			</div>
		</>
	);
};

export default Handler;
