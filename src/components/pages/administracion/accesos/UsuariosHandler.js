// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { handleModuloSeleccionar } from "redux/actions";
// import { Tabs, Tab } from "@mui/material";
// import Grid from "components/ui/Grid/Grid";
// import Action from "components/helpers/Action";
// import useTareasUsuario from "components/hooks/useTareasUsuario";
// import KeyPress from "components/keyPress/KeyPress";
// import useTareas from "./tareas/useTareas";
// import useUsuarios from "./useUsuarios";
// import useAmbitos from "./usuarioAmbitos/useAmbitos";
// import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
// import Button from "components/ui/Button/Button";
// import { onLoadSelectKeepOrFirst } from "components/ui/Table/TableHook";

// const UsuariosHandler = () => {
// 	const dispatch = useDispatch();
// 	const tabs = [];
// 	const [tab, setTab] = useState(0);
	
// 	const tarea = useTareasUsuario();

// 	const disableTabTareas = !tarea.hasTarea("Accesos_UsuarioTareas");
// 	const disableTabAmbitos = !tarea.hasTarea("Accesos_UsuarioAmbitos");
	
// 	//#region Tab usuarios
// 	const [usuariosParamsEdit, setUsuariosParamsEdit] = useState({});
// 	const [usuariosParamsSend, setUsuariosParamsSend] = useState({});
// 	// const [usuariosTab, usuarioChanger, usuarioSelected] = useUsuarios();
// 	const {
// 		render: usuariosRender,
// 		request: usuariosRequest,
// 		selected: usuariosSelected,
// 	} = useUsuarios({
// 		params: { sort: "-cuit" },
// 		onEditComplete: ({ edit, response, request }) => {
// 			const params = { ...usuariosParamsSend };
// 			if (request === "A") {
// 				edit.id = response.id;
// 				params.select = edit;
// 			} else {
// 				delete params.select;
// 			}
// 			setUsuariosParamsSend(params);
// 		},
// 	});
// 	const [usuariosActions, setUsuariosActions] = useState([]);
// 	useEffect(() => {
// 		const createAction = ({ action, request, ...x }) =>
// 			new Action({
// 				name: action,
// 				onExecute: (action) =>
// 					usuariosRequest("selected", { request, action }),
// 				combination: "AltKey",
// 				...x,
// 			});
// 		const actions = [
// 			createAction({
// 				action: `Agrega Usuario`,
// 				request: "A",
// 				tarea: "Accesos_UsuarioAlta",
// 				keys: "a",
// 				underlineindex: 0,
// 			}),
// 		];
// 		const desc = usuariosSelected?.userName;
// 		if (!desc) {
// 			setUsuariosActions(actions);
// 			return;
// 		}
// 		actions.push(
// 			createAction({
// 				action: `Consulta Usuario ${desc}`,
// 				request: "C",
// 				tarea: "Accesos_UsuarioConsulta",
// 				keys: "o",
// 				underlineindex: 1,
// 			})
// 		);
// 		actions.push(
// 			createAction({
// 				action: `Modifica Usuario ${desc}`,
// 				request: "M",
// 				tarea: "Accesos_UsuarioModifica",
// 				keys: "m",
// 				underlineindex: 0,
// 			})
// 		);
// 		if (usuariosSelected?.deletedDate) {
// 			actions.push(
// 				createAction({
// 					action: `Reactiva Usuario ${desc}`,
// 					request: "R",
// 					tarea: "Accesos_UsuarioReactiva",
// 					keys: "r",
// 					underlineindex: 0,
// 				})
// 			);
// 		} else {
// 		actions.push(
// 			createAction({
// 				action: `Baja Usuario ${desc}`,
// 				request: "B",
// 				tarea: "Accesos_UsuarioBaja",
// 				keys: "b",
// 				underlineindex: 0,
// 			})
// 		);
// 		}
// 		setUsuariosActions(actions);
// 	}, [usuariosRequest, usuariosSelected]);
// 	tabs.push({
// 		header: (p) => <Tab label="Usuarios" {...p} />,
// 		body: (p) => (
// 			<Grid col gap="inherit" {...p}>
// 				<Grid grid="auto / 200px 1fr 1fr 200px 200px" gap="inherit">
// 					<InputMaterial
// 						label="CUIT / CUIL"
// 						mask={CUITMask}
// 						value={usuariosParamsEdit.cuit}
// 						onChange={(v) =>
// 							setUsuariosParamsEdit((o) => {
// 								const cuit = v.replace(/[^0-9]+/g, "");
// 								const r = { ...o, cuit };
// 								if (!cuit) delete r.cuit;
// 								return r;
// 							})
// 						} 
// 					/>
// 					<InputMaterial
// 						label="Nombre"
// 						value={usuariosParamsEdit.nombre}
// 						onChange={(nombre) =>
// 							setUsuariosParamsEdit((o) => {
// 								const r = { ...o, nombre };
// 								if (!nombre) delete r.nombre;
// 								return r;
// 							})
// 						}
// 					/>
// 					<InputMaterial
// 						label="Usuario"
// 						value={usuariosParamsEdit.usuario}
// 						onChange={(usuario) =>
// 							setUsuariosParamsEdit((o) => {
// 								const r = { ...o, usuario };
// 								if (!usuario) delete r.usuario;
// 								return r;
// 							})
// 						}
// 					/>
// 					<Button
// 						className="botonAzul"
// 						disabled={
// 							JSON.stringify(usuariosParamsEdit) ===
// 							JSON.stringify(usuariosParamsSend)
// 						}
// 						onClick={() => setUsuariosParamsSend(usuariosParamsEdit)}
// 					>
// 						Aplica filtro
// 					</Button>
// 					<Button
// 						className="botonAzul"
// 						disabled={Object.entries(usuariosParamsEdit).length === 0}
// 						onClick={() => {
// 							const usuariosParamsEdit = {};
// 							setUsuariosParamsEdit(usuariosParamsEdit);
// 							if (
// 								JSON.stringify(usuariosParamsEdit) ===
// 								JSON.stringify(usuariosParamsSend)
// 							)
// 								return;
// 							setUsuariosParamsSend({ ...usuariosParamsEdit });
// 						}}
// 					>
// 						Limpia filtro
// 					</Button>
// 				</Grid>
// 				<Grid width gap="inherit">
// 					{usuariosRender()}
// 				</Grid>
// 			</Grid>
// 		),
// 		actions: usuariosActions,
// 	});

