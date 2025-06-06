import { SelectAllRounded } from "@mui/icons-material";
import { Grid } from "@mui/material";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import { useState } from "react";
import { useSelector } from "react-redux";

function DesvincularUsuarioEmpresasHandler() {
  const [usuario, setUsuario] = useState();

  const empresa = useSelector((state) => state.empresaSeleccionada);
  console.log("empresa", empresa);

  const pushQuery = useQueryQueue((action) => {
    switch (action) {
      case "BajaUsuarioEmpresa": {
        return {
          config: {
            baseURL: "Seguridad",
            method: "PATCH",
            endpoint: `/UsuarioEmpresas/DarDeBaja`,
            body: {
              usuarioId: 0,
            },
          }
        };
      }
      
      default:
        break;
    }
  });

  //#region DesvincularUsuario
  const HandlerConfirmarDesvincularEmpresa = () => {
    if (!empresa.data.id) return;
    if (
      !window.confirm(
        `¿Confirma desvincular la empresa ${Formato.Cuit(
          empresa.data.cuit
        )} - ${empresa.data.razonSocial} del usuario ${usuario.cuit}?`
      )
    )
      return;

    pushQuery({
      action: "BajaUsuarioEmpresa",
      params: { id: empresa.data.id },
      onOk: async () => {},
      onError: async (err) =>
        alert(`Error al desvincular empresa:\n${err.toString()}`),
    });
  };
  //#endregion

  return (
    <Grid full col>
      <Grid className="titulo" marginBottom={3}>
        <h1>Desvincular usuario de Empresa</h1>
      </Grid>

      <Grid col full>
        
      </Grid>
    </Grid>
  );
}
export default DesvincularUsuarioEmpresasHandler;
