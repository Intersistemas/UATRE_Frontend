import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import useDelegaciones from "./useDelegaciones";
import useColaboradores from "components/colaboradores/useColaboradores";
import KeyPress from "components/keyPress/KeyPress";
import useSeccionales from "../seccionales/useSeccionales";
import useTareasUsuario from "components/hooks/useTareasUsuario";

const DelegacionesHandler = () => {
	const dispatch = useDispatch();
	const tabs = [];
	const [tab, setTab] = useState(0);

	const tarea = useTareasUsuario();
	const disableTabDocumentacion = !tarea.hasTarea("Datos_DelegacionDocumentacion");
	const disableTabColaborador = !tarea.hasTarea("Datos_DelegacionColaborador");
	const disableTabSeccional = !tarea.hasTarea("Datos_DelegacionSeccional");

	//#region Tab delegaciones
	const {
		render: delegacionesRender,
		request: delegacionesRequest,
		selected: delegacionesSelected,
	} = useDelegaciones();
	const [delegacionesActions, setDelegacionesActions] = useState([]);
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					delegacionesRequest("selected", { request, action }),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				action: `Agrega Delegación`,
				request: "A",
				tarea: "Datos_DelegacionAgrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = delegacionesSelected?.id;
		if (!desc) {
			setDelegacionesActions(actions);
			return;
		}
		actions.push(
			createAction({
				action: `Consulta Delegación ${desc}`,
				request: "C",
				tarea: "Datos_DelegacionConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Delegación ${desc}`,
				request: "M",
				tarea: "Datos_DelegacionModifica",
				keys: "m",
				underlineindex: 0,
			})
		);
		actions.push(
			createAction({
				action: `Baja Delegación ${desc}`,
				request: "B",
				tarea: "Datos_DelegacionBaja",
				keys: "b",
				underlineindex: 0,
			})
		);
		setDelegacionesActions(actions);
	}, [delegacionesRequest, delegacionesSelected]);
	tabs.push({
		header: () => <Tab label="Delegaciones" />,
		body: delegacionesRender,
		actions: delegacionesActions,
	});

	useEffect(() => {
		delegacionesRequest("list", {
			params: { SoloActivos: false },
		});
	}, [delegacionesRequest]);
	//#endregion

	//#region Tab documentaciones
	const [documentacionesTab, documentacionChanger, documentacionSelected] = useDocumentaciones();
	const [documentacionesActions, setDocumentacionesActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const dele = delegacionesSelected?.id;
		if (!dele) {
			setDocumentacionesActions(actions);
			return;
		}
		const deleDesc = `para Delegación ${dele}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "D", entidadId: delegacionesSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Documentación ${deleDesc}`,
				request: "A",
				tarea: "Datos_DelegacionDocumentacionAgrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const docu = documentacionSelected?.id;
		if (!docu) {
			setDocumentacionesActions(actions);
			return;
		}
		const docuDesc = `${docu} ${deleDesc}`;
		actions.push(
			createAction({
				action: `Consulta Documentación ${docuDesc}`,
				request: "C",
				tarea: "Datos_DelegacionDocumentacionConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Documentación ${docuDesc}`,
				request: "M",
				tarea: "Datos_DelegacionDocumentacionModifica",
				keys: "m",
				underlineindex: 0,
			})
		);
		actions.push(
			createAction({
				action: `Baja Documentación ${docuDesc}`,
				request: "B",
				tarea: "Datos_DelegacionDocumentacionBaja",
				keys: "b",
				underlineindex: 0,
			})
		);
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, delegacionesSelected?.id]);
	tabs.push({
		header: () => <Tab label="Documentacion" disabled={!delegacionesSelected || disableTabDocumentacion} />,
		body: documentacionesTab,
		actions: documentacionesActions,
	});

	// Si cambia delegación, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !delegacionesSelected?.id,
			params: { entidadTipo: "D", entidadId: delegacionesSelected?.id },
		});
	}, [delegacionesSelected?.id, documentacionChanger]);
	//#endregion

	//#region Tab colaboradores
	const [colaboradoresTab, colaboradoresChanger, colaboradorSelected] =
		useColaboradores();
	const [colaboradoresActions, setColaboradoresActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const dele = delegacionesSelected?.id;
		if (!dele) {
			setColaboradoresActions(actions);
			return;
		}
		const deleDesc = `para Delegación ${dele}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					colaboradoresChanger("selected", {
						request,
						action,
						record: { refDelegacionId: delegacionesSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Colaborador ${deleDesc}`,
				request: "A",
				keys: "a",
				tarea: "Datos_DelegacionColaboradorAgrega",
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
				tarea:"Datos_DelegacionColaboradorConsulta",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Colaborador ${seleDesc}`,
				request: "M",
				keys: "m",
				tarea:"Datos_DelegacionColaboradorModifica",
				underlineindex: 0,
			})
		);
		if (colaboradorSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Colaborador ${seleDesc}`,
					request: "R",
					keys: "r",
					tarea:"Datos_DelegacionColaboradorReactiva",
					underlineindex: 0,
				})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Colaborador ${seleDesc}`,
					request: "B",
					keys: "b",
					tarea:"Datos_DelegacionColaboradorBaja",
					underlineindex: 0,
				})
			);
		}
		setColaboradoresActions(actions);
	}, [colaboradoresChanger, colaboradorSelected, delegacionesSelected?.id]);
	tabs.push({
		header: () => <Tab label="Colaboradores" disabled={!delegacionesSelected || disableTabColaborador} />,
		body: colaboradoresTab,
		actions: colaboradoresActions,
	}); 

	// Si cambia delegación, refresco lista de colaboradores
	useEffect(() => {
		colaboradoresChanger("list", {
			clear: !delegacionesSelected?.id,
			params: { refDelegacionId: delegacionesSelected?.id },
		});
	}, [delegacionesSelected?.id, colaboradoresChanger]);
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
		const dele = delegacionesSelected?.id;
		if (!dele) {
			setSeccionalesActions(actions);
			return;
		}
		const deleDesc = `para Delegación ${dele}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					seccionalesRequest("selected", {
						request,
						action,
						record: { refDelegacionId: delegacionesSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Seccional ${deleDesc}`,
				request: "A",
				keys: "a",
				tarea: "Datos_DelegacionSeccionalAgrega",
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
				tarea: "Datos_DelegacionSeccionalConsulta",
				underlineindex: 1,
			})
		);
		// actions.push(
		// 	createAction({
		// 		action: `Modifica Seccional ${selectedDesc}`,
		// 		request: "M",
		// 		keys: "m",
		//		tarea: "Datos_DelegacionSeccionalModifica",
		// 		underlineindex: 0,
		// 	})
		// );
		// actions.push(
		// 	createAction({
		// 		action: `Baja Seccional ${selectedDesc}`,
		// 		request: "B",
		// 		keys: "b",
		//		tarea: "Datos_DelegacionSeccionalBaja",
		// 		underlineindex: 0,
		// 	})
		// );
		setSeccionalesActions(actions);
	}, [seccionalesRequest, seccionalesSelected, delegacionesSelected?.id]);
	tabs.push({
		header: () => <Tab label="Seccionales" disabled={!seccionalesSelected || disableTabSeccional} />,
		body: seccionalesRender,
		actions: seccionalesActions,
	});
	// Si cambia delegación, refresco lista de seccionales
	useEffect(() => {
		seccionalesRequest("list", {
			clear: !delegacionesSelected?.id,
			body: { refDelegacionId: delegacionesSelected?.id },
		});
	}, [delegacionesSelected?.id, seccionalesRequest]);
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Delegaciones", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (

		<Grid full col>
			<Grid className="titulo">
				<h1 >Delegaciones</h1>
			</Grid>

			<div className="tabs">
				<text>{delegacionesSelected?.nombre ? delegacionesSelected.nombre  : " " }</text>

				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</div>

			{tabs[tab].body()}
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default DelegacionesHandler;
