const ValidarEmail = (props) => {
  // eslint-disable-next-line no-useless-escape
  return /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
    props
  )
    ? true
    : false;
};

export default ValidarEmail;
