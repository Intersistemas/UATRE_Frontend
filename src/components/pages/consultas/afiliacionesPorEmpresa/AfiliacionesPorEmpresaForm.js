import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, {
  CUITMask,
  DNIMask,
} from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import useQueryState from "components/hooks/useQueryState";
import Documentacion from "components/documentacion/Documentacion";

import download from "downloadjs";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Formato from "components/helpers/Formato";
import SearchSelectMaterial, {
  mapOptions,
  includeSearch,
} from "components/ui/Select/SearchSelectMaterial";
import moment from "moment/moment";
import useAfiliacionesPorEmpresa from "./useAfiliacionesPorEmpresa";
import { useSelector } from "react-redux";
import useEmpresas, {
  onLoadSelectKeepOrFirst,
} from "components/pages/administracion/empresas/useEmpresas";
import AfiliacionesPorEmpresaDetalleTable from "./afiliacionesPorEmpresaDetalle/AfiliacionesPorEmpresaDetalleTable";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};
const onValidateDef = (confirm = false) => {};

/**
 * Proceso a ejecutar posterior carga
 * @param {object} changes datos posterior carga
 * @param {array} changes.data datos obtenidos en la carga
 * @param {object} changes.error error durante la carga
 */

//#region seccionalSelect Options
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
    filter: (r) => includeSearch(r, buscar),
    ...x,
  });
//#endregion seccionalSelect Options

