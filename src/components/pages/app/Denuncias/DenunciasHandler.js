
// import React, { useContext, useEffect, useState, useMemo } from "react";
// import { useDispatch } from "react-redux";
// import { handleModuloSeleccionar } from "redux/actions";

// import { Tabs, Tab } from "@mui/material";
// import Formato from "components/helpers/Formato";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import KeyPress from "components/keyPress/KeyPress";
// import Grid from "components/ui/Grid/Grid";
// import Button from "components/ui/Button/Button";
// import SearchSelectMaterial, { mapOptions } from "components/ui/Select/SearchSelectMaterial";
// import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
// import useDenuncias, { onLoadSelectKeepOrFirst } from "./useDenuncias";
// import AuthContext from "store/authContext";
// import dayjs from "dayjs";

// const DenunciasHandler = () => {
//   const dispatch = useDispatch();
//   const { usuario } = useContext(AuthContext);

//   const tabs = [];
//   const [tab, setTab] = useState(0);

//   // ==============================
//   // QUERIES API
//   // ==============================
//   const pushQuery = useQueryQueue((action) => {
//     if (action === "GetDenuncia") {
//       return {
//         config: {
//           baseURL: "App",
//           method: "GET",
//           endpoint: "/AppDenuncias",
//         },
//       };
//     }
//     return null;
//   });

//   // ==============================
//   // ==============================
//   const [denuncia, setDenuncia] = useState({
//     loading: "Cargando...",
//     params: {},
//     data: [],
//     error: null,
//     buscar: "",
//     buscado: "",
//     options: [],
//     selected: null,
//   });

//   useEffect(() => {
//     if (!denuncia.loading) return;

//     const changes = {
//       loading: null,
//       data: [],
//       error: null,
//       options: [],
//       selected: null,
//     };

//     pushQuery({
//       action: "GetDenuncia",
//       params: denuncia.params,
//       onOk: async (data) => {
//         if (!Array.isArray(data)) return console.error("Se esperaba un arreglo", { data });
//         changes.data = data
//           .sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
//           .map((r) => ({ label: r.nombre, value: r.id }));
//         changes.options = changes.data;
//         changes.selected = changes.data.find(({ value }) => value === denuncia.selected?.value) ?? denuncia.selected;
//       },
//       onError: async (error) => (changes.error = error),
//       onFinally: async () => setDenuncia((o) => ({ ...o, ...changes })),
//     });
//   }, [pushQuery, denuncia]);

//   useEffect(() => {
//     if (denuncia.loading || denuncia.buscar === denuncia.buscado) return;
//     const options = denuncia.data.filter((r) =>
//       denuncia.buscar !== ""
//         ? r.label.toLowerCase().includes(denuncia.buscar.toLowerCase())
//         : true
//     );
//     setDenuncia((o) => ({ ...o, options, buscado: o.buscar }));
//   }, [denuncia]);

//   // ==============================
//   // ESTADO: FILTRO POR ESTADO
//   // ==============================
  
//   //#region estadoSelect Options
//   const estadoTodos = useMemo(() => ({ label: "Todos los estados" }), []);
//   //#endregion estadoSelect Options

//   const [estadoSelect, setEstadoSelect] = useState({
//     loading: null,
//     buscar: "",
//     data: [
//       { value: "Registrada", label: "Registrada" },
//       { value: "Completada", label: "Completada" },
//       { value: "Derivada", label: "Derivada" },
//       { value: "En Planificacion", label: "En Planificacion" },
//       { value: "Gestion con Empleador", label: "Gestion con Empleador" },
//       { value: "Inspeccionada", label: "Inspeccionada" },
//       { value: "Relevamiento App", label: "Relevamiento App" },
//       { value: "Finalizada", label: "Finalizada" },
//     ],
//     error: null,
//     options: [],
//     selected: estadoTodos,
//     origen: "",
//   });

//   // Buscador para estado
//   useEffect(() => {
//     if (estadoSelect.data.length > 0) {
//       const options = mapOptions({
//         data: estadoSelect.data,
//         map: (r) => ({ value: r.value, label: r.label, record: r }),
//         start: [estadoTodos],
//         filter: (r) => r.label.toLowerCase().includes(estadoSelect.buscar.toLowerCase()),
//       });
//       setEstadoSelect(s => ({
//         ...s,
//         options: options,
//       }));
//     }
//   }, [estadoSelect.buscar, estadoSelect.data, estadoTodos]);

