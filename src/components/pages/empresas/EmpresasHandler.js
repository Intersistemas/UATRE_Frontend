import { useState, useEffect, Fragment, useContext } from "react";
import useHttp from "../../hooks/useHttp";

import Empresas from "./Empresas";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "../../../redux/actions";
import { handleModuloEjecutarAccion } from "../../../redux/actions";
import AuthContext from "../../../store/authContext";


const EmpresasHandler = () => {
  const { isLoading, error, sendRequest: request } = useHttp();

  //#region variables de estado
  const [empresaList, setEmpresaList] = useState({ loading: true });
	const [empresaRecord, setEmpresaRecord] = useState();
  const authContext = useContext(AuthContext);
  
  const moduloInfoDefault = {
		nombre: "Empresas",
		acciones: [
		  {
        id: 1,
        name: "Agrega Empresa",
        icon: "",
        disabled: false,
		  },
      {
        id: 2,
        name: "Modifica Empresa",
        icon: "",
        disabled: false,
      },
      {
        id: 3,
        name: "Borra Empresa",
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
	switch (moduloAccion?.name) {
		case "Agrega Empresa":
		  alert('Agrega - Funcionalida en Desarrollo');
		  break;
    case "Modifica Empresa":
      alert('Modifica - Funcionalida en Desarrollo');
    case "Borra Empresa":
      alert('Borra - Funcionalida en Desarrollo');
		default:
		break;
	}
	dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion]);
  //#endregion

  //#region api calls
  useEffect(() => {
    if (authContext.usuario?.empresas) {
			const empresas = [...authContext.usuario.empresas];
			setEmpresaList({ data: empresas });
			if (empresas.length > 0) setEmpresaRecord(empresas[0]);
		}
	}, [authContext.usuario]);

  //#endregion

  const selection = {
		onSelect: (row, isSelect, rowIndex, e) => setEmpresaRecord(row),
	}
	if (empresaRecord) {
		selection.selected = [empresaRecord.cuitEmpresa]
	}

  return (
    <Fragment>
    
        <Empresas
          loading={empresaList.loading}
          data={empresaList.data}
          selection={selection}
          noData={(() => {
            const rq = empresaList;
            if (rq?.loading) return <h4>Cargando...</h4>;
            if (!rq?.error)
              return <h4>No hay informacion a mostrar</h4>;
            switch (rq.error.code ?? 0) {
              case 0:
                return <h4>{rq.error.message}</h4>;
              default:
                return (
                  <h4 style={{ color: "red" }}>
                    {"Error "}
                    {rq.error.code ? `${rq.error.code} - ` : ""}
                    {rq.error.message}
                  </h4>
                );
            }
          })()}
        />
       
    </Fragment>
  );
};

export default EmpresasHandler;
