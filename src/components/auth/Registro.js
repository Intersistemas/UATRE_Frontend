import React, { useState, useContext, useEffect } from "react";

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

const Registro = () => {
  console.log("Login");
  const authContext = useContext(AuthContext);
  const { isLoading, error, sendRequest: sendLoginRequest } = useHttp();
  const dispatch = useDispatch();
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const [enteredCUIT, setEnteredCUIT] = useState("");
  const [cuitIsValid, setCUITIsValid] = useState();

  const [enteredEmail, setEnteredEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState();
  
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredRepeatPassword, setEnteredRepeatPassword] = useState("");
  const [passwordIsValid, setPasswordIsValid] = useState();
  const [mensajeError, setMensajeError] = useState("");

  //#region Capturo errores de login
  useEffect(() => {
    if (error) {
      console.log("capturo error", error);
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

  const navigate = useNavigate();

  const cuitChangeHandler = (event) => {
    setEnteredCUIT(event.target.value);
  };

  const emailChangeHandler = (event) => {
    setEnteredEmail(event.target.value);
  };

  const passwordChangeHandler = (event) => {
    setEnteredPassword(event.target.value);
  };

  const repeatPasswordChangeHandler = (event) => {
    setEnteredRepeatPassword(event.target.value);
  };
  
  const validateCUITHandler = () => {
    setCUITIsValid(enteredCUIT.trim().length === 11);
  };

  const validateEmailHandler = () => {
    
  };

  const validatePasswordHandler = () => {
    setPasswordIsValid(enteredPassword.trim().length > 6);
  };


  //Se debe procesar el registro (envio de email)
  const processLogIn = async (userObject) => {
    console.log("userObject1", userObject);
    await authContext.login(
      userObject.token.tokenId,
      userObject.token.validTo.toString(),
      userObject.rol,
      userObject
    );
    console.log("logged");
    //pasar al authcontext el usuario

    console.log("enteredCUIT", enteredCUIT);
    dispatch(handleUsuarioLogueado(userObject));
    navigate("/inicio");
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
    console.log("submitHandler");
  };

  const [verClave, setVerClave] = useState(false);

  return (
    <div className={classes.container}>
      <LoginCard>
        <img src={logo} width="200" height="200" />
        <Form className="text-start" onSubmit={submitHandler}>
          <Form.Group className="mt-3" controlId="formCUIT">
            <Form.Label style={{ color: "#555555" }}>
              <strong>CUIT</strong>
            </Form.Label>

            <Form.Control
              required
              type="text"
              placeholder="Cuit/Cuil"
              id="cuit"
              value={enteredCUIT}
              onChange={cuitChangeHandler}
              onBlur={validateCUITHandler}
            />
          </Form.Group>

          <Form.Group className="mt-3" controlId="formEmail">
            <Form.Label style={{ color: "#555555" }}>
                <strong>Email</strong>
              </Form.Label>

              <Form.Control
                required
                type="email"
                placeholder="Email"
                id="email"
                value={enteredEmail}
                onChange={emailChangeHandler}
                onBlur={validateEmailHandler}
              />
          </Form.Group>

          <Form.Group className="mt-3" controlId="formClave">
            <Form.Label style={{ color: "#555555" }}>
              <strong>Clave</strong>
            </Form.Label>
            
            <InputGroup>
              <Form.Control
                required
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
                  title={verClave ? "Ocultar clave" : "Ver Clave"}
                  src={verClave ? ocultarClaveImg : verClaveImg}
                  onClick={() => setVerClave((prevState) => !prevState)}
                />
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mt-3" controlId="formRepetirClave">
          <Form.Label style={{ color: "#555555" }}>
            <strong>Repetir Clave</strong>
          </Form.Label>
          <InputGroup>
            <Form.Control
              required
              type={verClave ? "text" : "password"}
              placeholder="Repetir Clave"
              id="repeat-password"
              value={enteredRepeatPassword}
              onChange={repeatPasswordChangeHandler}
              onBlur={validatePasswordHandler}
            />
            <InputGroup.Text>
              <img
                width={20}
                height={20}
                title={verClave ? "Ocultar clave" : "Ver Clave"}
                src={verClave ? ocultarClaveImg : verClaveImg}
                onClick={() => setVerClave((prevState) => !prevState)}
              />
            </InputGroup.Text>
          </InputGroup>
          </Form.Group>

          <div className={`mt-3 ${classes.actions}`}>
            {!isLoading ? (
              <div>
                <Button type="submit" className="botonAzul">
                  Registrar
                </Button>

              </div>
            ) : (
              <p>Cargando...</p>
            )}
           <div>
              <Button onClick={()=>navigate("/ingreso")} type="submit" className="botonBlanco">
                Inicio
              </Button>
            </div> 
          </div>
          <div>
            {error ? <p>Error: {mensajeError}</p> : null}
          </div>
        </Form>
      </LoginCard>
    </div>
  );
};

export default Registro;