//   // Parámetros de filtro
//   const [denunciasParamsEdit, setDenunciasParamsEdit] = useState({});
//   const [denunciasParamsSend, setDenunciasParamsSend] = useState({});

//   // Estado para filtro por fechas
//   const [fechaDesde, setFechaDesde] = useState(null);
//   const [fechaHasta, setFechaHasta] = useState(null);

//   // Hook para obtener IDs de denuncias por estado
//   const pushQueryEstados = useQueryQueue((action) => {
//     if (action === "GetDenunciasPorEstado") {
//       return {
//         config: {
//           baseURL: "App",
//           method: "GET",
//           endpoint: "/DenunciasEstados",
//         },
//       };
//     }
//     return null;
//   });

//   const [denunciasIdsPorEstado, setDenunciasIdsPorEstado] = useState([]);

//   // Debug del filtro
//   useEffect(() => {
//     console.log("=== DEBUG FILTROS ===");
//     console.log("estadoSelect.selected:", estadoSelect.selected);
//     console.log("fechaDesde:", fechaDesde);
//     console.log("fechaHasta:", fechaHasta);
//     console.log("denunciasParamsEdit:", denunciasParamsEdit);
//     console.log("denunciasParamsSend:", denunciasParamsSend);
//     console.log("denunciasIdsPorEstado:", denunciasIdsPorEstado.length, "IDs");
//     console.log("=====================");
//   }, [estadoSelect.selected, fechaDesde, fechaHasta, denunciasParamsEdit, denunciasParamsSend, denunciasIdsPorEstado]);

//   // useEffect para obtener IDs cuando cambian los parámetros enviados
//   useEffect(() => {
//     if (!denunciasParamsSend.estado && !denunciasParamsSend.desde && !denunciasParamsSend.hasta) {
//       setDenunciasIdsPorEstado([]);
//       return;
//     }

//     // Construir los parámetros de consulta
//     const queryParams = {};
//     if (denunciasParamsSend.estado) {
//       queryParams.estado = denunciasParamsSend.estado;
//     }
//     if (denunciasParamsSend.desde) {
//       queryParams.desde = denunciasParamsSend.desde;
//     }
//     if (denunciasParamsSend.hasta) {
//       queryParams.hasta = denunciasParamsSend.hasta;
//     }

//     const queryString = Object.entries(queryParams)
//       .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
//       .join('&');

//     console.log("🔍 Iniciando llamada a DenunciasEstados con parámetros:", queryParams);
//     console.log("🔍 URL que se va a llamar:", `https://localhost:44390/api/DenunciasEstados?${queryString}`);

//     pushQueryEstados({
//       action: "GetDenunciasPorEstado",
//       params: queryParams,
//       onOk: async (response) => {
//         console.log("✅ Respuesta exitosa DenunciasEstados:", response);
        
//         let data = [];
//         if (Array.isArray(response)) {
//           data = response;
//         } else if (response && response.data) {
//           data = response.data;
//         }

//         console.log("Estructura de datos recibidos:", {
//           esArray: Array.isArray(response),
//           tipoResponse: typeof response,
//           keysResponse: response ? Object.keys(response) : [],
//           totalElementos: data.length,
//           primerosElementos: data.slice(0, 3)
//         });

//         // Intentar extraer los IDs con diferentes nombres de campo posibles
//         const ids = data.map(item => {
//           // Probar diferentes nombres de campo que podrían contener el ID
//           return item.appDenunciasId || item.id || item.denunciaId || item.appDenuncia_Id || item.Id;
//         }).filter(id => id != null);
        
//         console.log("📋 IDs de denuncias extraídos:", { 
//           parametros: queryParams,
//           totalRegistros: data.length,
//           totalIds: ids.length,
//           ids: ids.slice(0, 10), // Mostrar solo los primeros 10
//           primerosRegistros: data.slice(0, 2)
//         });
        
//         setDenunciasIdsPorEstado(ids);
//       },
//       onError: async (error) => {
//         console.error("❌ Error al obtener denuncias por estado:", error);
//         console.error("Detalles del error:", {
//           tipo: error.type,
//           codigo: error.code,
//           mensaje: error.message
//         });
        
