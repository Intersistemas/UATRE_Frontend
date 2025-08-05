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
import downloadjs from "downloadjs";
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
import useAmbitos from "components/hooks/useAmbitos";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import PDF from "./PDF";
import useDocumentaciones from "components/documentacion/useDocumentaciones";

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
  estadosSolicitudes = [],
  request = "",
}) => {
  data ??= {};
  estadosSolicitudes ??= [];
  request ??= {};

  hide ??= {};
  errors ??= {};
  onChange ??= onChangeDef;
  onClose ??= onCloseDef;
  onValidate ??= onValidateDef;

  const [documentacionList, setDocumentacionList] = useState([]);
  const { request: solicitudAfiliacion } = useAfiliacionesPorEmpresa();
  const [empresa, setEmpresa] = useState({
    id: 0,
    cuit: null,
    razonsocial: "",
    domicilio: "",
    localidad: "",
    provincia: "",
    actividad:" "
  });
  
  //#region Alert
  const [dialog, setDialog] = useState({
    text: "",
    open: false,});
  const usuarioLogueado = useSelector((state) => state.usuarioLogueado);
  const ambito = useAmbitos().ambitoUser();
  console.log("usuarioLogueado", usuarioLogueado);
  console.log("useAmbitos",ambito)
  const [totalesTrabajadores, setTotalesTrabajadores] = useState({
    loading: false,
    totales: null,
    error: null,
  });
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [cargandoBloques, setCargandoBloques] = useState(false);
  const [bloqueActual, setBloqueActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [pdfGenerado, setPdfGenerado] = useState(null);
  
  const [totalesUltimoPeriodoSinAfiliados, setTotalesUltimoPeriodoSinAfiliados] = useState(null)
  
  const [trabajadoresRuralesNoAfiliados, setTrabajadoresRuralesNoAfiliados] = useState({
    loading: false,
    data: [],
    error: null,
    });
  //#endregion

  const [documentacionTab, documentacionChanger, documentacionSelected] = useDocumentaciones();
  const [documentacionActions, setDocumentacionActions] = useState([]);

   // Calcula la fecha de 3 meses atrás
  const getFechaTresMesesAtras = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 2);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }; 

  const [filtros, setFiltros] = useState({
    desde: getFechaTresMesesAtras(),
    hasta: new Date(),
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

  const onGrabarSolicitudAfiliacion = (solicitud, trabajadoresAfipConsulta) => {


    pushQuery({
      action: "PostSolicitudAfiliacionEmpresas",
      config:{
        body: solicitud,
      },
      onOk: (data) => {
        onDownloadSolicitudAfiliacion(trabajadoresAfipConsulta, data);
          setTrabajadoresRuralesNoAfiliados({
            data: trabajadoresAfipConsulta,
            loading: false,
            error: null,
          });
      },
       onError: (error) => {
        setDialog({text: "No se pudo ingresar la Solicitud de Afiliación.", open: true});
        setTrabajadoresRuralesNoAfiliados({
          loading: false,
          data: null,
          error: error?.message || "Error al insertar Solicitud de Afiliación.",
        });
      },
    });
  };

    const { request: generarPDF } = PDF();

  const onDownloadSolicitudAfiliacion = async (trabajadoresNoAfiliados, afiliacionPorEmpresa) => {
  console.log("trabajadoresNoAfiliados**",trabajadoresNoAfiliados)
  console.log("seccionalSelect***",seccionalSelect)
     // Mapeo para el PDF (uno por cada registro)
      const datosPDFArray = trabajadoresNoAfiliados.map((t) => {
      const splitCuil = (cuil) => {
        const str = String(cuil).padStart(11, "0");
        return {
          tipo: str.substring(0, 2),
          id: str.substring(2, 10),
          verificador: str.substring(10, 11),
        };
      };
      const cuilParts = splitCuil(t?.cuil);
      const cuitParts = splitCuil(empresa?.cuit);
      const fechaPresentacion = t?.presentacionFecha
        ? new Date(t.presentacionFecha)
        : new Date();
      const fechaNac = { dia: "--", mes: "--", anio: "----" };
      const procesoFechax = t.procesoFecha
        ? new Date(t.procesoFecha)
        : new Date();

      // Mapeo para el PDF
      const datosPDF = {
        // Afiliado
        "afiliado.numero": t.id,
        "seccional.codigo": seccionalSelect?.selectedRecord?.codigo,
        // Trabajador
        "trabajador.apellidos": t.afiliadoApellido,
        "trabajador.nombres":t.afiliadoNombre, // No viene en la API
        "trabajador.cuil.tipo": cuilParts.tipo,
        "trabajador.cuil.id": cuilParts.id,
        "trabajador.cuil.verificador": cuilParts.verificador,
        "trabajador.documento": t.numeroDocumento,
        "trabajador.nacionalidad": "-", // No viene en la API
        "trabajador.nacimiento.fecha": Formato.Fecha(t.fechaNacimiento) ?? `${fechaNac.dia}/${fechaNac.mes}/${fechaNac.anio}`,
        "trabajador.estado_civil": "-", // No viene en la API
        "trabajador.sexo": "-", // No viene en la API
        "trabajador.domicilio": t.domicilio,
        "trabajador.localidad": t.localidad,
        "trabajador.provincia": t.provincia,
        "trabajador.oficio": "-", //t.modalidadDescripcion,
        "trabajador.actividad":  t.actividadDescripcion.includes("inexistente") ? "-" :  t.actividadDescripcion,
        "trabajador.telefono": "-", // No viene en la API
        "trabajador.correo": "-", // No viene en la API

        // Empleador
        "empleador.cuit.tipo": cuitParts.tipo,
        "empleador.cuit.id": cuitParts.id,
        "empleador.cuit.verificador": cuitParts.verificador,
        "empleador.razon_social": empresa?.razonsocial,
        "empleador.domicilio": empresa?.domicilio,
        "empleador.localidad": empresa?.localidad,
        "empleador.provincia": empresa?.provincia,
        "empleador.actividad": empresa?.actividad,
        "empleador.telefono": "-", // No viene en la API
        "empleador.correo": "-", // No viene en la API

        // Carnet (fecha)
        "carnet.fecha.dia": " ", //String(procesoFechax.getDate()).padStart(2,"0"),
        "carnet.fecha.mes": " ", //String(procesoFechax.getMonth() + 1).padStart(2,"0"),
        "carnet.fecha.anio": " ", //String(procesoFechax.getFullYear()),

        // Fecha de presentación
        "fecha.dia": String(fechaPresentacion.getDate()).padStart(2, "0"),
        "fecha.mes": String(fechaPresentacion.getMonth() + 1).padStart(2,"0"),
        "fecha.anio": String(fechaPresentacion.getFullYear()),
      };

      // Convertir todos los valores a string
      return Object.fromEntries(
        Object.entries(datosPDF).map(([k, v]) => [
          k,
          v == null ? "" : String(v),
        ])
      );
    });

    // Generar el PDF con todas las páginas
    let base64Original = null;
    await generarPDF({
      data: datosPDFArray, // <-- Pasar el array
      onLoad: (b64) => {
        base64Original = b64;
      },
    });

    let base64 = base64Original;
    if (base64 && base64.startsWith("data:application/pdf;base64,")) {
      base64 = base64.replace("data:application/pdf;base64,", "");
    }
    if (!base64) {
      alert("El PDF no se generó correctamente.");
      setGenerandoPDF(false);
      setCargandoBloques(false);
      return;
    }
    const { PDFDocument } = await import("pdf-lib");
    const pdfBytes = Uint8Array.from(atob(base64), (c) =>
      c.charCodeAt(0)
    );
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const paginas = pdfDoc.getPageCount();
    setTotalPaginas(paginas);
    setCargandoBloques(true);
    for (let i = 1; i <= paginas; i++) {
      setBloqueActual(i);
      await new Promise((res) => setTimeout(res, 300));
    }
    setCargandoBloques(false);
    setGenerandoPDF(false);
    setPdfGenerado(base64Original);

    //downloadjs(pdfGenerado,"SolicitudAfiliacion.pdf");
    
    documentacionChanger("Create", {
			params: {
        archivo: base64,
        entidadId: afiliacionPorEmpresa?.id,
        entidadTipo: "E",
        nombreArchivo: "SolicitudesDeAfiliacion.pdf",
        observaciones: "Solicitudes de Afiliación por Empresa",
        refTipoDocumentacionId: 6,
        soloactivos: true
      },
		});

    onClose(true);
 
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
      case "GetDDJJUatreTrabajadoresAFIPConsulta": {
        return {
          config: {
            baseURL: "DDJJ",
            endpoint: `/DDJJUatre/GetDDJJUatreTrabajadoresAFIPConsulta`,
            method: "GET",
          },
        };
      }
      case "PostSolicitudAfiliacionEmpresas": {
       return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: "/SolicitudAfiliacionEmpresas",
            method: "POST" 
          },
        };
      }
      case "ConsultaAFIP":{
	      return {
					config: {
						baseURL: "Comunes",
						endpoint: "/AFIPConsulta",
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
    selectedRecord: {},
    origen: "",
  });
  // Buscador
  useEffect(() => {
    setSeccionalSelect((o) => ({
      ...o,
      options: seccionalSelectOptions(o),
      selected:{},
    }));
  }, [seccionalSelect.buscar, seccionalSelect.data]);
  //#endregion select seccionales

// Buscador
  useEffect(() => {
    console.log("seccionalSelect!!",seccionalSelect)
    setSeccionalSelect((o) => ({
      ...o,
     selectedRecord: seccionalSelect.data.find((s)=> s?.id == seccionalSelect?.selected?.value)
    }));
  }, [seccionalSelect.selected]);
  //#endregion select seccionales

  // Buscador
  useEffect(() => {
    setSeccionalSelect((o) => ({
      ...o,
       //selected: ambito.tipo == "Seccionales" ? { value: ambito?.ids[0], label: data.find((s)=> s?.id == ambito?.ids[0])?.descripcion} : {},
      selected:  ambito.tipo == "Seccionales" ? 
      { value:  ambito?.ids[0],
        label: seccionalSelect.options.find((r) => r.value === ambito?.ids[0])
          ?.label,
      }
      : 
      {},
     selectedRecord: ambito.tipo == "Seccionales" ? seccionalSelect.data.find((s) => s.id === ambito?.ids[0])  : {} 
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



  //#region Confirmación
  const handleConfirma = async () => {

    setTrabajadoresRuralesNoAfiliados({ loading: true, data: [], error: null });

    const solicitud = {
      fecha: new Date().toISOString(),
      seccionalId: seccionalSelect.selected.value,
      empresaId: empresa?.id ?? 0,
      estadoSolicitudId: estadosSolicitudes?.find((o) => o?.descripcion === "Pendiente")?.id,
      estadoFecha: new Date().toISOString(),
      estadoSolicitudObservaciones: "Sin observaciones",
      estadoSolicitudUsuario: usuarioLogueado?.id || "desconocido",
      periodo: totalesUltimoPeriodoSinAfiliados?.periodo,
      total_Trabajadores: totalesUltimoPeriodoSinAfiliados?.total_Trabajadores,
      total_Trab_Rurales: totalesUltimoPeriodoSinAfiliados?.total_Trab_Rurales,
      total_Trab_NoRurales: totalesUltimoPeriodoSinAfiliados?.total_Trab_NoRurales,
      total_Trab_Rurales_Afiliados: totalesUltimoPeriodoSinAfiliados?.total_Trab_Rurales_Afiliados,
      total_Trab_Rurales_NoAfiliados: totalesUltimoPeriodoSinAfiliados?.total_Trab_Rurales_NoAfiliados,
      total_Trab_NoRurales_Afiliados: totalesUltimoPeriodoSinAfiliados?.total_Trab_NoRurales_Afiliados,
      total_Trab_NoRurales_NoAfiliados: totalesUltimoPeriodoSinAfiliados?.total_Trab_NoRurales_NoAfiliados,
      solicitudAfiliacionEmpresasDetalle: Array.isArray(totalesTrabajadores.totales)
        ? totalesTrabajadores.totales.map((item) => ({
            periodo: item.periodo,
            total_Trabajadores: item.total_Trabajadores,
            total_Trab_Rurales: item.total_Trab_Rurales,
            total_Trab_NoRurales: item.total_Trab_NoRurales,
            total_Trab_Rurales_Afiliados: item.total_Trab_Rurales_Afiliados,
            total_Trab_Rurales_NoAfiliados: item.total_Trab_Rurales_NoAfiliados,
            total_Trab_NoRurales_Afiliados: item.total_Trab_NoRurales_Afiliados,
            total_Trab_NoRurales_NoAfiliados: item.total_Trab_NoRurales_NoAfiliados,
          }))
        : [],
    };

     //Trabajadores Rurales NO AFILIADOS para generar Solicitud Afiliacion PDF
     pushQuery({
      action: "GetDDJJUatreTrabajadoresAFIPConsulta",
      params: {
        CUIT: totalesUltimoPeriodoSinAfiliados?.cuit,
        Periodo: totalesUltimoPeriodoSinAfiliados?.periodo,
        EsRural: "S",
        AfiliadoId: 0,
      },
      onOk: (data) => {
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setDialog({text: "No se encontraron Trabajadores Rurales No Afiliados para generar la Solicitud de Afiliación.", open: true});
          setTrabajadoresRuralesNoAfiliados({
            loading: false,
            data: [],
            error: "No existen datos para el CUIT y período seleccionados.",
          });
        } else {
          onGrabarSolicitudAfiliacion(solicitud, data);
        }
      },
       onError: (error) => {
        setDialog({text: "Error consultando trabajadores", open: true});
        setTrabajadoresRuralesNoAfiliados({
          loading: false,
          data: null,
          error: error?.message || "Error al obtener los totales de trabajadores.",
        });
      },
    });
  };
  //#endregion Confirmación

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
    
    if (!cuit || !PeriodoDesde || !PeriodoHasta) return;

     pushQuery({
      action: "ConsultaAFIP",
      params: { cuit: empresaSelected?.cuit, VerificarHistorico: false },
      onOk: (data) => {
        setEmpresa({
            id: empresaSelected?.id,
            cuit: data?.cuit,
            razonsocial: data?.razonSocial,
            domicilio: data?.domicilios[0]?.direccion,
            localidad: data?.domicilios[0]?.localidad,
            provincia: data?.domicilios[0]?.descripcionProvincia,
            actividad: data?.descripcionActividadPrincipal
          });
      },
       onError: (error) => {
         setEmpresa({
            id: empresaSelected?.id,
            cuit: empresaSelected?.cuit,
            razonsocial: empresaSelected?.razonSocial,
            domicilio: `${empresaSelected?.domicilioCalle} ${empresaSelected?.domicilioNumero}`,
            localidad: "",
            provincia: "",
            actividad: empresaSelected?.actividadPrincipalDescripcion
          });
      },
    });

    setTotalesTrabajadores({ loading: true, totales: null, error: null});

    setTotalesUltimoPeriodoSinAfiliados(null);
    pushQuery({
      action: "ddjjTotalTrabajadores",
      params: {
        CUIT: cuit,
        PeriodoDesde,
        PeriodoHasta,
        Sort:"-Periodo",
        PageIndex: 1,
        PageSize: 6, // Ajusta el tamaño según sea necesario      
      },
      onOk: (data) => {
        if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
          setTotalesTrabajadores({
            loading: false,
            totales: [],
            error: "No existen datos para el CUIT y período seleccionados.",
          });
        } else {
          setTotalesTrabajadores({ loading: false, totales: data?.data, error: null });
          setTotalesUltimoPeriodoSinAfiliados(data.data.find((item) => item.total_Trab_Rurales_NoAfiliados > 0) || null);
        }
      },
      onError: (error) => {
        setTotalesTrabajadores({
          loading: false,
          totales: null,
          error: error?.message || "Error al obtener los totales de trabajadores.",
        });
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
              disabled={disabled.seccionalId || ambito.tipo == "Seccionales"}
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
            <Grid width gap="inherit">
              {/* Reemplazo el filtro de estado por los de fecha */}
              <Grid width="auto">
                <InputMaterial
                  label="Desde"
                  disabled={true}
                  type="date"
                  value={filtros.desde || ""}
                  onChange={(e) => {
                    let value = e?.target?.value || e;
                    setFiltros((o) => ({ ...o, desde: value }));
                    setTotalesTrabajadores({
                      loading: false,
                      totales: null,
                      error: null,
                    });
                  }}
                />
              </Grid>
              <Grid width="auto">
                <InputMaterial
                  label="Hasta"
                  disabled={true}
                  type="date"
                  value={filtros.hasta || ""}
                  onChange={(e) => {
                    let value = e?.target?.value || e;
                    setFiltros((o) => ({ ...o, hasta: value }));
                    setTotalesTrabajadores({
                      loading: false,
                      totales: null,
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
                    handlerBuscarTotales();
                  }}
                >
                  
                  {`ANALIZAR ${empresaSelected?.razonSocial.slice(0, 20)}...`}
                </Button>
              </Grid>
            </Grid>
            <Grid width="auto"  style={{ marginTop: "10px" }}>
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
                  Array.isArray(totalesTrabajadores?.totales) &&
                  totalesTrabajadores?.totales?.length > 0
                    ? totalesTrabajadores?.totales
                    : []
                }
                noDataIndication={
                  totalesTrabajadores?.loading
                    ? "Cargando..."
                    : totalesTrabajadores?.error
                    ? totalesTrabajadores?.error
                    : "No existen datos para el CUIT y período seleccionados."
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
            disabled={ (totalesUltimoPeriodoSinAfiliados == null || totalesUltimoPeriodoSinAfiliados?.total_Trab_Rurales_NoAfiliados == 0 || trabajadoresRuralesNoAfiliados.loading) ?? false}
            onClick={() => handleConfirma()}
          > {generandoPDF ? (
               `Generando PDF ${bloqueActual} de ${totalPaginas}...`
            ) : (
              trabajadoresRuralesNoAfiliados.loading ? "Cargando..." : "CONFIRMA"
            )}
          </Button>

          <Button
            className="botonAmarillo"
            width={25}
            onClick={() => onClose()}
          >
            CIERRA
          </Button>
        </Modal.Footer>
        <div>
            <Dialog
              onClose={() => (
                setDialog({text: "", open:false})
              )}
              open={dialog.open}
            >
              <DialogContent dividers>
                <Typography gutterBottom style={{ whiteSpace: "pre-line" }}>
                  {dialog.text}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  className="botonAmarillo"
                  onClick={() => (
                     setDialog({text: "", open:false})
                  )}
                >
                  Cierra
                </Button>
              </DialogActions>
            </Dialog>
          </div>
      </Modal>
    </>
  );
};

export default FormularioOspreraForm;