import React, { useEffect, useReducer, useState } from "react";
import Button from "../../ui/Button/Button";
//import Input from "../../ui/Input/Input";
import Modal from "../../ui/Modal/Modal";
import modalCss from "../../ui/Modal/Modal.module.css";
import Grid from "../../ui/Grid/Grid";
import classes from "./AfiliadoAgregar.module.css";
import useHttp from "../../hooks/useHttp";
//import SelectInput from "../../ui/Select/SelectInput";
//import FormatearFecha from "../../helpers/FormatearFecha";
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import InputMaterial from "../../ui/Input/InputMaterial";
import SelectMaterial from "../../ui/Select/SelectMaterial";
import moment from "moment";
import ValidarCUIT from "../../validators/ValidarCUIT";
import AfiliadosUltimaDDJJ from "./declaracionesJuradas/AfiliadosUltimaDDJJ";
import ValidarEmail from "../../validators/ValidarEmail";
import LoadingButtonCustom from "../../ui/LoadingButtonCustom/LoadingButtonCustom";
//import SearchSelectMaterial from "../../ui/Select/SearchSelectMaterial";
import DocumentacionList from "./documentacion/DocumentacionList";
import DocumentacionForm from "./documentacion/DocumentacionForm";
import FormatearFecha from "../../helpers/FormatearFecha";
import InputMaterialMask from "../../ui/Input/InputMaterialMask";
import Formato from "../../helpers/Formato";

