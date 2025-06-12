import { Grid } from "@mui/material";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import UsuarioEmpresas from "./usuarioEmpresas";

function DesvincularUsuarioEmpresasHandler() {
  const [usuarios, setUsuarios] = useState();
  const [selectedUsuario, setSelectedUsuario] = useState({
    id: "",
  });

  const empresa = useSelector((state) => state.empresa);
  console.log("data", usuarios);

  const pushQuery = useQueryQueue((action) => {
    switch (action) {
      case "GetUsuarios": {
        return {
          config: {
            baseURL: "Seguridad",
            method: "GET",
            endpoint: `/UsuarioEmpresas/ByEmpresaId`,
            params: {
              empresaId: empresa.id,
            },
          },
          onOk: (data) => {
            const usuariosMapeados = data.map((usuario) => ({
              id: usuario.id,
              nombre: Formato.nombreCompleto(usuario),
              email: usuario.email,
              telefono: usuario.telefono,
            }));
            setUsuarios(usuariosMapeados);
          },
        };
      }

      case "BajaUsuarioEmpresa": {
        return {
          config: {
            baseURL: "Seguridad",
            method: "PATCH",
            endpoint: `/UsuarioEmpresas/DarDeBaja`,
            body: {
              usuarioId: selectedUsuario.id,
            },
          },
        };
      }

      default:
        break;
    }
  });

  //#region carga inicial

  useEffect(() => {
    pushQuery(
      {
        action: "GetUsuarios",
        onOk: (data) => {
          setUsuarios(data);
        },
        onError: (err) => alert(`Error al cargar usuarios:\n${err.toString()}`),
      },
    );
  }, []);

  //#endregion

  const onChange = (value) => {
    console.log("onChange", value);
    setSelectedUsuario(value);
  };

  //#region DesvincularUsuario
  const HandlerConfirmarDesvincularEmpresa = () => {
    if (!selectedUsuario?.id) return;

    pushQuery({
      action: "BajaUsuarioEmpresa",
      params: { id: selectedUsuario?.id },
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
      <UsuarioEmpresas
        data={usuarios}
        onDesvincula={HandlerConfirmarDesvincularEmpresa}
        onChange={onChange}
      />
    </Grid>
  );
}

export default DesvincularUsuarioEmpresasHandler;
