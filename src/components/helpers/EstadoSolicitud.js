import React from 'react'

export default function EstadoSolicitud(props) {
    console.log("props.estadosSolicitudes", props.estadosSolicitudes);
    const estadoSolicitud = props.estadosSolicitudes
      .find((estado) => estado.value === props.estadoSolicitud)
    console.log("estadoSolicitud", estadoSolicitud);
  return "estado"
}