//         setDenunciasIdsPorEstado([]);
//       },
//     });
//   }, [denunciasParamsSend, pushQueryEstados]);

//   // ==============================
//   // TABLA: DENUNCIAS
//   // ==============================
//   const {
//     render: denunciaRender,
//     request: denunciaRequest,
//   } = useDenuncias({
//     filtroIds: denunciasIdsPorEstado,
//     columns: (def) => {
//       if (!Array.isArray(def)) return def;
//       def.push({
//         dataField: "deletedDate",
//         text: "Fecha de baja",
//         sort: false,
//         headerStyle: { width: "150px" },
//         formatter: Formato.Fecha,
//         style: (v) => {
//           const r = { textAlign: "center" };
//           if (v) {
//             r.background = "#ff6464cc";
//             r.color = "#fff";
//           }
//           return r;
//         },
//       });
//       return def;
//     },
//   });

//   const [denunciasActions] = useState([]);

//   useEffect(() => {
//     const params = { sortBy: "+fecha" };
    
//     denunciaRequest("list", { 
//       params, 
//       pagination: { index: 1, size: 10 },
//       onLoadSelect: onLoadSelectKeepOrFirst,
//     });
//   }, [denunciaRequest]);

//   // ==============================
//   // TAB: DENUNCIAS
//   // ==============================
//   tabs.push({
//     header: () => <Tab label="Denuncias" />,
//     body: () => (
//       <Grid width col gap="10px">
//         <Grid grid="auto / 1fr 180px 180px 200px 200px" gap="inherit">
//           <SearchSelectMaterial
//             label="Estado de Denuncia"
//             error={!!estadoSelect.error}
//             helperText={estadoSelect.loading ?? estadoSelect.error}
//             value={estadoSelect.selected}
//             onChange={(selected = {}) => {
//               setEstadoSelect((o) => ({
//                 ...o,
//                 selected,
//                 origen: "option",
//               }));
//               setDenunciasParamsEdit((o) => {
//                 const estado = selected.value;
//                 const denunciasParamsEdit = { ...o, estado };
//                 if (selected === estadoTodos) delete denunciasParamsEdit.estado;
//                 return denunciasParamsEdit;
//               });
//             }}
//             options={estadoSelect.options}
//             onTextChange={(buscar) =>
//               setEstadoSelect((o) => ({ ...o, buscar, origen: "text" }))
//             }
//           />
//           <DateTimePicker
//             type="date"
//             label="Fecha Desde"
//             value={fechaDesde}
//             onChange={(value) => {
//               setFechaDesde(value);
//               setDenunciasParamsEdit((o) => {
//                 const denunciasParamsEdit = { ...o };
//                 if (value && dayjs(value).isValid()) {
//                   denunciasParamsEdit.desde = dayjs(value).format('YYYY-MM-DD');
//                 } else {
//                   delete denunciasParamsEdit.desde;
//                 }
//                 return denunciasParamsEdit;
//               });
//             }}
//             format="YYYY-MM-DD"
//           />
//           <DateTimePicker
//             type="date"
//             label="Fecha Hasta"
//             value={fechaHasta}
//             onChange={(value) => {
//               setFechaHasta(value);
//               setDenunciasParamsEdit((o) => {
//                 const denunciasParamsEdit = { ...o };
//                 if (value && dayjs(value).isValid()) {
//                   denunciasParamsEdit.hasta = dayjs(value).format('YYYY-MM-DD');
//                 } else {
//                   delete denunciasParamsEdit.hasta;
//                 }
//                 return denunciasParamsEdit;
//               });
//             }}
//             format="YYYY-MM-DD"
//           />
//           <Button
//             className="botonAzul"
//             disabled={
//               JSON.stringify(denunciasParamsEdit) ===
//               JSON.stringify(denunciasParamsSend)
//             }
//             onClick={() => setDenunciasParamsSend(denunciasParamsEdit)}
//           >
//             Aplica filtro
//           </Button>
//           <Button
//             className="botonAzul"
//             disabled={Object.entries(denunciasParamsEdit).length === 0 && Object.entries(denunciasParamsSend).length === 0}
//             onClick={() => {
//               const denunciasParamsEditEmpty = {};
//               setEstadoSelect((o) => ({
//                 ...o,
//                 selected: estadoTodos,
//                 buscar: "",
//               }));
//               setFechaDesde(null);
//               setFechaHasta(null);
//               setDenunciasParamsEdit(denunciasParamsEditEmpty);
//               setDenunciasParamsSend(denunciasParamsEditEmpty);
//               setDenunciasIdsPorEstado([]);
//             }}
//           >
//             Limpia filtro
//           </Button>
//         </Grid>
//         {denunciaRender()}
//       </Grid>
//     ),
//     actions: denunciasActions,
//   });

