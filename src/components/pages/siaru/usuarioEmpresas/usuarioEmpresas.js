import { Grid } from "@mui/material";
import Button from "components/ui/Button/Button";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";

const UsuarioEmpresas = (props) => {
  return (
    <Grid col>
      <SearchSelectMaterial
        label="Selecione uma empresa"
        options={props.data}
        onChange={(value) => props.onChange(value)}
      />

      <Button onClick={props.onDesvincula}>DESVINCULA</Button>
    </Grid>
  );
};

export default UsuarioEmpresas;
