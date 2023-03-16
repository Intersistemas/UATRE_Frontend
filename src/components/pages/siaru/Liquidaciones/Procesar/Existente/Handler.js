import React, { useEffect, useState } from "react";
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

const Handler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = location.state?.empresa ? location.state.empresa : {};
	const periodo = location.state?.periodo;
	if (empresa.id == null || periodo == null) navigate("/");

	const [currentTab, setCurrentTab] = useState(0);
	const { isLoading, error, sendRequest: request } = useHttp();

	// Cargo ddjj y liquidaciones
	const [ddjj, setDDJJ] = useState({ loading: true });
	const [liquidaciones, setLiquidaciones] = useState({ loading: true });
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
					if (
						tent.empresasEstablecimientosId &&
						tent.liquidacionesTiposPagosId
					) {
						newLiquidaciones = [...newLiquidaciones, { id: index, ...tent }];
					}
					tent.nomina.forEach((nom) => {
						newDDJJ = [
							...newDDJJ,
							{
								...nom,
								empresasEstablecimientosId: tent.empresasEstablecimientosId,
								empresasEstablecimientosNombre:
									tent.empresasEstablecimientosNombre,
							},
						];
					});
				});
				setDDJJ({ data: newDDJJ });
				setLiquidaciones({ data: newLiquidaciones });
			},
			async (error) => {
				setDDJJ({ error: error });
				setLiquidaciones({ error: error });
			}
		);
	}, [periodo, empresa.cuit, request]);

	// Cargo establecimientos de la empresa
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
	}, []);

	let noData = <h4>No hay informacion a mostrar</h4>;
	if (ddjj.error) {
		if (ddjj.error.type === "Body") {
			noData = <h4>{ddjj.error.message}</h4>;
		} else {
			noData = (
				<h4 style={{ color: "red" }}>
					Error {ddjj.error.code} - {ddjj.error.message}
				</h4>
			);
		}
	}
	let currentTabContent;
	switch (currentTab) {
		case 0:
			currentTabContent = (
				<Grid col full="width">
					<Grid full="width">
						<DDJJList
							config={{
								loading: ddjj.loading,
								data: ddjj.data,
								noData: noData,
								establecimientos: establecimientos,
								onChangeRecord: (record) => {
									//
								}
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
						loading: liquidaciones.loading,
						data: liquidaciones.data,
						noData: noData,
					}}
				/>
			);
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
