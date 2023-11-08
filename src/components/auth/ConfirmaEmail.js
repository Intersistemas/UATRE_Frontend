import React, { useState, useEffect } from "react";

import LoginCard from "../ui/LoginCard/LoginCard";
import classes from "./Login.module.css";
import Button from "../ui/Button/Button";
import useHttp from "../hooks/useHttp";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../media/Logo1.png";

import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import AlertTitle from '@mui/material/AlertTitle';
import CloseIcon from '@mui/icons-material/Close';

const ConfirmaEmail = () => {
  console.log("ConfirmaEmail");

  const { isLoading, error, sendRequest: sendConfirmRequest } = useHttp();
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const params = new URLSearchParams(window.location.search); //podría reemp´lazar el windows.loc por UseLocatioN??? o por usePArams???
      
  const [email, setEmail] = useState(params.get("email"));   
  const [token, setToken] = useState(params.get("token").replaceAll(' ', '+'));  
      
      
  const [message, setMessage] = React.useState("");

  //#region Capturo errores de COnfirmacion Email
  useEffect(() => {
    if (error) {
      setMessage("❌ Error Confirmando Email - "+error.message);
      console.log("capturo error", error);
      console.log("capturo error2", {error});


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

  useEffect(() => {
    if (email && token){
      sendRegistrarHandler();
    }
    
  },[email,token])

  const navigate = useNavigate();

  //Se debe procesar el registro (envio de email)
  const processRegistro = async (userObject) => {
    console.log("userObject_Registro", userObject);
    setMessage("✔️ Hecho! Su cuenta fué confirmada! Ahora puede ingresar.");

    //await
    
    /*await authContext.login(
      userObject.token.tokenId,
      userObject.token.validTo.toString(),
      userObject.rol,
      userObject
    );*/
    console.log("Registrado");
    
  };

  const sendRegistrarHandler = async () => {
    console.log('sendRegistrarHandler');
    console.log('email',email);
    console.log('token',token);
    setMessage("");
    sendConfirmRequest(
      {
        baseURL: "Seguridad",
        endpoint: "/Usuario/confirmarEmailAsync",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: {
          "email": email,
          "token": token
        },
      },
      processRegistro
    );
  };


  return (
    <div className={classes.container}>
      <LoginCard>
        <img src={logo} width="175" height="175" />

        
         <div className="text-start">
          <div className={`mt-3 ${classes.actions}`}>
            {!isLoading ? (
              (message && !error) ?
                (<div>{message}</div>) :
                (<Collapse in={error && message}>
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
                </Collapse>)
            ) : (
              <p>Confirmando Email...</p>
            )}
           
          </div>
        </div>
        <div className={`mt-3`}>
            <Button onClick={()=>navigate("/Ingreso")} type="submit">
              Inicio
            </Button>
        </div>
      </LoginCard>
      
    </div>
  );
};

export default ConfirmaEmail;