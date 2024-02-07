import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useTareas from "./tareas/useTareas";
import useUsuarios from "./useUsuarios";
import useColaboradores from "components/colaboradores/useColaboradores";
import KeyPress from "components/keyPress/KeyPress";
import useSeccionales from "../seccionales/useSeccionales";
import TareaUsuario from "components/helpers/TareaUsuario";

const UsuariosHandler = () => {
	const dispatch = useDispatch();
	const tabs = [];
	const [tab, setTab] = useState(0);


	const disableTabTareas = !TareaUsuario("Accesos_UsuarioTareas")
	//#region Tab usuarios
	const [usuariosTab, usuarioChanger, usuarioSelected] =
		useUsuarios();
	const [usuariosActions, setUsuariosActions] = useState([]);
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					usuarioChanger("selected", { request, action }),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				action: `Agrega Usuario`,
				request: "A",
				tarea: "Accesos_UsuarioAlta",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = usuarioSelected?.userName;
		if (!desc) {
			setUsuariosActions(actions);
			return;
		}
		actions.push(
			createAction({
				action: `Consulta Usuario ${desc}`,
				request: "C",
				tarea: "Accesos_UsuarioConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Usuario ${desc}`,
				request: "M",
				tarea: "Accesos_UsuarioModifica",
				keys: "m",
				underlineindex: 0,
			})
		);
		if (usuarioSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Usuario ${desc}`,
					request: "R",
					tarea: "Accesos_UsuarioReactiva",
					keys: "r",
					underlineindex: 0,
				})
			);
		} else {
		actions.push(
			createAction({
				action: `Baja Usuario ${desc}`,
				request: "B",
				tarea: "Accesos_UsuarioBaja",
				keys: "b",
				underlineindex: 0,
			})
		);
		}
		setUsuariosActions(actions);
	}, [usuarioChanger, usuarioSelected]);
	tabs.push({
		header: () => <Tab label="Usuarios" />,
		body: usuariosTab,
		actions: usuariosActions,
	});

	useEffect(() => {
		usuarioChanger("list");
	}, [usuarioChanger]);
	//#endregion

	
	//#region Tab tareas
	const [tareasTab, tareaChanger, tareaSelected] = useTareas();
	const [tareasActions, setTareasActions] = useState([]);
	useEffect(() => {
		const actions = [];

		const userName = usuarioSelected?.userName;
		if (!userName) {
			setTareasActions(actions);
			return;
		}
		const deleDesc = `para Usuario ${userName}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					tareaChanger("selected", {
						request,
						action,
						record: { usuarioId: usuarioSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Tarea ${deleDesc}`,
				request: "A",
				keys: "a",
				tarea: "Accesos_UsuarioTareasAgrega",
				underlineindex: 0,
				ellipsis: true,
			})
		);
		const nombreTarea = tareaSelected?.nombreTarea;
		if (!nombreTarea) {
			setTareasActions(actions);
			return;
		}
		const tareaDesc = `${nombreTarea} ${deleDesc}`;
		actions.push(
			createAction({
				action: `Consulta Tarea ${tareaDesc}`,
				request: "C",
				keys: "o",
				tarea: "Accesos_UsuarioTareasConsulta",
				underlineindex: 1,
				ellipsis: true,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Tarea ${tareaDesc}`,
				request: "M",
				keys: "m",
				tarea: "Accesos_UsuarioTareasModifica",
				underlineindex: 0,
				ellipsis: true,
			})
		);
		actions.push(
			createAction({
				action: `Borra Tarea ${tareaDesc}`,
				request: "B",
				keys: "b",
				tarea: "Accesos_UsuarioTareasBorra",
				underlineindex: 0,
				ellipsis: true,
			})
		);
		setTareasActions(actions);
	}, [tareaChanger, tareaSelected, usuarioSelected?.id]);

	tabs.push({
		header: () => <Tab label="Tareas" disabled={!usuarioSelected || disableTabTareas} />,
		body: tareasTab,
		actions: tareasActions,
	});

	// Si cambia usuario, refresco lista de tareas
	useEffect(() => {
		tareaChanger("list", {
			clear: !usuarioSelected?.id,
			params: { usuarioId: usuarioSelected?.id },
		});
	}, [usuarioSelected?.id, tareaChanger]);
	//#endregion
	
	

	/*
	//#region Tab colaboradores
	const [colaboradoresTab, colaboradoresChanger, colaboradorSelected] =
		useColaboradores();
	const [colaboradoresActions, setColaboradoresActions] = useState([]);
	/*useEffect(() => {
		const actions = [];
		const dele = usuarioSelected?.id;
		if (!dele) {
			setColaboradoresActions(actions);
			return;
		}
		const deleDesc = `para Usuario ${dele}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					colaboradoresChanger("selected", {
						request,
						action,
						record: { refUsuarioId: usuarioSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Colaborador ${deleDesc}`,
				request: "A",
				keys: "a",
				underlineindex: 0,
			})
		);
		const sele = colaboradorSelected?.id;
		if (!sele) {
			setColaboradoresActions(actions);
			return;
		}
		const seleDesc = `${sele} ${deleDesc}`;
		actions.push(
			createAction({
				action: `Consulta Colaborador ${seleDesc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Colaborador ${seleDesc}`,
				request: "M",
				keys: "m",
				underlineindex: 0,
			})
		);
		if (colaboradorSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Colaborador ${seleDesc}`,
					request: "R",
					keys: "r",
					underlineindex: 0,
				})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Colaborador ${seleDesc}`,
					request: "B",
					keys: "b",
					underlineindex: 0,
				})
			);
		}
		setColaboradoresActions(actions);
	}, [colaboradoresChanger, colaboradorSelected, usuarioSelected?.id]);
	tabs.push({
		header: () => <Tab label="Colaboradores" disabled={!usuarioSelected} />,
		body: colaboradoresTab,
		actions: colaboradoresActions,
	}); */

	/*
	// Si cambia usuario, refresco lista de colaboradores
	useEffect(() => {
		colaboradoresChanger("list", {
			clear: !usuarioSelected?.id,
			params: { refUsuarioId: usuarioSelected?.id },
		});
	}, [usuarioSelected?.id, colaboradoresChanger]);
	//#endregion

	//#region Tab seccionales
	const {
		render: seccionalesRender,
		request: seccionalesRequest,
		selected: seccionalesSelected,
	} = useSeccionales();
	const [seccionalesActions, setSeccionalesActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const dele = usuarioSelected?.id;
		if (!dele) {
			setSeccionalesActions(actions);
			return;
		}
		const deleDesc = `para Usuario ${dele}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					seccionalesRequest("selected", {
						request,
						action,
						record: { refUsuarioId: usuarioSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Seccional ${deleDesc}`,
				request: "A",
				keys: "a",
				underlineindex: 0,
			})
		);
		const selected = seccionalesSelected?.id;
		if (!selected) {
			setSeccionalesActions(actions);
			return;
		}
		const selectedDesc = `${selected} ${deleDesc}`;
		actions.push(
			createAction({
				action: `Consulta Seccional ${selectedDesc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		// actions.push(
		// 	createAction({
		// 		action: `Modifica Seccional ${selectedDesc}`,
		// 		request: "M",
		// 		keys: "m",
		// 		underlineindex: 0,
		// 	})
		// );
		// actions.push(
		// 	createAction({
		// 		action: `Baja Seccional ${selectedDesc}`,
		// 		request: "B",
		// 		keys: "b",
		// 		underlineindex: 0,
		// 	})
		// );
		setSeccionalesActions(actions);
	}, [seccionalesRequest, seccionalesSelected, usuarioSelected?.id]);
	tabs.push({
		header: () => <Tab label="Seccionales" disabled={!seccionalesSelected} />,
		body: seccionalesRender,
		actions: seccionalesActions,
	});
	// Si cambia usuario, refresco lista de seccionales
	useEffect(() => {
		seccionalesRequest("list", {
			clear: !usuarioSelected?.id,
			body: { refUsuarioId: usuarioSelected?.id },
		});
	}, [usuarioSelected?.id, seccionalesRequest]);
	//#endregion*/

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Usuarios", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (

		<Grid full col>
			<Grid className="titulo">
				<h1 >Usuarios</h1>
			</Grid>

			<div className="tabs">
				<text>{usuarioSelected?.nombre ? usuarioSelected.nombre  : " " }</text>

				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</div>

			{tabs[tab].body()}
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default UsuariosHandler;
