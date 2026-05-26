import { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AsArray from "components/helpers/AsArray";
import DenunciasTable from "./DenunciasTable";
import DenunciaDetails from "./DenunciaDetails";

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
};

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

export const onLoadSelectKeepOrFirst = ({ data, multi, record }) =>
  record ? record : onLoadSelectFirst({ data, multi, record });






const useDenuncias = ({
  remote = true,
  data: dataInit = [],
  loading,
  error,
  pagination: paginationInit = { index: 1, size: 10 },
  onLoadSelect = onLoadSelectFirst,
  columns,
  hideSelectColumn = true,
  filtroIds = [],
  hayFiltroActivo = false,
  filtroEstado = null,
  filtroFechaDesde = null,
  filtroFechaHasta = null,
  usuarioAmbito = null,
  applyAmbitoFilter = null,
  filtroTipoIngresoId = null,
  filtroSituacionId = null,
  filtroDerivadoATipo = null,
  filtroDerivadoAId = null,
} = {}) => {







  
  

  const pushQuery = useQueryQueue((action) => {
    if (action === "GetList") {
      return {
        config: {
          baseURL: "App",
          method: "GET", 
          endpoint: "/AppDenuncias",
        },
      };
    }
    if (action === "GetEstados") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/DenunciasEstados",
        },
      };
    }
    if (action === "GetTipoDenuncia") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/DenunciaTipo",
        },
      };
    }
    return null;
  });

  const [list, setList] = useState({
    loading: remote ? "Cargando..." : null,
    remote,
    loadingOverride: loading,
    params: { sortBy: "-fecha" },
    pagination: { index: 1, size: 10, ...paginationInit },
    data: [...AsArray(dataInit, true)],
    error,
    selection: { ...selectionDef },
    onLoadSelect,
  });

  useEffect(() => {
    if (!list.loading) return;
    const changes = { loading: null, error: null };

    if (!list.remote) {
      const data = list.data;
      const record = list.selection.record;
      changes.data = data;
      changes.selection = {
        ...list.selection,
        ...selectionDef,
        record: list.onLoadSelect({ data, multi: false, record }),
      };
      changes.selection.index = data.indexOf(changes.selection.record);
      setList((o) => ({ ...o, ...changes }));
      return;
    }

    changes.data = [];

    // Cargar todas las denuncias sin paginación para procesamiento client-side

    // � FUNCIÓN AUXILIAR PARA CARGAR DENUNCIAS (FLUJO NORMAL - TODAS SIN PAGINACIÓN)
    function cargarDenunciasConParametros(queryParams, totalFilteredCount) {
      //  Cargar todas las denuncias sin paginación del servidor
      const paramsFiltered = { ...queryParams };
      

      
      pushQuery({
        action: "GetList",
        params: paramsFiltered,
        onOk: (response) => {
          
          let data = [];
          let paginationInfo = {};

          if (response && typeof response === "object") {
            data = response.data || [];
            
            
            paginationInfo = {
              index: list.pagination.index, //  Mantener nuestro índice
              size: list.pagination.size,   //  Mantener nuestro tamaño (3)
              count: totalFilteredCount || response.count || 0,
              pages: Math.ceil((totalFilteredCount || response.count || 0) / list.pagination.size)
            };
          } else if (Array.isArray(response)) {
            data = response;
            
            
            paginationInfo = {
              index: list.pagination.index,
              size: list.pagination.size, //  Mantener nuestro tamaño (3)
              count: totalFilteredCount || response.length
            };
          } else {
            console.error("Formato de respuesta inesperado:", response);
            setList((o) => ({ 
              ...o, 
              loading: null,
              error: "Formato de respuesta inesperado",
              selection: { ...selectionDef }
            }));
            return;
          }

          if (!Array.isArray(data)) {
            console.error("Se esperaba un arreglo en data", { data, response });
            setList((o) => ({ 
              ...o, 
              loading: null,
              error: "Datos inválidos del servidor",
              selection: { ...selectionDef }
            }));
            return;
          }
          
          if (usuarioAmbito && usuarioAmbito.tipo && usuarioAmbito.id && applyAmbitoFilter && typeof applyAmbitoFilter === "function") {
            console.log(" Aplicando filtro por ámbito específico (flujo normal)...", {
              usuarioAmbito,
              totalDenunciasOriginales: data.length
            });
            try {
              applyAmbitoFilter(data, usuarioAmbito).then(filteredData => {
                console.log(" Filtro por ámbito aplicado (flujo normal) - RESULTADO:", {
                  totalOriginal: data.length,
                  totalFiltrado: filteredData.length,
                  ambitoTipo: usuarioAmbito.tipo,
                  ambitoId: usuarioAmbito.id
                });
                
                // Cargar estados después del filtro por ámbito
                cargarEstadosParaDenuncias(filteredData, {
                  ...paginationInfo,
                  count: filteredData.length // Actualizar count con datos filtrados
                });
              }).catch(error => {
                console.error(" Error aplicando filtro de ámbito:", error);
                // Cargar estados sin filtro por ámbito
                cargarEstadosParaDenuncias(data, paginationInfo);
              });
            } catch (error) {
              console.error(" Error aplicando filtro de ámbito:", error);
              // Cargar estados sin filtro por ámbito
              cargarEstadosParaDenuncias(data, paginationInfo);
            }
          } else {
            // Cargar estados para todas las denuncias
            cargarEstadosParaDenuncias(data, paginationInfo);
          }

          // 🔧 FUNCIÓN PARA CARGAR ESTADOS DE LAS DENUNCIAS
          function cargarEstadosParaDenuncias(denunciasData, paginationInfo) {

            
            pushQuery({
              action: "GetEstados",
              params: {}, // Sin filtro - obtener todos los estados
              onOk: (responseEstados) => {
                console.log("📥 Estados recibidos para flujo normal:", { 
                  tipo: typeof responseEstados, 
                  esArray: Array.isArray(responseEstados),
                  cantidad: Array.isArray(responseEstados) ? responseEstados.length : "N/A"
                });

                let estados = [];
                if (Array.isArray(responseEstados)) {
                  estados = responseEstados;
                } else if (responseEstados && typeof responseEstados === "object") {
                  estados = responseEstados.data || responseEstados.items || responseEstados.estados || [];
                }

                if (!Array.isArray(estados)) {
                  console.warn(" No se pudieron obtener los estados correctamente");
                  estados = [];
                }

                // Crear un mapa: appDenunciasId -> último estado (más reciente)
                const estadosMap = {};
                
                
                estados.forEach(item => {
                  const denunciaId = item.appDenunciasId || item.appDenuncia_Id || item.denunciaId || item.id;
                  const fechaEstado = item.fechaAsociada || item.fecha || item.fechaEstado || "";
                  
                  if (denunciaId) {
                    if (!estadosMap[denunciaId] || fechaEstado > (estadosMap[denunciaId].fecha || "")) {
                      estadosMap[denunciaId] = {
                        estado: item.estado || "Sin datos",
                        fecha: fechaEstado,
                        observaciones: item.observaciones || "",
                      };
                    }
                  }
                });


                //  COMBINAR ESTADOS CON DENUNCIAS
                let dataConEstados = denunciasData.map(denuncia => {
                  const denunciaId = denuncia.id || denuncia.Id;
                  const estadoInfo = estadosMap[denunciaId];
                  
                  return {
                    ...denuncia,
                    estado: estadoInfo ? estadoInfo.estado : (denuncia.estado || "Sin datos"),
                    fechaEstado: estadoInfo ? estadoInfo.fecha : null,
                    observacionesEstado: estadoInfo ? estadoInfo.observaciones : "",
                  };
                });


                if (filtroEstado) {
                  const filtroLower = String(filtroEstado).toLowerCase();
                  dataConEstados = dataConEstados.filter((d) =>
                    String(d.estado || "").toLowerCase() === filtroLower
                  );
                }


                if (filtroDerivadoAId) {
                  const target = Number(filtroDerivadoAId);
                  dataConEstados = dataConEstados.filter(d => {
                    const derivTipo = String(d.derivadoATipo || d.derivadoA_Tipo || d.derivado_a_tipo || "").toLowerCase();
                    const derivId = Number(d.derivadoAId ?? d.derivadoA_Id ?? d.derivado_a_id ?? 0);
                    return derivId === target || (derivId === target && (derivTipo === 'delegacion' || derivTipo === 'seccional'));
                  });
                }


                // ✅ ORDENAR POR FECHA DESCENDENTE (más nueva primero)
                const dataOrdenada = dataConEstados.sort((a, b) => {
                  const fechaA = new Date(a.fecha || a.fechaEstado || '1900-01-01');
                  const fechaB = new Date(b.fecha || b.fechaEstado || '1900-01-01');
                  return fechaB - fechaA; // Descendente
                });

                //  ACTUALIZAR ESTADO FINAL
                setList((o) => ({ 
                  ...o, 
                  loading: null,
                  data: dataOrdenada,
                  pagination: { ...o.pagination, ...paginationInfo },
                  selection: { 
                    ...selectionDef,
                    record: o.onLoadSelect({ data: dataOrdenada, multi: false, record: o.selection.record })
                  }
                }));
              },
              onError: (error) => {
                console.error(" Error al cargar estados:", error);
                
                // Si falla la carga de estados, mostrar denuncias sin estados pero ordenadas
                const denunciasOrdenadas = denunciasData.sort((a, b) => {
                  const fechaA = new Date(a.fecha || '1900-01-01');
                  const fechaB = new Date(b.fecha || '1900-01-01');
                  return fechaB - fechaA; // Descendente
                });
                
                setList((o) => ({ 
                  ...o, 
                  loading: null,
                  data: denunciasOrdenadas,
                  pagination: { ...o.pagination, ...paginationInfo },
                  selection: { 
                    ...selectionDef,
                    record: o.onLoadSelect({ data: denunciasOrdenadas, multi: false, record: o.selection.record })
                  }
                }));
              }
            });
          }
        },
        onError: (error) => {
          console.error(" Error cargando denuncias:", error);
          setList((o) => ({ 
            ...o, 
            loading: null,
            error: error,
            selection: { ...o.selection, ...selectionDef }
          }));
        }
      });
    }

   const queryParams = {};
   if (filtroFechaDesde) queryParams.fechaDesde = filtroFechaDesde;
   if (filtroFechaHasta) queryParams.fechaHasta = filtroFechaHasta;
   if (filtroTipoIngresoId) queryParams.denunciaTipoIngresoId = filtroTipoIngresoId;
   if (filtroSituacionId) queryParams.denunciaSituacionId = filtroSituacionId;
   if (filtroDerivadoATipo) queryParams.derivadoATipo = filtroDerivadoATipo;
   if (filtroDerivadoAId) queryParams.derivadoAId = filtroDerivadoAId;

   cargarDenunciasConParametros(queryParams, null);
   return;

  // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
    pushQuery,
    list.loading,
    filtroEstado,
    filtroFechaDesde,
    filtroFechaHasta,
    usuarioAmbito,
    applyAmbitoFilter,
    filtroTipoIngresoId,
    filtroSituacionId,
    filtroDerivadoATipo,
    filtroDerivadoAId,
  ]);

  //  ACTIVAR LOADING CUANDO CAMBIEN LOS FILTROS
  useEffect(() => {
    
    // Siempre activar loading y resetear a página 1 cuando cambien filtros
    setList((o) => ({
      ...o,
      loading: "Cargando...",
      pagination: { ...o.pagination, index: 1 } // Resetear a página 1
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [    filtroEstado,
    filtroFechaDesde,
    filtroFechaHasta,
    filtroTipoIngresoId,
    filtroSituacionId,
    filtroDerivadoATipo,
    filtroDerivadoAId,
  ]);

  const request = useCallback((type, payload = {}) => {
    if (type === "list") {
      setList((o) => {
        const changes = {
          loading: null,
          data: "data" in payload && Array.isArray(payload.data) ? [...payload.data] : payload.clear ? [] : o.data,
          loadingOverride: payload.loading,
          error: payload.error,
          onLoadSelect: "onLoadSelect" in payload ? payload.onLoadSelect : o.onLoadSelect,
        };

        if (payload.params) changes.params = { ...o.params, ...payload.params };
        if (payload.pagination) changes.pagination = { ...o.pagination, ...payload.pagination };

        if (payload.clear) {
          const data = changes.data;
          const record = o.selection.record;
          changes.selection = {
            ...o.selection,
            ...selectionDef,
            record: changes.onLoadSelect({ data, multi: false, record }),
          };
          changes.selection.index = data.indexOf(changes.selection.record);
        } else {
          //  Para paginación frontend, solo recargar si no es un cambio de página
          const isPaginationChange = payload.pagination && !payload.params && !payload.clear;
          if (!isPaginationChange) {
            changes.loading = "Cargando...";
          }
        }

        return { ...o, ...changes };
      });
    }
  }, []);

  const render = () => {




    const pagination = {
      count: list.data.length,
      index: list.pagination.index,
      size: list.pagination.size,
      onChange: ({ index, size }) => {

        request("list", {
          pagination: { index, size }
        });
      },
    };

    return (
      <>
        <DenunciasTable
          remote={false}
          data={list.data}
          loading={!!list.loading}
          noDataIndication={
            list.loading ?? list.loadingOverride ?? list.error?.message ?? (hayFiltroActivo && list.data.length === 0 ? "No hay denuncias que coincidan con los filtros aplicados" : "No existen datos para mostrar")
          }
          columns={columns}
          pagination={pagination}
          selection={{
            mode: "radio",
            hideSelectColumn,
            selected: list.selection.record ? [list.selection.record.id] : [],
            onSelect: (record) => {
              const index = list.data.findIndex((r) => r.id === record.id);
              setList((o) => ({
                ...o,
                selection: {
                  ...o.selection,
                  ...selectionDef,
                  index,
                  record,
                },
              }));
            },
          }}
          onTableChange={(type, newState) => {
            if (type === "sort") {
              const { sortField, sortOrder } = newState;
              setList((o) => ({
                ...o,
                loading: "Cargando...",
                params: {
                  ...o.params,
                  sortBy: `${sortOrder === "desc" ? "-" : "+"}${sortField}`,
                },
              }));
            }
          }}
        />
        {list.selection.record && list.data.length > 0 && (
          <DenunciaDetails
            config={{
              data: list.selection.record,
              tab: "denuncia",
            }}
          />
        )}
      </>
    );
  };

  return { render, request, selected: list.selection.record, data: list.data };
};

export default useDenuncias;