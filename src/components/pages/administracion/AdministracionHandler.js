import {useState, useEffect} from 'react';
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid"; 
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "../../../redux/actions";
import { handleModuloEjecutarAccion } from "../../../redux/actions";

const AdministracionHandler = () => {

	const [accesos, setAccesos] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		
		const newAccesos = [];
		newAccesos.push(<Button onClick={() => navigate("/seccionales")}>Seccionales</Button>)
		newAccesos.push(<Button onClick={() => navigate("/empresas")}>Empresas</Button>)
		newAccesos.push(<Button onClick={() => navigate("/delegaciones")}>Delegaciones</Button>)
		newAccesos.push(<Button onClick={() => navigate("/localidades")}>Localidades</Button>)
		newAccesos.push(<Button onClick={() => navigate("/administracionDeAccesos")}>Administracion De Accesos</Button>)
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