// import React, { useCallback, useEffect, useState } from "react";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import AmbitosTable from "./AmbitosTable";
// import AmbitoUsuarioForm from "./UsuarioAmbitoForm";

// const selectionDef = {
// 	action: "",
// 	request: "",
// 	index: null,
// 	record: null,
// 	edit: null,
// 	errors: null,
// };
 
// const useAmbitos = () => {
// 	//#region Trato queries a APIs
// 	const pushQuery = useQueryQueue((action, params) => {
// 		console.log('useAmbitos_action',action," & ",params);
// 		switch (action) {
// 			case "GetList": {
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						endpoint: `/UsuarioAmbitos`,
// 						method: "GET",
// 					},
// 				};
// 			}

// 			case "GetListByUsuarioId": {
// 				const { usuarioId , ...otherParams } = params;
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						method: "GET",
// 						endpoint: `/UsuariosAmbitos/${usuarioId}`,
// 					},
// 					params: otherParams,
// 				};
// 			}
// 			case "CreateUA": {
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						endpoint: `/UsuariosAmbitos`,
// 						method: "POST",
// 					},
// 				};
// 			}
// 			case "UpdateUA": {
// 				const { id, ...otherParams } = params;
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						endpoint: `/UsuariosAmbitos`,
// 						method: "PUT",
// 					},
// 					params: otherParams,
// 				};
// 			}
// 			case "DeleteUA": {
// 				const { id, ...otherParams } = params;
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						endpoint: `/UsuariosAmbitos/${id}`,
// 						method: "DELETE",
// 					},
// 					params: otherParams,
// 				};
// 			}
// 			default:
// 				return null;
// 		}
// 	});
// 	//#endregion


// 	//#region declaracion y carga list y selected
// 	const [list, setList] = useState({
// 		loading: null,
// 		params: {},
// 		data: [],
// 		error: null,
// 		selection: { ...selectionDef },
// 	});

// 	useEffect(() => {
// 		if (!list.loading) return;
// 		console.log("useAmbitos_list",list)
// 		pushQuery({
// 			action: list.params.usuarioId ? "GetListByUsuarioId" : "GetList",
// 			params: { ...list.params },

// 			onOk: async (data) =>
// 				(
// 					console.log('ambitos_data',data),
// 					setList((o) => {
// 						const selection = {
// 							...selectionDef,
// 							record:
// 								data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
// 						};
// 						if (selection.record)
// 							selection.index = data.indexOf(selection.record);
// 						return {
// 							...o,
// 							loading: null,
// 							data: data,
// 							error: null,
// 							selection,
// 						};
// 					})
// 				),
// 			onError: async (err) =>
// 				setList((o) => ({
// 					...o,
// 					loading: null,
// 					data: [],
// 					error: err.code === 404 ? null : err,
// 					selection: { ...selectionDef },
// 				})),
// 		});
// 	}, [pushQuery, list.loading, list.params]);
// 	//#endregion

// 	const requestChanges = useCallback((type, payload = {}) => {
// 		console.log('useAmbitos_requestChanges',type,' & ',payload)
// 		switch (type) {
// 			case "selected": {
// 				return setList((o) => ({
// 					...o,
// 					selection: {
// 						...o.selection,
// 						request: payload.request,
// 						action: payload.action,
// 						edit: {
// 							...(payload.request === "A" ? {} : o.selection.record),
// 							...payload.record,
// 						},
// 					},
// 				}));
// 			} 
// 			case "list": {
// 				if (payload.clear)
// 					return setList((o) => ({
// 						...o,
// 						loading: null,
// 						data: [],
// 						error: null,
// 						selection: { ...selectionDef },
// 					}));
// 				return setList((o) => ({
// 					...o,
// 					loading: "Cargando...",
// 					params: { ...payload.params },
// 					data: [],
// 				}));
// 			}
// 			default:
// 				return;
// 		}
// 	}, []);

