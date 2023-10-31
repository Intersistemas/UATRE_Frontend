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

  const handleCerrarModal = () => {

    authContext?.isLoggedIn ? navigate("/Inicio") : navigate("");
    props.onClose();
   
  };

  return (
    <ModalEnDesarrollo onClose={props.onClose}>
      <div className={classes.div}>
        <h1 className={classes.titulo}>Pantalla En Desarrollo</h1>
        <div className={classes.imagen}>
          <img width={700} height={700} alt="1" src={imagenEnDesarrollo} />
        </div>

        <div className={classes.boton}>
          <Button
            className="botonAmarillo"
            width={100}
            onClick={()=>handleCerrarModal()}
            //onClick={()=>navigate("/")}
          >
            Cierra
          </Button>
        </div>
      </div>
    </ModalEnDesarrollo>
  );
};

export default PantallaEnDesarrollo;
