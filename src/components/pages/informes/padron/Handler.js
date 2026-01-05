import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import Formato from "components/helpers/Formato";
import useQueryState from "components/hooks/useQueryState";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import Table from "components/ui/Table/Table";
import PDFViewer from "./PDFViewer";
import AuthContext from "store/authContext";
import AsArray from "components/helpers/AsArray";
import useAmbitosUsuario from "components/hooks/useAmbitos";
import { useSelector } from "react-redux";

/** Columns */
const columns = [
  { dataField: "nroAfiliado", text: "Nro. Afil.", sort: true, headerTitle: () => "Numero de Afiliado", headerStyle: { width: "6em", textAlign: "center" }, style: { textAlign: "center" } },
  {
    dataField: "cuil",
    text: "CUIL",
    sort: true,
    headerTitle: true,
    headerStyle: { width: "8em", textAlign: "center" },
    formatter: (v, row) => (row.cuilValidado != 0 ? Formato.Cuit(row.cuilValidado) : Formato.Cuit(v)),
    style: { textAlign: "center" },
  },
  {
    dataField: "cuilValidado",
    text: "Val.",
    headerTitle: true,
    headerStyle: { width: "3em", textAlign: "center" },
    formatter: (v, { cuil }) => (v === 0 ? "N" : v === cuil ? "V" : "D"),
    style: { textAlign: "center" },
  },
  {
    dataField: "documento",
    text: "Doc. Nro.",
    sort: true,
    headerTitle: () => "Documento número",
    headerStyle: { width: "7em", textAlign: "center" },
    formatter: (v) => Formato.DNI(v),
    style: { textAlign: "center" },
  },
  { dataField: "nombre", text: "Nombre", sort: true, headerTitle: true, headerStyle: { width: "10em", textAlign: "center" }, style: { textAlign: "left" } },
  {
    dataField: "estadoSolicitud",
    text: "Sit. Afi.",
    headerTitle: () => "Situación del Afiliado",
    headerStyle: { width: "6em", textAlign: "center" },
    style: (v) => {
      const s = { textAlign: "center" };
      if (v === "Pendiente") s.background = "#ffff64cc";
      if (v === "No Activo") { s.background = "#ff6464cc"; s.color = "#FFF"; }
      if (v === "Rechazado") { s.background = "#f08c32cc"; s.color = "#FFF"; }
      return s;
    },
  },
  { dataField: "seccional", text: "Seccional", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" } },
  { dataField: "refDelegacionDescripcion", text: "Delegación", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" } },
  { dataField: "provincia", text: "Provincia", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" } },
  { dataField: "fechaIngreso", text: "F. Ingreso", sort: true, headerTitle: () => "Fecha de Ingreso", headerStyle: { width: "7em", textAlign: "center" }, formatter: (v) => Formato.Fecha(v), style: { textAlign: "center" } },
  { dataField: "puesto", text: "Puesto", headerTitle: true, headerStyle: { width: "10em", textAlign: "center" } },
  //{ dataField: "empresaCUIT", text: "CUIT", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" }, formatter: (v) => Formato.Cuit(v), style: { textAlign: "center" } },
  //{ dataField: "empresaDescripcion", text: "Empresa", headerTitle: true, headerStyle: { width: "10em", textAlign: "center" } },
  { dataField: "actividad", text: "Actividad", headerTitle: true, headerStyle: { width: "10em", textAlign: "center" } },
  { dataField: "ultimaDDJJPeriodo", text: "Período última DDJJ", headerTitle: true, headerStyle: { width: "12em", textAlign: "center" }, formatter: (v) => Formato.Periodo(v) },
];

/** Options helpers - CONFIGURACIÓN DE FILTROS POR DEFECTO */
const delegacionSelectDef = { label: "Elige..." }; // Filtro: Delegación por defecto
const seccionalSelectDef = { label: "Todas" }; // Filtro: Seccional por defecto  
const estadoSelectTodos = { value: 0, label: "Todos" }; // Filtro: Estado por defecto

// ========== OPCIONES DE FILTROS ==========
const delegacionesSelectOptions = ({ data = [], ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: [r.codigoDelegacion, r.nombre].join(" - "), record: r }),
    start: data.length === 1 ? [] : [delegacionSelectDef],
    ...x,
  });

const seccionalesSelectOptions = ({ data = [], ambitoUsuario = {}, ...x }) => {
  const tipo = ambitoUsuario?.tipo ?? ambitoUsuario?.ambitoUsuario?.tipo;
  return mapOptions({
    data,
    map: (r) => {
      if (tipo === "Todos") return { value: r.id, label: [r.codigo, r.descripcion].join(" - "), record: r };
      return ["NORMALIZADA", "TRANSITORIA", "SIN COMISION"].includes(r.seccionalEstadoDescripcion)
        ? { value: r.id, label: [r.codigo, r.descripcion].join(" - "), record: r }
        : null;
    },
    start: data.length === 1 ? [] : [seccionalSelectDef],
    ...x,
  });
};

const estadoSelectOptions = ({ ...x }) =>
  mapOptions({
    data: [
      { value: 1, label: "Activos" },
      { value: 2, label: "No Activos" },
    ],
    map: (r) => ({ value: r.value, label: r.label }),
    start: [estadoSelectTodos],
    ...x,
  });

/** Normalizadores defensivos */
const normalizeDelegOption = (opt) => {
  if (!opt) return delegacionSelectDef;
  if (opt.value != null) return opt;
  if (opt.id != null) return { value: opt.id, label: [opt.codigoDelegacion || opt.codigo, opt.nombre].filter(Boolean).join(" - "), record: opt };
  if (opt.record?.id != null) return { value: opt.record.id, label: opt.label ?? [opt.record.codigoDelegacion || opt.record.codigo, opt.record.nombre || opt.record.descripcion].filter(Boolean).join(" - "), record: opt.record };
  return delegacionSelectDef;
};
const normalizeSeccionalOption = (opt) => {
  if (!opt) return seccionalSelectDef;
  if (opt.value != null) return opt;
  if (opt.id != null) return { value: opt.id, label: [opt.codigo, opt.descripcion].filter(Boolean).join(" - "), record: opt };
  if (opt.record?.id != null) return { value: opt.record.id, label: opt.label ?? [opt.record.codigo, opt.record.descripcion].filter(Boolean).join(" - "), record: opt.record };
  return seccionalSelectDef;
};
const normalizeFiltros = (f) => {
  const g = { ...f };
  if (g?.ambitoTodos?.ids && g.ambitoTodos.ids.length === 1 && Number(g.ambitoTodos.ids[0]) === 0) delete g.ambitoTodos;
  // Limpiar campos que son solo para el frontend y no deben enviarse al backend
  delete g.estadoSolicitudFiltro; // Este campo es solo para el frontend
  return g;
};

/** LÓGICA DE FILTRO DE ESTADO → params para backend (server-side) */
const buildEstadoParams = (f = {}) => {
  const out = {};
  if (f.estadoSolicitudFiltro === "Activo" || f.soloActivos) {
    out.soloActivos = true;
    out.soloNoActivos = false;
    out.estadoSolicitudId = 2; // Activo
  } else if (f.estadoSolicitudFiltro === "No Activo" || f.soloNoActivos) {
    out.soloActivos = false;
    out.soloNoActivos = true;
  } else {
    out.soloActivos = false;
    out.soloNoActivos = false;
    delete out.estadoSolicitudId;
  }
  return out;
};

/** Normalizador de paginado del backend -> {index, size, count(pages)} */
const normalizeServerPaging = (ok, fallbackIndex, fallbackSize) => {
  // El backend devuelve: {index, size, pages, count, data}
  // donde 'count' es el total de registros y 'pages' es el número de páginas
  const size = Number(ok?.size ?? ok?.pageSize ?? fallbackSize) || fallbackSize || 10;
  const indexRaw = Number(ok?.index ?? ok?.pageIndex ?? ok?.page ?? fallbackIndex) || fallbackIndex || 1;
  
  // IMPORTANTE: El backend devuelve 'pages' (número de páginas) y 'count' (total registros)
  // Necesitamos usar 'pages' directamente, NO recalcular
  let pagesCount = ok?.pages != null ? Number(ok.pages) : null;

  // Solo recalcular si el backend NO devuelve 'pages'
  if (pagesCount == null) {
    const totalRowsRaw = ok?.count ?? ok?.totalCount ?? ok?.total ?? ok?.itemsCount ?? null;
    if (totalRowsRaw != null) {
      const totalRows = Number(totalRowsRaw);
      pagesCount = Math.max(1, Math.ceil(totalRows / size));
    }
  }
  if (pagesCount == null) pagesCount = 0;

  const index = indexRaw < 1 ? 1 : indexRaw;
  
  // Extraer también el totalCount para mostrarlo en logs
  const totalCount = Number(ok?.count ?? ok?.totalCount ?? ok?.total ?? 0);
  
  return { index, size, count: pagesCount, totalCount };
};

/** Util: aplicar filtro de estado a un arreglo de afiliados */
const aplicarFiltroEstado = (rows = [], filtros = {}) => {

  if (filtros.estadoSolicitudFiltro === "Activo" || filtros.soloActivos) {

    const filtered = rows.filter(a => {
      const e = a.estadoSolicitud;
      return e && !["No Activo", "Rechazado", "Pendiente"].includes(e);
    });

    return filtered;
  }
  if (filtros.estadoSolicitudFiltro === "No Activo" || filtros.soloNoActivos) {
    const filtered = rows.filter(a => {
      const e = a.estadoSolicitud;
      return e && ["No Activo", "Rechazado", "Pendiente"].includes(e);
    });
    return filtered;
  }
  return rows; // “Todos”
};

const Handler = ({ onClose = () => {} }) => {
  const ambitoUsuario = useAmbitosUsuario().ambitoUser();
  const { usuario } = useContext(AuthContext);
  const usuarioLogueado = useSelector((state) => state.usuarioLogueado);
  const usuarioConSeccionalInactiva =
    usuarioLogueado?.ambitosDescripciones?.[0]?.seccionalEstado &&
    !["NORMALIZADA", "TRANSITORIA", "SIN COMISION"].includes(usuarioLogueado.ambitosDescripciones?.[0]?.seccionalEstado);

  /** APIs */
  const { setState: setDelegacionesQuery } = useQueryState(
    () => ({ config: { baseURL: "Comunes", endpoint: `/RefDelegacion/GetAll`, method: "GET" } }),
    { query: { config: { errorType: "response" }, params: { soloActivos: true } } }
  );
  const { setState: setSeccionalesQuery } = useQueryState(
    () => ({ config: { baseURL: "Afiliaciones", endpoint: `/Seccional/GetSeccionalesSpecs`, method: "POST" } }),
    { query: { config: { errorType: "response" }, body: { soloActivos: true } } }
  );
  const { setState: setSeccionalQuery } = useQueryState(
    (_, { id, ...params }) => ({ config: { baseURL: "Afiliaciones", endpoint: `/Seccional/${id}`, method: "GET" }, params }),
    { query: { config: { errorType: "response" } } }
  );
  const { setState: setAfiliacionesQuery } = useQueryState(
    () => ({ config: { baseURL: "Afiliaciones", endpoint: `/Afiliado/GetAfiliadosWithSpec`, method: "POST" } }),
    { query: { config: { errorType: "response" } } }
  );

  /** Init */
  const [init, setInit] = useState({
    pending: true,
    filtros: { ambitoTodos: usuario.ambitoTodos, ambitoProvincias: usuario.ambitoProvincias },
    wait: { delegaciones: true, seccionales: true },
    usuario,
  });
  const [filtros, setFiltros] = useState({ ...init.filtros }); // <<<< ESTADO PRINCIPAL DE FILTROS

  /** ========== ESTADOS DE LOS COMPONENTES DE FILTRO ========== */
  // FILTRO 1: Delegación
  const [delegacionSelect, setDelegacionSelect] = useState({
    reload: false, loading: "Cargando...", buscar: "", data: [], error: null,
    optionsSrc: [], options: [], selected: delegacionSelectDef, selectedDef: delegacionSelectDef, ambito: null, origen: "",
  });
  useEffect(() => {
    setDelegacionSelect((o) => ({ ...o, options: o.optionsSrc.filter((r) => includeSearch(r, delegacionSelect.buscar)) }));
  }, [delegacionSelect.buscar, delegacionSelect.optionsSrc]);

  // FILTRO 2: Seccional
  const [seccionalSelect, setSeccionalSelect] = useState({
    reload: false, loading: "Cargando...", buscar: "", data: [], error: null,
    optionsSrc: [], options: [], selected: seccionalSelectDef, selectedDef: seccionalSelectDef, ambito: null, refDelegacionId: 0, origen: "",
  });
  useEffect(() => {
    setSeccionalSelect((o) => ({ ...o, options: o.optionsSrc.filter((r) => includeSearch(r, seccionalSelect.buscar)) }));
  }, [seccionalSelect.buscar, seccionalSelect.optionsSrc]);

  // FILTRO 3: Estado de Afiliación (Sit. Afi.)
  const [estadoSelect, setEstadoSelect] = useState({
    reload: true, loading: null, buscar: "", data: [], error: null,
    optionsSrc: [], options: [], selected: estadoSelectTodos, selectedDef: estadoSelectTodos, origen: "",
  });
  useEffect(() => {
    setEstadoSelect((o) => ({ ...o, options: o.optionsSrc.filter((r) => includeSearch(r, o.buscar)) }));
  }, [estadoSelect.buscar, estadoSelect.optionsSrc]);

  /** Cache seccionales por delegación */
  const seccCacheRef = useRef(new Map());
  const initialAutoSelectRef = useRef(false);

  /** Carga inicial: Delegación */
  useEffect(() => {
    if (!delegacionSelect.reload) return;
    setDelegacionSelect((o) => ({
      ...o, reload: false, loading: "Cargando...", data: [], options: [], optionsSrc: [], selected: delegacionSelectDef, selectedDef: delegacionSelectDef, buscar: "",
    }));
    setDelegacionesQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = Array.isArray(ok) ? ok : [];
        setDelegacionSelect((prev) => {
          const n = {
            ...prev,
            loading: null,
            data: prev.ambito ? data.filter((r) => prev.ambito.includes(r.id)) : data,
            error: error?.toString(),
          };
          n.optionsSrc = delegacionesSelectOptions(n);
          if (!initialAutoSelectRef.current && n.optionsSrc[0]?.value != null) {
            n.selectedDef = n.optionsSrc[0];
            n.selected = n.optionsSrc[0];
          } else {
            n.selectedDef = n.optionsSrc.length === 1 ? n.optionsSrc[0] : delegacionSelectDef;
            n.selected = n.selectedDef;
          }
          return n;
        });
      },
    }));
  }, [delegacionSelect.reload, setDelegacionesQuery]);

  /** Carga seccionales por delegación */
  useEffect(() => {
    if (!seccionalSelect.reload) return;
    const delegId = seccionalSelect.refDelegacionId;

    setSeccionalSelect((o) => ({
      ...o,
      loading: "Cargando...",
      error: null,
      options: [],
      optionsSrc: [],
      data: [],
      selected: seccionalSelectDef,
      selectedDef: seccionalSelectDef,
      buscar: "",
      reload: false,
    }));

    if (!delegId) { setSeccionalSelect((o) => ({ ...o, loading: null })); return; }

    const cached = seccCacheRef.current.get(delegId);
    if (cached) {
      setSeccionalSelect((o) => ({
        ...o,
        loading: null,
        optionsSrc: cached.optionsSrc,
        options: cached.optionsSrc,
        data: cached.data,
        selectedDef: cached.optionsSrc.length === 1 ? cached.optionsSrc[0] : seccionalSelectDef,
        selected: seccionalSelectDef,
      }));
      return;
    }

    const gathered = [];
    const changes = { loading: "Cargando...", error: null };
    const onLoad = ({ query, ok, error }) => {
      let pages = 0; let pageIndex = query?.config?.body?.pageIndex;
      if (ok) {
        pages = ok.pages;
        if (Array.isArray(ok.data)) gathered.push(...ok.data);
      }
      if (error) changes.error = error.toString();
      if (pageIndex < pages) {
        pageIndex += 1;
        setSeccionalesQuery((o) => ({
          ...o,
          query: { ...o.query, config: { ...o.query.config, body: { ...o.query.config.body, pageIndex } } },
          onLoad,
        }));
      } else {
        const finalData = seccionalSelect.ambito ? gathered.filter((r) => seccionalSelect.ambito.includes(r.id)) : gathered;
        const optionsSrc = seccionalesSelectOptions({ data: finalData, ambitoUsuario });
        seccCacheRef.current.set(delegId, { optionsSrc, data: finalData });

        setSeccionalSelect((o) => ({
          ...o,
          loading: null,
          error: changes.error ?? null,
          optionsSrc,
          options: optionsSrc,
          data: finalData,
          selectedDef: optionsSrc.length === 1 ? optionsSrc[0] : seccionalSelectDef,
          selected: seccionalSelectDef,
        }));

        if (!initialAutoSelectRef.current && optionsSrc[0]?.value != null) {
          const firstSec = optionsSrc.find((opt) => opt.value != null);
          if (firstSec) {
            setSeccionalSelect((o) => ({ ...o, selected: firstSec }));
            setFiltros((o) => ({ ...o, ambitoDelegaciones: { ids: [delegId] }, ambitoSeccionales: { ids: [firstSec.value] } }));
            setList((o) => ({ 
              ...o, 
              filtros: { ...o.filtros, ambitoDelegaciones: { ids: [delegId] }, ambitoSeccionales: { ids: [firstSec.value] } }, 
              reload: true, 
              error: null,
              data: [],
              pagination: { ...o.pagination, index: 1, count: 0 }
            }));
            initialAutoSelectRef.current = true;
          }
        }
      }
    };

    setSeccionalesQuery((o) => ({
      ...o,
      query: { ...o.query, config: { ...o.query.config, body: { ...o.query.params, refDelegacionId: delegId, pageIndex: 1 } } },
      onLoad,
    }));
  }, [seccionalSelect.reload, seccionalSelect.refDelegacionId, seccionalSelect.ambito, setSeccionalesQuery, ambitoUsuario]);

  /** ========== LÓGICA DE FILTROS ========== */
  
  /** FILTRO: Cambio delegación → dispara carga de seccionales y actualiza filtros */
  useEffect(() => {
    if (delegacionSelect.loading) return;
    const refDelegacionId = delegacionSelect.selected === delegacionSelectDef ? 0 : delegacionSelect.selected?.value;

    if (!refDelegacionId) {
      setFiltros((o) => { const f = { ...o }; delete f.ambitoDelegaciones; return f; });
    } else {
      setFiltros((o) => ({ ...o, ambitoDelegaciones: { ids: [refDelegacionId] } }));
    }
    setSeccionalSelect((o) => ({ ...o, reload: true, refDelegacionId }));
  }, [delegacionSelect.loading, delegacionSelect.selected]);

  /** FILTRO: Cambio seccional → actualiza filtros */
  useEffect(() => {
    if (seccionalSelect.loading) return;
    const selected = seccionalSelect.selected;
    if (!selected || selected.value == null) {
      setFiltros((o) => { const f = { ...o }; delete f.ambitoSeccionales; return f; });
      return;
    }
    setFiltros((o) => ({ ...o, ambitoSeccionales: { ids: [Number(selected.value)] } }));
  }, [seccionalSelect.loading, seccionalSelect.selected]);

  /** Inicializa estado (Sit. Afi.) */
  useEffect(() => {
    if (!estadoSelect.reload) return;
    setEstadoSelect((o) => ({
      ...o,
      reload: false,
      loading: null,
      optionsSrc: estadoSelectOptions({}),
      options: estadoSelectOptions({}),
      selected: estadoSelectTodos,
      selectedDef: estadoSelectTodos,
    }));
  }, [estadoSelect.reload]);

  /** FILTRO: Cambio estado (Sit. Afi.) → actualiza filtros */
  useEffect(() => {
    if (estadoSelect.loading) return;
    const selected = estadoSelect.selected;

    setFiltros((prev) => {
      const f = { ...prev };
      delete f.estadoSolicitudFiltro;
      delete f.soloActivos;
      delete f.soloNoActivos;

      if (selected?.value === 1) {
        // FILTRO: Solo Activos
        f.estadoSolicitudFiltro = "Activo";
        f.soloActivos = true;
      } else if (selected?.value === 2) {
        // FILTRO: Solo No Activos
        f.estadoSolicitudFiltro = "No Activo";
        f.soloNoActivos = true;
      } else {
        // FILTRO: Todos (sin restricción de estado)
      }

      return f; // Todos => sin flags
    });
  }, [estadoSelect.loading, estadoSelect.selected]);

  /** LIST (tabla) */
  const [list, setList] = useState({
    reload: false, loading: null,
    pagination: { index: 1, size: 10 }, // Paginación remota - 10 registros por página
    filtros: {},
    sort: "seccionalId,nombre",
    data: [],
    error: null,
  });

  useEffect(() => {
    if (!list.reload) return;

    const filtrosNorm = normalizeFiltros(list.filtros);
    const estadoParams = buildEstadoParams(filtrosNorm);
    const body = {
      ...filtrosNorm,
      ...estadoParams, // backend filtra y pagina
      sort: list.sort,
      pageIndex: list.pagination.index,
      pageSize: list.pagination.size,
    };

    setAfiliacionesQuery((o) => ({
      ...o,
      query: { ...o.query, config: { ...o.query.config, body } },
      onPreLoad: () => setList((o) => ({ ...o, reload: false, loading: "Cargando...", data: [] })),
      onLoad: ({ ok, error }) => {
        let data = [];
        let pagination = { ...list.pagination };

        if (Array.isArray(ok?.data)) {
          data = !usuarioConSeccionalInactiva ? ok.data : [];

          // FILTRO CLIENT-SIDE TEMPORAL: El backend NO filtra correctamente
          // Esto solo filtra la página actual, no es ideal pero funciona
          const filtrosActuales = normalizeFiltros(list.filtros);
          data = aplicarFiltroEstado(data, filtrosActuales);

          const norm = normalizeServerPaging(ok, list.pagination.index, list.pagination.size);
          
          // IMPORTANTE: Mantener el size original de list.pagination, usar count de norm
          pagination = { 
            index: norm.index, 
            size: list.pagination.size,  // Usar el size que ya teníamos (10)
            count: norm.count,           // Usar el count (páginas) del backend
            totalCount: norm.totalCount  // Total de registros
          };
        } else {
          pagination = { ...pagination, count: 0 };
        }

        setList((o) => ({ ...o, loading: null, pagination, data, error: error?.toString() }));
      },
    }));
  }, [setAfiliacionesQuery, list.reload, list.filtros, list.sort, list.pagination, usuarioConSeccionalInactiva]);

  /** PADRÓN (PDF) */
  const [padron, setPadron] = useState({
    reload: null,
    loading: null,
    filtros: {},
    sort: "seccionalId,nombre",
    data: [],
    error: null,
    seccionales: [],
    despliega: false
  });

  // Carga paginada para el PDF con mensaje “Cargando bloque X de Y…”
  useEffect(() => {
    if (!padron.reload) return;

    const filtrosNorm = normalizeFiltros(padron.filtros);
    const baseBody = {
      ...filtrosNorm,
      ...buildEstadoParams(filtrosNorm), // backend filtra exactamente igual que la tabla
      sort: padron.sort || "seccionalId,nombre",
      pageIndex: 1,
      pageSize: 1000, // Usar pageSize grande para obtener más datos por página y menos requests
    };

    const acumulado = [];
    const changes = { reload: false, loading: "Cargando...", data: [], error: null, despliega: false };

    const onLoad = ({ query, ok, error }) => {
      let pages = 0;
      let pageIndex = query?.config?.body?.pageIndex;

      if (ok) {
        pages = ok.pages || 1;
        let data = Array.isArray(ok.data) ? ok.data : [];
        
        // >>> NUEVO: Usar cuilValidado para el PDF (si es válido, pisa el campo cuil)
        const CUIL_LENGTH = 11;
        data = data.map((afiliado) => {
          const val = afiliado?.cuilValidado;
          if (val != null) {
            const digits = String(val).replace(/\D/g, "");
            if (Number(val) !== 0 && digits.length === CUIL_LENGTH) {
              return { ...afiliado, cuil: val };
            }
          }
          return afiliado;
        });
        // <<< FIN NUEVO

        // Aplicar el mismo filtro de usuario inactivo que en la tabla
        data = !usuarioConSeccionalInactiva ? data : [];
        
        // FILTRO CLIENT-SIDE TEMPORAL: El backend NO filtra correctamente
        data = aplicarFiltroEstado(data, filtrosNorm);
        
        acumulado.push(...data);
      }
      if (error) changes.error = error.toString();

      if (pageIndex < pages) {
        pageIndex += 1;
        changes.loading = `Cargando bloque ${pageIndex} de ${pages}...`;
        setPadron((o) => ({ ...o, ...changes }));
        
        // IMPORTANTE: Mantener TODOS los filtros en la siguiente llamada, solo cambiar pageIndex
        const nextBody = { ...baseBody, pageIndex };
        
        setAfiliacionesQuery((o) => ({
          ...o,
          query: { ...o.query, config: { ...o.query.config, body: nextBody } },
          onLoad,
        }));
      } else {
        // Agrupar por seccional cuando termina
        const grupos = [];
        acumulado.forEach((a) => {
          const seccional =
            padron.seccionales.find((s) => s.id === a.seccionalId) ||
            { id: a.seccionalId, codigo: a.codigoSeccional, nombre: a.seccional, provincia: a.provincia };
          if (!seccional?.id) return;
          let g = grupos.find((x) => x.seccional.id === seccional.id);
          if (!g) { g = { seccional, afiliados: [] }; grupos.push(g); }
          g.afiliados.push(a);
        });

        changes.data = grupos;
        changes.loading = null;
        changes.despliega = true;
        setPadron((o) => ({ ...o, ...changes }));
      }
    };

    setAfiliacionesQuery((o) => ({
      ...o,
      query: { ...o.query, config: { ...o.query.config, body: baseBody } },
      onPreLoad: () => setPadron((o) => ({ ...o, ...changes, data: [] })), // reset visual + “Cargando…”
      onLoad,
    }));
  }, [padron.reload, padron.filtros, padron.sort, padron.seccionales, setAfiliacionesQuery, usuarioConSeccionalInactiva]);

  /** ========== ACCIONES DE FILTROS ========== */
  const onCargaPadron = useCallback(() => {
    // Usa EXACTAMENTE los mismos filtros que están aplicados en la tabla
    if (!list.filtros || Object.keys(list.filtros).length === 0 || list.data.length === 0) {
      return;
    }

    const filtrosEfectivos = normalizeFiltros(list.filtros);

    // Limitar a seccionales elegidas (si hay)
    const idsSel = filtrosEfectivos?.ambitoSeccionales?.ids || [];
    const seccionalesElegidas = (idsSel.length
      ? seccionalSelect.data.filter((s) => idsSel.includes(s.id))
      : seccionalSelect.data
    )
      .map((s) => ({ id: s.id, codigo: s.codigo, nombre: s.descripcion, provincia: s.provinciaDescripcion }))
      .filter((s) => s?.id);

    setPadron((o) => ({
      ...o,
      reload: true, // Activar la carga paginada para obtener TODAS las páginas
      loading: "Cargando datos para PDF...",
      error: null,
      filtros: filtrosEfectivos,  //  usa EXACTAMENTE los filtros aplicados en la tabla
      sort: list.sort, //  usa EXACTAMENTE el ordenamiento de la tabla
      data: [],
      despliega: false,
      seccionales: seccionalesElegidas,
    }));
  }, [list.filtros, list.sort, list.data.length, seccionalSelect.data]);

  /** ACCIÓN: Aplicar filtros - Toma los filtros configurados y los aplica a la tabla */
  const onAplicaFiltros = useCallback(() => {
    const filtrosNorm = normalizeFiltros(filtros);
    if (!filtrosNorm.ambitoDelegaciones) {
      setDelegacionSelect((o) => ({ ...o, error: "Dato requerido." }));
    } else {
      setDelegacionSelect((o) => ({ ...o, error: null }));
    }
    setList((o) => ({ 
      ...o, 
      filtros: filtrosNorm, 
      reload: true, 
      error: null,
      data: [],
      pagination: { ...o.pagination, index: 1, count: 0 }
    }));
  }, [filtros]);

  /** ACCIÓN: Limpiar filtros - Resetea todos los filtros a su estado inicial */
  const onLimpiaFiltros = useCallback(() => {
    const filtrosReset = { ...init.filtros };
    delete filtrosReset.estadoSolicitudFiltro;
    delete filtrosReset.soloActivos;
    delete filtrosReset.soloNoActivos;

    // Resetear selects a valores por defecto
    setDelegacionSelect((o) => ({ ...o, selected: o.selectedDef }));
    setSeccionalSelect((o) => ({ ...o, selected: o.selectedDef }));
    setEstadoSelect((o) => ({ ...o, selected: estadoSelectTodos }));

    setFiltros(filtrosReset);
    if (JSON.stringify(list.filtros) === JSON.stringify(filtrosReset)) return;

    setList((o) => ({ 
      ...o, 
      filtros: filtrosReset, 
      error: null, 
      reload: true,
      data: [],
      pagination: { ...o.pagination, index: 1, count: 0 }
    }));
    setPadron((o) => ({ ...o, filtros: filtrosReset, seccionales: [], data: [], despliega: false }));
  }, [init.filtros, list.filtros]);

  /** Init */
  useEffect(() => {
    if (!init.pending) return;
    setInit((o) => ({ ...o, pending: false }));
    const ambito = { delegaciones: [...AsArray(init.usuario?.ambitoDelegaciones?.ids)], seccionales: [...AsArray(init.usuario?.ambitoSeccionales?.ids)] };
    const finalizaCarga = () => {
      setInit((o) => { const n = { ...o }; const f = n.filtros; if (ambito.seccionales.length) f.ambitoSeccionales = { ids: [...ambito.seccionales] }; if (ambito.delegaciones.length) f.ambitoDelegaciones = { ids: [...ambito.delegaciones] }; return n; });
      if (ambito.seccionales.length) setSeccionalSelect((o) => ({ ...o, ambito: ambito.seccionales }));
      const delegaciones = {}; if (ambito.delegaciones.length) delegaciones.ambito = ambito.delegaciones;
      setDelegacionSelect((o) => ({ ...o, reload: true, loading: "Cargando...", ...delegaciones }));
    };
    if (ambito.seccionales.length && !ambito.delegaciones.length) {
      const seccionales = [...ambito.seccionales].filter((r) => r);
      const onLoad = ({ ok }) => {
        const refDelegacionId = ok?.refDelegacionId;
        if (refDelegacionId && !ambito.delegaciones.includes(refDelegacionId)) ambito.delegaciones.push(refDelegacionId);
        let seccional = seccionales.shift();
        if (seccional) setSeccionalQuery((o) => ({ ...o, query: { ...o.query, params: { id: seccional } }, onLoad }));
        else finalizaCarga();
      };
      onLoad({});
    } else {
      finalizaCarga();
    }
  }, [init, setSeccionalQuery]);

  useEffect(() => {
    if (init.pending) return;
    if (init.wait == null) return;
    if (Object.keys(init.wait).length) return;
    setInit((o) => ({ ...o, wait: null }));
    onLimpiaFiltros();
  }, [init, onLimpiaFiltros]);

  /** Render */
  const padronRender = !padron.despliega ? null : (
    <PDFViewer data={padron.data} onClose={() => setPadron((o) => ({ ...o, despliega: false }))} ambitoUser={ambitoUsuario} />
  );

  return (
    <Modal size="xl" centered show>
      <Modal.Header className={modalCss.modalCabecera}>Afiliados por seccional</Modal.Header>
      <Modal.Body>
        <Grid col full gap="15px">
          {/* ========== INTERFAZ DE FILTROS ========== */}
          <Grid grid="auto / 1fr 1fr 1fr 200px 200px" gap="inherit">
            {/* FILTRO 1: Delegación */}
            <SearchSelectMaterial
              id="delegacionSelect"
              label="Delegacion"
              error={!!delegacionSelect.error}
              helperText={delegacionSelect.loading ?? delegacionSelect?.error}
              value={delegacionSelect.selected}
              onChange={(selected) => setDelegacionSelect((o) => ({ ...o, selected: normalizeDelegOption(selected) }))}
              options={delegacionSelect.options}
              onTextChange={(buscar) => setDelegacionSelect((o) => ({ ...o, buscar }))}
            />
            {/* FILTRO 2: Seccional */}
            <SearchSelectMaterial
              id="seccionalSelect"
              label="Seccional"
              error={!!seccionalSelect.error}
              helperText={seccionalSelect.loading ?? seccionalSelect?.error}
              value={seccionalSelect.selected}
              onChange={(selected) => setSeccionalSelect((o) => ({ ...o, selected: normalizeSeccionalOption(selected) }))}
              options={seccionalSelect.options}
              onTextChange={(buscar) => setSeccionalSelect((o) => ({ ...o, buscar }))}
            />
            {/* FILTRO 3: Estado de Afiliación */}
            <SearchSelectMaterial
              id="estadoSelect"
              label="Estado"
              error={!!estadoSelect.error}
              helperText={estadoSelect.loading ?? estadoSelect?.error}
              value={estadoSelect.selected}
              onChange={(selected) => setEstadoSelect((o) => ({ ...o, selected }))}
              options={estadoSelect.options}
              onTextChange={(buscar) => setEstadoSelect((o) => ({ ...o, buscar }))}
            />
            {/* BOTÓN: Aplicar filtros */}
            <Button className="botonAzul" disabled={JSON.stringify(list.filtros) === JSON.stringify(filtros)} onClick={onAplicaFiltros}>
              Aplica filtros
            </Button>
            {/* BOTÓN: Limpiar filtros */}
            <Button className="botonAzul" disabled={JSON.stringify(filtros) === JSON.stringify(init.filtros)} onClick={onLimpiaFiltros}>
              Limpia filtros
            </Button>
          </Grid>

          <Table
            remote
            keyField="id"
            data={list.data}
            mostrarBuscar={false}
            baseProps={{ style: { overflowX: "scroll" } }}
            pagination={{
              ...list.pagination,
              onChange: (pagination) =>
                setList((o) => ({
                  ...o,
                  reload: true,
                  pagination: { ...o.pagination, ...pagination },
                  data: [],
                  error: null,
                })),
            }}
            noDataIndication={list.loading || list.error || "No existen datos para mostrar"}
            columns={columns}
            onTableChange={(type, { sortOrder, sortField }) => {
              if (type === "sort") {
                sortField = { cuil: "CUIL" }[sortField] ?? sortField;
                const sort = `${sortField}${sortOrder === "desc" ? "Desc" : ""}`;
                setList((o) => ({ 
                  ...o, 
                  reload: true, 
                  sort, 
                  data: [], 
                  error: null, 
                  pagination: { ...o.pagination, count: 0, index: 1 } 
                }));
              }
            }}
          />

          {padronRender}
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Grid grid="auto / 1fr 150px 150px" width col gap="15px">
          <Grid width col>
            {padron.loading == null ? null : <text style={{ color: "green" }}>{padron.loading}</text>}
            {padron.error == null ? null : <text style={{ color: "red" }}>{padron.error}</text>}
          </Grid>
          <Button
            className="botonAmarillo"
            loading={!!padron.loading}
            onClick={onCargaPadron}
            tarea="Informes_Afiliados_AfiliadosSeccional_Imprime"
            disabled={!list.filtros || Object.keys(list.filtros).length === 0 || list.data.length === 0}
            title={
              !list.filtros || Object.keys(list.filtros).length === 0 || list.data.length === 0
                ? "Aplica filtros primero para generar el PDF con los datos filtrados"
                : `Generar PDF con ${list.pagination.totalCount || 'TODOS los'} registros que coinciden con los filtros aplicados (mostrando página ${list.pagination.index} de ${list.pagination.count})`
            }
          >
            IMPRIME
          </Button>
          <Button className="botonAmarillo" onClick={() => onClose()}>FINALIZA</Button>
        </Grid>
      </Modal.Footer>
    </Modal>
  );
};

export default Handler;