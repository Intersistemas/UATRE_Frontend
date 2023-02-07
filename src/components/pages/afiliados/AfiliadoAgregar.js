import React, { useEffect, useRef, useState } from "react";
import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import Modal from "../../ui/Modal/Modal";
import classes from "./AfiliadoAgregar.module.css";
import useHttp from "../../hooks/useHttp";
import SelectInput from "../../ui/Select/SelectInput";

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
  const [actividad, setActividad] = useState({
    value: 0,
    label: "SELECCIONE ACTIVIDAD",
  });
  const [actividades, setActividades] = useState([]);
  const [puesto, setPuesto] = useState({
    value: 0,
    label: "SELECCIONE PUESTO",
  });
  const [puestos, setPuestos] = useState([]);
  const [sexo, setSexo] = useState({ value: 0, label: "SELECCIONE SEXO" });
  const [sexos, setSexos] = useState([]);
  const [nacionalidad, setNacionalidad] = useState({
    value: 0,
    label: "SELECCIONE NACIONALIDAD",
  });
  const [nacionalidades, setNacionalidades] = useState([]);
  const [seccional, setSeccional] = useState({
    value: 0,
    label: "SELECCIONE SECCIONAL",
  });
  const [seccionales, setSeccionales] = useState([]);
  const [padronRespuesta, setPadronRespuesta] = useState(null);
  const [padronEmpresaRespuesta, setPadronEmpresaRespuesta] = useState(null);

  //#region InputRefs
  const cuilInputRef = useRef();
  const nombreInputRef = useRef();
  const nroAfiliadoInputRef = useRef();
  const fechaIngresoInputRef = useRef();
  const nombreAnexoInputRef = useRef();
  const cuitInputRef = useRef();
  const dniInputRef = useRef();
  //#endregion

  //#region Tablas para crear afiliado
  useEffect(() => {
    const processActividades = async (actividadesObj) => {
      //console.log("actividadesObj", actividadesObj);
      const actividadesSelect = actividadesObj.map((actividad) => {
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
      const puestosSelect = puestosObj.map((puesto) => {
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
      const sexosSelect = sexosObj.map((sexo) => {
        return { value: sexo.id, label: sexo.codigo };
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
      const nacionalidadesSelect = nacionalidadObj.map((nacionalidad) => {
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
    if (padronRespuesta?.domicilioField[1]?.codigoPostalField !== undefined) {
      const processSeccionales = async (seccionalesObj) => {
        const seccionalesSelect = seccionalesObj.map((nacionalidad) => {
          return { value: nacionalidad.id, label: nacionalidad.descripcion };
        });
        //console.log("seccionalesSelect", seccionalesSelect);
        setSeccionales(seccionalesSelect);
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Seccional/GetSeccionalesByCP?CP=${padronRespuesta?.domicilioField[1]?.codigoPostalField}`,
          method: "GET",
        },
        processSeccionales
      );
    }
  }, [request, padronRespuesta?.domicilioField[1]?.codigoPostalField]);
  //#endregion

  //#region Operacions validar CUIT/CUIL
  const validarAfiliadoCUILHandler = () => {
    const processConsultaPadron = async (padronObj) => {
      console.log("padronObj", padronObj);
      setPadronRespuesta(padronObj);
    };

    request(
      {
        baseURL: "AFIP",
        endpoint: `/Padron/ConsultaPadronTodosLosDatos?pCUIT=${cuilInputRef.current.value}`,
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

    request(
      {
        baseURL: "AFIP",
        endpoint: `/Padron/ConsultaPadronTodosLosDatos?pCUIT=${cuit}`,
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
      cuil: cuilInputRef.current.value,
      secuencia: 0,
      nroAfiliado: nroAfiliadoInputRef.current.value,
      nombre: `${padronRespuesta?.apellidoField} ${padronRespuesta?.nombreField}`,
      puestoId: puesto.value,
      fechaIngreso: fechaIngresoInputRef.current.value,
      fechaEgreso: null,
      nacionalidadId: nacionalidad.value,
      nombreAnexo: "string",
      cuit: cuitInputRef.current.value,
      seccionalId: seccional.value,
      sexoId: sexo.value,
      dni: padronRespuesta?.numeroDocumentoField,
      actividadId: actividad.value,
      estadoSolicitudId: 1,
      afipcuil: 0,
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
        padronRespuesta?.domicilioField[1]?.direccionField,
      afipDomicilioCalle: padronRespuesta?.domicilioField[1]?.calleField,
      afipDomicilioNumero: padronRespuesta?.domicilioField[1]?.numeroField,
      afipDomicilioPiso: padronRespuesta?.domicilioField[1]?.pisoField,
      afipDomicilioDepto:
        padronRespuesta?.domicilioField[1]?.oficinaDptoLocalField,
      afipDomicilioSector: padronRespuesta?.domicilioField[1]?.sectorField,
      afipDomicilioTorre: padronRespuesta?.domicilioField[1]?.torreField,
      afipDomicilioManzana: padronRespuesta?.domicilioField[1]?.manzanaField,
      afipDomicilioLocalidad:
        padronRespuesta?.domicilioField[1]?.localidadField,
      afipDomicilioProvincia:
        padronRespuesta?.domicilioField[1]?.descripcionProvinciaField,
      afipDomicilioIdProvincia:
        padronRespuesta?.domicilioField[1]?.idProvinciaField,
      afipDomicilioCodigoPostal:
        padronRespuesta?.domicilioField[1]?.codigoPostalField,
      afipDomicilioTipo: padronRespuesta?.domicilioField[1]?.tipoDomicilioField,
      afipDomicilioEstado:
        padronRespuesta?.domicilioField[1]?.estadoDomicilioField,
      afipDomicilioDatoAdicional:
        padronRespuesta?.domicilioField[1]?.datoAdicionalField,
      afipDomicilioTipoDatoAdicional:
        padronRespuesta?.domicilioField[1]?.tipoDatoAdicionalField,
    };

    console.log("POST", nuevoAfiliado);
    const afiliadoAgregar = async (afiliadoResponseObj) => {
      console.log("afiliadosObj", afiliadoResponseObj);
      setNuevoAfiliadoResponse(afiliadoResponseObj);
      handleCerrarModal()
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
  const handleChangeSelect = (object, id) => {
    console.log("objetoSeleccionadp", object);
    console.log("id", id);
    switch (id) {
      case "SelectActividad":
        setActividad(object);
        break;

      case "SelectPuesto":
        setPuesto(object);
        break;

      case "SelectNacionalidad":
        setNacionalidad(object);
        break;

      case "SelectSexo":
        setSexo(object);
        break;

      case "SelectSeccional":
        setSeccional(object);
        break;

      default:
        break;
    }
  };
  //#endregion

  //#region handle Close
  const handleCerrarModal = () => {
    props.onClose(nuevoAfiliadoResponse === 0 ? false : true);
  }
  //#endregion

  return (
    <Modal onClose={props.onClose}>
      <h4>Nuevo Afiliado</h4>
      <div className={classes.cuil}>
        <Input
          ref={cuilInputRef}
          width={60}
          label="CUIL:"
          input={{
            id: "inputCUIL",
            type: "text",
            value: padronRespuesta?.idPersonaField,
            disabled: padronRespuesta?.idPersonaField ? true : false,
          }}
        />
        <Button
          width={20}
          disabled={padronRespuesta?.idPersonaField ? true : false}
          onClick={validarAfiliadoCUILHandler}
        >
          ValidarCUIL
        </Button>
      </div>
      <Input
        ref={nombreInputRef}
        width={50}
        label="Nombre:"
        input={{
          id: "inputNombre",
          type: "text",
          disabled: !padronRespuesta?.idPersonaField ? true : false,
          value:
            padronRespuesta != null
              ? `${padronRespuesta?.apellidoField} ${padronRespuesta?.nombreField}`
              : "",
        }}
      />
      <Input
        ref={nroAfiliadoInputRef}
        width={30}
        label="Nro Afiliado:"
        input={{
          id: "inputNroAfiliado",
          type: "text",
          disabled: !padronRespuesta?.idPersonaField ? true : false,
        }}
      />

      <div className={classes.cuil}>
        <Input
          ref={cuitInputRef}
          width={60}
          label="CUIT:"
          input={{
            id: "inputCUIT",
            type: "text",
            disabled: !padronRespuesta?.idPersonaField ? true : false,
          }}
        />
        <Button width={20} onClick={validarEmpresaCUITHandler}>
          ValidarCUIT
        </Button>
        <label>{padronEmpresaRespuesta?.razonSocialField}</label>
      </div>

      <SelectInput
        id="SelectSeccional"
        label="Seccional:"
        options={seccionales}
        value={seccional}
        defaultValue={seccionales[0]}
        onChange={handleChangeSelect}
        disabled={!padronRespuesta?.idPersonaField ? true : false}
      />

      <SelectInput
        id="SelectPuesto"
        label="Puesto:"
        options={puestos}
        value={puesto}
        defaultValue={puestos[0]}
        onChange={handleChangeSelect}
        disabled={!padronRespuesta?.idPersonaField ? true : false}
      />

      <Input
        ref={fechaIngresoInputRef}
        width={30}
        label="Fecha Ingreso:"
        input={{
          id: "inputFechaIngreso",
          type: "date",
          disabled: !padronRespuesta?.idPersonaField ? true : false,
        }}
      />

      <SelectInput
        id="SelectActividad"
        label="Actividad:"
        options={actividades}
        value={actividad}
        defaultValue={actividades[0]}
        onChange={handleChangeSelect}
        disabled={!padronRespuesta?.idPersonaField ? true : false}
      />

      <SelectInput
        id="SelectSexo"
        label="Sexo:"
        options={sexos}
        value={sexo}
        defaultValue={sexos[0]}
        onChange={handleChangeSelect}
        disabled={!padronRespuesta?.idPersonaField ? true : false}
      />

      <SelectInput
        id="SelectNacionalidad"
        label="Nacionalidad:"
        options={nacionalidades}
        value={nacionalidad}
        defaultValue={nacionalidades[0]}
        onChange={handleChangeSelect}
        disabled={!padronRespuesta?.idPersonaField ? true : false}
      />

      <div>
        <Button
          className={classes.button}
          width={20}
          onClick={afiliadoAgregarHandler}
        >
          Agregar
        </Button>
        <Button type="submit" width={20} onClick={handleCerrarModal}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
};

export default AfiliadoAgregar;
