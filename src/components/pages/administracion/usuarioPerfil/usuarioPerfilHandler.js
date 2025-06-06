import { Grid } from "@mui/material";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleUsuarioLogueado } from "redux/actions";

function UsuarioPerfilHandler() {
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
            body: { ...usuario },
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

  const handlerOnOK = () => {
    // console.log("Usuario actualizado correctamente");
    setErrorAPI(false);
    dispatch(handleUsuarioLogueado(usuario));
  }

  const HandlerFinaliza = () => {
    // console.log("HandlerFinaliza", usuario);
    pushQuery({
      action: "UpdateUsuario",
      onOk: handlerOnOK,
      onError: (error) => {
        console.error("Error al actualizar usuario:", error);
        setErrorAPI(true);
      },
    });
  };

  //#endregion

  let resultadoActualizaRender = null;
  if (errorAPI !== null) {
    if (errorAPI) {
      resultadoActualizaRender = (
        <Grid width="full" style={{ color: "red" }}>
          Error al actualizar los datos del usuario. Por favor, verifique los
          campos.
        </Grid>
      );
    } else if (!errorAPI) {
      resultadoActualizaRender = (
        <Grid width="full" style={{ color: "green" }}>
          Los datos del usuario se actualizaron correctamente.
        </Grid>
      );
    }
  }

  return (
    <Grid full col>
      <Grid className="titulo" marginBottom={3}>
        <h1>Datos de usuario</h1>
      </Grid>

      <Grid col full>
        {resultadoActualizaRender}
        <Grid width gap="30px">
          <Grid width="400px" marginBottom={3}>
            <InputMaterial
              required
              error={usuario.nombre === ""}
              label="Nombre"
              value={usuario.nombre}
              onChange={(nombre) => onChange({ nombre })}
            />
          </Grid>
          <Grid width="400px" marginBottom={3}>
            <InputMaterial
              required
              error={usuario.cuit == null || usuario.cuit === ""}
              label="CUIT"
              value={usuario.cuit}
              onChange={(cuit) => onChange({ cuit })}
            />
          </Grid>
          <Grid width="400px" marginBottom={3}>
            <InputMaterial
              error={usuario.phoneNumber == null || usuario.phoneNumber === ""}
              label="Teléfono"
              value={usuario.phoneNumber}
              onChange={(phoneNumber) => onChange({ phoneNumber })}
            />
          </Grid>
          <Grid width="400px" marginBottom={3}>
            <InputMaterial
              error={usuario.email == null || usuario.email === ""}
              label="Email"
              value={usuario.email}
              onChange={(email) => onChange({ email })}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid width="250px">
        <Button
          className="botonAmarillo"
          variant="contained"
          color="primary"
          disabled={hasErrors}
          onClick={HandlerFinaliza}
        >
          ACTUALIZA
        </Button>
      </Grid>
    </Grid>
  );
};

export default UsuarioPerfilHandler;
