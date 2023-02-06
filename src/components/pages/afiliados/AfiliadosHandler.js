import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import AfiliadoAgregar from "./AfiliadoAgregar";
import AfiliadosLista from "./AfiliadosLista";

const datosAFIPDefecto =
    {
        cuil: 0,
        secuencia: 0,
        nroAfiliado: 0,
        nombre: '' ,
        puestoId: 0,
        fechaIngreso: "2023-02-03T19:44:15.823Z",
        fechaEgreso: "2023-02-03T19:44:15.823Z",
        nacionalidadId: 0,
        nombreAnexo: "string",
        cuit: 0,
        seccionalId: 0,
        sexoId: 0,
        dni: 0,
        actividadId: 0,
        estadoSolicitudId: 1,
        afipcuil: 0,
        afipFechaNacimiento: "2023-02-03T19:44:15.823Z",
        afipNombre: "string",
        afipApellido: "string",
        afipRazonSocial: "string",
        afipTipoDocumento: "string",
        afipNumeroDocumento: 0,
        afipTipoPersona: "string",
        afipTipoClave: "string",
        afipEstadoClave: "string",
        afipClaveInactivaAsociada: 0,
        afipFechaFallecimiento: "2023-02-03T19:44:15.823Z",
        afipFormaJuridica: "string",
        afipActividadPrincipal: "string",
        afipIdActividadPrincipal: 0,
        afipPeriodoActividadPrincipal: 0,
        afipFechaContratoSocial: "2023-02-03T19:44:15.823Z",
        afipMesCierre: 0,
        afipDomicilioDireccion: "string",
        afipDomicilioCalle: "string",
        afipDomicilioNumero: 0,
        afipDomicilioPiso: "string",
        afipDomicilioDepto: "string",
        afipDomicilioSector: "string",
        afipDomicilioTorre: "string",
        afipDomicilioManzana: "string",
        afipDomicilioLocalidad: "string",
        afipDomicilioProvincia: "string",
        afipDomicilioIdProvincia: 0,
        afipDomicilioCodigoPostal: 0,
        afipDomicilioTipo: "string",
        afipDomicilioEstado: "string",
        afipDomicilioDatoAdicional: "string",
        afipDomicilioTipoDatoAdicional: "string"
    }

const AfiliadosHandler = () => {
    const [afiliadosRespuesta, setAfiliadosRespuesta] = useState(null)
    const [padronRespuesta, setPadronRespuesta] = useState(datosAFIPDefecto)
    const [afiliadoAgregarResponse, setAfiliadoAgregarResponse] = useState(null)
    const [actividades, setActividades] = useState(null)
    const [page, setPage] = useState(1)
    const [sizePerPage, setSizePerPage] = useState(50)
    const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false)
    const { isLoading, error, sendRequest: request} = useHttp()

    useEffect(() => { 
        const processAfiliados = async (afiliadosObj) => {
            //console.log('afiliadosObj', afiliadosObj)
            setAfiliadosRespuesta(afiliadosObj);              
        };

        request({ 
            baseURL: 'Afiliaciones',
            endpoint: `/Afiliado?PageIndex=${page}&PageSize=${sizePerPage}`,
            method: 'GET',                              
        },processAfiliados);
    }, [request, page, sizePerPage])

    //#region Tablas para crear afiliado
    // useEffect(() => { 
    //     const processActividades = async (actividadesObj) => {
    //         console.log('actividadesObj', actividadesObj)
    //         setAfiliadosRespuesta(actividadesObj);              
    //     };

    //     request({ 
    //         baseURL: 'Afiliaciones',
    //         endpoint: `/Actividad`,
    //         method: 'GET',                              
    //     },processActividades);
    // }, [])
    //#endregion

    //#region Operacions sobre el modal
    const afiliadoValidarCUILHandler = (cuil) => {
        const processConsultaPadron = async (padronObj) => {
            console.log('padronObj', padronObj)
            setPadronRespuesta(padronObj);              
        };

        request({ 
            baseURL: 'AFIP',
            endpoint: `/Padron/ConsultaPadronTodosLosDatos?pCUIT=${cuil}`,
            method: 'GET',                              
        },processConsultaPadron);
    }
    const afiliadoAgregarHandler = (afiliado) => {
        console.log('POST', afiliado)
        const afiliadoAgregar = async (afiliadoObj) => {
            console.log('afiliadosObj', afiliadoObj)
            setAfiliadoAgregarResponse(afiliadoObj);              
        };

        request({ 
            baseURL: 'Afiliaciones',
            endpoint: `/Afiliado`,
            method: 'POST',     
            body: afiliado,
            headers: {
                'Content-Type': 'application/json'
            }   
        },afiliadoAgregar);
    }
    //#endregion

    // const handleDarDeBajaAfiliado = (afiliado) => {

    // }

    // const handleResolverEstadoSolicitud = (afiliado) => {

    // }

    const handleClickAfiliadoAgregar = () => {
        setAfiliadoAgregarShow(true)
    }

    const onCloseAfiliadoAgregarHandler = () => {
        setPadronRespuesta(datosAFIPDefecto)
        setAfiliadoAgregarShow(false)
    }

    const handlePageChange = (page, sizePerPage) => {
        setPage(page)
        setSizePerPage(sizePerPage)
        setAfiliadosRespuesta(null)
    }

    const handleSizePerPageChange = (page, sizePerPage) => {  
        setPage(page)
        setSizePerPage(sizePerPage)
        setAfiliadosRespuesta(null)      
    }

    if(isLoading) {
        return <h1>Loading...</h1>
    }
    if(error) {
        return <h1>{error}</h1>
    }

    let ret = (afiliadosRespuesta !== null && <Fragment >
            {afiliadoAgregarShow && 
                <AfiliadoAgregar 
                    onClose={onCloseAfiliadoAgregarHandler} 
                    onAfiliadoAgregar={afiliadoAgregarHandler} 
                    onValidarCUIL={afiliadoValidarCUILHandler} 
                    datosAfiliadoAFIP={padronRespuesta}
                    //actividades={actividades}
                    afiliadoAgregarResponse={afiliadoAgregarResponse}
                />}
            <AfiliadosLista 
                afiliados={afiliadosRespuesta}    
                loading={isLoading}             
                // onDarDeBajaAfiliado={handleDarDeBajaAfiliado}
                // onResolverEstadoSolicitud={handleResolverEstadoSolicitud}
                onPageChange={handlePageChange}
                onSizePerPageChange={handleSizePerPageChange}
                onClickAfiliadoAgregar={handleClickAfiliadoAgregar}
            />
        </Fragment>)

    return (ret)    
}

export default AfiliadosHandler;