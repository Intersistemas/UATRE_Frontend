import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import Action from "components/helpers/Action";
import useQueryState from "components/hooks/useQueryState";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import KeyPress from "components/keyPress/KeyPress";
import useAutoridades from "components/pages/administracion/seccionales/autoridades/useAutoridades";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial, { includeSearch, mapOptions } from "components/ui/Select/SearchSelectMaterial";
import useSeccionalLocalidades from "./seccionalLocalidades/useSeccionalLocalidades";
import useSeccionales, { onLoadSelectKeepOrFirst } from "./useSeccionales";
import LotePDFViewer from "./autoridades/Carnet/LotePDFViewer";

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

const SeccionalesHandler = () => {
	const dispatch = useDispatch();
	const { setState: setEstadosSeccionalesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/SeccionalEstado`,
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

				...(seccionalSelected?.deletedDate || !seccionalSelected?.id || seccionalSelected?.seccionalEstadoDescripcion == "ABSORBIDA"? 
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

				...(seccionalSelected?.deletedDate || !seccionalSelected?.id || seccionalSelected?.seccionalEstadoDescripcion == "ABSORBIDA"? 
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
		actions.push(
			createAction({
				action: `Absorbe Seccional ${desc}`,
				request: "X",
				tarea: "Datos_SeccionalAbsorbe",

				...(seccionalSelected?.deletedDate || !seccionalSelected?.id || seccionalSelected?.seccionalEstadoDescripcion == "ABSORBIDA" ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					 keys: "o",
					 underlineindex: 3
					}
				)
			})
		);
		
		setSeccionalesActions(actions); //cargo todas las acciones / botones
	}, [seccionalChanger, seccionalSelected]);

	tabs.push({
		header: () => <Tab label="Seccionales" />,
		body: () => (
			<Grid col gap="inherit">
				<Grid grid="auto / 1fr 1fr 1fr" gap="inherit">
					<SearchSelectMaterial
						label="Provincia"
						error={!!seccPciaSelect.error}
						helperText={
							seccPciaSelect.loading ??
							seccPciaSelect.error
						}
						value={seccPciaSelect.selected}
						onChange={(selected = {}) => {
							setSeccPciaSelect((o) => ({
								...o,
								selected,
								origen: "option",
							}));
							if (selected === provinciaTodas) {
								setSeccLocaSelect((o) => ({
									...o,
									selected: localidadTodas,
									buscar: "",
								}));
							} else {
								setLocalidadesQuery((o) => ({
									...o,
									query: {
										...o.query,
										params: {
											...o.query.params,
											provinciaId: selected.value,
										},
									},
									onPreLoad: () =>
										setSeccLocaSelect((o) => ({
											...o,
											selected: {},
											loading: "Cargando...",
										})),
									onLoad: ({ ok, error }) =>
										setSeccLocaSelect((o) => ({
											...o,
											data: Array.isArray(ok) ? ok : [],
											loading: null,
											error: error?.toString(),
											selected: localidadTodas,
											origen: "option",
										})),
								}));
							}
							setSeccionalesParamsEdit((o) => {
								const provinciaId = selected.value;
								const seccionalesParamsEdit = { ...o, provinciaId };
								if (selected === provinciaTodas) delete seccionalesParamsEdit.provinciaId;
								delete seccionalesParamsEdit.localidadId;
								return seccionalesParamsEdit;
							});
						}}
						options={seccPciaSelect.options}
						onTextChange={(buscar) =>
							setSeccPciaSelect((o) => ({ ...o, buscar, origen: "text" }))
						}
					/>
					<SearchSelectMaterial
						label="Localidad"
						error={!!seccLocaSelect.error}
						helperText={
							seccLocaSelect.loading ??
							seccLocaSelect.error
						}
						value={seccLocaSelect.selected}
						onChange={(selected = {}) => {
							setSeccLocaSelect((o) => ({
								...o,
								selected,
								origen: "option",
							}));
							setSeccionalesParamsEdit((o) => {
								const localidadId = selected.value;
								const seccionalesParamsEdit = { ...o, localidadId };
								if (selected === localidadTodas) delete seccionalesParamsEdit.localidadId;
								return seccionalesParamsEdit;
							});
						}}
						options={seccLocaSelect.options}
						onTextChange={(buscar) =>
							setSeccLocaSelect((o) => ({ ...o, buscar, origen: "text" }))
						}
					/>
					<SearchSelectMaterial
						label="Delegación"
						error={!!delegacionSelect.error}
						helperText={
							delegacionSelect.loading ??
							delegacionSelect.error
						}
						value={delegacionSelect.selected}
						onChange={(selected = {}) => {
							setDelegacionSelect((o) => ({
								...o,
								selected,
								origen: "option",
							}));
							setSeccionalesParamsEdit((o) => {
								const refDelegacionId = selected.value;
								const seccionalesParamsEdit = { ...o, refDelegacionId };
								if (selected === delegacionTodas) delete seccionalesParamsEdit.refDelegacionId;
								return seccionalesParamsEdit;
							});
						}}
						options={delegacionSelect.options}
						onTextChange={(buscar) =>
							setDelegacionSelect((o) => ({
								...o,
								buscar,
								origen: "text",
							}))
						}
					/>
				</Grid>
				<Grid grid="auto / 200px 1fr 200px 200px 200px" gap="inherit">
					<InputMaterial
						label="Codigo de seccional"
						value={seccionalesParamsEdit.codigo}
						onChange={(codigo) =>
							setSeccionalesParamsEdit((o) => {
								const seccionalesParamsEdit = { ...o, codigo };
								if (!codigo) delete seccionalesParamsEdit.codigo;
								return seccionalesParamsEdit;
							})
						}
					/>
					<InputMaterial
						label="Nombre de seccional"
						value={seccionalesParamsEdit.descripcion}
						onChange={(descripcion) =>
							setSeccionalesParamsEdit((o) => {
								const seccionalesParamsEdit = { ...o, descripcion };
								if (!descripcion) delete seccionalesParamsEdit.descripcion;
								return seccionalesParamsEdit;
							})
						}
					/>
					<SearchSelectMaterial
						label="Estado de seccional"
						error={!!estadoSeccionalSelect.error}
						helperText={
							estadoSeccionalSelect.loading ??
							estadoSeccionalSelect.error
						}
						value={estadoSeccionalSelect.selected}
						onChange={(selected = {}) => {
							setEstadoSeccionalSelect((o) => ({
								...o,
								selected,
								origen: "option",
							}));
							setSeccionalesParamsEdit((o) => {
								const seccionalEstadoId = selected.value;
								const seccionalesParamsEdit = { ...o, seccionalEstadoId };
								if (selected === estadoSeccionalTodos) delete seccionalesParamsEdit.seccionalEstadoId;
								return seccionalesParamsEdit;
							});
						}}
						options={estadoSeccionalSelect.options}
						onTextChange={(buscar) =>
							setEstadoSeccionalSelect((o) => ({
								...o,
								buscar,
								origen: "text",
							}))
						}
					/>
					<Button
						className="botonAzul"
						disabled={
							JSON.stringify(seccionalesParamsEdit) ===
							JSON.stringify(seccionalesParamsSend)
						}
						//</Grid>onClick={() => setSeccionalesParamsSend((o) => ({ ...o, ...seccionalesParamsEdit, ...{pageIndex: 1} }))
						onClick={() => setSeccionalesParamsSend(seccionalesParamsEdit)}
					>
						Aplica filtro
					</Button>
					<Button
						className="botonAzul"
						disabled={Object.entries(seccionalesParamsEdit).length === 0}
						onClick={() => {
							const seccionalesParamsEdit = {};
							setEstadoSeccionalSelect((o) => ({
								...o,
								selected: estadoSeccionalTodos,
								buscar: "",
							}));
							setSeccPciaSelect((o) => ({
								...o,
								selected: provinciaTodas,
								buscar: "",
							}));
							setSeccLocaSelect((o) => ({
								...o,
								selected: localidadTodas,
								buscar: "",
							}));
							setDelegacionSelect((o) => ({
								...o,
								selected: delegacionTodas,
								buscar: "",
							}));
							setSeccionalesParamsEdit(seccionalesParamsEdit);
							if (
								JSON.stringify(seccionalesParamsEdit) ===
								JSON.stringify(seccionalesParamsSend)
							)
								return;
							setSeccionalesParamsSend({ ...seccionalesParamsEdit });
						}}
					>
						Limpia filtro
					</Button>
				</Grid>
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
	const [autoridadesTab, autoridadesChanger, autoridadSelected] = useAutoridades();
	const [autoridadesImprime, setAutoridadesImprime] = useState(null);
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
			actions.push(
				createAction({
					action: `Imprime carnet de autoridad ${seleDesc}`,
					tarea: "Datos_SeccionalAutoridadesImprime",
					keys: "i",
					underlineindex: 0,
					onExecute: () => setAutoridadesImprime({
						seccional: [seccionalSelected].map((s) => ({
							id: s.id,
							codigo: s.codigo,
							nombre: s.descripcion,
							provincia: s.provinciaDescripcion,
						})).pop(),
						autoridades: [autoridadSelected].map((a) => ({
							id: a.afiliadoId,
							nombre: a.afiliadoNombre,
							nroAfiliado: a.afiliadoNumero,
							cargo: a.refCargosDescripcion,
						})),
					})
				})
			);
		}
		setAutoridadesActions(actions);
	}, [autoridadesChanger, autoridadSelected, seccionalSelected]);
	tabs.push({
		header: () => <Tab label="Autoridades" disabled={!seccionalSelected?.id || seccionalSelected.deletedDate || disableTabAutoridades } />,
		body: () => (
			<>
				{autoridadesTab()}
				{autoridadesImprime == null ? null : (
					<LotePDFViewer
						{...autoridadesImprime}
						onClose={() => setAutoridadesImprime(null)}
					/>
				)}
			</>
		),
		actions: autoridadesActions,
	});

	// Si cambia Seccional, refresco lista de autoridades
	useEffect(() => {
		autoridadesChanger("list", {
			clear: !seccionalSelected?.id,
			params: { seccionalId: seccionalSelected?.id /*aca debe ir el check de SOloActivos */},
		});
	}, [seccionalSelected, autoridadesChanger]);
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
	}, [documentacionChanger, documentacionSelected, seccionalSelected]);


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
	}, [seccionalSelected, documentacionChanger]);
	//#endregion

	//#region Tab SeccionalLocalidades
	const [seccionalLocalidadesTab, seccionalLocalidadesChanger, seccionalLocalidadesSelected] = useSeccionalLocalidades();
	const [seccionalLocalidadesActions, setSeccionalLocalidadesActions] = useState([]);

	useEffect(() => {
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
	}, [seccionalLocalidadesChanger, seccionalLocalidadesSelected, seccionalSelected]);

	tabs.push({
		header: () => <Tab label="Localidades" disabled={!seccionalSelected?.id || seccionalSelected.deletedDate || disableTabLocalidad } />,
		body: seccionalLocalidadesTab,
		actions: seccionalLocalidadesActions,
	});

	//#region Carga inicial localidades
	useEffect(() => {
		setLocalidadesQuery((o) => ({
			...o,
			onLoad: ({ ok }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setLocalidadesTodas(data);
			},
		}));
	}, [setLocalidadesQuery]);
	//#endregion Carga inicial localidades

	// Si cambia Seccional, refresco lista de Localidades
	useEffect(() => {
		seccionalLocalidadesChanger("list", {
			clear: !seccionalSelected?.id,
			localidades: localidadesTodas,
			//data: seccionalSelected?.seccionalLocalidad ?? [{}],
			params: { seccionalId: seccionalSelected?.id,  soloactivos: true},
		});
	}, [localidadesTodas, seccionalSelected, seccionalLocalidadesChanger]);
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
				<text>{seccionalSelected?.descripcion ? ` ${seccionalSelected?.codigo} - ${seccionalSelected.descripcion ?? ""}` : " " }</text>
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

export default SeccionalesHandler;
