import React, { useEffect, useReducer, useRef, useState } from "react";
import Button from "../../ui/Button/Button";
//import Input from "../../ui/Input/Input";
import Modal from "../../ui/Modal/Modal";
import Grid from "../../ui/Grid/Grid";
import classes from "./AfiliadoAgregar.module.css";
import useHttp from "../../hooks/useHttp";
//import SelectInput from "../../ui/Select/SelectInput";
//import FormatearFecha from "../../helpers/FormatearFecha";
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";
import { Alert, Tab, Tabs } from "@mui/material";
import InputMaterial from "../../ui/Input/InputMaterial";
import SelectMaterial from "../../ui/Select/SelectMaterial";
import moment from "moment";
import habilitarBotonValidarCUIL from "../../helpers/habilitarBotonValidarCUIL";
import ValidarCUIT from "../../helpers/ValidarCUIT";
import InputMask from "../../ui/Input/InputMask";
import AfiliadosUltimaDDJJ from "./declaracionesJuradas/AfiliadosUltimaDDJJ";
import DocumentacionList from "./documentacion/DocumentacionList";
import DocumentacionForm from "./documentacion/DocumentacionForm";

const AfiliadoAgregar = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();

  //#region estados para validaciones
  const [formularioIsValid, setFormularioIsValid] = useState(false);
  const [showImprimirLiquidacion, setShowImprimirLiquidacion] = useState(false);
  const [
    resolverSolicitudAfiliadoResponse,
    setResolverSolicitudAfiliadoResponse,
  ] = useState(0);
  //#endregion

  //#region Alert
  const [showAlert, setShowAlert] = useState(true);
  const [textAlert, setTextAlert] = useState("");
  const [severityAlert, setSeverityAlert] = useState("");
  //#endregion

  //#region variables para respuestas de servicios
  const [nuevoAfiliadoResponse, setNuevoAfiliadoResponse] = useState(null);
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

	const [documentacionList, setDocumentacionList] = useState([]);
	const [documentacionItem, setDocumentacionItem] = useState({});
  //#endregion

  //#region Datos Personales Formulario
  const [actividad, setActividad] = useState("");
  const [puesto, setPuesto] = useState("");
  const [sexo, setSexo] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [seccional, setSeccional] = useState("");
  const [provincia, setProvincia] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cuil, setCUIL] = useState("");
  const [nombre, setNombre] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [estadoSolicitud, setEstadoSolicitud] = useState(1);
  const [resolverSolicitudObs, setResolverSolicitudObs] = useState("");

  const [nombreAFIP, setNombreAFIP] = useState("");
  const [fechaNacimientoAFIP, setFechaNacimientoAFIP] = useState("");
  const [cuilAFIP, setCUILAFIP] = useState("");
  const [tipoDocumentoAFIP, setTipoDocumentoAFIP] = useState("");
  const [numeroDocumentoAFIP, setNumeroDocumentoAFIP] = useState("");
  const [estadoClaveAFIP, setEstadoClaveAFIP] = useState("");
  const [domicilioRealAFIP, setDomicilioRealAFIP] = useState(null);
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

  const [selectedTab, setSelectedTab] = useState(0);

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

  //checking
  useEffect(() => {
    const identifier = setTimeout(() => {
      //console.log("checking...", cuilState.isValid);
      console.log("checking...", cuitState.isValid);
      setAfiliadoExiste(false);
      setCUILIsValid(cuilState.isValid);
      setNombreIsValid(nombreState.isValid);

      if (cuilState.isValid && nombreState.isValid && cuitState.isValid) {
        setFormularioIsValid(true);
      }
    }, 400);

    return () => {
      clearTimeout(identifier);
      //console.log("cleanup");
    };
  }, [cuilState.isValid, nombreState.isValid, cuitState.isValid]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      //console.log("checking empresa.", cuitState.isValid);
      setCUITIsValid(cuitState.isValid);
    }, 200);

    return () => {
      clearTimeout(identifier);
      //console.log("cleanup");
    };
  }, [cuitState.isValid]);
  //#endregion

  //#region Manejo de notificaciones y alert
  useEffect(() => {
    const identifier = setTimeout(() => {
      //console.log("checking showAlert...", showAlert);
      //if (showAlert) {
      //setShowAlert(false);
      setTextAlert("");
      setSeverityAlert("");
      //}
    }, 10000);

    return () => {
      clearTimeout(identifier);
      //console.log("alert")
    };
  }, [showAlert]);
  //#endregion

  //#region manejo si el afiliado existe
  const [afiliadoExiste, setAfiliadoExiste] = useState(false);
  const [empresaIdExiste, setEmpresaIdExiste] = useState(0);
  useEffect(() => {
    if (cuilIsValid && cuil) {
      const processGetAfiliado = async (afiliadoObj) => {
        console.log("afiliadoObj", afiliadoObj);
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
        setCorreo(afiliadoObj.correo);
        setActividad(afiliadoObj.actividadId);
        setPuesto(afiliadoObj.puestoId);
        setDomicilio(afiliadoObj.domicilio);
        setLocalidad(afiliadoObj.refLocalidadId);
        setSeccional(afiliadoObj.seccionalId);
        setEstadoSolicitud(afiliadoObj.estadoSolicitudId);

        //datos empleador
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

        //alert
        setShowAlert(true);
        setTextAlert(
          `El afiliado ya está cargado para la seccional ${afiliadoObj.seccional}`
        );
        setSeverityAlert("info");
        // alert(
        //   `El afiliado ya está cargado para la seccional ${afiliadoObj.seccional}`
        // );
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
  }, [request, cuilIsValid, cuil]);

  useEffect(() => {
    if (afiliadoExiste) {
      const processGetEmpresa = async (empresaObj) => {
        console.log("empresaObj", empresaObj);
        setPadronEmpresaRespuesta(empresaObj);
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
          endpoint: `/Empresas/GetEmpresaById?id=${empresaIdExiste}`,
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
    if (localidad !== "") {
      const processSeccionales = async (seccionalesObj) => {
        const seccionalesSelect = seccionalesObj
          .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
          .map((seccional) => {
            return { value: seccional.id, label: seccional.descripcion };
          });
        //console.log("seccionalesSelect", seccionalesSelect);
        setSeccionales(seccionalesSelect);
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

  //#region Operacions validar CUIT/CUIL
  const validarAfiliadoCUILHandler = () => {
    const processConsultaPadron = async (padronObj) => {
      console.log("padronObj", padronObj);
      setPadronRespuesta(padronObj);
      dispatchNombre({
        type: "USER_INPUT",
        value: `${padronObj.apellido} ${padronObj.nombre ?? ""}`,
      });
      setNombre(`${padronObj.apellido} ${padronObj.nombre ?? ""}`);
      setFechaNacimiento(
        moment(padronObj.fechaNacimiento).format("yyyy-MM-DD")
      );

      //tipo doc
      const tipoDoc = tiposDocumentos.filter(
        (tipoDoc) => tipoDoc.label === padronObj.tipoDocumento
      );
      setTipoDocumento(tipoDoc[0].value);
      setNumeroDocumento(padronObj.numeroDocumento);
      const domicilioReal = padronObj.domicilios.find(
        (domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"
      );
      setDomicilio(domicilioReal.direccion);
      setNacionalidad(nacionalidades[0].value);

      //provincia
      const provincia = provincias.find(
        (provincia) => provincia.idProvinciaAFIP === domicilioReal.idProvincia
      );
      setProvincia(provincia.value);

      //localidad
      const processLocalidades = async (localidadesObj) => {
        //console.log("localidades", localidadesObj);
        //console.log("localidad", localidadesObj[0].id);
        setLocalidad(localidadesObj[0].id ?? "");
      };

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
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${cuil}&VerificarHistorico=${false}`,
        method: "GET",
      },
      error.includes("JSON") ? processConsultaPadron : alert("CUIL inválido!")
    );
  };

  const validarEmpresaCUITHandler = (cuit) => {
    const processConsultaPadron = async (padronObj) => {
      console.log("padronObj", padronObj);
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

  //#region submit afiliado
  const afiliadoAgregarHandler = async (event) => {
    event.preventDefault();
    //console.log("domicilioRealAFIP", domicilioRealAFIP);
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

    const empresaAgregar = async (empresaObjResponse) => {
      console.log("empresaObjResponse", empresaObjResponse);
      setEmpresaId(empresaObjResponse);
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: `/Empresas`,
        method: "POST",
        body: empresa,
        headers: {
          "Content-Type": "application/json",
        },
      },
      empresaAgregar
    );
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
    empresaId: +empresaId,
    seccionalId: seccional,
    sexoId: +sexo,
    tipoDocumentoId: +tipoDocumento,
    documento: +numeroDocumento,
    actividadId: +actividad,
    estadoSolicitudId: 1,
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
    afipPeriodoActividadPrincipal: 0,
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
  };
  useEffect(() => {
    if (empresaId > 0) {
      console.log("POST", nuevoAfiliado);
      const afiliadoAgregar = async (afiliadoResponseObj) => {
        console.log("afiliadosObj", afiliadoResponseObj);
        setNuevoAfiliadoResponse(afiliadoResponseObj);
        //alert("Afiliado creado con éxito!");
        //Alert
        setShowAlert(true);
        setSeverityAlert("success");
        setTextAlert("Afiliado creado con éxito!");

        //handleCerrarModal();
        setSelectedTab(3);
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
    }
  }, [empresaId, request]);
  //#endregion

  //#region Resolver Solciitud Afiliado
  const resolverSolicitudHandler = (event) => {
    event.preventDefault();

    const patchAfiliado = [
      {
        path: "EstadoSolicitudId",
        op: "replace",
        value: estadoSolicitud,
      },
      {
        path: "FechaIngreso",
        op: "replace",
        value: "0",
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
        setShowAlert(true);
        setSeverityAlert("success");
        setTextAlert("Solicitud resuelta en estado Activo!");
        setResolverSolicitudAfiliadoResponse(resolverSolicitudAfiliadoResponse);
        if (+estadoSolicitud === 2) {
          setShowImprimirLiquidacion(true);
        }
      }
    };

    request(
      {
        baseURL: "Afiliaciones",
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

  //#region handlers change select
  const handleChangeSelect = (value, name) => {
    //console.log("objetoSeleccionadp", value);
    //console.log("id", name);
    switch (name) {
      case "actividadSelect":
        setActividad(value);
        break;

      case "puestoSelect":
        setPuesto(value);
        break;

      case "nacionalidadSelect":
        setNacionalidad(value);
        break;

      case "sexoSelect":
        setSexo(value);
        break;

      case "seccionalSelect":
        setSeccional(value);
        break;

      case "estadoCivilSelect":
        setEstadoCivil(value);
        break;

      case "tipoDocumentoSelect":
        setTipoDocumento(value);
        break;

      case "provinciaSelect":
        setProvincia(value);
        setLocalidad("");
        setSeccional("");
        break;

      case "localidadSelect":
        //log("selectLocalidad", value);
        setLocalidad(value);
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
        setPadronRespuesta(null);
        break;

      case "nombre":
        dispatchNombre({ type: "USER_INPUT", value: value });
        setNombre(value);
        break;

      case "fechaNacimiento":
        //console.log('fecha', value)
        setFechaNacimiento(value);
        break;

      case "numeroDocumento":
        setNumeroDocumento(value);
        break;

      case "domicilio":
        setDomicilio(value);
        break;

      case "telefono":
        setTelefono(value);
        break;

      case "correo":
        setCorreo(value);
        break;

      case "cuit":
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
  };
  //#endregion

  //#region //Handle tab change
  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };
  //#endregion

  return (
    <Modal onClose={props.onClose}>
      <div className={classes.div}>
        <div className={classes.alert}>
          <Alert hidden={!showAlert} severity={severityAlert} variant="filled">
            {textAlert}
          </Alert>
        </div>
      </div>
      <h5 className={classes.titulo}>
        {padronRespuesta
          ? `Alta de Nuevo Afiliado a UATRE: ${cuil} ${nombre}`
          : "Alta de Nuevo Afiliado a UATRE"}
      </h5>
      <div className={classes.div}>
        <Tabs
          value={selectedTab}
          onChange={handleChangeTab}
          aria-label="basic tabs example"
        >
          <Tab
            label="Datos Personales"
            disabled={nuevoAfiliadoResponse ? true : false}
          />
          <Tab
            label="Datos Empleador"
            disabled={nuevoAfiliadoResponse ? true : false}
          />
          <Tab
            label={
              padronRespuesta ? `DDJJ UATRE ${cuil} ${nombre}` : "DDJJ UATRE"
            }
            disabled={nuevoAfiliadoResponse ? true : false}
          />
          <Tab
            label="Resolver Solicitud"
            hidden={
              (nuevoAfiliadoResponse || afiliadoExiste) &&
              (+estadoSolicitud === 1 || resolverSolicitudAfiliadoResponse)
                ? false
                : true
            }
          />
					<Tab label="Documentacion" />
        </Tabs>
      </div>
      {selectedTab === 0 && (
        <div className={classes.div}>
          <div className={classes.renglon}>
            <div className={classes.input}>
              <InputMaterial
                id="cuil"
                value={cuil}
                label="CUIL"
                disabled={padronRespuesta?.idPersona ? true : false}
                width={98}
                onChange={handleInputChange}
                helperText={
                  !cuilIsValid && cuil.length === 11 ? "CUIL inválido" : ""
                }
                error={!cuilIsValid && cuil.length === 11 ? true : false}
              />
            </div>
            <Button
              width={20}
              heigth={80}
              disabled={habilitarBotonValidarCUIL({
                cuilIsValid: cuilIsValid,
                afiliadoExiste: afiliadoExiste,
                padronRespuesta: padronRespuesta ?? null,
              })}
              onClick={validarAfiliadoCUILHandler}
            >
              Validar CUIL
            </Button>
          </div>
          <div className={classes.renglon}>
            <div className={classes.input}>
              <InputMaterial
                id="nombre"
                value={nombre ?? ""}
                label="Apellido y Nombre"
                width={100}
                onChange={handleInputChange}
                disabled={!padronRespuesta?.idPersona ? true : false}
              />
            </div>
            <div className={classes.input}>
              <SelectMaterial
                name="nacionalidadSelect"
                label="Nacionalidad"
                options={nacionalidades}
                value={nacionalidad}
                defaultValue={nacionalidades[0]}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
              />
            </div>
          </div>
          <div className={classes.renglon}>
            <div className={classes.input}>
              <InputMaterial
                id="fechaNacimiento"
                value={fechaNacimiento}
                label="Fecha de Nacimiento"
                type="date"
                onChange={handleInputChange}
                disabled={!padronRespuesta?.idPersona ? true : false}
              />
            </div>
            <div className={classes.input25}>
              <SelectMaterial
                name="estadoCivilSelect"
                label="Estado Civil"
                options={estadosCiviles}
                value={estadoCivil}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
                //width={100}
              />
            </div>
            <div className={classes.input25}>
              <SelectMaterial
                name="sexoSelect"
                label="Genero"
                options={sexos}
                value={sexo}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
                //width={100}
              />
            </div>
          </div>
          <div className={classes.renglon}>
            <div className={classes.input25}>
              <SelectMaterial
                name="tipoDocumentoSelect"
                value={tipoDocumento}
                options={tiposDocumentos}
                label="Tipo Documento"
                disabled={!padronRespuesta?.idPersona ? true : false}
                onChange={handleChangeSelect}
                //width={98}
              />
            </div>
            <div className={classes.input25}>
              <InputMaterial
                id="numeroDocumento"
                value={numeroDocumento}
                label="Numero Documento"
                disabled={!padronRespuesta?.idPersona ? true : false}
                //width={96}
                onChange={handleInputChange}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="domicilio"
                value={domicilio}
                label="Domicilio"
                disabled={!padronRespuesta?.idPersona ? true : false}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={classes.renglon}>
            <div className={classes.input}>
              <SelectMaterial
                name="provinciaSelect"
                label="Provincia"
                options={provincias}
                value={provincia}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
              />
            </div>
            <div className={classes.input}>
              <SelectMaterial
                name="localidadSelect"
                label="Localidad"
                options={localidades}
                value={localidad}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
              />
            </div>
          </div>

          <div className={classes.renglon}>
            <div className={classes.input100}>
              <SelectMaterial
                name="seccionalSelect"
                label="Seccional"
                options={seccionales}
                value={seccional}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
              />
            </div>
          </div>

          <div className={classes.renglon}>
            <div className={classes.input}>
              <InputMaterial
                id="telefono"
                value={telefono}
                label="Telefono/Celular"
                disabled={!padronRespuesta?.idPersona ? true : false}
                width={100}
                onChange={handleInputChange}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="correo"
                value={correo}
                label="Correo"
                disabled={!padronRespuesta?.idPersona ? true : false}
                width={100}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className={classes.renglon}>
            <div className={classes.input}>
              <SelectMaterial
                name="puestoSelect"
                label="Oficio"
                options={puestos}
                value={puesto}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
              />
            </div>
            <div className={classes.input}>
              <SelectMaterial
                name="actividadSelect"
                label="Actividad"
                options={actividades}
                value={actividad}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersona ? true : false}
              />
            </div>
          </div>
          <div className={classes.renglon}>
            <h4>Datos AFIP</h4>
          </div>
          <div className={classes.renglon}>
            <div className={classes.input100}>
              <InputMaterial
                id="nombreYApellidoAFIP"
                value={nombreAFIP}
                label="Apellido y Nombre"
                disabled={true}
                width={100}
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
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="cuilAFIP"
                value={cuilAFIP}
                label="CUIL"
                disabled={true}
                width={100}
              />
            </div>
          </div>

          <div className={classes.renglon}>
            <div className={classes.input}>
              <InputMaterial
                id="tipoDocumentoAFIP"
                value={tipoDocumentoAFIP}
                label="Tipo Documento"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="numeroDocumentoAFIP"
                value={numeroDocumentoAFIP}
                label="Documento"
                disabled={true}
                width={100}
              />
            </div>
          </div>

          <div className={classes.renglon}>
            <div className={classes.input}>
              <InputMaterial
                id="estadoClaveAFIP"
                value={estadoClaveAFIP}
                label="Estado Clave"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="domicilioAFIP"
                value={domicilioRealAFIP}
                label="Domicilio"
                disabled={true}
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
              <InputMaterial
                id="cuit"
                value={cuitEmpresa}
                label="CUIT"
                /*disabled={padronEmpresaRespuesta?.id ? true : false}*/
                width={98}
                onChange={handleInputChange}
                helperText={
                  !cuitIsValid && cuitEmpresa.length === 11
                    ? "CUIT inválido"
                    : ""
                }
                error={!cuitIsValid && cuitEmpresa.length === 11 ? true : false}
              />
            </div>
            <Button
              width={20}
              heigth={80}
              disabled={!cuitIsValid ? true : false}
              onClick={validarEmpresaCUITHandler}
            >
              Validar CUIT
            </Button>
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

          <div className={classes.renglon}>
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
              {padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU1EsRural ? (
                <div className={classes.input100}>
                  <label className={classes.labelEsRural}>
                    Es Actividad Rural
                  </label>
                </div>
              ) : null}
            </div>
          </div>

          <div className={classes.renglon}>
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
              {padronEmpresaRespuesta && padronEmpresaRespuesta.ciiU2EsRural ? (
                <div className={classes.input100}>
                  <label className={classes.labelEsRural}>
                    Es Actividad Rural
                  </label>
                </div>
              ) : null}
            </div>
          </div>

          <div className={classes.renglon}>
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
        <DeclaracionesJuradas
          cuil={cuil}
          onSeleccionRegistro={handleSeleccionDDJJ}
        />
      )}
      {selectedTab === 3 && (
        <>
          <div className={classes.div}>
            <h4>
              {padronRespuesta ? `DDJJ UATRE ${cuil} ${nombre}` : "DDJJ UATRE"}
            </h4>
            <div className={classes.renglon}>
              <DeclaracionesJuradas
                cuil={cuil}
                onSeleccionRegistro={handleSeleccionDDJJ}
                mostrarBuscar={false}
                registros={3}
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
          <div className={classes.div}>
            <h4>Afiliados en ultima DDJJ</h4>
            <AfiliadosUltimaDDJJ cuit={cuitEmpresa} mostrarBuscar={false} />

            <div className={classes.renglon}>
              <div className={classes.input25}>
                <SelectMaterial
                  name="estadoSolicitudSelect"
                  label="Estado Solciitud:"
                  options={props.estadosSolicitudes}
                  value={estadoSolicitud}
                  //defaultValue={nacionalidades[0]}
                  onChange={handleChangeSelect}
                  //disabled={!padronRespuesta?.idPersona ? true : false}
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
								data: documentacionList,
								onSelect: (r) =>
									setDocumentacionItem({
										data: { ...r },
										req: null,
									}),
							}}
						/>
					</Grid>
					<Grid full="width" gap="5px">
						<Grid grow>
							<Button
								onClick={() =>
									setDocumentacionItem(oldItem => ({ ...oldItem, req: 1 }))
								}
							>
								Agregar documentación
							</Button>
						</Grid>
						<Grid grow>
							<Button
								disabled={documentacionItem.data == null}
								onClick={() =>
									setDocumentacionItem(oldItem => ({ ...oldItem, req: 2 }))
								}
							>
								Modificar documentación
							</Button>
						</Grid>
						<Grid grow>
							<Button
								disabled={documentacionItem.data == null}
								onClick={() =>
									setDocumentacionItem(oldItem => ({ ...oldItem, req: 3 }))
								}
							>
								Dar de baja documentación
							</Button>
						</Grid>
					</Grid>
					<Grid col full="width" gap="20px" style={{ marginTop: "10px" }}>
						<DocumentacionForm
							config={{
								data: documentacionItem.data,
								disabled: documentacionItem.req == null,
								onChange: (dataChanges) =>
									setDocumentacionItem((oldValue) => {
										console.log("oldValue", oldValue);
										const newData = { ...oldValue.data, ...dataChanges };
										console.log("newData", newData);
										return { ...oldValue, data: newData };
									}),
								onCancel: () =>
									setDocumentacionItem((oldValue) => {
										const newValue = {
											data: {
												...(documentacionList.find(
													(r) => r.id === oldValue.id
												) ?? {}),
											},
											req: null,
										};
										return newValue;
									}),
								onConfirm: () => {
									console.log("documentacionItem.req", documentacionItem.req);
									if (documentacionItem.req == null) return;
									const data = { ...documentacionItem.data };
									console.log("data", data);
									if (documentacionItem.req === 1) {
										setDocumentacionList((oldList) => {
											data.id = oldList.length + 1;
											setDocumentacionItem({ data: data, req: null });
											return [...oldList, data];
										});
										return;
									}
									const index = documentacionList.findIndex(
										(r) => r.id === data?.id
									);
									if (index == null) return;
									setDocumentacionList((oldList) => {
										const newList = [...oldList];
										if (documentacionItem.req === 2) {
											newList.splice(index, 1, data);
											setDocumentacionItem({ data: data, req: null });
										} else {
											newList.splice(index, 1);
											setDocumentacionItem({ req: null });
										}
										return newList;
									});
								},
							}}
						/>
					</Grid>
				</Grid>
			)}
      <div className={classes.botones}>
        <div className={classes.boton}>
          <Button
            className={classes.button}
            width={100}
            onClick={afiliadoAgregarHandler}
            disabled={
              !formularioIsValid || nuevoAfiliadoResponse || afiliadoExiste
            }
          >
            Agregar Afiliado
          </Button>
        </div>
        <div className={classes.boton}>
          <Button type="submit" width={100} onClick={handleCerrarModal}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AfiliadoAgregar;
