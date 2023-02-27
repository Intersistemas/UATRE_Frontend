import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import AfiliadoAgregar from "./AfiliadoAgregar";
import AfiliadosLista from "./AfiliadosLista";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from '../../../redux/actions';
import { handleModuloEjecutarAccion } from '../../../redux/actions';


const AfiliadosHandler = () => {

  const estadosSolicitud = [
    { id: 1, value: 0, label: "Todos" },
    { id: 2, value: 1, label: "Pendiente" },
    { id: 3, value: 2, label: "Activo" },
  ];
  const [afiliadosRespuesta, setAfiliadosRespuesta] = useState({ data: [] });
  const [page, setPage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [estadoSolicitud, setEstadoSolcitud] = useState(0);
  const { isLoading, error, sendRequest: request } = useHttp();

  const moduloEnviar = {
    nombre: "Afiliados",
    acciones: [
      {
        nombre: "Agregar Afiliado",
      },
      {
        nombre: "Modificar Afiliado",
      },
      {
        nombre: "Resolver Solicitud",
      }
    ]
  }
 
  const dispatch = useDispatch();
  dispatch(handleModuloSeleccionar(moduloEnviar)); 

  useEffect(() => {

    console.log('AfiliadosHandler - useEffect_1:');
    const processAfiliados = async (afiliadosObj) => {
        //console.log('afiliadosObj', afiliadosObj)
        setAfiliadosRespuesta(afiliadosObj);
        if (refresh) setRefresh(false);
    };

    let endpoint = `/Afiliado?PageIndex=${page}&PageSize=${sizePerPage}`;
    if (estadoSolicitud) {
        endpoint = `${endpoint}&EstadoSolicitudId=${estadoSolicitud}`;
    }
    
    request(
      {
        baseURL: "Afiliaciones",
        endpoint: endpoint,
        method: "GET",
      },
      processAfiliados
    );
  }, [request, page, sizePerPage, refresh, estadoSolicitud]);  


  const  moduloAccion  = useSelector(state => state.moduloAccion)

  useEffect(() => {
    
      if (moduloAccion === 'Agregar Afiliado'){
        setAfiliadoAgregarShow(true);
        dispatch(handleModuloEjecutarAccion(''));
      }

  },[moduloAccion])

  // const handleDarDeBajaAfiliado = (afiliado) => {

  // }

  // const handleResolverEstadoSolicitud = (afiliado) => {

  
  const handleResolverEstadoSolicitud = () => {
    alert("Funcionalidad en desarrollo");
  };
  // }

  const handleClickAfiliadoAgregar = () => {
    setAfiliadoAgregarShow(true);
  };


  const onCloseAfiliadoAgregarHandler = (refresh) => {
    setAfiliadoAgregarShow(false);
    if (refresh === true) setRefresh(true);

    //dispatch(handleAfiliadoFicha(null));
  };

  const handlePageChange = (page, sizePerPage) => {
    setPage(page);
    setSizePerPage(sizePerPage);
    setAfiliadosRespuesta([]);
  };

  const handleSizePerPageChange = (page, sizePerPage) => {
    setPage(page);
    setSizePerPage(sizePerPage);
    setAfiliadosRespuesta([]);
  };

  const handleFilterChange = (filters) => {
    //console.log("value", filters.estadoSolicitud.filterVal);
    setEstadoSolcitud(parseInt(filters.estadoSolicitud.filterVal) ?? 0);
  };

  if (isLoading) {
    return <h1>Cargando...</h1>;
  }
  if (error) {
    return <h1>{error}</h1>;
  }

  if (afiliadosRespuesta.length !== 0)
    return (
      <Fragment>
        {afiliadoAgregarShow && (
          <AfiliadoAgregar onClose={onCloseAfiliadoAgregarHandler}/>
        )}
        <AfiliadosLista
          afiliados={afiliadosRespuesta}
          loading={isLoading}
          estadosSolicitud={estadosSolicitud}
          estadoSolicitudActual={estadoSolicitud}
          // onDarDeBajaAfiliado={handleDarDeBajaAfiliado}
          onResolverEstadoSolicitud={handleResolverEstadoSolicitud}
          onPageChange={handlePageChange}
          onSizePerPageChange={handleSizePerPageChange}
          onClickAfiliadoAgregar={handleClickAfiliadoAgregar}
          onFilterChange={handleFilterChange}
        />
      </Fragment>
    );
};

export default AfiliadosHandler;
