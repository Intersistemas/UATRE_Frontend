import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import DocumentacionTable from "./DocumentacionTable";
import DocumentacionForm from "./DocumentacionModal";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	errors: null,
};

const useDocumentaciones = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetTipoList": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefTipoDocumentacion/GetAll`,
						method: "GET",
					},
				};
			}
			case "GetList": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DocumentacionEntidad/GetBySpec`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DocumentacionEntidad`,
						method: "POST",
					},
				};
			}
			case "Update": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DocumentacionEntidad/${id}`,
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
						endpoint: `/DocumentacionEntidad/${id}`,
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

	//#region declaracion y carga list tipos documentacion
	const [tipoDocumentacionList, setTipoDocumentacionList] = useState({
		loading: "Cargando..",
		data: [],
		error: {},
	});
	useEffect(() => {
		if (!tipoDocumentacionList.loading) return;
		pushQuery({
			action: "GetTipoList",
			onOk: async (res) => setTipoDocumentacionList({ data: res }),
			onError: async (err) => {
				const newList = { data: [] };
				if (err.code !== 404) newList.error = err;
				setTipoDocumentacionList(newList);
			},
		});
	}, [pushQuery, tipoDocumentacionList.loading]);
	//#endregion

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		params: {},
		data: [],
		error: null,
		selection: {...selectionDef},
	});

	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: "GetList",
			params: { ...list.params },
			onOk: async (data) =>
				setList((o) => {
					const selection = {
						action: "",
						request: "",
						record:
							data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
					};
					if (selection.record)
						selection.index = data.indexOf(selection.record);
					return {
						...o,
						loading: null,
						data,
						error: null,
						selection,
					};
				}),
			onError: async (err) =>
				setList((o) => ({
					...o,
					loading: null,
					data: [],
					error: err.code === 404 ? null : err,
					selection: {...selectionDef},
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
						record: {
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
						selection: {...selectionDef},
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
	if (list.selection.request) {
		form = (
			<DocumentacionForm
				data={list.selection.record}
				title={list.selection.action}
				errors={list.selection.errors}
				dependecies={{ tipoDocumentacionList: tipoDocumentacionList.data }}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								refTipoDocumentacionId: true,
								archivo: true,
								observaciones: true,
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
							record: {
								...o.selection.record,
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
								...o.selection,
								request: "",
								action: "",
								record: o.data.at(o.selection.index),
								errors: null,
							},
						}));
						return;
					}

					const record = { ...list.selection.record };

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						// if (!record.deletedObs)
						// 	errors.deletedObs = "Dato requerido";
					} else {
						if (!record.refTipoDocumentacionId)
							errors.refTipoDocumentacionId = "Dato requerido";
						if (!record.archivo) errors.archivo = "Dato requerido";
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
							query.config.body = record.bajaObservacion;
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
			<DocumentacionTable
				tipoList={tipoDocumentacionList.data}
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
								action: "",
								request: "",
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

export default useDocumentaciones;
