


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

    //#region filtros
    const [filtros, setFiltros] = useState({});

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

    useEffect(() => {
        if (!estadoSelect.reload) return;
        const changes = {
            reload: null,
            loading: "Cargando...",
            data: [],
            error: null,
            buscar: "",
            options: [],
        };
        setEstadoSelect((o) => ({ ...o, ...changes }));
        pushQuery({
            action: "GetEstados",
            params: { ...estadoSelect.params },
            onOk: (data) => {
                if (!Array.isArray(data))
                    return console.error("Se esperaba un arreglo", data);
                changes.data = data;
            },
            onError: (error) => (changes.error = error.toString()),
            onFinally: () =>
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

    useEffect(() => {
        if (!list.loading) return;
        const changes = { loading: null, data: [], error: null };
        pushQuery({
            action: "GetData",
            params: {
                ...list.params,
                ...list.filtros,
                pageIndex: list.pagination.index,
                pageSize: list.pagination.size,
            },
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

    // return (
    //     <Modal size="xl" centered show >
    //         <Modal.Header className={modalCss.modalCabecera} closeButton onClick={() => onClose()}>
    //             Estados de solicitudes por empresa
    //         </Modal.Header>
    //         <Modal.Body>
    //             <Grid col full gap="15px">
    //                 <Grid width gap="inherit">
    //                     <Grid width="200px">
    //                         <InputMaterial
    //                             label="CUIT empresa"
    //                             //mask="99\-99.999.999\-9"
    //                             mask={CUITMask}
    //                             value={filtros.cuit}
    //                             onChange={(cuit) =>
    //                                 setFiltros((o) => {
    //                                     cuit = cuit.replace(/[^0-9]+/g, "");
    //                                     const r = { ...o, cuit };
    //                                     if (!cuit) delete r.cuit;
    //                                     return r;
    //                                 })
    //                             }
    //                         />
    //                     </Grid>
    //                     <Grid grow>
    //                         <InputMaterial
    //                             label="Razón social empresa"
    //                             value={filtros.razonSocial}
    //                             onChange={(razonSocial) =>
    //                                 setFiltros((o) => {
    //                                     const r = { ...o, razonSocial };
    //                                     if (!razonSocial) delete r.razonSocial;
    //                                     return r;
    //                                 })
    //                             }
    //                         />
    //                     </Grid>
    //                 </Grid>
    //                 <Grid width gap="inherit">
    //                     <Grid grow>
    //                         <SearchSelectMaterial
    //                             id="estadoSelect"
    //                             label="Estado"
    //                             error={!!estadoSelect.error}
    //                             helperText={estadoSelect.loading ?? estadoSelect?.error}
    //                             value={estadoSelect.selected}
    //                             onChange={(selected) => {
    //                                 setEstadoSelect((o) => ({ ...o, selected }));
    //                                 setFiltros((o) => {
    //                                     const filtros = {
    //                                         ...o,
    //                                         estadoSolicitudId: selected.value,
    //                                     };
    //                                     if (selected === estadoSelectTodos)
    //                                         delete filtros.estadoSolicitudId;
    //                                     return filtros;
    //                                 });
    //                             }}
    //                             options={estadoSelect.options}
    //                             onTextChange={(buscar) =>
    //                                 setEstadoSelect((o) => ({ ...o, buscar }))
    //                             }
    //                         />
    //                     </Grid>
    //                     <Grid width="200px">
    //                         <Button
    //                             className="botonAzul"
    //                             disabled={
    //                                 JSON.stringify(list.filtros) === JSON.stringify(filtros)
    //                             }
    //                             onClick={() => {
    //                                 setList((o) => ({
    //                                     ...o,
    //                                     filtros,
    //                                     data: [],
    //                                     error: null,
    //                                     loading: "Cargando...",
    //                                     pagination: {...o.pagination, index: 1 },
    //                                 }));
    //                                 setCSV((o) => ({ ...o, filtros }));
    //                             }}
    //                         >
    //                             Aplica filtros
    //                         </Button>
    //                     </Grid>
    //                     <Grid width="200px">
    //                         <Button
    //                             className="botonAzul"
    //                             disabled={Object.keys(filtros).length === 0}
    //                             onClick={() => {
    //                                 const filtros = {};
    //                                 setEstadoSelect((o) => ({
    //                                     ...o,
    //                                     selected: estadoSelectTodos,
    //                                 }));
    //                                 setFiltros(filtros);
    //                                 if (JSON.stringify(list.filtros) === JSON.stringify(filtros))
    //                                     return;
    //                                 setList((o) => ({
    //                                     ...o,
    //                                     filtros,
    //                                     data: [],
    //                                     error: null,
    //                                     loading: "Cargando...",
    //                                 }));
    //                                 setCSV((o) => ({ ...o, filtros }));
    //                             }}
    //                         >
    //                             Limpia filtros
    //                         </Button>
    //                     </Grid>
    //                 </Grid>
    //                 <Table
    //                     remote
    //                     keyField="id"
    //                     data={list.data}
    //                     mostrarBuscar={false}
    //                     pagination={{
    //                         ...list.pagination,
    //                         onChange: (pagination) =>
    //                             setList((o) => ({
    //                                 ...o,
    //                                 loading: "Cargando...",
    //                                 pagination: { ...o.pagination, ...pagination },
    //                                 data: [],
    //                                 error: null,
    //                             })),
    //                     }}
    //                     noDataIndication={
    //                         list.loading || list.error || "No existen datos para mostrar "
    //                     }
    //                     columns={[
    //                         {
    //                             dataField: "empresaCUIT",
    //                             text: "CUIT empresa",
    //                             sort: true,
    //                             formatter: (v) => Formato.Cuit(v),
    //                             style: { textAlign: "center" },
    //                         },
    //                         {
    //                             dataField: "empresaRazonSocial",
    //                             text: "Razón social empresa",
    //                             sort: true,
    //                             style: { textAlign: "left" },
    //                         },
    //                         {
    //                             dataField: "estadoSolicitudDescripcion",
    //                             text: "Estado",
    //                             sort: true,
    //                             style: { textAlign: "left" },
    //                         },
    //                         {
    //                             dataField: "total",
    //                             text: "Cantidad",
    //                             formatter: (v) => Formato.Numero(v),
    //                             style: { textAlign: "right" },
    //                         },
    //                     ]}
    //                     onTableChange={(type, { sortOrder, sortField }) => {
    //                         switch (type) {
    //                             case "sort": {
    //                                 sortField =
    //                                     { empresaCUIT: "cuit", empresaRazonSocial: "razonsocial" }[
    //                                         sortField
    //                                     ] ?? sortField;
    //                                 const sortBy = `${
    //                                     sortOrder === "desc" ? "-" : "+"
    //                                 }${sortField}`;
    //                                 setList((o) => ({
    //                                     ...o,
    //                                     loading: "Cargando...",
    //                                     params: { ...o.params, sortBy },
    //                                     data: [],
    //                                     error: null,
    //                                 }));
    //                                 setCSV((o) => ({ ...o, params: { ...o.params, sortBy } }));
    //                                 return;
    //                             }
    //                             default:
    //                                 return;
    //                         }
    //                     }}
    //                 />
    //             </Grid>
    //         </Modal.Body>
    //         <Modal.Footer>
    //             <Grid col gap="5px">
    //                 <Grid gap="20px" justify="end">
    //                      <Grid gap="20px" justify="end">
    //                        {
    //                         filtros.cuit > 10000000000 ? (
    //                              <Grid width="auto">
    //                         <Button
    //                             className="botonAmarillo"
    //                             loading={!!csv.loading}
    //                             // onClick={() => onCSV()}
    //                             tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
    //                         >
    //                             ANALIZAR CUIT
    //                         </Button>
    //                     </Grid>
    //                         ) : (
    //                             null
    //                         )

    //                        }
    //                     <Grid width="auto">
    //                         <Button
    //                             className="botonAmarillo"
    //                             loading={!!csv.loading}
    //                             // onClick={() => onCSV()}
    //                             tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
    //                         >
    //                             SOLICITAR AUTORIZACION AFILIACIONES
    //                         </Button>
    //                     </Grid>
    //                     <Grid width="auto">
    //                         <Button
    //                             className="botonAmarillo"
    //                             loading={!!csv.loading}
    //                             // onClick={() => onCSV()}
    //                             tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
    //                         >
    //                             AUTORIZAR AFILIACIONES
    //                         </Button>
    //                     </Grid>
                       
    //                 </Grid>
    //                     <Grid width="auto">
    //                         <Button
    //                             className="botonAmarillo"
    //                             loading={!!csv.loading}
    //                             // onClick={() => onCSV()}
    //                             tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
    //                         >
    //                             GENERAR FORMULARIO DE AFILIACIONES
    //                         </Button>
    //                     </Grid>
                       
    //                 </Grid>
    //                 {csv.loading == null ? null : (
    //                     <text style={{ color: "green" }}>{csv.loading}</text>
    //                 )}
    //                 {csv.error == null ? null : (
    //                     <text style={{ color: "red" }}>{csv.error}</text>
    //                 )}
    //             </Grid>
    //         </Modal.Footer>
    //     </Modal>
    // );


    return (
    <Modal size="xl" centered show >
        <Modal.Header className={modalCss.modalCabecera} closeButton onClick={() => onClose()}>
            Estados de solicitudes por empresa
        </Modal.Header>
        <Modal.Body>
            <Grid col full gap="15px">
                <Grid width gap="inherit">
                    <Grid width="200px">
                        <InputMaterial
                            label="CUIT empresa"
                            //mask="99\-99.999.999\-9"
                            mask={CUITMask}
                            value={filtros.cuit}
                            onChange={(cuit) =>
                                setFiltros((o) => {
                                    cuit = cuit.replace(/[^0-9]+/g, "");
                                    const r = { ...o, cuit };
                                    if (!cuit) delete r.cuit;
                                    return r;
                                })
                            }
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
                    <Grid width="200px">
                        <InputMaterial
                            label="Desde"
                            type="date"
                            value={filtros.desde || ""}
                            onChange={(desde) =>
                                setFiltros((o) => ({
                                    ...o,
                                    desde,
                                }))
                            }
                        />
                    </Grid>
                    <Grid width="200px">
                        <InputMaterial
                            label="Hasta"
                            type="date"
                            value={filtros.hasta || ""}
                            onChange={(hasta) =>
                                setFiltros((o) => ({
                                    ...o,
                                    hasta,
                                }))
                            }
                        />
                    </Grid>
                    {/* <Grid width="200px">
                        <Button
                            className="botonAzul"
                            disabled={
                                Object.keys(filtros).length === 0 ||
                                (filtros.desde === "" && filtros.hasta === "" && filtros.cuit === "" && filtros.razonSocial === "")
                            }
                            onClick={() => {
                                const filtrosVacios = {};
                                setFiltros(filtrosVacios);
                                setList((o) => ({
                                    ...o,
                                    filtros: filtrosVacios,
                                    data: [],
                                    error: null,
                                    loading: "Cargando...",
                                }));
                                setCSV((o) => ({ ...o, filtros: filtrosVacios }));
                            }}
                        >
                            Limpiar filtros
                        </Button>
                    </Grid> */}

                    <Grid width="200px">
                    <Button
                        className="botonAzul"
                        disabled={JSON.stringify(list.filtros) === JSON.stringify(filtros)}
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
                        Aplicar filtros
                    </Button>
                </Grid>
                <Grid width="200px">
                    <Button
                        className="botonAzul"
                        disabled={
                            Object.keys(filtros).length === 0 ||
                            (filtros.desde === "" && filtros.hasta === "" && filtros.cuit === "" && filtros.razonSocial === "")
                        }
                        onClick={() => {
                            const filtrosVacios = {};
                            setFiltros(filtrosVacios);
                            setList((o) => ({
                                ...o,
                                filtros: filtrosVacios,
                                data: [],
                                error: null,
                                loading: "Cargando...",
                            }));
                            setCSV((o) => ({ ...o, filtros: filtrosVacios }));
                        }}
                    >
                        Limpiar filtros
                    </Button>
                </Grid>

                </Grid>
                {filtros.cuit > 10000000000 ? <text style={{textAlign: "center"}}>AUTORIZACION DE AFILIACION PENDIENTE DE AUTORIZAR SOLICITADA EL DIA @@@@</text> : null}
                <Table
                    remote
                    keyField="id"
                    data={Array.isArray(list.data) ? list.data : []}
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
                            dataField: "empresaCUIT",
                            text: "CUIT empresa",
                            sort: true,
                            formatter: (v) => Formato.Cuit(v),
                            style: { textAlign: "center" },
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
                        {
                            dataField: "total",
                            text: "Cantidad",
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
            </Grid>
        </Modal.Body>
        <Modal.Footer>
            <Grid col gap="5px">
                <Grid gap="20px" justify="end">
                    {
                       filtros.cuit > 10000000000 && list.data ? (
                            <Grid width="auto">
                        <Button
                            className="botonAmarillo"
                            loading={!!csv.loading}
                            // onClick={() => onCSV()}
                            tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
                        >
                            ANALIZAR CUIT
                        </Button>
                    </Grid>
                        ) : (
                            null
                        )

                    }

                    {/* ACTUALMENTE ESTA DESACTIVADO, SE ACTIVA UNICAMENTE CUANDO SE "ANALIZA CUIT" */}
                    {/* <Grid width="auto">
                        <Button
                            className="botonAmarillo"
                            loading={!!csv.loading}
                            // onClick={() => onCSV()}
                            tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
                        >
                            SOLICITAR AUTORIZACION AFILIACIONES
                        </Button>
                    </Grid> */}
                    <Grid width="auto">
                        <Button
                            className="botonAmarillo"
                            loading={!!csv.loading}
                            // onClick={() => onCSV()}
                            tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
                        >
                            AUTORIZAR AFILIACIONES
                        </Button>
                    </Grid>
                     <Grid width="auto">
                    <Button
                        className="botonAmarillo"
                        loading={!!csv.loading}
                        // onClick={() => onCSV()}
                        tarea="Informes_Afiliados_AfiliadosEmpresa_CSV"
                    >
                        GENERAR FORMULARIO DE AFILIACIONES
                    </Button>
                </Grid>
                {csv.loading == null ? null : (
                    <text style={{ color: "green" }}>{csv.loading}</text>
                )}
                {csv.error == null ? null : (
                    <text style={{ color: "red" }}>{csv.error}</text>
                )}
            </Grid>
                </Grid>
               
        </Modal.Footer>
    </Modal>
);

};

export default SolicitudAutorizacionAfiliacion;
