import { Grid } from "@mui/material";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";

const UsuarioEmpresasForm = (props) => {
  return (
    <Grid width="600px" marginBottom={3}>
      <Grid full marginBottom={3}>
        <SearchSelectMaterial
          label="Selecione usuario a desvincular"
          value={props.selectedUsuario}
          options={props.data}
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

      <Grid full marginBottom={3}>
        <Button
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
          width="150px"
          onClick={props.onCancela}          
        >
          CANCELA
        </Button>
      </Grid>
    </Grid>
  );
};

export default UsuarioEmpresasForm;
