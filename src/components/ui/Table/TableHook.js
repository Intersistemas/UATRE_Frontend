import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import { pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import Table from "./Table";

/**
 * @typedef {import('components/ui/Table/Table').TablePagination} TablePagination
 * @typedef {import("components/hooks/useQueryState").UseHttpError} UseHttpError
 */

/** onLoadSelect: Registro a seleccional al cargar
 * @callback onLoadSelect
 * @param {array} data
 * @param {boolean} multi Si es seleccion múltiple.
 * @param {object} record Registro/s sleccionado/s.
 * @param {string} key Identificador de registro
 * @returns {object} Registro/s sleccionado/s.
 */

/** onDataChange: Callback cuando cambia los datos que se despliegan
 * @callback onDataChange
 * @param {array} data Nuevos datos.
 */

/** onEditChange: Callback cuando cambian datos que se están editando
 * @typedef {object} onEditChangeParams
 * @property {object} edit Datos en el formulario.
 * @property {string} request Requerimiento. Ej: "A", "M", "B"
 * @property {object} changes Cambios realizados.
 * 
 * @callback onEditChange
 * @param {onEditChangeParams} params
 * @returns {boolean} Si confirma o cancela los cambios
 */

/** onEditValidate: Callback cuando se confirman los datos que se están editando
 * @typedef {object} onEditValidateParams
 * @property {object} edit Datos en el formulario.
 * @property {string} request Requerimiento. Ej: "A", "M", "B"
 * @property {object} errors Errores detectados. (Agregar a este objeto los errores detectados)
 * 
 * @callback onEditValidate
 * @param {onEditValidateParams} params
 */

/** onEditComplete: Callback cuando se enviaron correctamente los cambios que se están editando.
 * @typedef {object} onEditCompleteParams
 * @property {object} edit Datos en el formulario.
 * @property {string} request Requerimiento. Ej: "A", "M", "B"
 * @property {object} response Respuesta ok del servidor
 * 
 * @callback onEditComplete
 * @param {onEditCompleteParams} params
 */

/** onEditError: Callback cuando ocurrió un error enviando los cambios que se están editando.
 * @typedef {object} onEditErrorParams
 * @property {object} edit Datos en el formulario.
 * @property {string} request Requerimiento. Ej: "A", "M", "B"
 * @property {UseHttpError} response Respuesta error del servidor
 * @property {object} errors Errores detectados. (Agregar a este objeto los errores detectados)
 * 
 * @callback onEditError
 * @param {onEditErrorParams} params
 */

/** TableHookConfig: Configuraciones del hook
 * @typedef {object} TableHookConfig
 * @property {boolean} remote
 * @property {string} key
 * @property {object} params
 * @property {array} data
 * @property {any} loading
 * @property {any} error
 * @property {boolean} multi
 * @property {TablePagination} pagination
 * @property {onLoadSelect} onLoadSelect
 * @property {onDataChange} onDataChange
 * @property {onEditChange} onEditChange
 * @property {onEditValidate} onEditValidate
 * @property {onEditComplete} onEditComplete
 * @property {onEditError} onEditError
 */

/** TableHookReturn: Valores de retorno del hook
 * @typedef {object} TableHookReturn
 * @property {(type: "selected" | "list", payload?: object) => void} request
 * @property {() => JSX.Element} render
 * @property {object} selected
 */

/** Selecciona el primer registro.
 * @type {onLoadSelect}
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

/** Vuelve a seleccionar el mismo.
 * @type {onLoadSelect}
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

/** Mantiene la seleccion.
 * @type {onLoadSelect}
 */
export const onLoadSelectKeep = ({ record }) => record;

/** Mantiene la seleccion. Si no hay seleccionados, selecciona el primero.
 * @type {onLoadSelect}
 */
export const onLoadSelectKeepOrFirst = ({ data, multi, record, key = "id" }) =>
	record ? record : onLoadSelectFirst({ data, multi, record, key });

/** @type {TableHookConfig} */
const TableHookConfigDef = {
	remote: false,
	key: "id",
	params: {},
	data: [],
	multi: false,
	onLoadSelect: onLoadSelectFirst,
	onDataChange: () => {},
	onEditChange: () => true,
	onEditValidate: () => {},
	onEditComplete: () => {},
	onEditError: ({ response }) => alert(response.toString()),
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
 * @param {object} [props]
 * @param {TableHookConfig} [props.config] Configuraciones iniciales
 * @param {(state: { request: (type: string, payload?: object) => void, selected: any }) => object} [props.tableProps] Propiedades de la grilla
 * @param {(props: object) => JSX.Element} [props.tableRender] Render de grilla
 * @param {(params: { data: object, request: string, title: string, errors: object, apply: (changes: object) => void, close: (confirm: boolean) => void }) => JSX.Element} [props.formRender] Render de formulario
 * @param {string[]} [props.requests] Operaciones permitidas
 * @param {(action: string, params?: object) => { config: { baseURL: string, method: string, endpoint: string }, params: object }} [props.queryConfig] Configuracion de consultas
 * @param {(config: { params: object, pagination: TablePagination }) => QueryClass} [props.getListQuery] Consulta de carga de grilla
 * @param {(config: { request: string, data: object }) => QueryClass} [props.getMutationQuery] Consulta de mutaciones
 * @returns {TableHookReturn}
 */
const TableHook = ({
	config: init = { ...TableHookConfigDef },
	tableProps = () => ({}),
	tableRender = (props) => <Table {...props} />,
	requests = ["A", "M", "B"],
	formRender = () => null,
	queryConfig = () => null,
	getListQuery = () => null,
	getMutationQuery = () => null
} = {}) => {
	const config = { ...TableHookConfigDef, ...init };
	const pushQuery = useQueryQueue(queryConfig);

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		config,
		loading: null,
		key: config.key,
		remote: config.remote,
		params: { ...config.params },
		pagination: { ...config.pagination },
		getListQuery,
		loadingOverride: config.loading,
		data: config.data,
		error: config.error,
		selection: {
			...selectionDef,
			multi: config.multi,
		},
		onLoadSelect:
			config.onLoadSelect === onLoadSelectFirst && config.multi
				? onLoadSelectSame
				: config.onLoadSelect,
		onDataChange: config.onDataChange,
		onEditChange: config.onEditChange,
		onEditValidate: config.onEditValidate,
		onEditComplete: config.onEditComplete,
		onEditError: config.onEditError,
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

		const listQuery = list.getListQuery({
			params: { ...list.params },
			pagination: { ...list.pagination },
		});
		if (!listQuery) return;
		const onOk = listQuery.onOk;
		const onError = listQuery.onError;
		const onFinally = listQuery.onFinally;
		listQuery.onOk = async (ok) => {
			let { data, pagination } = {};
			if (list.config.pagination) {
				({ data, ...pagination } = ok);
				changes.pagination = {
					...list.pagination,
					...pagination,
				};
			} else {
				data = ok;
			}
			if (!Array.isArray(data)) {
				console.error("Se esperaba un arreglo", data);
			} else {
				changes.data = data;
				const multi = list.selection.multi;
				const record = list.selection.record;
				const key = list.key;
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
		listQuery.onError = async (error) => {
			if (error.code !== 404) {
				changes.error = error.toString();
				changes.selection = { ...list.selection, ...selectionDef };
			}
			if (onError) onError(error);
		};
		listQuery.onFinally = async () => {
			setList((o) => ({ ...o, ...changes }));
			if (onFinally) onFinally();
		};
		pushQuery(listQuery);
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
					if (payload.params) {
						changes.params = {
							...pick(o.params, o.config.params),
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

				const edit = { ...list.selection.edit };
				const errors = {};

				list.onEditValidate({
					edit,
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
							edit[list.key] =
								(Math.max(0, ...changes.data.map((r) => r[list.key])) ?? 0) + 1;
							changes.data.push(edit);
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
								const r = { ...changes.data.at(index), ...edit };
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
									deletedObs: edit.deletedObs,
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
						response: edit,
					});
					list.onDataChange(changes.data);
					setList((o) => ({ ...o, ...changes }));
					return;
				}

				const query = getMutationQuery({
					request: list.selection.request,
					data: edit,
				});
				if (!query) return;
				const onOk = query.onOk;
				const onError = query.onError;
				query.onOk = async (response) => {
					list.onEditComplete({
						edit: { ...list.selection.edit },
						request: list.selection.request,
						response,
					});
					request("list");
					if (onOk) onOk(response);
				};
				query.onError = async (response) => {
					list.onEditError({
						edit: { ...list.selection.edit },
						request: list.selection.request,
						response,
						errors
					});
					if (Object.keys(errors).length) {
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								errors,
							},
						}));
					}
					if (onError) onError(response);
				};

				pushQuery(query);
			},
		});
	}

	//#region table props
	const myTableProps = tableProps({ request, selected: list.selection.record }) ?? {};
	myTableProps.key ??= config.key;
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
		onChange: ({ index, size }) => {
			request("list", {
				pagination: { index, size },
				data: list.remote ? [] : list.data,
			});
			if (typeof pagination.onChange === "function")
				pagination.onChange({ index, size });
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

	const render = () => (
		<>
			{tableRender(myTableProps)}
			{form}
		</>
	);

	return { render, request, selected: list.selection.record };
};

export default TableHook;
