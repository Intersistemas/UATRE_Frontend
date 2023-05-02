import React, { useEffect, useState } from "react";
import useHttp from "../../../hooks/useHttp";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import EstablecimientoDetails from "./EstablecimientoDetails";
import EstablecimientosList from "./EstablecimientosList";
import Form from "./EstablecimientoForm";
import styles from "./EstablecimientosHandler.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../redux/actions";

const EstablecimientosHandler = (props) => {
	const location = useLocation();
	const empresa = location.state?.empresa;
	if (empresa?.id == null) navigate("/");

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
	const navigate = useNavigate();

	const recargarEstablecimientos = (despliega = null) => {
		request(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetByEmpresa?EmpresaId=${empresaId}&PageIndex=${pagination.index}&PageSize=${pagination.size}`,
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
	const estabDesc = establecimiento ? `${establecimiento.nombre}` : ``;
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ name: `Empresas` }, { name: `Agregar Establecimiento` }],
	};
	if (establecimiento) {
		moduloInfo.acciones.push({
			name: `Consultar Establecimiento ${estabDesc}`,
		});
		moduloInfo.acciones.push({
			name: `Modificar Establecimiento ${estabDesc}`,
		});
		moduloInfo.acciones.push({
			name: `Dar de baja Establecimiento ${estabDesc}`,
		});
	}
	dispatch(handleModuloSeleccionar(moduloInfo));
	//#endregion

	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		recargarEstablecimientos(establecimiento);

		//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
		const configForm = {
			data: establecimiento,
			onCancela: () => setForm(null),
			onConfirma: (_data) => {
				recargarEstablecimientos();
				setForm(null);
			},
		};
		switch (moduloAccion) {
			case `Empresas`:
				navigate("/siaru");
				break;
			case `Agregar Establecimiento`:
				configForm.data = { empresaId: empresaId };
				configForm.action = "A";
				setForm(<Form config={configForm} />);
				break;
			case `Consultar Establecimiento ${estabDesc}`:
				configForm.action = "C";
				configForm.onConfirma = (_data) => configForm.onCancela();
				setForm(<Form config={configForm} />);
				break;
			case `Modificar Establecimiento ${estabDesc}`:
				configForm.action = "M";
				setForm(<Form config={configForm} />);
				break;
			case `Dar de baja Establecimiento ${estabDesc}`:
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

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				<Grid col full>
					<Grid full="width">
						<h2 className="subtitulo">
							Establecimientos de {Formato.Cuit(empresa.cuit)}{" "}
							{empresa.razonSocial ?? ""}
						</h2>
					</Grid>
					<Grid full="width" grow gap="5px">
						<Grid width="50%">
							<EstablecimientosList
								config={{
									data: establecimientos,
									onSelect: (r) => setEstablecimiento(r),
								}}
							/>
						</Grid>
						<Grid block width="50%" style={{ paddingTop: "75px" }}>
							<EstablecimientoDetails config={{ data: establecimiento }} />
						</Grid>
						{form}
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default EstablecimientosHandler;
