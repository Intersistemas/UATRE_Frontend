//import * as React from "react";
import React, { useEffect, useReducer, useRef, useState } from "react";
import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import Modal from "../../ui/Modal/Modal";
import classes from "./AfiliadoAgregar.module.css";
import useHttp from "../../hooks/useHttp";
import SelectInput from "../../ui/Select/SelectInput";
import FormatearFecha from "../../helpers/FormatearFecha";
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";
import { Tab, Tabs } from "@mui/material";
import InputMaterial from "../../ui/Input/InputMaterial";
import SelectMaterial from "../../ui/Select/SelectMaterial";
import moment from "moment";

//#region datosAFIPDefecto
const datosAFIPDefecto = {
  cuil: 0,
  secuencia: 0,
  nroAfiliado: 0,
  nombre: "",
  puestoId: 0,
  fechaIngreso: "",
  fechaEgreso: "",
  nacionalidadId: 0,
  nombreAnexo: "",
  cuit: 0,
  seccionalId: 0,
  sexoId: 0,
  dni: 0,
  actividadId: 0,
  estadoSolicitudId: 1,
  afipcuil: 0,
  afipFechaNacimiento: "Z",
  afipNombre: "",
  afipApellido: "",
  afipRazonSocial: "",
  afipTipoDocumento: "",
  afipNumeroDocumento: 0,
  afipTipoPersona: "",
  afipTipoClave: "",
  afipEstadoClave: "",
  afipClaveInactivaAsociada: 0,
  afipFechaFallecimiento: "Z",
  afipFormaJuridica: "",
  afipActividadPrincipal: "",
  afipIdActividadPrincipal: 0,
  afipPeriodoActividadPrincipal: 0,
  afipFechaContratoSocial: "",
  afipMesCierre: 0,
  afipDomicilioDireccion: "",
  afipDomicilioCalle: "",
  afipDomicilioNumero: 0,
  afipDomicilioPiso: "",
  afipDomicilioDepto: "",
  afipDomicilioSector: "",
  afipDomicilioTorre: "",
  afipDomicilioManzana: "",
  afipDomicilioLocalidad: "",
  afipDomicilioProvincia: "",
  afipDomicilioIdProvincia: 0,
  afipDomicilioCodigoPostal: 0,
  afipDomicilioTipo: "",
  afipDomicilioEstado: "",
  afipDomicilioDatoAdicional: "",
  afipDomicilioTipoDatoAdicional: "",
};
//#endregion

