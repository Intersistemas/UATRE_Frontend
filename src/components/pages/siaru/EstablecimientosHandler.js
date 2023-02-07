import React, { useEffect, useState } from "react";
import useHttp from "../../hooks/useHttp";
import EstablecimientosList from "./EstablecimientosList";

const EstablecimientosHandler = (props) => {
	let config = props.config;
	let empresasId = config.empresasId;
	const [establecimientos, setEstablecimientos] = useState(null);
	const [establecimiento, setEstablecimiento] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();

	useEffect(() => {
		const processEstablecimientos = async (establecimientosArr) => {
			setEstablecimientos(establecimientosArr);
		};

		request(
			{
				baseURL: "SIARU",
				endpoint: `/EmpresasEstablecimientos?EmpresasId=${empresasId}`,
				method: "GET",
			},
			processEstablecimientos
		);
	}, [request]);

	if (isLoading) return <h1>Cargando...</h1>;
	if (error) return <h1>{error}</h1>;
	if (establecimientos == null) return <></>;

	const handleEstablecimientosSelect = (ix) => {
		console.log(
			"handleEstablecimientosSelect",
			ix,
			"establecimiento",
			establecimientos[ix]
		);
		setEstablecimiento(establecimientos[ix]);
	};

	const establecimientoHF = establecimiento == null ? (<></>) : (
		<h1>Id: {establecimiento.id}</h1>
	);

	return (
		<>
			<EstablecimientosList
				config={{
					data: establecimientos,
					onSelect: handleEstablecimientosSelect,
				}}
			/>
			{establecimientoHF/* ToDo: Mostrar datos del establecimiento seleccionado */}
		</>
	);
};

export default EstablecimientosHandler;
