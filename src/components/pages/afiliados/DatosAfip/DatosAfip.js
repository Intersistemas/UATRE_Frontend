import React from "react";
import classes from "../AfiliadoAgregar.module.css";
import InputMaterial, { CUITMask, DNIMask } from "../../../ui/Input/InputMaterial";
import { useState } from "react";
import { useEffect } from "react";
import moment from "moment";

const DatosAfip = (props) => {
  const [nombreAFIP, setNombreAFIP] = useState("");
  const [fechaNacimientoAFIP, setFechaNacimientoAFIP] = useState("");
  const [cuilAFIP, setCUILAFIP] = useState("");
  const [tipoDocumentoAFIP, setTipoDocumentoAFIP] = useState("");
  const [numeroDocumentoAFIP, setNumeroDocumentoAFIP] = useState("");
  const [estadoClaveAFIP, setEstadoClaveAFIP] = useState("");
  const [domicilioRealAFIP, setDomicilioRealAFIP] = useState("");
  const [tipoPersonaAFIP, setTipoPersonaAFIP] = useState("");
  const [tipoClaveAFIP, setTipoClaveAFIP] = useState("");
  const [descripcionActividadPrincipalAFIP,setDescripcionActividadPrincipalAFIP ] = useState("");

  const [provinciaAFIP,setProvinciaAFIP] = useState("");
  const [localidadAFIP,setLocalidadAFIP] = useState("");
  

  const [idActividadPrincipalAFIP, setIdActividadPrincipalAFIP] = useState("");
  const [periodoActividadPrincipalAFIP, setPeriodoActividadPrincipalAFIP] =
    useState("");
  const [mesCierreAFIP, setMesCierreAFIP] = useState("");
  
  useEffect(() => {

    console.log('props.padronRespuesta')
     if (props.padronRespuesta !== null) {
      const domicilioReal = props.padronRespuesta?.domicilios?.find(
        (domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"
      );
      setNombreAFIP(
        `${props.padronRespuesta?.apellido} ${
          props.padronRespuesta?.nombre ?? ""
        }`
      );
      setFechaNacimientoAFIP(
        moment(props.padronRespuesta?.fechaNacimiento).format("yyyy-MM-DD")
      );
      setCUILAFIP(props.padronRespuesta?.idPersona);
      setTipoDocumentoAFIP(props.padronRespuesta?.tipoDocumento);
      setNumeroDocumentoAFIP(props.padronRespuesta?.numeroDocumento);
      setEstadoClaveAFIP(props.padronRespuesta?.estadoClave);
      setDomicilioRealAFIP(domicilioReal?.direccion);
      setTipoPersonaAFIP(props.padronRespuesta?.tipoPersona);
      setTipoClaveAFIP(props.padronRespuesta?.tipoClave);
      setDescripcionActividadPrincipalAFIP(
        props.padronRespuesta?.descripcionActividadPrincipal
      );
      setProvinciaAFIP(
        domicilioReal?.descripcionProvincia
      );
      setLocalidadAFIP(
        `${domicilioReal?.codigoPostal} - ${domicilioReal?.localidad}`
      );
      setIdActividadPrincipalAFIP(props.padronRespuesta?.idActividadPrincipal);
      setPeriodoActividadPrincipalAFIP(
        props.padronRespuesta?.periodoActividadPrincipal
      );
      setMesCierreAFIP(props.padronRespuesta?.mesCierre);
    }

    else if (props.afiliado) {
      setNombreAFIP(
        `${props.afiliado?.afipApellido} ${props.afiliado?.afipNombre ?? ""}`
      );
      setFechaNacimientoAFIP(
        moment(props.afiliado?.afipFechaNacimiento).format("yyyy-MM-DD")
      );
      setCUILAFIP(props.afiliado?.cuil);
      setTipoDocumentoAFIP(props.afiliado?.afipTipoDocumento);
      setNumeroDocumentoAFIP(props.afiliado?.afipNumeroDocumento);
      setEstadoClaveAFIP(props.afiliado?.afipEstadoClave);
      setDomicilioRealAFIP(props.afiliado?.afipDomicilioDireccion);
      setTipoPersonaAFIP(props.afiliado?.afipTipoPersona);
      setTipoClaveAFIP(props.afiliado?.afipTipoClave);
      setDescripcionActividadPrincipalAFIP(
        props.afiliado?.afipActividadPrincipal
      );
      setIdActividadPrincipalAFIP(props.afiliado?.afipIdActividadPrincipal);
      setPeriodoActividadPrincipalAFIP(
        props.afiliado?.afipPeriodoActividadPrincipal
      );
      setMesCierreAFIP(props.afiliado?.afipMesCierre);
    } 
  }, [props.padronRespuesta, props.afiliado]);

  return (
    <>
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
          />
        </div>
        <div className={classes.input20}>
          <InputMaterial
            mask={CUITMask}
            id="cuilAFIP"
            value={cuilAFIP.toString()}
            label="CUIL"
            readOnly={true}
            onChange={props.onHandleInputChange}
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
              tipoDocumentoAFIP !== props.afiliado?.afipTipoDocumento
                ? "warning"
                : ""
            }
            focused={
              tipoDocumentoAFIP !== "" &&
              tipoDocumentoAFIP !== props.afiliado?.afipTipoDocumento
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
						//mask="99.999.999"
            mask={DNIMask}
            color={
              numeroDocumentoAFIP !== "" &&
              numeroDocumentoAFIP !== props.afiliado?.afipNumeroDocumento
                ? "warning"
                : ""
            }
            focused={
              numeroDocumentoAFIP !== "" &&
              numeroDocumentoAFIP !== props.afiliado?.afipNumeroDocumento
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
              tipoPersonaAFIP !== props.afiliado?.afipTipoPersona
                ? "warning"
                : ""
            }
            focused={
              tipoPersonaAFIP !== "" &&
              tipoPersonaAFIP !== props.afiliado?.afipTipoPersona
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
              estadoClaveAFIP !== props.afiliado?.afipEstadoClave
                ? "warning"
                : ""
            }
            focused={
              estadoClaveAFIP !== "" &&
              estadoClaveAFIP !== props.afiliado?.afipEstadoClave
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
              tipoClaveAFIP !== props.afiliado?.afipTipoClave
                ? "warning"
                : ""
            }
          />
        </div>
      </div>
      

      <div className={classes.renglon}>
        <div className={classes.input}>
          <InputMaterial
            id="provinciaAFIP"
            value={provinciaAFIP}
            label="Provincia"
            readOnly={true}
            color={
              provinciaAFIP !== "" &&
              provinciaAFIP !==
                props.afiliado?.afipPeriodoActividadPrincipal
                ? "warning"
                : ""
            }
          />
        </div>
        <div className={classes.input}>
          <InputMaterial
            id="localidadAFIP"
            value={localidadAFIP}
            label="Localidad"
            readOnly={true}
            color={
              localidadAFIP !== "" &&
              localidadAFIP !== props.afiliado?.afipTipoPersona
                ? "warning"
                : ""
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
            color={
              domicilioRealAFIP !== "" &&
              domicilioRealAFIP !==
                props.afiliado?.afipPeriodoActividadPrincipal
                ? "warning"
                : ""
            }
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
                props.afiliado?.afipIdActividadPrincipal
                ? "warning"
                : ""
            }
            focused={
              idActividadPrincipalAFIP !== "" &&
              idActividadPrincipalAFIP !==
                props.afiliado?.afipIdActividadPrincipal
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
                props.afiliado?.afipPeriodoActividadPrincipal
                ? "warning"
                : ""
            }
            focused={
              periodoActividadPrincipalAFIP !== "" &&
              periodoActividadPrincipalAFIP !==
                props.afiliado?.afipPeriodoActividadPrincipal
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
              mesCierreAFIP !== props.afiliado?.afipMesCierre
                ? "warning"
                : ""
            }
            focused={
              mesCierreAFIP !== "" &&
              mesCierreAFIP !== props.afiliado?.afipMesCierre
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
                props.afiliado?.afipActividadPrincipal
                ? "warning"
                : ""
            }
            focused={
              descripcionActividadPrincipalAFIP !== "" &&
              descripcionActividadPrincipalAFIP !==
                props.afiliado?.afipActividadPrincipal
                ? true
                : false
            }
            width={100}
          />
        </div>
      </div>
    </>
  );
};

export default DatosAfip;
