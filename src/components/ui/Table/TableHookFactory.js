import React, { useCallback, useEffect, useState } from "react";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import { pick } from "components/helpers/Utils";
import useQueryQueue, { QueryClass } from "components/hooks/useQueryQueue";
import Table from "./Table";

/**
 * Selecciona el primer registro.
 * @param {object} params
 * @param {array} params.data
 * @param {boolean} params.multi Si es seleccion múltiple.
 * @param {object} params.record Registro/s sleccionado/s.
 * @param {string} params.key Identificador de registro
 * @returns {object} Registro/s sleccionado/s.
 */
export const onLoadSelectFirst = ({ data, multi, record, key = "id" }) => {
	if (multi) {
		let retorno = data.filter((d) =>
			AsArray(record).find((r) => r[key] === d[key])
		);
		if (retorno.length === 0) retorno = [data.at(0)].filter((r) => r);
		return retorno.length ? retorno : null;
	}
	return data.find((r) => r[key] === (record ?? {})[key]) ?? data.at(0);
};

/**
 * Vuelve a seleccionar el mismo.
 * @param {object} params
 * @param {array} params.data
 * @param {boolean} params.multi Si es seleccion múltiple.
 * @param {object} params.record Registro/s sleccionado/s.
 * @param {string} params.key Identificador de registro
 * @returns {object} Registro/s sleccionado/s.
 */
export const onLoadSelectSame = ({ data, multi, record, key = "id" }) => {
	if (multi) {
		let retorno = data.filter((d) =>
			AsArray(record).find((r) => r[key] === d[key])
		);
		return retorno.length ? retorno : null;
	}
	return data.find((r) => r[key] === (record ?? {})[key]);
};

/**
 * Mantiene la seleccion.
 * @param {object} params
 * @param {array} params.data
 * @param {boolean} params.multi Si es seleccion múltiple.
 * @param {object} params.record Registro/s sleccionado/s.
 * @param {string} params.key Identificador de registro
 * @returns {object} Registro/s sleccionado/s.
 */
export const onLoadSelectKeep = ({ record }) => record;

/**
 * Callback cuando cambia los datos que se despliegan
 * @param {array} data Nuevos datos.
 */
export const onDataChange = (data) => {};

/**
 *
 * @param {object} [params]
 * @param {object} [params.edit] Datos en el formulario.
 * @param {string} [params.request] Requerimiento. Ej: "A", "M", "B"
 * @param {object} [params.changes] Cambios realizados.
 * @returns Si confirma o cancela los cambios
 */
const onEditChange = (params = {}) => true;

/**
 *
 * @param {object} [params]
 * @param {object} [params.edit] Datos en el formulario.
 * @param {string} [params.request] Requerimiento. Ej: "A", "M", "B"
 * @param {object} [params.errors] Errores detectados. (Agregar a este objeto los errores detectados)
 * @returns Si confirma o cancela los cambios
 */
const onEditValidate = (params = {}) => {};

/**
 *
 * @param {object} [params]
 * @param {object} [params.edit] Datos en el formulario.
 * @param {string} [params.request] Requerimiento. Ej: "A", "M", "B"
 * @param {object} [params.response] Errores detectados. (Agregar a este objeto los errores detectados)
 * @returns Si confirma o cancela los cambios
 */
const onEditComplete = (params = {}) => {};

const TableHookFactoryParams = {
	remote: false,
	key: "id",
	params: {},
	data: [],
	loading,
	error,
	multi: false,
	pagination: null,
	onLoadSelect: onLoadSelectFirst,
	onDataChange,
	onEditChange,
	onEditValidate,
	onEditComplete,
};

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	apply: [],
	errors: null,
};

/**
 *
 * @param {object} [props]
 * @param {TableHookFactoryParams} [props.init] Configuraciones iniciales
 * @param {(type: string, payload?: object) => void} [props.tableProps] Propiedades de la grilla
 * @param {(props: object) => JSX.Element} [props.tableRender] Render de grilla
 * @param {(params: { data: object, request: string, title: string, errors: object }) => JSX.Element} [props.formRender] Render de formulario
 * @param {string[]} [props.requests] Operaciones permitidas
 * @param {(action: string, params?: object) => { config: { baseURL: string, method: string, endpoint: string }, params: object }} [props.queryConfig] Configuracion de consultas
 * @param {(config: { params: object, pagination: object }) => QueryClass} [props.getLoadQuery] Consulta de carga de grilla
 * @param {(request: string, data: object) => QueryClass} [props.getQuery] Consulta de mutaciones
 * @returns {{ request: (type: string, payload?: object) => void, render: () => JSX.Element, selected: object }}
 */
