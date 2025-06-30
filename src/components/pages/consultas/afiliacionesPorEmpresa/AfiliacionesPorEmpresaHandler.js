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
	
	const Usuario = useContext(AuthContext).usuario;

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Formularios Params
	const [paramsEdit, setParamsEdit] = useState({});
	const [paramsSend, setParamsSend] = useState({});
	//#endregion


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
	// Buscador
	useEffect(() => {
		setEstadoSelect((o) => ({
			...o,
			options: estadosSelectOptions(o),
		}));
	}, [estadoSelect.buscar, estadoSelect.data]);
	//#endregion select estadoSeccional

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

	useEffect(() => {
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
		const desc =afiliacionPorEmpresaSelected?.id;
		console.log("afiliacionPorEmpresaSelected",afiliacionPorEmpresaSelected)
		actions.push(
			createAction({
				action: `Autoriza Solicitud Afiliación ${desc}`,
				request: "A",
				tarea: "Consultas_AfiliacionesPorEmpresaAutoriza",
				onExecute: () => afiliacionesPorEmpresaRequest("patchEstados", {
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
				}),
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
				request: "D",
				record: {},
				tarea: "Consultas_AfiliacionesPorEmpresaDescarga",
				...(!afiliacionPorEmpresaSelected?.id || afiliacionPorEmpresaSelected?.estado !== "Autorizada" || 1==1 //QUITAR EL 1==1 cuando se implemente la descarga
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
					onExecute: () => afiliacionesPorEmpresaRequest("patchEstados", {
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
				}),
				...(!afiliacionPorEmpresaSelected?.id || afiliacionPorEmpresaSelected?.estado !== "Pendiente"
					? { disabled: true }
					: {
							disabled: false,
							keys: "r",
							underlineindex: 0,
					  }),
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
					<Grid grid="auto / 200px 200px" gap="inherit" >
								{/*
								<InputMaterial
									label="CUIT"
									value={paramsEdit.empresaCUIT}
									onChange={(empresaCUIT) =>
										setParamsEdit((o) => {
											const paramsEdit = { ...o, empresaCUIT };
											if (!empresaCUIT) delete paramsEdit.empresaCUIT;
											return paramsEdit;
										})
									}
								/>
								<InputMaterial
									label="Razón Social"
									value={paramsEdit.empresaDescripcion}
									onChange={(empresaDescripcion) =>
										setParamsEdit((o) => {
											const paramsEdit = { ...o, empresaDescripcion };
											if (!empresaDescripcion) delete paramsEdit.empresaDescripcion;
											return paramsEdit;
										})
									}
								/>*/}
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
			params: { SolicitudAfiliacionEmpresasId: afiliacionPorEmpresaSelected?.id},
		});
	}, [afiliacionPorEmpresaSelected?.id, detalleChanger]);
	//#endregion

//#region Tab DETALLE
	const [documentacionTab, documentacionChanger, documentacionSelected] = useDocumentaciones();
	const [documentacionActions, setDocumentacionActions] = useState([]);
	
	tabs.push({
		header: () => <Tab label="Documentación" disabled={true/*!afiliacionPorEmpresaSelected || afiliacionPorEmpresaSelected.deletedDate*/} />,
		body: documentacionTab,
		actions: documentacionActions,
	});

	// Si cambia delegación, refresco lista de documentación
	useEffect(() => {
		detalleChanger("list", {
			clear: !afiliacionPorEmpresaSelected?.id,
			params: { SolicitudAfiliacionEmpresasId: afiliacionPorEmpresaSelected?.id},
		});
	}, [afiliacionPorEmpresaSelected?.id, detalleChanger]);
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
		</Grid>
	);
};

export default AfiliacionesPorEmpresaHandler;
