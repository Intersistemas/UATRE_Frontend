// import React, { useState, useEffect, useRef  } from "react";

// import LoginCard from "../ui/LoginCard/LoginCard";
// import classes from "./Login.module.css";
// import Button from "../ui/Button/Button";
// import useHttp from "../hooks/useHttp";
// import { Link, useNavigate } from "react-router-dom";
// import logo from "../../media/Logo1.png";
// //import Form from "react-bootstrap/Form";
// import InputGroup from "react-bootstrap/InputGroup";
// import ocultarClaveImg from "../../media/OcultarPswIcono.svg";
// import verClaveImg from "../../media/VerPswIcono.svg";

// import Alert from '@mui/material/Alert';
// import IconButton from '@mui/material/IconButton';
// import Collapse from '@mui/material/Collapse';
// import AlertTitle from '@mui/material/AlertTitle';
// import CloseIcon from '@mui/icons-material/Close'; 
// import Spinner from 'react-bootstrap/Spinner';
// import UseKeyPress from '../helpers/UseKeyPress';
// import MaskedInput from "react-text-mask";
// import SelectMaterial from "components/ui/Select/SelectMaterial";

// import {mapOptions} from "components/ui/Select/SearchSelectMaterial";
// import Grid from "components/ui/Grid/Grid";
// import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
// import { InputAdornment } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import ValidarCUIT from "components/validators/ValidarCUIT";

// const Registro = () => {
//   console.log("Registro");

//   const { isLoading, error, sendRequest: request } = useHttp();
//   const [errorValidacion, setErrorValidacion] = useState(false);
  
//   //const [userLoggedIn, setUserLoggedIn] = useState(null)

//   const [enteredTareasModulos, setEnteredTareasModulos] = useState();

//   const [enteredCUIT, setEnteredCUIT] = useState('');
//   const [enteredNombre, setEnteredNombre] = useState('');

//   const [enteredEmail, setEnteredEmail] = useState("");
//   const [enteredPassword, setEnteredPassword] = useState("");
//   const [enteredRepeatPassword, setEnteredRepeatPassword] = useState("");

//   const [modulos, setModulos] = useState(
//     {
//       options: [],
//       selected: 0,
//       tareas:[]
//     }
//   );  
//   const [message, setMessage] = React.useState("");

//   //#region Capturo errores de Registro
//   useEffect(() => {
//     if (error) {
//       setMessage("❌ Error registrando el usuario - "+error.message);
//       console.log("capturo error", error);

//       if(error.code === 401){
//         setMessage("❌ "+error.message);
//       }
//       if(error.statusCode === 405){
//         setMessage("❌ Endpoint no encontrado.");
//       }
      
//       if(error.statusCode === 500){
//         setMessage("❌ Error al conectar con el servidor.");
//       }

//       return;
//     }
//   }, [error]);
//   //#endregion

//   //#region cargo TODOS los modulos al inicio
//   useEffect(() => {
//     const procesaModulos = async (modulosObj) => {
//       const modulosTodos = mapOptions({
//         data: modulosObj.filter((t) => t.nombre === "Sistema de Aportes Rurales"),
//         map: (m) => ({ value: m.id, label: m.nombre }),
//       })
//     setModulos({...modulos, options: modulosTodos})
//     }
//     request(
//       {
//         baseURL: "Seguridad",
//         endpoint: "/Modulos",
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "*/*",
//         },
// 			},
//       procesaModulos
//     );
//   }, []);

//   //#region shorcuts
//   UseKeyPress(['r'], ()=>registraHandler(), 'AltKey');
//   UseKeyPress(['i'], ()=>navigate("/Ingreso"), 'AltKey');
// //#endregion 

// //#region valido CUIT en AFIP
//   const validarCUITHandler = () => { /*
//     setCUITLoading(true);
//     const processConsultaPadron = async (padronObj) => {
//       //console.log("padronObj", padronObj);
//       setCuitValidado(true);
//       setPadronEmpresaRespuesta(padronObj);
//       setCUITEmpresa(padronObj.cuit);
//       setRazonSocialEmpresa(
//         padronObj?.razonSocial ?? `${padronObj?.apellido} ${padronObj?.nombre}`
//       );
//       setActividadEmpresa(padronObj?.descripcionActividadPrincipal ?? "");
//       setDomicilioEmpresa(
//         padronObj ? `${padronObj?.domicilios[1]?.direccion}` : ""
//       );
//       setLocalidadEmpresa(
//         padronObj
//           ? padronObj?.domicilios[1]?.localidad ??
//               padronObj?.domicilios[1]?.descripcionProvincia
//           : ""
//       );
//       // setTelefonoEmpresa()
//       // setCorreoEmpresa()
//       // setLugarTrabajoEmpresa()
//       //ciius
//       setCUITLoading(false);
//     };

//     request(
//       {
//         baseURL: "Comunes",
//         endpoint: `/AFIPConsulta?CUIT=${enteredCUIT}&VerificarHistorico=${true}`,
//         method: "GET",
//       },
//       processConsultaPadron
//     );*/
//   };
// //#endregion

// //#region Validaciones de INPUTS
//   const navigate = useNavigate();
  
//   const moduloChangeHandler = (value) => {
    
//     setEnteredTareasModulos(value);
//     setModulos({...modulos, selected: value})

//     const procesaTareas = async (tareasObj) => {
//       const tareasModulo = tareasObj.filter((t) => t.moduloNombre === "Sistema de Aportes Rurales").map((t)=> t.id)
//       console.log("tareasModulo",tareasModulo)
//       setModulos({...modulos, tareas: tareasModulo, selected: value})
//     }
    
//     request(
//       {
//         baseURL: "Seguridad",
//         endpoint: `/Tareas?ModulosId=${value}`,
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "*/*",
//         },
// 			},
//       procesaTareas
//     );

//   };
// //#endregion

//   //Se debe procesar el registro (envio de email)
//   const processRegistro = async (userObject) => {
//     console.log("userObject_Registro", userObject);
//     setMessage("✔️ Hemos enviado un correo de Confirmación a "+enteredEmail+ "(no olvide revisar la carpeta SPAM/No Deseado)");

