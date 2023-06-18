import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Button from "../../../ui/Button/Button";
import ModalBajaReactivacion from "../../../ui/ModalBajaReactivacion/ModalBajaReactivacion";
import classes from "./PantallaBajaReactivacion.module.css";
import modalCss from "../../../ui/Modal/Modal.module.css";
import InputMaterial from "../../../ui/Input/InputMaterial";
import moment from "moment";
import useHttp from "../../../hooks/useHttp";
import { AFILIADO_BAJA, AFILIADO_REACTIVADO } from "../../../helpers/Mensajes";
import Formato from "../../../helpers/Formato";
import FormatearFecha from "../../../helpers/FormatearFecha";

const PantallaBajaReactivacion = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  //console.log(props.afiliado)
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTexto, setDialogTexto] = useState("");
  const [fecha, setFecha] = useState(moment(new Date()).format("yyyy-MM-DD"));
  const [observaciones, setObservaciones] = useState("");
  const [resolverSolicitudAfiliadoResponse, setResolverSolicitudAfiliadoResponse] = useState(0)

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleCerrarModal();
  };

  const handleCerrarModal = () => {
    props.onClose();
  };

  const handleInputChange = (value, id) => {
    switch (id) {
      case "fecha":
        setFecha(moment(value).format("yyyy-MM-DD"));
        break;
      case "observaciones":
        setObservaciones(value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (dialogTexto !== "") {
      setOpenDialog(true);
    }
  }, [dialogTexto]);

  const handleConfirmar = (event) => {
    event.preventDefault();

    if (observaciones === "") {
      setDialogTexto("Se deben indicar las Observaciones");
      return;
    }

    const estadoSolicitudId = props.accion === "Baja" ? 3 : 2
    const patchAfiliado = [
      {
        path: "EstadoSolicitudId",
        op: "replace",
        value: estadoSolicitudId,
      },
      {
        path: "FechaIngreso",
        op: "replace",
        value: null,
      },
      {
        path: "NroAfiliado",
        op: "replace",
        value: "0",
      },
      {
        path: "EstadoSolicitudObservaciones",
        op: "replace",
        value: observaciones,
      },
      {
        path: "FechaEgreso",
        op: "replace",
        value: moment(fecha).format("yyyy-MM-DD"),
      },
    ];

    const resolverSolicitudAfiliado = async (
      resolverSolicitudAfiliadoResponse
    ) => {
      if (resolverSolicitudAfiliadoResponse) {
        console.log("props.estadosSolicitudes", props.estadosSolicitudes);        
        setDialogTexto(props.accion === "Baja" ? AFILIADO_BAJA : AFILIADO_REACTIVADO);
        setResolverSolicitudAfiliadoResponse(resolverSolicitudAfiliadoResponse);        
      }
    };

    request(
      {
        baseURL: "Afiliaciones",        
        endpoint: `/Afiliado?Id=${props.afiliado?.id}`,
        method: "PATCH",
        body: patchAfiliado,
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      },
      resolverSolicitudAfiliado
    );
  };

//   useEffect(() => {
//     if (resolverSolicitudAfiliadoResponse !== 0){
//         handleCerrarModal()
//     }
//   }, [resolverSolicitudAfiliadoResponse])
  

  //console.log("fecha", fecha);
  return (
    <>
      <div>
        <Dialog onClose={handleCloseDialog} open={openDialog}>
          <DialogContent dividers>
            <Typography gutterBottom>{dialogTexto}</Typography>
          </DialogContent>
          <DialogActions dividers>
            <Button onClick={handleCloseDialog}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </div>
      <ModalBajaReactivacion onClose={props.onClose}>
        <div className={modalCss.modalCabecera}>
          <h3 className={classes.titulo}>
            {props.accion === "Baja"
              ? `Baja Afiliado: ${Formato.Cuit(props.afiliado?.cuil)} ${
                  props.afiliado?.nombre
                }`
              : `Reactiva Afiliado: ${Formato.Cuit(props.afiliado?.cuil)} ${
                  props.afiliado?.nombre
                }`}
          </h3>
          <div className={classes.subTituloVentana}>
            <h5 className={classes.titulo}>
              Estado Solicitud del Afiliado: {props.afiliado?.estadoSolicitud}
            </h5>
            <h5 className={classes.titulo}>
              Fecha de Ingreso: {FormatearFecha(props.afiliado?.fechaIngreso)}{" "}
              - Nro Afiliado: {props.afiliado.nroAfiliado}
            </h5>
          </div>
        </div>
        <div className={classes.div}>
          <div className={classes.renglon}>
            <div className={classes.input25}>
              <InputMaterial
                id="fecha"
                value={fecha}
                label={
                  props.accion === "Baja"
                    ? "Fecha de Baja"
                    : "Fecha de Reactivación"
                }
                type="date"
                onChange={handleInputChange}
              />
            </div>
            <div className={classes.input100}>
              <InputMaterial
                id="observaciones"
                value={observaciones}
                label="Observaciones"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className={classes.footer}>
          <Button
            /*className={classes.button}*/
            width={25}
            onClick={handleConfirmar}
            disabled={resolverSolicitudAfiliadoResponse !== 0}
          >
            {props.accion === "Baja" ? "Baja Afiliado" : "Reactiva Afiliado"}
          </Button>

          <Button width={25} onClick={handleCerrarModal}>
            Cierra
          </Button>
        </div>
      </ModalBajaReactivacion>
    </>
  );
};

export default PantallaBajaReactivacion;
