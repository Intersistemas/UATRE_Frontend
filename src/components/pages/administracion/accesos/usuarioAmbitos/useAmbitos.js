import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AmbitoTable from "./AmbitosTable";
import AmbitoUsuarioForm from "./UsuarioAmbitoForm";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};
 
const useAmbitos = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		console.log('useAmbitos_action',action," & ",params);
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuarioAmbitos`,
						method: "GET",
					},
				};
			}
			case "GetListByUsuarioId": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuarioAmbitos/GetByUsuarioId`,
						method: "GET",
					},
				};
			}
			case "CreateUA": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosModulosAmbitos`,
						method: "POST",
					},
				};
			}
			case "UpdateUA": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosModulosAmbitos/${id}`,
						method: "PUT",
					},
					params: otherParams,
				};
			}
			case "DeleteUA": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosModulosAmbitos/${id}`,
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
					console.log('ambitos_data',data),
					setList((o) => {
						const selection = {
							...selectionDef,
							record:
								data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
						};
						if (selection.record)
							selection.index = data.indexOf(selection.record);
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
		//console.log('useAmbitos_requestChanges',type,' & ',payload)
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
			<AmbitoUsuarioForm
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								ambitoId: true,
								ambitoTipo: true,
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
						console.log('useAmbitos_onChange',changes)
						const errors = {};
						if (list?.data?.find((t)=> t.ambitoId === changes?.ambitoId && t.ambitoTipo === changes?.ambitoTipo) != null)
						{ 
							 errors.ambitosId = "El Usuario ya posee este Ambito"
							 errors.ambitoExiste = true
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

					if (!record.ambitoId) errors.ambitoId = "Dato requerido";
					if (!record.ambitoTipo) errors.ambitoTipo = "Dato requerido";

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
							query.action = "CreateUA";
							query.config.body = record;
							break;
						case "M":
							query.action = "UpdateUA";
							query.params = { id: record.id };
							query.config.body = record;
							break;
						case "B":
							query.action = "DeleteUA";
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
			<AmbitoTable
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

export default useAmbitos;
