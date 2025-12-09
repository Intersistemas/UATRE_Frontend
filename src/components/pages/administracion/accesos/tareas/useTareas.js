
import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import TareaTable from "./TareaTable";
import TareaUsuarioForm from "./TareaUsuarioForm";
import AuthContext from "store/authContext";

const selectionDef = {
    action: "",
    request: "",
    index: null,
    record: null,
    edit: null,
    errors: null,
};
 
const useTareas = () => {
    // Obtener usuario actual del contexto
    const authContext = useContext(AuthContext);
    const usuarioActual = authContext?.usuario?.nombre || "Sistema";
    
    // Factory que traduce acciones a requests para useQueryQueue
    const pushQuery = useQueryQueue((action, params) => {
        console.log('useTareas_action(factory)', action, params);
        switch (action) {
            case "GetList": {
                return {
                    config: {
                        baseURL: "Seguridad",
                        endpoint: `/Tareas`,
                        method: "GET",
                    },
                };
            }
            case "GetListByModuloId": {
                return {
                    config: {
                        baseURL: "Seguridad",
                        endpoint: `/UsuariosModulosTareas/GetByUsuarioId`,
                        method: "GET",
                    },
                    params, // si tu queue monta params en query string
                };
            }
            case "GetListByUsuarioId": {
                return {
                    config: {
                        baseURL: "Seguridad",
                        endpoint: `/UsuariosModulosTareas/GetByUsuarioId`,
                        method: "GET",
                    },
                    params,
                };
            }
            case "CreateUT": {
                return {
                    config: {
                        baseURL: "Seguridad",
                        endpoint: `/UsuariosModulosTareas`,
                        method: "POST",
                    },
                };
            }
            case "UpdateUT": {
                const { id, ...otherParams } = params || {};
                return {
                    config: {
                        baseURL: "Seguridad",
                        endpoint: `/UsuariosModulosTareas/${id}`,
                        method: "PUT",
                    },
                    params: otherParams,
                };
            }
            // Baja lógica con PATCH — enviar solo los campos requeridos
            case "DarDeBajaUT": {
                const { id } = params || {};
                return {
                    config: {
                        baseURL: "Seguridad",
                        endpoint: `/UsuariosModulosTareas/DarDeBaja/${id}`,
                        method: "PATCH",
                        
                    },
                    
                    params: {},
                };
            }
            default:
                return null;
        }
    });

    // estado de la lista y selección
    const [list, setList] = useState({
        loading: null,
        params: {},
        data: [],
        error: null,
        selection: { ...selectionDef },
    });

    // Cargar lista cuando list.loading esté activo
    useEffect(() => {
        if (!list.loading) return;
        
        pushQuery({
            action: list.params.usuarioId ? "GetListByUsuarioId" : "GetList",
            params: { ...list.params },

            onOk: async (data) => {
                console.log('tareas_data', data);
                setList((o) => {
                    const filteredData = Array.isArray(data) ? data.filter(item => item.deletedDate === null) : [];
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
                        data: filteredData,
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
                    error: err?.code === 404 ? null : err,
                    selection: { ...selectionDef },
                })),
        });
    }, [pushQuery, list.loading, list.params]);

    // handler de interacciones (abrir modal, cambiar filtros, etc.)
    const requestChanges = useCallback((type, payload = {}) => {
        console.log('useTareas_requestChanges', type, payload);
        switch (type) {
            case "selected": {
                const edit = payload.record || (payload.request === "A" ? {} : null);
                if (payload.request === "B" && edit) {
                    edit.deletedDate = new Date().toISOString().split('T')[0];
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
                if (payload.clear) {
                    return setList((o) => ({
                        ...o,
                        loading: null,
                        data: [],
                        error: null,
                        selection: { ...selectionDef },
                    }));
                }
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

    // formulario modal
    let form = null;
    if (list.selection.edit) {
        form = (
            <TareaUsuarioForm
                loading={!!list.loading}
                data={list.selection.edit}
                title={list.selection.action}
                errors={list.selection.errors}
                disabled={(() => {
                    const r = ["A", "M"].includes(list.selection.request)
                        ? {}
                        : {
                                tareasId: true,
                                modulosId: true,
                                deletedDate: true,
                                deletedBy: true
                          };
                    if (list.selection.request !== "B") r.deletedObs = true;
                    return r;
                })()}
                hide={
                    ["A", "M"].includes(list.selection.request)
                        ? { deletedObs: true }
                        : {}
                }
                onChange={(changes) =>
                    {
                        console.log('useTareas_onChange', changes)
                        const errors = {};
                        if (list?.data?.find((t) => t.tareasId === changes?.tareasId) != null)
                        { 
                            errors.tareasId = "El Usuario ya posee esta Tarea"
                            errors.tareaExiste = true
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
                    // Validaciones
                    const errors = {};
                    if (!record.tareasId) errors.tareasId = "Dato requerido";
                    if (!record.modulosId) errors.modulosId = "Dato requerido";
                    if (list.selection.request === "B") {
                        if (!record.deletedObs) errors.deletedObs = "Debe proporcionar una razón para la baja";
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

                    const query = {
                        config: {},
                        onOk: async (res) => {
                            console.log('Operación exitosa:', res);
                            if (list.selection.request === "B") {
                                // cerrar modal
                                setList((old) => ({
                                    ...old,
                                    selection: {
                                        ...selectionDef,
                                    },
                                }));
                                // eliminar registro localmente (ya que es baja lógica)
                                setTimeout(() => {
                                    setList((old) => ({
                                        ...old,
                                        loading: null,
                                        data: old.data.filter(item => item.id !== record.id),
                                    }));
                                }, 100);
                            } else if (["A", "M"].includes(list.selection.request)) {
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
                            console.error('Error en operación:', err);
                            alert(err?.message ?? "Error en la operación");
                            setList((old) => ({ ...old, loading: null }));
                        },
                    };

                    switch (list.selection.request) {
                        case "A": // Agregar
                            query.action = "CreateUT";
                            query.config.body = record;
                            query.config.headers = { "Content-Type": "application/json" };
                            break;
                        case "M": // Modificar
                            query.action = "UpdateUT";
                            query.params = { id: record.id };
                            query.config.body = record;
                            query.config.headers = { "Content-Type": "application/json" };
                            break;
                        case "B": // Baja lógica — enviar sólo los campos requeridos
                            query.action = "DarDeBajaUT";
                            console.log('📤 Enviando baja de tarea con:', { 
                                id: record.id,
                                deletedObs: record.deletedObs,
                                deletedBy: record.deletedBy 
                            });
                           
                            // pasar id en params para que el factory arme la URL
                            query.params = { id: record.id };
                            query.config.body = {
                                deletedObs: record.deletedObs,
                                deletedBy: record.deletedBy
                            };
                            query.config.headers = { "Content-Type": "application/json" };
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
            <TareaTable
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

export default useTareas;