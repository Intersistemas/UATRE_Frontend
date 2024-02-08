import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import AfiliadosEstados from "./afiliadosEstados/AfiliadosEstados";
import AfiliadosEstadosActividadSexo from "./afiliadosEstadosActividadSexo/AfiliadosEstadosActividadSexo";
import AfiliadosEstadosDelegacion from "./afiliadosEstadosDelegacion/AfiliadosEstadosDelegacion";
import AfiliadosEstadosDelegacionSeccional from "./afiliadosEstadosDelegacionSeccional/AfiliadosEstadosDelegacionSeccional";
import AfiliadosEstadosDelegacionSeccionalLocalidad from "./afiliadosEstadosDelegacionSeccionalLocalidad/AfiliadosEstadosDelegacionSeccionalLocalidad";
import AfiliadosEstadosEmpresas from "./afiliadosEstadosEmpresas/AfiliadosEstadosEmpresas";
import AfiliadosEstadosEmpresasSeccionales from "./afiliadosEstadosEmpresasSeccionales/AfiliadosEstadosEmpresasSeccionales";
import AfiliadosEstadosPuestoSexo from "./afiliadosEstadosPuestoSexo/AfiliadosEstadosPuestoSexo";
import TrabajadoresEstados from "./trabajadoresEstados/TrabajadoresEstados";
import TrabajadoresEstadosEmpresas from "./trabajadoresEstadosEmpresas/TrabajadoresEstadosEmpresas";
import TrabajadoresEstadosEmpresasSeccionales from "./trabajadoresEstadosEmpresasSeccionales/TrabajadoresEstadosEmpresasSeccionales";

const InformesHandler = () => {
	const [informe, setInforme] = useState();

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
							setInforme(<AfiliadosEstados onClose={() => setInforme(null)} />)
						}
						width="32"
						tarea="Informes_Emite"
					>
						Estado de afiliados
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacion onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Emite"
					>
						Afiliados por delegación
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacionSeccional onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Emite"
					>
						Afiliados por delegación y seccional
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacionSeccionalLocalidad onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Emite"
					>
						Afiliados por delegación, seccional y localidad
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosEmpresas onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Emite"
					>
						Afiliados por empresa
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosActividadSexo onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Emite"
					>
						Afiliados por actividad y sexo
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosPuestoSexo onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Emite"
					>
						Afiliados por oficio y sexo
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosEmpresasSeccionales onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Emite"
					>
						Afiliados por empresa y cantidad de seccionales
					</Button>
				</Grid>
			</>
		),
		// actions,
	});

	// DDJJ
	tabs.push({
		header: () => <Tab label="Declaraciones Juradas" />,
		body: () => (
			<>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() =>
							setInforme(<TrabajadoresEstados onClose={() => setInforme(null)} />)
						}
						width="32"
						tarea="Informes_Emite"
					>
						Trabajadores declarados
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() =>
							setInforme(<TrabajadoresEstadosEmpresas onClose={() => setInforme(null)} />)
						}
						width="32"
						tarea="Informes_Emite"
					>
						Trabajadores declarados por empresa
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() =>
							setInforme(<TrabajadoresEstadosEmpresasSeccionales onClose={() => setInforme(null)} />)
						}
						width="32"
						tarea="Informes_Emite"
					>
						Trabajadores declarados por empresa y cantidad de
						seccionales
					</Button>
				</Grid>
			</>
		),
		// actions,
	});

	return (
		<Grid col height="100vh" gap="20px">
			<Grid className="titulo" width>
				<h1>Informes</h1>
			</Grid>
			<Grid col width gap="inherit" grow>
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
				{tabs[tab].body()}
			</Grid>
			{informe}
		</Grid>
	);
};

export default InformesHandler;