//     console.log("Registrado");
    
//   };

//   const sendRegistrarHandler = async () => {
//     setMessage("");
//     request(
//       {
//         baseURL: "Seguridad",
//         endpoint: "/Usuario/registrarViaEmail",
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "*/*",
//         },
//         body: {
//           cuit: enteredCUIT,
//           nombre: enteredNombre,
//           userName: enteredCUIT,
//           email: enteredEmail,
//           password: enteredPassword,
//           confirmPassword: enteredRepeatPassword,
//           rol: "Usuario",
//           tipo: "Externo",
//           tareas: modulos.tareas //Asigno todas las tareas de modulo
//         },
//       },
//       processRegistro
//     );
//   };

//   const [verClave, setVerClave] = useState(false);

//   const handleMouseDownPassword = (event) => {
// 		event.preventDefault();
// 	  };
 
// //#region aqui hago todas las validaciones
//   const registraHandler = () => {

//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  
      
//     let erroresValidacion = ""

//     if (enteredRepeatPassword !== enteredPassword) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben ser idénticas. \n`)}

//     if (enteredPassword.trim().length < 6) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben tener al menos 6 caractéres. \n`)}
    
//     if(enteredCUIT.trim().length === 0 || !ValidarCUIT(enteredCUIT)) {erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un CUIT/CUIL válido. \n")}

//     if(enteredEmail.trim().length === 0 || !emailRegex.test(enteredEmail)) {erroresValidacion = erroresValidacion.concat(`❌ Debe ingresar un Email válido. \n`)}
    
//     if(enteredNombre.trim().length === 0) {erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un Nombre/Razón Social. \n")}
     

//     if (modulos.selected === 0) {
//        erroresValidacion = erroresValidacion.concat("❌ Debe seleccionar un Módulo. \n")
//     }

//     if (erroresValidacion.trim().length === 0){
//       setErrorValidacion(false)
//       sendRegistrarHandler()
//     } else {
//       setErrorValidacion(true)
//       setMessage(erroresValidacion)
//     }

//   }
//   //#endregion

//   return (
//     <div className={classes.container}>
//       <LoginCard>
//         <img src={logo} width="175" height="175"/>
        
//         { (message && !error && !errorValidacion) ?  <div>{message}</div> : 
//         <Grid col full gap="15px">

//           <Grid  gap="inherit">
//               <SelectMaterial
//                   id="modulos"
//                   name="modulos"
//                   label="Modulos"
//                   placeholder="Modulos"
//                   //error={!!errors.seccionalEstadoId} 
//                   //helperText={errors.seccionalEstadoId ?? ""}
//                   value={modulos.selected}
//                   disabled={isLoading}
//                   onChange={(value) => moduloChangeHandler(value)}
//                   defaultValue={1}
//                   options={modulos.options}
//                   required
//                   //onTextChange={()=>({})}
//               /> 
//           </Grid>

//           <Grid  gap="inherit">
//               <InputMaterial
//                 id="cuitrRegistra"
//                 label="Cuit"
//                 placeholder="Cuit"
//                 mask={CUITMask}
//                 value={enteredCUIT}
//                 onChange={(value)=>setEnteredCUIT(value.replace(/[^0-9]+/g, ""))}
//                 disabled={isLoading}
//                 required
//               />
//           </Grid>

//           <Grid  gap="inherit">
//               <InputMaterial
                
//                 placeholder="Nombre/Razón Social"
//                 label="Nombre/Razón Social"
//                 id="nombrerazonsocial"
//                 value={enteredNombre}
//                 onChange={(value)=>setEnteredNombre(value)}
//                 required
//               />
//           </Grid>

//           <Grid  gap="inherit">
//               <InputMaterial
//                 type="email"
//                 placeholder="Email"
//                 label="Email"
//                 id="email"
//                 value={enteredEmail}
//                 onChange={(value)=>setEnteredEmail(value)}
//                 required
//               />
//           </Grid>

//           <Grid  gap="inherit">
//              <InputMaterial 
//                 label="Clave"
//                 required
//                 type={verClave ? "text" : "password"}
//                 style={{backgroundColor: "white"}}
//                 placeholder="******"
//                 value={enteredPassword}
//                 onChange={(v)=>setEnteredPassword(v)}
//                 InputProps={{
//                   endAdornment: 
//                   <InputAdornment>
//                     <IconButton
//                     aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
//                     onClick={() => setVerClave((prevState) => !prevState)}
//                     onMouseDown={handleMouseDownPassword}
//                     edge="start"
//                     >
//                     {verClave ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 }}
//               />
//           </Grid>

//           <Grid  gap="inherit">
//               <InputMaterial
//                 label="Repetir Clave"
//                 required
//                 type={verClave ? "text" : "password"}
//                 style={{backgroundColor: "white"}}
//                 placeholder="******"
//                 value={enteredRepeatPassword}
//                 onChange={(v) => setEnteredRepeatPassword(v)}
//                 InputProps={{
//                   endAdornment: 
//                   <InputAdornment>
//                     <IconButton
//                     aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
//                     onClick={() => setVerClave((prevState) => !prevState)}
//                     onMouseDown={handleMouseDownPassword}
//                     edge="start"
//                     >
//                     {verClave ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 }}
//               />
//           </Grid>

//           <Grid  gap="inherit">
            
//           </Grid>
//         </Grid>
//         }

//           <div className={`mt-3 ${classes.actions}`}>
//             {!isLoading ? (
//               <div>
//                 <Button type="submit" className="botonAzul" underlineindex={0} onClick={()=>registraHandler()}>
//                   Registra
//                 </Button>
//               </div>
//             ) : (
//               <p>Registrando...</p>
//             )}
//           </div>
//           <Collapse in={(error || errorValidacion) && message}>
//                 <Alert
//                  severity="error"
                 
//                  action={
//                             <IconButton
//                             aria-label="close"
//                             color="inherit"
//                             size="small"
//                             onClick={() => {
//                             setMessage("");
//                             }}
//                             >
//                             <CloseIcon fontSize="inherit" />
//                             </IconButton>
//                       }
//                       sx={{ mb: 2, whiteSpace: 'pre-line' }}>
//                       <AlertTitle><strong>Error!</strong></AlertTitle>
//                       {message}
//                 </Alert>
//           </Collapse>  