// 	let form = null;
// 	if (list.selection.edit) {
// 		form = (
// 			<AmbitoUsuarioForm
// 				loading={!!list.loading}
// 				data={list.selection.edit}
// 				title={list.selection.action}
// 				errors={list.selection.errors}
// 				disabled={(() => {
// 					const r = ["A", "M"].includes(list.selection.request)
// 						? {}
// 						: {
// 								ambitoId: true,
// 								ambitoTipo: true,
// 								deletedDate: true,
// 								deletedBy: true
// 						  };
// 					if (list.selection.request !== "B") r.deletedObs = true;

// 					return r;
// 				})()}
// 				hide={
// 					["A", "M"].includes(list.selection.request)
// 						? { deletedObs: true }
// 						: {}
// 				}
// 				onChange={(changes) =>
// 					{
// 						const errors = {};
// 						setList((old) => ({ ...old, loading: null }));
// 						if (list?.data?.find((t)=> t.ambitoId === changes?.ambitoId && t.ambitoTipo === list.selection?.edit?.ambitoTipo) != null && list.selection?.edit?.ambitoTipo != "T")
// 						{ 
// 							 errors.ambitoId = "El Usuario ya posee este Ambito"
// 							 errors.ambitoExiste = true
// 						};

// 						setList((o) => ({
// 							...o,
// 							selection: {
// 								...o.selection,
// 								errors,
// 								edit: {
// 									...o.selection.edit,
// 									...changes,
// 								},
// 							},
// 						}))
// 					}
// 				}
// 				onClose={(confirm) => {
// 					if (!["A", "B", "M"].includes(list.selection.request))
// 						confirm = false;
// 					if (!confirm) {
// 						setList((o) => ({
// 							...o,
// 							selection: {
// 								...selectionDef,
// 								index: o.selection.index,
// 								record: o.data.at(o.selection.index),
// 							},
// 						}));
// 						return;
// 					}

// 					const record = list.selection.edit;
// 					//Validaciones
// 					console.log("useAmbitos,Record",record)
// 					const errors = {};

// 					if (!record.ambitoId && record.ambitoTipo != "T" ) errors.ambitoId = "Dato requerido";
// 					if (!record.ambitoTipo) errors.ambitoTipo = "Dato requerido";

// 					if (list.selection.request === "B") {
// 						if (!record.deletedObs) errors.deletedObs = "Dato requerido";
// 					}
					

// 					console.log('useAmbitos_onChange',list.selection.edit.ambitoTipo)
// 					console.log('useAmbitos_onChange2',list.data)

// 					if (list?.data?.find((t)=> t.ambitoTipo === "T" ) != null && list.selection.edit.ambitoTipo == "T")
// 						{ 
// 							 errors.ambitoTipo = "El Usuario ya posee este Ambito"
// 							 errors.ambitoExiste = true
// 						};

// 					if (Object.keys(errors).length) {
// 						setList((o) => ({
// 							...o,
// 							selection: {
// 								...o.selection,
// 								errors,
// 							},
// 						}));
// 						return;
// 					}

// 					const query = {
// 						config: {},
// 						onOk: async (res) =>
// 							setList((old) => ({ ...old, loading: "Cargando..." })),
// 						onError: async (err) => alert(err.message),
// 					};

// 					switch (list.selection.request) {
// 						case "A":
// 							query.action = "CreateUA";
// 							query.config.body = record;
// 							break;
// 						case "M":
// 							query.action = "UpdateUA";
// 							query.params = { id: record.id };
// 							query.config.body = record;
// 							break;
// 						case "B":
// 							query.action = "DeleteUA";
// 							query.params = { id: record.id };
// 							//query.config.body = record.bajaObservacion;
// 							break;
// 						default:
// 							break;
// 					}
// 					pushQuery(query);
// 				}}
// 			/>
// 		);
// 	}

