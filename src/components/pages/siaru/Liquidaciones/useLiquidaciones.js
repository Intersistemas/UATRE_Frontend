import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import LiquidacionesTable from "./LiquidacionesTable";
import LiquidacionesForm from "./LiquidacionesForm";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};

const useLiquidaciones = ({
	remote: remoteInit = true,
	data: dataInit = [],
	pagination: paginationInit = { index: 1, size: 5 },
	onLoadSelect: onLoadSelectInit = ({ data, record }) =>
		data.find((r) => r.id === record?.id) ?? data.at(0),
} = {}) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/Liquidaciones`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/Liquidaciones`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/Liquidaciones`,
						method: "PATCH",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/Liquidaciones`,
						method: "PATCH",
					},
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
		pagination: { index: 1, size: 5, ...paginationInit },
		data: [...(Array.isArray(dataInit) ? dataInit : [])],
		error: null,
		selection: { ...selectionDef },
		onLoadSelect: onLoadSelectInit,
	});

	useEffect(() => {
		if (!list.loading) return;
		const changes = { loading: null, error: null };
		if (!list.remote) {
			changes.selection = {
				...selectionDef,
				record: list.onLoadSelect({
					data: list.data,
					record: list.selection.record,
				}),
			};
			if (changes.selection.record)
				changes.selection.index = list.data.indexOf(changes.selection.record);
			setList((o) => ({ ...o, ...changes }));
			return;
		}
		changes.data = [];
		pushQuery({
			action: "GetList",
			params: {
				...list.params,
				page: `${list.pagination.index},${list.pagination.size}`,
			},
			onOk: async ({ index, size, count, data }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data.push(...data);
				changes.pagination = { index, size, count };
				changes.selection = {
					...selectionDef,
					record: list.onLoadSelect({ data, record: list.selection.record }),
				};
				if (changes.selection.record)
					changes.selection.index = data.indexOf(changes.selection.record);
			},
			onError: async (error) => {
				if (error.code === 404) return;
				changes.error = error;
				changes.selection = { ...selectionDef };
			},
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, list]);
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
				return setList((o) => {
					const changes = {
						loading: null,
						data:
							"data" in payload && Array.isArray(payload.data)
								? [...payload.data]
								: payload.clear
								? []
								: o.data,
						error: null,
						onLoadSelect:
							"onLoadSelect" in payload ? payload.onLoadSelect : o.onLoadSelect,
					};
					if (payload.params) changes.params = payload.params;
					if (payload.pagination)
						changes.pagination = { ...o.pagination, ...payload.pagination };
					if (payload.clear) {
						changes.selection = {
							...selectionDef,
							record: changes.onLoadSelect({
								data: changes.data,
								record: o.selection.record,
							}),
						};
						if (changes.selection.record)
							changes.selection.index = changes.data.indexOf(
								changes.selection.record
							);
					} else {
						changes.loading = "Cargando...";
					}
					return { ...o, ...changes };
				});
			}
			default:
				return;
		}
	}, []);

	let form = null;
	if (list.selection.edit) {
		form = (
			<LiquidacionesForm
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								// afiliadoId: true,
								// esAuxiliar: true,
						  };
					if (list.selection.request !== "B") r.deletedObs = true;
					return r;
				})()}
				hide={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {};
					// if (list.selection.request !== "R") r.obs = true;
					return r;
				})()}
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
						// if (!record.afiliadoId)
						// 	errors.afiliadoCUIL = "Debe ingresar un afiliado existente";
						// if (record.esAuxiliar == null) errors.esAuxiliar = "Dato requerido";
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

					if (!list.remote) {
						const changes = {
							loading: "Cargando...",
							data: [...list.data],
						};
						switch (list.selection.request) {
							case "A": {
								record.id =
									(Math.max(...changes.data.map((r) => r.id)) ?? 0) + 1;
								changes.data.push(record);
								break;
							}
							case "M": {
								changes.data.splice(list.selection.index, 1, record);
								break;
							}
							case "B": {
								changes.data.splice(list.selection.index, 1, {
									...changes.data.at(list.selection.index),
									deletedObs: record.deletedObs,
								});
								break;
							}
							default:
								break;
						}
						setList((o) => ({ ...o, ...changes }));
						return;
					}

					const query = {
						config: {},
						onOk: async (res) =>
							setList((o) => ({ ...o, loading: "Cargando..." })),
						onError: async (err) => alert(err.message),
					};
					switch (list.selection.request) {
						case "A": {
							query.action = "Create";
							query.config.body = record;
							break;
						}
						case "M": {
							query.action = "Update";
							query.config.body = record;
							break;
						}
						case "B": {
							query.action = "Delete";
							query.config.body = {
								id: record.id,
								deletedObs: record.deletedObs,
							};
							break;
						}
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
			<LiquidacionesTable
				remote={list.remote}
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
				onTableChange={(type, { sortOrder, sortField }) => {
					switch (type) {
						case "sort":
							return setList((o) => ({
								...o,
								loading: "Cargando...",
								params: {
									...o.params,
									sort: `${sortOrder === "desc" ? "-" : ""}${sortField}`,
								},
							}));
						default:
							return;
					}
				}}
			/>
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useLiquidaciones;
