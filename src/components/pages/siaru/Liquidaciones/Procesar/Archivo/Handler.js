import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import useHttp from "../../../../../hooks/useHttp";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../../../redux/actions";
import Tentativas from "../Tentativas/Handler";

const Handler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = useMemo(
		() => (location.state?.empresa ? location.state.empresa : {}),
		[location.state?.empresa]
	);
	const periodo = location.state?.periodo;
	const archivo = location.state?.archivo;
	if (empresa.id == null || periodo == null || archivo == null) navigate("/ingreso");

	const { sendRequest: request } = useHttp();

	//#region declaración y carga de tentativas
	const [tentativas, setTentativas] = useState({ loading: true });
	useEffect(() => {
		const data = new FormData();
		data.append("Archivo", archivo, archivo.name);
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Liquidaciones/TentativasLSD?CUIT=${empresa.cuit}&Periodo=${periodo}`,
				method: "POST",
				body: data,
				bodyToJSON: false,
				headers: {
					Accept: "*/*",
				},
			},
			async (res) => setTentativas({ data: res }),
			async (err) => setTentativas({ error: err })
		);
	}, [empresa.cuit, periodo, archivo, request]);
	//#endregion

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [
			{ name: `Empresas` },
			{ name: `Liquidaciones` },
			{ name: `Procesar liquidaciones` },
		],
	};
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		switch (moduloAccion) {
			case `Empresas`:
				navigate("/siaru", { state: { empresa: empresa } });
				break;
			case `Liquidaciones`:
				navigate("/siaru/liquidaciones", { state: { empresa: empresa } });
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
	//#endregion

	let contenido = null;
	if (tentativas.loading) {
		contenido = <h1>Cargando tentativas...</h1>;
	} else if (tentativas.error) {
		contenido = <h1>Ocurrió un error cargando tentativas..</h1>;
		switch (tentativas.error.code ?? 0) {
			case 0:
				contenido = (
					<>
						{contenido}
						<br />
						<h4>{tentativas.error.message}</h4>
					</>
				);
				break;
			default:
				contenido = (
					<>
						{contenido}
						<br />
						<h4 style={{ color: "red" }}>
							{"Error "}
							{tentativas.error.code ? `${tentativas.error.code} - ` : ""}
							{tentativas.error.message}
						</h4>
					</>
				);
		}
	} else {
		contenido = (
			<Tentativas
				empresa={empresa}
				periodo={periodo}
				tentativas={tentativas.data}
			/>
		);
	}

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">{contenido}</div>
		</>
	);
};

export default Handler;
