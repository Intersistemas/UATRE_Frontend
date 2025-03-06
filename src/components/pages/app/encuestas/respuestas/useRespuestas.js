
// //________________________________________________________________________________________

// import React, { useCallback, useState, useEffect } from "react";
// import RespuestasTable from "./RespuestasTable";
// import useQueryQueue from "components/hooks/useQueryQueue";

// const useRespuestas = () => {

//   // Definición inicial de la selección
//   const selectionDef = {
//     action: "",
//     request: "", 
//     index: null,
//     record: null,
//     edit: null,
//     errors: null,
//   };

//   //# Declaración de estados y carga de datos
//   const [list, setList] = useState({
//     loading: null,
//     params: {}, // Inicializamos params como objeto vacío
//     cargos: [],
//     data: [],
//     error: null,
//     selection: { ...selectionDef },
//   });


//   //#region Trato queries a APIs
// 	const pushQuery = useQueryQueue((action, params) => {
// 		console.log('COMPONENTE USE_RESPUESTAS:',action," & ",params);

// 		switch (action) {
			
// 			case "GetList": {


//         const { id, ...otherParams } = params;
        

// 				return {
// 					config: {
// 						baseURL: "App",
// 						endpoint: `/EncuestaRespuestas`,
// 						method: "GET",
// 					},
//           params: otherParams,
// 				};
// 			}
// 			default:
// 				return null;
// 		}
// 	});
// 	//#endregion

//   useEffect(() => {
//     console.log("useEffect_List_useRespuestas",list)
//     if (!list.loading) return;
//     pushQuery({
//       action: "GetList",
//       params: { ...list.params },
//       onOk: async (data) =>(
//         console.log("data_GetRepuestas",data),
//         setList((o) => {
//           const selection = {
//             ...selectionDef,
//             record:
//               data?.data?.find((r) => r.id === o.selection.record?.id) ??  data?.data.at(0), // selecciono el primer el elemento por defecto, si es que el componetne anterior no me define QUÉ seleccionar
//           };
//           if (selection.record)
//             selection.index =  data?.data.indexOf(selection.record);
//           return {
//             ...o,
//             loading: null,
//             data:  data?.data,
//             error: null,
//             selection,
//           };
//         })
//       ),
//       onError: async (err) =>
//         setList((o) => ({
//           ...o,
//           loading: null,
//           data: [],
//           error: err.code === 404 ? null : err,
//           selection: { ...selectionDef },
//         })),
//     });
//   }, [pushQuery, list.loading, list.params]);
//   //#endregion

//   //# Manejo de cambios
//   const requestChanges2 = useCallback((type, payload = {}) => {
//     // console.log("%cDatos USE-RESPUESTAS_payload ->", "color: blue", payload);
//     // console.log("%cDatos USE-RESPUESTAS_Type ->", "color: blue", type);
//     switch (type) {
//       case "selected":
//         return setList((o) => ({
//           ...o,
//           selection: {
//             ...o.selection,
//             request: payload.request,
//             action: payload.action,
//           },
//         }));

//       case "list":
//         return setList((o) => ({
//           ...o,
//           loading: payload.clear ? null : "Cargando...",
//           params: payload.params || {}, // Evitar `undefined` en params
//           data: payload.data || [], // Evitar `undefined` en data
//           error: null,
//           selection: payload.clear ? { ...selectionDef } : o.selection,
//         }));

//         // return setList((o) => ({
//         //   ...o,
//         //   loading: "Cargando...",
//         //   params: { ...payload.params },
//         //   data: payload.data,
//         // }));

//       default:
//         return;
//     }
//   }, []);

//   //////////////////////// Debugging \\\\\\\\\\\\\\\\\\\\\\\\\\
//   // const DATA = list?.data;
//   //const DATA2 = list?.params; // Asegurar que `DATA` no sea undefined



//   // console.log("//////////////////////////////////////////////");
//   // console.log("%c USE-RESPUESTAS DATA  ->", "color: green", DATA);
//   // console.log("%c USE- RESPUESTA PARAMS->", "color: pink", DATA);

//   /////////////////////// - \\\\\\\\\\\\\\\\\\\\\\\\\\\

//   // 	const idPregunta = DATA?.idDePreguntaSeleccionadaSeccionalId; // Obtener ID de los params

//   // const resultadosFiltrados = DATA.filter(e => e.id === idPregunta);
// 	// console.log("%cDATOS FILTRDOS FINAL->", "color: black", resultadosFiltrados);
// 	//---------------------------------///\\\---------------------------------


//   //# Preguntas Renderizado 
//   const render = () => {
//     const hasData = Array.isArray(list.data) && list.data.length > 0;

