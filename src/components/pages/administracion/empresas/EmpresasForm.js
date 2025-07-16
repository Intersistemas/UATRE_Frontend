import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import DatosArcaEmpresa from "./datosArca/DatosArcaEmpresa";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

/**
 * Proceso a ejecutar posterior carga
 * @param {object} changes datos posterior carga
 * @param {array} changes.data datos obtenidos en la carga
 * @param {object} changes.error error durante la carga
 */
const onLoadedDef = ({ data, error }) => {};

const CIIUSinAsignar = { value: null, label: "Sin Asignar" };
const getCIIULabel = (ciiu) =>
  [ciiu?.ciiu ?? "", ciiu?.descripcion ?? ""]
    .filter((r) => r !== null)
    .join(" - ");

const getCIIUOption = (ciiu) =>
  ciiu?.ciiu == null
    ? CIIUSinAsignar
    : {
        value: ciiu.ciiu,
        label: getCIIULabel(ciiu),
      };

const getProvinciaOption = (provincia) =>
  provincia
    ? {
        value: provincia.id,
        label: provincia.nombre,
      }
    : null;

const getLocalidadLabel = ({ nombre, codPostal }) =>
  [codPostal, nombre].filter((r) => r).join(" - ");

const getLocalidadOption = (localidad) =>
  localidad
    ? {
        value: localidad.id,
        label: getLocalidadLabel(localidad),
      }
    : null;

