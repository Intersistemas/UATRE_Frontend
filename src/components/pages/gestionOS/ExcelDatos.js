// OPCION DE CARGA

import React, { useEffect, useMemo, useState, useCallback, useContext } from "react";
import dayjs from "dayjs";
import { Modal } from "react-bootstrap";
import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import useGeneracionExcel from "components/hooks/useGeneracionExcel";
import useAmbitos from "components/hooks/useAmbitos";
import AuthContext from "store/authContext";

/* ================= columnas de la tabla ================= */
const columns = [
  { dataField: "id", text: "Nro Gestión", sort: true, headerStyle: () => ({ width: "100px", textAlign: "center" }) },
  { dataField: "fecha", text: "Fecha", sort: true, formatter: (v) => Formato.Fecha(v), headerStyle: { width: "120px", textAlign: "center" } },
  { dataField: "usuarioMostrar", text: "Usuario", sort: true, headerStyle: { width: "160px" } },
  { dataField: "seccionalCodigo", text: "Codigo Seccional", sort: true, headerStyle: { width: "110px" } },
  { dataField: "seccionalNombre", text: "Nombre Seccional", sort: true, headerStyle: { width: "160px" } },
  { dataField: "cuitTitular", text: "CUIL Titular", sort: true, formatter: Formato.Cuit, headerStyle: { width: "130px" } },
  { dataField: "nombreTitular", text: "Nombre Titular", headerStyle: { width: "140px" }, style: { textAlign: "left" } },
  { dataField: "apellidoTitular", text: "Apellido Titular", headerStyle: { width: "140px" }, style: { textAlign: "left" } },
  { dataField: "telefonoContacto", text: "Tel.Contacto", headerStyle: { width: "120px" }, style: { textAlign: "left" } },
  { dataField: "telefonoContacto2", text: "Tel.Contacto2", headerStyle: { width: "120px" }, style: { textAlign: "left" } },
  { dataField: "emailContacto", text: "Email Contacto", headerStyle: { width: "180px" }, style: { textAlign: "left" } },
  { dataField: "emailContacto2", text: "Email Contacto2", headerStyle: { width: "180px" }, style: { textAlign: "left" } },
  { dataField: "elPacienteEsTitular", text: "Paciente es Titular", headerStyle: { width: "150px" }, formatter: (v) => (v ? "Sí" : "No") },
  { dataField: "tipoDocumentoMostrar", text: "Tipo de Documento", headerStyle: { width: "110px" } },
  { dataField: "dniPaciente", text: "DNI Paciente", formatter: Formato.DNI, headerStyle: { width: "120px" } },
  { dataField: "nombrePaciente", text: "Nombre Paciente", headerStyle: { width: "140px" } },
  { dataField: "apellidoPaciente", text: "Apellido Paciente", headerStyle: { width: "140px" } },
  { dataField: "fechaNacimiento", text: "Fecha Nacimiento", formatter: (v) => Formato.Fecha(v), headerStyle: { width: "120px" } },
  { dataField: "sexoMostrar", text: "Sexo", headerStyle: { width: "100px" } },
  { dataField: "medioGestion", text: "Gestión", headerStyle: { width: "110px" } },
  { dataField: "telefono", text: "Telefono", headerStyle: { width: "120px" } },
  { dataField: "resultadoLlamada", text: "Resultado", headerStyle: { width: "140px" } },
  { dataField: "direccionesEmailDestino", text: "Email Destino", headerStyle: { width: "200px" } },
  { dataField: "texto", text: "Detalle Gestión", headerStyle: { width: "260px" }, style: { textAlign: "left" } },
  { dataField: "fechaFinalizadaMostrar", text: "Fecha Finalizada", headerStyle: { width: "130px" } },
  { dataField: "finalizadaPorMostrar", text: "Finalizada Por", headerStyle: { width: "150px" } },
  { dataField: "finalizadoComentarioMostrar", text: "Comentarios Finalizacion", headerStyle: { width: "240px" } },
  { dataField: "atencionesPrevias", text: "Atención Paciente", headerStyle: { width: "140px" } },
  { dataField: "conCoberturaOsprera", text: "Cobertura Osprera", headerStyle: { width: "150px" } },
  { dataField: "gestionAreaOspreraDescripcion", text: "Area Osprera", headerStyle: { width: "150px" } },
  { dataField: "gestionEstadoDescripcion", text: "Estado", headerStyle: { width: "120px" } },
  { dataField: "gestionSituacionDescripcion", text: "Situación", headerStyle: { width: "150px" } },
  { dataField: "tipoPrestador", text: "Tipo Prestador", headerStyle: { width: "140px" } },
  { dataField: "gestionRubroDescripcion", text: "Rubro", headerStyle: { width: "140px" } },
  { dataField: "gestionSubRubroDescripcion", text: "SubRubro", headerStyle: { width: "160px" } },
  { dataField: "observacionesEstado", text: "Obs.Estado", headerStyle: { width: "260px" }, style: { textAlign: "left" } },
  { dataField: "gestionObraSocialDescripcion", text: "Obra Social", headerStyle: { width: "180px" } },
];

