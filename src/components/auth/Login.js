import React, { useState, useContext, useEffect, useRef} from "react";

import LoginCard from "../ui/LoginCard/LoginCard";
import classes from "./Login.module.css";
import Button from "../ui/Button/Button";
import useHttp from "../hooks/useHttp";
import AuthContext from "../../store/authContext";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../media/Logo1.png";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ocultarClaveImg from "../../media/OcultarPswIcono.svg";
import verClaveImg from "../../media/VerPswIcono.svg";
import { useDispatch } from "react-redux";
import { handleUsuarioLogueado } from "../../redux/actions";
import UseKeyPress from '../helpers/UseKeyPress';
  //#region shorcuts
 
const Login = () => {
  //#region atributos
  const authContext = useContext(AuthContext);
  const { isLoading, error, sendRequest: sendLoginRequest } = useHttp();
  const dispatch = useDispatch();
  //const [userLoggedIn, setUserLoggedIn] = useState(null)
  const [enteredCUIT, setEnteredCUIT] = useState("");
  const [cuitIsValid, setCUITIsValid] = useState();
  const [enteredPassword, setEnteredPassword] = useState("");
  const [passwordIsValid, setPasswordIsValid] = useState();
  const [mensajeError, setMensajeError] = useState("");
  const ingresarRef = useRef();
  const navigate = useNavigate();
//#endregion 

  //#region Capturo errores de login
  useEffect(() => {
    if (error) {
      setMensajeError(error.message);
      if(error.code === 401){
        setMensajeError(error.message);
      }
      if(error.statusCode === 500){
        setMensajeError("Error al conectar con el servidor");
      }
      return;
    }
  }, [error]);
  //#endregion


    //#region shorcuts
    UseKeyPress(['i'], ()=>ingresarRef.current.requestSubmit(), 'AltKey');
    UseKeyPress(['r'], ()=>navigate("/Registro"), 'AltKey');
    UseKeyPress(['c'], ()=>navigate("/Contacto"), 'AltKey');
  //#endregion 

  const cuitChangeHandler = (event) => {
    setEnteredCUIT(event.target.value);
  };

  const passwordChangeHandler = (event) => {
    setEnteredPassword(event.target.value);
  };

  const validateCUITHandler = () => {
    setCUITIsValid(enteredCUIT.trim().length === 11);
  };

  const validatePasswordHandler = () => {
    setPasswordIsValid(enteredPassword.trim().length > 6);
  };

  const processLogIn = async (userObject) => {
    await authContext.login(
      userObject.token.tokenId,
      userObject.token.validTo.toString(),
      userObject.rol,
      userObject
    );
    //pasar al authcontext el usuario

    dispatch(handleUsuarioLogueado(userObject));
    navigate("/Inicio");
  };

  const sendLoginHandler = async () => {
    sendLoginRequest(
      {
        baseURL: "Seguridad",
        endpoint: "/Usuario/loginEmailCuit",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: {
          Usuario: enteredCUIT,
          Password: enteredPassword,
          Rol: null,
        },
      },
      processLogIn
    );
  };

  const submitHandler = (event) => {
    event.preventDefault();
    //props.onLogin(enteredCUIT, enteredPassword);
    sendLoginHandler();
  };

  const [verClave, setVerClave] = useState(false);

  return (
    <div className={classes.container}>
      <LoginCard>
        <img src={logo} width="175" height="175"/>
        <Form className="text-start" onSubmit={submitHandler} ref={ingresarRef}>
          <Form.Group className="mt-3">
            <Form.Label style={{ color: "#555555" }}>
              <strong>Usuario</strong>
            </Form.Label>

            <Form.Control
              type="text"
              placeholder="Cuit/Cuil/Email"
              id="cuit"
              value={enteredCUIT}
              onChange={cuitChangeHandler}
              onBlur={validateCUITHandler}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label style={{ color: "#555555" }}>
              <strong>Clave</strong>
            </Form.Label>
            <InputGroup > 
              <Form.Control
                type={verClave ? "text" : "password"}
                placeholder="Clave"
                id="password"
                value={enteredPassword}
                onChange={passwordChangeHandler}
                onBlur={validatePasswordHandler}
              />
                <InputGroup.Text>
                  <img
                    width={20}
                    height={20}
                    title={verClave ? "Ocultar Clave" : "Ver Clave"}
                    src={verClave ? ocultarClaveImg : verClaveImg}
                    onClick={() => setVerClave((prevState) => !prevState)}
                  />
                </InputGroup.Text>
            </InputGroup>
          </Form.Group>
          
          <div className={`mt-3 ${classes.actions}`}>
            {!isLoading ? (
              <div>
                <Button active type="submit" className="botonAzul" underlineindex={0}>
                  Ingresar
                </Button>
                <p />
                
                <Button onClick={()=>navigate("/Registro")}underlineindex={0}>Registro</Button>
              </div>
            ) : (
              <p>Cargando...</p>
            )}
          </div>
          <div>
            {error ? <p>Error: {mensajeError}</p> : null}
          </div>
        </Form>
        <div className="mt-4">
          <a>¿Olvidaste tu <Link to="/recuperarClave">Clave</Link>?</a>
        </div>    

        <div className="mt-2">
          <a><Link to="/contacto"> <text className={classes.underline}>C</text>ontacto</Link></a>
        </div>  
      </LoginCard>
     
    </div>
  );
};

export default Login;