const EmpresasForm = ({
  data = {},
  title = "",
  disabled = {},
  hide = {},
  errors = {},
  onChange = onChangeDef,
  onClose = onCloseDef,
  loading = {},
}) => {
  data ??= {};
  disabled ??= {};
  hide ??= {};
  errors ??= {};
  onChange ??= onChangeDef;
  onClose ??= onCloseDef;

  //#region consultas API
  const pushQuery = useQueryQueue((action, params) => {
    switch (action) {
      case "GetEmpresa": {
        return {
          config: {
            baseURL: "Comunes",
            endpoint: "/Empresas/GetEmpresaSpecs",
            method: "GET",
          },
        };
      }
      case "GetCIIUs": {
        return {
          config: {
            baseURL: "Comunes",
            endpoint: "/RefCIIU",
            method: "GET",
          },
        };
      }

      case "ConsultaAFIP":
        return {
          config: {
            baseURL: "Comunes",
            endpoint: "/AFIPConsulta",
            method: "GET",
          },
        };

      case "GetProvincias":
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/Provincia`,
            method: "GET",
          },
        };
      case "GetLocalidades":
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/RefLocalidad`,
            method: "GET",
          },
        };

      case "EmpresasActualizarDatos":
        return {
          config: {
            baseURL: "Comunes",
            endpoint: `/Empresas/ActualizarDatos`,
            method: "PATCH",
          },
        };

      default:
        return null;
    }
  });
  //#endregion

  //#region Provincias
  const [provincias, setProvincias] = useState({
    loading: "Cargando provincias...",
    data: [], //TODAS LAS EMPRESAS
    options: [], //DEPENDE DEL CAMPO "BUSCAR", si tiene algo ese campo, voy filtrando las OPTIONS
    buscar: "",
    error: null,
    selected: getProvinciaOption({
      id: data.domicilioProvinciasId != 0 ? data.domicilioProvinciasId : 100025, // 100025 es el id de "Sin Asignar"
      nombre: data.provinciaDescripcion,
    }),
    onLoaded: onLoadedDef,
  });
  useEffect(() => {
    if (!provincias.loading) return;
    const changes = {
      loading: null,
      data: [],
      options: [],
      error: null,
      onLoaded: onLoadedDef,
    };
    pushQuery({
      action: "GetProvincias",
      onOk: async (data) => {
        if (!Array.isArray(data))
          return console.error("Se esperaba un arreglo", {
            GetProvincias: data,
          });
        changes.data = data.filter((r) => r.id !== 0);
        changes.options = data
          .filter((r) => r.id !== 0)
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .map((r) => getProvinciaOption(r)); //le doy formato al OPTION que voy a mostrar
      },
      onError: async (error) => (changes.error = error),
      onFinally: async () => {
        provincias.onLoaded(changes);
        setProvincias((o) => ({ ...o, ...changes }));
      },
    });
  }, [provincias, pushQuery]);

  // Cambia data, refresca select
  useEffect(() => {
    if (provincias.loading) return;
    const dataProvinciaId =
      data.domicilioProvinciasId === 0 ||
      data.domicilioProvinciasId === undefined
        ? 100025
        : data.domicilioProvinciasId;
    if (dataProvinciaId === provincias.selected.value) return;
    setProvincias((o) => ({
      ...o,
      selected: getProvinciaOption(
        o.data.find((r) => r.id === data.domicilioProvinciasId) ?? {
          id: dataProvinciaId,
          nombre: data.provinciaDescripcion ?? "",
        }
      ),
    }));
  }, [provincias, data.domicilioProvinciasId, data.provinciaDescripcion]);
  //#endregion

  //#region Localidades
  const [localidades, setLocalidades] = useState({
    loading: "Cargando localidades...",
    params: { provinciaId: data?.domicilioProvinciasId ?? 100025 }, // 100025 es el id de "Sin Asignar"
    data: [], //TODAS LAS localidades de la provincia
    options: [], //DEPENDE DEL CAMPO "BUSCAR", si tiene algo ese campo, voy filtrando las OPTIONS
    buscar: "",
    error: null,
    selected: getLocalidadOption({
      id: data.domicilioLocalidadesId ?? 0,
      nombre: data.localidadDescripcion ?? "",
    }),
    onLoaded: onLoadedDef,
  });
  useEffect(() => {
    if (!localidades.loading) return;

    const changes = {
      loading: null,
      data: [],
      options: [],
      error: null,
      onLoaded: onLoadedDef,
    };
    pushQuery({
      action: "GetLocalidades",
      params: { ...localidades.params, SoloActivos: true },
      onOk: async (data) => {
        if (!Array.isArray(data))
          return console.error("Se esperaba un arreglo", {
            GetLocalidades: data,
          });
        changes.data = data;
        changes.options = data.map((r) => getLocalidadOption(r)); //le doy formato al OPTION que voy a mostrar
      },
      onError: async (error) => (changes.error = error),
      onFinally: async () => {
        localidades.onLoaded(changes);
        setLocalidades((o) => ({ ...o, ...changes }));
      },
    });
  }, [localidades, pushQuery]);
  // Cambia data, refresca select
  useEffect(() => {
    if (localidades.loading) return;

    if (
      (data.domicilioLocalidadesId ?? 0) === (localidades.selected.value ?? 0)
    )
      return;
    setLocalidades((o) => ({
      ...o,
      selected: getLocalidadOption(
        o.data.find((r) => r.id === data.domicilioLocalidadesId) ?? {
          id: data.domicilioLocalidadesId ?? 0,
          nombre: data.localidadDescripcion ?? "",
        }
      ),
    }));
  }, [localidades, data.domicilioLocalidadesId, data.localidadDescripcion]);
  //#endregion

  //#region declaracion y carga de actividades
  const [ciius, setCIIUs] = useState({
    loading: "Cargando actividades...",
    data: [],
    options: [],
    error: null,
  });

  useEffect(() => {
    if (!ciius.loading) return;

    const changes = {
      loading: null,
      data: [],
      options: [],
      error: null,
    };
    pushQuery({
      action: "GetCIIUs",
      onOk: async (data) => {
        if (!Array.isArray(data))
          return console.error("Se esperaba un arreglo", { GetCIIUs: data });
        data.unshift({
          ciiu: CIIUSinAsignar.value,
          descripcion: CIIUSinAsignar.label,
        });
        changes.data = data.filter(
          (v, i, a) => a.indexOf(a.find((r) => r.ciiu === v.ciiu)) === i
        );
        changes.options = data.map((ciiu) => getCIIUOption(ciiu));
      },
      onError: async (error) => (changes.error = error),
      onFinally: async () => setCIIUs((o) => ({ ...o, ...changes })),
    });
  }, [ciius, pushQuery]);
  //#endregion

  //#region Buscar Actividades

  //#region Actividad Ppal.
  const [actividadPrincipal, setActividadPrincipal] = useState({
    buscar: "",
    options: [],
    selected: getCIIUOption({
      ciiu: data?.actividadPrincipalId,
      descripcion: data?.actividadPrincipalDescripcion,
    }),
  });
  // Buscador
  useEffect(() => {
    if (ciius.loading) return;

    const options = ciius.data
      .filter((r) =>
        actividadPrincipal.buscar !== ""
          ? getCIIULabel(r)
              .toLowerCase()
              .includes(actividadPrincipal.buscar.toLowerCase())
          : true
      )
      .map((r) => getCIIUOption(r));
    setActividadPrincipal((o) => ({ ...o, options }));
  }, [ciius, actividadPrincipal.buscar]);
  // Cambia data, refresca select
  useEffect(() => {
    if (ciius.loading) return;

    setActividadPrincipal((o) => ({
      ...o,
      selected: getCIIUOption(
        ciius.data.find((r) => r.ciiu === data.actividadPrincipalId)
      ),
    }));
  }, [ciius, data.actividadPrincipalId, data.actividadPrincipalDescripcion]);
  //#endregion

  //#region ciiU1.
  const [ciiu1, setCIIU1] = useState({
    buscar: "",
    options: [],
    selected: getCIIUOption({
      ciiu: data?.ciiU1,
      descripcion: data?.ciiU1Descripcion,
    }),
  });

  // Buscador
  useEffect(() => {
    if (ciius.loading) return;

    const options = ciius.data
      .filter((r) =>
        ciiu1.buscar !== ""
          ? getCIIULabel(r).toLowerCase().includes(ciiu1.buscar.toLowerCase())
          : true
      )
      .map((r) => getCIIUOption(r));
    setCIIU1((o) => ({ ...o, options }));
  }, [ciius, ciiu1.buscar]);

  // Cambia data, refresca select
  useEffect(() => {
    if (ciius.loading) return;

    setCIIU1((o) => ({
      ...o,
      selected: getCIIUOption(ciius.data.find((r) => r.ciiu === data.ciiU1)),
    }));
  }, [ciius, data.ciiU1, data.ciiU1Descripcion]);
  //#endregion

  //#region ciiU2.
  const [ciiu2, setCIIU2] = useState({
    buscar: "",
    options: [],
    selected: getCIIUOption({
      ciiu: data?.ciiU2,
      descripcion: data?.ciiU2Descripcion,
    }),
  });
  // Buscador
  useEffect(() => {
    if (ciius.loading) return;

    const options = ciius.data
      .filter((r) =>
        ciiu2.buscar !== ""
          ? getCIIULabel(r).toLowerCase().includes(ciiu2.buscar.toLowerCase())
          : true
      )
      .map((r) => getCIIUOption(r));
    setCIIU2((o) => ({ ...o, options }));
  }, [ciius, ciiu2.buscar]);

  // Cambia data, refresca select
  useEffect(() => {
    if (ciius.loading) return;

    setCIIU2((o) => ({
      ...o,
      selected: getCIIUOption(ciius.data.find((r) => r.ciiu === data.ciiU2)),
    }));
  }, [ciius, data.ciiU2, data.ciiU2Descripcion]);
  //#endregion

  //#region ciiU3.
  const [ciiu3, setCIIU3] = useState({
    buscar: "",
    options: [],
    selected: getCIIUOption({
      ciiu: data?.ciiU3,
      descripcion: data?.ciiU3Descripcion,
    }),
  });
  // Buscador
  useEffect(() => {
    if (ciius.loading) return;

    const options = ciius.data
      .filter((r) =>
        ciiu3.buscar !== ""
          ? getCIIULabel(r).toLowerCase().includes(ciiu3.buscar.toLowerCase())
          : true
      )
      .map((r) => getCIIUOption(r));
    setCIIU3((o) => ({ ...o, options }));
  }, [ciius, ciiu3.buscar]);

  // Cambia data, refresca select
  useEffect(() => {
    if (ciius.loading) return;

    setCIIU3((o) => ({
      ...o,
      selected: getCIIUOption(ciius.data.find((r) => r.ciiu === data.ciiU3)),
    }));
  }, [ciius, data.ciiU3, data.ciiU3Descripcion]);
  //#endregion

  //#endregion

  useEffect(() => {
    const changes = {};
    if (data.telefono == null) changes.telefono = "+54 9";
    if (Object.entries(changes).length === 0) return;
    onChange(changes);
  }, [onChange, data]);

  const [validacionCUIT, setValidacionCUIT] = useState({
    loading: false,
    validado: "",
    datoAFIP: "",
  });

  const validarEmpresaCUITHandler = () => {
    const changes = {
      loading: true,
      validado: "",
      datoAFIP: "",
    };
    setValidacionCUIT((o) => ({ ...o, ...changes }));

    errors.cuit = "";
    // onChange({
    //   existe: false,
    //   razonSocial: null,
    //   actividadPrincipalId: null,
    //   domicilioCalle: null,
    //   domicilioNumero: null,
    //   domicilioPiso: null,
    //   domicilioDpto: null,
    //   telefono: null,
    //   email: null,
    //   email2: null,
    //   ciiU1: null,
    //   ciiU2: null,
    //   ciiU3: null,
    // });

    const validaAFIP = () => {
      pushQuery({
        action: "ConsultaAFIP",
        params: { cuit: data.cuit, VerificarHistorico: false },
        onOk: async (ok) => {
          console.log("ConsultaAFIP ok:", ok);
          if (!data.id) {
            changes.validado = "Se creará la Empresa";

            const provincia = provincias.data.find(
              (p) => p.idProvinciaAFIP === ok?.domicilios[0]?.idProvincia
            );

            onChange({
              existe: true,
              cuit: ok.cuit,
              razonSocial: ok.razonSocial ?? `${ok?.nombre} ${ok?.apellido}` ?? "" ,

              actividadPrincipalId: ok.idActividadPrincipal,
              actividadPrincipalDescripcion: ok.descripcionActividadPrincipal,

              domicilioCalle: ok.domicilios[0].direccion ?? "",
              domicilioNumero: ok.domicilios[0].numero ?? "",
              domicilioPiso: ok.domicilios[0].piso ?? "",
              domicilioDpto: ok.domicilios[0].oficinaDptoLocal ?? "",
              telefono: ok.telefono ?? "",
              email: ok.email ?? "",
              email2: ok.email2 ?? "",

              ciiU1: ok.ciiU1,
              ciiU1Descripcion: ok.ciiU1Descripcion,

              ciiU2: ok.ciiU2,
              ciiU2Descripcion: ok.ciiU2Descripcion,

              ciiU3: ok.ciiU3,
              ciiU3Descripcion: ok.ciiU3Descripcion,
            });
            setLocalidades((o) => ({
              ...o,
              params: { provinciaId: provincia?.id },
              loading: "Cargando localidades...",
              onLoaded: ({ data }) => {
                const localidad = data.find(
                  (r) => r.id === data.domicilioLocalidadesId
                );
                const changes = {
                  domicilioProvinciasId: provincia?.id,
                  provinciaDescripcion: provincia?.nombre,
                };
                if (!localidad) {
                  changes.domicilioLocalidadesId = 0;
                  changes.localidadDescripcion = "";
                }
                onChange(changes);
              },
            }));
          } else {
            onChange({ datosArca: ok });
          }
          changes.datoAFIP = `Dato AFIP:  ${ok.domicilios[0]?.codigoPostal} ${ok.domicilios[0]?.localidad}`;
        },
        onFinally: async () => {
          changes.loading = false;
          setValidacionCUIT((o) => ({ ...o, ...changes }));
        },
      });
    };

    pushQuery({
      action: "GetEmpresa",
      params: { cuit: data.cuit, soloActivos: true },
      onOk: async (ok) => {
        changes.validado = "Empresa existente (UATRE)";
        changes.datoAFIP = "";

        onChange({
          existe: true,
          // cuit: ok.cuit,
          // razonSocial: ok.razonSocial ?? "",
          // actividadPrincipalId: ok.actividadPrincipalId,
          // domicilioCalle: ok.domicilioCalle ?? "",
          // domicilioNumero: ok.domicilioNro ?? "",
          // domicilioPiso: ok.domicilioPiso ?? "",
          // domicilioDpto: ok.domicilioDpto ?? "",

          // domicilioProvinciasId:
          //   ok.domicilioProvinciasId ??
          //   provincias.data.find((p) => "Sin Asignar".includes(p.nombre))?.id ??
          //   100025, // 100025 es el id de "Sin Asignar"
          // provinciaDescripcion: ok.provinciaDescripcion ?? "",

          // domicilioLocalidadesId: ok.domicilioLocalidadesId ?? 0,
          // localidadDescripcion: ok.localidadDescripcion ?? "",

          // telefono: ok.telefono ?? "",
          // email: ok.email ?? "",
          // email2: ok.email2 ?? "",

          // ciiU1: ok.ciiU1,
          // ciiU1Descripcion: ok.ciiU1Descripcion,

          // ciiU2: ok.ciiU2,
          // ciiU2Descripcion: ok.ciiU2Descripcion,

          // ciiU3: ok.ciiU3,
          // ciiU3Descripcion: ok.ciiU3Descripcion,
        });

        validaAFIP();
      },
      onError: async (error) => validaAFIP(),
      onFinally: async () => {
        changes.loading = false;
        setValidacionCUIT((o) => ({ ...o, ...changes }));
      },
    });
  };
  //#endregion

  //#region Actualiza datos empresa
  const handleActualizaDatosEmpresa = (datosArca) => {
    if (!datosArca) {
      return;
    }

    const domicilioFiscal = data?.datosArca?.domicilios.find(
      (d) => d.tipoDomicilio === "FISCAL"
    );

    const ciiu1 = {
      ciiu: datosArca.ciiU1,
      descripcion: datosArca.ciiU1Descripcion,
    };

    const ciiu2 = {
      ciiu: datosArca.ciiU2,
      descripcion: datosArca.ciiU2Descripcion,
    };

    const ciiu3 = {
      ciiu: datosArca.ciiU3,
      descripcion: datosArca.ciiU3Descripcion,
    };

    const actividadPrincipal = {
      ciiu: datosArca.idActividadPrincipal,
      descripcion: datosArca.descripcionActividadPrincipal,
    };

    pushQuery({
      action: "EmpresasActualizarDatos",
      config: {
        body: {
          id: data.id,
          actividadPrincipalId: actividadPrincipal.ciiu,
          ciiU1: ciiu1.ciiu,
          ciiU2: ciiu2.ciiu,
          ciiU3: ciiu3.ciiu,
          domicilioCalle: domicilioFiscal.calle ?? data.domicilioCalle,
          domicilioNumero: domicilioFiscal.numero ?? data.domicilioNumero,
          domicilioPiso: domicilioFiscal.piso ?? data.domicilioPiso,
          domicilioDpto: domicilioFiscal.oficinaDptoLocal ?? data.domicilioDpto,
        },
      },
      onOk: async () => {
        onChange({
          ciiU1: ciiu1.ciiu,
          ciiU1Descripcion: ciiu1.descripcion,
          ciiU2: ciiu2.ciiu,
          ciiU2Descripcion: ciiu2.descripcion,
          ciiU3: ciiu3.ciiu,
          ciiU3Descripcion: ciiu3.descripcion,
          actividadPrincipal: actividadPrincipal.ciiu,
          actividadPrincipalDescripcion: actividadPrincipal.descripcion,
          domicilioCalle: domicilioFiscal.calle ?? data.domicilioCalle,
          domicilioNumero:
            domicilioFiscal.numero ?? data.domicilioNumero,
          domicilioPiso:
            domicilioFiscal.piso ?? data.domicilioPiso ?? "",
          domicilioDpto:
            domicilioFiscal.oficinaDptoLocal ?? data.domicilioDpto ?? "",
        });
      },
      onError: async (error) =>
        alert("Error al actualizar los datos de la empresa: " + error),
    });
  };

  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => onClose(true), "AltKey");

  // console.log("arca", data?.datosArca);
  return (
    <Modal show /*onHide={() => onClose()}*/ size="lg" centered>
      <Modal.Header className={modalCss.modalCabecera} closeButton>
        <h3>{title}</h3>
      </Modal.Header>
      <Modal.Body>
        <Grid col width="full" gap="15px">
          <Grid width="full" gap="inherit">
            <Grid width="270px">
              <Grid width="full">
                <InputMaterial
                  id="cuitEmpresa"
                  label="CUIT"
                  //mask="99-99.999.999-9"
                  mask={CUITMask}
                  required
                  error={!!errors.cuit}
                  helperText={
                    errors.cuit ? errors.cuit : validacionCUIT.validado
                  }
                  value={data.cuit}
                  disabled={disabled.cuit}
                  onChange={(value, _id) =>
                    onChange({ cuit: value.replace(/[^0-9]+/g, "") })
                  }
                />
              </Grid>
              <Grid col width="30%">
                <Button
                  className="botonAzul"
                  disabled={`${data.cuit ?? ""}`.length !== 11 || errors.cuit || data?.datosArca !== undefined }
                  onClick={validarEmpresaCUITHandler}
                  loading={validacionCUIT.loading}
                >
                  <h6>{!validacionCUIT.loading ? `Valida` : ` `}</h6>
                </Button>
              </Grid>
            </Grid>
            <Grid grow>
              <InputMaterial
                required
                id="razonSocial"
                label="Razon Social"
                error={!!errors.razonSocial}
                helperText={errors.razonSocial ?? ""}
                value={data.razonSocial}
                disabled={
                  disabled.razonSocial || validacionCUIT.validado === ""
                }
                onChange={(razonSocial) => onChange({ razonSocial })}
              />
            </Grid>
          </Grid>
          <Grid width="full" gap="inherit">
            <Grid width="full">
              <InputMaterial
                required
                id="domicilioCalle"
                label="Dirección - Calle"
                error={!!errors.domicilioCalle}
                helperText={errors.domicilioCalle ?? ""}
                value={data.domicilioCalle}
                disabled={
                  disabled.domicilioCalle || validacionCUIT.validado === ""
                }
                onChange={(domicilioCalle) => onChange({ domicilioCalle })}
              />
            </Grid>
            <Grid width="full" gap="inherit">
              <InputMaterial
                required
                id="domicilioNumero"
                label="Dir. - Nro."
                error={!!errors.domicilioNumero}
                helperText={errors.domicilioNumero ?? ""}
                value={data.domicilioNumero}
                disabled={
                  disabled.domicilioNumero || validacionCUIT.validado === ""
                }
                onChange={(domicilioNumero) => onChange({ domicilioNumero })}
              />
              <InputMaterial
                id="domicilioPiso"
                label="Dir. - Piso"
                error={!!errors.domicilioPiso}
                helperText={errors.domicilioPiso ?? ""}
                value={data.domicilioPiso}
                disabled={
                  disabled.domicilioPiso || validacionCUIT.validado === ""
                }
                onChange={(domicilioPiso) => onChange({ domicilioPiso })}
              />
              <InputMaterial
                id="domicilioDpto"
                label="Dir. - Dpto."
                error={!!errors.domicilioDpto}
                helperText={errors.domicilioDpto ?? ""}
                value={data.domicilioDpto}
                disabled={
                  disabled.domicilioDpto || validacionCUIT.validado === ""
                }
                onChange={(domicilioDpto) => onChange({ domicilioDpto })}
              />
            </Grid>
          </Grid>

          <Grid width gap="inherit">
            <Grid col width>
              <SearchSelectMaterial
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                id="domicilioProvinciasId"
                name="domicilioProvinciasId"
                label="Provincia"
                error={!!errors.domicilioProvinciasId}
                helperText={errors.domicilioProvinciasId ?? ""}
                value={provincias.selected}
                disabled={
                  disabled.domicilioProvinciasId ||
                  validacionCUIT.validado === ""
                }
                onChange={({ value, label }) => {
                  if (value === data.domicilioProvinciasId) return;
                  setLocalidades((o) => ({
                    ...o,
                    loading: "Cargando localidades...",
                    params: { provinciaId: value },
                    onLoaded: ({ data }) => {
                      const localidad = data.find(
                        (r) => r.id === data.domicilioLocalidadesId
                      );
                      const changes = {
                        domicilioProvinciasId: value,
                        provinciaNombre: label,
                      };
                      if (!localidad) {
                        changes.domicilioLocalidadesId = 0;
                        changes.localidadDescripcion = "";
                      }
                      onChange(changes);
                    },
                  })); //hago esto para que me filtre las localidades de la provincia seleccionada.
                }}
                options={provincias.options}
                onTextChange={(buscar) =>
                  setProvincias((o) => ({ ...o, buscar }))
                }
                required
              />
            </Grid>

            <Grid width>
              <SearchSelectMaterial
                freeSolo={false}
                id="domicilioLocalidadesId"
                name="domicilioLocalidadesId"
                label="Localidad"
                error={!!errors.domicilioLocalidadesId}
                helperText={[
                  errors.domicilioLocalidadesId,
                  validacionCUIT.datoAFIP,
                ]
                  .filter((r) => r)
                  .join("\n")}
                value={localidades.selected}
                disabled={
                  disabled.domicilioLocalidadesId ||
                  validacionCUIT.validado === ""
                }
                onChange={({ value, label }) => {
                  if (value === data.domicilioLocalidadesId) return;
                  console.log("onChange localidad", { value, label });
                  onChange({
                    domicilioLocalidadesId: value,
                    localidadNombre: label,
                  });
                }}
                options={localidades.options}
                onTextChange={(buscar) =>
                  setLocalidades((o) => ({ ...o, buscar }))
                }
                required
              />
            </Grid>
            <Grid width>
              <InputMaterial
                required
                id="telefono"
                label="Teléfono"
                type="tel"
                error={!!errors.telefono}
                helperText={errors.telefono ?? ""}
                value={data.telefono}
                disabled={disabled.telefono || validacionCUIT.validado === ""}
                onChange={(telefono) => onChange({ telefono })}
              />
            </Grid>
          </Grid>
          <Grid width="full" gap="inherit">
            <Grid width>
              <InputMaterial
                required
                id="email"
                name="email"
                label="Email"
                error={!!errors.email}
                helperText={errors.email ?? ""}
                value={data.email}
                disabled={disabled.email || validacionCUIT.validado === ""}
                onChange={(email) => onChange({ email })}
              />
            </Grid>
            <Grid width>
              <InputMaterial
                id="email2"
                name="email2"
                label="Email Secundario"
                error={!!errors.email2}
                helperText={errors.email2 ?? ""}
                value={data.email2}
                disabled={disabled.email2 || validacionCUIT.validado === ""}
                onChange={(email2) => onChange({ email2 })}
              />
            </Grid>
          </Grid>
          <Grid width="full" gap="inherit">
            <Grid width="full">
              <SearchSelectMaterial
                id="actividadPrincipalId"
                name="actividadPrincipalId"
                label="Actividad"
                error={!!errors.actividadPrincipalId}
                helperText={
                  ciius.loading ??
                  ciius.error?.message ??
                  errors.actividadPrincipalId ??
                  ""
                }
                value={actividadPrincipal.selected}
                disabled={
                  disabled.actividadPrincipalId ||
                  validacionCUIT.validado === ""
                }
                onChange={({ value }) => {
                  const ciiu = ciius.data.find((r) => r.ciiu === value);
                  onChange({
                    actividadPrincipalId: ciiu.ciiu,
                    actividadPrincipalDescripcion: ciiu.descripcion,
                  });
                }}
                options={actividadPrincipal.options}
                onTextChange={(buscar) =>
                  setActividadPrincipal((o) => ({ ...o, buscar }))
                }
                required
              />
            </Grid>
          </Grid>
          <Grid width="full" gap="inherit">
            <Grid width="full">
              <SearchSelectMaterial
                id="ciiU1"
                name="ciiU1"
                label="CIIU 1"
                error={!!errors.ciiU1}
                helperText={
                  ciius.loading ?? ciius.error?.message ?? errors.ciiU1 ?? ""
                }
                value={ciiu1.selected}
                disabled={disabled.ciiU1 || validacionCUIT.validado === ""}
                onChange={({ value }) => {
                  const ciiu = ciius.data.find((r) => r.ciiu === value);
                  onChange({
                    ciiU1: ciiu.ciiu,
                    ciiU1Descripcion: ciiu.descripcion,
                  });
                }}
                options={ciiu1.options}
                onTextChange={(buscar) => setCIIU1((o) => ({ ...o, buscar }))}
                // required
              />
            </Grid>
          </Grid>
          <Grid width="full" gap="inherit">
            <Grid width="full">
              <SearchSelectMaterial
                id="ciiU2"
                name="ciiU2"
                label="CIIU 2"
                error={!!errors.ciiU2}
                helperText={
                  ciius.loading ?? ciius.error?.message ?? errors.ciiU2 ?? ""
                }
                value={ciiu2.selected}
                disabled={disabled.ciiU2 || validacionCUIT.validado === ""}
                onChange={({ value }) => {
                  const ciiu = ciius.data.find((r) => r.ciiu === value);
                  onChange({
                    ciiU2: ciiu.ciiu,
                    ciiU2Descripcion: ciiu.descripcion,
                  });
                }}
                options={ciiu2.options}
                onTextChange={(buscar) => setCIIU2((o) => ({ ...o, buscar }))}
                // required
              />
            </Grid>
          </Grid>
          <Grid width="full" gap="inherit">
            <Grid width="full">
              <SearchSelectMaterial
                id="ciiU3"
                name="ciiU3"
                label="CIIU 3"
                error={!!errors.ciiU3}
                helperText={
                  ciius.loading ?? ciius.error?.message ?? errors.ciiU3 ?? ""
                }
                value={ciiu3.selected}
                disabled={disabled.ciiU3 || validacionCUIT.validado === ""}
                onChange={({ value }) => {
                  const ciiu = ciius.data.find((r) => r.ciiu === value);
                  onChange({
                    ciiU3: ciiu.ciiu,
                    ciiU3Descripcion: ciiu.descripcion,
                  });
                }}
                options={ciiu3.options}
                onTextChange={(buscar) => setCIIU3((o) => ({ ...o, buscar }))}
                // required
              />
            </Grid>
          </Grid>
          {hide.deletedObs ? null : (
            <Grid width="full" gap="inherit">
              <Grid width="full">
                <InputMaterial
                  id="deletedDate"
                  label="Fecha Baja"
                  error={!!errors.deletedDate}
                  helperText={errors.deletedDate ?? ""}
                  value={data.deletedDate}
                  disabled={
                    disabled.deletedDate || validacionCUIT.validado === ""
                  }
                  onChange={(deletedDate) => onChange({ deletedDate })}
                />
              </Grid>
              <Grid width="full">
                <InputMaterial
                  id="deletedBy"
                  label="Usuario Baja"
                  error={!!errors.deletedBy}
                  helperText={errors.deletedBy ?? ""}
                  value={data.deletedBy}
                  disabled={
                    disabled.deletedBy || validacionCUIT.validado === ""
                  }
                  onChange={(deletedBy) => onChange({ deletedBy })}
                />
              </Grid>
              <Grid width="full">
                <InputMaterial
                  id="deletedObs"
                  label="Observaciones Baja"
                  error={!!errors.deletedObs}
                  helperText={errors.deletedObs ?? ""}
                  value={data.deletedObs}
                  disabled={
                    disabled.deletedObs || validacionCUIT.validado === ""
                  }
                  onChange={(deletedObs) => onChange({ deletedObs })}
                />
              </Grid>
            </Grid>
          )}
          <Grid fullWidth>
            <DatosArcaEmpresa data={data.datosArca} onChange={onChange} />
          </Grid>
          <Grid fullWidth>
            <Button
              className="botonAzul"
			        disabled={!data.id || !data.datosArca}
              width={40}
              onClick={() => handleActualizaDatosEmpresa(data.datosArca)}
            >
              ACTUALIZA DATOS EMPRESA
            </Button>
          </Grid>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="botonAzul"
          loading={loading}
          width={25}
          onClick={() => onClose(true)}
        >
          CONFIRMA
        </Button>

        <Button className="botonAmarillo" width={25} onClick={() => onClose()}>
          CIERRA
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmpresasForm;
