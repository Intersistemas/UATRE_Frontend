import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import AfiliadosEstados from "./afiliadosEstados/AfiliadosEstados";
import AfiliadosEstadosDelegacion from "./afiliadosEstadosDelegacion/AfiliadosEstadosDelegacion";
import AfiliadosEstadosDelegacionSeccional from "./afiliadosEstadosDelegacionSeccional/AfiliadosEstadosDelegacionSeccional";
import AfiliadosEstadosDelegacionSeccionalLocalidad from "./afiliadosEstadosDelegacionSeccionalLocalidad/AfiliadosEstadosDelegacionSeccionalLocalidad";
import AfiliadosEstadosEmpresas from "./afiliadosEstadosEmpresas/AfiliadosEstadosEmpresas";
import AfiliadosEstadosPuestoSexo from "./afiliadosEstadosPuestoSexo/AfiliadosEstadosPuestoSexo";
import AfiliadosEstadosEmpresasSeccionales from "./afiliadosEstadosEmpresasSeccionales/AfiliadosEstadosEmpresasSeccionales";
import AfiliadosEstadosActividadSexo from "./afiliadosEstadosActividadSexo/AfiliadosEstadosActividadSexo";
import TrabajadoresEstados from "./trabajadoresEstados/TrabajadoresEstados";
import TrabajadoresEstadosEmpresas from "./trabajadoresEstadosEmpresas/TrabajadoresEstadosEmpresas";

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
					>
						Estado de afiliados
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacion onClose={() => setInforme(null)} />)}
						width="32"
					>
						Afiliados por delegación
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacionSeccional onClose={() => setInforme(null)} />)}
						width="32"
					>
						Afiliados por delegación y seccional
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacionSeccionalLocalidad onClose={() => setInforme(null)} />)}
						width="32"
					>
						Afiliados por delegación, seccional y localidad
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosEmpresas onClose={() => setInforme(null)} />)}
						width="32"
					>
						Afiliados por empresa
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosActividadSexo onClose={() => setInforme(null)} />)}
						width="32"
					>
						Afiliados por actividad y sexo
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosPuestoSexo onClose={() => setInforme(null)} />)}
						width="32"
					>
						Afiliados por oficio y sexo
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosEmpresasSeccionales onClose={() => setInforme(null)} />)}
						width="32"
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
					>
						Trabajadores declarados
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() =>
							setInforme(<TrabajadoresEstadosEmpresas onClose={() => setInforme(null)} />)
						}
						width="32"
					>
						Trabajadores declarados por empresa
					</Button>
					<Button className="botonAmarillo" width="32">
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
