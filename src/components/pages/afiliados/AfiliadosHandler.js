import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import AfiliadoAgregar from "./AfiliadoAgregar";
import AfiliadosLista from "./AfiliadosLista";

import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from '../../../redux/actions';
import { handleModuloEjecutarAccion } from '../../../redux/actions';
import { redirect, useNavigate } from "react-router-dom";




const AfiliadosHandler = () => {
  const [afiliadosRespuesta, setAfiliadosRespuesta] = useState({ data: [] });
  const [page, setPage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(12);
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [search, setSearch] = useState('');
  const [searchColumn, setSearchColumn] = useState('');
  const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [estadoSolicitud, setEstadoSolcitud] = useState(0);
  const { isLoading, error, sendRequest: request } = useHttp();
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState();
  const moduloInfoDefoult = {
    nombre: "Afiliados",
    acciones: [
      {
        id: 1,
        name: "Agregar Afiliado",
        icon: '',
        disabled: false,
      },
      {
        id: 2,
        name: "Modificar Afiliado",
        icon: '',
        disabled: true,
      },
      {
        id: 3,
        name: "Resolver Solicitud",
        icon: '',
        disabled: true,
      },
      {
        id: 4,
        name: "Imprimir Solicitud",
        icon: '',
        disabled: true,
      }
    ]
  }
  const [moduloInfo, setModuloInfo] = useState(moduloInfoDefoult);

  const navigate = useNavigate()
  //#region Tablas para el form
  const [estadosSolicitudes, setEstadosSolicitudes] = useState([{value: 0, label:"Todos"}])
  //#endregion

  //#region despachar Informar Modulo  
  const dispatch = useDispatch();
  dispatch(handleModuloSeleccionar(moduloInfo)); 
//#endregion

//#region AFILIADO SELECCIONADO, según las condiciones del afiliado se habilitarán determinados botones (por esto me debo olbigado a hacer un dispatch)
useEffect(() => {

  switch (afiliadoSeleccionado?.estadoSolicitud){
    
    case "Observado":
      
        const  accionesAux = moduloInfoDefoult.acciones.map((accion) =>
        (accion.id === 2) ? {...accion, disabled: false} : accion);
        setModuloInfo({...moduloInfo, acciones:accionesAux});
        break;
    case "Pendiente":
      setModuloInfo(moduloInfoDefoult); //seteo por defecto primero
        const  accionesAux2 = moduloInfoDefoult.acciones.map((accion) =>
        accion.id === 2 || accion.id === 3 ? {...accion, disabled: false} : accion);
        setModuloInfo({...moduloInfo, acciones:accionesAux2});
        break;
    default: 
    setModuloInfo(moduloInfoDefoult); //seteo por defecto primero
    break;
  }
  console.log('moduloInfo3',moduloInfo)
  dispatch(handleModuloSeleccionar(moduloInfo)); 
  
},[afiliadoSeleccionado])
//#endregion

//#region Cargar Tablas
  useEffect(() => {
    const processAfiliados = async (afiliadosObj) => {
        console.log('afiliadosObj', afiliadosObj)
        setAfiliadosRespuesta(afiliadosObj);
        if (refresh) setRefresh(false);
    };

    let endpoint = `/Afiliado/GetAfiliadosWithSpec?PageIndex=${page}&PageSize=${sizePerPage}`;
    
    console.log('sortColumn',sortColumn)
    
    if (estadoSolicitud > 0) {
        //endpoint = `${endpoint}&EstadoSolicitudId=${estadoSolicitud}`;
        endpoint = `${endpoint}&FilterBy=EstadoSolicitudId&FilterValue=${estadoSolicitud}`;
    }
    if (sortColumn) { //ORDENAMIENTO
        sortOrder === 'desc' ? endpoint = `${endpoint}&Sort=${sortColumn}Desc`:
        endpoint = `${endpoint}&Sort=${sortColumn}`;
    }
    if (search) { //BUSQUEDA
        endpoint = `${endpoint}&FilterValue=${search}`;
    }
    if (searchColumn) { //COLUMNA DE BUSUQUEDA
        endpoint = `${endpoint}&FilterBy=${searchColumn}`;
    }

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: endpoint,
        method: "GET",
      },
      processAfiliados
    );
  }, [request, page, sizePerPage, refresh, estadoSolicitud,search, searchColumn, sortColumn, sortOrder]);  

  useEffect(() => {
    const processEstadosSolicitudes = async (estadosSolicitudesObj) => {
      const estadosSolicitudesOptions = estadosSolicitudesObj.map(
        (estadoSolicitud) => {
          return { value: estadoSolicitud.id, label: estadoSolicitud.descripcion };
        }
      );
      setEstadosSolicitudes([...estadosSolicitudes, ...estadosSolicitudesOptions]);
    };    

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: '/EstadoSolicitud',
        method: "GET",
      },
      processEstadosSolicitudes
    );
  }, [request]);  

//#endregion
  
const  moduloAccion  = useSelector(state => state.moduloAccion)
const {id} = 0;
  
  /*const afiliadoSeleccionado = useSelector(state => state.afiliado)
  const {id} = afiliadoSeleccionado
*/

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
        navigate(`/afiliaciones/${id}`)
        
        // alert('Funcionalidad de Imprimir En desarrollo ');
        // <Link style={{color:"white"}} to={`/afiliaciones/${id}`}imprimir></Link>;
        
        break;
      default: break;
    }
      dispatch(handleModuloEjecutarAccion(''));//Dejo el estado de ejecutar Accion LIMPIO!

  },[moduloAccion])

  
  const handleResolverEstadoSolicitud = () => {
    alert("Funcionalidad en desarrollo");
  };
 

  const onCloseAfiliadoAgregarHandler = (refresh) => {
    setAfiliadoAgregarShow(false);
    if (refresh === true) setRefresh(true);
  };

  const handlePageChange = (page, sizePerPage) => {
    setPage(page);
    setSizePerPage(sizePerPage);
    setAfiliadosRespuesta([]);
  };
  
  const handleSearch = (select,entry) => {
    setSearch(entry);
    switch(select){
      case "Nro.Afiliado":
        setSearchColumn("NroAfiliado")
        break;
      default:  setSearchColumn(select);
    }
    //setAfiliadosRespuesta([]);
  };

  const handleSort = (sortColumn,sortOrder) => {
    setSortColumn(sortColumn=='cuil'?'CUIL':sortColumn);
    setSortOrder(sortOrder);
    //setOrder(sortOrder); TODO
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
  /*if (error) {
    return <h1>{error}</h1>;
  }*/

  if (afiliadosRespuesta.length !== 0)
    return (
      <Fragment>
          {afiliadoAgregarShow && (
            <AfiliadoAgregar
              onClose={onCloseAfiliadoAgregarHandler}
              estadosSolicitudes={estadosSolicitudes}
            />
          )}

          <AfiliadosLista
            afiliados={afiliadosRespuesta}
            errorRequest={error}
            loading={afiliadosRespuesta?.length ? false : isLoading}
            estadosSolicitudes={estadosSolicitudes}
            estadoSolicitudActual={estadoSolicitud}
            onSearch={handleSearch}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onSizePerPageChange={handleSizePerPageChange}
            onFilterChange={handleFilterChange}
            setAfiliadoSeleccionado={setAfiliadoSeleccionado}
          />
      
      </Fragment>
    );
};

export default AfiliadosHandler;
