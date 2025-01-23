import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import Action from "components/helpers/Action";
import useQueryState from "components/hooks/useQueryState";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import KeyPress from "components/keyPress/KeyPress";
import usePreguntas from "components/pages/app/encuestas/preguntas/usePreguntas";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial, { includeSearch, mapOptions } from "components/ui/Select/SearchSelectMaterial";
import useSeccionalLocalidades from "./respuestas/useRespuestas";
import useSeccionales, { onLoadSelectKeepOrFirst } from "./useEncuestas";

//#region estadoSeccionalSelect Options
const estadoSeccionalTodos = { label: "Todos" };
const estadoSeccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		start: [estadoSeccionalTodos],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion estadoSeccionalSelect Options

//#region provinciaSelect Options
const provinciaTodas = { label: "Todas" };
const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		start: [provinciaTodas],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion provinciaSelect Options

//#region localidadSelect Options
const localidadTodas = { label: "Todas" };
const localidadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.codPostal, r.nombre].join(" - "),
			record: r,
		}),
		start: [localidadTodas],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion localidadSelect Options

//#region delegacionSelect Options
const delegacionTodas = { label: "Todas" };
const delegacionSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		start: [delegacionTodas],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion delegacionSelect Options

const EncuestasHandler = () => {
	const dispatch = useDispatch();
	const { setState: setEstadosSeccionalesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "App",
				endpoint: `/Encuestas?include=preguntas(detalles)`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setProvinciasQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Provincia`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setLocalidadesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/RefLocalidad`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setDelegacionesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/RefDelegacion/GetAll`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const tabs = [];
	const [tab, setTab] = useState(0);
	const [localidadesTodas, setLocalidadesTodas] = useState([]);
	
	const tarea = useTareasUsuario();
	const disableTabAutoridades = !tarea.hasTarea("Datos_SeccionalAutoridades");
	const disableTabDocumentacion = !tarea.hasTarea("Datos_SeccionalDocumentacion");
	const disableTabLocalidad = !tarea.hasTarea("Datos_SeccionalLocalidad");

	//#region selects
	
	//#region select estadoSeccional
	const [estadoSeccionalSelect, setEstadoSeccionalSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: estadoSeccionalTodos,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEstadoSeccionalSelect((o) => ({
			...o,
			options: estadoSeccionalSelectOptions(o),
		}));
	}, [estadoSeccionalSelect.buscar, estadoSeccionalSelect.data]);
	//#endregion select estadoSeccional

	//#region select provincia
	const [seccPciaSelect, setSeccPciaSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: provinciaTodas,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setSeccPciaSelect((o) => ({
			...o,
			options: provinciaSelectOptions(o),
		}));
	}, [seccPciaSelect.buscar, seccPciaSelect.data]);
	//#endregion select provincia

	//#region select localidad
	const [seccLocaSelect, setSeccLocaSelect] = useState({
		loading: "",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: localidadTodas,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setSeccLocaSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn = record.codPostal
					? (o) => o.record.codPostal === record.codPostal
					: (o) => includeSearch(o, record.nombre);
				selected = options.find(findFn);
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [seccLocaSelect.buscar, seccLocaSelect.data]);
	//#endregion select localidad

	//#region select estadoSeccional
	const [delegacionSelect, setDelegacionSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: delegacionTodas,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setDelegacionSelect((o) => ({
			...o,
			options: delegacionSelectOptions(o),
		}));
	}, [delegacionSelect.buscar, delegacionSelect.data]);
	//#endregion select estadoSeccional

	//#endregion selects
	
	//#region Tab Seccionales
	const [seccionalesParamsEdit, setSeccionalesParamsEdit] = useState({});
	const [seccionalesParamsSend, setSeccionalesParamsSend] = useState({});
	const {
		render: seccionalesTab,
		request: seccionalChanger,
		selected: seccionalSelected,
	} = useSeccionales();
	const [seccionalesActions, setSeccionalesActions] = useState([]);
	
	useEffect(() => {
		console.log("seccionalSelected",seccionalSelected)
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) => seccionalChanger("selected", { request, action }),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				action: `Agrega Encuesta`,
				request: "A",
				tarea: "Datos_EncuestaAgrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = seccionalSelected?.tema;

		actions.push(
			createAction({
				action: `Consulta Encuesta ${desc}`,
				request: "C",
				tarea: "Datos_EncuestaConsulta",
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
				action: `Modifica Encuesta ${desc}`,
				request: "M",
				tarea: "Datos_EncuestaModifica",

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
				action: `Baja Encuesta ${desc}`,
				request: "B",
				tarea: "Datos_EncuestaBaja",

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
		header: () => <Tab label="Encuestas" />,
		body: () => (
			<Grid col gap="inherit">
				<Grid width gap="inherit">
					{seccionalesTab()}
				</Grid>
			</Grid>
		),
		actions: seccionalesActions,
	});

	useEffect(() => {
		seccionalChanger("list", { params: seccionalesParamsSend, pagination: { index: 1, size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst, });
	}, [seccionalChanger, seccionalesParamsSend]);


	//#region Carga inicial select estado seccional
	useEffect(() => {
		setEstadosSeccionalesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setEstadoSeccionalSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setEstadosSeccionalesQuery]);
	//#endregion Carga inicial select estado seccional

	//#region Carga inicial selects provincias
	useEffect(() => {
		setProvinciasQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				const changes = {
					data,
					loading: null,
					error: error?.toString(),
				};
				setSeccPciaSelect((o) => ({ ...o, ...changes }));
			},
		}));
	}, [setProvinciasQuery]);
	//#endregion Carga inicial selects provincias

	//#region Carga inicial select delegacion
	useEffect(() => {
		setDelegacionesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setDelegacionSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setDelegacionesQuery]);
	//#endregion Carga inicial select delegacion

	//#endregion

	//#region Tab Autoridades
	const [preguntasTab, preguntasChanger, preguntasSelected = seccionalSelected] = usePreguntas();
	const [autoridadesActions, setAutoridadesActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const secc = seccionalSelected?.tema ?? "";
		if (!secc) {
			setAutoridadesActions(actions);
			return;
		}
		const seccDesc = `para Encuesta ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					preguntasChanger("selected", {
						request,
						action,
						record: { seccionalId: seccionalSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Pregunta ${seccDesc}`,
				request: "A",
				tarea: "Datos_SeccionalAutoridadesAgrega",
				disabled:  false,
				keys: "a",
				underlineindex: 0
			})
		);
		const sele = preguntasSelected?.id;
		if (!sele) {
			setAutoridadesActions(actions);
			return;
		}
		const seleDesc = `${sele} ${seccDesc}`;
		actions.push(
			createAction({
				action: `Consulta Pregunta ${seleDesc}`,
				request: "C",
				tarea: "Datos_SeccionalAutoridadesConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Pregunta ${seleDesc}`,
				request: "M",
				tarea: "Datos_SeccionalAutoridadesModifica",
				...(preguntasSelected?.deletedDate ?
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
		setAutoridadesActions(actions);
	}, [preguntasChanger, preguntasSelected, seccionalSelected]);
	tabs.push({
		header: () => <Tab label="Preguntas" disabled={!seccionalSelected?.id || seccionalSelected.deletedDate || disableTabAutoridades } />,
		body: () => (
			<>
				{preguntasTab()}
				
			</>
		),
		actions: autoridadesActions,
	});

	// Si cambia Seccional, refresco lista de autoridades
	useEffect(() => {
		console.log("seccionalSelected**",seccionalSelected)
		preguntasChanger("list", {
			clear: !seccionalSelected?.id,
			data: seccionalSelected?.preguntas,
			params: { seccionalId: seccionalSelected?.id /*aca debe ir el check de SOloActivos */},
		});
	}, [seccionalSelected, preguntasChanger]);
	//#endregion

	//#region Tab documentaciones
	const [documentacionesTab, documentacionChanger, documentacionSelected] =
		useDocumentaciones();
	const [documentacionesActions, setDocumentacionesActions] = useState([]);

	useEffect(() => {
		const actions = [];
		const secc = seccionalSelected?.tema ?? "";
		if (!secc) {
			setDocumentacionesActions(actions);
			return;
		}
		const seccDesc = `para Encuesta ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "S", entidadId: seccionalSelected?.id, soloactivos: true },
					}),
				combination: "AltKey",
				...x,
			});

		actions.push(
			createAction({
				action: `Agrega Documentación ${seccDesc}`,
				request: "A",
				tarea: "Datos_SeccionalDocumentacionAgrega",
				...(seccionalSelected?.seccionalAbsorbenteId  ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					 keys: "a",
					 underlineindex: 0
					}
				)
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

				...(seccionalSelected?.seccionalAbsorbenteId || documentacionSelected?.deletedDate ? 
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
				action: `Baja Documentación ${docuDesc}`,
				request: "B",
				tarea: "Datos_SeccionalDocumentacionBaja",
				...(seccionalSelected?.seccionalAbsorbenteId  || documentacionSelected?.deletedDate ? 
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
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, seccionalSelected]);


	tabs.push({
		header: () => <Tab label="Respuestas" disabled={!seccionalSelected?.id || seccionalSelected.deletedDate || disableTabDocumentacion} />,
		body: documentacionesTab,
		actions: documentacionesActions,
	});

	// Si cambia Seccional, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !seccionalSelected?.id,
			params: { entidadTipo: "S", entidadId: seccionalSelected?.id, soloactivos: true },
		});
	}, [seccionalSelected, documentacionChanger]);
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
			<Grid className="tabs">
				<text>{seccionalSelected?.tema ? ` ${seccionalSelected?.tema}` : " " }</text>
					<Tabs value={tab} onChange={(_, v) => setTab(v)}>
						{tabs.map((r) => r.header())}
					</Tabs>
			</Grid>
			<Grid className="contenido" col gap="10px">
				{tabs.map(({ body }, i) => (
					<Grid col gap="inherit" hidden={i !== tab}>{body()}</Grid>
				))}
			</Grid>
			<KeyPress items={acciones} />
		
		</Grid>
	);
};

export default EncuestasHandler;
