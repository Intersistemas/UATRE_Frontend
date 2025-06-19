import React, { useState, useEffect, useRef  } from "react";

import LoginCard from "../ui/LoginCard/LoginCard";
import classes from "./Login.module.css";
import Button from "../ui/Button/Button";
import useHttp from "../hooks/useHttp";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../media/Logo1.png";
//import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ocultarClaveImg from "../../media/OcultarPswIcono.svg";
import verClaveImg from "../../media/VerPswIcono.svg";

import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import AlertTitle from '@mui/material/AlertTitle';
import CloseIcon from '@mui/icons-material/Close'; 
import Spinner from 'react-bootstrap/Spinner';
import UseKeyPress from '../helpers/UseKeyPress';
import MaskedInput from "react-text-mask";
import SelectMaterial from "components/ui/Select/SelectMaterial";

import {mapOptions} from "components/ui/Select/SearchSelectMaterial";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
import { InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ValidarCUIT from "components/validators/ValidarCUIT";

const RecuperarClave = () => {
  
  const { isLoading, error, sendRequest: request } = useHttp();
  const [errorValidacion, setErrorValidacion] = useState(false);
  
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const [enteredTareasModulos, setEnteredTareasModulos] = useState();

  const [enteredCUIT, setEnteredCUIT] = useState('');
  const [enteredNombre, setEnteredNombre] = useState('');

  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredRepeatPassword, setEnteredRepeatPassword] = useState("");

  const [message, setMessage] = React.useState("");

  let {search} = useLocation();
  let query = new URLSearchParams(search);
  let paramEmail = query.get("email");
  //let token = decodeURIComponent(query.get("token")); no funciona el encodeURL

  const parametros = search.split("&token=")
  let paramToken = parametros[1]

  console.log("search",search);
  console.log("query",query);
  console.log("paramEmail",paramEmail);
  console.log("paramToken",paramToken);


  //#region Capturo errores de Registro
  useEffect(() => {
    if (error) {
      setMessage("❌ Error Recuperando Clave - "+error.message);
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
  UseKeyPress(['r'], ()=>recuperarClaveHandler(), 'AltKey');
  UseKeyPress(['i'], ()=>navigate("/Ingreso"), 'AltKey');
//#endregion 

const navigate = useNavigate();

//#region RecuperarClave EMAIL
  //Se debe procesar el envio de email de recuperacion (envio de email)
  const processRecuperarClaveEmail = async (userObject) => {
    console.log("userObject_processRecuperarClaveEmail", userObject);
    setMessage("✔️ Hemos enviado un correo de Recuperación a "+enteredEmail+ "(no olvide revisar la carpeta SPAM/No Deseado)");
  };

  const sendRecuperarClaveEmailHandler = async () => {
    setMessage("");
    request(
      {
        baseURL: "Seguridad",
        endpoint: "/Usuario/recuperarClaveEmail",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: {
          email: enteredEmail,
        },
      },
      processRecuperarClaveEmail
    );
  };
//#endregion

//#region Restablecer Clave

//Se debe procesar el envio de email de recuperacion (envio de email)
const processRestablecerClave = async (userObject) => {
  console.log("userObject_processRestablecerClave", userObject);
  setMessage("✔️ Su clave fué Restablecida con Exito!");
};

const sendRestablecerClaveHandler = async () => {
  setMessage("");
  request(
    {
      baseURL: "Seguridad",
      endpoint: "/Usuario/reestablecerClave",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: {
        password: enteredPassword,
        confirmPassword: enteredRepeatPassword,
        email: paramEmail,
        token: paramToken,
      },
    },
    processRestablecerClave
  );
};

//#endregion

  const [verClave, setVerClave] = useState(false);

  const handleMouseDownPassword = (event) => {
		event.preventDefault();
	  };
 
//#region recuperar clave via email
  const recuperarClaveHandler = () => {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  
    let erroresValidacion = ""

    if(enteredEmail.trim().length === 0 || !emailRegex.test(enteredEmail)) {erroresValidacion = erroresValidacion.concat(`❌ Debe ingresar un Email válido. \n`)}
    
    if (erroresValidacion.trim().length === 0){
      setErrorValidacion(false)
      sendRecuperarClaveEmailHandler()
    } else {
      setErrorValidacion(true)
      setMessage(erroresValidacion)
    }
  }
  //#endregion

//#region restablece clave
const nuevaClaveHandler = () => {

  let erroresValidacion = ""

  if (enteredRepeatPassword !== enteredPassword) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben ser idénticas. \n`)}
  if (enteredPassword.trim().length < 6) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben tener al menos 6 caractéres. \n`)}
    
  if (erroresValidacion.trim().length === 0){
    setErrorValidacion(false)
    sendRestablecerClaveHandler()
  } else {
    setErrorValidacion(true)
    setMessage(erroresValidacion)
  }
}
//#endregion

  const solicitaRecuperacion = 
    <div> 
      Enviaremos un correo a su casilla de Email para reestablecer su clave, por favor ingrese su Email
      <Grid  gap="inherit">
          
          <InputMaterial
            type="email"
            placeholder="Email"
            label="Email"
            id="email"
            value={enteredEmail}
            onChange={(value)=>setEnteredEmail(value)}
            required
          />
      </Grid>
      <Grid  gap="inherit"/>
      <div className={`mt-5 ${classes.actions}`}>
        {!isLoading ? (
          <div>
            <Button type="submit" className="botonAzul" underlineindex={0} onClick={()=>recuperarClaveHandler()}>
              Recuperar Clave
            </Button>
          </div>
        ) : (
          <p>Recuperando...</p>
        )}
      </div>    
    </div>
  
const restableceClave = 
    <>
      <Grid>
        <InputMaterial 
            label="Nueva Clave"
            required
            type={verClave ? "text" : "password"}
            style={{backgroundColor: "white"}}
            placeholder="******"
            value={enteredPassword}
            onChange={(v)=>setEnteredPassword(v)}
            InputProps={{
              endAdornment: 
              <InputAdornment>
                <IconButton
                aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
                onClick={() => setVerClave((prevState) => !prevState)}
                onMouseDown={handleMouseDownPassword}
                edge="start"
                >
                {verClave ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }}
          />
      </Grid>

      <Grid>
          <InputMaterial
            label="Repetir Nueva Clave"
            required
            type={verClave ? "text" : "password"}
            style={{backgroundColor: "white"}}
            placeholder="******"
            value={enteredRepeatPassword}
            onChange={(v) => setEnteredRepeatPassword(v)}
            InputProps={{
              endAdornment: 
              <InputAdornment>
                <IconButton
                aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
                onClick={() => setVerClave((prevState) => !prevState)}
                onMouseDown={handleMouseDownPassword}
                edge="start"
                >
                {verClave ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }}
          />
      </Grid>
      <Grid  gap="inherit"/>
      <div className={`mt-5 ${classes.actions}`}>
        {!isLoading ? (
          <div>
            <Button type="submit" className="botonAzul" underlineindex={0} onClick={()=>nuevaClaveHandler()}>
              Restablecer Clave
            </Button>
          </div>
        ) : (
          <p>Restableciendo...</p>
        )}
      </div>    
    </>


  return (
    <div className={classes.container}>
      <LoginCard>
        <div className="m-3">
          <img src={logo} width="175" height="175"/>
        </div>
        
        { (message && !error && !errorValidacion) ?
        
        <div>{message}</div> 
        : 
        (
        <Grid col full gap="15px">
         
        {paramEmail && paramToken ? restableceClave :
       
        solicitaRecuperacion}
          
        </Grid>
        )
        }
          <Collapse in={(error || errorValidacion) && message}>
                <Alert
                 severity="error"
                 
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
                      sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                      <AlertTitle><strong>Error!</strong></AlertTitle>
                      {message}
                </Alert>
          </Collapse>  

        <div className={`mt-3`}>
            <Button onClick={()=>navigate("/Ingreso")} underlineindex={0}>
              Inicio
            </Button>
        </div>
      </LoginCard>
      
    </div>
  );
};

export default RecuperarClave;