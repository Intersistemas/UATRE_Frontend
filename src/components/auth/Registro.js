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

import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import AlertTitle from '@mui/material/AlertTitle';
import CloseIcon from '@mui/icons-material/Close';

const Registro = () => {
  console.log("Login");
  const authContext = useContext(AuthContext);
  const { isLoading, error, sendRequest: sendLoginRequest } = useHttp();
  const dispatch = useDispatch();
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const [enteredCUIT, setEnteredCUIT] = useState();
  const [cuitIsValid, setCUITIsValid] = useState();

  const [enteredEmail, setEnteredEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState();
  
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredRepeatPassword, setEnteredRepeatPassword] = useState("");
  const [passwordIsValid, setPasswordIsValid] = useState();

  const [message, setMessage] = React.useState("");

  //#region Capturo errores de login
  useEffect(() => {
    if (error) {
      setMessage("❌ Error registrando el usuario - "+error);
      console.log("capturo error", error);
      console.log("capturo error2", {error});


      if(error.code === 401){
        setMessage("❌ "+error);
      }
      if(error.statusCode === 405){
        setMessage("❌ Endpoint no encontrado.");
      }
      
      if(error.statusCode === 500){
        setMessage("❌ Error al conectar con el servidor.");
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
  const processRegistro = async (userObject) => {
    console.log("userObject_Registro", userObject);
    setMessage("✔️ Hemos enviado un correo de Confirmación a "+enteredEmail);

    console.log("Registrado");
    
  };

  const sendRegistrarHandler = async () => {
    setMessage("");
    sendLoginRequest(
      {
        baseURL: "Seguridad",
        endpoint: "/Usuario/registrarViaEmail",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: {
          cuit: enteredCUIT,
          email: enteredEmail,
          password: enteredPassword,
          confirmPassword: enteredRepeatPassword,
          rol: "Empleador",
          modulosId: 2, //Se debería selecciona de la lista de tareas
          tareasId: 1 //Se debería selecciona de la lista de tareas
        },
      },
      processRegistro
    );
  };

  const submitHandler = (event) => {
    event.preventDefault();
    sendRegistrarHandler();
  };

  const [verClave, setVerClave] = useState(false);

  return (
    <div className={classes.container}>
      <LoginCard>
        <img src={logo} width="175" height="175" />

        {/**/}
        { (message && !error) ?  <div>{message}</div> : 
         <Form className="text-start" onSubmit={submitHandler}>
          <Form.Group className="mt-3" >
            <Form.Label style={{ color: "#555555" }}>
              <strong>CUIT</strong>
            </Form.Label>

            <Form.Control
              required
              type="number"
              placeholder="Cuit/Cuil"
              id="cuit"
              value={enteredCUIT}
              onChange={cuitChangeHandler}
              onBlur={validateCUITHandler}
            />
          </Form.Group>

          <Form.Group className="mt-3">
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

          <Form.Group className="mt-3">
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

          <Form.Group className="mt-3">
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
              <p>Registrando...</p>
            )}
           
          </div>
          <Collapse in={error && message}>
                <Alert severity="error"
                      action={
                            <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                            setMessage("");
                            }}
                            >
                            <CloseIcon fontSize="inherit" />
                            </IconButton>
                      }
                      sx={{ mb: 2 }}>
                      <AlertTitle><strong>Error!</strong></AlertTitle>
                      {message}
                </Alert>
          </Collapse>  
        </Form>}

        <div className={`mt-3`}>
            <Button onClick={()=>navigate("/ingreso")} type="submit" className="botonBlanco">
              Inicio
            </Button>
        </div>
      </LoginCard>
      
    </div>
  );
};

export default Registro;