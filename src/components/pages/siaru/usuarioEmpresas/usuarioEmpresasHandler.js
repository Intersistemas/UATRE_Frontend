import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import UsuarioEmpresas from "./usuarioEmpresasForm";
import { useNavigate } from "react-router-dom";
import useQueryQueue from "components/hooks/useQueryQueue";

function UsuarioEmpresasHandler() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState();
  const [selectedUsuario, setSelectedUsuario] = useState({
    id: "",
    usuarioEmpresaId: "",
    label: "",
    motivo: "",
  });

  const empresa = useSelector((state) => state.empresa);

  const pushQuery = useQueryQueue((action) => {
    switch (action) {
      case "GetUsuarios": {
        return {
          config: {
            baseURL: "Seguridad",
            method: "GET",
            endpoint: `/UsuarioEmpresas/ByEmpresaId`,
          },
        };
      }

      case "BajaUsuarioEmpresa": {
        // console.log("selected", config.body);
        return {
          config: {
            baseURL: "Seguridad",
            method: "PATCH",
            endpoint: `/UsuarioEmpresas/DarDeBaja`,
          },
        };
      }

      default:
        break;
    }
  });

  //#region carga inicial

  useEffect(() => {
    pushQuery({
      action: "GetUsuarios",
      params: { empresaId: empresa.id, soloActivos: true },
      onOk: (data) => {
        console.log("data", data);
        const usuariosMapeados = data.map((usuario) => ({
          id: usuario.usuarioId,
          label: usuario.usuarioNombre,
          usuarioEmpresaId: usuario.id,
          motivo: "",
        }));
        // console.log("usuariosMapeados", usuariosMapeados);
        setUsuarios(usuariosMapeados);
      },
      onError: (err) => alert(`Error al cargar usuarios:\n${err.toString()}`),
    });
  }, [empresa.id]);

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
      config: {
        body: {
          id: selectedUsuario.usuarioEmpresaId,
          deletedObs: selectedUsuario.motivo,
        },
      },
      onOk: () => {
        navigate(-1);
      },
      onError: async (err) =>
        alert(`Error al desvincular empresa:\n${err.toString()}`),
    });
  };

  const HandlerMotivoChange = (value) => {
    // console.log("HandlerMotivoChange", value);
    setSelectedUsuario((prev) => ({
      ...prev,
      motivo: value,
    }));
  };
  //#endregion

  // console.log("selectedUsuario", selectedUsuario);

  return (
    <Grid full col>
      <Grid className="titulo" marginBottom={3}>
        <h1>Desvincular usuario de Empresa</h1>
      </Grid>
      <UsuarioEmpresas
        data={usuarios}
        selectedUsuario={selectedUsuario}
        onMotivoChange={HandlerMotivoChange}
        onDesvincula={HandlerConfirmarDesvincularEmpresa}
        onChange={onChange}
        onCancela={() => navigate(-1)}
      />
    </Grid>
  );
}

export default UsuarioEmpresasHandler;