// 	useEffect(() => {
// 		const { select, ...params } = usuariosParamsSend;
// 		const payload = {
// 			params,
// 			onLoadSelect: onLoadSelectKeepOrFirst,
// 		}
// 		if (select) {
// 			payload.onLoadSelect = () => {
// 				setUsuariosParamsSend((o) => {
// 					const r = { ...o };
// 					delete r.select;
// 					return r
// 				});
// 				return select;
// 			}
// 		}
// 		usuariosRequest("list", payload);
// 	}, [usuariosRequest, usuariosParamsSend]);
// 	//#endregion

	
// 	//#region Tab tareas
// 	const [tareasTab, tareaChanger, tareaSelected] = useTareas();
// 	const [tareasActions, setTareasActions] = useState([]);
// 	useEffect(() => {
// 		const actions = [];

// 		const userName = usuariosSelected?.userName;
// 		if (!userName) {
// 			setTareasActions(actions);
// 			return;
// 		}
// 		const deleDesc = `para Usuario ${userName}`;
// 		const createAction = ({ action, request, ...x }) =>
// 			new Action({
// 				name: action,
// 				onExecute: (action) =>
// 					tareaChanger("selected", {
// 						request,
// 						action,
// 						record: { usuarioId: usuariosSelected?.id },
// 					}),
// 				combination: "AltKey",
// 				...x,
// 			});
// 		actions.push(
// 			createAction({
// 				action: `Agrega Tarea ${deleDesc}`,
// 				request: "A",
// 				keys: "a",
// 				tarea: "Accesos_UsuarioTareasAgrega",
// 				underlineindex: 0,
// 				ellipsis: true,
// 			})
// 		);
// 		const nombreTarea = tareaSelected?.nombreTarea;
// 		if (!nombreTarea) {
// 			setTareasActions(actions);
// 			return;
// 		}
// 		const tareaDesc = `${nombreTarea} ${deleDesc}`;
// 		actions.push(
// 			createAction({
// 				action: `Consulta Tarea ${tareaDesc}`,
// 				request: "C",
// 				keys: "o",
// 				tarea: "Accesos_UsuarioTareasConsulta",
// 				underlineindex: 1,
// 				ellipsis: true,
// 			})
// 		);
// 		actions.push(
// 			createAction({
// 				action: `Modifica Tarea ${tareaDesc}`,
// 				request: "M",
// 				keys: "m",
// 				tarea: "Accesos_UsuarioTareasModifica",
// 				underlineindex: 0,
// 				ellipsis: true,
// 			})
// 		);
// 		actions.push(
// 			createAction({
// 				action: `Borra Tarea ${tareaDesc}`,
// 				request: "B",
// 				keys: "b",
// 				tarea: "Accesos_UsuarioTareasBorra",
// 				underlineindex: 0,
// 				ellipsis: true,
// 			})
// 		);
// 		setTareasActions(actions);
// 	}, [tareaChanger, tareaSelected, usuariosSelected?.id]);