//         <div className={`mt-3`}>
//             <Button onClick={()=>navigate("/Ingreso")} underlineindex={0}>
//               Inicio
//             </Button>
//         </div>
//       </LoginCard>
      
//     </div>
//   );
// };

// export default Registro;


// import React, { useState, useEffect, useRef  } from "react";

// import LoginCard from "../ui/LoginCard/LoginCard";
// import classes from "./Login.module.css";
// import Button from "../ui/Button/Button";
// import useHttp from "../hooks/useHttp";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import logo from "../../media/Logo1.png";
// //import Form from "react-bootstrap/Form";
// import InputGroup from "react-bootstrap/InputGroup";
// import ocultarClaveImg from "../../media/OcultarPswIcono.svg";
// import verClaveImg from "../../media/VerPswIcono.svg";

// import Alert from '@mui/material/Alert';
// import IconButton from '@mui/material/IconButton';
// import Collapse from '@mui/material/Collapse';
// import AlertTitle from '@mui/material/AlertTitle';
// import CloseIcon from '@mui/icons-material/Close'; 
// import Spinner from 'react-bootstrap/Spinner';
// import UseKeyPress from '../helpers/UseKeyPress';
// import MaskedInput from "react-text-mask";
// import SelectMaterial from "components/ui/Select/SelectMaterial";

// import {mapOptions} from "components/ui/Select/SearchSelectMaterial";
// import Grid from "components/ui/Grid/Grid";
// import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
// import { InputAdornment } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import ValidarCUIT from "components/validators/ValidarCUIT";

// const Registro = () => {
//   console.log("Registro");

//   const { isLoading, error, sendRequest: request } = useHttp();
//   const [errorValidacion, setErrorValidacion] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   //const [userLoggedIn, setUserLoggedIn] = useState(null)

//   const [enteredTareasModulos, setEnteredTareasModulos] = useState();

//   const [enteredCUIT, setEnteredCUIT] = useState('');
//   const [enteredNombre, setEnteredNombre] = useState('');

//   const [enteredEmail, setEnteredEmail] = useState("");
//   const [enteredPassword, setEnteredPassword] = useState("");
//   const [enteredRepeatPassword, setEnteredRepeatPassword] = useState("");
//   const [aviso, setAviso] = useState(true);

//   const [modulos, setModulos] = useState(
//     {
//       options: [],
//       selected: 0,
//       tareas:[]
//     }
//   );  
//   const [message, setMessage] = React.useState("");

//   // Estados adicionales para manejo de usuario existente
//   const [usuarioExistente, setUsuarioExistente] = useState(null);
//   const [verClave, setVerClave] = useState(false);


//   console.log("usuarioExistente", usuarioExistente);

//   // useEffect para capturar usuario del login
//   useEffect(() => {
//     if (location.state?.usuario) {
//       console.log("Usuario recibido del login:", location.state.usuario);
//       setEnteredCUIT(location.state.usuario);
//       setEnteredEmail(""); // Limpiar email antes de consultar
//       consultarDatosUsuario(location.state.usuario);
//     }
//   }, [location.state]);

//   // Nueva función para consultar datos del usuario
//   const consultarDatosUsuario = async (cuit) => {
//     if (!cuit || cuit.trim().length === 0) {
//       return;
//     }

//     const procesarDatosUsuario = async (responseData) => {
//       console.log("Datos del usuario desde BD:", responseData);
      
//       if (responseData?.data && responseData.data.length > 0) {
//         const usuario = responseData.data[0];
        
//         // Cargar nombre/razón social
//         if (usuario.nombre) {
//           setEnteredNombre(usuario.nombre);
//         }
        
//         // Solo cargar email si existe y no está vacío
//         const emailEnBD = usuario.email && usuario.email.trim() !== "" ? usuario.email : "";
        
//         // Verificar estado del email
//         if (!usuario.emailConfirmed) {
//           setMessage("");
//           // setMessage(`⚠️ Usuario "${usuario.nombre}" no confirmado. Complete los datos y reenviaremos la confirmación.`);
//           setErrorValidacion(false); // Cambiar a false para permitir edición
          
//           if (emailEnBD) {
//             setEnteredEmail(emailEnBD);
//           } else {
//             setEnteredEmail("");
//             setMessage(" ")
//             // setMessage(`⚠️ Usuario "${usuario.nombre}" sin email registrado. Ingrese su email para reenviar confirmación.`);
//           }
          
//           // Preseleccionar módulo si existe en las opciones disponibles
//           if (modulos.options.length > 0) {
//             const moduloDefault = modulos.options.find(m => m.label === "Sistema de Aportes Rurales");
//             if (moduloDefault) {
//               moduloChangeHandler(moduloDefault.value);
//             }
//           }
          
//         } else {
//           setMessage(`✔️ Usuario "${usuario.nombre}" encontrado y confirmado.`);
//           setEnteredEmail(emailEnBD);
//         }
        
//         setUsuarioExistente(usuario);
        
//       } else {
//         setMessage(`ℹ️ Usuario con CUIT ${cuit} no encontrado. Complete el registro.`);
//         setEnteredEmail("");
//         setEnteredNombre("");
//         setUsuarioExistente(null);
//       }
//     };

//     request(
//       {
//         baseURL: "Seguridad",
//         endpoint: `/Usuario/GetAll?cuit=${cuit}`,
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "*/*",
//         },
//       },
//       procesarDatosUsuario
//     );
//   };

  


//   // Función SEPARADA para solo reenviar correo
// const reenviarCorreoConfirmacion = async () => {
//   console.log("Iniciando proceso de reenvío de correo...");
  
//   try {
//     // Paso 1: Hacer login para obtener token
//     const loginResponse = await new Promise((resolve, reject) => {
//       request(
//         {
//           baseURL: "Seguridad",
//           endpoint: "/Usuario/loginEmailCuit",
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "*/*",
//           },
//           body: {
//             Usuario: enteredCUIT,
//             Password: enteredPassword || enteredCUIT, // Usar password ingresado o CUIT como fallback
//             Rol: null,
//           },
//         },
//         resolve,
//         reject
//       );
//     });

