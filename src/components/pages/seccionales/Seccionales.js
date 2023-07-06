import React, { Fragment, useState } from "react";
import SeccionalesLista from "./SeccionalesLista";
import { Tab, Tabs } from "@mui/material";
import styles from "./Seccionales.module.css";
import SeccionalAutoridades from "./SeccionalAutoridades";

const Seccionales = (props) => {
    const [selectedTab, setSelectedTab] = useState(0)

    const handleChangeTab = (event, newValue) => {
      setSelectedTab(newValue);
    };
  return (
    <>
      <div>
        <h1 className="titulo">Seccionales</h1>
      </div>

      <div className="contenido">
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
      </div>
      {selectedTab === 0 && (
        <div>
          <SeccionalesLista
            seccionales={props.seccionales}
            onSeccionalSeleccionada={props.onSeccionalSeleccionada}
          />
        </div>
      )}

      {selectedTab === 1 && (
        <SeccionalAutoridades
          seccionalAutoridades={props.seccionalAutoridades}
          onSoloAutoridadesVigentes={props.onSoloAutoridadesVigentes}
        />
      )}

      {/* {selectedTab === 2 && (
        <SeccionalDocumentos
          seccionalDocumentos={props.seccionalDocumentos}          
        />
      )} */}
    </>
  );
};

export default Seccionales;
