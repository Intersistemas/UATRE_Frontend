import React, { useEffect, useState } from "react";
import useHttp from "../../../hooks/useHttp";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import EstablecimientoDetails from "./EstablecimientoDetails";
import EstablecimientosList from "./EstablecimientosList";
import Form from "./EstablecimientoForm";
// import styles from "./EstablecimientosHandler.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../redux/actions";

const EstablecimientosHandler = (props) => {
	const location = useLocation();
	const navigate = useNavigate();
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
	const { sendRequest: request } = useHttp();
	const dispatch = useDispatch();

	const recargarEstablecimientos = (despliega = null) => {
		request(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetByEmpresa?EmpresaId=${empresaId}&PageIndex=${pagination.index}&PageSize=${pagination.size}`,
				method: "GET",
			},
			async (res) => {
				setEstablecimientos(res.data);
				setPagination({
					index: res.index,
					size: res.size,
					count: res.count,
					pages: res.pages,
				});
				setEstablecimiento(despliega);
			},
			async (err) => {
				setEstablecimientos([]);
				setEstablecimiento(despliega);
			}
		);
	};

	//#region carga inicial de establecimientos
	useEffect(() => {
		recargarEstablecimientos(establecimiento);
	}, []);

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
		//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
		const configForm = {
			record: establecimiento,
			onCancel: (_request) => setForm(null),
			onConfirm: (_request, _record) => {
				recargarEstablecimientos();
				setForm(null);
			},
		};
		switch (moduloAccion) {
			case `Empresas`:
				navigate("/siaru");
				break;
			case `Agregar Establecimiento`:
				configForm.record = { empresaId: empresaId };
				configForm.request = "A";
				setForm(<Form {...configForm} />);
				break;
			case `Consultar Establecimiento ${estabDesc}`:
				configForm.request = "C";
				setForm(<Form {...configForm} />);
				break;
			case `Modificar Establecimiento ${estabDesc}`:
				configForm.request = "M";
				setForm(<Form {...configForm} />);
				break;
			case `Dar de baja Establecimiento ${estabDesc}`:
				configForm.request = "B";
				setForm(<Form {...configForm} />);
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, empresaId, estabDesc, establecimiento, recargarEstablecimientos, navigate, dispatch]);

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				<Grid col full>
					<Grid full="width">
						<h2 className="subtitulo">
							Establecimientos de {Formato.Cuit(empresa.cuitEmpresa)}{" "}
							{empresa.razonSocial ?? ""}
						</h2>
					</Grid>
					<Grid full="width" grow gap="5px">
						<Grid width="50%">
							<EstablecimientosList
								data={establecimientos}
								onSelect={setEstablecimiento}
							/>
						</Grid>
						<Grid block width="50%" style={{ paddingTop: "75px" }}>
							<EstablecimientoDetails data={establecimiento} />
						</Grid>
						{form}
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default EstablecimientosHandler;
