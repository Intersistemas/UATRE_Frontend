import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthContext from "store/authContext";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
	handleEmpresaSeleccionar,
} from "redux/actions";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import EmpresaDetails from "./empresas/EmpresaDetails";
import EmpresasList from "./empresas/EmpresasList";
import useQueryQueue from "components/hooks/useQueryQueue";

const SiaruHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const pushQuery = useQueryQueue((action, params) => {
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
	const authContext = useContext(AuthContext);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);

	//#region declaración y carga de lista y detalle de empresas
	const [empresaList, setEmpresaList] = useState({ loading: true });
	const [empresa, setEmpresa] = useState({
		loading: null,
		params: { cuit: 0 },
		data: {},
		error: {},
	});
	useEffect(() => {
		if (!empresa.loading) return;
		pushQuery({
			action: "GetEmpresa",
			params: empresa.params,
			onOk: (res) =>
				setEmpresa((old) => {
					const newEmpresa = {
						...old,
						loading: null,
						data: res,
						error: null,
					};
					dispatch(handleEmpresaSeleccionar(newEmpresa.data));
					return newEmpresa;
				}),
			onError: (err) =>
				setEmpresa((old) => {
					const newEmpresa = {
						...old,
						loading: null,
						data: {},
						error: err,
					};
					dispatch(handleEmpresaSeleccionar(null));
					return newEmpresa;
				}),
		});
	}, [empresa, pushQuery, dispatch]);

	useEffect(() => {
		if (authContext.usuario?.empresas) {
			const empresas = [...authContext.usuario.empresas];
			setEmpresaList({ data: empresas });
			if (empresas.length > 0)
				setEmpresa((old) => ({
					...old,
					loading: "Cargando...",
					params: { cuit: empresas[0].cuitEmpresa },
				}));
		}
	}, [authContext.usuario]);
	//#endregion

	//#region despachar Informar Modulo
	const descEmpresa = [empresa?.data]
		.map((e) =>
			[Formato.Cuit(e?.cuit), e?.razonSocial].filter((r) => r).join(" - ")
		);
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [],
	};
	if (empresa.data) {
		moduloInfo.acciones.push({ name: `Liquidaciones de ${descEmpresa}` });
		moduloInfo.acciones.push({ name: `Establecimientos de ${descEmpresa}` });
	}
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
		switch (moduloAccion) {
			case `Establecimientos de ${descEmpresa}`:
				setRedirect({ to: "Establecimientos" });
				break;
			case `Liquidaciones de ${descEmpresa}`:
				setRedirect({ to: "Liquidaciones" });
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, descEmpresa, dispatch]);
	//#endregion

	const selection = {
		onSelect: (row, _isSelect, _rowIndex, _e) =>
			setEmpresa((old) => ({
				...old,
				loading: "Cargando...",
				params: { cuit: row.cuitEmpresa },
			})),
	};
	if (empresa.params.cuit) selection.selected = [empresa.params.cuit];

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
								loading={empresaList.loading}
								data={empresaList.data}
								selection={selection}
								noData={(() => {
									const rq = empresaList;
									if (rq?.loading) return <h4>Cargando...</h4>;
									if (!rq?.error)
										return <h4>No hay informacion a mostrar</h4>;
									switch (rq.error.code ?? 0) {
										case 0:
											return <h4>{rq.error.message}</h4>;
										default:
											return (
												<h4 style={{ color: "red" }}>
													{"Error "}
													{rq.error.code ? `${rq.error.code} - ` : ""}
													{rq.error.message}
												</h4>
											);
									}
								})()}
							/>
						</Grid>
						<EmpresaDetails />
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default SiaruHandler;
