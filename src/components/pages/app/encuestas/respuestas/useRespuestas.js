// import React, { useCallback, useEffect, useState, useContext } from "react";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import RespuestasTable from "./RespuestasTable";
// import AuthContext from "../../../../../store/authContext";

// const selectionDef = {
//   action: "",
//   request: "",
//   index: null,
//   record: null,
//   edit: null,
//   errors: null,
// };

// const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
// const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) => true;

// const useRespuestas = ({
//   onEditValidate: onEditValidateInit = onEditValidateDef,
//   onEditChange: onEditChangeInit = onEditChangeDef,
// } = {}) => {
//   const { usuario: Usuario } = useContext(AuthContext);
//   const [checked, setChecked] = useState(true);

//   const pushQuery = useQueryQueue((action, params) => {
//     console.log("pushQuery_action USE_RESPUESTAS", action);
//     console.log("pushQuery_params USE_RESPUESTAS -------------", params.encuestaPreguntaId2);

//     switch (action) {
//       case "GetList":
//         return {
//           config: {
//             baseURL: "App",
//             endpoint: `/Encuestas`,
//             method: "GET",
//           },
//           params: { 
//             encuestaPreguntaId2: params.encuestaPreguntaId2,
//             include: params.include || "", 
//           },
//         };
//       default:
//         return null;
//     }
//   });

//   const [list, setList] = useState({
//     loading: null,
//     params: {},
//     data: [],
//     respuestasTodas: [],
//     error: null,
//     selection: { ...selectionDef },
//   });

//   useEffect(() => {
//     if (!list.loading) return;

//     pushQuery({
//         action: "GetList",
//         params: {
//             ...list.params,
//             include: "preguntas(detalles)",
//         },
//         onOk: async (response) => {
//             console.log("Respuesta de la API en useRespuestas:", response);

//             // Validamos que `response.data` sea un array antes de asignarlo
//             let preguntasData = Array.isArray(response.data) ? response.data : [];

//             const encuestaPreguntaId2 = list.params.encuestaPreguntaId2;

//             // Filtramos solo los datos donde el ID coincida y no tengan la propiedad `deletedBy`
//             preguntasData = preguntasData.filter(encuesta => 
//                 encuesta.id === encuestaPreguntaId2 && !encuesta.deletedBy
//             );

//             console.log("Datos filtrados sin deletedBy:", preguntasData);

//             setList((prev) => {
//                 const record = preguntasData.find(
//                     (r) => r.encuestaId === prev.selection.record?.id
//                 ) || preguntasData[0];

//                 const selection = { ...selectionDef, record };
//                 if (record) {
//                     selection.index = preguntasData.indexOf(record);
//                 }

//                 return {
//                     ...prev,
//                     loading: null,
//                     data: preguntasData, // Solo datos filtrados
//                     error: null,
//                     selection,
//                 };
//             });
//         },
//         onError: async (err) => {
//             console.error(" Error al cargar las preguntas:", err);
//             setList((prev) => ({
//                 ...prev,
//                 loading: null,
//                 data: [],  
//                 error: err.code === 404 ? null : err,
//                 selection: { ...selectionDef },
//             }));
//         },
//     });
//   }, [list.loading, pushQuery, list.params]);

//   const requestChanges = useCallback((type, payload = {}) => {
//     console.log('useSeccionalrespuestas Type:', type, " & payload:", payload);
//     switch (type) {
//       case "selected": {
//         return setList((o) => ({
//           ...o,
//           respuestasTodas: payload.respuestas,
//           selection: {
//             ...o.selection,
//             request: payload.request,
//             action: payload.action,
//             edit: {
//               ...(payload.request === "A" ? {} : o.selection.record),
//               ...payload.record,
//             },
//           },
//         }));
//       }
//       case "list": {
//         if (payload.clear)
//           return setList((o) => ({
//             ...o,
//             loading: null, 
//             data: [],
//             error: null,
//             selection: { ...selectionDef },
//           }));
//         console.log("payload.data in requestChanges:", payload.data);
//         return setList((o) => ({
//           ...o,
//           loading: "Cargando...",
//           respuestasTodas: payload.respuestas,
//           params: { ...payload.params },
//           data: Array.isArray(payload.data) ? payload.data : [],
//         }));
//       }
//       default:
//         return;
//     }
//   }, []);

