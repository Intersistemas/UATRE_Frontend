import React, { useState, useEffect, useContext } from "react";
import useHttp from "../../hooks/useHttp";
import Grid from "../../ui/Grid/Grid";
import Formato from "../../helpers/Formato";
import EmpresaDetails from "./Empresas/EmpresaDetails";
import EmpresasList from "./Empresas/EmpresasList";
import styles from "./SiaruHandler.module.css";
import { useLocation, useNavigate } from "react-router-dom";
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
	//const authContext = useContext(AuthContext);

	//#region declaración y carga de lista de empresas
	const [empresaList, setEmpresaList] = useState({ loading: true });
	const [empresaRecord, setEmpresaRecord] = useState();
  const location = useLocation();

  useEffect(() => {    
    if (location.state.empresas?.length) {
      setEmpresaList({ data: location.state.empresas });
    }
  }, [location.state.empresas]);
	//#endregion

	//#region declaración y carga de detalles de empresa
	//const [empresa, setEmpresa] = useState({ loading: true });
	/*useEffect(() => {
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
	}, [empresaRecord, request]);*/
	//#endregion

	//#region despachar Informar Modulo
	const descEmpresa = empresaRecord
		? `${Formato.Cuit(empresaRecord.cuitEmpresa)} - ${empresaRecord.razonSocial}`
		: ``;
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [],
	};
	if (empresaRecord) {
		moduloInfo.acciones.push({ name: `Establecimientos de ${descEmpresa}` });
		moduloInfo.acciones.push({ name: `Liquidaciones de ${descEmpresa}` });
	}
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
		switch (moduloAccion) {
			case `Establecimientos de ${descEmpresa}`:
				navigate("/siaru/establecimientos", {
					state: { empresa: empresaRecord },
				});
				break;
			case `Liquidaciones de ${descEmpresa}`:
				navigate("/siaru/liquidaciones", { state: { empresa: empresaRecord } });
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, descEmpresa, empresaRecord, navigate, dispatch]);
	//#endregion

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				<Grid col full>
					<Grid full="width">
						<h2 className="subtitulo">Empresas</h2>
					</Grid>
					<Grid full="width" grow gap="5px">
						<Grid width="50%">
							<EmpresasList
								config={{
									loading: empresaList.loading,
									data: empresaList.data,
									noData: (() => {
										const rq = empresaList;
										if (rq?.loading) return <h4>Cargando...</h4>;
										if (!rq?.error)
											return <h4>No hay informacion a mostrar</h4>;
										switch (rq.error.type) {
											case "Body":
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
									})(),
									onSelect: (r) => setEmpresaRecord(r),
								}}
							/>
						</Grid>
						<Grid block width="50%" style={{ paddingTop: "75px" }}>
							 <EmpresaDetails config={{ data: empresaRecord }} />
						</Grid>
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default SiaruHandler;
