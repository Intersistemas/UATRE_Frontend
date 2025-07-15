import React from "react";
import classes from "./DatosArcaEmpresa.module.css";
import InputMaterial from "components/ui/Input/InputMaterial";

const DatosArcaEmpresa = (props) => {
  // console.log("DatosArcaEmpresa props:", props.data);
    // const { actividad, Ciiu1, Ciiu2, Ciiu3 } = props.data;
    const actividad = props.data?.idActividadPrincipal
      ? `${props.data?.idActividadPrincipal} - ${props.data?.descripcionActividadPrincipal}`
      : "";
    const ciiu1 = props.data?.ciiU1 ? `${props.data?.ciiU1} - ${props.data?.ciiU1Descripcion}` : "";
    const ciiu2 = props.data?.ciiU2 ? `${props.data?.ciiU2} - ${props.data?.ciiU2Descripcion}` : "";
    const ciiu3 = props.data?.ciiU3 ? `${props.data?.ciiU3} - ${props.data?.ciiU3Descripcion}` : "";

  return (
    <div flex={1} className={classes.div}>
      <div className={classes.renglon}>
        <h4>Datos ARCA</h4>
      </div>
      <div className={classes.renglon}>
        <div className={classes.input100}>
          <InputMaterial
            id="actividad"
            value={actividad}
            label="Actividad"
            readOnly={true}
          />
        </div>
      </div>

      <div className={classes.renglon}>
        <div className={classes.input100}>
          <InputMaterial
            id="ciiu1"
            value={ciiu1}
            label="CIIU 1"
            disabled={true}
            readOnly={true}
          />
        </div>
      </div>

      <div className={classes.renglon}>
        <div className={classes.input100}>
          <InputMaterial
            id="ciiu2"
            value={ciiu2}
            label="CIIU 2"
            disabled={true}
            readOnly={true}
          />
        </div>
      </div>

      <div className={classes.renglon}>
        <div className={classes.input100}>
          <InputMaterial
            id="ciiu3"
            value={ciiu3}
            label="CIIU 3"
            disabled={true}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DatosArcaEmpresa;