import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import dayjs from "dayjs";
import { Tabs, Tab } from "@mui/material";
import AuthContext from "store/authContext";
import Action from "components/helpers/Action";
import Formato from "components/helpers/Formato";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import useGestionOS, { onLoadSelectKeepOrFirst } from "./useGestionOS";
import Button from "components/ui/Button/Button";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import SearchSelectMaterial, { includeSearch, mapOptions } from "components/ui/Select/SearchSelectMaterial";
import useQueryQueue from "components/hooks/useQueryQueue";


const GestionOSHandler = () => {
	const dispatch = useDispatch();

	const Usuario = useContext(AuthContext).usuario;

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Formularios Params
	const [paramsEdit, setParamsEdit] = useState({});
	const [paramsSend, setParamsSend] = useState({});
	//#endregion

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetEstados": {
				return {
				config: {
					baseURL: "Afiliaciones",
					endpoint: `/GestionesEstado`,
					method: "GET",
				},
				};
			}
			case "GetSituaciones": {
				return {
				config: {
					baseURL: "Afiliaciones",
					endpoint: `/GestionesSituacion`,
					method: "GET",
				},
				};
			}
			default:
				return null;
		}
	});
	//#endregion


	//#region select estado
		const [estadoSelect, setEstadoSelect] = useState({
			reload: true,
			loading: null,
			data: [],
			error: null,
			options: [{ value: 0, label: "TODOS" }],
			selected: { value: 0, label: "TODOS" },
		});

	//#region select situacion
		const [situacionSelect, setSituacionSelect] = useState({
			reload: true,
			loading: null,
			data: [],
			error: null,
			options: [],
			selected: { value: 0, label: "Todos" },
		});

	//#region select medio
		const [medioSelect, setMedioSelect] = useState({
			options: [{ value: "Todos", label: "TODOS" }, {value: "email", label:"EMAIL"}, {value: "telefono", label: "TELEFONO"}],
			selected: { value: "Todos", label: "TODOS" },
		});

	// Cargo todos los Tipos
	useEffect(() => {
		//if (!estadoSelect.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: [],
			error: null,
		}
		
		setParamsEdit((o) => {
			pushQuery({
				action: "GetEstados",
				onOk: (data) => {
					if (!Array.isArray(data))
						return console.error("Se esperaba un arreglo", data);
					changes.data = data.map((r) => ({
						value: r.id,
						label: r.descripcion,
					}));
					changes.options = data.map((r) => ({
						value: r.id,
						label: r.descripcion,
					}));
					changes.options.unshift({ value: 0, label: "TODOS" });
				},
				onError: (error) => (changes.error = error.toString()),
				onFinally: () =>
					setEstadoSelect((o) => ({ ...o, ...changes, loading: null })),
			});
			return { ...o, ...changes };
		});
		
	}, []);
	//#endregion Cargo todos los Tipos


	// Cargo las Situcaiones segun el ESTADO que haya seleccionado
	useEffect(() => {
		
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: [],
			error: null,
		}
		
		setParamsEdit((o) => {
			pushQuery({
				action: "GetSituaciones",
				params: { gestionEstadoId: paramsEdit?.filtroTipoEstado?.value },
				onOk: (data) => {
					if (!Array.isArray(data))
						return console.error("Se esperaba un arreglo", data);
					changes.data = data.map((r) => ({
						value: r.id,
						label: r.descripcion,
					}));
					changes.options = data.map((r) => ({
						value: r.id,
						label: r.descripcion,
					}));
					changes.options.unshift({ value: 0, label: "TODOS" });
				},
				onError: (error) => (changes.error = error.toString()),
				onFinally: () =>
					setSituacionSelect((o) => ({ ...o, ...changes, loading: null })),
			});
			return { ...o, ...changes };
		});
		
	}, [paramsEdit?.filtroTipoEstado]);
	//#endregion Cargo todos los Tipos

		

	//#region Tab Formularios
	const {
		render: formulariosOspreraRender,
		request: formularioOspreraRequest,
		selected: formularioSelected,
	} = useGestionOS({
		params: { orderBy: "cuitTitular" },
		onLoadSelect: onLoadSelectKeepOrFirst,
	});
	const [formularioOspreraActions, setFormularioOspreraActions] = useState([]);

	useEffect(() => {
		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => formularioOspreraRequest("selected", params),
				combination: "AltKey",
				...x,
			});
		};
		const actions = [
			createAction({
				action: `Agrega Gestión`,
				request: "A",
				tarea: "Osprera_GestionAgrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc =formularioSelected?.id;
			//Formato.Cuit(formularioSelected?.cuitTitular) || formularioSelected?.cuitTitular;

		actions.push(
			createAction({
				action: `Consulta Gestión ${desc}`,
				request: "C",
				tarea: "Osprera_GestionConsulta",
				record: {},
				...(!formularioSelected?.id
					? { disabled: true }
					: {
							disabled: false,
							keys: "o",
							underlineindex: 1,
					  }),
			})
		);

		actions.push(			
			createAction({
				action: `Modifica Gestión ${desc}`,
				request: "M",
				record: {},
				tarea: "Osprera_GestionModifica",
				...(formularioSelected?.deletedDate || !formularioSelected?.id || formularioSelected?.gestionEstadoDescripcion === "FINALIZADO"
					? { disabled: true }
					: {
							disabled: false,
							keys: "m",
							underlineindex: 0,
					  }),
			})
		);

		if (formularioSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Gestión ${desc}`,
					request: "R",
					record: {},
					tarea: "Osprera_GestionReactiva",
					keys: "r",
					underlineindex: 0,
				})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Gestión ${desc}`,
					request: "B",
					record: {
						...formularioSelected,
						deletedDate: dayjs().format("YYYY-MM-DD"),
						deletedBy: Usuario.nombre,
					},
					tarea: "Osprera_GestionBaja",
					...(formularioSelected?.deletedDate || !formularioSelected?.id
						? { disabled: true }
						: {
								disabled: false,
								keys: "b",
								underlineindex: 0,
						  }),
				})
			);
		}
		/*
		actions.push(
			createAction({
				action: `Envía Email ${desc}`,
				request: "E",
				record: {},
				tarea: "Osprera_GestionEnvioEmail",
				...(formularioSelected?.medioGestion == 'telefono' || !formularioSelected?.id
					? { disabled: true }
					: {
							disabled: false,
							keys: "e",
							underlineindex: 0,
					  }),
			})
		);*/
		setFormularioOspreraActions(actions); //cargo todas las acciones / botones
	}, [formularioOspreraRequest, formularioSelected]);

	tabs.push({
		header: () => <Tab label="Gestiones de Obra Social" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid  row gap="10px">
					<Grid width col gap="inherit">
						<Grid  gap="inherit">
							<Grid grow>
								<InputMaterial
									label="Filtro por CUIL / Apellido Titular"
									value={paramsEdit.filtro}
									onChange={(filtro) =>
										setParamsEdit((o) => {
											const paramsEdit = { ...o, filtro };
											if (!filtro) delete paramsEdit.filtro;
											return paramsEdit;
										})
									}
								/>
							</Grid>
							<Grid grow>
								<InputMaterial
									label="Filtro por DNI / Apellido Paciente"
									value={paramsEdit.filtroPaciente}
									onChange={(filtroPaciente) =>
										setParamsEdit((o) => {
											const paramsEdit = { ...o, filtroPaciente };
											if (!filtroPaciente) delete paramsEdit.filtroPaciente;
											return paramsEdit;
										})
									}
								/>
							</Grid>
						</Grid>
					
						<Grid gap="inherit">
							<Grid grow>
								<SearchSelectMaterial
									label="Tipo Gestión"
									value={paramsEdit.filtroTipoGestion}
									onChange={(filtroTipoGestion) =>
										setParamsEdit((o) => {
											const paramsEdit = { ...o, filtroTipoGestion };
											if (!filtroTipoGestion) delete paramsEdit.filtroTipoGestion;
											return paramsEdit;
										})
									}
									options={medioSelect?.options}
								/>
							</Grid>
							<Grid grow>
								<SearchSelectMaterial
									label="Tipo Estado"
									value={paramsEdit.filtroTipoEstado}
									onChange={(filtroTipoEstado) =>
										setParamsEdit((o) => {
											const paramsEdit = { ...o, filtroTipoEstado };
											if (!filtroTipoEstado) delete paramsEdit.filtroTipoEstado;
											delete paramsEdit.filtroTipoSituacion;
											return paramsEdit;
										})
									}
									options={estadoSelect?.options}
								/>
							</Grid>
							<Grid grow>
								<SearchSelectMaterial
									label="Tipo Situación"
									value={paramsEdit.filtroTipoSituacion}
									onChange={(filtroTipoSituacion) =>
										setParamsEdit((o) => {
											const paramsEdit = { ...o, filtroTipoSituacion };
											if (!filtroTipoSituacion) delete paramsEdit.filtroTipoSituacion;
											return paramsEdit;
										})
									}
									options={situacionSelect?.options}
								/>
							</Grid>
						</Grid>
					</Grid>
					<Grid gap="inherit">
						<Grid gap="inherit">
							<Grid width="200px">
								<Button
									className="botonAzul"
									disabled={
										JSON.stringify(paramsEdit) === JSON.stringify(paramsSend)
									}
									onClick={() => setParamsSend(paramsEdit)}
								>
									Aplica filtro
								</Button>
							</Grid>
							<Grid width="200px">
								<Button
									className="botonAzul"
									disabled={Object.entries(paramsEdit).length === 0}
									onClick={() => {
										const paramsEdit = {};
										setParamsEdit(paramsEdit);
										if (JSON.stringify(paramsEdit) === JSON.stringify(paramsSend))
											return;
										setParamsSend({ ...paramsEdit });
									}}
								>
									Limpia filtro
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				{formulariosOspreraRender()}
			</Grid>
		),
		actions: formularioOspreraActions,
	});

	//Carga de lista según parametros
	useEffect(() => {
		formularioOspreraRequest("list", {
			params: paramsSend,
			pagination: { index: 1, size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		});
	}, [formularioOspreraRequest, paramsSend]);
	//#endregion

	//#region Tab documentaciones
	const [documentacionesTab, documentacionChanger, documentacionSelected] = useDocumentaciones();
	const [documentacionesActions, setDocumentacionesActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const form = formularioSelected?.id;
		if (!form) {
			setDocumentacionesActions(actions);
			return;
		}
		const deleDesc = `Gestión ${form}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "O", entidadId: formularioSelected?.id, soloactivos: true },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Documentación ${deleDesc}`,
				request: "A",
				tarea: "Osprera_GestionDocumentacionAgrega",
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
				tarea: "Osprera_GestionDocumentacionConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Documentación ${docuDesc}`,
				request: "M",
				tarea: "Osprera_GestionDocumentacionModifica",
				keys: "m",
				underlineindex: 0,
				...(documentacionSelected?.deletedDate ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					}
				)
			})
		);
		actions.push(
			createAction({
				action: `Baja Documentación ${docuDesc}`,
				request: "B",
				tarea: "Osprera_GestionDocumentacionBaja",
				keys: "b",
				underlineindex: 0,
				...(documentacionSelected?.deletedDate ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					}
				)
			})
		);
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, formularioSelected?.id]);
	tabs.push({
		header: () => <Tab label="Documentacion" disabled={!formularioSelected || formularioSelected.deletedDate} />,
		body: documentacionesTab,
		actions: documentacionesActions,
	});

	// Si cambia delegación, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !formularioSelected?.id,
			params: { entidadTipo: "O", entidadId: formularioSelected?.id, soloactivos: true },
		});
	}, [formularioSelected?.id, documentacionChanger]);
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "GestionOS", nombreMiga: "Gestion O.S", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Gestión Obra Social</h1>
			</Grid>

			<div className="tabs">
				<text>
					{formularioSelected?.cuitTitular
						? ` Nro. Gestión: ${formularioSelected?.id} (${Formato.Cuit(formularioSelected?.cuitTitular)}  |  ${formularioSelected?.apellidoTitular}${formularioSelected?.nombreTitular})`
						: " "}
				</text>

				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</div>
			<div className="contenido">	
				{tabs[tab].body()}
			</div>
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default GestionOSHandler;
