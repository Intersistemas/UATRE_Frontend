import React, { useEffect, useState,useContext } from "react";
import classes from "./SeccionalForm.module.css";
//import Modal from "../../../ui/Modal/Modal";

import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal} from 'react-bootstrap';
import { Tab, Tabs } from "@mui/material";
import InputMaterial from "../../../ui/Input/InputMaterial";
import SearchSelectMaterial from "../../../ui/Select/SearchSelectMaterial";
import Button from "../../../ui/Button/Button";
import InputMask from 'react-input-mask';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import dayjs from "dayjs";
import AuthContext from '../../../../store/authContext';


const SeccionalForm = ({
  setRefresh = () => {},
  requestForm = {},
  seccionalSeleccionada = {}, // Registro de liquidacion a realizar baja/modificaicon/consulta. Si es alta, se toman estos datos como iniciales.
  localidades = [],
  isLoading={},

  handleFormShow = () => {},
  onConfirmaClick = () => {},
}) => {

  requestForm.abm === "Alta" ? seccionalSeleccionada={} : seccionalSeleccionada = { ...seccionalSeleccionada };

  const localidadInicio = {value: seccionalSeleccionada?.refLocalidadesId, label: seccionalSeleccionada?.localidadNombre}

  const authContext = useContext(AuthContext)

  const [selectedTab, setSelectedTab] = useState(0);
  
  const [codigoSeccional, setCodigoSeccional] = useState(seccionalSeleccionada?.codigo ?? "");
  const [nombreSeccional, setNombreSeccional] = useState(seccionalSeleccionada?.descripcion ?? "");

  const [localidadSeccional, setLocalidadSeccional] = useState(localidadInicio ?? {});
  const [localidadIdSeccional, setLocalidadIdSeccional] = useState(localidadInicio.value);

  const [direccionSeccional, setDireccionSeccional] = useState(seccionalSeleccionada?.domicilio ?? "")
  const [estadoSeccional, setEstadoSeccional] = React.useState(requestForm?.abm == "Baja" ? "Baja" : 'Activa');
  const [observacionesSeccional, setObservacionesSeccional] = useState(seccionalSeleccionada?.observaciones ?? "")

  const [bajaObservacionesSeccional, setBajaObservacionesSeccional] = useState(seccionalSeleccionada?.deletedObs ?? "")
  const [bajaFechaSeccional, setBajaFechaSeccional] = useState(seccionalSeleccionada?.deletedDate ?? dayjs().format("YYYY-MM-DD"))
  const [bajaUsuarioSeccional, setBajaUsuarioSeccional] = useState(seccionalSeleccionada?.deletedBy ?? authContext.usuario.nombre)
  
  const [localidadesOptions, setLocalidadesOptions] = useState([seccionalSeleccionada?.localidadNombre ?? ""]); //LISTA DE TODAS LAS SECCIONALES  
  const [localidadBuscar, setLocalidadBuscar] = useState(seccionalSeleccionada?.localidadNombre ?? "");

  const [errores, setErrores] = useState({});
  
  useEffect(() => {

    console.log("localidadBuscar", localidadBuscar)
    if (localidadBuscar.length > 2) {
      const localidadesSelect = localidades
        .filter((localidad) =>
          localidad.nombre.toUpperCase().includes(localidadBuscar.toUpperCase())
        )
        .map((localidad) => {
          return { value: localidad.id, label: localidad.nombre };
        });
        //console.log("localidadesSelect", localidadesSelect, localidades);
        setLocalidadesOptions(localidadesSelect);
      }     

      if (localidadBuscar === ""){
        setLocalidadesOptions([])
        setLocalidadBuscar("")
      }    
  }, [localidades, localidadBuscar]);

  const handleChangeTab = (event, newValue) => {
    //console.log("tab", newValue)
    setSelectedTab(newValue);
  };

  const handleInputChange = (value, id) => {
    console.log('handleInputChange',value, id)
    switch (id) {
      case "codigoSeccional":
        setCodigoSeccional(value);
        break;

      case "nombreSeccional":
        setNombreSeccional(value);
        break;

      case "direccionSeccional":
        setDireccionSeccional(value);
        break;

      case "observacionesSeccional":
        setObservacionesSeccional(value);
        break;
      case "estadoSeccional":
        setEstadoSeccional(value);
        break;

      case "bajaObservacionesSeccional":
        setBajaObservacionesSeccional(value);
        break;

      default:
        break;
    }
  };

  const handleChangeCombo = (event) => {
    setEstadoSeccional(event.target.value);
  };


  const handleChangeSelect = (item) => {
    console.log('handleChangeSelect',item);
    setLocalidadIdSeccional(item.value);
  };

  const handlerOnTextChange = (event) => {
    //console.log("text change", event.target.value);
    setLocalidadBuscar(event.target.value);
  };


//#Region validaciones
const validar = () => {

  let noValida = false;
  const newErrores = {};
  const newAlerts = [];

  console.log('noValida0',noValida);

  if (codigoSeccional) {
    newErrores.codigoSeccional = "";
  } else {
    noValida = true;
    newErrores.codigoSeccional = "Dato requerido";
  }

  if (nombreSeccional) {
    newErrores.nombreSeccional = "";
  } else {
    noValida = true;
    newErrores.nombreSeccional = "Dato requerido";
  }
  
  if (direccionSeccional) {
    newErrores.direccionSeccional = "";
  } else {
    noValida = true;
    newErrores.direccionSeccional = "Dato requerido";
  }

  if (observacionesSeccional) {
    newErrores.observacionesSeccional = "";
  } else {
    noValida = true;
    newErrores.observacionesSeccional = "Dato requerido";
  }
  

  switch (
    requestForm.abm // Validaciones específicas segun request
  ) {
    case "Alta": // Alta
      break;
    case "Baja": // Baja
    if (bajaObservacionesSeccional) {
      newErrores.bajaObservacionesSeccional = "";
    } else {
      noValida = true;
      newErrores.bajaObservacionesSeccional = "Dato requerido cuando es una baja";
    }
      break;
    case "Modifica": // Modificaicon
      break;
    default: // No se reconoce request
      handleFormShow()
      return;
  }

  setErrores((old) => ({ ...old, ...newErrores }));

  console.log('noValida',noValida);

  if (noValida) return;

  let newRecord = {
    id: seccionalSeleccionada.id ?? 0,
    codigo: codigoSeccional,
    descripcion: nombreSeccional,
    domicilio: direccionSeccional,
    observaciones: observacionesSeccional,
    estado: estadoSeccional,
    //refDelegacionId: 0,
    refLocalidadesId: localidadIdSeccional,
  }

  if (requestForm?.abm == "Baja") {
    newRecord = {...newRecord,
      deletedObs: bajaObservacionesSeccional,
      /*deletedDate:  bajaFechaSeccional,
      deletedBy:  bajaUsuarioSeccional*/
    }
  }

  console.log("newRecord",newRecord);

  onConfirmaClick(newRecord);

  setRefresh(true);

}
//#endregion validaciones

  const handlerOnConfirmaClick = (event) => {
    event.preventDefault();
    validar()

  }



  return (
    <>
    <div style={{zoom: '80%'}}>
        <Modal
            show={handleFormShow}
            onHide={handleFormShow}
            size="lg"
            centered
        >
        <Modal.Header closeButton>{requestForm.name}</Modal.Header>
        <Modal.Body>
        <div className={classes.div}>
            <Tabs
                value={selectedTab}
                onChange={handleChangeTab}
                aria-label="basic tabs example"
            >
                <Tab
                label="Datos Generales"
                //disabled={nuevoAfiliadoResponse ? true : false}
                />
            </Tabs>

            {selectedTab === 0 && (
                <div className={classes.container}>
                    
                    <div className={classes.item1}>

                        <FormControl sx={{mr: 2, maxWidth: '6rem' }}>
                          <InputMaterial
                            id="codigoSeccional"
                            value={codigoSeccional}
                            label="Codigo"
                            onChange={handleInputChange}
                            as={InputMask}
                            mask="S-9999"
                            required 
                            disabled = {estadoSeccional == "Baja"}
                          />
                        </FormControl>

                        <FormControl sx={{ minWidth: '8rem' }}>
                          <InputLabel id="demo-simple-select-label">Estado</InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="estadoSeccional"
                            value={estadoSeccional}
                            label="Estado"
                            onChange={handleChangeCombo}
                            disabled={true}
                          >
                            <MenuItem value={"Activa"}>Activa</MenuItem>
                            <MenuItem value={"Pendiente"}>Pendiente</MenuItem>
                            <MenuItem value={"Baja"}>Baja</MenuItem>
                          </Select>
                        </FormControl>  
                    </div>

                    <div className={classes.item2}>
                        <InputMaterial
                          id="nombreSeccional"
                          value={nombreSeccional}
                          label="Nombre"
                          onChange={handleInputChange}
                          required
                          disabled = {estadoSeccional == "Baja"}
                        />
                    </div> 
                    <div /*****/className={classes.item3}>
                        <SearchSelectMaterial
                          name="localidadSeccional"
                          label="Localidad"
                          options={localidadesOptions}
                          value={localidadSeccional}
                          //defaultValue={localidadInicio}
                          onChange={handleChangeSelect}
                          onTextChange={handlerOnTextChange}
                          required
                          disabled = {estadoSeccional == "Baja"}
                        />
                   </div>
                   <div className={classes.item4}>
                        <InputMaterial
                          id="direccionSeccional"
                          value={direccionSeccional}
                          label="Direccion"
                          onChange={handleInputChange}
                          required
                          disabled = {estadoSeccional == "Baja"}
                        />
                    </div>        
                    <div className={classes.item5}>
                        <InputMaterial
                          id="observacionesSeccional"
                          value={observacionesSeccional}
                          label="Observaciones"
                          onChange={handleInputChange}
                          required
                          disabled = {estadoSeccional == "Baja"}
                        />
                    </div>

                    {estadoSeccional == "Baja" &&
                    <>
                      <div className={classes.item6}>
                        <InputMaterial
                          id="bajaFechaSeccional"
                          value={bajaFechaSeccional}
                          label="Baja Fecha"
                          onChange={handleInputChange}
                          required
                          show = {estadoSeccional == "Baja"}
                          disabled ={true}
                        />
                      </div>
                      <div className={classes.item7}>
                        <InputMaterial
                          id="bajaUsuarioSeccional"
                          value={bajaUsuarioSeccional}
                          label="Baja Usuario"
                          onChange={handleInputChange}
                          required
                          disabled = {estadoSeccional == "Baja"}
                        />
                      </div>
                      <div className={classes.item8}>
                        <InputMaterial 
                          id="bajaObservacionesSeccional"
                          value={bajaObservacionesSeccional}
                          label="Baja Observaciones"
                          onChange={handleInputChange}
                          required
                          disabled = {estadoSeccional != "Baja"}
                        />
                      </div>
                    </>}
                </div>
            )}
            </div>
           
        </Modal.Body>
            <Modal.Footer>
                <Button
                  className="botonAzul"
                  loading={isLoading}
                  width={25}
                  onClick={handlerOnConfirmaClick}
                >
                    CONFIRMA
                </Button>

                <Button className="botonAmarillo" width={25} onClick={handleFormShow}>
                    CIERRA
                </Button>
            </Modal.Footer>
        </Modal>
        </div>
    </>
  );
};

export default SeccionalForm;