// Estructura base de filtros (vacía por ahora)
const filtrosDef = {};

// Utils
const normGuid = (v) => String(v ?? "").toLowerCase().replace(/[{}]/g, "").trim();
const onlyDigits = (v) => String(v ?? "").replace(/\D/g, "");
const asUser = (v) => String(v ?? "").trim();

const ExcelDatos = ({ onClose = () => { }, paramsFiltrados = {} }) => {
  const { exportToExcel } = useGeneracionExcel();
  const ambito = useAmbitos().ambitoUser();
  const usuario = useContext(AuthContext)?.usuario;
  
  // Estado para almacenar los IDs de las seccionales de la delegación
  const [seccionalesDelegacion, setSeccionalesDelegacion] = useState([]);

  /* ====== API builder ====== */
  const pushQuery = useQueryQueue((action, params = {}) => {
    const build = ({ baseURL, endpoint, method, body }) => ({
      config: { baseURL, endpoint, method },
      ...(body ? { body } : {}),
    });
    switch (action) {
      case "GetList":
        return build({
          baseURL: "Afiliaciones",
          endpoint: "/GestionOsprera/GetGestionOSpreraSpec",
          method: "POST",
          body: params,
        });
      case "GetSeccionales":
        return build({
          baseURL: "Afiliaciones",
          endpoint: "/Seccional?SoloActivos=true&verSeccionalesLocalidades=false",
          method: "GET",
        });
      case "GetTiposDocumento":
        return build({ baseURL: "Afiliaciones", endpoint: "/TipoDocumento", method: "GET" });
      case "GetSexos":
        return build({ baseURL: "Afiliaciones", endpoint: "/Sexo", method: "GET" });
      case "GetUsuarios":
        return build({ baseURL: "Seguridad", endpoint: "/Usuario/GetAll", method: "GET" });
      default:
        return null;
    }
  });

  //#region Cargar seccionales de la delegación si el ámbito es Delegaciones
  useEffect(() => {
    if (ambito.tipo === 'Delegaciones' && ambito.ids && ambito.ids.length > 0) {
      const delegacionId = ambito.ids[0];
      
      pushQuery({
        action: "GetSeccionales",
        onOk: (response) => {
          // La respuesta es directamente el array o puede venir en response.data
          const seccionales = Array.isArray(response) ? response : (response?.data || []);
          
          if (Array.isArray(seccionales) && seccionales.length > 0) {
            // Filtrar seccionales por la delegación actual
            const seccionalesFiltradas = seccionales
              .filter(s => s.refDelegacionId === delegacionId && s.id !== 99999)
              .map(s => s.id);
            
            setSeccionalesDelegacion(seccionalesFiltradas);
          }
        },
        onError: (error) => {
          console.error("Error al cargar seccionales de la delegación:", error);
        }
      });
    }
  }, [ambito.tipo, ambito.ids, pushQuery]);
  //#endregion

  /* ===== Filtros UI ===== */
  const [filtros, setFiltros] = useState({ ...filtrosDef });
  const [fechaIngresoDesde, setDesde] = useState(null);
  const [fechaIngresoHasta, setHasta] = useState(null);
  const normPicker = (v) => (v?.format ? v.format("YYYY-MM-DD") : v);
  const handleFechaFiltro = (desde = "", hasta = "") =>
    setFiltros((o) => {
      const f = { ...o };
      if (!desde && !hasta) { delete f.fechaIngreso; delete f.fechaIngresoHasta; }
      else if (!desde) { f.fechaIngreso = hasta; f.fechaIngresoHasta = hasta; }
      else if (!hasta) { f.fechaIngreso = desde; f.fechaIngresoHasta = desde; }
      else { f.fechaIngreso = desde; f.fechaIngresoHasta = hasta; }
      return f;
    });

  /* ===== Catálogos ===== */
  const [mapSeccional, setMapSeccional] = useState({});
  const [mapTipoDoc, setMapTipoDoc] = useState({});
  const [mapSexo, setMapSexo] = useState({});

  // Estado de readiness (esperamos usuarios + catálogos)
  const [ready, setReady] = useState({ users: false, secc: false, tipodoc: false, sexo: false });
  const allReady = ready.users && ready.secc && ready.tipodoc && ready.sexo;

  useEffect(() => {
    // Seccionales
    pushQuery({
      action: "GetSeccionales",
      onOk: (arr) => {
        const m = {};
        (arr || []).forEach((r) => { m[r.id] = { codigo: r.codigo, descripcion: r.descripcion }; });
        setMapSeccional(m);
        setReady((o) => ({ ...o, secc: true }));
      },
      onError: () => { setMapSeccional({}); setReady((o) => ({ ...o, secc: true })); },
    });
    // Tipos de doc
    pushQuery({
      action: "GetTiposDocumento",
      onOk: (arr) => {
        const m = {};
        (arr || []).filter((r) => r.id !== 99999).forEach((r) => { m[r.id] = r.descripcion; });
        setMapTipoDoc(m);
        setReady((o) => ({ ...o, tipodoc: true }));
      },
      onError: () => { setMapTipoDoc({}); setReady((o) => ({ ...o, tipodoc: true })); },
    });
    // Sexos
    pushQuery({
      action: "GetSexos",
      onOk: (arr) => {
        const m = {};
        (arr || []).filter((r) => r.id !== 99999).forEach((r) => { m[r.id] = r.descripcion; });
        setMapSexo(m);
        setReady((o) => ({ ...o, sexo: true }));
      },
      onError: () => { setMapSexo({}); setReady((o) => ({ ...o, sexo: true })); },
    });
  }, [pushQuery]);

  /* ===== Usuarios – índices ===== */
  const [usrIdx, setUsrIdx] = useState({ byId: {}, byUser: {}, byCuit: {} });

  useEffect(() => {
    let cancel = false;
    const pageSize = 500;
    const byId = {};
    const byUser = {};
    const byCuit = {};

    const pedirPagina = (pageIndex) =>
      new Promise((resolve, reject) => {
        pushQuery({
          action: "GetUsuarios",
          params: { pageIndex, pageSize },
          onOk: (res) => {
            const lista = Array.isArray(res?.data) ? res.data : [];
            lista.forEach((u) => {
              const nombre =
                u?.nombre ||
                (u?.apellido && u?.nombre && `${u.apellido}, ${u.nombre}`) ||
                u?.userName ||
                u?.email ||
                u?.id;
              const idKey = normGuid(u?.id);
              const userKey = asUser(u?.userName);
              const cuitKey = onlyDigits(u?.cuit ?? u?.userName);
              if (idKey) byId[idKey] = nombre;
              if (userKey) byUser[userKey] = nombre;
              if (cuitKey) byCuit[cuitKey] = nombre;
            });
            resolve({ totalPages: Number(res?.pages) || pageIndex, items: lista.length });
          },
          onError: reject,
        });
      });

    (async () => {
      try {
        const first = await pedirPagina(1);
        const totalPages = first.totalPages;
        for (let i = 2; i <= totalPages; i++) {
          const { items } = await pedirPagina(i);
          if (!items) break;
        }
        if (!cancel) {
          setUsrIdx({ byId, byUser, byCuit });
          setReady((o) => ({ ...o, users: true }));
        }
      } catch {
        if (!cancel) {
          setUsrIdx({ byId: {}, byUser: {}, byCuit: {} });
          setReady((o) => ({ ...o, users: true }));
        }
      }
    })();

    return () => { cancel = true; };
  }, [pushQuery]);

  /* ===== Estado de lista / paginado local ===== */
  const [list, setList] = useState({
    reload: true,
    loading: null,
    error: null,
    allData: [],
    rawAll: [],
    data: [],
    sort: "FechaDesc,IdDesc",
    params: { ...filtrosDef, ...paramsFiltrados },
    pagination: { index: 1, size: 10, count: 0 },
  });

  const parseFecha = (v) => (v ? dayjs(v).startOf("day") : null);

  const sortLocal = (arr, sortStr) => {
    const parts = String(sortStr || "").split(",").filter(Boolean);
    const cp = [...arr];
    cp.sort((a, b) => {
      for (const p of parts) {
        const desc = /Desc$/i.test(p);
        const field = p.replace(/Desc$/i, "");
        const isFecha = field.toLowerCase().includes("fecha");
        const va = isFecha ? (a[field] ? new Date(a[field]).getTime() : 0) : (a[field] ?? "");
        const vb = isFecha ? (b[field] ? new Date(b[field]).getTime() : 0) : (b[field] ?? "");
        if (va < vb) return desc ? 1 : -1;
        if (va > vb) return desc ? -1 : 1;
      }
      return 0;
    });
    return cp;
  };

  const runLocalFilterPaginate = useCallback((all, params, pagination, sort) => {
    let res = [...all];

    const d = parseFecha(params.fechaIngreso);
    const h = parseFecha(params.fechaIngresoHasta);
    if (d || h) {
      res = res.filter((r) => {
        const fr = parseFecha(r.fecha);
        if (!fr) return false;
        const okD = d ? !fr.isBefore(d, "day") : true;
        const okH = h ? !fr.isAfter(h, "day") : true;
        return okD && okH;
      });
    }

    res = sortLocal(res, sort);
    const count = res.length;
    const start = (pagination.index - 1) * pagination.size;
    const end = start + pagination.size;
    const page = res.slice(start, end);

    return { page, count, filteredAll: res };
  }, []);

  const enrich = useCallbackEnricher(mapSeccional, mapTipoDoc, mapSexo, usrIdx);

  //#region Actualizar parámetros cuando cambien los filtros pasados desde el padre
  useEffect(() => {
    setList((o) => ({
      ...o,
      params: { ...filtrosDef, ...paramsFiltrados },
      reload: true,
    }));
  }, [paramsFiltrados]);
  //#endregion

  /* ===== Descarga TODAS las páginas de gestiones (espera allReady) ===== */
  useEffect(() => {
    if (!list.reload) return;
    if (!allReady) return;
    
    // Si el ámbito es Delegaciones y aún no se cargaron las seccionales, esperar
    if (ambito.tipo === 'Delegaciones' && seccionalesDelegacion.length === 0) {
      return;
    }

    setList((o) => ({ ...o, loading: "Cargando...", error: null }));

    const pageSize = 1000;
    const MAX_PAGES = 10000;
    const acumulado = [];

    const pedirPagina = (idx) =>
      new Promise((resolve, reject) => {
        // Extraer valores de los filtros (pueden venir como objetos con { value, label })
        const filtroSeccional = list.params?.filtroSeccional?.value || list.params?.filtroSeccional || 0;
        const filtroTipoEstado = list.params?.filtroTipoEstado?.value || list.params?.filtroTipoEstado || 0;
        const filtroTipoGestion = list.params?.filtroTipoGestion?.value || list.params?.filtroTipoGestion || 0;
        const filtroDetalleTipoGestion = list.params?.filtroDetalleTipoGestion?.value || list.params?.filtroDetalleTipoGestion || 0;
        const filtroMedioGestion = list.params?.filtroMedioGestion?.value || list.params?.filtroMedioGestion || "";
        const filtroPaciente = list.params?.filtroPaciente || "";
        const filtro = list.params?.filtro || "";
        const filtroTipoSituacion = list.params?.filtroTipoSituacion?.value || list.params?.filtroTipoSituacion || 0;

        // Aplicar la misma lógica que useGestionOS para manejar el ambitoDelegacion
        let bodyToSend = {
          pageIndex: idx,
          pageSize,
          sort: list.sort,
          apellidoTitular: filtro,
          apellidoPaciente: filtroPaciente,
        };

        // Agregar filtros opcionales solo si tienen valor
        if (filtroMedioGestion && filtroMedioGestion !== "" && filtroMedioGestion?.toUpperCase() !== "TODOS") {
          bodyToSend.medioGestion = filtroMedioGestion;
        }
        if (filtroTipoEstado && filtroTipoEstado !== 0) {
          bodyToSend.gestionEstadoId = filtroTipoEstado;
        }
        if (filtroTipoSituacion && filtroTipoSituacion !== 0) {
          bodyToSend.gestionSituacionId = filtroTipoSituacion;
        }
        if (filtroTipoGestion && filtroTipoGestion !== 0) {
          bodyToSend.gestionRubroId = filtroTipoGestion;
        }
        if (filtroDetalleTipoGestion && filtroDetalleTipoGestion !== 0) {
          bodyToSend.gestionSubRubroId = filtroDetalleTipoGestion;
        }

        // Agregar filtros de fecha si existen
        if (list.params?.fechaIngreso) {
          bodyToSend.fechaIngreso = list.params.fechaIngreso;
        }
        if (list.params?.fechaIngresoHasta) {
          bodyToSend.fechaIngresoHasta = list.params.fechaIngresoHasta;
        }

        // Manejo del ámbito de delegación - replicar la lógica de useGestionOS
        var usuarioAdulterado = {};
        if (ambito.tipo === "Seccionales") {
          usuarioAdulterado = {
            ambitoSeccionales: {
              ids: [ambito?.ids[0]],
            },
            ambitoTodos: null,
          };
        } else if (ambito.tipo === "Delegaciones" && seccionalesDelegacion.length > 0) {
          // Si es delegación y ya tenemos las seccionales cargadas, filtrar por ellas
          usuarioAdulterado = {
            ambitoSeccionales: {
              ids: seccionalesDelegacion,
            },
            ambitoTodos: null,
          };
        } else if (ambito.tipo === "Todos" && filtroSeccional !== 0 && filtroSeccional !== undefined) {
          usuarioAdulterado = {
            ambitoSeccionales: {
              ids: [filtroSeccional],
            },
            ambitoTodos: null,
          };
        }

        // Construir el body con la lógica correcta para los ámbitos
        bodyToSend = {
          ...bodyToSend,
          ambitoTodos:
            filtroSeccional !== undefined && filtroSeccional !== 0
              ? usuarioAdulterado.ambitoTodos
              : ambito.tipo === "Delegaciones"
              ? null  // No usar ambitoTodos si es delegación
              : usuario?.ambitoTodos,
          ambitoProvincias: usuario?.ambitoProvincias,
          ambitoDelegaciones: ambito.tipo === "Delegaciones" ? null : usuario?.ambitoDelegaciones,
          ambitoSeccionales:
            filtroSeccional !== undefined && filtroSeccional !== 0
              ? usuarioAdulterado.ambitoSeccionales
              : ambito.tipo === "Delegaciones" && usuarioAdulterado.ambitoSeccionales
              ? usuarioAdulterado.ambitoSeccionales
              : usuario?.ambitoSeccionales,
        };

        pushQuery({
          action: "GetList",
          config: {
            body: bodyToSend,
            errorType: "response",
          },
          onOk: ({ data }) => {
            if (!Array.isArray(data)) {
              reject(new Error("Formato inesperado de datos"));
              return;
            }
            acumulado.push(...data);
            resolve(data.length > 0);
          },
          onError: (err) => reject(err),
        });
      });

    (async () => {
      try {
        for (let i = 1; i <= MAX_PAGES; i++) {
          const hayMas = await pedirPagina(i);
          if (!hayMas) break;
        }
        const enriquecido = enrich(acumulado);
        const { page, count } = runLocalFilterPaginate(
          enriquecido, list.params, list.pagination, list.sort
        );
        setList((o) => ({
          ...o,
          loading: null,
          rawAll: acumulado,
          allData: enriquecido,
          data: page,
          pagination: { ...o.pagination, count },
          reload: false,
        }));
      } catch (e) {
        setList((o) => ({ ...o, loading: null, error: e?.toString?.() ?? String(e), reload: false }));
      }
    })();
  }, [list.reload, allReady, enrich, pushQuery, runLocalFilterPaginate, list.params, list.pagination, list.sort, ambito.tipo, ambito.ids, seccionalesDelegacion]);

  /* ===== Recalcular vista ===== */
  useEffect(() => {
    if (list.loading) return;
    if (!allReady) return;
    const enriquecido = enrich(list.rawAll);
    const { page, count } = runLocalFilterPaginate(
      enriquecido, list.params, list.pagination, list.sort
    );
    setList((o) => ({
      ...o,
      allData: enriquecido,
      data: page,
      pagination: { ...o.pagination, count },
    }));
  }, [list.params, list.sort, list.pagination, list.rawAll, enrich, list.loading, allReady, runLocalFilterPaginate]);

  /* ===== Exporta lo filtrado ===== */
  const [exportLoading, setExportLoading] = useState(false);

  const onExportExcel = async () => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const { filteredAll } = runLocalFilterPaginate(
        list.allData, list.params, { index: 1, size: Number.MAX_SAFE_INTEGER }, list.sort
      );
      if (!filteredAll.length) {
        setExportLoading(false);
        alert("No hay datos para exportar.");
        return;
      }
      const datos = filteredAll.map((r) => ({
        "Nro. Gestion": r.id,
        Fecha: Formato.Fecha(r.fecha),
        Usuario: r.usuarioMostrar,
        "Codigo Seccional": r.seccionalCodigo,
        "Nombre Seccional": r.seccionalNombre,
        "CUIL Titular": Formato.Cuit(r.cuitTitular),
        "Nombre Titular": r.nombreTitular,
        "Apellido Titular": r.apellidoTitular,
        "Telefono Contacto": r.telefonoContacto,
        "Telefono Contacto 2": r.telefonoContacto2,
        "Email Contacto": r.emailContacto,
        "Email Contacto 2": r.emailContacto2,
        "El Paciente Es Titular": r.elPacienteEsTitular ? "Sí" : "No",
        "Tipo Documento": r.tipoDocumentoMostrar,
        "DNI Paciente": Formato.DNI(r.dniPaciente),
        "Nombre Paciente": r.nombrePaciente,
        "Apellido Paciente": r.apellidoPaciente,
        "Fecha Nacimiento": r.fechaNacimiento ? Formato.Fecha(r.fechaNacimiento) : "",
        "Sexo": r.sexoMostrar,
        "Medio Gestion": r.medioGestion,
        "Telefono": r.telefono,
        "Resultado De La Llamada": r.resultadoLlamada,
        "Direccion Email Destino": r.direccionesEmailDestino,
        "Detalle De La Gestion": r.texto,
        "Fecha Finalizada": r.fechaFinalizadaMostrar,
        "Finalizada Por": r.finalizadaPorMostrar,
        "Finalizado Comentarios": r.finalizadoComentarioMostrar,
        "Atenciones Previas": r.atencionesPrevias,
        "Con Cobertura Osprera": r.conCoberturaOsprera,
        "Gestion Area Osprera": r.gestionAreaOspreraDescripcion,
        "Gestion Estado": r.gestionEstadoDescripcion,
        "Gestion Situacion": r.gestionSituacionDescripcion,
        "Tipo Prestador": r.tipoPrestador,
        "Gestion Rubro": r.gestionRubroDescripcion,
        "Gestion SubRubro": r.gestionSubRubroDescripcion,
        "Observaciones Estado": r.observacionesEstado,
        "Obra Social": r.gestionObraSocialDescripcion,
      }));
      await exportToExcel([{ sheetName: "Gestiones", data: datos }], "GestionesOS");
    } catch (e) {
      alert(`Error al generar Excel: ${e?.message ?? e}`);
    } finally {
      setExportLoading(false);
    }
  };

  /* ===== Acciones UI ===== */
  const onAplicaFiltros = () =>
    setList((o) => ({
      ...o,
      params: { ...o.params, ...filtros },
      pagination: { ...o.pagination, index: 1 },
      reload: true,
    }));

  const onLimpiaFiltros = () => {
    setDesde(null);
    setHasta(null);
    const clean = { ...filtrosDef };
    setFiltros(clean);
    setList((o) => ({
      ...o,
      params: clean,
      pagination: { ...o.pagination, index: 1 },
      reload: true,
    }));
  };

  const onPageChange = (pagination) =>
    setList((o) => ({ ...o, pagination: { ...o.pagination, ...pagination } }));

  const onSort = (sortField, sortOrder) => {
    const sort = `${sortField}${sortOrder === "desc" ? "Desc" : ""}`;
    setList((o) => ({ ...o, sort, pagination: { ...o.pagination, index: 1 }, reload: true }));
  };

  /* Hotkeys */
  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => onExportExcel(), "AltKey");

  /* ===== Render ===== */
  return (
    <Modal size="xl" centered show>
      <Modal.Header className={modalCss.modalCabecera} closeButton>
        Informe
      </Modal.Header>

      <Modal.Body>
        <Grid col full gap="15px">
          <Grid width gap="inherit">
            <Grid width>
              <InputMaterial
                type="date"
                label="Desde fecha de ingreso"
                value={fechaIngresoDesde}
                maxDate={fechaIngresoHasta}
                onChange={(v) => {
                  const d = normPicker(v);
                  setDesde(d);
                  handleFechaFiltro(d, fechaIngresoHasta);
                }}
              />
            </Grid>
            <Grid width>
              <InputMaterial
                type="date"
                label="Hasta fecha de ingreso"
                value={fechaIngresoHasta}
                minDate={fechaIngresoDesde}
                onChange={(v) => {
                  const h = normPicker(v);
                  setHasta(h);
                  handleFechaFiltro(fechaIngresoDesde, h);
                }}
              />
            </Grid>
            <Grid width />
            <Grid width gap="inherit" justify="end">
              <Grid width="200px">
                <Button
                  className="botonAzul"
                  disabled={JSON.stringify(list.params) === JSON.stringify(filtros)}
                  onClick={onAplicaFiltros}
                >
                  Aplica filtros
                </Button>
              </Grid>
              <Grid width="200px">
                <Button
                  className="botonAzul"
                  disabled={
                    Object.keys(filtros).filter((k) => !Object.keys(filtrosDef).includes(k)).length === 0
                  }
                  onClick={onLimpiaFiltros}
                >
                  Limpia filtros
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {/* La tabla se renderiza siempre: cabecera visible al instante */}
          <Table
            remote
            keyField="id"
            data={allReady ? list.data : []}
            mostrarBuscar={false}
            baseProps={{ style: { overflowX: "scroll" } }}
            tableStyle={{ minWidth: "2400px", textAlign: "center" }}
            pagination={{ ...list.pagination, onChange: onPageChange }}
            noDataIndication={
              !allReady ? (
                <div style={{ textAlign: "left", paddingLeft: "10px" }}>
                  Cargando datos...
                </div>
              ) : (
                list.loading || list.error || "No existen datos para mostrar"
              )
            }
            columns={columns}
            onTableChange={(type, { sortOrder, sortField }) => {
              if (type === "sort") onSort(sortField, sortOrder);
            }}
          />
        </Grid>
      </Modal.Body>

      <Modal.Footer>
        <Grid>
          <Grid width gap="20px">
            <Grid width="200px">
              <Button
                className="botonAmarillo"
                disabled={exportLoading || (list.pagination.count ?? 0) === 0}
                onClick={onExportExcel}
                tarea="Osprera_GestionInforme_DescargarExcel"
              >
                {exportLoading ? "Generando..." : "DESCARGAR EXCEL"}
              </Button>
            </Grid>
            <Grid width="150px">
              <Button className="botonAmarillo" onClick={() => onClose()}>
                FINALIZA
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal.Footer>
    </Modal>
  );

};

