import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UsuarioEmpresas from "./usuarioEmpresasForm";
import { useNavigate } from "react-router-dom";
import useQueryQueue from "components/hooks/useQueryQueue";
import { handleEmpresaSeleccionar } from "redux/actions";

function UsuarioEmpresasHandler(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [usuarios, setUsuarios] = useState();
  const [selectedUsuario, setSelectedUsuario] = useState({
    id: "",
    usuarioEmpresaId: "",
    label: "",
    motivo: "",
  });

  const empresa = useSelector((state) => state.empresa);
  const usuarioLogueado = useSelector((state) => state.usuarioLogueado);

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
    if (!empresa?.id) return;

    pushQuery({
      action: "GetUsuarios",
      params: { empresaId: empresa.id, soloActivos: true },
      onOk: (data) => {        
        if (data.length === 0) return;
        const usuariosMapeados = data.map((usuario) => ({
          id: usuario.usuarioId,
          label: usuario.usuarioNombre,
          usuarioEmpresaId: usuario.id,
          motivo: "",
        }));
        // console.log("usuariosMapeados", usuariosMapeados);
        setUsuarios(usuariosMapeados);
        const usuarioActual = data.find(
          (usuario) => usuario.usuarioId === usuarioLogueado.id
        );
        if (!usuarioActual) {
          return;
        }
        setSelectedUsuario((prev) => ({
          ...prev,
          id: usuarioActual.usuarioId,
          label: usuarioLogueado.nombre,
          usuarioEmpresaId: usuarioActual?.id || "",
        }));
      },
      onError: (err) => alert(`Error al cargar usuarios:\n${err.toString()}`),
    });
  }, [empresa]);

  //#endregion

  const onChange = (value) => {
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
        dispatch(handleEmpresaSeleccionar(null));
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
    // <Grid full col>
    //   <Grid className="titulo" marginBottom={3}>
    //     <h1>Desvincular usuario de Empresa</h1>
    //   </Grid>
      <UsuarioEmpresas
        show={props.show}
        title={props.title}
        data={usuarios}
        selectedUsuario={selectedUsuario}
        onMotivoChange={HandlerMotivoChange}
        onDesvincula={HandlerConfirmarDesvincularEmpresa}
        onChange={onChange}
        onCancela={props.onClose}
      />
    // </Grid>
  );
}

export default UsuarioEmpresasHandler;
