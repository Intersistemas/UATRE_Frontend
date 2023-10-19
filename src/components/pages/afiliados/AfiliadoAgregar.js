import React, { useEffect, useReducer, useRef, useState } from "react";
import Button from "../../ui/Button/Button";
import Modal from "../../ui/Modal/Modal";
import classes from "./AfiliadoAgregar.module.css";
import useHttp from "../../hooks/useHttp";
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import InputMaterial from "../../ui/Input/InputMaterial";
import SelectMaterial from "../../ui/Select/SelectMaterial";
import moment from "moment";
import ValidarCUIT from "../../validators/ValidarCUIT";
import ValidarEmail from "../../validators/ValidarEmail";
import FormatearFecha from "../../helpers/FormatearFecha";
import InputMaterialMask from "../../ui/Input/InputMaterialMask";
import {
  AFILIADO_AGREGADO,
  AFILIADO_ACTUALIZADO,
  AFILIADO_SOLICITUDRESUELTA,
  AFILIADO_DATOSAFIPACTUALIZADO,
  AFILIADO_AGREGADO_ACTIVO,
} from "../../helpers/Mensajes";
import ResolverSolicitud from "./ResolverSolicitud/ResolverSolicitud";
import TabEmpleador from "./TabEmpleador/TabEmpleador";
import CabeceraABMAfiliado from "./CabeceraABMAfiliado/CabeceraABMAfiliado";
import DatosAfip from "./DatosAfip/DatosAfip";
import { ActualizarDatosAfip } from "./DatosAfip/ActualizarDatosAfip";
import Documentacion from "../../Documentacion/Documentacion";
import UseKeyPress from '../../helpers/UseKeyPress';

//#region Reducers
const cuilReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: ValidarCUIT(action.value) };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: ValidarCUIT(state.value) };
  }
  return { value: "", isValid: false };
};

const nombreReducer = (state, action) => {
  //console.log("reducer");
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: action.value.length > 0 };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: state.value.length > 0 };
  }
  return { value: "", isValid: false };
};

const cuitReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    //console.log("action.value", action.value);
    return { value: action.value, isValid: ValidarCUIT(action.value) };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: ValidarCUIT(state.value) };
  }
  return { value: "", isValid: false };
};

const emailReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: ValidarEmail(action.value) };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: ValidarEmail(state.value) };
  }
  return { value: "", isValid: false };
};

const nacionalidadReducer = (state, action) => {
  console.log("nacionalidad", action.value);
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const fechaNacimientoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: action.value !== "" ? true : false };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: state.value !== "" ? true : false };
  }
  return { value: "", isValid: false };
};

const estadoCivilReducer = (state, action) => {
  console.log("ESTADO CIVIL reducer: ", action.value);
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const sexoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const tipoDocumentoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const numeroDocumentoReducer = (state, action) => {
  console.log("action.value.length", action.value);
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid:
        parseInt(action.value) !== 0 && action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid:
        parseInt(action.value) !== 0 && action.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const domicilioReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value.length > 0 ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value.length > 0 ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const provinciaReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    seccionalSinAsignar.push({ value: 1, label: "" })
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const localidadReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const seccionalReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const puestoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const actividadReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const telefonoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: action.value ? true : false };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: state.value ? true : false };
  }
  return { value: "", isValid: false };
};

//#endregion

//#region gloabes
let seccionalSinAsignar = [
  {
    value: 99999,
    label: "Sin Asignar",
  },
];
//#endregion