//     console.log("Login exitoso para obtener token:", loginResponse);
    
//     const token = loginResponse.token?.tokenId;
//     if (!token) {
//       throw new Error("No se pudo obtener el token del login");
//     }

//     // Paso 2: Reenviar correo con el token obtenido
//     const correoResponse = await new Promise((resolve, reject) => {
//       request(
//         {
//           baseURL: "Seguridad",
//           endpoint: "/Usuario/confirmarEmailAsync",
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "*/*",
//           },
//           body: {
//             email: enteredEmail,
//             token: token
//           },
//         },
//         resolve,
//         reject
//       );
//     });

//     console.log("Correo reenviado exitosamente:", correoResponse);
//     setMessage(`✔️ Correo de confirmación enviado a ${enteredEmail}. Revisá tu bandeja de entrada o SPAM.`);

//   } catch (error) {
//     console.error("Error en el proceso de reenvío:", error);
//     setMessage(`❌ Error al reenviar correo: ${error.message || "Error desconocido"}`);
//   }
// };

//   // Función SEPARADA para solo actualizar usuario
//   const actualizarUsuario = async () => {
//     const procesarActualizacion = async (response) => {
//       console.log("Usuario actualizado correctamente:", response);
//       // setMessage("✔️ Datos actualizados correctamente.");
//       setMessage("");
//     };

//     // Combinar datos existentes con nuevos datos ingresados
//     const datosActualizados = {
//       id: usuarioExistente.id,
//       cuit: enteredCUIT,
//       nombre: enteredNombre || usuarioExistente.nombre,
//       userName: enteredCUIT,
//       email: enteredEmail,
//       rol: usuarioExistente.rol || "Usuario",
//       tipo: usuarioExistente.tipo || "Externo",
//       tareas: modulos.tareas && modulos.tareas.length > 0 ? modulos.tareas : []
//     };

//     console.log("Datos para actualizar:", datosActualizados);

//     request(
//       {
//         baseURL: "Seguridad",
//         endpoint: "/Usuario",
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "*/*",
//         },
//         body: datosActualizados,
//       },
//       procesarActualizacion
//     );
//   };

//   //#region Capturo errores de Registro
//   useEffect(() => {
//     if (error) {
//       setMessage("❌ Error registrando el usuario - "+error.message);
//       console.log("capturo error", error);

//       // if(error.code === 401){
//       //   setMessage("❌ "+error.message);
//       // }
//       if(error.code === 401){
//         setMessage(error.message);
//         setAviso(false)
//         //En un trancurso de 5 segundos, una ves ejecutada esta consulta, me redirecciona al login
//         setTimeout(() => {
//           navigate("/Ingreso");
//         }, 5000);
//       }
      
//       if(error.statusCode === 405){
//         setMessage("❌ Endpoint no encontrado.");
//       }
      
//       if(error.statusCode === 500){
//         setMessage("❌ Error al conectar con el servidor.");
//       }

//       return;
//     }
//   }, [error]);
//   //#endregion

//   //#region cargo TODOS los modulos al inicio
//   useEffect(() => {
//     const procesaModulos = async (modulosObj) => {
//       const modulosTodos = mapOptions({
//         data: modulosObj.filter((t) => t.nombre === "Sistema de Aportes Rurales"),
//         map: (m) => ({ value: m.id, label: m.nombre }),
//       })
//       setModulos(prevState => ({...prevState, options: modulosTodos}))
      
//       // Si hay usuario del login, consultar después de cargar módulos
//       if (location.state?.usuario && modulosTodos.length > 0) {
//         setTimeout(() => consultarDatosUsuario(location.state.usuario), 100);
//       }
//     }
//     request(
//       {
//         baseURL: "Seguridad",
//         endpoint: "/Modulos",
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "*/*",
//         },
//       },
//       procesaModulos
//     );
//   }, []);

//   //#region shorcuts
//   UseKeyPress(['r'], ()=>registraHandler(), 'AltKey');
//   UseKeyPress(['i'], ()=>navigate("/Ingreso"), 'AltKey');
//   //#endregion 



//   //#region Validaciones de INPUTS
//   const moduloChangeHandler = (value) => {
//     setEnteredTareasModulos(value);
//     setModulos(prevState => ({...prevState, selected: value}))

//     const procesaTareas = async (tareasObj) => {
//       const tareasModulo = tareasObj.filter((t) => t.moduloNombre === "Sistema de Aportes Rurales").map((t)=> t.id)
//       console.log("tareasModulo",tareasModulo)
//       setModulos(prevState => ({...prevState, tareas: tareasModulo, selected: value}))
//     }
    
//     request(
//       {
//         baseURL: "Seguridad",
//         endpoint: `/Tareas?ModulosId=${value}`,
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "*/*",
//         },
//       },
//       procesaTareas
//     );
//   };
//   //#endregion

//   //Se debe procesar el registro (envio de email)
//   const processRegistro = async (userObject) => {
//     console.log("userObject_Registro", userObject);
//     setMessage("✔️ Hemos enviado un correo de Confirmación a "+enteredEmail+ "(no olvide revisar la carpeta SPAM/No Deseado)");
//     console.log("Registrado");
//   };

//   const sendRegistrarHandler = async () => {
//     setMessage("");
//     request(
//       {
//         baseURL: "Seguridad",
//         endpoint: "/Usuario/registrarViaEmail",
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "*/*",
//         },
//         body: {
//           cuit: enteredCUIT,
//           nombre: enteredNombre,
//           userName: enteredCUIT,
//           email: enteredEmail,
//           password: enteredPassword,
//           confirmPassword: enteredRepeatPassword,
//           rol: "Usuario",
//           tipo: "Externo",
//           tareas: modulos.tareas //Asigno todas las tareas de modulo
//         },
//       },
//       processRegistro
//     );
//   };

//   const handleMouseDownPassword = (event) => {
//     event.preventDefault();
//   };

//   //#region aqui hago todas las validaciones
//   const registraHandler = () => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  
//     let erroresValidacion = ""

