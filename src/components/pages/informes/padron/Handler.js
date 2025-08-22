import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import Formato from "components/helpers/Formato";
import useQueryState from "components/hooks/useQueryState";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, { includeSearch, mapOptions } from "components/ui/Select/SearchSelectMaterial";
import Table from "components/ui/Table/Table";
import PDFViewer from "./PDFViewer";
import AuthContext from "store/authContext";
import AsArray from "components/helpers/AsArray";
import useAmbitosUsuario from "components/hooks/useAmbitos";
import { useSelector } from "react-redux";

/** Types */
const columns = [
  { dataField: "nroAfiliado", text: "Nro. Afil.", sort: true, headerTitle: () => "Numero de Afiliado", headerStyle: { width: "6em", textAlign: "center" }, style: { textAlign: "center" } },
  { dataField: "cuil", text: "CUIL", sort: true, headerTitle: true, headerStyle: { width: "8em", textAlign: "center" }, formatter: (v, row) => (row.cuilValidado != 0 ? Formato.Cuit(row.cuilValidado) : Formato.Cuit(v)), style: { textAlign: "center" } },
  { dataField: "cuilValidado", text: "Val.", headerTitle: true, headerStyle: { width: "3em", textAlign: "center" }, formatter: (v, { cuil }) => (v === 0 ? "N" : v === cuil ? "V" : "D"), style: { textAlign: "center" } },
  { dataField: "documento", text: "Doc. Nro.", sort: true, headerTitle: () => "Documento número", headerStyle: { width: "7em", textAlign: "center" }, formatter: (v) => Formato.DNI(v), style: { textAlign: "center" } },
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
  { dataField: "empresaCUIT", text: "CUIT", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" }, formatter: (v) => Formato.Cuit(v), style: { textAlign: "center" } },
  { dataField: "empresaDescripcion", text: "Empresa", headerTitle: true, headerStyle: { width: "10em", textAlign: "center" } },
  { dataField: "actividad", text: "Actividad", headerTitle: true, headerStyle: { width: "10em", textAlign: "center" } },
  { dataField: "ultimaDDJJPeriodo", text: "Período última DDJJ", headerTitle: true, headerStyle: { width: "12em", textAlign: "center" }, formatter: (v) => Formato.Periodo(v) },
];

// --- options helpers
const delegacionSelectDef = { label: "Elige..." };
const seccionalSelectDef = { label: "Todas" };

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

// --- normalizadores (defensivos)
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
  return g;
};