//   // ==============================
//   // ACCIONES DEL MÓDULO
//   // ==============================
//   const acciones = tabs[tab].actions;

//   useEffect(() => {
//     dispatch(handleModuloSeleccionar({ nombre: "Localidades", acciones }));
//   }, [dispatch, acciones]);

//   // ==============================
//   // RENDER
//   // ==============================
//   return (
//     <Grid full col>
//       <Grid className="titulo">
//         <h1>DENUNCIAS</h1>
//       </Grid>

//       <Grid col className="tabs">
//         <Tabs value={tab} onChange={(_, v) => setTab(v)}>
//           {tabs.map((r) => r.header())}
//         </Tabs>
//       </Grid>

//       <Grid className="contenido">
//         {tabs[tab].body()}
//       </Grid>

//       <KeyPress items={acciones} />
//     </Grid>
//   );
// };

// export default DenunciasHandler;


import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import AuthContext from "store/authContext";

import { Tabs, Tab } from "@mui/material";
import useQueryQueue from "components/hooks/useQueryQueue";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import SearchSelectMaterial, { mapOptions } from "components/ui/Select/SearchSelectMaterial";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import useDenuncias, { onLoadSelectKeepOrFirst } from "./useDenuncias";
import { applyAmbitoFilter } from "./filtroAmbitoDenuncias";
import DenunciasForm from "./DenunciasForm";
import Action from "components/helpers/Action";
import dayjs from "dayjs";

