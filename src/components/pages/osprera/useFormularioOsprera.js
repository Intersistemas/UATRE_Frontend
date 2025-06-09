import React, { useCallback, useContext, useEffect, useState } from "react";

import dayjs from "dayjs";
import { matchIsValidTel } from "mui-tel-input";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import JoinOjects from "components/helpers/JoinObjects";
import { pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import ValidarCUIT from "components/validators/ValidarCUIT";
import FormulariosOspreraTable from "./FormulariosOspreraTable";
import FormularioOspreraForm from "./FormularioOspreraForm";
import moment from "moment/moment";
import AuthContext from "store/authContext"; 
import useAmbitos from 'components/hooks/useAmbitos';
	






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

const useFormularioOsprera = ({
	remote: remoteInit = true,
	data: dataInit = [],
	loading,
	error,
	params: paramsInit = {},
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 15 },
	onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
	onDataChange: onDataChangeInit = onDataChangeDef,
	columns,
	hideSelectColumn = true,
	mostrarBuscar = false,
} = {}) => {
	
	const { usuario } = useContext(AuthContext);
	const ambito = useAmbitos().ambitoUser();

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		// console.log("useFormularioOsprera, params", params);
		// console.log("useFormularioOsprera, action", action);
		switch (action) {
			case "GetList": {
				const { filtro2, ...otherParams } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: "/GestionOsprera/GetGestionOSpreraSpec",
						method: "POST",
					},
					params: otherParams,
				};
			}
			
			case "GetAccesoOspreraSpecs": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/GestionOsprera/GetGestionOSpreraSpec`,
						method: "POST",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/GestionOsprera`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/GestionOsprera`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/GestionOsprera/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactiva": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/GestionOsprera/Reactivar`,
						method: "PATCH",
					},
				};
			}

			case "GetSeccionalesSpecs": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional?SoloActivos=true&verSeccionalesLocalidades=false`,
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
		pagination: { index: 1, size: 5, ...paginationInit },
		data: [...AsArray(dataInit, true)],
		seccionales: [],
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
		// console.log("userFormularioOsprera_list",list)
		const soloLetras = /^[A-Za-z]+$/;
		const filtro = list?.params?.filtro

		pushQuery({
			action: "GetList",
			config: {
				body: {
					...list.params,
					pageIndex: list.pagination.index,
					pageSize: list.pagination.size,
					...(!soloLetras.test(filtro) && ValidarCUIT(filtro) ?  {cuitTitular: filtro.replace(/[.\-\s]/g, '')} : { apellidoTitular: filtro })
				},
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
	}, [pushQuery]);

	let form = null;
	if (list.selection.request) {
		form = (
			<FormularioOspreraForm
				data={(() => { 
					//console.log('list.selection',list.selection)
					//INIT DE DATOS DEL FORM
					const data =
					//seccionalId = list.selection.edit.refSeccionalId,
					["A"].includes(list.selection.request) ?  //INIT PARA ALTA
						{
							/*fecha: moment().format("YYYY-MM-DD"),
							fechaEnvioMail: null,
							direccionesEmailDestino: null,
							respuestaEnvioEmail: null,
							usuarioId: usuario?.id ?? "",*/
							seccionalId: list.selection.edit.seccionalId ?? usuario?.ambitoSeccionales?.ids[0] ?? 0,
							elPacienteEsTitular: list.selection.edit.elPacienteEsTitular ?? false,
							atencionesPrevias: list.selection.edit.atencionesPrevias ?? "",
							conCoberturaOsprera: list.selection.edit.conCoberturaOsprera ?? "",
							tipoPrestador: list.selection.edit.tipoPrestador ?? "",
						}
						:
						["B"].includes(list.selection.request) ? //INIT PARA BAJA
							{
								deletedDate: moment().format("YYYY-MM-DD"),
								deletedBy: usuario.nombre,
							}:
							{}
						return {...list.selection.edit, ...data}; //le paso el registro entero  y modifico los campos necesarios segun el request que se está haciendo
					})()
				}

				title={list.selection.action}
				errors={list.selection.errors}
				request={list.selection.request}
				// help={list.selection.help}
				loading={!!list.loading}
				disabled={(() => {
					const r = { //TODOS LOS CAMPOS DESHABILITADOS POR DEFECTO
								cuitTitular: true,
								fecha: true,
								nombreTitular: true,
								apellidoTitular: true,
								telefonoContacto: true,
								telefonoContacto2: true,
								emailContacto: true,
								emailContacto2: true,
								elPacienteEsTitular: true,
								dniPaciente: true,
								nombrePaciente: true,
								apellidoPaciente: true,
								fechaNacimiento: true,
								sexo: true,
								texto: true,	
								telefono: true,
								resultadoLlamada: true,
								medioGestion: true,
								tipoDocumentoId: true,
								direccionesEmailDestino: true,
								seccionalId: true,
								gestionRubro: true,
								gestionSubRubro: true,
								gestionEstado: true,
								gestionSituacion: true,
								gestionAreaOsprera: true,
							}
					
					
					if (["A"].includes(list.selection.request)) {
							r.cuitTitular = false
					}
						
					if (["M"].includes(list.selection.request)) {
						 		// r.telefonoContacto= false;
								// r.telefonoContacto2= false;
								// r.emailContacto= false;
								// r.emailContacto2= false;
								// r.elPacienteEsTitular= false;
								// r.dniPaciente= false;
								// r.nombrePaciente= false;
								// r.apellidoPaciente= false;
								// r.fechaNacimiento= false;
								// r.sexo= false;
								// r.texto= false;
								// r.telefono= false;
								// r.resultadoLlamada= false;
								// r.medioGestion= false;
								// r.tipoDocumentoId= false;
								// r.direccionesEmailDestino= false;
								// r.gestionRubro= false;
								// r.gestionSubRubro= false;
								r.gestionEstado= false;
								r.gestionSituacion= false;
								// r.gestionAreaOsprera= false;
					}
						
					
					if (list.selection.request !== "B") {
						r.deletedObs = true;
						r.deletedBy = true;
						r.deletedDate = true;
						
					}
					
					r.seccionalId = ambito.tipo == "Todos" ? false : true; //si el ambito es todos, no se puede modificar la secc=onalId
					return r;
				})()}
				hide={
					["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {}
				}
				onChange={(edit) => {
					// console.log("edit:",edit)
					const changes = { edit: { ...edit }, errors: {}, help: {} };
					if ("cuitTitular" in edit) {
						
						if (edit.cuitTitular && `${edit.cuitTitular}`.length === 11) {
							if (ValidarCUIT(edit.cuitTitular)) {
								//changes.help.cuitTitular = "Cargando...";
							} else {
								changes.errors.cuitTitular = "CUIT inválido";
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
				onValidate={(confirm) => {
					
					const record = {
						fecha: moment().format("YYYY-MM-DD"),
						fechaEnvioMail: null,
						direccionesEmailDestino: null,
						respuestaEnvioEmail: null,
						usuarioId: usuario?.id ?? "",
						seccionalId: list.selection.edit.seccionalId ?? usuario?.ambitoSeccionales?.ids[0] ?? 0,
						atencionesPrevias: "",
						conCoberturaOsprera: "",
						tipoPrestador: "",
						...list.selection.edit
					}					
					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						if (!record.deletedObs) errors.deletedObs = "Dato requerido";
					}

					if (["A", "M"].includes(list.selection.request)) {
						if (!record.cuitTitular) errors.cuitTitular = "Dato requerido"; else if (!ValidarCUIT(record.cuitTitular)) errors.cuitTitular = "CUIT Incorrecto";
						if (!record.dniPaciente) errors.dniPaciente = "Dato requerido";

						if (!record.apellidoTitular) errors.apellidoTitular = "Dato requerido";
						if (!record.nombreTitular) errors.nombreTitular = "Dato requerido";
						if (!record.apellidoPaciente) errors.apellidoPaciente = "Dato requerido";
						if (!record.nombrePaciente) errors.nombrePaciente = "Dato requerido";
						if (!record.fechaNacimiento) errors.fechaNacimiento = "Dato requerido";
						if ((record.sexoId ?? 0) === 0) errors.sexoId = "Dato requerido";
						if (!record.texto) errors.texto = "Dato requerido";
						if (!record.medioGestion) errors.medioGestion = "Dato requerido";
						if (!record.tipoDocumentoId) errors.tipoDocumentoId = "Dato requerido";
						if (!record.seccionalId || record.seccionalId == 0) errors.seccionalId = "Dato requerido";

						if (record.medioGestion == "email" && !record.direccionesEmailDestino) errors.direccionesEmailDestino = "Dato requerido";
						if (record.medioGestion == "telefono" && (!record.telefono || record.telefono.length <= 6)) errors.telefono = "Dato requerido";
						if (record.medioGestion == "telefono" && !record.resultadoLlamada) errors.resultadoLlamada = "Dato requerido";

						if (!record.gestionRubroId || record.gestionRubroId == 0) errors.gestionRubro = "Dato requerido";
						if (!record.gestionSubRubroId || record.gestionSubRubroId == 0) errors.gestionSubRubro = "Dato requerido";
						if (!record.gestionEstadoId || record.gestionEstadoId == 0) errors.gestionEstado = "Dato requerido";
						if (!record.gestionSituacionId || record.gestionSituacionId == 0) errors.gestionSituacion = "Dato requerido";
						if (!record.gestionAreaOspreraId || record.gestionAreaOspreraId == 0) errors.gestionAreaOsprera = "Dato requerido";
					}

					if (Object.keys(errors).length) {
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								errors,
							},
						}));
						return false;
					}else {
						return true;
					}
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

					const record = {
						fecha: moment().format("YYYY-MM-DD"),
						fechaEnvioMail: null,
						direccionesEmailDestino: null,
						respuestaEnvioEmail: null,
						usuarioId: usuario?.id ?? "",
						seccionalId: list.selection.edit.seccionalId ?? usuario?.ambitoSeccionales?.ids[0] ?? 0,
						...list.selection.edit
					}
					// console.log("record",record);
					
					
					console.log("list",list);

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						if (!record.deletedObs) errors.deletedObs = "Dato requerido";
					}

					if (["A", "M"].includes(list.selection.request)) {
						if (!record.cuitTitular) errors.cuitTitular = "Dato requerido"; else if (!ValidarCUIT(record.cuitTitular)) errors.cuitTitular = "CUIT Incorrecto";
						if (!record.dniPaciente) errors.dniPaciente = "Dato requerido";

						if (!record.apellidoTitular) errors.apellidoTitular = "Dato requerido";
						if (!record.nombreTitular) errors.nombreTitular = "Dato requerido";
						if (!record.apellidoPaciente) errors.apellidoPaciente = "Dato requerido";
						if (!record.nombrePaciente) errors.nombrePaciente = "Dato requerido";
						if (!record.fechaNacimiento) errors.fechaNacimiento = "Dato requerido";
						if ((record.sexoId ?? 0) === 0) errors.sexoId = "Dato requerido";
						if (!record.medioGestion) errors.medioGestion = "Dato requerido";
						if (!record.tipoDocumentoId) errors.tipoDocumentoId = "Dato requerido";
						if (!record.seccionalId || record.seccionalId == 0) errors.seccionalId = "Dato requerido";

						if (record.medioGestion == "email" && !record.direccionesEmailDestino) errors.direccionesEmailDestino = "Dato requerido";
						if (record.medioGestion == "telefono" && (!record.telefono || record.telefono.length <= 6)) errors.telefono = "Dato requerido";
						if (record.medioGestion == "telefono" && !record.resultadoLlamada) errors.resultadoLlamada = "Dato requerido";

						if (!record.gestionRubroId || record.gestionRubroId == 0) errors.gestionRubro = "Dato requerido";
						if (!record.gestionSubRubroId || record.gestionSubRubroId == 0) errors.gestionSubRubro = "Dato requerido";
						if (!record.gestionEstadoId || record.gestionEstadoId == 0) errors.gestionEstado = "Dato requerido";
						if (!record.gestionSituacionId || record.gestionSituacionId == 0) errors.gestionSituacion = "Dato requerido";
						if (!record.gestionAreaOspreraId || record.gestionAreaOspreraId == 0) errors.gestionAreaOsprera = "Dato requerido";
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
			<FormulariosOspreraTable
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
							let { sortField, sortOrder } = newState;
							sortField = { cuitTitular: "CUIT" }[sortField] ?? sortField;
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

export default useFormularioOsprera;
