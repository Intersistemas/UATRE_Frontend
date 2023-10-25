import { useState, useEffect, Fragment } from "react";
import useHttp from "../../hooks/useHttp";
//import SeccionalesLista from "./lista/SeccionalesLista";
import Seccionales from "./Accesos";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "../../../redux/actions";
import { handleModuloEjecutarAccion } from "../../../redux/actions";

const selectores = [
  { value: 1, label: "NOMBRE" },
  { value: 2, label: "LOCALIDAD" },
  { value: 3, label: "CP" },
];

const AccesosHandler = () => {
  const { isLoading, error, sendRequest: request } = useHttp();

  //#region variables de estado
  const [seccionales, setSeccionales] = useState([]);
  const [seccionalesTodas, setSeccionalesTodas] = useState([]);
  const [seccionalAutoridades, setSeccionalAutoridades] = useState([]);
  const [autoridadSeleccionada, setAutoridadSeleccionada] = useState(null);
  const [seccionalSeleccionada, setSeccionalSeleccionada] = useState(null);
  const [seccionalDocumentos, setSeccionalDocumentos] = useState([]);
  const [refCargos, setRefCargos] = useState([]);
  const [autoridadAfiliado, setAutoridadAfiliado] = useState(null);
  const [soloAutoridadesVigentes, setSoloAutoridadesVigentes] = useState(true);
  const [localidades, setLocalidades] = useState([]);
  const [seccionalAgregarShow, setSeccionalAgregarShow] = useState(false);
  const [selector, setSelector] = useState(0);
  const [selectorValor, setSelectorValor] = useState("");
  
  const moduloInfoDefault = {
		nombre: "Seccionales",
		acciones: [
		  {
        id: 1,
        name: "Agrega Seccional",
        icon: "",
        disabled: false,
		  },
      {
        id: 2,
        name: "Modifica Seccional",
        icon: "",
        disabled: false,
      },
      {
        id: 3,
        name: "Borra Seccional",
        icon: "",
        disabled: false,
      }
		],
	};
	const [moduloInfo, setModuloInfo] = useState(moduloInfoDefault);

	//#region despachar Informar Modulo
	const dispatch = useDispatch();
	dispatch(handleModuloSeleccionar(moduloInfo));
	//#endregion

	const moduloAccion = useSelector((state) => state.moduloAccion);
	//UseEffect para capturar el estado global con la Accion que se intenta realizar en el SideBar
	useEffect(() => {
	//segun el valor  que contenga el estado global "moduloAccion", ejecuto alguna accion
	switch (moduloAccion) {
		case "Agrega Seccional":
		  handlerOnAgregarClick();
		  break;
    case "Modifica Seccional":
      alert('Modifica - Funcionalida en Desarrollo');
    case "Borra Seccional":
      alert('Borra - Funcionalida en Desarrollo');
		default:
		break;
	}
	dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion]);
  //#endregion

  //#region api calls
  useEffect(() => {
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
        endpoint: "/Seccional",
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
  }, [request]);

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
    console.log("seccionalcrear", seccional);
    const processCrearSeccional = async (seccionalObj) => {
      //console.log("seccionalObj", seccionalObj);

      setSeccionalAgregarShow(false);
      setSeccionales((current) => [...current, seccionalObj]);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Seccional`,
        method: "POST",
        body: seccional,
        headers: {
          "Content-Type": "application/json",
        },
      },
      processCrearSeccional
    );
  };

  //#endregion

  const onCloseSeccionalAgregarHandler = () => {
    console.log("limpia");
    setSeccionalAutoridades([]);
    setAutoridadSeleccionada(null);
    setAutoridadAfiliado(null);
    setSeccionalAgregarShow(false);
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
            endpoint: `/Seccional/GetSeccionalesSpecs?Localidad=${selectorValor}`,
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
            endpoint: `/Seccional/GetSeccionalesSpecs?CodigoPostal=${selectorValor}`,
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

  const handlerOnAgregarClick = () => {
    setSeccionalAgregarShow(true);
  };

  //#region handler AutoridadesSeccional
  const handlerOnAgregaAutoridad = (autoridad) => {
    setSeccionalAutoridades((current) => [...current, autoridad]);
  };

  const handlerOnCambiaAutoridad = (autoridad) => {
    console.log("CambiaAutoridad", autoridad)    
    const index = seccionalAutoridades.indexOf(autoridadSeleccionada);
    console.log('index cambiar', index)
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
    console.log("AutoridadSeleccionada", autoridadSeleccionada)
    setAutoridadSeleccionada(autoridad)
  }
  //#endregion

  return (
    <Fragment>
      <div>
      {seccionalAgregarShow && (
        alert('opcion en desarrollo')
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
        onAgregarClick={handlerOnAgregarClick}
        onSeleccionAutoridad={handlerOnSeleccionAutoridad}
      />
      </div>
    </Fragment>
  );
};

export default AccesosHandler;
