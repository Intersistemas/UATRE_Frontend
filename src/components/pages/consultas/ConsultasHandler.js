import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import Localizar from "../afiliados/localizar/Localizar";
import SeccionalesMap from "./seccionalMaps/seccionalesMap";
import useTareasUsuario from "components/hooks/useTareasUsuario";


const ConsultasHandler = () => {
	const [consulta, setConsulta] = useState();

	const tabs = [];
	const [tab, setTab] = useState(0);

	const tarea = useTareasUsuario();
	const disableTabSeccionales = !tarea.hasTarea("Consultas_Seccionales");
	const disableTabAfiliados = !tarea.hasTarea("Consultas_Afiliados");


	const onDownloadSolicitudAfiliacion = () => {
		const link = document.createElement("a");
		link.download = `SolicitudAfiliacion.pdf`;
		link.href = "/Consultas/SolicitudAfiliacion.pdf";
		link.click();
	  };

	const onDownloadSolicitudCambioSeccional = () => {
		const link = document.createElement("a");
		link.download = `Solicitud_Cambio_Seccional.pdf`;
		link.href = "/Consultas/SolicitudCambioSeccional.pdf";
		link.click();
	  };

	// Afiliados
	tabs.push({
		header: () => <Tab label="Afiliados" /*disable={disableTabAfiliados}*//>,
		body: () => (
			<>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() =>							
							setConsulta(<Localizar onClose={() => setConsulta(null)} />)
						}
						width="32"
						tarea="Consultas_AfiliadoLocaliza"
					>
						Localiza Afiliado
					</Button>
					
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() =>onDownloadSolicitudAfiliacion()}
						width="32"
						tarea="Consultas_SolicitudAfiliacion"
					>
						Solicitud de Afiliación
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={onDownloadSolicitudCambioSeccional}
						width="32"
						tarea="Consultas_SolicitudCambioSeccional"
					>
						Solicitud de Cambio de Seccional
					</Button>
				
				</Grid>
			</>
		),
		// actions,
	});

	// Afiliados
	tabs.push({
		header: () => <Tab label="Seccionales" disable={disableTabSeccionales} />,
		body: () => (
			<>
				<Grid width gap="inherit" justify="evenly">
					<SeccionalesMap/>
				</Grid>
			</>
		),
		// actions,
	});

	// DDJJ
	tabs.push({
		header: () => <Tab label="Otras Consultas"/>,
		body: () => (
			<>
				<Grid width gap="inherit" justify="evenly">
					
				</Grid>
			</>
		),
		// actions,
	});

	return (
		<Grid col height="100vh" gap="20px">
			<Grid className="titulo" width>
				<h1>Consultas</h1>
			</Grid>
			<Grid col width gap="inherit" grow>
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
				{tabs[tab].body()}
			</Grid>
			{consulta}
		</Grid>
	);
};

export default ConsultasHandler;
