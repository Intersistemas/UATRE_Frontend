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
import useQueryQueue from "components/hooks/useQueryQueue";
import Form from "./EstablecimientoForm";
import InputMaterial from "components/ui/Input/InputMaterial";

const EstablecimientosHandler = () => {
	const navigate = useNavigate();

	const empresa = useSelector((state) => state.empresa);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);

	useEffect(() => {
		if (!empresa?.id) setRedirect({ to: "Siaru" });
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
					},
				};
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
		params: { empresaId: empresa?.id },
		filter: "",
		sort: "",
		page: { index: 1, size: 10, count: 0 },
		totalBajas: 0,
		seleccion: null,
	});
	useEffect(() => {
		if (!establecimientos.loading) return;
		const params = {
			...establecimientos.params,
			pageIndex: establecimientos.page.index,
			pageSize: establecimientos.page.size,
		};
		if (establecimientos.filter) params.filtro = establecimientos.filter;
		if (establecimientos.sort) params.orderBy = establecimientos.sort;
		pushQuery({
			action: "GetEstablecimientos",
			params: params,
			onOk: async (res) => {
				const data = [...res.data];
				let totalBajas = 0;
				pushQuery({
					action: "GetEstablecimientos",
					params: {
						...params,
						pageIndex: 1,
						pageSize: 1,
						bajas: true,
					},
					onOk: async (resBajas) => (totalBajas = resBajas.count),
					onFinally: () =>
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
							totalBajas: totalBajas,
							seleccion:
								data.find((r) => r.id === old.seleccion?.id) ??
								data.at(0) ??
								null,
						})),
				});
			},
			onError: async (err) => {
				setEstablecimientos((old) => ({
					...old,
					loading: null,
					data: null,
					error: err,
					seleccion: null,
				}));
			},
		});
	}, [establecimientos, pushQuery]);

	//#region despachar Informar Modulo
	const estabDesc = `${establecimientos.seleccion?.nombre ?? ""}`;
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ name: `Agrega Establecimiento` }],
	};
	if (establecimientos.seleccion) {
		moduloInfo.acciones.push({
			name: `Consulta Establecimiento ${estabDesc}`,
		});
		if (establecimientos.seleccion.deletedDate) {
			moduloInfo.acciones.push({
				name: `Reactiva Establecimiento ${estabDesc}`,
			});
		} else {
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
			record: establecimientos.seleccion,
			onCancel: (_request) => setForm(null),
			onConfirm: (request, _record) => {
				setForm(null);
				setEstablecimientos((old) => ({
					...old,
					loading: "Cargando...",
					seleccion: request === "A" ? null : old.seleccion,
				}));
			},
		};
		switch (moduloAccion?.name) {
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
			case `Reactiva Establecimiento ${estabDesc}`:
				// configForm.request = "B";
				// setForm(<Form {...configForm} />);
				alert("Proximamente...");
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, empresa, estabDesc, establecimientos, dispatch]);

	const selection = {
		onSelect: (row, _isSelect, _rowIndex, _e) =>
			setEstablecimientos((old) => ({ ...old, seleccion: row })),
	};
	if (establecimientos.seleccion) {
		selection.selected = [establecimientos.seleccion.id];
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
					<Grid width="full">
						<h2 className="subtitulo">
							Establecimientos de {Formato.Cuit(empresa.cuit)}{" "}
							{empresa.razonSocial ?? ""}
						</h2>
					</Grid>
					<Grid width="full" col grow gap="5px">
						<Grid width="full" justify="between">
							<Grid col height="full" justify="end">
								<h5 style={{ margin: 0 }}>
									Cantidad de establecimientos: {establecimientos.page.count},
									de baja: {establecimientos.totalBajas}
								</h5>
							</Grid>
							<Grid width="260px">
								<InputMaterial
									value={establecimientos.filter}
									placeholder="Ingrese datos de busqueda"
									onChange={(value) =>
										setEstablecimientos((old) => ({
											...old,
											loading: "Cargando...",
											filter: value,
										}))
									}
								/>
							</Grid>
						</Grid>
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
								mostrarBuscar={false}
								onTableChange={(type, newState) => {
									switch (type) {
										case "sort": {
											const { sortField, sortOrder } = newState;
											return setEstablecimientos((old) => ({
												...old,
												loading: "Cargando...",
												sort: `${sortField}.${sortOrder}`,
											}));
										}
										// case "search": {
										// 	const { searchText } = newState;
										// 	return setEstablecimientos((old) => ({
										// 		...old,
										// 		loading: "Cargando...",
										// 		filter: searchText,
										// 	}));
										// }
										default:
											return;
									}
								}}
							/>
						</Grid>
						<EstablecimientoDetails data={establecimientos.seleccion} />
						{form}
					</Grid>
				</Grid>
			</div>
		</>
	);
};

export default EstablecimientosHandler;
