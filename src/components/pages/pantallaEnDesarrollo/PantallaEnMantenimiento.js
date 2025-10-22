import React, {useContext} from "react";
import ModalEnDesarrollo from "../../ui/ModalEnDesarrollo/ModalEnDesarrollo";
import classes from "./PantallaEnDesarrollo.module.css";
import Button from "../../ui/Button/Button";
import imagenEnDesarrollo from '../../../media/EnConstruccion/2.png';
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../store/authContext";


const PantallaEnDesarrollo = (props) => {
  console.log("en desarrollo");
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const logoutHandler = authContext.logout;

  const logout = () => {

    logoutHandler();
    navigate("ingreso");
   
  };

  return (
    <ModalEnDesarrollo onClose={props?.onClose}>
      <div className={classes.div}>
        <h1 className={classes.titulo}>Estamos realizando tareas de Mantenimiento, agradecemos su paciencia</h1>
        <div className={classes.imagen}>
          <img width={700} height={700} alt="1" src={imagenEnDesarrollo} />
        </div>

        <div className={classes.boton}>
          <Button
            className="botonAmarillo"
            width={100}
            onClick={()=>logout()}
            onClose={()=>logout()}
          >
            Cierra Sesión
          </Button>
        </div>
      </div>
    </ModalEnDesarrollo>
  );
};

export default PantallaEnDesarrollo;
