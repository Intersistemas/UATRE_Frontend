import { Grid } from "@mui/material";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import { Modal } from "react-bootstrap";
import modalCss from "components/ui/Modal/Modal.module.css";
import { useState } from "react";

const UsuarioEmpresasForm = (props) => {
  const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);

  const modalConfirmacion = (
    <Modal show={showModalConfirmacion} size="small">
      <Modal.Header className={modalCss.modalCabecera} closeButton>
        <h3>CONFIRMACIÓN</h3>
      </Modal.Header>
      <Modal.Body>
        <p>Confirma que desea desvincular el usuario de la empresa?</p>
      </Modal.Body>
      <Modal.Footer className={modalCss.modalPie}>
        <Button
          className="botonAmarillo"
          width="150px"
          onClick={props.onDesvincula}
        >
          ACEPTAR
        </Button>
        <Button
          className="botonAmarillo"
          width="150px"
          onClick={() => setShowModalConfirmacion(false)}
        >
          CANCELAR
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      {modalConfirmacion}
      <Modal show size="lg" centered>
        <Modal.Header className={modalCss.modalCabecera} closeButton>
          <h3>{props.title}</h3>
        </Modal.Header>
        <Modal.Body>
          <Grid full marginBottom={3}>
            <SearchSelectMaterial
              disabled
              label="Selecione usuario a desvincular"
              value={props.selectedUsuario}
              options={props.data}
              noOptionsText="No hay usuarios disponibles"
              onChange={(value) => props.onChange(value)}
            />
          </Grid>

          <Grid full marginBottom={3}>
            <InputMaterial
              hidden={true}
              label="Motivo"
              value={props.selectedUsuario?.motivo}
              onChange={(e) => props.onMotivoChange(e)}
              required
            />
          </Grid>
        </Modal.Body>
        <Modal.Footer className={modalCss.modalPie}>
          <Grid full marginBottom={3}>
            <Button
              className="botonAmarillo"
              width="150px"
              onClick={() => setShowModalConfirmacion(true)}
              disabled={props.selectedUsuario?.id === ""}
            >
              DESVINCULA
            </Button>

            <Button
              className="botonAmarillo"
              width="150px"
              onClick={props.onCancela}
            >
              CANCELA
            </Button>
          </Grid>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UsuarioEmpresasForm;