const AfiliadoAgregar = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [selectedTab, setSelectedTab] = useState(0);
  const { cuil: cuilParam } = props;

  //#region Alert
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTexto, setDialogTexto] = useState("");
  //#endregion



  UseKeyPress(['Escape'], () => handleCerrarModal());
 // UseKeyPress(['a'], ()=>btnconfirmar(), 'AltKey');

  UseKeyPress(['Enter'], () => afiliadoAgregarHandler(), 'AltKey');

  

  //#region Texto completar campos
  const TextCompletarCampos = () => {
    console.log("texto dialog estadocivil", estadoCivilState.isValid);
    setDialogTexto(`Se debe completar todos los campos:\n
      ${!cuilState.isValid ? "*CUIL\n" : ""}
      ${!nombreState.isValid ? "*Nombre\n" : ""}
      ${!fechaNacimientoState.isValid ? "*Fecha de Nacimiento\n" : ""}
      ${!numeroDocumentoState.isValid ? "*Numero Documento\n" : ""}
      ${!estadoCivilState.isValid ? "*Estado Civil\n" : ""}
      ${!sexoState.isValid ? "*Género\n" : ""}
      ${!domicilioState.isValid ? "*Domicilio\n" : ""}
      ${!provinciaState.isValid ? "*Provincia\n" : ""}
      ${!localidadState.isValid ? "*Localidad\n" : ""}
      ${!seccionalState.isValid ? "*Seccional\n" : ""}      
      ${!cuitState.isValid ? "*CUIT Empleador\n" : ""}
      `);
  };
  //#endregion

  //#region Variables de estado para ButtonLoadingCustom
  const [cuilLoading, setCUILLoading] = useState(false);
  const [cuitLoading, setCUITLoading] = useState(false);
  const [afiliadoProcesando, setAfiliadoProcesando] = useState(false);
  //#endregion

  //#region Capturo errores
  useEffect(() => {
    console.log("error", error);
    if (error) {
      setAfiliadoProcesando(false);
      if (error.code === 500) {
        setCUILLoading(false);
        setDialogTexto(`Error - ${error.message}`);
        setOpenDialog(true);
      }

      if (error.code === 404 && cuilLoading) {
        setCUILLoading(false);
        setDialogTexto(
          `Error - No existe el CUIL ${cuilState.value} en el Padron de AFIP`
        );
        setOpenDialog(true);
      }

      if (error.code === 404 && cuitLoading) {
        setCUITLoading(false);
        setDialogTexto(
          `Error - No existe el CUIT ${cuitEmpresa} en el Padron de AFIP`
        );
        setOpenDialog(true);
      }

      
      return;
    }    
  }, [error]);
  //#endregion

  //#region estados para validaciones
  const [formularioIsValid, setFormularioIsValid] = useState(false);
  const [formularioEmpleadorIsValid, setFormularioEmpleadorIsValid] =
    useState(false);
  // const [
  //   resolverSolicitudAfiliadoResponse,
  //   setResolverSolicitudAfiliadoResponse,
  // ] = useState(0);
  const [resolverSolicitudObs, setResolverSolicitudObs] = useState("");
  const [resolverSolicitudFechaIngreso, setResolverSolicitudFechaIngreso] =
    useState(moment(new Date()).format("yyyy-MM-DD"));
  const [showImprimirLiquidacion, setShowImprimirLiquidacion] = useState(false);
  const [estadosSolicitudes, setEstadosSolicitudes] = useState([]);
  const [cuilValidado, setCuilValidado] = useState(false);
  const [cuitValidado, setCuitValidado] = useState(false);
  const [ultimaDDJJ, setUltimaDDJJ] = useState([]);
  //#endregion

  //#region variables para respuestas de servicios
  const [nuevoAfiliadoResponse, setNuevoAfiliadoResponse] = useState(null);
  const [afiliadoModificado, setAfiliadoModificado] = useState(null);
  const [padronRespuesta, setPadronRespuesta] = useState(null);
  const [padronEmpresaRespuesta, setPadronEmpresaRespuesta] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [seccionales, setSeccionales] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [sexos, setSexos] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  //#endregion

  //#region Documentación
	const [documentacionList, setDocumentacionList] = useState([]);
  //#endregion

  //#region Datos Personales Formulario
  const [afiliado, setAfiliado] = useState(null);
  const [estadoSolicitudResolver, setEstadoSolicitudResolver] = useState(1);
  const [estadoSolicitudDescripcion, setEstadoSolicitudDescripcion] =
    useState("");

  //#endregion

  //#region Datos Empleador
  const [cuitEmpresa, setCUITEmpresa] = useState("");
  const [razonSocialEmpresa, setRazonSocialEmpresa] = useState("");
  const [actividadEmpresa, setActividadEmpresa] = useState("");
  const [domicilioEmpresa, setDomicilioEmpresa] = useState("");
  const [localidadEmpresa, setLocalidadEmpresa] = useState("");
  const [telefonoEmpresa, setTelefonoEmpresa] = useState("");
  const [correoEmpresa, setCorreoEmpresa] = useState("");
  const [lugarTrabajoEmpresa, setLugarTrabajoEmpresa] = useState("");
  //const [empresaId, setEmpresaId] = useState(0);
  //#endregion

  //#region manejo de validaciones
  const [cuilState, dispatchCUIL] = useReducer(cuilReducer, {
    value: "",
    isValid: false,
  });

  const [nombreState, dispatchNombre] = useReducer(nombreReducer, {
    value: "",
    isValid: false,
  });

  const [cuitState, dispatchCUIT] = useReducer(cuitReducer, {
    value: "",
    isValid: false,
  });

  const [emailState, dispatchEmail] = useReducer(emailReducer, {
    value: "",
    isValid: false,
  });

  const [nacionalidadState, dispatchNacionalidad] = useReducer(
    nacionalidadReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [fechaNacimientoState, dispatchFechaNacimiento] = useReducer(
    fechaNacimientoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [estadoCivilState, dispatchEstadoCivil] = useReducer(
    estadoCivilReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [sexoState, dispatchSexo] = useReducer(sexoReducer, {
    value: "",
    isValid: false,
  });

  const [tipoDocumentoState, dispatchTipoDocumento] = useReducer(
    tipoDocumentoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [numeroDocumentoState, dispatchNumeroDocumento] = useReducer(
    numeroDocumentoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [domicilioState, dispatchDomicilio] = useReducer(domicilioReducer, {
    value: "",
    isValid: false,
  });

  const [provinciaState, dispatchProvincia] = useReducer(provinciaReducer, {
    value: "",
    isValid: false,
  });

  const [localidadState, dispatchLocalidad] = useReducer(localidadReducer, {
    value: "",
    isValid: false,
  });

  const [seccionalState, dispatchSeccional] = useReducer(seccionalReducer, {
    value: "",
    isValid: false,
  });

  const [puestoState, dispatchPuesto] = useReducer(puestoReducer, {
    value: "",
    isValid: false,
  });

  const [actividadState, dispatchActividad] = useReducer(actividadReducer, {
    value: "",
    isValid: false,
  });

  const [telefonoState, dispatchTelefono] = useReducer(telefonoReducer, {
    value: "",
    isValid: false,
  });

  //#ENDREGION

  //checking
  useEffect(() => {
    const identifier = setTimeout(() => {
      //setAfiliadoExiste(false);
      //console.log("cuilState.isValid", cuilState.isValid);
      // console.log("nombreState.isValid", nombreState.isValid);
      // console.log("nacionalidadState.isValid", nacionalidadState.isValid);
      // console.log("estadoCivilState.isValid", estadoCivilState.isValid);
      // console.log("fechaNacimiento.isValid", fechaNacimientoState.isValid);
      // console.log("sexoState.isValid", sexoState.isValid);
      // console.log("tipoDocumentoState.isValid", tipoDocumentoState.isValid);
      // console.log("numeroDocumentoState.isValid", numeroDocumentoState.isValid);
      // console.log("domicilioState.isValid", domicilioState.isValid);
      // console.log("provinciaState.isValid", provinciaState.isValid);

      // console.log("localidadState.isValid", localidadState.isValid);
      // console.log("seccionalState.isValid", seccionalState.isValid);
      // console.log("puestoState.isValid", puestoState.isValid);
      // console.log("actividadState.isValid", actividadState.isValid);
      //console.log("emailState.isValid", emailState.isValid);

      if (
        cuilState.isValid &&
        nombreState.isValid &&
        nacionalidadState.isValid &&
        fechaNacimientoState.isValid &&
        estadoCivilState.isValid &&
        sexoState.isValid &&
        tipoDocumentoState.isValid &&
        numeroDocumentoState.isValid &&
        domicilioState.isValid &&
        provinciaState.isValid &&
        localidadState.isValid &&
        seccionalState.isValid 
      ) {
        setFormularioIsValid(true);
      } else {
        setFormularioIsValid(false);
      }
    }, 400);

    return () => {
      clearTimeout(identifier);
      //console.log("cleanup");
    };
  }, [
    cuilState,
    nombreState,
    estadoCivilState,
    sexoState,
    tipoDocumentoState,
    numeroDocumentoState,
    domicilioState,
    provinciaState,
    localidadState,
    seccionalState,
    puestoState,
    fechaNacimientoState,
    nacionalidadState,
  ]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      console.log("checking empresa.", cuitState.isValid);
      if (cuitState.isValid) {
        setFormularioEmpleadorIsValid(true);
      }
    }, 200);

    return () => {
      clearTimeout(identifier);
      //console.log("cleanup");
    };
  }, [cuitState.isValid]);
  //#endregion

  //#region variables de estado por touched
  const [inputsTouched, setInputsTouched] = useState(false);
  //#endregion


  //#region manejo si el afiliado existe
  const [afiliadoExiste, setAfiliadoExiste] = useState(false);
  const [empresaIdExiste, setEmpresaIdExiste] = useState(0);

  useEffect(() => {
    console.log("props.accion", props.accion);
    if (props.accion === "Modifica" || props.accion === "Resuelve") {
      setAfiliadoExiste(true);
      setInputsTouched(true);
      if (cuilParam > 0) {
        //setCUIL(cuilParam);
        dispatchCUIL({ type: "USER_INPUT", value: cuilParam });
      }
    }
  }, [cuilParam, props.accion]);

  useEffect(() => {
    if (cuilState.value && cuilState.isValid) {
      const processGetAfiliado = async (afiliadoObj) => {
        console.log("afiliadoObj", afiliadoObj);
        setAfiliado(afiliadoObj);
        setCuilValidado(true);
        setNuevoAfiliadoResponse(afiliadoObj);
        setAfiliadoExiste(true);
        //setPadronRespuesta(true);
        //setEstadoSolicitud(afiliadoObj.estadoSolicitudId);
        setEstadoSolicitudDescripcion(afiliadoObj.estadoSolicitud);

        //dispatches para validar los campos
        dispatchCUIL({ type: "USER_INPUT", value: afiliadoObj.cuil });
        dispatchActividad({
          type: "USER_INPUT",
          value: afiliadoObj.actividadId === 0 ? "" : afiliadoObj.actividadId,
        });
        dispatchPuesto({
          type: "USER_INPUT",
          value: afiliadoObj.puestoId === 0 ? "" : afiliadoObj.puestoId,
        });
        dispatchNacionalidad({
          type: "USER_INPUT",
          value:
            afiliadoObj.nacionalidadId === 0 ? "" : afiliadoObj.nacionalidadId,
        });
        dispatchSexo({
          type: "USER_INPUT",
          value: afiliadoObj.sexoId === 0 ? "" : afiliadoObj.sexoId,
        });
        dispatchSeccional({
          type: "USER_INPUT",
          value:
            afiliadoObj.seccionalId === 0 || afiliadoObj.refLocalidadId === 0
              ? ""
              : afiliadoObj.seccionalId,
        });
        dispatchEstadoCivil({
          type: "USER_INPUT",
          value:
            afiliadoObj.estadoCivilId === 0 ? "" : afiliadoObj.estadoCivilId,
        });
        dispatchTipoDocumento({
          type: "USER_INPUT",
          value:
            afiliadoObj.tipoDocumentoId === 0
              ? ""
              : afiliadoObj.tipoDocumentoId,
        });
        dispatchProvincia({
          type: "USER_INPUT",
          value: afiliadoObj.provinciaId === 0 ? "" : afiliadoObj.provinciaId,
        });
        dispatchLocalidad({
          type: "USER_INPUT",
          value:
            afiliadoObj.refLocalidadId === 0 ? "" : afiliadoObj.refLocalidadId,
        });
        dispatchNombre({ type: "USER_INPUT", value: afiliadoObj.nombre });
        dispatchFechaNacimiento({
          type: "USER_INPUT",
          value:
            afiliadoObj.fechaNacimiento !== null
              ? moment(afiliadoObj.fechaNacimiento).format("yyyy-MM-DD")
              : "",
        });
        dispatchNumeroDocumento({
          type: "USER_INPUT",
          value: afiliadoObj.documento !== 0 ? afiliadoObj.documento : "",
        });
        dispatchDomicilio({
          type: "USER_INPUT",
          value: afiliadoObj.domicilio ?? "",
        });
        dispatchEmail({ type: "USER_INPUT", value: afiliadoObj.correo });

        //datos empleador
        dispatchCUIT({ type: "USER_INPUT", value: afiliadoObj.empresaCUIT });
        setCuitValidado(true);
        setCUITEmpresa(afiliadoObj.empresaCUIT);
        setRazonSocialEmpresa(afiliadoObj.empresa);
        setEmpresaIdExiste(afiliadoObj.empresaId);

        if (afiliadoObj.estadoSolicitudId === 1) {
          const estadosSolicitudesPendientes = props.estadosSolicitudes.filter(
            (estado) =>
              estado.label === "Pendiente" ||
              estado.label === "Activo" ||
              estado.label === "Observado" ||
              estado.label === "Rechazado"
          );
          //console.log("estados", estadosSolicitudesPendientes);
          setEstadosSolicitudes(estadosSolicitudesPendientes);
          setEstadoSolicitudResolver(estadosSolicitudesPendientes[1].value);
        } else if (afiliadoObj.estadoSolicitudId === 4) {
          const estadosSolicitudesObservado = props.estadosSolicitudes.filter(
            (estado) =>
              estado.label === "Observado" || estado.label === "Rechazado"
          );
          //console.log("estados", estadosSolicitudesObservado);
          setEstadosSolicitudes(estadosSolicitudesObservado);
          setEstadoSolicitudResolver(estadosSolicitudesObservado[0].value);
        }

        //alert
        if (props.accion === "Agrega") {
          setDialogTexto(
            `El afiliado ya está cargado para la seccional ${afiliadoObj.seccional}`
          );
          setOpenDialog(true);
          return;
        } else if (props.accion === "Resuelve") {
          console.log("a resolver");
          setSelectedTab(3);
        }
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Afiliado/GetAfiliadoByCUIL?CUIL=${cuilState.value}`,
          method: "GET",
        },
        processGetAfiliado
      );
    }
  }, [request, cuilState.value, cuilState.isValid]);

  useEffect(() => {
    if (afiliadoExiste && empresaIdExiste > 0) {
      const processGetEmpresa = async (empresaObj) => {
        //console.log("empresaObj", empresaObj);
        setPadronEmpresaRespuesta(empresaObj);
        //setEmpresaId(empresaObj.id);
        setRazonSocialEmpresa(empresaObj.razonSocial);
        setActividadEmpresa(empresaObj.actividadPrincipalDescripcion);
        setDomicilioEmpresa(
          `${empresaObj.domicilioCalle} ${empresaObj.domicilioNumero}`
        );
        setLocalidadEmpresa("");
        setTelefonoEmpresa(empresaObj.telefono ?? "");
        setCorreoEmpresa(empresaObj.email ?? "");
        setLugarTrabajoEmpresa("");
        //ciius
      };

      request(
        {
          baseURL: "Comunes",
          endpoint: `/Empresas/GetById?Id=${empresaIdExiste}`,
          method: "GET",
        },
        processGetEmpresa
      );
    }
  }, [request, afiliadoExiste, empresaIdExiste]);
  //#endregion

  //#region Tablas para crear afiliado
  useEffect(() => {
    const processActividades = async (actividadesObj) => {
      //console.log("actividadesObj", actividadesObj);
      const actividadesSelect = actividadesObj
        .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
        .map((actividad) => {
          return { value: actividad.id, label: actividad.descripcion };
        });
      //console.log("actividades", actividadesSelect);
      setActividades(actividadesSelect);
      dispatchActividad({ type: "USER_INPUT", value: actividadesSelect[0].value });
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Actividad`,
        method: "GET",
      },
      processActividades
    );
  }, [request]);

  useEffect(() => {
    const processPuestos = async (puestosObj) => {
      //console.log("actividadesObj", puestosObj);
      const puestosSelect = puestosObj
        .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
        .map((puesto) => {
          return { value: puesto.id, label: puesto.descripcion };
        });
      setPuestos(puestosSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Puesto`,
        method: "GET",
      },
      processPuestos
    );
  }, [request]);

  useEffect(() => {
    const processSexos = async (sexosObj) => {
      const sexosSelect = sexosObj
        .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
        .map((sexo) => {
          return { value: sexo.id, label: sexo.descripcion };
        });
      //console.log("sexosselect", sexosSelect);
      setSexos(sexosSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Sexo`,
        method: "GET",
      },
      processSexos
    );
  }, [request]);

  useEffect(() => {
    const processNacionalidades = async (nacionalidadObj) => {
      const nacionalidadesSelect = nacionalidadObj
        .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
        .map((nacionalidad) => {
          return { value: nacionalidad.id, label: nacionalidad.descripcion };
        });
      //console.log("sexosselect", nacionalidadesSelect);
      setNacionalidades(nacionalidadesSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Nacionalidad`,
        method: "GET",
      },
      processNacionalidades
    );
  }, [request]);

  useEffect(() => {
    const processProvincias = async (provinciasObj) => {
      const provinciasSelect = provinciasObj
        .sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
        .map((provincia) => {
          return {
            value: provincia.id,
            label: provincia.nombre,
            idProvinciaAFIP: provincia.idProvinciaAFIP,
            seccionalIdPorDefecto: provincia.seccionalIdPorDefecto,
            seccionalDescripcionPorDefecto: provincia.seccionalDescripcionPorDefecto
          };
        });
      //console.log("provinciasSelect", provinciasSelect);      
      setProvincias(provinciasSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Provincia`,
        method: "GET",
      },
      processProvincias
    );
  }, [request]);

  useEffect(() => {
    if (provinciaState.value !== "") {
      const processLocalidades = async (localidadesObj) => {
        const localidadesSelect = localidadesObj
          .sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
          .map((localidad) => {
            return { value: localidad.id, label: localidad.nombre };
          });
        //console.log("seccionalesSelect", seccionalesSelect);
        setLocalidades(localidadesSelect);

        seccionalSinAsignar.splice(0);
        const provinciaSeleccionada = provincias.find(
          (e) => e.value === provinciaState.value
        );
        //console.log("provinciaSeleccionada", provinciaSeleccionada);
        seccionalSinAsignar.push({
          value: provinciaSeleccionada.seccionalIdPorDefecto,
          label: provinciaSeleccionada.seccionalDescripcionPorDefecto,
        });
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/RefLocalidad?ProvinciaId=${provinciaState.value}`,
          method: "GET",
        },
        processLocalidades
      );
    }
  }, [request, provinciaState]);

  useEffect(() => {
    if (localidadState.value !== "") {           
      const processSeccionales = async (seccionalesObj) => {
        const seccionalesSelect = seccionalesObj
          .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
          .map((seccional) => {
            return {
              value: seccional.id,
              label: `${seccional.codigo} ${seccional.descripcion}`,
            };
          });
        //   console.log("localidadState", localidadState)
        // console.log("seccionalesSelect", seccionalesSelect);        
        // console.log("seccionalSinAsignar", seccionalSinAsignar);
        
        setSeccionales(
          seccionalesSelect.length > 0 ? seccionalesSelect : seccionalSinAsignar
        );
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Seccional/GetSeccionalesSpecs?LocalidadId=${localidadState.value}`,
          method: "GET",
        },
        processSeccionales
      );
    }
  }, [request, localidadState]);

  useEffect(() => {
    const processEstadosCiviles = async (estadosCivilesObj) => {
      const estadosCivilesSelect = estadosCivilesObj.map((estadoCivil) => {
        return { value: estadoCivil.id, label: estadoCivil.descripcion };
      });
      //console.log("seccionalesSelect", seccionalesSelect);
      setEstadosCiviles(estadosCivilesSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/EstadoCivil`,
        method: "GET",
      },
      processEstadosCiviles
    );
  }, [request]);

  useEffect(() => {
    const processTiposDocumentos = async (tiposDocumentosObj) => {
      const tipoDocumentoSelect = tiposDocumentosObj.map((tipoDocumento) => {
        return { value: tipoDocumento.id, label: tipoDocumento.descripcion };
      });
      //console.log("seccionalesSelect", seccionalesSelect);
      setTiposDocumentos(tipoDocumentoSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/TipoDocumento`,
        method: "GET",
      },
      processTiposDocumentos
    );
  }, [request]);

  //#endregion

  //#region submit afiliado
  const afiliadoAgregarHandler = async () => {
    //event.preventDefault();
    console.log('***')
    setInputsTouched(true);
    if (!formularioIsValid || !formularioEmpleadorIsValid) {
      //console.log("formularioIsValid", formularioIsValid);
      setOpenDialog(true);
      TextCompletarCampos();
      return;
    }
    setAfiliadoProcesando(true);
    //#region Insertar Sol
    if (props.accion === "Agrega" && !afiliadoExiste) {
      const empresa = {
        cuit: cuitEmpresa,
        razonSocial: padronEmpresaRespuesta
          ? padronEmpresaRespuesta?.razonSocial ??
            `${padronEmpresaRespuesta?.apellido} ${padronEmpresaRespuesta?.nombre}`
          : "",
        claveTipo: padronEmpresaRespuesta.tipoClave,
        claveEstado: padronEmpresaRespuesta.estadoClave,
        claveInactivaAsociada: padronEmpresaRespuesta.claveInactivaAsociada,
        actividadPrincipalDescripcion:
          padronEmpresaRespuesta.descripcionActividadPrincipal,
        actividadPrincipalId: padronEmpresaRespuesta.idActividadPrincipal,
        actividadPrincipalPeriodo:
          padronEmpresaRespuesta.periodoActividadPrincipal,
        contratoSocialFecha: padronEmpresaRespuesta.fechaContratoSocial,
        cierreMes: padronEmpresaRespuesta.mesCierre,
        email: correoEmpresa,
        telefono: telefonoEmpresa,
        domicilioCalle: "string",
        domicilioNumero: 0,
        domicilioPiso: "string",
        domicilioDpto: "string",
        domicilioSector: "string",
        domicilioTorre: "string",
        domicilioManzana: "string",
        domicilioProvinciasId: 0,
        domicilioLocalidadesId: 0,
        domicilioCodigoPostal: 0,
        domicilioCPA: "string",
        domicilioTipo: "string",
        domicilioEstado: "string",
        domicilioDatoAdicional: "string",
        domicilioDatoAdicionalTipo: "string",
        ciiU1: padronEmpresaRespuesta.ciiU1,
        ciiU2: padronEmpresaRespuesta.ciiU2,
        ciiU3: padronEmpresaRespuesta.ciiU3,
      };

      const domicilioRealAFIP = padronRespuesta.domicilios.find(
        (domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"
      );
      const nuevoAfiliado = {
        cuil: +cuilState.value,
        nombre: `${padronRespuesta?.apellido ?? ""} ${
          padronRespuesta?.nombre ?? ""
        }`,
        puestoId: +puestoState.value,
        fechaIngreso: null,
        fechaEgreso: null,
        nacionalidadId: +nacionalidadState.value,
        //empresaId: +empresaId,
        seccionalId: +seccionalState.value,
        sexoId: +sexoState.value,
        tipoDocumentoId: +tipoDocumentoState.value,
        documento: +numeroDocumentoState.value,
        actividadId: +actividadState.value,
        //estadoSolicitud: afiliado.estadoSolicitud,
        estadoSolicitudId:
          ultimaDDJJ.condicion === "RA" || ultimaDDJJ.condicion === "RM"
            ? 2
            : 1,
        estadoSolicitudObservaciones:
          ultimaDDJJ.condicion === "RA" || ultimaDDJJ.condicion === "RM"
            ? "Validación Automática"
            : null,
        estadoCivilId: +estadoCivilState.value,
        refLocalidadId: +localidadState.value,
        domicilio: domicilioState.value,
        telefono: telefonoState.value,
        correo: emailState.value,
        celular: "",
        fechaNacimiento: fechaNacimientoState.value,
        afipcuil: +cuilState.value,
        afipFechaNacimiento: padronRespuesta?.fechaNacimiento,
        afipNombre: padronRespuesta?.nombre ?? "",
        afipApellido: padronRespuesta?.apellido ?? "",
        afipRazonSocial: "",
        afipTipoDocumento: padronRespuesta?.tipoDocumento,
        afipNumeroDocumento: padronRespuesta?.numeroDocumento,
        afipTipoPersona: padronRespuesta?.tipoPersona,
        afipTipoClave: padronRespuesta?.tipoClave,
        afipEstadoClave: padronRespuesta?.estadoClave,
        afipClaveInactivaAsociada: 0,
        afipFechaFallecimiento: padronRespuesta?.fechaFallecimiento,
        afipFormaJuridica: padronRespuesta?.formaJuridica,
        afipActividadPrincipal: padronRespuesta?.descripcionActividadPrincipal,
        afipIdActividadPrincipal: padronRespuesta?.idActividadPrincipal,
        afipPeriodoActividadPrincipal:
          padronRespuesta?.periodoActividadPrincipal,
        afipFechaContratoSocial: padronRespuesta?.fechaContratoSocial,
        afipMesCierre: padronRespuesta?.mesCierre,
        afipDomicilioDireccion: domicilioRealAFIP?.direccion,
        afipDomicilioCalle: domicilioRealAFIP?.calle,
        afipDomicilioNumero: domicilioRealAFIP?.numero,
        afipDomicilioPiso: domicilioRealAFIP?.piso,
        afipDomicilioDepto: domicilioRealAFIP?.oficinaDptoLocal,
        afipDomicilioSector: domicilioRealAFIP?.sector,
        afipDomicilioTorre: domicilioRealAFIP?.torre,
        afipDomicilioManzana: domicilioRealAFIP?.manzana,
        afipDomicilioLocalidad: domicilioRealAFIP?.localidad,
        afipDomicilioProvincia: domicilioRealAFIP?.descripcionProvincia,
        afipDomicilioIdProvincia: domicilioRealAFIP?.idProvincia,
        afipDomicilioCodigoPostal: domicilioRealAFIP?.codigoPostal,
        afipDomicilioTipo: domicilioRealAFIP?.tipoDomicilio,
        afipDomicilioEstado: domicilioRealAFIP?.estadoDomicilio,
        afipDomicilioDatoAdicional: domicilioRealAFIP?.datoAdicional,
        afipDomicilioTipoDatoAdicional: domicilioRealAFIP?.tipoDatoAdicional,
        empresa: empresa,
				documentacion: documentacionList,
      };

      console.log("POST", nuevoAfiliado);
      const afiliadoAgregar = async (afiliadoResponseObj) => {
        // console.log({
        // 	afiliadosObj: afiliadoResponseObj,
        // 	documentacionList: documentacionList,
        // });

        setNuevoAfiliadoResponse({...nuevoAfiliado,id:afiliadoResponseObj,estadoSolicitud: "Pendiente"});
        console.log('Afiliado agregado',nuevoAfiliadoResponse);
        setOpenDialog(true);
        //Si se incorpora automaticamente
        if (ultimaDDJJ.condicion === "RA" || ultimaDDJJ.condicion === "RM") {
          //setResolverSolicitudAfiliadoResponse(1);
          setDialogTexto(AFILIADO_AGREGADO_ACTIVO);
        }
        //pasa a resolver solicitud
        else {
          setDialogTexto(AFILIADO_AGREGADO);
          const estadosSolicitudesPendientes = props.estadosSolicitudes.filter(
            (estado) =>
              estado.label === "Pendiente" ||
              estado.label === "Activo" ||
              estado.label === "Observado" ||
              estado.label === "Rechazado"
          );

          setEstadoSolicitudResolver(2);
          setEstadosSolicitudes(estadosSolicitudesPendientes);
          setSelectedTab(3);
        }
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Afiliado`,
          method: "POST",
          body: nuevoAfiliado,
          headers: {
            "Content-Type": "application/json",
          },
        },
        afiliadoAgregar
      );
      //#endregion

      //#region Update Solicitud
    } else if (
      props.accion === "Modifica" ||
      (props.accion === "Agrega" && afiliadoExiste)
    ) {
      ActualizaDatosAfiliado();
    }
    setAfiliadoProcesando(false);
    //#endregion
  };
  //#endregion

  //#region Resolver Solciitud Afiliado
  const resolverSolicitudHandler = (event) => {
    //console.log("id", nuevoAfiliadoObservadoResponse);
    event.preventDefault();

    //Estados Observado y Rechazado llevan comentario obligatorio
    if (
      (afiliado?.estadoSolicitudId === 4 || afiliado?.estadoSolicitud === 5) &&
      resolverSolicitudObs === ""
    ) {
      setDialogTexto("Debe completar el campo Observaciones");
      setOpenDialog(true);
      return;
    }

    //Controles
    console.log("afiliado", afiliado);
    console.log("estadoSolicitudResolver", estadoSolicitudResolver);
    if (afiliado?.estadoSolicitudId === estadoSolicitudResolver) {
      setDialogTexto(
        `El estado seleccionado es el mismo que posee actualmente el afiliado`
      );
      setOpenDialog(true);

      return;
    }

    const patchAfiliado = [
      {
        path: "EstadoSolicitudId",
        op: "replace",
        value: estadoSolicitudResolver,
      },
      {
        path: "FechaIngreso",
        op: "replace",
        value: null, //moment(resolverSolicitudFechaIngreso).format("yyyy-MM-DD"),
      },
      {
        path: "NroAfiliado",
        op: "replace",
        value: "0",
      },
      {
        path: "EstadoSolicitudObservaciones",
        op: "replace",
        value: resolverSolicitudObs,
      },
      {
        path: "FechaEgreso",
        op: "replace",
        value: null, //moment(resolverSolicitudFechaIngreso).format("yyyy-MM-DD"),
      },
    ];

    const resolverSolicitudAfiliado = async (
      resolverSolicitudAfiliadoResponse
    ) => {
      if (resolverSolicitudAfiliadoResponse) {
        console.log("props.estadosSolicitudes", props.estadosSolicitudes);
        const estadoSolicitudSel = props.estadosSolicitudes.find(
          (estadoSolicitudSel) =>
            estadoSolicitudSel.value === +estadoSolicitudResolver
        );
        console.log("estadoSolicitudSel", estadoSolicitudSel);
        setDialogTexto(
          `${AFILIADO_SOLICITUDRESUELTA} ${estadoSolicitudSel.label}!`
        );
        setOpenDialog(true);
        setNuevoAfiliadoResponse({...nuevoAfiliadoResponse,  estadoSolicitud:  estadoSolicitudSel.label})

        if (+estadoSolicitudResolver === 2) {
          setShowImprimirLiquidacion(true);
        }
      }
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Afiliado?Id=${nuevoAfiliadoResponse.id}`,
        method: "PATCH",
        body: patchAfiliado,
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      },
      resolverSolicitudAfiliado
    );
  };
  //#endregion

  //#region Operacions validar CUIT/CUIL
  const validarAfiliadoCUILHandler = () => {
    setCUILLoading(true);
    console.log("afiliado", afiliado);
    const processConsultaPadron = async (padronObj) => {
      console.log("padronObj", padronObj);
      if (padronObj.fechaFallecimiento !== "0001-01-01T00:00:00") {
        setCUILLoading(false);
        setDialogTexto(`Error validando CUIL - Persona fallecida`);
        setOpenDialog(true);

        return;
      }

      setCuilValidado(true);
      setPadronRespuesta(padronObj);
      //Solo actualizo los datos principales si estoy agregando solicitud
      let domicilioReal = "";
      if (props.accion === "Agrega") {
        dispatchNombre({
          type: "USER_INPUT",
          value: `${padronObj.apellido} ${padronObj.nombre ?? ""}`,
        });
        dispatchFechaNacimiento({
          type: "USER_INPUT",
          value: moment(padronObj.fechaNacimiento).format("yyyy-MM-DD"),
        });

        //tipo doc
        const tipoDoc = tiposDocumentos.filter(
          (tipoDoc) => tipoDoc.label === padronObj.tipoDocumento
        );
        dispatchTipoDocumento({
          type: "USER_INPUT",
          value: tipoDoc[0]?.value ?? "",
        });
        dispatchNumeroDocumento({
          type: "USER_INPUT",
          value: padronObj.numeroDocumento,
        });
        domicilioReal = padronObj.domicilios.find(
          (domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"
        );

        dispatchDomicilio({
          type: "USER_INPUT",
          value: domicilioReal.direccion,
        });
        dispatchNacionalidad({
          type: "USER_INPUT",
          value: nacionalidades[5].value,
        });

        dispatchActividad({
          type: "USER_INPUT",
          value: 1,
        })

        //provincia
        const provincia = provincias.find(
          (provincia) => provincia.idProvinciaAFIP === domicilioReal.idProvincia
        );
        dispatchProvincia({ 
          type: "USER_INPUT", 
          value: provincia.value, 
        });

        //localidad
        const processLocalidades = async (localidadesObj) => {
          //console.log("localidades", localidadesObj);
          //console.log("localidad", localidadesObj[0].id);
          const localidad = localidadesObj.find(
            (localidad) =>
              localidad.codPostal === parseInt(domicilioReal.codigoPostal)
          );
          //console.log("localidad", localidad)
          dispatchLocalidad({
            type: "USER_INPUT",
            value: localidadesObj[0].id ?? "",
          });
          dispatchLocalidad({ type: "USER_INPUT", value: localidad.value });
        };

        request(
          {
            baseURL: "Afiliaciones",
            endpoint: `/RefLocalidad?CodigoPostal=${parseInt(
              domicilioReal?.codigoPostal
            )}`,
            method: "GET",
          },
          processLocalidades
        );
      }

      if (props.accion === "Modifica") {
        //console.log("va a mandar padron", padronObj)
        if (!fechaNacimientoState.isValid) {
          dispatchFechaNacimiento({
            type: "USER_INPUT",
            value: moment(padronObj.fechaNacimiento).format("yyyy-MM-DD"),
          });
        }

        ActualizaDatosAfip(padronObj);
      }

      setCUILLoading(false);
    };
    
    request(      
      {        
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${
          afiliado !== null ? afiliado.cuilValidado : cuilState.value
        }&VerificarHistorico=${false}`,
        method: "GET",
      },
      processConsultaPadron
    );
  };

  const validarEmpresaCUITHandler = () => {
    setCUITLoading(true);
    const processConsultaPadron = async (padronObj) => {
      //console.log("padronObj", padronObj);
      setCuitValidado(true);
      setPadronEmpresaRespuesta(padronObj);
      setCUITEmpresa(padronObj.cuit);
      setRazonSocialEmpresa(
        padronObj?.razonSocial ?? `${padronObj?.apellido} ${padronObj?.nombre}`
      );
      setActividadEmpresa(padronObj?.descripcionActividadPrincipal ?? "");
      setDomicilioEmpresa(
        padronObj ? `${padronObj?.domicilios[1]?.direccion}` : ""
      );
      setLocalidadEmpresa(
        padronObj
          ? padronObj?.domicilios[1]?.localidad ??
              padronObj?.domicilios[1]?.descripcionProvincia
          : ""
      );
      // setTelefonoEmpresa()
      // setCorreoEmpresa()
      // setLugarTrabajoEmpresa()
      //ciius
      setCUITLoading(false);
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${cuitEmpresa}&VerificarHistorico=${true}`,
        method: "GET",
      },
      processConsultaPadron
    );
  };
  //#endregion

  //#region handlers change select
  const handleChangeSelect = (value, name) => {
    //console.log("objetoSeleccionadp", value);
    //console.log("id", name);
    switch (name) {
      case "actividadSelect":
        dispatchActividad({ type: "USER_INPUT", value: value });
        break;

      case "puestoSelect":
        dispatchPuesto({ type: "USER_INPUT", value: value });
        break;

      case "nacionalidadSelect":
        dispatchNacionalidad({ type: "USER_INPUT", value: value });
        break;

      case "sexoSelect":
        dispatchSexo({ type: "USER_INPUT", value: value });
        break;

      case "seccionalSelect":
        dispatchSeccional({ type: "USER_INPUT", value: value });
        break;

      case "estadoCivilSelect":
        dispatchEstadoCivil({ type: "USER_INPUT", value: value });
        break;

      case "tipoDocumentoSelect":
        dispatchTipoDocumento({ type: "USER_INPUT", value: value });
        break;

      case "provinciaSelect":
        dispatchProvincia({ type: "USER_INPUT", value: value });
        dispatchLocalidad({ type: "USER_INPUT", value: "" });
        dispatchSeccional({ type: "USER_INPUT", value: "" });
        break;

      case "localidadSelect":
        //console.log("selectLocalidad", value);
        dispatchLocalidad({ type: "USER_INPUT", value: value });
        break;

      case "estadoSolicitudSelect":
        console.log("estadoSolicitudElegido", value);
        setEstadoSolicitudResolver(value);
        setResolverSolicitudFechaIngreso(value === 2 ? moment(new Date()).format("yyyy-MM-DD") : "")
        break;

      default:
        break;
    }
  };
  //#endregion

  //#region handles Inputs
  const handleInputChange = (value, id) => {
    switch (id) {
      case "cuil":
        setCuilValidado(false);
        setAfiliadoExiste(false);
        setNuevoAfiliadoResponse(null);
        setDialogTexto("");
        setPadronRespuesta(null);
        setCUITEmpresa("");
        dispatchCUIL({ type: "USER_INPUT", value: value });

        dispatchNombre({ type: "USER_INPUT", value: "" });
        dispatchNacionalidad({ type: "USER_INPUT", value: "" });
        dispatchFechaNacimiento({ type: "USER_INPUT", value: "" });
        dispatchEstadoCivil({ type: "USER_INPUT", value: "" });
        dispatchSexo({ type: "USER_INPUT", value: "" });
        dispatchTipoDocumento({ type: "USER_INPUT", value: "" });
        dispatchNumeroDocumento({ type: "USER_INPUT", value: "" });
        dispatchDomicilio({ type: "USER_INPUT", value: "" });
        dispatchProvincia({ type: "USER_INPUT", value: "" });
        dispatchLocalidad({ type: "USER_INPUT", value: "" });
        dispatchSeccional({ type: "USER_INPUT", value: "" });
        dispatchTelefono({ type: "USER_INPUT", value: "" });
        dispatchEmail({ type: "USER_INPUT", value: "" });
        dispatchPuesto({ type: "USER_INPUT", value: "" });
        dispatchActividad({ type: "USER_INPUT", value: "" });

        break;

      case "nombre":
        dispatchNombre({ type: "USER_INPUT", value: value });
        break;

      case "fechaNacimiento":
        //console.log('fecha', value)
        dispatchFechaNacimiento({ type: "USER_INPUT", value: value });
        break;

      case "numeroDocumento":
        dispatchNumeroDocumento({ type: "USER_INPUT", value: value });
        break;

      case "domicilio":
        dispatchDomicilio({ type: "USER_INPUT", value: value });
        break;

      case "telefono":
        dispatchTelefono({ type: "USER_INPUT", value });
        break;

      case "correo":
        dispatchEmail({ type: "USER_INPUT", value: value });
        break;

      case "cuit":
        setCuitValidado(false);
        dispatchCUIT({ type: "USER_INPUT", value: value });
        setCUITEmpresa(value);
        setPadronEmpresaRespuesta(null);
        setRazonSocialEmpresa("");
        setActividadEmpresa("");
        setDomicilioEmpresa("");
        setLocalidadEmpresa("");
        setTelefonoEmpresa("");
        setCorreoEmpresa("");
        setLugarTrabajoEmpresa("");
        //ciius
        break;

      case "telefonoEmpresa":
        setTelefonoEmpresa(value);
        break;

      case "correoEmpresa":
        setCorreoEmpresa(value);
        break;

      case "resolverSolicitudObs":
        setResolverSolicitudObs(value);
        break;

      case "resolverSolicitudFechaIngreso":
        setResolverSolicitudFechaIngreso(moment(value).format("yyyy-MM-DD"));
        break;

      default:
        break;
    }
  };
  //#endregion

  //#region handle Focus
  const handleOnFocus = (id) => {
    console.log("foco en", id);
    // switch (id) {
    //   case "cuil":
    //     setCuilTouched(true);
    //     break;

    //   case "numeroDocumento":
    //     setNumeroDocumentoTouched(true);
    //     break;

    //   case "cuit":
    //     setCuitTouched(true);
    //     break;

    //   default:
    //     break;
    // }
  };
  //#endregion

  //#region handle Close
  const handleCerrarModal = (refresh) => {
    console.log("nuevoAfiliadoResponse*", nuevoAfiliadoResponse);
    console.log('props.accion:',props.accion);
    console.log('dialogTexto',dialogTexto);

    if (dialogTexto == "") 
      props.onClose(false, "Cancela");
    else{
      (props.accion == "Modifica") ?
        props.onClose(afiliadoModificado, props.accion) //SI  MODIFICA AFIL, ENVIO EL AFILIADO MODIFICADO
      : 
        props.onClose(nuevoAfiliadoResponse, props.accion) //SI RESUELVE SOLICIT O AFILIADO ES NUEVO "Agrega", DEVUELVO nuevoAfiliadoResponse, EL COMPONENT PADRE SABRÁ QUE HACER SEGÚN EL ESTADO DEL AFILIADO.
    }
  };
  //#endregion

  //#region handle DDJJ
  const handleSeleccionDDJJ = (row) => {
    //console.log(row.cuit);
    setCUITEmpresa(row.cuit);
    dispatchCUIT({ type: "USER_INPUT", value: row.cuit });
  };
  //#endregion

  //#region Handle tab change
  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };
  //#endregion

  //#region Functions
  const deshabilitarBotonValidarCUIL = () => {
    //console.log("cuilIsValid",cuilIsValid)
    if (!cuilState.isValid) {
      return true;
    }

    return false;
  };

  const InputDisabled = (input) => {
    //console.log("InputDisable")
    if (input !== "cuil" && cuilState.value === "") {
      return true;
    }

    if (
      afiliadoExiste &&
      afiliado?.estadoSolicitudId !== 1 &&
      afiliado?.estadoSolicitudId !== 4 &&
      afiliado?.estadoSolicitudId !== 2
    ) {
      return true;
    }

    if (props.accion === "Modifica" && input === "cuil") {
      return true;
    }

    return false;
  };

  const AgregarModificarAfiliadoDisableHandler = () => {
    if (props.accion === "Agrega") {
      if (afiliadoExiste) {
        return true;
      }
    } else if (props.accion === "Modifica") {
      if (!cuilValidado || !cuitValidado) {
        return true;
      }
    }
    console.log("selectedTab", selectedTab)
    if (selectedTab === 3){
      return true;
    } 
  };

  const AgregarModificarAfiliadoTitulo = () => {
    if (props.accion === "Agrega") {
      if (afiliadoExiste) {
        return "MODIFICA AFILIADO";
      }
      return "AGREGA SOLICITUD";
    } else if (props.accion === "Modifica") {
      return "MODIFICA AFILIADO";
    }

    return "AGREGA SOLICITUD"
  };

  const handleResuelveSolicitudDisable = () => {
    if (props.accion === "Resuelve") {
      //console.log("estadoSolicitud", afiliado?.estadoSolicitudId);
      if (afiliado?.estadoSolicitudId !== 1 || afiliado?.estadoSolicitudId !== 4){
        return false;
      }
    } else if (props.accion === "Agrega") {
      if (afiliadoExiste) {
        return true;
      }
      if (nuevoAfiliadoResponse) {
        return false;
      }
    }
    return true;
  };

  const handleOnDeclaracionesGeneradas = (ddjjs) => {
    if (ddjjs?.length) {
      setUltimaDDJJ(ddjjs[0]);
    }
    const ultimaDDJJ = ddjjs[0];
    console.log("ultimaDDJJ", ultimaDDJJ);
  };
  //#endregion

  //#region Funciones actualizacion
  const ActualizaDatosAfiliado = () => {
    const empresa = {
      cuit: cuitEmpresa,
      razonSocial: padronEmpresaRespuesta
        ? padronEmpresaRespuesta?.razonSocial ??
          `${padronEmpresaRespuesta?.apellido} ${padronEmpresaRespuesta?.nombre}`
        : "",
      claveTipo: padronEmpresaRespuesta.tipoClave,
      claveEstado: padronEmpresaRespuesta.estadoClave,
      claveInactivaAsociada: padronEmpresaRespuesta.claveInactivaAsociada,
      actividadPrincipalDescripcion:
        padronEmpresaRespuesta.descripcionActividadPrincipal,
      actividadPrincipalId: padronEmpresaRespuesta.idActividadPrincipal,
      actividadPrincipalPeriodo:
        padronEmpresaRespuesta.periodoActividadPrincipal,
      contratoSocialFecha: padronEmpresaRespuesta.fechaContratoSocial,
      cierreMes: padronEmpresaRespuesta.mesCierre,
      email: correoEmpresa,
      telefono: telefonoEmpresa,
      domicilioCalle: "string",
      domicilioNumero: 0,
      domicilioPiso: "string",
      domicilioDpto: "string",
      domicilioSector: "string",
      domicilioTorre: "string",
      domicilioManzana: "string",
      domicilioProvinciasId: 0,
      domicilioLocalidadesId: 0,
      domicilioCodigoPostal: 0,
      domicilioCPA: "string",
      domicilioTipo: "string",
      domicilioEstado: "string",
      domicilioDatoAdicional: "string",
      domicilioDatoAdicionalTipo: "string",
      ciiU1: padronEmpresaRespuesta.ciiU1,
      ciiU2: padronEmpresaRespuesta.ciiU2,
      ciiU3: padronEmpresaRespuesta.ciiU3,
    };

    const domicilioRealAFIP = padronRespuesta?.domicilios.find((domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"      
    );
    const afiliadoModificado = {
      id: nuevoAfiliadoResponse.id,
      cuil: +cuilState.value,
      nroAfiliado: +afiliado.nroAfiliado,
      nombre: nombreState.value,
      puestoId: +puestoState.value,
      fechaIngreso: afiliado.fechaIngreso,
      fechaEgreso: afiliado.fechaEgreso,
      nacionalidadId: +nacionalidadState.value,
      //empresaCUIT: +cuitEmpresa,
      seccionalId: +seccionalState.value,
      sexoId: +sexoState.value,
      tipoDocumentoId: +tipoDocumentoState.value,
      documento: +numeroDocumentoState.value,
      actividadId: +actividadState.value,
      estadoSolicitud: afiliado.estadoSolicitud,
      estadoSolicitudId: +afiliado.estadoSolicitudId,
      estadoSolicitudObservacion: afiliado.estadoSolicitudObservacion,
      estadoCivilId: +estadoCivilState.value,
      refLocalidadId: +localidadState.value,
      domicilio: domicilioState.value,
      telefono: telefonoState.value,
      correo: emailState.value,
      celular: "",
      fechaNacimiento: fechaNacimientoState.value,
      afipcuil: +cuilState.value,
      afipFechaNacimiento:
        padronRespuesta !== null
          ? padronRespuesta.fechaNacimiento
          : afiliado.afipFechaFallecimiento,
      afipNombre:
        padronRespuesta !== null ? padronRespuesta.nombre : afiliado.afipNombre,
      afipApellido:
        padronRespuesta !== null
          ? padronRespuesta.apellido
          : afiliado.afipApellido,
      afipRazonSocial: "",
      afipTipoDocumento:
        padronRespuesta !== null
          ? padronRespuesta.tipoDocumento
          : afiliado.afipTipoDocumento,
      afipNumeroDocumento:
        padronRespuesta !== null
          ? padronRespuesta.numeroDocumento
          : afiliado.afipNumeroDocumento,
      afipTipoPersona:
        padronRespuesta !== null
          ? padronRespuesta.tipoPersona
          : afiliado.afipTipoPersona,
      afipTipoClave:
        padronRespuesta !== null
          ? padronRespuesta.tipoClave
          : afiliado.afipTipoClave,
      afipEstadoClave:
        padronRespuesta !== null
          ? padronRespuesta.estadoClave
          : afiliado.afipEstadoClave,
      afipClaveInactivaAsociada:
        padronRespuesta !== null
          ? padronRespuesta.claveInactivaAsociada
          : afiliado.afipClaveInactivaAsociada,
      afipFechaFallecimiento:
        padronRespuesta !== null
          ? padronRespuesta.fechaFallecimiento
          : afiliado.afipFechaFallecimiento,
      afipFormaJuridica:
        padronRespuesta !== null
          ? padronRespuesta.formaJuridica
          : afiliado.afip,
      afipActividadPrincipal:
        padronRespuesta !== null
          ? padronRespuesta.descripcionActividadPrincipal
          : afiliado.afip,
      afipIdActividadPrincipal:
        padronRespuesta !== null
          ? padronRespuesta.idActividadPrincipal
          : afiliado.afip,
      afipPeriodoActividadPrincipal:
        padronRespuesta !== null
          ? padronRespuesta.periodoActividadPrincipal
          : afiliado.afip,
      afipFechaContratoSocial:
        padronRespuesta !== null
          ? padronRespuesta.afipFechaContratoSocial
          : afiliado.afip,
      afipMesCierre:
        padronRespuesta !== null ? padronRespuesta.mesCierre : afiliado.afip,
      afipDomicilioDireccion:
        padronRespuesta !== null
          ? `${domicilioRealAFIP.calle} ${domicilioRealAFIP.numero}`
          : afiliado.afipDomicilioDireccion,
      afipDomicilioCalle:
        padronRespuesta !== null
          ? domicilioRealAFIP.calle
          : afiliado.afipDomicilioCalle,
      afipDomicilioNumero:
        padronRespuesta !== null
          ? domicilioRealAFIP.numero
          : afiliado.afipDomicilioNumero,
      afipDomicilioPiso:
        padronRespuesta !== null
          ? domicilioRealAFIP.piso
          : afiliado.afipDomicilioPiso,
      afipDomicilioDepto:
        padronRespuesta !== null
          ? domicilioRealAFIP.depto
          : afiliado.afipDomicilioDepto,
      afipDomicilioSector:
        padronRespuesta !== null
          ? domicilioRealAFIP.sector
          : afiliado.afipDomicilioSector,
      afipDomicilioTorre:
        padronRespuesta !== null
          ? domicilioRealAFIP.torre
          : afiliado.afipDomicilioTorre,
      afipDomicilioManzana:
        padronRespuesta !== null
          ? domicilioRealAFIP.manzana
          : afiliado.afipDomicilioManzana,
      afipDomicilioLocalidad:
        padronRespuesta !== null
          ? domicilioRealAFIP.localidad
          : afiliado.afipDomicilioLocalidad,
      afipDomicilioProvincia:
        padronRespuesta !== null
          ? domicilioRealAFIP.provincia
          : afiliado.afipDomicilioProvincia,
      afipDomicilioIdProvincia:
        padronRespuesta !== null
          ? domicilioRealAFIP.idProvincia
          : afiliado.afipDomicilioIdProvincia,
      afipDomicilioCodigoPostal:
        padronRespuesta !== null
          ? domicilioRealAFIP.codigoPostal
          : afiliado.afipDomicilioCodigoPostal,
      afipDomicilioTipo:
        padronRespuesta !== null
          ? domicilioRealAFIP.tipo
          : afiliado.afipDomicilioTipo,
      afipDomicilioEstado:
        padronRespuesta !== null
          ? domicilioRealAFIP.estado
          : afiliado.afipDomicilioEstado,
      afipDomicilioDatoAdicional:
        padronRespuesta !== null
          ? domicilioRealAFIP.datoAdicional
          : afiliado.afipDomicilioDatoAdicional,
      afipDomicilioTipoDatoAdicional:
        padronRespuesta !== null
          ? domicilioRealAFIP.tipoDatoAdicional
          : afiliado.afipDomicilioTipoDatoAdicional,
      empresa: empresa,
			documentacion: documentacionList,
    };
    console.log("afiliado modificado", afiliadoModificado);
    // console.log("padronRespuesta", padronRespuesta);
    // console.log("afiliado", afiliado)
    const afiliadoModificar = async (afiliadoModificarResponseObj) => {
      //console.log("afiliadoModificarResponseObj", afiliadoModificarResponseObj);
      setAfiliadoModificado(afiliadoModificado);
      setDialogTexto(AFILIADO_ACTUALIZADO);
      setOpenDialog(true);
      // }
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Afiliado`,
        method: "PUT",
        body: afiliadoModificado,
        headers: {
          "Content-Type": "application/json",
        },
      },
      afiliadoModificar
    );
  };

  const ActualizaDatosAfip = (padronObj) => {
    const patchModelo = ActualizarDatosAfip(padronObj);
    console.log("patchModelo", patchModelo);
    const actualizarDatosAfip = async () => {
      //console.log("afiliadoModificarResponseObj", afiliadoModificarResponseObj);
      setDialogTexto(AFILIADO_DATOSAFIPACTUALIZADO);
      setOpenDialog(true);
      // }
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Afiliado/ActualizarDatosAfip?Id=${afiliado?.id}`,
        method: "PATCH",
        body: patchModelo,
        headers: {
          "Content-Type": "application/json",
        },
      },
      actualizarDatosAfip
    );
  };
  //#endregion

  //#region Dialog or alert
  const handleCloseDialog = () => {
    
    if (
      dialogTexto.includes('El afiliado ya está cargado')){
        setDialogTexto("");//limpio el dialogo para que al cerrar el dialog no recargue el browse
      }
   
    setOpenDialog(false);
    //setDialogTexto("");
    if (
      dialogTexto.includes(AFILIADO_SOLICITUDRESUELTA) ||
      dialogTexto === AFILIADO_ACTUALIZADO ||
      dialogTexto === AFILIADO_AGREGADO_ACTIVO
    ) {
      handleCerrarModal(true);
    }
  };
  //#endregion

  return (
		<>
			<div>
				<Dialog onClose={handleCloseDialog} open={openDialog}>
					<DialogContent dividers>
						<Typography gutterBottom>{dialogTexto}</Typography>
					</DialogContent>
					<DialogActions>
						<Button className="botonAmarillo" onClick={handleCloseDialog}>Cierra</Button>
					</DialogActions>
				</Dialog>
			</div>
			<Modal onClose={props.onClose}>
				<CabeceraABMAfiliado
					cuilState={cuilState}
					nombreState={nombreState}
					afiliadoExiste={afiliadoExiste}
					padronRespuesta={padronRespuesta}
					afiliado={afiliado}
					estadoSolicitudDescripcion={estadoSolicitudDescripcion}
				/>

				<div className={classes.div}>
					<Tabs
						value={selectedTab}
						onChange={handleChangeTab}
						aria-label="basic tabs example"
					>
						<Tab
							label="Datos Personales"
							//disabled={nuevoAfiliadoResponse ? true : false}
						/>
						<Tab
							label="Datos Empleador"
							disabled={formularioIsValid ? false : true}
						/>
						<Tab
							label={
								/*padronRespuesta ? `DDJJ UATRE de ${cuilState.value} ${nombre}` : //es demasiado grande el texto para el tab*/ "DDJJ UATRE"
							}
							disabled={cuilState.isValid ? false : true}
						/>
						<Tab
							label="Resuelve Solicitud"
							disabled={handleResuelveSolicitudDisable()}
							hidden={
								props.accion === "Agrega" || props.accion === "Resuelve"
									? false
									: true
							}
						/>
						<Tab
							label="Documentacion"
							disabled={cuitState.isValid ? false : true}
						/>
					</Tabs>
				</div>
				{selectedTab === 0 && (
					<div className={classes.div}>
						{/* region Datos Principales */}
						<div className={classes.renglon}>
							<div className={classes.input25}>
								<InputMaterialMask
									id="cuil"
									onFocus={handleOnFocus}
									value={cuilState.value.toString()}
									label="CUIL"
									disabled={
										InputDisabled("cuil") || afiliado?.estadoSolicitudId === 2
									}
									width={98}
									onChange={handleInputChange}
									helperText={
										!cuilState.isValid && cuilState.value !== ""
											? "CUIL con formato incorrecto"
											: ""
									}
									error={
										!cuilState.isValid &&
										cuilState.value !== "" &&
										inputsTouched
											? true
											: false
									}
								/>
							</div>
							<div className={classes.input25}>
								<Button
                  className="botonAzul"
									width={80}
									heigth={70}
									disabled={deshabilitarBotonValidarCUIL()}
									onClick={validarAfiliadoCUILHandler}
									loading={cuilLoading}
								>
									{!cuilLoading ? `Valida CUIL` : `Validando...`}
								</Button>
							</div>
							<div className={classes.input25}>
								<InputMaterial
									id="nroAfiliado"
									value={afiliado?.nroAfiliado}
									label="Nro Afiliado"
									onChange={handleInputChange}
									readOnly={true}
								/>
							</div>
							<div className={classes.input25}>
								<InputMaterial
									id="fechaIngreso"
									value={FormatearFecha(afiliado?.fechaIngreso) ?? ""}
									label="Fecha Ingreso"
									onChange={handleInputChange}
                  readOnly={!afiliadoExiste}
								/>
							</div>
						</div>
						<div className={classes.renglon}>
							<div className={classes.input}>
								<InputMaterial
									id="nombre"
									value={nombreState.value ?? ""}
									label="Apellido y Nombre"
									width={100}
									onChange={handleInputChange}
									disabled={InputDisabled()}
									error={!nombreState.isValid && inputsTouched ? true : false}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="tipoDocumentoSelect"
									value={tipoDocumentoState.value}
									options={tiposDocumentos}
									label="Tipo Documento"
									disabled={InputDisabled()}
									onChange={handleChangeSelect}
									//width={98}
									error={
										!tipoDocumentoState.isValid && inputsTouched ? true : false
									}
									helperText
								/>
							</div>
							<div className={classes.input25}>
								<InputMaterial
									id="numeroDocumento"
									onFocus={handleOnFocus}
									value={numeroDocumentoState.value}
									label="Numero Documento"
									disabled={InputDisabled()}
									//width={96}
									onChange={handleInputChange}
									error={
										!numeroDocumentoState.isValid && inputsTouched
											? true
											: false
									}
								/>
							</div>
						</div>
						<div className={classes.renglon}>
							<div className={classes.input25}>
								<InputMaterial
									id="fechaNacimiento"
									value={fechaNacimientoState.value}
									label="Fecha de Nacimiento"
									type="date"
									onChange={handleInputChange}
									disabled={InputDisabled()}
									error={
										!fechaNacimientoState.isValid && inputsTouched
											? true
											: false
									}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="nacionalidadSelect"
									label="Nacionalidad"
									options={nacionalidades}
									value={nacionalidadState.value}
									defaultValue={nacionalidades[0]}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!nacionalidadState.isValid && inputsTouched ? true : false
									}
								/>
								{/* <SearchSelectMaterial
                name="nacionalidadSelect"
                label="Nacionalidad"
                options={nacionalidades}
                value={nacionalidad}
                defaultValue={nacionalidad}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
            />*/}
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="estadoCivilSelect"
									label="Estado Civil"
									options={estadosCiviles}
									value={estadoCivilState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									//width={100}
									error={
										!estadoCivilState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="sexoSelect"
									label="Genero"
									options={sexos}
									value={sexoState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									//width={100}
									error={!sexoState.isValid && inputsTouched ? true : false}
								/>
							</div>
						</div>
						<div className={classes.renglon}>
							<div className={classes.input}>
								<InputMaterial
									id="domicilio"
									value={domicilioState.value}
									label="Domicilio"
									disabled={InputDisabled()}
									onChange={handleInputChange}
									error={
										!domicilioState.isValid && inputsTouched ? true : false
									}
								/>
							</div>

							<div className={classes.input}>
								<SelectMaterial
									name="provinciaSelect"
									label="Provincia"
									options={provincias}
									value={provinciaState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!provinciaState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
							<div className={classes.input}>
								<SelectMaterial
									name="localidadSelect"
									label="Localidad"
									options={localidades}
									value={localidadState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!localidadState.isValid && inputsTouched ? true : false
									}
								/>
								{/* <SearchSelectMaterial
                name="localidadSelect"
                label="Localidad"
                options={localidades}
                value={localidad}
                defaultValue={localidad}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
              /> */}
							</div>
						</div>

						<div className={classes.renglon}>
							<div className={classes.input}>
								<SelectMaterial
									name="seccionalSelect"
									label="Seccional"
									options={seccionales}
									value={seccionalState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!seccionalState.isValid && inputsTouched ? true : false
									}
								/>
								{/* <SearchSelectMaterial
                name="seccionalSelect"
                label="Seccional"
                options={seccionales}
                value={seccional}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
              /> */}
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="puestoSelect"
									label="Oficio"
									options={puestos}
									value={puestoState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={!puestoState.isValid && inputsTouched ? true : false}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="actividadSelect"
									label="Actividad"
									options={actividades}
									value={actividadState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!actividadState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
						</div>

						<div className={classes.renglon}>
							<div className={classes.input}>
								<InputMaterial
									id="telefono"
									value={telefonoState.value}
									label="Telefono/Celular"
									disabled={InputDisabled()}
									width={100}
									onChange={handleInputChange}
								/>
							</div>
							<div className={classes.input}>
								<InputMaterial
									id="correo"
									value={emailState.value}
									label="Correo"
									disabled={InputDisabled()}
									width={100}
									onChange={handleInputChange}
									helperText={
										!emailState.isValid &&
										emailState.value !== "" &&
										emailState.value !== null
											? "Email inválido"
											: ""
									}
									error={
										!emailState.isValid &&
										emailState.value !== "" &&
										emailState.value !== null
											? true
											: false
									}
								/>
							</div>
						</div>

						<DatosAfip afiliado={afiliado} padronRespuesta={padronRespuesta} />
					</div>
				)}
				{selectedTab === 1 && (
					<TabEmpleador
						padronEmpresaRespuesta={padronEmpresaRespuesta}
						cuitEmpresa={cuitEmpresa}
						cuitState={cuitState}
						cuitValidado={cuitValidado}
						cuitLoading={cuitLoading}
						razonSocialEmpresa={razonSocialEmpresa}
						actividadEmpresa={actividadEmpresa}
						domicilioEmpresa={domicilioEmpresa}
						localidadEmpresa={localidadEmpresa}
						telefonoEmpresa={telefonoEmpresa}
						correoEmpresa={correoEmpresa}
						lugarTrabajoEmpresa={lugarTrabajoEmpresa}
						inputsTouched={inputsTouched}
						onHandleInputChange={handleInputChange}
						onValidarEmpresaCUITHandler={validarEmpresaCUITHandler}
						onFocus={handleOnFocus}
					/>
				)}
				{selectedTab === 2 && (
					<>
						<DeclaracionesJuradas
							cuil={afiliado !== null ? afiliado.cuilValidado : cuilState.value}
							onSeleccionRegistro={handleSeleccionDDJJ}
							infoCompleta={true}
							onDeclaracionesGeneradas={handleOnDeclaracionesGeneradas}
							registros={12}
						/>
						<div
							className={classes.div}
							hidden={
								ultimaDDJJ.condicion !== "RA" && ultimaDDJJ.condicion !== "RM"
							}
						>
							<div className={classes.renglon}>
								<h6>
									El afiliado {nombreState.value} de la Empresa{" "}
									{razonSocialEmpresa} está en condiciones de ser incorporado al
									Padrón.
								</h6>
							</div>
							<div className={classes.renglon}>
								<div className={classes.boton}>
									<Button
										className="botonAmarillo"
										width={80}
										onClick={afiliadoAgregarHandler}
									>
										Incorporar al Padrón
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
				{selectedTab === 3 && (
					<ResolverSolicitud
						padronRespuesta={padronRespuesta}
						cuilState={
							afiliado !== null ? afiliado.cuilValidado : cuilState.value
						}
						nombreState={nombreState}
						cuitEmpresa={cuitEmpresa}
						resolverSolicitudFechaIngreso={resolverSolicitudFechaIngreso}
						resolverSolicitudObs={resolverSolicitudObs}
						estadoSolicitud={estadoSolicitudResolver}
						estadosSolicitudes={estadosSolicitudes}
						showImprimirLiquidacion={showImprimirLiquidacion}
						onHandleChangeSelect={handleChangeSelect}
						onHandleInputChange={handleInputChange}
						onResolverSolicitudHandler={resolverSolicitudHandler}
					/>
				)}
				{selectedTab === 4 && (
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
						}}
					/>
				)}
				<div className={classes.footer} >
					<Button 			
            className="botonAzul"			/*className={classes.button}*/
						hidden={props.accion === "Resuelve" ? true : false}
						loading={afiliadoProcesando}
						width={25}
						onClick={afiliadoAgregarHandler}
						disabled={AgregarModificarAfiliadoDisableHandler()}
					>
						{AgregarModificarAfiliadoTitulo()}
					</Button>

					<Button className="botonAmarillo" width={25} onClick={handleCerrarModal} >
						CIERRA
					</Button>
				</div>
			</Modal>
		</>
	);
};

export default AfiliadoAgregar;