// 	const render = () => (
// 		<>
// 			<AmbitosTable
// 				data={list.data}
// 				loading={!!list.loading}
// 				noDataIndication={
// 					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
// 				}
// 				selection={{
// 					selected: [list.selection.record?.id].filter((r) => r),
// 					onSelect: (record, isSelect, index, e) =>
// 						setList((o) => ({
// 							...o,
// 							selection: {
// 								...selectionDef,
// 								index,
// 								record,
// 							},
// 						})),
// 				}}
// 			/>
// 			{form}
// 		</>
// 	);

// 	return [render, requestChanges, list.selection.record];
// };

// export default useAmbitos;


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// import React, { useCallback, useEffect, useState } from "react";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import AmbitosTable from "./AmbitosTable";
// import AmbitoUsuarioForm from "./UsuarioAmbitoForm";

// const selectionDef = {
// 	action: "",
// 	request: "",
// 	index: null,
// 	record: null,
// 	edit: null,
// 	errors: null,
// };
 
// const useAmbitos = () => {
// 	//#region Trato queries a APIs
// 	const pushQuery = useQueryQueue((action, params) => {
// 		console.log('useAmbitos_action',action," & ",params);
// 		switch (action) {
// 			case "GetList": {
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						endpoint: `/UsuarioAmbitos`,
// 						method: "GET",
// 					},
// 				};
// 			}

// 			case "GetListByUsuarioId": {
// 				const { usuarioId , ...otherParams } = params;
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						method: "GET",
// 						endpoint: `/UsuariosAmbitos/${usuarioId}`,
// 					},
// 					params: otherParams,
// 				};
// 			}
			
// 			case "CreateUA": {
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						endpoint: `/UsuariosAmbitos`,
// 						method: "POST",
// 					},
// 				};
// 			}
// 			case "UpdateUA": {
// 				const { id, ...otherParams } = params;
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						endpoint: `/UsuariosAmbitos`,
// 						method: "PUT",
// 					},
// 					params: otherParams,
// 				};
// 			}
// 			case "DeleteUA": {
// 				const { id, ...otherParams } = params;
// 				return {
// 					config: {
// 						baseURL: "Seguridad",
// 						endpoint: `/UsuariosAmbitos/DarDeBaja/${id}`,
// 						method: "PATCH",
// 					},
// 					params: otherParams,
// 				};
// 			}
// 			default:
// 				return null;
// 		}
// 	});
// 	//#endregion


// 	//#region declaracion y carga list y selected
// 	const [list, setList] = useState({
// 		loading: null,
// 		params: {},
// 		data: [],
// 		error: null,
// 		selection: { ...selectionDef },
// 	});

// 	// useEffect(() => {
// 	// 	if (!list.loading) return;
// 	// 	console.log("useAmbitos_list",list)
// 	// 	pushQuery({
// 	// 		action: list.params.usuarioId ? "GetListByUsuarioId" : "GetList",
// 	// 		params: { ...list.params },

// 	// 		onOk: async (data) =>
// 	// 			(
// 	// 				console.log('ambitos_data',data),
// 	// 				setList((o) => {
// 	// 					const selection = {
// 	// 						...selectionDef,
// 	// 						record:
// 	// 							data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
// 	// 					};
// 	// 					if (selection.record)
// 	// 						selection.index = data.indexOf(selection.record);
// 	// 					return {
// 	// 						...o,
// 	// 						loading: null,
// 	// 						data: data,
// 	// 						error: null,
// 	// 						selection,
// 	// 					};
// 	// 				})
// 	// 			),
// 	// 		onError: async (err) =>
// 	// 			setList((o) => ({
// 	// 				...o,
// 	// 				loading: null,
// 	// 				data: [],
// 	// 				error: err.code === 404 ? null : err,
// 	// 				selection: { ...selectionDef },
// 	// 			})),
// 	// 	});
// 	// }, [pushQuery, list.loading, list.params]);

	
// useEffect(() => {
//     if (!list.loading) return;
//     console.log("useAmbitos_list",list)
//     pushQuery({
//         action: list.params.usuarioId ? "GetListByUsuarioId" : "GetList",
//         params: { ...list.params },

