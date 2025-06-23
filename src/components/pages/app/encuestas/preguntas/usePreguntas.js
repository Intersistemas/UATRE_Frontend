

import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import PreguntasTable from "./PreguntasTable";
import PreguntasForm from "./PreguntasForm";
import AuthContext from "../../../../../store/authContext";
import dayjs from "dayjs";
// import moment from "moment";
// import FormatearFecha from "components/helpers/FormatearFecha";
// import { FormControlLabel, List, Switch } from "@mui/material";
import { id } from "components/helpers/Utils";
import { Fecha } from "components/helpers/Formato";

// const vigenteHasta = new Date(2099, 11, 31);
// const vigenteDesde = new Date();

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
  edit: null,
  errors: null,
};

const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) => true;

const usePreguntas = ({
  onEditValidate: onEditValidateInit = onEditValidateDef,
  onEditChange: onEditChangeInit = onEditChangeDef,
} = {}) => {
  const { usuario: Usuario } = useContext(AuthContext);
  // const [checked, setChecked] = useState(true);

  console.log("usuario data:", Usuario);
  

  //#region Configuración de las queries a la API
  const pushQuery = useQueryQueue((action, params) => {
    console.log("pushQuery_action USE_PREGUNTAS", action);
    console.log("pushQuery_params USE_PREGUNTAS", params);
    const { id, ...otherParams } = params;
    switch (action) {
      case "GetList":
        return {
          config: {
            baseURL: "App",
            endpoint: `/Encuestas/${id}`,
            method: "GET",
          },
          params: otherParams,
        };
      case "Create":
        return {
          config: {
            baseURL: "App",
            endpoint: `/Encuestas/${id}`,
            method: "PUT",
          },
          params: otherParams,
        };
      case "CreateEncuestaRespuestas":
        return {
          config: {
            baseURL: "App",
            endpoint: "/EncuestaRespuestas",
            method: "POST",
          },
          params: otherParams,
        };
      case "Update":
        return {
          config: {
            baseURL: "App",
            endpoint: `/Encuestas/${id}`,
            method: "PUT",
          },
          params: otherParams,
        };
      case "Delete":
        return {
          config: {
            baseURL: "App",
            endpoint: `/Encuestas/${id}`,
            method: "PUT",
          },
          params: otherParams,
          
        };
      default:
        return null;
    }
  });
 

  // Estado inicial y carga de datos
  const [list, setList] = useState({
    loading: null,
    params: {},
    cargos: [],
    data: [],
    error: null,
    selection: { ...selectionDef },
    onEditValidate: onEditValidateInit,
    onEditChange: onEditChangeInit,
  });
  console.log("Este es mi -> list de usePreguntas:", list);

  useEffect(() => {
    if (!list.loading) return;
    pushQuery({
      action: "GetList",
      params: {
        ...list.params,
        include: "preguntas(detalles)",
        //unicamente muestro las preguntas que no estas eliminada en la seccion de preguntas, ya que en la seccion de encuestas se muestran todas
        // filter: checked ? "deletedDate eq null" : "",
        deleted: false
        
        
      },
      onOk: async (data) => {
        setList((prev) => {
          console.log("data_UsePreguntas:", data);
          const record =
            data.preguntas?.find((r) => r.encuestaId === prev.selection.record?.id) ||
            data.preguntas?.[0];
          const selection = { ...selectionDef, record };
          if (record) {
            selection.index = data.preguntas.indexOf(record);
          }
          return {
            ...prev,
            loading: null,
            data: data.preguntas,
            error: null,
            selection,
          };
        });
      },
      onError: async (err) =>
        setList((prev) => ({
          ...prev,
          loading: null,
          data: [],
          error: err.code === 404 ? null : err,
          selection: { ...selectionDef },
        })),
    });
  }, [list.loading, pushQuery, list.params]);
  

  // Función para solicitar cambios en la selección o en la lista
  const requestChanges = useCallback((type, payload = {}) => {
    switch (type) {
      case "selected":
        setList((prev) => ({
          ...prev,
          selection: {
            ...prev.selection,
            request: payload.request,
            action: payload.action,
            // edit: {
            //   ...(payload.request === "A" ? {} : prev.selection.record),
            //   ...payload.record,
            // },
            edit: {
                ...(payload.request === "A" ? {} : prev.selection.record),
                ...payload.record,
                textoLibre:
                  payload.record?.tipoPregunta === "TX"
                    ? payload.record.detalles?.[0]?.texto || ""
                    : "",
              },
          },
        }));
        break;
      case "list":
        if (payload.clear) {
          setList((prev) => ({
            ...prev,
            loading: null,
            data: [],
            error: null,
            selection: { ...selectionDef },
          }));
        } else {
          setList((prev) => ({
            ...prev,
            loading: "Cargando...",
            params: { ...payload.params },
            data: [],
          }));
        }
        break;
      default:
        break;
    }
  }, []);
  

  let form = null;
  if (list.selection.edit) {
    form = (

      <PreguntasForm
       
        request={list.selection.request} // Tipo de acción (A, M, B, etc.)
        // data={(() => {
         
        //   const extraData =
        //      list.selection.request === "B"
        //       ? {
        //           deletedDate: dayjs().format("DD-MM-YYYY"),
        //           deletedBy: Usuario.nombre,
                  
                  
        //         }
        //       : {};

        //   return { ...list.selection.edit, ...extraData };
        // })()}
        data={(() => {
        const extraData =
          list.selection.request === "B"
            ? {
                deletedDate: dayjs().format("DD-MM-YYYY"),
                deletedBy: Usuario.nombre,
              }
            : {};

        return {
          ...list.selection.edit,
          ...extraData,
          preguntasList: list.data, // listado completo de preguntas
        };
      })()}

        //El titulo del formulario cambia según la acción que se esté realizando
        title={list.selection.action}
        //El objeto errors contiene los errores de validación del formulario
        errors={list.selection.errors}
        
        loading={!!list.loading}

        //Deshabilita los campos según la acción que se esté realizando para que no se editen es en true, y editables en false
        disabled={(() => {
          let r = ["A", "M"].includes(list.selection.request)
            ? {
             
                deletedDate: dayjs().format("DD-MM-YYYY"),
                fecha: false,
                
               
              }
            : { };
            if (list.selection.request === "B") {
            r = { ...r, deletedBy: true, deletedDate: true,  deletedObs: false, ordenPregunta: true, tipoPregunta: true, textoLibre: true, detalles: true, texto: true, enunciado: true};
          }
          return r;
        })()}
        //El hide es para ocultar los campos que no se quieren mostrar en el formulario
        
        hide={
          ["A", "M"].includes(list.selection.request)
            ? { deletedObs: true, deletedBy: true, deletedDate: true, tema: true }
            
            : ["B"].includes(list.selection.request) ? {
              deletedObs: false, deletedBy: false, deletedDate: false, tema: false, enunciado: false, ordenPregunta: false, tipoPregunta: false, textoLibre: false, detalles: false, texto: false
            } : {}
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
          setList((prev) => ({
            ...prev,
            selection: {
              ...prev.selection,
              edit: { ...prev.selection.edit, ...edit },
              errors: { ...prev.selection.errors },
            },
          }));
        }}
        onClose={(confirm) => {
          if (!["A", "B", "M"].includes(list.selection.request)) {
            confirm = false;
          }
          if (!confirm) {
            setList((prev) => ({
              ...prev,
              selection: {
                ...prev.selection,
                ...selectionDef,
                index: prev.selection.index,
                record:
                  !prev.selection.multi && prev.selection.index > -1
                    ? prev.data.at(prev.selection.index)
                    : prev.selection.record,
              },
            }));
            return;
          }

          const record = { ...list.selection.edit };

          

          // Validaciones---------------------------------------
          const errors = {};
          if (list.selection.request === "B") {
            if (!record.deletedObs) errors.deletedObs = "Dato requerido"; 
            //si me quiere seleccionar un diferente tipo depregunta me da un error 
            if(list.selection.record.tipoPregunta !== record.tipoPregunta) errors.tipoPregunta = "No se puede cambiar el tipo de pregunta una vez creada";  



          }

          //  if (list.selection.request === "A" || list.selection.request === "M") {
          //   if (!record.enunciado) errors.enunciado = "Dato requerido";
          //   if (!record.tipoPregunta) errors.tipoPregunta = "Dato requerido";
          //   //verifico que el orden no sea igual al de otra pregunta
          //   if (list.data.some(p => p.ordenPregunta === record.ordenPregunta && p.id !== record.id)) {
          //     errors.ordenPregunta = "No se puede ingresar un orden ya utilizado";
          //   }
          //   //El ordenPregunta no puede ser menor a 1
          //   if (record.ordenPregunta < 1) errors.ordenPregunta = "El orden de la pregunta no puede ser menor a 1";
          //   if (record.tipoPregunta === "MC" && !record.detalles) errors.detalles = "Dato requerido";
          //   if (record.tipoPregunta === "OP" && !record.enunciado) errors.enunciado = "Dato requerido";
          //   if (record.tipoPregunta === "TX" && !record.textoLibre) errors.textoLibre = "Dato requerido";
          //   if (Array.isArray(record.detalles)) {
          //     record.detalles.forEach((detalle, index) => {
          //       if (!detalle.texto) errors[`detalles[${index}].texto`] = "Dato requerido";
          //     });
          //   }

            
          // }
          if (list.selection.request === "A" || list.selection.request === "M") {
            if (!record.enunciado || record.enunciado.trim() === "") errors.enunciado = "Dato requerido";
            if (!record.tipoPregunta || record.tipoPregunta.trim() === "") errors.tipoPregunta = "Dato requerido";
            if (list.data.some(p => Number(p.ordenPregunta) === Number(record.ordenPregunta) && p.id !== record.id)) {
              errors.ordenPregunta = "No se puede ingresar un orden ya utilizado";
            }
            if (Number(record.ordenPregunta) < 1) errors.ordenPregunta = "El orden de la pregunta no puede ser menor a 1";
            if (record.tipoPregunta === "MC" && (!Array.isArray(record.detalles) || record.detalles.length === 0)) {
              errors.detalles = "Dato requerido";
            }
            if (record.tipoPregunta === "OP" && (!record.enunciado || record.enunciado.trim() === "")) {
              errors.enunciado = "Dato requerido";
            }




            if (Array.isArray(record.detalles)) {
              record.detalles.forEach((detalle, index) => {
                if (!detalle.texto || detalle.texto.trim() === "") errors[`detalles[${index}].texto`] = "Dato requerido";
              });
            }
          }

          list.onEditValidate({ edit: record, errors, request: list.selection.request });
          if (Object.keys(errors).length) {
            setList((prev) => ({
              ...prev,
              selection: { ...prev.selection, errors },
            }));
            return;
          }

          const query = {
            config: {},
            
            onOk: async (response) => {
                            setList((old) => ({ ...old, loading: "Cargando..." }));
                            
                    
                        },
              onError: async (error) => alert("Error al crear la encuesta: " + error.message),
          };

          switch (list.selection.request) {
        

            case "A":
              query.action = "Create";
              query.params = { id: record.seccionalId };
            
              // Generamos un ID único para la nueva pregunta
              const nuevaPregunta = {
                tipoPregunta: record.tipoPregunta,
                enunciado: record.enunciado,
                ordenPregunta: Number(record.ordenPregunta),
                detalles:
                record.tipoPregunta === "TX"
                  ? [{ texto: "" }]
                  : Array.isArray(record.detalles)
                    ? record.detalles.map(detalle => ({
                        texto: detalle.texto,
                        valorPorDefault: true,
                        esObligatorio: true
                      }))
                    : []

              };
            
              // Mantenemos las preguntas anteriores y agregamos la nueva
              query.config.body = {
                id: id(), // Generamos un ID único para la nueva pregunta
                fecha: record.fecha,
                tema: record.tema,
                fechaFinalizacion: record.fechaFinalizacion,
                preguntas: [...list.data, nuevaPregunta] // Mantenemos las preguntas previas y agregamos la nueva
              };
            
              // Actualizamos el estado local agregando la nueva pregunta sin eliminar las anteriores
              setList((prev) => ({
                ...prev,
                data: [...prev.data, nuevaPregunta], // Se mantiene la lista previa más la nueva pregunta
                selection: { ...selectionDef } // Se reinicia la selección
              }));
            
           
              
            

              break;
                
                case "M":
                      console.log("Me devuelve todas las preguntas", list.data);
                      console.log("Obtengo toda la información de la pregunta actual", record);
                      console.log("Obtengo el ID de encuesta desde parámetro ->", list.params.id);

                      query.action = "Update";
                      query.params = { id: record.seccionalId };

                      //Mantengo las preguntas anteriores y actualizamos solo la modificada
                      const preguntasActualizadas = list.data.map((pregunta) =>
                        pregunta.id === record.id
                          ? { //Si es la pregunta modificada, actualizamos los datos
                              ...pregunta,
                              encuestaId: record.encuestaId,
                              ordenPregunta: Number(record.ordenPregunta),
                              tipoPregunta: record.tipoPregunta,
                              enunciado: record.enunciado,
                              detalles:
                                record.tipoPregunta === "TX"
                                  ? [{ texto: record.textoLibre || "-" }]
                                : Array.isArray(record.detalles)
                                    ? record.detalles.map(detalle => ({
                                        encuestaPreguntaId: record.encuestaPreguntaId,
                                        texto: detalle.texto || "-",
                                        valorPorDefault: true,
                                        esObligatorio: true,
                                        id: detalle.id
                                      }))
                                    : [],


                            }
                          : pregunta //Si no es la pregunta modificada, la dejamos igual
                      );

                      query.config.body = {
                        fecha: record.fecha, 
                        tema: record.tema, 
                        fechaFinalizacion: record.fechaFinalizacion, 
                        preguntas: preguntasActualizadas, // incluye todas las preguntas actualizadas
                        id: list.params.id, // ID de la encuesta
                      };


                      //Actualizamos el estado manteniendo todas las preguntas pero con la modificada
                      setList((prev) => ({
                        ...prev,
                        data: preguntasActualizadas,
                        selection: { ...selectionDef }, // Reiniciamos la selección para evitar errores
                      }));

                      break;

                


              case "B":
                query.action = "Delete";
                query.params = { id: record.seccionalId };
            
                //Filtramos las preguntas y eliminamos solo la pregunta seleccionada
                const nuevasPreguntas = list.data.filter(p => p.id !== record.id);
            
                query.config.body = {
                    fecha: record.fecha, 
                    tema: record.tema, 
                    fechaFinalizacion: record.fechaFinalizacion, 
                    preguntas: nuevasPreguntas, // Enviamos la lista sin la pregunta eliminada
                    
                    //ID de la encuesta (necesario para identificar en la API)
                    id: list.params.id,
                    deletedObs: record.deletedObs, //Observaciones sobre la eliminación
                    deletedBy: record.deletedBy, //Usuario que elimina la pregunta
                    deletedDate: record.deletedDate, //Fecha de eliminación
                };
            
               
            
                //Actualizamos el estado eliminando solo la pregunta seleccionada
                setList((prev) => ({
                    ...prev,
                    data: nuevasPreguntas, // Quitamos solo la pregunta eliminada, sin afectar las demás
                    selection: { ...selectionDef },
                }));
            
                break;
            

                
              

            default:
              break;
          }
          pushQuery(query);
        }}
      />
    );
  }

  //#region Renderizado principal
  const render = () => (
    <div>

      <PreguntasTable
        data={list.data}
        loading={!!list.loading}
        noDataIndication={
          list.loading || list.error?.message || "No existen datos para mostrar"
        }
        pagination={{
          ...list.pagination,
          onChange: ({ index, size }) =>
            setList((prev) => ({
              ...prev,
              loading: "Cargando...",
              pagination: { index, size },
              data: [],
            })),
        }}
        selection={{
          selected: [list.selection.record?.id].filter(Boolean),
          onSelect: (record, isSelect, index, e) =>
            setList((prev) => ({
              ...prev,
              selection: {
                ...selectionDef,
                index,
                record,
              },
            })),
        }}
      />

      {list.selection.record && ((list.selection.record.tipoPregunta === "MC") || (list.selection.record.tipoPregunta === "OP")) ? (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
            Detalles de la pregunta seleccionada
          </h3>
          {list.selection.record.detalles && list.selection.record.detalles.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <tbody>
              
                 
                { list.selection.record.detalles.map((detalle, index) => (
                  
                  <tr key={index}>
                    <td
                      style={{
                        border: "1px solid rgb(53, 149, 210)",
                        padding: "3px",
                        textAlign: "center",
                        backgroundColor: "#f2f2f2",
                      }}
                    >
                      {detalle.texto || "Sin dato"}
                    </td>
                  </tr>
                )) }
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: "center", color: "red" }}>
              No hay detalles disponibles para esta selección.
            </p>
          )}
        </div>
      ) : null}
      {form}
    </div>
  );
  //#endregion

  return [render, requestChanges, list.selection.record];
};

export default usePreguntas;

