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
import css from "./DenunciasForm.module.css";
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

const situacionAltaOptions = [
	{ value: 1, label: "Consultas Salariales" },
	{ value: 2, label: "Reclamos/Diferencias Salariales" },
	{ value: 3, label: "Trabajo NO Registrado" },
	{ value: 4, label: "Maltrato laboral" },
	{ value: 5, label: "Condiciones laborales inaceptables" },
	{ value: 6, label: "Falta de Ropa de Trabajo" },
	{ value: 7, label: "Otras" },
	{ value: 8, label: "Seguridad, higiene y salud en el trabajo." },
	{ value: 9, label: "Condiciones de vivienda, alimentación y traslado." },
	{ value: 10, label: "Indicios de explotación laboral." },
	{ value: 11, label: "Trabajo infantil y adolescente." },
];

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
//#endregion ciiuSelect Options



//#endregion options

const DenunciasForm = ({ data = {}, readOnly = false, onClose = () => { }, onChange = () => { }, initialTab = 0, mode = "A" }) => {

	// Permisos por tareas
	const tareas = useTareasUsuario();
	const puedeVerDatos = tareas?.hasTarea?.("Denuncias_Datos") ?? false;
	const ocultarDatosSensibles = (mode === "C" || mode === "M") && !puedeVerDatos;

	const [selectedTab, setSelectedTab] = useState(initialTab);
	const handleChangeTab = (_e, v) => {
		if ((disableNovedades || mode === "A") && v === 2) return;
		setSelectedTab(v);
	};

	const [disableNovedades, setDisableNovedades] = useState(mode === "A");

	const roStyle = (isRestricted) => (isRestricted ? { opacity: 0.6 } : undefined);
	const isConsulta = mode === "C";

	const safeSelectValue = (selected, options) => {
		const opts = Array.isArray(options) ? options : [];
		if (!selected) return null;
		const selId = selected.value ?? selected.record?.id;
		if (selId == null) return null;
		return opts.find(o => (o.value ?? o.record?.id) === selId) || null;
	};

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

	const getAppDenunciaById = useCallback((id, onSuccess, onError) => {
		if (!id) return onError && onError(new Error('Missing id'));
		sendRequest(
			{ baseURL: 'App', endpoint: `/AppDenuncias/${id}`, method: 'GET', errorType: 'response' },
			onSuccess, onError,
		);
	}, [sendRequest]);

	const putAppDenunciaById = useCallback((id, body, onSuccess, onError) => {
		if (!id) return onError && onError(new Error('Missing id'));
		sendRequest(
			{ baseURL: 'App', endpoint: `/AppDenuncias/${id}`, method: 'PUT', body, errorType: 'response' },
			onSuccess, onError,
		);
	}, [sendRequest]);

	const getRefDelegacionById = useCallback((id, onSuccess, onError) => {
		if (!id) return onError && onError(new Error('Missing id'));
		sendRequest(
			{ baseURL: "Comunes", endpoint: `/RefDelegacion/GetById?Id=${encodeURIComponent(id)}`, method: "GET", errorType: "response" },
			onSuccess, onError,
		);
	}, [sendRequest]);

	const getEmpresaSpecsByCUIT = useCallback((cuitDigits, onSuccess, onError) => {
		if (!cuitDigits) return onError && onError(new Error('Missing CUIT'));
		sendRequest(
			{ baseURL: "Comunes", endpoint: `/Empresas/GetEmpresaSpecs?CUIT=${encodeURIComponent(cuitDigits)}`, method: "GET", errorType: "response" },
			onSuccess, onError,
		);
	}, [sendRequest]);

	const afipConsultaByCUIT = useCallback((cuitDigits, onSuccess, onError) => {
		if (!cuitDigits) return onError && onError(new Error('Missing CUIT'));
		sendRequest(
			{ baseURL: "Comunes", endpoint: `/AFIPConsulta?CUIT=${encodeURIComponent(cuitDigits)}&VerificarHistorico=false`, method: "GET", errorType: "response" },
			onSuccess, onError,
		);
	}, [sendRequest]);

	const saveDocumentacionEntidad = useCallback((payload, onSuccess, onError) => {
		if (!payload) {
			if (onError) onError(new Error('Missing payload'));
			return Promise.reject(new Error('Missing payload'));
		}
		const opts = payload.id
			? { baseURL: "Comunes", endpoint: `/DocumentacionEntidad/${payload.id}`, method: "PUT", body: payload, errorType: "response" }
			: { baseURL: "Comunes", endpoint: `/DocumentacionEntidad`, method: "POST", body: payload, errorType: "response" };
		return new Promise((resolve, reject) => {
			sendRequest(
				opts,
				(res) => { if (onSuccess) try { onSuccess(res); } catch (e) { /* ignore */ } resolve(res); },
				(err) => { if (onError) try { onError(err); } catch (e) { /* ignore */ } reject(err); }
			);
		});
	}, [sendRequest]);

	const [usuariosCache, setUsuariosCache] = useState({});
	const usuariosPending = useRef(new Set());

	const fetchUsuarioById = useCallback((id) => {
		if (!id) return;
		if (usuariosPending.current.has(id)) return; 
		usuariosPending.current.add(id);
		sendRequest(
			{
				baseURL: "Seguridad",
				endpoint: `/Usuario/GetAll?id=${encodeURIComponent(id)}`,
				method: "GET",
				errorType: "response",
			},
			(ok) => {
				try {
					console.debug('[fetchUsuarioById] ok response for', id, ok);
					let first = null;
					if (Array.isArray(ok) && ok.length) first = ok[0];
					else if (ok && Array.isArray(ok.data) && ok.data.length) first = ok.data[0];
					else if (ok && Array.isArray(ok.items) && ok.items.length) first = ok.items[0];
					else if (ok && typeof ok === 'object' && (ok.nombre || ok.Nombre || ok.userName || ok.user)) first = ok;
					const nombre = first ? (first.nombre ?? first.Nombre ?? first.userName ?? first.user ?? String(id)) : String(id);
					setUsuariosCache((prev) => ({ ...prev, [id]: nombre }));
				} finally {
					usuariosPending.current.delete(id);
				}
			},
			() => {
				setUsuariosCache((prev) => ({ ...prev, [id]: String(id) }));
				usuariosPending.current.delete(id);
			}
		);
	}, [sendRequest]);

		// Caché y pending para detalles del estado (cuando no hay documentación asociada)
		const [estadoDetailsCache, setEstadoDetailsCache] = useState({});
		const estadosPending = useRef(new Set());

		const fetchEstadoById = useCallback((id) => {
			if (!id) return;
			if (estadosPending.current.has(id)) return;
			estadosPending.current.add(id);
			sendRequest(
				{
					baseURL: "App",
					endpoint: `/DenunciasEstados/${encodeURIComponent(id)}`,
					method: "GET",
					errorType: "response",
				},
				(ok) => {
					try {
						let data = null;
						if (ok && !Array.isArray(ok) && typeof ok === 'object') data = ok;
						else if (Array.isArray(ok) && ok.length) data = ok[0];
						else if (ok && Array.isArray(ok.data) && ok.data.length) data = ok.data[0];
						else if (ok && Array.isArray(ok.items) && ok.items.length) data = ok.items[0];
						const createdBy = data?.createdBy ?? data?.createdById ?? data?.creadoPor ?? data?.createdByUser ?? null;
						const createdDate = data?.createdDate ?? data?.fecha ?? null;
						setEstadoDetailsCache(prev => ({ ...prev, [id]: { createdBy, createdDate } }));
					} finally {
						estadosPending.current.delete(id);
					}
				},
				() => {
					setEstadoDetailsCache(prev => ({ ...prev, [id]: null }));
					estadosPending.current.delete(id);
				}
			);
		}, [sendRequest]);


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
			fechaIngreso: dayjs().format("YYYY-MM-DD"),
			numeroSeguimiento: "",
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

	const novedadesDisplayRows = useMemo(() => {
		return (Array.isArray(novedadesFilteredRows) ? novedadesFilteredRows : []).map(r => {
			const estadoId = Number(r?.id ?? r?.Id ?? 0) || 0;
			const doc = r?._doc;
			const det = estadoDetailsCache[estadoId];
			const createdBy = doc?.createdBy ?? r?.createdBy ?? (det ? det.createdBy : "");
			const createdDate = doc?.createdDate ?? r?.createdDate ?? (det ? det.createdDate : null);
			const usuarioNombre = createdBy ? (usuariosCache[createdBy] ?? createdBy) : "";
			return { ...r, usuarioNombre, createdBy, createdDate };
		});
	}, [novedadesFilteredRows, usuariosCache, estadoDetailsCache]);

	useEffect(() => {
		if (!Array.isArray(novedadesFilteredRows)) return;
		const faltantes = new Set();
		novedadesFilteredRows.forEach(r => {
			const id = r?._doc?.createdBy ?? r?.createdBy ?? "";
			if (id && !usuariosCache[id] && !usuariosPending.current.has(id)) faltantes.add(id);
		});
		Object.values(estadoDetailsCache).forEach(det => {
			if (det && det.createdBy) {
				const id = det.createdBy;
				if (id && !usuariosCache[id] && !usuariosPending.current.has(id)) faltantes.add(id);
			}
		});
		faltantes.forEach(id => fetchUsuarioById(id));
	}, [novedadesFilteredRows, usuariosCache, estadoDetailsCache, fetchUsuarioById]);

	useEffect(() => {
		if (!Array.isArray(novedadesFilteredRows)) return;
		const faltantesEstados = new Set();
		novedadesFilteredRows.forEach(r => {
			const estadoId = Number(r?.id ?? r?.Id ?? 0) || 0;
			const doc = r?._doc;
			if (!doc && estadoId && estadoDetailsCache[estadoId] === undefined && !estadosPending.current.has(estadoId)) {
				faltantesEstados.add(estadoId);
			}
		});
		faltantesEstados.forEach(id => fetchEstadoById(id));
	}, [novedadesFilteredRows, estadoDetailsCache, fetchEstadoById]);

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
			const key = (d.id ? `ID-${d.id}` : `FN-${(d.nombreArchivo || d.fileName || '').trim()}`);
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
				data={novedadesDisplayRows}
				mostrarBuscar={false}
				pagination={{ size: 10 }}
				noDataIndication={novedadesDisplayRows.length === 0 ? "No existen novedades para mostrar" : null}
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
								// Combinar documentación ya presente en memoria con la cacheada por estado
								let combinados = [...(Array.isArray(documentacionList) ? documentacionList : [])];
								mismos.forEach(id => {
									const docs = Array.isArray(docsByEstadoId[id]) ? docsByEstadoId[id] : [];
									docs.forEach(doc => {
										const key = doc.id ? `ID-${doc.id}` : `FN-${(doc.nombreArchivo || doc.fileName || "").trim()}`;
										if (!combinados.some(d => (d.id ? `ID-${d.id}` : `FN-${(d.nombreArchivo || d.fileName || "").trim()}`) === key)) {
											combinados.push(doc);
										}
									});
								});
								setDocumentacionList(combinados);
								return;
							}
						}
						const entidadId = Number(row?.id ?? row?.Id ?? 0);
						if (entidadId) loadDocumentacion(entidadId);
					},
				}}
				columns={[
					{ dataField: "fecha", text: "Fecha estado", formatter: (v) => Formato.Fecha(v) },
					{ dataField: "estado", text: "Estado", sort: true, style: { textAlign: "left" } },

					{
						dataField: "observaciones", text: "Observaciones", style: { textAlign: "left" }, formatter: (v) => {
							if (!v) return "";
							return String(v);
						}
					},

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

					{
						dataField: "createdBy",
						text: "Usuario",
						formatter: (_value, row) => {
							return row?.usuarioNombre ?? "";
						},
						style: { textAlign: "left" },
					},
					{
						dataField: "createdDate",
						text: "Fecha creación",
						formatter: (value, row) => {
							const doc = row?._doc;
							const fecha = doc?.createdDate ?? value;
							return Formato.Fecha(fecha);
						},
						headerStyle: { width: "160px", textAlign: "center" },
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
		if (onlyNew) lista = lista.filter(d => !d.id);
		const seenIds = new Set();
		lista = lista.filter(doc => {
			if (doc.id) {
				if (seenIds.has(doc.id)) return false;
				seenIds.add(doc.id);
			}
			return true;
		});
		if (lista.length === 0) {
			isPersistingDocsRef.current = false;
			return;
		}
		for (let i = 0; i < lista.length; i++) {
			const item = lista[i];
			const payload = mapDocToPayload(item, entidadId, entidadTipo);
			try {
				const res = await saveDocumentacionEntidad(payload);
				if (!payload.id && res && (res.id || res.Id)) {
					const newId = res.id ?? res.Id;
					setDocumentacionList(prev => {
						const full = Array.isArray(prev) ? prev.slice() : [];
						const matchIndex = full.findIndex(d => {
							if (!d) return false;
							if (d.id && item.id) return d.id === item.id;
							if (!d.id && !item.id) return (d.nombreArchivo === item.nombreArchivo && (d.descripcion || "") === (item.descripcion || ""));
							return false;
						});
						const updatedItem = { ...item, id: newId };
						if (matchIndex === -1) full.push(updatedItem);
						else full[matchIndex] = { ...full[matchIndex], ...updatedItem };
						setState(s => ({ ...s, form: { ...s.form, documentacion: full } }));
						return full;
					});
				}
			} catch (err) {
				console.error(`[persistirDocumentacion] Error procesando archivo ${item.nombreArchivo || '<sin nombre>'}:`, err);
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
		selected: null,
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
		selected: null,
		selectedDef: null,
		origen: "",
	});

	const [serverDerivadoATipo, setServerDerivadoATipo] = useState("Sin datos");
	useEffect(() => {
		const rawSource = [data?.derivadoATipo]
			.map(v => (v == null ? "" : String(v))).find(v => v.trim() !== "") || "";
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
			selected: null,
			selectedDef: null,
			buscar: "",
		}));
		setDelegacionesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setDelegacionSelect((prev) => {
					const n = { ...prev, loading: null, data, error: error?.toString() };
					n.optionsSrc = delegacionSelectOptions(n);
					n.selectedDef = n.optionsSrc.length === 1 ? n.optionsSrc[0] : null;
					n.selected = prev.selected || n.selectedDef;
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
		selected: { record: { id: null } },
		origen: "",
	});
	useEffect(() => {
		setTipoIngresoSelect(o => {
			const options = (o.data || [])
				.map(r => ({ value: r.id, label: r.descripcion, record: r }))
				.filter(opt => includeSearch(opt, o.buscar));
			let selected = o.selected;
			let origen = o.origen;
			if (!selected?.value && selected?.record) {
				const record = selected.record;
				const findFn = record.id != null
					? opt => opt.record.id === record.id
					: record.descripcion != null
						? opt => includeSearch(opt, record.descripcion)
						: null;
				const found = findFn ? options.find(findFn) : null;
				if (found) { selected = found; origen = "option"; }
			}
			return { ...o, options, selected, origen };
		});
	}, [tipoIngresoSelect.buscar, tipoIngresoSelect.data]);

	//#region select situacion tipo
	const [situacionSelect, setSituacionSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: { record: { id: null } },
		origen: "",
	});

	useEffect(() => {
		setSituacionSelect(o => {
			const options = (o.data || [])
				.map(r => ({ value: r.id, label: r.descripcion, record: r }))
				.filter(opt => includeSearch(opt, o.buscar));
			let selected = o.selected;
			let origen = o.origen;
			if (!selected?.value && selected?.record) {
				const record = selected.record;
				const findFn = record.id != null
					? opt => opt.record.id === record.id
					: record.descripcion != null
						? opt => includeSearch(opt, record.descripcion)
						: null;
				const found = findFn ? options.find(findFn) : null;
				if (found) { selected = found; origen = "option"; }
			}
			return { ...o, options, selected, origen };
		});
	}, [situacionSelect.buscar, situacionSelect.data]);

	// Carga inicial del catálogo + preselect por id si viene en `data`
	useEffect(() => {
		if (mode === "A") {
			setSituacionSelect((s) => ({
				...s,
				loading: null,
				data: situacionAltaOptions.map((r) => ({ id: r.value, descripcion: r.label })),
				options: situacionAltaOptions.map((r) => ({
					value: r.value,
					label: r.label,
					record: { id: r.value, descripcion: r.label },
				})),
			}));
			return;
		}

		setDenunciaSituacionQuery(o => ({
			...o,
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : [];
				const merged = [
					...arr,
					...situacionAltaOptions
						.filter((opt) => !arr.some((r) => Number(r.id) === Number(opt.value)))
						.map((opt) => ({ id: opt.value, descripcion: opt.label })),
				];
				const mergedOptions = merged.map((r) => ({
					value: r.id,
					label: r.descripcion,
					record: r,
				}));

				setSituacionSelect(s => ({
					...s,
					loading: null,
					data: merged,
					options: mergedOptions.filter(opt => includeSearch(opt, s.buscar)),
					error: error?.toString(),
				}));
				// Prefill si ya viene un id
				const wantedId = state.form?.denunciaSituacionId ?? data?.denunciaSituacionId;
				if (wantedId) {
					const hit = merged.find(d => Number(d.id) === Number(wantedId));
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
	}, [mode, setDenunciaSituacionQuery, state.form?.denunciaSituacionId, data?.denunciaSituacionId]);



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
		selected: null,
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
		selected: null,
		origen: "",
	});

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
	//Buscamos seccional cabecera y delegacion por localidad
	useEffect(() => {
		const refLocId =
			trabLocaSelect?.selected?.record?.id ??
			state?.form?.refLocalidadIdAfiliado ??
			data?.refLocalidadIdAfiliado ??
			null;

		if (!refLocId) {
			const tieneUbicacion = !!(
				state?.form?.provinciaNombre || data?.provincia ||
				state?.form?.nombreLocalidadAfiliado || data?.localidad
			);
			setState(s => ({
				...s,
				form: {
					...s.form,
					seccionalCabecera: tieneUbicacion ? (s.form?.seccionalCabecera || "Sin datos") : "",
					delegacion: tieneUbicacion ? (s.form?.delegacion || "Sin datos") : "",
				}
			}));
			return;
		}

		setSeccionalLocalidadQuery(o => ({
			...o,
			query: { ...o.query, params: { RefLocalidadId: refLocId, SoloActivos: true } },
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : (ok ? [ok] : []);
				const item = arr[0];

				if (!item) {
					setState(s => ({
						...s,
						form: {
							...s.form,
							seccionalCabecera: s.form?.seccionalCabecera || "Sin datos",
							delegacion: s.form?.delegacion || "Sin datos",
						}
					}));
					return;
				}

				const seccionalCabecera = [item.seccionalCodigo, item.nombre]
					.filter(x => String(x || "").trim() !== "")
					.join(" - ") || "Sin datos";
				setState(s => ({ ...s, form: { ...s.form, seccionalCabecera } }));

				const refDelegacionId = Number(item.refDelegacionId ?? item.RefDelegacionId ?? 0);
				const delegacionDescFallback = item.refDelegacionDescripcion || item.seccionalDescripcion || item.seccionalCodigo || "";

				if (!refDelegacionId) {
					setState(s => ({ ...s, form: { ...s.form, delegacion: delegacionDescFallback } }));
					return;
				}

				getRefDelegacionById(
					refDelegacionId,
					(okDel) => {
						const rec = Array.isArray(okDel) ? okDel[0] : okDel;
						const nombreDeleg = rec?.nombre || rec?.Nombre || "";
						setState(s => ({ ...s, form: { ...s.form, delegacion: nombreDeleg || delegacionDescFallback } }));
					},
					() => setState(s => ({ ...s, form: { ...s.form, delegacion: delegacionDescFallback } }))
				);
			},
		}));
	}, [
		trabLocaSelect?.selected?.record?.id,
		state?.form?.refLocalidadIdAfiliado,
		data?.refLocalidadIdAfiliado,
		data?.localidad,
		data?.provincia,
		state?.form?.nombreLocalidadAfiliado,
		state?.form?.provinciaNombre,
		setSeccionalLocalidadQuery,
		getRefDelegacionById,
	]);

	// Buscador
	useEffect(() => {
		setTrabLocaSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (selected && !selected.value && selected.record && origen !== "text") {
				const record = selected.record;
				const findFn = record.codPostal
					? (o) => o.record.codPostal === record.codPostal
					: (o) => includeSearch(o, record.nombre);
				const hit = options.find(findFn);
				selected = hit ? hit : o.selected;
				if (hit) origen = "option";
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
		selected: null,
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
		selected: null,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEmplLocaSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (selected && !selected.value && selected.record && origen !== "text") {
				const record = selected.record;
				const findFn = record.codPostal
					? (o) => o.record.codPostal === record.codPostal
					: (o) => includeSearch(o, record.nombre);
				const hit = options.find(findFn);
				selected = hit ? hit : o.selected;
				if (hit) origen = "option";
			}
			return { ...o, options, selected, origen };
		});
	}, [emplLocaSelect.buscar, emplLocaSelect.data]);
	//#endregion select localidad


	//#endregion selects empleador

	//Validación de CUIT
	const validateEmpleadorCUIT = useCallback((rawCUIT) => {
		const cuitDigits = onlyDigits(rawCUIT || "");
		if (!cuitDigits) {
			setState((o) => ({
				...o,
				form: { ...o.form, cuitEmpresa: "" },
				errors: { ...o.errors, cuitEmpresa: "" },
				validado: { ...o.validado, empleador: false },
			}));
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

		setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador" }));
		return new Promise((resolve) => {
			getEmpresaSpecsByCUIT(
				cuitDigits,
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
					setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador (AFIP)" }));
					afipConsultaByCUIT(
						cuitDigits,
						(ok) => {
							apply(true, { razonSocial: ok?.razonSocial || ok?.nombre || "", empresaId: 0, cuitEmpresa: cuitDigits });
							setPadronAFIPQuery((o) => ({ ...o, loading: null }));
							return resolve(true);
						},
						(error) => {
							apply(false, {}, error.code === 404 ? "No existe en AFIP" : error.toString());
							setPadronAFIPQuery((o) => ({ ...o, loading: null }));
							return resolve(false);
						}
					);
				},
				() => {
					setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador (AFIP)" }));
					afipConsultaByCUIT(
						cuitDigits,
						(ok) => {
							apply(true, { razonSocial: ok?.razonSocial || ok?.nombre || "", empresaId: 0, cuitEmpresa: cuitDigits });
							setPadronAFIPQuery((o) => ({ ...o, loading: null }));
							return resolve(true);
						},
						(error) => {
							apply(false, {}, error.code === 404 ? "No existe en AFIP" : error.toString());
							setPadronAFIPQuery((o) => ({ ...o, loading: null }));
							return resolve(false);
						}
					);
				}
			);
		});
	}, [setPadronAFIPQuery, getEmpresaSpecsByCUIT, afipConsultaByCUIT]);
	const _prefillNewInitializedRef = useRef(false);
	const _prefillLastIdRef = useRef(null);

	useEffect(() => {
		const currentId = data?.id ?? null;
		if (currentId == null) {
			if (_prefillNewInitializedRef.current) return;
			_prefillNewInitializedRef.current = true;
		} else {
			if (_prefillLastIdRef.current === currentId) return;
			_prefillLastIdRef.current = currentId;
		}

		if (!data || Object.keys(data).length === 0) return;
		const hasCUITProp = Object.prototype.hasOwnProperty.call(data, "empleadorCUIT") || Object.prototype.hasOwnProperty.call(data, "cuitEmpresa");
		const hasRazonProp = Object.prototype.hasOwnProperty.call(data, "empleadorNombre") || Object.prototype.hasOwnProperty.call(data, "razonSocial");
		const nombreFromData = data.nombreDenunciante ?? data.nombre ?? "";
		const telefonoFromData = data.telefonoContacto ?? data.telefono ?? "";
		const correoFromData = data.correoElectronico ?? data.correo ?? "";
		const textoFromData = data.detalleDenuncia ?? data.texto ?? "";
		const situacionFromData = data.denunciaSituacionId ?? data.situacionId ?? 0;
		const cuitFromData = (() => {
			const raw = data.empleadorCUIT ?? data.cuitEmpresa ?? "";
			const digits = onlyDigits(raw);
			return digits === "0" ? "" : digits;
		})();
		const razonFromData = data.empleadorNombre ?? data.razonSocial;

		setState((o) => ({
			...o,
			form: {
				...o.form,
				...data,
				nombre: nombreFromData || o.form.nombre || "",
				nombreDenunciante: nombreFromData || o.form.nombreDenunciante || "",
				telefono: telefonoFromData || o.form.telefono || "",
				telefonoContacto: telefonoFromData || o.form.telefonoContacto || "",
				correo: correoFromData || o.form.correo || "",
				correoElectronico: correoFromData || o.form.correoElectronico || "",
				texto: textoFromData || o.form.texto || "",
				detalleDenuncia: textoFromData || o.form.detalleDenuncia || "",
				denunciaSituacionId: situacionFromData || o.form.denunciaSituacionId || 0,
				derivadaA: data.derivadoATipo ?? data.derivadaATipo ?? data.derivadaA ?? o.form.derivadaA ?? "Sin derivacion",
				derivadaADescripcion: data.derivadaADescripcion ?? data.derivadoATipo ?? o.form.derivadaADescripcion ?? "Sin derivacion",
				cuitEmpresa: hasCUITProp ? cuitFromData : o.form.cuitEmpresa ?? "",
				empleadorCUIT: hasCUITProp ? cuitFromData : o.form?.empleadorCUIT,
				razonSocial: hasRazonProp ? (razonFromData ?? "") : (o.form.razonSocial ?? ""),
				empleadorNombre: hasRazonProp ? (razonFromData ?? "") : o.form?.empleadorNombre,
				...(mode === "M" ? { observacionesRegistro: "" } : {}),
				fecha: data.fecha ? `${data.fecha}`.slice(0, 10) : o.form.fecha,
				fechaIngreso: data.fechaIngreso ? `${data.fechaIngreso}`.slice(0, 10) : "",
				numeroSeguimiento: data.numeroSeguimiento != null ? onlyDigits(data.numeroSeguimiento) : (o.form.numeroSeguimiento || ""),
			},
			validado: readOnly ? { seccionalId: true, fecha: true, trabajador: true, empleador: true } : o.validado,
		}));
	}, [data?.id, readOnly, mode, data]);

	// prefill y bloquear Delegación o Seccional según corresponda
	useEffect(() => {
		if (!(mode === "M" || mode === "C")) return;
		const tipo = serverDerivadoATipo || "Sin datos";
		const destinoId = Number(data?.derivadoAId ?? 0);
		if (!tipo || ["CNTA", "Asesoria Letrada", "Sin datos"].includes(tipo)) return;

		if (tipo === "Delegacion") {
			if (!destinoId) return;
			setDelegacionSelect((o) => ({ ...o, loading: "Cargando...", reload: false }));
			sendRequest(
				{ baseURL: "Comunes", endpoint: `/RefDelegacion/GetById?Id=${encodeURIComponent(destinoId)}`, method: "GET", errorType: "response" },
				(ok) => {
					const dataArr = Array.isArray(ok) ? ok : (ok ? [ok] : []);
					setDelegacionSelect((prev) => {
						const n = { ...prev, loading: null, data: dataArr, error: null };
						n.optionsSrc = delegacionSelectOptions(n);
						const sel = n.optionsSrc.find((p) => Number(p.value) === Number(destinoId)) || n.optionsSrc[0] || null;
						n.selected = sel;
						n.selectedDef = sel;
						return n;
					});
					setState((s) => ({ ...s, form: { ...s.form, delegacionDerivada: (dataArr[0]?.nombre) || s.form.delegacionDerivada || "" } }));
					setLockedDelegacion(true);
				},
				(err) => setDelegacionSelect((prev) => ({ ...prev, loading: null, error: err?.toString() }))
			);
			return;
		}

		if (tipo === "Seccional") {
			if (!destinoId) return;
			setSeccionalSelect((o) => ({ ...o, loading: "Cargando..." }));
			sendRequest(
				{ baseURL: "Afiliaciones", endpoint: `/Seccional/${destinoId}`, method: "GET", errorType: "response" },
				(ok) => {
					const rec = ok || {};
					const dataArr = Array.isArray(rec) ? rec : [rec];
					setSeccionalSelect((prev) => {
						const n = { ...prev, loading: null, data: dataArr, error: null };
						n.options = seccionalesSelectOptions({ data: dataArr, buscar: prev.buscar });
						n.selected = n.options.find((p) => Number(p.value) === Number(destinoId)) || (n.options[0] || null);
						return n;
					});
					setState((s) => ({ ...s, form: { ...s.form, seccional: rec.descripcion || rec.seccional || s.form.seccional || "" } }));
					setLockedSeccional(true);
					const refDelegacionId = rec.refDelegacionId ?? rec.refDelegacion?.id ?? 0;
					if (refDelegacionId) {
						setDelegacionSelect((o) => ({ ...o, loading: "Cargando...", reload: false }));
						sendRequest(
							{ baseURL: "Comunes", endpoint: `/RefDelegacion/GetById?Id=${encodeURIComponent(refDelegacionId)}`, method: "GET", errorType: "response" },
							(okDel) => {
								const dataD = Array.isArray(okDel) ? okDel : (okDel ? [okDel] : []);
								setDelegacionSelect((prev) => {
									const n = { ...prev, loading: null, data: dataD, error: null };
									n.optionsSrc = delegacionSelectOptions(n);
									const sel = n.optionsSrc.find((p) => Number(p.value) === Number(refDelegacionId)) || n.optionsSrc[0] || null;
									n.selected = sel;
									n.selectedDef = sel;
									return n;
								});
								setState((s) => ({ ...s, form: { ...s.form, delegacionDerivada: (dataD[0]?.nombre) || s.form.delegacionDerivada || "" } }));
								setLockedDelegacion(true);
							},
							(err) => setDelegacionSelect((prev) => ({ ...prev, loading: null, error: err?.toString() }))
						);
					}
				},
				(err) => setSeccionalSelect((o) => ({ ...o, loading: null, error: err?.toString() }))
			);
			return;
		}

	}, [mode, data?.derivadoAId, serverDerivadoATipo, sendRequest]);

	// En modo MODIFICAR/CONSULTA: si el endpoint devuelve strings de provincia/localidad, mostrarlos de inmediato
	useEffect(() => {
		if (!data || !(mode === "M" || mode === "C")) return;
		const provinciaLabel = data?.provincia || data?.provinciaNombre || data?.provinciaDescripcion || data?.provinciaNombreAfiliado;
		const provinciaIdData = data?.provinciaId ?? data?.provinciaID ?? null;
		if (provinciaLabel && (!trabPciaSelect.selected || !trabPciaSelect.selected.value)) {
			let provId = Number(provinciaIdData) || 0;
			if (!provId && Array.isArray(trabPciaSelect.data) && trabPciaSelect.data.length) {
				const match = trabPciaSelect.data.find(r => String(r?.nombre || "").toLowerCase() === String(provinciaLabel || "").toLowerCase());
				if (match) provId = Number(match.id) || 0;
			}
			setTrabPciaSelect((o) => ({
				...o,
				selected: { value: provId, label: String(provinciaLabel || ""), record: { id: provId, nombre: provinciaLabel } },
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
	}, [mode, data, state.form, trabPciaSelect.selected, trabPciaSelect.data, trabLocaSelect.selected]);


	// Si estamos en modo ALTA, fijar estado a Registrada (solo para UI, el payload ya cae a 'Registrada' por defecto)
	useEffect(() => {
		if (mode === "A") {
			setState((s) => ({ ...s, form: { ...s.form, estado: s.form?.estado || "Registrada" } }));
		}
	}, [mode]);
	// Utilidad para conocer el último estado registrado
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

	// Si en Consulta/Modificar tenemos provincia y localidad por nombre pero sin ID, resolver ID por nombre y disparar el mapeo
	useEffect(() => {
		if (!(mode === "M" || mode === "C")) return;
		const provinciaIdSel = trabPciaSelect.selected?.value;
		const locName = data?.localidad || data?.nombreLocalidadAfiliado || state.form?.nombreLocalidadAfiliado || state.form?.localidad;
		if (!provinciaIdSel || !locName) return;
		if (state?.form?.refLocalidadIdAfiliado) return; // ya resuelto
		setLocalidadesQuery((o) => ({
			...o,
			query: { ...o.query, params: { ...o.query.params, provinciaId: provinciaIdSel } },
			onPreLoad: () => setTrabLocaSelect((s) => ({ ...s, loading: "Cargando..." })),
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : [];
				const match = arr.find(r => String(r?.nombre || "").toLowerCase() === String(locName || "").toLowerCase());
				setTrabLocaSelect((s) => ({ ...s, data: arr, loading: null, error: error?.toString(), selected: match ? { value: match.id, record: match, label: match.nombre } : s.selected }));
				if (match) {
					setState((st) => ({ ...st, form: { ...st.form, refLocalidadIdAfiliado: match.id, nombreLocalidadAfiliado: match.nombre } }));
				} else {
					// fallback para no dejar vacío
					setState((st) => ({ ...st, form: { ...st.form, delegacion: st.form?.delegacion || "Sin datos" } }));
				}
			}
		}));
	}, [mode, trabPciaSelect.selected?.value, data?.localidad, data?.nombreLocalidadAfiliado, state?.form?.nombreLocalidadAfiliado, state?.form?.localidad, state?.form?.refLocalidadIdAfiliado, setLocalidadesQuery]);
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
				const tieneDelegSeleccionada = !!(delegacionSelect && delegacionSelect.selected && delegacionSelect.selected.value);
				if (!tieneDelegSeleccionada) {
					setDelegacionSelect((o) => ({ ...o, selected: {}, buscar: "" }));
					setState((o) => ({ ...o, form: { ...o.form, delegacionDerivada: "" } }));
				}
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
	}, [state.form.derivadaA, serverDerivadoATipo, seccionalSelect.data, setSeccionalesQuery, delegacionSelect]);



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

		const ESTADO_KEY = state.form?.estado || "Registrada";
		const ESTADO_VALUE = estadoOptions.find(o => o.value === ESTADO_KEY) || null;


		const isRegistrada = String((state.form?.estado || "")).trim() === "Registrada";
		const derivadaPersistida = (serverDerivadoATipo || "Sin datos").trim();
		const derivadaOptionsFor = (tipo) => {
			if (tipo === "Asesoria Letrada") return ["Asesoria Letrada"];
			if (tipo === "CNTA") return ["CNTA"];
			if (tipo === "Seccional") return ["Seccional"];
			if (tipo === "Delegacion") return ["Delegacion", "Seccional"];
			return ["Sin derivacion", "Delegacion", "Seccional", "CNTA", "Asesoria Letrada"];
		};
		const derivadaAOptions = derivadaOptionsFor(derivadaPersistida).map(v => ({ value: v, label: v }));

		const DERIVADA_A_KEY = state.form?.derivadaA || "Sin derivacion";
		const DERIVADA_A_VALUE = derivadaAOptions.find(o => o.value === DERIVADA_A_KEY) || null;

		// Tipo Ingreso / Situación
		const TIPO_INGRESO_KEY = state.form?.denunciaTipoIngresoId || null;
		const TIPO_INGRESO_VALUE = (tipoIngresoSelect?.options || []).find(o => o.value === TIPO_INGRESO_KEY) || null;

		const SITUACION_KEY = state.form?.denunciaSituacionId || null;
		const SITUACION_VALUE = (situacionSelect?.options || []).find(o => o.value === SITUACION_KEY) || null;

		// Delegación / Seccional (derivación)
		const DELEGACION_KEY = (delegacionSelect?.selected?.value != null) ? delegacionSelect.selected.value : null;
		const DELEGACION_VALUE = (delegacionSelect?.options || []).find(o => o.value === DELEGACION_KEY) || null;

		const SECCIONAL_KEY = (seccionalSelect?.selected?.value != null) ? seccionalSelect.selected.value : null;
		const SECCIONAL_VALUE = (seccionalSelect?.options || []).find(o => o.value === SECCIONAL_KEY) || null;

		const lockDerivadaSelectByServer = ["Seccional", "CNTA", "Asesoria Letrada"].includes(derivadaPersistida);

		const lockAllExceptRouting = !isRegistrada;

		const FormularioPanel = (
			<Grid full col gap="10px">
				{/* ====== CABECERA ====== */}
				<Grid col gap="inherit">
					<Grid width gap="inherit">
						{
							(mode === "M" || isConsulta || readOnly || lockAllExceptRouting) ? (
								<InputMaterial
									id="provincia"
									label="Provincia"
									readOnly
									style={roStyle(true)}
									value={state.form?.provinciaNombre || data?.provincia || trabPciaSelect.selected?.label || ""}
								/>
							) : (
								<SearchSelectMaterial
									id="provincia"
									label="Provincia"
									onKeyDown={(e) => { e.preventDefault(); }}
									error={!!(trabPciaSelect.error || state.errors.provincia)}
									helperText={trabPciaSelect.loading ?? trabPciaSelect.error ?? state.errors.provincia}
									value={safeSelectValue(trabPciaSelect.selected, trabPciaSelect.options)}
									onChange={(selected = {}) => {
										setTrabPciaSelect((o) => ({ ...o, selected, origen: "option" }));
										setLocalidadesQuery((o) => ({
											...o,
											query: { ...o.query, params: { ...o.query.params, provinciaId: selected.value } },
											onPreLoad: () => setTrabLocaSelect((s) => ({ ...s, selected: null, loading: "Cargando..." })),
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
										onChange({ provinciaId: selected.value, provinciaNombre: selected.record?.nombre });
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
									error={!!(trabLocaSelect.error || state.errors.localidad)}
									helperText={trabLocaSelect.loading ?? trabLocaSelect.error ?? state.errors.localidad}
									value={null}
									inputValue={trabLocaSelect.buscar}
									onInputChange={(value) => setTrabLocaSelect((o) => ({ ...o, buscar: value, origen: "text" }))}
									onChange={(selected = {}) => {
										setTrabLocaSelect((o) => ({ ...o, selected, origen: "option" }));
										setState((o) => ({
											...o,
											form: { ...o.form, refLocalidadIdAfiliado: selected.record?.id, nombreLocalidadAfiliado: selected.record?.nombre },
											errors: { ...o.errors, localidad: selected?.record?.id ? "" : "Dato requerido" },
										}));
										onChange({ refLocalidadIdAfiliado: selected.record?.id, nombreLocalidadAfiliado: selected.record?.nombre });
									}}
									options={trabLocaSelect.options}
									freeSolo={true}
								/>
							)
						}
					</Grid>
					<Grid width gap="inherit">
						<InputMaterial
							id="seccionalCabecera"
							label="Seccional"
							readOnly
							style={roStyle(true)}
							value={state.form.seccionalCabecera || ""}
						/>
						<InputMaterial
							id="delegacion"
							label="Delegación"
							readOnly
							style={roStyle(true)}
							value={state.form.delegacion || data?.delegacion || ""}
						/>
					</Grid>
				</Grid>

				{/* ====== BLOQUE PRINCIPAL ====== */}
				<Grid col width gap="inherit" className={css.group}>
					<Grid width className={css.titulo}>Carga de Datos</Grid>
					<Grid col gap="inherit">

						<Grid width gap="inherit">
							<InputMaterial
								id="fechaCarga"
								type="date"
								readOnly
								disabled
								style={roStyle(true)}
								label="Fecha de carga"
								value={state.form.fecha || ""}
							/>
							<InputMaterial
								id="fechaIngreso"
								type="date"
								readOnly={isConsulta || readOnly || lockAllExceptRouting}
								disabled={isConsulta || readOnly || lockAllExceptRouting}
								style={roStyle(isConsulta || readOnly || lockAllExceptRouting)}
								label="Fecha de Ingreso"
								value={state.form.fechaIngreso || ""}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, fechaIngreso: v?.format ? v.format("YYYY-MM-DD") : `${v || ""}` } }))}
							/>
							<InputMaterial
								id="numeroSeguimiento"
								readOnly={isConsulta || readOnly || lockAllExceptRouting}
								style={roStyle(isConsulta || readOnly || lockAllExceptRouting)}
								label="Número de seguimiento"
								value={state.form.numeroSeguimiento || ""}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, numeroSeguimiento: onlyDigits(v) } }))}
							/>
						</Grid>

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
								defaultCountry="AR"
								onlyCountries={["AR"]}
								disableDropdown
								forceCallingCode
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
								value={TIPO_INGRESO_VALUE}
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
								value={ocultarDatosSensibles ? null : SITUACION_VALUE}
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

						{/* ---- aqui bug en produccion ---- */}
						{/* Delegación y Seccional (desplegables) Estados y derivados a*/}
						<Grid width gap="inherit">

							<Grid grow> 
								<SearchSelectMaterial
									readOnly={readOnly || mode === "A"}
									id="estado"
									label="Estado"
									onKeyDown={(e) => { e.preventDefault(); }}
									style={roStyle(readOnly || mode === "A")}
									value={ESTADO_VALUE}
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
							{/* ---- aqui bug en produccion ---- */}

							<Grid grow>
								<SearchSelectMaterial
									readOnly={readOnly || state.form.estado !== "Derivada" || lockDerivadaSelectByServer}
									id="derivadaA"
									label="Derivada a"
									onKeyDown={(e) => { e.preventDefault(); }}
									style={roStyle(readOnly || state.form.estado !== "Derivada" || lockDerivadaSelectByServer)}
									value={DERIVADA_A_VALUE}
									options={derivadaAOptions}
									onChange={(selected = {}) => {
											setState((o) => ({
												...o,
												form: {
													...o.form,
													derivadaA: selected?.value,
													derivadaADescripcion: selected?.label,
													derivadoAId: 0,
												},
											}));
											onChange({ derivadaA: selected?.value, derivadaADescripcion: selected?.label });
										}}
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
									value={DELEGACION_VALUE}
									readOnly={lockedDelegacion || !(state.form.derivadaA === "Delegacion" || state.form.derivadaA === "Seccional")}
									freeSolo={false}
									inputReadOnly={true}
									onChange={(selected) => {
										setDelegacionSelect((o) => ({ ...o, selected, error: null, loading: null }));
										// Mantener consistencia inmediata en el form: guardar nombre y id de la delegación derivada
										setState((o) => ({
											...o,
											form: {
												...o.form,
												delegacionDerivada: selected.record?.nombre || selected.label,
												derivadoAId: Number(selected.value || 0),
											},
										}));
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
									value={SECCIONAL_VALUE}
									readOnly={lockedSeccional || state.form.derivadaA !== "Seccional"}
									freeSolo={false}
									inputReadOnly={true}
									onChange={(selected) => {
										setSeccionalSelect((o) => ({ ...o, selected, origen: "option" }));
										if ((state.form?.derivadaA || "") === "Seccional") {
											const selId = Number(selected?.value ?? selected?.record?.id ?? 0) || 0;
											setState(s => ({ ...s, form: { ...s.form, derivadoAId: selId } }));
											onChange({ derivadoAId: selId });
											const prevDer = prevDerivadaARef.current;
											const modoModificar = mode === "M";
											const id = Number(state.form?.id ?? data?.id ?? 0) || 0;
											if (modoModificar && prevDer === "Delegacion" && id && selected?.value) {
												setState(s => ({ ...s, loading: 'Actualizando derivación...' }));
												getAppDenunciaById(
													id,
													(okGet) => {
														try {
															const current = okGet || {};
															const payload = { ...current };
															payload.derivadoATipo = 'Seccional';
															payload.derivadoAId = selId;
															payload.derivadoDelegacion = String(
																delegacionSelect.selected?.record?.nombre ||
																delegacionSelect.selected?.label ||
																payload.derivadoDelegacion || ""
															).trim();
															payload.derivadoSeccional = String(
																selected?.record?.descripcion ||
																(selected?.label || "").split(" - ").slice(1).join(" - ") || ""
															).trim();
															payload.id = Number(id);
															putAppDenunciaById(
																id, payload,
																() => { setState(s => ({ ...s, loading: null })); prevDerivadaARef.current = 'Seccional'; },
																(errPut) => setState(s => ({ ...s, loading: null, errors: { ...s.errors, persist: errPut?.toString() } }))
															);
														} catch (e) {
															setState(s => ({ ...s, loading: null, errors: { ...s.errors, persist: e?.toString() } }));
														}
													},
													(errGet) => setState(s => ({ ...s, loading: null, errors: { ...s.errors, persist: errGet?.toString() } }))
												);
											}
										}
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
				<Documentacion
						data={documentacionList}
							tipoDocumentacion={[
								"Credencial",
								"Documento de Identidad",
								"Actas",
								"Documentos",
								"Recibos",
								"Fotos",
								"Otros",
							]}
							disabled={readOnly}
							onChange={({ index, item }) => {
								const prev = Array.isArray(documentacionList) ? documentacionList : [];

								// === ALTA (CREAR NUEVO ARCHIVO)
								if (index == null && item != null) {
									const temp = [...prev, { ...item }];
									setDocumentacionList(temp);
									setState(s => ({ ...s, form: { ...s.form, documentacion: temp } }));

									// Persistencia diferida: se realiza luego vía persistirDocumentacion
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
					last = String(arr.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).at(-1)?.estado || "").trim();
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
				<div className={css.tabsContent}>
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
			const razonSocial = String(body.razonSocial || "").trim();
			if (!razonSocial) {
				errors.razonSocial = errors.razonSocial || "Dato requerido";
			}
			if (!body.correo) errors.correo = errors.correo || "Dato requerido";
			if (!body.telefono) errors.telefono = errors.telefono || "Dato requerido";
			if (!Number(body.denunciaTipoIngresoId || 0)) {
				errors.tipoIngreso = errors.tipoIngreso || "Dato requerido";
				try { setTipoIngresoSelect(s => ({ ...s, error: "Dato requerido" })); } catch (e) { /*x*/ }
			}
			if (!Number(body.denunciaSituacionId || 0)) {
				errors.situacion = errors.situacion || "Dato requerido";
				try { setSituacionSelect(s => ({ ...s, error: "Dato requerido" })); } catch (e) { /* x */ }
			}
			if (!body.ubicacion) errors.ubicacion = errors.ubicacion || "Dato requerido";
		}


		if (Object.values(errors).some(Boolean)) {
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
		const delegacionNombreDerivada = String(
			delegacionSelect.selected?.record?.nombre ||
			delegacionSelect.selected?.label ||
			data?.derivadoDelegacion ||
			""
		).trim();
		const seccionalNombreDerivada = String(
			seccionalSelect.selected?.record?.descripcion ||
			(seccionalSelect.selected?.label || "").split(" - ").slice(1).join(" - ") ||
			data?.derivadoSeccional ||
			""
		).trim();
		const seccionalSource = String(body.seccionalCabecera || data?.seccional || "").trim();
		const seccionalNombre = seccionalSource.includes(" - ")
			? seccionalSource.split(" - ").slice(1).join(" - ").trim()
			: seccionalSource;

		const delegacionNombreDerivada = String(
			delegacionSelect.selected?.record?.nombre ||
			delegacionSelect.selected?.label ||
			data?.derivadoDelegacion || ""
		).trim();
		const seccionalNombreDerivada = String(
			seccionalSelect.selected?.record?.descripcion ||
			(seccionalSelect.selected?.label || "").split(" - ").slice(1).join(" - ") ||
			data?.derivadoSeccional || ""
		).trim();
		const seccionalSource = String(body.seccionalCabecera || data?.seccional || "").trim();
		const seccionalNombre = seccionalSource.includes(" - ")
			? seccionalSource.split(" - ").slice(1).join(" - ").trim()
			: seccionalSource;

		const appDenunciaPayload = {
			nombre: body.nombre || "",
			correo: body.correo || "",
			telefono: body.telefono || "",
			FechaIngreso: body.fechaIngreso || null,
			NumeroSeguimiento: body.numeroSeguimiento ? Number(body.numeroSeguimiento) : null,
			provincia: trabPciaSelect?.selected?.record?.nombre || data?.provincia || "",
			localidad: trabLocaSelect?.selected?.record?.nombre || data?.localidad || "",
			seccional: seccionalNombre,
			texto: body.texto || "",
			foto: "",
			localidadId: Number(localidadIdSel || 0),
			denunciaTipoIngresoId: Number(body.denunciaTipoIngresoId || 0),
			denunciaTipoId: 0,
			derivadoATipo: derivadoATipoValue,
			derivadoAId: derivadoAIdValue,
			derivadoDelegacion: ["Delegacion", "Seccional"].includes(derivadoATipoValue) ? delegacionNombreDerivada : "",
			derivadoSeccional: derivadoATipoValue === "Seccional" ? seccionalNombreDerivada : "",
			documentacionEntidadesId: 0,
			denunciaSituacionId: Number(body.denunciaSituacionId || 0),
			empleadorCUIT: body.cuitEmpresa ? Number(body.cuitEmpresa) : null,
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
			try { lastPersistido = String(estadosList.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).at(-1)?.estado || "").trim(); } catch { lastPersistido = String(estadosList.at(-1)?.estado || "").trim(); }
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
			(_ok) => {
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
					<div className={css.novedadDetalle}>
						<Grid col gap="6px">
							<Grid className={css.novedadTitulo}>Detalle de la Novedad</Grid>
							<Grid grid="auto / 7fr 1fr" gap="20px" className={css.novedadGrid}>
								{/* Observaciones a la izquierda */}
								<Grid col gap="4px">
									<div className={css.fieldLabel}>Observaciones:</div>
									<div className={css.observacionesContenido}>
										{selectedEstado?.observaciones ? String(selectedEstado.observaciones) : <i>Sin observaciones</i>}
									</div>
								</Grid>
								{/* Documentos a la derecha */}
								<Grid col gap="4px">
									<div className={css.fieldLabel}>Documento:</div>
									<div className={css.documentoContenido}>
										{(() => {
											const doc = selectedEstado?._doc;
											const docs = doc ? [doc] : [];
											if (!docs.length) return <i>Sin documentos</i>;
											return (
												<ul className={css.documentoLista}>
													{docs.map((d, i) => {
														const nombre = d?.nombreArchivo ?? d?.fileName ?? `Documento ${i + 1}`;
														const b64 = d?.archivo ?? d?.archivoBase64 ?? d?.contenido;
														const contentType = d?.contentType || 'application/octet-stream';
														const href = d?.url ? d.url : (b64 ? `data:${contentType};base64,${b64}` : null);
														return (
															<li key={i} className={css.documentoItem}>
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