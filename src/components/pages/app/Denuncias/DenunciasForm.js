import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import Formato from "components/helpers/Formato";
import useQueryState from "components/hooks/useQueryState";
import useHttp from "components/hooks/useHttp";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, {
	CUITMask,
} from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	mapOptions,
	includeSearch,
} from "components/ui/Select/SearchSelectMaterial";
import ValidarCUIT from "components/validators/ValidarCUIT";
import ValidarEmail from "components/validators/ValidarEmail";
import Table from "components/ui/Table/Table";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";

import { Tabs, Tab } from "@mui/material";
import Documentacion from "components/documentacion/Documentacion";
import useTareasUsuario from "components/hooks/useTareasUsuario";

const styles = {
	group: {
		padding: "5px",
		color: "#186090",
		textAlign: "left",
		border: "solid 1px",
		borderRadius: "20px",
	},
	titulo: {
		fontWeight: "bold",
		textAlign: "left",
		borderBottom: "dashed 1px",
	},
};

//#region options
const toInputString = (v) => {
	if (typeof v === "string" || typeof v === "number") return String(v);
	if (v && typeof v === "object") {
		if (v.value != null) return String(v.value);
		if (v.target && v.target.value != null) return String(v.target.value);
	}
	return "";
};

const onlyDigits = (v) => toInputString(v).replace(/\D+/g, "");

//#region seccionalesSelect Options
const seccionalSelectDef = {};
const seccionalesSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: [r.codigo, r.descripcion].join(" - "), record: r }),
		filter: (r) => includeSearch(r, buscar),
		start: [seccionalSelectDef],
		...x,
	});
//#endregion seccionalesSelect Options


//#region provinciaSelect Options
const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: [r.id, r.nombre].join(" - "), record: r }),
		// Excluir la opción con id = 0 (NO ESPECIFICADO) para evitar que sea elegible
		filter: (r) => (r?.value ?? 0) !== 0 && includeSearch(r, buscar),
		...x,
	});
//#endregion provinciaSelect Options

//#region delegacionSelect Options
const delegacionSelectTodos = { value: 0, label: "Todas" };
const delegacionSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		filter: (r) => includeSearch(r, buscar),
		start: data.length === 1 ? [] : [delegacionSelectTodos],
		...x,
	});
//#endregion delegacionSelect Options

//#region localidadSelect Options
const localidadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.codPostal, r.nombre].join(" - "),
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion localidadSelect Options

//#region ciiuSelect Options
const ciiuSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.ciiu, r.descripcion].join(" - "),
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion ciiuSelect Options



//#endregion options

