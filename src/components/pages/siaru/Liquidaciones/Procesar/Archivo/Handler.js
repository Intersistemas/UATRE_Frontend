import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "redux/actions";
import Tentativas from "../Tentativas/Handler";
import useQueryQueue from "components/hooks/useQueryQueue";

const Handler = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const empresa = useSelector((state) => state.empresa);
	const { periodo, archivo } =
		useSelector((state) => state.liquidacionProcesar.desdeArchivo) ?? {};

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);

	useEffect(() => {
		if (!empresa?.cuit) setRedirect({ to: "/siaru" });
		else if (!(periodo || archivo))
			setRedirect({ to: "/siaru/liquidaciones/procesar" });
	}, [empresa, periodo, archivo]);

	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetTentativas": {
				const { archivo, ...pars } = params;
				const data = new FormData();
				data.append("Archivo", archivo, archivo.name);
				return {
					config: {
						baseURL: "SIARU",
						method: "POST",
						endpoint: "/Liquidaciones/TentativasLSD",
						body: data,
						bodyToJSON: false,
						headers: { Accept: "*/*" },
					},
					params: pars,
				};
			}
			default:
				return null;
		}
	});

	//#region declaración y carga de tentativas
	const [tentativas, setTentativas] = useState({
		loading: "Cargando...",
		params: { cuit: empresa.cuit, periodo: periodo, archivo: archivo },
		data: [],
		error: {},
	});
	useEffect(() => {
		if (!tentativas.loading) return;
		pushQuery({
			action: "GetTentativas",
			params: tentativas.params,
			onOk: (res) =>
				setTentativas((old) => ({
					...old,
					loading: null,
					data: res,
					error: null,
				})),
			onError: (err) => 
			setTentativas((old) => ({
				...old,
				loading: null,
				data: null,
				error: err,
			})),
		});
	}, [tentativas, pushQuery]);
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
				setRedirect({ to: "/siaru" });
				break;
			case `Liquidaciones`:
				setRedirect({ to: "/siaru/liquidaciones"});
				break;
			case `Procesar liquidaciones`:
				setRedirect({ to: "/siaru/liquidaciones/procesar"});
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, dispatch]);
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
		contenido = <Tentativas periodo={periodo} tentativas={tentativas.data} />;
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
