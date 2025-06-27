
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import useRespuestas from "components/pages/app/encuestas/respuestas/useRespuestas";
import Action from "components/helpers/Action";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import KeyPress from "components/keyPress/KeyPress";
import usePreguntas from "components/pages/app/encuestas/preguntas/usePreguntas";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import useEncuestas, { onLoadSelectKeepOrFirst } from "./useEncuestas";
import InputMaterial from "components/ui/Input/InputMaterial";
import FormatearFecha from "components/helpers/FormatearFecha";
import { Padding } from "@mui/icons-material";


// Opciones para el filtro por estado
const opcionesEstadoEncuesta = [ 
  { label: "Todos", value: "todos" },
  { label: "Activa", value: "activa" },
  { label: "Inactiva", value: "inactiva" },
];

const estadoEncuestaDefault = opcionesEstadoEncuesta[0];

const EncuestasHandler = () => {
  const dispatch = useDispatch();
  const tabs = [];
  const [tab, setTab] = useState(0);

  const [estadoTemporal, setEstadoTemporal] = useState(opcionesEstadoEncuesta[0]); // lo que el usuario selecciona
  const [estadoAplicado, setEstadoAplicado] = useState(opcionesEstadoEncuesta[0]); // lo que realmente se aplica al presionar el botón

  const [searchNombre, setSearchNombre] = useState("");
  const [searchFecha, setSearchFecha] = useState("");

  const [encuestaParams, setEncuestaParams] = useState({ filtro: "" });


  const tarea = useTareasUsuario();
  const disableTabAutoridades = !tarea.hasTarea("Datos_SeccionalAutoridades");

  const [estadoSeccionalSelectEncuesta, setEstadoSeccionallSelectEncuesta] = useState({
    loading: null,
    buscar: "",
    error: null,
    options: opcionesEstadoEncuesta,
    selected: estadoEncuestaDefault,
    origen: "",
  });

  const [encuestaParamsSend, setEncuestaParamsSend] = useState({});

const {
  render: seccionalesTab,
  request: seccionalChanger,
  selected: encuestaSelected,
} = useEncuestas({
  // filtroEstado: (data) => {
  //   const filtro = estadoAplicado?.value;
  //   const hoy = new Date();

  //   return data.filter((encuesta) => {
  //     const fechaFin = encuesta.fechaFinalizacion ? new Date(encuesta.fechaFinalizacion) : null;
  //     const deleted = !!encuesta.deletedDate;

  //     if (filtro === "todos") return true;
  //     if (filtro === "activa") {
  //       if (deleted) return false;
  //       if (!fechaFin) return true;
  //       return fechaFin > hoy;
  //     }
  //     if (filtro === "inactiva") return deleted;

  //     return true;
  //   });
  // },
  //Esta función selecciona la encuesta recién creada
  
filtroEstado: (data) => {
  const filtro = estadoAplicado?.value;
  const hoy = new Date();
  const texto = encuestaParams.filtro?.toLowerCase() || "";

  return data.filter((encuesta) => {
    const fechaFin = encuesta.fechaFinalizacion ? new Date(encuesta.fechaFinalizacion) : null;
    const fechaInicio = encuesta.fecha?.toLowerCase?.() || ""; // puede venir en string o Date
    const tema = encuesta.tema?.toLowerCase() || "";
    const deleted = !!encuesta.deletedDate;

    // Estado
    if (filtro === "activa") {
      if (deleted) return false;
      if (!fechaFin || fechaFin <= hoy) return false;
    }
    if (filtro === "inactiva" && !deleted) return false;

    // Texto (fecha o tema)
    return (
      !texto ||
      tema.includes(texto) ||
      FormatearFecha(fechaInicio).toLowerCase().includes(texto)
    );
  });
},



  onEditComplete: ({ request, response }) => {
    if (request === "A" && response?.id) {
      seccionalChanger("list", {
        pagination: { index: 1, size: 10 },
        onLoadSelect: () => response, // <- selecciona la encuesta creada
      });
    }
  }
});


  const [encuestaActions, setEncuestaActions] = useState([]);

  useEffect(() => {
    const createAction = ({ action, request, ...x }) =>
      new Action({
        name: action,
        onExecute: () => seccionalChanger("selected", { request, action }),
        combination: "AltKey",
        ...x,
      });

    const actions = [
      createAction({ action: `Agrega Encuesta`, request: "A", tarea: "Datos_EncuestaAgrega", keys: "a", underlineindex: 0 }),
    ];

    const desc = encuestaSelected?.tema;

    actions.push(
      createAction({
        action: `Consulta Encuesta ${desc}`,
        request: "C",
        tarea: "Datos_EncuestaConsulta",
        ...(encuestaSelected?.id ? { disabled: false, keys: "o", underlineindex: 1 } : { disabled: true }),
      }),
      createAction({
        action: `Modifica Encuesta ${desc}`,
        request: "M",
        tarea: "Datos_EncuestaModifica",
        ...(encuestaSelected?.deletedDate || !encuestaSelected?.id
          ? { disabled: true }
          : { disabled: false, keys: "m", underlineindex: 0 }),
      }),
      createAction({
        action: `Baja Encuesta ${desc}`,
        request: "B",
        tarea: "Datos_EncuestaBaja",
        ...(encuestaSelected?.deletedDate || !encuestaSelected?.id
          ? { disabled: true }
          : { disabled: false, keys: "b", underlineindex: 0 }),
      })
    );

    setEncuestaActions(actions);
  }, [seccionalChanger, encuestaSelected]);

  tabs.push({
    header: () => <Tab label="Encuestas" />,
    body: () => (
      <Grid col gap="inherit">
        <Grid width gap="inherit">{seccionalesTab()}</Grid>
      </Grid>
    ),
    actions: encuestaActions,
  });

  useEffect(() => {
    seccionalChanger("list", {
      params: encuestaParamsSend,
      pagination: { index: 1, size: 10 },
      onLoadSelect: onLoadSelectKeepOrFirst,
    });
  }, [seccionalChanger, encuestaParamsSend]);

  // ==============================
  // TAB: PREGUNTAS
  // ==============================
  const [preguntasTab, preguntasChanger, preguntasSelected] = usePreguntas();
  const [preguntasActions, setPreguntasActions] = useState([]);

  useEffect(() => {
    const secc = encuestaSelected?.tema ?? "";
    const actions = [];

    if (!secc) return setPreguntasActions([]);

    const seccDesc = `para Encuesta ${secc}`;
    const createAction = ({ action, request, ...x }) =>
      new Action({
        name: action,
        onExecute: () =>
          preguntasChanger("selected", {
            request,
            action,
            record: { seccionalId: encuestaSelected?.id },
          }),
        combination: "AltKey",
        ...x,
      });

    actions.push(
      createAction({ action: `Agrega Pregunta ${seccDesc}`, request: "A", tarea: "Datos_SeccionalAutoridadesAgrega", keys: "a" }),
      createAction({ action: `Modificar Pregunta ${seccDesc}`, request: "M", tarea: "Datos_SeccionalAutoridadesModificar", keys: "m" }),
      createAction({ action: `Bajar Pregunta ${seccDesc}`, request: "B", tarea: "Datos_SeccionalAutoridadesBajar", keys: "b" })
    );

    setPreguntasActions(actions);
  }, [preguntasChanger, preguntasSelected, encuestaSelected]);

  useEffect(() => {
    preguntasChanger("list", {
      clear: !encuestaSelected?.id,
      data: encuestaSelected?.preguntas,
      params: { id: encuestaSelected?.id },
    });
  }, [encuestaSelected, preguntasChanger]);

  tabs.push({
    header: () => <Tab label="Preguntas" disabled={!encuestaSelected?.id || encuestaSelected.deletedDate || disableTabAutoridades} />,
    body: preguntasTab,
    actions: preguntasActions,
  });

  // ==============================
  // TAB: RESPUESTAS
  // ==============================
  const [respuestasTab, respuestasChanger, respuestasSelected] = useRespuestas();
  const [respuestasActions, setRespuestasActions] = useState([]);

  useEffect(() => {
  if (!encuestaSelected?.id) return;

  respuestasChanger("list", {
    clear: !preguntasSelected?.id,
    data: preguntasSelected,
    params: {
      encuestaId: encuestaSelected.id, // clave para que useRespuestas cargue las preguntas correctas
      encuestaPreguntaId: preguntasSelected?.encuestaId,
      encuestaPreguntaId2: preguntasSelected?.id,
    },
    respuestas: Array.isArray(preguntasSelected?.respuestas)
      ? preguntasSelected.respuestas
      : [],
  });
}, [preguntasSelected, encuestaSelected]); 


  tabs.push({
    header: () => <Tab label="Respuestas" disabled={!encuestaSelected?.id || encuestaSelected.deletedDate || disableTabAutoridades} />,
    body: respuestasTab,
    actions: respuestasActions,
  });

  // ==============================
  // MODULO + ACCIONES
  // ==============================
  const acciones = tabs[tab].actions;
  useEffect(() => {
    dispatch(handleModuloSeleccionar({ nombre: "Seccionales", acciones }));
  }, [dispatch, acciones]);

  return (
    <Grid full col gap="10px">
      <Grid className="titulo">
        <h1>ENCUESTA</h1>
      </Grid>

      {encuestaSelected?.tema && (
        //estilo para tener margen izquierdo
        <Grid style={{ marginLeft: '16px' }}>
          <Grid className="subtitulo" style={{ fontWeight: 'bold', fontSize: '16px', color: '#003b71' }}>
            Encuesta:  {encuestaSelected.tema.toUpperCase()}
          </Grid>
        </Grid>
      )}

      <Grid className="tabs">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {tabs.map((r) => r.header())}
        </Tabs>
      </Grid>
      {/* {tab === 0 && (
      <Grid grid="auto / 1fr 200px 200px" gap="inherit" align="center">
      <SearchSelectMaterial
        label="Estado de Encuesta"
        value={estadoTemporal}
        onChange={(selected = {}) => {
          setEstadoTemporal(selected);
        }}
        options={opcionesEstadoEncuesta}
      />


      <Button
        variant="contained"
        onClick={() => setEstadoAplicado(estadoTemporal)}
        disabled={estadoTemporal.value === estadoAplicado.value}
      >
        Aplicar filtro
      </Button>

        <Button
        className="botonAzul"
        onClick={() => {
          setEstadoTemporal(opcionesEstadoEncuesta[0]);   // Resetea el select visual
          setEstadoAplicado(opcionesEstadoEncuesta[0]);   // Aplica el filtro 'Todos'
        }}
      >
        Limpia filtro
      </Button>

      </Grid>
      )} */}

  {tab === 0 && (
  <Grid grid="auto / 1fr 200px 200px" gap="10px" align="center">
    <InputMaterial
      label="Filtro por Tema / Fecha"
      value={encuestaParams.filtro}
      onChange={(filtro) => setEncuestaParams((o) => ({ ...o, filtro }))}
    />

    <SearchSelectMaterial
      label="Estado"
      value={estadoTemporal}
      onChange={(selected = {}) => setEstadoTemporal(selected)}
      options={opcionesEstadoEncuesta}
    />

    <Button
      variant="contained"
      onClick={() => setEstadoAplicado(estadoTemporal)}
      disabled={estadoTemporal.value === estadoAplicado.value}
    >
      Aplicar filtro
    </Button>
  </Grid>
)}



      <Grid className="contenido" col gap="10px">
        {tabs.map(({ body }, i) => (
          <Grid col gap="inherit" hidden={i !== tab} key={i}>
            {body()}
          </Grid>
        ))}
      </Grid>

      <KeyPress items={acciones} />
    </Grid>
  );
};

export default EncuestasHandler;
