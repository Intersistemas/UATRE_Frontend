import React from "react";
import classes from "../AfiliadoAgregar.module.css";
import InputMaterialMask from "../../../ui/Input/InputMaterialMask";
import LoadingButtonCustom from "../../../ui/LoadingButtonCustom/LoadingButtonCustom";
import InputMaterial from "../../../ui/Input/InputMaterial";

const TabEmpleador = (props) => {
  const InputDisabled = (input) => {    

    return false;
  };

  // const handleOnFocus = (id) => {
  //   console.log("focus on ", id)
  //   //props.onFocus(id);
  // }

  return (
    <div className={classes.div}>
      <div className={classes.renglon}>
        <div className={classes.input}>
          <InputMaterialMask
            //onFocus={handleOnFocus}
            id="cuit"
            value={props.cuitState.value.toString()}
            label="CUIT"
            disabled={InputDisabled()}
            width={98}
            onChange={props.onHandleInputChange}
            helperText={
              !props.cuitState.isValid && props.inputsTouched
                ? "CUIT inválido"
                : ""
            }
            error={
              !props.cuitState.isValid && props.inputsTouched ? true : false
            }
          />
        </div>
        <LoadingButtonCustom
          width={20}
          heigth={80}
          disabled={!props.cuitState.isValid}
          onClick={props.onValidarEmpresaCUITHandler}
          loading={props.cuitLoading}
        >
          {!props.cuitLoading ? `Valida CUIT` : `Validando...`}
        </LoadingButtonCustom>
      </div>

      <div className={classes.renglon}>
        <div className={classes.input}>
          <InputMaterial
            id="razonSocialEmpresa"
            value={props.razonSocialEmpresa}
            label="Razón Social"
            disabled={true}
            width={100}
          />
        </div>
        <div className={classes.input}>
          <InputMaterial
            id="actividadEmpresa"
            value={props.actividadEmpresa}
            label="Actividad"
            disabled={true}
            width={100}
          />
        </div>
      </div>

      <div className={classes.renglon}>
        <div className={classes.input}>
          <InputMaterial
            id="domicilioEmpresa"
            value={props.domicilioEmpresa}
            label="Domicilio"
            disabled={true}
            width={100}
          />
        </div>
        <div className={classes.input}>
          <InputMaterial
            id="localidadEmpresa"
            value={props.localidadEmpresa}
            label="Localidad"
            disabled={true}
            width={100}
          />
        </div>
      </div>

      <div className={classes.renglon}>
        <div className={classes.input}>
          <InputMaterial
            id="telefonoEmpresa"
            value={props.telefonoEmpresa}
            label="Telefono"
            disabled={false}
            width={100}
            onChange={props.onHandleInputChange}
          />
        </div>

        <div className={classes.input}>
          <InputMaterial
            id="correoEmpresa"
            value={props.correoEmpresa}
            label="Correo"
            disabled={false}
            width={100}
            onChange={props.onHandleInputChange}
          />
        </div>
      </div>

      <div className={classes.renglon}>
        <div className={classes.input100}>
          <InputMaterial
            id="lugarTrabajoEmpresa"
            value={props.lugarTrabajoEmpresa}
            label="Lugar de Trabajo"
            disabled={false}
            //width={100}
            onChange={props.onHandleInputChange}
          />
        </div>
      </div>

      <div className={classes.renglonActividad}>
        <div className={classes.input100}>
          <InputMaterial
            id="CIIU1"
            value={
              props.padronEmpresaRespuesta && props.padronEmpresaRespuesta.ciiU1
                ? `${props.padronEmpresaRespuesta.ciiU1} - ${props.padronEmpresaRespuesta.ciiU1Descripcion}`
                : ""
            }
            label="Actividad Principal"
            disabled={true}
          />
          {props.padronEmpresaRespuesta &&
          props.padronEmpresaRespuesta.ciiU1EsRural ? (
            <div className={classes.input100}>
              <label className={classes.labelEsRural}>Es Actividad Rural</label>
            </div>
          ) : null}
        </div>
      </div>

      <div className={classes.renglonActividad}>
        <div className={classes.input100}>
          <InputMaterial
            id="CIIU2"
            value={
              props.padronEmpresaRespuesta && props.padronEmpresaRespuesta.ciiU2
                ? `${props.padronEmpresaRespuesta.ciiU2} - ${props.padronEmpresaRespuesta.ciiU2Descripcion}`
                : ""
            }
            label="Actividad Secundaria"
            disabled={true}
          />
          {props.padronEmpresaRespuesta &&
          props.padronEmpresaRespuesta.ciiU2EsRural ? (
            <div className={classes.input100}>
              <label className={classes.labelEsRural}>Es Actividad Rural</label>
            </div>
          ) : null}
        </div>
      </div>

      <div className={classes.renglonActividad}>
        <div className={classes.input100}>
          <InputMaterial
            id="CIIU3"
            value={
              props.padronEmpresaRespuesta && props.padronEmpresaRespuesta.ciiU3
                ? `${props.padronEmpresaRespuesta.ciiU3} - ${props.padronEmpresaRespuesta.ciiU3Descripcion}`
                : ""
            }
            label="Actividad Terciaria"
            disabled={true}
          />
          {props.padronEmpresaRespuesta &&
          props.padronEmpresaRespuesta?.ciiU3EsRural ? (
            <div className={classes.input100}>
              <label className={classes.labelEsRural}>Es Actividad Rural</label>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TabEmpleador;