//     // CASO 1: Usuario existe pero no está confirmado - Actualizar y reregistrar
//     if (usuarioExistente && !usuarioExistente.emailConfirmed) {
//       // Solo validar email para usuarios existentes
//       if(enteredEmail.trim().length === 0 || !emailRegex.test(enteredEmail)) {
//         erroresValidacion = erroresValidacion.concat(`❌ Debe ingresar un Email válido. \n`);
//       }
//       if(enteredNombre.trim().length === 0) {
//         erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un Nombre/Razón Social. \n");
//       }
    
//       if (modulos.selected === 0) {
//         erroresValidacion = erroresValidacion.concat("❌ Debe seleccionar un Módulo. \n");
//       }
//         if (enteredPassword.trim().length === 0) {
//         erroresValidacion = erroresValidacion.concat("⚠️ Ingrese la contraseña con la que se registró. \n");
//       }
      
      
//       if (erroresValidacion.trim().length === 0) {
//         setErrorValidacion(false);
//         // Primero actualizar usuario
//         actualizarUsuario();
//         // Luego reenviar correo por separado con un delay
//         setTimeout(() => {
//           reenviarCorreoConfirmacion();
//         }, 1000);
//       } else {
//         setErrorValidacion(true);
//         setMessage(erroresValidacion);
//       }
//       return;
//     }

//     // CASO 2: Usuario no existe - registro completo (tu lógica original)
//     if (enteredRepeatPassword !== enteredPassword) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben ser idénticas. \n`)}
//     if (enteredPassword.trim().length < 6) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben tener al menos 6 caractéres. \n`)}
//     if(enteredCUIT.trim().length === 0 || !ValidarCUIT(enteredCUIT)) {erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un CUIT/CUIL válido. \n")}
//     if(enteredEmail.trim().length === 0 || !emailRegex.test(enteredEmail)) {erroresValidacion = erroresValidacion.concat(`❌ Debe ingresar un Email válido. \n`)}
//     if(enteredNombre.trim().length === 0) {erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un Nombre/Razón Social. \n")}
//     if (modulos.selected === 0) {erroresValidacion = erroresValidacion.concat("❌ Debe seleccionar un Módulo. \n")}

//     if (erroresValidacion.trim().length === 0){
//       setErrorValidacion(false)
//       sendRegistrarHandler()
//     } else {
//       setErrorValidacion(true)
//       setMessage(erroresValidacion)
//     }
//   }

// ////////////////////////////////////////////////////////


//   return (
//     <div className={classes.container}>
//       <LoginCard>
//          <img src={logo} width="175" height="175" style={{ marginBottom: '20px' }} />

//       {(usuarioExistente && aviso === false) || (!usuarioExistente && aviso === true)  ? (
//          null
//       ) : (
//         <div style={{
//           backgroundColor: '#f8d7da',
//           color: '#721c24',
//           padding: '12px',
//           borderRadius: '4px',
//           border: '1px solid #f5c6cb',
//           marginBottom: '15px',
//           textAlign: 'center',
//           fontSize: '14px',
//           fontWeight: '500',
//           marginTop: '10px',
//         }}>
//           📧 Debe validar su email para completar el registro
//         </div>
//       )}
      
//         { (message && !error && !errorValidacion) ?  <div>{message}</div> : 
//         <Grid col full gap="15px">

//           <Grid  gap="inherit">
//               <SelectMaterial
//                   id="modulos"
//                   name="modulos"
//                   label="Modulos"
//                   placeholder="Modulos"
//                   //error={!!errors.seccionalEstadoId} 
//                   //helperText={errors.seccionalEstadoId ?? ""}
//                   value={modulos.selected}
//                   disabled={isLoading}
//                   onChange={(value) => moduloChangeHandler(value)}
//                   defaultValue={1}
//                   options={modulos.options}
//                   required
//                   //onTextChange={()=>({})}
//               /> 
//           </Grid>

//           <Grid  gap="inherit">
//               <InputMaterial
//                 id="cuitrRegistra"
//                 label="Cuit"
//                 placeholder="Cuit"
//                 mask={CUITMask}
//                 value={enteredCUIT}
//                 onChange={(value)=>setEnteredCUIT(value.replace(/[^0-9]+/g, ""))}
//                 disabled={isLoading || (usuarioExistente && !usuarioExistente.emailConfirmed)}
//                 required
//               />
//           </Grid>

//           <Grid  gap="inherit">
//               <InputMaterial
//                 placeholder="Nombre/Razón Social"
//                 label="Nombre/Razón Social"
//                 id="nombrerazonsocial"
//                 value={enteredNombre}
//                 onChange={(value)=>setEnteredNombre(value)}
//                 disabled={isLoading}
//                 required
//               />
//           </Grid>

//           <Grid  gap="inherit">
//               <InputMaterial
//                 type="email"
//                 placeholder="Email"
//                 label="Email"
//                 id="email"
//                 value={enteredEmail}
//                 onChange={(value)=>setEnteredEmail(value)}
//                 disabled={isLoading}
//                 required
//               />
//           </Grid>


//             {/* Mostrar campos de contraseña según el tipo de usuario */}
// {usuarioExistente && !usuarioExistente.emailConfirmed ? (
//   // Solo un campo de contraseña para usuarios existentes no confirmados
//   <Grid gap="inherit">
//     <InputMaterial 
//       label="Ingrese su contraseña actual"
//       required
//       type={verClave ? "text" : "password"}
//       style={{backgroundColor: "white"}}
//       placeholder="******"
//       value={enteredPassword}
//       onChange={(v)=>setEnteredPassword(v)}
//       disabled={isLoading}
//       InputProps={{
//         endAdornment: 
//         <InputAdornment>
//           <IconButton
//           aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
//           onClick={() => setVerClave((prevState) => !prevState)}
//           onMouseDown={handleMouseDownPassword}
//           edge="start"
//           >
//           {verClave ? <VisibilityOff /> : <Visibility />}
//           </IconButton>
//         </InputAdornment>
//       }}
//     />
//   </Grid>
//         ) : (
//           // Dos campos de contraseña para usuarios nuevos
//           <>
//             <Grid gap="inherit">
//               <InputMaterial 
//                   label="Clave"
//                   required
//                   type={verClave ? "text" : "password"}
//                   style={{backgroundColor: "white"}}
//                   placeholder="******"
//                   value={enteredPassword}
//                   onChange={(v)=>setEnteredPassword(v)}
//                   disabled={isLoading}
//                   InputProps={{
//                     endAdornment: 
//                     <InputAdornment>
//                       <IconButton
//                       aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
//                       onClick={() => setVerClave((prevState) => !prevState)}
//                       onMouseDown={handleMouseDownPassword}
//                       edge="start"
//                       >
//                       {verClave ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   }}
//                 />
//             </Grid>

