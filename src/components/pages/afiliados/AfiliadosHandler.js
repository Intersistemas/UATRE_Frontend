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

  //#region despachar Informar Modulo
  const moduloInfo = {
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
      },
      {
        nombre: "Imprimir Solicitud",
      }
    ]
  }

  const dispatch = useDispatch();
  //dispatch(handleModuloSeleccionar("Afiliaciones",acciones)); //intentaba pasar dos parametros a la funcion 
  dispatch(handleModuloSeleccionar(moduloInfo)); 
//#endregion

  useEffect(() => {
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

  //UseEffect para capturar el estado global con la Accion que se intenta realizar en el SideBar
  useEffect(() => {
    
    //segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
    switch (moduloAccion){
      case "Agregar Afiliado":
        setAfiliadoAgregarShow(true);
        break;
      case "Modificar Afiliado":
        alert('Funcionalidad de Modificar En desarrollo ');
        break;
      case "Resolver Solicitud":
        alert('Funcionalidad de Modificar En desarrollo ');
        break;
      case "Imprimir Solicitud":
        alert('Funcionalidad de Imprimir En desarrollo ');
        break;
      default: break;
    }
      dispatch(handleModuloEjecutarAccion(''));//Dejo el estado de ejecutar Accion LIMPIO!

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
  };

  const handlePageChange = (page, sizePerPage) => {
    console.log('llega con la data',page,sizePerPage)
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
          //onDarDeBajaAfiliado={handleDarDeBajaAfiliado}
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
