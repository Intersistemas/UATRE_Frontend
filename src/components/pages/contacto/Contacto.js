import React, { useState, useEffect, useRef } from "react";

import LoginCard from "components/ui/LoginCard/LoginCard.js";
import classes from "components/auth/Login.module.css";
import Button from "components/ui/Button/Button";
import useHttp from "components/hooks/useHttp";
import { useNavigate } from "react-router-dom";
import logo from "media/Logo1.png";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import AlertTitle from '@mui/material/AlertTitle';
import CloseIcon from '@mui/icons-material/Close';
import emailjs from "@emailjs/browser";
import UseKeyPress from '../../helpers/UseKeyPress';


const Contacto = () => {
  console.log("Contacto");

  const { isLoading, error, sendRequest: sendLoginRequest } = useHttp();

  const [enviando, setEnviando] = React.useState(false);
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const [enteredNombre, setEnteredNombre] = useState();
  const [enteredEmail, setEnteredEmail] = useState("");

  const [enteredMSJ, setEnteredMSJ] = useState("");
  const [message, setMessage] = React.useState("");

  const [email,setEmail] = useState({ nombre:'', email:'', mensaje:''});
 
  const enviarRef = useRef();

  //#region Capturo errores de login
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

  const navigate = useNavigate();

  //#region shorcuts
  UseKeyPress(['n'], ()=>enviarRef.current.requestSubmit(), 'AltKey');
  UseKeyPress(['i'], ()=>navigate("/Ingreso"), 'AltKey');
//#endregion 


  const nombreChangeHandler = (event) => {
    setEnteredNombre(event.target.value);
    setEmail({...email, nombre: event.target.value});
  };

  const emailChangeHandler = (event) => {
    setEnteredEmail(event.target.value);
    setEmail({...email, email: event.target.value});
  };

  const msjChangeHandler = (event) => {
    setEnteredMSJ(event.target.value);
    setEmail({...email, mensaje: event.target.value});
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
          
        },
      },
      processRegistro
    );
  };

  const submitHandler = async (event) => {
    setEnviando(true);
    event.preventDefault();
    console.log('email: ',email);
    await emailjs.send('service_3at2hbz','template_8hhumv9',email,'ONxE4pibqne8ukozO')
    .then((response) => {
      setEnviando(false);
      console.log('SUCCESS!', response.status, response.text);
      setMessage("✔️ Hemos enviado tu Mensaje!");
    }, (err) => {
          setEnviando(false);
          console.log('FAILED...', err);
          setMessage("Error enviando el Mensaje, intenta nuevamente.");
    })
    ;
    setEmail();
  };

  return (
    <div className={classes.container}>
      <LoginCard>
        <img src={logo} width="175" height="175" />

         <Form className="text-start" onSubmit={submitHandler} ref={enviarRef}>
          <Form.Group className="mt-3" >
            <Form.Label style={{ color: "#555555" }}>
              <strong>Nombre y Apellido</strong>
            </Form.Label>

            <Form.Control
              required
              type="text"
              placeholder="Nombre y Apellido"
              id="nombre"
              value={enteredNombre}
              onChange={nombreChangeHandler}
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
              />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label style={{ color: "#555555" }}>
              <strong>Mensaje</strong>
            </Form.Label>
            
            <InputGroup>
              <Form.Control
                required
                as="textarea"
                type="text"
                placeholder="Mensaje"
                id="text"
                value={enteredMSJ}
                onChange={msjChangeHandler}
              />
            </InputGroup>
          </Form.Group>


          <div className={`mt-3 ${classes.actions}`}>
            {!enviando ? (
              <div>
                <Button type="submit" className="botonAzul" underlineindex={1}>
                  Enviar
                </Button>

              </div>
            ) : (
              <p>Enviando...</p>
            )}
           
          </div>
          <Collapse in={message}>
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
                      <AlertTitle><strong>!</strong></AlertTitle>
                      {message}
                </Alert>
          </Collapse>  
        </Form>
        <div className={`mt-3`}>
            <Button onClick={()=>navigate("/Ingreso")} underlineindex={0}>
              Inicio
            </Button>
        </div>
      </LoginCard>
      
    </div>
  );
};

export default Contacto;