const DenunciasHandler = () => {
  const dispatch = useDispatch();
  const { usuario } = useContext(AuthContext);

  // Configurar ámbito del usuario para filtrado
  const usuarioAmbito = useMemo(() => {
    console.log("🔧 Configurando ámbito del usuario:", {
      usuario: !!usuario,
      ambitoTodos: usuario?.ambitoTodos,
      ambitoSeccionales: usuario?.ambitoSeccionales,
      ambitoDelegaciones: usuario?.ambitoDelegaciones,
      ambitoProvincias: usuario?.ambitoProvincias
    });
    
    if (!usuario) return null;
    
    // Verificar si el usuario tiene ámbito "Todos"
    if (usuario.ambitoTodos) {
      console.log("👥 Usuario con ámbito TODOS - sin filtro (retornando null)");
      
      // 🧪 MODO PRUEBA: Simular usuario con ámbito específico para probar filtrado
      // Descomenta una de estas líneas para probar:
      // return { tipo: "seccional", id: 104491 }; // Probar con seccional específica
      // return { tipo: "delegacion", id: 194 }; // Probar con delegación específica
      
      return null; // Sin filtro, mostrar todas las denuncias
    }
    
    // Si tiene ámbito de seccional específica
    const seccionalesIds = usuario.ambitoSeccionales?.ids || usuario.ambitoSeccionales;
    if (seccionalesIds && Array.isArray(seccionalesIds) && seccionalesIds.length > 0) {
      const seccionalId = seccionalesIds[0]; // Tomar la primera seccional
      console.log("🏢 Usuario con ámbito SECCIONAL:", seccionalId);
      return { tipo: "seccional", id: seccionalId };
    }
    
    // Si tiene ámbito de delegación específica
    const delegacionesIds = usuario.ambitoDelegaciones?.ids || usuario.ambitoDelegaciones;
    if (delegacionesIds && Array.isArray(delegacionesIds) && delegacionesIds.length > 0) {
      const delegacionId = delegacionesIds[0]; // Tomar la primera delegación
      console.log("🏛️ Usuario con ámbito DELEGACION:", delegacionId);
      return { tipo: "delegacion", id: delegacionId };
    }
    
    // Si tiene ámbito de provincia específica (futuro)
    if (usuario.ambitoProvincias && usuario.ambitoProvincias.length > 0) {
      console.log("🗺️ Usuario con ámbito PROVINCIA (sin implementar)");
      return null; // Por ahora sin filtro para provincias
    }
    
    console.log("❓ Usuario sin ámbito definido - sin filtro");
    return null; // Sin filtro por defecto
  }, [usuario]);

  const tabs = [];
  const [tab, setTab] = useState(0);

  // ==============================
  // Modal DenunciasForm
  // ==============================
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("A"); // A | M | C | B
  const [formData, setFormData] = useState({});

  // ==============================
  // QUERIES API
  // ==============================
  const pushQuery = useQueryQueue((action) => {
    if (action === "GetDenuncia") {
      // Mantengo este recurso porque ya lo tenías (sirve para combos/auxiliares)
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/EncuestaRespuestas",
        },
      };
    }

    if (action === "GetDenunciaDetail") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/AppDenuncias",
        },
      };
    }

    return null;
  });

  // ==============================
  // Estado auxiliar "denuncia" (lista simple nombre/id)
  // ==============================
  const [denuncia, setDenuncia] = useState({
    loading: "Cargando...",
    params: {},
    data: [],
    error: null,
    buscar: "",
    buscado: "",
    options: [],
    selected: null,
  });

  useEffect(() => {
    if (!denuncia.loading) return;

    const changes = {
      loading: null,
      data: [],
      error: null,
      options: [],
      selected: null,
    };

    pushQuery({
      action: "GetDenuncia",
      params: denuncia.params,
      onOk: async (response) => {
        // Normalizar respuesta: puede ser array directo o objeto con propiedad data
        let data = Array.isArray(response) ? response : response?.data || [];
        
        if (!Array.isArray(data)) {
          console.error("Se esperaba un arreglo", { response });
          data = [];
        }
        
        changes.data = data
          .sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
          .map((r) => ({ label: r.nombre, value: r.id }));
        changes.options = changes.data;
        changes.selected =
          changes.data.find(({ value }) => value === denuncia.selected?.value) ?? denuncia.selected;
      },
      onError: async (error) => (changes.error = error),
      onFinally: async () => setDenuncia((o) => ({ ...o, ...changes })),
    });
  }, [pushQuery, denuncia]);

  useEffect(() => {
    if (denuncia.loading || denuncia.buscar === denuncia.buscado) return;
    const options = denuncia.data.filter((r) =>
      denuncia.buscar !== ""
        ? r.label.toLowerCase().includes(denuncia.buscar.toLowerCase())
        : true
    );
    setDenuncia((o) => ({ ...o, options, buscado: o.buscar }));
  }, [denuncia]);

  // ==============================
  // Modal DenunciasForm
  // ==============================
  const openForm = useCallback((mode, record = {}) => {
    setFormMode(mode);

    // Si es Modificar/Consulta y tenemos id, traemos el detalle con GET ?id=
    if ((mode === "M" || mode === "C") && record?.id) {
      const mapApiToForm = (r = {}) => ({
        id: r.id,
        provinciaNombre: r.provincia || "",
        provinciaId: r.provinciaId || 0,
        refLocalidadIdAfiliado: r.localidadId || 0,
        nombreLocalidadAfiliado: r.localidad || "",
        delegacion: r.delegacion || "",
        seccional: r.seccional || "",
        nombreDenunciante: r.nombre || "",
        telefonoContacto: r.telefonoContacto || r.telefono || "",
        correoElectronico: r.correo || "",
        denunciaTipoIngresoId: r.denunciaTipoIngresoId || 0,
        denunciaSituacionId: r.denunciaSituacionId || 0,
        cuitEmpresa: r.empleadorCUIT ? String(r.empleadorCUIT) : "",
        razonSocial: r.empleadorNombre || "",
        detalleDenuncia: r.texto || "",
        ubicacion: r.ubicacion || "",
        derivadaA: r.derivadoATipo || "Sin derivacion",
        derivadaADescripcion: r.derivadoATipo || "Sin derivacion",
        derivadoAId: r.derivadoAId ?? r.derivadoAId ?? 0,
        estado: r.estado || "Registrada",
        observacionesRegistro: r.observaciones || "",
      });

      pushQuery({
        action: "GetDenunciaDetail",
        params: { id: record.id },
        onOk: (resp) => {
          const payload = resp && resp.data ? resp.data : resp;
          const full = Array.isArray(payload) ? payload[0] || {} : payload || {};
          setFormData(mapApiToForm(full));
          setFormOpen(true);
        },
        onError: () => {
          setFormData(record || {});
          setFormOpen(true);
        },
      });
      return;
    }

    // Alta / sin id: abrir directo
    setFormData(record || {});
    setFormOpen(true);
  }, [pushQuery, setFormMode, setFormData, setFormOpen]);

  // ==============================
  // FILTRO: Estado + Rango de fechas -> IDs
  // ==============================
  const estadoTodos = useMemo(() => ({ label: "Todos los estados" }), []);
  const [estadoSelect, setEstadoSelect] = useState({
    loading: null,
    buscar: "",
    data: [
      { value: "Registrada", label: "Registrada" },
      { value: "Completada", label: "Completada" },
      { value: "Derivada", label: "Derivada" },
      { value: "En Planificacion", label: "En Planificacion" },
      { value: "Gestion con Empleador", label: "Gestion con Empleador" },
      { value: "Inspeccionada", label: "Inspeccionada" },
      { value: "Relevamiento App", label: "Relevamiento App" },
      { value: "Finalizada", label: "Finalizada" },
    ],
    error: null,
    options: [],
    selected: estadoTodos,
    origen: "",
  });

  useEffect(() => {
    if (estadoSelect.data.length > 0) {
      const options = mapOptions({
        data: estadoSelect.data,
        map: (r) => ({ value: r.value, label: r.label, record: r }),
        start: [estadoTodos],
        filter: (r) => r.label.toLowerCase().includes(estadoSelect.buscar.toLowerCase()),
      });
      setEstadoSelect((s) => ({
        ...s,
        options,
      }));
    }
  }, [estadoSelect.buscar, estadoSelect.data, estadoTodos]);

  // ✅ Estados de filtros locales (se aplican automáticamente en useDenuncias)
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  // ==============================
  // TABLA: DENUNCIAS
  // ==============================

  const {
    render: denunciaRender,
    request: denunciaRequest,
    selected: denunciasSelected,
  } = useDenuncias({
    filtroEstado: estadoSelect.selected?.value || null, // 🎯 filtro por estado específico
    filtroFechaDesde: fechaDesde ? dayjs(fechaDesde).format("YYYY-MM-DD") : null, // 🎯 filtro fecha desde
    filtroFechaHasta: fechaHasta ? dayjs(fechaHasta).format("YYYY-MM-DD") : null, // 🎯 filtro fecha hasta
    usuarioAmbito: usuarioAmbito, // 🔐 filtrado por ámbito del usuario
    applyAmbitoFilter: applyAmbitoFilter, // 🔧 función de filtrado por ámbito
    // ✅ Filtros aplicados automáticamente al cambiar los valores
    // ✅ La columna "Estado" ya está definida en DenunciasTable.js
  });

  // Acciones con atajos de teclado
  const [denunciasActions, setDenunciasActions] = useState([]);

  useEffect(() => {
    const createAction = ({ action, onExecute, ...x }) =>
      new Action({
        name: action,
        onExecute,
        combination: "AltKey",
        ...x,
      });

    const desc = denunciasSelected?.nombre || denunciasSelected?.id || "";

    const actions = [
      // ALT + A
      createAction({
        action: "Agrega Denuncia",
        onExecute: () => openForm("A"),
        tarea: "AdminApp_DenunciaAgrega",
        keys: "a",
        underlineindex: 0,
      }),
      createAction({
        action: `Consulta Denuncia ${desc}`,
        onExecute: () => (denunciasSelected ? openForm("C", denunciasSelected) : null),
        tarea: "AdminApp_DenunciaConsulta",
        ...(denunciasSelected ? { disabled: false, keys: "o", underlineindex: 1 } : { disabled: true }),
      }),
      createAction({
        action: `Modifica Denuncia ${desc}`,
        onExecute: () => (denunciasSelected ? openForm("M", denunciasSelected) : null),
        tarea: "AdminApp_DenunciaModifica",
        ...(denunciasSelected ? { disabled: false, keys: "m", underlineindex: 0 } : { disabled: true }),
      }),
      createAction({
        action: `Baja Denuncia ${desc}`,
        onExecute: () => (denunciasSelected ? openForm("B", denunciasSelected) : null),
        tarea: "AdminApp_DenunciaBaja",
        ...(denunciasSelected ? { disabled: false, keys: "b", underlineindex: 0 } : { disabled: true }),
      }),
    ];

    setDenunciasActions(actions);
  }, [denunciasSelected, openForm]);

  // ==============================
  // Búsqueda y listado
  // ==============================
  // Inicialización de la lista de denuncias
  useEffect(() => {
    const params = { sortBy: "+fecha" };
    
    denunciaRequest("list", { 
      params, 
      pagination: { index: 1, size: 10 },
      onLoadSelect: onLoadSelectKeepOrFirst,
    });
  }, [denunciaRequest]);

  // ==============================
  // Tabs
  // ==============================
  tabs.push({
    header: () => <Tab label="Denuncias" />,
    body: () => (
      <Grid width col gap="10px">
        {/* Fila de filtros por estado/fechas - Los filtros se aplican automáticamente */}
        <Grid grid="auto / 1fr 180px 180px 150px" gap="inherit">
          <SearchSelectMaterial
            label="Estado de Denuncia"
            error={!!estadoSelect.error}
            helperText={estadoSelect.loading ?? estadoSelect.error}
            value={estadoSelect.selected}
            onChange={(selected = {}) => {
              setEstadoSelect((o) => ({
                ...o,
                selected,
                origen: "option",
              }));
            }}
            options={estadoSelect.options}
            onTextChange={(buscar) =>
              setEstadoSelect((o) => ({ ...o, buscar, origen: "text" }))
            }
          />

          <DateTimePicker
            type="date"
            label="Fecha Desde"
            value={fechaDesde}
            onChange={(value) => {
              setFechaDesde(value);
            }}
            format="YYYY-MM-DD"
          />

          <DateTimePicker
            type="date"
            label="Fecha Hasta"
            value={fechaHasta}
            onChange={(value) => {
              setFechaHasta(value);
            }}
            format="YYYY-MM-DD"
          />

          <Button
            className="botonAzul"
            disabled={!estadoSelect.selected?.value && !fechaDesde && !fechaHasta}
            onClick={() => {
              setEstadoSelect((o) => ({
                ...o,
                selected: estadoTodos,
                buscar: "",
              }));
              setFechaDesde(null);
              setFechaHasta(null);
            }}
          >
            Limpia filtros
          </Button>
        </Grid>



        {denunciaRender()}
      </Grid>
    ),
    actions: denunciasActions,
  });

  // ==============================
  // ACCIONES DEL MÓDULO (barra superior)
  // ==============================
  const acciones = tabs[tab].actions;
  useEffect(() => {
    dispatch(handleModuloSeleccionar({ nombre: "Denuncias", acciones }));
  }, [dispatch, acciones]);

  // ==============================
  // RENDER
  // ==============================
  return (
    <Grid full col>
      {/* Título principal */}
      <Grid className="titulo">
        <h1>DENUNCIAS</h1>
      </Grid>

      {/* Tabs superiores */}
      <Grid col className="tabs">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {tabs.map((r, i) => (
            <React.Fragment key={i}>{r.header()}</React.Fragment>
          ))}
        </Tabs>
      </Grid>

      {/* Contenido dinámico según tab */}
      <Grid className="contenido">{tabs[tab].body()}</Grid>

      {/* Accesos rápidos por teclado */}
      <KeyPress items={acciones} />

      {/* Modal del formulario DenunciasForm */}
      {formOpen && (
        <DenunciasForm
          title={
            <h3 style={{ margin: 0 }}>
              {formMode === "A"
                ? "Agregar Denuncia"
                : formMode === "M"
                ? "Modificar Denuncia"
                : formMode === "C"
                ? "Consulta Denuncia"
                : "Baja Denuncia"}
            </h3>
          }
          data={formData}
          mode={formMode}
          readOnly={formMode === "C"}
          disabled={{ ...(formMode === "C" ? { codPostal: true, nombre: true } : {}) }}
          onChange={(changes) => setFormData((o) => ({ ...o, ...changes }))}
          onClose={(confirm = false) => {
            setFormOpen(false);
            if (confirm) {
              // Refrescar la lista
              const params = { sortBy: "+fecha" };
              denunciaRequest("list", { 
                params, 
                pagination: { size: 10 },
                onLoadSelect: onLoadSelectKeepOrFirst,
              });
            }
          }}
        />
      )}
    </Grid>
  );
};

export default DenunciasHandler;
