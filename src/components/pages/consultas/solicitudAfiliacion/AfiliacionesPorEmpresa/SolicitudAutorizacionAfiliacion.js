
//----------------------------------------------------------------------------------------
//////////////////////////////////////////////////////////////////////////////////////////


import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import downloadjs from "downloadjs";
import ArrayToCSV from "components/helpers/ArrayToCSV";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
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

// import PDFViewer from "./AfiliacionPDF/PDFViewer";

import { PDF } from "./AfiliacionPDF/PDF";
import dataFicticia from "./AfiliacionPDF/data.json";
import InformacionDetallada from "./InformacionDetallada"





const onCloseDef = () => {};





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

const SolicitudAutorizacionAfiliacion = ({ onClose = onCloseDef }) => {
    //#region Trato queries a APIs
    const pushQuery = useQueryQueue((action) => {
        switch (action) {
            case "GetData": {
                return {
                    config: {
                        baseURL: "Estadisticas",
                        endpoint: `/Afiliados/EmpresasAfiliadosEstados`,
                        method: "GET",
                    },
                };
            }
            case "GetEstados": {
                return {
                    config: {
                        baseURL: "Afiliaciones",
                        endpoint: `/EstadoSolicitud`,
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
    const [autorizacion_afil, setAutorizacion_afil] = useState(false)


    const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
    
    const [accionSeleccionada, setAccionSeleccionada] = useState(null); // 'rechazar' | 'autorizar' | null
    const [generandoPDF, setGenerandoPDF] = useState(false);

    const [pdfGenerado, setPdfGenerado] = useState(null);


   
    const [analizarCuil, setAnalizarCuil] = useState(false);


    const [registroAnalizado, setRegistroAnalizado] = useState(null);

    const [cargandoBloques, setCargandoBloques] = useState(false);
    const [bloqueActual, setBloqueActual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);





    //-----------------------------------------------------------



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
        reload: null,            // Ya no se necesita recargar
        loading: "Cargando...",  // Muestra mensaje de carga
        data: [],                // Limpia datos anteriores
        error: null,             // Limpia errores anteriores
        buscar: "",              // Limpia búsqueda previa
        options: [],             // Limpia opciones previas
    };

    // Actualiza el estado para reflejar que está cargando
    setEstadoSelect((o) => ({ ...o, ...changes }));

    // Llama a la API para obtener los estados
    pushQuery({
        action: "GetEstados",                // Acción a ejecutar (ver configuración en pushQuery)
        params: { ...estadoSelect.params },  // Parámetros para la consulta
        onOk: (data) => {
            // Si la respuesta no es un array, muestra error en consola
            if (!Array.isArray(data))
                return console.error("Se esperaba un arreglo", data);
            // Si es un array, guarda los datos en 'changes'
            changes.data = data;
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
        pagination: { index: 1, size: 10 },
        filtros: {},
        params: {},
        data: [],
        error: null,
    });

// Este useEffect se encarga de cargar los datos de la tabla principal (list.data) desde la API.
// Se ejecuta cada vez que cambia el estado 'list' o la función 'pushQuery'.

useEffect(() => {
    if (!list.loading) return;

    const changes = { loading: null, data: [], error: null };

    // Usa list.filtros, no filtros
    const params = {
        ...list.params,
        ...list.filtros,
        pageIndex: list.pagination.index,
        pageSize: list.pagination.size,
    };
    if (list.filtros.estado && list.filtros.estado !== 0) {
        params.estado = list.filtros.estado;
    } else {
        delete params.estado; // No envíes estado si es "Todos"
    }

    pushQuery({
        action: "GetData",
        params,
        config: {
            errorType: "response",
        },
        onOk: async ({ data, ...pagination }) => {
            if (Array.isArray(data)) {
                changes.data = data;
                changes.pagination = pagination;
            } else {
                console.error("Se esperaba un arreglo", data);
            }
        },
        onError: async (error) => (changes.error = error.toString()),
        onFinally: async () => setList((o) => ({ ...o, ...changes })),
    });
}, [list, pushQuery]);
    //#endregion

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
            action: "GetData",
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
}
 const fechaActual = getCurrentDate();



///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

//Obtengo la funcion para generar el pdf

//---------------------------------------------
const { request: generarPDF } = PDF();
//----------------------------------------------



    return (
        <>
       
                <Modal size="xl" centered show >
        <Modal.Header className={modalCss.modalCabecera} closeButton onClick={() => onClose()}>
            SOLICITUDES DE AUTORIZACION DE AFILIACION  
        </Modal.Header>
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
                                                        pagination: {...o.pagination, index: 1 },
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
                                                    if (JSON.stringify(list.filtros) === JSON.stringify(filtros))
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
               
                {
                        

                    textInformativo === false ?
                    (
                        filtros.cuit &&
                        list.data.some(e => String(e.empresaCUIT) === String(filtros.cuit))
                        
                    ) ? <text style={{textAlign: "center", color: "red"}}>AUTORIZACION DE AFILIACION PENDIENTE DE AUTORIZAR SOLICITADA EL DIA [{fechaActual}]</text> : null
                    :
                    null
                }
                    
                <div style={{ width: "100%", height: "auto", overflowY: "auto", display: "flex", flexDirection: "row" }}>
                    <div style={{ width: "70%", height: "auto", overflowY: "auto"}}>
                <Table
                    remote
                    keyField="id"
                    data={Array.isArray(list.data) ? list.data : []}
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
                        list.loading || list.error || "No existen datos para mostrar "
                    }
                    columns={[
                        {
                            dataField: "procesoFecha",
                            text: "Fecha",
                            sort: true,
                            formatter: (v) => Formato.Fecha(v),
                            style: { textAlign: "center" },
                        },
                         {
                            dataField: "empresaCUIT",
                            text: "Cuit",
                            formatter: (v) => Formato.Cuit(v),
                            style: { textAlign: "right" },
                        },
                        {
                            dataField: "empresaRazonSocial",
                            text: "Razón social empresa",
                            sort: true,
                            style: { textAlign: "left" },
                        },
                        {
                            dataField: "estadoSolicitudDescripcion",
                            text: "Estado",
                            sort: true,
                            style: { textAlign: "left" },
                        },
                       
                    ]}
                    onTableChange={(type, { sortOrder, sortField }) => {
                        switch (type) {
                            case "sort": {
                                sortField =
                                    { empresaCUIT: "cuit", empresaRazonSocial: "razonsocial" }[
                                        sortField
                                    ] ?? sortField;
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
                                setCSV((o) => ({ ...o, params: { ...o.params, sortBy } }));
                                return;
                            }
                            default:
                                return;
                        }
                    }}
                />
                {registroSeleccionado && (

                     <InformacionDetallada afiliado={registroSeleccionado} />
                     
                )}

                    </div>
                {/* -----------------*/}
                    <div style={{ width: "30%", height: "auto", justifyContent: "center", alignItems: "center" }}>
              <Modal.Footer>
    
                <Grid gap="20px" col marginTop="10px" >
                    
                 

                    {/* ACTUALMENTE ESTA DESACTIVADO, SE ACTIVA UNICAMENTE CUANDO SE "ANALIZA CUIT" */}
                    <Grid width="auto">
                        <Button
                            className="botonAmarillo"
                            loading={!!csv.loading}
                            // onClick={() => onCSV()}
                            tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
            
                             onClick={() => {
                            //    alert("Analizando CUIT...");
                               setAutorizacion_afil(true);
                            }}
                            
                        >
                            SOLICITAR NUEVA AUTORIZACION AFILIACION
                        </Button>
                    </Grid>

                     
   
                    <Grid width="auto">

                    <Button
                        className="botonAmarillo"
                        loading={!!csv.loading}
                        onClick={() => {
                            if (registroAnalizado) {
                                setRechazarAutorizacion(true);
                                setAccionSeleccionada('rechazar');
                            }
                        }}
                        tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
                        disabled={accionSeleccionada === 'autorizar' || !registroAnalizado}
                    >
                        RECHAZAR SOLICITUD DE AFILIACION {registroAnalizado?.cuil || registroAnalizado?.empresaCUIT || ""}
                    </Button>

                </Grid>
                <Grid width="auto">
                   



<Button
    className="botonAmarillo"
    tarea="Consultas_SolicitudAfiliacion"
    onClick={async () => {
        if (registroAnalizado) {
            setTextInformativo(true);
            setGenerandoPDF(true);
            setAccionSeleccionada('autorizar');
            setCargandoBloques(false);
            setBloqueActual(0);
            setTotalPaginas(0);

            // 1. Generar el PDF y obtener el base64 original (con prefijo)
            let base64Original = null;
            await generarPDF({
                data: dataFicticia,
                onLoad: (b64) => {
                    base64Original = b64;
                }
            });

            // 2. Validar y limpiar prefijo solo para pdf-lib
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

            // 3. Contar páginas del PDF generado (usando pdf-lib)
            const { PDFDocument } = await import("pdf-lib");
            const pdfBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const paginas = pdfDoc.getPageCount();
            setTotalPaginas(paginas);
            setCargandoBloques(true);

            // 4. Simular carga de bloques/páginas
            for (let i = 1; i <= paginas; i++) {
                setBloqueActual(i);
                await new Promise(res => setTimeout(res, 300));
            }

            setCargandoBloques(false);
            setGenerandoPDF(false);
            setPdfGenerado(base64Original); // <-- Guardá el base64 original para la descarga
        }
    }}
            disabled={
                accionSeleccionada === 'rechazar' ||
                generandoPDF ||
                !registroAnalizado ||
                !!pdfGenerado // <--- Deshabilita si ya hay PDF generado
            }
        >
            {generandoPDF ? (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                }}>
                    <span className="spinner-border spinner-border-sm" />
                    <span style={{ fontWeight: "bold", marginTop: 8 }}>
                        Generando PDF...
                    </span>
                    {cargandoBloques && totalPaginas > 0 && (
                        <span style={{ fontWeight: "bold", marginTop: 8 }}>
                            Cargando bloque {bloqueActual} de {totalPaginas}...
                        </span>
                    )}
                </div>
            ) : (
                <>AUTORIZAR SOLICITUD AFILIACION {registroAnalizado?.cuil || registroAnalizado?.empresaCUIT || ""}</>
            )}
        </Button>


                </Grid>
                <Grid width="auto">
                
                <Button
            className="botonAmarillo"
            tarea="Consultas_SolicitudAfiliacion"
            onClick={() => {
                if (pdfGenerado) {
                    downloadjs(pdfGenerado, "SolicitudAfiliacion.pdf");
                }
            }}
            disabled={!pdfGenerado}
        >
            DESCARGAR FORMULARIO DE AFILIACIONES
        </Button>

                      
                </Grid>

                     <Grid width="auto">
                
                </Grid>

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

        </Modal.Body>




        { /* Modal de confirmación de rechazo de autorización */}
        <Modal
            size="sm"
            centered
            show={rechazarAutorizacion}
            onHide={() => setRechazarAutorizacion(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header className={modalCss.modalCabecera} closeButton onClick={() => setRechazarAutorizacion(false)}>
                Rechazar autorización de afiliación
            </Modal.Header>
            <Modal.Body>
                {/* <text style={{ textAlign: "center", color: "red" }}>
                    ¿Está seguro que desea rechazar la autorización de afiliación?
                </text> */}
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
        {/* Modal de confirmación de autorización de afiliación */}
        {/* ///////////////////////////////////////////////////////////////////////
        // ////////////////////////////////////////////////////////////////////////
        // ///////////////////////////////////////////////////////////////////////
        // /////////////////////////////////////////////////////////////////////// */}

        <Modal
            size="xl"
            height= "100%"
            centered
            show={autorizacion_afil}
            onHide={() => setAutorizacion_afil(false)}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header className={modalCss.modalCabecera} closeButton onClick={() => setAutorizacion_afil(false)}>
                Solicitar autorización de afiliación
            </Modal.Header>
                    <Modal.Body>
            <Grid col full gap="15px">
                <Grid width gap="inherit">
                    <Grid width="200px">
                      
                        <InputMaterial
                            label="CUIT empresa"
                            mask={CUITMask}
                            value={filtros.cuit}
                            onChange={(cuit) => {
                                setFiltros((o) => ({ ...o, cuit }));
                                setAnalizarCuil(false);
                            }}
                        />
                    </Grid>
                    <Grid grow>
                        <InputMaterial
                            label="Razón social empresa"
                            value={filtros.razonSocial}
                            onChange={(razonSocial) =>
                                setFiltros((o) => {
                                    const r = { ...o, razonSocial };
                                    if (!razonSocial) delete r.razonSocial;
                                    return r;
                                })
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
                            onChange={(desde) => {
                                setFiltros((o) => ({ ...o, desde }));
                                setAnalizarCuil(false);
                            }}
                        />
                    </Grid>
                    <Grid width="auto">
                      
                        <InputMaterial
                            label="Hasta"
                            type="date"
                            value={filtros.hasta || ""}
                            onChange={(hasta) => {
                                setFiltros((o) => ({ ...o, hasta }));
                                setAnalizarCuil(false);
                            }}
                        />
                    </Grid>


                    <Grid width="auto">
                
                   <Button
                        className="botonAmarillo"
                        disabled={
                            !(filtros.cuit && filtros.desde && filtros.hasta)
                        }
                        onClick={() => {
                            setAnalizarCuil(true);
                            // Buscá el primer registro que coincida con el CUIT filtrado
                            const registro = Array.isArray(list.data)
                                ? list.data.find(row => String(row.empresaCUIT) === String(filtros.cuit))
                                : null;
                            setRegistroAnalizado(registro || null);
                        }}
                    >
                        ANALIZAR CUIL
                    </Button>
                </Grid>
             
                </Grid>
        <Modal.Body>
                    {/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */}
                    {/*|||||||||||||||||||||||||||||||||SUB TABLA||||||||||||||||||||||||||||||||||| */}
                    {/*||||||||||||||||||||||SOLICITAR NUEVA AUTORIZACION||||||||||||||||||||||||||| */}
                    {/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */}
                <Table
                   
                       remote
                        keyField="id"
                        data={
                            analizarCuil && filtros.cuit && filtros.desde && filtros.hasta
                                ? (Array.isArray(list.data)
                                    ? list.data.filter(row => {
                                        const cuitOk = String(row.empresaCUIT) === String(filtros.cuit);
                                        // Si querés filtrar por fecha, agregalo acá
                                        return cuitOk;
                                    })
                                    : [])
                                : []
                        }
                           
                        noDataIndication={
                            filtros.cuit && filtros.desde && filtros.hasta
                                ? (list.loading || list.error || "Sin datos para el CUIT y fechas ingresados")
                                : "Ingrese CUIT y rango de fechas para ver datos"
                        }
                    columns={[
                        {
                            dataField: "empresaCUIT",
                            text: "Periodo",
                            sort: true,
                            formatter: (v) => Formato.Cuit(v),
                            style: { textAlign: "center" },
                        },
                        {
                            dataField: "empresaCUIT",
                            text: "Cant.Tot.Trab",
                            sort: true,
                            formatter: (v) => Formato.Cuit(v),
                            style: { textAlign: "center" },
                        },
                        {
                            dataField: "empresaRazonSocial",
                            text: "Cant.Trab.Rural",
                            sort: true,
                            style: { textAlign: "left" },
                        },
                        {
                            dataField: "estadoSolicitudDescripcion",
                            text: "Cant.Trab.No.Rural",
                            sort: true,
                            style: { textAlign: "left" },
                        },
                        {
                            dataField: "total",
                            text: "Cant.Trab.Rural.Afi",
                            formatter: (v) => Formato.Numero(v),
                            style: { textAlign: "right" },
                        },
                         {
                            dataField: "empresaRazonSocial",
                            text: "Cant.Trab.Rural.No.Afi",
                            sort: true,
                            style: { textAlign: "left" },
                        },
                        {
                            dataField: "estadoSolicitudDescripcion",
                            text: "Cant.Trab.No.Rural.Afi",
                            sort: true,
                            style: { textAlign: "left" },
                        },
                        {
                            dataField: "total",
                            text: "Cant.Trab.No.Rural.No.Afi",
                            formatter: (v) => Formato.Numero(v),
                            style: { textAlign: "right" },
                        },
                    ]}
                    onTableChange={(type, { sortOrder, sortField }) => {
                        switch (type) {
                            case "sort": {
                                sortField =
                                    { empresaCUIT: "cuit", empresaRazonSocial: "razonsocial" }[
                                        sortField
                                    ] ?? sortField;
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
                                setCSV((o) => ({ ...o, params: { ...o.params, sortBy } }));
                                return;
                            }
                            default:
                                return;
                        }
                    }}
                />
                
            </Modal.Body>
            </Grid>
        </Modal.Body>

       
            
        </Modal>



    </Modal>



        </>



    
    );

}
export default SolicitudAutorizacionAfiliacion;






























