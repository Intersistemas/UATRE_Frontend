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
          console.log(" Respuesta recibida de /AppDenuncias:", response);
          
          let data = [];
          let paginationInfo = {};

          if (response && typeof response === "object") {
            data = response.data || [];
            
            //  Log para ver la estructura de los primeros registros
            if (Array.isArray(data) && data.length > 0) {
              console.log(" Estructura de datos de denuncia (primeros 2 registros):", {
                primerRegistro: data[0],
                segundoRegistro: data[1] || "No hay segundo registro",
                camposTelefono: {
                  telefono: data[0]?.telefono,
                  telefonoContacto: data[0]?.telefonoContacto,
                  telContacto: data[0]?.telContacto,
                  tel: data[0]?.tel
                }
              });
            }
            
            paginationInfo = {
              index: list.pagination.index, //  Mantener nuestro índice
              size: list.pagination.size,   //  Mantener nuestro tamaño (3)
              count: totalFilteredCount || response.count || 0,
              pages: Math.ceil((totalFilteredCount || response.count || 0) / list.pagination.size)
            };
          } else if (Array.isArray(response)) {
            data = response;
            
            //  Log para ver la estructura cuando es array directo
            if (data.length > 0) {
              console.log(" Estructura de datos de denuncia (array directo - primeros 2 registros):", {
                primerRegistro: data[0],
                segundoRegistro: data[1] || "No hay segundo registro",
                camposTelefono: {
                  telefono: data[0]?.telefono,
                  telefonoContacto: data[0]?.telefonoContacto,
                  telContacto: data[0]?.telContacto,
                  tel: data[0]?.tel
                }
              });
            }
            
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



          //  APLICAR FILTRO POR ÁMBITO SOLO SI HAY ÁMBITO ESPECÍFICO
          console.log(" VERIFICANDO FILTRO DE ÁMBITO:", {
            usuarioAmbito,
            tieneUsuarioAmbito: !!usuarioAmbito,
            tieneApplyAmbitoFilter: typeof applyAmbitoFilter === "function",
            totalDenunciasOriginales: data.length
          });
          
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
            console.log(" Sin filtro por ámbito - mostrando todas las denuncias (flujo normal):", {
              tieneUsuarioAmbito: !!usuarioAmbito,
              usuarioAmbitoTipo: usuarioAmbito?.tipo,
              usuarioAmbitoId: usuarioAmbito?.id,
              tieneApplyAmbitoFilter: typeof applyAmbitoFilter === "function",
              razonNoFiltrar: !usuarioAmbito ? "Sin usuarioAmbito" : 
                             !usuarioAmbito.tipo ? "Sin tipo" :
                             !usuarioAmbito.id ? "Sin id" :
                             typeof applyAmbitoFilter !== "function" ? "Sin función de filtro" : "Desconocida"
            });
            // Cargar estados para todas las denuncias
            cargarEstadosParaDenuncias(data, paginationInfo);
          }

          // 🔧 FUNCIÓN PARA CARGAR ESTADOS DE LAS DENUNCIAS
          function cargarEstadosParaDenuncias(denunciasData, paginationInfo) {
            console.log("Cargando estados para el flujo normal...");
            
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
                
                console.log("🔍 DEBUG ESTADOS - Estructura de primeros estados recibidos:", {
                  totalEstados: estados.length,
                  primerosEstados: estados.slice(0, 3).map(item => ({
                    appDenunciasId: item.appDenunciasId,
                    appDenuncia_Id: item.appDenuncia_Id,
                    denunciaId: item.denunciaId,
                    id: item.id,
                    estado: item.estado,
                    fecha: item.fecha,
                    fechaAsociada: item.fechaAsociada,
                    fechaEstado: item.fechaEstado,
                    itemCompleto: item
                  }))
                });
                
                estados.forEach(item => {
                  const denunciaId = item.appDenunciasId || item.appDenuncia_Id || item.denunciaId || item.id;
                  const fechaEstado = item.fechaAsociada || item.fecha || item.fechaEstado || "";
                  
                  console.log("🔍 DEBUG ESTADOS - Procesando estado:", {
                    denunciaId,
                    idOriginal: item.appDenunciasId,
                    idAlternativo1: item.appDenuncia_Id,
                    idAlternativo2: item.denunciaId,
                    idGeneral: item.id,
                    estado: item.estado,
                    fechaEstado
                  });
                  
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

                console.log("🔍 DEBUG ESTADOS - Mapa de estados creado:", {
                  totalEstados: estados.length,
                  denunciasConEstado: Object.keys(estadosMap).length,
                  mapaCompleto: estadosMap,
                  primerEstado: Object.values(estadosMap)[0]
                });

                console.log("🔍 DEBUG DENUNCIAS - Estructura de primeras denuncias:", {
                  totalDenuncias: denunciasData.length,
                  primerasDenuncias: denunciasData.slice(0, 3).map(denuncia => ({
                    id: denuncia.id,
                    Id: denuncia.Id,
                    estadoOriginal: denuncia.estado,
                    denunciaCompleta: denuncia
                  }))
                });

                //  COMBINAR ESTADOS CON DENUNCIAS
                const dataConEstados = denunciasData.map(denuncia => {
                  const denunciaId = denuncia.id || denuncia.Id;
                  const estadoInfo = estadosMap[denunciaId];
                  
                  console.log("🔍 DEBUG MAPEO - Combinando denuncia con estado:", {
                    denunciaId,
                    tieneEstadoInfo: !!estadoInfo,
                    estadoInfo,
                    estadoOriginalDenuncia: denuncia.estado,
                    estadoFinal: estadoInfo ? estadoInfo.estado : (denuncia.estado || "Sin datos")
                  });
                  
                  return {
                    ...denuncia,
                    estado: estadoInfo ? estadoInfo.estado : (denuncia.estado || "Sin datos"),
                    fechaEstado: estadoInfo ? estadoInfo.fecha : null,
                    observacionesEstado: estadoInfo ? estadoInfo.observaciones : "",
                  };
                });

                console.log("🔍 DEBUG FINAL - Datos combinados con estados (flujo normal):", {
                  totalDenuncias: dataConEstados.length,
                  muestraEstados: dataConEstados.slice(0, 5).map(d => ({
                    id: d.id,
                    estado: d.estado,
                    fechaEstado: d.fechaEstado
                  })),
                  estadosSinDatos: dataConEstados.filter(d => d.estado === "Sin datos").length
                });

                // ✅ ORDENAR POR FECHA DESCENDENTE (más nueva primero)
                const dataOrdenada = dataConEstados.sort((a, b) => {
                  const fechaA = new Date(a.fecha || a.fechaEstado || '1900-01-01');
                  const fechaB = new Date(b.fecha || b.fechaEstado || '1900-01-01');
                  return fechaB - fechaA; // Descendente
                });

                console.log("✅ Datos ordenados por fecha (más nueva primero):", {
                  totalDenuncias: dataOrdenada.length,
                  primerasFechas: dataOrdenada.slice(0, 3).map(d => ({
                    id: d.id,
                    fecha: d.fecha,
                    fechaFormatted: new Date(d.fecha).toLocaleDateString()
                  }))
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

    //  FLUJO DE FILTRADO POR ESTADO (NUEVA ESTRATEGIA)
    // Cuando hay filtro por estado, necesitamos encontrar denuncias cuyo estado MÁS RECIENTE coincida
    if (filtroEstado) {
      console.log(" NUEVO ENFOQUE: Buscando denuncias con estado más reciente =", filtroEstado);
      
      // Paso 1: Obtener TODOS los estados para determinar el más reciente de cada denuncia
      pushQuery({
        action: "GetEstados",
        params: {}, // Sin filtro - necesitamos todos los estados para determinar el más reciente
        onOk: (responseEstados) => {
          console.log("📥 TODOS los estados recibidos para filtrado:", responseEstados);
          
          let estadosData = [];
          if (Array.isArray(responseEstados)) {
            estadosData = responseEstados;
          } else if (responseEstados?.data) {
            estadosData = responseEstados.data;
          }
          
          console.log("Analizando todos los estados para encontrar más recientes:", {
            totalEstados: estadosData.length,
            filtrandoPor: filtroEstado
          });
          
          //  NUEVA ESTRATEGIA: Encontrar el estado MÁS RECIENTE de cada denuncia
          const estadoMasRecientePorDenuncia = {};
          
          estadosData.forEach(estado => {
            if (!estado.appDenunciasId || !estado.fechaAsociada) return;
            
            const denunciaId = estado.appDenunciasId;
            const fechaEstado = new Date(estado.fechaAsociada);
            
            // Mantener SOLO el estado más reciente (fecha más alta) de cada denuncia
            if (!estadoMasRecientePorDenuncia[denunciaId] || 
                fechaEstado > new Date(estadoMasRecientePorDenuncia[denunciaId].fechaAsociada)) {
              estadoMasRecientePorDenuncia[denunciaId] = estado;
            }
          });
          
          //  FILTRAR: Solo denuncias cuyo estado MÁS RECIENTE coincide con el filtro
          const denunciasConEstadoFiltrado = Object.values(estadoMasRecientePorDenuncia)
            .filter(estado => estado.estado === filtroEstado);
          
          const denunciaIds = denunciasConEstadoFiltrado.map(estado => estado.appDenunciasId);
          
          console.log(" Filtrado por estado MÁS RECIENTE:", {
            estadoBuscado: filtroEstado,
            totalDenunciasAnalizadas: Object.keys(estadoMasRecientePorDenuncia).length,
            denunciasConEstadoActual: denunciasConEstadoFiltrado.length,
            ejemplos: denunciasConEstadoFiltrado.slice(0, 3).map(e => ({
              denunciaId: e.appDenunciasId,
              estado: e.estado,
              fecha: e.fechaAsociada
            }))
          });
          
          if (denunciaIds.length === 0) {
            console.log(" No se encontraron denuncias para el estado:", filtroEstado);
            setList((o) => ({ 
              ...o, 
              loading: null,
              data: [],
              pagination: { ...o.pagination, count: 0 },
              selection: { ...selectionDef }
            }));
            return;
          }
          
          // 🔧 NUEVA ESTRATEGIA: CONSULTAS INDIVIDUALES 
          // El backend solo acepta UN ID por consulta, así que haremos múltiples llamadas
          
          console.log(` Paso 2: Ejecutando consultas individuales para ${denunciaIds.length} IDs`);
          
          // Calcular qué IDs necesitamos para la página actual
          const startIndex = (list.pagination.index - 1) * list.pagination.size;
          const endIndex = startIndex + list.pagination.size;
          const idsForCurrentPage = denunciaIds.slice(startIndex, endIndex);
          
          console.log(`IDs para página ${list.pagination.index}:`, {
            totalIds: denunciaIds.length,
            startIndex,
            endIndex,
            idsParaPagina: idsForCurrentPage.length,
            ids: idsForCurrentPage
          });
          
          if (idsForCurrentPage.length === 0) {
            console.log(" No hay IDs para la página actual");
            setList((o) => ({ 
              ...o, 
              loading: null,
              data: [],
              pagination: { ...o.pagination, count: denunciaIds.length },
              selection: { ...selectionDef }
            }));
            return;
          }
          
          // EJECUTAR MÚLTIPLES CONSULTAS EN PARALELO - UNA POR ID
          ejecutarConsultasIndividuales(idsForCurrentPage, denunciaIds.length);
        },
        onError: (error) => {
          console.error(" Error al obtener IDs por estado:", error);
          setList((o) => ({ 
            ...o, 
            loading: null,
            error: error,
            selection: { ...o.selection, ...selectionDef }
          }));
        }
      });
      return;
    } else {
      // FLUJO NORMAL - "TODOS LOS ESTADOS" O SIN FILTRO DE ESTADO
      console.log(" Flujo normal activado:", {
        razon: filtroEstado ? `Estado seleccionado: "${filtroEstado}"` : "Sin filtro de estado",
        filtroEstado: filtroEstado,
        esNulo: filtroEstado === null,
        esUndefined: filtroEstado === undefined,
        esTodos: filtroEstado === "Todos los estados"
      });

      // FLUJO NORMAL - CARGAR TODAS LAS DENUNCIAS
      const queryParams = {};
      
      if (filtroFechaDesde) {
        queryParams.fechaDesde = filtroFechaDesde;
      }
      if (filtroFechaHasta) {
        queryParams.fechaHasta = filtroFechaHasta;
      }
      
      console.log("📤 Parámetros enviados al API (sin filtro estado):", queryParams);
      
      cargarDenunciasConParametros(queryParams, null);
      return;
    }
    
    // 🔧 FUNCIÓN PARA EJECUTAR MÚLTIPLES CONSULTAS INDIVIDUALES
    function ejecutarConsultasIndividuales(idsArray, totalCount) {
      console.log(` Iniciando ${idsArray.length} consultas individuales...`);
      
      const promises = idsArray.map((id, index) => {
        return new Promise((resolve, reject) => {
          console.log(` Consulta ${index + 1}/${idsArray.length}: ID=${id}`);
          
          const queryParams = { id: id };
          
          // Agregar filtros de fecha si están activos
          if (filtroFechaDesde) {
            queryParams.fechaDesde = filtroFechaDesde;
          }
          if (filtroFechaHasta) {
            queryParams.fechaHasta = filtroFechaHasta;
          }
          
          pushQuery({
            action: "GetList",
            params: queryParams,
            onOk: (response) => {
              console.log(` Consulta ${index + 1} exitosa para ID=${id}:`, {
                tipo: typeof response,
                esArray: Array.isArray(response),
                tieneData: response?.data ? "Sí" : "No"
              });
              
              // Normalizar respuesta - puede ser un objeto o array
              let data = [];
              if (Array.isArray(response)) {
                data = response;
              } else if (response?.data) {
                data = Array.isArray(response.data) ? response.data : [response.data];
              } else if (response && response.id) {
                data = [response];
              }
              
              data = data.filter(item => item && item.id); // Filtrar respuestas válidas
              console.log(`Datos procesados para ID=${id}:`, data.length, "registros");
              resolve(data);
            },
            onError: (error) => {
              console.error(` Error en consulta ${index + 1} (ID=${id}):`, error);
              resolve([]); // Resolver con array vacío en lugar de rechazar
            }
          });
        });
      });
      
      // Esperar todas las consultas y combinar resultados
      Promise.all(promises).then(resultArrays => {
        console.log(`Todas las consultas completadas:`, {
          consultasEjecutadas: idsArray.length,
          resultadosRecibidos: resultArrays.length
        });
        
        // Combinar todos los resultados en un solo array
        const denunciasEncontradas = resultArrays.flat().filter(item => item && item.id);
        
        console.log(` Denuncias combinadas:`, {
          totalDenuncias: denunciasEncontradas.length,
          primerasIds: denunciasEncontradas.slice(0, 3).map(d => d.id)
        });
        
        // Continuar con el procesamiento de estados
        procesarDenunciasConEstados(denunciasEncontradas, totalCount);
      }).catch(error => {
        console.error(" Error al ejecutar consultas múltiples:", error);
        setList((o) => ({ 
          ...o, 
          loading: null,
          error: error,
          selection: { ...o.selection, ...selectionDef }
        }));
      });
    }
    
    // 🔧 FUNCIÓN PARA PROCESAR DENUNCIAS CON SUS ESTADOS
    function procesarDenunciasConEstados(denunciasData, totalCount) {
      console.log("Iniciando procesamiento de estados para denuncias individuales...");
      
      //  APLICAR FILTRO POR ÁMBITO EN EL CLIENTE (RESTAURADO)
      let dataFiltradaPorAmbito = denunciasData;
      
      if (usuarioAmbito && usuarioAmbito.tipo && usuarioAmbito.id && applyAmbitoFilter && typeof applyAmbitoFilter === "function") {
        try {
          console.log(" Aplicando filtro por ámbito específico (consultas individuales)...", {
            usuarioAmbito,
            totalDenunciasOriginales: denunciasData.length
          });
          
          applyAmbitoFilter(denunciasData, usuarioAmbito).then(filteredData => {
            dataFiltradaPorAmbito = filteredData;
            console.log(" Filtro por ámbito aplicado (consultas individuales) - RESULTADO:", {
              totalOriginal: denunciasData.length,
              totalFiltrado: dataFiltradaPorAmbito.length,
              ambitoTipo: usuarioAmbito.tipo,
              ambitoId: usuarioAmbito.id
            });
            continuarConEstados(dataFiltradaPorAmbito, dataFiltradaPorAmbito.length);
          }).catch(error => {
            console.error(" Error aplicando filtro de ámbito:", error);
            continuarConEstados(denunciasData, totalCount);
          });
        } catch (error) {
          console.error(" Error aplicando filtro de ámbito:", error);
          continuarConEstados(denunciasData, totalCount);
        }
      } else {
        console.log(" Sin filtro por ámbito - mostrando todas las denuncias (consultas individuales):", {
          tieneUsuarioAmbito: !!usuarioAmbito,
          usuarioAmbitoTipo: usuarioAmbito?.tipo,
          usuarioAmbitoId: usuarioAmbito?.id,
          tieneApplyAmbitoFilter: typeof applyAmbitoFilter === "function"
        });
        continuarConEstados(dataFiltradaPorAmbito, totalCount);
      }
      
      function continuarConEstados(dataToProcess, totalCount) {
        // CARGAR ESTADOS DE LAS DENUNCIAS
        // Si estamos filtrando por estado específico, mantener ese filtro
        console.log("Cargando estados de las denuncias...", {
          tieneFiltroPorEstado: !!filtroEstado,
          estadoFiltrado: filtroEstado
        });
        
        const estadosParams = filtroEstado ? { estado: filtroEstado } : {};
        
        pushQuery({
          action: "GetEstados",
          params: estadosParams,
          onOk: (responseEstados) => {
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
              console.warn(" No se pudieron obtener los estados correctamente");
              estados = [];
            }

            // Crear un mapa: appDenunciasId -> estado apropiado
            const estadosMap = {};
            
            if (filtroEstado) {
              //  FILTRO ESPECÍFICO: Usar el estado filtrado más reciente
              console.log(" Aplicando filtro específico de estado:", filtroEstado);
              
              estados.forEach(item => {
                const denunciaId = item.appDenunciasId || item.appDenuncia_Id || item.denunciaId;
                const fechaEstado = item.fechaAsociada || item.fecha || item.fechaEstado || "";
                
                if (denunciaId && item.estado === filtroEstado) {
                  // Solo procesar si el estado coincide exactamente con el filtro
                  if (!estadosMap[denunciaId] || fechaEstado > (estadosMap[denunciaId].fecha || "")) {
                    estadosMap[denunciaId] = {
                      estado: item.estado || filtroEstado,
                      fecha: fechaEstado,
                      observaciones: item.observaciones || "",
                    };
                  }
                }
              });
            } else {
              //  SIN FILTRO: Usar el estado más reciente de cada denuncia
              console.log(" Sin filtro específico, usando estados más recientes");
              
              estados.forEach(item => {
                const denunciaId = item.appDenunciasId || item.appDenuncia_Id || item.denunciaId;
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
            }

            console.log("Estados procesados:", {
              tipoFiltro: filtroEstado ? `Específico: ${filtroEstado}` : "Todos los estados",
              totalEstados: estados.length,
              denunciasConEstado: Object.keys(estadosMap).length,
              muestraEstados: Object.values(estadosMap).slice(0, 3)
            });

            //  COMBINAR ESTADOS CON DENUNCIAS
            const dataConEstados = dataToProcess.map(denuncia => {
              const denunciaId = denuncia.id || denuncia.Id;
              const estadoInfo = estadosMap[denunciaId];
              
              return {
                ...denuncia,
                estado: estadoInfo ? estadoInfo.estado : (denuncia.estado || "Sin datos"),
                fechaEstado: estadoInfo ? estadoInfo.fecha : null,
                observacionesEstado: estadoInfo ? estadoInfo.observaciones : "",
              };
            });

            console.log(" Datos finales combinados con estados:", {
              totalDenuncias: dataConEstados.length,
            });

            // ✅ ORDENAR POR FECHA DESCENDENTE (más nueva primero) 
            const dataConEstadosOrdenada = dataConEstados.sort((a, b) => {
              const fechaA = new Date(a.fecha || a.fechaEstado || '1900-01-01');
              const fechaB = new Date(b.fecha || b.fechaEstado || '1900-01-01');
              return fechaB - fechaA; // Descendente
            });

            //  ACTUALIZAR ESTADO FINAL
            const finalChanges = {
              loading: null,
              data: dataConEstadosOrdenada,
              pagination: { 
                index: list.pagination.index, 
                size: list.pagination.size, 
                count: totalCount 
              }
            };

            const record = list.selection.record;
            if (dataConEstadosOrdenada.length === 0) {
              finalChanges.selection = { ...selectionDef };
            } else {
              finalChanges.selection = {
                ...list.selection,
                ...selectionDef,
                record: list.onLoadSelect({ data: dataConEstadosOrdenada, multi: false, record }),
              };
              finalChanges.selection.index = dataConEstadosOrdenada.indexOf(finalChanges.selection.record);
            }

            setList((o) => ({ ...o, ...finalChanges }));
          },
          onError: (error) => {
            console.error(" Error al cargar estados:", error);
            
            // ✅ ORDENAR POR FECHA DESCENDENTE incluso en caso de error
            const dataToProcessOrdenada = dataToProcess.sort((a, b) => {
              const fechaA = new Date(a.fecha || '1900-01-01');
              const fechaB = new Date(b.fecha || '1900-01-01');
              return fechaB - fechaA; // Descendente
            });
            
            const finalChanges = {
              loading: null,
              data: dataToProcessOrdenada,
              pagination: { 
                index: list.pagination.index, 
                size: list.pagination.size, 
                count: totalCount 
              }
            };

            const record = list.selection.record;
            if (dataToProcessOrdenada.length === 0) {
              finalChanges.selection = { ...selectionDef };
            } else {
              finalChanges.selection = {
                ...list.selection,
                ...selectionDef,
                record: list.onLoadSelect({ data: dataToProcessOrdenada, multi: false, record }),
              };
              finalChanges.selection.index = dataToProcessOrdenada.indexOf(finalChanges.selection.record);
            }

            setList((o) => ({ ...o, ...finalChanges }));
          },
        });
      }
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushQuery, list.loading, filtroEstado, filtroFechaDesde, filtroFechaHasta, usuarioAmbito, applyAmbitoFilter]);

  //  ACTIVAR LOADING CUANDO CAMBIEN LOS FILTROS
  useEffect(() => {
    console.log("Filtros cambiaron, activando loading...", {
      filtroEstado: filtroEstado || "Ninguno",
      filtroFechaDesde: filtroFechaDesde || "Ninguna", 
      filtroFechaHasta: filtroFechaHasta || "Ninguna"
    });
    
    // Siempre activar loading y resetear a página 1 cuando cambien filtros
    setList((o) => ({
      ...o,
      loading: "Cargando...",
      pagination: { ...o.pagination, index: 1 } // Resetear a página 1
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroFechaDesde, filtroFechaHasta]);

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

  return { render, request, selected: list.selection.record };
};

export default useDenuncias;