const habilitarBotonValidarCUIL = (props) => {
  if (props.cuilIsValid === false) {
    return true;
  }

  if (props.afiliadoExiste) {
    return true;
  }

  if (props.padronRespuesta?.idPersonaField > 0) {
    return true;
  }

  return false;
};

export default habilitarBotonValidarCUIL;
