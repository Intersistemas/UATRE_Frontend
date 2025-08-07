import React from "react";
import { Document, Image, Page, Text } from "@react-pdf/renderer";
import logo1 from "media/Logo1_sidebar.png";
import styles from "./PDF.styles.js";
import Grid from "components/ui/Grid/Grid";

const GestionOSComprobante = (props) => {
  const { nombre, fecha, seccional, obraSocial } = props;

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
              Constancia de gestión ante {obraSocial}
            </Text>
          </Grid>
          <Grid col grow gap="10px" style={{ marginTop: "10px" }}>
            <Text style={{ fontSize: "10pt" }}>Paciente: {nombre}</Text>
            <Text style={{ fontSize: "10pt" }}>Fecha de gestión: {fecha}</Text>
            <Text style={{ fontSize: "10pt" }}>Seccional: {seccional}</Text>
          </Grid>
           <Grid col grow gap="10px" style={{ marginTop: "30px" }}>
            <Text style={{ fontSize: "8pt" }}>Dejo constancia que voluntariamente acepto que UATRE realice esta Gestión en mi nombre y me represente para realizar todo tipo de tramitación o reclamo ante quien corresponda, a los exclusivos fines de conseguir que la {obraSocial} me otorgue la cobertura que me corresponde</Text>
           </Grid>
        </Grid>
      </Page>
    </Document>
  );
};

export default GestionOSComprobante;
