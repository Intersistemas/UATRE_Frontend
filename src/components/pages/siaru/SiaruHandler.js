import React, { useState, useEffect, useContext } from "react";
import useHttp from "../../hooks/useHttp";
import Grid from "../../ui/Grid/Grid";
import Formato from "../../helpers/Formato";
import EmpresaDetails from "./Empresas/EmpresaDetails";
import EmpresasList from "./Empresas/EmpresasList";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../redux/actions";
import AuthContext from "../../../store/authContext";

const SiaruHandler = (props) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { sendRequest: request } = useHttp();
	const authContext = useContext(AuthContext);

	//#region declaración y carga de lista de empresas
	const [empresaList, setEmpresaList] = useState({ loading: true });
	const [empresaRecord, setEmpresaRecord] = useState();

	useEffect(() => {
		if (authContext.usuario?.empresas) {
			const empresas = [...authContext.usuario.empresas];
			setEmpresaList({ data: empresas });
			if (empresas.length > 0) setEmpresaRecord(empresas[0]);
		}
	}, [authContext.usuario]);
	//#endregion

	//#region declaración y carga de detalles de empresa
	const [empresa, setEmpresa] = useState({ loading: true });
	useEffect(() => {
		if (!empresaRecord?.cuitEmpresa) {
			setEmpresa({});
			return;
		}
		request(
			{
				baseURL: "Comunes",
				endpoint: `/Empresas/GetEmpresaSpecs?CUIT=${empresaRecord.cuitEmpresa}`,
				method: "GET",
			},
			async (res) => setEmpresa({ data: res }),
			async (err) => setEmpresa({ error: err })
		);
	}, [empresaRecord, request]);
	//#endregion

	//#region despachar Informar Modulo
	const descEmpresa = empresa.data
		? `${Formato.Cuit(empresa.data.cuit)} - ${empresa.data.razonSocial}`
		: ``;
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
				navigate("/siaru/establecimientos", {
					state: { empresa: empresa.data },
				});
				break;
			case `Liquidaciones de ${descEmpresa}`:
				navigate("/siaru/liquidaciones", {
					state: { empresa: empresa.data },
				});
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, descEmpresa, empresa.data, navigate, dispatch]);
	//#endregion

	const selection = {
		onSelect: (row, isSelect, rowIndex, e) => setEmpresaRecord(row),
	}
	if (empresaRecord) {
		selection.selected = [empresaRecord.cuitEmpresa]
	}

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
						<EmpresaDetails data={empresa.data} />
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default SiaruHandler;
