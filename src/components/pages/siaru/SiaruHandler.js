import React, { useState, useEffect } from "react";
import useHttp from "../../hooks/useHttp";
import Grid from "../../ui/Grid/Grid";
import Formato from "../../helpers/Formato";
import EmpresaDetails from "./Empresas/EmpresaDetails";
import EmpresasList from "./Empresas/EmpresasList";
import styles from "./SiaruHandler.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../redux/actions";

const SiaruHandler = (props) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { sendRequest: request } = useHttp();

	//#region declaración y carga de lista de empresas
	const [empresaList, setEmpresaList] = useState({ loading: true });
	const [empresaRecord, setEmpresaRecord] = useState();
	useEffect(() => {
		request(
			{
				baseURL: "Seguridad",
				endpoint: `/PermisosUsuario`,
				method: "GET",
				headers: {
					Authorization: true,
				},
			},
			async (res) => setEmpresaList({ data: res }),
			async (err) => setEmpresaList({ error: err })
		);
	}, [request]);
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
				baseURL: "SIARU",
				endpoint: `/Empresas/${empresaRecord.cuitEmpresa}`,
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
		moduloInfo.acciones = [
			...moduloInfo.acciones,
			{ nombre: `Establecimientos de ${descEmpresa}` },
			{ nombre: `Liquidaciones de ${descEmpresa}` },
		];
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
				navigate("/siaru/liquidaciones", { state: { empresa: empresa.data } });
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, descEmpresa, empresa.data, navigate, dispatch]);
	//#endregion

	return (
		<Grid col full>
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
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
								if (!rq?.error) return <h4>No hay informacion a mostrar</h4>;
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
					<EmpresaDetails config={{ data: empresa.data }} />
				</Grid>
			</Grid>
		</Grid>
	);
};

export default SiaruHandler;
