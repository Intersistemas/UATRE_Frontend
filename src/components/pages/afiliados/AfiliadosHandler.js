import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import AfiliadoAgregar from "./AfiliadoAgregar";
import AfiliadosLista from "./AfiliadosLista";

const AfiliadosHandler = () => {
    const [afiliadosRespuesta, setAfiliadosRespuesta] = useState([])    
    const [page, setPage] = useState(1)
    const [sizePerPage, setSizePerPage] = useState(50)
    const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const { isLoading, error, sendRequest: request} = useHttp()

    useEffect(() => { 
        const processAfiliados = async (afiliadosObj) => {
            //console.log('afiliadosObj', afiliadosObj)
            setAfiliadosRespuesta(afiliadosObj); 
            if(refresh)
                setRefresh(false);             
        };

        request({ 
            baseURL: 'Afiliaciones',
            endpoint: `/Afiliado?PageIndex=${page}&PageSize=${sizePerPage}`,
            method: 'GET',                              
        },processAfiliados);
    }, [request, page, sizePerPage, refresh])    

    // const handleDarDeBajaAfiliado = (afiliado) => {

    // }

    // const handleResolverEstadoSolicitud = (afiliado) => {

    // }

    const handleClickAfiliadoAgregar = () => {
        setAfiliadoAgregarShow(true)
    }

    const onCloseAfiliadoAgregarHandler = (refresh) => {
        setAfiliadoAgregarShow(false)
        if(refresh === true)
            setRefresh(true)
    }

    const handlePageChange = (page, sizePerPage) => {
        setPage(page)
        setSizePerPage(sizePerPage)
        setAfiliadosRespuesta([])
    }

    const handleSizePerPageChange = (page, sizePerPage) => {  
        setPage(page)
        setSizePerPage(sizePerPage)
        setAfiliadosRespuesta([])      
    }

    if(isLoading) {
        return <h1>Loading...</h1>
    }
    if(error) {
        return <h1>{error}</h1>
    }

    if(afiliadosRespuesta.length !== 0)
        return (
            <Fragment >
                {afiliadoAgregarShow && 
                    <AfiliadoAgregar 
                        onClose={onCloseAfiliadoAgregarHandler} 
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
            </Fragment>
        )
}

export default AfiliadosHandler;