import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import SearchSelectMaterial, {
  includeSearch,
  mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import useAmbitos from "components/hooks/useAmbitos";

/* ================= columnas ================= */
const columns = [
  { dataField: "id", text: "NroSolicitud", sort: true, headerStyle: () => ({ width: "120px", textAlign: "center" }) },
  { dataField: "fecha", text: "Fecha", sort: true, formatter: (v) => Formato.Fecha(v), headerStyle: { width: "120px", textAlign: "center" } },
  { dataField: "seccionalCodigo", text: "CodigoSeccional", sort: true, headerStyle: { width: "140px" } },
  { dataField: "seccionalNombre", text: "Seccional", sort: true, headerStyle: { width: "220px" } },
  { dataField: "empresaDescripcion", text: "Empresa", sort: true, headerStyle: { width: "260px" }, style: { textAlign: "left" } },
  { dataField: "empresaCUIT", text: "EmpresaCUIT", sort: true, formatter: Formato.Cuit, headerStyle: { width: "150px" } },
  { dataField: "estadoSolicitudDescripcion", text: "Descripcion", sort: true, headerStyle: { width: "160px" } },
  { dataField: "estadoFecha", text: "EstadoFecha", sort: true, formatter: (v) => Formato.Fecha(v), headerStyle: { width: "140px" } },
  { dataField: "createdDate", text: "FechaCreación", sort: true, formatter: (v) => Formato.Fecha(v), headerStyle: { width: "150px" } },
  { dataField: "creadoPorMostrar", text: "CreadoPor", sort: true, headerStyle: { width: "220px" } },
  { dataField: "fechaUltimaModMostrar", text: "FechaUltimaModificación", sort: true, formatter: (v) => Formato.Fecha(v), headerStyle: { width: "180px" } },
  { dataField: "modificadoPorMostrar", text: "ModificadoPor", sort: true, headerStyle: { width: "220px" } },
  { dataField: "periodo", text: "Periodo", sort: true, headerStyle: { width: "120px" } },
  { dataField: "total_Trab_NoRurales", text: "Total_Trab_NoRurales", sort: true, headerStyle: { width: "170px" } },
  { dataField: "total_Trab_NoRurales_Afiliados", text: "Total_Trab_NoRurales_Afiliados", sort: true, headerStyle: { width: "220px" } },
  { dataField: "total_Trab_NoRurales_NoAfiliados", text: "Total_Trab_NoRurales_NoAfiliados", sort: true, headerStyle: { width: "230px" } },
  { dataField: "total_Trab_Rurales", text: "Total_Trab_Rurales", sort: true, headerStyle: { width: "170px" } },
  { dataField: "total_Trab_Rurales_Afiliados", text: "Total_Trab_Rurales_Afiliados", sort: true, headerStyle: { width: "210px" } },
  { dataField: "total_Trab_Rurales_NoAfiliados", text: "Total_Trab_Rurales_NoAfiliados", sort: true, headerStyle: { width: "230px" } },
  { dataField: "total_Trabajadores", text: "Total_Trabajadores", sort: true, headerStyle: { width: "170px" } },
];

/* ================= filtros base ================= */
const filtrosDef = {};

const normGuid = (v) => String(v ?? "").toLowerCase().replace(/[{}]/g, "").trim();
const onlyDigits = (v) => String(v ?? "").replace(/\D/g, "");
const asUser = (v) => String(v ?? "").trim();
const parseFecha = (v) => (v ? dayjs(v).startOf("day") : null);

/* ================= opciones "Todas" ================= */
const delegacionSelectTodos = { value: 0, label: "Todas" };
const seccionalSelectTodos = { value: 0, label: "Todas" };
const estadoTodos = { value: 0, label: "Todos" };

const ExcelDatos = ({ onClose = () => {} }) => {
  const { exportToExcel } = useGeneracionExcel();
  const ambito = useAmbitos().ambitoUser();

  const pushQuery = useQueryQueue((action, params = {}) => {
    const build = ({ baseURL, endpoint, method, body }) => ({
      config: { baseURL, endpoint, method },
      ...(body ? { body } : {}),
    });
    switch (action) {
      case "GetSolicitudes":
        return build({
          baseURL: "Afiliaciones",
          endpoint: "/SolicitudAfiliacionEmpresas/GetSolicitudAfiliacionEmpresasSpecs",
          method: "POST",
          body: params,
        });
      case "GetSeccionales":
        return build({
          baseURL: "Afiliaciones",
          endpoint: "/Seccional?SoloActivos=true&verSeccionalesLocalidades=false",
          method: "GET",
        });
      case "GetDelegaciones":
        return build({
          baseURL: "Comunes",
          endpoint: "/RefDelegacion/GetAll?soloActivos=true",
          method: "GET",
        });
      case "GetUsuarios":
        return build({
          baseURL: "Seguridad",
          endpoint: "/Usuario/GetAll",
          method: "GET",
        });
      case "GetEstados":
        return build({
          baseURL: "Afiliaciones",
          endpoint: "/EstadoSolicitud",
          method: "GET",
        });
      default:
        return null;
    }
  });

  /* Catálogos: Seccionales, Delegaciones, Estados y Usuarios */
  const [mapSeccional, setMapSeccional] = useState({});
  const [seccionalesAll, setSeccionalesAll] = useState([]);
  const [seccionalesDelegacion, setSeccionalesDelegacion] = useState([]);
  const [delegaciones, setDelegaciones] = useState([]);
  const [ready, setReady] = useState({ secc: false, deleg: false, users: false, estados: false });

  // Estados (Solicitudes)
  const [estadoSelect, setEstadoSelect] = useState({
    buscar: "",
    optionsSrc: [estadoTodos],
    options: [estadoTodos],
    selected: estadoTodos,
    data: [],
    error: null,
  });

  useEffect(() => {
    pushQuery({
      action: "GetEstados",
      onOk: (arr) => {
        const data = (Array.isArray(arr) ? arr : []).filter((e) => e?.tipo === "Solicitudes");
        const opts = mapOptions({
          data,
          map: (r) => ({ value: r.id, label: r.descripcion }),
          start: [estadoTodos],
        });
        setEstadoSelect((o) => ({
          ...o,
          data,
          optionsSrc: opts,
          options: opts.filter((r) => includeSearch(r, o.buscar)),
          selected: estadoTodos,
        }));
        setReady((o) => ({ ...o, estados: true }));
      },
      onError: () => setReady((o) => ({ ...o, estados: true })),
    });
  }, [pushQuery]);

  useEffect(() => {
    setEstadoSelect((o) => ({
      ...o,
      options: (o.optionsSrc || []).filter((r) => includeSearch(r, o.buscar)),
    }));
  }, [estadoSelect.buscar, estadoSelect.optionsSrc]);

  // Seccionales
  useEffect(() => {
    pushQuery({
      action: "GetSeccionales",
      onOk: (arr) => {
        const lista = Array.isArray(arr) ? arr : [];
        const m = {};
        lista.filter((r) => r.id !== 99999).forEach((r) => {
          m[r.id] = { codigo: r.codigo, descripcion: r.descripcion, refDelegacionId: r.refDelegacionId };
        });
        setMapSeccional(m);
        setSeccionalesAll(lista);
        setReady((o) => ({ ...o, secc: true }));
      },
      onError: () => setReady((o) => ({ ...o, secc: true })),
    });
  }, [pushQuery]);

  // Delegaciones
  useEffect(() => {
    pushQuery({
      action: "GetDelegaciones",
      onOk: (arr) => {
        setDelegaciones(Array.isArray(arr) ? arr : []);
        setReady((o) => ({ ...o, deleg: true }));
      },
      onError: () => setReady((o) => ({ ...o, deleg: true })),
    });
  }, [pushQuery]);

  // Cargar seccionales de la delegación si el ámbito es Delegaciones
  useEffect(() => {
    if (ambito.tipo === 'Delegaciones' && ambito.ids && ambito.ids.length > 0) {
      const delegacionId = ambito.ids[0];
      const seccionalesFiltradas = (seccionalesAll || [])
        .filter(s => s.refDelegacionId === delegacionId && s.id !== 99999)
        .map(s => s.id);
      setSeccionalesDelegacion(seccionalesFiltradas);
    } else {
      setSeccionalesDelegacion([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambito.tipo, ambito.ids?.join(','), seccionalesAll.length]);

  // Usuarios (índices)
  const [usrIdx, setUsrIdx] = useState({ byId: {}, byUser: {}, byCuit: {} });
  useEffect(() => {
    let cancel = false;
    const pageSize = 500;
    const byId = {}, byUser = {}, byCuit = {};

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
        for (let i = 2; i <= first.totalPages; i++) {
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

  const allReady = ready.secc && ready.deleg && ready.users && ready.estados;

  /*Estado de lista / filtros / sort / paginado  */
  const [filtros, setFiltros] = useState({ ...filtrosDef });
  const [fechaDesde, setDesde] = useState(null);
  const [fechaHasta, setHasta] = useState(null);
  const normPicker = (v) => (v?.format ? v.format("YYYY-MM-DD") : v);

  const handleFechaFiltro = (desde = "", hasta = "") =>
    setFiltros((o) => {
      const f = { ...o };
      if (!desde && !hasta) {
        delete f.fecha; delete f.fechaHasta;
      } else if (!desde) {
        f.fecha = hasta; f.fechaHasta = hasta;
      } else if (!hasta) {
        f.fecha = desde; f.fechaHasta = desde;
      } else {
        f.fecha = desde; f.fechaHasta = hasta;
      }
      return f;
    });

  // Selects de Delegación
  const [delegacionSelect, setDelegacionSelect] = useState({
    buscar: "", optionsSrc: [], options: [], selected: delegacionSelectTodos,
  });
  const [seccionalSelect, setSeccionalSelect] = useState({
    buscar: "", optionsSrc: [], options: [], selected: seccionalSelectTodos,
  });

  const delegacionSelectOptions = ({ data = [] }) =>
    mapOptions({ data, map: (r) => ({ value: r.id, label: r.nombre }), start: data.length === 1 ? [] : [delegacionSelectTodos] });

  const seccionalSelectOptions = ({ data = [] }) =>
    mapOptions({ data, map: (r) => ({ value: r.id, label: r.descripcion }), start: data.length === 1 ? [] : [seccionalSelectTodos] });

  useEffect(() => {
    const opts = delegacionSelectOptions({ data: delegaciones });
    setDelegacionSelect((o) => ({
      ...o,
      optionsSrc: opts,
      options: opts.filter((r) => includeSearch(r, o.buscar)),
      selected: opts.length === 1 ? opts[0] : delegacionSelectTodos,
    }));
  }, [delegaciones]);

  useEffect(() => {
    setDelegacionSelect((o) => ({
      ...o,
      options: (o.optionsSrc || []).filter((r) => includeSearch(r, o.buscar)),
    }));
  }, [delegacionSelect.buscar, delegacionSelect.optionsSrc]);

  useEffect(() => {
    const delSel = delegacionSelect.selected;
    const delId = delSel && delSel !== delegacionSelectTodos ? Number(delSel.value) : null;
    const base = (seccionalesAll || []).filter((s) =>
      delId == null ? true : Number(s.refDelegacionId) === delId
    );
    const opts = seccionalSelectOptions({ data: base });
    setSeccionalSelect((o) => ({
      ...o,
      optionsSrc: opts,
      options: opts.filter((r) => includeSearch(r, o.buscar)),
      selected: seccionalSelectTodos,
    }));
  }, [delegacionSelect.selected, seccionalesAll]);

  useEffect(() => {
    setSeccionalSelect((o) => ({
      ...o,
      options: (o.optionsSrc || []).filter((r) => includeSearch(r, o.buscar)),
    }));
  }, [seccionalSelect.buscar, seccionalSelect.optionsSrc]);

  const [list, setList] = useState({
    reload: true,
    loading: null,
    error: null,
    rawAll: [],
    allData: [],
    data: [],
    sort: "FechaDesc,IdDesc",
    params: { ...filtrosDef },
    pagination: { index: 1, size: 10, count: 0 },
  });

  const enrich = useMemo(() => {
    const resolveUser = (val, raw) => {
      if (!val) return raw || "";
      const guid = normGuid(val), user = asUser(val), cuit = onlyDigits(val);
      return usrIdx.byId[guid] || usrIdx.byUser[user] || usrIdx.byCuit[cuit] || raw || user || "";
    };
    return (raw = []) =>
      raw.map((r) => {
        const sec = mapSeccional?.[r?.seccionalId] || {};
        const createdDate =
          r?.createdDate || r?.created || r?.fechaCreacion || r?.fechaAlta || r?.fecha || null;
        const lastModifiedDateRaw =
          r?.lastModifiedDate || r?.modifiedDate || r?.updatedDate || r?.fechaModificacion || null;
        const createdByRaw =
          r?.createdBy || r?.creadoPor || r?.usuarioCreacion || r?.created_by || null;
        const lastModifiedByRaw =
          r?.lastModifiedBy || r?.modifiedBy || r?.updatedBy || r?.usuarioModificacion || null;

        const fechaUltimaModMostrar = lastModifiedDateRaw || null;
        const modificadoPorMostrar = lastModifiedDateRaw
          ? resolveUser(lastModifiedByRaw, r?.usuarioModificacionNombre || r?.modificadoPorNombre)
          : "";

        return {
          ...r,
          seccionalCodigo: sec.codigo ?? r.seccionalCodigo ?? "",
          seccionalNombre: sec.descripcion ?? r.seccional ?? "",
          empresaDescripcion: r.empresaDescripcion ?? r.empresaRazonSocial ?? "",
          empresaCUIT: r.empresaCUIT ?? r.cuit ?? r.cuitTitular ?? "",
          estadoSolicitudDescripcion: r.estadoSolicitudDescripcion ?? r.estado ?? "",
          createdDate,
          creadoPorMostrar: resolveUser(createdByRaw, r?.usuarioCreacionNombre || r?.creadoPorNombre),
          fechaUltimaModMostrar,
          modificadoPorMostrar,
          total_Trab_NoRurales: r?.total_Trab_NoRurales ?? 0,
          total_Trab_NoRurales_Afiliados: r?.total_Trab_NoRurales_Afiliados ?? 0,
          total_Trab_NoRurales_NoAfiliados: r?.total_Trab_NoRurales_NoAfiliados ?? 0,
          total_Trab_Rurales: r?.total_Trab_Rurales ?? 0,
          total_Trab_Rurales_Afiliados: r?.total_Trab_Rurales_Afiliados ?? 0,
          total_Trab_Rurales_NoAfiliados: r?.total_Trab_Rurales_NoAfiliados ?? 0,
          total_Trabajadores: r?.total_Trabajadores ?? 0,
        };
      });
  }, [mapSeccional, usrIdx]);

  /*  descarga */
  useEffect(() => {
    if (!list.reload || !allReady) return;
    
    // Si el ámbito es Delegaciones y aún no se cargaron las seccionales, esperar
    if (ambito.tipo === 'Delegaciones' && seccionalesDelegacion.length === 0) {
      return;
    }
    
    setList((o) => ({ ...o, loading: "Cargando...", error: null }));

    const pageSize = 1000, MAX_PAGES = 10000, acumulado = [];

    const pedirPagina = (pageIndex) =>
      new Promise((resolve, reject) => {
        // Preparar parámetros con filtrado por ámbito
        let ambitoSeccionales = null;
        if (ambito.tipo === "Seccionales") {
          ambitoSeccionales = {
            ids: ambito.ids,
          };
        } else if (ambito.tipo === "Delegaciones" && seccionalesDelegacion.length > 0) {
          ambitoSeccionales = {
            ids: seccionalesDelegacion,
          };
        }

        const bodyParams = { 
          ...list.params, 
          sort: "-Id", 
          pageIndex, 
          pageSize,
          ...(ambitoSeccionales && { ambitoSeccionales })
        };

        pushQuery({
          action: "GetSolicitudes",
          config: {
            body: bodyParams,
            errorType: "response",
          },
          onOk: ({ data }) => {
            const arr = Array.isArray(data) ? data : [];
            acumulado.push(...arr);
            resolve(arr.length > 0);
          },
          onError: reject,
        });
      });

    (async () => {
      try {
        for (let i = 1; i <= MAX_PAGES; i++) {
          const hayMas = await pedirPagina(i);
          if (!hayMas) break;
        }
        const enriquecido = enrich(acumulado);
        const { page, count } = runLocalFilterPaginate(enriquecido, list.params, list.pagination, list.sort);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.reload, allReady, enrich, pushQuery, list.params, list.pagination, list.sort, ambito.tipo, seccionalesDelegacion.length]);

  /* recálculo local */
  useEffect(() => {
    if (list.loading || !allReady) return;
    const enriquecido = enrich(list.rawAll);
    const { page, count } = runLocalFilterPaginate(enriquecido, list.params, list.pagination, list.sort);
    setList((o) => ({ ...o, allData: enriquecido, data: page, pagination: { ...o.pagination, count } }));
  }, [list.params, list.sort, list.pagination.index, list.pagination.size, enrich, list.loading, allReady]);

  /*  export  */
  const [exportLoading, setExportLoading] = useState(false);
  const onExportExcel = async () => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const { filteredAll } = runLocalFilterPaginate(list.allData, list.params, { index: 1, size: Number.MAX_SAFE_INTEGER }, list.sort);
      if (!filteredAll.length) { setExportLoading(false); alert("No hay datos para exportar."); return; }
      const datos = filteredAll.map((r) => ({
        "Nro Solicitud": r.id,
        "Fecha": Formato.Fecha(r.fecha),
        "Codigo Seccional": r.seccionalCodigo ?? "",
        "Seccional": r.seccionalNombre ?? "",
        "Empresa": r.empresaDescripcion ?? "",
        "CUIT Empresa": Formato.Cuit(r.empresaCUIT),
        "Descripcion": r.estadoSolicitudDescripcion ?? "",
        "Estado Fecha": r.estadoFecha ? Formato.Fecha(r.estadoFecha) : "",
        "Fecha Creación": r.createdDate ? Formato.Fecha(r.createdDate) : "",
        "Creado Por": r.creadoPorMostrar ?? "",
        "Fecha Ultima Modificación": r.fechaUltimaModMostrar ? Formato.Fecha(r.fechaUltimaModMostrar) : "",
        "Modificado Por": r.modificadoPorMostrar ?? "",
        "Periodo": r.periodo ?? "",
        "Total Trab No Rurales": r.total_Trab_NoRurales ?? 0,
        "Total Trab No Rurales Afiliados": r.total_Trab_NoRurales_Afiliados ?? 0,
        "Total Trab No Rurales No Afiliados": r.total_Trab_NoRurales_NoAfiliados ?? 0,
        "Total Trab Rurales": r.total_Trab_Rurales ?? 0,
        "Total Trab Rurales Afiliados": r.total_Trab_Rurales_Afiliados ?? 0,
        "Total Trab Rurales No Afiliados": r.total_Trab_Rurales_NoAfiliados ?? 0,
        "Total Trabajadores": r.total_Trabajadores ?? 0,
      }));
      await exportToExcel([{ sheetName: "Solicitudes", data: datos }], "AfiliacionesPorEmpresa");
    } catch (e) {
      alert(`Error al generar Excel: ${e?.message ?? e}`);
    } finally { setExportLoading(false); }
  };

  /*  helpers  */
  const sortLocal = (arr, sortStr) => {
    const parts = String(sortStr || "").split(",").filter(Boolean);
    const cp = [...arr];
    cp.sort((a, b) => {
      for (const p of parts) {
        const desc = /Desc$/i.test(p);
        const field = p.replace(/Desc$/i, "");
        const va = a[field] ?? "";
        const vb = b[field] ?? "";
        if (va < vb) return desc ? 1 : -1;
        if (va > vb) return desc ? -1 : 1;
      }
      return 0;
    });
    return cp;
  };

  const runLocalFilterPaginate = (all, params, pagination, sort) => {
    let res = [...all];

    // fechas
    const d = parseFecha(params.fecha);
    const h = parseFecha(params.fechaHasta);
    if (d || h) {
      res = res.filter((r) => {
        const fr = parseFecha(r.fecha);
        if (!fr) return false;
        const okD = d ? !fr.isBefore(d, "day") : true;
        const okH = h ? !fr.isAfter(h, "day") : true;
        return okD && okH;
      });
    }

    // seccionales
    const seccIds = params?.ambitoSeccionales?.ids;
    if (Array.isArray(seccIds) && seccIds.length) {
      const setIds = new Set(seccIds.map(Number));
      res = res.filter((r) => setIds.has(Number(r.seccionalId)));
    }

    // estado
    if (params?.estadoSolicitudId) {
      const id = Number(params.estadoSolicitudId);
      res = res.filter((r) => Number(r?.estadoSolicitudId) === id);
    }

    res = sortLocal(res, sort);
    const count = res.length;
    const start = (pagination.index - 1) * pagination.size;
    const end = start + pagination.size;
    const page = res.slice(start, end);
    return { page, count, filteredAll: res };
  };

  const onPageChange = (pagination) =>
    setList((o) => ({ ...o, pagination: { ...o.pagination, ...pagination } }));

  const onSort = (sortField, sortOrder) => {
    const mapServer = {
      NroSolicitud: "Id",
      Fecha: "Fecha",
      CodigoSeccional: "SeccionalCodigo",
      Seccional: "Seccional",
      Empresa: "EmpresaDescripcion",
      EmpresaCUIT: "EmpresaCUIT",
      Descripcion: "EstadoSolicitudDescripcion",
      EstadoFecha: "EstadoFecha",
      FechaCreación: "CreatedDate",
      CreadoPor: "CreatedBy",
      FechaUltimaModificación: "LastModifiedDate",
      ModificadoPor: "LastModifiedBy",
      Periodo: "Periodo",
      Total_Trab_NoRurales: "Total_Trab_NoRurales",
      Total_Trab_NoRurales_Afiliados: "Total_Trab_NoRurales_Afiliados",
      Total_Trab_NoRurales_NoAfiliados: "Total_Trab_NoRurales_NoAfiliados",
      Total_Trab_Rurales: "Total_Trab_Rurales",
      Total_Trab_Rurales_Afiliados: "Total_Trab_Rurales_Afiliados",
      Total_Trab_Rurales_NoAfiliados: "Total_Trab_Rurales_NoAfiliados",
      Total_Trabajadores: "Total_Trabajadores",
    };
    const serverField = mapServer[sortField] ?? sortField;
    const sort = `${serverField}${sortOrder === "desc" ? "Desc" : ""}`;
    setList((o) => ({ ...o, sort, pagination: { ...o.pagination, index: 1 }, reload: true }));
  };

  const buildParamsFromUI = useCallback(() => {
    const f = { ...filtros };

    // Estado
    if (estadoSelect.selected !== estadoTodos) {
      f.estadoSolicitudId = Number(estadoSelect.selected.value);
    } else {
      delete f.estadoSolicitudId;
    }

    // Delegación / Seccional -> ambitoSeccionales
    const delSel = delegacionSelect.selected;
    const secSel = seccionalSelect.selected;
    const delId = delSel && delSel !== delegacionSelectTodos ? Number(delSel.value) : null;
    const secId = secSel && secSel !== seccionalSelectTodos ? Number(secSel.value) : null;

    if (secId != null) {
      f.ambitoSeccionales = { ids: [secId] };
    } else if (delId != null) {
      const seccs = (seccionalesAll || [])
        .filter((s) => Number(s.refDelegacionId) === delId)
        .map((s) => s.id)
        .filter(Boolean);
      f.ambitoSeccionales = { ids: seccs };
    } else {
      delete f.ambitoSeccionales;
    }

    return f;
  }, [filtros, estadoSelect.selected, delegacionSelect.selected, seccionalSelect.selected, seccionalesAll]);

  const paramsPendientes = useMemo(() => buildParamsFromUI(), [buildParamsFromUI]);
  const hayCambios = useMemo(
    () => JSON.stringify(paramsPendientes) !== JSON.stringify(list.params),
    [paramsPendientes, list.params]
  );

  const onAplicaFiltros = () => {
    setList((o) => ({
      ...o,
      params: { ...o.params, ...paramsPendientes },
      pagination: { ...o.pagination, index: 1 },
      reload: true,
    }));
  };

  const onLimpiaFiltros = () => {
    setDesde(null); setHasta(null);
    setDelegacionSelect((o) => ({ ...o, selected: delegacionSelectTodos, buscar: "" }));
    setSeccionalSelect((o) => ({ ...o, selected: seccionalSelectTodos, buscar: "" }));
    setEstadoSelect((o) => ({ ...o, selected: estadoTodos, buscar: "" }));

    const clean = { ...filtrosDef };
    setFiltros(clean);
    setList((o) => ({ ...o, params: clean, pagination: { ...o.pagination, index: 1 }, reload: true }));
  };

  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => onExportExcel(), "AltKey");

  return (
    <Modal size="xl" centered show>
      <Modal.Header className={modalCss.modalCabecera} closeButton>
        Informe de Solicitudes de Afiliación por Empresa
      </Modal.Header>

      <Modal.Body>
        <Grid col full gap="15px">
          {/* Fila 1: Delegación + Seccional + Estado */}
          <Grid width gap="inherit">
            <Grid grow>
              <SearchSelectMaterial
                id="delegacionSelect"
                label="Delegación"
                value={delegacionSelect.selected}
                onChange={(selected) => setDelegacionSelect((o) => ({ ...o, selected }))}
                options={delegacionSelect.options}
                onTextChange={(buscar) => setDelegacionSelect((o) => ({ ...o, buscar }))}
              />
            </Grid>
            <Grid grow>
              <SearchSelectMaterial
                id="seccionalSelect"
                label="Seccional"
                value={seccionalSelect.selected}
                onChange={(selected) => setSeccionalSelect((o) => ({ ...o, selected }))}
                options={seccionalSelect.options}
                onTextChange={(buscar) => setSeccionalSelect((o) => ({ ...o, buscar }))}
              />
            </Grid>
            <Grid grow>
              <SearchSelectMaterial
                id="estadoSelect"
                label="Estado"
                value={estadoSelect.selected}
                options={estadoSelect.options}
                onChange={(selected) => setEstadoSelect((o) => ({ ...o, selected }))}
                onTextChange={(buscar) => setEstadoSelect((o) => ({ ...o, buscar }))}
              />
            </Grid>
          </Grid>

          {/* Fila 2: Fechas + Botones */}
          <Grid width gap="inherit">
            <Grid width>
              <InputMaterial
                type="date"
                label="Desde (Fecha de Solicitud)"
                value={fechaDesde}
                maxDate={fechaHasta}
                onChange={(v) => {
                  const d = normPicker(v);
                  setDesde(d);
                  handleFechaFiltro(d, fechaHasta);
                }}
              />
            </Grid>
            <Grid width>
              <InputMaterial
                type="date"
                label="Hasta (Fecha de Solicitud)"
                value={fechaHasta}
                minDate={fechaDesde}
                onChange={(v) => {
                  const h = normPicker(v);
                  setHasta(h);
                  handleFechaFiltro(fechaDesde, h);
                }}
              />
            </Grid>

            <Grid width gap="inherit" justify="end">
              <Grid width="200px">
                <Button className="botonAzul" disabled={!hayCambios} onClick={onAplicaFiltros}>
                  Aplica filtros
                </Button>
              </Grid>
              <Grid width="200px">
                <Button
                  className="botonAzul"
                  disabled={
                    !hayCambios &&
                    !fechaDesde &&
                    !fechaHasta &&
                    delegacionSelect.selected === delegacionSelectTodos &&
                    seccionalSelect.selected === seccionalSelectTodos &&
                    estadoSelect.selected === estadoTodos
                  }
                  onClick={onLimpiaFiltros}
                >
                  Limpia filtros
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {/*Tabla */}
          <Table
            remote
            keyField="id"
            data={allReady ? list.data : []}
            mostrarBuscar={false}
            baseProps={{ style: { overflowX: "scroll" } }}
            pagination={{ ...list.pagination, onChange: (p) => onPageChange(p) }}
            noDataIndication={
              !allReady ? (
                <div style={{ textAlign: "left", paddingLeft: "10px" }}>Cargando datos...</div>
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
              >
                {exportLoading ? "Generando..." : "DESCARGA EXCEL"}
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

export default ExcelDatos;
