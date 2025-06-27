import { Grid } from "@mui/material";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import { Modal } from "react-bootstrap";
import modalCss from "components/ui/Modal/Modal.module.css";

const UsuarioEmpresasForm = (props) => {
  return (
    <Modal show /*onHide={() => onClose()}*/ size="lg" centered>
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
            onClick={props.onDesvincula}
            disabled={
              props.selectedUsuario?.id === "" ||
              props.selectedUsuario?.motivo === ""
            }
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
  );
};

export default UsuarioEmpresasForm;
