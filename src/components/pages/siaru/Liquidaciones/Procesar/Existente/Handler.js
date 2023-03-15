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

const Handler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = location.state?.empresa ? location.state.empresa : {};
	const periodo = location.state?.periodo;
	if (empresa.id == null || periodo == null) navigate("/");

	const { isLoading, error, sendRequest: request } = useHttp();

	// Cargo ddjj y liquidaciones
	const [ddjj, setDDJJ] = useState({ data: [], loading: true });
	const [liquidaciones, setLiquidaciones] = useState([]);
	useEffect(() => {
		if (empresa?.cuit && periodo) {
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
					rta.forEach((tent) => {
						// Si tiene establecimiento y tipo de pago, entonces es una sugerencia de liquidacion válida
						// En caso contrario, es solo a modo informativo de nomina
						if (
							tent.empresasEstablecimientosId &&
							tent.liquidacionesTiposPagosId
						) {
							newLiquidaciones = [...newLiquidaciones, tent];
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
					setLiquidaciones(newLiquidaciones);
				},
				async (error) => setDDJJ({ error: error })
			);
		}
	}, [periodo, empresa.cuit, request]);

	let ddjjNoData = <h4>No hay informacion a mostrar</h4>;
	if (ddjj.error) {
		if (ddjj.error.type === "Body") {
			ddjjNoData = <h4>{ddjj.error.message}</h4>;
		} else {
			ddjjNoData = (
				<h4 style={{ color: "red" }}>
					Error {ddjj.error.code} - {ddjj.error.message}
				</h4>
			);
		}
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
			<Grid full="width">
				<DDJJList
					config={{
						loading: ddjj.loading,
						data: ddjj.data,
						noData: ddjjNoData,
					}}
				/>
			</Grid>
		</Grid>
	);
};

export default Handler;