// 	tabs.push({
// 		header: (p) => <Tab label="Usuario Tareas" disabled={!usuariosSelected || disableTabTareas} {...p}/>,
// 		body: (p) => <Grid col gap="inherit" {...p}>{tareasTab()}</Grid>,
// 		actions: tareasActions,
// 	});

// 	// Si cambia usuario, refresco lista de tareas
// 	useEffect(() => {
// 		tareaChanger("list", {
// 			clear: !usuariosSelected?.id,
// 			params: { usuarioId: usuariosSelected?.id },
// 		});
// 	}, [usuariosSelected?.id, tareaChanger]);
// 	//#endregion
	
// 	//#region Tab ambitos
// 	const [ambitosTab, ambitoChanger, ambitoSelected] = useAmbitos();
// 	const [ambitosActions, setAmbitosActions] = useState([]);
// 	useEffect(() => {
// 		const actions = [];

// 		const userName = usuariosSelected?.userName;
// 		if (!userName) {
// 			setAmbitosActions(actions);
// 			return;
// 		}
// 		const deleDesc = `para Usuario ${userName}`;
// 		const createAction = ({ action, request, ...x }) =>
// 			new Action({
// 				name: action,
// 				onExecute: (action) =>
// 					ambitoChanger("selected", {
// 						request,
// 						action,
// 						record: { usuarioId: usuariosSelected?.id },
// 					}),
// 				combination: "AltKey",
// 				...x,
// 			});
// 		actions.push(
// 			createAction({
// 				action: `Agrega Ambito ${deleDesc}`,
// 				request: "A",
// 				keys: "a",
// 				tarea: "Accesos_UsuarioAmbitoAgrega",
// 				underlineindex: 0,
// 				ellipsis: true,
// 			})
// 		);
		
// 		let nombreAmbito = "";
// console.log("ambitoSelected",ambitoSelected)
// 		switch(ambitoSelected?.ambitoTipo){
// 			case "S": nombreAmbito = "Seccional"; break;
// 			case "P": nombreAmbito =  "Provincia"; break;
// 			case "D": nombreAmbito =  "Delegación"; break;
// 			case "T": nombreAmbito = "Todos"; break;
// 		};

// 		if (!nombreAmbito) {
// 			setAmbitosActions(actions);
// 			return;
// 		}
// 		const ambitoDesc = `${nombreAmbito} ${deleDesc}`;
// 		actions.push(
// 			createAction({
// 				action: `Consulta Ambito ${ambitoDesc}`,
// 				request: "C",
// 				keys: "o",
// 				tarea: "Accesos_UsuarioAmbitoConsulta",
// 				underlineindex: 1,
// 				ellipsis: true,
// 			})
// 		);
// 		actions.push(
// 			createAction({
// 				action: `Modifica Ambito ${ambitoDesc}`,
// 				request: "M",
// 				keys: "m",
// 				tarea: "Accesos_UsuarioAmbitoModifica",
// 				underlineindex: 0,
// 				ellipsis: true,
// 			})
// 		);
// 		/*actions.push(
// 			createAction({
// 				action: `Baja Ambito ${ambitoDesc}`,
// 				request: "B",
// 				keys: "b",
// 				tarea: "Accesos_UsuarioAmbitoBorra",
// 				underlineindex: 0,
// 				ellipsis: true,
// 			})
// 		);*/
// 		setAmbitosActions(actions);
// 	}, [ambitoChanger, ambitoSelected, usuariosSelected?.id]);

