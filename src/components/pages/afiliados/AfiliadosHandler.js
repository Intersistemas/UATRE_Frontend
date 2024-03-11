import { useState, useEffect, Fragment,useContext } from "react";
import useHttp from "../../hooks/useHttp";
import AfiliadoAgregar from "./AfiliadoAgregar";
import AfiliadosLista from "./AfiliadosLista";

import { useDispatch, useSelector } from "react-redux";
import { handleModuloEjecutarAccion } from "../../../redux/actions";
import PantallaEnDesarrollo from "../pantallaEnDesarrollo/PantallaEnDesarrollo";
import PantallaBajaReactivacion from "./bajareactivacion/PantallaBajaReactivacion";
import ResolverSolicitudModal from "./ResolverSolicitud/ResolverSolicitudModal";
import Localizar from "./localizar/Localizar";
import AuthContext from "../../../store/authContext"; 
import LoteSeleccion from "./Carnet/LoteSeleccion";
import LotePDFViewer from "./Carnet/LotePDFViewer";
import ListadoImpresos from "./Carnet/ListadoImpresos";

const AfiliadosHandler = () => {
  const Usuario = useContext(AuthContext).usuario;

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
  
  

  //#region Tablas para el form
  const [estadosSolicitudes, setEstadosSolicitudes] = useState([
    { value: 0, label: " Todos" },
  ]);
  //#endregion

  //#region despachar Informar Modulo
  const dispatch = useDispatch();

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

    let endpoint = `/Afiliado/GetAfiliadosWithSpec`;
    
    let body = {
          pageIndex: page,
          pageSize: sizePerPage,
          soloActivos: "false",

          ambitoTodos: Usuario.ambitoTodos,
          ambitoSeccionales: Usuario.ambitoSeccionales,
          ambitoDelegaciones: Usuario.ambitoDelegaciones,
          ambitoProvincias: Usuario.ambitoProvincias,

          ...(estadoSolicitud > 0 && {estadoSolicitudId:estadoSolicitud}),
          ...(sortColumn && {sort: (sortOrder == "desc") ? `${sortColumn}Desc` : sortColumn}),
    };

    if (filter) {
      body[filterColumn] = filter;
    }
    request(
      {
        baseURL: "Afiliaciones",
        endpoint: endpoint,
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
        }
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
    console.log('modulo Accion:',moduloAccion);
    switch (moduloAccion) {
      case "A":
        setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Agrega");
        break;
      case "M":
        setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Modifica");
        break;
      case "S":
        // setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Resuelve");
        break;
      case "I":
        //navigate(`/afiliaciones/${id}`);
        // setPantallaEnDesarrolloShow(true);
        setAccionSeleccionada("Imprime");
        break;
      /*case "Consulta Afiliado":
        //alert('Funcionalidad de Consulta En desarrollo ');
        setPantallaEnDesarrolloShow(true);
        break;*/
      case "B":
        setPantallaBajaReactivacion(true);
        setAccionSeleccionada("Baja");
        break;

      case "R":
        setPantallaBajaReactivacion(true);
        setAccionSeleccionada("Reactiva");
        break;
			case "L":
				setAccionSeleccionada("Localiza");
				break;
				
      // alert('Funcionalidad de Imprimir En desarrollo ');
      // <Link style={{color:"white"}} to={`/afiliaciones/${id}`}imprimir></Link>;

			case "E":
				setAccionSeleccionada("Lote");
				break;
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

      if (accion === "Agrega"){
        setAfiliadoAgregarShow(true);
        setAccionSeleccionada("Agrega");
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
      console.log("filter",filter);

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
						afiliado={afiliadoSeleccionado}
						onClose={(cambios) => {
							if (cambios) {
								setRefresh(true); //Agrego el refresh para que se actualice el registro 
								setAfiliadoModificado({ ...afiliadoSeleccionado, ...cambios })
								if (cambios.estadoSolicitud === "Activo")	{
									setPage(1)	//Si fue resuelto (tiene NroAfiliado) y no hay filtro, el registro va a parar a la primer pagina, entonces lo busco allí
									setAccionSeleccionada("Imprime");
								} else {
									setAccionSeleccionada("");
								}
							} else {
								setAccionSeleccionada("");
							}
							setModal(null);
						}}
					/>
				);
				return;
			}
			case "Imprime": {
				//ToDo imprime credencial
				setModal(<LotePDFViewer data={[afiliadoSeleccionado]} onClose={() => {
					setAccionSeleccionada("");
					setModal(<ListadoImpresos data={[afiliadoSeleccionado]} onClose={() => setModal(null)}/>);
				}}/>)
				return;
			} 
			case "Lote": {
				//Imprime lote de credenciales
				setModal(
					<LoteSeleccion
						onClose={() => {
							setAccionSeleccionada("");
							setModal(null);
						}}
					/>
				);
				return;
			}
			case "Localiza": {
				setModal(
					<Localizar
						onClose={() => {
							setAccionSeleccionada("");
							setModal(null);
						}}
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
            cuil={afiliadoSeleccionado !== null ? afiliadoSeleccionado?.cuil : 0}
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
