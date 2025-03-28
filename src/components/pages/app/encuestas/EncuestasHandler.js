
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import useRespuestas from "components/pages/app/encuestas/respuestas/useRespuestas";
import Action from "components/helpers/Action";
import useQueryState from "components/hooks/useQueryState";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import KeyPress from "components/keyPress/KeyPress";
import usePreguntas from "components/pages/app/encuestas/preguntas/usePreguntas";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial, { includeSearch, mapOptions } from "components/ui/Select/SearchSelectMaterial";
import useSeccionales, { onLoadSelectKeepOrFirst } from "./useEncuestas";




//#region estadoSeccionalSelectPregunta Options
const estadoPregunta = { label: "Todos" };
const estadoSeccionalPreguntas = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		start: [estadoPregunta],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//___________________________________________________________________
const estadoRespuesta2 = { label: "Todos" };
const estadoSeccionalRespuestas = ({ data2 = [], buscar = "", ...x }) =>
	mapOptions({
		data2,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		start: [estadoRespuesta2],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//_________________________________________________________________


//#region respuestaSelect Options
const RespuestasTodas = { label: "Todas" };
const respuestaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		start: [RespuestasTodas],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion respuestaSelect Options

const EncuestasHandler = () => {
	const dispatch = useDispatch();

	const { setState: setEstadosPreguntaSeccionalesQuery } = useQueryState(
		() => ({
			config: { 
				baseURL: "App",
				// endpoint: `/Encuestas`,
				endpoint: `/Encuestas?Include=preguntas`,
				
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	//______________________________________________________________
	const { setState: setEstadosRespuestaSeccionalesQuery2 } = useQueryState(
		() => ({
			config: {
				baseURL: "App",
				endpoint: "/Encuestas?Include=preguntas",
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	//______________________________________________________________


	const tabs = [];
	const [tab, setTab] = useState(0);

	const tarea = useTareasUsuario();
	const disableTabAutoridades = !tarea.hasTarea("Datos_SeccionalAutoridades");
	


	const [estadoSeccionalSelectPregunta, setEstadoSeccionallSelectPregunta] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: estadoPregunta,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEstadoSeccionallSelectPregunta((o) => ({
			...o,
			options: estadoSeccionalPreguntas(o),
		}));
	}, [estadoSeccionalSelectPregunta.buscar, estadoSeccionalSelectPregunta.data]);


	//____________________________________________________________________

		const [estadoSeccionalSeelectRespuesta, setEstadoSeccionalSelecRespuestas] = useState({
			loading: "Cargando...",
			buscar: "",
			data2: [],
			error: null,
			options: [],
			selected: estadoRespuesta2,
			origen: "",
		});
		// Buscador
		useEffect(() => {
			setEstadoSeccionallSelectPregunta((o) => ({
				...o,
				options: estadoSeccionalRespuestas(o),
			}));
		}, [estadoSeccionalSeelectRespuesta.buscar, estadoSeccionalSeelectRespuesta.data2]);

	//_____________________________________________________________________


	
	const [respuestaSelect, setRespuestaSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: RespuestasTodas,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setRespuestaSelect((o) => ({
			...o,
			options: respuestaSelectOptions(o),
		}));
	}, [respuestaSelect.buscar, respuestaSelect.data]);

	
	//#region Tab Seccionales

	const [seccionalesParamsSend, setSeccionalesParamsSend] = useState({});
	const {
		render: seccionalesTab,
		request: seccionalChanger,
		selected: seccionalSelected,
	} = useSeccionales();



	//___________________________________________________________________

	const [seccionalesParamsSend2, setSeccionalesParamsSend2] = useState({});
	const {
		render: seccionalesTab2,
		request: seccionalChanger2,
		selected: seccionalSelected2,
	} = useSeccionales();
	//___________________________________________________________________

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
			//ººººººººººººººººººººººººººººººººººººººººººººººººººººººººº
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


	//_________________________________________________________________________________________


	useEffect(() => {
		seccionalChanger2("list", { params: seccionalesParamsSend2, pagination: { index: 1, size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst, });
	}, [seccionalChanger2, seccionalesParamsSend2]);

	//__________________________________________________________________________________________



		//#region Carga inicial select estado seccional
		useEffect(() => {
			setEstadosPreguntaSeccionalesQuery((o) => ({
				...o,
				onLoad: ({ ok, error }) => {
					let data = [];
					if (Array.isArray(ok)) data = ok;
					console.log("D1:", ok);
					
					setEstadoSeccionallSelectPregunta((o) => ({
						...o,
						loading: null,
						data,
						error: error?.toString(),
					}));
				},
			}));
		}, [setEstadosPreguntaSeccionalesQuery]);





	//______________________________________________________________
	useEffect(() => {
		setEstadosRespuestaSeccionalesQuery2((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data2 = [];
				if (Array.isArray(ok?.data)) data2 = [...ok.data]; // Copia los datos de ok.data si es un array
				console.log("Data de Respuestas, desde EncuestaHandler:", data2);
	
				setEstadoSeccionalSelecRespuestas((o) => ({
					...o,
					loading: null,
					data2,  // Ahora data2 tiene los valores de ok.data (si existían)
					error: error?.toString(),
				}));
			},
		}));
	}, [setEstadosRespuestaSeccionalesQuery2]);
	
	//_________________________________________________________________



	//#region Tab Autoridades
	const [preguntasTab, preguntasChanger, preguntasSelected] = usePreguntas();
	const [autoridadesActions, setAutoridadesActions] = useState([]);
	useEffect(() => {

		console.log("EncuestasHanbled, aqui tengo la pregunta seleccionada1:", preguntasSelected)
		console.log("EncuestasHanbled, aqui tengo la pregunta seleccionada2:", seccionalSelected)
		const actions = [];
		const secc = seccionalSelected?.tema ?? "";
		if (!secc) {
			setAutoridadesActions(actions);
			return;
		}
		//Pasando como props

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
		actions.push(
			createAction({
				action: `Modificar Pregunta ${seccDesc}`,
				request: "M",
				tarea: "Datos_SeccionalAutoridadesModificar",
				disabled:  false,
				keys: "m",
				underlineindex: 0
				
			})
		);
		actions.push(
			createAction({
				action: `Bajar Pregunta ${seccDesc}`,
				request: "B",
				tarea: "Datos_SeccionalAutoridadesBajar",
				disabled:  false,
				keys: "b",
				underlineindex: 0
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



//------------------------------------------------------------------------------------
// Si cambia Seccional, refresco lista de autoridades
	useEffect(() => {
		console.log("seccionalSelected**",seccionalSelected)
		preguntasChanger("list", {
			clear: !seccionalSelected?.id,
			data: seccionalSelected?.preguntas,
			params: { id: seccionalSelected?.id },
		});
	}, [seccionalSelected, preguntasChanger]);



	const [respuestasTab2, respuestasChanger2, respuestasSelected2] = useRespuestas();
	const [respuestasActions, setRespuestasActions] = useState([]);

	useEffect(() => {
		const actions = [];
		const secc = seccionalSelected2?.tema ?? "";
		if (!secc) {
			setRespuestasActions(actions);
			return;
		}
		const seccDesc = `para Encuesta ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					respuestasChanger2("selected", {
						request,
						action,
						record: { entidadTipo: "S", entidadId: seccionalSelected2?.id, soloactivos: true },
					}),
				combination: "AltKey",
				...x,
			});

		

		setRespuestasActions(actions);
	}, [respuestasChanger2, respuestasSelected2, seccionalSelected2]);



	tabs.push({
		header: () => <Tab label="Respuestas" disabled={!seccionalSelected2?.id || seccionalSelected2.deletedDate || disableTabAutoridades } />,
		body: () => (
			<>
				{respuestasTab2()}
				
			</> 
		),
		actions: respuestasActions,
	});


//Datos que obtengo de useRespuestas 
//_________________________________________________________________________________________
	
		useEffect(() => {
			console.log("%DATOS-RESPUESTAS-DE-ENCUESTA_HAN ", "color: green", estadoSeccionalSeelectRespuesta.data2);

			
			respuestasChanger2("list", { 
				clear: !preguntasSelected?.id,
				data: preguntasSelected,
				params: { encuestaPreguntaId: preguntasSelected?.encuestaId, encuestaPreguntaId2: preguntasSelected?.id },
			});
		}, [estadoSeccionalSeelectRespuesta, preguntasSelected]); 
//______________________________________________________________________

//****************************************************************** */

	
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Seccionales", acciones }));
	}, [dispatch, acciones]);


	return (
		
		<Grid full col>
  {/* Título */}
  <Grid className="titulo">
    <h1>Encuesta</h1>
  </Grid>

  {/* Tabs */}
  <Grid className="tabs">
    <text>{seccionalSelected?.tema ? ` ${seccionalSelected?.tema}` : " "}</text>
    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
      {tabs.map((r) => r.header())}
    </Tabs>
  </Grid>

  {/* Contenido */}
  <Grid className="contenido" col gap="10px">
    {tabs.map(({ body }, i) => (
      <Grid col gap="inherit" hidden={i !== tab}>
        {/* Tabla */}
        {body()}

        
      </Grid>
    ))}
  </Grid>

  {/* KeyPress */}
  <KeyPress items={acciones} />
  
</Grid>



	);
};

export default EncuestasHandler;