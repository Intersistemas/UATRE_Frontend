import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import useQueryQueue from "components/hooks/useQueryQueue";
import LiquidacionesNominaTable from "./LiquidacionesNominaTable";
import LiquidacionesNominaForm from "./LiquidacionesNominaForm";
import Formato from "components/helpers/Formato";
import ValidarCUIT from "components/validators/ValidarCUIT";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	apply: [],
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

export const onDataChangeDef = (data = []) => {};

const useLiquidacionesNomina = ({
	remote: remoteInit = true,
	data: dataInit = [],
	loading,
	error,
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 5 },
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
			case "ConsultaAFIP": {
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: "/AFIPConsulta",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region declaración y carga de dependencias

	//#region declaración y carga de datosAFIP
	const [datosAFIP, setDatosAFIP] = useState({
		loading: null,
		params: { cuit: 0 },
		data: {},
		error: null,
		onLoad: (r) => {},
	});
	useEffect(() => {
		if (!datosAFIP.loading) return;
		const changes = { loading: null, data: {}, error: null, onLoad: (r) => {} };
		pushQuery({
			action: "ConsultaAFIP",
			params: datosAFIP.params,
			onOk: async ({
				apellido = "",
				nombre = "",
				tipoDocumento,
				numeroDocumento,
				domicilios = [],
			}) => {
				changes.data.cuit = datosAFIP.params.cuit;
				changes.data.nombre = [apellido, nombre].filter((r) => r).join(", ");
				changes.data.documento = [tipoDocumento, Formato.DNI(numeroDocumento)]
					.filter((r) => r != null)
					.join(" ");
				changes.data.domicilio = [
					domicilios.find((r) => r.tipoDomicilio === "LEGAL/REAL") ??
						(domicilios.length ? domicilios[0] : {}),
				]
					.map((r) =>
						[r.direccion, r.localidad, r.descripcionProvincia]
							.filter((e) => e)
							.join(" - ")
					)
					.join();
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => {
				datosAFIP.onLoad({ data: changes.data, error: changes.error });
				setDatosAFIP((o) => ({ ...o, ...changes }));
			},
		});
	}, [pushQuery, datosAFIP]);
	//#endregion

	//#endregion

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		remote: remoteInit,
		loadingOverride: loading,
		params: {},
		pagination: { index: 1, size: 5, ...paginationInit },
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
					const edit = {
						...(payload.request === "A" ? {} : JoinOjects(o.selection.record)),
						...JoinOjects(payload.record),
					};
					if (edit.cuil && ValidarCUIT(edit.cuil)) {
						setDatosAFIP((o) => ({
							...o,
							loading: "Cargando...",
							params: { cuit: edit.cuil },
							data: {},
							onLoad: ({ data, error }) => {
								if (error) return;
								if (!data?.nombre) return;
								setList((o) => ({
									...o,
									selection: {
										...o.selection,
										edit: {
											...o.selection.edit,
											nombre: o.selection.edit.nombre
												? o.selection.edit.nombre
												: data.nombre,
										},
									},
								}));
							},
						}));
					} else {
						setDatosAFIP((o) => ({ ...o, data: {} }));
					}
					return {
						...o,
						selection: {
							...o.selection,
							request: payload.request,
							action: payload.action,
							edit,
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
							...changes.selection,
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
			<LiquidacionesNominaForm
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				dependecies={{ datosAFIP }}
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
				onChange={(edit) => {
					const changes = { edit: { ...edit }, errors: {} };
					if ("cuil" in edit) {
						changes.errors.cuil = "";
						if (edit.cuil && `${edit.cuil}`.length === 11) {
							if (ValidarCUIT(edit.cuil)) {
								setDatosAFIP((o) => ({
									...o,
									loading: "Cargando",
									params: { cuit: edit.cuil },
									data: {},
									onLoad: ({ data, error }) => {
										if (error) return;
										if (!data?.nombre) return;
										setList((o) => ({
											...o,
											selection: {
												...o.selection,
												edit: {
													...o.selection.edit,
													nombre: o.selection.edit.nombre
														? o.selection.edit.nombre
														: data.nombre,
												},
											},
										}));
									},
								}));
							} else {
								changes.errors.cuil = "CUIL inválido";
							}
						}
					}
					setList((o) => ({
						...o,
						selection: {
							...o.selection,
							edit: { ...o.selection.edit, ...changes.edit },
							errors: { ...o.selection.errors, ...changes.errors },
						},
					}));
				}}
				onClose={(confirm) => {
					if (!["A", "B", "M"].includes(list.selection.request))
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

					const record = list.selection.edit;

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						// if (!record.deletedObs)
						// 	errors.deletedObs = "Dato requerido";
					} else {
						if (!record.cuil)
							errors.cuil = "Dato requerido";
						else if (!ValidarCUIT(record.cuil))
							errors.cuil = "Dato inválido";
						if (!record.remuneracionImponible)
							errors.remuneracionImponible = "Dato requerido";
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
						list.onDataChange(changes.data);
						setList((o) => ({ ...o, ...changes }));
						return;
					}

					const query = {
						config: {},
						onOk: async () =>
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
			<LiquidacionesNominaTable
				remote={list.remote}
				data={list.data}
				loading={!!list.loading || !!list.loadingOverride}
				noDataIndication={
					list.loading ?? list.loadingOverride ?? list.error?.message ?? "No existen datos para mostrar"
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

export default useLiquidacionesNomina;
