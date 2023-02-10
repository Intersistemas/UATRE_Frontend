import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import AfiliadoAgregar from "./AfiliadoAgregar";
import AfiliadosLista from "./AfiliadosLista";

const AfiliadosHandler = () => {
  const estadosSolicitud = [
    { id: 1, value: 0, label: "Todos" },
    { id: 2, value: 1, label: "Pendiente" },
    { id: 3, value: 2, label: "Activo" },
  ];
  const [afiliadosRespuesta, setAfiliadosRespuesta] = useState({ data: [] });
  const [page, setPage] = useState(1);
  const [sizePerPage, setSizePerPage] = useState(20);
  const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [estadoSolicitud, setEstadoSolcitud] = useState(0);
  const { isLoading, error, sendRequest: request } = useHttp();

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

  // const handleDarDeBajaAfiliado = (afiliado) => {

  // }

  // const handleResolverEstadoSolicitud = (afiliado) => {

  // }

  const handleClickAfiliadoAgregar = () => {
    setAfiliadoAgregarShow(true);
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
    return <h1>Loading...</h1>;
  }
  if (error) {
    return <h1>{error}</h1>;
  }

  if (afiliadosRespuesta.length !== 0)
    return (
      <Fragment>
        {afiliadoAgregarShow && (
          <AfiliadoAgregar onClose={onCloseAfiliadoAgregarHandler} />
        )}
        <AfiliadosLista
          afiliados={afiliadosRespuesta}
          loading={isLoading}
          estadosSolicitud={estadosSolicitud}
          estadoSolicitudActual={estadoSolicitud}
          // onDarDeBajaAfiliado={handleDarDeBajaAfiliado}
          // onResolverEstadoSolicitud={handleResolverEstadoSolicitud}
          onPageChange={handlePageChange}
          onSizePerPageChange={handleSizePerPageChange}
          onClickAfiliadoAgregar={handleClickAfiliadoAgregar}
          onFilterChange={handleFilterChange}
        />
      </Fragment>
    );
};

export default AfiliadosHandler;
