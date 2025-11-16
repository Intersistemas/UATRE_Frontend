
//////////////////////////////////////////////////
//Importaciones de librerías y componentes necesarios
import React, { useCallback, useEffect, useState, useContext } from "react";
import dayjs from "dayjs";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import { id, pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import AuthContext from "store/authContext";
import EncuestasTable from "./EncuestasTable";
import EncuestasForm from "./EncuestasForm";
// Definición del estado inicial para la selección de encuestas
const selectionDef = {
    action: "", // Acción a realizar (A, B, M, C)
    request: "", // Tipo de solicitud (Alta, Baja, Modificación, Consulta)
    index: null, // Índice del registro seleccionado
    record: null, // Registro seleccionado
    edit: null, // Datos en edición
    errors: null, // Errores de validación
};


// Funciones auxiliares para seleccionar registros al cargar datos
// export const onLoadSelectFirst = ({ data, multi, record }) => {
//     const dataArray = AsArray(data);
//     if (multi) {
//         record = AsArray(record);
//         let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
//         if (retorno.length === 0) retorno = [dataArray.at(0)].filter((r) => r);
//         return retorno.length ? retorno : null;
//     }
//     return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
// };
export const onLoadSelectFirst = ({ data, multi }) => {
    const dataArray = AsArray(data);
    if (multi) {
        // Selecciono solo el último si hay datos
        return dataArray.length ? [dataArray[dataArray.length - 1]] : null;
    }
    // Selecciono solo el último si hay datos
    return dataArray.length ? dataArray[dataArray.length - 1] : null;
};


// Función para seleccionar el mismo registro al cargar datos
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

// Funciones vacías por defecto para manejar cambios y validaciones
export const onDataChangeDef = (data = []) => {};
const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) => true;
const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
const onEditCompleteDef = ({ edit = {}, response = null, request = "", } = {}) => {};