//         onOk: async (data) =>
//             (
//                 console.log('ambitos_data',data),
//                 setList((o) => {
//                     // Filtrar solo los datos que tengan deletedDate = null,
// 					//esto asegura que solo se muestren los ambitos activos
// 					// y no los que han sido eliminados.
//                     const filteredData = data.filter(item => item.deletedDate === null);
                    
//                     const selection = {
//                         ...selectionDef,
//                         record:
//                             filteredData.find((r) => r.id === o.selection.record?.id) ?? filteredData.at(0),
//                     };
//                     if (selection.record)
//                         selection.index = filteredData.indexOf(selection.record);
//                     return {
//                         ...o,
//                         loading: null,
//                         data: filteredData, // Usar los datos filtrados
//                         error: null,
//                         selection,
//                     };
//                 })
//             ),
//         onError: async (err) =>
//             setList((o) => ({
//                 ...o,
//                 loading: null,
//                 data: [],
//                 error: err.code === 404 ? null : err,
//                 selection: { ...selectionDef },
//             })),
//     });
// }, [pushQuery, list.loading, list.params]);


// 	const requestChanges = useCallback((type, payload = {}) => {
// 		console.log('useAmbitos_requestChanges',type,' & ',payload)
// 		switch (type) {
// 			case "selected": {
// 				return setList((o) => ({
// 					...o,
// 					selection: {
// 						...o.selection,
// 						request: payload.request,
// 						action: payload.action,
// 						edit: {
// 							...(payload.request === "A" ? {} : o.selection.record),
// 							...payload.record,
// 						},
// 					},
// 				}));
// 			} 
// 			case "list": {
// 				if (payload.clear)
// 					return setList((o) => ({
// 						...o,
// 						loading: null,
// 						data: [],
// 						error: null,
// 						selection: { ...selectionDef },
// 					}));
// 				return setList((o) => ({
// 					...o,
// 					loading: "Cargando...",
// 					params: { ...payload.params },
// 					data: [],
// 				}));
// 			}
// 			default:
// 				return;
// 		}
// 	}, []);

// 	let form = null;
// 	if (list.selection.edit) {
// 		form = (
// 			<AmbitoUsuarioForm
// 				loading={!!list.loading}
// 				data={list.selection.edit}
// 				title={list.selection.action}
// 				errors={list.selection.errors}
// 				disabled={(() => {
// 					const r = ["A", "M"].includes(list.selection.request)
// 						? {}
// 						: {
// 								ambitoId: true,
// 								ambitoTipo: true,
// 								deletedDate: true,
// 								deletedBy: true
// 						  };
// 					if (list.selection.request !== "B") r.deletedBy = true;

// 					return r;
// 				})()}
// 				hide={
// 					["A", "M"].includes(list.selection.request)
// 						? { deletedObs: true }
// 						: {}
// 				}
// 				onChange={(changes) =>
// 					{
// 						const errors = {};
// 						setList((old) => ({ ...old, loading: null }));
// 						if (list?.data?.find((t)=> t.ambitoId === changes?.ambitoId && t.ambitoTipo === list.selection?.edit?.ambitoTipo) != null && list.selection?.edit?.ambitoTipo !== "T")
// 						{ 
// 							 errors.ambitoId = "El Usuario ya posee este Ambito"
// 							 errors.ambitoExiste = true
// 						};

