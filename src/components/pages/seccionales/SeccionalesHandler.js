import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import SeccionalAgregar from "./SeccionalAgregar";
import SeccionalesLista from "./SeccionalesLista";
import Seccionales from "./Seccionales";

const SeccionalesHandler = () => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [seccionales, setSeccionales] = useState([]);
  const [seccionalAutoridades, setSeccionalAutoridades] = useState([]);
  const [seccionalSeleccionada, setSeccionalSeleccionada] = useState(null);
  const [seccionalDocumentos, setSeccionalDocumentos] = useState([]);
  const [soloAutoridadesVigentes, setSoloAutoridadesVigentes] = useState(true);
  const [localidades, setLocalidades] = useState([]);
  const [seccionalAgregarShow, setSeccionalAgregarShow] = useState(false);

  useEffect(() => {
    const processSeccionales = async (seccionalesObj) => {
      console.log("seccionales", seccionalesObj);
      setSeccionales(seccionalesObj);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: "/Seccional",
        method: "GET",
      },
      processSeccionales
    );

    const processLocalidades = async (localidadesObj) => {
      console.log("localidades", localidadesObj);
      setLocalidades(localidadesObj);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: "/RefLocalidad",
        method: "GET",
      },
      processLocalidades
    );
  }, [request]);

  const onCloseSeccionalAgregarHandler = (idAgregado) => {
    setSeccionalAgregarShow(false);
  };

  const handlerOnSeccionalSeleccionada = (seccional) => {
    setSeccionalAutoridades([]);
    console.log("seccional", seccional);
    setSeccionalSeleccionada(seccional);

    const processSeccionalAutoridades = async (seccionalAutoridadesObj) => {
      console.log("seccionalAut", seccionalAutoridadesObj);
      setSeccionalAutoridades(seccionalAutoridadesObj);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/SeccionalAutoridad/GetSeccionalAutoridadBySeccional?SeccionalId=${seccional.id}&SoloVigentes=${soloAutoridadesVigentes}`,
        method: "GET",
      },
      processSeccionalAutoridades
    );
  };

  const handlerOnSoloAutoridadesVigentes = (soloVigentes) => {
    const processSeccionalAutoridades = async (seccionalAutoridadesObj) => {
      console.log("seccionalAutSoloVigentes", seccionalAutoridadesObj);
      setSeccionalAutoridades(seccionalAutoridadesObj);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/SeccionalAutoridad/GetSeccionalAutoridadBySeccional?SeccionalId=${seccionalSeleccionada.id}&SoloVigentes=${soloVigentes}`,
        method: "GET",
      },
      processSeccionalAutoridades
    );
  };

  if (seccionales.length !== 0)
    return (
      <Fragment>
        {seccionalAgregarShow && (
          <SeccionalAgregar
            onClose={onCloseSeccionalAgregarHandler}
            localidades={localidades}
          />
        )}

        <Seccionales
          seccionales={seccionales}
          seccionalSeleccionada={seccionalSeleccionada}
          seccionalAutoridades={seccionalAutoridades}
          seccionalDocumentos={seccionalDocumentos}
          onSeccionalSeleccionada={handlerOnSeccionalSeleccionada}
          onSoloAutoridadesVigentes={handlerOnSoloAutoridadesVigentes}
        />
      </Fragment>
    );
};

export default SeccionalesHandler;
