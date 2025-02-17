import React, { useCallback, useEffect, useState, useContext } from "react";
import dayjs from "dayjs";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import { id, pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import AuthContext from "store/authContext";
import EncuestasTable from "./EncuestasTable";
import EncuestasForm from "./EncuestasForm";



// Definición inicial del estado de selección de encuestas
const selectionDef = {
	action: "", // Acción a realizar (A, B, M, C)
	request: "", // Tipo de solicitud a la API (Crear, Modificar, Eliminar, etc.)
	index: null, // Índice de la encuesta seleccionada
	record: null, // Registro de la encuesta seleccionada
	edit: null, // Datos en edición
	errors: null, // Errores de validación
};


// Función para seleccionar el primer registro en la lista
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


// Función que mantiene la selección previa si existe
export const onLoadSelectSame = ({ data, multi, record }) => {
	const dataArray = AsArray(data);
	if (multi) {
		record = AsArray(record);
		let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
		return retorno.length ? retorno : null;
	}
	return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};


//// Función que mantiene el mismo registro seleccionado anteriormente
export const onLoadSelectKeep = ({ record }) => record;


//// Función que selecciona el primer registro si no hay uno previamente seleccionado
export const onLoadSelectKeepOrFirst = ({ data, multi, record }) =>
	record ?? onLoadSelectFirst({ data, multi, record });


// Función vacía para manejar cambios en los datos (placeholder)
export const onDataChangeDef = (data = []) => {};


//// Definiciones de funciones vacías para manejar cambios, validaciones y completado de edición
const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) =>
	true;
const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
const onEditCompleteDef = ({ edit = {}, response = null, request = "", } = {}) => {};