// 						setList((o) => ({
// 							...o,
// 							selection: {
// 								...o.selection,
// 								errors,
// 								edit: {
// 									...o.selection.edit,
// 									...changes,
// 								},
// 							},
// 						}))
// 					}
// 				}
				


				
// onClose={(confirm) => {
//     if (!["A", "B", "M"].includes(list.selection.request))
//         confirm = false;
//     if (!confirm) {
//         setList((o) => ({
//             ...o,
//             selection: {
//                 ...selectionDef,
//                 index: o.selection.index,
//                 record: o.data.at(o.selection.index),
//             },
//         }));
//         return;
//     }

//     const record = list.selection.edit;
//     //Validaciones
//     console.log("useAmbitos,Record",record)
//     const errors = {};

//     // Solo validar campos requeridos si NO es una eliminación
//     if (list.selection.request !== "B") {
//         if (!record.ambitoId && record.ambitoTipo !== "T") errors.ambitoId = "Dato requerido";
//         if (!record.ambitoTipo) errors.ambitoTipo = "Dato requerido";
        
//         // Solo validar duplicados en caso de agregar o modificar
//         if (list?.data?.find((t)=> t.ambitoTipo === "T" ) != null && list.selection.edit.ambitoTipo === "T") {
//             errors.ambitoTipo = "El Usuario ya posee este Ambito";
//             errors.ambitoExiste = true;
//         }
//     }

//     // Validación específica para eliminación
//     if (list.selection.request === "B") {
//         if (!record.deletedObs) errors.deletedObs = "Dato requerido";
//     }

//     console.log('useAmbitos_onChange',list.selection.edit.ambitoTipo)
//     console.log('useAmbitos_onChange2',list.data)

//     if (Object.keys(errors).length) {
//         setList((o) => ({
//             ...o,
//             selection: {
//                 ...o.selection,
//                 errors,
//             },
//         }));
//         return;
//     }

//     const query = {
//         config: {},
//         onOk: async (res) =>
//             setList((old) => ({ ...old, loading: "Cargando..." })),
//         onError: async (err) => alert(err.message),
//     };

//     switch (list.selection.request) {
//         case "A":
//             query.action = "CreateUA";
//             query.config.body = record;
//             break;
//         case "M":
//             query.action = "UpdateUA";
//             query.params = { id: record.id };
//             query.config.body = record; 
//             break;
//         case "B":
//             query.action = "DeleteUA";
//             query.params = { id: record.id };
//             query.config.body = {
//                 id: record.id,
// 				deletedDate: new Date().toISOString(),
// 				deletedBy: record.deletedBy,
//                 deletedObs: record.deletedObs
//             };
//             break;
//         default:
//             break;
//     }

//     pushQuery(query);
// }}

// 			/>
// 		);
// 	}

// 	const render = () => (
// 		<>
// 			<AmbitosTable
// 				data={list.data}
// 				loading={!!list.loading}
// 				noDataIndication={
// 					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
// 				}
// 				selection={{
// 					selected: [list.selection.record?.id].filter((r) => r),
// 					onSelect: (record, isSelect, index, e) =>
// 						setList((o) => ({
// 							...o,
// 							selection: {
// 								...selectionDef,
// 								index,
// 								record,
// 							},
// 						})),
// 				}}
// 			/>
// 			{form}
// 		</>
// 	);

// 	return [render, requestChanges, list.selection.record];
// };

// export default useAmbitos;


import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AmbitosTable from "./AmbitosTable";
import AmbitoUsuarioForm from "./UsuarioAmbitoForm";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};
 
