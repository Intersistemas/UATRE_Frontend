import { Modal } from "bootstrap/dist/js/bootstrap.bundle.min";
import modalCss from "components/ui/Modal/Modal.module.css";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import { Grid } from "@mui/material";

const usuarioPerfilForm = (props) => {
    let resultadoActualizaRender = null;
  if (props.errorAPI !== null) {
    if (props.errorAPI) {
      resultadoActualizaRender = (
        <Grid width="full" style={{ color: "red" }}>
          Error al actualizar los datos del usuario. Por favor, verifique los
          campos.
        </Grid>
      );
    } else if (!props.errorAPI) {
      resultadoActualizaRender = (
        <Grid width="full" style={{ color: "green" }}>
          Los datos del usuario se actualizaron correctamente.
        </Grid>
      );
    }
  }

  return (
    <Modal show /*onHide={() => onClose()}*/ size="lg" centered>
      <Modal.Header className={modalCss.modalCabecera} closeButton>
        <h3>Datos del usuario</h3>
      </Modal.Header>
      <Modal.Body>
        {resultadoActualizaRender}
        <Grid width gap="30px">
          <Grid width="400px" marginBottom={3}>
            <InputMaterial
              required
              error={props.usuario.nombre === ""}
              label="Nombre"
              value={props.usuario.nombre}
              onChange={(nombre) => props.onChange({ nombre })}
            />
          </Grid>
          <Grid width="400px" marginBottom={3}>
            <InputMaterial
              required
              error={props.usuario.cuit == null || props.usuario.cuit === ""}
              label="CUIT"
              value={props.usuario.cuit}
              onChange={(cuit) => props.onChange({ cuit })}
            />
          </Grid>
          <Grid width="400px" marginBottom={3}>
            <InputMaterial
              error={props.usuario.phoneNumber == null || props.usuario.phoneNumber === ""}
              label="Teléfono"
              value={props.usuario.phoneNumber}
              onChange={(phoneNumber) => props.onChange({ phoneNumber })}
            />
          </Grid>
          <Grid width="400px" marginBottom={3}>
            <InputMaterial
              error={props.usuario.email == null || props.usuario.email === ""}
              label="Email"
              value={props.usuario.email}
              onChange={(email) => props.onChange({ email })}
            />
          </Grid>
        </Grid>
      </Modal.Body>
      <Modal.Footer className={modalCss.modalPie}>
        <Button
          className="botonAmarillo"
          variant="contained"
          color="primary"
          disabled={props.hasErrors}
          onClick={props.onActualiza}
        >
          ACTUALIZA
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default usuarioPerfilForm;