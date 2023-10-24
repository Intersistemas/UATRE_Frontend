import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import AfiliadoAgregar from "./AfiliadoAgregar";
import AfiliadosLista from "./AfiliadosLista";

import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "../../../redux/actions";
import { handleModuloEjecutarAccion } from "../../../redux/actions";
import { redirect, useNavigate } from "react-router-dom";
import PantallaEnDesarrollo from "../pantallaEnDesarrollo/PantallaEnDesarrollo";
import PantallaBajaReactivacion from "./bajareactivacion/PantallaBajaReactivacion";
import { Filter } from "@mui/icons-material";
import UseKeyPress from '../../helpers/UseKeyPress';
import ResolverSolicitudModal from "./ResolverSolicitud/ResolverSolicitudModal";

const AfiliadosHandler = () => {
  const [afiliadosRespuesta, setAfiliadosRespuesta] = useState({ data: [] });
  const [page, setPage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(12);
  const [sortColumn, setSortColumn] = useState("nroAfiliado");
  const [sortOrder, setSortOrder] = useState("desc"); //Por defecto ordeno por Nro Afiliado Desc
  const [filter, setFilter] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false);
  const [pantallaEnDesarrolloShow, setPantallaEnDesarrolloShow] = useState(false);
  const [pantallaBajaReactivacion, setPantallaBajaReactivacion] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [estadoSolicitud, setEstadoSolcitud] = useState(0);
  const { isLoading, error, sendRequest: request } = useHttp();
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState({});
  const [afiliadoModificado, setAfiliadoModificado] = useState(null);
  const [totalPageIndex, setTotalPageIndex] = useState(0);
  const [accionSeleccionada, setAccionSeleccionada] = useState("");
	const [modal, setModal] = useState();
  
  const [entrySelected, setEntrySelected] = useState();
  const [entryValue, setEntryValue] = useState();
  
  const moduloInfoDefault = {
    nombre: "Afiliados",
    acciones: [
      {
        id: 1,
        name: "Agrega Afiliado",
        underlineindex: 0,
        icon: "",
        disabled: false,
      },
      {
        id: 2,
        name: "Modifica Afiliado",
        underlineindex: 0,
        icon: "",
        disabled: true,
      },
      {
        id: 3,
        name: "Resuelve Solicitud",
        underlineindex: 9,
        icon: "",
        disabled: true,
      },
      {
        id: 4,
        name: "Imprime Carnet de Afiliación",
        underlineindex: 2,
        icon: "",
        disabled: true,
      },
      {
        id: 5,
        name: "Baja Afiliado",
        underlineindex: 0,
        icon: "",
        disabled: true,
      },
      {
        id: 6,
        name: "Reactiva Afiliado",
        underlineindex: 0,
        icon: "",
        disabled: true,
      },
    ],
  };
  const [moduloInfo, setModuloInfo] = useState(moduloInfoDefault);

  //#region Tablas para el form
  const [estadosSolicitudes, setEstadosSolicitudes] = useState([
    { value: 0, label: " Todos" },
  ]);
  //#endregion

  //#region despachar Informar Modulo
  const dispatch = useDispatch();
  dispatch(handleModuloSeleccionar(moduloInfo));
  //#endregion


  const despacharAcciones = (a) =>{
   //console.log(first)

    let boton = moduloInfo?.acciones.find(element => element.name == a);

    !boton?.disabled && dispatch(handleModuloEjecutarAccion(a));
  }

    //#region shorcuts
    UseKeyPress(['a'], () => despacharAcciones("Agrega Afiliado"), 'AltKey');
    UseKeyPress(['m'], () => despacharAcciones("Modifica Afiliado"), 'AltKey');
    UseKeyPress(['s'], () => despacharAcciones("Resuelve Solicitud"), 'AltKey');
    UseKeyPress(['p'], () => despacharAcciones("Imprime Carnet de Afiliación"), 'AltKey');
    UseKeyPress(['b'], () => despacharAcciones("Baja Afiliado"), 'AltKey');
    UseKeyPress(['r'], () => despacharAcciones("Reactiva Afiliado"), 'AltKey');
    //#endregion 


  //#region Cargar Tablas
  useEffect(() => {
    const processAfiliados = async (afiliadosObj) => {
      console.log("afiliadosObj", afiliadosObj);
      const index = (page == totalPageIndex ? afiliadosObj.data.length-1 : 0); //Esta variable me define que registor quedará seleccionado
      setAfiliadoSeleccionado(afiliadoModificado ? afiliadoModificado : afiliadosObj.data[index]);

      setTotalPageIndex(afiliadosObj.pages);
      setAfiliadosRespuesta(afiliadosObj);
      if (refresh) setRefresh(false);
    };

    let endpoint = `/Afiliado/GetAfiliadosWithSpec?PageIndex=${page}&PageSize=${sizePerPage}`;
    if (estadoSolicitud > 0) {
      //endpoint = `${endpoint}&EstadoSolicitudId=${estadoSolicitud}`;
      endpoint = `${endpoint}&EstadoSolicitudId=${estadoSolicitud}`;
    }
    if (sortColumn) {
      //ORDENAMIENTO
      sortOrder == "desc"
        ? (endpoint = `${endpoint}&Sort=${sortColumn}Desc`)
        : (endpoint = `${endpoint}&Sort=${sortColumn}`);
    }

    if (filter) {
      //BUSQUEDA
      endpoint = `${endpoint}&${filterColumn}=${filter}`;
    }

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: endpoint,
        method: "GET",
      },
      processAfiliados
    );
  }, [
    request,
    page,
    sizePerPage,
    refresh,
    afiliadoModificado,
    estadoSolicitud,
    filter,
    filterColumn,
    sortColumn,
    sortOrder,
  ]);


  //#region AFILIADO SELECCIONADO, según las condiciones del afiliado se habilitarán determinados botones del SIDEBAR (por esto me veo  obligado a hacer un dispatch)
  useEffect(() => {
    //console.log('afiliadoModificado*',afiliadoModificado);
    //console.log('afiliadoSeleccionado*',afiliadoSeleccionado)
    switch (afiliadoSeleccionado?.estadoSolicitud) {
      case "Observado":
        const accionesAux0 = moduloInfoDefault.acciones.map((accion) =>
          accion.id === 2 ? { ...accion, disabled: false } : accion
        );
        setModuloInfo({ ...moduloInfo, acciones: accionesAux0 });
        break;
      case "Activo":
        const accionesAux1 = moduloInfoDefault.acciones.map((accion) =>
          accion.id === 2 ||
          accion.id === 4 ||
          accion.id === 5 
            ? { ...accion, disabled: false }
            : accion
        );
        setModuloInfo({ ...moduloInfo, acciones: accionesAux1 });
        break;
      case "Pendiente":
        setModuloInfo(moduloInfoDefault); //seteo por defecto primero
        const accionesAux2 = moduloInfoDefault.acciones.map((accion) =>
          accion.id === 2 || accion.id === 3
            ? { ...accion, disabled: false }
            : accion
        );
        setModuloInfo({ ...moduloInfo, acciones: accionesAux2 });
        break;
      case "No Activo":
        setModuloInfo(moduloInfoDefault); //seteo por defecto primero
        const accionesAux3 = moduloInfoDefault.acciones.map((accion) =>
          accion.id === 6
           ? { ...accion, disabled: false } 
           : accion
        );
        setModuloInfo({ ...moduloInfo, acciones: accionesAux3 });
        break;
      default:
        setModuloInfo(moduloInfoDefault); //seteo por defecto primero
        break;
    }
    console.log("moduloInfo3", moduloInfo);
    dispatch(handleModuloSeleccionar(moduloInfo));
  }, [afiliadoSeleccionado,afiliadosRespuesta,afiliadoModificado]);
  //#endregion

  useEffect(() => {
    const processEstadosSolicitudes = async (estadosSolicitudesObj) => {
      const estadosSolicitudesTable = estadosSolicitudesObj.map(
        (estadoSolicitud) => {
          return {
            value: estadoSolicitud.id,
            label: estadoSolicitud.descripcion,
          };
        }
      );
      const estadosSolicitudesOptions = estadosSolicitudesTable.filter(
        (estado) => estado.label !== "Sin Asignar" & estado.label !== "Observado"
      );

      estadosSolicitudesOptions.push({ value: 0, label: "Todos" });
      console.log("estadosSolicitudesOptions", estadosSolicitudesOptions);
      setEstadosSolicitudes(
        estadosSolicitudesOptions.sort((a, b) => (a.value > b.value ? 1 : -1))
      );
      //setEstadosSolicitudes(estadosSolicitudes);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: "/EstadoSolicitud",
        method: "GET",
      },
      processEstadosSolicitudes
    );
  }, [request]);

  //#endregion

  const moduloAccion = useSelector((state) => state.moduloAccion);

  //UseEffect para capturar el estado global con la Accion que se intenta realizar en el SideBar
  useEffect(() => {
    //segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
    switch (moduloAccion) {
      case "Agrega Afiliado":
        setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Agrega");
        break;
      case "Modifica Afiliado":
        setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Modifica");
        break;
      case "Resuelve Solicitud":
        // setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Resuelve");
        break;
      case "Imprime Carnet de Afiliación":
        //navigate(`/afiliaciones/${id}`);
        setPantallaEnDesarrolloShow(true);
        break;
      /*case "Consulta Afiliado":
        //alert('Funcionalidad de Consulta En desarrollo ');
        setPantallaEnDesarrolloShow(true);
        break;*/
      case "Baja Afiliado":
        setPantallaBajaReactivacion(true);
        setAccionSeleccionada("Baja");
        break;

      case "Reactiva Afiliado":
        setPantallaBajaReactivacion(true);
        setAccionSeleccionada("Reactiva");
        break;
      // alert('Funcionalidad de Imprimir En desarrollo ');
      // <Link style={{color:"white"}} to={`/afiliaciones/${id}`}imprimir></Link>;

      default:
        break;
    }
    dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
  }, [moduloAccion]);

  const handleResolverEstadoSolicitud = () => {
    alert("Funcionalidad en desarrollo");
  };

  const onCloseAfiliadoAgregarHandler = (regUpdated, accion) => { //ESTA FUNCION CIERRA EL MODAL DE ALTA/MODIFICACION/RESUELVE.SOLICIT.
      setAfiliadoAgregarShow(false);

      console.log('onCloseAfiliadoAgregarHandler: ',regUpdated, accion);
      
      if(regUpdated){ //SI SE HIZO UNA ALTA // MODIFICACION ACTUALIZO EL OBJETO CON EL NUEVO ESTADO ...
          setRefresh(true); //Agrego el refresh para que se actualice el registro 
          setAfiliadoModificado(regUpdated)

          if (accion === "Resuelve"){
            regUpdated.estadoSolicitud == "Activo" && setPage(1); //Si fue resuelto (tiene NroAfiliado) y no hay filtro, el registro va a parar a la primer pagina, entonces lo busco allí
          }else{
            accion === "Agrega" ? 
            (regUpdated.estadoSolicitud == "Activo") ? 
              setPage(1)//El afiliado insertado tiene NroAfiliado y se agregó con estado ATIVO, Voy a la pagina 1
              :
              setPage(totalPageIndex)//El afiliado insertado no tiene NroAfiliado, voy a la ultima pagina de la grilla) 
            :
            console.log('No es Agrega');
          }
      }
      
  };

  const onClosePantallaBajaReactivacion = (regUpdated) => {
    setPantallaBajaReactivacion(false);
    if (regUpdated){
      console.log('regUpdated*:',regUpdated);
      setAfiliadoModificado(regUpdated);
    } 
  };

  const onClosePantallaEnDesarrolloHandler = () => {
    setPantallaEnDesarrolloShow(false);
  };

  const handlePageChange = (page, sizePerPage) => {
    setPage(page);
    setSizePerPage(sizePerPage);
    setAfiliadosRespuesta([]);
  };

  const handleFilter = (select, entry) => {
    if (filter != entry){
      handlePageChange(1,12)
      console.log("Filter",Filter)
      setFilter(entry)
      setFilterColumn(select)
    } 
    //setAfiliadosRespuesta([]);
  };

  const handleSort = (sortColumn, sortOrder) => {
    setSortColumn(sortColumn == "cuil" ? "CUIL" : sortColumn);
    setSortOrder(sortOrder);
    //setOrder(sortOrder); TODO
  };

  const handleSizePerPageChange = (page, sizePerPage) => {
    setPage(page);
    setSizePerPage(sizePerPage);
    setAfiliadosRespuesta([]);
  };

  const handleFilterChange = (filters) => {
    setEstadoSolcitud(parseInt(filters.estadoSolicitud?.filterVal));
  };

  const handleOnAfiliadoSeleccionado = (afiliado) => {
    setAfiliadoSeleccionado(afiliado);
  };

	useEffect(() => {
		switch (accionSeleccionada) {
			case "Resuelve": {
				setModal(
					<ResolverSolicitudModal
						onClose={(confirm) => {
							setAccionSeleccionada("");
							setModal(null);
						}}
						afiliado={afiliadoSeleccionado}
					/>
				);
				return;
			}
			default: return;
		}
	}, [accionSeleccionada, afiliadoSeleccionado]);

  if (isLoading) {
    return <h1>Cargando...</h1>;
  }
  /*if (error) {
    return <h1>{error}</h1>;
  }*/
  if (afiliadosRespuesta.length !== 0)
    return (
      <Fragment>
        {pantallaEnDesarrolloShow && (
          <PantallaEnDesarrollo onClose={onClosePantallaEnDesarrolloHandler} />
        )}

        {pantallaBajaReactivacion && (
          <PantallaBajaReactivacion
            afiliado={afiliadoSeleccionado}
            accion={accionSeleccionada}
            onClose={onClosePantallaBajaReactivacion}
          />
        )}

        {afiliadoAgregarShow && (
          <AfiliadoAgregar
            onClose={onCloseAfiliadoAgregarHandler}
            estadosSolicitudes={estadosSolicitudes}
            accion={accionSeleccionada}
            cuil={afiliadoSeleccionado !== null ? afiliadoSeleccionado.cuil : 0}
            afiliadoSeleccionado = {afiliadoSeleccionado}
          />
        )}

				{modal}

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
          afiliadoSeleccionado={afiliadoSeleccionado}

          setEntrySelected={setEntrySelected}
          setEntryValue={setEntryValue}

          entrySelected={entrySelected}
          entryValue={entryValue}
        />
      </Fragment>
    );
};

export default AfiliadosHandler;
