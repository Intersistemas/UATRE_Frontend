import React, { useState, useEffect } from "react";
import useHttp from "../../hooks/useHttp";
import EstablecimientosHandler from "./EstablecimientosHandler";

const SiaruHandler = (props) => {
	let config = props.config;
	// let cuit = config.cuit;
	let cuit = 22222;
	const [empresa, setEmpresa] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();

	useEffect(() => {
		const processEmpresa = async (empresaObj) => {
			setEmpresa(empresaObj);
		};

		request (
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
			{/* ToDo: Mostrar datos de la empresa */}
			<EstablecimientosHandler config={{ empresasId: empresa.id }} />
		</>
	);
};

export default SiaruHandler;
