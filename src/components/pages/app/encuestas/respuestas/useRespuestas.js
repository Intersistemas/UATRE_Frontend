
import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import RespuestasTable from "./RespuestasTable";
import RespuestasTableDetalles from "./RespuestasTableDetalles";
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

      params: paramsInit = {
      sort: "-fecha",
      soloActivos: false,
    },
} = {}) => {
  const { usuario: Usuario } = useContext(AuthContext); // Obtenemos el usuario autenticado
  const [checked, setChecked] = useState(true); // Estado para manejar filtros (si es necesario)

  const [preguntasEncuesta, setPreguntasEncuesta] = useState([]);

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
        case "GetPreguntasEncuesta":
        return {
          config: {
            baseURL: "App",
            endpoint: `/Encuestas/${params.id}?Include=preguntas`,
            method: "GET",
          },
          params: {},
        };

      default:
        return null;
    }
  });

  // Estado inicial para manejar la lista de respuestas
  const [list, setList] = useState({
    loading: null,
    // params: {},
    data: [], // Datos que se mostrarán en la tabla
    respuestasTodas: [], // Todas las respuestas obtenidas
    error: null,
    selection: { ...selectionDef },
    params: { ...paramsInit, filtro: "" }, // ← AGREGADO filtro

    onEditValidate: onEditValidateInit,
    onEditChange: onEditChangeInit,
  });

  // Efecto para cargar los datos cuando `list.loading` cambia
useEffect(() => {
  if (!list.loading) return;

  // Verificación por consola
  console.log("[useEffect] list.params.encuestaId:", list.params.encuestaId);

  pushQuery({
    action: "GetPreguntasEncuesta",
    params: { id: list.params.encuestaId },
    onOk: (data) => {
      console.log("Preguntas obtenidas:", data);
      setPreguntasEncuesta(data.preguntas || []);
    },
    onError: (err) => console.error(" Error al cargar preguntas:", err),
  });

  pushQuery({
    action: "GetList",
    params: {
      ...list.params,
      include: "preguntas(detalles)",
      deleted: false,
    },

    onOk: async (response) => {
      console.log(" Respuestas obtenidas:", response.data);

      const todasLasRespuestas = Array.isArray(response.data) ? response.data : [];

      // Filtrar por encuestaId
      // const respuestasFiltradas = todasLasRespuestas.filter(
      //   (r) => r.encuestaId === list.params.encuestaId
      // );
      const respuestasFiltradas = todasLasRespuestas
      .filter((r) => r.encuestaId === list.params.encuestaId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // ✔️ orden descendente


      console.log(" Respuestas filtradas por encuestaId:", respuestasFiltradas);

      const record = respuestasFiltradas[0] ?? null;

      setList((prev) => ({
        ...prev,
        loading: null,
        data: respuestasFiltradas,
        error: null,
        selection: {
          ...selectionDef,
          record,
          index: record ? respuestasFiltradas.indexOf(record) : null,
        },
      }));
    },
    onError: async (err) => {
      console.error(" Error al cargar respuestas:", err);
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


  


const render = () => {
  // Filtro usuarios únicos basados en -> afiliadoNro
  const usuariosUnicos = Array.from(
    new Map(list.data.map((item) => [item.afiliadoNro, item])).values()
  );

  //----------------------------------------

  

const detallesCompletos = list.data
  .filter((item) => item.afiliadoNro === list.selection.record.afiliadoNro)
  .map((i) => {
    const pregunta = preguntasEncuesta.find((p) => p.id === i.encuestaPreguntaId);
    return {
      ...i,
      pregunta: pregunta || {
        tipoPregunta: "-",
        enunciado: "Pregunta no disponible"
      }
    };
  });


//------------------------------------------------


  return (
    <div>
    
      <RespuestasTable
        data={usuariosUnicos} // Pasamos solo los usuarios únicos a la tabla
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
              data: [], // Limpiamos los datos mientras se carga la nueva página
            })),
        }}
        selection={{
          selected: [list.selection.record?.afiliadoNro].filter((r) => r),
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
      
      

      {/* ------------------------------Detalles del usuario seleccionado---------------------------------------------- */}
      {list.selection.record && (
  <div style={{ marginTop: "20px" }}>
    <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
      Respuestas de la encuesta del Usuario Seleccionado: {list.selection.record.afiliadoNombre || "No disponible"}
    </h3>
    {list.data.some(
      (e) => e.afiliadoNro === list.selection.record.afiliadoNro
    ) ? (

          // <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          //   <thead>
          //     <tr>
          //       <th style={{ border: "1px solid #999", padding: "5px", backgroundColor: "#e0e0e0" }}>Tipo</th>
          //       <th style={{ border: "1px solid #999", padding: "5px", backgroundColor: "#e0e0e0" }}>Pregunta</th>
          //       <th style={{ border: "1px solid #999", padding: "5px", backgroundColor: "#e0e0e0" }}>Respuesta</th>
          //     </tr>
          //   </thead>
          //   <tbody>
          //     {list.data
          //       .filter((item) => item.afiliadoNro === list.selection.record.afiliadoNro)
          //       .map((i, index) => (
          //         <tr key={index}>
          //           <td style={{ border: "1px solid #999", padding: "5px" }}>
          //             {
          //                 preguntasEncuesta.find((p) => p.id === i.encuestaPreguntaId)?.tipoPregunta
          //                 || "-"
          //               }
          //           </td>
          //           <td style={{ border: "1px solid #999", padding: "5px" }}>
          //             {
          //                 preguntasEncuesta.find((p) => p.id === i.encuestaPreguntaId)?.enunciado
          //                 || "Pregunta no disponible"
          //               }
          //           </td>
          //           <td style={{ border: "1px solid #999", padding: "5px" }}>
          //             {i.valor || "Sin respuesta"}
          //           </td>
          //         </tr>
          //       ))}
          //   </tbody>
          // </table>
          
         <RespuestasTableDetalles
            data={detallesCompletos}
            loading={!!list.loading}
            noDataIndication={null}
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
                mode: 'none', // fuerzo a que no haya selección
                clickToSelect: false, // desactivo el clic visual
                selected: [],
                onSelect: () => {},
                style: { fontWeight: 'normal', backgroundColor: 'transparent' }, // opcional
              }}


          />
      ) : (
            <p style={{ textAlign: "center", color: "red" }}>
              No hay detalles disponibles para esta selección.
            </p>
          )}
        </div>
      )}

        </div>
      )}
    

  // Devolvemos el render y la función para manejar cambios
  // También devolvemos el registro seleccionado
  // para que pueda ser utilizado en otros componentes o funciones
  
  return [render, requestChanges, list.selection.record];
};

export default useRespuestas;