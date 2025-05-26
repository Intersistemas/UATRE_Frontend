
import React from "react";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
import Formato from "components/helpers/Formato";
import moment from "moment";
import styles from "./InformacionDetallada.module.css";

const InputMaterialDetail = (p) => (
  <InputMaterial variant="standard" padding="0rem 0.5rem" size="small" {...p} />
);

const InformacionDetallada = ({ afiliado = {} }) => (
  <Grid
    className={[styles.fondo, styles.grupo].join(" ")}
    col
    width="full"
    gap="inherit"
  >
    <Grid className={styles.titulo} width="full">
      Datos del afiliado
    </Grid>
    <Grid col width="full" gap="inherit" style={{ padding: "0rem 1rem" }}>
      <Grid width="full" gap="inherit">
        <InputMaterialDetail
          label="Nro. afiliado"
          value={afiliado.nroAfiliado || "-"}
        />
        <InputMaterialDetail
          label="CUIL"
          mask={CUITMask}
          value={
            afiliado.empresaCUIT
              ? afiliado.empresaCUIT
              : (afiliado.empresaCUIT || "-")
          }
        />
        <InputMaterialDetail
          label="Documento"
          value={
            [
              afiliado.afipTipoDocumento || null,
              Formato.DNI(afiliado.afipNumeroDocumento) || null,
            ]
              .filter((r) => r)
              .join(" ") || "-"
          }
        />
      </Grid>
      <Grid width="full" gap="inherit">
        <InputMaterialDetail
          style={{ "-webkit-text-stroke": "medium" }}
          label="Nombre"
          value={afiliado?.nombre || "-"}
        />
        <InputMaterialDetail
          label="Seccional"
          value={
            !!afiliado?.seccionalCodigo && !!afiliado?.seccional
              ? `${afiliado?.seccionalCodigo} ${afiliado?.seccional}`
              : "-"
          }
        />
      </Grid>
      <Grid width="full" gap="inherit">
        <InputMaterialDetail
          label="Estado"
          value={afiliado?.estadoSolicitud || "-"}
        />
        <InputMaterialDetail
          label="Fecha Ingreso"
          value={
            afiliado?.fechaIngreso
              ? moment(afiliado?.fechaIngreso).format("yyyy-MM-DD")
              : "-"
          }
        />
        <InputMaterialDetail
          label="Fecha Egreso"
          value={
            afiliado?.fechaEgreso
              ? moment(afiliado?.fechaEgreso).format("yyyy-MM-DD")
              : "-"
          }
        />
      </Grid>
      <InputMaterialDetail
        label="Observación"
        value={afiliado?.estadoSolicitudObservaciones || "-"}
      />
    </Grid>
  </Grid>
);

export default InformacionDetallada;