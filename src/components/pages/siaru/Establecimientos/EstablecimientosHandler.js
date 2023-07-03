import React, { useEffect, useState } from "react";
import useHttp from "../../../hooks/useHttp";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import EstablecimientoDetails from "./EstablecimientoDetails";
import EstablecimientosList from "./EstablecimientosList";
import Form from "./EstablecimientoForm";
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
	const [form, setForm] = useState(null);
	const { sendRequest } = useHttp();
	const dispatch = useDispatch();
	
	//#region carga inicial de establecimientos
	const [refresh, setRefresh] = useState({ origen: "inicio" });
	const [establecimientos, setEstablecimientos] = useState({ loading: true });
	const [pagination, setPagination] = useState({
		index: 1,
		size: 10,
		onChange: (changes) => setPagination((old) => ({ ...old, ...changes })),
	});
	const [seleccionado, setSeleccionado] = useState(null);
	useEffect(() => {
		if (!refresh) return;

		const finalAction = () => {
			if (refresh) setRefresh(null);
		}

		sendRequest(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetByEmpresa?EmpresaId=${empresaId}&PageIndex=${pagination.index}&PageSize=${pagination.size}`,
				method: "GET",
			},
			async (res) => {
				const data = [...res.data];
				setEstablecimientos({ data: data });
				setPagination((old) => ({
					...old,
					index: res.index,
					size: res.size,
					count: res.count,
					pages: res.pages,
				}));
				if (data.length > 0) setSeleccionado(data[0]);
				finalAction();
			},
			async (err) => {
				setEstablecimientos({ error: err.error });
				setSeleccionado(null);
				finalAction();
			},
		);
	}, [sendRequest, refresh, empresaId, pagination.index, pagination.size]);

	//#region despachar Informar Modulo
	const estabDesc = seleccionado ? `${seleccionado.nombre}` : ``;
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ name: `Empresas` }, { name: `Agrega Establecimiento` }],
	};
	if (seleccionado) {
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
			record: seleccionado,
			onCancel: (_request) => setForm(null),
			onConfirm: (request, record) => {
				setForm(null);
				setRefresh({ origen: "formulario" });
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
	}, [moduloAccion, empresaId, estabDesc, seleccionado, navigate, dispatch]);

	const selection = {
		onSelect: (row, isSelect, rowIndex, e) => setSeleccionado(row),
	}
	if (seleccionado) {
		selection.selected = [seleccionado.id]
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
						<h2 className="subtitulo">
							Establecimientos de {Formato.Cuit(empresa.cuit)}{" "}
							{empresa.razonSocial ?? ""}
						</h2>
					</Grid>
					<Grid full="width" col grow gap="5px">
						<Grid grow>
							<EstablecimientosList
								loading={establecimientos.loading}
								data={establecimientos.data}
								pagination={pagination}
								selection={selection}
							/>
						</Grid>
						<EstablecimientoDetails data={seleccionado} />
						{form}
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default EstablecimientosHandler;