const useAmbitos = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		console.log('🔵 [PUSH_QUERY] Action:', action, 'Params:', params);
		switch (action) {
			case "GetList": {
				console.log('🟢 [GET_LIST] Configurando query para obtener lista general');
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuarioAmbitos`,
						method: "GET",
					},
				};
			}

			case "GetListByUsuarioId": {
				const { usuarioId , ...otherParams } = params;
				console.log('🟢 [GET_LIST_BY_USER] Usuario ID:', usuarioId, 'Otros params:', otherParams);
				return {
					config: {
						baseURL: "Seguridad",
						method: "GET",
						endpoint: `/UsuariosAmbitos/${usuarioId}`,
					},
					params: otherParams,
				};
			}
			
			case "CreateUA": {
				//  Enviar body como data (axios) y header JSON
				console.log('🟡 [CREATE_UA] Datos a crear:', params);
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos`,
						method: "POST",
						headers: { "Content-Type": "application/json" },
						data: params ?? {}, // <- ANTES no enviaba nada del body
					},
				};
			}
			case "UpdateUA": {
				//  Tomar todo lo que venga excepto id y enviarlo como data
				const { id, ...otherParams } = params;
				console.log('🟡 [UPDATE_UA] ID:', id, 'Datos a actualizar:', otherParams);
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos`,
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						data: otherParams ?? {}, // <- ANTES no enviaba nada del body
					},
					params: { id },
				};
			}
			case "DeleteUA": {
				//  PATCH con data (deletedObs/deletedBy/deletedDate)
				const { id, ...otherParams } = params;
				console.log('🔴 [DELETE_UA] ID a eliminar:', id, 'Datos de eliminación:', otherParams);
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos/DarDeBaja/${id}`,
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						data: otherParams ?? {}, // <- ANTES no enviaba nada del body
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
		params: {},
		data: [],
		error: null,
		selection: { ...selectionDef },
	});

	// useEffect(() => {
	// 	if (!list.loading) return;
	// 	console.log("useAmbitos_list",list)
	// 	pushQuery({
	// 		action: list.params.usuarioId ? "GetListByUsuarioId" : "GetList",
	// 		params: { ...list.params },

	// 		onOk: async (data) =>
	// 			(
	// 				console.log('ambitos_data',data),
	// 				setList((o) => {
	// 					const selection = {
	// 						...selectionDef,
	// 						record:
	// 							data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
	// 					};
	// 					if (selection.record)
	// 						selection.index = data.indexOf(selection.record);
	// 					return {
	// 						...o,
	// 						loading: null,
	// 						data: data,
	// 						error: null,
	// 						selection,
	// 					};
	// 				})
	// 			),
	// 		onError: async (err) =>
	// 			setList((o) => ({
	// 				...o,
	// 				loading: null,
	// 				data: [],
	// 				error: err.code === 404 ? null : err,
	// 				selection: { ...selectionDef },
	// 			})),
	// 	});
	// }, [pushQuery, list.loading, list.params]);

	
