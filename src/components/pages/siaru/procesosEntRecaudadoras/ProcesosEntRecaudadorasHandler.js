import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import useQueryQueue from "components/hooks/useQueryQueue";
import modalCss from "components/ui/Modal/Modal.module.css";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";

const onCloseDef = () => {};
/**
 *
 * @param {object} props
 * @param {onCloseDef} props.onClose
 * @returns
 */

const ProcesosEntRecaudadorasHandler = (onClose, onCloseDef) => {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  const archivoRef = useRef(null);
  //   const [errors, setErrors] = React.useState({
  //     archivo: false,
  //   });
  const [modal, setModal] = useState();
  const [isBusy, setIsBusy] = useState(false);

  const dispatch = useDispatch();
  
  useEffect(() => {
    const actions = [];
    dispatch(handleModuloSeleccionar("SIARU", actions));
  }, [dispatch]);

  //#region configuraciones API
  const pushQuery = useQueryQueue((action, params) => {
    switch (action) {
      case "GetFormasPago": {
        return {
          config: {
            baseURL: "Comunes",
            endpoint: `/RefFormasPago`,
            method: "GET",
          },
        };
      }

      case "PostProcesoEntidadesRecaudadoras": {
        const { archivo, ...pars } = params;
        const data = new FormData();
        data.append("archivo", archivo.archivo, archivo.name);
        return {
          config: {
            baseURL: "SIARU",
            endpoint: `/ProcesosEntidadesRecaudadoras/ProcesarArchivo`,
            method: "POST",
            body: data,
            bodyToJSON: false,
            headers: { Accept: "*/*" },
            errorType: "text",
            okType: "blob",
          },
          params: pars,
        };
      }

      default:
        return null;
    }
  });
  //#endregion configuraciones API

  //#region formasPago
  const [formasPago, setFormasPago] = useState({
    reload: true,
    loading: null,
    data: [],
    error: null,
  });

  useEffect(() => {
    if (!formasPago.reload) return;
    const changes = {
      reload: false,
      loading: "Cargando formas de pago...",
      data: [],
      error: null,
    };
    setFormasPago((o) => ({ ...o, ...changes }));
    pushQuery({
      action: "GetFormasPago",
      onOk: async (data) => {
        changes.loading = null;
        if (Array.isArray(data)) {
          changes.data = data;
        } else {
          console.error("Se esperaba un arreglo.", { data });
        }
      },
      onError: async (error) => {
        changes.loading = null;
        changes.error = error.toString();
      },
      onFinally: async () => setFormasPago((o) => ({ ...o, ...changes })),
    });
  }, [formasPago, pushQuery]);
  //#endregion FormasPago

  //#endregion dependencias

  //#region select formaPago
  const [formaPagoSelect, setFormaPagoSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    options: [],
    selected: { value: 0, label: "", data: null },
    error: null,
    autocomplete: { open: true },
  });

  // Inicio
  useEffect(() => {
    if (formasPago.reload || formasPago.loading) return;
    if (!formaPagoSelect.loading) return;
    const data = formasPago.data.map((r) => ({
      value: r.id,
      label: r.descripcion,
    }));
    const changes = {
      loading: null,
      buscar: "",
      data,
      options: data,
      selected: { value: 0, label: "" },
      error: formasPago.error,
    };
    console.log("cambio select", changes);
    setFormaPagoSelect((o) => ({ ...o, ...changes }));
  }, [formasPago, formaPagoSelect]);

  //   // Buscador
  //   useEffect(() => {
  //     if (formaPagoSelect.loading) return;
  //     const options = formaPagoSelect.data.filter((r) =>
  //       formaPagoSelect.buscar !== ""
  //         ? r.label.toLowerCase().includes(formaPagoSelect.buscar.toLowerCase())
  //         : true
  //     );
  //     setFormaPagoSelect((o) => ({ ...o, options }));
  //   }, [formaPagoSelect.loading, formaPagoSelect.data, formaPagoSelect.buscar]);
  //#endregion select formaPago

  const [formaPago, setFormaPago] = useState(0);

  //#region archivo
  const [archivoSeleccionado, setArchivoSeleccionado] = useState({
    archivo: null,
    nombreArchivo: null,
    contentType: null,
  });

  useEffect(() => {
    if (archivoSeleccionado.archivo == null) return;
  }, [archivoSeleccionado]);

  //#endregion

  let contenido = null;
  if (formasPago.loading || formaPago.loading) {
    contenido = <text>Cargando...</text>;
  } else if (formaPago.data == null) {
    contenido = (
      <Grid width col>
        <SearchSelectMaterial
          onKeyDown={(e) => {e.preventDefault();}}
          label="Forma de pago"
          error={!!formaPagoSelect.error}
          helperText={formaPagoSelect.loading ?? formaPagoSelect.error ?? ""}
          value={formaPagoSelect.selected}
          onChange={(selected) => {
            setFormaPago(selected.value);
            setFormaPagoSelect((o) => ({
              ...o,
              selected,
              autocomplete: { open: !selected.value },
            }));
          }}
          options={formaPagoSelect.options}
          defaultOption={{ label: "", value: 0 }}
          onTextChange={(buscar) =>
            setFormaPagoSelect((o) => ({ ...o, buscar }))
          }
          required
          autocompleteProps={formaPagoSelect.autocomplete}
        />
        {formaPagoSelect.error == null ? null : (
          <text style={{ color: "red" }}>{formaPagoSelect.error}</text>
        )}
      </Grid>
    );
  }

  return (
    <Grid col height="100vh" gap="10px">
      <Grid className="titulo" width="full">
        <h1>Sistema de Aportes Rurales</h1>
      </Grid>
      <Grid className="contenido" width="full" grow>
        <Grid col gap="5px">
          {contenido}
          {modal}
          {formaPago == 0 ? null : (
            <input
              ref={archivoRef}
              type="file"
              accept=".txt"
              disabled={isBusy}
              onChange={(e) => {
                if (e.target.files.length === 0) return;
                const archivo = e.target.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(archivo);
                reader.onload = () => {
                  setArchivoSeleccionado({
                    archivo,
                    nombreArchivo: archivo.name,
                    contentType: archivo.type,
                  });
                };
              }}
              onClick={(e) => {
                e.target.value = null;
              }}
            />
          )}
          <Grid gap="20px" justify="end">
            <Grid width="250px">
              {archivoSeleccionado.nombreArchivo == null ? null : (
                <Button
                  className="botonAmarillo"
                  disabled={(formaPagoSelect.selected?.value ?? 0) === 0 || isBusy}
                  loading={formaPago.loading}
                  onClick={() => {
                    setIsBusy(!isBusy);
                    pushQuery({
                      action: "PostProcesoEntidadesRecaudadoras",
                      params: {
                        formaPagoId: formaPago,
                        archivo: archivoSeleccionado,
                      },
                      onOk: async (data) => {
                        const blob = data;
                        const urlBlob = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = urlBlob;
                        a.download = archivoSeleccionado.nombreArchivo;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(urlBlob);
                      },
                      onError: async (error) => {
                        setModal(
                          <Modal size="lg" centered show>
                            <Modal.Header
                              className={modalCss.modalCabecera}
                              closeButton
                            />
                            <Modal.Body>
                              <Grid width="full" justify="center">
                                <h4>{error}</h4>
                              </Grid>
                            </Modal.Body>
                            <Modal.Footer>
                              <Grid gap="20px">
                                <Grid width="150px">
                                  <Button
                                    className="botonAmarillo"
                                    onClick={() => setModal(null)}
                                  >
                                    ACEPTA
                                  </Button>
                                </Grid>
                              </Grid>
                            </Modal.Footer>
                          </Modal>
                        );
                      },
                      onFinally: async () => setIsBusy(false),
                    });
                  }}
                >
                  PROCESA
                </Button>
              )}
            </Grid>
            {/* <Grid width="150px">
          <Button className="botonAmarillo" onClick={() => onClose()}>
            FINALIZA
          </Button>
        </Grid> */}
          </Grid>
          {formaPago.error == null ? null : (
            <text style={{ color: "red" }}>{formaPago.error}</text>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProcesosEntRecaudadorasHandler;
