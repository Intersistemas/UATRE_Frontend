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

	// Afiliados
	tabs.push({
		header: () => <Tab label="Afiliados" />,
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
						onClick={() =>							
							alert("En desarrollo")//setConsulta(<Localizar onClose={() => setConsulta(null)} />)
						}
						width="32"
						tarea="Consultas_SolicitudAfiliacion"
					>
						Solicitud de Afiliación
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() =>							
							alert("En desarrollo")//setConsulta(<Localizar onClose={() => setConsulta(null)} />)
						}
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
		header: () => <Tab label="Otras Consultas" />,
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
