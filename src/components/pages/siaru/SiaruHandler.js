import React, { useState, useEffect } from "react";
import useHttp from "../../hooks/useHttp";
import Grid from "../../ui/Grid/Grid";
import Formato from "../../helpers/Formato";
import EmpresaDetails from "./Empresas/EmpresaDetails";
import EmpresasList from "./Empresas/EmpresasList";
import styles from "./SiaruHandler.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../redux/actions";

const SiaruHandler = (props) => {
	const [empresas, setEmpresas] = useState([]);
	const [empresa, setEmpresa] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const fetchEmpresa = (cuit) => {
		if ((cuit ?? 0) == 0) {
			setEmpresa(null);
			return;
		}
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Empresas/${cuit}`,
				method: "GET",
			},
			async (response) => setEmpresa(response)
		);
	};

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [],
	};
	if (empresa) {
		moduloInfo.acciones = [
			...moduloInfo.acciones,
			{ nombre: `Establecimientos ${Formato.Cuit(empresa.cuit)}` },
		];
	}
	dispatch(handleModuloSeleccionar(moduloInfo));
	//#endregion

	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		// request(
		// 	{
		// 		baseURL: "SIARU",
		// 		endpoint: `/Empresas/${cuit}`,
		// 		method: "GET",
		// 	},
		// 	async (response) => setEmpresas(response)
		// );
		setEmpresas([
			{
				cuit: 34618764356,
				razonsocial: "HUAYRA SCA",
				localidad: "Rio Negro",
				domicilio: "AVELEYRA 338",
			},
			{
				cuit: 34617797587,
				razonsocial: "LUISITO SA",
				localidad: "Buenos Aires",
				domicilio: "JUJUY 766",
			},
			{
				cuit: 34610675923,
				razonsocial: "TAPE S.A.",
				localidad: "Buenos Aires",
				domicilio: "RODRIGUEZ PEÑA 616",
			},
			{
				cuit: 34560268019,
				razonsocial: "ASOC COOP DE LA EEA MZA-I",
				localidad: "Corrientes",
				domicilio: "SAN MARTIN 3853",
			},
		]);

		//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
		switch (moduloAccion) {
			case `Establecimientos ${Formato.Cuit(empresa?.cuit)}`:
				navigate("/siaru/establecimientos", { state: { empresa: empresa } });
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, empresa]);

	// if (isLoading) return <h1>Cargando...</h1>;
	// if (error) return <h1>{error}</h1>;

	return (
		<Grid col full>
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid full="width">
				<h2 className="subtitulo">Empresas</h2>
			</Grid>
			<Grid full="width" grow>
				<Grid width="50%">
					<EmpresasList
						config={{
							data: empresas,
							onSelect: (r) => fetchEmpresa(r?.cuit),
						}}
					/>
				</Grid>
				<Grid block width="50%" style={{ paddingLeft: "5px" }}>
					<EmpresaDetails config={{ data: empresa }} />
				</Grid>
			</Grid>
		</Grid>
	);
};

export default SiaruHandler;
