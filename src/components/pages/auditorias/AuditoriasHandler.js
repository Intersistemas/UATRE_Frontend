import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import AuditoriaDatos from "./AuditoriaDatos";
import AuditoriaProcesos from "./AuditoriaProcesos";

const AuditoriasHandler = () => {
	const tabs = [];
	const [tab, setTab] = useState(0);
	
	//#region Datos
	tabs.push({
		header: () => <Tab label="Datos" />,
		body: () => <AuditoriaDatos/>,
	})
	//#endregion Datos
	
	//#region Procesos
	tabs.push({
		header: () => <Tab label="Procesos" />,
		body: () => <AuditoriaProcesos/>,
	})
	//#endregion Procesos
	
	return (
		<Grid col height="100vh">
			<Grid className="titulo" width>
				<h1>Auditorias</h1>
			</Grid>
			<Grid col width gap="inherit" grow>
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
				{tabs[tab].body()}
			</Grid>
		</Grid>
	);
};

export default AuditoriasHandler;