// Hook principal para manejar la lógica de encuestas
const useEncuestas = ({
    remote: remoteInit = true,
    data: dataInit = [], 
    loading,
    error,
    //este "multi" es para saber si se pueden seleccionar varias encuestas a la vez
    multi: multiInit = false,
    //Maneja la paginación de las encuestas 
    // pagination: paginationInit = { index: 1, size: 3 },
    //Este params es para manejar los parámetros de la consulta a la API, los parámetros por defecto son:
    // sort: "+codigo" (para ordenar por código ascendente) y soloActivos: false (para traer todas las encuestas, no solo las activas)
    //
    params: paramsInit = {
        sort: "+codigo",
        soloActivos: false,
    },
    //Estas funciones se enargan de manejar los cambios en la lista de encuestas
    onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
    onDataChange: onDataChangeInit = onDataChangeDef,
    onEditChange: onEditChangeInit = onEditChangeDef,
    onEditValidate: onEditValidateInit = onEditValidateDef,
    onEditComplete: onEditCompleteInit = onEditCompleteDef,
    columns,
    hideSelectColumn = true,
    mostrarBuscar = false,


    filtroEstado = null,
} = {}) => {
    // Obtiene el usuario actual del contexto de autenticación
    const Usuario = useContext(AuthContext).usuario;

    // Función para armar las consultas a la API según la acción
    const pushQuery = useQueryQueue((action, params) => {
        const { id, ...otherParams } = params;
        switch (action) {
            case "GetList": {
                return {
                    config: {
                        baseURL: "App",
                        //si quiero traer los datos eliminados, cambio Deleted a true
                        //endpoint: `/Encuestas?Include=preguntas&Deleted=true&Sort=2&Page=1`,
                        endpoint: `/Encuestas`,
                        method: "GET",
                    },
                };
            }
            case "Create": {
                return {
                    config: {
                        baseURL: "App",
                        endpoint: `/Encuestas`,
                        method: "POST",
                    },
                };
            }
            case "Update": {
                return {
                    config: {
                        baseURL: "App",
                        endpoint: `/Encuestas/${id}`,
                        method: "PUT",
                    },
                    params: otherParams,
                };
            }
            case "Delete": {
                return {
                    config: {
                        baseURL: "App",
                        endpoint: `/Encuestas/${id}`,
                        method: "DELETE",
                    },
                    params: otherParams,
                };
            }
            default:
                return null;
        }
    });
    

    const [list, setList] = useState({
        loading: null,
        remote: remoteInit,
        loadingOverride: loading,
        params: { ...paramsInit, filtro: "" }, // ← AGREGADO filtro
        paramsDef: {
            ambitoTodos: Usuario.ambitoTodos,
            ambitoProvincias: Usuario.ambitoProvincias,
            ambitoDelegaciones: Usuario.ambitoDelegaciones,
            ambitoSeccionales: Usuario.ambitoSeccionales
        },
        delegaciones: [],
        
        // pagination: { index: 1, size: 3, ...paginationInit },
        pagination: { index: 1, size: 10}, // o el valor que desees por defecto

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

    // Efecto para cargar la lista de encuestas desde la API cuando corresponde
    useEffect(() => {
        if (!list.loading) return;
        const changes = { loading: null, error: null };

        // Si los datos son locales, solo actualiza el estado
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

        // Si los datos son remotos, hace la consulta a la API
        // changes.data = [];
        // pushQuery({
        //     action: "GetList",
        //     config: {
        //         params: {  // Parámetros de paginado y filtros
        //             ...list.paramsDef,
        //             ...list.params,
        //             pageIndex: list.pagination.index,
        //             pageSize: list.pagination.size,
        //         }
                
        //     },
        //     onOk: async ({ data, ...pagination }) => {
              changes.data = [];
        pushQuery({
            action: "GetList",
            config: {
                params: {
                    ...list.paramsDef,
                    ...list.params,
                    pageIndex: list.pagination.index,
                    pageSize: list.pagination.size,
                }
            },
            // onOk: async ({ data, ...pagination }) => {
                onOk: async ({ data, total, ...pagination }) => {

                if (!Array.isArray(data))
                    return console.error("Se esperaba un arreglo de encuestas en GetList", data);
                changes.data = data
                console.log("Datos obtenidos desde el endpoint  -> Encuestas en -> GetList", data);
                const multi = list.selection.multi;
                const record = list.selection.record;
                // changes.pagination = pagination;
                changes.pagination = { ...pagination, total };
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

    // Renderiza el formulario de edición/creación si corresponde
    let form = null;
    console.log("list.selection.edit", list.selection.edit);
    console.log("list.selection.request", list.selection.request);
    if (list.selection.edit) {
        
        form = (
            <EncuestasForm
                request = {list.selection.request}
                data={(() => {
                    // Si la solicitud es de baja, me muestra los datos del nombre del usuario actual y la fecha actual
                    // var data = (list.selection.request === "M" || list.selection.request === "B") ? {
                     var data = (list.selection.request === "B" || list.selection.request === "C") ? {
                        //Aqui lo que hago es mostrar los datos que quiero que se muestren en el formulario
                        deletedDate: dayjs().format("DD-MM-YYYY"),
                        deletedBy: Usuario.nombre,
                    }
                    
                    : {};
                    return { ...list.selection.edit, ...data };
                })()}
                // Título del formulario según la acción
                title={list.selection.action}
                // Muestra los errores de validación si existen
                errors={list.selection.errors}
                // Indica si está cargando datos
                loading={!!list.loading} 
                // Indica si el formulario está deshabilitado según la acción
                disabled={(() => {
                    //Aqui lo que hago es mostrar los campos que quiero que se muestren en el formulario
                 	const r = ["A", "M"].includes(list.selection.request)
                    //Esto es para mostrar los campos que quiera, pero  para que no se pueda editar
                 		? { 
                            fecha: true,
                        }
                        :  ["C"].includes(list.selection.request) ? {
                                deletedDate: dayjs().format("DD-MM-YYYY"),
                                deletedBy: true,
                                tema: true,
                                fecha: true,
                                fechaFinalizacion: true,
                                observaciones: true,
                          }:  ["B"].includes(list.selection.request) ? {
                                deletedDate: dayjs().format("DD-MM-YYYY"),
                                deletedBy: true,
                                tema: true,
                                fecha: true,
                                fechaFinalizacion: true,
                                observaciones: false,
                          }: {};
                    // if (list.selection.request !== "B"){
                    //     r.deletedObs = true;
                    //     r.deletedBy = true;
                    //     r.deletedDate = true;
                    //     r.fecha= true;
                    // }
                 	return r;
                 })()}

                 //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
                 //||||||||||||||||||||||||||||||||||||||||||||||||||||||
                 // Ocultar campos según el tipo de acción
                // hide={
                //     ["A", "M"].includes(list.selection.request)
                //         ? { deletedObs: true,
                //             deletedBy: true,
                //             deletedDate: true}
                //         : {}
                // }
                hide={
                ["A", "M"].includes(list.selection.request)
                    ? {
                        deletedObs: true,
                        deletedBy: true,
                        deletedDate: true,
                    }
                    : list.selection.request === "C"
                    ? {
                        deletedObs: !list.selection.record?.deletedDate ? true : false,
                        deletedBy: !list.selection.record?.deletedDate ? true : false,
                        deletedDate: !list.selection.record?.deletedDate ? true : false,
                    }
                    : {}
                }


                //Este onChange es el que se encarga de manejar los cambios en el formulario
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

                //Este onClose es el que se encarga de manejar el cierre del formulario
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
            
                    const errors = {};
                    // Validaciones según el tipo de solicitud 
                    if (list.selection.request === "B") {
                        if (!record.deletedObs) errors.deletedObs = "Dato requerido";
                    } 
                    //------------------------------------------------------------------------
                    if (list.selection.request === "A"){
                        if (!record.tema) errors.tema = "Dato requerido";
                        //   if (record.fechaFinalizacion === dayjs().format("DD-MM-YYYY")) errors.fechaFinalizacion = "Dato requerido";
                            if (record.fechaFinalizacion && dayjs(record.fechaFinalizacion).isBefore(dayjs())) {
                                errors.fechaFinalizacion = "La fecha debe ser igual o mayor a hoy";
                            }
                    }
                    //------------------------------------------------------------------------
                    if (list.selection.request === "M"){
                        if (!record.tema) errors.tema = "Dato requerido";
                        if (record.fechaFinalizacion === dayjs().format("DD-MM-YYYY")) errors.fechaFinalizacion = "Dato requerido";
                    }
                    //------------------------------------------------------------------------



                    //Esta función se encarga de validar los datos del formulario
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

                        // Ejecuta onEditComplete pasándole la encuesta recién creada
                        list.onEditComplete({
                            request: list.selection.request,
                            response,
                        });
                        },

                        onError: async (err) => alert(err.message),
                    };
                    switch (list.selection.request) {

                        // Crea una nueva encuesta
                        //------------------------------------------------
                        //||||||||||||||||||||||||||||||||||||||||||||||||
                    case "A":
                        query.action = "Create";
                        query.config.body = {
                            ...record,
                            preguntas: []
                        };
                        break;
                        // Actualiza el tema y la fecha de finalización
                        //------------------------------------------------
                        //||||||||||||||||||||||||||||||||||||||||||||||||
                    case "M":
                            query.action = "Update";
                            query.params = { id: record.id };
                            query.config.body = { 
                                fechaFinalizacion: record.fechaFinalizacion,
                                tema: record.tema,
                                //NO DEBO ENVIAR EL ARRAY DE PREGUNTA VACIO, PORQUE LAS ELIMINOS
                            }	
                            break;
                            // Elimina la encuesta (Da una baja logica, no física)
                        //------------------------------------------------
                        //||||||||||||||||||||||||||||||||||||||||||||||||
                    case "B":
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

    // Renderiza la tabla y el formulario (si corresponde)
    const render = () => (
        <>
{

        <EncuestasTable
                // remote={list.remote}
                // data={[...list.data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))} // Ordena del más nuevo al más viejo

                remote={list.remote}
                data={(filtroEstado
                    ? filtroEstado([...list.data])
                    : [...list.data]
                ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))}

                loading={!!list.loading}
    
                noDataIndication={
                    list.loading ??
                    list.loadingOverride ??
                    list.error?.message ??
                    "No existen datos para mostrar"
                }
                columns={columns}
                // mostrarBuscar={mostrarBuscar} 
                

                pagination={{
                    ...list.pagination,
                    total: list.pagination.total || list.data.length,
                    onChange: (pagination) =>
                        setList((o) => ({
                            ...o,
                            loading: "Cargando...",
                            pagination: { ...o.pagination, ...pagination },
                            data: [],
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
                //
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
            }
     {/*Renderiza el formulario */}
            {form}
        </>
    );

    // Devuelve el render, la función request y el registro seleccionado
    return { render, request, selected: list.selection.record };
   
};

export default useEncuestas;