//   const render = () => (
//     <div>
//       <RespuestasTable
//         data={list.data}
//         loading={!!list.loading}
//         noDataIndication={
//           list.loading ?? list.error?.message ?? "No existen datos para mostrar"
//         }
//         pagination={{
//           ...list.pagination,
//           onChange: ({ index, size }) =>
//             setList((o) => ({
//               ...o,
//               loading: "Cargando...",
//               pagination: { index, size },
//               data: [],
//             })),
//         }}
//         selection={{
//           selected: [list.selection.record?.id].filter((r) => r),
//           onSelect: (record, isSelect, index, e) =>
//             setList((o) => ({
//               ...o,
//               selection: {
//                 ...selectionDef,
//                 index,
//                 record,
//               },
//             })),
//         }}
//       />
//     </div>
//   );

//   return [render, requestChanges, list.selection.record];
// };

// export default useRespuestas;

// import React, { useCallback, useEffect, useState, useContext } from "react";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import RespuestasTable from "./RespuestasTable";
// import AuthContext from "../../../../../store/authContext";

// const selectionDef = {
//   action: "",
//   request: "",
//   index: null,
//   record: null,
//   edit: null,
//   errors: null,
// };

// const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
// const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) => true;

// const useRespuestas = ({
//   onEditValidate: onEditValidateInit = onEditValidateDef,
//   onEditChange: onEditChangeInit = onEditChangeDef,
// } = {}) => {
//   const { usuario: Usuario } = useContext(AuthContext);
//   const [checked, setChecked] = useState(true);

//   const pushQuery = useQueryQueue((action, params) => {
//     console.log("pushQuery_action USE_RESPUESTAS", action);
//     console.log("pushQuery_params USE_RESPUESTAS -------------", params.encuestaPreguntaId2);
   
    

//     switch (action) {
//       case "GetList":
//         return {
//           config: {
//             baseURL: "App",
//             endpoint: `/EncuestaRespuestas`,
//             method: "GET",
//           },
//           params: { 
//             encuestaPreguntaId2: params.encuestaPreguntaId2,
//             include: params.include || "", 
//           },
//         };
//       default:
//         return null;
//     }
//   });

//   const [list, setList] = useState({
//     loading: null, 
//     params: {},
//     data: [],
//     respuestasTodas: [],
//     error: null,
//     selection: { ...selectionDef },
//   });

//   useEffect(() => {
//     if (!list.loading) return;

//     pushQuery({
//         action: "GetList",
//         params: {
//             ...list.params,
//             include: "preguntas(detalles)",
//         },
//         onOk: async (response) => {
//             console.log(" Respuesta de la API en useRespuestas:", response);

//             // Valido que `response.data` sea un array antes de asignarlo
//             let preguntasData = Array.isArray(response.data) ? response.data : [];

//             // Filtro los datos para incluir solo aquellos con `id` igual a `params.encuestaPreguntaId2`
//             const encuestaPreguntaId2 = list.params.encuestaPreguntaId2;
//             preguntasData = preguntasData.filter(encuesta => encuesta.id === encuestaPreguntaId2);

//             console.log("Datos filtrados:", preguntasData);

//             setList((prev) => {
//                 const record = preguntasData.find(
//                     (r) => r.encuestaId === prev.selection.record?.id
//                 ) || preguntasData[0];

//                 const selection = { ...selectionDef, record };
//                 if (record) {
//                     selection.index = preguntasData.indexOf(record);
//                 }

//                 return {
//                     ...prev,
//                     loading: null,
//                     data: preguntasData, // Solo datos filtrados
//                     error: null,
//                     selection,
//                 };
//             });
//         },
//         onError: async (err) => {
//             console.error(" Error al cargar las preguntas:", err);
//             setList((prev) => ({
//                 ...prev,
//                 loading: null,
//                 data: [],  
//                 error: err.code === 404 ? null : err,
//                 selection: { ...selectionDef },
//             }));
//         },
//     });
//   }, [list.loading, pushQuery, list.params]);

