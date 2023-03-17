import React, { useEffect, useMemo, useState } from "react";
import styles from "./Handler.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import useHttp from "../../../../../hooks/useHttp";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../../../redux/actions";
import Grid from "../../../../../ui/Grid/Grid";
import DDJJList from "./DDJJList";
import Formato from "../../../../../helpers/Formato";
import { Tab, Tabs } from "@mui/material";
import LiquidacionList from "./LiquidacionList";
import DDJJForm from "./DDJJForm";
import dayjs from "dayjs";

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
	const { sendRequest: request } = useHttp();

	//#region declaración y carga de ddjj y liquidaciones
	const [ddjjList, setDDJJList] = useState({ loading: true });
	const [ddjj, setDDJJ] = useState({});
	const [liqList, setLiqList] = useState({ loading: true });
	// const [liq, setLiq] = useState({});
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_Liquidaciones/Tentativa?CUIT=${empresa.cuit}&Periodo=${periodo}`,
				method: "GET",
			},
			async (resp) => {
				const rta = [...resp];
				let newLiquidaciones = [];
				let newDDJJ = [];
				rta.forEach((tent, index) => {
					// Si tiene establecimiento y tipo de pago, entonces es una sugerencia de liquidacion válida
					// En caso contrario, es solo a modo informativo de nomina
					const {nomina, ...liq} = tent;
					if (
						liq.empresasEstablecimientosId &&
						liq.liquidacionesTiposPagosId
					) {
						newLiquidaciones = [...newLiquidaciones, { index: newLiquidaciones.length, ...liq }];
					}
					nomina.forEach((nom) => {
						newDDJJ = [
							...newDDJJ,
							{
								...nom,
								empresasEstablecimientosId: tent.empresasEstablecimientosId,
								empresasEstablecimientos_Nombre:
									tent.empresasEstablecimientos_Nombre,
							},
						];
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
		if (!ddjjList.data) return ddjjList.data;
		let ret = [...ddjjList.data];

		return ret;
	};

	/** Retorna liqList aplicando filtro */
	const filtrarLiqList = () => {
		if (!liqList.data) return liqList.data;
		let ret = [...liqList.data];

		return ret;
	};

	//#region declaración y carga de esablecimientos
	const [establecimientos, setEstablecimientos] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/EmpresasEstablecimientos?EmpresasId=${empresa.id}`,
				method: "GET",
			},
			async (resp) => {
				setEstablecimientos({ data: resp });
			},
			async (error) => {
				setEstablecimientos({ error: error });
			}
		);
	}, [empresa.id, request]);
	//#endregion

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ nombre: `Empresas` }, { nombre: `Procesar liquidaciones` }],
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
		if (ddjjRecord.empresasEstablecimientosId === 0) return null;
		if (ddjjRecord.condicionRural !== "RU") return null;
		return {
			index: index,
			empresasEstablecimientosId: ddjjRecord.empresasEstablecimientosId,
			periodo: periodo,
			fecha: dayjs().format("YYYY-MM-DD") ?? null,
			cantidadTrabajadores: 1,
			totalRemuneraciones: ddjjRecord.remuneracionImponible,
			tipoLiquidacion: 0,
			refMotivosBajaId: 0,
			liquidacionesTiposPagosId: ddjjRecord.afiliadoId ? 1 : 2,
			empresasEstablecimientos_Nombre: ddjjRecord.empresasEstablecimientos_Nombre,
		};
	}

	const calcLiqListDesdeDDJJList = () => {
		let newLiqList = [];
		if (!ddjjList.data) return setLiqList({ data: newLiqList });
		ddjjList.data.forEach((ddjj) => {
			if (ddjj.empresasEstablecimientosId === 0) return;
			if (ddjj.condicionRural !== "RU") return;
			const estab = establecimientos.data?.find(
				(r) => r.id === ddjj.empresasEstablecimientosId
			);
			if (!estab) return;

			const liqCalc = newLiq(ddjj, newLiqList.length);
			let liq = newLiqList.find(
				(r) =>
					r.empresasEstablecimientosId === liqCalc.empresasEstablecimientosId &&
					r.liquidacionesTiposPagosId === liqCalc.liquidacionesTiposPagosId
			);
			if (liq) {
				liq.cantidadTrabajadores += liqCalc.cantidadTrabajadores;
				liq.totalRemuneraciones =
					Math.round(
						(liq.totalRemuneraciones +
							liqCalc.totalRemuneraciones +
							Number.EPSILON) *
							100
					) / 100;
			} else {
				newLiqList = [...newLiqList, liqCalc];
		}
		});

		return setLiqList({ data: newLiqList });
	};

	let currentTabContent;
	switch (currentTab) {
		case 0:
			currentTabContent = (
				<Grid col full="width">
					<Grid full="width">
						<DDJJList
							config={{
								loading: ddjjList.loading,
								data: filtrarDDJJList(),
								noData: getNoData(ddjjList),
								onSelect: (r) => setDDJJ(r),
							}}
						/>
					</Grid>
					<Grid full="width">
						<DDJJForm
							config={{
								data: ddjj,
								establecimientos: establecimientos.data,
								onChange: (v) => {
									if (!ddjjList.data) return;
									const vIx = ddjjList.data.findIndex((r) => r.cuil === v.cuil);
									if (vIx < 0) return;
									ddjjList.data[vIx] = v;
									calcLiqListDesdeDDJJList();
									setDDJJ(v);
								},
							}}
						/>
					</Grid>
				</Grid>
			);
			break;
		case 1:
			currentTabContent = (
				<LiquidacionList
					config={{
						loading: liqList.loading,
						data: filtrarLiqList(),
						noData: getNoData(liqList),
					}}
				/>
			);
			break;
		default:
			break;
	}

	return (
		<Grid col full gap="5px">
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
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
					<Tab className={styles.tab} label="Detalle de la liquidacion" />
					<Tab
						className={styles.tab}
						label="Liquidacion a generar por establecimiento"
					/>
				</Tabs>
				{currentTabContent}
			</Grid>
		</Grid>
	);
};

export default Handler;
