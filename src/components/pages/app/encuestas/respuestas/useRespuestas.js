
//________________________________________________________________________________________

import React, { useCallback, useState, useEffect } from "react";
import RespuestasTable from "./RespuestasTable";
import useQueryQueue from "components/hooks/useQueryQueue";

const useRespuestas = () => {

  // Definición inicial de la selección
  const selectionDef = {
    action: "",
    request: "",
    index: null,
    record: null,
    edit: null,
    errors: null,
  };

  //# Declaración de estados y carga de datos
  const [list, setList] = useState({
    loading: null,
    params: {}, // Inicializamos params como objeto vacío
    cargos: [],
    data: [],
    error: null,
    selection: { ...selectionDef },
  });


  //#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		console.log('COMPONENTE USE_RESPUESTAS:',action," & ",params);

		switch (action) {
			
			case "GetList": {


        const { id, ...otherParams } = params;
        

				return {
					config: {
						baseURL: "App",
						endpoint: `/EncuestaRespuestas`,
						method: "GET",
					},
          params: otherParams,
				};
			}
			default:
				return null;
		}
	});
	//#endregion

  useEffect(() => {
    console.log("useEffect_List_useRespuestas",list)
    if (!list.loading) return;
    pushQuery({
      action: "GetList",
      params: { ...list.params },
      onOk: async (data) =>(
        console.log("data_GetRepuestas",data),
        setList((o) => {
          const selection = {
            ...selectionDef,
            record:
              data?.data?.find((r) => r.id === o.selection.record?.id) ??  data?.data.at(0), // selecciono el primer el elemento por defecto, si es que el componetne anterior no me define QUÉ seleccionar
          };
          if (selection.record)
            selection.index =  data?.data.indexOf(selection.record);
          return {
            ...o,
            loading: null,
            data:  data?.data,
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
  //#endregion

  //# Manejo de cambios
  const requestChanges2 = useCallback((type, payload = {}) => {
    // console.log("%cDatos USE-RESPUESTAS_payload ->", "color: blue", payload);
    // console.log("%cDatos USE-RESPUESTAS_Type ->", "color: blue", type);
    switch (type) {
      case "selected":
        return setList((o) => ({
          ...o,
          selection: {
            ...o.selection,
            request: payload.request,
            action: payload.action,
          },
        }));

      case "list":
        return setList((o) => ({
          ...o,
          loading: payload.clear ? null : "Cargando...",
          params: payload.params || {}, // Evitar `undefined` en params
          data: payload.data || [], // Evitar `undefined` en data
          error: null,
          selection: payload.clear ? { ...selectionDef } : o.selection,
        }));

        // return setList((o) => ({
        //   ...o,
        //   loading: "Cargando...",
        //   params: { ...payload.params },
        //   data: payload.data,
        // }));

      default:
        return;
    }
  }, []);

  //////////////////////// Debugging \\\\\\\\\\\\\\\\\\\\\\\\\\
  // const DATA = list?.data;
  //const DATA2 = list?.params; // Asegurar que `DATA` no sea undefined



  // console.log("//////////////////////////////////////////////");
  // console.log("%c USE-RESPUESTAS DATA  ->", "color: green", DATA);
  // console.log("%c USE- RESPUESTA PARAMS->", "color: pink", DATA);

  /////////////////////// - \\\\\\\\\\\\\\\\\\\\\\\\\\\

  // 	const idPregunta = DATA?.idDePreguntaSeleccionadaSeccionalId; // Obtener ID de los params

  // const resultadosFiltrados = DATA.filter(e => e.id === idPregunta);
	// console.log("%cDATOS FILTRDOS FINAL->", "color: black", resultadosFiltrados);
	//---------------------------------///\\\---------------------------------


  //# Preguntas Renderizado 
  const render = () => {
    const hasData = Array.isArray(list.data) && list.data.length > 0;

    return (
      <div>
        {/* Validación para mostrar la tabla principal */}
        {hasData ? (  
          <RespuestasTable
            data={list.data}
			      //data={resultadosFiltrados}
            loading={!!list.loading}
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
              selected: list.selection.record?.id ? [list.selection.record.id] : [],
              onSelect: (record, isSelect, index) =>
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
        ) : (
          <p style={{ textAlign: "center", color: "gray" }}>No hay datos disponibles para mostrar.</p>
        )}
      </div>
    ); 
  };

  return [render, requestChanges2, list.selection.record];
};

export default useRespuestas;












