import React, { useEffect, useState, useContext } from "react";
import { Modal } from "react-bootstrap";
import downloadjs from "downloadjs";
import ArrayToCSV from "components/helpers/ArrayToCSV";
import AsArray from "components/helpers/AsArray";
import Formato, { Fecha } from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import SearchSelectMaterial, {
  includeSearch,
  mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import AuthContext from "store/authContext";

// import PDFViewer from "./AfiliacionPDF/PDFViewer";

import { PDF } from "./AfiliacionPDF/PDF";
import dataFicticia from "./AfiliacionPDF/data.json";
import InformacionDetallada from "./InformacionDetallada";
import AfiliadosTabs from "./AfiliadosTabs";
import useAmbitos from "../../../../hooks/useAmbitos";

import useCrearSolicitudAfiliacion from "./useCrearSolicitudAfiliacion";
import useEmpresas, {
  onLoadSelectKeepOrFirst,
} from "components/pages/administracion/empresas/useEmpresas";
import { Hidden } from "@mui/material";
import { BorderBottom } from "@mui/icons-material";

const onCloseDef = () => {};

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
  edit: null,
  errors: null,
};

export const onLoadSelectFirst = ({ data, multi, record }) => {
  const dataArray = AsArray(data);
  if (multi) {
    record = AsArray(record);
    let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
    if (retorno.length === 0) retorno = [dataArray.at(0)].filter((r) => r);
    return retorno.length ? retorno : null;
  }
  return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};

export const onLoadSelectSame = ({ data, multi, record }) => {
  const dataArray = AsArray(data);
  if (multi) {
    record = AsArray(record);
    let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
    return retorno.length ? retorno : null;
  }
  return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};

export const onLoadSelectKeep = ({ record }) => record;

export const onDataChangeDef = (data = []) => {};

const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) =>
  true;
const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
const onEditCompleteDef = ({
  edit = {},
  response = null,
  request = "",
} = {}) => {};

//#region estadoSelectOptions
const estadoSelectTodos = { value: 0, label: "Todos" };
const estadoSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.descripcion }),
    filter: (r) => includeSearch(r, buscar),
    start: [estadoSelectTodos],
    ...x,
  });
//#endregion estadoSelectOptions