/* ====== Enriquecedor: usuarios + finalización ====== */
/* ====== Enriquecedor (solo GUID: createdBy/lastModifiedBy/deletedBy) ====== */
function useCallbackEnricher(mapSeccional, mapTipoDoc, mapSexo, usrIdx) {
  // 👇 Solo busca por GUID en el índice byId
  const resolveUser = useCallback((val) => {
    const normGuid = (v) => String(v ?? "").toLowerCase().replace(/[{}]/g, "").trim();
    return usrIdx?.byId?.[normGuid(val)] || null;
  }, [usrIdx]);

  return useMemo(() => {
    return (raw = []) =>
      raw.map((r) => {
        // Estado final y borrado lógico
        const estadoFinal = (String(r?.gestionEstadoDescripcion || "")).toUpperCase() === "FINALIZADO";
        const tieneDeleted = !!r?.deletedDate;

        // Usuario “creador/responsable” — SOLO GUID vs createdBy
        const usuarioMostrar = resolveUser(r?.createdBy) || "";

        // Fecha finalizada — prioridad deleted*, sino cuando estado FINALIZADO
        const fechaFinalizadaMostrar = tieneDeleted
          ? Formato.Fecha(r.deletedDate)
          : (estadoFinal ? Formato.Fecha(r.lastModifiedDate) : "");

        // Quién la finalizó — SOLO GUID (deletedBy / lastModifiedBy / createdBy)
        const candidatoFinalizo = tieneDeleted
          ? resolveUser(r?.deletedBy)
          : (estadoFinal
            ? (resolveUser(r?.lastModifiedBy) || resolveUser(r?.createdBy))
            : null);

        const finalizadaPorMostrar = candidatoFinalizo || "";

        // Comentario finalización (misma lógica que antes)
        const finalizadoComentarioMostrar = tieneDeleted
          ? (r?.deletedObs || r?.observacionesEstado || "")
          : (estadoFinal ? (r?.observacionesEstado || "") : "");

        // Catálogos / seccional / tipo doc / sexo
        const sec = mapSeccional?.[r?.seccionalId] || {};
        const seccionalCodigo = sec.codigo || "";
        const seccionalNombre = sec.descripcion || "";
        const tipoDocumentoMostrar = mapTipoDoc?.[r?.tipoDocumentoId] || "";
        const sexoMostrar = mapSexo?.[r?.sexoId] || "";

        return {
          ...r,
          usuarioMostrar,
          seccionalCodigo,
          seccionalNombre,
          tipoDocumentoMostrar,
          sexoMostrar,
          fechaFinalizadaMostrar,
          finalizadaPorMostrar,
          finalizadoComentarioMostrar,
          gestionObraSocialDescripcion: r.gestionObraSocialDescripcion || "",
        };
      });
  }, [mapSeccional, mapTipoDoc, mapSexo, resolveUser]);
}


export default ExcelDatos;