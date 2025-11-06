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
    console.log("🔧 DETALLE COMPLETO del usuario:", {
      usuario: usuario,
      tieneUsuario: !!usuario,
      usuarioCompleto: JSON.stringify(usuario, null, 2)
    });
    
    if (!usuario) {
      console.log("❌ No hay usuario - retornando null");
      return null;
    }
    
    // Verificar si el usuario tiene ámbito "Todos"
    if (usuario.ambitoTodos) {
      console.log("👥 Usuario con ámbito TODOS - sin filtro (retornando null)");
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
    console.log("🔍 DEBUG ambitoDelegaciones:", {
      ambitoDelegaciones: usuario.ambitoDelegaciones,
      delegacionesIds: delegacionesIds,
      esArray: Array.isArray(delegacionesIds),
      longitud: delegacionesIds?.length
    });
    
    if (delegacionesIds && Array.isArray(delegacionesIds) && delegacionesIds.length > 0) {
      const delegacionId = delegacionesIds[0]; // Tomar la primera delegación
      console.log("🏛️ Usuario con ámbito DELEGACION:", {
        delegacionId: delegacionId,
        tipoDelId: typeof delegacionId,
        objetoCompleto: { tipo: "delegacion", id: delegacionId }
      });
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
        // Exponer el id destino (si viene) para que el formulario pueda usarlo
        derivadoAId: r.derivadoAId ?? r.derivadoAId ?? 0,
        estado: r.estado || "Registrada",
        observacionesRegistro: r.observaciones || "",
      });

      pushQuery({
        action: "GetDenunciaDetail",
        params: { id: record.id }, // GET ?id=
        onOk: (resp) => {
          const payload = resp && resp.data ? resp.data : resp;
          const full = Array.isArray(payload) ? payload[0] || {} : payload || {};
          setFormData(mapApiToForm(full));
          setFormOpen(true);
        },
        onError: () => {
          // fallback con lo que tengamos
          setFormData(record || {});
          setFormOpen(true);
        },
      });
      return;
    }

    // Alta / sin id: abrir directo
    setFormData(record || {});
    setFormOpen(true);
  }, [pushQuery]);

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
    const isFinalizada = (denunciasSelected?.estado || "").toLowerCase() === "finalizada";

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
      // Solo mostrar "Modificar" si la denuncia seleccionada NO está Finalizada
      ...(!denunciasSelected || !isFinalizada
        ? [
            createAction({
              action: `Modifica Denuncia ${desc}`,
              onExecute: () => (denunciasSelected ? openForm("M", denunciasSelected) : null),
              tarea: "AdminApp_DenunciaModifica",
              ...(denunciasSelected ? { disabled: false, keys: "m", underlineindex: 0 } : { disabled: true }),
            }),
          ]
        : []),
      // createAction({
      //   action: `Baja Denuncia ${desc}`,
      //   onExecute: () => (denunciasSelected ? openForm("B", denunciasSelected) : null),
      //   tarea: "AdminApp_DenunciaBaja",
      //   ...(denunciasSelected ? { disabled: false, keys: "b", underlineindex: 0 } : { disabled: true }),
      // }),
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