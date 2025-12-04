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
  const [searchError, setSearchError] = useState(null);
  const [tableMessage, setTableMessage] = useState(null);
   
  const [estadosSolicitudes, setEstadosSolicitudes] = useState([
    { value: 0, label: " Todos" },
  ]);

  const dispatch = useDispatch();


  useEffect(() => {
    const processAfiliados = async (afiliadosObj) => {
      console.log("afiliadosObj", afiliadosObj);
      const index = (page === totalPageIndex ? afiliadosObj.data.length-1 : 0);
      setAfiliadoSeleccionado(afiliadoModificado ? afiliadoModificado : afiliadosObj.data[index]);

      setTotalPageIndex(afiliadosObj.pages);
      setAfiliadosRespuesta(afiliadosObj);
      if (refresh) setRefresh(false);
    };

    let endpoint = `/Afiliado/GetAfiliadosWithSpec`;

    let body = {
          pageIndex: page,//estadoSolicitudId != estadoSolicitud ? 1 : page,
          pageSize: sizePerPage,
          soloActivos: false,

          ambitoTodos: Usuario.ambitoTodos,
          ambitoSeccionales: Usuario.ambitoSeccionales,
          ambitoDelegaciones: Usuario.ambitoDelegaciones,
          ambitoProvincias: Usuario.ambitoProvincias,
          ...(estadoSolicitud > 0 && {estadoSolicitudId:estadoSolicitud}),
          ...(sortColumn && {sort: (sortOrder === "desc") ? `${sortColumn}Desc` : sortColumn}),
    };

    // Si el filtro es por CUIL, primero intentar buscar por CUILValidado;
    // si no devuelve resultados, realizar la búsqueda general por `cuil`.
    if (filter && filterColumn && String(filterColumn).toUpperCase() === "CUIL") {
      const cuilValue = filter;
      const endpointByCuil = `/Afiliado/GetAfiliadoByCUILValidado?CUIL=${encodeURIComponent(
        cuilValue
      )}`;
      request(
        {
          baseURL: "Afiliaciones",
          endpoint: endpointByCuil,
          method: "GET",
        },
        async (data) => {
          // Normalizar respuesta a arreglo
          let arr = [];
          if (Array.isArray(data)) arr = data;
          else if (data) arr = [data];

          // Preferir registros que tengan cuilValidado (si existe y distinto de 0)
          const preferred = arr.filter((r) => {
            const val = r?.cuilValidado;
            return val != null && Number(val) !== 0;
          });

          if (preferred && preferred.length) {
            setSearchError(null);
            setTableMessage(null);
            const afiliadosObj = {
              data: preferred,
              pages: preferred.length ? 1 : 0,
              index: 1,
              size: preferred.length,
              count: preferred.length,
            };
            processAfiliados(afiliadosObj);
            return;
          }

          body[filterColumn] = filter;
          request(
            {
              baseURL: "Afiliaciones",
              endpoint: endpoint,
              method: "POST",
              body: body,
              headers: {
                "Content-Type": "application/json",
              },
            },
            (resp) => {
              let count = 0;
              if (Array.isArray(resp)) count = resp.length;
              else if (resp && Array.isArray(resp.data)) count = resp.data.length;
              else if (resp && typeof resp.count === 'number') count = resp.count;

              if (count === 0) {
                  setTableMessage("No hay información a mostrar");
                  setAfiliadoSeleccionado({});
              } else {
                setTableMessage(null);
              }
              setSearchError(null);
              processAfiliados(resp);
            }
          );
        }
      );
      return;
    }

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
        },
      },
      (resp) => {
        let count = 0;
        if (Array.isArray(resp)) count = resp.length;
        else if (resp && Array.isArray(resp.data)) count = resp.data.length;
        else if (resp && typeof resp.count === 'number') count = resp.count;

        if (count === 0) {
          setTableMessage("No hay información a mostrar");
          setAfiliadoSeleccionado({});
        } else {
          setTableMessage(null);
        }
        processAfiliados(resp);
      }
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
    Usuario.ambitoDelegaciones,
    Usuario.ambitoProvincias,
    Usuario.ambitoSeccionales,
    Usuario.ambitoTodos,
    totalPageIndex,
  ]);

  useEffect(() => {
    const processEstadosSolicitudes = async (estadosSolicitudesObj) => {
      const estadosSolicitudesTable = estadosSolicitudesObj
      .filter((estadoSolicitud) => estadoSolicitud?.tipo === "Afiliados")
      .map(
        (estadoSolicitud) => {
          return {
            value: estadoSolicitud.id,
            label: estadoSolicitud.descripcion,
          };
        }
      );
      const estadosSolicitudesOptions =  estadosSolicitudesTable.filter((estado) => estado.label !== "Sin Asignar" & estado.label !== "Observado");
      estadosSolicitudesOptions.push({ value: 0, label: "Todos" })

      setEstadosSolicitudes(
        estadosSolicitudesOptions.sort((a, b) => (a.value > b.value ? 1 : -1))
      );
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

  const moduloAccion = useSelector((state) => state.moduloAccion);

  useEffect(() => {
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
        setAccionSeleccionada("Imprime");
        break;
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

			case "E":
				setAccionSeleccionada("Lote");
				break;
      default:
        break;
    }
    dispatch(handleModuloEjecutarAccion(""));
  }, [moduloAccion, dispatch]);

  const onCloseAfiliadoAgregarHandler = (regUpdated, accion) => {
      setAfiliadoAgregarShow(false);

      console.log('onCloseAfiliadoAgregarHandler: ',regUpdated, accion);
      
      if(regUpdated){
          setRefresh(true);
          setAfiliadoModificado(regUpdated)

          if (accion === "Resuelve"){
            regUpdated.estadoSolicitud === "Activo" && setPage(1);
          }else{
            accion === "Agrega" ? 
            (regUpdated.estadoSolicitud === "Activo") ?
              setPage(1)
              :
              setPage(totalPageIndex)
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
    if (filter !== entry){
      if (select && String(select).toUpperCase() === "CUIL") {
        const digits = String(entry ?? "").replace(/\D/g, "");
        entry = digits;
        if (digits.length !== 11) {
          setTableMessage("No hay información a mostrar");
          setAfiliadosRespuesta({ data: [], pages: 0, index: 1, size: 0, count: 0 });
          setAfiliadoSeleccionado({});
          if (searchError) setSearchError(null);
          return;
        }
      }
      if (searchError) setSearchError(null);
      if (tableMessage) setTableMessage(null);
      handlePageChange(1,12)
      console.log("filter",filter);

      setFilter(entry)
      setFilterColumn(select)
    }
  };

  const handleSort = (sortColumn, sortOrder) => {
    setSortColumn(sortColumn === "cuil" ? "CUIL" : sortColumn);
    setSortOrder(sortOrder);
  };

  const handleSizePerPageChange = (page, sizePerPage) => {
    setPage(page);
    setSizePerPage(sizePerPage);
    setAfiliadosRespuesta([]);
  };

  const handleFilterChange = (filters) => {
    console.log("filtro de estado de solicitud", filters);
    estadoSolicitud !== parseInt(filters.estadoSolicitud?.filterVal) && setPage(1);
    setEstadoSolcitud(parseInt(filters.estadoSolicitud?.filterVal));
  };

  const handleOnAfiliadoSeleccionado = (afiliado) => {
    setAfiliadoSeleccionado(afiliado);
  };

  const handleEntryChange = (v) => {
    setEntryValue(v);
    if (searchError) setSearchError(null);
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
				setModal(<LotePDFViewer data={[afiliadoSeleccionado]} onClose={() => {
					setAccionSeleccionada("");
					setModal(<ListadoImpresos data={[afiliadoSeleccionado]} onClose={() => setModal(null)}/>);
				}}/>)
				return;
			} 
			case "Lote": {
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
          setEntryValue={handleEntryChange}

          entrySelected={entrySelected}
          entryValue={entryValue}
          searchError={searchError}
          noDataMessage={tableMessage}
          noDataForCuil={tableMessage && filterColumn && String(filterColumn).toUpperCase() === "CUIL"}
        />
      </Fragment>
    );
};

export default AfiliadosHandler;