// 	tabs.push({
// 		header: (p) => <Tab label="Usuario Ambito" disabled={!usuariosSelected || disableTabAmbitos} {...p}/>,
// 		body: (p) => <Grid col gap="inherit" {...p}>{ambitosTab()}</Grid>,
// 		actions: ambitosActions,
// 	});

// 	// Si cambia usuario, refresco lista de tareas
// 	useEffect(() => {
// 		ambitoChanger("list", {
// 			clear: !usuariosSelected?.id,
// 			params: { usuarioId: usuariosSelected?.id },
// 		});
// 	}, [usuariosSelected?.id, ambitoChanger]);
// 	//#endregion



// 	/*
// 	//#region Tab seccionales
// 	const {
// 		render: seccionalesRender,
// 		request: seccionalesRequest,
// 		selected: seccionalesSelected,
// 	} = useSeccionales();
// 	const [seccionalesActions, setSeccionalesActions] = useState([]);
// 	useEffect(() => {
// 		const actions = [];
// 		const dele = usuarioSelected?.id;
// 		if (!dele) {
// 			setSeccionalesActions(actions);
// 			return;
// 		}
// 		const deleDesc = `para Usuario ${dele}`;
// 		const createAction = ({ action, request, ...x }) =>
// 			new Action({
// 				name: action,
// 				onExecute: (action) =>
// 					seccionalesRequest("selected", {
// 						request,
// 						action,
// 						record: { refUsuarioId: usuarioSelected?.id },
// 					}),
// 				combination: "AltKey",
// 				...x,
// 			});
// 		actions.push(
// 			createAction({
// 				action: `Agrega Seccional ${deleDesc}`,
// 				request: "A",
// 				keys: "a",
// 				underlineindex: 0,
// 			})
// 		);
// 		const selected = seccionalesSelected?.id;
// 		if (!selected) {
// 			setSeccionalesActions(actions);
// 			return;
// 		}
// 		const selectedDesc = `${selected} ${deleDesc}`;
// 		actions.push(
// 			createAction({
// 				action: `Consulta Seccional ${selectedDesc}`,
// 				request: "C",
// 				keys: "o",
// 				underlineindex: 1,
// 			})
// 		);
// 		// actions.push(
// 		// 	createAction({
// 		// 		action: `Modifica Seccional ${selectedDesc}`,
// 		// 		request: "M",
// 		// 		keys: "m",
// 		// 		underlineindex: 0,
// 		// 	})
// 		// );
// 		// actions.push(
// 		// 	createAction({
// 		// 		action: `Baja Seccional ${selectedDesc}`,
// 		// 		request: "B",
// 		// 		keys: "b",
// 		// 		underlineindex: 0,
// 		// 	})
// 		// );
// 		setSeccionalesActions(actions);
// 	}, [seccionalesRequest, seccionalesSelected, usuarioSelected?.id]);
// 	tabs.push({
// 		header: () => <Tab label="Seccionales" disabled={!seccionalesSelected} />,
// 		body: seccionalesRender,
// 		actions: seccionalesActions,
// 	});
// 	// Si cambia usuario, refresco lista de seccionales
// 	useEffect(() => {
// 		seccionalesRequest("list", {
// 			clear: !usuarioSelected?.id,
// 			body: { refUsuarioId: usuarioSelected?.id },
// 		});
// 	}, [usuarioSelected?.id, seccionalesRequest]);
// 	//#endregion*/

// 	//#region modulo y acciones
// 	const acciones = tabs[tab].actions;
// 	useEffect(() => {
// 		dispatch(handleModuloSeleccionar({ nombre: "Usuarios", acciones }));
// 	}, [dispatch, acciones]);
// 	//#endregion

// 	return (
// 		<Grid full col>
// 			<Grid className="titulo">
// 				<h1>Usuarios</h1>
// 			</Grid>
// 			<Grid className="tabs">
// 				<text>{usuariosSelected?.nombre ? usuariosSelected.nombre : " "}</text>
// 				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
// 					{tabs.map((r, key) => r.header({ key }))}
// 				</Tabs>
// 			</Grid>
// 			<Grid className="contenido" col gap="10px">
// 				{tabs.map((r, key) => r.body({ key, hidden: key !== tab }))}
// 			</Grid>
// 			<KeyPress items={acciones} />
// 		</Grid>
// 	);
// };

