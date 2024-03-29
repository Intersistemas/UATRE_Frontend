import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import TareaTable from "./TareaTable";
import TareaUsuarioForm from "./TareaUsuarioForm";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};
 
const useTareas = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		console.log('useTareas_action',action," & ",params);
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/Tareas`,
						method: "GET",
					},
				};
			}
			case "GetListByModuloId": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosModulosTareas/GetByUsuarioId`,
						method: "GET",
					},
				};
			}
			case "GetListByUsuarioId": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosModulosTareas/GetByUsuarioId`,
						method: "GET",
					},
				};
			}
			case "CreateUT": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosModulosTareas`,
						method: "POST",
					},
				};
			}
			case "UpdateUT": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosModulosTareas/${id}`,
						method: "PUT",
					},
					params: otherParams,
				};
			}
			case "DeleteUT": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosModulosTareas/${id}`,
						method: "DELETE",
					},
					params: otherParams,
				};
			}
			default:
				return null;
		}
	});
	//#endregion


	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		params: {},
		data: [],
		error: null,
		selection: { ...selectionDef },
	});

	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: list.params.usuarioId ? "GetListByUsuarioId" : "GetList",
			params: { ...list.params },

			onOk: async (data) =>
				(
					console.log('tareas_data',data),
					setList((o) => {
						const selection = {
							...selectionDef,
							record:
								data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
						};
						if (selection.record)
							selection.index = data.indexOf(selection.record);
						console.log('envia esta tareas_data:',data)
						return {
							...o,
							loading: null,
							data: data,
							error: null,
							selection,
						};
					})
				),
			onError: async (err) =>
				setList((o) => ({
					...o,
					loading: null,
					data: [],
					error: err.code === 404 ? null : err,
					selection: { ...selectionDef },
				})),
		});
	}, [pushQuery, list.loading, list.params]);
	//#endregion

	const requestChanges = useCallback((type, payload = {}) => {
		console.log('useTareas_requestChanges',type,' & ',payload)
		switch (type) {
			case "selected": {
				return setList((o) => ({
					...o,
					selection: {
						...o.selection,
						request: payload.request,
						action: payload.action,
						edit: {
							...(payload.request === "A" ? {} : o.selection.record),
							...payload.record,
						},
					},
				}));
			}
			case "list": {
				if (payload.clear)
					return setList((o) => ({
						...o,
						loading: null,
						data: [],
						error: null,
						selection: { ...selectionDef },
					}));
				return setList((o) => ({
					...o,
					loading: "Cargando...",
					params: { ...payload.params },
					data: [],
				}));
			}
			default:
				return;
		}
	}, []);

	let form = null;
	if (list.selection.edit) {
		form = (
			<TareaUsuarioForm
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								tareasId: true,
								modulosId: true,
								deletedDate: true,
								deletedBy: true
						  };
					if (list.selection.request !== "B") r.deletedObs = true;

					return r;
				})()}
				hide={
					["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {}
				}
				onChange={(changes) =>
					{
						console.log('useTareas_onChange',changes)
						const errors = {};
						if (list?.data?.find((t)=> t.tareasId === changes?.tareasId) != null)
						{ 
							 errors.tareasId = "El Usuario ya posee esta Tarea"
							 errors.tareaExiste = true
						};

						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								errors,
								edit: {
									...o.selection.edit,
									...changes,
								},
							},
						}))
					}
				}
				onClose={(confirm) => {
					if (!["A", "B", "M"].includes(list.selection.request))
						confirm = false;
					if (!confirm) {
						setList((o) => ({
							...o,
							selection: {
								...selectionDef,
								index: o.selection.index,
								record: o.data.at(o.selection.index),
							},
						}));
						return;
					}

					const record = list.selection.edit;
					//Validaciones
					const errors = {};

					if (!record.tareasId) errors.tareasId = "Dato requerido";
					if (!record.modulosId) errors.modulosId = "Dato requerido";

					if (list.selection.request === "B") {
						if (!record.deletedObs) errors.deletedObs = "Dato requerido";
					}
					
					if (Object.keys(errors).length) {
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								errors,
							},
						}));
						return;
					}

					const query = {
						config: {},
						onOk: async (res) =>
							setList((old) => ({ ...old, loading: "Cargando..." })),
						onError: async (err) => alert(err.message),
					};

					switch (list.selection.request) {
						case "A":
							query.action = "CreateUT";
							query.config.body = record;
							break;
						case "M":
							query.action = "UpdateUT";
							query.params = { id: record.id };
							query.config.body = record;
							break;
						case "B":
							query.action = "DeleteUT";
							query.params = { id: record.id };
							//query.config.body = record.bajaObservacion;
							break;
						default:
							break;
					}
					pushQuery(query);
				}}
			/>
		);
	}

	const render = () => (
		<>
			<TareaTable
				data={list.data}
				loading={!!list.loading}
				noDataIndication={
					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
				}
				selection={{
					selected: [list.selection.record?.id].filter((r) => r),
					onSelect: (record, isSelect, index, e) =>
						setList((o) => ({
							...o,
							selection: {
								...selectionDef,
								index,
								record,
							},
						})),
				}}
			/>
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useTareas;
