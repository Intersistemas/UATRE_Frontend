import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "redux/actions";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import EstablecimientoDetails from "./EstablecimientoDetails";
import EstablecimientosList from "./EstablecimientosList";
import Form from "./EstablecimientoForm";
import useQueryQueue from "components/hooks/useQueryQueue";

const EstablecimientosHandler = () => {
	const navigate = useNavigate();
	const empresa = useSelector((state) => state.empresa);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);

	useEffect(() => {
		if (!empresa?.id) setRedirect({ to: "/siaru" });
	}, [empresa]);

	const [form, setForm] = useState(null);

	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetEstablecimientos":
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: "/EmpresaEstablecimientos/GetByEmpresa",
					}
				}
			default:
				return null;
		}
	});
	const dispatch = useDispatch();
	
	//#region carga inicial de establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		loading: "Cargando...",
		data: [],
		error: {},
		filter: { empresaId: empresa?.id, soloActivos: false },
		sort: "-Id",
		page: { index: 1, size: 10 },
	});
	const [seleccionado, setSeleccionado] = useState(null);
	useEffect(() => {
		if (!establecimientos.loading) return;
		pushQuery({
			action: "GetEstablecimientos",
			params: {
				...establecimientos.filter,
				pageIndex: establecimientos.page.index,
				pageSize: establecimientos.page.size,
				sort: establecimientos.sort,
			},
			onOk: async (res) => {
				const data = [...res.data];
				setEstablecimientos((old) => ({
					...old,
					loading: null,
					data: data,
					error: null,
					page: {
						index: res.index,
						size: res.size,
						count: res.count,
					},
				}));
				setSeleccionado(data.length ? data[0] : null);
			},
			onError: async (err) => {
				setEstablecimientos((old) => ({
					...old,
					loading: null,
					data: null,
					error: err,
				}));
				setSeleccionado(null);
			}
		});
	}, [establecimientos, pushQuery]);

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
		if (!seleccionado.refMotivosBajaId) {
			moduloInfo.acciones.push({
				name: `Modifica Establecimiento ${estabDesc}`,
			});
			moduloInfo.acciones.push({
				name: `Baja Establecimiento ${estabDesc}`,
			});
		}
	}
	dispatch(handleModuloSeleccionar(moduloInfo));
	//#endregion

	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
		const configForm = {
			record: seleccionado,
			onCancel: (_request) => setForm(null),
			onConfirm: (_request, _record) => {
				setForm(null);
				setEstablecimientos((old) => ({ ...old, loading: "Cargando..." }));
			},
		};
		switch (moduloAccion) {
			case `Empresas`:
				setRedirect({ to: "/siaru" });
				break;
			case `Agrega Establecimiento`:
				configForm.record = { empresaId: empresa.id };
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
	}, [moduloAccion, empresa, estabDesc, seleccionado, dispatch]);

	const selection = {
		onSelect: (row, _isSelect, _rowIndex, _e) => setSeleccionado(row),
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
								pagination={{
									...establecimientos.page,
									onChange: (changes) =>
										setEstablecimientos((old) => ({
											...old,
											loading: "Cargando...",
											page: { ...old.page, ...changes },
										})),
								}}
								selection={selection}
								onTableChange={(type, {sortOrder, sortField}) => {
									switch (type) {
										case "sort":
											return setEstablecimientos((old) => ({
												...old,
												loading: "Cargando...",
												sort: `${sortOrder === "desc" ? "-" : ""}${sortField}`,
											}));
										default:
											return;
									}
								}}
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
