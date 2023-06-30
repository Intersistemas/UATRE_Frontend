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
		acciones: [{ name: `Empresas` }, { name: `Agrega Establecimiento` }],
	};
	if (establecimiento) {
		moduloInfo.acciones.push({
			name: `Consulta Establecimiento ${estabDesc}`,
		});
		moduloInfo.acciones.push({
			name: `Modifica Establecimiento ${estabDesc}`,
		});
		moduloInfo.acciones.push({
			name: `Baja Establecimiento ${estabDesc}`,
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
			case `Agrega Establecimiento`:
				configForm.record = { empresaId: empresaId };
				configForm.request = "A";
				setForm(<Form {...configForm} />);
				break;
			case `Consulta Establecimiento ${estabDesc}`:
				configForm.request = "C";
				setForm(<Form {...configForm} />);
				break;
			case `Modifica Establecimiento ${estabDesc}`:
				configForm.request = "M";
				setForm(<Form {...configForm} />);
				break;
			case `Baja Establecimiento ${estabDesc}`:
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
				<Grid
					col
					full
					style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
				>
					<Grid full="width">
						<h2 className="subtitulo">
							Establecimientos de {Formato.Cuit(empresa.cuit)}{" "}
							{empresa.razonSocial ?? ""}
						</h2>
					</Grid>
					<Grid full="width" col grow gap="5px">
						<Grid grow>
							<EstablecimientosList
								data={establecimientos}
								onSelect={setEstablecimiento}
							/>
						</Grid>
						<EstablecimientoDetails data={establecimiento} />
						{form}
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default EstablecimientosHandler;
