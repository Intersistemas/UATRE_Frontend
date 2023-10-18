import React from "react";
import classes from "../AfiliadoAgregar.module.css";
import Formato from "../../../helpers/Formato";
import InputMaterial from "../../../ui/Input/InputMaterial";
import DeclaracionesJuradas from "../declaracionesJuradas/DeclaracionesJuradas";
import AfiliadosUltimaDDJJ from "../declaracionesJuradas/AfiliadosUltimaDDJJ";
import SelectMaterial from "../../../ui/Select/SelectMaterial";
import Button from "../../../ui/Button/Button";

const ResolverSolicitud = (props) => {
  return (
    <>
      <div className={classes.div}>
        <h4>
          {props.padronRespuesta
            ? `DDJJ UATRE ${Formato.Cuit(props.cuilState.value)} ${
                props.nombreState.value
              }`
            : "DDJJ UATRE"}
        </h4>
        <div className={classes.renglonDDJJ}>
          <DeclaracionesJuradas
            cuil={props.cuilState.value}
            //onSeleccionRegistro={handleSeleccionDDJJ}
            onDeclaracionesGeneradas={null}
            infoCompleta={true}
            mostrarBuscar={false}
            registros={1}
          />
        </div>
      </div>
      <div className={classes.div}>
        <h4>Actividades del Empleador</h4>
        <div className={classes.renglon}>
          <div className={classes.input33}>
            <InputMaterial
              id="CIIU1"
              value={
                props.padronEmpresaRespuesta &&
                props.padronEmpresaRespuesta.ciiU1
                  ? `${props.padronEmpresaRespuesta.ciiU1} - ${props.padronEmpresaRespuesta.ciiU1Descripcion}`
                  : ""
              }
              label="Actividad Principal"
              disabled={true}
              showToolTip={true}
            />
          </div>

          <div className={classes.input33}>
            <InputMaterial
              id="CIIU2"
              value={
                props.padronEmpresaRespuesta &&
                props.padronEmpresaRespuesta.ciiU2
                  ? `${props.padronEmpresaRespuesta.ciiU2} - ${props.padronEmpresaRespuesta.ciiU2Descripcion}`
                  : ""
              }
              label="Actividad Secundaria"
              disabled={true}
              showToolTip={true}
            />
          </div>

          <div className={classes.input33}>
            <InputMaterial
              id="CIIU3"
              value={
                props.padronEmpresaRespuesta &&
                props.padronEmpresaRespuesta.ciiU3
                  ? `${props.padronEmpresaRespuesta.ciiU3} - ${props.padronEmpresaRespuesta.ciiU3Descripcion}`
                  : ""
              }
              label="Actividad Terciaria"
              disabled={true}
              showToolTip={true}
            />
          </div>
        </div>
      </div>
      <div className={classes.divResolverSolicitud}>
        <h4>Afiliados en ultima DDJJ del Empleador</h4>
        <AfiliadosUltimaDDJJ cuit={props.cuitEmpresa} mostrarBuscar={false} />

        <div className={classes.renglon}>
          <div className={classes.input25}>
            <SelectMaterial
              name="estadoSolicitudSelect"
              label="Estado Solciitud:"
              options={props.estadosSolicitudes}
              value={props.estadoSolicitud}
              //defaultValue={nacionalidades[0]}
              onChange={props.onHandleChangeSelect}
              //disabled={!padronRespuesta?.idPersona ? true : false}
            />
          </div>

          <div className={classes.input25}>
            <InputMaterial
              id="resolverSolicitudFechaIngreso"
              value={props.resolverSolicitudFechaIngreso}
              label="Fecha Ingreso"
              type="date"
              width={100}
              onChange={props.onHandleInputChange}
              disabled={true} //{estadoSolicitud !== 2 ? true : false}
            />
          </div>

          <div className={classes.input75}>
            <InputMaterial
              id="resolverSolicitudObs"
              value={props.resolverSolicitudObs}
              label="Observaciones"
              width={100}
              onChange={props.onHandleInputChange}
              //disabled={!padronRespuesta?.idPersona ? true : false}
            />
          </div>
        </div>

        <div className={classes.botonesResolverSolicitud}>
          <div className={classes.botonResolverSolicitud}>
            <Button
              className="botonAmarillo"
              width={100}
              onClick={props.onResolverSolicitudHandler}
              disabled={props.showImprimirLiquidacion}
            >
              Resuelve Solicitud
            </Button>
          </div>
          <div className={classes.botonResolverSolicitud}>
            <Button
              className="botonAmarillo"
              width={100}
              disabled={!props.showImprimirLiquidacion}
              //onClick={imprimirLiquidacionHandler}
            >
              Imprimir Certificado Afiliación
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResolverSolicitud;