//// Hook personalizado para gestionar encuestas
const useEncuestas = ({
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
	//Manejo de consultas a la API
	const Usuario = useContext(AuthContext).usuario;
	console.log("useSeccionales_Usuario,",Usuario)
	

	// Función que maneja las consultas a la API según la acción requerida
	const pushQuery = useQueryQueue((action, params) => {


		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "App",
						endpoint: `/Encuestas`,
						method: "GET",
					},
				};
			}
		
			case "Create": {
				return {
					config: {
						baseURL: "App",
						endpoint: `/Encuestas`, // Donde id es el identificador de la encuesta
						method: "POST",
					},
					
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "App",
						endpoint: `/Encuestas${id}`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "App",
						endpoint: `/Encuestas`,
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

	// useEffect para cargar la lista de encuestas desde la API
	useEffect(() => {
		if (!list.loading) return;
		const changes = { loading: null, error: null };

		// Si los datos son locales, simplemente se actualizan los estados
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

		// Si los datos son remotos, se realiza una consulta a la API
		changes.data = [];
		pushQuery({
			action: "GetList",
			config: {
				params: {  // Enviar parámetros correctamente en lugar de `body`
					...list.paramsDef,
					...list.params,
					pageIndex: list.pagination.index,
					pageSize: list.pagination.size,
				}
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


	// Función para manejar solicitudes y cambios en el estado de la lista
	const request = useCallback((type, payload = {}) => {
		switch (type) {
			case "selected": { // Maneja la selección de encuestas
				return setList((o) => {
					const apply = [];
					if (payload.request !== "A") {  // Si no es una creación (A), se extraen los IDs
						apply.push(
							...AsArray(
								"record" in payload ? payload.record : o.selection.record,
								true
							)
								.map(({ id }) => id) // Se extraen los IDs de los registros
								.filter((r) => r)    // Filtra valores nulos o indefinidos
						);
					}
					return {
						...o,
						selection: {
							...o.selection,
							request: payload.request,  // Tipo de solicitud (A, M, B, C)
							action: payload.action,   // Acción (crear, modificar, borrar)
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


	// Genera el formulario de edición o creación de encuestas si hay un registro seleccionado

	let form = null;
	if (list.selection.edit) {
		form = (
			<EncuestasForm
				request = {list.selection.request} // Tipo de acción que se está realizando (A, M, B, C)

				// Carga los datos del formulario con los valores actuales o valores por defecto
				data={(() => {
					// Si la acción es "Modificar (M)" o "Borrar (B)", se añaden datos de eliminación
					var data = (list.selection.request == "M" || list.selection.request == "B") ? {
						deletedDate: dayjs().format("DD-MM-YYYY"), // Fecha actual como fecha de eliminación
						deletedBy: Usuario.nombre,
					}
					//--------------------------------------------------------------<
					: 
					{
						
					};

					return { ...list.selection.edit, ...data }; //le paso el registro entero  y modifico los campos necesarios segun el request que se está haciendo
				})()}
				title={list.selection.action}
				errors={list.selection.errors}
				loading={!!list.loading} 
				disabled={(() => {
				 	const r = ["A", "M"].includes(list.selection.request)
				 		? { 
							fecha: true,
						}
						: {
								deletedDate: dayjs().format("DD-MM-YYYY"),
								deletedBy: true,
								tema: true,
								fecha: true,
								fechaFinalizacion: true,
								observaciones: true,
						  };
					if (list.selection.request !== "B"){
						r.deletedObs = true;
						r.deletedBy = true;
						r.deletedDate = true;
						r.fecha= true;
					}

				 	return r;
				 })()}


				// Define qué campos del formulario deben ocultarse según la acción
				hide={
					["A", "M"].includes(list.selection.request)
						? { deletedObs: true,
							deletedBy: true,
							deletedDate: true, }
						: ["C"].includes(list.selection.request)
						? { 
							
							deletedBy: true,
							deletedDate: true,
							 }
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
					if (!["A", "B", "M", "C"].includes(list.selection.request)) {
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
					
					console.log("Record_useEncuestas",record)
					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						if (!record.deletedObs) errors.deletedObs = "Dato requerido";
					} 
					//--------------------------------------------------------------------------------------------------------------
					//Verificacion------------------------------------------------------------------------------------------------->
					if (list.selection.request === "A" || list.selection.request === "M"){
						if (!record.tema) errors.tema = "Dato requerido";
						
						
						// if (!record.refLocalidadesId || record.refLocalidadesId == 0)
						// errors.refLocalidadesId = "Dato requerido";
					
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
							console.log("list.onEditComplete",list.onEditComplete)
							console.log("onEditCompleteDef",onEditCompleteDef)
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

					console.log("useSeccionales_list.selection",list.selection)
					switch (list.selection.request) {
					// case "A": // Crear nueva encuesta
					// 	query.action = "Create";
					// 	query.config.body = record;
					// 	break;
					case "A": // Crear nueva encuesta
						query.action = "Create";
						query.config.body = {
							...record, // Copia los datos actuales del formulario
							preguntas: record.preguntas && Array.isArray(record.preguntas) ? record.preguntas : [] // Asegura un array vacío si no hay preguntas
						};
						break;
					case "M": // Modificar encuesta existente
						query.action = "Update";
						query.params = { id: record.id };
						query.config.body = {
							record,
							preguntas: record.preguntas && Array.isArray(record.preguntas) ? record.preguntas : [] // Asegura un array vacío si no hay preguntas
						};
						break;
					case "B": // Eliminar encuesta
						query.action = "Delete";
						query.params = { id: record.id };
						query.config.body = {
							id: record.id,
							deletedObs: record.deletedObs,
							seccionalEstadoId: record.seccionalEstadoId
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
			<EncuestasTable
				remote={list.remote} // Indica si los datos provienen de la API o son locales
				data={list.data} // Pasa los datos de la lista de encuestas
				loading={!!list.loading} // Indica si la tabla está cargando datos
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

					// Obtiene los IDs de los registros seleccionados
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

export default useEncuestas;
