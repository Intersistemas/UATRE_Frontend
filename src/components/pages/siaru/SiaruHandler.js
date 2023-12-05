import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthContext from "store/authContext";
import {
	handleModuloSeleccionar,
	handleEmpresaSeleccionar,
} from "redux/actions";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import EmpresaDetails from "./empresas/EmpresaDetails";
import EmpresasList from "./empresas/EmpresasList";
import useQueryQueue from "components/hooks/useQueryQueue";
import Action from "components/helpers/Action";
import KeyPress from "components/keyPress/KeyPress";

const SiaruHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const authContext = useContext(AuthContext);

	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: "/Empresas/GetEmpresaSpecs",
					},
				};
			}
			default:
				return null;
		}
	});

	//#region declaración y carga de empresas
	const [empresas, setEmpresas] = useState({ data: [], selected: null });
	useEffect(() => {
		const empresas = { data: [], selected: null };
		if (authContext.usuario?.empresas)
			empresas.data.push(...authContext.usuario.empresas);
		if (empresas.data.length) empresas.selected = empresas.data[0];
		setEmpresas(empresas);
	}, [authContext.usuario]);
	//#endregion

	//#region declaración y carga de empresa
	const [empresa, setEmpresa] = useState({
		loading: null,
		params: {},
		data: {},
		error: null,
	});
	useEffect(() => {
		if (!empresa.loading) return;
		const result = { loading: null, data: null, error: null };
		pushQuery({
			action: "GetEmpresa",
			params: empresa.params,
			onOk: (data) => (result.data = data),
			onError: (error) => (result.error = error),
			onFinally: () => {
				dispatch(handleEmpresaSeleccionar(result.data));
				setEmpresa((o) => ({ ...o, ...result }));
			},
		});
	}, [empresa, pushQuery, dispatch]);
	// Cargo empresa cuando cambia la selección de empresas
	useEffect(() => {
		const empresa = {
			loading: null,
			params: { cuit: empresas.selected?.cuitEmpresa },
			data: {},
			error: null,
		};
		if (empresa.params.cuit) empresa.loading = "Cargando...";
		setEmpresa((o) => ({ ...o, ...empresa }));
	}, [empresas.selected?.cuitEmpresa]);
	//#endregion

	//#region declaracion y carga de acciones
	const [acciones, setAcciones] = useState([]);
	useEffect(() => {
		const acciones = [];
		const addAction = (
			name = "",
			onExecute = (name) => {},
			keys = "",
			combination = "AltKey"
		) =>
			acciones.push(
				new Action({
					name,
					onExecute,
					keys,
					underlineindex: name.toLowerCase().indexOf(keys),
					combination,
				})
			);
		const desc = ((r) =>
			[Formato.Cuit(r?.cuit), r?.razonSocial].filter((r) => r).join(" - "))(
			empresa.data
		);
		if (desc) {
			addAction(
				`Establecimientos de ${desc}`,
				(_) => navigate("Establecimientos"),
				"s"
			);
			addAction(
				`Liquidaciones de ${desc}`,
				(_) => navigate("Liquidaciones"),
				"q"
			);
		}
		dispatch(handleModuloSeleccionar({ nombre: "SIARU", acciones }));
		setAcciones(acciones);
	}, [empresa.data, dispatch, navigate]);
	//#endregion

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				<Grid
					col
					full
					style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
				>
					<Grid full="width">
						<h2 className="subtitulo">Empresas</h2>
					</Grid>
					<Grid full="width" col grow gap="5px">
						<Grid grow>
							<EmpresasList
								data={empresas.data}
								selection={{
									selected: [empresas.selected?.cuitEmpresa].filter((r) => r),
									onSelect: (selected) =>
										setEmpresas((o) => ({ ...o, selected })),
								}}
							/>
						</Grid>
						<EmpresaDetails />
						<KeyPress items={acciones} />
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default SiaruHandler;