//   const requestChanges = useCallback((type, payload = {}) => {
//     console.log('useSeccionalrespuestas Type:', type, " & payload:", payload);
//     switch (type) {
//       case "selected": {
//         return setList((o) => ({
//           ...o,
//           respuestasTodas: payload.respuestas,
//           selection: {
//             ...o.selection,
//             request: payload.request,
//             action: payload.action,
//             edit: {
//               ...(payload.request === "A" ? {} : o.selection.record),
//               ...payload.record,
//             },
//           },
//         }));
//       }
//       case "list": {
//         //ESTO ES PARA LIMPIAR LA LISTA DE RESPUESTAS Y VOLVER A CARGARLAS
//         if (payload.clear)
//           return setList((o) => ({
//             ...o,
//             loading: null, 
//             data: [],
//             error: null,
//             selection: { ...selectionDef },
//           }));
       

//           // console.log("payload.data in requestChanges:", payload.data);
//         //ESTO ES PARA CARGAR LAS RESPUESTAS DE LA ENCUESTA
//         return setList((o) => ({
//           ...o,
//           loading: "Cargando...",
//           respuestasTodas: payload.respuestas,
//           params: { ...payload.params },
//           data: Array.isArray(payload.data) ? payload.data : [],
//           // data: payload.data,
//         }));
        
//       }
      
//       default:
//         return;
//     }
//   }, []);

//   const render = () => (
//     <div>
//       <RespuestasTable
//         data={list.data}
//         loading={!!list.loading}
//         noDataIndication={
//           list.loading ?? list.error?.message ?? "No existen datos para mostrar"
//         }
//         pagination={{
//           ...list.pagination,
//           onChange: ({ index, size }) =>
//             setList((o) => ({
//               ...o,
//               loading: "Cargando...",
//               pagination: { index, size },
//               data: [],
//             })),
//         }}
//         selection={{
//           selected: [list.selection.record?.id].filter((r) => r),
//           onSelect: (record, isSelect, index, e) =>
//             setList((o) => ({
//               ...o,
//               selection: {
//                 ...selectionDef,
//                 index,
//                 record,
//               },
//             })),
//         }}
//       />
//     </div>
//   );

//   return [render, requestChanges, list.selection.record];
// };

