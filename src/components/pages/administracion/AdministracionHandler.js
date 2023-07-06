import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "../../../redux/actions";
import { handleModuloEjecutarAccion } from "../../../redux/actions";
import {useState, useEffect} from 'react';
import SeccionalesHandler from "../seccionales/SeccionalesHandler";

const AdministracionHandler = () => {

	const [seccionalesShow, setSeccionalesShow] = useState(false);

	const moduloInfoDefault = {
		nombre: "Administracion",
		acciones: [
		  {
			id: 1,
			name: "Seccionales",
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
		case "Seccionales":
		setSeccionalesShow(true);
		break;
		default:
		break;
	}
	dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion]);


	const onCloseSeccionalHandler=()=>{

	}

	return (
		<>
			<div className="titulo">
				<h1>Administración de datos</h1>
			</div>
			<div className="contenido">
			{seccionalesShow && (
				<SeccionalesHandler
					onClose={onCloseSeccionalHandler}
				/>
				)}
			</div>
		</>
	);
};

export default AdministracionHandler;