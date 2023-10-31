import {useState, useEffect} from 'react';
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid"; 
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "../../../redux/actions";
import { handleModuloEjecutarAccion } from "../../../redux/actions";

const AdministracionHandler = () => {

	const [accesos, setAccesos] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const usuarioLogueado = useSelector(
		(state) => state.usuarioLogueado
	  );
	  
	  let modulos = [];
	  usuarioLogueado?.modulosTareas.forEach((mod) => {
		if (modulos.includes(mod.nombreModulo)) return;
		modulos.push(mod.nombreModulo);
	  });

	useEffect(() => {
		const newAccesos = [];
		newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Seccionales")}>Seccionales</Button>)
		newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Empresas")}>Empresas</Button>)
		newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Delegaciones")}>Delegaciones</Button>)
		newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Localidades")}>Localidades</Button>)
		modulos.includes("Administracion de Accesos") && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("AdministracionDeAccesos")}>Administración De Accesos</Button>)
		setAccesos(newAccesos);	

		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	},[])


	return (
		<>
			<div className="titulo">
				<h1>Administración de datos</h1>
			</div>
			

			<Grid col gap="20px" style={{ margin: "10px" }}>
				{accesos}
			</Grid>

		</>
	);
};

export default AdministracionHandler;