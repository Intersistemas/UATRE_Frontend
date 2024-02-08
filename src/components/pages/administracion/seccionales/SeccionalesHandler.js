import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import useAutoridades from "components/pages/administracion/seccionales/autoridades/useAutoridades";
import KeyPress from "components/keyPress/KeyPress";
import useSeccionales from "./useSeccionales";
import useSeccionalLocalidades from "./seccionalLocalidades/useSeccionalLocalidades";
import useHttp from "../../../hooks/useHttp";
import useTareasUsuario from "components/hooks/useTareasUsuario";

const SeccionalesHandler = () => {
	const dispatch = useDispatch();
	const { isLoading, error, sendRequest: request } = useHttp();

	const tabs = [];
	const [tab, setTab] = useState(0);
	const [localidadesTodas, setLocalidadesTodas] = useState([]);
	
	const tarea = useTareasUsuario();
	const disableTabAutoridades = !tarea.hasTarea("Datos_SeccionalAutoridades");
	const disableTabDocumentacion = !tarea.hasTarea("Datos_SeccionalDocumentacion");
	const disableTabLocalidad = !tarea.hasTarea("Datos_SeccionalLocalidad");

	useEffect(()=>{

		const processLocalidades = async (localidadesObj) => {
				
			setLocalidadesTodas(localidadesObj);
		};

		request(
			{
			baseURL: "Afiliaciones",
			endpoint: "/RefLocalidad",
			method: "GET",
			},
			processLocalidades
		);
	},[]);
	
	
	//#region Tab Seccionales
	const {
		render: seccionalesTab,
		request: seccionalChanger,
		selected: seccionalSelected,
	} = useSeccionales();
	const [seccionalesActions, setSeccionalesActions] = useState([]);
	
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) => seccionalChanger("selected", { request, action }),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				action: `Agrega Seccional`,
				request: "A",
				tarea: "Datos_SeccionalAgrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = seccionalSelected?.codigo ?? seccionalSelected?.descripcion;

		actions.push(
			createAction({
				action: `Consulta Seccional ${desc}`,
				request: "C",
				tarea: "Datos_SeccionalConsulta",
				...(!seccionalSelected?.id ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					 keys: "o",
					 underlineindex: 1
					}
				)
		
			})
		);
		actions.push(
			createAction({
				action: `Modifica Seccional ${desc}`,
				request: "M",
				tarea: "Datos_SeccionalModifica",

				...(seccionalSelected?.deletedDate || !seccionalSelected?.id ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					 keys: "m",
					 underlineindex: 0
					}
				)
			})
		);
		actions.push(
			createAction({
				action: `Baja Seccional ${desc}`,
				request: "B",
				tarea: "Datos_SeccionalBaja",

				...(seccionalSelected?.deletedDate || !seccionalSelected?.id ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					 keys: "b",
					 underlineindex: 0
					}
				)
			})
		);
		setSeccionalesActions(actions); //cargo todas las acciones / botones
	}, [seccionalChanger, seccionalSelected]);

	tabs.push({
		header: () => <Tab label="Seccionales" />,
		body: seccionalesTab,
		actions: seccionalesActions,
	});

	useEffect(() => {
		seccionalChanger("list");
	}, [seccionalChanger]);
	//#endregion

	//#region Tab Autoridades
	const [autoridadesTab, autoridadesChanger, autoridadSelected] = useAutoridades();
	const [autoridadesActions, setAutoridadesActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const secc = seccionalSelected?.codigo != "" ? seccionalSelected?.codigo : seccionalSelected?.id;
		if (!secc) {
			setAutoridadesActions(actions);
			return;
		}
		const seccDesc = `para Seccional ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					autoridadesChanger("selected", {
						request,
						action,
						record: { seccionalId: seccionalSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Autoridad ${seccDesc}`,
				request: "A",
				tarea: "Datos_SeccionalAutoridadesAgrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const sele = autoridadSelected?.id;
		if (!sele) {
			setAutoridadesActions(actions);
			return;
		}
		const seleDesc = `${sele} ${seccDesc}`;
		actions.push(
			createAction({
				action: `Consulta Autoridad ${seleDesc}`,
				request: "C",
				tarea: "Datos_SeccionalAutoridadesConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Autoridad ${seleDesc}`,
				request: "M",
				tarea: "Datos_SeccionalAutoridadesModifica",

				...(autoridadSelected?.deletedDate ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					 keys: "m",
					 underlineindex: 0
					}
				)
			})
		);
		if (autoridadSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Autoridad ${seleDesc}`,
					request: "R",
					tarea: "Datos_SeccionalAutoridadesReactiva",
					keys: "r",
					underlineindex: 0,
			})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Autoridad ${seleDesc}`,
					request: "B",
					tarea: "Datos_SeccionalAutoridadesBaja",
					...(autoridadSelected?.deletedDate ? 
						{disabled:  true}
						:
						{
						 disabled:  false,
						 keys: "b",
						 underlineindex: 0
						}
					)
			})
			); 
		}
		setAutoridadesActions(actions);
	}, [autoridadesChanger, autoridadSelected, seccionalSelected?.id]);
	tabs.push({
		header: () => <Tab label="Autoridades" disabled={!seccionalSelected?.id || seccionalSelected.deletedDate || disableTabAutoridades } />,
		body: autoridadesTab,
		actions: autoridadesActions,
	});

	// Si cambia Seccional, refresco lista de autoridades
	useEffect(() => {
		autoridadesChanger("list", {
			clear: !seccionalSelected?.id,
			params: { seccionalId: seccionalSelected?.id /*aca debe ir el check de SOloActivos */},
		});
	}, [seccionalSelected?.id, autoridadesChanger]);
	//#endregion

	//#region Tab documentaciones
	const [documentacionesTab, documentacionChanger, documentacionSelected] =
		useDocumentaciones();
	const [documentacionesActions, setDocumentacionesActions] = useState([]);

	useEffect(() => {
		const actions = [];
		const secc = seccionalSelected?.codigo != "" ? seccionalSelected?.codigo : seccionalSelected?.id;
		if (!secc) {
			setDocumentacionesActions(actions);
			return;
		}
		const seccDesc = `para Seccional ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "S", entidadId: seccionalSelected?.id, soloactivos: false },
					}),
				combination: "AltKey",
				...x,
			});

		actions.push(
			createAction({
				action: `Agrega Documentación ${seccDesc}`,
				request: "A",
				tarea: "Datos_SeccionalDocumentacionAgrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const docu = documentacionSelected?.id;
		if (!docu) {
			setDocumentacionesActions(actions);
			return;
		}
		const docuDesc = `${docu} ${seccDesc}`;
		actions.push(
			createAction({
				action: `Consulta Documentación ${docuDesc}`,
				request: "C",
				tarea: "Datos_SeccionalDocumentacionConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Documentación ${docuDesc}`,
				request: "M",
				tarea: "Datos_SeccionalDocumentacionModifica",
				keys: "m",
				underlineindex: 0,
			})
		);
		actions.push(
			createAction({
				action: `Baja Documentación ${docuDesc}`,
				request: "B",
				tarea: "Datos_SeccionalDocumentacionBaja",
				keys: "b",
				underlineindex: 0,
			})
		);
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, seccionalSelected?.id]);


	tabs.push({
		header: () => <Tab label="Documentacion" disabled={!seccionalSelected?.id || seccionalSelected.deletedDate || disableTabDocumentacion} />,
		body: documentacionesTab,
		actions: documentacionesActions,
	});

	// Si cambia Seccional, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !seccionalSelected?.id,
			params: { entidadTipo: "S", entidadId: seccionalSelected?.id, soloactivos: false },
		});
	}, [seccionalSelected?.id, documentacionChanger]);
	//#endregion


	//#region Tab SeccionalLocalidades
	const [seccionalLocalidadesTab, seccionalLocalidadesChanger, seccionalLocalidadesSelected] = useSeccionalLocalidades();
	const [seccionalLocalidadesActions, setSeccionalLocalidadesActions] = useState([]);

	useEffect(() => {
		console.log('UseE_SeccionalLocalidades')
		const actions = [];
		const secc = seccionalSelected?.codigo != "" ? seccionalSelected?.codigo : seccionalSelected?.id;
		if (!secc) {
			setSeccionalLocalidadesActions(actions);
			return;
		}
		const seccDesc = `para Seccional ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
				seccionalLocalidadesChanger("selected", {
					request,
					action,
					localidades: localidadesTodas,
					record: { seccionalId: seccionalSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});

		actions.push(
			createAction({
				action: `Agrega Localidad ${seccDesc}`,
				request: "A",
				tarea: "Datos_SeccionalLocalidadAgrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const docu = seccionalLocalidadesSelected?.codigo;
		if (!docu) {
			setSeccionalLocalidadesActions(actions);
			return;
		}
		const docuDesc = `${docu} ${seccDesc}`;
		actions.push(
			createAction({
				action: `Consulta Localidad ${docuDesc}`,
				request: "C",
				tarea: "Datos_SeccionalLocalidadConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		/*actions.push(
			createAction({
				action: `Modifica Localidad ${docuDesc}`,
				request: "M",
				tarea: "Datos_SeccionalLocalidadModifica",
				keys: "m",
				underlineindex: 0,
			})
		);*/

		if (seccionalLocalidadesSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Localidad ${docuDesc}`,
					tarea: "Datos_SeccionalLocalidadReactiva",
					request: "R",
					keys: "r",
					underlineindex: 0,
			})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Localidad ${docuDesc}`,
					request: "B",
					tarea: "Datos_SeccionalLocalidadBaja",
					...(seccionalLocalidadesSelected?.deletedDate ? 
						{disabled:  true}
						:
						{
						 disabled:  false,
						 keys: "b",
						 underlineindex: 0
						}
					)
			})
			);
		}
		
		setSeccionalLocalidadesActions(actions);
	}, [seccionalLocalidadesChanger, seccionalLocalidadesSelected, seccionalSelected?.id]);


	tabs.push({
		header: () => <Tab label="Localidades" disabled={!seccionalSelected?.id || seccionalSelected.deletedDate || disableTabLocalidad } />,
		body: seccionalLocalidadesTab,
		actions: seccionalLocalidadesActions,
	});

	// Si cambia Seccional, refresco lista de documentación
	useEffect(() => {
		console.log('seccionalSelected',seccionalSelected)
		seccionalLocalidadesChanger("list", {
			clear: !seccionalSelected?.id,
			localidades: localidadesTodas,
			//data: seccionalSelected?.seccionalLocalidad ?? [{}],
			params: { seccionalId: seccionalSelected?.id,  soloactivos: false},
		});
	}, [localidadesTodas, seccionalSelected?.id, documentacionChanger]);
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Seccionales", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Seccionales</h1>
			</Grid>
		
	
			<div className="tabs">
				<text>{seccionalSelected?.descripcion ? ` ${seccionalSelected?.codigo} - ${seccionalSelected.descripcion ?? ""}` : " " }</text>

				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</div>

			{tabs[tab].body()}
			<KeyPress items={acciones} />
		
		</Grid>
	);
};

export default SeccionalesHandler;
