import React, { useCallback, useEffect, useState, useContext } from "react";
import dayjs from "dayjs";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import { pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import AuthContext from "store/authContext";
import SeccionalesTable from "./SeccionalesTable";
import SeccionalesForm from "./SeccionalesForm";

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
	record ?? onLoadSelectFirst({ data, multi, record });

export const onDataChangeDef = (data = []) => {};

const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) =>
	true;
const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
const onEditCompleteDef = ({ edit = {}, response = null, request = "", } = {}) => {};

const useSeccionales = ({
	remote: remoteInit = true,
	data: dataInit = [],
	loading,
	error,
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 15 },
	params: paramsInit = {
		sort: "+codigo",
		soloActivos: false,
	},
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
	const Usuario = useContext(AuthContext).usuario;

	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: "/Seccional/GetSeccionalesSpecs",
						method: "POST",
					},
				};
			}
			case "GetById": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/${id}`,
						method: "GET",
					},
					params: otherParams,
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactiva": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/Reactivar`,
						method: "PATCH",
					},
				};
			}
			case "Absorbe": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalLocalidad/AbsorbeSeccionalLocalidades`,
						method: "POST",
					},
				};
			}
			case "GetAllDelegaciones": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/RefDelegacion/GetAll",
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
		paramsDef: {
			ambitoTodos: Usuario.ambitoTodos,
			ambitoProvincias: Usuario.ambitoProvincias,
			ambitoDelegaciones: Usuario.ambitoDelegaciones,
			ambitoSeccionales: Usuario.ambitoSeccionales
		},
		delegaciones: [],
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
			config: {
				body: {
					...list.paramsDef,
					...list.params,
					pageIndex: list.pagination.index,
					pageSize: list.pagination.size,
					soloActivos: true,
				},
			},
			onOk: async ({ data, ...pagination }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data
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
					if (payload.params) {
						changes.params = {
							...pick(o.params, paramsInit),
							...payload.params
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
		form = (
			<SeccionalesForm
				request = {list.selection.request}
				data={(() => {
					//INIT DE DATOS DEL FORM
					var data = list.selection.request == "B" ? {
						deletedDate: dayjs().format("DD-MM-YYYY"),
						deletedBy: Usuario.nombre,
					}
					: 
					{};
					return { ...list.selection.edit, ...data }; //le paso el registro entero  y modifico los campos necesarios segun el request que se está haciendo
				})()}
				delegaciones={list.delegaciones}
				title={list.selection.action}
				errors={list.selection.errors}
				loading={!!list.loading} 
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? { }
						: {
								codigo: true,
								seccionalEstadoId: true,
								descripcion: true,
								refDelegacionId: true,
								refLocalidadesId: true,
								domicilio: true,
								email: true,
								observaciones: true,
						  };
					if (list.selection.request !== "B")
					 r.deletedObs = true;
					 r.deletedBy = true;
					 r.deletedDate = true;

					return r;
				})()}
				hide={
					["A", "M", "X"].includes(list.selection.request)
						? { deletedObs: true,
							deletedBy: true,
							deletedDate: true, }
						: {}
				}
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

					applyChanges();
				}}
				onClose={(confirm) => {
					if (!["A", "B", "M", "R", "X"].includes(list.selection.request)) {
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

					const record = { ...list.selection.edit };
					
					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						if (!record.deletedObs) errors.deletedObs = "Dato requerido";
						record.seccionalEstadoId = 5 //DEFINO EL ESTADO DE BAJA! se deberia hacer mediante la busquieda del id de baja
					} 
					
					if (list.selection.request === "A" || list.selection.request === "M"){
						if (!record.codigo) errors.codigo = "Dato requerido";
						if (!record.email) errors.email = "Dato requerido";
						if (!record.domicilio) errors.domicilio = "Dato requerido";
						if (!record.refLocalidadesId || record.refLocalidadesId == 0)
							errors.refLocalidadesId = "Dato requerido";
						if (!record.refDelegacionId || record.refDelegacionId == 0)
							errors.refDelegacionId = "Dato requerido";
						if (!record.descripcion) errors.descripcion = "Dato requerido";
						if (!record.seccionalEstadoId) errors.seccionalEstadoId = "Dato requerido";
					}

					if (list.selection.request === "X") {
						if (!record.seccionalIdAbsorbente) errors.seccionalIdAbsorbente = "Dato requerido";
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
					const query = {
						
						config: {},
						onOk: async (response) => {
							setList((old) => ({ ...old, loading: "Cargando..." }));
							/*
							if (list.onEditComplete === onEditCompleteDef) {
								console.log("true**")
								request("list");
							} else {
								console.log("false**")
								list.onEditComplete({
									edit: { ...list.selection.edit },
									response,
									request: list.selection.request,
								});
							}*/
						},
						onError: async (err) => alert(err.message),
					};

					switch (list.selection.request) {
						case "A":
							query.action = "Create";
							query.config.body = record;
							break;
						case "M":
							delete record?.seccionalLocalidad; //Elimino las seccionales localidades ya que esto las duplicaba							
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
								seccionalEstadoId: record.seccionalEstadoId
							};
							break;
						case "R":
							query.action = "Reactiva";
							query.params = { id: record.id };
							query.config.body = record.seccionalEstadoId;
							break;
						case "X":
							query.action = "Absorbe";
							//query.params = { id: record.id };
							query.config.body = {
								seccionalIdAbsorbida: record.id,
								seccionalIdAbsorbente: record.seccionalIdAbsorbente,
								userId: Usuario.id
								// id: record.id, debo enviar la seccional absorvente y la absorvida
							};
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
			<SeccionalesTable
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
									sort: `${sortOrder === "desc" ? "-" : "+"}${
										{ descripcion: "nombre" }[sortField] ?? sortField
									}`,
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

export default useSeccionales;
