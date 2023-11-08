import React, { Fragment, useState } from "react";
import { Tab, Tabs } from "@mui/material";
import styles from "./Accesos.module.css";

const Accesos = (props) => {
    const [selectedTab, setSelectedTab] = useState(0)

    const handleChangeTab = (event, newValue) => {
      setSelectedTab(newValue);
    };
  return ( 
    <>
      <div>
        <h1 className="titulo">Administración de Accesos</h1>
      </div>

      <div>
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
          <a>tab 0</a>
        </div>
      )}

      {selectedTab === 1 && (
       <a>tab1</a>
      )}

      {selectedTab === 2 && (
        <a>tab2</a>
      )}
    </>
  );
};

export default Accesos;
