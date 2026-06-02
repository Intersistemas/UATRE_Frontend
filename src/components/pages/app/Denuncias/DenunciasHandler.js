import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import AuthContext from "store/authContext";

import { Tabs, Tab } from "@mui/material";
import useQueryQueue from "components/hooks/useQueryQueue";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import SearchSelectMaterial, { mapOptions, includeSearch } from "components/ui/Select/SearchSelectMaterial";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import useDenuncias, { onLoadSelectKeepOrFirst, onLoadSelectFirst } from "./useDenuncias";
import { applyAmbitoFilter } from "./filtroAmbitoDenuncias";
import DenunciasForm from "./DenunciasForm";
import Action from "components/helpers/Action";
import dayjs from "dayjs";
import useGeneracionExcel from "components/hooks/useGeneracionExcel";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import useAmbitosUsuario from "components/hooks/useAmbitos";
import ExportModal from "./ExportModal";
// import InputMaterial from "components/ui/Input/InputMaterial";

const DenunciasHandler = () => {
  const dispatch = useDispatch();
  const { usuario } = useContext(AuthContext);

  // Configurar ámbito del usuario para filtrado
  const usuarioAmbito = useMemo(() => {
    if (!usuario) {
      return null;
    }

    // Verificar si el usuario tiene ámbito "Todos"
    if (usuario.ambitoTodos && usuario.ambitoTodos.ids && usuario.ambitoTodos.ids.includes(0)) {
      return null; // Sin filtro, mostrar todas las denuncias
    }

    // Si tiene ámbito de seccional específica
    const seccionalesIds = usuario.ambitoSeccionales?.ids || usuario.ambitoSeccionales;
    if (seccionalesIds && Array.isArray(seccionalesIds) && seccionalesIds.length > 0) {
      const seccionalId = seccionalesIds[0]; // Tomar la primera seccional
      return { tipo: "seccional", id: seccionalId };
    }

    // Si tiene ámbito de delegación específica
    const delegacionesIds = usuario.ambitoDelegaciones?.ids || usuario.ambitoDelegaciones;
    if (delegacionesIds && Array.isArray(delegacionesIds) && delegacionesIds.length > 0) {
      const delegacionId = delegacionesIds[0]; // Tomar la primera delegación
      return { tipo: "delegacion", id: delegacionId };
    }

    // Si tiene ámbito de provincia específica (futuro)
    if (usuario.ambitoProvincias && usuario.ambitoProvincias.length > 0) {
      return null; // Por ahora sin filtro para provincias
    }

    return null; // Sin filtro por defecto
  }, [usuario]);

  const ambitosManager = useAmbitosUsuario();
  const ambitoInfo = useMemo(() => ambitosManager.ambitoUser(), [ambitosManager]);

  // IDs de delegación/seccional del usuario (si aplica)
  const usuarioDelegacionId = useMemo(() => {
    if (ambitoInfo?.tipo !== "Delegaciones") return null;
    return Array.isArray(ambitoInfo.ids) && ambitoInfo.ids.length > 0
      ? Number(ambitoInfo.ids[0])
      : null;
  }, [ambitoInfo]);

  const usuarioSeccionalId = useMemo(() => {
    if (ambitoInfo?.tipo !== "Seccionales") return null;
    return Array.isArray(ambitoInfo.ids) && ambitoInfo.ids.length > 0
      ? Number(ambitoInfo.ids[0])
      : null;
  }, [ambitoInfo]);

  const tabs = [];
  const [tab, setTab] = useState(0);

  // ==============================
  // Modal DenunciasForm
  // ==============================
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("A"); // A | M | C | B
  const [formData, setFormData] = useState({});

  // ==============================
  // Modal ExportModal
  // ==============================
  const [exportModalOpen, setExportModalOpen] = useState(false);

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

    if (action === "GetDenunciaTipoIngreso") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/DenunciaTipoIngreso",
        },
      };
    }

    if (action === "GetDenunciaSituacion") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/DenunciaSituacion",
        },
      };
    }

    if (action === "GetDelegaciones") {
      return {
        config: {
          baseURL: "Comunes",
          method: "GET",
          endpoint: "/RefDelegacion/GetAll",
        },
      };
    }

    if (action === "GetSeccionales") {
      return {
        config: {
          baseURL: "Afiliaciones",
          method: "GET",
          endpoint: "/Seccional",
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
        numeroSeguimiento: r.numeroSeguimiento || "",
        fechaIngreso: r.fechaIngreso || "",
        provinciaNombre: r.provincia || "",
        provinciaId: r.provinciaId || 0,
        refLocalidadIdAfiliado: r.localidadId || 0,
        nombreLocalidadAfiliado: r.localidad || "",
        delegacion: r.delegacion || "",
        seccional: r.seccional || "",
        nombreDenunciante: r.nombreDenunciante || r.nombre || "",
        nombre: r.nombre || r.nombreDenunciante || "",
        telefonoContacto: r.telefonoContacto || r.telefono || "",
        telefono: r.telefono || r.telefonoContacto || "",
        correoElectronico: r.correoElectronico || r.correo || "",
        correo: r.correo || r.correoElectronico || "",
        denunciaTipoIngresoId: r.denunciaTipoIngresoId || 0,
        denunciaSituacionId: r.denunciaSituacionId || r.situacionId || 0,
        situacionDescripcion: r.situacionDescripcion || r.denunciaSituacionDescripcion || "",
        cuitEmpresa: r.empleadorCUIT ? String(r.empleadorCUIT) : "",
        razonSocial: r.empleadorNombre || "",
        detalleDenuncia: r.detalleDenuncia || r.texto || "",
        texto: r.texto || r.detalleDenuncia || "",
        ubicacion: r.ubicacion || "",
        derivadoATipo: r.derivadoATipo || r.derivadoA_Tipo || "",
        derivadoDelegacion: r.derivadoDelegacion || "",
        derivadoSeccional: r.derivadoSeccional || "",

  // Derivación: tomar SIEMPRE lo que viene de BD como fuente principal
  derivadaA: r.derivadoATipo || r.derivadaA || "Sin derivacion",
  derivadaADescripcion:
    r.derivadaADescripcion ||
    r.derivadoATipo ||
    r.derivadaA ||
    "Sin derivacion",
  derivadoAId: r.derivadoAId ?? r.derivacionId ?? 0,

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
  const tipoIngresoTodos = useMemo(
    () => ({ value: null, label: "Todos los tipos de ingreso" }),
    []
  );

  const situacionTodos = useMemo(
    () => ({ value: null, label: "Todas las situaciones" }),
    []
  );

  const situacionFallbackOptions = useMemo(() => [
    { value: 1,  label: "Consultas Salariales" },
    { value: 2,  label: "Reclamos/Diferencias Salariales" },
    { value: 3,  label: "Trabajo NO Registrado" },
    { value: 4,  label: "Maltrato laboral" },
    { value: 5,  label: "Condiciones laborales inaceptables" },
    { value: 6,  label: "Falta de Ropa de Trabajo" },
    { value: 7,  label: "Otras" },
    { value: 8,  label: "Seguridad, higiene y salud en el trabajo." },
    { value: 9,  label: "Condiciones de vivienda, alimentación y traslado." },
    { value: 10, label: "Indicios de explotación laboral." },
    { value: 11, label: "Trabajo infantil y adolescente." },
  ], []);

  const derivadoATipoTodos = useMemo(
    () => ({ value: null, label: "Todas las derivaciones" }),
    []
  );


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
  const [tipoIngresoSelect, setTipoIngresoSelect] = useState({
    loading: null,
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: tipoIngresoTodos,
  });

  const [situacionSelect, setSituacionSelect] = useState({
    loading: null,
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: situacionTodos,
  });

  const [derivadoATipoSelect, setDerivadoATipoSelect] = useState({
    loading: null,
    buscar: "",
    // Valores posibles 
    data: [
      { value: "Sin derivacion", label: "Sin derivacion" },
      { value: "Delegacion", label: "Delegacion" },
      { value: "Seccional", label: "Seccional" },
      { value: "CNTA", label: "CNTA" },
      { value: "Asesoria Letrada", label: "Asesoria Letrada" },
    ],
    error: null,
    options: [],
    selected: derivadoATipoTodos,
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

  // Cargar catálogo de Tipo de Ingreso
  useEffect(() => {
    pushQuery({
      action: "GetDenunciaTipoIngreso",
      params: {},
      onOk: (response) => {
        let data = Array.isArray(response) ? response : response?.data || [];
        const mapped = data
          .map((r) => ({
            value: r.id,
            label: r.descripcion || r.nombre || `Tipo ${r.id}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setTipoIngresoSelect((o) => ({
          ...o,
          loading: null,
          data: mapped,
          options: [tipoIngresoTodos, ...mapped],
        }));
      },
      onError: (error) => {
        console.error("Error cargando DenunciaTipoIngreso", error);
        setTipoIngresoSelect((o) => ({
          ...o,
          loading: null,
          error: error?.toString() || "Error al cargar tipos de ingreso",
          options: [tipoIngresoTodos],
        }));
      },
    });
  }, [pushQuery, tipoIngresoTodos]);

  // Cargar catálogo de Situación
  useEffect(() => {
    pushQuery({
      action: "GetDenunciaSituacion",
      params: {},
      onOk: (response) => {
        let data = Array.isArray(response) ? response : response?.data || [];
        const mapped = data
          .map((r) => ({
            value: r.id,
            label: r.descripcion || r.nombre || `Situación ${r.id}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setSituacionSelect((o) => ({
          ...o,
          loading: null,
          data: mapped,
          options: [situacionTodos, ...mapped],
        }));
      },
      onError: (error) => {
        console.error("Error cargando DenunciaSituacion", error);
        setSituacionSelect((o) => ({
          ...o,
          loading: null,
          error: error?.toString() || "Error al cargar situaciones",
          options: [situacionTodos, ...situacionFallbackOptions],
        }));
      },
    });
  }, [pushQuery, situacionTodos, situacionFallbackOptions]);

  // Búsqueda en los combos
  useEffect(() => {
    if (!tipoIngresoSelect.data.length) return;
    const options = mapOptions({
      data: tipoIngresoSelect.data,
      map: (r) => ({ value: r.value, label: r.label }),
      filter: (r) => includeSearch(r, tipoIngresoSelect.buscar),
      start: [tipoIngresoTodos],
    });
    setTipoIngresoSelect((s) => ({ ...s, options }));
  }, [tipoIngresoSelect.buscar, tipoIngresoSelect.data, tipoIngresoTodos]);

  useEffect(() => {
    if (!situacionSelect.data.length) return;
    const options = mapOptions({
      data: situacionSelect.data,
      map: (r) => ({ value: r.value, label: r.label }),
      filter: (r) => includeSearch(r, situacionSelect.buscar),
      start: [situacionTodos],
    });
    setSituacionSelect((s) => ({ ...s, options }));
  }, [situacionSelect.buscar, situacionSelect.data, situacionTodos]);

  // Opciones de Derivado A Tipo (filtradas por ámbito)
  useEffect(() => {
    if (!derivadoATipoSelect.data.length) return;

    let dataFiltrada = derivadoATipoSelect.data;


    if (usuarioSeccionalId) {
      dataFiltrada = derivadoATipoSelect.data.filter((r) => r.value === "Seccional");
    } else if (usuarioDelegacionId) {

      dataFiltrada = derivadoATipoSelect.data.filter((r) => ["Delegacion", "Seccional"].includes(r.value));
    }

    const options = mapOptions({
      data: dataFiltrada,
      map: (r) => ({ value: r.value, label: r.label }),
      filter: (r) => includeSearch(r, derivadoATipoSelect.buscar),
      start: [derivadoATipoTodos],
    });
    setDerivadoATipoSelect((s) => ({ ...s, options }));
  }, [
    derivadoATipoSelect.buscar,
    derivadoATipoSelect.data,
    derivadoATipoTodos,
    usuarioDelegacionId,
    usuarioSeccionalId,
  ]);


  //  Estados de filtros locales (se aplican automáticamente en useDenuncias)
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  // Estado con los filtros actualmente aplicados (no se actualiza automáticamente)
  const [appliedFilters, setAppliedFilters] = useState(() => ({
    estado: null,
    fechaDesde: null,
    fechaHasta: null,
    tipoIngresoId: null,
    situacionId: null,
    derivadoATipo: null,
    derivadoAId: null,
  }));

  const delegacionTodos = useMemo(() => ({ value: null, label: "Todas las delegaciones" }), []);
  const seccionalTodos = useMemo(() => ({ value: null, label: "Todas las seccionales" }), []);

  const [delegacionSelect, setDelegacionSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: delegacionTodos,
  });
  const [seccionalSelect, setSeccionalSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: seccionalTodos,
  });

  // Autocompletar filtros según ámbito del usuario y bloquear cambios
  useEffect(() => {

    const delegacionesListas = delegacionSelect.loading === null || delegacionSelect.loading === undefined;
    const seccionalesListas = seccionalSelect.loading === null || seccionalSelect.loading === undefined;
    if (!delegacionesListas || !seccionalesListas) return;


    if (usuarioSeccionalId) {
      const secOption = seccionalSelect.data.find(o => Number(o.value) === Number(usuarioSeccionalId));
      if (secOption) {
        setSeccionalSelect(o => ({ ...o, selected: secOption }));
        const delegId = Number(secOption.record?.refDelegacionId);
        const delOption = delegacionSelect.data.find(o => Number(o.value) === Number(delegId));
        if (delOption) setDelegacionSelect(o => ({ ...o, selected: delOption }));
      }
      const derivSec = derivadoATipoSelect.data.find(o => o.value === 'Seccional');
      if (derivSec) setDerivadoATipoSelect(o => ({ ...o, selected: derivSec }));
      return; // Seccional tiene prioridad
    }


    if (usuarioDelegacionId) {
      const delOption = delegacionSelect.data.find(o => Number(o.value) === Number(usuarioDelegacionId));
      if (delOption) setDelegacionSelect(o => ({ ...o, selected: delOption }));

    }
  }, [usuarioSeccionalId, usuarioDelegacionId, delegacionSelect.loading, seccionalSelect.loading, delegacionSelect.data, seccionalSelect.data, derivadoATipoSelect.data, setSeccionalSelect, setDelegacionSelect, setDerivadoATipoSelect]);

  // Cargar delegaciones
  useEffect(() => {
    if (delegacionSelect.loading !== "Cargando...") return;
    pushQuery({
      action: "GetDelegaciones",
      params: { soloActivos: true },
      onOk: (resp) => {
        const arr = Array.isArray(resp) ? resp : resp?.data || [];
        const mapped = arr.map(r => ({ value: r.id, label: r.nombre, record: r }));
        setDelegacionSelect(o => ({ ...o, loading: null, data: mapped, options: [delegacionTodos, ...mapped] }));
      },
      onError: (err) => setDelegacionSelect(o => ({ ...o, loading: null, error: err?.toString(), options: [delegacionTodos] })),
    });
  }, [pushQuery, delegacionSelect.loading, delegacionTodos]);

  // Cargar seccionales
  useEffect(() => {
    if (seccionalSelect.loading !== "Cargando...") return;
    pushQuery({
      action: "GetSeccionales",
      params: { soloActivos: true },
      onOk: (resp) => {
        const arr = Array.isArray(resp) ? resp : resp?.data || [];
        // Guardamos crudo en data para poder filtrar luego por delegación
        const mapped = arr.map(r => ({ value: r.id, label: [r.codigo, r.descripcion].join(" - "), record: r }));
        setSeccionalSelect(o => ({ ...o, loading: null, data: mapped, options: [seccionalTodos, ...mapped] }));
      },
      onError: (err) => setSeccionalSelect(o => ({ ...o, loading: null, error: err?.toString(), options: [seccionalTodos] })),
    });
  }, [pushQuery, seccionalSelect.loading, seccionalTodos]);

  // Búsqueda delegaciones
  useEffect(() => {
    const options = [delegacionTodos, ...delegacionSelect.data.filter(opt => includeSearch(opt, delegacionSelect.buscar))];
    setDelegacionSelect(o => ({ ...o, options }));
  }, [delegacionSelect.buscar, delegacionSelect.data, delegacionTodos]);

  // Búsqueda y filtrado seccionales por delegación
  useEffect(() => {
    let base = seccionalSelect.data;
    const delegId = delegacionSelect.selected?.value;
    if (delegId) base = base.filter(opt => Number(opt.record?.refDelegacionId) === Number(delegId));
    const filtered = base.filter(opt => includeSearch(opt, seccionalSelect.buscar));
    const options = [seccionalTodos, ...filtered];
    // La lógica de reset se hace dentro del setter para leer el estado actual en el momento del update
    setSeccionalSelect(o => {
      const currentValue = o.selected?.value;
      // Solo resetear si hay una selección concreta que ya no existe en las opciones filtradas
      const stillExists = currentValue != null && options.some(opt => opt.value === currentValue);
      return { ...o, options, selected: stillExists ? o.selected : seccionalTodos };
    });
  }, [seccionalSelect.buscar, seccionalSelect.data, delegacionSelect.selected, seccionalTodos]);


  // ==============================
  // Exportar a Excel
  // ==============================
  const { exportToExcel } = useGeneracionExcel();
  const tareasManager = useTareasUsuario();
  const [exportLoading, setExportLoading] = useState(false);

  // Verificar permisos del usuario para determinar qué columnas exportar
  const puedeVerTodosLosDatos = useMemo(() => {
    if (!usuario) return false;
    const esAdministrador = usuario.roles?.includes("Administrador");
    const tieneTareaDenunciasDatos = tareasManager.hasTarea("Denuncias_Datos");
    const ambitoEsTodos = ambitoInfo?.tipo === "Todos";
    return esAdministrador || tieneTareaDenunciasDatos || ambitoEsTodos;
  }, [usuario, tareasManager, ambitoInfo]);

  // Verificar permisos para exportar
  const puedeExportar = useMemo(() => {
    const esAdministrador = usuario?.roles?.includes("Administrador") || false;
    const tieneTareaExcel = tareasManager.hasTarea("Excel_Denuncias");
    const ambitoEsTodos = ambitoInfo?.tipo === "Todos";
    return esAdministrador || tieneTareaExcel || ambitoEsTodos;
  }, [usuario, tareasManager, ambitoInfo]);

  const exportarAExcel = useCallback(() => {
    if (exportLoading || !puedeExportar) return;

    setExportModalOpen(true);
  }, [exportLoading, puedeExportar]);

  // Función para manejar la exportación desde el modal
  const handleExportFromModal = useCallback(async (selectedData, estadoSeleccionado) => {
    if (!selectedData || selectedData.length === 0) {
      alert("No hay datos seleccionados para exportar.");
      return;
    }

    setExportLoading(true);

    try {
      // Los datos ya vienen formateados y con todas las columnas desde ExportModal.
      // No re-mapear: cualquier re-mapeo descartaría los campos nuevos.
      const estadoFiltro = estadoSeleccionado?.value ? `_${estadoSeleccionado.value}` : "";
      const nombreArchivo = `Denuncias_${puedeVerTodosLosDatos ? "Completo" : "Limitado"}${estadoFiltro}_con_Novedades`;
      await exportToExcel(
        [{ sheetName: "Denuncias", data: selectedData }],
        nombreArchivo
      );

      setExportModalOpen(false);
    } catch (error) {
      console.error("Error en exportación a Excel:", error);
      alert(`Error al generar Excel: ${error?.message || error}`);
    } finally {
      setExportLoading(false);
    }
  }, [
    puedeVerTodosLosDatos,
    exportToExcel,
    setExportModalOpen,
    setExportLoading,
  ]);

  // ==============================
  // TABLA: DENUNCIAS
  // ==============================

  // Calcular DerivadoAId según selección
  const filtroDerivadoATipoValue = derivadoATipoSelect.selected?.value || null;
  const filtroDelegacionValue = delegacionSelect.selected?.value || null;
  const filtroSeccionalValue = seccionalSelect.selected?.value || null;
  const filtroDerivadoAIdValue = filtroDerivadoATipoValue === 'Delegacion'
    ? filtroDelegacionValue
    : filtroDerivadoATipoValue === 'Seccional'
      ? filtroSeccionalValue
      : null;

  // Bloqueo por ámbito del usuario
  const bloquearDelegacion = !!usuarioSeccionalId || !!usuarioDelegacionId;
  const bloquearSeccional = !!usuarioSeccionalId;

  const bloquearDerivadoA = !!usuarioSeccionalId;

  // Estados de disabled para aplicar opacidad visual
  const disabledDerivadoA = bloquearDerivadoA;
  const disabledDelegacion = bloquearDelegacion;
  const disabledSeccional = bloquearSeccional;

  const handleDelegacionChange = useCallback((selected = delegacionTodos) => {
    setDelegacionSelect((o) => ({ ...o, selected }));

    if (selected?.value) {
      const derivadoDelegacion = derivadoATipoSelect.data.find((r) => r.value === "Delegacion") || derivadoATipoTodos;
      setDerivadoATipoSelect((o) => ({ ...o, selected: derivadoDelegacion }));
      setSeccionalSelect((o) => ({ ...o, selected: seccionalTodos }));
    } else if (derivadoATipoSelect.selected?.value === "Delegacion") {
      setDerivadoATipoSelect((o) => ({ ...o, selected: derivadoATipoTodos }));
    }
  }, [delegacionTodos, derivadoATipoSelect.data, derivadoATipoSelect.selected?.value, derivadoATipoTodos, seccionalTodos]);

  const handleSeccionalChange = useCallback((selected = seccionalTodos) => {
    setSeccionalSelect((o) => ({ ...o, selected }));

    if (selected?.value) {
      const derivadoSeccional = derivadoATipoSelect.data.find((r) => r.value === "Seccional") || derivadoATipoTodos;
      setDerivadoATipoSelect((o) => ({ ...o, selected: derivadoSeccional }));

      const delegacionId = Number(selected.record?.refDelegacionId);
      if (delegacionId) {
        const delegacionRelacionada = delegacionSelect.data.find((r) => Number(r.value) === delegacionId);
        if (delegacionRelacionada) {
          setDelegacionSelect((o) => ({ ...o, selected: delegacionRelacionada }));
        }
      }
    } else if (derivadoATipoSelect.selected?.value === "Seccional") {
      setDerivadoATipoSelect((o) => ({ ...o, selected: derivadoATipoTodos }));
    }
  }, [delegacionSelect.data, derivadoATipoSelect.data, derivadoATipoSelect.selected?.value, derivadoATipoTodos, seccionalTodos]);

  const {
    render: denunciaRender,
    request: denunciaRequest,
    selected: denunciasSelected,
    data: denunciasData,
  } = useDenuncias({
    filtroEstado: appliedFilters.estado || null,
    filtroFechaDesde: appliedFilters.fechaDesde || null,
    filtroFechaHasta: appliedFilters.fechaHasta || null,
    filtroTipoIngresoId: appliedFilters.tipoIngresoId || null,
    filtroSituacionId: appliedFilters.situacionId || null,
    filtroDerivadoATipo: appliedFilters.derivadoATipo || null,
    filtroDerivadoAId: appliedFilters.derivadoAId || null,
    usuarioAmbito: usuarioAmbito, //  filtrado por ámbito del usuario
    applyAmbitoFilter: applyAmbitoFilter, //  función de filtrado por ámbito
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

    const desc = denunciasSelected?.id || "";

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
        action: `Consulta Denuncia nro. ${desc}`,
        onExecute: () => (denunciasSelected ? openForm("C", denunciasSelected) : null),
        tarea: "AdminApp_DenunciaConsulta",
        ...(denunciasSelected ? { disabled: false, keys: "o", underlineindex: 1 } : { disabled: true }),
      }),
      ...(!denunciasSelected || !isFinalizada
        ? [
          createAction({
            action: `Modifica Denuncia nro. ${desc}`,
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
      //  Exportar a Excel - Solo para administradores o usuarios con tarea Excel_Denuncias
      createAction({
        action: "Exportar a Excel",
        onExecute: () => exportarAExcel(),
        keys: "e",
        underlineindex: 0,
        disabled: !puedeExportar, // Usar verificación personalizada de permisos
      }),
    ];

    setDenunciasActions(actions);
  }, [denunciasSelected, openForm, exportarAExcel, puedeExportar]);

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
        <Grid grid="auto / 1fr 1fr 1fr" gap="inherit">
          <SearchSelectMaterial
            label="Estado de Denuncia"
            error={!!estadoSelect.error}
            helperText={estadoSelect.error || undefined}
            value={estadoSelect.selected}
            onChange={(selected = estadoTodos) => {
              setEstadoSelect((o) => ({ ...o, selected, origen: "option" }));
            }}
            options={estadoSelect.options}
            onTextChange={() => {}}
            freeSolo={false}
            inputReadOnly={true}
          />

          <SearchSelectMaterial
            label="Tipo de Ingreso"
            error={!!tipoIngresoSelect.error}
            helperText={tipoIngresoSelect.error || undefined}
            value={tipoIngresoSelect.selected}
            onChange={(selected = tipoIngresoTodos) => {
              setTipoIngresoSelect((o) => ({ ...o, selected }));
            }}
            options={tipoIngresoSelect.options}
            onTextChange={() => {}}
            freeSolo={false}
            inputReadOnly={true}
          />
          <SearchSelectMaterial
            label="Situación"
            error={!!situacionSelect.error}
            helperText={situacionSelect.error || undefined}
            value={situacionSelect.selected}
            onChange={(selected = situacionTodos) => {
              setSituacionSelect((o) => ({ ...o, selected }));
            }}
            options={situacionSelect.options}
            onTextChange={() => {}}
            freeSolo={false}
            inputReadOnly={true}
          />

        </Grid>

        {/* Filtros por Tipo de Ingreso y Situación */}
        <Grid grid="auto / 1fr 1fr 1fr 1fr 1fr 150px 150px" gap="inherit">

          <SearchSelectMaterial
            label="Derivado A"
            error={!!derivadoATipoSelect.error}
            helperText={derivadoATipoSelect.error || undefined}
            value={derivadoATipoSelect.selected}
            onChange={(selected = derivadoATipoTodos) => {
              setDerivadoATipoSelect((o) => ({ ...o, selected }));
              if (selected?.value !== 'Delegacion' && selected?.value !== 'Seccional') {
                setDelegacionSelect(o => ({ ...o, selected: delegacionTodos }));
              }
              if (selected?.value !== 'Seccional') {
                setSeccionalSelect(o => ({ ...o, selected: seccionalTodos }));
              }
            }}
            options={derivadoATipoSelect.options}
            onTextChange={() => {}}
            freeSolo={false}
            inputReadOnly={true}
            disabled={disabledDerivadoA}
            style={{ opacity: disabledDerivadoA ? 0.6 : 1 }}
          />
          <SearchSelectMaterial
            label="Delegación"
            error={!!delegacionSelect.error}
            helperText={delegacionSelect.error || undefined}
            value={delegacionSelect.selected}
            onChange={handleDelegacionChange}
            options={delegacionSelect.options}
            onTextChange={() => {}}
            freeSolo={false}
            inputReadOnly={true}
            disabled={disabledDelegacion}
            style={{ opacity: disabledDelegacion ? 0.6 : 1 }}
          />
          <SearchSelectMaterial
            label="Seccional"
            error={!!seccionalSelect.error}
            helperText={seccionalSelect.error || undefined}
            value={seccionalSelect.selected}
            onChange={handleSeccionalChange}
            options={seccionalSelect.options}
            onTextChange={() => {}}
            freeSolo={false}
            inputReadOnly={true}
            disabled={disabledSeccional}
            style={{ opacity: disabledSeccional ? 0.6 : 1 }}
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
            onClick={() => {
              const derivadoTipo = filtroSeccionalValue
                ? "Seccional"
                : filtroDelegacionValue
                  ? "Delegacion"
                  : derivadoATipoSelect.selected?.value || null;
              const derivadoId = filtroSeccionalValue
                ? filtroSeccionalValue
                : filtroDelegacionValue
                  ? filtroDelegacionValue
                  : null;

              setAppliedFilters({
                estado: estadoSelect.selected?.value || null,
                fechaDesde: fechaDesde ? dayjs(fechaDesde).format("YYYY-MM-DD") : null,
                fechaHasta: fechaHasta ? dayjs(fechaHasta).format("YYYY-MM-DD") : null,
                tipoIngresoId: tipoIngresoSelect.selected?.value
                  ? Number(tipoIngresoSelect.selected.value)
                  : null,
                situacionId: situacionSelect.selected?.value
                  ? Number(situacionSelect.selected.value)
                  : null,
                derivadoATipo: derivadoTipo,
                derivadoAId: derivadoId ? Number(derivadoId) : null,
              });
            }}
           >
            Aplica filtros
          </Button>



          <Button
            className="botonAzul"
            disabled={
              !estadoSelect.selected?.value &&
              !fechaDesde &&
              !fechaHasta &&
              !tipoIngresoSelect.selected?.value &&
              !situacionSelect.selected?.value &&
              !filtroDerivadoATipoValue &&
              !filtroDerivadoAIdValue &&
              !filtroDelegacionValue &&
              !filtroSeccionalValue
            }
            onClick={() => {
              let nextDerivadoTipo = null;
              let nextDerivadoId = null;

              setEstadoSelect((o) => ({
                ...o,
                selected: estadoTodos,
                buscar: "",
              }));
              setFechaDesde(null);
              setFechaHasta(null);


              setTipoIngresoSelect((o) => ({
                ...o,
                selected: tipoIngresoTodos,
                buscar: "",
              }));
              setSituacionSelect((o) => ({
                ...o,
                selected: situacionTodos,
                buscar: "",
              }));
              setDerivadoATipoSelect((o) => ({ ...o, selected: derivadoATipoTodos, buscar: "" }));
              // Mantener delegación/seccional del usuario si existen
              if (usuarioSeccionalId) {
                const secOption = seccionalSelect.data.find(o => Number(o.value) === Number(usuarioSeccionalId)) || seccionalTodos;
                setSeccionalSelect((o) => ({ ...o, selected: secOption, buscar: "" }));
                const delegId = Number(secOption.record?.refDelegacionId);
                const delOption = delegacionSelect.data.find(o => Number(o.value) === Number(delegId)) || delegacionTodos;
                setDelegacionSelect((o) => ({ ...o, selected: delOption, buscar: "" }));
                const derivSec = derivadoATipoSelect.data.find(o => o.value === 'Seccional') || derivadoATipoTodos;
                setDerivadoATipoSelect((o) => ({ ...o, selected: derivSec }));
                nextDerivadoTipo = derivSec?.value || null;
                nextDerivadoId = secOption && secOption.value ? Number(secOption.value) : null;
              } else if (usuarioDelegacionId) {
                const delOption = delegacionSelect.data.find(o => Number(o.value) === Number(usuarioDelegacionId)) || delegacionTodos;
                setDelegacionSelect((o) => ({ ...o, selected: delOption, buscar: "" }));
                // Mantener "Derivado A" en "Todas las derivaciones" para no filtrar por delegación
                setDerivadoATipoSelect((o) => ({ ...o, selected: derivadoATipoTodos }));
                setSeccionalSelect((o) => ({ ...o, selected: seccionalTodos, buscar: "" }));
              } else {
                setDelegacionSelect((o) => ({ ...o, selected: delegacionTodos, buscar: "" }));
                setSeccionalSelect((o) => ({ ...o, selected: seccionalTodos, buscar: "" }));
              }

              setAppliedFilters({
                estado: null,
                fechaDesde: null,
                fechaHasta: null,
                tipoIngresoId: null,
                situacionId: null,
                derivadoATipo: nextDerivadoTipo,
                derivadoAId: nextDerivadoId,
              });

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
                onLoadSelect: onLoadSelectFirst,
              });
            }
          }}
        />
      )}

      {/* Modal de exportación */}
      {exportModalOpen && (
        <ExportModal
          onClose={(exportData, estadoSeleccionado) => {
            setExportModalOpen(false);
            if (exportData && exportData.length > 0) {
              handleExportFromModal(exportData, estadoSeleccionado);
            }
          }}
          currentFilters={{
            ...(appliedFilters.estado && { estado: appliedFilters.estado }),
            ...(appliedFilters.fechaDesde && { fechaDesde: appliedFilters.fechaDesde }),
            ...(appliedFilters.fechaHasta && { fechaHasta: appliedFilters.fechaHasta }),
            ...(appliedFilters.tipoIngresoId && { denunciaTipoIngresoId: Number(appliedFilters.tipoIngresoId) }),
            ...(appliedFilters.situacionId && { denunciaSituacionId: Number(appliedFilters.situacionId) }),
            ...(appliedFilters.derivadoATipo && { derivadoATipo: appliedFilters.derivadoATipo }),
            ...(appliedFilters.derivadoAId && { derivadoAId: Number(appliedFilters.derivadoAId) }),
            sortBy: "+fecha",
            pageSize: 10000,
            pageIndex: 1,
          }}
          usuarioAmbito={usuarioAmbito}
          applyAmbitoFilter={applyAmbitoFilter}
          initialData={denunciasData}
        />
      )}
    </Grid>
  );
};

export default DenunciasHandler;