const SolicitudAutorizacionAfiliacion = ({
  onClose,
  remote: remoteInit = true,
  data: dataInit = [],
  error,
  multi: multiInit = false,
  pagination: paginationInit = { index: 1, size: 12 },
  params: paramsInit = {
    sort: "-Id",
    verDetalles: false,
  },
  onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
  onDataChange: onDataChangeInit = onDataChangeDef,
  onEditChange: onEditChangeInit = onEditChangeDef,
  onEditValidate: onEditValidateInit = onEditValidateDef,
  onEditComplete: onEditCompleteInit = onEditCompleteDef,
  columns,
  hideSelectColumn = true,
  mostrarBuscar = false,
}) => {
  //#region Trato queries a APIs
  // const pushQuery = useQueryQueue((action) => {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const Usuario = useContext(AuthContext).usuario;
  onClose ??= onCloseDef;

  const pushQuery = useQueryQueue((action, params) => {
    switch (action) {
      // Obtener datos de la tabla principal
      case "GetSolicitudes": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/SolicitudAfiliacionEmpresas/GetSolicitudAfiliacionEmpresasSpecs`,
            method: "POST",
          },
        };
      }
      // Obtener datos de la tabla principal
      case "GetEstados": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/EstadoSolicitud`,
            method: "GET",
          },
        };
      }

        // Obtener datos de la tabla principal
      case "PatchEstados": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/SolicitudAfiliacionEmpresas/PatchSolicitud/${params.solicitudId}`,    
            method: "PATCH",
          },
        };
      }

      // Obtener datos para el PDF
      case "dataPFDDesdeApi": {
        return {
          config: {
            baseURL: "DDJJ",
            endpoint: `/DDJJUatre/GetCUITPeriodosDesdeHasta`,
            method: "GET",
          },
        };
      }
      // Obtener datos totales desde la API
      case "dataTotalesDesdeApi": {
        return {
          config: {
            baseURL: "DDJJ",
            endpoint: `/DDJJUatre/GetVAfiliacionesPorEmpresaCUITPeriodos`,
            method: "GET",
          },
        };
      }
      case "GetDetallesBySolicitudId": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/SolicitudAfiliacionEmpresas/GetaDetallesBySolicitudIdPaginationSpecs`,
            method: "GET",
          },
        };
      }

      default:
        return null;
    }
  });
  //#endregion

  const [rechazarAutorizacion, setRechazarAutorizacion] = useState(false);
  const [textInformativo, setTextInformativo] = useState(false);
  const [autorizacion_afil, setAutorizacion_afil] = useState(false);

  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  const [accionSeleccionada, setAccionSeleccionada] = useState(null); // 'rechazar' | 'autorizar' | null
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const [pdfGenerado, setPdfGenerado] = useState(null);

  const [analizarCuil, setAnalizarCuil] = useState(false);

  const [registroAnalizado, setRegistroAnalizado] = useState(null);

  const [cargandoBloques, setCargandoBloques] = useState(false);
  const [bloqueActual, setBloqueActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [selectedTab, setSelectedTab] = useState(0);

  const [registroAnalizadoTemporal, setRegistroAnalizadoTemporal] =
    useState(null);

  const [analizarSeleccionado, setAnalizarSeleccionado] = useState(false);

  const [datosPDF, setDatosPDF] = useState(null);

  const [mostrarResultadosBusqueda, setMostrarResultadosBusqueda] =
    useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const [deboBuscar, setDeboBuscar] = useState(false);
  const ambito = useAmbitos().ambitoUser();
  const { crearSolicitud, loading: creandoSolicitud } =
    useCrearSolicitudAfiliacion();
  const [mostrarTableEmpresas, setMostrarTableEmpresas] = useState(false);

  //#region Empresas Params
  const [paramsEdit, setParamsEdit] = useState({});
  const [paramsSend, setParamsSend] = useState({});
  //#endregion

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
  //#region Tab Empresas
  const {
    render: empresasRender,
    request: empresasRequest,
    selected: empresaSelected,
  } = useEmpresas({
    params: { orderBy: "razonSocial", soloActivos: true },
    onLoadSelect: onLoadSelectKeepOrFirst,
    columns: columnsDef,
  });

  console.log("empresasRender", empresasRender());

  const handleChangeBusqueda = (valor) => {
    setBusquedaEmpresa(valor);

    if (valor.trim() === "") {
      setResultadosEmpresa([]);
      setMostrarResultadosBusqueda(false);
      setMensajeExito(""); // limpia el mensaje cuando borro el input
      setTotalesEmpresa({ loading: false, data: null, error: null }); //  limpia la tabla
    }
  };

  const formatFechaMesAnio = (fecha) => {
    if (!fecha) return "";

    let dateObj;

    // Si es un Date, lo uso directo
    if (fecha instanceof Date) {
      dateObj = fecha;
    } else {
      // Si es un string, intento parsearlo
      dateObj = new Date(fecha);
      if (isNaN(dateObj)) return ""; // Si no se puede parsear, devuelvo vacío
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");

    return `${month}/${year}`;
  };

  //----------------------------------------------------------------------------------------
  const [totalesEmpresa, setTotalesEmpresa] = useState({
    loading: false,
    data: null,
    error: null,
  });
  //----------------------------------------------------------------------------------------

  //-----------------------------------------------------------
  //CODIGO NUEVO AGREGADO...
  // ...existing code...
  const [busquedaEmpresa, setBusquedaEmpresa] = useState("");
  const [resultadosEmpresa, setResultadosEmpresa] = useState([]);
  const [paginaEmpresa, setPaginaEmpresa] = useState(1);
  const pageSizeEmpresa = 3;

  const resultadosPaginados = resultadosEmpresa.slice(
    (paginaEmpresa - 1) * pageSizeEmpresa,
    paginaEmpresa * pageSizeEmpresa
  );

  //----------------------------------------------

  // Calcula la fecha de 3 meses atrás
  const getFechaTresMesesAtras = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }; 

  //-----------------------------------------------
  //#region filtros
  // const [filtros, setFiltros] = useState({});
  // Estado inicial de filtros
  const [filtros, setFiltros] = useState({
    desde: getFechaTresMesesAtras(),
    hasta: "",
    cuit: "",
    razonSocial: "",
    estado: 0,
  });

  //#region filtro estado
  const [estadoSelect, setEstadoSelect] = useState({
    reload: true,
    loading: null,
    params: { soloActivos: true },
    data: [],
    error: null,
    buscar: "",
    options: [],
    selected: estadoSelectTodos,
  });

  // Este useEffect se encarga de cargar las opciones del select de "estado" desde la API.
  // Se ejecuta cada vez que cambia 'estadoSelect' o 'pushQuery'.
  useEffect(() => {
    // Si no se requiere recargar (reload es falso), no hace nada.
    if (!estadoSelect.reload) return;

    // Prepara un objeto con los cambios iniciales: pone el loading, limpia datos previos, etc.
    const changes = {
      reload: null, // Ya no se necesita recargar
      loading: "Cargando...", // Muestra mensaje de carga
      data: [], // Limpia datos anteriores
      error: null, // Limpia errores anteriores
      buscar: "", // Limpia búsqueda previa
      options: [], // Limpia opciones previas
    };

    // Actualiza el estado para reflejar que está cargando
    setEstadoSelect((o) => ({ ...o, ...changes }));

    // Llama a la API para obtener los estados
    pushQuery({
      action: "GetEstados", // Acción a ejecutar (ver configuración en pushQuery)
      params: { ...estadoSelect.params }, // Parámetros para la consulta
      onOk: (data) => {
        // Si la respuesta no es un array, muestra error en consola
        if (!Array.isArray(data))
          return console.error("Se esperaba un arreglo", data);
        console.log("Datos recibidos de la consulta 22:", data); // <-- Agregá esta línea
        // Si es un array, guarda los datos en 'changes'
        changes.data = data.filter((d) => d.tipo == "Solicitudes"); // Filtra el estado "Todos" (id 0)
      },
      onError: (error) => (changes.error = error.toString()), // Guarda el error si ocurre
      onFinally: () =>
        // Al finalizar, actualiza el estado con los cambios y quita el loading
        setEstadoSelect((o) => ({ ...o, ...changes, loading: null })),
    });
  }, [estadoSelect, pushQuery]);

  // Buscador
  useEffect(() => {
    if (estadoSelect.reload) return;
    if (estadoSelect.loading) return;
    setEstadoSelect((o) => ({ ...o, options: estadoSelectOptions(o) }));
  }, [estadoSelect.reload, estadoSelect.loading, estadoSelect.buscar]);
  //#endregion filtro estado

  //#endregion filtros

  //#region list
  const [list, setList] = useState({
    loading: "Cargando...",
    remote: remoteInit,
    params: { ...paramsInit },
    paramsDef: {
      ambitoTodos: Usuario.ambitoTodos,
      ambitoProvincias: Usuario.ambitoProvincias,
      ambitoDelegaciones: Usuario.ambitoDelegaciones,
      ambitoSeccionales: Usuario.ambitoSeccionales,
    },
    delegaciones: [],
    pagination: { index: 1, size: 12, ...paginationInit },
    data: [...AsArray(dataInit, true)],
    error,
    selection: {
      ...selectionDef,
      multi: multiInit,
    },
    onLoadSelect:
      onLoadSelectInit === onLoadSelectFirst && multiInit
        ? onLoadSelectSame
        : onLoadSelectInit,
    onDataChange: onDataChangeInit ?? onDataChangeDef,
    onEditChange: onEditChangeInit ?? onEditChangeDef,
    onEditValidate: onEditValidateInit ?? onEditValidateDef,
    onEditComplete: onEditCompleteInit ?? onEditCompleteDef,
  });

  // Este useEffect se encarga de cargar los datos de la tabla principal (list.data) desde la API.
  // Se ejecuta cada vez que cambia el estado 'list' o la función 'pushQuery'.

  useEffect(() => {
    console.log("1", creandoSolicitud);
    console.log("2", list.loading);
    if (!list.loading && !creandoSolicitud) return;

    const changes = { loading: null, data: [], error: null };

    // Usa list.filtros, no filtros
    const params = {
      ...list.params,
      ...list.filtros,
      pageIndex: list.pagination.index,
      pageSize: list.pagination.size,
    };
    if (list?.filtros?.estado && list?.filtros?.estado !== 0) {
      params.estado = list.filtros.estado;
    } else {
      delete params.estado; // No envíes estado si es "Todos"
    }

    pushQuery({
      action: "GetSolicitudes",
      config: {
        errorType: "response",
        body: params,
      },
      onOk: async ({ data, ...pagination }) => {
        console.log("Datos recibidos de la consulta 1:", data); // <-- Agregá esta línea
        if (Array.isArray(data)) {
          changes.data = data;
          changes.pagination = pagination;
          setSelectedRowId(data[0].id);
        } else {
          console.error("Se esperaba un arreglo", data);
        }
      },
      onError: async (error) => (changes.error = error.toString()),
      onFinally: async () => setList((o) => ({ ...o, ...changes })),
    });
  }, [list, pushQuery, creandoSolicitud]);

  //#region CSV
  const [csv, setCSV] = useState({
    reload: null,
    loading: null,
    filtros: {},
    params: {},
    data: [["CUIT empresa", "Razón social empresa", "Estado", "Cantidad"]],
    error: null,
  });

  useEffect(() => {
    if (!csv.reload) return;
    const titulos = csv.data[0];
    const changes = {
      reload: null,
      loading: "Cargando bloque 1...",
      data: [titulos],
      error: null,
    };
    const query = {
      action: "GetSolicitudes",
      params: {
        ...csv.params,
        ...csv.filtros,
      },
      config: {
        errorType: "response",
      },
    };
    query.onOk = async ({ index, pages, size, data }) => {
      if (Array.isArray(data)) {
        changes.data.push(
          ...AsArray(data).map((r) => [
            r.empresaCUIT,
            r.empresaRazonSocial,
            r.estadoSolicitudDescripcion,
            r.total,
          ])
        );
      } else {
        console.error("Se esperaba un arreglo", data);
      }
      if (index < pages) {
        changes.loading = `Cargando bloque ${index + 1} de ${pages}...`;
        query.params = {
          ...csv.params,
          ...csv.filtros,
          pageIndex: index + 1,
          pageSize: size,
        };
        pushQuery({ ...query });
      } else {
        changes.loading = null;
      }
    };
    query.onError = async (error) => {
      changes.loading = null;
      changes.error = error.toString();
    };
    query.onFinally = async () => {
      setCSV((o) => ({ ...o, ...changes }));
      if (changes.loading) return;
      if (changes.error) return;
      downloadjs(
        ArrayToCSV(changes.data),
        "EstadosSolicitudesEmpresas.csv",
        "text/csv"
      );
    };
    setCSV((o) => ({ ...o, ...changes }));
    pushQuery(query);
  }, [csv, pushQuery]);
  //#endregion

  const onCSV = () => setCSV((o) => ({ ...o, reload: true }));

  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => onCSV(), "AltKey");

  //funcion para obtener la fehcha actual
  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };
  const fechaActual = getCurrentDate();

  ///////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////
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

  useEffect(() => {
    if (!registroSeleccionado?.id || !registroSeleccionado) return;
    pushQuery({
      action: "GetDetallesBySolicitudId",
      params: {
        SolicitudAfiliacionEmpresasId: registroSeleccionado?.id,
        pageIndex: 1,
        pageSize: 12,
      },
      onOk: (data) => {
        console.log("data//", data);
        if (!data || (Array.isArray(data.data) && data.data.length === 0)) {
          setTotalesEmpresa({
            loading: false,
            data: [],
            error: "No hay datos para el CUIT y período seleccionados.",
          });
        } else {
          setTotalesEmpresa({ loading: false, data: data.data, error: null });
        }
      },
    });

    setDeboBuscar(false); // Apago la bandera después de buscar
  }, [registroSeleccionado]);

  const handlerBuscarTotales = () => {
    const cuit = String(empresaSelected.cuit).replace(/\D/g, "");
    const PeriodoDesde = fechaToPeriodo(filtros.desde);
    const PeriodoHasta = fechaToPeriodo(filtros.hasta);

    if (!cuit || !PeriodoDesde || !PeriodoHasta) return;

    setTotalesEmpresa({ loading: true, data: null, error: null });

    pushQuery({
      action: "dataTotalesDesdeApi",
      params: {
        CUIT: cuit,
        PeriodoDesde,
        PeriodoHasta,
      },
      onOk: (data) => {
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setTotalesEmpresa({
            loading: false,
            data: [],
            error: "No hay datos para el CUIT y período seleccionados.",
          });
        } else {
          setTotalesEmpresa({ loading: false, data, error: null });
        }
      },
    });
  };

  const handleModalNuevaSolicitud = () => {
    setTotalesEmpresa({ data: [] });
    setMostrarResultadosBusqueda(false);
    setAutorizacion_afil(true);
    setFiltros((o) => ({
      ...o,
      desde: getFechaTresMesesAtras(),
      hasta: getCurrentDate(), // <-- Setea la fecha actual en "hasta"
    }));
  };

  //Carga de lista según parametros
  useEffect(() => {
    empresasRequest("list", {
      params: paramsSend,
      pagination: { index: 1, size: 5 },
      onLoadSelect: onLoadSelectKeepOrFirst,
    });
  }, [empresasRequest, paramsSend]);
  //#endregion

  //Obtengo la funcion para generar el pdf

  //---------------------------------------------
  const { request: generarPDF } = PDF();
  //----------------------------------------------

  const limpiarBuscadorHandle = () => {
    const paramsEdit = {};
    setParamsEdit(paramsEdit);
    if (JSON.stringify(paramsEdit) === JSON.stringify(paramsSend)) return;
    setParamsSend({ ...paramsEdit });
  };

    const handleRechazaSolicitud = async () => {

        pushQuery({
        action: "PatchEstados", // Acción a ejecutar (ver configuración en pushQuery)
        params: { 
                solicitudId: registroSeleccionado?.id, // ID de la solicitud a actualizar
            }, // Parámetros para la consulta
        config: {
            body: {
                estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Rechazada")?.value,
                estadoSolicitudObservaciones: "string",
                estadoSolicitudUsuario: Usuario?.id,
                estadoFecha: new Date().toISOString()
            }, // Cuerpo de la solicitud PATCH
            },
        onOk: (data) => {
            // Si la respuesta no es un array, muestra error en consola
            setList((o) => ({...o, loading: "Cargando..."}));
            console.log("PAtch Estados:", data);
            
        },
        onError: (error) => (error.toString()), // Guarda el error si ocurre
        });

        if (registroAnalizado) {
            setRechazarAutorizacion(true);
            setAccionSeleccionada("rechazar");
        }
    }  

  const handleAutorizarSolicitud = async () => {

    pushQuery({
      action: "PatchEstados", // Acción a ejecutar (ver configuración en pushQuery)
      params: { 
            solicitudId: registroSeleccionado?.id, // ID de la solicitud a actualizar
           }, // Parámetros para la consulta
    config: {
        body: {
            estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Autorizada")?.value,
            estadoSolicitudObservaciones: "string",
            estadoSolicitudUsuario: Usuario?.id,
            estadoFecha: new Date().toISOString()
        }, // Cuerpo de la solicitud PATCH
        },
      onOk: (data) => {
        // Si la respuesta no es un array, muestra error en consola
        setList((o) => ({...o, loading: "Cargando..."}));
        console.log("PAtch Estados:", data);
        
      },
      onError: (error) => (error.toString()), // Guarda el error si ocurre
    });

    const fechaToPeriodo = (fecha) => {
      if (!fecha) return "";
      const d = new Date(fecha);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}${m}`;
    };
    if (registroAnalizado) {
      setTextInformativo(true);
      setGenerandoPDF(true);
      setAccionSeleccionada("autorizar");
      setCargandoBloques(false);
      setBloqueActual(0);
      setTotalPaginas(0);

      pushQuery({
        action: "dataPFDDesdeApi",
        params: {
          CUIT: registroAnalizado.empresaCUIT,
          PeriodoDesde: fechaToPeriodo(filtros.desde),
          PeriodoHasta: fechaToPeriodo(filtros.hasta),
        },
        onOk: async (dataApi) => {
          console.log("Respuesta de la API para el PDF (onOk):", dataApi);

          if (!dataApi || (Array.isArray(dataApi) && dataApi.length === 0)) {
            alert(
              "No se encontraron datos para el CUIT y período seleccionado."
            );
            setGenerandoPDF(false);
            return;
          }

          // Si la API devuelve un array, usá todos los elementos
          const datosArray = Array.isArray(dataApi) ? dataApi : [dataApi];

          // Mapeo para el PDF (uno por cada registro)
          const datosPDFArray = datosArray.map((datos) => {
            const splitCuil = (cuil) => {
              const str = String(cuil).padStart(11, "0");
              return {
                tipo: str.substring(0, 2),
                id: str.substring(2, 10),
                verificador: str.substring(10, 11),
              };
            };
            const cuilParts = splitCuil(datos.cuil);
            const cuitParts = splitCuil(datos.cuit);
            const fechaPresentacion = datos.presentacionFecha
              ? new Date(datos.presentacionFecha)
              : new Date();
            const fechaNac = { dia: "--", mes: "--", anio: "----" };
            const procesoFechax = datos.procesoFecha
              ? new Date(datos.procesoFecha)
              : new Date();

            // Mapeo para el PDF
            const datosPDF = {
              // Afiliado
              "afiliado.numero": datos.id,

              // Trabajador
              "trabajador.apellidos": datos.afiliadoNombre,
              "trabajador.nombres": "-", // No viene en la API
              "trabajador.cuil.tipo": cuilParts.tipo,
              "trabajador.cuil.id": cuilParts.id,
              "trabajador.cuil.verificador": cuilParts.verificador,
              "trabajador.documento": "-", // No viene en la API
              "trabajador.nacionalidad": "-", // No viene en la API
              "trabajador.nacimiento.fecha": `${fechaNac.dia}/${fechaNac.mes}/${fechaNac.anio}`,
              "trabajador.estado_civil": "-", // No viene en la API
              "trabajador.sexo": "-", // No viene en la API
              "trabajador.domicilio": "-", // No viene en la API
              "trabajador.localidad": datos.zona,
              "trabajador.provincia": "-", // No viene en la API
              "trabajador.oficio": datos.modalidadDescripcion,
              "trabajador.actividad": datos.actividadDescripcion,
              "trabajador.telefono": "-", // No viene en la API
              "trabajador.correo": "-", // No viene en la API

              // Empleador
              "empleador.cuit.tipo": cuitParts.tipo,
              "empleador.cuit.id": cuitParts.cuit,
              "empleador.cuit.verificador": cuitParts.verificador,
              "empleador.razon_social": "-", // No viene en la API
              "empleador.domicilio": "-", // No viene en la API
              "empleador.localidad": "-",
              "empleador.provincia": datos.zona, // No viene en la API
              "empleador.actividad": datos.modalidadDescripcion,
              "empleador.telefono": "-", // No viene en la API
              "empleador.correo": "-", // No viene en la API

              // Carnet (fecha)
              "carnet.fecha.dia": String(procesoFechax.getDate()).padStart(
                2,
                "0"
              ),
              "carnet.fecha.mes": String(procesoFechax.getMonth() + 1).padStart(
                2,
                "0"
              ),
              "carnet.fecha.anio": String(procesoFechax.getFullYear()),

              // Fecha de presentación
              "fecha.dia": String(fechaPresentacion.getDate()).padStart(2, "0"),
              "fecha.mes": String(fechaPresentacion.getMonth() + 1).padStart(
                2,
                "0"
              ),
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
          setDatosPDF(datosPDFArray);

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
        },
        onError: (error) => {
          console.log("Error de la API para el PDF (onError):", error); // <-- LOG SIEMPRE
          if (error?.status === 404) {
            alert(
              "No se encontraron datos para el CUIT y período seleccionado."
            );
          } else {
            alert("No se pudieron obtener los datos para el PDF.");
          }
          setGenerandoPDF(false);
        },
      });
    }
  };

  return (
    <>
      <Modal size="xl" centered show>
        <Modal.Header
          className={modalCss.modalCabecera}
          closeButton
          onClick={() => onClose()}
        >
          SOLICITUDES DE AUTORIZACION DE AFILIACION
        </Modal.Header>
        <AfiliadosTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          // afiliadoSeleccionado={afiliadoSeleccionado}
          // tareas={tareas}
        />
        {/* Renderiza el contenido según la pestaña seleccionada */}
        {selectedTab === 0 && (
          // Tu contenido actual (por ejemplo, la tabla de afiliados)
          <Modal.Body>
            <Grid col full gap="15px">
              <Grid width gap="inherit">
                <Grid grow>
                  <SearchSelectMaterial
                    id="estadoSelect"
                    label="Estado"
                    error={!!estadoSelect.error}
                    helperText={estadoSelect.loading ?? estadoSelect?.error}
                    value={estadoSelect.selected}
                    onChange={(selected) => {
                      setEstadoSelect((o) => ({ ...o, selected }));
                      setFiltros((o) => {
                        const filtros = {
                          ...o,
                          estadoSolicitudId: selected.value,
                        };
                        if (selected === estadoSelectTodos)
                          delete filtros.estadoSolicitudId;
                        return filtros;
                      });
                    }}
                    options={estadoSelect.options}
                    onTextChange={(buscar) =>
                      setEstadoSelect((o) => ({ ...o, buscar }))
                    }
                  />
                </Grid>
                <Grid width="200px">
                  <Button
                    className="botonAzul"
                    disabled={
                      JSON.stringify(list.filtros) === JSON.stringify(filtros)
                    }
                    onClick={() => {
                      setList((o) => ({
                        ...o,
                        filtros,
                        data: [],
                        error: null,
                        loading: "Cargando...",
                        pagination: { ...o.pagination, index: 1 },
                      }));
                      setCSV((o) => ({ ...o, filtros }));
                    }}
                  >
                    Aplica filtros
                  </Button>
                </Grid>
                <Grid width="200px">
                  <Button
                    className="botonAzul"
                    disabled={Object.keys(filtros).length === 0}
                    onClick={() => {
                      const filtros = {};
                      setEstadoSelect((o) => ({
                        ...o,
                        selected: estadoSelectTodos,
                      }));
                      setFiltros(filtros);
                      if (
                        JSON.stringify(list.filtros) === JSON.stringify(filtros)
                      )
                        return;
                      setList((o) => ({
                        ...o,
                        filtros,
                        data: [],
                        error: null,
                        loading: "Cargando...",
                      }));
                      setCSV((o) => ({ ...o, filtros }));
                    }}
                  >
                    Limpia filtros
                  </Button>
                </Grid>
              </Grid>

              {textInformativo === false ? (
                filtros.cuit &&
                list.data.some(
                  (e) => String(e.empresaCUIT) === String(filtros.cuit)
                ) ? (
                  <text style={{ textAlign: "center", color: "red" }}>
                    AUTORIZACION DE AFILIACION PENDIENTE DE AUTORIZAR SOLICITADA
                    EL DIA [{fechaActual}]
                  </text>
                ) : null
              ) : null}

              <div
                style={{
                  width: "100%",
                  height: "auto",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <div
                  style={{ width: "70%", height: "auto", overflowY: "auto" }}
                >
                  <Table
                    remote
                    keyField="id"
                    data={Array.isArray(list.data) ? list.data : []}
                    selectRow={{
                      mode: "radio",
                      hideSelectColumn: true,
                      style: {
                        backgroundColor: "#EEC85E",
                        color: "black",
                        fontWeight: "bold",
                      },
                      clickToSelect: true,
                      selected: selectedRowId ? [selectedRowId] : [],
                      onSelect: (row) => setSelectedRowId(row.id),
                    }}
                    rowEvents={{
                      onClick: (e, row) => setRegistroSeleccionado(row),
                    }}
                    mostrarBuscar={false}
                    pagination={{
                      ...list.pagination,
                      onChange: (pagination) =>
                        setList((o) => ({
                          ...o,
                          loading: "Cargando...",
                          pagination: { ...o.pagination, ...pagination },
                          data: [],
                          error: null,
                        })),
                    }}
                    noDataIndication={
                      list.loading ||
                      list.error ||
                      "No existen datos para mostrar"
                    }
                    columns={[
                      {
                        dataField: "fecha",
                        text: "FECHA",
                        sort: true,
                        formatter: (v) => Formato.Fecha(v),
                        style: { textAlign: "center" },
                        //tamaño de columna
                        headerStyle: { width: "120px" },
                      },
                      {
                        dataField: "empresaCUIT",
                        text: "CUIT",
                        formatter: (v) => Formato.Cuit(v),
                        style: { textAlign: "center" },
                        headerStyle: { width: "140px" },
                      },
                      {
                        dataField: "empresaDescripcion",
                        text: "RAZON SOCIAL EMPRESA",
                        sort: true,
                        style: { textAlign: "left" },
                      },
                      {
                        dataField: "seccionalCodigo",
                        text: "CODIGO SECCIONAL",
                        sort: true,
                        style: { textAlign: "left" },
                        headerStyle: { width: "120px" },
                      },
                      {
                        dataField: "estado",
                        text: "ESTADO",
                        sort: true,
                        style: { textAlign: "left" },
                        headerStyle: { width: "120px" },
                      },
                    ]}
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
                          setList((o) => ({
                            ...o,
                            loading: "Cargando...",
                            params: { ...o.params, sortBy },
                            data: [],
                            error: null,
                          }));
                          setCSV((o) => ({
                            ...o,
                            params: { ...o.params, sortBy },
                          }));
                          return;
                        }
                        default:
                          return;
                      }
                    }}
                  />
                </div>
                {/* -----------------*/}
                <div
                  style={{
                    width: "30%",
                    height: "auto",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Modal.Footer>
                    <Grid gap="20px" col marginTop="10px">
                      {/* ACTUALMENTE ESTA DESACTIVADO, SE ACTIVA UNICAMENTE CUANDO SE "ANALIZA CUIT" */}
                      <Grid width="auto">
                        <Button
                          className="botonAmarillo"
                          loading={!!csv.loading}
                          onClick={() => {
                            handleModalNuevaSolicitud();
                          }}
                        >
                          SOLICITAR NUEVA AUTORIZACION AFILIACION
                        </Button>
                      </Grid>

                      <Grid width="auto">
                        <Button
                          className="botonAmarillo"
                          onClick={() => handleAutorizarSolicitud()}
                          disabled={
                            registroSeleccionado?.estadoSolicitudId == estadoSelect?.options.find((o) => o?.label === "Pendiente")?.value
                              ? false
                              : true
                          }
                        >
                          {generandoPDF ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span className="spinner-border spinner-border-sm" />
                              <span
                                style={{ fontWeight: "bold", marginTop: 8 }}
                              >
                                Generando PDF...
                              </span>
                              {cargandoBloques && totalPaginas > 0 && (
                                <span
                                  style={{ fontWeight: "bold", marginTop: 8 }}
                                >
                                  Cargando bloque {bloqueActual} de{" "}
                                  {totalPaginas}...
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              AUTORIZAR SOLICITUD AFILIACION{" "}
                              {registroAnalizado?.cuil ||
                                registroAnalizado?.empresaCUIT ||
                                ""}
                            </>
                          )}
                        </Button>
                      </Grid>
                      <Grid width="auto">
                        <Button
                          className="botonAmarillo"
                          onClick={() => {
                            if (pdfGenerado) {
                              downloadjs(
                                pdfGenerado,
                                "SolicitudAfiliacion.pdf"
                              );
                            }
                          }}
                          disabled={true}
                             //registroSeleccionado?.estadoSolicitudId == estadoSelect?.options.find((o) => o?.label === "Autorizada")?.value ? false : true}
                        >
                          DESCARGAR FORMULARIO DE AFILIACIONES
                        </Button>
                      </Grid>
                      <Grid width="auto">
                        <Button
                          className="botonAmarillo"
                          loading={!!csv.loading}
                          onClick={()=>handleRechazaSolicitud()}
                          disabled={
                            registroSeleccionado?.estadoSolicitudId == estadoSelect?.options.find((o) => o?.label === "Pendiente")?.value
                              ? false
                              : true
                          }
                        >
                          RECHAZAR SOLICITUD DE AFILIACION{" "}
                          {registroAnalizado?.cuil ||
                            registroAnalizado?.empresaCUIT ||
                            ""}
                        </Button>
                      </Grid>
                      <Grid width="auto"></Grid>

                      {csv.loading == null ? null : (
                        <text style={{ color: "green" }}>{csv.loading}</text>
                      )}
                      {csv.error == null ? null : (
                        <text style={{ color: "red" }}>{csv.error}</text>
                      )}
                    </Grid>
                  </Modal.Footer>
                </div>
              </div>
            </Grid>
            <div style={{ width: "100%", alignSelf: "center", height: "auto" }}>
              <InformacionDetallada
                config={{ data: registroSeleccionado }}
                onClose={() => setRegistroSeleccionado(null)}
              />
            </div>
          </Modal.Body>
        )}
        {/* ///////////////////////////////////////////////
            //////////////////////////////////////////////
                        ///////////////////////////////////////////////
            ////////////////////////////////////////////// */}
        {selectedTab === 1 && (
          // Componente para DETALLE DE SOLICITUD AFILIADO
          // <DDJJUatreComponent />
          //--------------------------------------------
          //--------------------------------------------
          //............................................
          //////////////////////////////////////////////
          /////////////////////////////////////////////
          <Modal.Body size="xl" maxHeight="100%" centered >
            <Grid col full
                style={{
                    minHeight: 600,
                    maxHeight: 550,
                    overflowY: "auto",
                }}
            >
                 
                <Grid width="100%" display="flex" justifyContent="center">
                    <th style={{  width: "33.3%"}} className="text-center">
                            
                    </th>
                    <th style={{ border: "1px solid black", borderBottom: "none", width:"50%" }} className="text-center">
                        TRABAJADORES RURALES
                    </th>
                    <th style={{ border: "1px solid black", borderBottom: "none", width:"50%" }} className="text-center">
                        TRABAJADORES NO RURALES
                    </th>
                </Grid>

              <Table
                mostrarBuscar={false}
                remote
                keyField="empresaCUIT"
                data={
                  Array.isArray(totalesEmpresa.data) &&
                  totalesEmpresa.data.length > 0
                    ? totalesEmpresa.data
                    : []
                }
                noDataIndication={
                  totalesEmpresa.loading
                    ? "Cargando..."
                    : totalesEmpresa.error
                    ? totalesEmpresa.error
                    : "No hay datos para el CUIT y período seleccionados."
                }
                //MODIFICACIONE TABLA DETALLE DE SOLICITUD AFILIADO
                columns={[
                  // { dataField: "periodo", text: "Periodo", style: { textAlign: "center" } },
                  {
                    dataField: "periodo",
                    text: "Periodo",
                    style: { textAlign: "center" },
                    formatter: (periodo) => {
                      if (!periodo) return "";
                      const anio = String(periodo).substring(0, 4);
                      const mes = String(periodo).substring(4, 6);
                      return `${mes}/${anio}`;
                    },
                  },
                  {
                          dataField: "total_Trabajadores",
                          text: "Total General",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_Rurales",
                          text: "Totales",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_Rurales_Afiliados",
                          text: "Afiliados",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_Rurales_NoAfiliados",
                          text: "No Afiliados",
                          style: { textAlign: "center" },
                        },

                        {
                          dataField: "total_Trab_NoRurales",
                          text: "Totales",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_NoRurales_Afiliados",
                          text: "Afiliados",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_NoRurales_NoAfiliados",
                          text: "No Afiliados",
                          style: { textAlign: "center" },
                        },
                ]}
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
                      setList((o) => ({
                        ...o,
                        loading: "Cargando...",
                        params: { ...o.params, sortBy },
                        data: [],
                        error: null,
                      }));
                      setCSV((o) => ({
                        ...o,
                        params: { ...o.params, sortBy },
                      }));
                      return;
                    }
                    default:
                      return;
                  }
                }}
              />
            </Grid>
          </Modal.Body>
        )}

        <Modal
          size="lg"
          centered
          show={rechazarAutorizacion}
          onHide={() => setRechazarAutorizacion(false)}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header
            className={modalCss.modalCabecera}
            closeButton
            onClick={() => setRechazarAutorizacion(false)}
          >
            Rechazar autorización de afiliación
          </Modal.Header>
          <Modal.Body>
            <InputMaterial
              label="Observaciones"
              value={filtros.observaciones}
              maxLength={30}
              onChange={(observaciones) =>
                setFiltros((o) => {
                  const r = { ...o, observaciones };
                  if (!observaciones) delete r.observaciones;
                  return r;
                })
              }
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="botonAmarillo"
              onClick={() => {
                // alert("Se ha rechazado la solicitud de afiliación para el CUIT ingresado");
                setRechazarAutorizacion(false);
              }}
            >
              Aceptar
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          size="xl"
          maxHeight="100%"
          centered
          show={autorizacion_afil}
          onHide={() => setAutorizacion_afil(false)}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header
            className={modalCss.modalCabecera}
            closeButton
            onClick={() => {
              setAutorizacion_afil(false);
              setMostrarTableEmpresas(false);
              limpiarBuscadorHandle();
            }}
          >
            Solicitar autorización de afiliación
          </Modal.Header>
          <Modal.Body>
            <Grid col full gap="15px">
              <Grid width gap="inherit">
                <Grid col gap="10px">
                  {/* Mostrar tabla si hay resultados */}
                  <Grid width col gap="10px">
                    <Grid />
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
                            setMostrarTableEmpresas(true);
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
                      setDeboBuscar(true); // Solo buscar cuando tocamos
                      setMostrarResultadosBusqueda(true); // Opcional: ocultar resultados de la búsqueda anterior
                      setMensajeExito(
                        `Información del CUIT ${
                          empresaSelected.cuit
                        } en el período ${formatFechaMesAnio(
                          filtros.desde
                        )} a ${formatFechaMesAnio(filtros.hasta)}.`
                      );
                      handlerBuscarTotales();
                    }}
                  >
                    
                    {`ANALIZAR ${empresaSelected?.razonSocial.slice(0, 20)}...`}
                  </Button>
                </Grid>
              </Grid>
              <Modal.Body>
                <div
                  style={{ minHeight: 350, maxHeight: 550, overflowY: "auto" }}
                >
                  {mensajeExito && (
                    <div
                      style={{
                        backgroundColor: "#d4edda",
                        padding: "10px",
                        borderRadius: "5px",
                        color: "#155724",
                        marginBottom: "15px",
                        textAlign: "center",
                      }}
                    >
                      {mensajeExito}
                    </div>
                  )}
                  {
                     <Grid col >
                        <Grid width="100%" display="flex" justifyContent="center">
                            <th style={{  width: "33.3%"}} className="text-center">
                                 
                            </th>
                            <th style={{ border: "1px solid black", borderBottom: "none", width:"50%" }} className="text-center">
                                TRABAJADORES RURALES
                            </th>
                            <th style={{ border: "1px solid black", borderBottom: "none", width:"50%" }} className="text-center">
                                TRABAJADORES NO RURALES
                            </th>
                        </Grid>
                        <Table
                        mostrarBuscar={false}
                        remote
                        keyField="periodo"
                        data={
                            Array.isArray(totalesEmpresa?.data) &&
                            totalesEmpresa?.data?.length > 0
                            ? totalesEmpresa?.data
                            : []
                        }
                        noDataIndication={
                            totalesEmpresa?.loading?.length > 0
                            ? "Cargando..."
                            : analizarSeleccionado === true
                            ? "No hay datos para el período seleccionados."
                            : null
                        }
                        columns={[
                        {
                          dataField: "periodo",
                          text: "Periodo",
                          style: { textAlign: "center" },
                          formatter: (periodo) => {
                            if (!periodo) return "";
                            const anio = String(periodo).substring(0, 4);
                            const mes = String(periodo).substring(4, 6);
                            return `${mes}/${anio}`;
                          },
                        },
                        {
                          dataField: "total_Trabajadores",
                          text: "Total General",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_Rurales",
                          text: "Totales",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_Rurales_Afiliados",
                          text: "Afiliados",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_Rurales_NoAfiliados",
                          text: "No Afiliados",
                          style: { textAlign: "center" },
                        },

                        {
                          dataField: "total_Trab_NoRurales",
                          text: "Totales",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_NoRurales_Afiliados",
                          text: "Afiliados",
                          style: { textAlign: "center" },
                        },
                        {
                          dataField: "total_Trab_NoRurales_NoAfiliados",
                          text: "No Afiliados",
                          style: { textAlign: "center" },
                        },
                      ]}
                      //-----------------------------------------------------------------------------------------------
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
                            setList((o) => ({
                              ...o,
                              loading: "Cargando...",
                              params: { ...o.params, sortBy },
                              data: [],
                              error: null,
                            }));
                            setCSV((o) => ({
                              ...o,
                              params: { ...o.params, sortBy },
                            }));
                            return;
                          }
                          default:
                            return;
                        }
                      }}
                    />
                    </Grid>
                    
                  }
                </div>
                {/* Botones debajo de la tabla */}
                <Grid
                  width="100%"
                  justify="center"
                  gap="20px"
                  style={{ marginTop: 20 }}
                >
                  <Button
                    className="botonAzul"
                    disabled={
                      !(
                        Array.isArray(totalesEmpresa.data) &&
                        totalesEmpresa.data.length > 0
                      )
                    }
                    onClick={() => {
                      // Armo el objeto POST:
                      const datos = {
                        fecha: new Date().toISOString(),
                        seccionalId: null,
                        empresaId: empresaSelected?.id ?? 0,
                        estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Pendiente")?.value,
                        estadoFecha: new Date().toISOString(),
                        estadoSolicitudObservaciones:
                          filtros.observaciones || "Sin observaciones",
                        estadoSolicitudUsuario:
                          ambito?.username || "desconocido",
                        solicitudAfiliacionEmpresasDetalle: Array.isArray(
                          totalesEmpresa.data
                        )
                          ? totalesEmpresa.data.map((item) => ({
                              periodo: item.periodo,
                              total_Trabajadores: item.total_Trabajadores,
                              total_Trab_Rurales: item.total_Trab_Rurales,
                              total_Trab_NoRurales: item.total_Trab_NoRurales,
                              total_Trab_Rurales_Afiliados:
                                item.total_Trab_Rurales_Afiliados,
                              total_Trab_Rurales_NoAfiliados:
                                item.total_Trab_Rurales_NoAfiliados,
                              total_Trab_NoRurales_Afiliados:
                                item.total_Trab_NoRurales_Afiliados,
                              total_Trab_NoRurales_NoAfiliados:
                                item.total_Trab_NoRurales_NoAfiliados,
                            }))
                          : [],
                      };

                      console.log("Enviando datos:", datos); // Por las dudas
                      crearSolicitud(datos); // <-- ACÁ HACEMOS EL POST

                      // Limpiás después:
                      setRegistroAnalizado(registroAnalizadoTemporal);
                      setAutorizacion_afil(false);
                      setRegistroAnalizadoTemporal(null);
                      setAnalizarCuil(false);
                    }}
                  >
                    {creandoSolicitud ? "Enviando..." : "Confirma"}
                  </Button>

                  <Button
                    className="botonAmarillo"
                    onClick={() => {
                      setMostrarTableEmpresas(false);
                      limpiarBuscadorHandle();

                      setRegistroAnalizadoTemporal(null);
                      setAnalizarCuil(false);
                      setAutorizacion_afil(false);

                      // Limpiar todo
                      setFiltros({
                        desde: "", // o getFechaTresMesesAtras() si querés resetear fecha
                        hasta: "",
                        cuit: "",
                        razonSocial: "",
                        estado: 0,
                        observaciones: "", // si tenés observaciones
                      });

                      setBusquedaEmpresa("");
                      setResultadosEmpresa([]);
                      setMensajeExito("");
                      setTotalesEmpresa({
                        loading: false,
                        data: null,
                        error: null,
                      });
                    }}
                  >
                    Cancela
                  </Button>
                </Grid>
              </Modal.Body>
            </Grid>
          </Modal.Body>
        </Modal>
      </Modal>
    </>
  );
};
export default SolicitudAutorizacionAfiliacion;
