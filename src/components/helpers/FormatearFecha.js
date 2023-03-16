import moment from "moment";

const FormatearFecha = (fecha) => {
  //console.log('FormatoFechaHora: ' + fecha);
  if (fecha === null) {
    return "";
  } else {
    return `${moment(fecha).format("DD/MM/YYYY")}`;
  }
};

export default FormatearFecha;
