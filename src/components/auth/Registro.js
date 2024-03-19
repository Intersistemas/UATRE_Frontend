import React, { useState, useEffect, useRef  } from "react";

import LoginCard from "../ui/LoginCard/LoginCard";
import classes from "./Login.module.css";
import Button from "../ui/Button/Button";
import useHttp from "../hooks/useHttp";
import { Link, useNavigate } from "react-router-dom";
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

const Registro = () => {
  console.log("Registro");

  const { isLoading, error, sendRequest: request } = useHttp();
  const [errorValidacion, setErrorValidacion] = useState(false);
  
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const [enteredTareasModulos, setEnteredTareasModulos] = useState();

  const [enteredCUIT, setEnteredCUIT] = useState('');
  const [enteredNombre, setEnteredNombre] = useState('');

  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredRepeatPassword, setEnteredRepeatPassword] = useState("");

  const [modulos, setModulos] = useState(
    {
      options: [],
      selected: 0,
      tareas:[]
    }
  );  
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

  //#region cargo TODOS los modulos al inicio
  useEffect(() => {
    const procesaModulos = async (modulosObj) => {
      const modulosTodos = mapOptions({
        data: modulosObj.filter((t) => t.nombre === "Sistema de Aportes Rurales" || t.nombre === "SAR"),
        map: (m) => ({ value: m.id, label: m.nombre }),
      })
    setModulos({...modulos, options: modulosTodos})
    }
    request(
      {
        baseURL: "Seguridad",
        endpoint: "/Modulos",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
			},
      procesaModulos
    );
  }, []);

  //#region shorcuts
  UseKeyPress(['r'], ()=>registraHandler(), 'AltKey');
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
  
  const moduloChangeHandler = (value) => {
    
    setEnteredTareasModulos(value);
    setModulos({...modulos, selected: value})

    const procesaTareas = async (tareasObj) => {
      const tareasModulo = tareasObj.filter((t) => t.moduloNombre === "Sistema de Aportes Rurales").map((t)=> t.id)
      console.log("tareasModulo",tareasModulo)
      setModulos({...modulos, tareas: tareasModulo, selected: value})
    }
    
    request(
      {
        baseURL: "Seguridad",
        endpoint: `/Tareas?ModulosId=${value}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
			},
      procesaTareas
    );

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
          nombre: enteredNombre,
          userName: enteredCUIT,
          email: enteredEmail,
          password: enteredPassword,
          confirmPassword: enteredRepeatPassword,
          rol: "Usuario",
          tipo: "Externo",
          tareas: modulos.tareas //Asigno todas las tareas de modulo
        },
      },
      processRegistro
    );
  };

  const [verClave, setVerClave] = useState(false);

  const handleMouseDownPassword = (event) => {
		event.preventDefault();
	  };
 
//#region aqui hago todas las validaciones
  const registraHandler = () => {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  
      
    let erroresValidacion = ""

    if (enteredRepeatPassword !== enteredPassword) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben ser idénticas. \n`)}

    if (enteredPassword.trim().length < 6) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben tener al menos 6 caractéres. \n`)}
    
    if(enteredCUIT.trim().length === 0 || !ValidarCUIT(enteredCUIT)) {erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un CUIT/CUIL válido. \n")}

    if(enteredEmail.trim().length === 0 || !emailRegex.test(enteredEmail)) {erroresValidacion = erroresValidacion.concat(`❌ Debe ingresar un Email válido. \n`)}
    
    if(enteredNombre.trim().length === 0) {erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un Nombre/Razón Social. \n")}
     

    if (modulos.selected === 0) {
       erroresValidacion = erroresValidacion.concat("❌ Debe seleccionar un Módulo. \n")
    }

    if (erroresValidacion.trim().length === 0){
      setErrorValidacion(false)
      sendRegistrarHandler()
    } else {
      setErrorValidacion(true)
      setMessage(erroresValidacion)
    }

  }
  //#endregion

  return (
    <div className={classes.container}>
      <LoginCard>
        <img src={logo} width="175" height="175"/>
        
        { (message && !error && !errorValidacion) ?  <div>{message}</div> : 
        <Grid col full gap="15px">

          <Grid  gap="inherit">
              <SelectMaterial
                  id="modulos"
                  name="modulos"
                  label="Modulos"
                  placeholder="Modulos"
                  //error={!!errors.seccionalEstadoId} 
                  //helperText={errors.seccionalEstadoId ?? ""}
                  value={modulos.selected}
                  disabled={isLoading}
                  onChange={(value) => moduloChangeHandler(value)}
                  defaultValue={1}
                  options={modulos.options}
                  required
                  //onTextChange={()=>({})}
              /> 
          </Grid>

          <Grid  gap="inherit">
              <InputMaterial
                id="cuitrRegistra"
                label="Cuit"
                placeholder="Cuit"
                mask={CUITMask}
                value={enteredCUIT}
                onChange={(value)=>setEnteredCUIT(value.replace(/[^0-9]+/g, ""))}
                disabled={isLoading}
                required
              />
          </Grid>

          <Grid  gap="inherit">
              <InputMaterial
                
                placeholder="Nombre/Razón Social"
                label="Nombre/Razón Social"
                id="nombrerazonsocial"
                value={enteredNombre}
                onChange={(value)=>setEnteredNombre(value)}
                required
              />
          </Grid>

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

          <Grid  gap="inherit">
             <InputMaterial 
                label="Clave"
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

          <Grid  gap="inherit">
              <InputMaterial
                label="Repetir Clave"
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

          <Grid  gap="inherit">
            
          </Grid>
        </Grid>
        }

          <div className={`mt-3 ${classes.actions}`}>
            {!isLoading ? (
              <div>
                <Button type="submit" className="botonAzul" underlineindex={0} onClick={()=>registraHandler()}>
                  Registra
                </Button>
              </div>
            ) : (
              <p>Registrando...</p>
            )}
          </div>
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

export default Registro;