//     return (
//       <div>
//         {/* Validación para mostrar la tabla principal */}
//         {hasData ? (  
//           <RespuestasTable
//             data={list.data}
// 			      //data={resultadosFiltrados}
//             loading={!!list.loading}
//             noDataIndication={
//               list.loading ?? list.error?.message ?? "No existen datos para mostrar"
//             }
//             pagination={{
//               ...list.pagination,
//               onChange: ({ index, size }) =>
//                 setList((o) => ({
//                   ...o,
//                   loading: "Cargando...",
//                   pagination: { index, size },
//                   data: [],
//                 })),
//             }}
//             selection={{
//               selected: list.selection.record?.id ? [list.selection.record.id] : [],
//               onSelect: (record, isSelect, index) =>
//                 setList((o) => ({
//                   ...o,
//                   selection: {
//                     ...selectionDef,
//                     index,
//                     record,
//                   },
//                 })),
//             }}
//           />
//         ) : (
//           <p style={{ textAlign: "center", color: "gray" }}>No hay datos disponibles para mostrar.</p>
//         )}
//       </div>
//     ); 
//   };

//   return [render, requestChanges2, list.selection.record];
// };

// export default useRespuestas;





import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import RespuestasTable from "./RespuestasTable";
import RespuestasForm from "./RespuestasForm";
import AuthContext from "../../../../../store/authContext";
import dayjs from "dayjs";
import moment from "moment";
import FormatearFecha from "components/helpers/FormatearFecha";
import { FormControlLabel, List, Switch } from "@mui/material";
import { id } from "components/helpers/Utils";
import { Fecha } from "components/helpers/Formato";

const vigenteHasta = new Date(2099, 11, 31);
const vigenteDesde = new Date();

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

