import React, { useState, useEffect } from "react";
import useHttp from "../../hooks/useHttp";
import EmpresaDetails from "./EmpresaDetails";
import EstablecimientosHandler from "./EstablecimientosHandler";

const SiaruHandler = (props) => {
	const config = props.config;
	// let cuit = config.cusit;
	const cuit = 22222;
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
			<h1>Sistema de Aportes Rurales</h1>
			<h2>Empresa</h2>
			<EmpresaDetails config={{ data: empresa }} />
			<EstablecimientosHandler config={{ empresa: empresa }} />
		</>
	);
};

export default SiaruHandler;
