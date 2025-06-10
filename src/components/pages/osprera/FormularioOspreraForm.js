import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, {
  CUITMask,
  DNIMask,
} from "components/ui/Input/InputMaterial";
import CheckboxMaterial from "components/ui/Checkbox/CheckboxMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import useQueryState from "components/hooks/useQueryState";
import Documentacion from "components/documentacion/Documentacion";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import download from "downloadjs";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Formato from "components/helpers/Formato";
import SearchSelectMaterial, {
  mapOptions,
  includeSearch,
} from "components/ui/Select/SearchSelectMaterial";
import moment from "moment/moment";
import useSolicitudAfiliacion from "../consultas/solicitudAfiliacion/SolicitudAfiliacion";
import { useSelector } from "react-redux";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};
const onValidateDef = (confirm = false) => {};

/**
 * Proceso a ejecutar posterior carga
 * @param {object} changes datos posterior carga
 * @param {array} changes.data datos obtenidos en la carga
 * @param {object} changes.error error durante la carga
 */

//#region sexoSelect Options
const sexoSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion sexoSelect Options

//#region tipoDocumentoSelect Options
const tipoDocumentoSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion tipoDocumentoSelect Options

//#region seccionalSelect Options
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion seccionalSelect Options

//#region gestionRubro Options
const gestionRubroSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion gestionRubro Options

//#region gestionSubRubro Options
const gestionSubRubroSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion gestionSubRubro Options

//#region gestionEstado Options
const gestionEstadoSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion gestionEstado Options

//#region gestionSituacion Options
const gestionSituacionSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion gestionSituacion Options

//#region gestionAreaOsprera Options
const gestionAreaOspreraSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion gestionAreaOsprera Options

