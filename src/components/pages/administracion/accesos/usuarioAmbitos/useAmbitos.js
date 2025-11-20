
import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AmbitosTable from "./AmbitosTable";
import AmbitoUsuarioForm from "./UsuarioAmbitoForm";
import AuthContext from "store/authContext";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};
 
const useAmbitos = () => {
	// ✅ Obtener usuario actual del contexto
	const authContext = useContext(AuthContext);
	const usuarioActual = authContext?.usuario?.nombre || "Sistema";
	
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		console.log('useAmbitos_action',action," & ",params);
		switch (action) {
			case "GetList": {
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
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos`,
						method: "POST",
					},
				};
			}
			case "UpdateUA": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos`,
						method: "PUT",
					},
					params: otherParams,
				};
			}
			case "DeleteUA": {
				const { id, ...otherParams } = params;
				console.log('🔍 DeleteUA - Enviando al backend:', { id, ...otherParams }); // ✅ DEBUG
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos/DarDeBaja/${id}`,
						method: "PATCH",
						body: {
							deletedObs: otherParams.deletedObs,
							deletedBy: otherParams.deletedBy // ✅ AGREGADO: Incluir usuario de baja
						}
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
    console.log("useAmbitos_list",list)
    pushQuery({
        action: list.params.usuarioId ? "GetListByUsuarioId" : "GetList",
        params: { ...list.params },

        onOk: async (data) =>
            (
                console.log('ambitos_data',data),
                setList((o) => {
                    // Filtrar solo los datos que tengan deletedDate = null,
					//esto asegura que solo se muestren los ambitos activos
					// y no los que han sido eliminados.
                    const filteredData = data.filter(item => item.deletedDate === null);
                    
                    const selection = {
                        ...selectionDef,
                        record:
                            filteredData.find((r) => r.id === o.selection.record?.id) ?? filteredData.at(0),
                    };
                    if (selection.record)
                        selection.index = filteredData.indexOf(selection.record);
                    return {
                        ...o,
                        loading: null,
                        data: filteredData, // Usar los datos filtrados
                        error: null,
                        selection,
                    };
                })
            ),
        onError: async (err) =>
            setList((o) => ({
                ...o,
                loading: null,
                data: [],
                error: err.code === 404 ? null : err,
                selection: { ...selectionDef },
            })),
    });
}, [pushQuery, list.loading, list.params]);


	const requestChanges = useCallback((type, payload = {}) => {
		console.log('useAmbitos_requestChanges',type,' & ',payload)
		switch (type) {
			case "selected": {
				// ✅ Si es una baja (B), prellenar fecha y usuario actual
				const edit = payload.record || (payload.request === "A" ? {} : null);
				if (payload.request === "B" && edit) {
					edit.deletedDate = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
					edit.deletedBy = usuarioActual;
				}
				
				return setList((o) => ({
					...o,
					selection: {
						...o.selection,
						request: payload.request,
						action: payload.action,
						edit: {
							...(payload.request === "A" ? {} : o.selection.record),
							...edit,
						},
					},
				}));
			} 
			case "list": {
				if (payload.clear)
					return setList((o) => ({
						...o,
						loading: null,
						data: [],
						error: null,
						selection: { ...selectionDef },
					}));
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
	}, [usuarioActual]);

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
				onChange={(changes) =>
					{
						const errors = {};
						setList((old) => ({ ...old, loading: null }));
						if (list?.data?.find((t)=> t.ambitoId === changes?.ambitoId && t.ambitoTipo === list.selection?.edit?.ambitoTipo) != null && list.selection?.edit?.ambitoTipo !== "T")
						{ 
							 errors.ambitoId = "El Usuario ya posee este Ambito"
							 errors.ambitoExiste = true
						};

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
						}))
					}
				}
				


				
onClose={(confirm) => {
    if (!["A", "B", "M"].includes(list.selection.request))
        confirm = false;
    if (!confirm) {
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
    //Validaciones
    console.log("useAmbitos,Record",record)
    const errors = {};

    // Solo validar campos requeridos si NO es una eliminación
    if (list.selection.request !== "B") {
        if (!record.ambitoId && record.ambitoTipo !== "T") errors.ambitoId = "Dato requerido";
        if (!record.ambitoTipo) errors.ambitoTipo = "Dato requerido";
        
        // Solo validar duplicados en caso de agregar o modificar
        if (list?.data?.find((t)=> t.ambitoTipo === "T" ) != null && list.selection.edit.ambitoTipo === "T") {
            errors.ambitoTipo = "El Usuario ya posee este Ambito";
            errors.ambitoExiste = true;
        }
    }

    // Validación específica para eliminación
    if (list.selection.request === "B") {
        if (!record.deletedObs) errors.deletedObs = "Dato requerido";
    }

    console.log('useAmbitos_onChange',list.selection.edit.ambitoTipo)
    console.log('useAmbitos_onChange2',list.data)

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
        onOk: async (res) => {
            console.log('Operación exitosa:', res);
            // ✅ Si es baja, actualizar la lista filtrando el registro eliminado
            if (list.selection.request === "B") {
                // Primero cerrar el modal reseteando la selección
                setList((old) => ({
                    ...old,
                    selection: {
                        ...selectionDef,
                    },
                }));
                // Luego filtrar el registro de la lista
                setTimeout(() => {
                    setList((old) => ({
                        ...old,
                        loading: null,
                        data: old.data.filter(item => item.id !== record.id),
                    }));
                }, 100);
            } else if (["A", "M"].includes(list.selection.request)) {
                // Para agregar o modificar, recargar la lista
                setList((old) => ({
                    ...old,
                    loading: "Cargando...",
                    params: { ...old.params },
                }));
            } else {
                setList((old) => ({ ...old, loading: null }));
            }
        },
        onError: async (err) => {
            alert(err.message);
            setList((old) => ({ ...old, loading: null }));
        },
    };

    switch (list.selection.request) {
        case "A":
            query.action = "CreateUA";
            query.config.body = record;
            break;
        case "M":
            query.action = "UpdateUA";
            query.params = { id: record.id };
            query.config.body = record; 
            break;
        case "B":
            query.action = "DeleteUA";
            console.log('📤 Enviando baja de ámbito con:', { 
                id: record.id,
                deletedObs: record.deletedObs,
                deletedBy: record.deletedBy 
            }); // ✅ DEBUG
            query.params = { 
                id: record.id,
                deletedObs: record.deletedObs,
                deletedBy: record.deletedBy
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
			<AmbitosTable
				data={list.data}
				loading={!!list.loading}
				noDataIndication={
					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
				}
				selection={{
					selected: list.selection.record && list.data.find(d => d.id === list.selection.record.id) ? [list.selection.record.id] : [],
					onSelect: (record, isSelect, index, e) =>
						setList((o) => ({
							...o,
							selection: {
								...selectionDef,
								index,
								record,
							},
						})),
				}}
			/>
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useAmbitos;
