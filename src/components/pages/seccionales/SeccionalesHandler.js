import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import SeccionalAgregar from "./SeccionalAgregar";
import SeccionalesLista from "./SeccionalesLista";
import Seccionales from "./Seccionales";

const selectores = [
  { value: 0, label: "SELECCIONE ALGO" },
  { value: 1, label: "LOCALIDAD" }
]

const SeccionalesHandler = () => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [seccionales, setSeccionales] = useState([]);
  const [seccionalesTodas, setSeccionalesTodas] = useState([]);
  const [seccionalAutoridades, setSeccionalAutoridades] = useState([]);
  const [seccionalSeleccionada, setSeccionalSeleccionada] = useState(null);
  const [seccionalDocumentos, setSeccionalDocumentos] = useState([]);
  const [soloAutoridadesVigentes, setSoloAutoridadesVigentes] = useState(true);
  const [localidades, setLocalidades] = useState([]);
  const [seccionalAgregarShow, setSeccionalAgregarShow] = useState(false);
  const [selector, setSelector] = useState(0)
  const [selectorValor, setSelectorValor] = useState("")

  useEffect(() => {
    const processSeccionales = async (seccionalesObj) => {
      console.log("seccionales", seccionalesObj);
      setSeccionalesTodas(seccionalesObj)
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

  const handlerOnSelectorSelected = (selector) => {
    console.log("selector", selector)
    setSelector(selector);
    setSelectorValor("");
  };

  const handlerOnSelectorValor = (selectorValor) => {
    setSelectorValor(selectorValor);    
  };

  const handlerOnBuscarClick = () => {
    console.log("params", selector, selectorValor)
    switch (selector.value) {      
      case 1:
        const processSeccionalLocalidad = async (seccionalLocalidadObj) => {
          //console.log("seccionalAut", seccionalAutoridadesObj);
          setSeccionales(seccionalLocalidadObj);
        };

        request(
          {
            baseURL: "Afiliaciones",
            endpoint: `/Seccional/GetSeccionalesSpecs?Localidad=${selectorValor}`,
            method: "GET",
          },
          processSeccionalLocalidad
        );
        break;
    
      default:
        break;
    }
  }

  const handlerOnLimpiarClick = () => {
    setSelector(0);
    setSelectorValor("");
    setSeccionales(seccionalesTodas);
  }

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
          selectores={selectores}
          selector={selector}
          selectorValor={selectorValor}
          onSelectorSelected={handlerOnSelectorSelected}
          onSelectorValor={handlerOnSelectorValor}
          onBuscarClick={handlerOnBuscarClick}
          onLimpiarClick={handlerOnLimpiarClick}
        />
      </Fragment>
    );
};

export default SeccionalesHandler;