const FormularioOspreraForm = ({
  data = {},
  title = "",
  disabled = {},
  hide = {},
  errors = {},
  onChange = onChangeDef,
  onClose = onCloseDef,
  onValidate = onValidateDef,
  loading = {},
  request = "",
}) => {
  data ??= {};
  request ??= {};

  hide ??= {};
  errors ??= {};
  onChange ??= onChangeDef;
  onClose ??= onCloseDef;
  onValidate ??= onValidateDef;

  const [selectedTab, setSelectedTab] = useState(0);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);
  const [disabledItems, setDisabledItems] = useState(disabled);
  const [titular, setTitular] = useState({
    existeEnUATRE: null,
    existeEnOSPRERA: null,
    existeEnAFIP: null,
    confirmado: request == "A" ? false : true,
    DDJJEmpresa: null,
    cuil: "",
    tipoDocumentoId: 0,
    fechaNacimiento: "",
    sexoId: 0,
  });
  const [documentacionList, setDocumentacionList] = useState([]);
  const { request: solicitudAfiliacion } = useSolicitudAfiliacion();
  //#region Alert
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTexto, setDialogTexto] = useState("");
  const [modalPreguntas, setModalPreguntas] = useState({
    visible: false,
    texto: "",
    respuesta: "",
  });
  const [modalDocumentacion, setModalDocumentacion] = useState({
    visible: false,
    documentacionOK: false,
  });
  const usuarioLogueado = useSelector((state) => state.usuarioLogueado);

  //#endregion

  // console.log("data,",data);
  //#region EMAIL
  //Se debe procesar el(envio de email)
  const sendEnviarEmailHandler = async () => {
    const adjuntos = (documentacionList || []).map((r) => ({
      fileName: r.nombreArchivo,
      contentType: "application/octet-stream", // o usa el real si lo tienes
      base64Data: r.archivo,
    }));

    pushQuery({
      action: "EnviarCorreo",
      config: {
        body: {
          to: [data?.direccionesEmailDestino] ?? [],
          attachments: adjuntos,
          cuerpo:
            `<p>OSPRERA<br></br>DELEGACION<br></br><br></br>` +
            `En representación del Afiliado <strong>${data?.apellidoTitular} ${
              data?.nombreTitular
            }</strong>, con DNI Nº <strong>${
              data?.dniPaciente ?? ""
            }</strong>, Afiliado Nº <strong>${
              data?.cuitTitular ?? ""
            }</strong> ` +
            `se solicita <strong>${gestionRubroSelect?.selected?.label}</strong> sobre <strong>${gestionSubRubroSelect?.selected?.label}</strong> conforme lo que se detalla a continuación;<br></br>` +
            `<strong>${data?.texto}</strong>, adjuntando la documentación respectiva en su caso.<br><br/>` +
            `Tipo de Adjuntos: <strong>${
              documentacionList.length === 0
                ? "Sin archivos adjuntos"
                : documentacionList
                    .map((a) => a.refTipoDocumentacionDescripcion)
                    .join("\ ")
            }</strong><br></br>` +
            `Se requiere que se brinde la misma a la mayor brevedad posible o se me indique al mail o teléfono que se detalla al pie los pasos a seguir al respecto.<br><br/>` +
            `La presente se origina por la imposibilidad del Afiliado de la referencia de realizarla por sus propios medios.<br><br/>` +
            `Muchas gracias.<br></br>MAIL: <strong>${usuarioLogueado.email}</strong><br></br>TELEFONO: <strong>${usuarioLogueado.phoneNumber}</strong></p>`,
        },
      },
      onOk: async (ok) => {
        setDialogTexto("Se ha enviado un email a la dirección ingresada.");
        setOpenDialog(true);
      },
      onError: async (error) => {
        setDialogTexto(error?.message || "Error al enviar el email.");
        setOpenDialog(true);
      },
      onFinally: async () => {
        loading = false;
        //onClose(true)
      },
    });
  };
  //#endregion

  //#region DISABLED 0303
  useEffect(() => {
    const changes = {};
    if (titular?.confirmado) {
      changes.cuitTitular = true;
      changes.apellidoTitular = true;
      changes.nombreTitular = true;
      if (request == "A") {
        changes.elPacienteEsTitular = false;
        changes.tipoDocumentoId = false;
        changes.dniPaciente = false;
        changes.apellidoPaciente = false;
        changes.nombrePaciente = false;

        changes.fechaNacimiento = false;
        changes.sexo = false;

        changes.telefonoContacto = false;
        changes.telefonoContacto2 = false;
        changes.emailContacto = false;
        changes.emailContacto2 = false;

        changes.titularPaciente = false;
        changes.medioGestion = false;
        changes.telefono = false;
        changes.resultadoLlamada = false;
        changes.direccionesEmailDestino = false;
        changes.texto = false;
        changes.gestionRubro = false;
        changes.gestionSubRubro = false;
        // changes.gestionEstado = false;
        changes.gestionSituacion = false;
        changes.gestionAreaOsprera = false;
      }
    }

    if (titular.existeEnUATRE) {
      changes.apellidoTitular = true;
      changes.nombreTitular = true;
    }

    setDisabledItems((o) => ({ ...o, ...changes }));
  }, [titular]);
  //#endregion

  const onDownloadSolicitudAfiliacion = (conDatos) => {
    // console.log("onDownloadSolicitudAfiliacion", conDatos);
    const match = data?.cuitTitular?.toString()?.match(/^(\d{2})(\d{8})(\d)$/);
    const dataFormulario = {
      "seccional.codigo": seccionalSelect?.selectedAditionalData?.codigo,
      ...Object.fromEntries(
        `${data?.fecha || ""}`
          .split("-")
          .map((v, i) => [`fecha.${["anio", "mes", "dia"][i]}`, v])
      ),
      ...Object.fromEntries(
        `${Formato.Cuit(data?.cuitTitular)}`
          .split("-")
          .map((v, i) => [
            `trabajador.cuil.${["tipo", "id", "verificador"][i]}`,
            v,
          ])
      ),
      "trabajador.documento": ["DNI", match[2]].join(" "),
      "trabajador.nacionalidad": "",
      "trabajador.apellidos": data?.apellidoTitular,
      "trabajador.nombres": data?.nombreTitular,
      "trabajador.nacimiento.fecha": Formato.Fecha(data?.fechaNacimiento),
      "trabajador.estado_civil": "", //estadoCivilSelect?.selected?.label,
      "trabajador.sexo": sexoSelect?.selected?.label,
      "trabajador.domicilio": data.domicilio,
      "trabajador.localidad": data.localidad,
      "trabajador.provincia": data.provincia,
      "trabajador.oficio": "", //oficioSelect?.selected?.label,
      "trabajador.actividad": "", //data.actividad,
      "trabajador.telefono": data?.telefonoContacto,
      "trabajador.correo": data?.emailContacto,
      "trabajador.cuil": data?.cuitTitular,
    };
    //if (request !== "A") return;
    conDatos
      ? solicitudAfiliacion({
          data: dataFormulario,
          onLoad: (base64) => download(base64, `SolicitudAfiliacion.pdf`),
        })
      : solicitudAfiliacion({
          onLoad: (base64) => download(base64, `SolicitudAfiliacion.pdf`),
        });
  };

  const { setState: setDocumentosQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Comunes",
        endpoint: `/DocumentacionEntidad/GetBySpec?EntidadId=${data.id}&EntidadTipo=O`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  //#region Controlo cada vez que se modifican los datos del titular
  useEffect(() => {
    if (data?.elPacienteEsTitular) {
      handleDatosPaciente(true, titular);
    }
  }, [titular, data?.elPacienteEsTitular]);
  //#endregion

  //#region Carga inicial Documentacion
  useEffect(() => {
    setDocumentosQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = [];
        if (Array.isArray(ok)) data = ok;
        setDocumentacionList(data ?? []);
      },
    }));
  }, [setDocumentosQuery]);
  //#endregion Carga inicial Documentacion

  const { setState: setTiposDocumentosQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Afiliaciones",
        endpoint: `/TipoDocumento`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  const { setState: setSexosQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Afiliaciones",
        endpoint: `/Sexo`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  const { setState: setSeccionalesQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Afiliaciones",
        endpoint: `/Seccional?SoloActivos=true&verSeccionalesLocalidades=false`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  const { setState: setGestionRubroQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Afiliaciones",
        endpoint: `/GestionesRubro`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  //   const { setState: setGestionSubRubroQuery } = useQueryState(
  //     (params) => {
  //       console.log("params", params);
  //       return {
  //         config: {
  //           baseURL: "Afiliaciones",
  //           endpoint: `/GestionesSubRubroByRubro`,
  //           method: "GET",
  //         },
  //       };
  //     },
  //     { query: { config: { errorType: "response" } } }
  //   );

  const { setState: setGestionEstadoQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Afiliaciones",
        endpoint: `/GestionesEstado`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  //   const { setState: setGestionSituacionQuery } = useQueryState(
  //     () => ({
  //       config: {
  //         baseURL: "Afiliaciones",
  //         endpoint: `/GestionesSituacion`,
  //         method: "GET",
  //       },
  //     }),
  //     { query: { config: { errorType: "response" } } }
  //   );

  const { setState: setGestionAreaOspreraQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Afiliaciones",
        endpoint: `/GestionesAreaOsprera`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  //#region Handle tab change
  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };
  //#endregion

  //#region consultas API
  const pushQuery = useQueryQueue((action, params) => {
    switch (action) {
      case "GetAfiliado": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/Afiliado/GetAfiliadoByCUIL`,
            method: "GET",
          },
        };
      }
      case "GetCIIUs": {
        return {
          config: {
            baseURL: "Comunes",
            endpoint: "/RefCIIU",
            method: "GET",
          },
        };
      }
      case "GetDDJJ": {
        return {
          config: {
            baseURL: "DDJJ",
            endpoint: `/DDJJUatre/GetCUILUltimoAnio`,
            method: "GET",
          },
        };
      }

      case "ConsultaAFIP": {
        return {
          config: {
            baseURL: "Comunes",
            endpoint: "/AFIPConsulta",
            method: "GET",
          },
        };
      }

      case "ConsultaOsprera": {
        return {
          config: {
            baseURL: "Comunes",
            endpoint: "/PadronOsprera/GetPadronOspreraSpecs",
            method: "GET",
          },
        };
      }

      case "EnviarCorreo": {
        return {
          config: {
            endpoint: `/Usuario/enviarCorreoConAdjuntoBase64`,
            baseURL: "Seguridad",
            method: "POST",
            headers: {
              Accept: "*/*",
            },
            /*body: JSON.stringify({
							to: to,
							attachments: attachments,
						}),*/
          },
        };
      }

      case "GestionesSubRubroByRubro": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/GestionesSubRubro`,
            method: "GET",
          },
        };
      }

      case "GestionesSituacionByEstado": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/GestionesSituacion`,
            method: "GET",
          },
        };
      }

      default:
        return null;
    }
  });
  //#endregion

  //#region select tipodocumento
  const [tipoDocumentoSelect, setTipoDocumentoSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setTipoDocumentoSelect((o) => ({
      ...o,
      options: tipoDocumentoSelectOptions(o),
    }));
  }, [tipoDocumentoSelect.buscar, tipoDocumentoSelect.data]);

  useEffect(() => {
    setTipoDocumentoSelect((o) => ({
      ...o,
      selected: {
        value: data.tipoDocumentoId,
        label: tipoDocumentoSelect.options.find(
          (r) => r.value === data.tipoDocumentoId
        )?.label,
      },
    }));
  }, [tipoDocumentoSelect.options, data.tipoDocumentoId]);
  //#endregion select sexo

  //Carga inicial select tipo documento
  useEffect(() => {
    setTiposDocumentosQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = [];
        if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
        setTipoDocumentoSelect((o) => ({
          ...o,
          loading: null,
          data,
          error: error?.toString(),
        }));
      },
    }));
  }, [setTiposDocumentosQuery]);
  //#endregion Carga inicial select tipo documento

  //#region select sexo
  const [sexoSelect, setSexoSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setSexoSelect((o) => ({
      ...o,
      options: sexoSelectOptions(o),
    }));
  }, [sexoSelect.buscar, sexoSelect.data]);
  //select sexo

  // Buscador
  useEffect(() => {
    setSexoSelect((o) => ({
      ...o,
      selected: {
        value: data.sexoId,
        label: sexoSelect.options.find((r) => r.value === data.sexoId)?.label,
      },
    }));
  }, [sexoSelect.options]);
  //#endregion select sexo

  //Carga inicial select sexo
  useEffect(() => {
    setSexosQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = [];
        if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
        setSexoSelect((o) => ({
          ...o,
          loading: null,
          data,
          error: error?.toString(),
        }));
      },
    }));
  }, [setSexosQuery]);
  //#endregion Carga inicial select sexo

  //#region select seccional
  const [seccionalSelect, setSeccionalSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    selectedAditionalData: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setSeccionalSelect((o) => ({
      ...o,
      options: seccionalSelectOptions(o),
      selected: { value: data.seccionalId, label: data.seccionalId },
    }));
  }, [seccionalSelect.buscar, seccionalSelect.data]);
  //#endregion select seccionales

  // Buscador
  useEffect(() => {
    setSeccionalSelect((o) => ({
      ...o,
      selected: {
        value: data.seccionalId,
        label: seccionalSelect.options.find((r) => r.value === data.seccionalId)
          ?.label,
      },
      selectedAditionalData: seccionalSelect?.options.find(
        (r) => r.value === data?.seccionalId
      )?.record,
    }));
  }, [seccionalSelect.options]);
  //#endregion select seccionales

  //#region Carga inicial select seccionales
  useEffect(() => {
    setSeccionalesQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = [];
        if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
        setSeccionalSelect((o) => ({
          ...o,
          loading: null,
          data,
          error: error?.toString(),
        }));
      },
    }));
  }, [setSeccionalesQuery]);
  //#endregion Carga inicial select seccionales

  //#region select GestionesRubro
  const [gestionRubroSelect, setGestionRubroSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setGestionRubroSelect((o) => ({
      ...o,
      options: gestionRubroSelectOptions(o),
    }));
  }, [gestionRubroSelect.buscar, gestionRubroSelect.data]);

  // Buscador
  useEffect(() => {
    setGestionRubroSelect((o) => ({
      ...o,
      selected: {
        value: data.id,
        label: gestionRubroSelect.options.find((r) => r.value === data.id)
          ?.label,
      },
    }));
  }, [gestionRubroSelect.options]);

  //Carga inicial select GestionRubro
  useEffect(() => {
    setGestionRubroQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = [];
        if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
        setGestionRubroSelect((o) => ({
          ...o,
          loading: null,
          data,
          error: error?.toString(),
        }));
      },
    }));
  }, [setGestionRubroQuery]);
  //#endregion select GestionesRubro

  //#region select GestionesSubRubro
  const [gestionSubRubroSelect, setGestionSubRubroSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setGestionSubRubroSelect((o) => ({
      ...o,
      options: gestionSubRubroSelectOptions(o),
    }));
  }, [gestionSubRubroSelect.buscar, gestionSubRubroSelect.data]);

  // Buscador
  useEffect(() => {
    setGestionSubRubroSelect((o) => ({
      ...o,
      selected: {
        value: data.gestionSubRubroId,
        label: gestionSubRubroSelect.options.find(
          (r) => r.value === data.gestionSubRubroId
        )?.label,
      },
    }));
  }, [gestionSubRubroSelect.options]);

  //Carga inicial select GestionSubRubro
  useEffect(() => {
    if (!gestionRubroSelect.selected?.value) return;   
    pushQuery({
      action: "GestionesSubRubroByRubro",
      params: { GestionRubroId: gestionRubroSelect.selected?.value },
      onOk: async (ok) => {
        let data = [];
        if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
        setGestionSubRubroSelect((o) => ({
          ...o,
          loading: null,
          data,
          error: null,
        }));
      },
    });
  }, [gestionRubroSelect?.selected?.value]);
  //#endregion select GestionesSubRubro

  //#region select GestionesEstado
  const [gestionEstadoSelect, setGestionEstadoSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setGestionEstadoSelect((o) => ({
      ...o,
      options: gestionEstadoSelectOptions(o),
    }));
  }, [gestionEstadoSelect.buscar, gestionEstadoSelect.data]);

  // Buscador
  useEffect(() => {
    setGestionEstadoSelect((o) => ({
      ...o,
      selected: {
        value: data.gestionEstadoId,
        label: gestionEstadoSelect.options.find(
          (r) => r.value === data.gestionEstadoId
        )?.label,
      },
    }));
  }, [gestionEstadoSelect.options]);
  //Carga inicial select GestionEstado
  useEffect(() => {
    setGestionEstadoQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let dataRequest = [];
        if (Array.isArray(ok)) dataRequest = ok.filter((r) => r.id !== 99999);
        setGestionEstadoSelect((o) => ({
          ...o,
          loading: null,
          data: dataRequest,
          error: error?.toString(),
        }));
        if (request === "A") {
          onChange({
            gestionEstadoId: dataRequest[0]?.id,
          });
        } else {
        }
      },
    }));
  }, [setGestionEstadoQuery]);
  //#endregion select GestionesEstado

  //#region select GestionesSituacion
  const [gestionSituacionSelect, setGestionSituacionSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setGestionSituacionSelect((o) => ({
      ...o,
      options: gestionSituacionSelectOptions(o),
    }));
  }, [gestionSituacionSelect.buscar, gestionSituacionSelect.data]);

  // Buscador
  useEffect(() => {
    setGestionSituacionSelect((o) => ({
      ...o,
      selected: {
        value: data.gestionSituacionId,
        label: gestionSituacionSelect.options.find(
          (r) => r.value === data.gestionSituacionId
        )?.label,
      },
    }));
  }, [gestionSituacionSelect.options]);
  //Carga inicial select GestionSituacion
  useEffect(() => {
    if (!gestionEstadoSelect.selected?.value) return;
    
    pushQuery({
      action: "GestionesSituacionByEstado",
      params: { GestionEstadoId: gestionEstadoSelect.selected?.value },
      onOk: async (ok) => {
        let data = [];
        if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
        setGestionSituacionSelect((o) => ({
          ...o,
          loading: null,
          data,
          error: null,
        }));
      },
    });
  }, [gestionEstadoSelect.selected?.value]);
  //#endregion select GestionesSituacion

  //#region select GestionesAreaOsprera
  const [gestionAreaOspreraSelect, setGestionAreaOspreraSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setGestionAreaOspreraSelect((o) => ({
      ...o,
      options: gestionAreaOspreraSelectOptions(o),
    }));
  }, [gestionAreaOspreraSelect.buscar, gestionAreaOspreraSelect.data]);

  // Buscador
  useEffect(() => {
    setGestionAreaOspreraSelect((o) => ({
      ...o,
      selected: {
        value: data.gestionAreaOspreraId,
        label: gestionAreaOspreraSelect.options.find(
          (r) => r.value === data.gestionAreaOspreraId
        )?.label,
      },
    }));
  }, [gestionAreaOspreraSelect.options]);

  //Carga inicial select GestionAreaOsprera
  useEffect(() => {
    setGestionAreaOspreraQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = [];
        if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
        setGestionAreaOspreraSelect((o) => ({
          ...o,
          loading: null,
          data,
          error: error?.toString(),
        }));
      },
    }));
  }, [setGestionAreaOspreraQuery]);
  //#endregion select GestionesAreaOsprera

  useEffect(() => {
    const changes = {};
    if (data.telefono == null) changes.telefono = "+54 9";
    if (Object.entries(changes).length === 0) return;
    onChange(changes);
  }, [onChange, data]);

  const [validacionCUIT, setValidacionCUIT] = useState({
    loading: false,
    validado: "",
    datoAFIP: "",
  });

  const confirmaTitularHandler = () => {
    setTitular((o) => ({ ...o, confirmado: true }));
  };

  const validarCUITHandler = async () => {
    const changes = {
      loading: true,
      validado: "",
      datoAFIP: "",
    };

    setTitular((o) => ({
      ...o,
      existeEnOSPRERA: false,
      existeEnUATRE: false,
      existeEnAFIP: false,
      cuil: "",
      tipoDocumentoId: 0,
      sexoId: 0,
      fechaNacimiento: null,
    }));

    setValidacionCUIT((o) => ({ ...o, ...changes }));

    errors.cuitTitular = "";
    onChange({
      existe: false,
      apellidoTitular: null,
      nombreTitular: null,
      telefono: null,
      direccionesEmailDestino: null,
    });

    const validaOSPRERA = () => {
      const match = data?.cuitTitular
        ?.toString()
        ?.match(/^(\d{2})(\d{8})(\d)$/);
      pushQuery({
        action: "ConsultaOsprera",
        params: { documento: match[2] },

        onOk: async (ok) => {
          changes.validado = "Titular en padrón OSPRERA";
          changes.datoAFIP = `Dato AFIP:  ${ok.nombre}`;
          const [apellidoTitularDes, nombreTitularDes] = ok.nombre.split(" ");
          onChange({
            existe: true,
            //cuitTitular: ok.cuit,
            apellidoTitular: apellidoTitularDes,
            nombreTitular: nombreTitularDes,
            tipoDocumentoId: tipoDocumentoSelect.options.find(
              (r) => r.label == "DNI"
            )?.value,
            //tipoDocumento: puedo hacer un find en le tipoDocOptions
          });
          if (ok.sexo == "F") {
            onChange({
              sexoId: sexoSelect.options.find((s) => s.label == "Femenino")
                ?.value,
            });
          }

          if (ok.sexo == "M") {
            onChange({
              sexoId: sexoSelect.options.find((s) => s.label == "Masculino")
                ?.value,
            });
          }

          setTitular((o) => ({
            ...o,
            existeEnOSPRERA: true,
            cuil: data?.cuitTitular,
            tipoDocumentoId: 0,
            sexoId: 0,
            fechaNacimiento: ok?.fechaNacimiento,
          }));
        },
        // onError: async (error) => validaAFIP(),
        onFinally: async () => {
          changes.loading = false;
          setValidacionCUIT((o) => ({ ...o, ...changes }));
        },
      });
    };

    const validaAFIP = () => {
      pushQuery({
        action: "ConsultaAFIP",
        params: { cuit: data.cuitTitular, VerificarHistorico: false },

        onOk: async (ok) => {
          // console.log("ConsultaAFIP", ok);
          changes.validado = "Titular datos en AFIP";
          changes.datoAFIP = `Dato AFIP:  ${ok.domicilios[0]?.codigoPostal} ${ok.domicilios[0]?.localidad}`;
          const domicilioReal = ok.domicilios.find(
            (d) => d.tipoDomicilio == "LEGAL/REAL"
          );
          onChange({
            existe: true,
            cuitTitular: ok.cuit,
            apellidoTitular: ok.apellido,
            nombreTitular: ok.nombre,
            domicilio: domicilioReal?.direccion ?? "",
            localidad: domicilioReal?.localidad ?? "",
            provincia: domicilioReal?.descripcionProvincia ?? "",
            actividad: ok.descripcionActividadPrincipal ?? ""
            //tipoDocumento: puedo hacer un find en le tipoDocOptions
          });

          if (ok.tipoDocumento == "DNI") {
            onChange({
              tipoDocumentoId: tipoDocumentoSelect.options.find(
                (r) => r.label == "DNI"
              )?.value,
            });
          }

          setTitular((o) => ({
            ...o,
            existeEnAFIP: true,
            cuil: ok?.cuit,
            tipoDocumentoId: 0,
            sexoId: 0,
            fechaNacimiento: ok?.fechaNacimiento,
          }));
        },
        onFinally: async () => {
          changes.loading = false;
          setValidacionCUIT((o) => ({ ...o, ...changes }));
        },
      });
    };

    pushQuery({
      action: "GetAfiliado",
      params: { CUIL: data.cuitTitular },
      onOk: async (ok) => {
        changes.validado =
          ok?.estadoSolicitudId == 2
            ? "Titular Afiliado a UATRE"
            : `Titular ${ok?.estadoSolicitud} en UATRE - ${ok?.refMotivoBajaDescripcion}`;
        changes.datoAFIP = "";
        const [apellidoTitular, nombreTitular] = ok.nombre.split(" ");
        onChange({
          existe: true,
          cuitTitular: ok.cuil,
          apellidoTitular: apellidoTitular,
          nombreTitular: nombreTitular,
          tipoDocumentoIdTitular: ok.tipoDocumentoId,
        });

        setTitular((o) => ({
          ...o,
          existeEnUATRE: true,
          cuil: ok?.cuil,
          tipoDocumentoId: ok?.tipoDocumentoId,
          sexoId: ok?.sexoId,
          seccionalId: ok?.seccionalId,
          fechaNacimiento: ok?.fechaNacimiento,
        }));
        await validaOSPRERA();
        await validaAFIP();
      },
      onError: async (error) => {
        await validaOSPRERA();
        await validaAFIP();
      },
      onFinally: async () => {
        changes.loading = false;
        setValidacionCUIT((o) => ({ ...o, ...changes }));
      },
    });

    pushQuery({
      action: "GetDDJJ",
      params: { cuil: data.cuitTitular },

      onOk: async (ok) => {
        if (ok.length > 0) {
          console.log("Encontró DDJJ");
        }
      },
      onError: async (error) => {
        console.log("NO Encontró DDJJ");
      },
      onFinally: async () => {
        loading = false;
      },
    });
  };
  //#endregion

  const handleDatosPaciente = (event) => {
    //setTitularPaciente(event)
    onChange({ elPacienteEsTitular: event });

    if (event) {
      const match = titular?.cuil
        ? titular?.cuil?.toString()?.match(/^(\d{2})(\d{8})(\d)$/)
        : null;
      onChange({
        apellidoPaciente: data.apellidoTitular,
        nombrePaciente: data.nombreTitular,
      });
      titular?.cuil && match[2] && onChange({ dniPaciente: match[2] });
      titular?.tipoDocumentoId &&
        onChange({ tipoDocumentoId: titular?.tipoDocumentoId });
      titular?.sexoId && onChange({ sexoId: titular?.sexoId });
      titular?.fechaNacimiento &&
        onChange({ fechaNacimiento: titular?.fechaNacimiento });
    } else return;
  };

  const hanlerEnviaEmail = () => {
    setMostrarAlertas(true);
  };

  const handlePreguntasConfirma = async () => {
    if (request == "A") {
      const isValid = await onValidate(true);
      if (!isValid) return;

      if (documentacionList.length !== 0) {
        setModalDocumentacion({ documentacionOK: true });
      } else {
        //Modal preguntando documentacion
        setModalDocumentacion({
          visible: true,
          documentacionOK: false,
        });
      }
    } else {
      handleConfirma();
    }
  };

  useEffect(() => {
    if (!modalDocumentacion?.documentacionOK) {
      return;
    }
    // console.log("modalDocumentacion", modalDocumentacion);
    setModalPreguntas({
      visible: true,
    });
  }, [modalDocumentacion]);

  const handleConfirma = async () => {
    if (request == "A") {
      if (
        !titular.existeEnUATRE &&
        !titular.existeEnOSPRERA &&
        !titular.existeEnAFIP
      ) {
        onDownloadSolicitudAfiliacion(false);
        if (data.medioGestion == "email") sendEnviarEmailHandler();
        setDialogTexto(
          "Debe confeccionar una ficha de Afiliación Manual de UATRE en el formato de Solicitud habitual."
        );
        setOpenDialog(true);
      } else {
        if (!titular.existeEnUATRE) {
          onDownloadSolicitudAfiliacion(true);
          if (data.medioGestion == "email") sendEnviarEmailHandler();
          setDialogTexto(
            "Se descargó la Solicitud de Afiliación de: " +
              data?.apellidoTitular +
              " " +
              data?.nombreTitular
          );
          setOpenDialog(true);
        }
      }
    } else {
      onClose(true);
    }
  };

  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => handleConfirma(), "AltKey");

  // Manejar cambio de respuesta
  const handleChangeAtencionesPrevias = (event) => {
    onChange({ atencionesPrevias: event.target.value });

    if (event.target.value === "No") {
      // Si la respuesta es "No", resetea las siguientes preguntas
      onChange({ conCoberturaOsprera: "" });
      onChange({ tipoPrestador: "" });
    }
  };

  const handleChangeCoberturaOsprera = (event) => {
    onChange({ conCoberturaOsprera: event.target.value });
  };

  const handleChangeTipoPrestador = (event) => {
    onChange({ tipoPrestador: event.target.value });
  };

  const handleConfirmaRespuestasModal = async () => {
    // console.log("handleConfirmaRespuestasModal", respuestas);
    setModalPreguntas({ visible: false });
    handleConfirma();
  };

  const handleCancelarRespuestasModal = () => {
    setModalPreguntas({ visible: false });
  };

  const handleContinuarDocumentacionModal = () => {
    setModalDocumentacion({ visible: false, documentacionOK: true });
  };

  const handleNoContinuarDocumentacionModal = () => {
    setModalDocumentacion({ visible: false, documentacionOK: false });
    setSelectedTab(1);
  };

  console.log("documentacionList", documentacionList);
  // console.log("data", data);
  return (
    <>
      <div>
        <Dialog
          onClose={() => (
            setDialogTexto(""), setOpenDialog(false), onClose(true)
          )}
          open={openDialog}
        >
          <DialogContent dividers>
            <Typography gutterBottom style={{ whiteSpace: "pre-line" }}>
              {dialogTexto}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              className="botonAmarillo"
              onClick={() => (
                setDialogTexto(""), setOpenDialog(false), onClose(true)
              )}
            >
              Cierra
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <Modal show /*onHide={() => onClose()}*/ size="lg" centered>
        <Modal.Header className={modalCss.modalCabecera} closeButton>
          <h3>{title}</h3>
          <Grid
            width="40%"
            float="right"
            style={{
              display: "flex",
              alignItems: "center",
              paddingleft: "65%",
              marginLeft: "25%",
            }}
          >
            <div>Seccional:</div>
            <SearchSelectMaterial
              id="seccionalId"
              label=""
              error={!!(seccionalSelect.error || errors.seccionalId)}
              helperText={
                seccionalSelect.loading ??
                seccionalSelect.error ??
                errors.seccionalId
              }
              value={seccionalSelect.selected}
              disabled={disabled.seccionalId}
              onChange={(selected = {}) => {
                setSeccionalSelect((o) => ({
                  ...o,
                  selected,
                  origen: "option",
                }));
                onChange({ seccionalId: selected.value });
              }}
              options={seccionalSelect.options}
              onTextChange={(buscar) =>
                setSeccionalSelect((o) => ({ ...o, buscar, origen: "text" }))
              }
            />
          </Grid>
        </Modal.Header>
        <Modal.Body>
          <Grid col height="60px">
            <Tabs
              value={selectedTab}
              onChange={handleChangeTab}
              aria-label="basic tabs example"
            >
              <Tab label="Datos Personales" />
              <Tab
                label="Documentacion"
                disabled={!titular.confirmado || request !== "A"}
              />
            </Tabs>
          </Grid>

          {
            [
              <Grid col width="full" gap="15px">
                <Grid width="full" gap="inherit">
                  <Grid>
                    <Grid col>
                      <Grid width="170px">
                        <InputMaterial
                          id="cuitTitular"
                          label="CUIL Titular"
                          //mask="99-99.999.999-9"
                          mask={CUITMask}
                          required
                          error={!!errors.cuitTitular}
                          /*helperText={
											errors.cuitTitular ? errors.cuitTitular : validacionCUIT.validado
										}
										FormHelperTextProps={{
											sx: {
											margin: 0, // elimina el margen superior
											},
										}}*/
                          value={data.cuitTitular}
                          disabled={disabledItems?.cuitTitular}
                          onChange={(value) =>
                            onChange({
                              cuitTitular: value.replace(/[^0-9]+/g, ""),
                            })
                          }
                        />
                      </Grid>
                      {(titular?.existeEnUATRE ||
                        titular?.existeEnOSPRERA ||
                        titular?.existeEnAFIP) && (
                        <div>
                          <h6
                            style={{
                              fontSize: "small",
                              displa:
                                titular?.existeEnUATRE ||
                                (!!titular?.existeEnUATRE &&
                                  titular.existeEnOSPRERA &&
                                  !!titular.existeEnAFIP)
                                  ? "none"
                                  : "flex",
                            }}
                          >
                            {" "}
                            {titular.existeEnOSPRERA
                              ? "Titular en Padron OSPRERA"
                              : titular.existeEnAFIP
                              ? "Titular en ARCA"
                              : ""}{" "}
                          </h6>
                          <h6 style={{ fontSize: "small" }}>
                            {titular.existeEnUATRE
                              ? "Afiliado a UATRE"
                              : !!titular.existeEnOSPRERA &&
                                !!titular.existeEnAFIP
                              ? "No se encontraron datos para el CUIL ingresado"
                              : "No Afiliado a UATRE"}
                          </h6>
                        </div>
                      )}
                    </Grid>
                    <Grid col width="70px">
                      <Button
                        className="botonAzul"
                        disabled={
                          `${data.cuitTitular ?? ""}`.length !== 11 ||
                          errors.cuitTitular ||
                          titular?.confirmado ||
                          disabled?.cuitTitular
                        }
                        onClick={validarCUITHandler}
                        loading={validacionCUIT.loading}
                      >
                        <h6>{!validacionCUIT.loading ? `Valida` : ` `}</h6>
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid>
                    <Grid width="150px">
                      <InputMaterial
                        id="apellidoTitular"
                        label="Apellido"
                        required
                        error={!!errors.apellidoTitular}
                        helperText={errors.apellidoTitular ?? ""}
                        value={data.apellidoTitular}
                        disabled={
                          titular.existeEnUATRE ||
                          titular.confirmado ||
                          (disabled?.apellidoTitular &&
                            !titular.existeEnAFIP &&
                            !titular.existeEnOSPRERA)
                        }
                        onChange={(apellidoTitular) =>
                          onChange({ apellidoTitular })
                        }
                      />
                    </Grid>
                    <Grid width="260px">
                      <InputMaterial
                        id="nombreTitular"
                        label="Nombre"
                        required
                        error={!!errors.nombreTitular}
                        helperText={errors.nombreTitular ?? ""}
                        value={data.nombreTitular}
                        disabled={
                          titular.existeEnUATRE ||
                          titular.confirmado ||
                          (disabled?.nombreTitular &&
                            !titular.existeEnAFIP &&
                            !titular.existeEnOSPRERA)
                        } //disabled.nombreTitular
                        onChange={(nombreTitular) =>
                          onChange({ nombreTitular })
                        }
                      />
                    </Grid>
                    <Grid col width="116px">
                      <Button
                        className="botonAzul"
                        onClick={confirmaTitularHandler}
                        loading={validacionCUIT.loading}
                        disabled={
                          `${data.cuitTitular ?? ""}`.length !== 11 ||
                          (!titular?.existeEnUATRE &&
                            !titular?.existeEnAFIP &&
                            !titular?.existeEnOSPRERA) ||
                          titular.confirmado
                        }
                      >
                        <h6>
                          {titular?.confirmado
                            ? `Confirmado`
                            : `Confirma Titular`}
                        </h6>
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid>
                  <CheckboxMaterial
                    id="titularPaciente"
                    label="El Paciente es El Titular"
                    required
                    value={data?.elPacienteEsTitular}
                    onChange={(v) => handleDatosPaciente(v)}
                    disabled={disabledItems.elPacienteEsTitular}
                  />
                </Grid>
                <Grid width="full" gap="inherit">
                  <Grid width="100px">
                    <SearchSelectMaterial
                      id="tipoDocumentoId"
                      label="Tipo Doc."
                      required
                      error={
                        !!(tipoDocumentoSelect.error || errors.tipoDocumentoId)
                      }
                      helperText={
                        tipoDocumentoSelect.loading ??
                        tipoDocumentoSelect.error ??
                        errors.tipoDocumentoId
                      }
                      value={tipoDocumentoSelect.selected}
                      disabled={disabledItems.tipoDocumentoId}
                      onChange={(selected = {}) => {
                        setTipoDocumentoSelect((o) => ({
                          ...o,
                          selected,
                          origen: "option",
                        }));
                        onChange({ tipoDocumentoId: selected.value });
                      }}
                      options={tipoDocumentoSelect.options}
                    />
                  </Grid>
                  <Grid width="130px">
                    <InputMaterial
                      id="dniPaciente"
                      mask={DNIMask}
                      label="Número Doc."
                      required
                      value={data.dniPaciente}
                      error={!!errors.dniPaciente}
                      helperText={errors.dniPaciente ?? ""}
                      disabled={disabledItems.dniPaciente}
                      onChange={(value) => onChange({ dniPaciente: value })}
                    />
                  </Grid>
                  <Grid grow>
                    <InputMaterial
                      id="apellidoPaciente"
                      label="Apellido"
                      required
                      error={!!errors.apellidoPaciente}
                      helperText={errors.apellidoPaciente ?? ""}
                      value={data.apellidoPaciente}
                      disabled={disabledItems.apellidoPaciente}
                      onChange={(apellidoPaciente) =>
                        onChange({ apellidoPaciente })
                      }
                    />
                  </Grid>
                  <Grid grow>
                    <InputMaterial
                      id="nombrePaciente"
                      label="Nombre"
                      required
                      error={!!errors.nombrePaciente}
                      helperText={errors.nombrePaciente ?? ""}
                      value={data.nombrePaciente}
                      disabled={disabledItems.nombrePaciente}
                      onChange={(nombrePaciente) =>
                        onChange({ nombrePaciente })
                      }
                    />
                  </Grid>
                </Grid>

                <Grid width gap="inherit">
                  <InputMaterial
                    id="fechaNacimiento"
                    type="date"
                    label="Fecha de nacimiento"
                    required
                    value={data.fechaNacimiento}
                    maxDate={moment().format("YYYY-MM-DD")}
                    error={errors.fechaNacimiento}
                    disabled={disabledItems.fechaNacimiento}
                    onChange={(fechaNacimiento) =>
                      onChange({ fechaNacimiento })
                    }
                  />
                  <SearchSelectMaterial
                    id="sexoSelect"
                    label="Sexo"
                    required
                    error={!!(sexoSelect.error || errors.sexoId)}
                    helperText={
                      sexoSelect.loading ?? sexoSelect.error ?? errors.sexoId
                    }
                    value={sexoSelect.selected}
                    disabled={disabledItems.sexo}
                    onChange={(selected = {}) => {
                      setSexoSelect((o) => ({
                        ...o,
                        selected,
                        origen: "option",
                      }));
                      onChange({ sexoId: selected.value });
                    }}
                    options={sexoSelect.options}
                  />
                </Grid>
                <Grid width="100%" gap="inherit">
                  <Grid width="100%" gap="inherit">
                    <InputMaterial
                      id="telefonoContacto"
                      label="Teléfono Contacto"
                      type="tel"
                      error={!!errors.telefonoContacto}
                      helperText={errors.telefonoContacto ?? ""}
                      value={data.telefonoContacto}
                      disabled={disabledItems.telefonoContacto}
                      onChange={(telefonoContacto) =>
                        onChange({ telefonoContacto })
                      }
                    />

                    <InputMaterial
                      id="telefonoContacto2"
                      label="Otro Teléfono Contacto"
                      type="tel"
                      error={!!errors.telefonoContacto2}
                      helperText={errors.telefonoContacto2 ?? ""}
                      value={data.telefonoContacto2}
                      disabled={disabledItems.telefonoContacto2}
                      onChange={(telefonoContacto2) =>
                        onChange({ telefonoContacto2 })
                      }
                    />
                  </Grid>
                </Grid>
                <Grid width="100%" gap="inherit">
                  <Grid width="100%" gap="inherit">
                    <InputMaterial
                      id="emailContacto"
                      name="email"
                      label="Email Contacto"
                      error={!!errors.emailContacto}
                      helperText={errors.emailContacto ?? ""}
                      value={data.emailContacto}
                      disabled={disabledItems.emailContacto}
                      onChange={(emailContacto) => onChange({ emailContacto })}
                    />

                    <InputMaterial
                      id="emailContacto2"
                      name="email"
                      label="Otro Email Contacto"
                      error={!!errors.emailContacto2}
                      helperText={errors.emailContacto2 ?? ""}
                      value={data.emailContacto2}
                      disabled={disabledItems.emailContacto2}
                      onChange={(emailContacto2) =>
                        onChange({ emailContacto2 })
                      }
                    />
                  </Grid>
                </Grid>
                <Grid width="100%" gap="inherit">
                  <Grid width="100%" gap="inherit">
                    <SearchSelectMaterial
                      required
                      freeSolo={false}
                      id="gestionRubro"
                      name="gestionRubro"
                      label="Tipo gestión"
                      error={!!errors.gestionRubro}
                      helperText={errors.gestionRubro ?? ""}
                      value={gestionRubroSelect.selected}
                      disabled={disabledItems.gestionRubro}
                      onChange={(selected = {}) => {
                        setGestionRubroSelect((o) => ({
                          ...o,
                          selected,
                          origen: "option",
                        }));
                        onChange({ gestionRubroId: selected.value });
                      }}
                      options={gestionRubroSelect.options}
                    />

                    <SearchSelectMaterial
                      required
                      id="gestionSubRubro"
                      name="gestionSubRubro"
                      label="Detalle tipo gestión"
                      error={!!errors.gestionSubRubro}
                      helperText={errors.gestionSubRubro ?? ""}
                      value={gestionSubRubroSelect.selected}
                      disabled={disabledItems.gestionSubRubro}
                      onChange={(selected = {}) => {
                        setGestionSubRubroSelect((o) => ({
                          ...o,
                          selected,
                          origen: "option",
                        }));
                        onChange({ gestionSubRubroId: selected.value });
                      }}
                      options={gestionSubRubroSelect.options}
                    />
                  </Grid>
                </Grid>
                <Grid width="full" gap="inherit">
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    label="Detalle de la Gestión"
                    error={!!errors.texto}
                    helperText={errors.texto ?? ""}
                    value={data.texto}
                    disabled={disabledItems.texto}
                    onChange={(texto) =>
                      onChange({ texto: texto.target.value })
                    }
                  />
                </Grid>
                <Grid width="100%" gap="inherit">
                  <Grid width="100%" gap="inherit">
                    <SearchSelectMaterial
                      required
                      id="gestionEstado"
                      name="gestionEstado"
                      label="Estado"
                      error={!!errors.gestionEstado}
                      helperText={errors.gestionEstado ?? ""}
                      value={gestionEstadoSelect.selected}
                      disabled={disabledItems.gestionEstado}
                      onChange={(selected = {}) => {
                        setGestionEstadoSelect((o) => ({
                          ...o,
                          selected,
                          origen: "option",
                        }));
                        onChange({ gestionEstadoId: selected.value });
                      }}
                      options={gestionEstadoSelect.options}
                    />

                    <SearchSelectMaterial
                      required
                      id="gestionSituacion"
                      name="gestionSituacion"
                      label="Situación"
                      error={!!errors.gestionSituacion}
                      helperText={errors.gestionSituacion ?? ""}
                      value={gestionSituacionSelect.selected}
                      disabled={disabledItems.gestionSituacion}
                      onChange={(selected = {}) => {
                        setGestionSituacionSelect((o) => ({
                          ...o,
                          selected,
                          origen: "option",
                        }));
                        onChange({ gestionSituacionId: selected.value });
                      }}
                      options={gestionSituacionSelect.options}
                    />

                    <SearchSelectMaterial
                      required
                      id="gestionAreaOsprera"
                      name="gestionAreaOsprera"
                      label="Area OSPRERA"
                      error={!!errors.gestionAreaOsprera}
                      helperText={errors.gestionAreaOsprera ?? ""}
                      value={gestionAreaOspreraSelect.selected}
                      disabled={disabledItems.gestionAreaOsprera}
                      onChange={(selected = {}) => {
                        setGestionAreaOspreraSelect((o) => ({
                          ...o,
                          selected,
                          origen: "option",
                        }));
                        onChange({ gestionAreaOspreraId: selected.value });
                      }}
                      options={gestionAreaOspreraSelect.options}
                    />
                  </Grid>
                </Grid>
                <FormControl
                  disabled={disabledItems.medioGestion}
                  error={!!errors.medioGestion}
                  component="fieldset"
                  variant="standard"
                >
                  <FormLabel id="demo-row-radio-buttons-group-label">
                    Medio de Gestión:
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={data?.medioGestion}
                    onChange={(medioGestion) =>
                      onChange({ medioGestion: medioGestion.target.value })
                    }
                  >
                    <FormControlLabel
                      value="email"
                      control={<Radio />}
                      label="Email"
                    />
                    <FormControlLabel
                      value="telefono"
                      control={<Radio />}
                      label="Teléfono"
                    />
                  </RadioGroup>
                </FormControl>
                <Grid width="full">
                  <Grid width>
                    {(data.medioGestion === "email" && (
                      <InputMaterial
                        id="direccionesEmailDestino"
                        name="email"
                        label="Email"
                        error={!!errors.direccionesEmailDestino}
                        helperText={errors.direccionesEmailDestino ?? ""}
                        value={data.direccionesEmailDestino}
                        disabled={disabledItems.direccionesEmailDestino}
                        onChange={(direccionesEmailDestino) =>
                          onChange({ direccionesEmailDestino })
                        }
                      />
                    )) ||
                      (data.medioGestion === "telefono" && (
                        <Grid width>
                          <Grid width="350px">
                            <InputMaterial
                              id="telefono"
                              label="Teléfono"
                              type="tel"
                              error={!!errors.telefono}
                              helperText={errors.telefono ?? ""}
                              value={data.telefono}
                              disabled={disabledItems.telefono}
                              onChange={(telefono) => onChange({ telefono })}
                            />
                          </Grid>
                          <Grid width="full">
                            <InputMaterial
                              label="Resultado de la llamada"
                              error={!!errors.resultadoLlamada}
                              helperText={errors.resultadoLlamada ?? ""}
                              value={data.resultadoLlamada}
                              disabled={disabledItems.resultadoLlamada}
                              onChange={(resultadoLlamada) =>
                                onChange({ resultadoLlamada })
                              }
                            />
                          </Grid>
                        </Grid>
                      ))}
                  </Grid>
                </Grid>
                {hide.deletedObs ? null : (
                  <Grid width="full" gap="inherit">
                    <Grid width="full">
                      <InputMaterial
                        id="deletedDate"
                        label="Fecha Baja"
                        error={!!errors.deletedDate}
                        helperText={errors.deletedDate ?? ""}
                        value={data.deletedDate}
                        disabled={disabled.deletedDate ?? false}
                        onChange={(deletedDate) => onChange({ deletedDate })}
                      />
                    </Grid>
                    <Grid width="full">
                      <InputMaterial
                        id="deletedBy"
                        label="Usuario Baja"
                        error={!!errors.deletedBy}
                        helperText={errors.deletedBy ?? ""}
                        value={data.deletedBy}
                        disabled={disabled.deletedBy ?? false}
                        onChange={(deletedBy) => onChange({ deletedBy })}
                      />
                    </Grid>
                    <Grid width="full">
                      <InputMaterial
                        id="deletedObs"
                        label="Observaciones Baja"
                        error={!!errors.deletedObs}
                        helperText={errors.deletedObs ?? ""}
                        value={data.deletedObs}
                        disabled={disabled.deletedObs ?? false}
                        onChange={(deletedObs) => onChange({ deletedObs })}
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>,
              <Documentacion
                data={documentacionList}
                onChange={({ index, item }) => {
                  const newDocList = [...documentacionList];
                  if (index == null) {
                    // Create
                    newDocList.push(item);
                  } else if (item == null) {
                    // Delete
                    newDocList.splice(index, 1);
                  } else {
                    // Update
                    newDocList.splice(index, 1, item);
                  }
                  setDocumentacionList(newDocList);
                  onChange({ documentacion: newDocList });
                }}
              />,
            ][selectedTab]
          }
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="botonAzul"
            loading={loading}
            width={25}
            disabled={!titular?.confirmado}
            onClick={
              request == "E"
                ? () => hanlerEnviaEmail()
                : () => handlePreguntasConfirma()
            }
          > CONFIRMA
          </Button>

          <Button
            className="botonAmarillo"
            width={25}
            onClick={() => onClose()}
          >
            CIERRA
          </Button>

          {mostrarAlertas && (
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Alert variant="filled" severity="success">
                Correo enviado con éxito!.
              </Alert>
              <Alert variant="filled" severity="warning">
                Primero debe una dirección de EMAIL!
              </Alert>
              <Alert variant="filled" severity="error">
                Error al enviar el correo!.
              </Alert>
            </Stack>
          )}
        </Modal.Footer>
      </Modal>
      {modalPreguntas.visible && (
        <Modal show>
          <Modal.Header className={modalPreguntas.modalCabecera}>
            <h3>Información estadística</h3>
          </Modal.Header>
          <Modal.Body>
            <div>
              <FormControl>
                <FormLabel id="demo-controlled-radio-buttons-group">
                  ¿Ha realizado atenciones médicas previas?
                </FormLabel>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={data.atencionesPrevias}
                  onChange={handleChangeAtencionesPrevias}
                >
                  <FormControlLabel value="N" control={<Radio />} label="No" />
                  <FormControlLabel value="S" control={<Radio />} label="Sí" />
                </RadioGroup>
              </FormControl>
            </div>

            {/* Pregunta 2 */}
            {data.atencionesPrevias === "S" && (
              <div style={{ marginTop: 16 }}>
                <FormControl>
                  <FormLabel id="demo-controlled-radio-buttons-group">
                    ¿Con cobertura de OSPRERA?
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={data.conCoberturaOsprera}
                    onChange={handleChangeCoberturaOsprera}
                  >
                    <FormControlLabel
                      value="N"
                      control={<Radio />}
                      label="No"
                    />
                    <FormControlLabel
                      value="S"
                      control={<Radio />}
                      label="Sí"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
            )}

            {/* Pregunta 3 */}
            {data.atencionesPrevias === "S" && (
              <Grid col style={{ marginTop: 16 }}>
                <FormControl>
                  <FormLabel id="demo-controlled-radio-buttons-group">
                    ¿En qué tipo de prestador?
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={data.tipoPrestador}
                    onChange={handleChangeTipoPrestador}
                  >
                    <FormControlLabel
                      value="Publico"
                      control={<Radio />}
                      label="Público"
                    />
                    <FormControlLabel
                      value="Privado"
                      control={<Radio />}
                      label="Privado"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="botonAzul"
              onClick={handleConfirmaRespuestasModal}
              disabled={
                !data.atencionesPrevias ||
                (data.atencionesPrevias === "S" &&
                  (!data.conCoberturaOsprera || !data.tipoPrestador))
              }
            >
              CONFIRMA
            </Button>
            <Button
              className="botonAmarillo"
              onClick={handleCancelarRespuestasModal}
            >
              CANCELA
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {modalDocumentacion.visible && (
        <Modal show>
          <Modal.Header
            className={modalDocumentacion.modalCabecera}
            closeButton
          >
            <h3>DOCUMENTACION</h3>
          </Modal.Header>
          <Modal.Body>
            <p>
              No tiene documentación cargada. ¿Desea cargar la documentación
              ahora?
            </p>
            {/* Aquí puedes agregar un componente para subir archivos */}
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="botonAzul"
              onClick={handleNoContinuarDocumentacionModal}
            >
              SÍ
            </Button>
            <Button
              className="botonAmarillo"
              onClick={handleContinuarDocumentacionModal}
            >
              NO
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default FormularioOspreraForm;
