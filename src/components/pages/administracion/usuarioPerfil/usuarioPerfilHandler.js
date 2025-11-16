import { Grid } from "@mui/material";
import useQueryQueue from "components/hooks/useQueryQueue";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleUsuarioLogueado, handleUsuarioPerfil } from "redux/actions";
import UsuarioPerfil from "./usuarioPerfilForm";

const UsuarioPerfilHandler = () => {
  const usuarioLogueado = useSelector((state) => state.usuarioLogueado);
  // console.log("usuarioLogueado", usuarioLogueado);
  const [usuario, setUsuario] = useState({
    ...usuarioLogueado,
  });
  const [hasErrors, setHasErrors] = useState(false);
  const [errorAPI, setErrorAPI] = useState(null);
  const dispatch = useDispatch();

  //#region  Inicio

  const pushQuery = useQueryQueue((action) => {
    switch (action) {
      case "UpdateUsuario": {   
        return {
          config: {
            baseURL: "Seguridad",
            endpoint: `/Usuario`,
            method: "PATCH",
          },
        };
      }
      default:
        return null;
    }
  });
  //#endregion

  //#region  handlersEventos

  useEffect(() => {
    setErrorAPI(null);
    if (usuario.nombre === "" || usuario.cuit === "") {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [usuario]);

  const onChange = (data) => {
    setUsuario((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handlerActualiza = () => {
    // console.log("HandlerFinaliza", usuario);
    pushQuery({
      action: "UpdateUsuario",
      config: {
        body: { ...usuario },
      },
      onOk: () => {
        setErrorAPI(false);
        dispatch(handleUsuarioLogueado(usuario));
        dispatch(handleUsuarioPerfil({ show: false }));
      },
      onError: (error) => {
        console.error("Error al actualizar usuario:", error);
        setErrorAPI(true);
      },
    });
  };

  //#endregion

  // let resultadoActualizaRender = null;
  // if (errorAPI !== null) {
  //   if (errorAPI) {
  //     resultadoActualizaRender = (
  //       <Grid width="full" style={{ color: "red" }}>
  //         Error al actualizar los datos del usuario. Por favor, verifique los
  //         campos.
  //       </Grid>
  //     );
  //   } else if (!errorAPI) {
  //     resultadoActualizaRender = (
  //       <Grid width="full" style={{ color: "green" }}>
  //         Los datos del usuario se actualizaron correctamente.
  //       </Grid>
  //     );
  //   }
  // }

  return (
    <UsuarioPerfil
      usuario={usuario}
      errorAPI={errorAPI}
      hasErrors={hasErrors}      
      onChange={onChange}
      onCancela={() => dispatch(handleUsuarioPerfil({ show: false }))}
      onActualiza={handlerActualiza}
      />
  );
};

export default UsuarioPerfilHandler;
