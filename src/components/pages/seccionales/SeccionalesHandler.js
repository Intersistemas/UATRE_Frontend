import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
import SeccionalAgregar from "./abm/SeccionalAgregar";
import SeccionalForm from "./abm/SeccionalForm";
//import SeccionalesLista from "./lista/SeccionalesLista";
import Seccionales from "./Seccionales";
import SeccionalAutoridades from "./autoridades/SeccionalAutoridades";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloEjecutarAccion } from "../../../redux/actions";

const selectores = [
  { value: 1, label: "NOMBRE" },
  { value: 2, label: "LOCALIDAD" },
  { value: 3, label: "CP" },
];

const SeccionalesHandler = () => {
  const { isLoading, error, sendRequest: request } = useHttp();

  //#region variables de estado
  const [seccionales, setSeccionales] = useState([]);
  const [seccionalesTodas, setSeccionalesTodas] = useState([]);
  const [seccionalAutoridades, setSeccionalAutoridades] = useState([]);
  const [autoridadSeleccionada, setAutoridadSeleccionada] = useState({});
  const [seccionalSeleccionada, setSeccionalSeleccionada] = useState({});
  const [seccionalDocumentacion, setSeccionalDocumentacion] = useState([]);
  const [refCargos, setRefCargos] = useState([]);
  const [autoridadAfiliado, setAutoridadAfiliado] = useState({});
  const [soloAutoridadesVigentes, setSoloAutoridadesVigentes] = useState(true);
  const [localidades, setLocalidades] = useState([]);
  const [seccionalFormShow, setSeccionalFormShow] = useState(false);
  const [selector, setSelector] = useState(0);
  const [selectorValor, setSelectorValor] = useState("");
  const [requestForm, setRequestForm] = useState("");
  const [tabSelected, setTabSelected] = useState("Seccional")

  const [refresh, setRefresh] = useState(false)

  const dispatch = useDispatch();

	const moduloAccion = useSelector((state) => state.moduloAccion);
	const modulo = useSelector((state) => state.modulo);
  
	//UseEffect para capturar el estado global con la Accion que se intenta realizar en el SideBar
	useEffect(() => {
	//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
  if (modulo?.nombre === "Seccionales"){
    switch (moduloAccion?.abm) { //comparo por ID, 1=ALTA 2=MODIFICACION 3=BAJA, 4=Consultar, 5=Imprimir
      case "Alta"://ALTA
        setRequestForm(moduloAccion) //para saber cual es el request del form (agrega, modifica, baja)
        handlerSeccionalFormShow();
        break;
      case "Modifica"://MODIF
        setRequestForm(moduloAccion) //para saber cual es el request del form (agrega, modifica, baja)
        handlerSeccionalFormShow();
        break;
      case "Baja":// BAJA
        setRequestForm(moduloAccion) //para saber cual es el request del form (agrega, modifica, baja)
        handlerSeccionalFormShow();
        break;
      default:
        break;
    }
  }
  if (modulo?.nombre === "SeccionalAutoridades"){
    switch (moduloAccion?.abm) { //comparo por ID, 1=ALTA 2=MODIFICACION 3=BAJA, 4=Consultar, 5=Imprimir 
      case "Alta"://ALTA
        setRequestForm(moduloAccion.name) //para saber cual es el request del form (agrega, modifica, baja)
        alert('Agrega Autoridad en Desarrollo');
        break;
      case "Modifica"://MODIF
        setRequestForm(moduloAccion.name) //para saber cual es el request del form (agrega, modifica, baja)
        alert('Modifica Autoridad en Desarrollo');
        break;
      case "Baja":// BAJA
        setRequestForm(moduloAccion.name) //para saber cual es el request del form (agrega, modifica, baja)
        alert('Baja Autoridad en Desarrollo');
        break;
      default:
        break;
    }
  }
  if (modulo?.nombre === "SeccionalDocumentacion"){
    switch (moduloAccion?.abm) { //comparo por ID, 1=ALTA 2=MODIFICACION 3=BAJA, 4=Consultar, 5=Imprimir 
      case "Alta": //ALTA
        setRequestForm(moduloAccion.name) //para saber cual es el request del form (agrega, modifica, baja)
        alert('Agrega Documentacion en Desarrollo');
        break;
      case "Modifica": //MODIF
        setRequestForm(moduloAccion.name) //para saber cual es el request del form (agrega, modifica, baja)
        alert('Modifica Documentacion en Desarrollo');
        break;
      case "Baja": // BAJA
        setRequestForm(moduloAccion.name) //para saber cual es el request del form (agrega, modifica, baja)
        alert('Baja Documentacion en Desarrollo');
        break;
      default:
        break;
    }
	}
  
	dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion]);
  //#endregion

  //#region api calls
  useEffect(() => {
    refresh && setRefresh(false)
    const processSeccionales = async (seccionalesObj) => {
      //console.log("seccionales", seccionalesObj);
      const seccionalesConDescripcion = seccionalesObj.filter(
        (seccional) =>
          seccional.descripcion !== "" && seccional.descripcion !== null
      );
      setSeccionalesTodas(seccionalesConDescripcion);
      setSeccionales(seccionalesConDescripcion);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: "/Seccional/GetSeccionalesSpecs?SoloActivos=false",
        method: "GET",
      },
      processSeccionales
    );

    const processLocalidades = async (localidadesObj) => {
      //console.log("localidades", localidadesObj);
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

    const processRefCargos = async (refCargosObj) => {
      console.log("refCargosObj", refCargosObj);
      const refCargosSelect = refCargosObj.map((refCargo) => {
        return { value: refCargo.id, label: refCargo.cargo };
      });
      setRefCargos(refCargosSelect);
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: "/RefCargo/GetAll",
        method: "GET",
      },
      processRefCargos
    );

    

  }, [request,refresh]);

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

  const handlerOnValidaAfiliadoclick = (numeroAfiliado) => {
    console.log("numeroAfiliado", +numeroAfiliado);
    if (+numeroAfiliado !== 0) {
      const processAfiliado = async (afiliadoObj) => {
        console.log("afiliadoObj", afiliadoObj);
        setAutoridadAfiliado(afiliadoObj.data[0]);
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Afiliado/GetAfiliadosWithSpec?NroAfiliado=${+numeroAfiliado}`,
          method: "GET",
        },
        processAfiliado
      );
    }
  };

  const handlerOnConfirmaClick = (seccional) => {
    console.log("seccional crear/modif", seccional);
    const processCrearSeccional = async (seccionalObj) => {
      //console.log("seccionalObj", seccionalObj);

      setSeccionalFormShow(false);
      setSeccionales((current) => [...current, seccionalObj]);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Seccional`,
        method: seccional.id ? "PUT" : "POST",
        body: seccional,
        headers: {
          "Content-Type": "application/json",
        },
      },
      processCrearSeccional
    );
  };

  //#endregion

  const onCloseSeccionalFormHandler = () => {
    setSeccionalAutoridades([]);
    setAutoridadSeleccionada(null);
    setAutoridadAfiliado(null);
    setSeccionalFormShow(false);
  };

  //#region Buscar
  const handlerOnSelectorSelected = (selector) => {
    //console.log("selector", selector)
    setSelector(selector);
    setSelectorValor("");
  };

  const handlerOnSelectorValor = (selectorValor) => {
    setSelectorValor(selectorValor);
  };

  const handlerOnBuscarClick = () => {
    console.log("params", selector, selectorValor);
    //console.log("seccionales", seccionales)
    switch (selector.value) {
      case 1:
        const seccionalesNombre = seccionales.filter((seccional) =>
          seccional.descripcion
            .toUpperCase()
            .includes(selectorValor.toUpperCase())
        );
        console.log("seccionalesNombre", seccionalesNombre);
        setSeccionales(seccionalesNombre ?? []);
        break;

      case 2:
        const processSeccionalLocalidad = async (seccionalLocalidadObj) => {
          //console.log("seccionalAut", seccionalAutoridadesObj);
          setSeccionales(seccionalLocalidadObj);
        };

        request(
          {
            baseURL: "Afiliaciones",
            endpoint: `/Seccional/GetSeccionalesSpecs?SoloActivos=false&Localidad=${selectorValor}`,
            method: "GET",
          },
          processSeccionalLocalidad
        );
        break;

      case 3:
        const processSeccionalCP = async (seccionalLocalidadObj) => {
          //console.log("seccionalAut", seccionalAutoridadesObj);
          setSeccionales(seccionalLocalidadObj);
        };

        request(
          {
            baseURL: "Afiliaciones",
            endpoint: `/Seccional/GetSeccionalesSpecs?SoloActivos=false&CodigoPostal=${selectorValor}`,
            method: "GET",
          },
          processSeccionalCP
        );
        break;

      default:
        break;
    }
  };

  const handlerOnLimpiarClick = () => {
    setSelector(0);
    setSelectorValor("");
    setSeccionales(seccionalesTodas);
  };
  //#endregion
  
  const handlerSeccionalFormShow = () => {
    setSeccionalFormShow(!seccionalFormShow);
  };

  //#region handler AutoridadesSeccional
  const handlerOnAgregaAutoridad = (autoridad) => {
    setSeccionalAutoridades((current) => [...current, autoridad]);
  };

  const handlerOnCambiaAutoridad = (autoridad) => {
    
    const index = seccionalAutoridades.indexOf(autoridadSeleccionada);
    
    if (index > -1) {
      const newSeccionalAutoridades = [...seccionalAutoridades];
      newSeccionalAutoridades[index] = autoridad;
      setSeccionalAutoridades(newSeccionalAutoridades);
      setAutoridadSeleccionada(null);
    }    
  };

  const handlerOnBorraAutoridad = (autoridad) => {
    var array = [...seccionalAutoridades]; // make a separate copy of the array
    var index = array.indexOf(autoridadSeleccionada);
    if (index !== -1) {
      array.splice(index, 1);
      setSeccionalAutoridades(array);
      setSeccionalSeleccionada(null);
    }
  };

  const handlerOnSeleccionAutoridad = (autoridad) => {
    setAutoridadSeleccionada(autoridad)
  }
  //#endregion

  return (
    <Fragment>
      <div>
      {seccionalFormShow && (
        <SeccionalForm
          requestForm={requestForm}
          setRefresh={setRefresh}
          record = {seccionalSeleccionada}
          isLoading = {isLoading}

          refCargos={refCargos}
          localidades={localidades}
          seccionalAutoridades={seccionalAutoridades}
          autoridadAfiliado={autoridadAfiliado}
          autoridadSeleccionada={autoridadSeleccionada}
          handlerSeccionalFormShow={handlerSeccionalFormShow}
          onConfirmaClick={handlerOnConfirmaClick}
          onAgregaAutoridad={handlerOnAgregaAutoridad}
          onCambiaAutoridad={handlerOnCambiaAutoridad}
          onBorraAutoridad={handlerOnBorraAutoridad}
          onValidaAfiliadoClick={handlerOnValidaAfiliadoclick}
          onSeleccionAutoridad={handlerOnSeleccionAutoridad}
        />
      )}

      <Seccionales
        seccionales={seccionales}
        record = {seccionalSeleccionada}

        tabSelected = {setTabSelected} //afecta directamente el state

        seccionalSeleccionada={seccionalSeleccionada}
        seccionalAutoridades={seccionalAutoridades}
        seccionalDocumentacion={seccionalDocumentacion}
        onSeccionalSeleccionada={handlerOnSeccionalSeleccionada}
        onSoloAutoridadesVigentes={handlerOnSoloAutoridadesVigentes}
        selectores={selectores}
        selector={selector}
        selectorValor={selectorValor}
        onSelectorSelected={handlerOnSelectorSelected}
        onSelectorValor={handlerOnSelectorValor}
        onBuscarClick={handlerOnBuscarClick}
        onLimpiarClick={handlerOnLimpiarClick}
        onSeleccionAutoridad={handlerOnSeleccionAutoridad}
      />
      </div>
    </Fragment>
  );
};

export default SeccionalesHandler;
