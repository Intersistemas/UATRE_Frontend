const deshabilitarBotonValidarCUIL = (props) => {
  if (props.padronRespuesta?.idPersona > 0) {
    return true;
  }

  if (props.afiliadoExiste) {
    return true;
  }

  if (!props.cuilIsValid) {
    return true;
  }

  return false;
};

export default deshabilitarBotonValidarCUIL;
