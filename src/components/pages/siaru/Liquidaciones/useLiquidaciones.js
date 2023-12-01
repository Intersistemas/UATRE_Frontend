import React, { useCallback, useEffect, useState } from "react";
import AsArray from "components/helpers/AsArray";
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

export const onLoadSelectFirst = ({ data, multi, record }) => {
	const dataArray = AsArray(data);
	if (multi) {
		record = AsArray(record);
		let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
		if (retorno.length === 0) retorno = [dataArray.at(0)].filter((r) => r);
		return retorno.length ? retorno : null;
	}
	return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};

export const onLoadSelectSame = ({ data, multi, record }) => {
	const dataArray = AsArray(data);
	if (multi) {
		record = AsArray(record);
		let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
		return retorno.length ? retorno : null;
	}
	return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};

export const onLoadSelectKeep = ({ record }) => record;

const useLiquidaciones = ({
	remote: remoteInit = true,
	data: dataInit = [],
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 5 },
	onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
	columns,
	hideSelectColumn = true,
	mostrarBuscar = false,
} = {}) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesNomina`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesNomina`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesNomina`,
						method: "PATCH",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesNomina`,
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
		remote: remoteInit,
		params: {},
		pagination: { index: 1, size: 5, ...paginationInit },
		data: [...AsArray(dataInit, true)],
		error: null,
		selection: {
			...selectionDef,
			multi: multiInit,
		},
		onLoadSelect:
			onLoadSelectInit === onLoadSelectFirst && multiInit
				? onLoadSelectSame
				: onLoadSelectInit,
	});

	useEffect(() => {
		if (!list.loading) return;
		const changes = { loading: null, error: null };
		if (!list.remote) {
			const data = list.data;
			const multi = list.selection.multi;
			const record = list.selection.record;
			changes.data = data;
			changes.selection = {
				...list.selection,
				...selectionDef,
				record: list.onLoadSelect({ data, multi, record }),
			};

			changes.selection.index = multi
				? changes.selection.record?.map((r) => changes.data.indexOf(r))
				: changes.data.indexOf(changes.selection.record);
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
				data = changes.data;
				const multi = list.selection.multi;
				const record = list.selection.record;
				changes.pagination = { index, size, count };
				changes.selection = {
					...list.selection,
					...selectionDef,
					record: list.onLoadSelect({ data, multi, record }),
				};

				changes.selection.index = multi
					? changes.selection.record?.map((r) => changes.data.indexOf(r))
					: changes.data.indexOf(changes.selection.record);
			},
			onError: async (error) => {
				if (error.code === 404) return;
				changes.error = error;
				changes.selection = { ...list.selection, ...selectionDef };
			},
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, list]);
	//#endregion

	const request = useCallback((type, payload = {}) => {
		switch (type) {
			case "selected": {
				return setList((o) => {
					const record = {};
					AsArray(o.selection.record, !o.selection.multi)
						.filter((r) => r)
						.forEach((r, i) => {
							Object.keys(r).forEach((k) => {
								if (i === 0) {
									record[k] = r[k];
									return;
								}
								if (record[k] === undefined) return;
								if (record[k] === r[k]) return;
								record[k] = undefined;
							});
						});
					return {
						...o,
						selection: {
							...o.selection,
							request: payload.request,
							action: payload.action,
							edit: {
								...(payload.request === "A" ? {} : record),
								...payload.record,
							},
						},
					};
				});
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
						multi: "multi" in payload ? !!payload.multi : o.selection.multi,
						error: null,
						onLoadSelect:
							"onLoadSelect" in payload ? payload.onLoadSelect : o.onLoadSelect,
					};
					if (payload.params) changes.params = payload.params;
					if (payload.pagination)
						changes.pagination = { ...o.pagination, ...payload.pagination };
					if (payload.clear) {
						const data = changes.data;
						const multi = changes.multi;
						const record = o.selection.record;
						changes.selection = {
							...o.selection,
							...selectionDef,
							record: changes.onLoadSelect({ data, multi, record }),
						};
						changes.selection.index = multi
							? changes.selection.record?.map((r) => changes.data.indexOf(r))
							: changes.data.indexOf(changes.selection.record);
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
									!o.selection.multi && o.selection.index > -1
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
								if (list.selection.multi) {
									AsArray(list.selection.record).forEach((r, i) => {
										r = { ...r, ...record };
										list.selection.record[i] = r;
										i = list.selection.index.at(i);
										if (i < 0) return;
										changes.data.splice(i, 1, r);
									});
								} else {
									changes.data.splice(list.selection.index, 1, record);
								}
								break;
							}
							case "B": {
								if (list.selection.multi) {
									AsArray(list.selection.record).forEach((r, i) => {
										r = { ...r, deletedObs: record.deletedObs };
										list.selection.record[i] = r;
										i = list.selection.index.at(i);
										if (i < 0) return;
										changes.data.splice(i, 1, r);
									});
								} else {
									changes.data.splice(list.selection.index, 1, {
										...changes.data.at(list.selection.index),
										deletedObs: record.deletedObs,
									});
								}
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
				columns={columns}
				mostrarBuscar={mostrarBuscar}
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
					mode: list.selection.multi ? "checkbox" : "radio",
					hideSelectColumn: hideSelectColumn,
					selected: AsArray(list.selection.record, !list.selection.multi)
						.filter((r) => r)
						.map((r) => r.id),
					onSelect: (record, isSelect, rowIndex, e) => {
						if (rowIndex == null) return;
						let index = list.data.findIndex((r) => r.id === record.id);
						if (list.selection.multi) {
							const newIndex = [];
							const newRecord = [];
							list.selection.record?.forEach((r, i) => {
								if (!isSelect && r.id === record.id) return;
								newIndex.push(list.selection.index[i]);
								newRecord.push(r);
							});
							if (isSelect && !newIndex.includes(index)) {
								newIndex.push(index);
								newRecord.push(record);
							}
							if (newIndex.length) {
								index = newIndex;
								record = newRecord;
							} else {
								index = null;
								record = null;
							}
						}
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								...selectionDef,
								index,
								record,
							},
						}));
					},
					onSelectAll: (isSelect, rows, e) => {
						if (!list.selection.multi) return;
						let index = [];
						let record = [];
						if (isSelect) {
							list.data.forEach((r, i) => {
								record.push(r);
								index.push(i);
							});
						} else {
							index = null;
							record = null;
						}
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								...selectionDef,
								index,
								record,
							},
						}));
					},
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

	return { render, request, selected: list.selection.record };
};

export default useLiquidaciones;
