import React, { useEffect, useState } from "react";
import classes from "./SeccionalForm.module.css";
//import Modal from "../../../ui/Modal/Modal";

import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal} from 'react-bootstrap';
import { Tab, Tabs } from "@mui/material";
import InputMaterial from "../../../ui/Input/InputMaterial";
import SearchSelectMaterial from "../../../ui/Select/SearchSelectMaterial";
import Button from "../../../ui/Button/Button";
import SeccionalDocumentos from "../documentacion/SeccionalDocumentacion";
import SeccionalAutoridades from "../autoridades/SeccionalAutoridades";
import SeccionalAutoridadesForm from "../autoridades/SeccionalAutoridadesForm";

const SeccionalForm = ({
  request = "",
  record = {}, // Registro de liquidacion a realizar baja/modificaicon/consulta. Si es alta, se toman estos datos como iniciales.
  localidades = [],
  seccionalAutoridades = [],
  isLoading={},
  refCargos=[],
  autoridadAfiliado={},
  autoridadSeleccionada={},

  onCambiaAutoridad= () => {},
  onBorraAutoridad= () => {},
  onValidaAfiliadoClick= () => {},
  onSeleccionAutoridad= () => {},
  handlerSeccionalFormShow = () => {},
  onAgregaAutoridad = () => {},
  onConfirmaClick = () => {},
}) => {

  request === "Agrega Seccional" ? record={} : record = { ...record };

  console.log('record_seccional',record);
  const [selectedTab, setSelectedTab] = useState(0);
  const [codigoSeccional, setCodigoSeccional] = useState(record?.codigo ?? "");
  const [nombreSeccional, setNombreSeccional] = useState(record?.descripcion ?? "");
  const [localidadSeccional, setLocalidadSeccional] = useState(record?.localidadSeccional ?? "");
  const [direccionSeccional, setDireccionSeccional] = useState(record?.domicilio ?? "")
  const [observacionesSeccional, setObservacionesSeccional] = useState(record?.observaciones ?? "")
  const [localidadesSelect, setLocalidadesSelect] = useState([""]);
  const [localidadBuscar, setLocalidadBuscar] = useState("");

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
        console.log("localidadesSelect", localidadesSelect, localidades);
        setLocalidadesSelect(localidadesSelect);
      }     
      

    if (localidadBuscar === ""){
      setLocalidadesSelect([])
      setLocalidadBuscar("")
    }    
  }, [localidades, localidadBuscar]);

  const handleChangeTab = (event, newValue) => {
    //console.log("tab", newValue)
    setSelectedTab(newValue);
  };

  const handleInputChange = (value, id) => {
    //console.log(value, id)
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

      default:
        break;
    }
  };

  const handleChangeSelect = (item) => {
    console.log('handleChangeSelect',item);
    setLocalidadSeccional(item);
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
    request // Validaciones específicas segun request
  ) {
    case "Agrega Seccional": // Alta
      break;
    case "Baja Seccional": // Baja
      break;
    case "Modifica Seccional": // Modificaicon
      break;
    default: // No se reconoce request
      handlerSeccionalFormShow()
      return;
  }

  setErrores((old) => ({ ...old, ...newErrores }));

  if (noValida) return;


  onConfirmaClick({
    codigo: codigoSeccional,
    descripcion: nombreSeccional,
    domicilio: direccionSeccional,
    observaciones: observacionesSeccional,
    estado: "Activa",
    refDelegacionId: 0,
    seccionalLocalidad: 
    [
      {
        seccionalId: 0,
        refLocalidadId: localidadSeccional.value,
      }
    ],
    seccionalAutoridades: seccionalAutoridades
  });

}
//#endregion validaciones

  const handlerOnConfirmaClick = (event) => {
    event.preventDefault();

    validar()

  }

  const handlerOnAgregarAutoridad = (autoridad) => {
    console.log("nueva autoridad", autoridad)
    onAgregaAutoridad(autoridad);      
  }

  return (
    <>
        <Modal
            show={handlerSeccionalFormShow}
            onHide={handlerSeccionalFormShow}
            size="lg"
            centered
        >
        <Modal.Header closeButton>{request}</Modal.Header>
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
                {request === "Agrega Seccional" && <Tab label="Documentacion" />}
                {request === "Agrega Seccional" && <Tab label="Autoridades" />}
            </Tabs>

            {selectedTab === 0 && (
                <div className={classes.container}>
                    <div>
                        <InputMaterial
                            id="codigoSeccional"
                            value={codigoSeccional}
                            label="Codigo"
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <InputMaterial
                            id="nombreSeccional"
                            value={nombreSeccional}
                            label="Nombre"
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div /*corrregir este elemento*/ > 
                        <SearchSelectMaterial
                            name="localidadSeccional"
                            label="Localidad"
                            options={localidadesSelect}
                            value={localidadSeccional}
                            //defaultValue={localidadSeccional}
                            onChange={handleChangeSelect}
                            onTextChange={handlerOnTextChange}
                            required
                        />
                    </div>
                    <div>
                        <InputMaterial
                            id="direccionSeccional"
                            value={direccionSeccional}
                            label="Direccion"
                            onChange={handleInputChange}
                            required
                        />
                    </div>        
                    <div>
                        <InputMaterial
                            id="observacionesSeccional"
                            value={observacionesSeccional}
                            label="Observaciones"
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
            )}
            {selectedTab === 1 && <SeccionalDocumentos />}
            {selectedTab === 2 && (
                <>
                <SeccionalAutoridades
                    seccionalAutoridades={seccionalAutoridades}
                    onSeleccionAutoridad={onSeleccionAutoridad}
                />
                <SeccionalAutoridadesForm
                    onAgregarAutoridad={handlerOnAgregarAutoridad}
                    onCambiaAutoridad={onCambiaAutoridad}
                    onBorraAutoridad={onBorraAutoridad}
                    autoridadSeleccionada={autoridadSeleccionada}
                    refCargos={refCargos}
                    autoridadAfiliado={autoridadAfiliado}
                    onValidaAfiliadoClick={onValidaAfiliadoClick}
                />
                </>
            )}
            </div>
           
        </Modal.Body>
            <Modal.Footer sdfs >
                <Button
                    className="botonAzul"
                    type="submit"
                    loading={isLoading}
                    width={25}
                    onClick={handlerOnConfirmaClick}
                >
                    CONFIRMA
                </Button>

                <Button className="botonAmarillo" width={25} onClick={handlerSeccionalFormShow}>
                    CIERRA
                </Button>
            </Modal.Footer>
        </Modal>
    </>
  );
};

export default SeccionalForm;