//             <Grid gap="inherit">
//                 <InputMaterial
//                   label="Repetir Clave"
//                   required
//                   type={verClave ? "text" : "password"}
//                   style={{backgroundColor: "white"}}
//                   placeholder="******"
//                   value={enteredRepeatPassword}
//                   onChange={(v) => setEnteredRepeatPassword(v)}
//                   disabled={isLoading}
//                   InputProps={{
//                     endAdornment: 
//                     <InputAdornment>
//                       <IconButton
//                       aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
//                       onClick={() => setVerClave((prevState) => !prevState)}
//                       onMouseDown={handleMouseDownPassword}
//                       edge="start"
//                       >
//                       {verClave ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   }}
//                 />
//             </Grid>
//           </>
//         )}

//           <Grid  gap="inherit">
            
//           </Grid>
//         </Grid>
//         }

//           <div className={`mt-3 ${classes.actions}`}>
//             {!isLoading ? (
//               <div>
//                 {
//                   usuarioExistente && aviso === false ? 
//                    null
//                 :
//                 <Button type="submit" className="botonAzul" underlineindex={0} onClick={()=>registraHandler()}>
//                   {/* {usuarioExistente && !usuarioExistente.emailConfirmed ? "Actualizar y Reenviar Confirmación" : "Registra"} */}
//                    {usuarioExistente && !usuarioExistente.emailConfirmed ? "Actualizar Información" : "Registra"}
//                 </Button>
//                 }
               
//               </div>
//             ) : (
//               <p>{usuarioExistente && !usuarioExistente.emailConfirmed ? "Actualizando y reenviando..." : "Registrando..."}</p>
//             )}
//           </div>
//           <Collapse in={(error || errorValidacion) && message}>

//             {/* Mostrar alerta condicionalmente según el estado del usuario */}
           
//               {
//                 usuarioExistente && !usuarioExistente.emailConfirmed ? (
//                   <Alert
//                   style={{ marginTop: '20px' }}
//                     severity="warning"
//                     action={
//                       <IconButton
//                         aria-label="close"
//                         color="inherit"
//                         size="small"
//                         onClick={() => {
//                           setMessage("");
//                         }}
//                       >
//                         <CloseIcon fontSize="inherit" />
//                       </IconButton>
//                     }
//                     sx={{ mb: 2, whiteSpace: 'pre-line' }}>
//                     <AlertTitle><strong>Atención!</strong></AlertTitle>
//                     {message}
                   
//                   </Alert>
//                 ) : (
//                   <Alert
//                     severity="error"
//                     action={
//                       <IconButton
//                         aria-label="close"
//                         color="inherit"
//                         size="small"
//                         onClick={() => {
//                           setMessage("");
//                         }}
//                       >
//                         <CloseIcon fontSize="inherit" />
//                       </IconButton>
//                     }
//                     sx={{ mb: 2, whiteSpace: 'pre-line' }}>
//                     <AlertTitle><strong>Error!</strong></AlertTitle>
//                     {message}
//                   </Alert>
//                 )
//               }
//           </Collapse>  

//         <div className={`mt-3`}>
//             <Button onClick={()=>navigate("/Ingreso")} underlineindex={0}>
//               Inicio
//             </Button>
//         </div>
//       </LoginCard>
      
//     </div>
//   );
// };

// export default Registro;


import React, { useState, useEffect, useRef  } from "react";

