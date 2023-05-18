import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import AfiliadoAgregar from "./AfiliadoAgregar";
import AfiliadosLista from "./AfiliadosLista";

import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from '../../../redux/actions';
import { handleModuloEjecutarAccion } from '../../../redux/actions';
import { redirect, useNavigate } from "react-router-dom";
import PantallaEnDesarrollo from "../pantallaEnDesarrollo/PantallaEnDesarrollo";

const AfiliadosHandler = () => {
  const [afiliadosRespuesta, setAfiliadosRespuesta] = useState({ data: [] });
  const [page, setPage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(12);
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [filter, setFilter] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false);
  const [pantallaEnDesarrolloShow, setPantallaEnDesarrolloShow] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [estadoSolicitud, setEstadoSolcitud] = useState(0);
  const { isLoading, error, sendRequest: request } = useHttp();
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState("") 
  const moduloInfoDefoult = {
    nombre: "Afiliados",
    acciones: [
      {
        id: 1,
        name: "Agrega Afiliado",
        icon: '',
        disabled: false,
      },
      {
        id: 2,
        name: "Modifica Afiliado",
        icon: '',
        disabled: true,
      },
      {
        id: 3,
        name: "Resuelve Solicitud",
        icon: '',
        disabled: true,
      },
      {
        id: 4,
        name: "Imprime Carnet de Afiliación",
        icon: '',
        disabled: true,
      },
      {
        id: 5,
        name: "Consulta Afiliado",
        icon: '',
        disabled: true,
      }
    ]
  }
  const [moduloInfo, setModuloInfo] = useState(moduloInfoDefoult);

  const navigate = useNavigate()
  //#region Tablas para el form
  const [estadosSolicitudes, setEstadosSolicitudes] = useState([{ value: 0, label:" Todos" }])
  //#endregion

  //#region despachar Informar Modulo  
  const dispatch = useDispatch();
  dispatch(handleModuloSeleccionar(moduloInfo)); 
//#endregion

//#region AFILIADO SELECCIONADO, según las condiciones del afiliado se habilitarán determinados botones (por esto me debo olbigado a hacer un dispatch)
useEffect(() => {

  switch (afiliadoSeleccionado?.estadoSolicitud){
    
    case "Observado":
        const  accionesAux0 = moduloInfoDefoult.acciones.map((accion) =>
        (accion.id === 2) ? {...accion, disabled: false} : accion);
        setModuloInfo({...moduloInfo, acciones:accionesAux0});
        break;
    case "Activo":
        const accionesAux1 = moduloInfoDefoult.acciones.map((accion) =>
          accion.id === 2 || accion.id === 4 || accion.id === 5
            ? { ...accion, disabled: false }
            : accion
        );
        setModuloInfo({...moduloInfo, acciones:accionesAux1});
        break;
    case "Pendiente":
      setModuloInfo(moduloInfoDefoult); //seteo por defecto primero
        const  accionesAux2 = moduloInfoDefoult.acciones.map((accion) =>
        accion.id === 2 || accion.id === 3 ? {...accion, disabled: false} : accion);
        setModuloInfo({...moduloInfo, acciones:accionesAux2});
        break;
    case "Baja":
          setModuloInfo(moduloInfoDefoult); //seteo por defecto primero
            const  accionesAux3 = moduloInfoDefoult.acciones.map((accion) =>
            accion.id === 5 ? {...accion, disabled: false} : accion);
            setModuloInfo({...moduloInfo, acciones:accionesAux3});
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
        endpoint = `${endpoint}&EstadoSolicitudId=${estadoSolicitud}`;
    }
    if (sortColumn) { //ORDENAMIENTO
        sortOrder === 'desc' ? endpoint = `${endpoint}&Sort=${sortColumn}Desc`:
        endpoint = `${endpoint}&Sort=${sortColumn}`;
    }

    if (filter) { //BUSQUEDA
        endpoint = `${endpoint}&${filterColumn}=${filter}`;
    }
   /* if (filterColumn) { //COLUMNA DE BUSUQUEDA
        endpoint = `${endpoint}&FilterBy=${filterColumn}`;
    }*/

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: endpoint,
        method: "GET",
      },
      processAfiliados
    );
  }, [request, page, sizePerPage, refresh, estadoSolicitud,filter, filterColumn, sortColumn, sortOrder]);  

  useEffect(() => {
    const processEstadosSolicitudes = async (estadosSolicitudesObj) => {
      const estadosSolicitudesTable = estadosSolicitudesObj.map(
        (estadoSolicitud) => {
          return { value: estadoSolicitud.id, label: estadoSolicitud.descripcion };
        }
      );
      const estadosSolicitudesOptions = estadosSolicitudesTable.filter((estado) => estado.label !== "Sin Asignar")

      estadosSolicitudesOptions.push({ value: 0, label: "Todos"})
      console.log("estadosSolicitudesOptions", estadosSolicitudesOptions);
      setEstadosSolicitudes(
        estadosSolicitudesOptions.sort((a, b) => (a.value > b.value ? 1 : -1))
      );
      //setEstadosSolicitudes(estadosSolicitudes);
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
      case "Agrega Afiliado":
        setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Agrega")
        break;
      case "Modifica Afiliado":
        setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Modifica");
        break;
      case "Resuelve Solicitud":
        setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Resuelve");
        break;
      case "Imprime Carnet de Afiliación":
        //navigate(`/afiliaciones/${id}`);
        setPantallaEnDesarrolloShow(true);
        break;
      case "Consulta Afiliado":
        //alert('Funcionalidad de Consulta En desarrollo ');
        setPantallaEnDesarrolloShow(true)
        break;
        // alert('Funcionalidad de Imprimir En desarrollo ');
        // <Link style={{color:"white"}} to={`/afiliaciones/${id}`}imprimir></Link>;

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

  const onClosePantallaEnDesarrolloHandler = () => {
    setPantallaEnDesarrolloShow(false);
    //if (refresh === true) setRefresh(true);
  };

  const handlePageChange = (page, sizePerPage) => {
    setPage(page);
    setSizePerPage(sizePerPage);
    setAfiliadosRespuesta([]);
  };
  
  const handleFilter = (select,entry) => {
    console.log('select,entry',select,entry)
    setFilter(entry);
    setFilterColumn(select);
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

  const handleOnAfiliadoSeleccionado = (afiliado) => {
    //console.log("Afiliado seleccionado", afiliado.cuil)
    setAfiliadoSeleccionado(afiliado);
  }

  if (isLoading) {
    return <h1>Cargando...</h1>;
  }
  /*if (error) {
    return <h1>{error}</h1>;
  }*/
  //console.log("Afiliado seleccionado", afiliadoSeleccionado);  
  console.log("pantallaEnDesarrolloShow", pantallaEnDesarrolloShow);
  if (afiliadosRespuesta.length !== 0)
    return (
      <Fragment>
        {pantallaEnDesarrolloShow && (
          <PantallaEnDesarrollo onClose={onClosePantallaEnDesarrolloHandler} />
        )}

        {afiliadoAgregarShow && (
          <AfiliadoAgregar
            onClose={onCloseAfiliadoAgregarHandler}
            estadosSolicitudes={estadosSolicitudes}
            accion={accionSeleccionada}
            cuil={afiliadoSeleccionado !== null ? afiliadoSeleccionado.cuil : 0}
          />
        )}

        <AfiliadosLista
          afiliados={afiliadosRespuesta}
          errorRequest={error}
          loading={afiliadosRespuesta?.length ? false : isLoading}
          estadosSolicitudes={estadosSolicitudes}
          estadoSolicitudActual={estadoSolicitud}
          onFilter={handleFilter}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onSizePerPageChange={handleSizePerPageChange}
          onFilterChange={handleFilterChange}
          onAfiliadoSeleccionado={handleOnAfiliadoSeleccionado}
        />
      </Fragment>
    );
};

export default AfiliadosHandler;
