import React, { useEffect, useReducer, useRef, useState } from "react";
import Button from "../../ui/Button/Button";
//import Input from "../../ui/Input/Input";
import Modal from "../../ui/Modal/Modal";
import classes from "./AfiliadoAgregar.module.css";
import useHttp from "../../hooks/useHttp";
//import SelectInput from "../../ui/Select/SelectInput";
//import FormatearFecha from "../../helpers/FormatearFecha";
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";
import { Fab, Tab, Tabs, TextField } from "@mui/material";
import InputMaterial from "../../ui/Input/InputMaterial";
import SelectMaterial from "../../ui/Select/SelectMaterial";
import moment from "moment";
import habilitarBotonValidarCUIL from "../../helpers/habilitarBotonValidarCUIL";
import ValidarCUIT from "../../helpers/ValidarCUIT";

const AfiliadoAgregar = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();

  //#region estados para validaciones
  const [formularioIsValid, setFormularioIsValid] = useState(false);
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
  const [fechaNacimientoAFIP, setFechaNacimientoAFIP] = useState("");
  const [domicilioRealAFIP, setDomicilioRealAFIP] = useState(null);
  const [nombreAFIP, setNombreAFIP] = useState("");
  const [estadoSolicitud, setEstadoSolicitud] = useState(1);
  const [resolverSolicitudObs, setResolverSolicitudObs] = useState("");
  //#endregion

  //#region Datos Empleador
  const [cuitEmpresa, setCUITEmpresa] = useState("");
  const [telefonoEmpresa, setTelefonoEmpresa] = useState("");
  const [correoEmpresa, setCorreoEmpresa] = useState("");
  const [lugarTrabajoEmpresa, setLugarTrabajoEmpresa] = useState("");
  const [empresaId, setEmpresaId] = useState(0);
  //#endregion

  const [selectedTab, setSelectedTab] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);

  //#region manejo de validaciones
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
    console.log("reducer");
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
      console.log("checking...", cuilState.isValid);
      console.log("checking...", nombreState.isValid);
      setAfiliadoExiste(false);
      setCUILIsValid(cuilState.isValid);
      setNombreIsValid(nombreState.isValid);

      if (cuilState.isValid && nombreState.isValid) {
        setFormularioIsValid(true);
      }
    }, 400);

    return () => {
      clearTimeout(identifier);
      console.log("cleanup");
    };
  }, [cuilState.isValid, nombreState.isValid]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      console.log("checking empresa.", cuitState.isValid);
      setCUITIsValid(cuitState.isValid);
    }, 400);

    return () => {
      clearTimeout(identifier);
      console.log("cleanup");
    };
  }, [cuitState.isValid]);
  //#endregion

  //#region manejo si el afiliado existe
  const [afiliadoExiste, setAfiliadoExiste] = useState(false);
  useEffect(() => {
    if (cuilIsValid && cuil) {
      const processGetAfiliado = async (afiliadoObj) => {
        console.log("afiliadoObj", afiliadoObj);
        setAfiliadoExiste(true);
        setPadronRespuesta(true);
        setNombre(afiliadoObj.nombre);
        setNacionalidad(afiliadoObj.nacionalidadId);
        //setFechaNacimiento(afiliadoObj.fechaNacimiento);
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
        setDomicilio();
        setLocalidad(afiliadoObj.refLocalidadId);
        setSeccional(afiliadoObj.seccionalId);
        setEstadoSolicitud(afiliadoObj.estadoSolicitudId);

        //datos empleador
        setCUITEmpresa(afiliadoObj.cuit);

        //traer datos de afip
        alert(
          `El afiliado ya está cargado para la seccional ${afiliadoObj.seccional}`
        );
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Afiliado/GetAfiliado?CUIL=${cuil}`,
          method: "GET",
        },
        processGetAfiliado
      );
    }
  }, [request, cuilIsValid, cuil]);
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
      setFechaNacimientoAFIP(
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
      setDomicilioRealAFIP(domicilioReal);
      setNombreAFIP(`${padronObj.apellido} ${padronObj.nombre ?? ""}`);
      setDomicilio(domicilioReal.direccion);
      setNacionalidad(nacionalidades[0].value);

      //provincia
      //console.log(provincias);
      //console.log(domicilioReal);
      const provincia = provincias.find(
        (provincia) => provincia.idProvinciaAFIP === domicilioReal.idProvincia
      );
      //console.log(provincia);
      setProvincia(provincia.value);

      //localidad
      const processLocalidades = async (localidadesObj) => {
        console.log("localidades", localidadesObj);
        // console.log("cod postal", domicilioReal?.codigoPostal);
        // const localidad = localidadesObj.find(
        //   (localidad) => localidad.codPostal === parseInt(domicilioReal?.codigoPostal)
        // );
        console.log("localidad", localidadesObj[0].id);
        setLocalidad(localidadesObj[0].id ?? "");
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
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${cuil}&VerificarHistorico=${true}`,
        method: "GET",
      },
      error.includes("JSON") ? processConsultaPadron : alert("CUIL inválido!")
    );
  };

  const validarEmpresaCUITHandler = (cuit) => {
    console.log("entra");
    const processConsultaPadron = async (padronObj) => {
      console.log("padronObj", padronObj);
      setPadronEmpresaRespuesta(padronObj);
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${cuitEmpresa}&VerificarHistorico=${false}`,
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
      actividadPrincipalId: padronEmpresaRespuesta.actividadPrincipalId,
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
    nroAfiliado: 0,
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
    ];

    const resolverSolicitudAfiliado = async (
      resolverSolicitudAfiliadoResponse
    ) => {
      console.log(
        "resolverSolicitudAfiliadoResponse",
        resolverSolicitudAfiliadoResponse
      );
      //setEmpresaId(empresaObjResponse);
      if (resolverSolicitudAfiliadoResponse) alert("Solicitud resulta!");
      handleCerrarModal();
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
    console.log("objetoSeleccionadp", value);
    console.log("id", name);
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
        console.log("selectLocalidad", value);
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
    console.log(row.cuit);
    setCUITEmpresa(row.cuit);
  };
  //#endregion

  //#region //Handle tab change
  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };
  //#endregion

  //seleccionar Archivo
  const seleccionarArchivo = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
  };

  return (
    <Modal onClose={props.onClose}>
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
            label={"Documentacion"}
            disabled={nuevoAfiliadoResponse ? true : false}
          />
          <Tab
            label="Resolver Solicitud"
            //disabled={nuevoAfiliadoResponse ? false : true}
          />
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
                disabled={false}
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
                value={padronRespuesta?.idPersona ?? ""}
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
                value={padronRespuesta?.tipoDocumento ?? ""}
                label="Tipo Documento"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="numeroDocumentoAFIP"
                value={padronRespuesta?.numeroDocumento ?? ""}
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
                value={padronRespuesta?.estadoClave ?? ""}
                label="Estado Clave"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="domicilioAFIP"
                value={domicilioRealAFIP?.direccion ?? ""}
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
                value={
                  padronEmpresaRespuesta
                    ? padronEmpresaRespuesta?.razonSocial ??
                      `${padronEmpresaRespuesta?.apellido} ${padronEmpresaRespuesta?.nombre}`
                    : ""
                }
                label="Razón Social"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="actividadEmpresa"
                value={
                  padronEmpresaRespuesta?.descripcionActividadPrincipal ?? ""
                }
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
                value={
                  padronEmpresaRespuesta
                    ? `${padronEmpresaRespuesta?.domicilios[1]?.direccion}`
                    : ""
                }
                label="Domicilio"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="localidadEmpresa"
                value={
                  padronEmpresaRespuesta
                    ? padronEmpresaRespuesta?.domicilios[1]?.localidad ??
                      padronEmpresaRespuesta?.domicilios[1]
                        ?.descripcionProvincia
                    : ""
                }
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
              />
            </div>

            <div className={classes.input}>
              <InputMaterial
                id="correoEmpresa"
                value={correoEmpresa}
                label="Correo"
                disabled={true}
                width={100}
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
            <div className={classes.renglon}>
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
              <div className={classes.input}>
                <InputMaterial
                  id="internoEntidad"
                  value={"Entidad Interno"}
                  disabled={padronRespuesta?.idPersona ? true : false}
                  width={98}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className={classes.renglon}>
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
              <input
                type="file"
                styles={{ width: "20px" }}
                onChange={seleccionarArchivo}
              />
              <Button
                className={classes.button}
                width={20}
                onClick={handleUpload}
              >
                Subir Archivo
              </Button>
            </div>

            <TextField
              id="observaciones"
              multiline
              rows={4}
              width={98}
              defaultValue="observaciones"
            />
          </div>
        </>
      )}
      {selectedTab === 4 && (
        <>
          <div className={classes.renglon}>
            <div className={classes.input100}>
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
          </div>
          <div className={classes.renglon}>
            <div className={classes.input100}>
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
          <div className={classes.boton}>
            <Button
              className={classes.button}
              width={100}
              onClick={resolverSolicitudHandler}
            >
              Resolver
            </Button>
          </div>
        </>
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
            Agregar
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
