import React from "react";
import classes from "../AfiliadoAgregar.module.css";
import modalCss from "../../../ui/Modal/Modal.module.css";
import Formato from "../../../helpers/Formato";
import FormatearFecha from "../../../helpers/FormatearFecha";

const CabeceraABMAfiliado = (props) => {
  const cuilValidado = () => {
    if (props.afiliado !== null) {
      if (props.afiliado?.cuilValidado === 0) {
        return "- CUIL No Validado";
      } else {
        if (props.afiliado?.cuilValidado === props.afiliado?.cuil) {
          return "- CUIL Validado";
        } else {
          return `- Diferencia en CUIL Validado (${Formato.Cuit(
            props.afiliado?.cuilValidado
          )})`;
        }
      }
    }
  };
  
  return (
    <div className={modalCss.modalCabecera}>
      <div className={classes.div}>
        <div className={classes.alert}></div>
      </div>
      <h3 className={classes.titulo}>
        {props.accion === "Modifica"
          ? `Modifica Afiliado: ${Formato.Cuit(props.cuilState.value)} ${
              props.nombreState.value
            }`
          : props.afiliadoExiste
          ? `Modifica Afiliado: ${Formato.Cuit(props.cuilState.value)} ${
              props.nombreState.value
            }`
          : props.padronRespuesta
          ? `Agrega Afiliado: ${Formato.Cuit(props.cuilState.value)} ${
              props.nombreState.value
            }`
          : "Agrega Afiliado"}
      </h3>
      <div className={classes.subTituloVentana}>
        <h5 className={classes.titulo}>
          {props.afiliadoExiste || props.afiliado?.estadoSolicitudId === 4
            ? `Estado Solicitud del Afiliado: ${props.estadoSolicitudDescripcion}`
            : null}
        </h5>
        <h5 className={classes.titulo}>
          {props.afiliadoExiste && props.afiliado?.estadoSolicitudId === 2
            ? `- Fecha de Ingreso: ${FormatearFecha(
                props.afiliado?.fechaIngreso
              )} - Nro Afiliado: ${props.afiliado?.nroAfiliado}`
            : null}
        </h5>
        <h5 className={classes.titulo}>{cuilValidado()}</h5>
      </div>
    </div>
  );
};

export default CabeceraABMAfiliado;
