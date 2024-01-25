import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import UsuariosTable from "./UsuariosTable";
import UsuariosForm from "./UsuariosForm";
import AsArray from "components/helpers/AsArray";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	apply: [],
	errors: null,
};

const useUsuarios = ({
	onLoadSelect = ({ data, record }) => AsArray(data)?.find((r) => r?.id === record?.id) ?? AsArray(data)?.at(0),
	remote: remoteInit = true,
} = {}) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/Usuario/GetAll`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/RefDelegacion`,
						method: "POST",
					},
				};
			}
			case "Update": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/RefDelegacion/${id}`,
						method: "PUT",
					},
					params: otherParams,
				};
			}
			case "Delete": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefDelegacion/${id}`,
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
		pagination: { index: 1, size: 15 },
		error: null,
		selection: { ...selectionDef },
		remote: remoteInit,
	});

	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: "GetList",
			params: { 
					...list.params,
					pageIndex: list.pagination.index,
					pageSize: list.pagination.size, 
					},
			onOk: async ({ index, size, count, data }) =>
			(console.log('usuarios_Data',data),
				setList((o) => {
					const selection = {
						...selectionDef,
						record:
							onLoadSelect({ data, record: o.selection.record }),
					};
					if (selection.record)
						selection.index = data.indexOf(selection.record);
					return {
						...o,
						loading: null,
						pagination: { index, size, count },
						data,
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
			<UsuariosForm
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								codigoDelegacion: true,
								nombre: true,
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
					setList((o) => ({
						...o,
						selection: {
							...o.selection,
							edit: {
								...o.selection.edit,
								...changes,
							},
						},
					}))
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
								record:
									o.selection.index > -1
										? o.data.at(o.selection.index)
										: o.selection.record,
							},
						}));
						return;
					}

					const record = list.selection.edit;

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						// if (!record.deletedObs)
						// 	errors.deletedObs = "Dato requerido";
					} else {
						if (!record.codigoDelegacion)
							errors.codigoDelegacion = "Dato requerido";
						if (!record.nombre) errors.nombre = "Dato requerido";
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
							query.action = "Create";
							query.config.body = record;
							break;
						case "M":
							query.action = "Update";
							query.params = { id: record.id };
							query.config.body = record;
							break;
						case "B":
							query.action = "Delete";
							query.params = { id: record.id };
							query.config.body = record.deletedObs;
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
			<UsuariosTable
				remote={true}
				data={list.data}
				loading={!!list.loading}
				noDataIndication={
					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
				}
				pagination={{
					...list.pagination,
					onChange: ({ index, size }) =>
						setList((o) => ({
							...o,
							loading: "Cargando...",
							pagination: { index, size },
							data: o.remote ? [] : o.data,
						})),
				}}
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

export default useUsuarios;