const AfiliadoAgregar = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [formularioValidado, setFormularioValidado] = useState(true);
  const [nuevoAfiliadoResponse, setNuevoAfiliadoResponse] = useState(0);
  const [actividad, setActividad] = useState("");
  const [actividades, setActividades] = useState([]);
  const [puesto, setPuesto] = useState("");
  const [puestos, setPuestos] = useState([]);
  const [sexo, setSexo] = useState("");
  const [sexos, setSexos] = useState([]);
  const [nacionalidad, setNacionalidad] = useState("");
  const [nacionalidades, setNacionalidades] = useState([]);
  const [seccional, setSeccional] = useState("");
  const [seccionales, setSeccionales] = useState([]);
  const [provincia, setProvincia] = useState("");
  const [provincias, setProvincias] = useState([]);
  const [estadoCivil, setEstadoCivil] = useState("");
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [cuil, setCUIL] = useState("");
  const [nombre, setNombre] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [padronRespuesta, setPadronRespuesta] = useState(null);
  const [domicilioRealAFIP, setDomicilioRealAFIP] = useState("");
  const [nombreAFIP, setNombreAFIP] = useState("");
  const [padronEmpresaRespuesta, setPadronEmpresaRespuesta] = useState(null);
  const [cuitEmpresa, setCUITEmpresa] = useState(null);
  const [telefonoEmpresa, setTelefonoEmpresa] = useState(null);
  const [correoEmpresa, setCorreoEmpresa] = useState(null);
  const [lugarTrabajoEmpresa, setLugarTrabajoEmpresa] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [ddJJUatreList, setDDJJUatreList] = useState([]);

  //#region manejo de validaciones
  const [cuilIsValid, setCUILIsValid] = useState(false);
  const cuilReducer = (state, action) => {
    if (action.type === "USER_INPUT") {
      return { value: action.value, isValid: action.value.length === 11 };
    }
    if (action.type === "USER_BLUR") {
      return { value: state.value, isValid: state.value.length === 11 };
    }
    return { value: "", isValid: false };
  };

  const [cuilState, dispatchCUIL] = useReducer(cuilReducer, {
    value: "",
    isValid: false,
  });

  //checking
  useEffect(() => {
    const identifier = setTimeout(() => {
      console.log("checking...", cuilState.isValid);
      setFormularioValidado(cuilState.isValid);
      setCUILIsValid(cuilState.isValid);
    }, 400);

    return () => {
      clearTimeout(identifier);
      console.log("cleanup");
    };
  }, [cuilState.isValid]);
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
    if (provincia !== "") {
      const processSeccionales = async (seccionalesObj) => {
        const seccionalesSelect = seccionalesObj
          .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
          .map((nacionalidad) => {
            return { value: nacionalidad.id, label: nacionalidad.descripcion };
          });
        //console.log("seccionalesSelect", seccionalesSelect);
        setSeccionales(seccionalesSelect);
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Seccional/GetSeccionalesByCP?ProvinciaId=${provincia}`,
          method: "GET",
        },
        processSeccionales
      );
    }
  }, [request, provincia]);

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

  useEffect(() => {
    if (padronRespuesta) {
      const processDDJJUatre = async (ddJJUatreObj) => {
        setDDJJUatreList(ddJJUatreObj);
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/DDJJUatre/GetDDJJUatreByCUIL?CUIL=${padronRespuesta?.idPersonaField}`,
          method: "GET",
        },
        processDDJJUatre
      );
    }
  }, [request, padronRespuesta]);

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
  //#endregion

  //#region Operacions validar CUIT/CUIL
  const validarAfiliadoCUILHandler = () => {
    const processConsultaPadron = async (padronObj) => {
      console.log("padronObj", padronObj);
      setPadronRespuesta(padronObj);
      setNombre(`${padronObj.apellidoField} ${padronObj.nombreField ?? ""}`);
      setFechaNacimiento(
        moment(padronObj.fechaNacimientoField).format("yyyy-MM-DD")
      );

      //tipo doc
      const tipoDoc = tiposDocumentos.filter(
        (tipoDoc) => tipoDoc.label === padronObj.tipoDocumentoField
      );
      setTipoDocumento(tipoDoc[0].value);
      setNumeroDocumento(padronObj.numeroDocumentoField);
      const domicilioReal = padronObj.domicilioField.find(
        (domicilio) => domicilio.tipoDomicilioField === "LEGAL/REAL"
      );
      setDomicilioRealAFIP(domicilioReal.direccionField);
      setNombreAFIP(
        `${padronObj.apellidoField} ${padronObj.nombreField ?? ""}`
      );
      setDomicilio(domicilioReal.direccionField);
      setNacionalidad(nacionalidades[0].value);

      //provincia
      console.log(provincias);
      console.log(domicilioReal);
      const provincia = provincias.find(
        (provincia) =>
          provincia.idProvinciaAFIP === domicilioReal.idProvinciaField
      );
       console.log(provincia);
      setProvincia(provincia.value);
    };

    request(
      {
        baseURL: "AFIP",
        endpoint: `/Padron/ConsultaPadronTodosLosDatos?pCUIT=${cuil}`,
        method: "GET",
      },
      processConsultaPadron
    );
  };

  const validarEmpresaCUITHandler = (cuit) => {
    const processConsultaPadron = async (padronObj) => {
      console.log("padronObj", padronObj);
      setPadronEmpresaRespuesta(padronObj);
    };

    // request(
    //   {
    //     baseURL: "AFIP",
    //     endpoint: `/Padron/ConsultaPadronTodosLosDatos?pCUIT=${cuitEmpresa}`,
    //     method: "GET",
    //   },
    //   processConsultaPadron
    // );
    request(
      {
        baseURL: "SIARU",
        endpoint: `/Empresas/${cuitEmpresa}`,
        method: "GET",
      },
      processConsultaPadron
    );
  };
  //#endregion

  //#region submit afiliado

  const afiliadoAgregarHandler = (event) => {
    event.preventDefault();
    const nuevoAfiliado = {
      cuil: cuil,
      secuencia: 0,
      nroAfiliado: 0,
      nombre: `${padronRespuesta?.apellidoField} ${padronRespuesta?.nombreField}`,
      puestoId: puesto,
      fechaIngreso: null,
      fechaEgreso: null,
      nacionalidadId: nacionalidad,
      empresaId: padronEmpresaRespuesta.id,
      seccionalId: seccional,
      sexoId: sexo,
      tipoDocumentoId: tipoDocumento,
      documento: numeroDocumento,
      actividadId: actividad,
      estadoSolicitudId: 1,
      estadoCivilId: estadoCivil,
      provinciaId: provincia,
      afipcuil: cuil,
      afipFechaNacimiento:
        padronRespuesta?.fechaNacimientoFieldSpecified === true
          ? padronRespuesta?.fechaNacimientoField
          : null,
      afipNombre: padronRespuesta?.apellidoField,
      afipApellido: padronRespuesta?.nombreField,
      afipRazonSocial: "",
      afipTipoDocumento: padronRespuesta?.tipoDocumentoField,
      afipNumeroDocumento: padronRespuesta?.numeroDocumentoField,
      afipTipoPersona: padronRespuesta?.tipoPersonaField,
      afipTipoClave: padronRespuesta?.tipoClaveField,
      afipEstadoClave: padronRespuesta?.estadoClaveField,
      afipClaveInactivaAsociada: 0,
      afipFechaFallecimiento:
        padronRespuesta?.fechaFallecimientoFieldSpecified === true
          ? padronRespuesta?.fechaFallecimientoField
          : null,
      afipFormaJuridica: padronRespuesta?.formaJuridicaField,
      afipActividadPrincipal:
        padronRespuesta?.descripcionActividadPrincipalField,
      afipIdActividadPrincipal: padronRespuesta?.idActividadPrincipalField,
      afipPeriodoActividadPrincipal: 0,
      afipFechaContratoSocial:
        padronRespuesta?.fechaContratoSocialFieldSpecified === true
          ? padronRespuesta?.fechaContratoSocialField
          : null,
      afipMesCierre: padronRespuesta?.mesCierreField,
      afipDomicilioDireccion:
        padronRespuesta?.domicilioRealAFIP?.direccionField,
      afipDomicilioCalle: domicilioRealAFIP?.calleField,
      afipDomicilioNumero: domicilioRealAFIP?.numeroField,
      afipDomicilioPiso: domicilioRealAFIP?.pisoField,
      afipDomicilioDepto:
        domicilioRealAFIP?.oficinaDptoLocalField,
      afipDomicilioSector: domicilioRealAFIP?.sectorField,
      afipDomicilioTorre: domicilioRealAFIP?.torreField,
      afipDomicilioManzana: domicilioRealAFIP?.manzanaField,
      afipDomicilioLocalidad:
        domicilioRealAFIP?.localidadField,
      afipDomicilioProvincia:
        domicilioRealAFIP?.descripcionProvinciaField,
      afipDomicilioIdProvincia:
        domicilioRealAFIP?.idProvinciaField,
      afipDomicilioCodigoPostal:
        domicilioRealAFIP?.codigoPostalField,
      afipDomicilioTipo: domicilioRealAFIP?.tipoDomicilioField,
      afipDomicilioEstado:
        domicilioRealAFIP?.estadoDomicilioField,
      afipDomicilioDatoAdicional:
        domicilioRealAFIP?.datoAdicionalField,
      afipDomicilioTipoDatoAdicional:
        domicilioRealAFIP?.tipoDatoAdicionalField,
    };

    console.log("POST", nuevoAfiliado);
    const afiliadoAgregar = async (afiliadoResponseObj) => {
      console.log("afiliadosObj", afiliadoResponseObj);
      setNuevoAfiliadoResponse(afiliadoResponseObj);
      alert("Afiliado creado con éxito!");
      handleCerrarModal();
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
        break;

      case "nombre":
        setNombre(value);
        break;

      case "fechaNacimiento":
        //console.log('fecha', value)
        setFechaNacimiento(value);
        break;

      case "numeroDocumento":
        setNumeroDocumento(value);
        break;

      case "telefono":
        setTelefono(value);
        break;

      case "correo":
        setCorreo(value);
        break;

      case "cuit":
        setCUITEmpresa(value);
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

  return (
    <Modal onClose={props.onClose}>
      <div className={classes.div}>
        <Tabs
          value={selectedTab}
          onChange={handleChangeTab}
          aria-label="basic tabs example"
        >
          <Tab label="Datos Personales" />
          <Tab label="Datos Empleador" />
          <Tab label="DDJJ UATRE" />
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
                disabled={padronRespuesta?.idPersonaField ? true : false}
                width={98}
                onChange={handleInputChange}
              />
            </div>
            <Button
              width={20}
              heigth={80}
              disabled={
                padronRespuesta?.idPersonaField || !cuilIsValid ? true : false
              }
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
                disabled={!padronRespuesta?.idPersonaField ? true : false}
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
                disabled={!padronRespuesta?.idPersonaField ? true : false}
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
                //width={101}
                onChange={handleInputChange}
                disabled={!padronRespuesta?.idPersonaField ? true : false}
              />
            </div>
            <div className={classes.input25}>
              <SelectMaterial
                name="estadoCivilSelect"
                label="Estado Civil"
                options={estadosCiviles}
                value={estadoCivil}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersonaField ? true : false}
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
                disabled={!padronRespuesta?.idPersonaField ? true : false}
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
                disabled={!padronRespuesta?.idPersonaField ? true : false}
                onChange={handleChangeSelect}
                //width={98}
              />
            </div>
            <div className={classes.input25}>
              <InputMaterial
                id="numeroDocumento"
                value={numeroDocumento}
                label="Numero Documento"
                disabled={!padronRespuesta?.idPersonaField ? true : false}
                //width={96}
                onChange={handleInputChange}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="domicilio"
                value={domicilio}
                label="Domicilio"
                disabled={!padronRespuesta?.idPersonaField ? true : false}
                //width={100}
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
                disabled={!padronRespuesta?.idPersonaField ? true : false}
              />
            </div>
            <div className={classes.input}>
              <SelectMaterial
                name="seccionalSelect"
                label="Seccional"
                options={seccionales}
                value={seccional}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersonaField ? true : false}
              />
            </div>
          </div>

          <div className={classes.renglon}>
            <div className={classes.input}>
              <InputMaterial
                id="telefono"
                value={telefono}
                label="Telefono/Celular"
                disabled={!padronRespuesta?.idPersonaField ? true : false}
                width={100}
                onChange={handleInputChange}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="correo"
                value={correo}
                label="Correo"
                disabled={!padronRespuesta?.idPersonaField ? true : false}
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
                disabled={!padronRespuesta?.idPersonaField ? true : false}
              />
            </div>
            <div className={classes.input}>
              <SelectMaterial
                name="actividadSelect"
                label="Actividad"
                options={actividades}
                value={actividad}
                onChange={handleChangeSelect}
                disabled={!padronRespuesta?.idPersonaField ? true : false}
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
                value={fechaNacimiento ?? ""}
                label="Fecha de Nacimiento"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="cuilAFIP"
                value={padronRespuesta?.idPersonaField ?? ""}
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
                value={padronRespuesta?.tipoDocumentoField ?? ""}
                label="Tipo Documento"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="numeroDocumentoAFIP"
                value={padronRespuesta?.numeroDocumentoField ?? ""}
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
                value={padronRespuesta?.estadoClaveField ?? ""}
                label="Estado Clave"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="domicilioAFIP"
                value={domicilioRealAFIP ?? ""}
                label="Documento"
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
                disabled={padronEmpresaRespuesta?.id ? true : false}
                width={98}
                onChange={handleInputChange}
              />
            </div>
            <Button
              width={20}
              heigth={80}
              disabled={padronEmpresaRespuesta?.id ? true : false}
              onClick={validarEmpresaCUITHandler}
            >
              Validar CUIT
            </Button>
          </div>

          <div className={classes.renglon}>
            <div className={classes.input}>
              <InputMaterial
                id="razonSocialEmpresa"
                value={padronEmpresaRespuesta?.razonSocial}
                label="Razón Social"
                disabled={true}
                width={100}
              />
            </div>
            <div className={classes.input}>
              <InputMaterial
                id="actividadEmpresa"
                value={
                  padronEmpresaRespuesta?.actividadPrincipalDescripcion ?? ""
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
                    ? `${padronEmpresaRespuesta?.domicilioCalle} ${padronEmpresaRespuesta?.domicilioNumero}`
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
                // value={
                //   padronEmpresaRespuesta?.domicilioField[1]
                //     ?.descripcionProvinciaField
                // }
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
            <div className={classes.input}>
              <InputMaterial
                id="lugarTrabajoEmpresa"
                value={lugarTrabajoEmpresa}
                label="Lugar de Trabajo"
                disabled={false}
                width={100}
              />
            </div>
          </div>
        </div>
      )}

      {selectedTab === 2 && (
        <DeclaracionesJuradas
          ddJJUatreList={ddJJUatreList}
          onSeleccionRegistro={handleSeleccionDDJJ}
        />
      )}

      <div className={classes.botones}>
        <div className={classes.boton}>
          <Button
            className={classes.button}
            width={100}
            onClick={afiliadoAgregarHandler}
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
