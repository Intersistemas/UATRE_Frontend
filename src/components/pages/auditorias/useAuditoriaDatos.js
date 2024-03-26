import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AsArray from "components/helpers/AsArray";
import AuditoriaDatosTable from "./AuditoriaDatosTable";
import { pick } from "components/helpers/Utils";

const selectionDef = { index: null, record: null };

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

export const onLoadSelectKeepOrFirst = ({ data, multi, record }) =>
	record ? record : onLoadSelectFirst({ data, multi, record });

export const onDataChangeDef = (data = []) => {};

const useAuditoriaDatos = ({
	remote: remoteInit = true,
	data: dataInit = [],
	params: paramsInit = {},
	loading,
	error,
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 10 },
	onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
	onDataChange: onDataChangeInit = onDataChangeDef,
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
						baseURL: "Auditoria",
						endpoint: `/AuditoriasDatos`,
						method: "GET",
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
		loadingOverride: loading,
		params: { ...paramsInit },
		pagination: { index: 1, size: 10, ...paginationInit },
		data: [...AsArray(dataInit, true)],
		error,
		selection: {
			...selectionDef,
			multi: multiInit,
		},
		onLoadSelect:
			onLoadSelectInit === onLoadSelectFirst && multiInit
				? onLoadSelectSame
				: onLoadSelectInit,
		onDataChange: onDataChangeInit ?? onDataChangeDef,
	});

	useEffect(() => {
		if (!list.loading) return;
		const changes = { loading: null, error: null };
		if (!list.remote) {
			const data = list.data;
			const error = list.error;
			const multi = list.selection.multi;
			const record = list.selection.record;
			changes.data = data;
			changes.error = error;
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
				pageNumber: list.pagination.index,
				pageSize: list.pagination.size,
			},
			config: { errorType: "reponse" },
			onOk: async ({ data, ...pagination }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
				const multi = list.selection.multi;
				const record = list.selection.record;
				changes.pagination = pagination;
				changes.selection = {
					...list.selection,
					...selectionDef,
					record: list.onLoadSelect({ data, multi, record }),
				};

				changes.selection.index = multi
					? changes.selection.record?.map((r) => changes.data.indexOf(r))
					: changes.data.indexOf(changes.selection.record);

				list.onDataChange(changes.data);
			},
			onError: async (error) => {
				if (error.code === 404) return;
				changes.error = error.toString();
				changes.selection = { ...list.selection, ...selectionDef };
			},
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, list]);
	//#endregion

	const request = useCallback((type, payload = {}) => {
		switch (type) {
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
						loadingOverride: payload.loading,
						error: payload.error,
						onLoadSelect:
							"onLoadSelect" in payload ? payload.onLoadSelect : o.onLoadSelect,
						selection: {
							...o.selection,
							multi: "multi" in payload ? !!payload.multi : o.selection.multi,
						},
					};
					if (payload.params) {
						changes.params = {
							...pick(o.params, paramsInit),
							...payload.params,
						};
					}
					if (payload.pagination)
						changes.pagination = { ...o.pagination, ...payload.pagination };
					if (payload.clear) {
						const data = changes.data;
						const multi = changes.selection.multi;
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

	const render = () => (
		<AuditoriaDatosTable
			remote={list.remote}
			data={list.data}
			loading={!!list.loading}
			noDataIndication={
				list.loading ??
				list.loadingOverride ??
				list.error?.message ??
				"No existen datos para mostrar"
			}
			columns={columns}
			mostrarBuscar={mostrarBuscar}
			pagination={{
				...list.pagination,
				onChange: ({ index, size }) =>
					request("list", {
						pagination: { index, size },
						data: list.remote ? [] : list.data,
					}),
			}}
			selection={{
				mode: list.selection.multi ? "checkbox" : "radio",
				hideSelectColumn: hideSelectColumn,
				selected: AsArray(list.selection.record, !list.selection.multi)
					.filter((r) => r)
					.map((r) => r.id),
				onSelect: (record, isSelect, rowIndex, e) => {
					if (rowIndex == null) return;
					setList((o) => {
						let index = o.data.findIndex((r) => r.id === record.id);
						if (o.selection.multi) {
							const newIndex = [];
							const newRecord = [];
							o.selection.record?.forEach((r, i) => {
								if (!isSelect && r.id === record.id) return;
								newIndex.push(o.selection.index[i]);
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
						return {
							...o,
							selection: {
								...o.selection,
								...selectionDef,
								index,
								record,
							},
						};
					});
				},
				onSelectAll: (isSelect) => {
					if (!list.selection.multi) return;
					setList((o) => {
						let index = [];
						let record = [];
						if (isSelect) {
							o.data.forEach((r, i) => {
								record.push(r);
								index.push(i);
							});
						} else {
							index = null;
							record = null;
						}
						return {
							...o,
							selection: {
								...o.selection,
								...selectionDef,
								index,
								record,
							},
						};
					});
				},
			}}
			// onTableChange={(type, newState) => {
			// 	switch (type) {
			// 		case "sort": {
			// 			const { sortField, sortOrder } = newState;
			// 			return setList((o) => ({
			// 				...o,
			// 				loading: "Cargando...",
			// 				params: {
			// 					...o.params,
			// 					orderBy: `${sortField}.${sortOrder}`,
			// 				},
			// 			}));
			// 		}
			// 		default:
			// 			return;
			// 	}
			// }}
		/>
	);
	return { render, request, selected: list.selection.record };
};

export default useAuditoriaDatos;
