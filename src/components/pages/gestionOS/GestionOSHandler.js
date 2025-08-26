

import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import dayjs from "dayjs";
import { Tabs, Tab } from "@mui/material";

import AuthContext from "store/authContext";
import Action from "components/helpers/Action";
import Formato from "components/helpers/Formato";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import Button from "components/ui/Button/Button";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import useQueryQueue from "components/hooks/useQueryQueue";

import useGestionOS, { onLoadSelectKeepOrFirst } from "./useGestionOS";
import useDocumentaciones from "components/Documentacion/useDocumentaciones";

/* === Nuevo agregado: Modal del informe === */
import ExcelDatos from "./ExcelDatos";

const GestionOSHandler = () => {
  const dispatch = useDispatch();
  const Usuario = useContext(AuthContext).usuario;

  // ─────────────────────────────────────────────────────────────
  // Pestañas y modal "Informe"
  // ─────────────────────────────────────────────────────────────
  const tabs = [];
  const [tab, setTab] = useState(0);

  // === Nuevo agregado: estado para abrir/cerrar el modal de Informe ===
  const [showInforme, setShowInforme] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Filtros de la grilla de gestiones
  // ─────────────────────────────────────────────────────────────
  const [paramsEdit, setParamsEdit] = useState({});
  const [paramsSend, setParamsSend] = useState({});

  // ─────────────────────────────────────────────────────────────
  // Endpoints para catálogos (Estados / Situaciones)
  // ─────────────────────────────────────────────────────────────
  const pushQuery = useQueryQueue((action) => {
    switch (action) {
      case "GetEstados":
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/GestionesEstado`,
            method: "GET",
          },
        };
      case "GetSituaciones":
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/GestionesSituacion`,
            method: "GET",
          },
        };
      default:
        return null;
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Select: Tipo Estado
  // ─────────────────────────────────────────────────────────────
  const [estadoSelect, setEstadoSelect] = useState({
    reload: true,
    loading: null,
    data: [],
    error: null,
    options: [{ value: 0, label: "TODOS" }],
    selected: { value: 0, label: "TODOS" },
  });

  // ─────────────────────────────────────────────────────────────
  // Select: Tipo Situación (dependiente de Estado)
  // ─────────────────────────────────────────────────────────────
  const [situacionSelect, setSituacionSelect] = useState({
    reload: true,
    loading: null,
    data: [],
    error: null,
    options: [],
    selected: { value: 0, label: "Todos" },
  });

  // ─────────────────────────────────────────────────────────────
  // Select: Tipo Gestión (medio)
  // ─────────────────────────────────────────────────────────────
  const [medioSelect] = useState({
    options: [
      { value: "Todos", label: "TODOS" },
      { value: "email", label: "EMAIL" },
      { value: "telefono", label: "TELEFONO" },
    ],
    selected: { value: "Todos", label: "TODOS" },
  });

  // Carga inicial de Estados
  useEffect(() => {
    const changes = { reload: false, loading: "Cargando...", data: [], error: null };
    pushQuery({
      action: "GetEstados",
      onOk: (data) => {
        if (!Array.isArray(data)) return console.error("Se esperaba un arreglo", data);
        changes.options = [{ value: 0, label: "TODOS" }, ...data.map((r) => ({ value: r.id, label: r.descripcion }))];
      },
      onError: (error) => (changes.error = error.toString()),
      onFinally: () => setEstadoSelect((o) => ({ ...o, ...changes, loading: null })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga de Situaciones según Estado seleccionado
  useEffect(() => {
    const changes = { reload: false, loading: "Cargando...", data: [], error: null };
    pushQuery({
      action: "GetSituaciones",
      params: { gestionEstadoId: paramsEdit?.filtroTipoEstado?.value },
      onOk: (data) => {
        if (!Array.isArray(data)) return console.error("Se esperaba un arreglo", data);
        changes.options = [{ value: 0, label: "TODOS" }, ...data.map((r) => ({ value: r.id, label: r.descripcion }))];
      },
      onError: (error) => (changes.error = error.toString()),
      onFinally: () => setSituacionSelect((o) => ({ ...o, ...changes, loading: null })),
    });
  }, [paramsEdit?.filtroTipoEstado, pushQuery]);

  // ─────────────────────────────────────────────────────────────
  // Hook de Gestiones (tabla principal)
  // ─────────────────────────────────────────────────────────────
  const {
    render: formulariosOspreraRender,
    request: formularioOspreraRequest,
    selected: formularioSelected,
  } = useGestionOS({
    params: { orderBy: "cuitTitular" },
    onLoadSelect: onLoadSelectKeepOrFirst,
  });

  // Acciones de la barra lateral del módulo
  const [formularioOspreraActions, setFormularioOspreraActions] = useState([]);

  useEffect(() => {
    const createAction = ({ action, request, record, ...x }) => {
      const params = { action, request };
      if (record) params.record = record;
      return new Action({
        name: action,
        onExecute: () => formularioOspreraRequest("selected", params),
        combination: "AltKey",
        ...x,
      });
    };

    const actions = [
      createAction({
        action: `Agrega Gestión`,
        request: "A",
        tarea: "Osprera_GestionAgrega",
        keys: "a",
        underlineindex: 0,
      }),
    ];

    const desc = formularioSelected?.id;

    actions.push(
      createAction({
        action: `Consulta Gestión ${desc}`,
        request: "C",
        tarea: "Osprera_GestionConsulta",
        record: {},
        ...(!formularioSelected?.id
          ? { disabled: true }
          : { disabled: false, keys: "o", underlineindex: 1 }),
      })
    );

    actions.push(
      createAction({
        action: `Modifica Gestión ${desc}`,
        request: "M",
        record: {},
        tarea: "Osprera_GestionModifica",
        ...(formularioSelected?.deletedDate ||
        !formularioSelected?.id ||
        formularioSelected?.gestionEstadoDescripcion === "FINALIZADO"
          ? { disabled: true }
          : { disabled: false, keys: "m", underlineindex: 0 }),
      })
    );

    if (formularioSelected?.deletedDate) {
      actions.push(
        createAction({
          action: `Reactiva Gestión ${desc}`,
          request: "R",
          record: {},
          tarea: "Osprera_GestionReactiva",
          keys: "r",
          underlineindex: 0,
        })
      );
    } else {
      actions.push(
        createAction({
          action: `Baja Gestión ${desc}`,
          request: "B",
          record: {
            ...formularioSelected,
            deletedDate: dayjs().format("YYYY-MM-DD"),
            deletedBy: Usuario.nombre,
          },
          tarea: "Osprera_GestionBaja",
          ...(formularioSelected?.deletedDate || !formularioSelected?.id
            ? { disabled: true }
            : { disabled: false, keys: "b", underlineindex: 0 }),
        })
      );
    }

    // === Nuevo agregado: Acción lateral “Informe” (debajo de Baja Gestión) ===
    actions.push(
      new Action({
        name: "Informe",
        onExecute: () => setShowInforme(true),
        combination: "AltKey",
        tarea: "Osprera_GestionInforme",
        keys: "i",
        underlineindex: 0,
        // se habilita solo si hay una gestión seleccionada
        disabled: !formularioSelected?.id,
      })
    );
    // === Fin nuevo agregado ===

    setFormularioOspreraActions(actions);
  }, [formularioOspreraRequest, formularioSelected, Usuario?.nombre]);

  // ─────────────────────────────────────────────────────────────
  // Tab “Gestiones de Obra Social” (filtros + tabla)
  // ─────────────────────────────────────────────────────────────
  tabs.push({
    header: () => <Tab label="Gestiones de Obra Social" />,
    body: () => (
      <Grid width col gap="10px">
        {/* Filtros superiores */}
        <Grid row gap="10px">
          {/* ... filtros (igual que antes) ... */}
        </Grid>

        {/* Tabla de gestiones */}
        {formulariosOspreraRender()}
      </Grid>
    ),
    actions: formularioOspreraActions,
  });

  // Dispara carga de la tabla al aplicar filtros
  useEffect(() => {
    formularioOspreraRequest("list", {
      params: paramsSend,
      pagination: { index: 1, size: 15 },
      onLoadSelect: onLoadSelectKeepOrFirst,
    });
  }, [formularioOspreraRequest, paramsSend]);

  // ─────────────────────────────────────────────────────────────
  // Tab “Documentación” (sin cambios)
  // ─────────────────────────────────────────────────────────────
  const [documentacionesTab, documentacionChanger, documentacionSelected] = useDocumentaciones();
  const [documentacionesActions, setDocumentacionesActions] = useState([]);

  useEffect(() => {
    const actions = [];
    const form = formularioSelected?.id;
    if (!form) {
      setDocumentacionesActions(actions);
      return;
    }
    const deleDesc = `Gestión ${form}`;

    const createAction = ({ action, request, ...x }) =>
      new Action({
        name: action,
        onExecute: () =>
          documentacionChanger("selected", {
            request,
            action,
            record: { entidadTipo: "O", entidadId: formularioSelected?.id, soloactivos: true },
          }),
        combination: "AltKey",
        ...x,
      });

    actions.push(
      createAction({
        action: `Agrega Documentación ${deleDesc}`,
        request: "A",
        tarea: "Osprera_GestionDocumentacionAgrega",
        keys: "a",
        underlineindex: 0,
      })
    );

    const docu = documentacionSelected?.id;
    if (!docu) {
      setDocumentacionesActions(actions);
      return;
    }

    const docuDesc = `${docu} ${deleDesc}`;

    actions.push(
      createAction({
        action: `Consulta Documentación ${docuDesc}`,
        request: "C",
        tarea: "Osprera_GestionDocumentacionConsulta",
        keys: "o",
        underlineindex: 1,
      })
    );
    actions.push(
      createAction({
        action: `Modifica Documentación ${docuDesc}`,
        request: "M",
        tarea: "Osprera_GestionDocumentacionModifica",
        keys: "m",
        underlineindex: 0,
        ...(documentacionSelected?.deletedDate ? { disabled: true } : { disabled: false }),
      })
    );
    actions.push(
      createAction({
        action: `Baja Documentación ${docuDesc}`,
        request: "B",
        tarea: "Osprera_GestionDocumentacionBaja",
        keys: "b",
        underlineindex: 0,
        ...(documentacionSelected?.deletedDate ? { disabled: true } : { disabled: false }),
      })
    );

    setDocumentacionesActions(actions);
  }, [documentacionChanger, documentacionSelected, formularioSelected?.id]);

  tabs.push({
    header: () => <Tab label="Documentacion" disabled={!formularioSelected || formularioSelected.deletedDate} />,
    body: documentacionesTab,
    actions: documentacionesActions,
  });

  // Refresca documentación cuando cambia la gestión
  useEffect(() => {
    documentacionChanger("list", {
      clear: !formularioSelected?.id,
      params: { entidadTipo: "O", entidadId: formularioSelected?.id, soloactivos: true },
    });
  }, [formularioSelected?.id, documentacionChanger]);

  // ─────────────────────────────────────────────────────────────
  // Registro del módulo + acciones (para la barra lateral)
  // ─────────────────────────────────────────────────────────────
  const acciones = tabs[tab].actions;
  useEffect(() => {
    dispatch(handleModuloSeleccionar({ nombre: "GestionOS", nombreMiga: "Gestion O.S", acciones }));
  }, [dispatch, acciones]);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <Grid full col>
      <Grid className="titulo">
        <h1>Gestión Obra Social</h1>
      </Grid>

      <div className="tabs">
        <text>
          {formularioSelected?.cuitTitular
            ? ` Nro. Gestión: ${formularioSelected?.id} (${Formato.Cuit(formularioSelected?.cuitTitular)}  |  ${formularioSelected?.apellidoTitular}${formularioSelected?.nombreTitular})`
            : " "}
        </text>

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {tabs.map((r) => r.header())}
        </Tabs>
      </div>

      <div className="contenido">{tabs[tab].body()}</div>

      {/* Accesos rápidos por teclado a las acciones laterales */}
      <KeyPress items={acciones} />

      {/* === Nuevo agregado: Modal del Informe === */}
      {showInforme && <ExcelDatos onClose={() => setShowInforme(false)} />}
      {/* === Fin nuevo agregado === */}
    </Grid>
  );
};

export default GestionOSHandler;
