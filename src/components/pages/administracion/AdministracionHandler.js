import {useState, useEffect} from 'react';
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid"; 
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "../../../redux/actions";
import { handleModuloEjecutarAccion } from "../../../redux/actions";
import TareaUsuario from 'components/helpers/TareaUsuario';

const AdministracionHandler = () => {

	const [accesos, setAccesos] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	  

	const newAccesos = [];
		TareaUsuario("Datos_Seccional")  && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Seccionales")}>Seccionales</Button>)
		TareaUsuario("Datos_Empresa")    && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Empresas")}>Empresas</Button>)
		TareaUsuario("Datos_Delegacion") && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Delegaciones")}>Delegaciones</Button>)
		TareaUsuario("Datos_Localidad")  && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Localidades")}>Localidades</Button>)
		TareaUsuario("Datos_Permisos")   && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Accesos")}>Administración De Accesos</Button>)	

	dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!



	return (
		<>
			<div className="titulo">
				<h1>Administración de datos</h1>
			</div>
			

			<Grid col gap="20px" style={{ margin: "10px" }}>
				{newAccesos}
			</Grid>

		</>
	);
};

export default AdministracionHandler;