const Handler = ({ onClose = () => {} }) => {
  const ambitoUsuario = useAmbitosUsuario().ambitoUser();
  const { usuario } = useContext(AuthContext);
  const usuarioLogueado = useSelector((state) => state.usuarioLogueado);
  const usuarioConSeccionalInactiva =
    usuarioLogueado?.ambitosDescripciones?.[0]?.seccionalEstado &&
    !["NORMALIZADA", "TRANSITORIA", "SIN COMISION"].includes(usuarioLogueado.ambitosDescripciones?.[0]?.seccionalEstado);

  // --- APIs
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

  // --- init
  const [init, setInit] = useState({
    pending: true,
    filtros: { ambitoTodos: usuario.ambitoTodos, ambitoProvincias: usuario.ambitoProvincias },
    wait: { delegaciones: true, seccionales: true },
    usuario,
  });
  const [filtros, setFiltros] = useState({ ...init.filtros });

  // --- selects
  const [delegacionSelect, setDelegacionSelect] = useState({
    reload: false, loading: "Cargando...", buscar: "", data: [], error: null,
    optionsSrc: [], options: [], selected: delegacionSelectDef, selectedDef: delegacionSelectDef, ambito: null, origen: "",
  });
  useEffect(() => {
    setDelegacionSelect((o) => ({ ...o, options: o.optionsSrc.filter((r) => includeSearch(r, delegacionSelect.buscar)) }));
  }, [delegacionSelect.buscar, delegacionSelect.optionsSrc]);

  const [seccionalSelect, setSeccionalSelect] = useState({
    reload: false, loading: "Cargando...", buscar: "", data: [], error: null,
    optionsSrc: [], options: [], selected: seccionalSelectDef, selectedDef: seccionalSelectDef, ambito: null, refDelegacionId: 0, origen: "",
  });
  useEffect(() => {
    setSeccionalSelect((o) => ({ ...o, options: o.optionsSrc.filter((r) => includeSearch(r, seccionalSelect.buscar)) }));
  }, [seccionalSelect.buscar, seccionalSelect.optionsSrc]);

  // --- cache seccionales por delegación
  const seccCacheRef = useRef(new Map()); // delegId -> { optionsSrc, data }
  const initialAutoSelectRef = useRef(false); // sólo en la carga inicial

  // =========================
  // Carga inicial: Delegación
  // =========================
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
          // Autoselect en PRIMER render si el usuario no elige nada
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

  // ==================================
  // Carga de Seccionales por Delegación
  // ==================================
  useEffect(() => {
    if (!seccionalSelect.reload) return;

    const delegId = seccionalSelect.refDelegacionId;
    // 1) Limpio SIEMPRE antes de mostrar (evita ver seccionales viejas)
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

    // 2) Si no hay delegación, listo
    if (!delegId) {
      setSeccionalSelect((o) => ({ ...o, loading: null }));
      return;
    }

    // 3) Cache
    const cached = seccCacheRef.current.get(delegId);
    if (cached) {
      setSeccionalSelect((o) => ({
        ...o,
        loading: null,
        optionsSrc: cached.optionsSrc,
        options: cached.optionsSrc,
        data: cached.data,
        // Mantengo "Todas" tras cambio de delegación (el user decide la seccional)
        selectedDef: cached.optionsSrc.length === 1 ? cached.optionsSrc[0] : seccionalSelectDef,
        selected: seccionalSelectDef,
      }));
      return;
    }

    // 4) Fetch paginado y set único al final
    const gathered = [];
    const changes = { loading: "Cargando...", error: null };
    /** @type {import("components/hooks/useQueryState").onLoad} */
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
          selected: seccionalSelectDef, // tras cambio de delegación, quedamos en "Todas"
        }));

        // Autoselect inicial (sólo primera vez del módulo)
        if (!initialAutoSelectRef.current && optionsSrc[0]?.value != null) {
          const firstSec = optionsSrc.find((opt) => opt.value != null);
          if (firstSec) {
            setSeccionalSelect((o) => ({ ...o, selected: firstSec }));
            setFiltros((o) => ({ ...o, ambitoDelegaciones: { ids: [delegId] }, ambitoSeccionales: { ids: [firstSec.value] } }));
            setList((o) => ({ ...o, filtros: { ...o.filtros, ambitoDelegaciones: { ids: [delegId] }, ambitoSeccionales: { ids: [firstSec.value] } }, reload: true, error: null, pagination: { ...o.pagination, index: 1 } }));
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
  }, [seccionalSelect.reload, seccionalSelect.refDelegacionId, setSeccionalesQuery, ambitoUsuario]);

  // =========================================
  // Cambio de delegación => dispara carga sec.
  // =========================================
  useEffect(() => {
    if (delegacionSelect.loading) return;
    const selected = delegacionSelect.selected;
    const refDelegacionId = selected === delegacionSelectDef ? 0 : selected?.value;

    // set filtros de delegación
    if (!refDelegacionId) {
      setFiltros((o) => { const f = { ...o }; delete f.ambitoDelegaciones; return f; });
    } else {
      setFiltros((o) => ({ ...o, ambitoDelegaciones: { ids: [refDelegacionId] } }));
    }

    // disparar recarga de seccionales (con reset fuerte hecho en el effect de seccionales)
    setSeccionalSelect((o) => ({ ...o, reload: true, refDelegacionId }));
  }, [delegacionSelect.loading, delegacionSelect.selected]);

  // ======================================
  // Cambio de seccional => set filtros
  // ======================================
  useEffect(() => {
    if (seccionalSelect.loading) return;
    const selected = seccionalSelect.selected;
    const isTodas = !selected || selected.value == null;
    if (isTodas) {
      setFiltros((o) => { const f = { ...o }; delete f.ambitoSeccionales; return f; });
      return;
    }
    setFiltros((o) => ({ ...o, ambitoSeccionales: { ids: [Number(selected.value)] } }));
  }, [seccionalSelect.loading, seccionalSelect.selected]);

  // ============
  // List (tabla)
  // ============
  const [list, setList] = useState({ reload: false, loading: null, pagination: { index: 1, size: 10 }, filtros: {}, sort: "seccionalId,nombre", data: [], error: null });
  useEffect(() => {
    if (!list.reload) return;
    const filtrosNorm = normalizeFiltros(list.filtros);
    const body = { ...filtrosNorm, estadoSolicitudId: 2, sort: list.sort, pageIndex: list.pagination.index, pageSize: list.pagination.size };
    setAfiliacionesQuery((o) => ({
      ...o,
      query: { ...o.query, config: { body } },
      onPreLoad: () => setList((o) => ({ ...o, reload: false, loading: "Cargando...", data: [] })),
      onLoad: ({ ok, error }) => {
        let data = [];
        let pagination = { ...list.pagination, count: data.length };
        if (Array.isArray(ok?.data)) {
          ({ data, ...pagination } = !usuarioConSeccionalInactiva ? ok : { data: [], pagination: {} });
        }
        setList((o) => ({ ...o, loading: null, pagination, data, error: error?.toString() }));
      },
    }));
  }, [setAfiliacionesQuery, list.reload]);

  // ============
  // Padrón (PDF)
  // ============
  const [padron, setPadron] = useState({ reload: null, loading: null, filtros: {}, data: [], error: null, seccionales: [], despliega: false });
  useEffect(() => {
    if (!padron.reload) return;
    const filtrosNorm = normalizeFiltros(padron.filtros);
    const body = { ...filtrosNorm, estadoSolicitudId: 2, sort: "seccionalId,nombre", pageIndex: 1 };
    const changes = { reload: false, loading: "Cargando...", data: [], error: null, despliega: false };

    const onLoad = ({ query, ok, error }) => {
      let pages = 0; let pageIndex = query?.config?.body?.pageIndex;
      if (ok) {
        pages = ok.pages; const data = ok.data;
        if (Array.isArray(data)) {
          data.forEach((afiliado) => {
            const seccional = padron.seccionales.find((s) => s.id === afiliado.seccionalId);
            if (seccional) {
              let seccionalAfiliados = changes.data.find((a) => a.seccional === seccional);
              if (seccionalAfiliados == null) { seccionalAfiliados = { seccional, afiliados: [] }; changes.data.push(seccionalAfiliados); }
              seccionalAfiliados.afiliados.push(afiliado);
            }
          });
        }
      }
      if (error) changes.error = error.toString();
      if (pageIndex < pages) {
        pageIndex += 1; changes.loading = `Cargando bloque ${pageIndex} de ${pages}...`;
        setAfiliacionesQuery((o) => ({ ...o, query: { ...o.query, config: { ...o.query.config, body: { ...o.query.config.body, pageIndex } } }, onLoad }));
      } else { changes.loading = null; changes.despliega = true; }
      setPadron((o) => ({ ...o, ...changes }));
    };

    setAfiliacionesQuery((o) => ({
      ...o,
      query: { ...o.query, config: { ...o.query.config, body } },
      onPreLoad: () => setPadron((o) => ({ ...o, ...changes })),
      onLoad,
    }));
  }, [setAfiliacionesQuery, padron.reload]);

  // ============
  // Acciones
  // ============
  const onCargaPadron = useCallback(() => {
    const filtrosNorm = normalizeFiltros(filtros);
    if (!filtrosNorm.ambitoDelegaciones) { setDelegacionSelect((o) => ({ ...o, error: "Dato requerido." })); return; }
    setDelegacionSelect((o) => ({ ...o, error: null }));
    setPadron((o) => ({
      ...o,
      reload: true,
      filtros: filtrosNorm,
      seccionales: seccionalSelect.data.map((s) => ({ id: s.id, codigo: s.codigo, nombre: s.descripcion, provincia: s.provinciaDescripcion })).filter((s) => s?.id),
    }));
  }, [filtros, seccionalSelect.data]);

  const onAplicaFiltros = useCallback(() => {
    const filtrosNorm = normalizeFiltros(filtros);
    if (!filtrosNorm.ambitoDelegaciones) setDelegacionSelect((o) => ({ ...o, error: "Dato requerido." })); else setDelegacionSelect((o) => ({ ...o, error: null }));
    setList((o) => ({ ...o, filtros: filtrosNorm, reload: true, error: null, pagination: { ...o.pagination, index: 1 } }));
    setPadron((o) => ({
      ...o,
      filtros: filtrosNorm,
      seccionales: seccionalSelect.data.map((s) => ({ id: s.id, codigo: s.codigo, nombre: s.descripcion, provincia: s.provinciaDescripcion })).filter((s) => s?.id),
    }));
  }, [filtros, seccionalSelect.data]);

  const onLimpiaFiltros = useCallback(() => {
    const filtrosReset = { ...init.filtros };
    setDelegacionSelect((o) => ({ ...o, selected: o.selectedDef }));
    setSeccionalSelect((o) => ({ ...o, selected: o.selectedDef }));
    setFiltros(filtrosReset);
    if (JSON.stringify(list.filtros) === JSON.stringify(filtrosReset)) return;
    setList((o) => ({ ...o, filtros: filtrosReset, error: null, reload: true }));
    setPadron((o) => ({ ...o, filtros: filtrosReset, seccionales: [] }));
  }, [init.filtros, list.filtros]);

  // ============
  // Init
  // ============
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

  const padronRender = !padron.despliega ? null : (
    <PDFViewer data={padron.data} onClose={() => setPadron((o) => ({ ...o, despliega: false }))} ambitoUser={ambitoUsuario} />
  );

  return (
    <Modal size="xl" centered show>
      <Modal.Header className={modalCss.modalCabecera}>Afiliados por seccional</Modal.Header>
      <Modal.Body>
        <Grid col full gap="15px">
          <Grid grid="auto / 1fr 1fr 200px 200px" gap="inherit">
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
            <Button className="botonAzul" disabled={JSON.stringify(list.filtros) === JSON.stringify(filtros)} onClick={onAplicaFiltros}>
              Aplica filtros
            </Button>
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
                setList((o) => ({ ...o, reload: true, pagination: { ...o.pagination, ...pagination }, data: [], error: null })),
            }}
            noDataIndication={list.loading || list.error || "No existen datos para mostrar "}
            columns={columns}
            onTableChange={(type, { sortOrder, sortField }) => {
              if (type === "sort") {
                sortField = { cuil: "CUIL" }[sortField] ?? sortField;
                const sort = `${sortField}${sortOrder === "desc" ? "Desc" : ""}`;
                setList((o) => ({ ...o, reload: true, sort, data: [], error: null, pagination: { ...o.pagination, count: 0 } }));
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
          <Button className="botonAmarillo" loading={!!padron.loading} onClick={() => onCargaPadron()} tarea="Informes_Afiliados_AfiliadosSeccional_Imprime" disabled={list.data.length === 0}>
            IMPRIME
          </Button>
          <Button className="botonAmarillo" onClick={() => onClose()}>FINALIZA</Button>
        </Grid>
      </Modal.Footer>
    </Modal>
  );
};

export default Handler;
