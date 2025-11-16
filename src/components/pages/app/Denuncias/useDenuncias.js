// // export default useDenuncias;
// import { useCallback, useEffect, useState } from "react";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import AsArray from "components/helpers/AsArray";
// import DenunciasTable from "./DenunciasTable";
// import DenunciaDetails from "./DenunciaDetails";


// const selectionDef = {
//   action: "",
//   request: "",
//   index: null,
//   record: null,
// };

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
} = {}) => {
  
  // DEBUG: Verificar parámetros recibidos
  console.log("🔧 DEBUG useDenuncias - Parámetros recibidos:", {
    usuarioAmbito,
    applyAmbitoFilter: !!applyAmbitoFilter,
    hayFiltroActivo,
    filtroIds: filtroIds?.length || 0,
    filtroEstado: filtroEstado || "Ninguno",
    filtroFechaDesde: filtroFechaDesde || "Ninguna",
    filtroFechaHasta: filtroFechaHasta || "Ninguna"
  });
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
    return null;
  });

  const [dataOriginal, setDataOriginal] = useState([]);

  const [list, setList] = useState({
    loading: remote ? "Cargando..." : null, // Activar loading si es remote
    remote,
    loadingOverride: loading,
    params: { sortBy: "+fecha" },
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

    // SOLUCIÓN: Si el backend no respeta paginación, traemos TODO y paginamos en cliente
    console.log("🔍 Iniciando carga de denuncias...", {
      pageIndex: list.pagination.index,
      pageSize: list.pagination.size,
    });

    pushQuery({
      action: "GetList",
      params: {}, // SIN parámetro Page - traemos todo
      onOk: async (response) => {
        console.log("🎯 Respuesta del servidor:", { 
          tipo: typeof response, 
          esArray: Array.isArray(response),
          cantidad: Array.isArray(response) ? response.length : "N/A"
        });
        
        // Normalizar respuesta del API
        let data = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (response && typeof response === "object") {
          data = response.data || response.items || response.results || response.denuncias || [];
        } else {
          console.error("Formato de respuesta inesperado:", response);
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Se esperaba un arreglo en data", { data, response });
          return;
        }

        console.log("📊 Total de registros recibidos del API:", data.length);

        // Aplicar filtro por ámbito PRIMERO (antes de paginar)
        let dataFiltradaPorAmbito = data;
        
        if (usuarioAmbito && applyAmbitoFilter && typeof applyAmbitoFilter === "function") {
          try {
            console.log("🚀 Aplicando filtro por ámbito...");
            dataFiltradaPorAmbito = await applyAmbitoFilter(data, usuarioAmbito);
            console.log("🔐 Filtro por ámbito aplicado:", {
              totalOriginal: data.length,
              totalFiltrado: dataFiltradaPorAmbito.length,
              ambitoTipo: usuarioAmbito?.tipo,
              ambitoId: usuarioAmbito?.id,
            });
          } catch (error) {
            console.error("❌ Error aplicando filtro de ámbito:", error);
            dataFiltradaPorAmbito = data;
          }
        }

        // Guardar dataset completo (filtrado por ámbito) para usar con filtros posteriores
        setDataOriginal(dataFiltradaPorAmbito);

        // 🔄 CARGAR ESTADOS DE TODAS LAS DENUNCIAS
        console.log("🔄 Cargando estados de las denuncias...");
        
        pushQuery({
          action: "GetEstados",
          params: {}, // Sin filtros, traer todos los estados
          onOk: async (responseEstados) => {
            console.log("📥 Estados recibidos:", { 
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
              console.warn("⚠️ No se pudieron obtener los estados correctamente");
              estados = [];
            }

            // Crear un mapa: appDenunciasId -> último estado
            const estadosMap = {};
            estados.forEach(item => {
              const denunciaId = item.appDenunciasId || item.appDenuncia_Id || item.denunciaId;
              const fechaEstado = item.fecha || item.fechaEstado || "";
              
              if (denunciaId) {
                // Si ya existe un estado para esta denuncia, mantener el más reciente
                if (!estadosMap[denunciaId] || fechaEstado > (estadosMap[denunciaId].fecha || "")) {
                  estadosMap[denunciaId] = {
                    estado: item.estado || "Sin datos",
                    fecha: fechaEstado,
                    observaciones: item.observaciones || "",
                  };
                }
              }
            });

            console.log("📊 Estados procesados:", {
              totalEstados: estados.length,
              denunciasConEstado: Object.keys(estadosMap).length,
              primerosEstados: Object.entries(estadosMap).slice(0, 3),
            });

            // 🔗 COMBINAR ESTADOS CON DENUNCIAS
            const dataConEstados = dataFiltradaPorAmbito.map(denuncia => {
              const denunciaId = denuncia.id || denuncia.Id;
              const estadoInfo = estadosMap[denunciaId];
              
              return {
                ...denuncia,
                estado: estadoInfo ? estadoInfo.estado : (denuncia.estado || "Sin datos"),
                fechaEstado: estadoInfo ? estadoInfo.fecha : null,
                observacionesEstado: estadoInfo ? estadoInfo.observaciones : "",
              };
            });

            console.log("✅ Datos combinados con estados:", {
              totalDenuncias: dataConEstados.length,
              primerasDenuncias: dataConEstados.slice(0, 2).map(d => ({
                id: d.id,
                nombre: d.nombre,
                estado: d.estado,
              })),
            });

            // Actualizar dataOriginal con los estados
            setDataOriginal(dataConEstados);

            // ✅ PAGINACIÓN DEL LADO DEL CLIENTE
            const totalRecords = dataConEstados.length;
            const { index: pageIndex, size: pageSize } = list.pagination;
            const startIndex = (pageIndex - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const dataPaginada = dataConEstados.slice(startIndex, endIndex);

            console.log("📄 Paginación aplicada:", {
              totalRegistros: totalRecords,
              paginaActual: pageIndex,
              tamañoPagina: pageSize,
              rangoInicio: startIndex,
              rangoFin: endIndex,
              registrosEnPagina: dataPaginada.length,
            });

            changes.data = dataPaginada;
            changes.pagination = { 
              index: pageIndex, 
              size: pageSize, 
              count: totalRecords 
            };

            const record = list.selection.record;
            if (dataPaginada.length === 0) {
              changes.selection = { ...selectionDef };
            } else {
              changes.selection = {
                ...list.selection,
                ...selectionDef,
                record: list.onLoadSelect({ data: dataPaginada, multi: false, record }),
              };
              changes.selection.index = dataPaginada.indexOf(changes.selection.record);
            }

            // Aplicar cambios finales
            setList((o) => ({ ...o, ...changes }));
          },
          onError: async (error) => {
            console.error("❌ Error al cargar estados:", error);
            
            // Continuar sin estados en caso de error
            const totalRecords = dataFiltradaPorAmbito.length;
            const { index: pageIndex, size: pageSize } = list.pagination;
            const startIndex = (pageIndex - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const dataPaginada = dataFiltradaPorAmbito.slice(startIndex, endIndex);

            changes.data = dataPaginada;
            changes.pagination = { 
              index: pageIndex, 
              size: pageSize, 
              count: totalRecords 
            };

            const record = list.selection.record;
            if (dataPaginada.length === 0) {
              changes.selection = { ...selectionDef };
            } else {
              changes.selection = {
                ...list.selection,
                ...selectionDef,
                record: list.onLoadSelect({ data: dataPaginada, multi: false, record }),
              };
              changes.selection.index = dataPaginada.indexOf(changes.selection.record);
            }

            setList((o) => ({ ...o, ...changes }));
          },
        });
      },
      onError: async (error) => {
        console.error("❌ Error al cargar denuncias:", error);
        if (error.code !== 404) {
          changes.error = error;
        }
        changes.selection = { ...list.selection, ...selectionDef };
        changes.loading = null;
        setList((o) => ({ ...o, ...changes }));
      },
      // NO usar onFinally aquí porque los cambios se aplican dentro del callback de estados
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushQuery, list.loading]);

  // Filtrar por ESTADO y FECHAS cuando sea necesario
  useEffect(() => {
    // Si no hay datos originales, salir
    if (!dataOriginal.length) {
      return;
    }

    // Si no hay ningún filtro activo, salir
    if (!filtroEstado && !filtroFechaDesde && !filtroFechaHasta) {
      return;
    }

    console.log("🔎 Aplicando filtros...", {
      totalOriginal: dataOriginal.length,
      filtroEstado: filtroEstado || "Ninguno",
      filtroFechaDesde: filtroFechaDesde || "Ninguna",
      filtroFechaHasta: filtroFechaHasta || "Ninguna",
    });

    let datosFiltrados = [...dataOriginal];

    // 1️⃣ FILTRO POR ESTADO (filtro directo sobre los datos)
    if (filtroEstado) {
      console.log("🔎 Aplicando filtro por Estado:", filtroEstado);
      datosFiltrados = datosFiltrados.filter((item) => {
        const estadoItem = item.estado || "Sin datos";
        const match = estadoItem === filtroEstado;
        return match;
      });
      console.log("✅ Filtro por Estado aplicado. Resultados:", datosFiltrados.length);
    }

    // 2️⃣ FILTRO POR FECHA DESDE
    if (filtroFechaDesde) {
      console.log("🔎 Aplicando filtro por Fecha Desde:", filtroFechaDesde);
      datosFiltrados = datosFiltrados.filter((item) => {
        const fechaItem = item.fecha ? String(item.fecha).slice(0, 10) : null;
        if (!fechaItem) return false;
        return fechaItem >= filtroFechaDesde;
      });
      console.log("✅ Filtro por Fecha Desde aplicado. Resultados:", datosFiltrados.length);
    }

    // 3️⃣ FILTRO POR FECHA HASTA
    if (filtroFechaHasta) {
      console.log("🔎 Aplicando filtro por Fecha Hasta:", filtroFechaHasta);
      datosFiltrados = datosFiltrados.filter((item) => {
        const fechaItem = item.fecha ? String(item.fecha).slice(0, 10) : null;
        if (!fechaItem) return false;
        return fechaItem <= filtroFechaHasta;
      });
      console.log("✅ Filtro por Fecha Hasta aplicado. Resultados:", datosFiltrados.length);
    }

    console.log("✅ Filtros combinados aplicados:", {
      totalFiltrado: datosFiltrados.length,
    });

    // ✅ APLICAR PAGINACIÓN DESPUÉS DE LOS FILTROS
    setList((o) => {
      const totalRecords = datosFiltrados.length;
      const { index: pageIndex, size: pageSize } = o.pagination;
      const startIndex = (pageIndex - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const dataPaginada = datosFiltrados.slice(startIndex, endIndex);

      console.log("📄 Paginación aplicada a los filtros:", {
        totalFiltrado: totalRecords,
        paginaActual: pageIndex,
        registrosEnPagina: dataPaginada.length,
      });

      const newState = {
        ...o,
        data: dataPaginada,
        pagination: { ...o.pagination, count: totalRecords },
      };

      if (dataPaginada.length === 0) {
        newState.selection = { ...selectionDef };
      } else {
        const recordSelected = o.selection.record;
        if (recordSelected && !dataPaginada.find((item) => item.id === recordSelected.id)) {
          newState.selection = { ...selectionDef };
        }
      }

      return newState;
    });
  }, [filtroEstado, filtroFechaDesde, filtroFechaHasta, dataOriginal]);

  // ✅ Re-paginar cuando cambia el índice o tamaño de página (SIN filtros activos)
  useEffect(() => {
    // Solo aplicar cuando NO hay filtros activos y hay datos originales
    if ((filtroEstado || filtroFechaDesde || filtroFechaHasta) || !dataOriginal.length || list.loading) {
      return;
    }

    console.log("📄 Re-aplicando paginación (sin filtros)...", {
      pageIndex: list.pagination.index,
      pageSize: list.pagination.size,
      totalOriginal: dataOriginal.length,
    });

    setList((o) => {
      const { index: pageIndex, size: pageSize } = o.pagination;
      const totalRecords = dataOriginal.length;
      const startIndex = (pageIndex - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const dataPaginada = dataOriginal.slice(startIndex, endIndex);

      console.log("✅ Paginación re-aplicada:", {
        registrosEnPagina: dataPaginada.length,
        totalRecords,
      });

      return {
        ...o,
        data: dataPaginada,
        pagination: { ...o.pagination, count: totalRecords },
      };
    });
  }, [list.pagination.index, list.pagination.size, dataOriginal, filtroEstado, filtroFechaDesde, filtroFechaHasta, list.loading]);

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
          // ✅ Solo cargar desde servidor si es necesario
          // Si solo cambió la paginación, NO hacer loading (paginación del lado cliente)
          const onlyPaginationChange = payload.pagination && !payload.params && !payload.data;
          if (!onlyPaginationChange) {
            changes.loading = "Cargando...";
          }
        }

        return { ...o, ...changes };
      });
    }
  }, []);

  const render = () => {
    const denunciasData = {
      data: list.data,
      totalRegs: list.pagination.count,
      page: list.pagination.index,
      sizePerPage: list.pagination.size,
    };

    const pagination = {
      count: denunciasData.totalRegs,
      index: denunciasData.page,
      size: denunciasData.sizePerPage,
      onChange: ({ index, size }) => {
        request("list", {
          pagination: { index, size },
          data: list.remote ? [] : list.data,
        });
      },
    };

    return (
      <>
        <DenunciasTable
          remote={list.remote}
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

  return { render, request, selected: list.selection.record };
};

export default useDenuncias;
 
