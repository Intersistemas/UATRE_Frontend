import { Dialog } from "@mui/material";
import { Modal, Tab } from "bootstrap";
import React, { useState } from "react";
import { Tabs } from "react-bootstrap";
import classes from "./SeccionalAgregar.module.css"

const SeccionalAgregar = (props) => {
    const [selectedTab, setSelectedTab] = useState(0)

    const handleChangeTab = (tab) => {
        setSelectedTab(tab)
    }
  return (
    <>      
      <Modal onClose={props.onClose}>
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
            <Tab
              label="Documentacion"
            />            
          </Tabs>
        </div>
      </Modal>
    </>
  );
};

export default SeccionalAgregar;