// export default UsuariosHandler;


import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import KeyPress from "components/keyPress/KeyPress";
import useTareas from "./tareas/useTareas";
import useUsuarios from "./useUsuarios";
import useAmbitos from "./usuarioAmbitos/useAmbitos";
import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
import Button from "components/ui/Button/Button";
import { onLoadSelectKeepOrFirst } from "components/ui/Table/TableHook";

const UsuariosHandler = () => {
	const dispatch = useDispatch();
	const tabs = [];
	const [tab, setTab] = useState(0);
	
	const tarea = useTareasUsuario();

	const disableTabTareas = !tarea.hasTarea("Accesos_UsuarioTareas");
	const disableTabAmbitos = !tarea.hasTarea("Accesos_UsuarioAmbitos");
	
	//#region Tab usuarios
	const [usuariosParamsEdit, setUsuariosParamsEdit] = useState({});
	const [usuariosParamsSend, setUsuariosParamsSend] = useState({});
	// const [usuariosTab, usuarioChanger, usuarioSelected] = useUsuarios();
	const {
		render: usuariosRender,
		request: usuariosRequest,
		selected: usuariosSelected,
	} = useUsuarios({
		params: { sort: "-cuit" },
		onEditComplete: ({ edit, response, request }) => {
			const params = { ...usuariosParamsSend };
			if (request === "A") {
				edit.id = response.id;
				params.select = edit;
			} else {
				delete params.select;
			}
			setUsuariosParamsSend(params);
		},
	});
	const [usuariosActions, setUsuariosActions] = useState([]);
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					usuariosRequest("selected", { request, action }),
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
		const desc = usuariosSelected?.userName;
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
		if (usuariosSelected?.deletedDate) {
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
	}, [usuariosRequest, usuariosSelected]);
	tabs.push({
		header: (p) => <Tab label="Usuarios" {...p} />,
		body: (p) => (
			<Grid col gap="inherit" {...p}>
				<Grid grid="auto / 200px 1fr 1fr 200px 200px" gap="inherit">
					<InputMaterial
						label="CUIT / CUIL"
						mask={CUITMask}
						value={usuariosParamsEdit.cuit}
						onChange={(v) =>
							setUsuariosParamsEdit((o) => {
								const cuit = v.replace(/[^0-9]+/g, "");
								const r = { ...o, cuit };
								if (!cuit) delete r.cuit;
								return r;
							})
						} 
					/>
					<InputMaterial
						label="Nombre"
						value={usuariosParamsEdit.nombre}
						onChange={(nombre) =>
							setUsuariosParamsEdit((o) => {
								const r = { ...o, nombre };
								if (!nombre) delete r.nombre;
								return r;
							})
						}
					/>
					<InputMaterial
						label="Usuario"
						value={usuariosParamsEdit.usuario}
						onChange={(usuario) =>
							setUsuariosParamsEdit((o) => {
								const r = { ...o, usuario };
								if (!usuario) delete r.usuario;
								return r;
							})
						}
					/>
					<Button
						className="botonAzul"
						disabled={
							JSON.stringify(usuariosParamsEdit) ===
							JSON.stringify(usuariosParamsSend)
						}
						onClick={() => setUsuariosParamsSend(usuariosParamsEdit)}
					>
						Aplica filtro
					</Button>
					<Button
						className="botonAzul"
						disabled={Object.entries(usuariosParamsEdit).length === 0}
						onClick={() => {
							const usuariosParamsEdit = {};
							setUsuariosParamsEdit(usuariosParamsEdit);
							if (
								JSON.stringify(usuariosParamsEdit) ===
								JSON.stringify(usuariosParamsSend)
							)
								return;
							setUsuariosParamsSend({ ...usuariosParamsEdit });
						}}
					>
						Limpia filtro
					</Button>
				</Grid>
				<Grid width gap="inherit">
					{usuariosRender()}
				</Grid>
			</Grid>
		),
		actions: usuariosActions,
	});

	useEffect(() => {
		const { select, ...params } = usuariosParamsSend;
		const payload = {
			params,
			onLoadSelect: onLoadSelectKeepOrFirst,
		}
		if (select) {
			payload.onLoadSelect = () => {
				setUsuariosParamsSend((o) => {
					const r = { ...o };
					delete r.select;
					return r
				});
				return select;
			}
		}
		usuariosRequest("list", payload);
	}, [usuariosRequest, usuariosParamsSend]);
	//#endregion

	
	//#region Tab tareas
	const [tareasTab, tareaChanger, tareaSelected] = useTareas();
	const [tareasActions, setTareasActions] = useState([]);
	useEffect(() => {
		const actions = [];

		const userName = usuariosSelected?.userName;
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
						record: { usuarioId: usuariosSelected?.id },
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
	}, [tareaChanger, tareaSelected, usuariosSelected?.id]);

	tabs.push({
		header: (p) => <Tab label="Usuario Tareas" disabled={!usuariosSelected || disableTabTareas} {...p}/>,
		body: (p) => <Grid col gap="inherit" {...p}>{tareasTab()}</Grid>,
		actions: tareasActions,
	});

	// Si cambia usuario, refresco lista de tareas
	useEffect(() => {
		tareaChanger("list", {
			clear: !usuariosSelected?.id,
			params: { usuarioId: usuariosSelected?.id },
		});
	}, [usuariosSelected?.id, tareaChanger]);
	//#endregion
	
	//#region Tab ambitos
	const [ambitosTab, ambitoChanger, ambitoSelected] = useAmbitos();
	const [ambitosActions, setAmbitosActions] = useState([]);
	useEffect(() => {
		const actions = [];

		const userName = usuariosSelected?.userName;
		if (!userName) {
			setAmbitosActions(actions);
			return;
		}
		const deleDesc = `para Usuario ${userName}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					ambitoChanger("selected", {
						request,
						action,
						record: { usuarioId: usuariosSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Ambito ${deleDesc}`,
				request: "A",
				keys: "a",
				tarea: "Accesos_UsuarioAmbitoAgrega",
				underlineindex: 0,
				ellipsis: true,
			})
		);
		
		let nombreAmbito = "";
