import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import Afiliados from "./afiliados/Afiliados";
import AfiliadosEstados from "./afiliadosEstados/AfiliadosEstados";
import AfiliadosEstadosActividadSexo from "./afiliadosEstadosActividadSexo/AfiliadosEstadosActividadSexo";
import AfiliadosEstadosDelegacion from "./afiliadosEstadosDelegacion/AfiliadosEstadosDelegacion";
import AfiliadosEstadosDelegacionSeccional from "./afiliadosEstadosDelegacionSeccional/AfiliadosEstadosDelegacionSeccional";
import AfiliadosEstadosDelegacionSeccionalLocalidad from "./afiliadosEstadosDelegacionSeccionalLocalidad/AfiliadosEstadosDelegacionSeccionalLocalidad";
import AfiliadosEstadosEmpresas from "./afiliadosEstadosEmpresas/AfiliadosEstadosEmpresas";
import AfiliadosEstadosEmpresasSeccionales from "./afiliadosEstadosEmpresasSeccionales/AfiliadosEstadosEmpresasSeccionales";
import AfiliadosEstadosPuestoSexo from "./afiliadosEstadosPuestoSexo/AfiliadosEstadosPuestoSexo";
import AfiliadosNotaPeriodica from "./afiliadosNotaPeriodica/AfiliadosNotaPeriodica";
import PadronHandler from "./padron/Handler";
import TrabajadoresEstados from "./trabajadoresEstados/TrabajadoresEstados";
import TrabajadoresEstadosEmpresas from "./trabajadoresEstadosEmpresas/TrabajadoresEstadosEmpresas";
import TrabajadoresEstadosEmpresasSeccionales from "./trabajadoresEstadosEmpresasSeccionales/TrabajadoresEstadosEmpresasSeccionales";
import useTareasUsuario from "components/hooks/useTareasUsuario";

const InformesHandler = () => {
	const [informe, setInforme] = useState();

	const tabs = [];
	const [tab, setTab] = useState(0);

	const tarea = useTareasUsuario();
	const disableTabAfiliados = !tarea.hasTarea("Informes_Afiliados");
	const disableTabDDJJ = !tarea.hasTarea("Informes_DDJJ");

	// Afiliados
	tabs.push({
		header: () => <Tab label="Afiliados" disabled={disableTabAfiliados} />,
		body: () => (
			<>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() =>
							setInforme(<AfiliadosEstados onClose={() => setInforme(null)} />)
						}
						width="32"
						tarea="Informes_Afiliados_EstadoAfiliados" 
						disabled={disableTabAfiliados}
					>
						Estado de afiliados
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacion onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_AfiliadosEstadoDelegacion"
						disabled={disableTabAfiliados}
					>
						Afiliados por estado y delegación
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacionSeccional onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_AfiliadosEstadoDelegacionSeccional"
						disabled={disableTabAfiliados}
					>
						Afiliados por estado, delegación y seccional
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosDelegacionSeccionalLocalidad onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_AfiliadosDelegacionSeccionalLocalidad"
						disabled={disableTabAfiliados}
					>
						Afiliados por delegación, seccional y localidad
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosEmpresas onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_AfiliadosEmpresa"
						disabled={disableTabAfiliados}
					>
						Afiliados por empresa
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosActividadSexo onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_AfiliadosActividadSexo"
						disabled={disableTabAfiliados}
					>
						Afiliados por actividad y sexo
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosPuestoSexo onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_AfiliadosOficioSexo"
						disabled={disableTabAfiliados}
					>
						Afiliados por oficio y sexo
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosEstadosEmpresasSeccionales onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_AfiliadosEmpresaSeccionales"
						disabled={disableTabAfiliados}
					>
						Afiliados por empresa y cantidad de seccionales
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<Afiliados onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_Afiliados"
						disabled={disableTabAfiliados}
					>
						Afiliados
					</Button>
				</Grid>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<AfiliadosNotaPeriodica onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_NotificacionAfiliacionesDelegados"
						disabled={disableTabAfiliados}
					>
						Notificacion de afiliaciones para delegados
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() => setInforme(<PadronHandler onClose={() => setInforme(null)} />)}
						width="32"
						tarea="Informes_Afiliados_AfiliadosSeccional"
						disabled={disableTabAfiliados}
					>
						Afiliados por seccional
					</Button>
				</Grid>
			</>
		),
		// actions,
	});

	// DDJJ
	tabs.push({
		header: () => <Tab label="Declaraciones Juradas" disabled={disableTabDDJJ} />,
		body: () => (
			<>
				<Grid width gap="inherit" justify="evenly">
					<Button
						className="botonAmarillo"
						onClick={() =>
							setInforme(<TrabajadoresEstados onClose={() => setInforme(null)} />)
						}
						width="32"
						tarea="Informes_DDJJ_TrabajadoresDeclarados"
					>
						Trabajadores declarados
				</Button>
					<Button
						className="botonAmarillo"
						onClick={() =>
							setInforme(<TrabajadoresEstadosEmpresas onClose={() => setInforme(null)} />)
						}
						width="32"
						tarea="Informes_DDJJ_TrabajadoresDeclaradosEmpresa"
					>
						Trabajadores declarados por empresa
					</Button>
					<Button
						className="botonAmarillo"
						onClick={() =>
							setInforme(<TrabajadoresEstadosEmpresasSeccionales onClose={() => setInforme(null)} />)
						}
						width="32"
						tarea="Informes_DDJJ_TrabajadoresDeclaradosEmpresaSeccionales"
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
