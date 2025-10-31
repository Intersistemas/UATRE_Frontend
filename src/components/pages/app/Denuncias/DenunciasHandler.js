
import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";

import { Tabs, Tab } from "@mui/material";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import useDenuncias, { onLoadSelectKeepOrFirst } from "./useDenuncias";
import AuthContext from "store/authContext";
import DenunciasForm from "./DenunciasForm";
import Action from "components/helpers/Action";

const DenunciasHandler = () => {
  const dispatch = useDispatch();
  const { usuario } = useContext(AuthContext);

  const tabs = [];
  const [tab, setTab] = useState(0);


  // Modal DenunciasForm
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("A"); // A | M | C | B
  const [formData, setFormData] = useState({});

  const openForm = (mode, record = {}) => {
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
  };


  // ==============================
  // QUERIES API
  // ==============================
  const pushQuery = useQueryQueue((action) => {
    if (action === "GetDenuncia") {
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
      onOk: async (data) => {
        if (!Array.isArray(data)) return console.error("Se esperaba un arreglo", { data });
        changes.data = data
          .sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
          .map((r) => ({ label: r.nombre, value: r.id }));
        changes.options = changes.data;
        changes.selected = changes.data.find(({ value }) => value === denuncia.selected?.value) ?? denuncia.selected;
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
  // ESTADO: PARAMS
  // ==============================
  const [denunciaParams, setDenunciaParams] = useState({
    filtro: "",
    sortBy: "+nombre",
  });

  // ==============================
  // TABLA: DENUNCIAS
  // ==============================
  const {
    render: denunciaRender,
    request: denunciaRequest,
    selected: denunciasSelected,
  } = useDenuncias({
    columns: (def) => {
      if (!Array.isArray(def)) return def;
      def.push({
        dataField: "deletedDate",
        text: "Fecha de baja",
        sort: false,
        headerStyle: { width: "150px" },
        formatter: Formato.Fecha,
        style: (v) => {
          const r = { textAlign: "center" };
          if (v) {
            r.background = "#ff6464cc";
            r.color = "#fff";
          }
          return r;
        },
      });
      return def;
    },
  });

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
    // ALT  A
    createAction({
      action: "Agrega Denuncia",
      onExecute: () => openForm("A"),
      tarea: "Datos_DenunciaAgrega",
      keys: "a",
      underlineindex: 0,
    }),
    createAction({
      action: `Consulta Denuncia ${desc}`,
      onExecute: () => (denunciasSelected ? openForm("C", denunciasSelected) : null),
      tarea: "Datos_DenunciaConsulta",
      ...(denunciasSelected ? { disabled: false, keys: "o", underlineindex: 1 } : { disabled: true }),
    }),
    createAction({
      action: `Modifica Denuncia ${desc}`,
      onExecute: () => (denunciasSelected ? openForm("M", denunciasSelected) : null),
      tarea: "Datos_DenunciaModifica",
      ...(denunciasSelected ? { disabled: false, keys: "m", underlineindex: 0 } : { disabled: true }),
    }),
    createAction({
      action: `Baja Denuncia ${desc}`,
      onExecute: () => (denunciasSelected ? openForm("B", denunciasSelected) : null),
      tarea: "Datos_DenunciaBaja",
      ...(denunciasSelected ? { disabled: false, keys: "b", underlineindex: 0 } : { disabled: true }),
    }),
  ];

  setDenunciasActions(actions);
}, [denunciasSelected]);
  


  useEffect(() => {
    const { filtro, ...params } = denunciaParams;

    const payload = {
      params,
      pagination: { size: 15 },
      onLoadSelect: onLoadSelectKeepOrFirst,
    };

    if (filtro) params.filterByCPNombre = filtro;

    denunciaRequest("list", payload);
  }, [denunciaRequest, denunciaParams]);

  // ==============================
  // TAB: DENUNCIAS
  // ==============================
  tabs.push({
    header: () => <Tab label="Denuncias" />,
    body: () => (
      <Grid width col gap="10px">
        <Grid gap="inherit">
          <InputMaterial
            label="Filtro por Fecha / Nombre"
            value={denunciaParams.filtro}
            onChange={(filtro) => setDenunciaParams((o) => ({ ...o, filtro }))}
          />
        </Grid>
        {denunciaRender()}
      </Grid>
    ),
    actions: denunciasActions,
  });

  // ==============================
  // ACCIONES DEL MÓDULO
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
        {tabs.map((r) => r.header())}
      </Tabs>
    </Grid>

    {/* Contenido dinámico según tab */}
    <Grid className="contenido">
      {tabs[tab].body()}
    </Grid>

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
            // 🔄 Refrescar la lista luego de confirmar
            const { filtro, ...params } = denunciaParams;
            const payload = {
              params,
              pagination: { size: 15 },
              onLoadSelect: onLoadSelectKeepOrFirst,
            };
            if (filtro) payload.params.filterByCPNombre = filtro;
            denunciaRequest("list", payload);
          }
        }}
      />
    )}
  </Grid>
);
};

export default DenunciasHandler;
