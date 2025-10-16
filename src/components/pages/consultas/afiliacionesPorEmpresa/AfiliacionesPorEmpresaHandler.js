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
import useAfiliacionesPorEmpresa, { onLoadSelectKeepOrFirst } from "./useAfiliacionesPorEmpresa";
import Button from "components/ui/Button/Button";
import useAfiliacionesPorEmpresaDetalle from "./afiliacionesPorEmpresaDetalle/useAfiliacionesPorEmpresaDetalle";
import SearchSelectMaterial, { includeSearch, mapOptions } from "components/ui/Select/SearchSelectMaterial";
import useQueryState from "components/hooks/useQueryState";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import ExcelDatos from "./ExcelDatos";

//#region seccionalSelect Options
const seccionalTodos = { label: "Todas" };
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		start: [seccionalTodos],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion seccionalSelect Options

//#region seccionalSelect Options
const seccionalTodos = { label: "Todas" };
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		start: [seccionalTodos],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion seccionalSelect Options

//#region seccionalSelect Options
const seccionalTodos = { label: "Todas" };
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		start: [seccionalTodos],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion seccionalSelect Options

//#region estadosSelect Options
const estadosTodos = { label: "Todos" };
const estadosSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		start: [estadosTodos],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion estadosSelect Options