// export default useRespuestas;
import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import RespuestasTable from "./RespuestasTable";
import AuthContext from "../../../../../store/authContext";

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
  const { usuario: Usuario } = useContext(AuthContext); // Obtenemos el usuario autenticado
  const [checked, setChecked] = useState(true); // Estado para manejar filtros (si es necesario)

  // Hook para manejar las consultas a la API
  const pushQuery = useQueryQueue((action, params) => {
    console.log("pushQuery_action USE_RESPUESTAS", action);
    console.log("pushQuery_params USE_RESPUESTAS", params);

    switch (action) {
      case "GetList":
        return {
          config: {
            baseURL: "App",
            endpoint: `/EncuestaRespuestas`, // Endpoint para obtener las respuestas
            method: "GET",
          },
          params: {
            encuestaPreguntaId2: params.encuestaPreguntaId2, // ID de la pregunta de la encuesta
            include: params.include || "", // Parámetros adicionales
          },
        };
      default:
        return null;
    }
  });

  // Estado inicial para manejar la lista de respuestas
  const [list, setList] = useState({
    loading: null,
    params: {},
    data: [], // Datos que se mostrarán en la tabla
    respuestasTodas: [], // Todas las respuestas obtenidas
    error: null,
    selection: { ...selectionDef },
  });

  // Efecto para cargar los datos cuando `list.loading` cambia
  useEffect(() => {
    if (!list.loading) return;

    pushQuery({
      action: "GetList",
      params: {
        ...list.params,
        include: "preguntas(detalles)", // Incluimos detalles de las preguntas
        deleted: false, // Solo respuestas no eliminadas
      },

      
      onOk: async (response) => {
        console.log("Respuesta de la API en useRespuestas:", response);

        // Validamos que `response.data` sea un array antes de procesarlo
        const preguntasData = Array.isArray(response.data) ? response.data : [];

        // Filtramos los datos según el ID de la pregunta de la encuesta
        const encuestaPreguntaId2 = list.params.encuestaPreguntaId2;
        const datosFiltrados = preguntasData.filter(
          (encuesta) => encuesta.encuestaPreguntaId === encuestaPreguntaId2
        );



        console.log("Datos filtrados:", datosFiltrados);

        setList((prev) => {
          const record =
            datosFiltrados.find(
              (r) => r.encuestaId === prev.selection.record?.id
            ) || datosFiltrados[0];

          const selection = { ...selectionDef, record };
          if (record) {
            selection.index = datosFiltrados.indexOf(record);
          }

          return {
            ...prev,
            loading: null,
            data: datosFiltrados, // Pasamos los datos filtrados
            error: null,
            selection,
          };
        });
      },
      onError: async (err) => {
        console.error("Error al cargar las preguntas:", err);
        setList((prev) => ({
          ...prev,
          loading: null,
          data: [],
          error: err.code === 404 ? null : err,
          selection: { ...selectionDef },
        }));
      },
    });
  }, [list.loading, pushQuery, list.params]);

  // Función para manejar cambios en la lista o selección
  const requestChanges = useCallback((type, payload = {}) => {
    console.log("useRespuestas Type:", type, " & payload:", payload);
    switch (type) {
      case "selected": {
        return setList((o) => ({
          ...o,
          respuestasTodas: payload.respuestas,
          selection: {
            ...o.selection,
            request: payload.request,
            action: payload.action,
            edit: {
              ...(payload.request === "A" ? {} : o.selection.record),
              ...payload.record,
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
          respuestasTodas: payload.respuestas,
          params: { ...payload.params },
          data: Array.isArray(payload.data) ? payload.data : [],
        }));
      }
      default:
        return;
    }
  }, []);


  

  // Renderizamos el componente `RespuestasTable`
  const render = () => (
    <div>
      <RespuestasTable
        data={list.data} // Pasamos los datos a la tabla
        loading={!!list.loading} // Indicamos si está cargando
        noDataIndication={
          list.loading ?? list.error?.message ?? "No existen datos para mostrar"
        }
        pagination={{
          ...list.pagination,
          onChange: ({ index, size }) =>
            setList((o) => ({
              ...o,
              loading: "Cargando...",
              pagination: { index, size },
              data: [],
            })),
        }}
        selection={{
          selected: [list.selection.record?.id].filter((r) => r),
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
      {/* ------------------------------Detalles----------------------------------------- */}
      {/* // Renderizamos los detalles de la pregunta seleccionada */}
      {/* // Verificamos si hay datos relacionados con el registro seleccionado */}

        {list.selection.record && (
        <div style={{ marginTop: "20px" }}>
         
          {list.selection.record && (
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
          Detalles de la pregunta seleccionada
        </h3>

        {/* // Verificamos si hay datos relacionados con el registro seleccionado */}
        {list.data.some(e => e.afiliadoNro === list.selection.record.afiliadoNro) ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
          
            <tbody>
              {/* // Renderizamos los detalles de la pregunta seleccionada */}
              {list.data
              // Filtramos los datos relacionados con el registro seleccionado
              //si es igual al afiliadoNro del registro seleccionado realizamos el mapeo
                .filter(e => e.afiliadoNro === list.selection.record.afiliadoNro) 
                .map((i, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        border: "1px solid rgb(53, 149, 210)",
                        padding: "3px",
                        textAlign: "center",
                        backgroundColor: "#f2f2f2",
                      }}
                    >
                      {i.valor || "Sin dato"}
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
        </div>
      )}
    </div>
  );

  // Devolvemos el render y la función para manejar cambios
  // También devolvemos el registro seleccionado
  // para que pueda ser utilizado en otros componentes o funciones
  
  return [render, requestChanges, list.selection.record];
};

export default useRespuestas;