const FormularioOspreraForm = ({
  data = {},
  title = "",
  disabled = {},
  hide = {},
  errors = {},
  onChange = onChangeDef,
  onClose = onCloseDef,
  onValidate = onValidateDef,
  loading = {},
  request = "",
}) => {
  data ??= {};
  request ??= {};

  hide ??= {};
  errors ??= {};
  onChange ??= onChangeDef;
  onClose ??= onCloseDef;
  onValidate ??= onValidateDef;

  const [selectedTab, setSelectedTab] = useState(0);
  const [disabledItems, setDisabledItems] = useState(disabled);
  const [titular, setTitular] = useState({
    existeEnUATRE: null,
    existeEnOSPRERA: null,
    existeEnAFIP: null,
    confirmado: request == "A" ? false : true,
    DDJJEmpresa: null,
    cuil: "",
    tipoDocumentoId: 0,
    fechaNacimiento: "",
    sexoId: 0,
  });
  const [documentacionList, setDocumentacionList] = useState([]);
  const { request: solicitudAfiliacion } = useAfiliacionesPorEmpresa();
  //#region Alert
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTexto, setDialogTexto] = useState("");
  const [modalPreguntas, setModalPreguntas] = useState({
    visible: false,
    texto: "",
    respuesta: "",
  });
  const [modalDocumentacion, setModalDocumentacion] = useState({
    visible: false,
    documentacionOK: false,
  });
  // const [busy, setBusy] = useState({ busy: false, text: "" });
  const usuarioLogueado = useSelector((state) => state.usuarioLogueado);

  const [totalesEmpresa, setTotalesEmpresa] = useState({
    loading: false,
    data: null,
    error: null,
  });
  
  //#endregion

   // Calcula la fecha de 3 meses atrás
  const getFechaTresMesesAtras = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }; 

  const [filtros, setFiltros] = useState({
    desde: getFechaTresMesesAtras(),
    hasta: "",
    cuit: "",
    razonSocial: "",
    estado: 0,
  });

  const [paramsEdit, setParamsEdit] = useState({});
  const [paramsSend, setParamsSend] = useState({});

  //columnas para ocultar 
  const columnsDef = [
    {
      dataField: "cuit",
      text: "CUIT",
      sort: true,
      formatter: Formato.Cuit,
      headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
    },
    {
      dataField: "razonSocial",
      text: "Razon Social",
      sort: true,
      style: { textAlign: "left" },
    },
{
      dataField: "provinciaDescripcion",
      text: "Provincia",
      sort: false,
      style: { textAlign: "left" },
    },
    {
      dataField: "localidadDescripcion",
      text: "Localidad",
      sort: false,
      style: { textAlign: "left" },
    },

    {
      dataField: "actividadPrincipalDescripcion",
      text: "Actividad Principal",
      hidden: true,
      style: { textAlign: "left" },
    },
    {
      dataField: "domicilioCalle",
      text: "Domicilio",
      hidden: true,
      style: { textAlign: "left" },
    },
    {
      dataField: "telefono",
      hidden: true,
      headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
      text: "Teléfono",
      style: { textAlign: "left" },
    },
    {
      dataField: "deletedDate",
      text: "Fecha baja",
      hidden: true,
      formatter: Formato.Fecha,
      headerStyle: { width: "100px" },
      style: (v) => {
        const r = { textAlign: "center" };
        if (v) {
          r.background = "#ff6464cc";
          r.color = "#FFF";
        }
        return r;
      },
    },
  ];

  const {
    render: empresasRender,
    request: empresasRequest,
    selected: empresaSelected,
  } = useEmpresas({
    params: { orderBy: "razonSocial", soloActivos: true },
    onLoadSelect: onLoadSelectKeepOrFirst,
    columns: columnsDef,
  });

  //#region DISABLED 0303
  useEffect(() => {
    const changes = {};
    if (titular?.confirmado) {
      changes.cuitTitular = true;
      changes.apellidoTitular = true;
      changes.nombreTitular = true;
      if (request == "A") {
        changes.elPacienteEsTitular = false;
        changes.tipoDocumentoId = false;
        changes.dniPaciente = false;
        changes.apellidoPaciente = false;
        changes.nombrePaciente = false;

        changes.fechaNacimiento = false;
        changes.sexo = false;

        changes.telefonoContacto = false;
        changes.telefonoContacto2 = false;
        changes.emailContacto = false;
        changes.emailContacto2 = false;

        changes.titularPaciente = false;
        changes.medioGestion = false;
        changes.telefono = false;
        changes.resultadoLlamada = false;
        changes.direccionesEmailDestino = false;
        changes.texto = false;
        changes.gestionRubro = false;
        changes.gestionSubRubro = false;
        // changes.gestionEstado = false;
        changes.gestionSituacion = false;
        changes.gestionAreaOsprera = false;
      }
    }

    if (titular.existeEnUATRE) {
      changes.apellidoTitular = true;
      changes.nombreTitular = true;
    }

    setDisabledItems((o) => ({ ...o, ...changes }));
  }, [titular]);
  //#endregion

  const onDownloadSolicitudAfiliacion = (conDatos) => {
    // console.log("onDownloadSolicitudAfiliacion", conDatos);
    const match = data?.cuitTitular?.toString()?.match(/^(\d{2})(\d{8})(\d)$/);
    const dataFormulario = {
      "seccional.codigo": seccionalSelect?.selectedAditionalData?.codigo,
      ...Object.fromEntries(
        `${data?.fecha || ""}`
          .split("-")
          .map((v, i) => [`fecha.${["anio", "mes", "dia"][i]}`, v])
      ),
      ...Object.fromEntries(
        `${Formato.Cuit(data?.cuitTitular)}`
          .split("-")
          .map((v, i) => [
            `trabajador.cuil.${["tipo", "id", "verificador"][i]}`,
            v,
          ])
      ),
      "trabajador.documento": ["DNI", match[2]].join(" "),
      "trabajador.nacionalidad": "",
      "trabajador.apellidos": data?.apellidoTitular,
      "trabajador.nombres": data?.nombreTitular,
      "trabajador.nacimiento.fecha": Formato.Fecha(data?.fechaNacimiento),
      "trabajador.estado_civil": "", //estadoCivilSelect?.selected?.label,
      "trabajador.domicilio": data.domicilio,
      "trabajador.localidad": data.localidad,
      "trabajador.provincia": data.provincia,
      "trabajador.oficio": "", //oficioSelect?.selected?.label,
      "trabajador.actividad": "", //data.actividad,
      "trabajador.telefono": data?.telefonoContacto,
      "trabajador.correo": data?.emailContacto,
      "trabajador.cuil": data?.cuitTitular,
    };
    //if (request !== "A") return;
    conDatos
      ? solicitudAfiliacion({
          data: dataFormulario,
          onLoad: (base64) => download(base64, `SolicitudAfiliacion.pdf`),
        })
      : solicitudAfiliacion({
          onLoad: (base64) => download(base64, `SolicitudAfiliacion.pdf`),
        });
  };

  const { setState: setDocumentosQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Comunes",
        endpoint: `/DocumentacionEntidad/GetBySpec?EntidadId=${data.id}&EntidadTipo=O`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );


  //#region Carga inicial Documentacion
  useEffect(() => {
    setDocumentosQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = [];
        if (Array.isArray(ok)) data = ok;
        setDocumentacionList(data ?? []);
      },
    }));
  }, [setDocumentosQuery]);
  //#endregion Carga inicial Documentacion

  const { setState: setSeccionalesQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Afiliaciones",
        endpoint: `/Seccional?SoloActivos=true&verSeccionalesLocalidades=false`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  //#region consultas API
  const pushQuery = useQueryQueue((action, params) => {
    switch (action) {
       case "ddjjTotalTrabajadores": {
        return {
          config: {
            baseURL: "DDJJ",
            endpoint: `/DDJJUatre/GetVAfiliacionesPorEmpresaCUITPeriodos`,
            method: "GET",
          },
        };
      }
      case "GetAfiliado": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/Afiliado/GetAfiliadoByCUIL`,
            method: "GET",
          },
        };
      }
      
      case "GetDDJJ": {
        return {
          config: {
            baseURL: "DDJJ",
            endpoint: `/DDJJUatre/GetCUILUltimoAnio`,
            method: "GET",
          },
        };
      }

      case "ConsultaAFIP": {
        return {
          config: {
            baseURL: "Comunes",
            endpoint: "/AFIPConsulta",
            method: "GET",
          },
        };
      }

      case "ConsultaOsprera": {
        return {
          config: {
            baseURL: "Comunes",
            endpoint: "/PadronOsprera/GetPadronOspreraSpecs",
            method: "GET",
          },
        };
      }

      case "EnviarCorreo": {
        return {
          config: {
            endpoint: `/Usuario/enviarCorreoConAdjuntoBase64`,
            baseURL: "Seguridad",
            method: "POST",
            headers: {
              Accept: "*/*",
            },
            /*body: JSON.stringify({
							to: to,
							attachments: attachments,
						}),*/
          },
        };
      }

      case "GestionesSubRubroByRubro": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/GestionesSubRubro`,
            method: "GET",
          },
        };
      }

      case "GestionesSituacionByEstado": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/GestionesSituacion`,
            method: "GET",
          },
        };
      }

      default:
        return null;
    }
  });
  //#endregion

  //#region select seccional
  const [seccionalSelect, setSeccionalSelect] = useState({
    loading: "Cargando...",
    buscar: "",
    data: [],
    error: null,
    options: [],
    selected: {},
    selectedAditionalData: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setSeccionalSelect((o) => ({
      ...o,
      options: seccionalSelectOptions(o),
      selected: { value: data.seccionalId, label: data.seccionalId },
    }));
  }, [seccionalSelect.buscar, seccionalSelect.data]);
  //#endregion select seccionales

  // Buscador
  useEffect(() => {
    setSeccionalSelect((o) => ({
      ...o,
      selected: {
        value: data.seccionalId,
        label: seccionalSelect.options.find((r) => r.value === data.seccionalId)
          ?.label,
      },
      selectedAditionalData: seccionalSelect?.options.find(
        (r) => r.value === data?.seccionalId
      )?.record,
    }));
  }, [seccionalSelect.options]);
  //#endregion select seccionales

  //#region Carga inicial select seccionales
  useEffect(() => {
    setSeccionalesQuery((o) => ({
      ...o,
      onLoad: ({ ok, error }) => {
        let data = [];
        if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
        setSeccionalSelect((o) => ({
          ...o,
          loading: null,
          data,
          error: error?.toString(),
        }));
      },
    }));
  }, [setSeccionalesQuery]);
  //#endregion Carga inicial select seccionales


   //Carga de lista según parametros
    useEffect(() => {
      empresasRequest("list", {
        params: paramsSend,
        pagination: { index: 1, size: 5 },
        onLoadSelect: onLoadSelectKeepOrFirst,
      });
    }, [empresasRequest, paramsSend]);
    //#endregion

  const handleConfirma = async () => {
    if (request == "A") {      
        onDownloadSolicitudAfiliacion(false);
    } else {
      onClose(true);
    }
  };

  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => handleConfirma(), "AltKey");


  const fechaToPeriodo = (fecha) => {
    if (!fecha) return "";
    if (fecha instanceof Date) {
      const y = fecha.getFullYear();
      const m = String(fecha.getMonth() + 1).padStart(2, "0");
      return `${y}${m}`;
    }
    if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [y, m] = fecha.split("-");
      return `${y}${m}`;
    }
    if (typeof fecha === "string" && /^\d{6}$/.test(fecha)) {
      return fecha;
    }
    try {
      const d = new Date(fecha);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}${m}`;
    } catch {
      return "";
    }
  };