useEffect(() => {
    if (!list.loading) return;
    console.log(" [USE_EFFECT] Estado actual de list:", list);
    
    const action = list.params.usuarioId ? "GetListByUsuarioId" : "GetList";
    console.log(" [USE_EFFECT] Acción a ejecutar:", action, "con params:", list.params);
    
    pushQuery({
        action: action,
        params: { ...list.params },

        onOk: async (data) => {
            console.log(' [ON_OK] Datos recibidos del servidor:', data);
            console.log(' [ON_OK] Total de registros:', data?.length || 0);
            
            // Filtrar solo los datos que tengan deletedDate = null,
            //esto asegura que solo se muestren los ambitos activos
            // y no los que han sido eliminados.
            const filteredData = data.filter(item => item.deletedDate === null);
            console.log(' [ON_OK] Datos filtrados (activos):', filteredData);
            console.log(' [ON_OK] Registros activos:', filteredData?.length || 0);
            
            setList((o) => {
                const selection = {
                    ...selectionDef,
                    record:
                        filteredData.find((r) => r.id === o.selection.record?.id) ?? filteredData.at(0),
                };
                if (selection.record)
                    selection.index = filteredData.indexOf(selection.record);
                
                console.log(' [ON_OK] Selección configurada:', selection);
                
                return {
                    ...o,
                    loading: null,
                    data: filteredData, // Usar los datos filtrados
                    error: null,
                    selection,
                };
            });
        },
        onError: async (err) => {
            console.log(' [ON_ERROR] Error al cargar datos:', err);
            console.log(' [ON_ERROR] Código de error:', err.code);
            
            setList((o) => ({
                ...o,
                loading: null,
                data: [],
                error: err.code === 404 ? null : err,
                selection: { ...selectionDef },
            }));
        },
    });
}, [pushQuery, list.loading, list.params]);


	const requestChanges = useCallback((type, payload = {}) => {
		console.log('🔄 [REQUEST_CHANGES] Tipo:', type, 'Payload:', payload);
		switch (type) {
			case "selected": {
				console.log(' [SELECTED] Request:', payload.request, 'Action:', payload.action, 'Record:', payload.record);
				return setList((o) => {
					const editData = {
						...(payload.request === "A" ? {} : o.selection.record),
						...payload.record,
					};
					console.log(' [SELECTED] Datos de edición configurados:', editData);
					return {
						...o,
						selection: {
							...o.selection,
							request: payload.request,
							action: payload.action,
							edit: editData,
						},
					};
				});
			} 
			case "list": {
				if (payload.clear) {
					console.log(' [LIST] Limpiando lista');
					return setList((o) => ({
						...o,
						loading: null,
						data: [],
						error: null,
						selection: { ...selectionDef },
					}));
				}
				console.log(' [LIST] Cargando lista con params:', payload.params);
				return setList((o) => ({
					...o,
					loading: "Cargando...",
					params: { ...payload.params },
					data: [],
				}));
			}
			default:
				return;
		}
	}, []);

	let form = null;
	if (list.selection.edit) {
		form = (
			<AmbitoUsuarioForm
				loading={!!list.loading}
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								ambitoId: true,
								ambitoTipo: true,
								deletedDate: true,
								deletedBy: true
						  };
					if (list.selection.request !== "B") r.deletedBy = true;

					return r;
				})()}
				hide={
					["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {}
				}
				onChange={(changes) => {
					console.log('📝 [ON_CHANGE] Cambios recibidos:', changes);
					console.log('📝 [ON_CHANGE] Datos actuales de la lista:', list.data);
					console.log('📝 [ON_CHANGE] Estado actual de edición:', list.selection?.edit);
					
					const errors = {};
					setList((old) => ({ ...old, loading: null }));
					
					// Validación de duplicados
					const existingItem = list?.data?.find((t)=> t.ambitoId === changes?.ambitoId && t.ambitoTipo === list.selection?.edit?.ambitoTipo);
					if (existingItem != null && list.selection?.edit?.ambitoTipo !== "T") {
						console.log(' [ON_CHANGE] Ámbito duplicado encontrado:', existingItem);
						errors.ambitoId = "El Usuario ya posee este Ambito";
						errors.ambitoExiste = true;
					}

					console.log('📝 [ON_CHANGE] Errores de validación:', errors);

					setList((o) => ({
						...o,
						selection: {
							...o.selection,
							errors,
							edit: {
								...o.selection.edit,
								...changes,
							},
						},
					}));
				}}
				


				
onClose={(confirm) => {
    console.log(' [ON_CLOSE] Confirmación:', confirm, 'Request:', list.selection.request);
    
    if (!["A", "B", "M"].includes(list.selection.request))
        confirm = false;
    if (!confirm) {
        console.log(' [ON_CLOSE] Cancelando operación, volviendo al estado anterior');
        setList((o) => ({
            ...o,
            selection: {
                ...selectionDef,
                index: o.selection.index,
                record: o.data.at(o.selection.index),
            },
        }));
        return;
    }

    const record = list.selection.edit;
    console.log(" [ON_CLOSE] Datos del registro a procesar:", record);
    console.log(" [ON_CLOSE] Tipo de operación:", list.selection.request);
    
    const errors = {};

    // Solo validar campos requeridos si NO es una eliminación
    if (list.selection.request !== "B") {
        console.log(' [VALIDACIÓN] Validando campos para crear/modificar');
        if (!record.ambitoId && record.ambitoTipo !== "T") {
            console.log(' [VALIDACIÓN] ambitoId requerido');
            errors.ambitoId = "Dato requerido";
        }
        if (!record.ambitoTipo) {
            console.log(' [VALIDACIÓN] ambitoTipo requerido');
            errors.ambitoTipo = "Dato requerido";
        }
        
        // Solo validar duplicados en caso de agregar o modificar
        const duplicateT = list?.data?.find((t)=> t.ambitoTipo === "T" );
        if (duplicateT != null && list.selection.edit.ambitoTipo === "T") {
            console.log(' [VALIDACIÓN] Ámbito tipo T duplicado encontrado:', duplicateT);
            errors.ambitoTipo = "El Usuario ya posee este Ambito";
            errors.ambitoExiste = true;
        }
    }

    // Validación específica para eliminación
    if (list.selection.request === "B") {
        console.log(' [VALIDACIÓN] Validando campos para eliminación');
        if (!record.deletedObs) {
            console.log(' [VALIDACIÓN] deletedObs requerido para eliminación');
            errors.deletedObs = "Dato requerido";
        }
    }

    console.log('🔍 [VALIDACIÓN] AmbitoTipo actual:', list.selection.edit.ambitoTipo);
    console.log('🔍 [VALIDACIÓN] Datos en lista:', list.data);
    console.log('🔍 [VALIDACIÓN] Errores encontrados:', errors);

    if (Object.keys(errors).length) {
        console.log(' [VALIDACIÓN] Errores encontrados, no se procede:', errors);
        setList((o) => ({
            ...o,
            selection: {
                ...o.selection,
                errors,
            },
        }));
        return;
    }

    console.log(' [VALIDACIÓN] Sin errores, procediendo con la operación');

    const query = {
        config: {},
        onOk: async (res) => {
            console.log(' [QUERY_SUCCESS] Operación exitosa, respuesta:', res);
            setList((old) => ({ ...old, loading: "Cargando..." }));
        },
        onError: async (err) => {
            console.log(' [QUERY_ERROR] Error en la operación:', err);
            alert(err.message);
        },
    };

    switch (list.selection.request) {
        case "A":
            console.log('[CREATE] Configurando query para crear');
            query.action = "CreateUA";
            query.config.body = record;
            console.log('[CREATE] Body a enviar:', record);
            break;
        case "M":
            console.log(' [UPDATE] Configurando query para modificar');
            query.action = "UpdateUA";
            query.params = { id: record.id };
            query.config.body = record;
            console.log(' [UPDATE] ID:', record.id, 'Body:', record);
            break;
        case "B":
            console.log(' [DELETE] Configurando query para eliminar');
            query.action = "DeleteUA";
            query.params = { id: record.id };
            query.config.body = {
                id: record.id,
				deletedDate: new Date().toISOString(),
				deletedBy: record.deletedBy,
                deletedObs: record.deletedObs
            };
            console.log(' [DELETE] ID:', record.id, 'Body de eliminación:', query.config.body);
            break;
        default:
            console.log(' [UNKNOWN] Operación no reconocida:', list.selection.request);
            break;
    }

    console.log(' [PUSH_QUERY] Enviando query:', query);
    pushQuery(query);
}}

			/>
		);
	}

	const render = () => (
		<>
			<AmbitosTable
				data={list.data}
				loading={!!list.loading}
				noDataIndication={
					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
				}
				selection={{
					selected: [list.selection.record?.id].filter((r) => r),
					onSelect: (record, isSelect, index, e) => {
						console.log('🖱️ [TABLE_SELECT] Registro seleccionado:', record, 'Índice:', index);
						setList((o) => ({
							...o,
							selection: {
								...selectionDef,
								index,
								record,
							},
						}));
					},
				}}
			/>
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useAmbitos;