const DenunciasForm = ({ data = {}, readOnly = false, onClose = () => { }, initialTab = 0, mode = "A" }) => {

	// Permisos por tareas
	const tareas = useTareasUsuario();
	const puedeVerDatos = tareas?.hasTarea?.("Denuncias_Datos") ?? false;
	const ocultarDatosSensibles = (mode === "C" || mode === "M") && !puedeVerDatos;

	const [selectedTab, setSelectedTab] = useState(initialTab);
	const handleChangeTab = (_e, v) => {
		//"Novedades"
		if ((disableNovedades || mode === "A") && v === 2) return;
		setSelectedTab(v);
	};

	const [disableNovedades, setDisableNovedades] = useState(mode === "A");

	const roStyle = (isRestricted) => (isRestricted ? { opacity: 0.6 } : undefined);
	const isConsulta = mode === "C"; 

	useEffect(() => {
		// Si entramos en alta, mantener deshabilitada la pestaña Novedades
		if (mode === "A") setDisableNovedades(true);
	}, [mode]);



	//#region APIs
	const { setState: setSeccionalesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" }, params: { soloActivos: true } } }
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
		{ query: { params: { soloActivos: true }, config: { errorType: "response" } } }
	);
	// Catálogo: DenunciaTipo (para "Tipo de Ingreso")
	const { setState: setDenunciaTipoQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: `/DenunciaTipoIngreso`, method: "GET" },
		}),
		{ query: { config: { errorType: "response" } } }
	);

	// Catálogo: DenunciaSituacion (para "Situación")
	const { setState: setDenunciaSituacionQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: `/DenunciaSituacion`, method: "GET" },
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const { state: padronAFIPQuery, setState: setPadronAFIPQuery } =
		useQueryState(
			() => ({
				config: {
					baseURL: "Comunes",
					endpoint: `/AFIPConsulta`,
					method: "GET",
				},
			}),
			{
				query: {
					params: { verificarHistorico: false },
					config: { errorType: "response" },
				},
			}
		);


	const { setState: setCreateAppDenunciaQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: `/AppDenuncias`, method: "POST" },
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const { sendRequest } = useHttp();


	// 3) Alta de Estado de la denuncia
	const { setState: setCreateEstadoQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: "/DenunciasEstados", method: "POST" }
		}),
		{ query: { config: { errorType: "response" } } }
	);

	// GET: Estados de una denuncia (por appDenunciasId)
	const { setState: setGetEstadosQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: "/DenunciasEstados", method: "GET" },
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const [documentacionList, setDocumentacionList] = useState([]);
	const [estadosList, setEstadosList] = useState([]);
	const [selectedEstado, setSelectedEstado] = useState(null);
	// Cuando en Modificar se cambia manualmente el estado, mantener documentación vacía hasta que el usuario suba archivos
	const [overrideDocsPorNuevoEstado, setOverrideDocsPorNuevoEstado] = useState(false);
	const [docsByEstadoId, setDocsByEstadoId] = useState({});
	const { setState: setDocumentosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/DocumentacionEntidad/GetBySpec`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const loadDocumentacion = useCallback((entidadId) => {
		if (!entidadId) {
			setDocumentacionList([]);
			return;
		}
		setDocumentosQuery(o => ({
			...o,
			query: { ...o.query, params: { EntidadId: entidadId, EntidadTipo: "R" } },
			onLoad: ({ ok, error }) => {
				const arr = (Array.isArray(ok) ? ok : []).map(d => ({ ...d, originalEntidadId: d.entidadId ?? d.EntidadId }));
				setDocumentacionList(arr);
				if (error) console.error("DocumentacionEntidad/GetBySpec error:", error);
			}
		}));
	}, [setDocumentosQuery]);

	// Carga documentación sólo a la caché docsByEstadoId sin alterar documentacionList (para combinaciones)
	const loadDocumentacionCacheOnly = useCallback((entidadId) => {
		if (!entidadId) return;
		if (docsByEstadoId[entidadId]) return; // ya en cache
		sendRequest(
			{
				baseURL: "Comunes",
				endpoint: `/DocumentacionEntidad/GetBySpec?EntidadId=${entidadId}&EntidadTipo=R`,
				method: "GET",
				errorType: "response",
			},
			(ok) => {
				const arr = (Array.isArray(ok) ? ok : []).map(d => ({ ...d, originalEntidadId: d.entidadId ?? d.EntidadId }));
				setDocsByEstadoId(prev => ({ ...prev, [entidadId]: arr }));
			},
			() => setDocsByEstadoId(prev => ({ ...prev, [entidadId]: [] }))
		);
	}, [sendRequest, docsByEstadoId]);

	//#endregion APIs

	const [state, setState] = useState({
		form: {
			fecha: dayjs().format("YYYY-MM-DD"),
			derivadaA: "Sin derivacion",
			derivadaADescripcion: "Sin derivacion",
		},
		validado: {
			seccionalId: false,
			fecha: true,
			trabajador: false,
			empleador: false,
		},
		errors: {},
		loading: null,
		base64: null,
	});


	// Cargar últimos estados de la denuncia (para prefill de Estado y Observaciones)
	useEffect(() => {
		const entidadId = data?.id ?? 0;
		if (!entidadId) return;
		setGetEstadosQuery((o) => ({
			...o,
			query: { ...o.query, params: { appDenunciasId: entidadId } },
			onPreLoad: () => { },
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : [];
				try {
					const sorted = arr.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
					setEstadosList(sorted);
				} catch (e) {
					setEstadosList(arr);
				}
				if (arr.length) {

					const sorted = arr.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
					const last = sorted[sorted.length - 1] || arr[arr.length - 1];
					setState((s) => ({
						...s,
						form: {
							...s.form,
							estado: last?.estado || s.form.estado,
							// En modo M NO prellenar observaciones; en otros modos sí
							observacionesRegistro:
								(mode === "M")
									? ""
									: (last?.observaciones ?? s.form.observacionesRegistro),
						},
					}));
					// Cargar documentación inicial SIEMPRE
					const estadoId = Number(last?.id ?? last?.Id ?? 0);
					loadDocumentacion(estadoId || entidadId);
				} else {
					loadDocumentacion(entidadId);
				}
				if (error) console.error("DenunciasEstados GET error:", error);
			},


		}));
	}, [data?.id, setGetEstadosQuery, mode, loadDocumentacion]);
	// Cuando cambia la lista de estados, precargar la documentación de cada estado para poder duplicar filas por archivo
	useEffect(() => {
		if (!Array.isArray(estadosList) || estadosList.length === 0) return;
		const ids = estadosList
			.map(e => Number(e?.id ?? e?.Id ?? 0))
			.filter((id) => Number.isFinite(id) && id > 0);
		ids.forEach((id) => {
			if (docsByEstadoId[id]) return;
			// Traer documentación de ese estado
			sendRequest(
				{
					baseURL: "Comunes",
					endpoint: `/DocumentacionEntidad/GetBySpec?EntidadId=${id}&EntidadTipo=R`,
					method: "GET",
					errorType: "response",
				},
				(ok) => {
					const arr = (Array.isArray(ok) ? ok : []).map(d => ({ ...d, originalEntidadId: d.entidadId ?? d.EntidadId }));
					setDocsByEstadoId((prev) => ({ ...prev, [id]: arr }));
				},
				() => setDocsByEstadoId((prev) => ({ ...prev, [id]: [] }))
			);
		});
	}, [estadosList, sendRequest, docsByEstadoId]);

	// Dataset para la grilla de Novedades: una fila por documento (o una vacía si no hay)
	const novedadesRows = useMemo(() => {
		const out = [];
		(Array.isArray(estadosList) ? estadosList : []).forEach((estado, eIndex) => {
			const estadoId = Number(estado?.id ?? estado?.Id ?? 0) || 0;
			const docs = docsByEstadoId[estadoId];
			if (Array.isArray(docs) && docs.length) {
				docs.forEach((doc, dIndex) => {
					out.push({
						...estado,
						_doc: doc,
						rowKey: `${estadoId}-${dIndex}`,
					});
				});
			} else {
				out.push({ ...estado, _doc: null, rowKey: `${estadoId}-0-${eIndex}` });
			}
		});
		return out;
	}, [estadosList, docsByEstadoId]);

	//  Filtros de Novedades
	const estadoTodosOption = useMemo(() => ({ label: "Todos los estados" }), []);
	const [novEstadoSelect, setNovEstadoSelect] = useState({
		buscar: "",
		data: [
			{ value: "Registrada", label: "Registrada" },
			{ value: "Completada", label: "Completada" },
			{ value: "Derivada", label: "Derivada" },
			{ value: "En Planificacion", label: "En Planificacion" },
			{ value: "Gestion con Empleador", label: "Gestion con Empleador" },
			{ value: "Inspeccionada", label: "Inspeccionada" },
			{ value: "Relevamiento App", label: "Relevamiento App" },
			{ value: "Finalizada", label: "Finalizada" },
		],
		options: [],
		selected: estadoTodosOption,
		error: null,
		loading: null,
		origen: "",
	});

	useEffect(() => {
		const options = mapOptions({
			data: novEstadoSelect.data,
			map: (r) => ({ value: r.value, label: r.label, record: r }),
			start: [estadoTodosOption],
			filter: (r) => r.label.toLowerCase().includes((novEstadoSelect.buscar || "").toLowerCase()),
		});
		setNovEstadoSelect((s) => ({ ...s, options }));
	}, [novEstadoSelect.buscar, novEstadoSelect.data, estadoTodosOption]);

	const [novFechaDesde, setNovFechaDesde] = useState(null);
	const [novFechaHasta, setNovFechaHasta] = useState(null);

	const novedadesFilteredRows = useMemo(() => {
		let rows = Array.isArray(novedadesRows) ? [...novedadesRows] : [];
		const selEstado = novEstadoSelect?.selected?.value || null;
		if (selEstado) rows = rows.filter(r => (r?.estado ?? "") === selEstado);
		const toDayValue = (d) => {
			const m = dayjs(d);
			return m.isValid() ? m.startOf('day').valueOf() : NaN;
		};
		if (novFechaDesde) {
			const dFrom = toDayValue(novFechaDesde);
			rows = rows.filter(r => {
				const rf = toDayValue(r?.fecha);
				return !Number.isNaN(rf) && rf >= dFrom;
			});
		}
		if (novFechaHasta) {
			const dTo = toDayValue(novFechaHasta);
			rows = rows.filter(r => {
				const rf = toDayValue(r?.fecha);
				return !Number.isNaN(rf) && rf <= dTo;
			});
		}
		return rows;
	}, [novedadesRows, novEstadoSelect?.selected?.value, novFechaDesde, novFechaHasta]);

	const selectedKeys = useMemo(() => {
		if (!selectedEstado) return [];
		const exists = (Array.isArray(novedadesFilteredRows) ? novedadesFilteredRows : [])
			.some(r => r && r.rowKey === selectedEstado.rowKey);
		return exists ? [selectedEstado.rowKey] : [];
	}, [selectedEstado, novedadesFilteredRows]);

	useEffect(() => {
		if (!selectedEstado) return;
		const filtered = Array.isArray(novedadesFilteredRows) ? novedadesFilteredRows : [];
		const exists = filtered.some(r => r && r.rowKey === selectedEstado.rowKey);
		if (exists) return;
		
		const selId = Number(selectedEstado?.id ?? selectedEstado?.Id ?? 0) || 0;
		if (selId) {
			const sameIdRow = filtered.find(r => Number(r?.id ?? r?.Id ?? 0) === selId);
			if (sameIdRow) {
				setSelectedEstado(sameIdRow);
				return;
			}
		}

		setSelectedEstado(filtered[0] || null);
	}, [novedadesFilteredRows, selectedEstado]);

	
	useEffect(() => {
		if (!(mode === "C" || mode === "M")) return;
		if (mode === "M" && overrideDocsPorNuevoEstado) return; 
		if (selectedEstado) return; 
		const filtroActivo = !!(novEstadoSelect?.selected?.value) || !!novFechaDesde || !!novFechaHasta;
		if (filtroActivo) return; 
		if (!novedadesRows.length || !estadosList.length) return;
		let last = null;
		try {
			last = estadosList.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).at(-1) || null;
		} catch {
			last = estadosList.at(-1) || null;
		}
		const lastId = Number(last?.id ?? last?.Id ?? 0);
		if (!lastId) return;
		const row = novedadesRows.find(r => Number(r?.id ?? r?.Id ?? 0) === lastId);
		if (!row) return;
		setSelectedEstado(row);
		// No llamar a loadDocumentacion aquí; el efecto de combinación se encargará
	}, [mode, selectedEstado, novedadesRows, estadosList, novEstadoSelect?.selected?.value, novFechaDesde, novFechaHasta, overrideDocsPorNuevoEstado]);

	const combineDocsForEstadoNombre = useCallback((estadoNombre, fallbackEntidadId) => {
		if (!estadoNombre) {
			if (fallbackEntidadId) loadDocumentacion(fallbackEntidadId);
			return;
		}
		const mismosIds = (Array.isArray(estadosList) ? estadosList : [])
			.filter(e => (e?.estado ?? "") === estadoNombre)
			.map(e => Number(e?.id ?? e?.Id ?? 0))
			.filter(id => Number.isFinite(id) && id > 0);
		mismosIds.forEach(id => { if (!docsByEstadoId[id]) loadDocumentacionCacheOnly(id); });
		let combinados = mismosIds.flatMap(id => Array.isArray(docsByEstadoId[id]) ? docsByEstadoId[id] : []);
		const seen = new Set();
		combinados = combinados.filter(d => {
			const key = (d.id ? `ID-${d.id}` : `FN-${(d.nombreArchivo||d.fileName||'').trim()}`);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
		if (combinados.length) {
			setDocumentacionList(combinados);
			return;
		}
		if (fallbackEntidadId && Array.isArray(docsByEstadoId[fallbackEntidadId]) && docsByEstadoId[fallbackEntidadId].length) {
			setDocumentacionList(docsByEstadoId[fallbackEntidadId]);
			return;
		}
		if (fallbackEntidadId && !docsByEstadoId[fallbackEntidadId]) {
			loadDocumentacion(fallbackEntidadId);
		}
	}, [estadosList, docsByEstadoId, loadDocumentacionCacheOnly, loadDocumentacion]);

	useEffect(() => {
		if (mode === "A") {
			const entidadIdAlta = Number(selectedEstado?.id ?? selectedEstado?.Id ?? 0) || 0;
			if (selectedEstado && entidadIdAlta) loadDocumentacion(entidadIdAlta);
			return;
		}
		if ((mode === "M") && overrideDocsPorNuevoEstado) return;
		const estadoNombre = (selectedEstado?.estado ?? (mode === "M" ? state.form?.estado : "")) || "";
		const fallbackEntidadId = Number(selectedEstado?.id ?? selectedEstado?.Id ?? 0) || 0;
		if (!estadoNombre && !fallbackEntidadId) return;
		combineDocsForEstadoNombre(estadoNombre, fallbackEntidadId);
	}, [mode, selectedEstado, state.form?.estado, docsByEstadoId, overrideDocsPorNuevoEstado, combineDocsForEstadoNombre, loadDocumentacion]);

	const NovedadesPanel = (
		<Grid full col gap="10px">
			<Grid grid="auto / 1fr 180px 180px 150px" gap="inherit">
				<SearchSelectMaterial
					label="Estado de Denuncia"
					error={!!novEstadoSelect.error}
					helperText={novEstadoSelect.loading ?? novEstadoSelect.error}
					value={novEstadoSelect.selected}
					onChange={(selected = {}) => setNovEstadoSelect(o => ({ ...o, selected, origen: 'option' }))}
					options={novEstadoSelect.options}
					onTextChange={(buscar) => setNovEstadoSelect(o => ({ ...o, buscar, origen: 'text' }))}
					freeSolo={false}
					inputReadOnly={true}
				/>
				<DateTimePicker
					type="date"
					label="Fecha Desde"
					value={novFechaDesde}
					onChange={setNovFechaDesde}
					format="YYYY-MM-DD"
				/>
				<DateTimePicker
					type="date"
					label="Fecha Hasta"
					value={novFechaHasta}
					onChange={setNovFechaHasta}
					format="YYYY-MM-DD"
				/>
				<Button
					className="botonAzul"
					disabled={!novEstadoSelect.selected?.value && !novFechaDesde && !novFechaHasta}
					onClick={() => {
						setNovEstadoSelect(o => ({ ...o, selected: estadoTodosOption, buscar: "" }));
						setNovFechaDesde(null);
						setNovFechaHasta(null);
					}}
				>
					Limpia filtros
				</Button>
			</Grid>

			<Table
				keyField="rowKey"
				data={novedadesFilteredRows}
				mostrarBuscar={false}
				pagination={{ size: 10 }}
				noDataIndication={novedadesFilteredRows.length === 0 ? "No existen novedades para mostrar" : null}
				selection={{
					mode: "radio",
					clickToSelect: true,
					hideSelectColumn: true,
					selected: selectedKeys,
					onSelect: (row) => {
						setSelectedEstado(row);
						setOverrideDocsPorNuevoEstado(false);
						if (mode === "C" || mode === "M") {
							const estadoNombre = row?.estado ?? "";
							if (estadoNombre) {
								const mismos = (Array.isArray(estadosList) ? estadosList : [])
									.filter(e => (e?.estado ?? "") === estadoNombre)
									.map(e => Number(e?.id ?? e?.Id ?? 0))
									.filter(id => Number.isFinite(id) && id > 0);
								mismos.forEach(id => {
									if (!docsByEstadoId[id]) {
										loadDocumentacionCacheOnly(id);
									}
								});
								const combinados = mismos.flatMap(id => Array.isArray(docsByEstadoId[id]) ? docsByEstadoId[id] : []);
								setDocumentacionList(combinados);
								return;
							}
						}
						const entidadId = Number(row?.id ?? row?.Id ?? 0);
						if (entidadId) loadDocumentacion(entidadId);
					},
				}}
				columns={[
					{ dataField: "fecha", text: "Fecha", formatter: (v) => Formato.Fecha(v) },
					{ dataField: "estado", text: "Estado", sort: true, style: { textAlign: "left" } },
					{ dataField: "observaciones", text: "Observaciones", style: { textAlign: "left" }, formatter: (v) => {
						if (!v) return "";
						return String(v);
					}},

					{
						dataField: "documento",
						text: "Documento",
						isDummyField: true,
						formatter: (_c, row) => {
							const doc = row?._doc;
							if (!doc) return "";
							//Tipo doc
							const tipo =
								doc?.refTipoDocumentacion ??
								"";
							return String(tipo || "");
						},
						headerStyle: { width: "220px", textAlign: "center" },
						style: { textAlign: "left" },
					},

				]}
			/>
		</Grid>
	);

	// Mapeo documentacion
	const compact = (obj) => Object.fromEntries(
		Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
	);

	const mapDocToPayload = (item, entidadId, entidadTipo) => {

		const refTipoDocumentacionId =
			item?.refTipoDocumentacionId ??
			item?.tipoDocumentacionId ??
			item?.tipoId;

		const rawBase64 = (
			item?.archivo ??
			item?.archivoBase64 ??
			item?.base64 ??
			item?.contenido ??
			""
		).toString().replace(/^data:.*;base64,/, "");



		const resolvedEntidadId = (item?.id && (item?.originalEntidadId || item?.entidadId))
			? (item.originalEntidadId || item.entidadId)
			: entidadId;

		const payload = {
			id: item?.id,
			entidadId: resolvedEntidadId,
			entidadTipo,
			refTipoDocumentacionId,
			refTipoDocumentacionDescripcion: item?.refTipoDocumentacionDescripcion,
			descripcion: item?.descripcion || item?.observaciones,
			observaciones: item?.observaciones,
			fechaVencimiento: item?.fechaVencimiento,
			nombreArchivo: item?.nombreArchivo ?? item?.fileName,
			archivo: rawBase64,
			contentType: item?.contentType || "application/octet-stream",
			url: item?.url,
		};

		const result = compact(payload);

		if (item?.originalEntidadId != null) {
			result.originalEntidadId = item.originalEntidadId;
		}



		return result;
	};

	//#region selects


	const isPersistingDocsRef = useRef(false);
	const persistirDocumentacion = async (entidadId, opts = {}) => {
		const { onlyNew = false } = opts;
		if (isPersistingDocsRef.current) {
			console.warn('[persistirDocumentacion] llamado ignorado: ya está en curso');
			return;
		}
		isPersistingDocsRef.current = true;
		const entidadTipo = "R";
		let lista = Array.isArray(documentacionList) ? documentacionList : [];

		if (onlyNew) {
			lista = lista.filter(d => !d.id);
		}

		const seen = new Set();
		lista = lista.filter(doc => {
			const isNew = !doc.id;
			const nombre = (doc.nombreArchivo || doc.fileName || "").trim();
			const contentType = (doc.contentType || "").trim();
			const raw = (doc.archivo || doc.archivoBase64 || doc.base64 || "").toString().replace(/^data:.*;base64,/, "");
			const size = raw.length;
			const key = isNew ? `${nombre}@@${size}@@${contentType}` : `EXISTING-${doc.id}`;
			if (seen.has(key)) {
				console.warn('[persistirDocumentacion] Documento duplicado ignorado:', { nombre, size, contentType });
				return false;
			}
			seen.add(key);
			return true;
		});



		if (lista.length === 0) {

			isPersistingDocsRef.current = false;
			return;
		}

		for (let i = 0; i < lista.length; i++) {
			const item = lista[i];
			const payload = mapDocToPayload(item, entidadId, entidadTipo);

			if (payload.id) {
				sendRequest(
					{ baseURL: "Comunes", endpoint: `/DocumentacionEntidad/${payload.id}`, method: "PUT", body: payload, errorType: "response" },
					() => { },
					(err) => { console.error(` Error al actualizar archivo ${item.nombreArchivo}:`, err); }
				);
			} else {
				sendRequest(
					{ baseURL: "Comunes", endpoint: `/DocumentacionEntidad`, method: "POST", body: payload, errorType: "response" },
					({ ok }) => {
						if (ok?.id || ok?.Id) {
							const nuevo = [...lista];
							nuevo[i] = { ...item, id: ok.id ?? ok.Id };
							setDocumentacionList(nuevo);
							setState(s => ({ ...s, form: { ...s.form, documentacion: nuevo } }));
						}
					},
					(err) => { console.error(` Error al crear archivo ${item.nombreArchivo}:`, err); }
				);
			}
		}
		isPersistingDocsRef.current = false;
	};


	//#region select seccional
	const [seccionalSelect, setSeccionalSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setSeccionalSelect((o) => ({
			...o,
			options: seccionalesSelectOptions(o),
		}));
	}, [seccionalSelect.buscar, seccionalSelect.data]);
	//#endregion select seccional

	//#region select delegacion
	const [delegacionSelect, setDelegacionSelect] = useState({
		reload: true,
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		optionsSrc: [],
		options: [],
		selected: {},
		selectedDef: {},
		origen: "",
	});

	// Valor AUTORITATIVO desde BD para restricciones de "Derivada a"
	const [serverDerivadoATipo, setServerDerivadoATipo] = useState("Sin datos");
	useEffect(() => {

		const rawSource = [
			data?.derivadoATipo,
			data?.derivadaATipo, 
			data?.derivadaA,  
			data?.derivadaADescripcion,
		].map(v => (v == null ? "" : String(v))).find(v => v.trim() !== "") || "";
		const raw = rawSource.trim();
		const norm = !raw || raw === "Sin derivacion" ? "Sin datos" : raw;
		setServerDerivadoATipo(norm);
	}, [data]);

	// Locks para bloquear el campo cuando la denuncia viene derivada a una entidad concreta
	const [lockedDelegacion, setLockedDelegacion] = useState(false);
	const [lockedSeccional, setLockedSeccional] = useState(false);
	// Buscador
	useEffect(() => {
		setDelegacionSelect((o) => ({
			...o,
			options: o.optionsSrc.filter((r) => includeSearch(r, o.buscar)),
		}));
	}, [delegacionSelect.buscar, delegacionSelect.optionsSrc]);

	// Carga inicial delegaciones
	useEffect(() => {
		if (!delegacionSelect.reload) return;
		setDelegacionSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
			data: [],
			optionsSrc: [],
			selected: {},
			selectedDef: {},
			buscar: "",
		}));
		setDelegacionesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setDelegacionSelect((prev) => {
					const n = {
						...prev,
						loading: null,
						data: data,
						error: error?.toString(),
					};
					n.optionsSrc = delegacionSelectOptions(n);
					n.selectedDef = n.optionsSrc.length === 1 ? n.optionsSrc[0] : {};
					n.selected = n.selectedDef;
					return n;
				});
			},
		}));
	}, [delegacionSelect.reload, setDelegacionesQuery]);

	//#endregion select delegacion

	// Cuando cambia la delegación seleccionada, filtrar las seccionales disponibles
	useEffect(() => {
		const delegId = delegacionSelect.selected?.value;
		// si no hay datos de seccionales aún, salir
		if (!Array.isArray(seccionalSelect.data) || seccionalSelect.data.length === 0) return;

		if (!delegId || delegId === 0) {
			// restaurar todas las opciones
			setSeccionalSelect((o) => ({
				...o,
				options: seccionalesSelectOptions(o),
			}));
			return;
		}

		const filtered = seccionalSelect.data.filter((s) => Number(s.refDelegacionId) === Number(delegId));
		const opts = seccionalesSelectOptions({ data: filtered, buscar: seccionalSelect.buscar });
		const nextSelected = opts.length === 1 ? opts[0] : (seccionalSelect.selected?.value ? opts.find((p) => p.value === seccionalSelect.selected.value) ?? seccionalSelect.selected : seccionalSelect.selected);
		setSeccionalSelect((o) => ({ ...o, options: opts, selected: nextSelected }));
		if (opts.length === 1) {
			const sel = opts[0];
			setState((o) => ({ ...o, form: { ...o.form, seccional: sel.record?.descripcion || sel.label } }));
		}
	}, [delegacionSelect.selected, seccionalSelect.data, seccionalSelect.buscar, seccionalSelect.selected]);

	//#region selects trabajad

	//#region select tipo ingreso
	const [tipoIngresoSelect, setTipoIngresoSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});
	useEffect(() => {
		setTipoIngresoSelect(o => ({
			...o,
			options: (o.data || []).map(r => ({ value: r.id, label: r.descripcion, record: r }))
				.filter(opt => includeSearch(opt, o.buscar)),
		}));
	}, [tipoIngresoSelect.buscar, tipoIngresoSelect.data]);

	//#region select situacion tipo
	const [situacionSelect, setSituacionSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});

	// Opciones (map + filtro)
	useEffect(() => {
		setSituacionSelect(o => ({
			...o,
			options: (o.data || [])
				.map(r => ({ value: r.id, label: r.descripcion, record: r }))
				.filter(opt => includeSearch(opt, o.buscar)),
		}));
	}, [situacionSelect.buscar, situacionSelect.data]);

	// Carga inicial del catálogo + preselect por id si viene en `data`
	useEffect(() => {
		setDenunciaSituacionQuery(o => ({
			...o,
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : [];
				setSituacionSelect(s => ({
					...s,
					loading: null,
					data: arr,
					error: error?.toString(),
				}));
				// Prefill si ya viene un id
				const wantedId = state.form?.denunciaSituacionId ?? data?.denunciaSituacionId;
				if (wantedId) {
					const hit = arr.find(d => d.id === wantedId);
					if (hit) {
						setSituacionSelect(s => ({
							...s,
							selected: { value: hit.id, label: hit.descripcion, record: hit },
							origen: "option",
						}));
					}
				}
			},
		}));
	}, [setDenunciaSituacionQuery, state.form?.denunciaSituacionId, data?.denunciaSituacionId]);



	useEffect(() => {
		setDenunciaTipoQuery(o => ({
			...o,
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : [];
				setTipoIngresoSelect(s => ({
					...s,
					loading: null,
					data: arr,
					error: error?.toString(),
				}));

				if (arr?.length) {
					const wantedId = state.form?.denunciaTipoIngresoId ?? data?.denunciaTipoIngresoId;
					if (wantedId) {
						const hit = arr.find(d => d.id === wantedId);
						if (hit) {
							setTipoIngresoSelect(s => ({
								...s,
								selected: { value: hit.id, label: hit.descripcion, record: hit },
								origen: "option",
							}));
						}
					}
				}
			},
		}));
	}, [setDenunciaTipoQuery, state.form?.denunciaTipoIngresoId, data?.denunciaTipoIngresoId]);

	//#region select provincia
	const [trabPciaSelect, setTrabPciaSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setTrabPciaSelect((o) => ({
			...o,
			options: provinciaSelectOptions(o),
		}));
	}, [trabPciaSelect.buscar, trabPciaSelect.data]);
	//#endregion select provincia

	//#region select localidad
	const [trabLocaSelect, setTrabLocaSelect] = useState({
		loading: "",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	}
	);

	// Query: mapa localidad 
	const { setState: setSeccionalLocalidadQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/SeccionalLocalidad/GetSeccionalLocalidadByRefLocalidadId`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	//Buscamos delegacion
	useEffect(() => {
		const refLocId =
			trabLocaSelect?.selected?.record?.id ??
			state?.form?.refLocalidadIdAfiliado ??
			data?.refLocalidadIdAfiliado ??
			null;

		// si cambiaste la localidad a vacío → limpiar delegación
		if (!refLocId) {
			setState(s => ({ ...s, form: { ...s.form, delegacion: "" } }));
			return;
		}

		// 1) pedir mapeo localidad
		setSeccionalLocalidadQuery(o => ({
			...o,
			query: {
				...o.query,
				params: { RefLocalidadId: refLocId, SoloActivos: true },
			},
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : (ok ? [ok] : []);
				const item = arr[0];

				if (!item) {
					console.warn("[Delegación] No hay SeccionalLocalidad para refLocId:", refLocId, "error:", error);
					setState(s => ({ ...s, form: { ...s.form, delegacion: "" } }));
					return;
				}

				const refDelegacionId = Number(item.refDelegacionId ?? item.RefDelegacionId ?? 0);
				const delegacionDescFallback =
					item.refDelegacionDescripcion || item.seccionalDescripcion || item.seccionalCodigo || "";


				if (!refDelegacionId) {
					console.warn("[Delegación] SeccionalLocalidad sin refDelegacionId. Usando fallback:", delegacionDescFallback);
					setState(s => ({ ...s, form: { ...s.form, delegacion: delegacionDescFallback } }));
					return;
				}

				// pedir DELEGACIÓN por id y tomar su nombre
				sendRequest(
					{
						baseURL: "Comunes",
						endpoint: `/RefDelegacion/GetById`,
						method: "GET",
						params: { id: refDelegacionId },
						errorType: "response",
					},
					(okDel) => {
						const rec = Array.isArray(okDel) ? okDel[0] : okDel;
						const nombreDeleg = rec?.nombre || rec?.Nombre || "";

						if (!nombreDeleg) {
							console.warn("[Delegación] GetById sin nombre. Usando fallback:", delegacionDescFallback, "resp:", rec);
							setState(s => ({ ...s, form: { ...s.form, delegacion: delegacionDescFallback } }));
							return;
						}

						setState(s => ({ ...s, form: { ...s.form, delegacion: nombreDeleg } }));
					},
					(err) => {
						console.error("[Delegación] RefDelegacion/GetById error:", err, "— usando fallback:", delegacionDescFallback);
						setState(s => ({ ...s, form: { ...s.form, delegacion: delegacionDescFallback } }));
					}
				);
			},
		}));
	}, [
		// dispara cuando realmente cambia la localidad elegida o el prefill
		trabLocaSelect?.selected?.record?.id,
		state?.form?.refLocalidadIdAfiliado,
		data?.refLocalidadIdAfiliado,
		setSeccionalLocalidadQuery,
		sendRequest,
	]);

	// Buscador
	useEffect(() => {
		setTrabLocaSelect((o) => {
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
	}, [trabLocaSelect.buscar, trabLocaSelect.data]);
	//#endregion select localidad


	//#endregion selects trabajador

	//#region selects empleador

	//#region select provincia
	const [emplPciaSelect, setEmplPciaSelect] = useState({
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEmplPciaSelect((o) => ({
			...o,
			options: provinciaSelectOptions(o),
		}));
	}, [emplPciaSelect.buscar, emplPciaSelect.data]);
	//#endregion select provincia

	//#region select localidad
	const [emplLocaSelect, setEmplLocaSelect] = useState({
		loading: "",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEmplLocaSelect((o) => {
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
	}, [emplLocaSelect.buscar, emplLocaSelect.data]);
	//#endregion select localidad

	//#region select ciiu
	const [ciiuSelect, setCiiuSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setCiiuSelect((o) => ({
			...o,
			options: ciiuSelectOptions(o),
		}));
	}, [ciiuSelect.buscar, ciiuSelect.data]);
	//#endregion select ciiu

	//#endregion selects empleador

	//Validación de CUIT 
	const validateEmpleadorCUIT = useCallback((rawCUIT) => {
		const cuitDigits = onlyDigits(rawCUIT || "");
		if (!cuitDigits) {
			setState((o) => ({ ...o, errors: { ...o.errors, cuitEmpresa: "Dato requerido" } }));
			return Promise.resolve(false);
		}

		const apply = (isOk = false, changes = {}, errMsg = "") => {
			setState((o) => ({
				...o,
				form: { ...o.form, ...changes },
				errors: { ...o.errors, cuitEmpresa: errMsg || "" },
				validado: { ...o.validado, empleador: isOk },
			}));
		};

		// 1) Buscar primero en Empresas
		setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador" }));
		return new Promise((resolve) => {
			sendRequest(
				{
					baseURL: "Comunes",
					endpoint: `/Empresas/GetEmpresaSpecs?CUIT=${encodeURIComponent(cuitDigits)}`,
					method: "GET",
					errorType: "response",
				},
				(okEmp) => {
					const found = Array.isArray(okEmp) ? (okEmp[0] || null) : (okEmp || null);
					if (found) {
						apply(true, {
							razonSocial: found.razonSocial || found.nombre || "",
							empresaId: Number(found.id ?? found.Id ?? 0),
							cuitEmpresa: cuitDigits,
						});
						setPadronAFIPQuery((o) => ({ ...o, loading: null }));
						return resolve(true);
					}
					// 2) Fallback a AFIP
					setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador (AFIP)" }));
						sendRequest(
						{
							baseURL: "Comunes",
								endpoint: `/AFIPConsulta?CUIT=${encodeURIComponent(cuitDigits)}&VerificarHistorico=false`,
							method: "GET",
							errorType: "response",
						},
						// onOk
						(ok) => {
							apply(true, {
								razonSocial: ok?.razonSocial || ok?.nombre || "",
								empresaId: 0,
								cuitEmpresa: cuitDigits,
							});
							setPadronAFIPQuery((o) => ({ ...o, loading: null }));
							return resolve(true);
						},
						// onError
						(error) => {
							apply(false, {}, error.code === 404 ? "No existe en AFIP" : error.toString());
							setPadronAFIPQuery((o) => ({ ...o, loading: null }));
							return resolve(false);
						}
					);
				},
				(errEmp) => {
					// Intentar AFIP igual si Empresas falla
					setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador (AFIP)" }));
					sendRequest(
						{
							baseURL: "Comunes",
							endpoint: `/AFIPConsulta?CUIT=${encodeURIComponent(cuitDigits)}&VerificarHistorico=false`,
							method: "GET",
							errorType: "response",
						},
						(ok) => {
							apply(true, {
								razonSocial: ok?.razonSocial || ok?.nombre || "",
								empresaId: 0,
								cuitEmpresa: cuitDigits,
							});
							setPadronAFIPQuery((o) => ({ ...o, loading: null }));
							return resolve(true);
						},
						// onError
						(error) => {
							apply(false, {}, error.code === 404 ? "No existe en AFIP" : error.toString());
							setPadronAFIPQuery((o) => ({ ...o, loading: null }));
							return resolve(false);
						}
					);
				}
			);
		});
	}, [setPadronAFIPQuery, sendRequest]);
	// PREFILL (data  readOnly)

	useEffect(() => {
		if (!data || Object.keys(data).length === 0) return;
		setState((o) => ({
			...o,
			form: {
				...o.form,
				...data,

				derivadaA: data.derivadoATipo ?? data.derivadaATipo ?? data.derivadaA ?? o.form.derivadaA ?? "Sin derivacion",
				derivadaADescripcion: data.derivadaADescripcion ?? data.derivadoATipo ?? o.form.derivadaADescripcion ?? "Sin derivacion",
				
				cuitEmpresa: data.empleadorCUIT ?? data.cuitEmpresa ?? o.form.cuitEmpresa ?? "",
				razonSocial: data.empleadorNombre ?? data.razonSocial ?? o.form.razonSocial ?? "",
				...(mode === "M" ? { observacionesRegistro: "" } : {}),
				fecha: data.fecha ? `${data.fecha}`.slice(0, 10) : o.form.fecha,
			},
			validado: readOnly ? { seccionalId: true, fecha: true, trabajador: true, empleador: true } : o.validado,
		}));
	}, [data, readOnly, mode]);

	// prefill y bloquear Delegación o Seccional según corresponda 
	useEffect(() => {
		if (!(mode === "M" || mode === "C")) return;
		const tipo = serverDerivadoATipo || "Sin datos";
		const destinoId = Number(data?.derivadoAId ?? 0);

		// No hacer nada para CNTA, Asesoria Letrada o Sin datos
		if (!tipo || ["CNTA", "Asesoria Letrada", "Sin datos"].includes(tipo)) return;

		if (tipo === "Delegacion") {
			if (!destinoId) return;
			// Pedir solo la delegación indicada y seleccionarla, bloquear el campo
			setDelegacionSelect((o) => ({ ...o, loading: "Cargando..." }));
			setDelegacionesQuery((o) => ({
				...o,
				query: { ...o.query, params: { ...(o.query?.params || {}), id: destinoId, soloActivos: true } },
				onLoad: ({ ok, error }) => {
					const dataArr = Array.isArray(ok) ? ok : [];
					setDelegacionSelect((prev) => {
						const n = { ...prev, loading: null, data: dataArr, error: error?.toString() };
						n.optionsSrc = delegacionSelectOptions(n);
						const sel = n.optionsSrc.find((p) => Number(p.value) === Number(destinoId)) || n.optionsSrc[0] || {};
						n.selected = sel;
						n.selectedDef = sel;
						return n;
					});
					setState((s) => ({ ...s, form: { ...s.form, delegacion: (dataArr[0]?.nombre) || s.form.delegacion || "" } }));
					setLockedDelegacion(true);
				},
			}));
			return;
		}

		if (tipo === "Seccional") {
			if (!destinoId) return;
			// Consultar la seccional por id y seleccionarla, bloquear el campo
			setSeccionalSelect((o) => ({ ...o, loading: "Cargando..." }));
			sendRequest(
				{
					baseURL: "Afiliaciones",
					endpoint: `/Seccional/${destinoId}`,
					method: "GET",
					errorType: "response",
				},
				(ok) => {
					const rec = ok || {};
					const dataArr = Array.isArray(rec) ? rec : [rec];
					setSeccionalSelect((prev) => {
						const n = { ...prev, loading: null, data: dataArr, error: null };
						n.options = seccionalesSelectOptions({ data: dataArr, buscar: prev.buscar });
						n.selected = n.options.find((p) => Number(p.value) === Number(destinoId)) || (n.options[0] || {});
						return n;
					});
					setState((s) => ({ ...s, form: { ...s.form, seccional: rec.descripcion || rec.seccional || s.form.seccional || "" } }));
					setLockedSeccional(true);
					// Si la seccional trae refDelegacionId, prefill y bloquear también Delegación
					const refDelegacionId = rec.refDelegacionId ?? rec.refDelegacion?.id ?? 0;
					if (refDelegacionId) {
						setDelegacionSelect((o) => ({ ...o, loading: "Cargando..." }));
						setDelegacionesQuery((o) => ({
							...o,
							query: { ...o.query, params: { ...(o.query?.params || {}), id: refDelegacionId, soloActivos: true } },
							onLoad: ({ ok, error }) => {
								const dataD = Array.isArray(ok) ? ok : [];
								setDelegacionSelect((prev) => {
									const n = { ...prev, loading: null, data: dataD, error: error?.toString() };
									n.optionsSrc = delegacionSelectOptions(n);
									const sel = n.optionsSrc.find((p) => Number(p.value) === Number(refDelegacionId)) || n.optionsSrc[0] || {};
									n.selected = sel;
									n.selectedDef = sel;
									return n;
								});
								setState((s) => ({ ...s, form: { ...s.form, delegacion: (dataD[0]?.nombre) || s.form.delegacion || "" } }));
								setLockedDelegacion(true);
							},
						}));
					}
				},
				(err) => {
					// no seleccionado si falla
					setSeccionalSelect((o) => ({ ...o, loading: null, error: err?.toString() }));
				}
			);
			return;
		}

	}, [mode, data?.derivadoAId, serverDerivadoATipo, setDelegacionesQuery, sendRequest]);

	// En modo MODIFICAR: si el endpoint devuelve strings de provincia/localidad, mostrarlos de inmediato
	useEffect(() => {
		if (mode !== "M" || !data) return;
		const provinciaLabel = data?.provincia || data?.provinciaNombre || data?.provinciaDescripcion || data?.provinciaNombreAfiliado;
		const provinciaId = data?.provinciaId ?? data?.provinciaID ?? null;
		if (provinciaLabel && (!trabPciaSelect.selected || !trabPciaSelect.selected.value)) {
			setTrabPciaSelect((o) => ({
				...o,
				selected: { value: Number(provinciaId) || 0, label: String(provinciaLabel || ""), record: { id: Number(provinciaId) || 0, nombre: provinciaLabel } },
				origen: "server",
			}));
		}
		const localidadLabel = data?.localidad || data?.nombreLocalidadAfiliado || data?.nombreLocalidad || data?.localidadNombre || state.form?.nombreLocalidadAfiliado || state.form?.localidad || state.form?.nombreLocalidad;
		const locId = data?.localidadId || data?.refLocalidadIdAfiliado || data?.refLocalidadIdEmpresa || data?.localidadID || state.form?.refLocalidadIdAfiliado || state.form?.localidadId || null;
		if (localidadLabel && (!trabLocaSelect.selected || !trabLocaSelect.selected.value)) {
			setTrabLocaSelect((o) => ({
				...o,
				selected: { value: locId || `tmp-loc-${Date.now()}`, label: String(localidadLabel || ""), record: { id: locId, nombre: localidadLabel } },
				origen: "server",
			}));
		}
	}, [mode, data, state.form, trabPciaSelect.selected, trabLocaSelect.selected]);


	// Si estamos en modo ALTA, fijar estado a Registrada (solo para UI, el payload ya cae a 'Registrada' por defecto)
	useEffect(() => {
		if (mode === "A") {
			setState((s) => ({ ...s, form: { ...s.form, estado: s.form?.estado || "Registrada" } }));
		}
	}, [mode]);
	// Validación automática de CUIT empleador
	const getUltimoEstadoDesdeEndpoint = useCallback(() => {
		if (Array.isArray(estadosList) && estadosList.length) {
			try {
				return String(
					estadosList
						.slice()
						.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
						.at(-1)?.estado || ""
				).trim();
			} catch { /* noop */ }
			return String(estadosList.at(-1)?.estado || "").trim();
		}
		return "";
	}, [estadosList]);

	const backendCUITRef = useRef(onlyDigits((data?.empleadorCUIT ?? data?.cuitEmpresa ?? "") || ""));
	const autoCUITValidatedRef = useRef(false); 
	useEffect(() => {
		if (autoCUITValidatedRef.current) return; 
		if (mode === "A") return; 
		const denunciaId = Number(data?.id ?? 0);
		if (!denunciaId) return; 
		const ultimoEstado = getUltimoEstadoDesdeEndpoint();
		if (ultimoEstado !== "Registrada") return; 
		const backendCUIT = backendCUITRef.current;
		if (!backendCUIT || backendCUIT === "0") return; 
		if (state.validado?.empleador) return; 
		autoCUITValidatedRef.current = true;
		validateEmpleadorCUIT(backendCUIT);
	}, [mode, data?.id, getUltimoEstadoDesdeEndpoint, state.validado?.empleador, validateEmpleadorCUIT]);

	useEffect(() => {
		if (!trabPciaSelect.selected?.value || !data?.refLocalidadIdAfiliado) return;
		setLocalidadesQuery((o) => ({
			...o,
			query: { ...o.query, params: { ...o.query.params, provinciaId: trabPciaSelect.selected.value } },
			onPreLoad: () => setTrabLocaSelect((s) => ({ ...s, loading: "Cargando..." })),
			onLoad: ({ ok, error }) =>
				setTrabLocaSelect((s) => ({
					...s,
					data: Array.isArray(ok) ? ok : [],
					loading: null,
					error: error?.toString(),
					selected: { value: data.refLocalidadIdAfiliado, record: (ok || []).find((r) => r.id === data.refLocalidadIdAfiliado) || {} },
					origen: "option",
				})),
		}));
	}, [trabPciaSelect.selected?.value, data?.refLocalidadIdAfiliado, setLocalidadesQuery]);
	useEffect(() => {
		if (!emplPciaSelect.selected?.value || !data?.refLocalidadIdEmpresa) return;
		setLocalidadesQuery((o) => ({
			...o,
			query: { ...o.query, params: { ...o.query.params, provinciaId: emplPciaSelect.selected.value } },
			onPreLoad: () => setEmplLocaSelect((s) => ({ ...s, loading: "Cargando..." })),
			onLoad: ({ ok, error }) =>
				setEmplLocaSelect((s) => ({
					...s,
					data: Array.isArray(ok) ? ok : [],
					loading: null,
					error: error?.toString(),
					selected: { value: data.refLocalidadIdEmpresa, record: (ok || []).find((r) => r.id === data.refLocalidadIdEmpresa) || {} },
					origen: "option",
				})),
		}));
	}, [emplPciaSelect.selected?.value, data?.refLocalidadIdEmpresa, setLocalidadesQuery]);

	//#endregion selects

	//#region inicializaciones

	//#region Carga inicial select seccional
	useEffect(() => {
		setSeccionalesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setSeccionalSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setSeccionalesQuery]);
	//#endregion Carga inicial select seccional

	//#region Carga inicial selects provincias
	useEffect(() => {
		setProvinciasQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				const changes = {
					data,
					loading: null,
					error: error?.toString(),
				};
				setTrabPciaSelect((o) => ({ ...o, ...changes }));
				setEmplPciaSelect((o) => ({ ...o, ...changes }));
			},
		}));
	}, [setProvinciasQuery]);
	//#endregion Carga inicial selects provincias


	//#endregion inicializaciones

	const prevDerivadaARef = useRef(state.form.derivadaA);

	// Habilitar/limpiar Delegacion/Seccional según "Derivada a"
	useEffect(() => {
		const derivada = state.form.derivadaA;
		const prevDerivada = prevDerivadaARef.current;
		setSeccionalSelect(o => ({ ...o, error: null, loading: null }));
		setDelegacionSelect(o => ({ ...o, error: null, loading: null }));

		let lockDeleg = false;
		let lockSecc = false;
		if (serverDerivadoATipo === "Delegacion") lockDeleg = true; 
		else if (serverDerivadoATipo === "Seccional") { lockSecc = true; lockDeleg = true; } 
		else if (serverDerivadoATipo === "CNTA" || serverDerivadoATipo === "Asesoria Letrada") {
			lockDeleg = true;
			lockSecc = true;
		}

		const derivadaCambio = prevDerivada !== derivada;
		// Caso sin derivación explícita
		if (!derivada || derivada === "Sin derivacion") {
			setLockedDelegacion(lockDeleg);
			setLockedSeccional(lockSecc);
			if (!lockDeleg) {
				setDelegacionSelect((o) => ({ ...o, selected: {}, buscar: "", error: null }));
				setState((o) => ({ ...o, form: { ...o.form, delegacionDerivada: "" } }));
			}
			if (!lockSecc) {
				setSeccionalSelect((o) => ({ ...o, selected: {}, options: [], buscar: "", error: null }));
				setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			}
			prevDerivadaARef.current = derivada;
			return;
		}

		// Derivada a Delegacion: permitir elegir delegación solo si BD NO la fijó como Delegacion
		if (derivada === "Delegacion") {
			if (derivadaCambio && prevDerivada !== "Delegacion" && !lockSecc) {
				setSeccionalSelect((o) => ({ ...o, selected: {}, options: [], buscar: "" }));
				setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			}
			setLockedDelegacion(lockDeleg); 
			setLockedSeccional(lockSecc);
			if (!lockSecc) {
				setSeccionalSelect((o) => ({ ...o, selected: {}, options: [] }));
				setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			}
			prevDerivadaARef.current = derivada;
			return;
		}
		// Derivada a Seccional:
		if (derivada === "Seccional") {
			if (derivadaCambio && prevDerivada !== "Seccional" && !lockDeleg) {
				setDelegacionSelect((o) => ({ ...o, selected: {}, buscar: "" }));
				setState((o) => ({ ...o, form: { ...o.form, delegacionDerivada: "" } }));
			}
			setLockedDelegacion(lockDeleg);
			setLockedSeccional(lockSecc);
			if (!lockSecc) {
				if (!Array.isArray(seccionalSelect.data) || seccionalSelect.data.length === 0) {
					setSeccionalSelect(o => ({ ...o, error: null, loading: "Cargando..." }));
					setSeccionalesQuery((o) => ({
						...o,
						onLoad: ({ ok, error }) => {
							const data = Array.isArray(ok) ? ok : [];
							setSeccionalSelect((s) => ({ ...s, loading: null, data, error: error?.toString() }));
						},
					}));
				} else {
					setSeccionalSelect(o => ({ ...o, error: null, loading: null }));
				}
			}
			return;
		}

		// Para cualquier otro destino (CTNA / Asesoria Letrada) limpiar ambos si cambió
		if (derivadaCambio && !["Delegacion", "Seccional"].includes(derivada)) {
			if (!lockDeleg) {
				setDelegacionSelect((o) => ({ ...o, selected: {}, buscar: "" }));
				setState((o) => ({ ...o, form: { ...o.form, delegacionDerivada: "" } }));
			}
			if (!lockSecc) {
				setSeccionalSelect((o) => ({ ...o, selected: {}, options: [], buscar: "" }));
				setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			}
		}
		setLockedDelegacion(lockDeleg);
		setLockedSeccional(lockSecc);
		prevDerivadaARef.current = derivada;
	}, [state.form.derivadaA, serverDerivadoATipo, seccionalSelect.data, setSeccionalesQuery]);


	let content = null;
	{
		const GRUPO_MEDIO = [
			"En Planificacion",
			"Gestion con Empleador",
			"Inspeccionada",
			"Relevamiento App",
		];

		const pickLastEstado = (list = []) => {
			if (!list.length) return "";
			try {
				const last = list.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).at(-1);
				return String(last?.estado || "").trim();
			} catch {
				return String(list.at(-1)?.estado || "").trim();
			}
		};

		// Estado PERSISTIDO DB: último en /DenunciasEstados
		const estadoPersistido = String(
			(pickLastEstado(estadosList) || data?.estado || "Registrada")
		).trim();

		const optionsFor = (estado) => {
			if (estado === "Registrada") return ["Registrada", "Completada"];
			if (estado === "Completada") {
				return ["Completada", "Derivada", ...GRUPO_MEDIO, "Finalizada"];
			}
			if (estado === "Derivada") {

				return ["Derivada", ...GRUPO_MEDIO, "Finalizada"];
			}
			if (GRUPO_MEDIO.includes(estado)) {
				return [...GRUPO_MEDIO, "Finalizada"];
			}


			if (estado === "Finalizada") return ["Finalizada"];

			return ["Registrada", "Completada"];
		};

		const estadoOptions = optionsFor(estadoPersistido).map(v => ({ value: v, label: v }));


		const isRegistrada = estadoPersistido === "Registrada";
		const derivadaPersistida = (serverDerivadoATipo || "Sin datos").trim();
		const derivadaOptionsFor = (tipo) => {
			if (tipo === "Asesoria Letrada") return ["Asesoria Letrada"];
			if (tipo === "CNTA") return ["CNTA"];
			if (tipo === "Seccional") return ["Seccional"];
			if (tipo === "Delegacion") return ["Seccional"]; 
			// Sin derivación (o vacío): mostrar todas
			return [
				"Sin derivacion",
				"Delegacion",
				"Seccional",
				"CNTA",
				"Asesoria Letrada",
			];
		};
		const derivadaAOptions = derivadaOptionsFor(derivadaPersistida).map(v => ({ value: v, label: v }));

		const lockDerivadaSelectByServer = ["Seccional", "CNTA", "Asesoria Letrada"].includes(derivadaPersistida);

		const lockAllExceptRouting = !isRegistrada;

		const FormularioPanel = (
			<Grid full col gap="10px">
				{/* ====== CABECERA (nueva UI: SIN Seccional y SIN Fecha) ====== */}
				<Grid width gap="inherit">
					{
						(mode === "M" || isConsulta || readOnly || lockAllExceptRouting) ? (
							<InputMaterial
								id="provincia"
								label="Provincia"
								readOnly
								style={roStyle(true)}
								value={
									state.form?.provinciaNombre || data?.provincia || trabPciaSelect.selected?.label || ""
								}
							/>
						) : (
							<SearchSelectMaterial
								id="provincia"
								label="Provincia"
								onKeyDown={(e) => { e.preventDefault(); }}
								error={!!(trabPciaSelect.error || state.errors.provincia)}
								helperText={trabPciaSelect.loading ?? trabPciaSelect.error ?? state.errors.provincia}
								value={trabPciaSelect.selected}
								onChange={(selected = {}) => {
									setTrabPciaSelect((o) => ({ ...o, selected, origen: "option" }));
									setLocalidadesQuery((o) => ({
										...o,
										query: { ...o.query, params: { ...o.query.params, provinciaId: selected.value } },
										onPreLoad: () => setTrabLocaSelect((s) => ({ ...s, selected: {}, loading: "Cargando..." })),
										onLoad: ({ ok, error }) =>
											setTrabLocaSelect((s) => ({
												...s,
												data: Array.isArray(ok) ? ok : [],
												loading: null,
												error: error?.toString(),
												selected: { record: { codPostal: 99999 } },
												origen: "option",
											})),
									}));
									setState((o) => ({
										...o,
										form: { ...o.form, provinciaNombre: selected.record?.nombre, provinciaId: selected.value, refLocalidadIdAfiliado: 0, nombreLocalidadAfiliado: "" },
										errors: { ...o.errors, provincia: selected?.value ? "" : "Dato requerido" },
									}));
								}}
								options={trabPciaSelect.options}
								onTextChange={(buscar) => setTrabPciaSelect((o) => ({ ...o, buscar, origen: "text" }))}
							/>
						)
					}
					{
						(mode === "M" || isConsulta || readOnly || lockAllExceptRouting) ? (
							<InputMaterial
								id="localidad"
								label="Localidad"
								readOnly
								style={roStyle(true)}
								value={state.form?.nombreLocalidadAfiliado || data?.localidad || trabLocaSelect.selected?.label || ""}
							/>
						) : (
							<SearchSelectMaterial
								id="localidad"
								label="Localidad"
								//onKeyDown={(e) => { e.preventDefault(); }}
								error={!!(trabLocaSelect.error || state.errors.localidad)}
								helperText={trabLocaSelect.loading ?? trabLocaSelect.error ?? state.errors.localidad}
								value={trabLocaSelect.selected}
								onChange={(selected = {}) => {
									setTrabLocaSelect((o) => ({ ...o, selected, origen: "option" }));
									setState((o) => ({
										...o,
										form: { ...o.form, refLocalidadIdAfiliado: selected.record?.id, nombreLocalidadAfiliado: selected.record?.nombre },
										errors: { ...o.errors, localidad: selected?.record?.id ? "" : "Dato requerido" },
									}));
								}}
								options={trabLocaSelect.options}
								freeSolo={false}
								inputReadOnly={true}
								onTextChange={(buscar) => setTrabLocaSelect((o) => ({ ...o, buscar, origen: "text" }))}
							/>
						)
					}
					<InputMaterial
						id="delegacion"
						label="Delegación"
						readOnly
						style={roStyle(true)}
						value={state.form.delegacion || data?.delegacion || ""}
					/>
				</Grid>

				{/* ====== BLOQUE PRINCIPAL ====== */}
				<Grid col width gap="inherit" style={styles.group}>
					<Grid width style={styles.titulo}>Carga de Datos</Grid>
					<Grid col gap="inherit">

						{/* Nombre Denunciante / Teléfono de contacto / Correo electrónico */}
						<Grid width gap="inherit">
							<InputMaterial
								id="nombre"
								readOnly={isConsulta || readOnly || lockAllExceptRouting || ocultarDatosSensibles}
								style={roStyle(isConsulta || readOnly || lockAllExceptRouting || ocultarDatosSensibles)}
								label="Nombre Denunciante"
								value={ocultarDatosSensibles ? "" : state.form.nombre}
								error={!!state.errors.nombre}
								helperText={state.errors.nombre}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, nombre: v } }))}
							/>
							<InputMaterial
								id="telefono"
								readOnly={isConsulta || readOnly || lockAllExceptRouting}
								style={roStyle(isConsulta || readOnly || lockAllExceptRouting)}
								type="tel"
								label="Teléfono de contacto"
								value={state.form.telefono}
								error={!!state.errors.telefono}
								helperText={state.errors.telefono}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, telefono: v } }))}
							/>
							<InputMaterial
								id="correo"
								readOnly={isConsulta || readOnly || lockAllExceptRouting || ocultarDatosSensibles}
								style={roStyle(isConsulta || readOnly || lockAllExceptRouting || ocultarDatosSensibles)}
								label="Correo electrónico"
								value={ocultarDatosSensibles ? "" : state.form.correo}
								error={!!state.errors.correo}
								helperText={state.errors.correo}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, correo: v } }))}
							/>
						</Grid>

						{/* Correo electrónico
						<Grid width>

						</Grid> */}

						{/* Tipo de Ingreso / Situación / Ubicacion */}
						<Grid width gap="inherit">
							<SearchSelectMaterial
								id="tipoIngreso"
								readOnly={isConsulta || readOnly || lockAllExceptRouting}
								style={roStyle(isConsulta || readOnly || lockAllExceptRouting)}
								label="Tipo de Ingreso"
								onKeyDown={(e) => { e.preventDefault(); }}
								error={!!tipoIngresoSelect.error}
								helperText={tipoIngresoSelect.loading ?? tipoIngresoSelect.error}
								value={tipoIngresoSelect.selected}
								options={tipoIngresoSelect.options}
								freeSolo={false}
								inputReadOnly={true}
								onChange={(selected = {}) => {
									setTipoIngresoSelect(o => ({ ...o, selected, origen: "option", error: null }));
									setState(o => ({
										...o,
										form: {
											...o.form,
											// guardar el ID para el backend:
											denunciaTipoIngresoId: Number(selected?.value || 0),
											// guardar también la descripción por si la necesitás en UI:
											tipoIngresoDescripcion: selected?.label || "",
										},
										// si tenías errores previos:
										errors: { ...o.errors, tipoIngreso: "" },
									}));
								}}
								onTextChange={(buscar) => setTipoIngresoSelect(o => ({ ...o, buscar, origen: "text" }))}
							/>
							<SearchSelectMaterial
								id="situacion"
								readOnly={readOnly || lockAllExceptRouting || ocultarDatosSensibles}
								style={roStyle(readOnly || lockAllExceptRouting || ocultarDatosSensibles)}
								label="Situación"
								onKeyDown={(e) => { e.preventDefault(); }}
								error={!!situacionSelect.error}
								helperText={situacionSelect.loading ?? situacionSelect.error}
								value={ocultarDatosSensibles ? null : situacionSelect.selected}
								options={situacionSelect.options}
								freeSolo={false}
								inputReadOnly={true}
								onChange={(selected = {}) => {
									setSituacionSelect(o => ({ ...o, selected, origen: "option", error: null }));
									setState(o => ({
										...o,
										form: {
											...o.form,
											denunciaSituacionId: Number(selected?.value || 0),  
											situacionDescripcion: selected?.label || "",        
										},
										errors: { ...o.errors, situacion: "" },
									}));
								}}
								onTextChange={(buscar) => setSituacionSelect(o => ({ ...o, buscar, origen: "text" }))}
							/>

							<InputMaterial
								id="ubicacion"
								readOnly={readOnly || lockAllExceptRouting || ocultarDatosSensibles}
								style={roStyle(readOnly || lockAllExceptRouting || ocultarDatosSensibles)}
								label="Ubicación"
								value={ocultarDatosSensibles ? "" : state.form.ubicacion}
								error={!!state.errors.ubicacion}
								helperText={state.errors.ubicacion}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, ubicacion: v } }))}
							/>
						</Grid>

						{/* CUIT Empleador  */}
						<Grid gap="inherit">
							<Grid width="200px">
								<InputMaterial
									id="cuitEmpresa"
									readOnly={isConsulta || readOnly || lockAllExceptRouting}
									style={roStyle(isConsulta || readOnly || lockAllExceptRouting)}
									mask={CUITMask}
									label="CUIT Empleador"
									value={state.form.cuitEmpresa}
									error={!!state.errors.cuitEmpresa}
									helperText={state.errors.cuitEmpresa}
									onChange={(v) => {
										const digits = (String(v || "").match(/\d/g) || []).join("");
										setState((o) => ({
											...o,
											form: { ...o.form, cuitEmpresa: digits },
											validado: { ...o.validado, empleador: false },
										}));
									}}
								/>
							</Grid>
							<Grid col width="100px">
								<Button
									className="botonAzul"
									onClick={() => {
										const cuit = state.form.cuitEmpresa;
										validateEmpleadorCUIT(cuit);
									}}
									loading={!!padronAFIPQuery.loading}
									disabled={!!padronAFIPQuery.loading || lockAllExceptRouting}
								>
									Valida
								</Button>
							</Grid>
							<Grid grow>
								<InputMaterial
									id="razonSocial"
									readOnly={readOnly || lockAllExceptRouting}
									style={roStyle(readOnly || lockAllExceptRouting)}
									label="Razón Social Empleador"
									value={state.form.razonSocial}
									error={!!state.errors.razonSocial}
									helperText={state.errors.razonSocial}
									onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, razonSocial: v } }))}
								/>
							</Grid>
						</Grid>

						{/* Detalle de la denuncia (texto libre) */}
						<Grid width>
							<InputMaterial
								id="detalleDenuncia"
								readOnly={readOnly || lockAllExceptRouting}
								style={roStyle(readOnly || lockAllExceptRouting)}
								label="Detalle de la denuncia"
								multiline
								rows={6}
								value={state.form.texto}
								error={!!state.errors.texto}
								helperText={state.errors.texto}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, texto: v } }))}
							/>
						</Grid>

						{/* Delegación y Seccional (desplegables) Estados y derivados a*/}
						<Grid width gap="inherit">

							<Grid grow>
								<SearchSelectMaterial
									readOnly={readOnly || mode === "A"}
									id="estado"
									label="Estado"
									onKeyDown={(e) => { e.preventDefault(); }}
									style={roStyle(readOnly || mode === "A")}
									value={state.form.estado ? { value: state.form.estado, label: state.form.estado } : { value: "Registrada", label: "Registrada" }}
									options={estadoOptions}
									onChange={(selected = {}) => {
										const persisted = (getUltimoEstadoDesdeEndpoint?.() || "").toLowerCase();
										const shouldResetDerivacion = (persisted === "completada") && (selected?.value !== "Derivada");
										setState((o) => {
											const next = { ...o, form: { ...o.form, estado: selected?.value, estadoDescripcion: selected?.label } };

											if (shouldResetDerivacion) {
												next.form.derivadaA = "Sin derivacion";
												next.form.derivadaADescripcion = "Sin derivacion";
												if (!lockedDelegacion) next.form.delegacionDerivada = "";
												if (!lockedSeccional) next.form.seccional = "";
											}
											return next;
										});
										// Limpiar selección visual SOLO bajo la misma condición
										if (shouldResetDerivacion) {
											if (!lockedDelegacion) setDelegacionSelect((o) => ({ ...o, selected: {}, error: null }));
											if (!lockedSeccional) setSeccionalSelect((o) => ({ ...o, selected: {}, error: null }));
										}
									}}
									freeSolo={false}
									inputReadOnly={true}
									onTextChange={() => { }}
								/>
							</Grid>

							<Grid grow>
								<SearchSelectMaterial
									readOnly={readOnly || state.form.estado !== "Derivada" || lockDerivadaSelectByServer}
									id="derivadaA"
									label="Derivada a"
									onKeyDown={(e) => { e.preventDefault(); }}
									style={roStyle(readOnly || state.form.estado !== "Derivada" || lockDerivadaSelectByServer)}
									value={state.form.derivadaA ? { value: state.form.derivadaA, label: state.form.derivadaA } : {}}
									options={derivadaAOptions}
									onChange={(selected = {}) =>
										setState((o) => ({ ...o, form: { ...o.form, derivadaA: selected?.value, derivadaADescripcion: selected?.label } }))
									}
									freeSolo={false}
									inputReadOnly={true}
									onTextChange={() => { }}
								/>
							</Grid>
							<Grid grow>
								<SearchSelectMaterial
									id="delegacionSelect"
									label="Delegación"
									//onKeyDown={(e) => { e.preventDefault(); }}
									style={roStyle(lockedDelegacion || !(state.form.derivadaA === "Delegacion" || state.form.derivadaA === "Seccional"))}
									error={!!delegacionSelect.error}
									helperText={delegacionSelect.loading ?? (delegacionSelect.selected?.value ? null : delegacionSelect.error)}
									value={delegacionSelect.selected}
									readOnly={lockedDelegacion || !(state.form.derivadaA === "Delegacion" || state.form.derivadaA === "Seccional")}
									freeSolo={false}
									inputReadOnly={true}
									onChange={(selected) => {
										setDelegacionSelect((o) => ({ ...o, selected, error: null, loading: null }));
										// No tocar state.form.delegacion (ese campo lo controla el header via la lógica de provincia)
										setState((o) => ({ ...o, form: { ...o.form, delegacionDerivada: selected.record?.nombre || selected.label } }));
									}}
									options={delegacionSelect.options}
									onTextChange={(buscar) => setDelegacionSelect((o) => ({ ...o, buscar }))}
								/>
							</Grid>
							<Grid grow>
								<SearchSelectMaterial
									id="seccionalSelect"
									label="Seccional"
									//onKeyDown={(e) => { e.preventDefault(); }}
									style={roStyle(lockedSeccional || state.form.derivadaA !== "Seccional")}
									error={!!seccionalSelect.error}
									helperText={seccionalSelect.loading ?? (seccionalSelect.selected?.value ? null : seccionalSelect.error)}
									value={seccionalSelect.selected}
									readOnly={lockedSeccional || state.form.derivadaA !== "Seccional"}
									freeSolo={false}
									inputReadOnly={true}
									onChange={(selected) => {
										setSeccionalSelect((o) => ({ ...o, selected, error: null, loading: null }));
										setState((o) => ({ ...o, form: { ...o.form, seccional: selected.record?.descripcion || selected.label } }));
									}}
									options={seccionalSelect.options}
									onTextChange={(buscar) => setSeccionalSelect((o) => ({ ...o, buscar }))}
								/>
							</Grid>
						</Grid>

						{/* Observaciones del Registro (texto libre) */}
						<Grid width>
							<InputMaterial
								id="observacionesRegistro"
								readOnly={readOnly}
								style={roStyle(readOnly)}
								label="Observaciones del Registro"
								multiline
								rows={4}
								value={state.form.observacionesRegistro}
								error={!!state.errors.observacionesRegistro}
								helperText={state.errors.observacionesRegistro}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, observacionesRegistro: v } }))}
							/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		);

		const entidadId = data?.id ?? 0;
		const entidadTipo = "R";

		const DocumentacionPanel = (
			<Grid full col gap="10px">

				{(() => {
					const shouldCombine = (mode === "C" || mode === "M") && !overrideDocsPorNuevoEstado;
					let dataDocs = documentacionList;
					if (shouldCombine) {
						const estadoNombre = selectedEstado?.estado || state.form?.estado || "";
						if (estadoNombre) {
							const mismosIds = (Array.isArray(estadosList) ? estadosList : [])
								.filter(e => (e?.estado ?? "") === estadoNombre)
								.map(e => Number(e?.id ?? e?.Id ?? 0))
								.filter(id => Number.isFinite(id) && id > 0);
							const combinados = mismosIds.flatMap(id => Array.isArray(docsByEstadoId[id]) ? docsByEstadoId[id] : []);
							if (combinados.length) {
								// Dedupe por id o (nombre+size+tipo)
								const seen = new Set();
								dataDocs = combinados.filter(d => {
									const raw = (d.archivo || d.archivoBase64 || d.base64 || d.contenido || "").toString().replace(/^data:.*;base64,/, "");
									const key = d.id ? `ID-${d.id}` : `${(d.nombreArchivo||d.fileName||'').trim()}@@${raw.length}@@${(d.contentType||'').trim()}`;
									if (seen.has(key)) return false;
									seen.add(key);
									return true;
								});
							}
						}
					}
					return (
						<Documentacion
							data={dataDocs}
					tipoDocumentacion={[
						"Credencial",
						"Documento de Identidad",
						"Formulario",
						"Otros",
					]}
					disabled={readOnly}
					onChange={({ index, item }) => {

						const prev = [...documentacionList];

						// === ALTA (CREAR NUEVO ARCHIVO)
						if (index == null && item != null) {
							const payload = mapDocToPayload(item, entidadId, entidadTipo);

							// Actualización optimista (se ve inmediatamente en la UI)
							const temp = [...prev, { ...payload, id: item.id ?? 0 }];
							setDocumentacionList(temp);
							setState(s => ({ ...s, form: { ...s.form, documentacion: temp } }));

							// Si no hay EntidadId todavía, solo guardamos localmente
							if (!entidadId) {
								return;
							}

							// Enviar al servidor
							sendRequest(
								{
									baseURL: "Comunes",
									endpoint: `/DocumentacionEntidad`,
									method: "POST",
									body: payload,
									errorType: "response",
								},
								({ ok }) => {
									// Actualizar con el ID real del servidor
									const newId = ok?.id ?? item.id;
									const next = [...temp];
									next[next.length - 1] = { ...next[next.length - 1], id: newId };
									setDocumentacionList(next);
									setState(s => ({ ...s, form: { ...s.form, documentacion: next } }));
								},
								(err) => {
									console.error(' Error al crear archivo:', err);
									// Rollback
									setDocumentacionList(prev);
									setState(s => ({ ...s, form: { ...s.form, documentacion: prev } }));
								}
							);
							return;
						}

						//  BAJA
						if (index != null && item == null) {
							const current = prev[index];
							const id = current?.id;

							if (!id) {
								// Si no hay id, solo eliminar localmente
								const next = prev.filter((_, i) => i !== index);
								setDocumentacionList(next);
								setState(s => ({ ...s, form: { ...s.form, documentacion: next } }));
								return;
							}

							// Actualización optimista
							const next = prev.filter((_, i) => i !== index);
							setDocumentacionList(next);
							setState(s => ({ ...s, form: { ...s.form, documentacion: next } }));

							if (!entidadId) return;

							// Eliminar del servidor
							sendRequest(
								{
									baseURL: "Comunes",
									endpoint: `/DocumentacionEntidad/${id}`,
									method: "DELETE",
									errorType: "response",
								},
								() => {
								},
								(err) => {
									console.error(' Error al eliminar archivo:', err);
									// Rollback
									setDocumentacionList(prev);
									setState(s => ({ ...s, form: { ...s.form, documentacion: prev } }));
								}
							);
							return;
						}

						// === MODIFICACIÓN (ACTUALIZAR ARCHIVO)
						if (index != null && item != null) {
							const current = prev[index] || {};
							const payload = mapDocToPayload({ ...current, ...item }, entidadId, entidadTipo);

							// Actualización optimista
							const next = [...prev];
							next.splice(index, 1, { ...current, ...item });
							setDocumentacionList(next);
							setState(s => ({ ...s, form: { ...s.form, documentacion: next } }));

							if (!entidadId) return;

							// Actualizar en el servidor
							sendRequest(
								{
									baseURL: "Comunes",
									endpoint: `/DocumentacionEntidad/${payload.id}`,
									method: "PUT",
									body: payload,
									errorType: "response",
								},
								() => {
								},
								(err) => {
									console.error(' Error al actualizar archivo:', err);
									// Rollback
									setDocumentacionList(prev);
									setState(s => ({ ...s, form: { ...s.form, documentacion: prev } }));
								}
							);
							return;
						}
					}}
					/>
					);
				})()}
				{!readOnly && (
					<Button
						className="botonAmarillo"
						marginTop={3}
						width={50}
						onClick={() => setSelectedTab(0)}
					>
						CONFIRMA DOCUMENTACIÓN
					</Button>
				)}
			</Grid>
		);
		const documentacionTabLabel = useMemo(() => {
			if (mode === "M" && (state.form?.estado ?? "")) {
				return `Documentación Estado: ${state.form.estado}`;
			}
			if (mode === "C" && (selectedEstado?.estado ?? "")) {
				return `Documentación Estado: ${selectedEstado.estado}`;
			}
			return "Documentación";
		}, [mode, selectedEstado, state.form?.estado]);

		useEffect(() => {
			if (mode !== "M") return;
			const current = state.form?.estado ?? "";
			if (!current) return;
			let last = "";
			const arr = Array.isArray(estadosList) ? estadosList : [];
			if (arr.length) {
				try {
					last = String(arr.slice().sort((a,b)=> new Date(a.fecha) - new Date(b.fecha)).at(-1)?.estado || "").trim();
				} catch {
					last = String(arr.at(-1)?.estado || "").trim();
				}
			}
			const esNuevoEstado = current !== last;
			setOverrideDocsPorNuevoEstado(esNuevoEstado);
			if (esNuevoEstado) {
				setDocumentacionList([]);
				setSelectedEstado(null);
			}
		}, [mode, state.form?.estado, estadosList]);
		content = (
			<>
				<Tabs value={selectedTab} onChange={handleChangeTab}>
					<Tab label="Datos" />
					<Tab label={documentacionTabLabel} />
					<Tab
						label="Novedades"
						disabled={disableNovedades || mode === "A"}
						sx={{
							pointerEvents: (disableNovedades || mode === "A") ? "none" : "auto",
							opacity: (disableNovedades || mode === "A") ? 0.5 : 1
						}}
					/>
				</Tabs>
				<div style={{ marginTop: 10 }}>
					{selectedTab === 0 ? FormularioPanel : selectedTab === 1 ? DocumentacionPanel : NovedadesPanel}
				</div>
			</>
		);
	}

	const buildPayloads = () => {
		const errors = {};
		const body = { ...state.form };

		const estadoActualForm = String(body.estado || state.form?.estado || "Registrada").trim();

		const provinciaIdSel = (
			trabPciaSelect?.selected?.value != null ? trabPciaSelect.selected.value :
				(data?.provinciaId != null ? data.provinciaId : (data?.provinciaID != null ? data.provinciaID : null))
		);
		const localidadIdSel = (
			(trabLocaSelect?.selected?.record?.id != null ? trabLocaSelect.selected.record.id :
				(data?.refLocalidadIdAfiliado != null ? data.refLocalidadIdAfiliado : (data?.localidadId != null ? data.localidadId : null))))
			;

		const provinciaTieneNombre = !!(trabPciaSelect?.selected?.record?.nombre || data?.provincia || data?.provinciaNombre || data?.provinciaDescripcion);
		const localidadTieneNombre = !!(trabLocaSelect?.selected?.record?.nombre || data?.localidad || data?.nombreLocalidadAfiliado || data?.nombreLocalidad);

		if (estadoActualForm === "Registrada") {
			if (provinciaIdSel == null && !provinciaTieneNombre) errors.provincia = "Dato requerido";
			if (localidadIdSel == null && !localidadTieneNombre) errors.localidad = "Dato requerido";
			if (!body.correo) errors.correo = "Dato requerido";
			if (!body.telefono) errors.telefono = "Dato requerido";
		} else {
			if (!body.nombre) errors.nombre = "Dato requerido";
			// Requeridos en alta
			const isAlta = (mode === "A" || !data?.id);
			if (isAlta && !body.correo) errors.correo = "Dato requerido";
			if (isAlta && !body.telefono) errors.telefono = "Dato requerido";
			if (isAlta && !Number(body.denunciaTipoIngresoId || 0)) {
				errors.tipoIngreso = "Dato requerido";
				setTipoIngresoSelect(s => ({ ...s, error: "Dato requerido" }));
			}
			if (isAlta && !Number(body.denunciaSituacionId || 0)) {
				errors.situacion = "Dato requerido";
				setSituacionSelect(s => ({ ...s, error: "Dato requerido" }));
			}
			if (isAlta && !body.ubicacion) errors.ubicacion = "Dato requerido";
		}

		if (body.correo && !ValidarEmail(body.correo)) errors.correo = errors.correo || "Dato inválido";
		if (body.telefono && !isPossiblePhoneNumber(body.telefono)) errors.telefono = errors.telefono || "Dato inválido";
		if (body.cuitEmpresa && !ValidarCUIT(body.cuitEmpresa)) errors.cuitEmpresa = "Dato inválido";
		if (body.cuitEmpresa && !body.razonSocial) errors.razonSocial = "Complete Razón Social";


		// SOLO bloquear si se intenta pasar de Registrada a Completada sin validar CUIT
		const lastEstado = (() => {
			if (Array.isArray(estadosList) && estadosList.length) {
				try {
					return String(
						estadosList.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).at(-1)?.estado || ""
					).trim();
				} catch { /* noop */ }
				return String(estadosList.at(-1)?.estado || "").trim();
			}
			return String(data?.estado || "Registrada").trim();
		})();
		const estadoNuevo = String(body.estado || state.form?.estado || "Registrada").trim();


		if (estadoNuevo === "Derivada") {
			const destino = (body.derivadaA || state.form?.derivadaA || "").trim();

			if (destino === "Seccional") {
				const hasSeccional = !!seccionalSelect?.selected?.value;
				const hasDelegacion = !!delegacionSelect?.selected?.value;
				if (!hasDelegacion) {
					errors.delegacion = "Dato requerido";
					try { setDelegacionSelect(s => ({ ...s, error: "Dato requerido" })); } catch (e) { /* noop */ }
				}
				if (!hasSeccional) {
					errors.seccional = "Dato requerido";
					try { setSeccionalSelect(s => ({ ...s, error: "Dato requerido" })); } catch (e) { /* noop */ }
				}
			}
			if (destino === "Delegacion") {
				const hasDelegacion = !!delegacionSelect?.selected?.value;
				if (!hasDelegacion) {
					errors.delegacion = "Dato requerido";
					try { setDelegacionSelect(s => ({ ...s, error: "Dato requerido" })); } catch (e) { /* noop */ }
				}
			}
		}

		if (lastEstado === "Registrada" && estadoNuevo === "Completada") {
			const hasCUIT = !!body.cuitEmpresa;
			const isValidated = !!state.validado?.empleador;
			if (!hasCUIT) {
				errors.cuitEmpresa = "Valida CUIT empleador";
				errors.validacionCUIL = "Ingrese y valide el CUIL del empleador";
			} else if (!isValidated) {
				errors.validacionCUIL = "Validar CUIL empleador";
				errors.cuitEmpresa = errors.cuitEmpresa || errors.validacionCUIL;
			}

			if (!body.correo) errors.correo = errors.correo || "Dato requerido";
			if (!body.telefono) errors.telefono = errors.telefono || "Dato requerido";
			if (!Number(body.denunciaTipoIngresoId || 0)) {
				errors.tipoIngreso = errors.tipoIngreso || "Dato requerido";
				try { setTipoIngresoSelect(s => ({ ...s, error: "Dato requerido" })); } catch(e) { /*x*/ }
			}
			if (!Number(body.denunciaSituacionId || 0)) {
				errors.situacion = errors.situacion || "Dato requerido";
				try { setSituacionSelect(s => ({ ...s, error: "Dato requerido" })); } catch(e) { /* x */ }
			}
			if (!body.ubicacion) errors.ubicacion = errors.ubicacion || "Dato requerido";
		}


		if (Object.values(errors).some(Boolean)) {
			// Si la validación del CUIT falla, también copiar el mensaje a `errors.create`
			if (errors.validacionCUIL) {
				errors.create = errors.validacionCUIL;
				errors.cuitEmpresa = errors.cuitEmpresa || errors.validacionCUIL;
			}
			setState((o) => ({ ...o, errors }));
			return null;
		}

		const derivadoAIdValue = (() => {
			const selectedTipo = body.derivadaA || state.form?.derivadaA || "";
			if (selectedTipo === "Delegacion") return Number(delegacionSelect.selected?.value || 0);
			if (selectedTipo === "Seccional") return Number(seccionalSelect.selected?.value || 0);
			return 0;
		})();

		const _derivadoATipoRaw = body.derivadaADescripcion || body.derivadaA || state.form?.derivadaADescripcion || state.form?.derivadaA || "";
		const derivadoATipoValue = _derivadoATipoRaw === "Sin derivacion" ? "Sin datos" : _derivadoATipoRaw;

		const appDenunciaPayload = {
			nombre: body.nombre || "",
			correo: body.correo || "",
			telefono: body.telefono || "",

			provincia: trabPciaSelect?.selected?.record?.nombre || data?.provincia || "",
			localidad: trabLocaSelect?.selected?.record?.nombre || data?.localidad || "",

			texto: body.texto || "",
			foto: "",
			localidadId: Number(localidadIdSel || 0),
			denunciaTipoIngresoId: Number(body.denunciaTipoIngresoId || 0),
			denunciaTipoId: 0,
			derivadoATipo: derivadoATipoValue,
			derivadoAId: derivadoAIdValue,
			documentacionEntidadesId: 0,
			denunciaSituacionId: Number(body.denunciaSituacionId || 0),
			empleadorCUIT: Number(body.cuitEmpresa || 0),
			empleadorNombre: body.razonSocial || "",
			empresaId: Number(state.form?.empresaId || 0),
			ubicacion: body.ubicacion || "",
		};

		const estadoPayload = (appDenunciasId) => ({
			appDenunciasId,
			estado: body.estado || state.form?.estado || "Registrada",
			fechaAsociada: new Date().toISOString(),
			fecha: new Date().toISOString(),
			observaciones: body.observacionesRegistro || "",
		});

		return { appDenunciaPayload, estadoPayload };
	};

	const onAgregaDenuncia = () => {
		setDisableNovedades(true);
		setSelectedTab(0); // quedarnos en la pestaña Datos
		const built = buildPayloads();
		if (!built) return;
		const { appDenunciaPayload, estadoPayload } = built;

		setCreateAppDenunciaQuery((o) => ({
			...o,
			query: { ...o.query, config: { ...o.query?.config, body: appDenunciaPayload } },
			onPreLoad: () => setState((s) => ({ ...s, loading: "Guardando denuncia..." })),
			onLoad: ({ ok, error }) => {
				if (error) {
					setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: error.toString() } }));
					setDisableNovedades(false);
					return;
				}

				//const appId = ok?.id ?? ok?.Id ?? (Number.isFinite(ok) ? ok : null);
				const rawId = ok?.id ?? ok?.Id ?? (Number.isFinite(ok) ? ok : null);
				const appId = rawId != null ? Number(rawId) : null;
				if (!appId) {
					setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: "No se devolvió Id de denuncia" } }));
					return;
				}

				setState((s) => ({ ...s, form: { ...s.form, id: appId } }));

				// Estado inicial
				setCreateEstadoQuery((o3) => ({
					...o3,
					query: { ...o3.query, config: { ...o3.query?.config, body: estadoPayload(appId) } },
					onLoad: ({ ok, error: error2 }) => {
						const rawEstadoId = ok?.id ?? ok?.Id ?? (Number.isFinite(ok) ? ok : null);
						const estadoId = rawEstadoId != null ? Number(rawEstadoId) : null;
						const entidadParaDocumentacion = estadoId || appId;

						Promise.resolve()
							.then(() => persistirDocumentacion(entidadParaDocumentacion))
							.finally(() => {
								setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: error2?.toString() } }));
								onClose(true);
							});
					},
				}));
			},
		}));
	};

	const onGuardaCambios = () => {
		const built = buildPayloads();
		if (!built) return;
		const { appDenunciaPayload, estadoPayload } = built;


		const id = state.form?.id || data?.id;
		if (!id) {
			setState((s) => ({ ...s, errors: { ...s.errors, create: "Falta Id para editar" } }));
			return;
		}

		let lastPersistido = "";
		if (Array.isArray(estadosList) && estadosList.length) {
			try { lastPersistido = String(estadosList.slice().sort((a,b)=> new Date(a.fecha)-new Date(b.fecha)).at(-1)?.estado || "").trim(); } catch { lastPersistido = String(estadosList.at(-1)?.estado || "").trim(); }
		}
		const estadoActualForm = String(state.form?.estado || "").trim();
		const creandoNuevoEstado = estadoActualForm && estadoActualForm !== lastPersistido;
		// Enviar directamente con sendRequest para asegurar la URL con id
		setState((s) => ({ ...s, loading: "Guardando cambios..." }));
		sendRequest(
			{
				baseURL: "App",
				endpoint: `/AppDenuncias/${id}`,
				method: "PUT",
				body: appDenunciaPayload,
				errorType: "response",
			},
			(ok) => {
					// Al actualizar la denuncia, crear un nuevo estado asociado (POST /DenunciasEstados)
				setState((s) => ({ ...s, loading: "Guardando estado...", errors: { ...s.errors, create: null } }));
				const estadoBody = (typeof estadoPayload === "function") ? estadoPayload(id) : null;
				if (estadoBody) {
					sendRequest(
						{
							baseURL: "App",
							endpoint: `/DenunciasEstados`,
							method: "POST",
							body: estadoBody,
							errorType: "response",
						},
						(okEstado) => {
							const rawEstadoId = okEstado?.id ?? okEstado?.Id ?? (Number.isFinite(okEstado) ? okEstado : null);
							const estadoId = rawEstadoId != null ? Number(rawEstadoId) : null;
							const entidadParaDocumentacion = estadoId || id;

							// persistir documentación y cerrar
							Promise.resolve()
									.then(() => persistirDocumentacion(entidadParaDocumentacion, { onlyNew: creandoNuevoEstado }))
								.finally(() => onClose(true));
						},
						(errEstado) => {
							setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: errEstado?.toString() } }));
							Promise.resolve()
									.then(() => persistirDocumentacion(id, { onlyNew: creandoNuevoEstado }))
								.finally(() => onClose(true));
						},
						() => { }
					);
				} else {
					// Si no hay estadoBody, sólo persistir documentación
					Promise.resolve()
							.then(() => persistirDocumentacion(id, { onlyNew: creandoNuevoEstado }))
						.finally(() => onClose(true));
				}
			},
			(error) => {
				setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: error?.toString() } }));
			},
			() => { }
		);
	};

	// Construir título dinámico según el modo (Agregar / Modificar / Consulta)
	const _numeroDenuncia = state.form?.numero || data?.numero || state.form?.id || data?.id || null;
	const _fechaDenunciaRaw = state.form?.fecha || data?.fecha || null;
	const _fechaDenuncia = _fechaDenunciaRaw ? dayjs(_fechaDenunciaRaw).format("DD/MM/YYYY") : null;

	let headerTitle = "Agrega Denuncia";
	if (mode === "M") {
		if (_numeroDenuncia) {
			headerTitle = `Edita Denuncia Nro: ${_numeroDenuncia}${_fechaDenuncia ? ` - ${_fechaDenuncia}` : ""}`;
		} else if (_fechaDenuncia) {
			headerTitle = `Edita Denuncia ${_fechaDenuncia}`;
		} else {
			headerTitle = `Edita Denuncia`;
		}
	} else if (mode === "C" || readOnly) {
		if (_numeroDenuncia) {
			headerTitle = `Consulta Denuncia Nro: ${_numeroDenuncia}${_fechaDenuncia ? ` - ${_fechaDenuncia}` : ""}`;
		} else if (_fechaDenuncia) {
			headerTitle = `Consulta Denuncia ${_fechaDenuncia}`;
		} else {
			headerTitle = `Consulta Denuncia`;
		}
	}

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				{headerTitle}
			</Modal.Header>
			<Modal.Body>
				{content}
				{/* Panel de detalle FUERA del formulario, visible solo en pestaña Novedades */}
				{selectedTab === 2 && selectedEstado && (
					<div style={{
						marginTop: 10,
						border: '1px solid #186090',
						borderRadius: 8,
						padding: '10px 14px',
						background: '#f9fcff',
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
					}}>
						<Grid col gap="6px">
							<Grid style={{ fontWeight: 'bold', color: '#186090' }}>Detalle de la Novedad</Grid>
							<Grid grid="auto / 7fr 1fr" gap="20px" style={{ alignItems: 'stretch' }}>
								{/* Observaciones a la izquierda */}
								<Grid col gap="4px">
									<div style={{ fontWeight: 'bold' }}>Observaciones:</div>
									<div style={{ height: 200, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 13 }}>
										{selectedEstado?.observaciones ? String(selectedEstado.observaciones) : <i>Sin observaciones</i>}
									</div>
								</Grid>
								{/* Documentos a la derecha */}
								<Grid col gap="4px">
									<div style={{ fontWeight: 'bold' }}>Documento:</div>
									<div style={{ height: 200, overflow: 'auto', fontSize: 13 }}>
									{(() => {
										const doc = selectedEstado?._doc;
										const docs = doc ? [doc] : [];
										if (!docs.length) return <i>Sin documentos</i>;
										return (
											<ul style={{ margin: 0, paddingLeft: 18 }}>
												{docs.map((d, i) => {
													const nombre = d?.nombreArchivo ?? d?.fileName ?? `Documento ${i + 1}`;
													const b64 = d?.archivo ?? d?.archivoBase64 ?? d?.contenido;
													const contentType = d?.contentType || 'application/octet-stream';
													const href = d?.url ? d.url : (b64 ? `data:${contentType};base64,${b64}` : null);
													return (
														<li key={i} style={{ marginBottom: 4 }}>
															{href ? (
																<a href={href} target="_blank" rel="noreferrer" download={nombre}>{nombre}</a>
															) : nombre}
														</li>
													);
												})}
											</ul>
										);
									})()}
								</div>
							</Grid>
						</Grid>
					</Grid>
					</div>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Grid grid="auto / 1fr 150px 150px" width col gap="20px">
					<div />
					{!readOnly && selectedTab === 0 && (
						<>
							{mode === "A" && (
								<Button
									className="botonAmarillo"
									onClick={onAgregaDenuncia}
									loading={!!state.loading}
									disabled={!!state.loading}
								>
									AGREGA DENUNCIA
								</Button>
							)}
							{mode === "M" && (
								<Button
									className="botonAmarillo"
									onClick={onGuardaCambios}
									loading={!!state.loading}
									disabled={!!state.loading}
								>
									GUARDAR CAMBIOS
								</Button>
							)}
						</>
					)}
					<Button className="botonAmarillo" onClick={() => onClose(true)}>
						FINALIZA
					</Button>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default DenunciasForm;