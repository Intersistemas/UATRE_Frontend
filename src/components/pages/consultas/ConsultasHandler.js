import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import Localizar from "../afiliados/localizar/Localizar";

const ConsultasHandler = () => {
	const [consulta, setConsulta] = useState();

	const tabs = [];
	const [tab, setTab] = useState(0);

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
					
				</Grid>
				<Grid width gap="inherit" justify="evenly">
			
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