console.log("ambitoSelected",ambitoSelected)
		switch(ambitoSelected?.ambitoTipo){
			case "S": nombreAmbito = "Seccional"; break;
			case "P": nombreAmbito =  "Provincia"; break;
			case "D": nombreAmbito =  "Delegación"; break;
			case "T": nombreAmbito = "Todos"; break;
		};

		if (!nombreAmbito) {
			setAmbitosActions(actions);
			return;
		}
		const ambitoDesc = `${nombreAmbito} ${deleDesc}`;
		actions.push(
			createAction({
				action: `Consulta Ambito ${ambitoDesc}`,
				request: "C",
				keys: "o",
				tarea: "Accesos_UsuarioAmbitoConsulta",
				underlineindex: 1,
				ellipsis: true,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Ambito ${ambitoDesc}`,
				request: "M",
				keys: "m",
				tarea: "Accesos_UsuarioAmbitoModifica",
				underlineindex: 0,
				ellipsis: true,
			})
		);
		actions.push(
			createAction({
				action: `Baja Ambito ${ambitoDesc}`,
				request: "B",
				keys: "b",
				tarea: "Accesos_UsuarioAmbitoBorra",
				underlineindex: 0,
				ellipsis: true,
			})
		);
		setAmbitosActions(actions);
	}, [ambitoChanger, ambitoSelected, usuariosSelected?.id]);

	tabs.push({
		header: (p) => <Tab label="Usuario Ambito" disabled={!usuariosSelected || disableTabAmbitos} {...p}/>,
		body: (p) => <Grid col gap="inherit" {...p}>{ambitosTab()}</Grid>,
		actions: ambitosActions,
	});

	// Si cambia usuario, refresco lista de tareas
	useEffect(() => {
		ambitoChanger("list", {
			clear: !usuariosSelected?.id,
			params: { usuarioId: usuariosSelected?.id },
		});
	}, [usuariosSelected?.id, ambitoChanger]);
	

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Usuarios", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Usuarios</h1>
			</Grid>
			<Grid className="tabs">
				<text>{usuariosSelected?.nombre ? usuariosSelected.nombre : " "}</text>
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r, key) => r.header({ key }))}
				</Tabs>
			</Grid>
			<Grid className="contenido" col gap="10px">
				{tabs.map((r, key) => r.body({ key, hidden: key !== tab }))}
			</Grid>
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default UsuariosHandler;
