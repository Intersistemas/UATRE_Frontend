import React, { useEffect, useState } from "react";
import classes from "./SeccionalAgregar.module.css";
import Modal from "../../../ui/Modal/Modal";
import { Tab, Tabs } from "@mui/material";
import InputMaterial from "../../../ui/Input/InputMaterial";
import SearchSelectMaterial from "../../../ui/Select/SearchSelectMaterial";
import Button from "../../../ui/Button/Button";
import SeccionalDocumentos from "../documentacion/SeccionalDocumentacion";
import SeccionalAutoridades from "../autoridades/SeccionalAutoridades";
import SeccionalAutoridadesForm from "../autoridades/SeccionalAutoridadesForm";

const SeccionalAgregar = (props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [codigoSeccional, setCodigoSeccional] = useState("");
  const [nombreSeccional, setNombreSeccional] = useState("");
  const [localidadSeccional, setLocalidadSeccional] = useState(null);
  const [direccionSeccional, setDireccionSeccional] = useState("")
  const [observacionesSeccional, setObservacionesSeccional] = useState("")
  const [localidadesSelect, setLocalidadesSelect] = useState([]);
  const [localidadBuscar, setLocalidadBuscar] = useState("");
  
  useEffect(() => {
    console.log("localidadBuscar", localidadBuscar)
    if (localidadBuscar.length > 2) {
      const localidadesSelect = props.localidades
        .filter((localidad) =>
          localidad.nombre.toUpperCase().includes(localidadBuscar.toUpperCase())
        )
        .map((localidad) => {
          return { value: localidad.id, label: localidad.nombre };
        });
        console.log("localidadesSelect", localidadesSelect, props.localidades);
        setLocalidadesSelect(localidadesSelect);
      }     
      

    if (localidadBuscar === ""){
      setLocalidadesSelect([])
      setLocalidadBuscar("")
    }    
  }, [props.localidades, localidadBuscar]);

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
    console.log(item);
    setLocalidadSeccional(item);
  };

  const handlerOnTextChange = (event) => {
    //console.log("text change", event.target.value);
    setLocalidadBuscar(event.target.value);
  };

  const handlerOnConfirmaClick = (event) => {
    event.preventDefault();

    props.onConfirmaClick({
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
      seccionalAutoridades: props.seccionalAutoridades
    });
  }

  const handlerOnAgregarAutoridad = (autoridad) => {
    console.log("nueva autoridad", autoridad)
    props.onAgregaAutoridad(autoridad);      
  }

  return (
    <>
      <Modal onClose={props.onAgregarClose} cname="seccionales">
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
            <Tab label="Documentacion" />
            <Tab label="Autoridades" />
          </Tabs>

          {selectedTab === 0 && (
            <div className={classes.div}>
              <div className={classes.renglon}>
                <div className={classes.input}>
                  <InputMaterial
                    id="codigoSeccional"
                    value={codigoSeccional}
                    label="Codigo"
                    onChange={handleInputChange}
                  />
                </div>
                <div className={classes.input}>
                  <InputMaterial
                    id="nombreSeccional"
                    value={nombreSeccional}
                    label="Nombre"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className={classes.renglon}>
                <div className={classes.input}>
                  <SearchSelectMaterial
                    name="localidadSeccional"
                    label="Localidad"
                    options={localidadesSelect}
                    value={localidadSeccional}
                    //defaultValue={localidadSeccional}
                    onChange={handleChangeSelect}
                    onTextChange={handlerOnTextChange}
                  />
                </div>
                <div className={classes.input}>
                  <InputMaterial
                    id="direccionSeccional"
                    value={direccionSeccional}
                    label="Direccion"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className={classes.renglon}>
                <div className={classes.input100}>
                  <InputMaterial
                    id="observacionesSeccional"
                    value={observacionesSeccional}
                    label="Observaciones"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
        <div className={classes.footer}>
          <Button
            className="botonAzul"
            type="submit"
            loading={props.isLoading}
            width={25}
            onClick={handlerOnConfirmaClick}
          >
            CONFIRMA
          </Button>

          <Button className="botonAmarillo" width={25} onClick={props.onClose}>
            CIERRA
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SeccionalAgregar;
