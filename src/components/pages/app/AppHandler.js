import {useState, useEffect} from 'react';
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid"; 
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleModuloEjecutarAccion } from "../../../redux/actions";
import useTareasUsuario from 'components/hooks/useTareasUsuario';

const AppHandler = () => {

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const tareas = useTareasUsuario();

	const newAccesos = [];
		tareas.hasTarea("App_Encuesta")  && newAccesos.push(<Button className="botonAmarillo" onClick={() => navigate("Encuestas")}>Encuestas</Button>)

	dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!

	return (
		<div>
			<div className="titulo">
				<h1>Administración App</h1>
			</div>

			<Grid col gap="20px" style={{ margin: "10px" }}>
				{newAccesos}
			</Grid>

		</div>
	);
};

export default AppHandler;