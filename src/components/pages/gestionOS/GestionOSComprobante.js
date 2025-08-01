import React from "react";
import { Document, Image, Page, Text } from "@react-pdf/renderer";
import logo1 from "media/Logo1_sidebar.png";
import styles from "./PDF.styles.js";
import Grid from "components/ui/Grid/Grid";

const GestionOSComprobante = (props) => {
  const { nombre, fecha, seccional } = props;

  const pagina = () => {
    <Grid col></Grid>;
  };

  return (
    <Document>
      <Page style={styles.page} size="A5" orientation="landscape">
        <Grid col>
          <Grid gap="5">
            <Image src={logo1} style={{ width: "40", height: "40" }} />
            <Grid col justify="end">
              <Text style={{ ...styles.titulo, fontSize: "40pt" }}>UATRE</Text>
            </Grid>
          </Grid>
          <Grid col width>
            <Text style={{ ...styles.titulo, fontSize: "8pt" }}>
              Union Argentina de Trabajadores Rurales y Estibadores
            </Text>
            <Grid width>
              <Text style={{ ...styles.titulo, fontSize: "8pt" }}></Text>
            </Grid>
          </Grid>

          <Grid col grow justify="end" style={{ marginTop: "12px" }}>
            <Text style={{ ...styles.titulo, fontSize: "10pt" }}>
              Constancia de gestión ante OSPRERA
            </Text>
          </Grid>
          <Grid col grow gap="10px" style={{ marginTop: "10px" }}>
            <Text style={{ fontSize: "10pt" }}>Paciente: {nombre}</Text>
            <Text style={{ fontSize: "10pt" }}>Fecha de gestión: {fecha}</Text>
            <Text style={{ fontSize: "10pt" }}>Seccional: {seccional}</Text>
          </Grid>
        </Grid>
      </Page>
    </Document>
  );
};

export default GestionOSComprobante;
