import React, { useState, useEffect } from "react";
import { redirect } from "react-router-dom";
import useHttp from "../../hooks/useHttp";
import EmpresaDetails from "./EmpresaDetails";
import EstablecimientosHandler from "./EstablecimientosHandler";
import styles from "./SiaruHandler.module.css";
import {useLocation} from 'react-router-dom';

const SiaruHandler = (props) => {
	const location = useLocation();
	// const cuit = parseFloat(location.state.cuit ?? 0);
	const cuit = 22222;
	if (cuit == 0) redirect("/");
	const [empresa, setEmpresa] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();

	useEffect(() => {
		const processEmpresa = async (empresaObj) => {
			setEmpresa(empresaObj);
		};

		request(
			{
				baseURL: "SIARU",
				endpoint: `/Empresas/${cuit}`,
				method: "GET",
			},
			processEmpresa
		);
	}, [request]);

	if (isLoading) return <h1>Cargando...</h1>;
	if (error) return <h1>{error}</h1>;
	if (empresa == null) return <></>;

	return (
		<>
			<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			<h2 className={`${styles.titulo} ${styles.subtitulo}`}>Empresa</h2>
			<EmpresaDetails config={{ data: empresa }} />
			<EstablecimientosHandler config={{ empresa: empresa }} />
		</>
	);
};

export default SiaruHandler;
