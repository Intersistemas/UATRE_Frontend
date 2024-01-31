import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import JoinOjects from "components/helpers/JoinObjects";
import AsArray from "components/helpers/AsArray";
import dayjs from "dayjs";
import LocalidadesForm from "./LocalidadesForm";
import LocalidadesTable from "./LocalidadesTable";

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

export const onLoadSelectKeepOrFirst = ({ data, multi, record }) =>
	record ? record : onLoadSelectFirst({ data, multi, record });

export const onDataChangeDef = (data = []) => {};

const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) =>
	true;
const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
const onEditCompleteDef = ({
	edit = {},
	response = null,
	request = "",
} = {}) => {};

const useLocalidades = ({
	remote: remoteInit = true,
	data: dataInit = [],
	loading,
	error,
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 15 },
	onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
	onDataChange: onDataChangeInit = onDataChangeDef,
	onEditChange: onEditChangeInit = onEditChangeDef,
	onEditValidate: onEditValidateInit = onEditValidateDef,
	onEditComplete: onEditCompleteInit = onEditCompleteDef,
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
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/RefLocalidad/GetRefLocalidadesPaginationSpecs`,
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "POST",
						endpoint: `/RefLocalidad`,
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "PUT",
						endpoint: `/RefLocalidad`,
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "PATCH",
						endpoint: `/RefLocalidad/DarDeBaja`,
					},
				};
			}
			case "Reactivate": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "PATCH",
						endpoint: `/RefLocalidad/Reactivar`,
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region declaración y carga de dependencias

	//#endregion

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		remote: remoteInit,
		loadingOverride: loading,
		params: { sortBy: "nombre" },
		pagination: { index: 1, size: 15, ...paginationInit },
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
		onEditChange: onEditChangeInit ?? onEditChangeDef,
		onEditValidate: onEditValidateInit ?? onEditValidateDef,
		onEditComplete: onEditCompleteInit ?? onEditCompleteDef,
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
				pageIndex: list.pagination.index,
				pageSize: list.pagination.size,
			},
			onOk: async ({ index, size, count, data }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
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

				list.onDataChange(changes.data);
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
					const apply = [];
					if (payload.request !== "A") {
						apply.push(
							...AsArray(
								"record" in payload ? payload.record : o.selection.record,
								true
							)
								.map(({ id }) => id)
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
					if (payload.params) changes.params = payload.params;
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
		form = (
			<LocalidadesForm
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								codPostal: true,
								nombre: true,
								provinciaId: true,
								email: true,
								deletedDate: true,
								deletedBy: true,
						  };
					if (list.selection.request !== "B") {
						r.deletedObs = true;
					}
					return r;
				})()}
				hide={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? { deletedDate: true, deletedBy: true, deletedObs: true }
						: {};
					if (list.selection.request === "C") {
						if (!list.selection.record.deletedDate) {
							r.deletedDate = true;
							r.deletedBy = true;
							r.deletedObs = true;
						}
					}
					if (list.selection.request !== "R") r.obs = true;
					return r;
				})()}
				onChange={(edit) => {
					if (
						!list.onEditChange({
							edit: { ...list.selection.edit },
							changes: edit,
							request: list.selection.request,
						})
					)
						return;
					const changes = { edit: { ...edit }, errors: {} };
					const applyChanges = ({ edit, errors } = changes) =>
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								edit: { ...o.selection.edit, ...edit },
								errors: { ...o.selection.errors, ...errors },
							},
						}));
					// if ("domicilioProvinciasId" in edit) {
					// 	if (edit.domicilioProvinciasId) {
					// 		setLocalidades((o) => ({
					// 			...o,
					// 			loading: "Cargando...",
					// 			params: { provinciaId: edit.domicilioProvinciasId },
					// 			data: [],
					// 			error: null,
					// 		}));
					// 	} else {
					// 		changes.errors.domicilioProvinciasId =
					// 			"Debe seleccionar una provincia";
					// 	}
					// }
					applyChanges();
				}}
				onClose={(confirm) => {
					if (!["A", "B", "M", "R"].includes(list.selection.request))
						confirm = false;
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

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						if (!record.deletedObs) errors.deletedObs = "Dato requerido";
					} else if (list.selection.request === "R") {
					} else {
						if (!record.codPostal) errors.codPostal = "Dato requerido";
						if (!record.nombre) errors.nombre = "Dato requerido";
						if (!record.provinciaId) errors.provinciaId = "Dato requerido";
					}

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
								record.id =
									(Math.max(0, ...changes.data.map((r) => r.id)) ?? 0) + 1;
								changes.data.push(record);
								break;
							}
							case "M": {
								changes.selection = { ...list.selection };
								AsArray(changes.selection.apply).forEach((id) => {
									const index = changes.data.findIndex((r) => r.id === id);
									if (index < 0) return;
									const r = { ...changes.data.at(index), ...record };
									if (changes.selection.multi) {
										changes.selection.index ??= [];
										changes.selection.record ??= [];
										const i = changes.selection.record.findIndex(
											(r) => r.id === id
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
								changes.selection = { ...list.selection };
								AsArray(changes.selection.apply).forEach((id) => {
									const index = changes.data.findIndex((r) => r.id === id);
									if (index < 0) return;
									const r = {
										...changes.data.at(index),
										deletedDate: dayjs().format("YYYY-MM-DD"),
										deletedObs: record.deletedObs,
									};
									if (changes.selection.multi) {
										const i = changes.selection.record.findIndex(
											(r) => r.id === id
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
							response: record,
							request: list.selection.request,
						});
						list.onDataChange(changes.data);
						setList((o) => ({ ...o, ...changes }));
						return;
					}

					const query = {
						config: {},
						onOk: async (response) => {
							if (list.onEditComplete === onEditCompleteDef) {
								request("list");
							} else {
								list.onEditComplete({
									edit: { ...list.selection.edit },
									response,
									request: list.selection.request,
								});
							}
						},
						onError: async (err) =>
							alert(
								typeof err.message === "object"
									? Object.keys(err.message)
											.map((k) => `${k}: ${err.message[k]}`)
											.join("\n")
									: err.message
							),
						onFinally: async () => {
							console.log("onFinally")
						}
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
						case "R": {
							query.action = "Reactivate";
							query.config.body = { id: record.id };
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
			<LocalidadesTable
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
					onSelectAll: (isSelect, rows, e) => {
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
				onTableChange={(type, newState) => {
					switch (type) {
						case "sort": {
							const { sortField, sortOrder } = newState;
							return setList((o) => ({
								...o,
								loading: "Cargando...",
								params: {
									...o.params,
									sortBy: `${sortOrder === "desc" ? "-" : "+"}${sortField}`,
								},
							}));
						}
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

export default useLocalidades;