import LoginCard from "../ui/LoginCard/LoginCard";
import classes from "./Login.module.css";
import Button from "../ui/Button/Button";
import useHttp from "../hooks/useHttp";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
  
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const [enteredTareasModulos, setEnteredTareasModulos] = useState();

  const [enteredCUIT, setEnteredCUIT] = useState('');
  const [enteredNombre, setEnteredNombre] = useState('');

  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredRepeatPassword, setEnteredRepeatPassword] = useState("");
  const [aviso, setAviso] = useState(true);

  const [modulos, setModulos] = useState(
    {
      options: [],
      selected: 0,
      tareas:[]
    }
  );  
  const [message, setMessage] = React.useState("");

  // Estados adicionales para manejo de usuario existente
  const [usuarioExistente, setUsuarioExistente] = useState(null);
  const [verClave, setVerClave] = useState(false);


  console.log("usuarioExistente", usuarioExistente);

  // useEffect para capturar usuario del login
  useEffect(() => {
    if (location.state?.usuario) {
      console.log("Usuario recibido del login:", location.state.usuario);
      setEnteredCUIT(location.state.usuario);
      setEnteredEmail(""); // Limpiar email antes de consultar
      consultarDatosUsuario(location.state.usuario);
    }
  }, [location.state]);

  // Nueva función para consultar datos del usuario
  const consultarDatosUsuario = async (cuit) => {
    if (!cuit || cuit.trim().length === 0) {
      return;
    }

    const procesarDatosUsuario = async (responseData) => {
      console.log("Datos del usuario desde BD:", responseData);
      
      if (responseData?.data && responseData.data.length > 0) {
        const usuario = responseData.data[0];
        
        // Cargar nombre/razón social
        if (usuario.nombre) {
          setEnteredNombre(usuario.nombre);
        }
        
        // Solo cargar email si existe y no está vacío
        const emailEnBD = usuario.email && usuario.email.trim() !== "" ? usuario.email : "";
        
        // Verificar estado del email
        if (!usuario.emailConfirmed) {
          setMessage("");
          setErrorValidacion(false); // permitir edición
          
          if (emailEnBD) {
            setEnteredEmail(emailEnBD);
          } else {
            setEnteredEmail("");
            setMessage(" ");
          }
          
          // Preseleccionar módulo por defecto si ya está en opciones
          if (modulos.options.length > 0) {
            const moduloDefault = modulos.options.find(m => m.label === "Sistema de Aportes Rurales");
            if (moduloDefault) {
              setModulos(prev => ({ ...prev, selected: moduloDefault.value }));
              moduloChangeHandler(moduloDefault.value);
            }
          }
          
        } else {
          setMessage(`✔️ Usuario "${usuario.nombre}" encontrado y confirmado.`);
          setEnteredEmail(emailEnBD);
        }
        
        setUsuarioExistente(usuario);
        
      } else {
        setMessage(`ℹ️ Usuario con CUIT ${cuit} no encontrado. Complete el registro.`);
        setEnteredEmail("");
        setEnteredNombre("");
        setUsuarioExistente(null);
      }
    };

    request(
      {
        baseURL: "Seguridad",
        endpoint: `/Usuario/GetAll?cuit=${cuit}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      },
      procesarDatosUsuario
    );
  };

  


  // Función SEPARADA para solo reenviar correo
const reenviarCorreoConfirmacion = async () => {
  console.log("Iniciando proceso de reenvío de correo...");
  
  try {
    // Paso 1: Hacer login para obtener token
    const loginResponse = await new Promise((resolve, reject) => {
      request(
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
            Password: enteredPassword || enteredCUIT, // Usar password ingresado o CUIT como fallback
            Rol: null,
          },
        },
        resolve,
        reject
      );
    });

    console.log("Login exitoso para obtener token:", loginResponse);
    
    const token = loginResponse.token?.tokenId;
    if (!token) {
      throw new Error("No se pudo obtener el token del login");
    }

    // Paso 2: Reenviar correo con el token obtenido
    const correoResponse = await new Promise((resolve, reject) => {
      request(
        {
          baseURL: "Seguridad",
          endpoint: "/Usuario/confirmarEmailAsync",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: {
            email: enteredEmail,
            token: token
          },
        },
        resolve,
        reject
      );
    });

    console.log("Correo reenviado exitosamente:", correoResponse);
    setMessage(`✔️ Correo de confirmación enviado a ${enteredEmail}. Revisá tu bandeja de entrada o SPAM.`);

  } catch (error) {
    console.error("Error en el proceso de reenvío:", error);
    setMessage(`❌ Error al reenviar correo: ${error.message || "Error desconocido"}`);
  }
};

  // Función SEPARADA para solo actualizar usuario
  const actualizarUsuario = async () => {
    const procesarActualizacion = async (response) => {
      console.log("Usuario actualizado correctamente:", response);
      // setMessage("✔️ Datos actualizados correctamente.");
      setMessage("");
    };

    // Combinar datos existentes con nuevos datos ingresados
    const datosActualizados = {
      id: usuarioExistente.id,
      cuit: enteredCUIT,
      nombre: enteredNombre || usuarioExistente.nombre,
      userName: enteredCUIT,
      email: enteredEmail,
      rol: usuarioExistente.rol || "Usuario",
      tipo: usuarioExistente.tipo || "Externo",
      tareas: modulos.tareas && modulos.tareas.length > 0 ? modulos.tareas : []
    };

    console.log("Datos para actualizar:", datosActualizados);

    request(
      {
        baseURL: "Seguridad",
        endpoint: "/Usuario",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: datosActualizados,
      },
      procesarActualizacion
    );
  };

  //#region Capturo errores de Registro
  useEffect(() => {
    if (error) {
      setMessage("❌ Error registrando el usuario - "+error.message);
      console.log("capturo error", error);

      if(error.code === 401){
        setMessage(error.message);
        setAviso(false)

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
        data: modulosObj.filter((t) => t.nombre === "Sistema de Aportes Rurales"),
        map: (m) => ({ value: m.id, label: m.nombre }),
      });

      // seteo opciones
      setModulos(prevState => ({...prevState, options: modulosTodos}));

      // AUTOPRESELECCIÓN del módulo y carga de tareas
      const moduloDefault = modulosTodos.find(m => m.label === "Sistema de Aportes Rurales");
      if (moduloDefault) {
        setModulos(prev => ({ ...prev, options: modulosTodos, selected: moduloDefault.value }));
        // traigo tareas para ese módulo
        moduloChangeHandler(moduloDefault.value);
      }

      // Si hay usuario del login, consultar después de cargar módulos
      if (location.state?.usuario && modulosTodos.length > 0) {
        setTimeout(() => consultarDatosUsuario(location.state.usuario), 100);
      }
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
  //#endregion

  //#region shorcuts
  UseKeyPress(['r'], ()=>registraHandler(), 'AltKey');
  UseKeyPress(['i'], ()=>navigate("/Ingreso"), 'AltKey');
  //#endregion 



  //#region Validaciones de INPUTS
  const moduloChangeHandler = (value) => {
    setEnteredTareasModulos(value);
    setModulos(prevState => ({...prevState, selected: value}))

    const procesaTareas = async (tareasObj) => {
      const tareasModulo = tareasObj.filter((t) => t.moduloNombre === "Sistema de Aportes Rurales").map((t)=> t.id)
      console.log("tareasModulo",tareasModulo)
      setModulos(prevState => ({...prevState, tareas: tareasModulo, selected: value}))
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
    setMessage("✔️ Hemos enviado un correo de Confirmación a "+enteredEmail+ "(no olvide revisar la carpeta SPAM/No Deseado)");
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

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  //#region aqui hago todas las validaciones
  const registraHandler = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  
    let erroresValidacion = ""

    // CASO 1: Usuario existe pero no está confirmado - Actualizar y reregistrar
    if (usuarioExistente && !usuarioExistente.emailConfirmed) {
      // Solo validar email para usuarios existentes
      if(enteredEmail.trim().length === 0 || !emailRegex.test(enteredEmail)) {
        erroresValidacion = erroresValidacion.concat(`❌ Debe ingresar un Email válido. \n`);
      }
      if(enteredNombre.trim().length === 0) {
        erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un Nombre/Razón Social. \n");
      }
    
      if (modulos.selected === 0) {
        erroresValidacion = erroresValidacion.concat("❌ Debe seleccionar un Módulo. \n");
      }
        if (enteredPassword.trim().length === 0) {
        erroresValidacion = erroresValidacion.concat("⚠️ Ingrese la contraseña con la que se registró. \n");
      }
      
      
      if (erroresValidacion.trim().length === 0) {
        setErrorValidacion(false);
        // Primero actualizar usuario
        actualizarUsuario();
        // Luego reenviar correo por separado con un delay
        setTimeout(() => {
          reenviarCorreoConfirmacion();
        }, 1000);
      } else {
        setErrorValidacion(true);
        setMessage(erroresValidacion);
      }
      return;
    }

    // CASO 2: Usuario no existe - registro completo (tu lógica original)
    if (enteredRepeatPassword !== enteredPassword) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben ser idénticas. \n`)}
    if (enteredPassword.trim().length < 6) {erroresValidacion = erroresValidacion.concat(`❌ Las claves deben tener al menos 6 caractéres. \n`)}
    if(enteredCUIT.trim().length === 0 || !ValidarCUIT(enteredCUIT)) {erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un CUIT/CUIL válido. \n")}
    if(enteredEmail.trim().length === 0 || !emailRegex.test(enteredEmail)) {erroresValidacion = erroresValidacion.concat(`❌ Debe ingresar un Email válido. \n`)}
    if(enteredNombre.trim().length === 0) {erroresValidacion = erroresValidacion.concat("❌ Debe ingresar un Nombre/Razón Social. \n")}
    if (modulos.selected === 0) {erroresValidacion = erroresValidacion.concat("❌ Debe seleccionar un Módulo. \n")}

    if (erroresValidacion.trim().length === 0){
      setErrorValidacion(false)
      sendRegistrarHandler()
    } else {
      setErrorValidacion(true)
      setMessage(erroresValidacion)
    }
  }

////////////////////////////////////////////////////////


  return (
    <div className={classes.container}>
      <LoginCard>
         <img src={logo} width="175" height="175" style={{ marginBottom: '20px' }} />

      {(usuarioExistente && aviso === false) || (!usuarioExistente && aviso === true)  ? (
         null
      ) : (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
          marginBottom: '15px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500',
          marginTop: '10px',
        }}>
          📧 Debe validar su email para completar el registro
        </div>
      )}
      
        { (message && !error && !errorValidacion) ?  <div>{message}</div> : 
        <Grid col full gap="15px">

          <Grid  gap="inherit">
              <SelectMaterial
                  id="modulos"
                  name="modulos"
                  label="Modulos"
                  placeholder="Modulos"
                  value={modulos.selected}
                  disabled={isLoading}
                  onChange={(value) => moduloChangeHandler(value)}
                  options={modulos.options}
                  required
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
                disabled={isLoading || (usuarioExistente && !usuarioExistente.emailConfirmed)}
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
                disabled={isLoading}
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
                disabled={isLoading}
                required
              />
          </Grid>


            {/* Mostrar campos de contraseña según el tipo de usuario */}
{usuarioExistente && !usuarioExistente.emailConfirmed ? (
  // Solo un campo de contraseña para usuarios existentes no confirmados
  <Grid gap="inherit">
    <InputMaterial 
      label="Ingrese su contraseña actual"
      required
      type={verClave ? "text" : "password"}
      style={{backgroundColor: "white"}}
      placeholder="******"
      value={enteredPassword}
      onChange={(v)=>setEnteredPassword(v)}
      disabled={isLoading}
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
        ) : (
          // Dos campos de contraseña para usuarios nuevos
          <>
            <Grid gap="inherit">
              <InputMaterial 
                  label="Clave"
                  required
                  type={verClave ? "text" : "password"}
                  style={{backgroundColor: "white"}}
                  placeholder="******"
                  value={enteredPassword}
                  onChange={(v)=>setEnteredPassword(v)}
                  disabled={isLoading}
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

            <Grid gap="inherit">
                <InputMaterial
                  label="Repetir Clave"
                  required
                  type={verClave ? "text" : "password"}
                  style={{backgroundColor: "white"}}
                  placeholder="******"
                  value={enteredRepeatPassword}
                  onChange={(v) => setEnteredRepeatPassword(v)}
                  disabled={isLoading}
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
          </>
        )}

          <Grid  gap="inherit">
            
          </Grid>
        </Grid>
        }

          <div className={`mt-3 ${classes.actions}`}>
            {!isLoading ? (
              <div>
                {
                  usuarioExistente && aviso === false ? 
                   null
                :
                <Button type="submit" className="botonAzul" underlineindex={0} onClick={()=>registraHandler()}>
                   {usuarioExistente && !usuarioExistente.emailConfirmed ? "Actualizar Información" : "Registra"}
                </Button>
                }
               
              </div>
            ) : (
              <p>{usuarioExistente && !usuarioExistente.emailConfirmed ? "Actualizando y reenviando..." : "Registrando..."}</p>
            )}
          </div>
          <Collapse in={(error || errorValidacion) && message}>

            {/* Mostrar alerta condicionalmente según el estado del usuario */}
           
              {
                usuarioExistente && !usuarioExistente.emailConfirmed ? (
                  <Alert
                    style={{ marginTop: '20px', textAlign: 'center' }}
                    severity="warning"
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
                    sx={{ 
                      mb: 2, 
                      whiteSpace: 'pre-line',
                      justifyContent: 'center',
                      '& .MuiAlert-message': { width: '100%' },
                      '& .MuiAlertTitle-root': { width: '100%', textAlign: 'center' }
                    }}>
                    <AlertTitle><strong>Atención!</strong></AlertTitle>
                    {message}
                   
                  </Alert>
                ) : (
                  <Alert
                    style={{ textAlign: 'center' }}
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
                    sx={{ 
                      mb: 2, 
                      whiteSpace: 'pre-line',
                      justifyContent: 'center',
                      '& .MuiAlert-message': { width: '100%' },
                      '& .MuiAlertTitle-root': { width: '100%', textAlign: 'center' }
                    }}>
                    <AlertTitle><strong>Error!</strong></AlertTitle>
                    {message}
                  </Alert>
                )
              }
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
