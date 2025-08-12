
import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";

import { Tabs, Tab } from "@mui/material";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import useDenuncias, { onLoadSelectKeepOrFirst } from "../Denuncias/useDenuncias";
import AuthContext from "store/authContext";

const DenunciasHandler = () => {
  const dispatch = useDispatch();
  const { usuario } = useContext(AuthContext);

  const tabs = [];
  const [tab, setTab] = useState(0);

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
    dispatch(handleModuloSeleccionar({ nombre: "Localidades", acciones }));
  }, [dispatch, acciones]);

  // ==============================
  // RENDER
  // ==============================
  return (
    <Grid full col>
      <Grid className="titulo">
        <h1>DENUNCIAS</h1>
      </Grid>

      <Grid col className="tabs">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {tabs.map((r) => r.header())}
        </Tabs>
      </Grid>

      <Grid className="contenido">
        {tabs[tab].body()}
      </Grid>

      <KeyPress items={acciones} />
    </Grid>
  );
};

export default DenunciasHandler;
