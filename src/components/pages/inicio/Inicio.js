import React, { useState } from "react";
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid"; 
import { useNavigate } from "react-router-dom";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import { useEffect } from "react";

const Inicio = ({ modulos = [] }) => {
	const navigate = useNavigate();
	const [accesos, setAccesos] = useState([]);

	useEffect(() => {
		const newAccesos = [];
		modulos.forEach((modulo) => {
			let acceso = {};
			switch (modulo) {
				case "Afiliaciones":
					acceso.nombre = <>Afiliaciones</>;
					acceso.accion = () => navigate("/afiliaciones");
					break;
				case "Siaru":
					acceso.nombre = <>Sistema de Aportes Rurales</>;
					acceso.accion = () => navigate("/siaru");
					break;
				case "Administracion de Datos":
					acceso.nombre = <>Administración de Datos</>;
					acceso.accion = () => navigate("/administracion");
					break;
				case "Expedientes":
					acceso.nombre = <>Expedientes</>;
					acceso.accion = () => navigate("/expedientes");
					break;
				default:
					return;
			}
			newAccesos.push(<Button onClick={acceso.accion}>{acceso.nombre}</Button>);
		});

		if (newAccesos.length === 1) newAccesos[0].props.onClick();
		else setAccesos(newAccesos);
	}, [modulos, navigate]);

	return (
		<>
			<h1 className="titulo">Sistema Integral de UATRE</h1>
			<Grid col gap="20px" style={{ margin: "10px" }}>
				{accesos}
			</Grid>
		</>
	);
};

export default Inicio;
