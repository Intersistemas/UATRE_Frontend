import React from "react";
import { Tab, Tabs } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";

const AfiliadosTabs = ({
  selectedTab,
  setSelectedTab,
  afiliadoSeleccionado,
  tareas
}) => (
  <Grid col className="tabs">
    <text>
      {afiliadoSeleccionado?.nombre ? (
        `${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}`
      ) : (
        <>&nbsp;</>
      )}
    </text>
    <Grid width>
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        style={{ width: "100%", position: "relative", zIndex: 1 }}
      >
        <Tab style={{ backgroundColor: "#186090" }} label="SOLICITUDES" />
        <Tab
          style={{ backgroundColor: "#186090" }}
          label="DETALLE DE SOLICITUD DE AFILIACION"
        //   disabled={!afiliadoSeleccionado?.cuil}
        />
       
      </Tabs>
      {/* <Grid block shrink="0" basis={{ 0: "700px", 1: "25%", 2: "25%", 4: "25%" }} flex="0 0 700px" /> */}
    </Grid>
  </Grid>
);

export default AfiliadosTabs;