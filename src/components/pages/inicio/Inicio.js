import React, { useState } from "react";
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid"; 
import { useNavigate } from "react-router-dom";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import { useEffect } from "react";
import UseKeyPress from '../../helpers/UseKeyPress';

const Inicio = ({ modulos = [] }) => {
	const navigate = useNavigate();
	const [accesos, setAccesos] = useState([]);


	UseKeyPress(['a'], ()=>navigate("Afiliaciones"), 'AltKey');
	UseKeyPress(['s'], ()=>navigate("Siaru"), 'AltKey');
	UseKeyPress(['t'], ()=>navigate("Administracion"), 'AltKey');
	
	useEffect(() => {
		const newAccesos = [];
		modulos.forEach((modulo) => {
			let acceso = {};
			switch (modulo) {
				case "Afiliaciones":
					acceso.nombre = <><text className="underline">A</text>filiaciones</>;
					acceso.accion = () => navigate("Afiliaciones");
					break;
				case "Siaru":
					acceso.nombre = <><text className="underline">S</text>istema de Aportes Rurales</>;
					acceso.accion = () => navigate("Siaru");
					break;
				case "Administracion de Datos":
					acceso.nombre = <>Administración de Da<text className="underline">t</text>os</>;
					acceso.accion = () => navigate("Administracion");
					break;
				case "Expedientes":
					acceso.nombre = <><text className="underline">E</text>xpedientes</>;
					acceso.accion = () => navigate("Expedientes");
					break;
				default:
					return;
			}
			newAccesos.push(<Button className="botonAmarillo" onClick={acceso.accion}>{acceso.nombre}</Button>);
		});

		if (newAccesos.length === 1) newAccesos[0].props.onClick();
		else setAccesos(newAccesos);
	}, [modulos, navigate]);

	return (
		<>	
			<div className="titulo">
				<h1 >Sistema Integral de UATRE</h1>
			</div>
			<Grid col gap="20px" style={{ margin: "10px" }}>
				{accesos}
			</Grid>
		</>
	);
};

export default Inicio;
