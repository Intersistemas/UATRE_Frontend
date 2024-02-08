import {useState, useEffect} from 'react';
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid"; 
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleModuloEjecutarAccion } from "../../../redux/actions";
import useTareasUsuario from 'components/hooks/useTareasUsuario';

const AdministracionHandler = () => {

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const tareas = useTareasUsuario();

	const newAccesos = [];
		tareas.hasTarea("Datos_Seccional")  && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Seccionales")}>Seccionales</Button>)
		tareas.hasTarea("Datos_Empresa")    && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Empresas")}>Empresas</Button>)
		tareas.hasTarea("Datos_Delegacion") && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Delegaciones")}>Delegaciones</Button>)
		tareas.hasTarea("Datos_Localidad")  && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Localidades")}>Localidades</Button>)
		tareas.hasTarea("Datos_Permisos")   && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Accesos")}>Administración De Accesos</Button>)	

	dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!

	return (
		<div>
			<div className="titulo">
				<h1>Administración de datos</h1>
			</div>

			<Grid col gap="20px" style={{ margin: "10px" }}>
				{newAccesos}
			</Grid>

		</div>
	);
};

export default AdministracionHandler;