const useRespuestas = ({
  onEditValidate: onEditValidateInit = onEditValidateDef,
  onEditChange: onEditChangeInit = onEditChangeDef,
} = {}) => {
  const { usuario: Usuario } = useContext(AuthContext);
  const [checked, setChecked] = useState(true);

  //#region Configuración de las queries a la API
  const pushQuery = useQueryQueue((action, params) => {
    console.log("pushQuery_action USE_RESPUESTAS", action);
    console.log("pushQuery_params USE_RESPUESTAS", params);
    const { id, ...otherParams } = params;

    switch (action) {
      case "GetList":
        return {
          config: {
            baseURL: "App",
            endpoint: `/EncuestaRespuestas/${id}`,
            method: "GET",
          },
          params: otherParams,
        };
      case "Create":
        return {
          config: {
            baseURL: "App",
            endpoint: `/EncuestaRespuestas/${id}`,
            method: "PUT",
          },
          params: otherParams,
        };
      case "Update":
        return {
          config: {
            baseURL: "App",
            endpoint: `/EncuestaRespuestas/${id}`,
            method: "PUT",
          },
          params: otherParams,
        };
      case "Delete":
        return {
          config: {
            baseURL: "App",
            endpoint: `/EncuestaRespuestas/${id}`,
            method: "DELETE",
          },
          params: otherParams,
        };
      default:
        return null;
    }
  });
  //#endregion

  //#region Estado inicial y carga de datos
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

  useEffect(() => {
    if (!list.loading) return;
    pushQuery({
      action: "GetList",
      params: {
        ...list.params,
        include: "preguntas(detalles)",
      },
      onOk: async (data) => {
        setList((prev) => {
          console.log("data_useRespuestas:", data);
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
  //#endregion

  //#region Función para solicitar cambios en la selección o en la lista
  const requestChanges = useCallback((type, payload = {}) => {
    switch (type) {
      case "selected":
        setList((prev) => ({
          ...prev,
          selection: {
            ...prev.selection,
            request: payload.request,
            action: payload.action,
            edit: {
              ...(payload.request === "A" ? {} : prev.selection.record),
              ...payload.record,
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
  //#endregion

  let form = null;
  if (list.selection.edit) {
    form = (
      <RespuestasForm
        request={list.selection.request} // Tipo de acción (A, M, B, etc.)
        data={(() => {
         
          const extraData =
            list.selection.request === "M" || list.selection.request === "B"
              ? {
                  deletedDate: dayjs().format("DD-MM-YYYY"),
                  deletedBy: Usuario.nombre,
                  
                }
              : {};
          return { ...list.selection.edit, ...extraData };
        })()}
        title={list.selection.action}
        errors={list.selection.errors}
        loading={!!list.loading}
        disabled={(() => {
          let r = ["A", "M"].includes(list.selection.request)
            ? {
                deletedDate: dayjs().format("DD-MM-YYYY"),
                deletedBy: false,
                fecha: false,
                fechaFinalizacion: false,
                observaciones: false,
                tema: false,
                respuestas: false,
                enunciado: true,
                
              }
            : { };
            if (list.selection.request === "B") {
            r = { ...r, deletedBy: true, deletedDate: true,  deletedObs: false, ordenPregunta: true, tipoPregunta: true, textoLibre: true, detalles: true, texto: true };
          }
          return r;
        })()}
        hide={
          ["A", "M"].includes(list.selection.request)
            ? { deletedObs: true, deletedBy: true, deletedDate: true, tema: true }
            
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
          console.log("Record_useRespuestas <zz<zz<zz<zz", record);

          // Validaciones
          const errors = {};
          if (list.selection.request === "B") {
            if (!record.deletedObs) errors.deletedObs = "Dato requerido";
          }
          if (list.selection.request === "A" || list.selection.request === "M") {
            if (!record.enunciado) errors.enunciado = "Dato requerido";
            if (!record.tipoPregunta) errors.tipoPregunta = "Dato requerido";
            if (!record.ordenPregunta) errors.ordenPregunta = "Dato requerido";
            //El ordenPregunta no puede ser menor a 1
            if (record.ordenPregunta < 1) errors.ordenPregunta = "El orden de la pregunta no puede ser menor a 1";
            // if (record.tipoPregunta === "MC" && !record.detalles) errors.detalles = "Dato requerido";
            // if (record.tipoPregunta === "OP" && !record.enunciado) errors.enunciado = "Dato requerido";
            // if (record.tipoPregunta === "TX" && !record.textoLibre) errors.textoLibre = "Dato requerido";
            if (Array.isArray(record.detalles)) {
              record.detalles.forEach((detalle, index) => {
                if (!detalle.texto) errors[`detalles[${index}].texto`] = "Dato requerido";
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
            // onOk: async (response) => {
            //     try {
            //       const data = await response.json();
            //       console.log("Encuesta creada con éxito:", data);
            //       setList((prev) => ({
            //         ...prev,
            //         selection: { ...prev.selection, edit: null }, // Cierra el formulario
            //       }));
            //     } catch (error) {
            //       console.error("Error al parsear la respuesta JSON:", error);
            //       alert("Error al crear la encuesta: Respuesta no válida del servidor");
            //     }
            //   },
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
              onError: async (error) => alert("Error al crear la encuesta: " + error.message),
          };

          switch (list.selection.request) {
        
 
               case "A":
                  query.action = "Create";
                  query.params = { id: record.seccionalId }; //-------->
                  query.config.body = {
                   
                    id: id(), //genero un id para la pregunta
                    fecha: record.fecha, // Obtener la fecha de record
                    tema: record.tema, // Obtener el tema de record
                    fechaFinalizacion: record.fechaFinalizacion, // Obtener la fechaFinalizacion de record
                    respuestas: [
                      {
                        tipoPregunta: record.tipoPregunta,
                        enunciado: record.enunciado,
                        ordenPregunta: Number(record.ordenPregunta), 
                        detalles:
                          (record.tipoPregunta === "TX" && record.textoLibre) ? [{ texto: record.textoLibre }] :
                            Array.isArray(record.detalles) ? record.detalles.map(detalle => ({
                              texto: detalle.texto,
                              valorPorDefault: true,
                              esObligatorio: true
                            })) : []
                      },
                    ],
                  };
                  break;
                 
                case "M":
                  console.log("Me devuelve toda las respuestas", list.data)
                  console.log("Obtengo toda la informacion de la pregunta actual", record)
                  console.log("Obtengo el id de encuesta desde parametro ->",list.params.id)
                  query.action = "Update";
                  query.params = { id: record.seccionalId };
                  query.config.body = {
                   
                    
                    cuil: record.tema, // Obtener el tema de record
                    encuestaId: record.encuestaId, // Obtener la fechaFinalizacion de record
                    respuestas: [
                      {
                        encuestaPreguntaId: record.encuestaPreguntaId,
                        valor: record.valor,
                        //Este es el ID de la pregunta
                        id: record.id 
                      },
                     
                    ],
                    
                    //Este es el id de la encuesta
                    id: list.params.id
                  };

                    break;
                
                
            case "B":
              query.action = "Delete";
              query.params = { id: record.seccionalId };
              query.config.body = {
                id: record.id,
                // deletedObs: record.deletedObs,
                // seccionalEstadoId: record.seccionalId,

                
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

  //#region Renderizado principal
  const render = () => (
    <div>
      {/* Opcional: Control para filtrar por vigencia */}
      {/* <FormControlLabel
        className="position-absolute"
        style={{ marginTop: "-2.5em" }}
        control={<Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
        label="Solo vigentes"
      /> */}
      <RespuestasTable
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
      {list.selection.record && (
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
                {list.selection.record.detalles.map((detalle, index) => (
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
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: "center", color: "red" }}>
              No hay detalles disponibles para esta selección.
            </p>
          )}
        </div>
      )}
      {form}
    </div>
  );
  //#endregion

  return [render, requestChanges, list.selection.record];
};

export default useRespuestas;











