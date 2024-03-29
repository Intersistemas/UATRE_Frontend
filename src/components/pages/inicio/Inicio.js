
import React, { useState } from "react";
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid"; 
import { useNavigate } from "react-router-dom";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import { useEffect } from "react";
import UseKeyPress from '../../helpers/UseKeyPress';
import useTareasUsuario from "components/hooks/useTareasUsuario";

const Inicio = () => {
	const navigate = useNavigate();

	const tareas = useTareasUsuario();
	
	const accesos = [];
		
			tareas.hasTarea("Afiliaciones_Tabla") &&  accesos.push(<Button className="botonAmarillo" onClick={() => navigate("Afiliaciones")}  ><><text className="underline">A</text>filiaciones</></Button>); 
			tareas.hasTarea("Siaru_Tabla") && 		  accesos.push(<Button className="botonAmarillo" onClick={() => navigate("Empresas")}      ><><text className="underline">S</text>istema de Aportes Rurales</></Button>);
			tareas.hasTarea("Datos_Tabla") &&		  accesos.push(<Button className="botonAmarillo" onClick={() => navigate("Administracion")}><>Administración de Da<text className="underline">t</text>os</></Button>);
			tareas.hasTarea("Expedientes_Tabla") &&   accesos.push(<Button className="botonAmarillo" onClick={() => navigate("Expedientes")}   ><><text className="underline">E</text>xpedientes</></Button>);
			tareas.hasTarea("Informes_Tabla") && 	  accesos.push(<Button className="botonAmarillo" onClick={() => navigate("Informes")}      ><><text className="underline">I</text>nformes</></Button>);
			tareas.hasTarea("Consultas_Tabla") && 	  accesos.push(<Button className="botonAmarillo" onClick={() => navigate("Consultas")}     ><>Co<text className="underline">n</text>sultas</></Button>);
			

	const [botonesAccesos, setBotonesAccesos] = useState(accesos)

	UseKeyPress(['a'], ()=>navigate("Afiliaciones"), 'AltKey');
	UseKeyPress(['s'], ()=>navigate("Empresas"), 'AltKey');
	UseKeyPress(['t'], ()=>navigate("Administracion"), 'AltKey');
	UseKeyPress(['i'], ()=>navigate("Informes"), 'AltKey');
	UseKeyPress(['n'], ()=>navigate("Consultas"), 'AltKey');
		
	
	useEffect(() => {
		
		if (botonesAccesos.length === 1) botonesAccesos[0].props.onClick();

	}, []);

	return (
		<>	
			<div className="titulo">
				<h1 >Sistema Integral de UATRE</h1>
			</div>
			<Grid col gap="20px" style={{ margin: "10px" }}>
				{botonesAccesos}
			</Grid>
		</>
	);
};

export default Inicio;