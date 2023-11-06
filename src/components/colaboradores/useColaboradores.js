import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import ColaboradoresTable from "./ColaboradoresTable";
import ColaboradoresForm from "./ColaboradoresForm";

const useColaboradores = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores/GetWithSpecs`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores`,
						method: "POST",
					},
				};
			}
			case "Update": {
				const { id, ...x } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores`,
						method: "PUT",
					},
					params: x,
				};
			}
			case "Delete": {
				const { id, ...x } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores/${id}`,
						method: "DELETE",
					},
					params: x,
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
		pagination: { index: 1, size: 5 },
		data: [],
		error: null,
		selection: { action: "", request: "", index: null, record: null },
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
				setList((o) => {
					const selection = {
						action: "",
						request: "",
						record:
							data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
					};
					if (selection.record) {
						selection.index = data.indexOf(selection.record);
						selection.record = { ...selection.record };
					}
					return {
						...o,
						loading: null,
						pagination: { index, size, count },
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
					selection: { action: "", request: "", index: null, record: null },
				})),
		});
	}, [pushQuery, list]);
	//#endregion

	const requestChanges = useCallback((changes) => {
		switch (changes.type) {
			case "selected":
				return setList((o) => ({
					...o,
					selection: {
						...o.selection,
						request: changes.request,
						action: changes.action,
						record: changes.request === "A" ? {} : o.selection.record,
					},
				}));
			case "list": {
				if (changes.clear)
					return setList((o) => ({
						...o,
						loading: null,
						data: [],
						error: null,
						selection: { action: "", request: "", index: null, record: null },
					}));
				return setList((o) => ({
					...o,
					loading: "Cargando...",
					params: { ...changes.params },
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
			<ColaboradoresForm
				data={list.selection.record}
				title={list.selection.action}
				errores={list.selection.errores}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								afiliadoId: true,
								esAuxiliar: true,
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
						setList((o) => {
							const selection = {
								...o.selection,
								request: "",
								action: "",
								record: o.data.at(o.selection.index),
								errores: null,
							};
							if (selection.record) {
								selection.record = { ...selection.record };
							}
							return { ...o, selection }
						});
						return;
					}

					const record = { ...list.selection.record };
					record.refDelegacionId = list.params.refDelegacionId;

					//Validaciones
					const errores = {};
					if (list.selection.request === "B") {
						// if (!record.deletedObs)
						// 	errores.deletedObs = "Dato requerido";
					} else {
						if (!record.afiliadoId) errores.afiliadoId = "Dato requerido";
						if (record.esAuxiliar == null) errores.esAuxiliar = "Dato requerido";
					}
					if (Object.keys(errores).length) {
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								errores,
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
							// query.params = { id: record.id };
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
			<ColaboradoresTable
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
							data: [],
						})),
				}}
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

export default useColaboradores;
