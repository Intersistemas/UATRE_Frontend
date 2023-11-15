import React, { useEffect, useReducer, useRef, useState } from "react";
import moment from "moment";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Button from "components/ui/Button/Button";
import Modal from "components/ui/Modal/Modal";
import useHttp from "components/hooks/useHttp";
import InputMaterial from "components/ui/Input/InputMaterial";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import ValidarCUIT from "components/validators/ValidarCUIT";
import ValidarEmail from "components/validators/ValidarEmail";
import InputMaterialMask from "components/ui/Input/InputMaterialMask";
import {
  AFILIADO_AGREGADO,
  AFILIADO_ACTUALIZADO,
  AFILIADO_SOLICITUDRESUELTA,
  AFILIADO_DATOSAFIPACTUALIZADO,
  AFILIADO_AGREGADO_ACTIVO,
} from "components/helpers/Mensajes";
import Documentacion from "components/documentacion/Documentacion";
import UseKeyPress from 'components/helpers/UseKeyPress';
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";
import classes from "./AfiliadoAgregar.module.css";
import TabEmpleador from "./TabEmpleador/TabEmpleador";
import CabeceraABMAfiliado from "./CabeceraABMAfiliado/CabeceraABMAfiliado";
import DatosAfip from "./DatosAfip/DatosAfip";
import { ActualizarDatosAfip } from "./DatosAfip/ActualizarDatosAfip";

//#region Reducers
const fechaIngresoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: action.value !== "" ? true : false };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: action.value !== "" ? true : false };
  }
  return { value: "", isValid: false };
};

const cuilReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: ValidarCUIT(action.value) };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: ValidarCUIT(state.value) };
  }
  return { value: "", isValid: false };
};

const nombreReducer = (state, action) => {
  //console.log("reducer");
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: action.value.length > 0 };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: state.value.length > 0 };
  }
  return { value: "", isValid: false };
};

const cuitReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    //console.log("action.value", action.value);
    return { value: action.value, isValid: ValidarCUIT(action.value) };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: ValidarCUIT(state.value) };
  }
  return { value: "", isValid: false };
};

const emailReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: ValidarEmail(action.value) };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: ValidarEmail(state.value) };
  }
  return { value: "", isValid: false };
};

const nacionalidadReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const fechaNacimientoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: action.value !== "" ? true : false };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: state.value !== "" ? true : false };
  }
  return { value: "", isValid: false };
};

const estadoCivilReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const sexoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const tipoDocumentoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const numeroDocumentoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid:
        parseInt(action.value) !== 0 && action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid:
        parseInt(action.value) !== 0 && action.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const domicilioReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value.length > 0 ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value.length > 0 ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const provinciaReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const localidadReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const seccionalReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const puestoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const actividadReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return {
      value: action.value,
      isValid: action.value !== "" ? true : false,
    };
  }
  if (action.type === "USER_BLUR") {
    return {
      value: state.value,
      isValid: state.value !== "" ? true : false,
    };
  }
  return { value: "", isValid: false };
};

const telefonoReducer = (state, action) => {
  if (action.type === "USER_INPUT") {
    return { value: action.value, isValid: action.value ? true : false };
  }
  if (action.type === "USER_BLUR") {
    return { value: state.value, isValid: state.value ? true : false };
  }
  return { value: "", isValid: false };
};

//#endregion

