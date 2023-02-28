import React, { useEffect, useState } from "react";
import useHttp from "../../../hooks/useHttp";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import EstablecimientoDetails from "./EstablecimientoDetails";
import EstablecimientosList from "./EstablecimientosList";
import Form from "./EstablecimientoForm";
import styles from "./EstablecimientosHandler.module.css";
import { redirect, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../redux/actions";

const EstablecimientosHandler = (props) => {
	const location = useLocation();
	const empresa = location.state?.empresa;
	if (empresa?.id == null) redirect("/");

	const empresaId = empresa ? empresa.id : 0;
	const [establecimientos, setEstablecimientos] = useState([]);
	const [pagination, setPagination] = useState({
		index: 1,
		size: 2,
		count: 0,
		pages: 0,
	});
	const [establecimiento, setEstablecimiento] = useState(null);
	const [form, setForm] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();
	const dispatch = useDispatch();

	const recargarEstablecimientos = (despliega = null) => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/EmpresasEstablecimientos/Paginado?EmpresasId=${empresaId}&Page=${pagination.index},${pagination.size}`,
				method: "GET",
			},
			async (response) => {
				setEstablecimientos(response.data);
				setPagination({
					index: response.index,
					size: response.size,
					count: response.count,
					pages: response.pages,
				});
				setEstablecimiento(despliega);
			}
		);
	};

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ nombre: "Establecimiento Agregar" }],
	};
	if (establecimiento) {
		moduloInfo.acciones = [
			...moduloInfo.acciones,
			{
				nombre: `Establecimiento ${Formato.Entero(
					establecimiento.nroSucursal
				)} Consultar`,
			},
			{
				nombre: `Establecimiento ${Formato.Entero(
					establecimiento.nroSucursal
				)} Modificar`,
			},
			{
				nombre: `Establecimiento ${Formato.Entero(
					establecimiento.nroSucursal
				)} Bajar`,
			},
		];
	}
	dispatch(handleModuloSeleccionar(moduloInfo));
	//#endregion

	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		recargarEstablecimientos();

		//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
		const configForm = {
			data: establecimiento,
			onCancela: () => setForm(null),
			onConfirma: (data) => {
				recargarEstablecimientos(data);
				setForm(null);
			},
		};
		switch (moduloAccion) {
			case `Establecimiento Agregar`:
				configForm.data = { empresasId: empresaId };
				configForm.action = "A";
				setForm(<Form config={configForm} />);
				break;
			case `Establecimiento ${Formato.Entero(
				establecimiento?.nroSucursal
			)} Consultar`:
				configForm.action = "C";
				configForm.onConfirma = (data) => configForm.onCancela();
				setForm(<Form config={configForm} />);
				break;
			case `Establecimiento ${Formato.Entero(
				establecimiento?.nroSucursal
			)} Modificar`:
				configForm.action = "M";
				setForm(<Form config={configForm} />);
				break;
			case `Establecimiento ${Formato.Entero(
				establecimiento?.nroSucursal
			)} Bajar`:
				configForm.action = "B";
				setForm(<Form config={configForm} />);
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [empresaId, pagination.index, pagination.size, moduloAccion]);

	if (isLoading) return <h1>Cargando...</h1>;
	if (error) return <h1>{error}</h1>;
	
	console.log("establecimientos", establecimientos)

	return (
		<Grid col full>
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid full="width">
				<h2 className="subtitulo">Establecimientos</h2>
			</Grid>
			<Grid full="width">
				<h3 className="subtitulo">
					Empresa {Formato.Cuit(empresa.cuit)} {empresa.razonSocial ?? ""}
				</h3>
			</Grid>
			<Grid full="width" grow>
				<Grid width="50%">
					<EstablecimientosList
						config={{
							data: establecimientos,
							onSelect: (r) => setEstablecimiento(r),
						}}
					/>
				</Grid>
				<Grid block width="50%" style={{ paddingLeft: "5px" }}>
					<EstablecimientoDetails config={{ data: establecimiento }} />
				</Grid>
				{form}
			</Grid>
		</Grid>
	);
};

export default EstablecimientosHandler;