const AfiliacionesPorEmpresaHandler = () => {
	const dispatch = useDispatch();
	const { setState: setEstadosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/EstadoSolicitud`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setSeccionalesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional?SoloActivos=true&verSeccionalesLocalidades=false`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const Usuario = useContext(AuthContext).usuario;

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Formularios Params
	const [paramsEdit, setParamsEdit] = useState({});
	const [paramsSend, setParamsSend] = useState({});
	//#endregion

	//Modificacion Mauro
	const [showInforme, setShowInforme] = useState(false);

	const [actualizaBotones, setActualizaBotones] = useState("Pendiente");

	//#region select estadoSeccional
	const [estadoSelect, setEstadoSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: estadosTodos,
		origen: "",
	});

	const [seccionalSelect, setSeccionalSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: seccionalTodos,
		origen: "",
	});

	useEffect(() => {

		if (!seccionalSelect || !seccionalSelect.options) return;

		setParamsEdit((o) => {
			const n = { ...o };
			const sel = seccionalSelect.selected;
			if (!sel || sel.value == null || sel === seccionalTodos) {
				delete n.seccionalId;
			} else {
				n.seccionalId = sel.value;
			}
			return n;
		});
	}, [seccionalSelect.selected]);

	// Buscador
	useEffect(() => {
		setEstadoSelect((o) => ({
			...o,
			options: estadosSelectOptions(o),
		}));
	}, [estadoSelect.buscar, estadoSelect.data]);
	//#endregion select estadoSeccional

	useEffect(() => {
		setSeccionalSelect((o) => ({
			...o,
			options: seccionalSelectOptions(o),
		}));
	}, [seccionalSelect.buscar, seccionalSelect.data]);

	//#region Carga inicial select estado seccional
	useEffect(() => {
		setEstadosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((d) => d.tipo == "Solicitudes");
				setEstadoSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setEstadosQuery]);
	//#endregion Carga inicial select estado seccional
	useEffect(() => {
		setSeccionalesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setSeccionalSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setSeccionalesQuery]);


	//#region Tab Formularios
	const {
		render: afiliacionesPorEmpresaRender,
		request: afiliacionesPorEmpresaRequest,
		selected: afiliacionPorEmpresaSelected,
	} = useAfiliacionesPorEmpresa({
		params: { orderBy: "empresaCUIT" },
		onLoadSelect: onLoadSelectKeepOrFirst,
	});
	const [afiliacionesPorEmpresaActions, setAfiliacionesPorEmpresaActions] = useState([]);




	const accionesRechazar = () => {
		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => afiliacionesPorEmpresaRequest("selected", params),
				combination: "AltKey",
				...x,
			});
		};
		const actions = [
			createAction({
				action: `Nueva Solicitud Afiliación`,
				request: "N",
				tarea: "Consultas_AfiliacionesPorEmpresaNueva",
				keys: "n",
				underlineindex: 0,
			}),
		];
		const desc = afiliacionPorEmpresaSelected?.id;

		actions.push(
			createAction({
				action: `Autoriza Solicitud Afiliación ${desc}`,
				request: "A",
				tarea: "Consultas_AfiliacionesPorEmpresaAutoriza",
				onExecute: async () => {
					await afiliacionesPorEmpresaRequest("patchEstados", {
						action: "Autoriza",
						record: afiliacionPorEmpresaSelected,
						params: {
							solicitudId: afiliacionPorEmpresaSelected?.id, // ID de la solicitud a actualizar
						}, // Parámetros para la consulta
						config: {
							body: {
								estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Autorizada")?.value,
								estadoSolicitudObservaciones: "sin observaciones",
								estadoSolicitudUsuario: Usuario?.id,
								estadoFecha: new Date().toISOString()
							}, // Cuerpo de la solicitud PATCH
						},
					});
					setAfiliacionesPorEmpresaActions(actions);
				},

				record: {},
				... { disabled: true }
			})
		);
		actions.push(
			createAction({
				action: `Descarga Formulario de Afiliaciones ${desc}`,
				onExecute: () => {
					documentacionChanger("downloadFirstFile", {
						clear: !afiliacionPorEmpresaSelected?.id,
						params: { entidadTipo: "E", entidadId: afiliacionPorEmpresaSelected?.id, soloactivos: true },
					});
				},
				request: "D",
				record: {},
				tarea: "Consultas_AfiliacionesPorEmpresaDescarga",
				... { disabled: true }
			})
		);

		actions.push(
			createAction({
				action: `Rechaza Solicitud Afiliación ${desc}`,
				request: "R",
				record: {},
				tarea: "Consultas_AfiliacionesPorEmpresaRechaza",
				onExecute: () => {
					afiliacionesPorEmpresaRequest("patchEstados", {
						action: "Rechaza",
						record: afiliacionPorEmpresaSelected,
						params: {
							solicitudId: afiliacionPorEmpresaSelected?.id, // ID de la solicitud a actualizar
						}, // Parámetros para la consulta
						config: {
							body: {
								estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Rechazada")?.value,
								estadoSolicitudObservaciones: "sin observaciones",
								estadoSolicitudUsuario: Usuario?.id,
								estadoFecha: new Date().toISOString()
							}, // Cuerpo de la solicitud PATCH
						},
					});
					setAfiliacionesPorEmpresaActions(actions);
				},
				... { disabled: true }

			})
		);
		setAfiliacionesPorEmpresaActions(actions);
	}

	const accionesAceptar = () => {
		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => afiliacionesPorEmpresaRequest("selected", params),
				combination: "AltKey",
				...x,
			});
		};
		const actions = [
			createAction({
				action: `Nueva Solicitud Afiliación`,
				request: "N",
				tarea: "Consultas_AfiliacionesPorEmpresaNueva",
				keys: "n",
				underlineindex: 0,
			}),
		];
		const desc = afiliacionPorEmpresaSelected?.id;

		actions.push(
			createAction({
				action: `Autoriza Solicitud Afiliación ${desc}`,
				request: "A",
				tarea: "Consultas_AfiliacionesPorEmpresaAutoriza",
				onExecute: async () => {
					await afiliacionesPorEmpresaRequest("patchEstados", {
						action: "Autoriza",
						record: afiliacionPorEmpresaSelected,
						params: {
							solicitudId: afiliacionPorEmpresaSelected?.id, // ID de la solicitud a actualizar
						}, // Parámetros para la consulta
						config: {
							body: {
								estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Autorizada")?.value,
								estadoSolicitudObservaciones: "sin observaciones",
								estadoSolicitudUsuario: Usuario?.id,
								estadoFecha: new Date().toISOString()
							}, // Cuerpo de la solicitud PATCH
						},
					});
					setAfiliacionesPorEmpresaActions(actions);
				},

				record: {},
				... { disabled: true }
			})
		);
		actions.push(
			createAction({
				action: `Descarga Formulario de Afiliaciones ${desc}`,
				onExecute: () => {
					documentacionChanger("downloadFirstFile", {
						clear: !afiliacionPorEmpresaSelected?.id,
						params: { entidadTipo: "E", entidadId: afiliacionPorEmpresaSelected?.id, soloactivos: true },
					});
				},
				request: "D",
				record: {},
				tarea: "Consultas_AfiliacionesPorEmpresaDescarga",
				... { disabled: false }
			})
		);

		actions.push(
			createAction({
				action: `Rechaza Solicitud Afiliación ${desc}`,
				request: "R",
				record: {},
				tarea: "Consultas_AfiliacionesPorEmpresaRechaza",
				onExecute: () => {
					afiliacionesPorEmpresaRequest("patchEstados", {
						action: "Rechaza",
						record: afiliacionPorEmpresaSelected,
						params: {
							solicitudId: afiliacionPorEmpresaSelected?.id, // ID de la solicitud a actualizar
						}, // Parámetros para la consulta
						config: {
							body: {
								estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Rechazada")?.value,
								estadoSolicitudObservaciones: "sin observaciones",
								estadoSolicitudUsuario: Usuario?.id,
								estadoFecha: new Date().toISOString()
							}, // Cuerpo de la solicitud PATCH
						},
					});
					setAfiliacionesPorEmpresaActions(actions);
				},
				... { disabled: true }

			})
		);
		setAfiliacionesPorEmpresaActions(actions);
	}

	useEffect(() => {
		console.log("afiliacionPorEmpresaSelected**", afiliacionPorEmpresaSelected);
		console.log("afiliacionesPorEmpresaRequest**", afiliacionesPorEmpresaRequest);

		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => afiliacionesPorEmpresaRequest("selected", params),
				combination: "AltKey",
				...x,
			});
		};
		const actions = [
			createAction({
				action: `Nueva Solicitud Afiliación`,
				request: "N",
				tarea: "Consultas_AfiliacionesPorEmpresaNueva",
				keys: "n",
				underlineindex: 0,
			}),
		];
		const desc = afiliacionPorEmpresaSelected?.id;

		actions.push(
			createAction({
				action: `Autoriza Solicitud Afiliación ${desc}`,
				request: "A",
				tarea: "Consultas_AfiliacionesPorEmpresaAutoriza",
				onExecute: async () => {
					await afiliacionesPorEmpresaRequest("patchEstados", {
						action: "Autoriza",
						record: afiliacionPorEmpresaSelected,
						params: {
							solicitudId: afiliacionPorEmpresaSelected?.id, // ID de la solicitud a actualizar
						}, // Parámetros para la consulta
						config: {
							body: {
								estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Autorizada")?.value,
								estadoSolicitudObservaciones: "sin observaciones",
								estadoSolicitudUsuario: Usuario?.id,
								estadoFecha: new Date().toISOString()
							}, // Cuerpo de la solicitud PATCH
						},
					});
					accionesAceptar();
				},

				record: {},
				...(!afiliacionPorEmpresaSelected?.id || afiliacionPorEmpresaSelected?.estado !== "Pendiente"
					? { disabled: true }
					: {
						disabled: false,
						keys: "a",
						underlineindex: 0,
					}),
			})
		);
		actions.push(
			createAction({
				action: `Descarga Formulario de Afiliaciones ${desc}`,
				onExecute: () => {
					documentacionChanger("downloadFirstFile", {
						clear: !afiliacionPorEmpresaSelected?.id,
						params: { entidadTipo: "E", entidadId: afiliacionPorEmpresaSelected?.id, soloactivos: true },
					});
				},
				request: "D",
				record: {},
				tarea: "Consultas_AfiliacionesPorEmpresaDescarga",
				...(!afiliacionPorEmpresaSelected?.id || afiliacionPorEmpresaSelected?.estado !== "Autorizada"
					? { disabled: true }
					: {
						disabled: false,
						keys: "d",
						underlineindex: 0,
					}),
			})
		);

		actions.push(
			createAction({
				action: `Rechaza Solicitud Afiliación ${desc}`,
				request: "R",
				record: {},
				tarea: "Consultas_AfiliacionesPorEmpresaRechaza",
				onExecute: () => {
					afiliacionesPorEmpresaRequest("patchEstados", {
						action: "Rechaza",
						record: afiliacionPorEmpresaSelected,
						params: {
							solicitudId: afiliacionPorEmpresaSelected?.id, // ID de la solicitud a actualizar
						}, // Parámetros para la consulta
						config: {
							body: {
								estadoSolicitudId: estadoSelect?.options.find((o) => o?.label === "Rechazada")?.value,
								estadoSolicitudObservaciones: "sin observaciones",
								estadoSolicitudUsuario: Usuario?.id,
								estadoFecha: new Date().toISOString()
							}, // Cuerpo de la solicitud PATCH
						},
					});
					accionesRechazar();
				},
				...(!afiliacionPorEmpresaSelected?.id || afiliacionPorEmpresaSelected?.estado !== "Pendiente"
					? { disabled: true }
					: {
							disabled: false,
							keys: "r",
							underlineindex: 0,
					  }),
				})
			);

			//Modificacion Mauro
			actions.push(
			  createAction({
				name: "Informe",
				onExecute: () => setShowInforme(true),
				combination: "AltKey",
				tarea: "Consultas_AfiliacionesPorEmpresaInforme",
				keys: "i",
				underlineindex: 0,
			  })
			);


		setAfiliacionesPorEmpresaActions(actions); //cargo todas las acciones / botones
	}, [afiliacionesPorEmpresaRequest, afiliacionPorEmpresaSelected]);






	tabs.push({
		header: () => <Tab label="Solicitudes de Afiliación" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />

				<Grid gap="inherit" justify="end" >
					<Grid grid="auto / 200px 200px 220px 220px 180px 180px" gap="inherit" >
						<InputMaterial
							label="CUIT Empresa"
							value={paramsEdit.empresaCUIT ?? ""}
							placeholder="Sólo números"
							onChange={(v) => {
								const onlyDigits = String(v || "").replace(/\D/g, "");
								setParamsEdit((o) => {
									const n = { ...o };
									if (onlyDigits) n.empresaCUIT = onlyDigits;
									else delete n.empresaCUIT;
									return n;
								});
							}}
						/>

						<SearchSelectMaterial
							label="Seccional"
							error={!!seccionalSelect.error}
							helperText={seccionalSelect.loading ?? seccionalSelect.error}
							value={seccionalSelect.selected}
							onChange={(selected = {}) => {
								setSeccionalSelect((o) => ({ ...o, selected, origen: "option" }));
								setParamsEdit((o) => {
									const n = { ...o };
									if (selected === seccionalTodos || selected?.value == null)
										delete n.seccionalId;
									else n.seccionalId = selected.value;
									return n;
								});
							}}
							options={seccionalSelect.options}
							onTextChange={(buscar) =>
								setSeccionalSelect((o) => ({ ...o, buscar, origen: "text" }))
							}
						/>

						<SearchSelectMaterial
							label="Estado"
							error={!!estadoSelect.error}
							helperText={
								estadoSelect.loading ??
								estadoSelect.error
							}
							value={estadoSelect.selected}
							onChange={(selected = {}) => {
								setEstadoSelect((o) => ({
									...o,
									selected,
									origen: "option",
								}));
								setParamsEdit((o) => {
									const estadoSolicitudId = selected.value;
									const paramsEdit = { ...o, estadoSolicitudId };
									if (selected === estadosTodos) delete paramsEdit.estadoSolicitudId;
									return paramsEdit;
								});
							}}
							options={estadoSelect.options}
							onTextChange={(buscar) =>
								setEstadoSelect((o) => ({
									...o,
									buscar,
									origen: "text",
								}))
							}
						/>
						{/* Fecha desde */}
						<InputMaterial
							label="Fecha desde"
							type="date"
							value={paramsEdit.fechaDesde ?? ""}
							onChange={(e) => {
								const value = e?.target?.value || e || "";
								setParamsEdit((o) => {
									const n = { ...o };
									if (value) n.fechaDesde = value;
									else delete n.fechaDesde;
									return n;
								});
							}}
						/>

						{/* Fecha hasta */}
						<InputMaterial
							label="Fecha hasta"
							type="date"
							value={paramsEdit.fechaHasta ?? ""}
							onChange={(e) => {
								const value = e?.target?.value || e || "";
								setParamsEdit((o) => {
									const n = { ...o };
									if (value) n.fechaHasta = value;
									else delete n.fechaHasta;
									return n;
								});
							}}
						/>
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

								setEstadoSelect((o) => ({ ...o, selected: estadosTodos }));
								setSeccionalSelect((o) => ({ ...o, selected: seccionalTodos }));

								if (JSON.stringify(paramsEdit) === JSON.stringify(paramsSend))
									return;
								setParamsSend({ ...paramsEdit });
							}}
						>
							Limpia filtro
						</Button>
					</Grid>
				</Grid>
				{afiliacionesPorEmpresaRender()}
			</Grid>
		),
		actions: afiliacionesPorEmpresaActions,
	});

	//Carga de lista según parametros
	useEffect(() => {
		afiliacionesPorEmpresaRequest("list", {
			params: paramsSend,
			pagination: { index: 1, size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		});
	}, [afiliacionesPorEmpresaRequest, paramsSend]);
	//#endregion


	//#region Tab DETALLE
	const [detalleTab, detalleChanger, detalleSelected] = useAfiliacionesPorEmpresaDetalle();
	const [detalleActions, setDetalleActions] = useState([]);

	tabs.push({
		header: () => <Tab label="Detalle de Solicitud de Afiliación" disabled={!afiliacionPorEmpresaSelected || afiliacionPorEmpresaSelected.deletedDate} />,
		body: detalleTab,
		actions: detalleActions,
	});

	// Si cambia delegación, refresco lista de documentación
	useEffect(() => {
		detalleChanger("list", {
			clear: !afiliacionPorEmpresaSelected?.id,
			params: { SolicitudAfiliacionEmpresasId: afiliacionPorEmpresaSelected?.id },
		});
	}, [afiliacionPorEmpresaSelected?.id, detalleChanger]);
	//#endregion

	//#region Tab Documentacion
	const [documentacionTab, documentacionChanger, documentacionSelected] = useDocumentaciones();
	const [documentacionActions, setDocumentacionesActions] = useState([]);

	useEffect(() => {
		const actions = [];
		const dele = afiliacionPorEmpresaSelected?.id;
		if (!dele) {
			setDocumentacionesActions(actions);
			return;
		}
		const deleDesc = `para Solicitud ${dele}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "E", entidadId: afiliacionPorEmpresaSelected?.id, soloactivos: true },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Formulario ${deleDesc}`,
				request: "A",
				tarea: "Consultas_AfiliacionesDocumentacionAgrega",
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
				action: `Consulta Formulario ${docuDesc}`,
				request: "C",
				tarea: "Consultas_AfiliacionesDocumentacionConsulta",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Formulario ${docuDesc}`,
				request: "M",
				tarea: "Consultas_AfiliacionesDocumentacionModifica",
				keys: "m",
				underlineindex: 0,
				...(documentacionSelected?.deletedDate ?
					{ disabled: true }
					:
					{
						disabled: false,
					}
				)
			})
		);
		actions.push(
			createAction({
				action: `Baja Formulario ${docuDesc}`,
				request: "B",
				tarea: "Consultas_AfiliacionesDocumentacionBaja",
				keys: "b",
				underlineindex: 0,
				...(documentacionSelected?.deletedDate ?
					{ disabled: true }
					:
					{
						disabled: false,
					}
				)
			})
		);
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, afiliacionPorEmpresaSelected?.id]);

	tabs.push({
		header: () => <Tab label="Formularios" disabled={!afiliacionPorEmpresaSelected || afiliacionPorEmpresaSelected.deletedDate || afiliacionPorEmpresaSelected?.estado !== "Autorizada"} />,
		body: documentacionTab,
		actions: documentacionActions,
	});

	// Si cambia delegación, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !afiliacionPorEmpresaSelected?.id,
			params: { entidadTipo: "E", entidadId: afiliacionPorEmpresaSelected?.id, soloactivos: true },
		});
	}, [afiliacionPorEmpresaSelected?.id, documentacionChanger]);
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "AfiliacionesPorEmpresa", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Solicitudes de Afiliacion Por Empresa</h1>
			</Grid>

			<div className="tabs">
				<text>
					{afiliacionPorEmpresaSelected?.nombre
						? `(${Formato.Cuit(afiliacionPorEmpresaSelected?.empresaCUIT)}  |  ${afiliacionPorEmpresaSelected?.empresaDescripcion})`
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

			{/* Modificacion Mauro */}
			{/* Modal del Informe  */}
      		{showInforme && <ExcelDatos onClose={() => setShowInforme(false)} />}

		</Grid>
	);
};

export default AfiliacionesPorEmpresaHandler;