const AfiliadoAgregar = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [selectedTab, setSelectedTab] = useState(0);
  const { cuil: cuilParam } = props;

  //#region Alert
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTexto, setDialogTexto] = useState("");
  //#endregion

  UseKeyPress(['Escape'], () => handleCerrarModal());
 // UseKeyPress(['a'], ()=>btnconfirmar(), 'AltKey');

  UseKeyPress(['Enter'], () => afiliadoAgregarHandler(), 'AltKey');

  //#region Texto completar campos
  const TextCompletarCampos = () => {
    console.log("texto dialog estadocivil", estadoCivilState.isValid);
    setDialogTexto(`Se debe completar todos los campos:\n
      ${!cuilState.isValid ? "*CUIL\n" : ""}
      ${!nombreState.isValid ? "*Nombre\n" : ""}
      ${!fechaNacimientoState.isValid ? "*Fecha de Nacimiento\n" : ""}
      ${!numeroDocumentoState.isValid ? "*Numero Documento\n" : ""}
      ${!estadoCivilState.isValid ? "*Estado Civil\n" : ""}
      ${!sexoState.isValid ? "*Género\n" : ""}
      ${!domicilioState.isValid ? "*Domicilio\n" : ""}
      ${!provinciaState.isValid ? "*Provincia\n" : ""}
      ${!localidadState.isValid ? "*Localidad\n" : ""}
      ${!seccionalState.isValid ? "*Seccional\n" : ""}      
      ${!cuitState.isValid ? "*CUIT Empleador\n" : ""}
      `);
  };
  //#endregion

  //#region Variables de estado para ButtonLoadingCustom
  const [cuilLoading, setCUILLoading] = useState(false);
  const [cuitLoading, setCUITLoading] = useState(false);
  const [afiliadoProcesando, setAfiliadoProcesando] = useState(false);
  //#endregion

  //#region Capturo errores
  useEffect(() => {
    if (error) {
      setAfiliadoProcesando(false);
      if (error.code === 500) {
        setCUILLoading(false);
        setDialogTexto(`Error - ${error.message}`);
        setOpenDialog(true);
      }

      if (error.code === 404 && cuilLoading) {
        setCUILLoading(false);
        setDialogTexto(
          `Error - No existe el CUIL ${cuilState.value} en el Padron de AFIP`
        );
        setOpenDialog(true);
      }

      if (error.code === 404 && cuitLoading) {
        setCUITLoading(false);
        setDialogTexto(
          `Error - No existe el CUIT ${cuitEmpresa} en el Padron de AFIP`
        );
        setOpenDialog(true);
      }

      
      return;
    }    
  }, [error]);
  //#endregion

  //#region estados para validaciones
  const [formularioIsValid, setFormularioIsValid] = useState(false);
  const [formularioEmpleadorIsValid, setFormularioEmpleadorIsValid] =
    useState(false);
  const [cuilValidado, setCuilValidado] = useState(false);
  const [cuitValidado, setCuitValidado] = useState(false);
  //#endregion

  //#region variables para respuestas de servicios
  const [nuevoAfiliadoResponse, setNuevoAfiliadoResponse] = useState(null);
  const [afiliadoModificado, setAfiliadoModificado] = useState(null);
  const [padronRespuesta, setPadronRespuesta] = useState(null);
  const [padronEmpresaRespuesta, setPadronEmpresaRespuesta] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);
  const [provincias, setProvincias] = useState({
		loading: "Cargando...",
		data: [],
		error: null,
	});
  const [localidades, setLocalidades] = useState({
		loading: null,
		params: {},
		data: [],
		error: null,
	});
  const [seccionales, setSeccionales] = useState({
		loading: null,
		params: {},
		data: [],
		error: null,
	});
  const [puestos, setPuestos] = useState([]);
  const [sexos, setSexos] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [tiposDocumentos, setTiposDocumentos] = useState([]);
  //#endregion

  //#region Documentación
	const [documentacionList, setDocumentacionList] = useState([]);
  //#endregion

  //#region Datos Personales Formulario
  const [afiliado, setAfiliado] = useState(null);

  //#endregion

  //#region Datos Empleador
  const [cuitEmpresa, setCUITEmpresa] = useState("");
  const [razonSocialEmpresa, setRazonSocialEmpresa] = useState("");
  const [actividadEmpresa, setActividadEmpresa] = useState("");
  const [domicilioEmpresa, setDomicilioEmpresa] = useState("");
  const [localidadEmpresa, setLocalidadEmpresa] = useState("");
  const [telefonoEmpresa, setTelefonoEmpresa] = useState("");
  const [correoEmpresa, setCorreoEmpresa] = useState("");
  const [lugarTrabajoEmpresa, setLugarTrabajoEmpresa] = useState("");
  //const [empresaId, setEmpresaId] = useState(0);
  //#endregion

  //#region manejo de validaciones
  const [fechaIngresoState, dispatchFechaIngreso] = useReducer(fechaIngresoReducer, {
    value: "",
    isValid: false,
  });

  const [cuilState, dispatchCUIL] = useReducer(cuilReducer, {
    value: "",
    isValid: false,
  });

  const [nombreState, dispatchNombre] = useReducer(nombreReducer, {
    value: "",
    isValid: false,
  });

  const [cuitState, dispatchCUIT] = useReducer(cuitReducer, {
    value: "",
    isValid: false,
  });

  const [emailState, dispatchEmail] = useReducer(emailReducer, {
    value: "",
    isValid: false,
  });

  const [nacionalidadState, dispatchNacionalidad] = useReducer(
    nacionalidadReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [fechaNacimientoState, dispatchFechaNacimiento] = useReducer(
    fechaNacimientoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [estadoCivilState, dispatchEstadoCivil] = useReducer(
    estadoCivilReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [sexoState, dispatchSexo] = useReducer(sexoReducer, {
    value: "",
    isValid: false,
  });

  const [tipoDocumentoState, dispatchTipoDocumento] = useReducer(
    tipoDocumentoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [numeroDocumentoState, dispatchNumeroDocumento] = useReducer(
    numeroDocumentoReducer,
    {
      value: "",
      isValid: false,
    }
  );

  const [domicilioState, dispatchDomicilio] = useReducer(domicilioReducer, {
    value: "",
    isValid: false,
  });

  const [provinciaState, dispatchProvincia] = useReducer(provinciaReducer, {
    value: "",
    isValid: false,
  });

  const [localidadState, dispatchLocalidad] = useReducer(localidadReducer, {
    value: "",
    isValid: false,
  });

  const [seccionalState, dispatchSeccional] = useReducer(seccionalReducer, {
    value: "",
    isValid: false,
  });

  const [puestoState, dispatchPuesto] = useReducer(puestoReducer, {
    value: "",
    isValid: false,
  });

  const [actividadState, dispatchActividad] = useReducer(actividadReducer, {
    value: "",
    isValid: false,
  });

  const [telefonoState, dispatchTelefono] = useReducer(telefonoReducer, {
    value: "",
    isValid: false,
  });

  //#ENDREGION

  //checking
  useEffect(() => {
    const identifier = setTimeout(() => {
      if (
        cuilState.isValid &&
        nombreState.isValid &&
        nacionalidadState.isValid &&
        fechaNacimientoState.isValid &&
        estadoCivilState.isValid &&
        sexoState.isValid &&
        tipoDocumentoState.isValid &&
        numeroDocumentoState.isValid &&
        domicilioState.isValid &&
        provinciaState.isValid &&
        localidadState.isValid &&
        seccionalState.isValid 
      ) {
        setFormularioIsValid(true);
      } else {
        setFormularioIsValid(false);
      }
    }, 400);

    return () => {
      clearTimeout(identifier);
    };
  }, [
    cuilState,
    nombreState,
    estadoCivilState,
    sexoState,
    tipoDocumentoState,
    numeroDocumentoState,
    domicilioState,
    provinciaState,
    localidadState,
    seccionalState,
    puestoState,
    fechaNacimientoState,
    nacionalidadState,
  ]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      if (cuitState.isValid) {
        setFormularioEmpleadorIsValid(true);
      }
    }, 200);

    return () => {
      clearTimeout(identifier);
    };
  }, [cuitState.isValid]);
  //#endregion

  //#region variables de estado por touched
  const [inputsTouched, setInputsTouched] = useState(false);
  //#endregion


  //#region manejo si el afiliado existe
  const [afiliadoExiste, setAfiliadoExiste] = useState(false);
  const [empresaIdExiste, setEmpresaIdExiste] = useState(0);

  useEffect(() => {
    if (props.accion === "Modifica") {
      setAfiliadoExiste(true);
      setInputsTouched(true);
      if (cuilParam > 0) {
        dispatchCUIL({ type: "USER_INPUT", value: cuilParam });
      }
    }
  }, [cuilParam, props.accion]);

  useEffect(() => {
    if (cuilState.value && cuilState.isValid) {
      const processGetAfiliado = async (afiliadoObj) => {
        setAfiliado(afiliadoObj);
        setCuilValidado(true);
        setNuevoAfiliadoResponse(afiliadoObj);
        setAfiliadoExiste(true);

        //dispatches para validar los campos
        dispatchFechaNacimiento({
          type: "USER_INPUT",
          value:
            afiliadoObj.fechaIngreso !== null
              ? moment(afiliadoObj.fechaIngreso).format("yyyy-MM-DD")
              : "",
        });
        dispatchCUIL({ type: "USER_INPUT", value: afiliadoObj.cuil });
				dispatchFechaIngreso({
					type: "USER_INPUT",
					value: moment(afiliadoObj.fechaIngreso).format("yyyy-MM-DD"),
				});
        dispatchActividad({
          type: "USER_INPUT",
          value: afiliadoObj.actividadId === 0 ? "" : afiliadoObj.actividadId,
        });
        dispatchPuesto({
          type: "USER_INPUT",
          value: afiliadoObj.puestoId === 0 ? "" : afiliadoObj.puestoId,
        });
        dispatchNacionalidad({
          type: "USER_INPUT",
          value:
            afiliadoObj.nacionalidadId === 0 ? "" : afiliadoObj.nacionalidadId,
        });
        dispatchSexo({
          type: "USER_INPUT",
          value: afiliadoObj.sexoId === 0 ? "" : afiliadoObj.sexoId,
        });
        dispatchEstadoCivil({
          type: "USER_INPUT",
          value:
            afiliadoObj.estadoCivilId === 0 ? "" : afiliadoObj.estadoCivilId,
        });
        dispatchTipoDocumento({
          type: "USER_INPUT",
          value:
            afiliadoObj.tipoDocumentoId === 0
              ? ""
              : afiliadoObj.tipoDocumentoId,
        });
        dispatchProvincia({
          type: "USER_INPUT",
          value: afiliadoObj.provinciaId === 0 ? "" : afiliadoObj.provinciaId,
        });
        dispatchLocalidad({
          type: "USER_INPUT",
          value:
            afiliadoObj.refLocalidadId === 0 ? "" : afiliadoObj.refLocalidadId,
        });
				dispatchSeccional({
					type: "USER_INPUT",
					value:
						afiliadoObj.seccionalId && afiliadoObj.refLocalidadId
							? afiliadoObj.seccionalId
							: "",
				});
        dispatchNombre({ type: "USER_INPUT", value: afiliadoObj.nombre });
        dispatchFechaNacimiento({
          type: "USER_INPUT",
          value:
            afiliadoObj.fechaNacimiento !== null
              ? moment(afiliadoObj.fechaNacimiento).format("yyyy-MM-DD")
              : "",
        });
        dispatchNumeroDocumento({
          type: "USER_INPUT",
          value: afiliadoObj.documento !== 0 ? afiliadoObj.documento : "",
        });
        dispatchDomicilio({
          type: "USER_INPUT",
          value: afiliadoObj.domicilio ?? "",
        });
        dispatchEmail({ type: "USER_INPUT", value: afiliadoObj.correo });

        //datos empleador
        dispatchCUIT({ type: "USER_INPUT", value: afiliadoObj.empresaCUIT });
        setCuitValidado(true);
        setCUITEmpresa(afiliadoObj.empresaCUIT);
        setRazonSocialEmpresa(afiliadoObj.empresa);
        setEmpresaIdExiste(afiliadoObj.empresaId);
				setDocumentacionList(afiliadoObj.documentacion ?? []);

        //alert
        if (props.accion === "Agrega") {
          setDialogTexto(
            `El afiliado ya está cargado para la seccional ${afiliadoObj.seccional}`
          );
          setOpenDialog(true);
          return;
        }
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Afiliado/GetAfiliadoByCUIL?CUIL=${cuilState.value}`,
          method: "GET",
        },
        processGetAfiliado
      );
    }
  }, [request, cuilState.value, cuilState.isValid]);

  useEffect(() => {
    if (afiliadoExiste && empresaIdExiste > 0) {
      const processGetEmpresa = async (empresaObj) => {
        setPadronEmpresaRespuesta(empresaObj);
        setRazonSocialEmpresa(empresaObj.razonSocial);
        setActividadEmpresa(empresaObj.actividadPrincipalDescripcion);
        setDomicilioEmpresa(
          `${empresaObj.domicilioCalle} ${empresaObj.domicilioNumero}`
        );
        setLocalidadEmpresa("");
        setTelefonoEmpresa(empresaObj.telefono ?? "");
        setCorreoEmpresa(empresaObj.email ?? "");
        setLugarTrabajoEmpresa("");
        //ciius
      };

      request(
        {
          baseURL: "Comunes",
          endpoint: `/Empresas/GetById?Id=${empresaIdExiste}`,
          method: "GET",
        },
        processGetEmpresa
      );
    }
  }, [request, afiliadoExiste, empresaIdExiste]);
  //#endregion

	//#region carga ultimaDDJJ
  const [ultimaDDJJ, setUltimaDDJJ] = useState({ data: {} });
	useEffect(() => {
		if (!cuilState.isValid) return;
		if (!cuitState.isValid) return;
		let { cuil, cuit, data } = { cuil: cuilState.value, cuit: cuitState.value };
		if (ultimaDDJJ.cuil === cuil && ultimaDDJJ.cuit === cuit) return;
		request(
			{
				baseURL: "DDJJ",
				endpoint: `/DDJJUatre/GetCUILUltimoAnio?cuil=${cuil}&cuit=${cuit}`,
				method: "GET",
			},
			async (ok) => {
				ok.forEach((ddjj) => {
					if (!data) {
						data = {};
						["modalidadTipo", "actividadTipo"].forEach(
							(k) => (data[k] = ddjj[k])
						);
						return;
					}
					Object.keys(data).forEach((k) => {
						if (!data[k]) return;
						if (data[k] !== ddjj[k]) data[k] = undefined;
					});
				});
			},
			async (_) => (data = {}),
			async () => setUltimaDDJJ({ cuil, cuit, data })
		);
	}, [request, ultimaDDJJ, cuilState, cuitState]);
	//#endregion

  //#region Tablas para crear afiliado
  useEffect(() => {
    const processActividades = async (actividadesObj) => {
      const actividadesSelect = actividadesObj
        .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
        .map((actividad) => {
          return { value: actividad.id, label: actividad.descripcion };
        });
      setActividades(actividadesSelect);
      dispatchActividad({ type: "USER_INPUT", value: actividadesSelect[0].value });
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Actividad`,
        method: "GET",
      },
      processActividades
    );
  }, [request]);

  useEffect(() => {
    const processPuestos = async (puestosObj) => {
      const puestosSelect = puestosObj
        .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
        .map((puesto) => {
          return { value: puesto.id, label: puesto.descripcion };
        });
      setPuestos(puestosSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Puesto`,
        method: "GET",
      },
      processPuestos
    );
  }, [request]);

  useEffect(() => {
    const processSexos = async (sexosObj) => {
      const sexosSelect = sexosObj
        .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
        .map((sexo) => {
          return { value: sexo.id, label: sexo.descripcion };
        });
      setSexos(sexosSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Sexo`,
        method: "GET",
      },
      processSexos
    );
  }, [request]);

  useEffect(() => {
    const processNacionalidades = async (nacionalidadObj) => {
      const nacionalidadesSelect = nacionalidadObj
        .sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
        .map((nacionalidad) => {
          return { value: nacionalidad.id, label: nacionalidad.descripcion };
        });
      setNacionalidades(nacionalidadesSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Nacionalidad`,
        method: "GET",
      },
      processNacionalidades
    );
  }, [request]);

	//Provincias
	useEffect(() => {
		if (!provincias.loading) return;
		request(
			{
				baseURL: "Afiliaciones",
				endpoint: `/Provincia`,
				method: "GET",
			},
			async (ok) =>
				setProvincias((old) => ({
					...old,
					loading: null,
					data: ok
						.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
						.map((r) => ({
							value: r.id,
							label: r.nombre,
							idProvinciaAFIP: r.idProvinciaAFIP,
							seccionalIdPorDefecto: r.seccionalIdPorDefecto,
							seccionalDescripcionPorDefecto: r.seccionalDescripcionPorDefecto,
						})),
					error: null,
				})),
			async (error) =>
				setProvincias((old) => ({
					...old,
					loading: null,
					data: [],
					error,
				}))
		);
	}, [request, provincias]);

	useEffect(() => {
		if (provincias.loading) return;
		if (!provinciaState.isValid) return;
		const provincia = provincias.data.find(
			(r) => r.value === provinciaState.value
		);
		if (provincia == null) return;
		setSeccionales({
			data: [
				{
					value: provincia.seccionalIdPorDefecto,
					label: provincia.seccionalDescripcionPorDefecto,
				},
			],
		});
		setLocalidades((old) => ({
			...old,
			loading: "Cargando...",
			params: { provinciaId: provincia.value },
		}));
	}, [provincias, provinciaState]);

	// Localidades
	useEffect(() => {
		if (!localidades.loading) return;
		request(
			{
				baseURL: "Afiliaciones",
				endpoint: [
					"/RefLocalidad",
					Object.keys(localidades.params)
						.map((k) => `${k}=${localidades.params[k]}`)
						.join("&"),
				]
					.filter((r) => r)
					.join("?"),
				method: "GET",
			},
			async (ok) =>
				setLocalidades((old) => ({
					...old,
					loading: null,
					data: ok
						.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
						.map((r) => ({ value: r.id, label: r.nombre })),
					error: null,
				})),
			async (err) =>
				setLocalidades((old) => ({
					...old,
					loading: null,
					data: [],
					error: err,
				}))
		);
	}, [request, localidades]);

	useEffect(() => {
		if (localidades.loading) return;
		if (!localidadState.isValid) return;
		const localidad = localidades.data.find(r => r.value === localidadState.value);
		if (localidad == null) return;
		setSeccionales((old) => ({
			...old,
			loading: "Cargando",
			params: { localidadId: localidad.value },
		}));
	}, [localidades, localidadState]);

	// Seccionales
	useEffect(() => {
		if (!seccionales.loading) return;
		let data = [provincias.data.find((r) => r.value === provinciaState.value)]
			.filter((r) => r)
			.map((r) => ({
				value: r.seccionalIdPorDefecto,
				label: r.seccionalDescripcionPorDefecto,
			}));
		let error = null;
		request(
			{
				baseURL: "Afiliaciones",
				// endpoint: [
				// 	"/Seccional/GetSeccionalesSpecs",
				// 	Object.keys(seccionales.params)
				// 		.map((k) => `${k}=${seccionales.params[k]}`)
				// 		.join("&"),
				// ]
				// 	.filter((r) => r)
				// 	.join("?"),
				endpoint: "/Seccional/GetSeccionalesSpecs",
				body: seccionales.params,
				method: "POST",
			},
			async (ok) =>
				data.push(
					...ok.data
						.sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
						.map((r) => ({
							value: r.id,
							label: `${r.codigo} ${r.descripcion}`,
						}))
				),
			async (err) => (error = err),
			async () => {
				setSeccionales((old) => ({
					...old,
					loading: null,
					data,
					error,
				}));
			}
		);
	}, [request, seccionales, provinciaState, provincias]);

	useEffect(() => {
		if (seccionales.loading) return;
		if (!seccionales.data.length) return;
		if (seccionales.data.find(r => r.value === seccionalState.value)) return;
		dispatchSeccional({ type: "USER_INPUT", value: seccionales.data[0].value });
	}, [seccionales, seccionalState, dispatchSeccional]);

  useEffect(() => {
    const processEstadosCiviles = async (estadosCivilesObj) => {
      const estadosCivilesSelect = estadosCivilesObj.map((estadoCivil) => {
        return { value: estadoCivil.id, label: estadoCivil.descripcion };
      });
      setEstadosCiviles(estadosCivilesSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/EstadoCivil`,
        method: "GET",
      },
      processEstadosCiviles
    );
  }, [request]);

  useEffect(() => {
    const processTiposDocumentos = async (tiposDocumentosObj) => {
      const tipoDocumentoSelect = tiposDocumentosObj.map((tipoDocumento) => {
        return { value: tipoDocumento.id, label: tipoDocumento.descripcion };
      });
      setTiposDocumentos(tipoDocumentoSelect);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/TipoDocumento`,
        method: "GET",
      },
      processTiposDocumentos
    );
  }, [request]);

  //#endregion

  //#region submit afiliado
  const afiliadoAgregarHandler = async () => {
    //event.preventDefault();
    console.log('***')
    setInputsTouched(true);
    if (!formularioIsValid || !formularioEmpleadorIsValid) {
      //console.log("formularioIsValid", formularioIsValid);
      setOpenDialog(true);
      TextCompletarCampos();
      return;
    }
    setAfiliadoProcesando(true);
    //#region Insertar Sol
    if (props.accion === "Agrega" && !afiliadoExiste) {
			const empresa = {
				cuit: cuitEmpresa,
				razonSocial: padronEmpresaRespuesta
					? padronEmpresaRespuesta?.razonSocial ??
					  `${padronEmpresaRespuesta?.apellido} ${padronEmpresaRespuesta?.nombre}`
					: "",
				claveTipo: padronEmpresaRespuesta.tipoClave,
				claveEstado: padronEmpresaRespuesta.estadoClave,
				claveInactivaAsociada: padronEmpresaRespuesta.claveInactivaAsociada,
				actividadPrincipalDescripcion:
					padronEmpresaRespuesta.descripcionActividadPrincipal,
				actividadPrincipalId: padronEmpresaRespuesta.idActividadPrincipal,
				actividadPrincipalPeriodo:
					padronEmpresaRespuesta.periodoActividadPrincipal,
				contratoSocialFecha: padronEmpresaRespuesta.fechaContratoSocial,
				cierreMes: padronEmpresaRespuesta.mesCierre,
				email: correoEmpresa,
				telefono: telefonoEmpresa,
				domicilioCalle: "string",
				domicilioNumero: 0,
				domicilioPiso: "string",
				domicilioDpto: "string",
				domicilioSector: "string",
				domicilioTorre: "string",
				domicilioManzana: "string",
				domicilioProvinciasId: 0,
				domicilioLocalidadesId: 0,
				domicilioCodigoPostal: 0,
				domicilioCPA: "string",
				domicilioTipo: "string",
				domicilioEstado: "string",
				domicilioDatoAdicional: "string",
				domicilioDatoAdicionalTipo: "string",
				ciiU1: padronEmpresaRespuesta.ciiU1,
				ciiU2: padronEmpresaRespuesta.ciiU2,
				ciiU3: padronEmpresaRespuesta.ciiU3,
			};

			const validaAutomatica =
				(ultimaDDJJ.data?.actividadTipo === "D" && ultimaDDJJ.data?.modalidadTipo === "D") &&
				(padronEmpresaRespuesta?.ciiU1EsRural ||
					padronEmpresaRespuesta?.ciiU2EsRural ||
					padronEmpresaRespuesta?.ciiU3EsRural);
			
			const domicilioRealAFIP = padronRespuesta.domicilios.find(
				(domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"
			);
			const nuevoAfiliado = {
				cuil: +cuilState.value,
				nombre: `${padronRespuesta?.apellido ?? ""} ${
					padronRespuesta?.nombre ?? ""
				}`,
				puestoId: +puestoState.value,
				fechaIngreso: fechaIngresoState.value,
				fechaEgreso: null,
				nacionalidadId: +nacionalidadState.value,
				//empresaId: +empresaId,
				seccionalId: +seccionalState.value,
				sexoId: +sexoState.value,
				tipoDocumentoId: +tipoDocumentoState.value,
				documento: +numeroDocumentoState.value,
				actividadId: +actividadState.value,
				//estadoSolicitud: afiliado.estadoSolicitud,
				estadoSolicitudId: validaAutomatica ? 2 : 1,
				estadoSolicitudObservaciones: validaAutomatica
					? "Validación Automática"
					: null,
				estadoCivilId: +estadoCivilState.value,
				refLocalidadId: +localidadState.value,
				domicilio: domicilioState.value,
				telefono: telefonoState.value,
				correo: emailState.value,
				celular: "",
				fechaNacimiento: fechaNacimientoState.value,
				afipcuil: +cuilState.value,
				afipFechaNacimiento: padronRespuesta?.fechaNacimiento,
				afipNombre: padronRespuesta?.nombre ?? "",
				afipApellido: padronRespuesta?.apellido ?? "",
				afipRazonSocial: "",
				afipTipoDocumento: padronRespuesta?.tipoDocumento,
				afipNumeroDocumento: padronRespuesta?.numeroDocumento,
				afipTipoPersona: padronRespuesta?.tipoPersona,
				afipTipoClave: padronRespuesta?.tipoClave,
				afipEstadoClave: padronRespuesta?.estadoClave,
				afipClaveInactivaAsociada: 0,
				afipFechaFallecimiento: padronRespuesta?.fechaFallecimiento,
				afipFormaJuridica: padronRespuesta?.formaJuridica,
				afipActividadPrincipal: padronRespuesta?.descripcionActividadPrincipal,
				afipIdActividadPrincipal: padronRespuesta?.idActividadPrincipal,
				afipPeriodoActividadPrincipal:
					padronRespuesta?.periodoActividadPrincipal,
				afipFechaContratoSocial: padronRespuesta?.fechaContratoSocial,
				afipMesCierre: padronRespuesta?.mesCierre,
				afipDomicilioDireccion: domicilioRealAFIP?.direccion,
				afipDomicilioCalle: domicilioRealAFIP?.calle,
				afipDomicilioNumero: domicilioRealAFIP?.numero,
				afipDomicilioPiso: domicilioRealAFIP?.piso,
				afipDomicilioDepto: domicilioRealAFIP?.oficinaDptoLocal,
				afipDomicilioSector: domicilioRealAFIP?.sector,
				afipDomicilioTorre: domicilioRealAFIP?.torre,
				afipDomicilioManzana: domicilioRealAFIP?.manzana,
				afipDomicilioLocalidad: domicilioRealAFIP?.localidad,
				afipDomicilioProvincia: domicilioRealAFIP?.descripcionProvincia,
				afipDomicilioIdProvincia: domicilioRealAFIP?.idProvincia,
				afipDomicilioCodigoPostal: domicilioRealAFIP?.codigoPostal,
				afipDomicilioTipo: domicilioRealAFIP?.tipoDomicilio,
				afipDomicilioEstado: domicilioRealAFIP?.estadoDomicilio,
				afipDomicilioDatoAdicional: domicilioRealAFIP?.datoAdicional,
				afipDomicilioTipoDatoAdicional: domicilioRealAFIP?.tipoDatoAdicional,
				empresa: empresa,
				documentacion: documentacionList.map((r) => ({
					...r,
					id: 0,
					entidadTipo: "A",
					entidadId: 0,
				})),
				};

			console.log("POST", nuevoAfiliado);
			const afiliadoAgregar = async (afiliadoResponseObj) => {

				setNuevoAfiliadoResponse({
					...nuevoAfiliado,
					id: afiliadoResponseObj,
					estadoSolicitud: props.estadosSolicitudes.find(
						(r) => r.value === nuevoAfiliado.estadoSolicitudId
					)?.label,
					empresaCUIT: cuitEmpresa,
				});
				setOpenDialog(true);
				//Si se incorpora automaticamente
				if (nuevoAfiliado.estadoSolicitudId === 2) {
					//setResolverSolicitudAfiliadoResponse(1);
					setDialogTexto(AFILIADO_AGREGADO_ACTIVO);
				}
				//pasa a resolver solicitud
				else {
					setDialogTexto(AFILIADO_AGREGADO);
				}
			};

			request(
				{
					baseURL: "Afiliaciones",
					endpoint: `/Afiliado`,
					method: "POST",
					body: nuevoAfiliado,
					headers: {
						"Content-Type": "application/json",
					},
				},
				afiliadoAgregar
			);
			//#endregion

			//#region Update Solicitud
		} else if (
      props.accion === "Modifica" ||
      (props.accion === "Agrega" && afiliadoExiste)
    ) {
      ActualizaDatosAfiliado();
    }
    setAfiliadoProcesando(false);
    //#endregion
  };
  //#endregion

  //#region Operacions validar CUIT/CUIL
  const validarAfiliadoCUILHandler = () => {
    setCUILLoading(true);
    console.log("afiliado", afiliado);
    const processConsultaPadron = async (padronObj) => {
      console.log("padronObj", padronObj);
      if (padronObj.fechaFallecimiento !== "0001-01-01T00:00:00") {
        setCUILLoading(false);
        setDialogTexto(`Error validando CUIL - Persona fallecida`);
        setOpenDialog(true);

        return;
      }

      setCuilValidado(true);
      setPadronRespuesta(padronObj);
      //Solo actualizo los datos principales si estoy agregando solicitud
      // fecha ingreso
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const day = today.getDate();
      const fechaIngreso = year + "-" + month + "-" + day;
      console.log("fechaIngreso", moment(fechaIngreso).format("yyyy-MM-DD"));
      dispatchFechaIngreso({
        type: "USER_INPUT",
        value: moment(fechaIngreso).format("yyyy-MM-DD"),
      });
      let domicilioReal = "";
      
      if (props.accion === "Agrega") {
        dispatchNombre({
          type: "USER_INPUT",
          value: `${padronObj.apellido} ${padronObj.nombre ?? ""}`,
        });
        dispatchFechaNacimiento({
          type: "USER_INPUT",
          value: moment(padronObj.fechaNacimiento).format("yyyy-MM-DD"),
        });

        //tipo doc
        const tipoDoc = tiposDocumentos.filter(
          (tipoDoc) => tipoDoc.label === padronObj.tipoDocumento
        );
        dispatchTipoDocumento({
          type: "USER_INPUT",
          value: tipoDoc[0]?.value ?? "",
        });
        dispatchNumeroDocumento({
          type: "USER_INPUT",
          value: padronObj.numeroDocumento,
        });
        domicilioReal = padronObj.domicilios.find(
          (domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"
        );

        dispatchDomicilio({
          type: "USER_INPUT",
          value: domicilioReal.direccion,
        });
        dispatchNacionalidad({
          type: "USER_INPUT",
          value: nacionalidades[5].value,
        });

        dispatchActividad({
          type: "USER_INPUT",
          value: 1,
        })

        //provincia
        const provincia = provincias.data.find(
          (provincia) => provincia.idProvinciaAFIP === domicilioReal.idProvincia
        );
        dispatchProvincia({ 
          type: "USER_INPUT", 
          value: provincia.value, 
        });

        //localidad
        const processLocalidades = async (localidadesObj) => {
          const localidad = localidadesObj.find(
            (localidad) =>
              localidad.codPostal === parseInt(domicilioReal.codigoPostal)
          );
          dispatchLocalidad({
            type: "USER_INPUT",
            value: localidadesObj[0].id ?? "",
          });
          dispatchLocalidad({ type: "USER_INPUT", value: localidad.value });
        };

        request(
          {
            baseURL: "Afiliaciones",
            endpoint: `/RefLocalidad?CodigoPostal=${parseInt(
              domicilioReal?.codigoPostal
            )}`,
            method: "GET",
          },
          processLocalidades
        );
      }

      if (props.accion === "Modifica") {
        if (!fechaNacimientoState.isValid) {
          dispatchFechaNacimiento({
            type: "USER_INPUT",
            value: moment(padronObj.fechaNacimiento).format("yyyy-MM-DD"),
          });
        }

        ActualizaDatosAfip(padronObj);
      }

      setCUILLoading(false);
    };
    
    request(      
      {        
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${
          afiliado?.cuilValidado ? afiliado?.cuilValidado : cuilState.value
        }&VerificarHistorico=${false}`,
        method: "GET",
      },
      processConsultaPadron
    );
  };

  const validarEmpresaCUITHandler = () => {
    setCUITLoading(true);
    const processConsultaPadron = async (padronObj) => {
      setCuitValidado(true);
      setPadronEmpresaRespuesta(padronObj);
      setCUITEmpresa(padronObj.cuit);
      setRazonSocialEmpresa(
        padronObj?.razonSocial ?? `${padronObj?.apellido} ${padronObj?.nombre}`
      );
      setActividadEmpresa(padronObj?.descripcionActividadPrincipal ?? "");
      setDomicilioEmpresa(
        padronObj ? `${padronObj?.domicilios[1]?.direccion}` : ""
      );
      setLocalidadEmpresa(
        padronObj
          ? padronObj?.domicilios[1]?.localidad ??
              padronObj?.domicilios[1]?.descripcionProvincia
          : ""
      );
      //ciius
      setCUITLoading(false);
    };

    request(
      {
        baseURL: "Comunes",
        endpoint: `/AFIPConsulta?CUIT=${cuitEmpresa}&VerificarHistorico=${true}`,
        method: "GET",
      },
      processConsultaPadron
    );
  };
  //#endregion

  //#region handlers change select
  const handleChangeSelect = (value, name) => {
    switch (name) {
      case "actividadSelect":
        dispatchActividad({ type: "USER_INPUT", value: value });
        break;

      case "puestoSelect":
        dispatchPuesto({ type: "USER_INPUT", value: value });
        break;

      case "nacionalidadSelect":
        dispatchNacionalidad({ type: "USER_INPUT", value: value });
        break;

      case "sexoSelect":
        dispatchSexo({ type: "USER_INPUT", value: value });
        break;

      case "seccionalSelect":
				if(seccionalState.value === value) break;
        dispatchSeccional({ type: "USER_INPUT", value: value });
        break;

      case "estadoCivilSelect":
        dispatchEstadoCivil({ type: "USER_INPUT", value: value });
        break;

      case "tipoDocumentoSelect":
        dispatchTipoDocumento({ type: "USER_INPUT", value: value });
        break;

      case "provinciaSelect":
				if(provinciaState.value === value) break;
        dispatchProvincia({ type: "USER_INPUT", value: value });
        dispatchLocalidad({ type: "USER_INPUT", value: "" });
        dispatchSeccional({ type: "USER_INPUT", value: "" });
        break;

      case "localidadSelect":
				if(localidadState.value === value) break;
        dispatchLocalidad({ type: "USER_INPUT", value: value });
        dispatchSeccional({ type: "USER_INPUT", value: "" });
        break;

      default:
        break;
    }
  };
  //#endregion

  //#region handles Inputs
  const handleInputChange = (value, id) => {
    switch (id) {
      case "fechaIngreso":
        dispatchFechaIngreso({ type: "USER_INPUT", value: value });
        break;
      case "cuil":
        setCuilValidado(false);
        setAfiliadoExiste(false);
        setNuevoAfiliadoResponse(null);
        setDialogTexto("");
        setPadronRespuesta(null);
        setCUITEmpresa("");
        dispatchCUIL({ type: "USER_INPUT", value: value });

        dispatchNombre({ type: "USER_INPUT", value: "" });
        dispatchNacionalidad({ type: "USER_INPUT", value: "" });
        dispatchFechaNacimiento({ type: "USER_INPUT", value: "" });
        dispatchEstadoCivil({ type: "USER_INPUT", value: "" });
        dispatchSexo({ type: "USER_INPUT", value: "" });
        dispatchTipoDocumento({ type: "USER_INPUT", value: "" });
        dispatchNumeroDocumento({ type: "USER_INPUT", value: "" });
        dispatchDomicilio({ type: "USER_INPUT", value: "" });
        dispatchProvincia({ type: "USER_INPUT", value: "" });
        dispatchLocalidad({ type: "USER_INPUT", value: "" });
        dispatchSeccional({ type: "USER_INPUT", value: "" });
        dispatchTelefono({ type: "USER_INPUT", value: "" });
        dispatchEmail({ type: "USER_INPUT", value: "" });
        dispatchPuesto({ type: "USER_INPUT", value: "" });
        dispatchActividad({ type: "USER_INPUT", value: "" });

        break;

      case "nombre":
        dispatchNombre({ type: "USER_INPUT", value: value });
        break;

      case "fechaNacimiento":
        dispatchFechaNacimiento({ type: "USER_INPUT", value: value });
        break;

      case "numeroDocumento":
        dispatchNumeroDocumento({ type: "USER_INPUT", value: value.replace(/[^\d]/gim, "") });
        break;

      case "domicilio":
        dispatchDomicilio({ type: "USER_INPUT", value: value });
        break;

      case "telefono":
        dispatchTelefono({ type: "USER_INPUT", value });
        break;

      case "correo":
        dispatchEmail({ type: "USER_INPUT", value: value });
        break;

      case "cuit":
        setCuitValidado(false);
        dispatchCUIT({ type: "USER_INPUT", value: value });
        setCUITEmpresa(value);
        setPadronEmpresaRespuesta(null);
        setRazonSocialEmpresa("");
        setActividadEmpresa("");
        setDomicilioEmpresa("");
        setLocalidadEmpresa("");
        setTelefonoEmpresa("");
        setCorreoEmpresa("");
        setLugarTrabajoEmpresa("");
        //ciius
        break;

      case "telefonoEmpresa":
        setTelefonoEmpresa(value);
        break;

      case "correoEmpresa":
        setCorreoEmpresa(value);
        break;

      default:
        break;
    }
  };
  //#endregion

  //#region handle Focus
  const handleOnFocus = (id) => {
    console.log("foco en", id);
    // switch (id) {
    //   case "cuil":
    //     setCuilTouched(true);
    //     break;

    //   case "numeroDocumento":
    //     setNumeroDocumentoTouched(true);
    //     break;

    //   case "cuit":
    //     setCuitTouched(true);
    //     break;

    //   default:
    //     break;
    // }
  };
  //#endregion

  //#region handle Close
  const handleCerrarModal = (refresh) => {
    console.log("nuevoAfiliadoResponse*", nuevoAfiliadoResponse);
    console.log('props.accion:',props.accion);
    console.log('dialogTexto',dialogTexto);

    if (dialogTexto == "") 
      props.onClose(false, "Cancela");
    else{
      (props.accion == "Modifica") ?
        props.onClose(afiliadoModificado, props.accion) //SI  MODIFICA AFIL, ENVIO EL AFILIADO MODIFICADO
      : 
        props.onClose(nuevoAfiliadoResponse, props.accion) //SI RESUELVE SOLICIT O AFILIADO ES NUEVO "Agrega", DEVUELVO nuevoAfiliadoResponse, EL COMPONENT PADRE SABRÁ QUE HACER SEGÚN EL ESTADO DEL AFILIADO.
    }
  };
  //#endregion

  //#region handle DDJJ
  const handleSeleccionDDJJ = (row) => {
    setCUITEmpresa(row.cuit);
    dispatchCUIT({ type: "USER_INPUT", value: row.cuit });
  };
  //#endregion

  //#region Handle tab change
  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };
  //#endregion

  //#region Functions
  const deshabilitarBotonValidarCUIL = () => {
    if (!cuilState.isValid) {
      return true;
    }

    return false;
  };

  const InputDisabled = (input) => {
    if (input !== "cuil" && cuilState.value === "") {
      return true;
    }

    if (
      afiliadoExiste &&
      afiliado?.estadoSolicitudId !== 1 &&
      afiliado?.estadoSolicitudId !== 4 &&
      afiliado?.estadoSolicitudId !== 2
    ) {
      return true;
    }

    if (props.accion === "Modifica" && input === "cuil") {
      return true;
    }

    return false;
  };

  const AgregarModificarAfiliadoDisableHandler = () => {
		let disable = false;

		switch (props.accion) {
			case "Agrega": {
				if (afiliadoExiste) disable = true;
				break;
			}
			default: {
				break;
			}
		}

		// Debe cargar un cuil valido y un cuit valido para continuar
		if (!cuilState.isValid || !cuitState.isValid) disable = true;
		// Deshabilitar hasta comprobar ddjj
		if (ultimaDDJJ.data == null) disable = true;

		return disable;
	};

  const AgregarModificarAfiliadoTitulo = () => {
		if (
			props.accion === "Modifica" ||
			(props.accion === "Agrega" && afiliadoExiste)
		)
			return "MODIFICA AFILIADO";
		
    return "AGREGA SOLICITUD"
  };

  //#endregion
	
  //#region Funciones actualizacion
  const ActualizaDatosAfiliado = () => {
    const empresa = {
      cuit: cuitEmpresa,
      razonSocial: padronEmpresaRespuesta
        ? padronEmpresaRespuesta?.razonSocial ??
          `${padronEmpresaRespuesta?.apellido} ${padronEmpresaRespuesta?.nombre}`
        : "",
      claveTipo: padronEmpresaRespuesta.tipoClave,
      claveEstado: padronEmpresaRespuesta.estadoClave,
      claveInactivaAsociada: padronEmpresaRespuesta.claveInactivaAsociada,
      actividadPrincipalDescripcion:
        padronEmpresaRespuesta.descripcionActividadPrincipal,
      actividadPrincipalId: padronEmpresaRespuesta.idActividadPrincipal,
      actividadPrincipalPeriodo:
        padronEmpresaRespuesta.periodoActividadPrincipal,
      contratoSocialFecha: padronEmpresaRespuesta.fechaContratoSocial,
      cierreMes: padronEmpresaRespuesta.mesCierre,
      email: correoEmpresa,
      telefono: telefonoEmpresa,
      domicilioCalle: "string",
      domicilioNumero: 0,
      domicilioPiso: "string",
      domicilioDpto: "string",
      domicilioSector: "string",
      domicilioTorre: "string",
      domicilioManzana: "string",
      domicilioProvinciasId: 0,
      domicilioLocalidadesId: 0,
      domicilioCodigoPostal: 0,
      domicilioCPA: "string",
      domicilioTipo: "string",
      domicilioEstado: "string",
      domicilioDatoAdicional: "string",
      domicilioDatoAdicionalTipo: "string",
      ciiU1: padronEmpresaRespuesta.ciiU1,
      ciiU2: padronEmpresaRespuesta.ciiU2,
      ciiU3: padronEmpresaRespuesta.ciiU3,
    };

    const domicilioRealAFIP = padronRespuesta?.domicilios.find((domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"      
    );
		
    const afiliadoModificado = {
			id: nuevoAfiliadoResponse.id,
			cuil: +cuilState.value,
			nroAfiliado: +afiliado.nroAfiliado,
			nombre: nombreState.value,
			puestoId: +puestoState.value,
			fechaIngreso: fechaIngresoState.value,
			fechaEgreso: afiliado.fechaEgreso,
			nacionalidadId: +nacionalidadState.value,
			//empresaCUIT: +cuitEmpresa,
			seccionalId: +seccionalState.value,
			sexoId: +sexoState.value,
			tipoDocumentoId: +tipoDocumentoState.value,
			documento: +numeroDocumentoState.value,
			actividadId: +actividadState.value,
			estadoSolicitud: afiliado.estadoSolicitud,
			estadoSolicitudId: +afiliado.estadoSolicitudId,
			estadoSolicitudObservacion: afiliado.estadoSolicitudObservacion,
			estadoCivilId: +estadoCivilState.value,
			refLocalidadId: +localidadState.value,
			domicilio: domicilioState.value,
			telefono: telefonoState.value,
			correo: emailState.value,
			celular: "",
			fechaNacimiento: fechaNacimientoState.value,
			afipcuil: +cuilState.value,
			afipFechaNacimiento:
				padronRespuesta !== null
					? padronRespuesta.fechaNacimiento
					: afiliado.afipFechaFallecimiento,
			afipNombre:
				padronRespuesta !== null ? padronRespuesta.nombre : afiliado.afipNombre,
			afipApellido:
				padronRespuesta !== null
					? padronRespuesta.apellido
					: afiliado.afipApellido,
			afipRazonSocial: "",
			afipTipoDocumento:
				padronRespuesta !== null
					? padronRespuesta.tipoDocumento
					: afiliado.afipTipoDocumento,
			afipNumeroDocumento:
				padronRespuesta !== null
					? padronRespuesta.numeroDocumento
					: afiliado.afipNumeroDocumento,
			afipTipoPersona:
				padronRespuesta !== null
					? padronRespuesta.tipoPersona
					: afiliado.afipTipoPersona,
			afipTipoClave:
				padronRespuesta !== null
					? padronRespuesta.tipoClave
					: afiliado.afipTipoClave,
			afipEstadoClave:
				padronRespuesta !== null
					? padronRespuesta.estadoClave
					: afiliado.afipEstadoClave,
			afipClaveInactivaAsociada:
				padronRespuesta !== null
					? padronRespuesta.claveInactivaAsociada
					: afiliado.afipClaveInactivaAsociada,
			afipFechaFallecimiento:
				padronRespuesta !== null
					? padronRespuesta.fechaFallecimiento
					: afiliado.afipFechaFallecimiento,
			afipFormaJuridica:
				padronRespuesta !== null
					? padronRespuesta.formaJuridica
					: afiliado.afip,
			afipActividadPrincipal:
				padronRespuesta !== null
					? padronRespuesta.descripcionActividadPrincipal
					: afiliado.afip,
			afipIdActividadPrincipal:
				padronRespuesta !== null
					? padronRespuesta.idActividadPrincipal
					: afiliado.afip,
			afipPeriodoActividadPrincipal:
				padronRespuesta !== null
					? padronRespuesta.periodoActividadPrincipal
					: afiliado.afip,
			afipFechaContratoSocial:
				padronRespuesta !== null
					? padronRespuesta.afipFechaContratoSocial
					: afiliado.afip,
			afipMesCierre:
				padronRespuesta !== null ? padronRespuesta.mesCierre : afiliado.afip,
			afipDomicilioDireccion:
				padronRespuesta !== null
					? `${domicilioRealAFIP.calle} ${domicilioRealAFIP.numero}`
					: afiliado.afipDomicilioDireccion,
			afipDomicilioCalle:
				padronRespuesta !== null
					? domicilioRealAFIP.calle
					: afiliado.afipDomicilioCalle,
			afipDomicilioNumero:
				padronRespuesta !== null
					? domicilioRealAFIP.numero
					: afiliado.afipDomicilioNumero,
			afipDomicilioPiso:
				padronRespuesta !== null
					? domicilioRealAFIP.piso
					: afiliado.afipDomicilioPiso,
			afipDomicilioDepto:
				padronRespuesta !== null
					? domicilioRealAFIP.depto
					: afiliado.afipDomicilioDepto,
			afipDomicilioSector:
				padronRespuesta !== null
					? domicilioRealAFIP.sector
					: afiliado.afipDomicilioSector,
			afipDomicilioTorre:
				padronRespuesta !== null
					? domicilioRealAFIP.torre
					: afiliado.afipDomicilioTorre,
			afipDomicilioManzana:
				padronRespuesta !== null
					? domicilioRealAFIP.manzana
					: afiliado.afipDomicilioManzana,
			afipDomicilioLocalidad:
				padronRespuesta !== null
					? domicilioRealAFIP.localidad
					: afiliado.afipDomicilioLocalidad,
			afipDomicilioProvincia:
				padronRespuesta !== null
					? domicilioRealAFIP.provincia
					: afiliado.afipDomicilioProvincia,
			afipDomicilioIdProvincia:
				padronRespuesta !== null
					? domicilioRealAFIP.idProvincia
					: afiliado.afipDomicilioIdProvincia,
			afipDomicilioCodigoPostal:
				padronRespuesta !== null
					? domicilioRealAFIP.codigoPostal
					: afiliado.afipDomicilioCodigoPostal,
			afipDomicilioTipo:
				padronRespuesta !== null
					? domicilioRealAFIP.tipo
					: afiliado.afipDomicilioTipo,
			afipDomicilioEstado:
				padronRespuesta !== null
					? domicilioRealAFIP.estado
					: afiliado.afipDomicilioEstado,
			afipDomicilioDatoAdicional:
				padronRespuesta !== null
					? domicilioRealAFIP.datoAdicional
					: afiliado.afipDomicilioDatoAdicional,
			afipDomicilioTipoDatoAdicional:
				padronRespuesta !== null
					? domicilioRealAFIP.tipoDatoAdicional
					: afiliado.afipDomicilioTipoDatoAdicional,
			empresa: empresa,
			documentacion: documentacionList.map((r) => ({
				...r,
				id: r.id ?? 0,
				entidadTipo: "A",
				entidadId: nuevoAfiliadoResponse.id,
			})),
		};
    console.log("afiliado modificado", afiliadoModificado);
    const afiliadoModificar = async (afiliadoModificarResponseObj) => {
      setAfiliadoModificado(afiliadoModificado);
      setDialogTexto(AFILIADO_ACTUALIZADO);
      setOpenDialog(true);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Afiliado`,
        method: "PUT",
        body: afiliadoModificado,
        headers: {
          "Content-Type": "application/json",
        },
      },
      afiliadoModificar
    );
  };

  const ActualizaDatosAfip = (padronObj) => {
    const patchModelo = ActualizarDatosAfip(padronObj);
    console.log("patchModelo", patchModelo);
    const actualizarDatosAfip = async () => {
      setDialogTexto(AFILIADO_DATOSAFIPACTUALIZADO);
      setOpenDialog(true);
    };

    request(
      {
        baseURL: "Afiliaciones",
        endpoint: `/Afiliado/ActualizarDatosAfip?Id=${afiliado?.id}`,
        method: "PATCH",
        body: patchModelo,
        headers: {
          "Content-Type": "application/json",
        },
      },
      actualizarDatosAfip
    );
  };
  //#endregion

  //#region Dialog or alert
  const handleCloseDialog = () => {
    
    if (
      dialogTexto.includes('El afiliado ya está cargado')){
        setDialogTexto("");//limpio el dialogo para que al cerrar el dialog no recargue el browse
      }
   
    setOpenDialog(false);
    if (
			dialogTexto.includes(AFILIADO_SOLICITUDRESUELTA) ||
			[
				AFILIADO_ACTUALIZADO,
				AFILIADO_AGREGADO,
				AFILIADO_AGREGADO_ACTIVO,
			].includes(dialogTexto)
		) {
			handleCerrarModal(true);
		}
  };
  //#endregion

  return (
		<>
			<div>
				<Dialog onClose={handleCloseDialog} open={openDialog}>
					<DialogContent dividers>
						<Typography gutterBottom>{dialogTexto}</Typography>
					</DialogContent>
					<DialogActions>
						<Button className="botonAmarillo" onClick={handleCloseDialog}>
							Cierra
						</Button>
					</DialogActions>
				</Dialog>
			</div>
			<Modal onClose={handleCerrarModal}>
				<CabeceraABMAfiliado
					cuilState={cuilState}
					nombreState={nombreState}
					afiliadoExiste={afiliadoExiste}
					padronRespuesta={padronRespuesta}
					afiliado={afiliado}
					estadoSolicitudDescripcion={afiliado?.estadoSolicitud}
				/>

				<div className={classes.div}>
					<Tabs
						value={selectedTab}
						onChange={handleChangeTab}
						aria-label="basic tabs example"
					>
						<Tab
							label="Datos Personales"
							//disabled={nuevoAfiliadoResponse ? true : false}
						/>
						<Tab
							label="Datos Empleador"
							disabled={formularioIsValid ? false : true}
						/>
						<Tab
							label={
								/*padronRespuesta ? `DDJJ UATRE de ${cuilState.value} ${nombre}` : //es demasiado grande el texto para el tab*/ "DDJJ UATRE"
							}
							disabled={!cuilState.isValid || !cuitState.isValid}
						/>
						<Tab
							label="Documentacion"
							disabled={!cuilState.isValid || !cuitState.isValid}
						/>
					</Tabs>
				</div>
				{[
					//Datos Principales
					<div className={classes.div}>
						<div className={classes.renglon}>
							<div className={classes.input25}>
								<InputMaterialMask
									id="cuil"
									onFocus={handleOnFocus}
									value={cuilState.value.toString()}
									label="CUIL"
									disabled={
										InputDisabled("cuil") || afiliado?.estadoSolicitudId === 2
									}
									width={98}
									onChange={handleInputChange}
									helperText={
										!cuilState.isValid && cuilState.value !== ""
											? "CUIL con formato incorrecto"
											: ""
									}
									error={
										!cuilState.isValid &&
										cuilState.value !== "" &&
										inputsTouched
											? true
											: false
									}
								/>
							</div>
							<div className={classes.input25}>
								<Button
									className="botonAzul"
									width={80}
									heigth={70}
									disabled={deshabilitarBotonValidarCUIL()}
									onClick={validarAfiliadoCUILHandler}
									loading={cuilLoading}
								>
									{!cuilLoading ? `Valida CUIL` : `Validando...`}
								</Button>
							</div>
							<div className={classes.input25}>
								<InputMaterial
									id="nroAfiliado"
									value={afiliado?.nroAfiliado}
									label="Nro Afiliado"
									onChange={handleInputChange}
									readOnly={true}
								/>
							</div>
							<div className={classes.input25}>
								<InputMaterial
									id="fechaIngreso"
									value={fechaIngresoState.value}
									label="Fecha Ingreso"
									onChange={handleInputChange}
									type="date"
									//readOnly={!afiliadoExiste}
								/>
							</div>
						</div>
						<div className={classes.renglon}>
							<div className={classes.input}>
								<InputMaterial
									id="nombre"
									value={nombreState.value ?? ""}
									label="Apellido y Nombre"
									width={100}
									onChange={handleInputChange}
									disabled={InputDisabled()}
									error={!nombreState.isValid && inputsTouched ? true : false}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="tipoDocumentoSelect"
									value={tipoDocumentoState.value}
									options={tiposDocumentos}
									label="Tipo Documento"
									disabled={InputDisabled()}
									onChange={handleChangeSelect}
									//width={98}
									error={
										!tipoDocumentoState.isValid && inputsTouched ? true : false
									}
									helperText
								/>
							</div>
							<div className={classes.input25}>
								<InputMaterial
									id="numeroDocumento"
									onFocus={handleOnFocus}
									value={numeroDocumentoState.value}
									label="Numero Documento"
									disabled={InputDisabled()}
									mask="99\.999\.999"
									//width={96}
									onChange={handleInputChange}
									error={
										!numeroDocumentoState.isValid && inputsTouched
											? true
											: false
									}
								/>
							</div>
						</div>
						<div className={classes.renglon}>
							<div className={classes.input25}>
								<InputMaterial
									id="fechaNacimiento"
									value={fechaNacimientoState.value}
									label="Fecha de Nacimiento"
									type="date"
									onChange={handleInputChange}
									disabled={InputDisabled()}
									error={
										!fechaNacimientoState.isValid && inputsTouched
											? true
											: false
									}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="nacionalidadSelect"
									label="Nacionalidad"
									options={nacionalidades}
									value={nacionalidadState.value}
									defaultValue={nacionalidades[0]}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!nacionalidadState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="estadoCivilSelect"
									label="Estado Civil"
									options={estadosCiviles}
									value={estadoCivilState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									//width={100}
									error={
										!estadoCivilState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="sexoSelect"
									label="Genero"
									options={sexos}
									value={sexoState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									//width={100}
									error={!sexoState.isValid && inputsTouched ? true : false}
								/>
							</div>
						</div>
						<div className={classes.renglon}>
							<div className={classes.input}>
								<InputMaterial
									id="domicilio"
									value={domicilioState.value}
									label="Domicilio"
									disabled={InputDisabled()}
									onChange={handleInputChange}
									error={
										!domicilioState.isValid && inputsTouched ? true : false
									}
								/>
							</div>

							<div className={classes.input}>
								<SelectMaterial
									name="provinciaSelect"
									label="Provincia"
									options={provincias.data}
									value={provinciaState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!provinciaState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
							<div className={classes.input}>
								<SelectMaterial
									name="localidadSelect"
									label="Localidad"
									options={localidades.data}
									value={localidadState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!localidadState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
						</div>

						<div className={classes.renglon}>
							<div className={classes.input}>
								<SelectMaterial
									name="seccionalSelect"
									label="Seccional"
									options={seccionales.data}
									value={seccionalState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!seccionalState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="puestoSelect"
									label="Oficio"
									options={puestos}
									value={puestoState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									//error={!puestoState.isValid && inputsTouched ? true : false}
								/>
							</div>
							<div className={classes.input25}>
								<SelectMaterial
									name="actividadSelect"
									label="Actividad"
									options={actividades}
									value={actividadState.value}
									onChange={handleChangeSelect}
									disabled={InputDisabled()}
									error={
										!actividadState.isValid && inputsTouched ? true : false
									}
								/>
							</div>
						</div>

						<div className={classes.renglon}>
							<div className={classes.input}>
								<InputMaterial
									id="telefono"
									value={telefonoState.value}
									label="Telefono/Celular"
									disabled={InputDisabled()}
									width={100}
									onChange={handleInputChange}
								/>
							</div>
							<div className={classes.input}>
								<InputMaterial
									id="correo"
									value={emailState.value}
									label="Correo"
									disabled={InputDisabled()}
									width={100}
									onChange={handleInputChange}
									helperText={
										!emailState.isValid &&
										emailState.value !== "" &&
										emailState.value !== null
											? "Email inválido"
											: ""
									}
									error={
										!emailState.isValid &&
										emailState.value !== "" &&
										emailState.value !== null
											? true
											: false
									}
								/>
							</div>
						</div>

						<DatosAfip afiliado={afiliado} padronRespuesta={padronRespuesta} />
					</div>,

					//Empleador
					<TabEmpleador
						padronEmpresaRespuesta={padronEmpresaRespuesta}
						cuitEmpresa={cuitEmpresa}
						cuitState={cuitState}
						cuitValidado={cuitValidado}
						cuitLoading={cuitLoading}
						razonSocialEmpresa={razonSocialEmpresa}
						actividadEmpresa={actividadEmpresa}
						domicilioEmpresa={domicilioEmpresa}
						localidadEmpresa={localidadEmpresa}
						telefonoEmpresa={telefonoEmpresa}
						correoEmpresa={correoEmpresa}
						lugarTrabajoEmpresa={lugarTrabajoEmpresa}
						inputsTouched={inputsTouched}
						onHandleInputChange={handleInputChange}
						onValidarEmpresaCUITHandler={validarEmpresaCUITHandler}
						onFocus={handleOnFocus}
					/>,

					// DeclaracionesJuradas
					<DeclaracionesJuradas
						cuil={afiliado !== null ? afiliado.cuilValidado : cuilState.value}
						cuit={cuitEmpresa}
						onSeleccionRegistro={handleSeleccionDDJJ}
						infoCompleta={true}
						// onDeclaracionesGeneradas={handleOnDeclaracionesGeneradas}
						registros={12}
					/>,

					<Documentacion
						data={documentacionList}
						onChange={({ index, item }) => {
							const newDocList = [...documentacionList];
							if (index == null) {
								// Create
								newDocList.push(item);
							} else if (item == null) {
								// Delete
								newDocList.splice(index, 1);
							} else {
								// Update
								newDocList.splice(index, 1, item);
							}
							setDocumentacionList(newDocList);
						}}
					/>,
				][selectedTab]}
				<div className={classes.footer}>
					<Button
						className="botonAzul" /*className={classes.button}*/
						loading={afiliadoProcesando}
						width={25}
						onClick={afiliadoAgregarHandler}
						disabled={AgregarModificarAfiliadoDisableHandler()}
					>
						{AgregarModificarAfiliadoTitulo()}
					</Button>

					<Button
						className="botonAmarillo"
						width={25}
						onClick={handleCerrarModal}
					>
						CIERRA
					</Button>
				</div>
			</Modal>
		</>
	);
};

export default AfiliadoAgregar;
