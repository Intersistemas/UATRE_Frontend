import React, { useState, useEffect, useRef  } from "react";

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

import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import AlertTitle from '@mui/material/AlertTitle';
import CloseIcon from '@mui/icons-material/Close';
import InputMask from 'react-input-mask'; 
import Spinner from 'react-bootstrap/Spinner';
import UseKeyPress from '../helpers/UseKeyPress';

const Registro = () => {
  console.log("Registro");

  const { isLoading, error, sendRequest: request } = useHttp();
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const [enteredCUIT, setEnteredCUIT] = useState('');
  const [cuitIsValid, setCUITIsValid] = useState(false);

  const [enteredEmail, setEnteredEmail] = useState("");
  
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredRepeatPassword, setEnteredRepeatPassword] = useState("");
  const [passwordIsValid, setPasswordIsValid] = useState();
  
  const registrarRef = useRef();

  const [message, setMessage] = React.useState("");

  //#region Capturo errores de Registro
  useEffect(() => {
    if (error) {
      setMessage("❌ Error registrando el usuario - "+error.message);
      console.log("capturo error", error);

      if(error.code === 401){
        setMessage("❌ "+error.message);
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


  //#region shorcuts
  UseKeyPress(['r'], ()=>registrarRef.current.requestSubmit(), 'AltKey');
  UseKeyPress(['i'], ()=>navigate("/Ingreso"), 'AltKey');
//#endregion 

//#region valido CUIT en AFIP
  const validarCUITHandler = () => { /*
    setCUITLoading(true);
    const processConsultaPadron = async (padronObj) => {
      //console.log("padronObj", padronObj);
      setCuitValidado(true);
      setPadronEmpresaRespuesta(padronObj);
      setCUITEmpresa(padronObj.cuit);
      setRazonSocialEmpresa(
        padronObj?.razonSocial ?? `${padronObj?.apellido} ${padronObj?.nombre}`
      );
      setActividadEmpresa(padronObj?.descripcionActividadPrincipal ?? "");
      setDomicilioEmpresa(
        padronObj ? `${padronObj?.domicilios[1]?.direccion}` : ""
      );
      setLocalidadEmpresa(
        padronObj
          ? padronObj?.domicilios[1]?.localidad ??
              padronObj?.domicilios[1]?.descripcionProvincia
          : ""
      );
      // setTelefonoEmpresa()
      // setCorreoEmpresa()
      // setLugarTrabajoEmpresa()
      //ciius
      setCUITLoading(false);
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${enteredCUIT}&VerificarHistorico=${true}`,
        method: "GET",
      },
      processConsultaPadron
    );*/
  };
//#endregion

//#region Validaciones de INPUTS
  const navigate = useNavigate();

  const cuitChangeHandler = (event) => {
    setEnteredCUIT(event.target.value.replace(/[^0-9]+/g, "")); //GUARDO SOLO NUMEROS
   
    console.log('-enteredCUIT:',enteredCUIT);

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
    console.log('validateCUITHandler',enteredCUIT.length)
    setCUITIsValid(enteredCUIT.length === 11);
  };

  const validateEmailHandler = () => {
    
  };

  const validatePasswordHandler = () => {
    setPasswordIsValid(enteredPassword.trim().length > 7);
  };
//#endregion

  //Se debe procesar el registro (envio de email)
  const processRegistro = async (userObject) => {
    console.log("userObject_Registro", userObject);
    setMessage("✔️ Hemos enviado un correo de Confirmación a "+enteredEmail);

    console.log("Registrado");
    
  };

  const sendRegistrarHandler = async () => {
    setMessage("");
    request(
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
        <img src={logo} width="175" height="175"/>

        {/**/}
        { (message && !error) ?  <div>{message}</div> : 
         <Form className="text-start" onSubmit={submitHandler} ref={registrarRef}>
          <Form.Group className="mt-3" >
            <Form.Label style={{ color: "#555555" }}>
              <strong>CUIT</strong>
            </Form.Label>

          <InputGroup>
            <Form.Control
                required
                type="text"
                placeholder="Cuit"
                id="cuit"
                as={InputMask}
                mask="99-99.999.999-9"
                value={enteredCUIT}
                onChange={cuitChangeHandler}
                onBlur={validateCUITHandler}
                disabled={isLoading}
              />

              <InputGroup.Text>
                  {/*cuitIsValid &&
                  <Spinner
                    variant="primary"
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />*/}
                  
              </InputGroup.Text>
              </InputGroup>
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
                <Button type="submit" className="botonAzul" underlineindex={0}>
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
            <Button onClick={()=>navigate("/Ingreso")} underlineindex={0}>
              Inicio
            </Button>
        </div>
      </LoginCard>
      
    </div>
  );
};

export default Registro;