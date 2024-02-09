import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import EmpresasTable from "./EmpresasTable";
import EmpresasForm from "./EmpresasForm";
import dayjs from "dayjs";
import ValidarCUIT from "components/validators/ValidarCUIT";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import Formato from "components/helpers/Formato";
import { matchIsValidTel } from "mui-tel-input";
import ValidarEmail from "components/validators/ValidarEmail";

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

export const onLoadSelectKeepOrFirst = ({ data, multi, record }) => record ?? onLoadSelectFirst({ data, multi, record });

export const onDataChangeDef = (data = []) => {};

const useEmpresas = ({
	remote: remoteInit = true,
	data: dataInit = [],
	loading,
	error,
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 15 },
	onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
	onDataChange: onDataChangeInit = onDataChangeDef,
	columns,
	hideSelectColumn = true,
	mostrarBuscar = false,
} = {}) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/Empresas/GetEmpresasListSpecs",
						method: "GET",
						/*body: {
							bajas: "false",
							ambitoTodos: Usuario.ambitoTodos,
							ambitoProvincias: Usuario.ambitoProvincias,
							ambitoDelegaciones: Usuario.ambitoDelegaciones,
							ambitoEmpresas: Usuario.ambitoEmpresas,
						 },*/
					},
				};
			}
			case "GetById": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/GetEmpresaSpecs${id}`,
						method: "GET",
					},
					params: otherParams,
				};
			}
			case "GetEmpresaSpecs": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/GetEmpresaSpecs`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactiva": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/Reactivar`,
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
				pageIndex: list.pagination.index,
				pageSize: list.pagination.size,
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

	const request = useCallback(
		(type, payload = {}) => {
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
							...(payload.request === "A"
								? {}
								: JoinOjects(o.selection.record)),
							...JoinOjects(payload.record),
						};
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
								"onLoadSelect" in payload
									? payload.onLoadSelect
									: o.onLoadSelect,
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
				case "GetById": {
					return pushQuery({
						action: "GetById",
						params: { ...payload.params },
						onOk: async (obj) => {
							let data = [];
							data.push(obj);
							setList((o) => {
								const selection = {
									action: "",
									request: "",
									record: data,
								};
								return {
									...o,
									loading: null,
									data,
									error: null,
									selection,
								};
							});
						},
						onError: async (err) =>
							setList((o) => ({
								...o,
								loading: null,
								data: [],
								error: err.code === 404 ? null : err,
								selection: { ...selectionDef },
							})),
					});
				}
				default:
					return;
			}
		},
		[pushQuery]
	);

	let form = null;
	if (list.selection.request) {
		form = (
			<EmpresasForm
				data={(() => { 

					//INIT DE DATOS DEL FORM
				
						return {...list.selection.edit, ...list.selection.request}; //le paso el registro entero  y modifico los campos necesarios segun el request que se está haciendo
					})()
				}

				//data={list.selection.edit}
				
				delegaciones={list.delegaciones}
				title={list.selection.action}
				errors={list.selection.errors}
				// help={list.selection.help}
				loading={!!list.loading}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								cuit: true,
								razonSocial: true,
								claveTipo: true,
								claveEstado: true,
								claveInactivaAsociada: true,
								actividadPrincipalDescripcion: true,
								actividadPrincipalId: true,
								actividadPrincipalPeriodo: true,
								contratoSocialFecha: true,
								cierreMes: true,
								email: true,
								telefono: true,
								domicilioCalle: true,
								domicilioNumero: true,
								domicilioPiso: true,
								domicilioDpto: true,
								domicilioSector: true,
								domicilioTorre: true,
								domicilioManzana: true,
								domicilioProvinciasId: true,
								domicilioLocalidadesId: true,
								domicilioCodigoPostal: true,
								domicilioCPA: true,
								domicilioTipo: true,
								domicilioEstado: true,
								domicilioDatoAdicional: true,
								domicilioDatoAdicionalTipo: true,
								
								ciiU1: true,
								ciiU1Descripcion: true,
								ciiU1EsRural: true,

								ciiU2: true,
								ciiU2Descripcion: true,
								ciiU2EsRural: true,

								ciiU3: true,
								ciiU3Descripcion: true,
								ciiU3EsRural: true,

								localidadDescripcion: true,
								provinciaDescripcion: true,
								esEmpresaRural: true,
						  };
					if (list.selection.request !== "B") r.deletedObs = true;
					r.deletedBy = true;
					r.deletedDate = true;

					return r;
				})()}
				hide={
					["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {}
				}
				onChange={(edit) => {
					const changes = { edit: { ...edit }, errors: {}, help: {} };
					if ("cuit" in edit) {
						changes.errors.cuit = "";
						changes.help.cuit = "";
						if (edit.cuit && `${edit.cuit}`.length === 11) {
							if (ValidarCUIT(edit.cuit)) {
								changes.help.cuit = "Cargando...";
								pushQuery({
									action: "GetEmpresaSpecs",
									params: { cuit: edit.cuit, soloActivos: false },
									onOk: async (record) => {
										const params = { record };
										if (record.deletedDate) {
											params.request = "R";
											params.action = `Reactiva Empresa ${Formato.Cuit(record.cuit)}`;
										} else {
											params.request = "M";
											params.action = `Modifica Empresa ${Formato.Cuit(record.cuit)}`;
										}
										request("selected", params);
									}
								})
							} else {
								changes.errors.cuit = "CUIT inválido";
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
					if (!["A", "B", "M", "R"].includes(list.selection.request)) {
						confirm = false;
					}
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
						if (!record.deletedObs) errors.deletedObs = "Dato requerido";
					}

					if (["A", "M"].includes(list.selection.request)) {
						if (!record.cuit) errors.cuit = "Dato requerido";
						else if (!ValidarCUIT(record.cuit)) errors.cuit = "CUIT Incorrecto";
						if (!record.razonSocial) errors.razonSocial = "Dato requerido";
						if (!record.domicilioCalle)
							errors.domicilioCalle = "Dato requerido";
						if ((record.domicilioProvinciasId ?? 0) === 0)
							errors.domicilioProvinciasId = "Dato requerido";
						if ((record.domicilioLocalidadesId ?? 0) === 0)
							errors.domicilioLocalidadesId = "Dato requerido";
						if (!record.actividadPrincipalDescripcion)
							errors.actividadPrincipalDescripcion = "Dato requerido";
						if (!record.telefono) errors.telefono = "Dato requerido";
						else if (!matchIsValidTel(record.telefono)) errors.telefono = "Dato incorrecto";
						if (!record.email) errors.email = "Dato requerido";
						else if (!ValidarEmail(record.email))
							errors.email = "Dato incorrecto";
						if (record.email2 && !ValidarEmail(record.email2))
							errors.email2 = "Dato incorrecto";

						// if (!record.ciiU1Descripcion) errors.ciiU1Descripcion = "Dato requerido";
						// if (!record.ciiU2Descripcion) errors.ciiU2Descripcion = "Dato requerido";
						// if (!record.ciiU3Descripcion) errors.ciiU3Descripcion = "Dato requerido";

						//if (!record.domicilioLocalidadesId || record.domicilioLocalidadesId === 0) errors.domicilioLocalidadesId = "Dato requerido";
						//if (!record.domicilioProvinciasId || record.domicilioProvinciasId === 0) errors.domicilioProvinciasId = "Dato requerido";
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
						onOk: async (_res) =>
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
							query.config.body = {
								id: record.id,
								deletedObs: record.deletedObs,
							};
							break;
						case "R":
							query.action = "Reactiva";
							//query.params = { id: record.id };
							query.config.body = { id: record.id };
							break;
						default:
							break;
					}
					pushQuery(query);
					//setList((o) => ({ ...o, loading: "Cargando..." }));
				}}
			/>
		);
	}

	const render = () => (
		<>
			<EmpresasTable
				remote={list.remote}
				data={list.data}
				loading={!!list.loading || !!list.loadingOverride}
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
				onTableChange={(type, newState) => {
					switch (type) {
						case "sort": {
							const { sortField, sortOrder } = newState;
							return setList((o) => ({
								...o,
								loading: "Cargando...",
								params: {
									...o.params,
									orderBy: `${sortField}${sortOrder === "desc" ? "Desc" : ""}`,
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

export default useEmpresas;