const TableHookFactory = ({
	init = TableHookFactoryParams,
	tableProps = () => ({}),
	tableRender = (props) => <Table {...props} />,
	formRender = () => <></>,
	requests = ["A", "M", "B"],
	queryConfig = () => null,
	getLoadQuery = () => null,
	getQuery = () => null,
} = {}) => {
	init = { ...TableHookFactoryParams, ...init };
	const pushQuery = useQueryQueue(queryConfig);

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		key: init.key,
		remote: init.remote,
		params: init.params,
		pagination: init.pagination,
		getLoadQuery,
		loadingOverride: init.loading,
		data: init.data,
		error: init.error,
		selection: {
			...selectionDef,
			multi: init.multi,
		},
		onLoadSelect:
			init.onLoadSelect === onLoadSelectFirst && init.multi
				? onLoadSelectSame
				: init.onLoadSelect,
		onDataChange: init.onDataChange ?? onDataChange,
		onEditChange: init.onEditChange ?? onEditChange,
		onEditValidate: init.onEditValidate ?? onEditValidate,
		onEditComplete: init.onEditComplete ?? onEditComplete,
	});

	useEffect(() => {
		if (!list.loading) return;
		const changes = {
			loading: null,
			error: null,
			data: [],
		};
		if (!list.remote) {
			const data = list.data;
			const error = list.error;
			const multi = list.selection.multi;
			const record = list.selection.record;
			const key = list.key;
			changes.data = data;
			changes.error = error;
			changes.selection = {
				...list.selection,
				...selectionDef,
				record: list.onLoadSelect({ data, multi, record, key }),
			};

			changes.selection.index = multi
				? changes.selection.record?.map((r) => changes.data.indexOf(r))
				: changes.data.indexOf(changes.selection.record);
			setList((o) => ({ ...o, ...changes }));
			return;
		}

		const loadQuery = list.getLoadQuery({
			params: { ...list.params },
			pagination: { ...list.pagination },
		});
		if (!loadQuery) return;
		const onOk = loadQuery.onOk;
		const onError = loadQuery.onError;
		const onFinally = loadQuery.onFinally;
		loadQuery.onOk = async (ok) => {
			let { data, pagination } = {};
			if (list.pagination) {
				({ data, ...pagination } = ok);
			} else {
				data = ok;
			}
			if (!Array.isArray(data)) {
				console.error("Se esperaba un arreglo", data);
			} else {
				changes.data = data;
				const multi = list.selection.multi;
				const record = list.selection.record;
				changes.selection = {
					...list.selection,
					...selectionDef,
					record: list.onLoadSelect({ data, multi, record, key }),
				};

				changes.selection.index = multi
					? changes.selection.record?.map((r) => changes.data.indexOf(r))
					: changes.data.indexOf(changes.selection.record);

				list.onDataChange(changes.data);
			}
			if (onOk) onOk(ok);
		};
		loadQuery.onError = async (error) => {
			if (error.code !== 404) {
				changes.error = error.toString();
				changes.selection = { ...list.selection, ...selectionDef };
			}
			if (onError) onError(error);
		};
		loadQuery.onFinally = async () => {
			setList((o) => ({ ...o, ...changes }));
			if (onFinally) onFinally();
		};
		pushQuery(loadQuery);
	}, [pushQuery, list]);
	//#endregion

	const request = useCallback((type, payload = {}) => {
		switch (type) {
			case "selected": {
				return setList((o) => {
					const apply = [];
					if (payload.request !== "A") {
						apply.push(
							...AsArray(
								"record" in payload ? payload.record : o.selection.record,
								true
							)
								.map((r) => r[o.key])
								.filter((r) => r)
						);
					}
					return {
						...o,
						selection: {
							...o.selection,
							request: payload.request,
							action: payload.action,
							edit: {
								...(payload.request === "A"
									? {}
									: JoinOjects(o.selection.record)),
								...JoinOjects(payload.record),
							},
							apply,
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
						loadingOverride: payload.loading,
						error: payload.error,
						onLoadSelect:
							"onLoadSelect" in payload ? payload.onLoadSelect : o.onLoadSelect,
						selection: {
							...o.selection,
							multi: "multi" in payload ? !!payload.multi : o.selection.multi,
						},
					};
					if (payload.params)
						changes.params = {
							...pick(payload.params, init.params),
							...payload.params,
						};
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

	let form = null;
	if (list.selection.edit) {
		form = formRender({
			data: list.selection.edit,
			request: list.selection.request,
			title: list.selection.action,
			errors: list.selection.errors,
			apply: (changes) => {
				if (
					!list.onEditChange({
						edit: { ...list.selection.edit },
						changes,
						request: list.selection.request,
					})
				)
					return;

				setList((o) => ({
					...o,
					selection: {
						...o.selection,
						edit: {
							...o.selection.edit,
							...changes,
						},
					},
				}));
			},
			close: (confirm) => {
				if (!requests.includes(list.selection.request)) confirm = false;
				if (!confirm) {
					setList((o) => ({
						...o,
						selection: {
							...o.selection,
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

				const record = { ...list.selection.edit };

				list.onEditValidate({
					edit: record,
					errors,
					request: list.selection.request,
				});

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
							record[list.key] =
								(Math.max(0, ...changes.data.map((r) => r[list.key])) ?? 0) + 1;
							changes.data.push(record);
							break;
						}
						case "M": {
							changes.selection = {
								...list.selection,
								...selectionDef,
								index: list.selection.index,
								record: list.selection.record,
							};
							AsArray(list.selection.apply).forEach((id) => {
								const index = changes.data.findIndex((r) => r[list.key] === id);
								if (index < 0) return;
								const r = { ...changes.data.at(index), ...record };
								if (changes.selection.multi) {
									changes.selection.index ??= [];
									changes.selection.record ??= [];
									const i = changes.selection.record.findIndex(
										(r) => r[list.key] === id
									);
									if (i < 0) {
										changes.selection.index.push(index);
										changes.selection.record.push(r);
									} else {
										changes.selection.index[i] = index;
										changes.selection.record[i] = r;
									}
								} else {
									changes.selection.index = index;
									changes.selection.record = r;
								}
								changes.data.splice(index, 1, r);
							});
							break;
						}
						case "B": {
							changes.selection = {
								...list.selection,
								...selectionDef,
								index: list.selection.index,
								record: list.selection.record,
							};
							AsArray(list.selection.apply).forEach((id) => {
								const index = changes.data.findIndex((r) => r[list.key] === id);
								if (index < 0) return;
								const r = {
									...changes.data.at(index),
									deletedDate: dayjs().format("YYYY-MM-DD"),
									deletedObs: record.deletedObs,
								};
								if (changes.selection.multi) {
									const i = changes.selection.record.findIndex(
										(r) => r[list.key] === id
									);
									if (i < 0) {
										changes.selection.index.push(index);
										changes.selection.record.push(r);
									} else {
										changes.selection.index[i] = index;
										changes.selection.record[i] = r;
									}
								} else {
									changes.selection.index = index;
									changes.selection.record = r;
								}
								changes.data.splice(index, 1, r);
							});
							break;
						}
						default:
							break;
					}
					list.onEditComplete({
						edit: { ...list.selection.edit },
						request: list.selection.request,
						response: record,
					});
					list.onDataChange(changes.data);
					setList((o) => ({ ...o, ...changes }));
					return;
				}

				const query = getQuery({
					request: list.selection.request,
					data: record,
				});
				if (!query) return;
				const onOk = query.onOk;
				query.onOk = async (ok) => {
					list.onEditComplete({
						edit: { ...list.selection.edit },
						response,
						request: list.selection.request,
					});
					request("list");
					if (onOk) onOk(ok);
				};

				pushQuery(query);
			},
		});
	}

	//#region table props
	const myTableProps =
		typeof tableProps === "function"
			? tableProps({ request, selected: list.selection.record }) ?? {}
			: { ...tableProps };
	myTableProps.key ??= init.key;
	myTableProps.remote ??= list.remote;
	myTableProps.data ??= list.data;
	myTableProps.loading ??= !!list.loading || !!list.loadingOverride;
	myTableProps.noDataIndication =
		list.loading ??
		list.loadingOverride ??
		list.error?.message ??
		myTableProps.noDataIndication ??
		"No existen datos para mostrar";
	const pagination = { ...myTableProps.pagination };
	myTableProps.pagination = {
		...pagination,
		...list.pagination,
		onchange: ({ index, size }) => {
			setList((o) => ({
				...o,
				loading: "Cargando...",
				pagination: { index, size },
				data: o.remote ? [] : o.data,
			}));
			if (typeof pagination.onchange === "function")
				pagination.onchange({ index, size });
		},
	};
	const selection = { ...myTableProps.selection };
	myTableProps.selection = {
		...selection,
		mode: list.selection.multi ? "checkbox" : "radio",
		selected: AsArray(list.selection.record, !list.selection.multi)
			.filter((r) => r)
			.map((r) => r[list.key]),
		onSelect: (record, isSelect, rowIndex, e) => {
			if (rowIndex != null) {
				setList((o) => {
					let index = o.data.findIndex((r) => r.id === record.id);
					if (o.selection.multi) {
						const newIndex = [];
						const newRecord = [];
						o.selection.record?.forEach((r, i) => {
							if (!isSelect && r[list.key] === record[list.key]) return;
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
			}
			if (typeof selection.onSelect === "function")
				selection.onSelect(record, isSelect, rowIndex, e);
		},
		onSelectAll: (isSelect, rows, e) => {
			if (list.selection.multi) {
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
			}
			if (typeof selection.onSelectAll === "function")
				selection.onSelectAll(isSelect, rows, e);
		},
	};
	//#endregion table props

	const render = () => {
		<>
			{tableRender(myTableProps)}
			{form}
		</>;
	};

	return { render, request, selected: list.selection.record };
};

export default TableHookFactory;
