
import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import useMetrica from "../Metricas/useMetrica";
import AuthContext from "store/authContext";

const MetricaHandler = () => {
  const dispatch = useDispatch();
  const { usuario } = useContext(AuthContext);

  const tabs = [];
  const [tab, setTab] = useState(0);

  // ==============================
  // API Queries
  // ==============================
  const pushQuery = useQueryQueue((action) => {
    if (action === "GetMetrica") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/AppMetricas",
        },
      };
    }
    return null;
  });

  // ==============================
  // Estado: Metrica
  // ==============================
  const [metrica, setMetrica] = useState({
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
    if (!metrica.loading) return;
    const changes = { loading: null, data: [], error: null, options: [], selected: null };

    pushQuery({
      action: "GetMetrica",
      params: metrica.params,
      onOk: async (data) => {
        if (!Array.isArray(data)) return console.error("Se esperaba un arreglo.", { data });
        changes.data = data
          .sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
          .map((r) => ({ label: r.nombre, value: r.id }));
        changes.options = changes.data;
        changes.selected = changes.data.find(({ value }) => value === metrica.selected?.value) ?? metrica.selected;
      },
      onError: async (error) => (changes.error = error),
      onFinally: async () => setMetrica((o) => ({ ...o, ...changes })),
    });
  }, [pushQuery, metrica]);

  useEffect(() => {
    if (metrica.loading || metrica.buscar === metrica.buscado) return;
    const options = metrica.data.filter((r) =>
      metrica.buscar !== "" ? r.label.toLowerCase().includes(metrica.buscar.toLowerCase()) : true
    );
    setMetrica((o) => ({ ...o, options, buscado: o.buscar }));
  }, [metrica]);

  // ==============================
  // Params para filtrado y carga
  // ==============================
  const [metricaParams, setMetricaParams] = useState({
    metricaId: metrica.selected?.value,
    filtro: "",
    sortBy: "+nombre",
  });

  useEffect(() => {
    if (metrica.loading) return;
    const metricaId = metrica.selected?.value;
    if (metricaId === metricaParams.metricaId) return;
    setMetricaParams((o) => ({ ...o, metricaId }));
  }, [metrica]);

  const {
    render: metricaRender,
    request: metricaRequest,
    selected: metricaSelected,
  } = useMetrica({
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
            r.color = "#FFF";
          }
          return r;
        },
      });
      return def;
    },
  });

  useEffect(() => {
    const { metricaId, filtro, ...params } = metricaParams;
    const payload = {
      params,
      pagination: { size: 10 },
    };
    if (metricaId != null) params.metricaId = metricaId;
    if (filtro) params.filterByCPNombre = filtro;

    metricaRequest("list", payload);
  }, [metricaRequest, metricaParams]);

  // ==============================
  // TAB
  // ==============================
  tabs.push({
    header: () => <Tab label="Metrica" />,
    body: () => (
      <Grid width col gap="10px">
        {metricaRender()}
      </Grid>
    ),
  });

  // ==============================
  // ACCIONES DEL MÓDULO
  // ==============================
  const acciones = tabs[tab].actions;
  useEffect(() => {
    dispatch(handleModuloSeleccionar({ nombre: "Metrica", acciones }));
  }, [dispatch, acciones]);

  return (
    <Grid full col>
      <Grid className="titulo">
        <h1>Metrica</h1>
      </Grid>
      <Grid col className="tabs">
        <text>{metricaSelected?.nombre ?? <>&nbsp;</>}</text>
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

export default MetricaHandler;