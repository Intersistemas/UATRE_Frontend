import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "redux/actions";
import useQueryQueue from "components/hooks/useQueryQueue";
import DelegacionesTable from "./DelegacionesTable";
import Grid from "components/ui/Grid/Grid";
import DelegacionesForm from "./DelegacionesForm";

const DelegacionesHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetDelegacionList":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefDelegacion/GetAll`,
						method: "GET",
					},
				};
			case "CreateDelegacion":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefDelegacion`,
						method: "POST",
					},
				};
			case "UpdateDelegacion":
				return (() => {
					const { id, ...otherParams } = params;
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/RefDelegacion/${id}`,
							method: "PUT",
						},
						params: otherParams,
					};
				})();
			case "DeleteDelegacion":
				return (() => {
					const { id, ...otherParams } = params;
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/RefDelegacion/${id}`,
							method: "DELETE",
						},
						params: otherParams,
					};
				})();
			default:
				return null;
		}
	});
	//#endregion

	//#region declaracion y carga delegacionesList
	const [delegacionesList, setDelegacionesList] = useState({
		loading: "Cargando..",
		data: [],
		error: {},
	});
	useEffect(() => {
		if (!delegacionesList.loading) return;
		pushQuery({
			action: "GetDelegacionList",
			onOk: async (res) => setDelegacionesList({ data: res }),
			onError: async (err) => {
				const newDelegacionesList = { data: [] };
				if (err.code !== 404) newDelegacionesList.error = err;
				setDelegacionesList(newDelegacionesList);
			},
		});
	}, [pushQuery, delegacionesList.loading]);
	//#endregion

	//#region declaracion registro seleccionado
	const [selected, setSelected] = useState({
		record: null,
		index: null,
		action: "",
		request: "",
	});
	//#endregion

	//#region sidebar
	const [redirect, setRedirect] = useState({ to: "", options: null });	//De esta forma puedo limpiar moduloInfo antes de cambiar de página
	const moduloInfo = {};
	if (redirect.to) {
		navigate(redirect.to, redirect.options);
	} else {
		moduloInfo.nombre = "Delegaciones";
		moduloInfo.acciones = [
			{ name: "Administración de datos" },
			{ name: "Agrega Delegación" },
		];
	}
	const selectedDesc = (() => {
		if (!moduloInfo.acciones) return "";
		const selectedDesc = selected.record?.id;
		if (!selectedDesc) return "";
		moduloInfo.acciones.push({ name: `Consulta Delegación ${selectedDesc}` });
		moduloInfo.acciones.push({ name: `Modifica Delegación ${selectedDesc}` });
		moduloInfo.acciones.push({ name: `Borra Delegación ${selectedDesc}` });
		return selectedDesc;
	})();

	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		switch (moduloAccion) {
			case "Administración de datos":
				setRedirect({ to: "Administracion" });
				break;
			case "Agrega Delegación":
				setSelected((old) => ({
					...old,
					record: {},
					action: moduloAccion,
					request: "A",
				}));
				break;
			case `Consulta Delegación ${selectedDesc}`:
				setSelected((old) => ({
					...old,
					action: moduloAccion,
					request: "C",
				}));
				break;
			case `Modifica Delegación ${selectedDesc}`:
				setSelected((old) => ({
					...old,
					action: moduloAccion,
					request: "M",
				}));
				break;
			case `Borra Delegación ${selectedDesc}`:
				setSelected((old) => ({
					...old,
					action: moduloAccion,
					request: "B",
				}));
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [dispatch, moduloAccion, selectedDesc]);
	//#endregion

	let form = null;
	if (selected.request) {
		form = (
			<DelegacionesForm
				data={selected.record}
				title={selected.action}
				errores={selected.errores}
				onChange={(changes) =>
					setSelected((old) => ({
						...old,
						record: {
							...old.record,
							...changes,
						},
					}))
				}
				onClose={(confirm) => {
					if (!["A", "B", "M"].includes(selected.request)) confirm = false;
					if (!confirm) {
						setSelected({
							record: { ...delegacionesList.data[selected.index] },
							index: selected.index,
						});
						return;
					}

					const record = { ...selected.record };

					//Validaciones
					const errores = {};
					if (!record.codigoDelegacion)
						errores.codigoDelegacion = "Dato requerido";
					if (!record.nombre) errores.nombre = "Dato requerido";
					if (Object.keys(errores).length) {
						setSelected((old) => ({ ...old, errores: errores }));
						return;
					}

					const query = {
						config: {},
						onOk: async (res) =>
							setDelegacionesList((old) => {
								let newSelected = {};
								const data = [...old.data];
								switch (selected.request) {
									case "A":
										newSelected.index = data.length;
										newSelected.record = {
											...record,
											id: res,
										};
										data.push({ ...newSelected.record });
										break;
									case "M":
										newSelected.index = selected.index;
										newSelected.record = { ...record };
										data.splice(selected.index, 1, record);
										break;
									case "B":
										data.splice(selected.index, 1);
										break;
									default:
										break;
								}
								setSelected(newSelected);
								return { data: data };
							}),
						onError: async (err) => alert(err.message),
					};
					switch (selected.request) {
						case "A":
							query.action = "CreateDelegacion";
							query.config.body = record;
							break;
						case "M":
							query.action = "UpdateDelegacion";
							query.params = { id: record.id };
							query.config.body = record;
							break;
						case "B":
							query.action = "DeleteDelegacion";
							query.params = { id: record.id };
							break;
						default:
							break;
					}
					pushQuery(query);
				}}
			/>
		);
	}

	return (
		<Grid full col>
			<Grid>
				<h1 className="titulo">Delegaciones</h1>
			</Grid>
			<Grid>
				<DelegacionesTable
					data={delegacionesList.data}
					loading={!!delegacionesList.loading}
					noDataIndication={
						delegacionesList.loading ??
						delegacionesList.error?.message ??
						"No existen datos para mostrar"
					}
					selection={{
						onSelect: (row, isSelect, rowIndex, e) =>
							setSelected({
								record: { ...row },
								index: rowIndex,
								request: "",
							}),
					}}
				/>
				{form}
			</Grid>
		</Grid>
	);
};

export default DelegacionesHandler;
