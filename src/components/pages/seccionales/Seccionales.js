import React, { Fragment, useState } from "react";
import SeccionalesLista from "./lista/SeccionalesLista";
import { Tab, Tabs } from "@mui/material";
import styles from "./Seccionales.module.css";
import SeccionalAutoridades from "./autoridades/SeccionalAutoridades";
import SeccionalDocumentacion from "./documentacion/SeccionalDocumentacion";

const Seccionales = (props) => {
    const [selectedTab, setSelectedTab] = useState(0)

    const handleChangeTab = (event, newValue) => {

      setSelectedTab(newValue);

      props.tabSelected(newValue); //le paso al handler el tab seleccionado para que sepa que botones de accion debe renderizar

    };
  return ( 
    <>
      <div>
        <h1 className="titulo">Seccionales</h1>
      </div>

      <div className="contenido">

        <div style={{display: 'flex', color: '#186090', height: '1.5rem', paddingLeft: '1rem'}}>
            <h5>{props.record?.codigo +' - '+ props.record?.descripcion}</h5>
        </div>
        
        <Tabs
          value={selectedTab}
          onChange={handleChangeTab}
          className={styles.tabs}
        >
          <Tab
            className={styles.tab}
            style={{ backgroundColor: "#186090" }}
            label="SECCIONALES"
          />
          <Tab
            className={styles.tab}
            style={{ backgroundColor: "#186090" }}
            label="AUTORIDADES"
            disabled={props.seccionalSeleccionada?.id ? false : true}
          />
          <Tab
            className={styles.tab}
            style={{ backgroundColor: "#186090" }}
            label="DOCUMENTOS"
            disabled={props.seccionalSeleccionada?.id ? false : true}
          />
        </Tabs>
      
      {selectedTab === 0 && (
      
          <SeccionalesLista
            seccionales={props.seccionales}
            onSeccionalSeleccionada={props.onSeccionalSeleccionada}
            selectores={props.selectores}
            selector={props.selector}
            selectorValor={props.selectorValor}
            onSelectorSelected={props.onSelectorSelected}
            onSelectorValor={props.onSelectorValor}
            onBuscarClick={props.onBuscarClick}
            onLimpiarClick={props.onLimpiarClick}
          />
       
      )}

      {selectedTab === 1 && (
        <SeccionalAutoridades
          seccionalAutoridades={props.seccionalAutoridades}          
          onSoloAutoridadesVigentes={props.onSoloAutoridadesVigentes}
          onSeleccionAutoridad={props.onSeleccionAutoridad}
        />
      )}

      {selectedTab === 2 && (
        <SeccionalDocumentacion seccionalDocumentacion={props.seccionalDocumentacion} />
      )}
      </div>
    </>
  );
};

export default Seccionales;