const handlerBuscarTotales = () => {
    const cuit = String(empresaSelected.cuit).replace(/\D/g, "");
    const PeriodoDesde = fechaToPeriodo(filtros.desde);
    const PeriodoHasta = fechaToPeriodo(filtros.hasta);
    
    console.log("handlerBuscarTotales", cuit, PeriodoDesde, PeriodoHasta);
    if (!cuit || !PeriodoDesde || !PeriodoHasta) return;

    setTotalesEmpresa({ loading: true, data: null, error: null });

    pushQuery({
      action: "ddjjTotalTrabajadores",
      params: {
        CUIT: cuit,
        PeriodoDesde,
        PeriodoHasta,
        Sort:"-Periodo",
        PageIndex: 1,
        PageSize: 8, // Ajusta el tamaño según sea necesario      
      },
      onOk: (data) => {
        console.log("ddjjTotalTrabajadores", data);
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setTotalesEmpresa({
            loading: false,
            data: [],
            error: "No hay datos para el CUIT y período seleccionados.",
          });
        } else {
          console.log("setea totalesEmpresa", data);
          setTotalesEmpresa({ loading: false, data, error: null });
        }
      },
    });
  };


  return (
    <>
      <Modal show size="xl" centered>
        <Modal.Header className={modalCss.modalCabecera} closeButton>
          <h3>{title}</h3>
          <Grid
            width="40%"
            float="right"
            style={{
              display: "flex",
              alignItems: "center",
              paddingleft: "65%",
              marginLeft: "25%",
            }}
          >
            <div>Seccional:</div>
            <SearchSelectMaterial
              id="seccionalId"
              label=""
              error={!!(seccionalSelect.error || errors.seccionalId)}
              helperText={
                seccionalSelect.loading ??
                seccionalSelect.error ??
                errors.seccionalId
              }
              value={seccionalSelect.selected}
              disabled={disabled.seccionalId}
              onChange={(selected = {}) => {
                setSeccionalSelect((o) => ({
                  ...o,
                  selected,
                  origen: "option",
                }));
                onChange({ seccionalId: selected.value });
              }}
              options={seccionalSelect.options}
              onTextChange={(buscar) =>
                setSeccionalSelect((o) => ({ ...o, buscar, origen: "text" }))
              }
            />
          </Grid>
        </Modal.Header>
        <Modal.Body>
            <Grid width col gap="10px">
              <Grid gap="inherit">
                <Grid width="700px" grow>
                  <InputMaterial
                    label="Filtro por CUIT / Razón social"
                    value={paramsEdit.filtro}
                    placeholder="Todas"
                    onChange={(filtro) =>
                      setParamsEdit((o) => {
                        const paramsEdit = { ...o, filtro };
                        if (!filtro) delete paramsEdit.filtro;
                        return paramsEdit;
                      })
                    }
                  />
                </Grid>
                <Grid width="200px">
                  <Button
                    className="botonAzul"
                    disabled={
                      JSON.stringify(paramsEdit) === JSON.stringify(paramsSend)
                    }
                    onClick={() => {
                      setParamsSend(paramsEdit);
                    }}
                  >
                    Aplica filtro
                  </Button>
                </Grid>
                <Grid width="200px">
                  <Button
                    className="botonAzul"
                    disabled={Object.entries(paramsEdit).length === 0}
                    onClick={() => {
                      const paramsEdit = {};
                      setParamsEdit(paramsEdit);
                      if (
                        JSON.stringify(paramsEdit) ===
                        JSON.stringify(paramsSend)
                      )
                        return;
                      setParamsSend({ ...paramsEdit });
                    }}
                  >
                    Limpia filtro
                  </Button>
                </Grid>
              </Grid>
              <div
                style={{
                  minHeight: 150,
                  maxHeight: 550,
                  overflowY: "auto",
                }}
              >
                {empresasRender()}
              </div>
            </Grid>
            <Grid col width="full" gap="15px">
              <Grid width gap="inherit">
                <InputMaterial
                  id="fechaNacimiento"
                  type="date"
                  label="Fecha de nacimiento"
                  required
                  value={data.fechaNacimiento}
                  maxDate={moment().format("YYYY-MM-DD")}
                  error={errors.fechaNacimiento}
                  disabled={disabledItems.fechaNacimiento}
                  onChange={(fechaNacimiento) =>
                    onChange({ fechaNacimiento })
                  }
                />
              </Grid>
            </Grid>
            <Grid width gap="inherit">
              {/* Reemplazo el filtro de estado por los de fecha */}
              <Grid width="auto">
                <InputMaterial
                  label="Desde"
                  type="date"
                  value={filtros.desde || ""}
                  onChange={(e) => {
                    let value = e?.target?.value || e;
                    setFiltros((o) => ({ ...o, desde: value }));
                    setTotalesEmpresa({
                      loading: false,
                      data: null,
                      error: null,
                    });
                  }}
                />
              </Grid>
              <Grid width="auto">
                <InputMaterial
                  label="Hasta"
                  type="date"
                  value={filtros.hasta || ""}
                  onChange={(e) => {
                    let value = e?.target?.value || e;
                    setFiltros((o) => ({ ...o, hasta: value }));
                    setTotalesEmpresa({
                      loading: false,
                      data: null,
                      error: null,
                    });
                  }}
                />
              </Grid>

              <Grid width="auto">
                <Button
                  className="botonAmarillo"
                  disabled={
                    !(empresaSelected && filtros.desde && filtros.hasta)
                  }
                  onClick={() => {
                    console.log("empresaSelected", empresaSelected);
                    handlerBuscarTotales();
                  }}
                >
                  
                  {`ANALIZAR ${empresaSelected?.razonSocial.slice(0, 20)}...`}
                </Button>
              </Grid>
            </Grid>
            <Grid width="auto">
              <AfiliacionesPorEmpresaDetalleTable
                /*data={list.data}
                loading={!!list.loading}
                noDataIndication={
                  list.loading ?? list.error?.message ?? "No existen datos para mostrar"
                }
                pagination={{
                  ...list.pagination,
                  onChange: ({ index, size }) =>
                    setList((o) => ({
                      ...o,
                      loading: "Cargando...",
                      pagination: { index, size },
                      data: [],
                    })),
                }}
                selection={{
                  selected: [list.selection.record?.id].filter((r) => r),
                  onSelect: (record, isSelect, index, e) =>
                    setList((o) => ({
                      ...o,
                      selection: {
                        ...selectionDef,
                        index,
                        record,
                      },
                    })),
                }}*/
               mostrarBuscar={false}
                remote
                keyField="empresaCUIT"
                data={
                  Array.isArray(totalesEmpresa?.data?.data) &&
                  totalesEmpresa?.data?.data?.length > 0
                    ? totalesEmpresa?.data?.data
                    : []
                }
                noDataIndication={
                  totalesEmpresa.loading
                    ? "Cargando..."
                    : totalesEmpresa.error
                    ? totalesEmpresa.error
                    : "No hay datos para el CUIT y período seleccionados."
                }
                onTableChange={(type, { sortOrder, sortField }) => {
                  switch (type) {
                    case "sort": {
                      sortField =
                        {
                          empresaCUIT: "cuit",
                          empresaRazonSocial: "razonsocial",
                        }[sortField] ?? sortField;
                      const sortBy = `${
                        sortOrder === "desc" ? "-" : "+"
                      }${sortField}`;
                      
                      /*setCSV((o) => ({
                        ...o,
                        params: { ...o.params, sortBy },
                      }));*/
                      return;
                    }
                    default:
                      return;
                  }
                }}
               
              />
            </Grid>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="botonAzul"
            loading={loading}
            width={25}
            disabled={!titular?.confirmado}
            onClick={() => handleConfirma()}
          > CONFIRMA
          </Button>

          <Button
            className="botonAmarillo"
            width={25}
            onClick={() => onClose()}
          >
            CIERRA
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FormularioOspreraForm;