//#region gloabes
const seccionalSinAsignar = [
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
  // const [showAlert, setShowAlert] = useState(true);
  // const [textAlert, setTextAlert] = useState("");
  // const [severityAlert, setSeverityAlert] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTexto, setDialogTexto] = useState("");
  //#endregion

  //#region Capturo errores
  useEffect(() => {
    console.log("error", error);
    if (error) {
      if (error.code === 500) {
        setCUILLoading(false);
        // setShowAlert(true);
        // setSeverityAlert("error");
        // setTextAlert(`Error - ${error.message}`);
        //setOpenDialog(true)
        setDialogTexto(`Error - ${error.message}`);
      }

      if (error.code === 404 && cuilLoading) {
        setCUILLoading(false);
        // setShowAlert(true);
        // setSeverityAlert("error");
        // //setTextAlert(`Error - ${error.message}`);
        // setTextAlert(`Error - No existe el CUIL ${cuil} en el Padron de AFIP`);
        //setOpenDialog(true);
        setDialogTexto(
          `Error - No existe el CUIL ${cuil} en el Padron de AFIP`
        );
      }

      if (error.code === 404 && cuitLoading) {
        setCUITLoading(false);
        // setShowAlert(true);
        // setSeverityAlert("error");
        // //setTextAlert(`Error - ${error.message}`);
        // setTextAlert(
        //   `Error - No existe el CUIT ${cuitEmpresa} en el Padron de AFIP`
        // );
        //setOpenDialog(true);
        setDialogTexto(
          `Error - No existe el CUIT ${cuitEmpresa} en el Padron de AFIP`
        );
      }

      return;
    }

    console.log("dialogTexto", dialogTexto);
    if (dialogTexto !== "") {
      setOpenDialog(true);
    }
  }, [error, dialogTexto]);
  //#endregion

  //#region Variables de estado para ButtonLoadingCustom
  const [cuilLoading, setCUILLoading] = useState(false);
  const [cuitLoading, setCUITLoading] = useState(false);
  //#endregion

  //#region estados para validaciones
  const [formularioIsValid, setFormularioIsValid] = useState(false);
  const [formularioEmpleadorIsValid, setFormularioEmpleadorIsValid] =
    useState(false);
  const [showImprimirLiquidacion, setShowImprimirLiquidacion] = useState(false);
  const [
    resolverSolicitudAfiliadoResponse,
    setResolverSolicitudAfiliadoResponse,
  ] = useState(0);
  const [cuilValidado, setCuilValidado] = useState(false);
  const [cuitValidado, setCuitValidado] = useState(false);
  const [ultimaDDJJ, setUltimaDDJJ] = useState([]);
  // const [accion, setAccion] = useState("")
  // setAccion(props.accion)
  //#endregion

  //#region variables para respuestas de servicios
  const [nuevoAfiliadoResponse, setNuevoAfiliadoResponse] = useState(null);
  // const [nuevoAfiliadoObservadoResponse, setNuevoAfiliadoObservadoResponse] =
  //   useState(null);
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

  const [documentacionList, setDocumentacionList] = useState({
    data: [],
    idGen: 0,
  });
  const [documentacionItem, setDocumentacionItem] = useState({});
  //#endregion

  //#region Datos Personales Formulario
  const [afiliado, setAfiliado] = useState(null);
  const [actividad, setActividad] = useState("");
  const [puesto, setPuesto] = useState("");
  const [sexo, setSexo] = useState("");
  const [nacionalidad, setNacionalidad] = useState(""); //useState(initialObject);
  const [seccional, setSeccional] = useState("");
  const [provincia, setProvincia] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cuil, setCUIL] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [estadoSolicitud, setEstadoSolicitud] = useState(1);
  const [estadoSolicitudDescripcion, setEstadoSolicitudDescripcion] =
    useState("");
  const [resolverSolicitudObs, setResolverSolicitudObs] = useState("");
  const [resolverSolicitudFechaIngreso, setResolverSolicitudFechaIngreso] = useState(moment(new Date()).format("yyyy-MM-DD"));

  const [nombreAFIP, setNombreAFIP] = useState("");
  const [fechaNacimientoAFIP, setFechaNacimientoAFIP] = useState("");
  const [cuilAFIP, setCUILAFIP] = useState("");
  const [tipoDocumentoAFIP, setTipoDocumentoAFIP] = useState("");
  const [numeroDocumentoAFIP, setNumeroDocumentoAFIP] = useState("");
  const [estadoClaveAFIP, setEstadoClaveAFIP] = useState("");
  const [domicilioRealAFIP, setDomicilioRealAFIP] = useState(null);
  const [tipoPersonaAFIP, setTipoPersonaAFIP] = useState("");
  const [tipoClaveAFIP, setTipoClaveAFIP] = useState("");
  const [
    descripcionActividadPrincipalAFIP,
    setDescripcionActividadPrincipalAFIP,
  ] = useState("");
  const [idActividadPrincipalAFIP, setIdActividadPrincipalAFIP] = useState("");
  const [periodoActividadPrincipalAFIP, setPeriodoActividadPrincipalAFIP] =
    useState("");
  const [mesCierreAFIP, setMesCierreAFIP] = useState("");

  const [estadosSolicitudes, setEstadosSolicitudes] = useState([]);
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
  const [empresaId, setEmpresaId] = useState(0);
  //#endregion

  //#region manejo de validaciones
  // const [cuilHelperText, setCUILHelperText] = useState("");
  // const [cuitHelperText, setCUITHelperText] = useState("");
  const [cuilIsValid, setCUILIsValid] = useState(false);
  const cuilReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: ValidarCUIT(action.value) };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: ValidarCUIT(state.value) };
    }
    return { value: "", isValid: false };
  };

  const [cuilState, dispatchCUIL] = useReducer(cuilReducer, {
    value: "",
    isValid: false,
  });

  const [nombreIsValid, setNombreIsValid] = useState(false);
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

  const [nombreState, dispatchNombre] = useReducer(nombreReducer, {
    value: "",
    isValid: false,
  });

  const [cuitIsValid, setCUITIsValid] = useState(false);
  const cuitReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      console.log("action.value", action.value)
      return { value: action.value, isValid: ValidarCUIT(action.value) };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: ValidarCUIT(state.value) };
    }
    return { value: "", isValid: false };
  };

  const [cuitState, dispatchCUIT] = useReducer(cuitReducer, {
    value: "",
    isValid: false,
  });

  const [emailIsValid, setEmailIsValid] = useState(false);
  const emailReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: ValidarEmail(action.value) };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: ValidarEmail(state.value) };
    }
    return { value: "", isValid: false };
  };

  const [emailState, dispatchEmail] = useReducer(emailReducer, {
    value: "",
    isValid: false,
  });

  const [nacionalidadIsValid, setNacionalidadIsValid] = useState(false);
  const nacionalidadReducer = (state, action) => {
    console.log("nacionalidad", action.value);
    if (action.type === "USER_INPUT") {
      return {
        value: action.value,
        isValid: action.value !== "" ? true : false,
      };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [nacionalidadState, dispatchNacionalidad] = useReducer(
    nacionalidadReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [fechaNacimientoIsValid, setFechaNacimientoIsValid] = useState(false);
  const fechaNacimientoReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [fechaNacimientoState, dispatchFechaNacimiento] = useReducer(
    fechaNacimientoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [estadoCivilIsValid, setEstadoCivilIsValid] = useState(false);
  const estadoCivilReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [estadoCivilState, dispatchEstadoCivil] = useReducer(
    estadoCivilReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [generoIsValid, sertGeneroIsValid] = useState(false);
  const generoReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [generoState, dispatchGenero] = useReducer(generoReducer, {
    value: "",
    isValid: false,
  });

  const [tipoDocumentoIsValid, setTipoDocumentoIsValid] = useState(false);
  const tipoDocumentoReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [tipoDocumentoState, dispatchTipoDocumento] = useReducer(
    tipoDocumentoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [numeroDocumentoIsValid, setNumeroDocumentoIsValid] = useState(false);
  const numeroDocumentoReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [numeroDocumentoState, dispatchNumeroDocumento] = useReducer(
    numeroDocumentoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [domicilioIsValid, setDomicilioIsValid] = useState(false);
  const domicilioReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [domicilioState, dispatchDomicilio] = useReducer(domicilioReducer, {
    value: "",
    isValid: false,
  });

  const [provinciaIsValid, setProvinciaIsValid] = useState(false);
  const provinciaReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [provinciaState, dispatchProvincia] = useReducer(provinciaReducer, {
    value: "",
    isValid: false,
  });

  const [localidadIsValid, setLocalidadIsValid] = useState(false);
  const localidadReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [localidadState, dispatchLocalidad] = useReducer(localidadReducer, {
    value: "",
    isValid: false,
  });

  const [seccionalIsValid, setSeccionalIsValid] = useState(false);
  const seccionalReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [seccionalState, dispatchSeccional] = useReducer(seccionalReducer, {
    value: "",
    isValid: false,
  });

  const [oficioIsValid, setOficioIsValid] = useState(false);
  const oficioReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [oficioState, dispatchOficio] = useReducer(oficioReducer, {
    value: "",
    isValid: false,
  });

  const [actividadIsValid, setActividadIsValid] = useState(false);
  const actividadReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value ? true : false };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value ? true : false };
    }
    return { value: "", isValid: false };
  };

  const [actividadState, dispatchActividad] = useReducer(actividadReducer, {
    value: "",
    isValid: false,
  });

  //checking
  useEffect(() => {
    const identifier = setTimeout(() => {
      //setAfiliadoExiste(false);
      setCUILIsValid(cuilState.isValid);
      setNombreIsValid(nombreState.isValid);
      setNacionalidadIsValid(nacionalidadState.isValid);
      setFechaNacimientoIsValid(fechaNacimientoState.isValid);
      setEstadoCivilIsValid(estadoCivilState.isValid);
      sertGeneroIsValid(generoState.isValid);
      setTipoDocumentoIsValid(tipoDocumentoState.isValid);
      setNumeroDocumentoIsValid(numeroDocumentoState.isValid);
      setDomicilioIsValid(domicilioState.isValid);
      setProvinciaIsValid(provinciaState.isValid);
      setLocalidadIsValid(localidadState.isValid);
      setSeccionalIsValid(seccionalState.isValid);
      setOficioIsValid(oficioState.isValid);
      setActividadIsValid(actividadState.isValid);
      setEmailIsValid(emailState.isValid);

      if (
        cuilState.isValid &&
        nombreState.isValid &&
        nacionalidadState.isValid &&
        fechaNacimientoState.isValid &&
        estadoCivilState.isValid &&
        generoState.isValid &&
        tipoDocumentoState.isValid &&
        numeroDocumentoState.isValid &&
        domicilioState.isValid &&
        provinciaState.isValid &&
        localidadState.isValid &&
        seccionalState.isValid &&
        oficioState.isValid &&
        actividadState.isValid &&
        (correo !== "" ? emailState.isValid : true)
      ) {
        setFormularioIsValid(true);
      }
    }, 400);

    return () => {
      clearTimeout(identifier);
      //console.log("cleanup");
    };
  }, [
    cuilState.isValid,
    nombreState.isValid,
    estadoCivilState.isValid,
    generoState.isValid,
    tipoDocumentoState.isValid,
    numeroDocumentoState.isValid,
    domicilioState.isValid,
    provinciaState.isValid,
    localidadState.isValid,
    seccionalState.isValid,
    oficioState.isValid,
    actividadState.isValid,
    emailState.isValid,
    fechaNacimientoState.isValid,
    nacionalidadState.isValid,
    correo,
  ]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      console.log("checking empresa.", cuitState.isValid);
      setCUITIsValid(cuitState.isValid);
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

  //#region Manejo de notificaciones y alert
  // useEffect(() => {
  //   const identifier = setTimeout(() => {
  //     //console.log("checking showAlert...", showAlert);
  //     //if (showAlert) {
  //     // setShowAlert(false);
  //     // setTextAlert("");
  //     // setSeverityAlert("");
  //     //}

  //   }, 8000);

  //   return () => {
  //     clearTimeout(identifier);
  //     //console.log("alert");
  //   };
  // }, [showAlert]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      //console.log("checking showAlert...", showAlert);
      if (resolverSolicitudAfiliadoResponse) {
        handleCerrarModal();
      }
    }, 5000);

    return () => {
      clearTimeout(identifier);
      console.log("alert");
      
    };
  }, [resolverSolicitudAfiliadoResponse]);

  //#endregion

  //#region manejo si el afiliado existe
  const [afiliadoExiste, setAfiliadoExiste] = useState(false);
  const [empresaIdExiste, setEmpresaIdExiste] = useState(0);

  useEffect(() => {
    console.log("props.accion", props.accion);
    if (props.accion === "Modifica" || props.accion === "Resuelve") {
      setAfiliadoExiste(true);
      if (cuilParam > 0) {
        setCUIL(cuilParam);
        dispatchCUIL({ type: "USER_INPUT", value: cuilParam });
      }
    }
  }, [cuilParam, props.accion]);

  useEffect(() => {
    if (cuil && cuilIsValid) {
      const processGetAfiliado = async (afiliadoObj) => {
        console.log("afiliadoObj", afiliadoObj);
        setAfiliado(afiliadoObj);
        setCuilValidado(true);
        setNuevoAfiliadoResponse(afiliadoObj.id);
        setAfiliadoExiste(true);
        setPadronRespuesta(true);
        setNombre(afiliadoObj.nombre);
        setNacionalidad(afiliadoObj.nacionalidadId);
        setFechaNacimiento(
          moment(afiliadoObj.fechaNacimiento).format("yyyy-MM-DD")
        );
        setEstadoCivil(afiliadoObj.estadoCivilId);
        setSexo(afiliadoObj.sexoId);
        setProvincia(afiliadoObj.provinciaId);
        setSeccional(afiliadoObj.seccionalId);
        setTipoDocumento(afiliadoObj.tipoDocumentoId);
        setNumeroDocumento(afiliadoObj.documento);
        setTelefono(afiliadoObj.telefono);
        if (afiliadoObj.correo !== null) {
          setCorreo(afiliadoObj.correo);
        }
        setActividad(afiliadoObj.actividadId);
        setPuesto(afiliadoObj.puestoId);
        setDomicilio(afiliadoObj.domicilio);
        setLocalidad(afiliadoObj.refLocalidadId);
        setEstadoSolicitud(afiliadoObj.estadoSolicitudId);
        setEstadoSolicitudDescripcion(afiliadoObj.estadoSolicitud);

        //dispatches para validar los campos
        dispatchCUIL({ type: "USER_INPUT", value: afiliadoObj.cuil });
        dispatchActividad({
          type: "USER_INPUT",
          value: afiliadoObj.actividadId,
        });
        dispatchOficio({ type: "USER_INPUT", value: afiliadoObj.puestoId });
        dispatchNacionalidad({
          type: "USER_INPUT",
          value: afiliadoObj.nacionalidadId,
        });
        dispatchGenero({ type: "USER_INPUT", value: afiliadoObj.sexoId });
        dispatchSeccional({
          type: "USER_INPUT",
          value: afiliadoObj.seccionalId,
        });
        dispatchEstadoCivil({
          type: "USER_INPUT",
          value: afiliadoObj.estadoCivilId,
        });
        dispatchTipoDocumento({
          type: "USER_INPUT",
          value: afiliadoObj.tipoDocumentoId,
        });
        dispatchProvincia({
          type: "USER_INPUT",
          value: afiliadoObj.provinciaId,
        });
        dispatchLocalidad({
          type: "USER_INPUT",
          value: afiliadoObj.refLocalidadId,
        });
        dispatchSeccional({
          type: "USER_INPUT",
          value: afiliadoObj.seccionalId,
        });
        dispatchNombre({ type: "USER_INPUT", value: afiliadoObj.nombre });
        dispatchFechaNacimiento({
          type: "USER_INPUT",
          value: afiliadoObj.fechaNacimiento,
        });
        dispatchNumeroDocumento({
          type: "USER_INPUT",
          value: afiliadoObj.documento,
        });
        dispatchDomicilio({ type: "USER_INPUT", value: afiliadoObj.domicilio });
        dispatchEmail({ type: "USER_INPUT", value: afiliadoObj.correo });

        //datos empleador
        dispatchCUIT({ type: "USER_INPUT", value: afiliadoObj.empresaCUIT });
        setCuitValidado(true);
        setCUITEmpresa(afiliadoObj.empresaCUIT);
        setRazonSocialEmpresa(afiliadoObj.empresa);
        setEmpresaIdExiste(afiliadoObj.empresaId);

        //traer datos de afip
        setNombreAFIP(
          `${afiliadoObj.afipApellido} ${afiliadoObj.afipNombre ?? ""}`
        );
        setFechaNacimientoAFIP(
          moment(afiliadoObj.fechaNacimiento).format("yyyy-MM-DD")
        );
        setCUILAFIP(cuil);
        setTipoDocumentoAFIP(afiliadoObj.afipTipoDocumento);
        setNumeroDocumentoAFIP(afiliadoObj.afipNumeroDocumento);
        setEstadoClaveAFIP(afiliadoObj.afipEstadoClave);
        setDomicilioRealAFIP(afiliadoObj.afipDomicilioDireccion);
        setTipoPersonaAFIP(afiliadoObj.afipTipoPersona);
        setTipoClaveAFIP(afiliadoObj.afipTipoClave);
        setDescripcionActividadPrincipalAFIP(
          afiliadoObj.afipActividadPrincipal
        );
        setIdActividadPrincipalAFIP(afiliadoObj.afipIdActividadPrincipal);
        setPeriodoActividadPrincipalAFIP(
          afiliadoObj.afipPeriodoActividadPrincipal
        );
        setMesCierreAFIP(afiliadoObj.afipMesCierre);

        if (afiliadoObj.estadoSolicitudId === 1) {
          const estadosSolicitudesPendientes = props.estadosSolicitudes.filter(
            (estado) =>
              estado.label === "Pendiente" ||
              estado.label === "Activo" ||
              estado.label === "Observado" ||
              estado.label === "Rechazado"
          );
          console.log("estados", estadosSolicitudesPendientes);
          setEstadosSolicitudes(estadosSolicitudesPendientes);
        } else if (afiliadoObj.estadoSolicitudId === 4) {
          const estadosSolicitudesObservado = props.estadosSolicitudes.filter(
            (estado) =>
              estado.label === "Observado" || estado.label === "Rechazado"
          );
          console.log("estados", estadosSolicitudesObservado);
          setEstadosSolicitudes(estadosSolicitudesObservado);
        }

        //alert
        if (props.accion === "Agrega") {
          // setShowAlert(true);
          // setTextAlert(
          //   `El afiliado ya está cargado para la seccional ${afiliadoObj.seccional}`
          // );
          // setSeverityAlert("info");

          setDialogTexto(
            `El afiliado ya está cargado para la seccional ${afiliadoObj.seccional}`
          );
          return;
        } else if (props.accion === "Resuelve") {
          console.log("a resolver");
          setSelectedTab(3);
        }
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Afiliado/GetAfiliadoByCUIL?CUIL=${cuil}`,
          method: "GET",
        },
        processGetAfiliado
      );
    }
  }, [request, cuil, cuilIsValid]);

  useEffect(() => {
    if (afiliadoExiste && empresaIdExiste > 0) {
      const processGetEmpresa = async (empresaObj) => {
        //console.log("empresaObj", empresaObj);
        setPadronEmpresaRespuesta(empresaObj);
        setEmpresaId(empresaObj.id);
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
          };
        });
      //console.log("seccionalesSelect", seccionalesSelect);
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
    if (provincia !== "") {
      const processLocalidades = async (localidadesObj) => {
        const localidadesSelect = localidadesObj
          .sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
          .map((localidad) => {
            return { value: localidad.id, label: localidad.nombre };
          });
        //console.log("seccionalesSelect", seccionalesSelect);
        setLocalidades(localidadesSelect);
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/RefLocalidad?ProvinciaId=${provincia}`,
          method: "GET",
        },
        processLocalidades
      );
    }
  }, [request, provincia]);

  useEffect(() => {
    if (localidad) {
      const processSeccionales = async (seccionalesObj) => {
        const seccionalesSelect = seccionalesObj
          .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
          .map((seccional) => {
            return {
              value: seccional.id,
              label: `${seccional.codigo} ${seccional.descripcion}`,
            };
          });
        console.log("seccionalesSelect", seccionalesSelect);
        console.log("seccionalSinAsignar", seccionalSinAsignar);
        setSeccionales(
          seccionalesSelect.length > 0 ? seccionalesSelect : seccionalSinAsignar
        );
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Seccional/GetSeccionalesSpecs?LocalidadId=${localidad}`,
          method: "GET",
        },
        processSeccionales
      );
    }
  }, [request, localidad]);

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
  const [clickAgregar, setClickAgregar] = useState(false);
  const afiliadoAgregarHandler = async (event) => {
    event.preventDefault();
    setClickAgregar(true);
    //console.log("domicilioRealAFIP", domicilioRealAFIP);
    if (!formularioIsValid) {
      // setShowAlert(true);
      // setTextAlert("Debe completar todos los campos");
      // setSeverityAlert("error");
      setDialogTexto("Debe completar todos los campos");
      return;
    }
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

      const nuevoAfiliado = {
        cuil: +cuil,
        nombre: `${padronRespuesta?.apellido ?? ""} ${
          padronRespuesta?.nombre ?? ""
        }`,
        puestoId: +puesto,
        fechaIngreso: null,
        fechaEgreso: null,
        nacionalidadId: +nacionalidad,
        //empresaId: +empresaId,
        seccionalId: +seccional,
        sexoId: +sexo,
        tipoDocumentoId: +tipoDocumento,
        documento: +numeroDocumento,
        actividadId: +actividad,
        estadoSolicitudId:
          ultimaDDJJ.condicion === "RA" || ultimaDDJJ.condicion === "RM"
            ? 2
            : 1,
        estadoSolicitudObservaciones:
          ultimaDDJJ.condicion === "RA" || ultimaDDJJ.condicion === "RM"
            ? "Validación Automática"
            : null,
        estadoCivilId: +estadoCivil,
        refLocalidadId: +localidad,
        domicilio: domicilio,
        telefono: telefono,
        correo: correo,
        celular: "",
        fechaNacimiento: fechaNacimiento,
        afipcuil: +cuil,
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
      };

      console.log("POST", nuevoAfiliado);
      const afiliadoAgregar = async (afiliadoResponseObj) => {
        console.log("afiliadosObj", afiliadoResponseObj);

        // Envío documentación enlazada al nuevo afiliado
        documentacionList?.data?.forEach((doc) => {
          if (!doc.refTipoDocumentacionId) return;
          if (!doc.archivoBase64) return;
          const body = {
            entidadTipo: "A",
            entidadId: afiliadoResponseObj,
            refTipoDocumentacionId: doc.refTipoDocumentacionId,
            archivo: doc.archivoBase64,
            observaciones: doc.observaciones,
          };
          request(
            {
              baseURL: "Comunes",
              endpoint: `/DocumentacionEntidad`,
              method: "POST",
              body: body,
              headers: {
                "Content-Type": "application/json",
              },
            },
            async (res) => console.log("OK", body, "res", res),
            async (err) => console.log("Error", body, "err", err)
          );
        });

        setNuevoAfiliadoResponse(afiliadoResponseObj);
        //alert("Afiliado creado con éxito!");
        //Alert
        // setShowAlert(true);
        // setSeverityAlert("success");
        setDialogTexto("Afiliado creado con éxito!");

        //handleCerrarModal();

        //Si se incorpora automaticamente
        if (ultimaDDJJ.condicion === "RA" || ultimaDDJJ.condicion === "RM") {
          setResolverSolicitudAfiliadoResponse(1);
        }
        //pasa a resolver solicitud
        else {
          const estadosSolicitudesPendientes = props.estadosSolicitudes.filter(
            (estado) =>
              estado.label === "Pendiente" ||
              estado.label === "Activo" ||
              estado.label === "Observado" ||
              estado.label === "Rechazado"
          );

          setEstadoSolicitud(1);
          setEstadosSolicitudes(estadosSolicitudesPendientes);
          setSelectedTab(3);
        }

        //setClickAgregar(false);
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
      ActualizaDatosAfiliado(afiliado);
    }
    //#endregion
    setClickAgregar(false);
  };
  //#endregion

  //#region Resolver Solciitud Afiliado
  const resolverSolicitudHandler = (event) => {
    //console.log("id", nuevoAfiliadoObservadoResponse);
    event.preventDefault();

    //Estados Observado y Rechazado llevan comentario obligatorio
    if (
      (estadoSolicitud === 4 || estadoSolicitud === 5) &&
      resolverSolicitudObs === ""
    ) {
      // setShowAlert(true);
      setDialogTexto("Debe completar el campo Observaciones");
      // setSeverityAlert("error");
      return;
    }

    //Controles
    if (afiliado.estadoSolicitudId === estadoSolicitud) {
      // setShowAlert(true);
      // setSeverityAlert("info");
      setDialogTexto(
        `El estado seleccionado es el mismo que posee actualmente el afiliado`
      );

      return;
    }

    const patchAfiliado = [
      {
        path: "EstadoSolicitudId",
        op: "replace",
        value: estadoSolicitud,
      },
      {
        path: "FechaIngreso",
        op: "replace",
        value: moment(resolverSolicitudFechaIngreso).format("yyyy-MM-DD"),
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
    ];

    const resolverSolicitudAfiliado = async (
      resolverSolicitudAfiliadoResponse
    ) => {
      if (resolverSolicitudAfiliadoResponse) {
        console.log("props.estadosSolicitudes", props.estadosSolicitudes);
        const estadoSolicitudSel = props.estadosSolicitudes.find(
          (estadoSolicitudSel) => estadoSolicitudSel.value === +estadoSolicitud
        );
        console.log("estadoSolicitudSel", estadoSolicitudSel);
        // setShowAlert(true);
        // setSeverityAlert("success");
        setDialogTexto(
          `Solicitud resuelta en estado ${estadoSolicitudSel.label}!`
        );
        setResolverSolicitudAfiliadoResponse(resolverSolicitudAfiliadoResponse);
        if (+estadoSolicitud === 2) {
          setShowImprimirLiquidacion(true);
        }
      }
    };

    request(
      {
        baseURL: "Afiliaciones",
        // endpoint: `/Afiliado?Id=${
        //   nuevoAfiliadoResponse !== null
        //     ? nuevoAfiliadoResponse
        //     : nuevoAfiliadoObservadoResponse
        // }`,
        endpoint: `/Afiliado?Id=${nuevoAfiliadoResponse}`,
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

    const processConsultaPadron = async (padronObj) => {
      if (padronObj.fechaFallecimiento !== "0001-01-01T00:00:00") {
        setCUILLoading(false);
        // setShowAlert(true);
        // setSeverityAlert("error");
        setDialogTexto(`Error validando CUIL - Persona fallecida`);

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
        setNombre(`${padronObj.apellido} ${padronObj.nombre ?? ""}`);
        setFechaNacimiento(
          moment(padronObj.fechaNacimiento).format("yyyy-MM-DD")
        );
        dispatchFechaNacimiento({
          type: "USER_INPUT",
          value: padronObj.fechaNacimiento,
        });

        //tipo doc
        const tipoDoc = tiposDocumentos.filter(
          (tipoDoc) => tipoDoc.label === padronObj.tipoDocumento
        );
        setTipoDocumento(tipoDoc[0].value);
        dispatchTipoDocumento({ type: "USER_INPUT", value: tipoDoc[0].value });
        setNumeroDocumento(padronObj.numeroDocumento);
        dispatchNumeroDocumento({
          type: "USER_INPUT",
          value: padronObj.numeroDocumento,
        });
        domicilioReal = padronObj.domicilios.find(
          (domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"
        );
        setDomicilio(domicilioReal.direccion);
        dispatchDomicilio({
          type: "USER_INPUT",
          value: domicilioReal.direccion,
        });
        //console.log("nacionalidad", nacionalidades[5].label);
        // setNacionalidad({
        //   value: nacionalidades[5].value,
        //   label: nacionalidades[5].label,
        // });
        setNacionalidad(nacionalidades[5].value);
        dispatchNacionalidad({
          type: "USER_INPUT",
          value: nacionalidades[5].value,
        });

        //provincia
        const provincia = provincias.find(
          (provincia) => provincia.idProvinciaAFIP === domicilioReal.idProvincia
        );
        setProvincia(provincia.value);
        dispatchProvincia({ type: "USER_INPUT", value: provincia.value });

        //localidad
        const processLocalidades = async (localidadesObj) => {
          //console.log("localidades", localidadesObj);
          //console.log("localidad", localidadesObj[0].id);
          const localidad = localidadesObj.find(
            (localidad) =>
              localidad.codPostal === parseInt(domicilioReal.codigoPostal)
          );
          //console.log("localidad", localidad)
          setLocalidad(localidad ? localidad.id : "");
          dispatchLocalidad({
            type: "USER_INPUT",
            value: localidadesObj[0].id ?? "",
          });
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

      //datos afip
      setNombreAFIP(`${padronObj.apellido} ${padronObj.nombre ?? ""}`);
      setFechaNacimientoAFIP(
        moment(padronObj.fechaNacimiento).format("yyyy-MM-DD")
      );
      setCUILAFIP(padronObj.idPersona);
      setTipoDocumentoAFIP(padronObj.tipoDocumento);
      setNumeroDocumentoAFIP(padronObj.numeroDocumento);
      setEstadoClaveAFIP(padronObj.estadoClave);
      setDomicilioRealAFIP(domicilioReal.direccion);
      setTipoPersonaAFIP(padronObj.tipoPersona);
      setTipoClaveAFIP(padronObj.tipoClave);
      setDescripcionActividadPrincipalAFIP(
        padronObj.descripcionActividadPrincipal
      );
      setIdActividadPrincipalAFIP(padronObj.idActividadPrincipal);
      setPeriodoActividadPrincipalAFIP(padronObj.periodoActividadPrincipal);
      setMesCierreAFIP(padronObj.mesCierre);

      //Resolver solicitud
      setEstadoSolicitud(padronObj.estadoSolicitudId);
      setResolverSolicitudObs(padronObj.estadoSolicitudObservaciones);

      if (props.accion === "Modifica") {
        ActualizaDatosAfiliado(padronObj);
      }

      setCUILLoading(false);
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${cuil}&VerificarHistorico=${false}`,
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
        setActividad(value);
        dispatchActividad({ type: "USER_INPUT", value: value });
        break;

      case "puestoSelect":
        setPuesto(value);
        dispatchOficio({ type: "USER_INPUT", value: value });
        break;

      case "nacionalidadSelect":
        setNacionalidad(value);
        dispatchNacionalidad({ type: "USER_INPUT", value: value });
        break;

      case "sexoSelect":
        setSexo(value);
        dispatchGenero({ type: "USER_INPUT", value: value });
        break;

      case "seccionalSelect":
        //console.log("seccionalValue", value);
        setSeccional(value);
        dispatchSeccional({ type: "USER_INPUT", value: value });
        break;

      case "estadoCivilSelect":
        setEstadoCivil(value);
        dispatchEstadoCivil({ type: "USER_INPUT", value: value });
        break;

      case "tipoDocumentoSelect":
        setTipoDocumento(value);
        dispatchTipoDocumento({ type: "USER_INPUT", value: value });
        break;

      case "provinciaSelect":
        setProvincia(value);
        setLocalidad("");
        setSeccional("");
        dispatchProvincia({ type: "USER_INPUT", value: value });
        dispatchLocalidad({ type: "USER_INPUT", value: "" });
        dispatchSeccional({ type: "USER_INPUT", value: "" });
        break;

      case "localidadSelect":
        //console.log("selectLocalidad", value);
        setLocalidad(value);
        dispatchLocalidad({ type: "USER_INPUT", value: value });
        break;

      case "estadoSolicitudSelect":
        setEstadoSolicitud(value);
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
        setClickAgregar(false);
        // setTextAlert("");
        // setSeverityAlert("");
        setDialogTexto("");
        setPadronRespuesta(null);
        setCUITEmpresa("");

        dispatchCUIL({ type: "USER_INPUT", value: value });
        setCUIL(value);
        setNombre("");
        setNacionalidad("");
        setFechaNacimiento("");
        setEstadoCivil("");
        setSexo("");
        setTipoDocumento("");
        setNumeroDocumento("");
        setDomicilio("");
        setProvincia("");
        setLocalidad("");
        setSeccional("");
        setTelefono("");
        setCorreo("");
        setPuesto("");
        setActividad("");
        dispatchActividad({ type: "USER_INPUT", value: "" });
        break;

      case "nombre":
        dispatchNombre({ type: "USER_INPUT", value: value });
        setNombre(value);
        break;

      case "fechaNacimiento":
        //console.log('fecha', value)
        setFechaNacimiento(value);
        dispatchFechaNacimiento({ type: "USER_INPUT", value: value });
        break;

      case "numeroDocumento":
        setNumeroDocumento(value);
        dispatchNumeroDocumento({ type: "USER_INPUT", value: value });
        break;

      case "domicilio":
        setDomicilio(value);
        dispatchDomicilio({ type: "USER_INPUT", value: value });
        break;

      case "telefono":
        setTelefono(value);
        break;

      case "correo":
        setCorreo(value);
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

      case "resolverSolicitudFechaINgreso":
        setResolverSolicitudFechaIngreso(moment(value).format("yyyy-MM-DD"));
        break;

      default:
        break;
    }
  };
  //#endregion

  //#region handle Close
  const handleCerrarModal = () => {
    props.onClose(nuevoAfiliadoResponse === 0 ? false : true);
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
    // if (padronRespuesta?.idPersona > 0) {
    //   return true;
    // }

    //
    if (estadoSolicitud !== 1 && estadoSolicitud !== 4) {
      return true;
    }

    if (!cuilIsValid) {
      return true;
    }

    return false;
  };

  const InputDisabled = (input) => {
    //console.log("InputDisable")
    if (input !== "cuil" && cuil === "") {
      return true;
    }

    if (
      afiliadoExiste &&
      estadoSolicitud !== 1 &&
      estadoSolicitud !== 4 &&
      estadoSolicitud !== 2
    ) {
      return true;
    }

    // if (padronRespuesta !== null) {

    //   return true;
    // }

    return false;
  };

  const AgregarModificarAfiliadoDisableHandler = () => {
    if (props.accion === "Agrega") {
      if (afiliadoExiste) {
        return true;
      }
    } else if (props.accion === "Modifica") {
      if (cuilValidado && cuitValidado) {
        return false;
      }
      return false;
    }

    return true;
  };

  const AgregarModificarAfiliadoTitulo = () => {
    if (props.accion === "Agrega") {
      if (afiliadoExiste) {
        return "Modifica Afiliado";
      }

      return "Agrega Solicitud";
    } else if (props.accion === "Modifica") {
      return "Modifica Afiliado";
    }
  };

  const handleResuelveSolicitudDisable = () => {
    if (props.accion === "Resuelve") {
      console.log("estadoSolicitud", estadoSolicitud);
      if (estadoSolicitud !== 1 || estadoSolicitud !== 4) {
        return false;
      }
    } else if (props.accion === "Agrega") {
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
  const ActualizaDatosAfiliado = (datosAFIP) => {
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

    const afiliadoModificado = {
      id: nuevoAfiliadoResponse,
      cuil: +cuil,
      nombre: nombre,
      puestoId: +puesto,
      fechaIngreso: null,
      fechaEgreso: null,
      nacionalidadId: +nacionalidad,
      //empresaCUIT: +cuitEmpresa,
      seccionalId: +seccional,
      sexoId: +sexo,
      tipoDocumentoId: +tipoDocumento,
      documento: +numeroDocumento,
      actividadId: +actividad,
      estadoSolicitudId: +estadoSolicitud,
      estadoCivilId: +estadoCivil,
      refLocalidadId: +localidad,
      domicilio: domicilio,
      telefono: telefono,
      correo: correo,
      celular: "",
      fechaNacimiento: fechaNacimiento,
      afipcuil: +cuil,
      afipFechaNacimiento: afiliado.afipFechaNacimiento,
      afipNombre: datosAFIP.nombre ?? afiliado.afipNombre,
      afipApellido: datosAFIP.apellido ?? afiliado.afipApellido,
      afipRazonSocial: "",
      afipTipoDocumento: datosAFIP.tipoDocumento ?? afiliado.afipTipoDocumento,
      afipNumeroDocumento:
        datosAFIP.numeroDocumento ?? afiliado.afipNumeroDocumento,
      afipTipoPersona: datosAFIP.tipoPersona ?? afiliado.afipTipoPersona,
      afipTipoClave: datosAFIP.tipoClave ?? afiliado.afipTipoClave,
      afipEstadoClave: datosAFIP.estadoClave ?? afiliado.afipEstadoClave,
      afipClaveInactivaAsociada: afiliado.afipClaveInactivaAsociada,
      afipFechaFallecimiento: afiliado.afipFechaFallecimiento,
      afipFormaJuridica: datosAFIP.formaJuridica ?? afiliado.afipFormaJuridica,
      afipActividadPrincipal:
        datosAFIP.descripcionActividadPrincipal ??
        afiliado.afipActividadPrincipal,
      afipIdActividadPrincipal:
        datosAFIP.idActividadPrincipal ?? afiliado.afipIdActividadPrincipal,
      afipPeriodoActividadPrincipal:
        datosAFIP.periodoActividadPrincipal ??
        afiliado.afipPeriodoActividadPrincipal,
      afipFechaContratoSocial: afiliado.afipFechaContratoSocial,
      afipMesCierre: datosAFIP.meCierre ?? afiliado.afipMesCierre,
      afipDomicilioDireccion: afiliado.afipDomicilioDireccion,
      afipDomicilioCalle: afiliado.afipDomicilioCalle,
      afipDomicilioNumero: afiliado.afipDomicilioNumero,
      afipDomicilioPiso: afiliado.afipDomicilioPiso,
      afipDomicilioDepto: afiliado.afipDomicilioDepto,
      afipDomicilioSector: afiliado.afipDomicilioSector,
      afipDomicilioTorre: afiliado.afipDomicilioTorre,
      afipDomicilioManzana: afiliado.afipDomicilioManzana,
      afipDomicilioLocalidad: afiliado.afipDomicilioLocalidad,
      afipDomicilioProvincia: afiliado.afipDomicilioProvincia,
      afipDomicilioIdProvincia: afiliado.afipDomicilioIdProvincia,
      afipDomicilioCodigoPostal: afiliado.afipDomicilioCodigoPostal,
      afipDomicilioTipo: afiliado.afipDomicilioTipo,
      afipDomicilioEstado: afiliado.afipDomicilioEstado,
      afipDomicilioDatoAdicional: afiliado.afipDomicilioDatoAdicional,
      afipDomicilioTipoDatoAdicional: afiliado.afipDomicilioTipoDatoAdicional,
      empresa: empresa,
    };
    // console.log("afiliado modificado", afiliadoModificado);
    // console.log("padronRespuesta", padronRespuesta);
    // console.log("afiliado", afiliado)
    const afiliadoModificar = async (afiliadoModificarResponseObj) => {
      console.log("afiliadoModificarResponseObj", afiliadoModificarResponseObj);
      console.log("clickAgregar", clickAgregar);
      // if (clickAgregar)
      // {
      //Alert
      // setShowAlert(true);
      // setSeverityAlert("success");
      setDialogTexto("Afiliado modificado con éxito!");
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
  //#endregion

  //#region Dialog or alert
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // const SimpleDialog = () => {
  //   return (
  //     <Dialog onClose={handleCloseDialog} open={openDialog}>
  //       <DialogTitle>{dialogTexto}</DialogTitle>
  //       <DialogActions>
  //         <Button onClick={handleCloseDialog}>
  //           Cerrar
  //         </Button>
  //       </DialogActions>
  //     </Dialog>
  //   );
  //};

  //#endregion

  return (
    <>
      <div>
        <Dialog          
          dividers
          onClose={handleCloseDialog}
          open={openDialog}
        >
          <DialogContent dividers>
            <Typography gutterBottom>{dialogTexto}</Typography>
          </DialogContent>
          <DialogActions dividers>
            <Button onClick={handleCloseDialog}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </div>
      <Modal onClose={props.onClose}>
        <div className={modalCss.modalCabecera}>
          <div className={classes.div}>
            <div className={classes.alert}>
              {/* <Alert severity={severityAlert} variant="filled">
              {textAlert}
            </Alert> */}
            </div>
          </div>
          <h3 className={classes.titulo}>
            {props.accion === "Modifica"
              ? `Modifica Afiliado: ${cuil} ${nombre}`
              : afiliadoExiste
              ? `Modifica/Consulta Afiliado: ${Formato.Cuit(cuil)} ${nombre}`
              : padronRespuesta
              ? `Agrega Afiliado: ${cuil} ${nombre}`
              : "Agrega Afiliado"}
          </h3>
          <div className={classes.subTituloVentana}>
            <h5 className={classes.titulo}>
              {afiliadoExiste || estadoSolicitud === 4
                ? `Estado Solicitud del Afiliado: ${estadoSolicitudDescripcion}`
                : null}
            </h5>
            <h5 className={classes.titulo}>
              {afiliadoExiste && estadoSolicitud === 2
                ? `- Fecha de Ingreso: ${FormatearFecha(
                    afiliado.fechaIngreso
                  )} - Nro Afiliado: ${afiliado.nroAfiliado}`
                : null}
            </h5>
          </div>
        </div>
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
                /*padronRespuesta ? `DDJJ UATRE de ${cuil} ${nombre}` : //es demasiado grande el texto para el tab*/ "DDJJ UATRE"
              }
              disabled={cuitIsValid ? false : true}
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
            <Tab label="Documentacion" disabled={cuitIsValid ? false : true} />
          </Tabs>
        </div>
        {selectedTab === 0 && (
          <div className={classes.div}>
            {/* region Datos Principales */}
            <div className={classes.renglon}>
              <div className={classes.input25}>
                <InputMaterialMask
                  id="cuil"
                  value={cuil.toString()}
                  label="CUIL"
                  disabled={InputDisabled("cuil") || estadoSolicitud === 2}
                  width={98}
                  onChange={handleInputChange}
                  helperText={
                    !cuilState.isValid && cuil !== ""
                      ? "CUIL con formato incorrecto"
                      : ""
                  }
                  error={
                    (!cuilState.isValid && cuil !== "") ||
                    (!formularioIsValid && clickAgregar)
                      ? true
                      : false
                  }
                />
              </div>
              <div className={classes.input25}>
                <LoadingButtonCustom
                  width={80}
                  heigth={70}
                  disabled={deshabilitarBotonValidarCUIL()}
                  onClick={validarAfiliadoCUILHandler}
                  loading={cuilLoading}
                >
                  {!cuilLoading ? `Validar CUIL` : `Validando...`}
                </LoadingButtonCustom>
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
                  readOnly={true}                  
                />
              </div>
            </div>
            <div className={classes.renglon}>
              <div className={classes.input}>
                <InputMaterial
                  id="nombre"
                  value={nombre ?? ""}
                  label="Apellido y Nombre"
                  width={100}
                  onChange={handleInputChange}
                  disabled={InputDisabled()}
                  error={!nombreState.isValid && clickAgregar ? true : false}
                />
              </div>
              <div className={classes.input25}>
                <SelectMaterial
                  name="tipoDocumentoSelect"
                  value={tipoDocumento}
                  options={tiposDocumentos}
                  label="Tipo Documento"
                  disabled={InputDisabled()}
                  onChange={handleChangeSelect}
                  //width={98}
                  error={
                    !tipoDocumentoState.isValid && clickAgregar ? true : false
                  }
                />
              </div>
              <div className={classes.input25}>
                <InputMaterial
                  id="numeroDocumento"
                  value={numeroDocumento}
                  label="Numero Documento"
                  disabled={InputDisabled()}
                  //width={96}
                  onChange={handleInputChange}
                  error={
                    !numeroDocumentoState.isValid && clickAgregar ? true : false
                  }
                />
              </div>
            </div>
            <div className={classes.renglon}>
              <div className={classes.input25}>
                <InputMaterial
                  id="fechaNacimiento"
                  value={fechaNacimiento}
                  label="Fecha de Nacimiento"
                  type="date"
                  onChange={handleInputChange}
                  disabled={InputDisabled()}
                  error={
                    !fechaNacimientoState.isValid && clickAgregar ? true : false
                  }
                />
              </div>
              <div className={classes.input25}>
                <SelectMaterial
                  name="nacionalidadSelect"
                  label="Nacionalidad"
                  options={nacionalidades}
                  value={nacionalidad}
                  defaultValue={nacionalidades[0]}
                  onChange={handleChangeSelect}
                  disabled={InputDisabled()}
                  error={
                    !nacionalidadState.isValid && clickAgregar ? true : false
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
                  value={estadoCivil}
                  onChange={handleChangeSelect}
                  disabled={InputDisabled()}
                  //width={100}
                  error={
                    !estadoCivilState.isValid && clickAgregar ? true : false
                  }
                />
              </div>
              <div className={classes.input25}>
                <SelectMaterial
                  name="sexoSelect"
                  label="Genero"
                  options={sexos}
                  value={sexo}
                  onChange={handleChangeSelect}
                  disabled={InputDisabled()}
                  //width={100}
                  error={!generoState.isValid && clickAgregar ? true : false}
                />
              </div>
            </div>
            <div className={classes.renglon}>
              <div className={classes.input}>
                <InputMaterial
                  id="domicilio"
                  value={domicilio}
                  label="Domicilio"
                  disabled={InputDisabled()}
                  onChange={handleInputChange}
                  error={!domicilioState.isValid && clickAgregar ? true : false}
                />
              </div>

              <div className={classes.input}>
                <SelectMaterial
                  name="provinciaSelect"
                  label="Provincia"
                  options={provincias}
                  value={provincia}
                  onChange={handleChangeSelect}
                  disabled={InputDisabled()}
                  error={!provinciaState.isValid && clickAgregar ? true : false}
                />
              </div>
              <div className={classes.input}>
                <SelectMaterial
                  name="localidadSelect"
                  label="Localidad"
                  options={localidades}
                  value={localidad}
                  onChange={handleChangeSelect}
                  disabled={InputDisabled()}
                  error={!localidadState.isValid && clickAgregar ? true : false}
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
                  value={seccional}
                  onChange={handleChangeSelect}
                  disabled={InputDisabled()}
                  error={!seccionalState.isValid && clickAgregar ? true : false}
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
                  value={puesto}
                  onChange={handleChangeSelect}
                  disabled={InputDisabled()}
                  error={!oficioState.isValid && clickAgregar ? true : false}
                />
              </div>
              <div className={classes.input25}>
                <SelectMaterial
                  name="actividadSelect"
                  label="Actividad"
                  options={actividades}
                  value={actividad}
                  onChange={handleChangeSelect}
                  disabled={InputDisabled()}
                  error={!actividadState.isValid && clickAgregar ? true : false}
                />
              </div>
            </div>

            <div className={classes.renglon}>
              <div className={classes.input}>
                <InputMaterial
                  id="telefono"
                  value={telefono}
                  label="Telefono/Celular"
                  disabled={InputDisabled()}
                  width={100}
                  onChange={handleInputChange}
                />
              </div>
              <div className={classes.input}>
                <InputMaterial
                  id="correo"
                  value={correo}
                  label="Correo"
                  disabled={InputDisabled()}
                  width={100}
                  onChange={handleInputChange}
                  helperText={
                    !emailState.isValid && correo !== "" && correo !== null
                      ? "Email inválido"
                      : ""
                  }
                  error={
                    !emailIsValid && correo !== "" && correo !== null
                      ? true
                      : false
                  }
                />
              </div>
            </div>
            <div className={classes.renglon}></div>
            <div className={classes.renglon}>
              <h4>Datos AFIP</h4>
            </div>
            <div className={classes.renglon}>
              <div className={classes.input33}>
                <InputMaterial
                  id="nombreYApellidoAFIP"
                  value={nombreAFIP}
                  label="Apellido y Nombre"
                  readOnly={true}
                  // color={nombreAFIP !== afiliado?.afipNombre ? "warning" : ""}
                  // focused={nombreAFIP !== afiliado?.afipNombre ? true : false}
                />
              </div>
              <div className={classes.input20}>
                <InputMaterialMask
                  id="cuilAFIP"
                  value={cuilAFIP.toString()}
                  label="CUIL"
                  readOnly={true}
                  onChange={handleInputChange}                  
                />
              </div>
              <div className={classes.input20}>
                <InputMaterial
                  id="tipoDocumentoAFIP"
                  value={tipoDocumentoAFIP}
                  label="Tipo Documento"
                  readOnly={true}
                  color={
                    tipoDocumentoAFIP !== "" &&
                    tipoDocumentoAFIP !== afiliado?.afipTipoDocumento
                      ? "warning"
                      : ""
                  }
                  focused={
                    tipoDocumentoAFIP !== "" &&
                    tipoDocumentoAFIP !== afiliado?.afipTipoDocumento
                      ? true
                      : false
                  }
                />
              </div>
              <div className={classes.input25}>
                <InputMaterial
                  id="numeroDocumentoAFIP"
                  value={numeroDocumentoAFIP}
                  label="Documento"
                  readOnly={true}
                  color={
                    numeroDocumentoAFIP !== "" &&
                    numeroDocumentoAFIP !== afiliado?.afipNumeroDocumento
                      ? "warning"
                      : ""
                  }
                  focused={
                    numeroDocumentoAFIP !== "" &&
                    numeroDocumentoAFIP !== afiliado?.afipNumeroDocumento
                      ? true
                      : false
                  }
                />
              </div>
            </div>

            <div className={classes.renglon}>
              <div className={classes.input}>
                <InputMaterial
                  id="fechaNacimientoAFIP"
                  type="date"
                  value={fechaNacimientoAFIP}
                  label="Fecha de Nacimiento"
                  readOnly={true}
                />
              </div>
              <div className={classes.input}>
                <InputMaterial
                  id="tipoPersonaAFIP"
                  value={tipoPersonaAFIP}
                  label="Tipo Persona"
                  readOnly={true}
                  color={
                    tipoPersonaAFIP !== "" &&
                    tipoPersonaAFIP !== afiliado?.afipTipoPersona
                      ? "warning"
                      : ""
                  }
                  focused={
                    tipoPersonaAFIP !== "" &&
                    tipoPersonaAFIP !== afiliado?.afipTipoPersona
                      ? true
                      : false
                  }
                />
              </div>
              <div className={classes.input}>
                <InputMaterial
                  id="estadoClaveAFIP"
                  value={estadoClaveAFIP}
                  label="Estado Clave"
                  readOnly={true}
                  color={
                    estadoClaveAFIP !== "" &&
                    estadoClaveAFIP !== afiliado?.afipEstadoClave
                      ? "warning"
                      : ""
                  }
                  focused={
                    estadoClaveAFIP !== "" &&
                    estadoClaveAFIP !== afiliado?.afipEstadoClave
                      ? true
                      : false
                  }
                />
              </div>
              <div className={classes.input}>
                <InputMaterial
                  id="tipoClaveAFIP"
                  value={tipoClaveAFIP}
                  label="Tipo Clave"
                  readOnly={true}
                  color={
                    tipoClaveAFIP !== "" &&
                    tipoClaveAFIP !== afiliado?.afipTipoClave
                      ? "warning"
                      : ""
                  }
                  focused={
                    tipoClaveAFIP !== "" &&
                    tipoClaveAFIP !== afiliado?.afipTipoClave
                      ? true
                      : false
                  }
                />
              </div>
            </div>

            <div className={classes.renglon}>
              <div className={classes.input33}>
                <InputMaterial
                  id="domicilioAFIP"
                  value={domicilioRealAFIP}
                  label="Domicilio"
                  readOnly={true}
                  // color={
                  //   domicilioRealAFIP !== afiliado?.afipNombre ? "success" : ""
                  // }
                  // focused={
                  //   domicilioRealAFIP !== afiliado?.afipNombre ? true : false
                  // }
                />
              </div>
              <div className={classes.input20}>
                <InputMaterial
                  id="idActividadPrincipalAFIP"
                  value={idActividadPrincipalAFIP}
                  label="Id Actividad Principal"
                  readOnly={true}
                  color={
                    idActividadPrincipalAFIP !== "" &&
                    idActividadPrincipalAFIP !==
                      afiliado?.afipIdActividadPrincipal
                      ? "warning"
                      : ""
                  }
                  focused={
                    idActividadPrincipalAFIP !== "" &&
                    idActividadPrincipalAFIP !==
                      afiliado?.afipIdActividadPrincipal
                      ? true
                      : false
                  }
                />
              </div>
              <div className={classes.input20}>
                <InputMaterial
                  id="periodoActividadPrincipalAFIP"
                  value={periodoActividadPrincipalAFIP}
                  label="Per. Actividad Principal"
                  readOnly={true}
                  color={
                    periodoActividadPrincipalAFIP !== "" &&
                    periodoActividadPrincipalAFIP !==
                      afiliado?.afipPeriodoActividadPrincipal
                      ? "warning"
                      : ""
                  }
                  focused={
                    periodoActividadPrincipalAFIP !== "" &&
                    periodoActividadPrincipalAFIP !==
                      afiliado?.afipPeriodoActividadPrincipal
                      ? true
                      : false
                  }
                />
              </div>
              <div className={classes.input25}>
                <InputMaterial
                  id="mesCierreAFIP"
                  value={mesCierreAFIP}
                  label="Mes Cierre"
                  readOnly={true}
                  color={
                    mesCierreAFIP !== "" &&
                    mesCierreAFIP !== afiliado?.afipMesCierre
                      ? "warning"
                      : ""
                  }
                  focused={
                    mesCierreAFIP !== "" &&
                    mesCierreAFIP !== afiliado?.afipMesCierre
                      ? true
                      : false
                  }
                />
              </div>
            </div>

            <div className={classes.renglon}>
              <div className={classes.input100}>
                <InputMaterial
                  id="descripcionActividadPrincipalAFIP"
                  value={descripcionActividadPrincipalAFIP}
                  label="Descripción Actividad Principal"
                  readOnly={true}
                  color={
                    descripcionActividadPrincipalAFIP !== "" &&
                    descripcionActividadPrincipalAFIP !==
                      afiliado?.afipActividadPrincipal
                      ? "warning"
                      : ""
                  }
                  focused={
                    descripcionActividadPrincipalAFIP !== "" &&
                    descripcionActividadPrincipalAFIP !==
                      afiliado?.afipActividadPrincipal
                      ? true
                      : false
                  }
                  width={100}
                />
              </div>
            </div>
          </div>
        )}
        {selectedTab === 1 && (
          <div className={classes.div}>
            <div className={classes.renglon}>
              <div className={classes.input}>
                <InputMaterialMask
                  id="cuit"
                  value={cuitEmpresa.toString()}
                  label="CUIT"
                  disabled={InputDisabled()}
                  width={98}
                  onChange={handleInputChange}
                  helperText={
                    !cuitIsValid && cuitEmpresa.length === 11
                      ? "CUIT inválido"
                      : ""
                  }
                  error={
                    (!cuitState.isValid && cuitEmpresa !== "") ||
                    (!formularioEmpleadorIsValid && clickAgregar)
                      ? true
                      : false
                  }
                />
              </div>
              <LoadingButtonCustom
                width={20}
                heigth={80}
                disabled={cuitValidado ? true : false}
                onClick={validarEmpresaCUITHandler}
                loading={cuitLoading}
              >
                {!cuitLoading ? `Validar CUIT` : `Validando...`}
              </LoadingButtonCustom>
            </div>

            <div className={classes.renglon}>
              <div className={classes.input}>
                <InputMaterial
                  id="razonSocialEmpresa"
                  value={razonSocialEmpresa}
                  label="Razón Social"
                  disabled={true}
                  width={100}
                />
              </div>
              <div className={classes.input}>
                <InputMaterial
                  id="actividadEmpresa"
                  value={actividadEmpresa}
                  label="Actividad"
                  disabled={true}
                  width={100}
                />
              </div>
            </div>

            <div className={classes.renglon}>
              <div className={classes.input}>
                <InputMaterial
                  id="domicilioEmpresa"
                  value={domicilioEmpresa}
                  label="Domicilio"
                  disabled={true}
                  width={100}
                />
              </div>
              <div className={classes.input}>
                <InputMaterial
                  id="localidadEmpresa"
                  value={localidadEmpresa}
                  label="Localidad"
                  disabled={true}
                  width={100}
                />
              </div>
            </div>

            <div className={classes.renglon}>
              <div className={classes.input}>
                <InputMaterial
                  id="telefonoEmpresa"
                  value={telefonoEmpresa}
                  label="Telefono"
                  disabled={false}
                  width={100}
                  onChange={handleInputChange}
                />
              </div>

              <div className={classes.input}>
                <InputMaterial
                  id="correoEmpresa"
                  value={correoEmpresa}
                  label="Correo"
                  disabled={false}
                  width={100}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={classes.renglon}>
              <div className={classes.input100}>
                <InputMaterial
                  id="lugarTrabajoEmpresa"
                  value={lugarTrabajoEmpresa}
                  label="Lugar de Trabajo"
                  disabled={false}
                  //width={100}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={classes.renglonActividad}>
              <div className={classes.input100}>
                <InputMaterial
                  id="CIIU1"
                  value={
                    padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU1
                      ? `${padronEmpresaRespuesta.ciiU1} - ${padronEmpresaRespuesta.ciiU1Descripcion}`
                      : ""
                  }
                  label="Actividad Principal"
                  disabled={true}
                />
                {padronEmpresaRespuesta &&
                padronEmpresaRespuesta.ciiU1EsRural ? (
                  <div className={classes.input100}>
                    <label className={classes.labelEsRural}>
                      Es Actividad Rural
                    </label>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={classes.renglonActividad}>
              <div className={classes.input100}>
                <InputMaterial
                  id="CIIU2"
                  value={
                    padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU2
                      ? `${padronEmpresaRespuesta.ciiU2} - ${padronEmpresaRespuesta.ciiU2Descripcion}`
                      : ""
                  }
                  label="Actividad Secundaria"
                  disabled={true}
                />
                {padronEmpresaRespuesta &&
                padronEmpresaRespuesta.ciiU2EsRural ? (
                  <div className={classes.input100}>
                    <label className={classes.labelEsRural}>
                      Es Actividad Rural
                    </label>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={classes.renglonActividad}>
              <div className={classes.input100}>
                <InputMaterial
                  id="CIIU3"
                  value={
                    padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU3
                      ? `${padronEmpresaRespuesta.ciiU3} - ${padronEmpresaRespuesta.ciiU3Descripcion}`
                      : ""
                  }
                  label="Actividad Terciaria"
                  disabled={true}
                />
                {padronEmpresaRespuesta &&
                padronEmpresaRespuesta?.ciiU3EsRural ? (
                  <div className={classes.input100}>
                    <label className={classes.labelEsRural}>
                      Es Actividad Rural
                    </label>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
        {selectedTab === 2 && (
          <>
            <DeclaracionesJuradas
              cuil={cuil}
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
                  El afiliado {nombre} de la Empresa {razonSocialEmpresa} está
                  en condiciones de ser incorporado al Padrón.
                </h6>
              </div>
              <div className={classes.renglon}>
                <div className={classes.boton}>
                  <Button
                    className={classes.button}
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
          <>
            <div className={classes.div}>
              <h4>
                {padronRespuesta
                  ? `DDJJ UATRE ${Formato.Cuit(cuil)} ${nombre}`
                  : "DDJJ UATRE"}
              </h4>
              <div className={classes.renglonDDJJ}>
                <DeclaracionesJuradas
                  cuil={cuil}
                  //onSeleccionRegistro={handleSeleccionDDJJ}
                  infoCompleta={true}
                  mostrarBuscar={false}
                  registros={1}
                />
              </div>
            </div>
            <div className={classes.div}>
              <h4>Actividades del Empleador</h4>
              <div className={classes.renglon}>
                <div className={classes.input33}>
                  <InputMaterial
                    id="CIIU1"
                    value={
                      padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU1
                        ? `${padronEmpresaRespuesta.ciiU1} - ${padronEmpresaRespuesta.ciiU1Descripcion}`
                        : ""
                    }
                    label="Actividad Principal"
                    disabled={true}
                    showToolTip={true}
                  />
                  {/* {padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU1EsRural ? (
                <div className={classes.input33}>
                  <label className={classes.labelEsRural}>
                    Es Actividad Rural
                  </label>
                </div>
              ) : null} */}
                </div>

                <div className={classes.input33}>
                  <InputMaterial
                    id="CIIU2"
                    value={
                      padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU2
                        ? `${padronEmpresaRespuesta.ciiU2} - ${padronEmpresaRespuesta.ciiU2Descripcion}`
                        : ""
                    }
                    label="Actividad Secundaria"
                    disabled={true}
                    showToolTip={true}
                  />
                  {/* {padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU2EsRural ? (
              <div className={classes.input33}>
                <label className={classes.labelEsRural}>
                  Es Actividad Rural
                </label>
              </div>
            ) : null} */}
                </div>

                <div className={classes.input33}>
                  <InputMaterial
                    id="CIIU3"
                    value={
                      padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU3
                        ? `${padronEmpresaRespuesta.ciiU3} - ${padronEmpresaRespuesta.ciiU3Descripcion}`
                        : ""
                    }
                    label="Actividad Terciaria"
                    disabled={true}
                    showToolTip={true}
                  />
                  {/* {padronEmpresaRespuesta && padronEmpresaRespuesta?.ciiU3EsRural ? (
              <div className={classes.input33}>
                <label className={classes.labelEsRural}>
                  Es Actividad Rural
                </label>
              </div>
            ) : null} */}
                </div>
              </div>
            </div>
            <div className={classes.divResolverSolicitud}>
              <h4>Afiliados en ultima DDJJ del Empleador</h4>
              <AfiliadosUltimaDDJJ cuit={cuitEmpresa} mostrarBuscar={false} />

              <div className={classes.renglon}>
                <div className={classes.input25}>
                  <SelectMaterial
                    name="estadoSolicitudSelect"
                    label="Estado Solciitud:"
                    options={estadosSolicitudes}
                    value={estadoSolicitud}
                    //defaultValue={nacionalidades[0]}
                    onChange={handleChangeSelect}
                    //disabled={!padronRespuesta?.idPersona ? true : false}
                  />
                </div>

                <div className={classes.input25}>
                  <InputMaterial
                    id="resolverSolicitudFechaIngreso"
                    value={resolverSolicitudFechaIngreso}
                    label="Fecha Ingreso"
                    type="date"
                    width={100}
                    onChange={handleInputChange}
                    disabled={estadoSolicitud !== 2 ? true : false}
                  />
                </div>

                <div className={classes.input75}>
                  <InputMaterial
                    id="resolverSolicitudObs"
                    value={resolverSolicitudObs}
                    label="Observaciones"
                    width={100}
                    onChange={handleInputChange}
                    //disabled={!padronRespuesta?.idPersona ? true : false}
                  />
                </div>
              </div>

              <div className={classes.botonesResolverSolicitud}>
                <div className={classes.botonResolverSolicitud}>
                  <Button
                    className={classes.button}
                    width={100}
                    onClick={resolverSolicitudHandler}
                    disabled={showImprimirLiquidacion}
                  >
                    Resolver Solicitud
                  </Button>
                </div>
                <div className={classes.botonResolverSolicitud}>
                  <Button
                    className={classes.button}
                    width={100}
                    disabled={!showImprimirLiquidacion}
                    //onClick={imprimirLiquidacionHandler}
                  >
                    Imprimir Certificado Afiliación
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
        {selectedTab === 4 && (
          <Grid col full="width" gap="10px">
            <Grid full="width" gap="5px">
              <DocumentacionList
                config={{
                  data: documentacionList.data,
                  onSelect: (r) => {
                    setDocumentacionItem({
                      data: { ...r },
                      hisotry: { ...r },
                      req: null,
                    });
                  },
                }}
              />
            </Grid>
            <Grid full="width" gap="5px">
              <Grid grow>
                <Button
                  onClick={() => setDocumentacionItem({ data: {}, req: 1 })}
                >
                  Agrega documentación
                </Button>
              </Grid>
              <Grid grow>
                <Button
                  disabled={documentacionItem.req != null}
                  onClick={() =>
                    setDocumentacionItem((oldItem) => ({ ...oldItem, req: 2 }))
                  }
                >
                  Modifica documentación
                </Button>
              </Grid>
              <Grid grow>
                <Button
                  disabled={documentacionItem.req != null}
                  onClick={() =>
                    setDocumentacionItem((oldItem) => ({ ...oldItem, req: 3 }))
                  }
                >
                  Borra documentación
                </Button>
              </Grid>
            </Grid>
            <Grid col full="width" gap="20px" style={{ marginTop: "10px", border: "1px solid #186090", padding: "15px" }}>
              <DocumentacionForm
                config={{
                  data: documentacionItem.data,
                  disabled: documentacionItem.req == null,
                  onChange: (dataChanges) =>
                    setDocumentacionItem((oldValue) => ({
                      ...oldValue,
                      data: { ...oldValue.data, ...dataChanges },
                    })),
                  onCancel: () =>
                    setDocumentacionItem((oldValue) => ({
                      data: oldValue.history,
                      history: oldValue.history,
                      req: null,
                    })),
                  onConfirm: () => {
                    let data;
                    let index = null;
                    switch (documentacionItem.req) {
                      case 1: // Agrega
                        data = { ...documentacionItem.data, id: null };
                        index = documentacionList.data.length;
                        break;
                      case 2: // Modifica
                        data = { ...documentacionItem.data };
                        break;
                      case 3: // Borra
                        data = null;
                        break;
                      default:
                        return;
                    }
                    if (index == null) {
                      // Modifica o Borra
                      index = documentacionList.data.findIndex(
                        (r) => r.id === documentacionItem.data?.id
                      );
                    }
                    setDocumentacionList((oldValue) => {
                      const newValue = {
                        ...oldValue,
                        data: [...oldValue.data],
                      };
                      if (data == null) {
                        // Borra
                        newValue.data.splice(index, 1);
                      } else {
                        // Agrega o Modifica
                        if (data.id == null) {
                          // Agrega
                          newValue.idGen += 1;
                          data.id = newValue.idGen;
                        }
                        newValue.data.splice(index, 1, { ...data });
                      }
                      return newValue;
                    });
                    setDocumentacionItem({ req: null });
                  },
                }}
              />
            </Grid>
          </Grid>
        )}
        <div className={classes.footer}>
            <Button
              /*className={classes.button}*/
              width={25}
              onClick={afiliadoAgregarHandler}
              disabled={AgregarModificarAfiliadoDisableHandler()}
            >
              {AgregarModificarAfiliadoTitulo()}
            </Button>
          
            <Button type="submit" width={25} onClick={handleCerrarModal}>
              Cerrar
            </Button>
        </div>
      </Modal>
    </>
  );
};

export default AfiliadoAgregar;
