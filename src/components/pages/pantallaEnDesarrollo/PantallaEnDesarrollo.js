import React from "react";
import ModalEnDesarrollo from "../../ui/ModalEnDesarrollo/ModalEnDesarrollo";
import classes from "./PantallaEnDesarrollo.module.css";
import Button from "../../ui/Button/Button";
import imagenEnDesarrollo from '../../../media/EnConstruccion/2.png'

const PantallaEnDesarrollo = (props) => {
  console.log("en desarrollo");
  const handleCerrarModal = () => {
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
            className={classes.button}
            width={100}
            onClick={handleCerrarModal}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </ModalEnDesarrollo>
  );
};

export default PantallaEnDesarrollo;