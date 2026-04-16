import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import { isPossiblePhoneNumber } from "libphonenumber-js";
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
import { Tabs, Tab } from "@mui/material";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import classes from "./DenunciasForm.module.css";
import DenunciasFormNovedades from "./DenunciasFormNovedades";
import DenunciasFormDocumentaicon from "./DenunciasFormDocumentaicon";


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

const DenunciasForm = ({ data = {}, readOnly = false, onClose = () => { }, onChange = () => { }, initialTab = 0, mode = "A" }) => {

	// TAREAS
	const tareas = useTareasUsuario();
	const puedeVerDatos = tareas?.hasTarea?.("Denuncias_Datos") ?? false;
	const ocultarDatosSensibles = (mode === "C" || mode === "M") && !puedeVerDatos;
	const [selectedTab, setSelectedTab] = useState(initialTab);
	const handleChangeTab = (_e, v) => {
		if ((disableNovedades || mode === "A") && v === 2) return;
		setSelectedTab(v);
	};

	const [disableNovedades, setDisableNovedades] = useState(mode === "A");
	const roClass = (isRestricted) => (isRestricted ? classes.readOnly : "");
	const isConsulta = mode === "C";

	useEffect(() => {
		// Si entramos en alta, mantener deshabilitada la pestaña Novedades
		if (mode === "A") setDisableNovedades(true);
	}, [mode]);

	//#region APIs
	const { setState: setSeccionalesQuery } = useQueryState(
		() => ({
			config: { baseURL: "Afiliaciones", endpoint: `/Seccional`, method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" }, params: { soloActivos: true } } }
	);
	const { setState: setProvinciasQuery } = useQueryState(
		() => ({
			config: { baseURL: "Afiliaciones", endpoint: `/Provincia`, method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setLocalidadesQuery } = useQueryState(
		() => ({
			config: { baseURL: "Afiliaciones", endpoint: `/RefLocalidad`, method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setDelegacionesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes", endpoint: `/RefDelegacion/GetAll`, method: "GET",
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
					baseURL: "Comunes", endpoint: `/AFIPConsulta`, method: "GET",
				},
			}),
			{
				query: {
					params: { verificarHistorico: false }, config: { errorType: "response" },
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
			onSuccess,
			onError,
		);
	}, [sendRequest]);

	const putAppDenunciaById = useCallback((id, body, onSuccess, onError) => {
		if (!id) return onError && onError(new Error('Missing id'));
		sendRequest(
			{ baseURL: 'App', endpoint: `/AppDenuncias/${id}`, method: 'PUT', body, errorType: 'response' },
			onSuccess,
			onError,
		);
	}, [sendRequest]);

	const { setState: setCreateEstadoQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: "/DenunciasEstados", method: "POST" }
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const { setState: setGetEstadosQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: "/DenunciasEstados", method: "GET" },
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const [documentacionList, setDocumentacionList] = useState([]);
	const [estadosList, setEstadosList] = useState([]);
	const [selectedEstado, setSelectedEstado] = useState(null);
	const [overrideDocsPorNuevoEstado, setOverrideDocsPorNuevoEstado] = useState(false);
	const [docsByEstadoId, setDocsByEstadoId] = useState({});
	const { setState: setDocumentosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes", endpoint: `/DocumentacionEntidad/GetBySpec`, method: "GET",
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
			}
		}));
	}, [setDocumentosQuery]);

	const loadDocumentacionCacheOnly = useCallback((entidadId) => {
		if (!entidadId) return;
		if (docsByEstadoId[entidadId]) return;
		sendRequest(
			{
				baseURL: "Comunes", endpoint: `/DocumentacionEntidad/GetBySpec?EntidadId=${entidadId}&EntidadTipo=R`, method: "GET", errorType: "response",
			},
			(ok) => {
				const arr = (Array.isArray(ok) ? ok : []).map(d => ({ ...d, originalEntidadId: d.entidadId ?? d.EntidadId }));
				setDocsByEstadoId(prev => ({ ...prev, [entidadId]: arr }));
			},
			() => setDocsByEstadoId(prev => ({ ...prev, [entidadId]: [] }))
		);
	}, [sendRequest, docsByEstadoId]);

	const fetchDocumentacionEntidadBySpec = useCallback((entidadId, onSuccess, onError) => {
		if (!entidadId) return onError && onError(new Error('Missing id'));
		sendRequest(
			{
				baseURL: "Comunes", endpoint: `/DocumentacionEntidad/GetBySpec?EntidadId=${entidadId}&EntidadTipo=R`, method: "GET", errorType: "response",
			},
			onSuccess,
			onError,
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
				(res) => {
					if (onSuccess) try { onSuccess(res); } catch (e) { /* ignore */ }
					resolve(res);
				},
				(err) => {
					if (onError) try { onError(err); } catch (e) { /* ignore */ }
					reject(err);
				}
			);
		});
	}, [sendRequest]);

	const getRefDelegacionById = useCallback((id, onSuccess, onError) => {
		if (!id) return onError && onError(new Error('Missing id'));
		sendRequest(
			{ baseURL: "Comunes", endpoint: `/RefDelegacion/GetById?Id=${encodeURIComponent(id)}`, method: "GET", errorType: "response" },
			onSuccess,
			onError,
		);
	}, [sendRequest]);

	const getEmpresaSpecsByCUIT = useCallback((cuitDigits, onSuccess, onError) => {
		if (!cuitDigits) return onError && onError(new Error('Missing CUIT'));
		sendRequest(
			{ baseURL: "Comunes", endpoint: `/Empresas/GetEmpresaSpecs?CUIT=${encodeURIComponent(cuitDigits)}`, method: "GET", errorType: "response" },
			onSuccess,
			onError,
		);
	}, [sendRequest]);

	const afipConsultaByCUIT = useCallback((cuitDigits, onSuccess, onError) => {
		if (!cuitDigits) return onError && onError(new Error('Missing CUIT'));
		sendRequest(
			{ baseURL: "Comunes", endpoint: `/AFIPConsulta?CUIT=${encodeURIComponent(cuitDigits)}&VerificarHistorico=false`, method: "GET", errorType: "response" },
			onSuccess,
			onError,
		);
	}, [sendRequest]);

	const { setState: setSeccionalLocalidadQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones", endpoint: `/SeccionalLocalidad/GetSeccionalLocalidadByRefLocalidadId`, method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

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
							observacionesRegistro:
								(mode === "M")
									? ""
									: (last?.observaciones ?? s.form.observacionesRegistro),
						},
					}));
					const estadoId = Number(last?.id ?? last?.Id ?? 0);
					loadDocumentacion(estadoId || entidadId);
				} else {
					loadDocumentacion(entidadId);
				}
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
			fetchDocumentacionEntidadBySpec(
				id,
				(ok) => {
					const arr = (Array.isArray(ok) ? ok : []).map(d => ({ ...d, originalEntidadId: d.entidadId ?? d.EntidadId }));
					setDocsByEstadoId((prev) => ({ ...prev, [id]: arr }));
				},
				() => setDocsByEstadoId((prev) => ({ ...prev, [id]: [] }))
			);
		});
	}, [estadosList, sendRequest, docsByEstadoId]);

	// Mapeo documentacion
	const compact = (obj) => Object.fromEntries(
		Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
	);

	// Normaliza el value para Autocomplete
	const safeSelectValue = (selected, options) => {
		const opts = Array.isArray(options) ? options : [];
		if (!selected) return null;
		const selId = selected.value ?? selected.record?.id;
		if (selId == null) return null;
		const found = opts.find(o => (o.value ?? o.record?.id) === selId);
		return found || null;
	};

	const mapDocToPayload = (item, entidadId, entidadTipo) => {
		const refTipoDocumentacionId =
			item?.refTipoDocumentacionId;
		const rawBase64 = (
			item?.archivo ??
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

	//Derivada a
	const [serverDerivadoATipo, setServerDerivadoATipo] = useState("Sin datos");
	useEffect(() => {

		const rawSource = [
			data?.derivadoATipo,
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
					const n = {
						...prev,
						loading: null,
						data: data,
						error: error?.toString(),
					};
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
		const nextSelected = opts.length === 1 ? opts[0] : (seccionalSelect.selected?.value ? (opts.find((p) => p.value === seccionalSelect.selected.value) ?? seccionalSelect.selected) : seccionalSelect.selected);
		setSeccionalSelect((o) => ({ ...o, options: opts, selected: nextSelected }));
		if (opts.length === 1) {
			const sel = opts[0];
			setState((o) => ({ ...o, form: { ...o.form, seccional: sel.record?.descripcion || sel.label } }));
		}
	}, [delegacionSelect.selected, seccionalSelect.data, seccionalSelect.buscar, seccionalSelect.selected]);
	//#region selects trabajad

	// Select: Tipo de ingreso
	const [tipoIngresoSelect, setTipoIngresoSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		// Al iniciar, guardo solo el id que viene del form en record.id
		selected: {
			record: {
				id: state?.form?.denunciaTipoIngresoId ?? data?.denunciaTipoIngresoId ?? null,
			},
		},
		origen: "",
	});

	useEffect(() => {
		setTipoIngresoSelect(o => {
			const options = (o.data || [])
				.map(r => ({
					value: r.id,
					label: r.descripcion,
					record: r,
				}))
				.filter(opt => includeSearch(opt, o.buscar));

			let selected = o.selected;
			let origen = o.origen;
			if (!selected?.value && selected?.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? opt => opt.record.id === record.id
						: record.descripcion != null
							? opt => includeSearch(opt, record.descripcion)
							: null;

				const found = findFn ? options.find(findFn) : null;
				if (found) {
					selected = found;
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [tipoIngresoSelect.buscar, tipoIngresoSelect.data]);

	// Select: Situación
	const [situacionSelect, setSituacionSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {
			record: {
				id: state?.form?.denunciaSituacionId ?? data?.denunciaSituacionId ?? null,
			},
		},
		origen: "",
	});

	useEffect(() => {
		setSituacionSelect(o => {
			const options = (o.data || [])
				.map(r => ({
					value: r.id,
					label: r.descripcion,
					record: r,
				}))
				.filter(opt => includeSearch(opt, o.buscar));

			let selected = o.selected;
			let origen = o.origen;

			if (!selected?.value && selected?.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? opt => opt.record.id === record.id
						: record.descripcion != null
							? opt => includeSearch(opt, record.descripcion)
							: null;

				const found = findFn ? options.find(findFn) : null;
				if (found) {
					selected = found;
					origen = "option";
				} else {
					selected = o.selected;
				}
			}

			return { ...o, options, selected, origen };
		});
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
	}
	);
	//Buscamos delegacion
	useEffect(() => {
		const refLocId =
			trabLocaSelect?.selected?.record?.id ??
			state?.form?.refLocalidadIdAfiliado ??
			data?.refLocalidadIdAfiliado ??
			null;

		if (!refLocId) {
			// Si hay provincia/localidad visibles, nunca dejar vacío: usar fallback "Sin datos"
			const tieneUbicacion = !!(
				state?.form?.provinciaNombre ||
				data?.provincia ||
				state?.form?.nombreLocalidadAfiliado ||
				data?.localidad
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
					.filter((x) => String(x || "").trim() !== "")
					.join(" - ") || "Sin datos";
				setState(s => ({ ...s, form: { ...s.form, seccionalCabecera } }));

				const refDelegacionId = Number(item.refDelegacionId ?? item.RefDelegacionId ?? 0);
				const delegacionDescFallback =
					item.refDelegacionDescripcion || item.seccionalDescripcion || item.seccionalCodigo || "";


				if (!refDelegacionId) {
					setState(s => ({ ...s, form: { ...s.form, delegacion: delegacionDescFallback } }));
					return;
				}

				// pedir DELEGACIÓN por id y tomar su nombre
				getRefDelegacionById(
					refDelegacionId,
					(okDel) => {
						const rec = Array.isArray(okDel) ? okDel[0] : okDel;
						const nombreDeleg = rec?.nombre || rec?.Nombre || "";

						if (!nombreDeleg) {
							setState(s => ({ ...s, form: { ...s.form, delegacion: delegacionDescFallback } }));
							return;
						}

						setState(s => ({ ...s, form: { ...s.form, delegacion: nombreDeleg } }));
					},
					(err) => {
						setState(s => ({ ...s, form: { ...s.form, delegacion: delegacionDescFallback } }));
					}
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
		sendRequest,
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
				if (hit) {
					origen = "option";
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [trabLocaSelect.buscar, trabLocaSelect.data]);
	//#endregion select localidad

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
				if (hit) {
					origen = "option";
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
		selected: null,
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

		// 1) Buscar primero en Empresas
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
						// 2) Fallback a AFIP
						setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador (AFIP)" }));
						afipConsultaByCUIT(
							cuitDigits,
							(ok) => {
								apply(true, {
									razonSocial: ok?.razonSocial || ok?.nombre || "",
									empresaId: 0,
									cuitEmpresa: cuitDigits,
								});
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
					(errEmp) => {
						setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador (AFIP)" }));
						afipConsultaByCUIT(
							cuitDigits,
							(ok) => {
								apply(true, {
									razonSocial: ok?.razonSocial || ok?.nombre || "",
									empresaId: 0,
									cuitEmpresa: cuitDigits,
								});
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
	}, [setPadronAFIPQuery, sendRequest]);

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
			// Pedir solo la delegación indicada y seleccionarla, bloquear el campo
			setDelegacionSelect((o) => ({ ...o, loading: "Cargando...", reload: false }));
			sendRequest(
				{
					baseURL: "Comunes",
					endpoint: `/RefDelegacion/GetById?Id=${encodeURIComponent(destinoId)}`,
					method: "GET",
					errorType: "response",
				},
				(ok, _err) => {
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
				(err) => {
					setDelegacionSelect((prev) => ({ ...prev, loading: null, error: err?.toString() }));
				}
			);
			return;
		}

		if (tipo === "Seccional") {
			if (!destinoId) return;
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
						n.selected = n.options.find((p) => Number(p.value) === Number(destinoId)) || (n.options[0] || null);
						return n;
					});
					setState((s) => ({ ...s, form: { ...s.form, seccional: rec.descripcion || rec.seccional || s.form.seccional || "" } }));
					setLockedSeccional(true);
					const refDelegacionId = rec.refDelegacionId ?? rec.refDelegacion?.id ?? 0;
					if (refDelegacionId) {
						setDelegacionSelect((o) => ({ ...o, loading: "Cargando...", reload: false }));
						sendRequest(
							{
								baseURL: "Comunes",
								endpoint: `/RefDelegacion/GetById?Id=${encodeURIComponent(refDelegacionId)}`,
								method: "GET",
								errorType: "response",
							},
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
							(err) => {
								setDelegacionSelect((prev) => ({ ...prev, loading: null, error: err?.toString() }));
							}
						);
					}
				},
				(err) => {
					setSeccionalSelect((o) => ({ ...o, loading: null, error: err?.toString() }));
				}
			);
			return;
		}

	}, [mode, data?.derivadoAId, serverDerivadoATipo, setDelegacionesQuery, sendRequest]);

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

	useEffect(() => {
		if (!(mode === "M" || mode === "C")) return;
		const provinciaIdSel = trabPciaSelect.selected?.value;
		const locName = data?.localidad || data?.nombreLocalidadAfiliado || state.form?.nombreLocalidadAfiliado || state.form?.localidad;
		if (!provinciaIdSel || !locName) return;
		if (state?.form?.refLocalidadIdAfiliado) return;
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

	const prevDerivadaARef = useRef(state.form.derivadaA);
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
		if (!derivada || derivada === "Sin derivacion") {
			setLockedDelegacion(lockDeleg);
			setLockedSeccional(lockSecc);
			if (!lockDeleg) {
				setDelegacionSelect((o) => ({ ...o, selected: null, buscar: "", error: null }));
				setState((o) => ({ ...o, form: { ...o.form, delegacionDerivada: "" } }));
			}
			if (!lockSecc) {
				setSeccionalSelect((o) => ({ ...o, selected: null, options: [], buscar: "", error: null }));
				setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			}
			prevDerivadaARef.current = derivada;
			return;
		}
		// Derivada a Delegacion: permitir elegir delegación solo si BD NO la fijó como Delegacion
		if (derivada === "Delegacion") {
			if (derivadaCambio && prevDerivada !== "Delegacion" && !lockSecc) {
				setSeccionalSelect((o) => ({ ...o, selected: null, options: [], buscar: "" }));
				setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			}
			setLockedDelegacion(lockDeleg);
			setLockedSeccional(lockSecc);
			if (!lockSecc) {
				setSeccionalSelect((o) => ({ ...o, selected: null, options: [] }));
				setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			}
			prevDerivadaARef.current = derivada;
			return;
		}
		// Derivada a Seccional:
		if (derivada === "Seccional") {
			if (derivadaCambio && prevDerivada !== "Seccional" && !lockDeleg) {
				const tieneDelegSeleccionada = !!(delegacionSelect && delegacionSelect.selected && delegacionSelect.selected.value);
				const derivadoAIdFromState = Number(state?.form?.derivadoAId ?? data?.derivadoAId ?? 0) || 0;
				if (derivadoAIdFromState && !tieneDelegSeleccionada) {
					setDelegacionSelect((o) => ({ ...o, loading: "Cargando...", reload: false }));
					sendRequest(
						{
							baseURL: "Comunes",
							endpoint: `/RefDelegacion/GetById?Id=${encodeURIComponent(derivadoAIdFromState)}`,
							method: "GET",
							errorType: "response",
						},
						(okDel) => {
							const dataArr = Array.isArray(okDel) ? okDel : (okDel ? [okDel] : []);
							setDelegacionSelect((prev) => {
								const n = { ...prev, loading: null, data: dataArr, error: null };
								n.optionsSrc = delegacionSelectOptions(n);
								const sel = n.optionsSrc.find((p) => Number(p.value) === Number(derivadoAIdFromState)) || n.optionsSrc[0] || null;
								n.selected = sel;
								n.selectedDef = sel;
								return n;
							});
							setState((s) => ({ ...s, form: { ...s.form, delegacionDerivada: (dataArr[0]?.nombre) || s.form.delegacionDerivada || "" } }));
							setLockedDelegacion(true);
						},
						(err) => {
							setDelegacionSelect((prev) => ({ ...prev, loading: null, error: err?.toString() }));
						}
					);
				} else {
					if (!tieneDelegSeleccionada) {
						setDelegacionSelect((o) => ({ ...o, selected: null, buscar: "" }));
						setState((o) => ({ ...o, form: { ...o.form, delegacionDerivada: "" } }));
					}
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

			prevDerivadaARef.current = derivada;
			return;
		}

		// Para cualquier otro destino (CTNA / Asesoria Letrada) limpiar ambos si cambió
		if (derivadaCambio && !["Delegacion", "Seccional"].includes(derivada)) {
			if (!lockDeleg) {
				setDelegacionSelect((o) => ({ ...o, selected: null, buscar: "" }));
				setState((o) => ({ ...o, form: { ...o.form, delegacionDerivada: "" } }));
			}
			if (!lockSecc) {
				setSeccionalSelect((o) => ({ ...o, selected: null, options: [], buscar: "" }));
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
		const estadoSelect = {
			options: estadoOptions,
			selected: estadoOptions.find(o => o.value === (state.form?.estado || "Registrada")) || null,
		};

		const isRegistrada = String((state.form?.estado || "")).trim() === "Registrada";
		const derivadaPersistida = (serverDerivadoATipo || "Sin datos").trim();
		const derivadaOptionsFor = (tipo) => {
			if (tipo === "Asesoria Letrada") return ["Asesoria Letrada"];
			if (tipo === "CNTA") return ["CNTA"];
			if (tipo === "Seccional") return ["Seccional"];
			if (tipo === "Delegacion") return ["Delegacion", "Seccional"];
			return [
				"Sin derivacion",
				"Delegacion",
				"Seccional",
				"CNTA",
				"Asesoria Letrada",
			];
		};
		const derivadaAOptions = derivadaOptionsFor(derivadaPersistida).map(v => ({ value: v, label: v }));

		const derivadaSelect = {
			options: derivadaAOptions,
			selected: derivadaAOptions.find(o => o.value === (state.form?.derivadaA || "Sin derivacion")) || null,
		};

		const lockDerivadaSelectByServer = ["Seccional", "CNTA", "Asesoria Letrada"].includes(derivadaPersistida);

		const lockAllExceptRouting = !isRegistrada;

		const FormularioPanel = (
			<Grid full col gap="10px">
				{/* ====== CABECERA (nueva UI: SIN Seccional y SIN Fecha) ====== */}
				<Grid col gap="inherit">
					<Grid width gap="inherit">
					{
						(mode === "M" || isConsulta || readOnly || lockAllExceptRouting) ? (
							<InputMaterial
								id="provincia"
								label="Provincia"
								readOnly
								className={roClass(true)}
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
								className={roClass(true)}
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
						className={roClass(true)}
						value={state.form.seccionalCabecera || ""}
					/>
					<InputMaterial
						id="delegacion"
						label="Delegación"
						readOnly
						className={roClass(true)}
						value={state.form.delegacion || data?.delegacion || ""}
					/>
					</Grid>
				</Grid>

				{/* ====== BLOQUE PRINCIPAL ====== */}
				<Grid col width gap="inherit" className={classes.group}>
					<Grid width className={classes.titulo}>Carga de Datos</Grid>
					<Grid col gap="inherit">
						<Grid width gap="inherit">
							<InputMaterial
								id="fechaCarga"
								type="date"
								readOnly
								disabled
								className={roClass(true)}
								label="Fecha de carga"
								value={state.form.fecha || ""}
							/>
							<InputMaterial
								id="fechaIngreso"
								type="date"
								readOnly={isConsulta || readOnly || lockAllExceptRouting}
								disabled={isConsulta || readOnly || lockAllExceptRouting}
								className={roClass(isConsulta || readOnly || lockAllExceptRouting)}
								label="Fecha de Ingreso"
								value={state.form.fechaIngreso || ""}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, fechaIngreso: v?.format ? v.format("YYYY-MM-DD") : `${v || ""}` } }))}
							/>
							<InputMaterial
								id="numeroSeguimiento"
								readOnly={isConsulta || readOnly || lockAllExceptRouting}
								className={roClass(isConsulta || readOnly || lockAllExceptRouting)}
								label="Número de seguimiento"
								value={state.form.numeroSeguimiento || ""}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, numeroSeguimiento: onlyDigits(v) } }))}
							/>
						</Grid>

						<Grid width gap="inherit">
							<InputMaterial
								id="nombre"
								readOnly={isConsulta || readOnly || lockAllExceptRouting || ocultarDatosSensibles}
								className={roClass(isConsulta || readOnly || lockAllExceptRouting || ocultarDatosSensibles)}
								label="Nombre Denunciante"
								value={ocultarDatosSensibles ? "" : state.form.nombre}
								error={!!state.errors.nombre}
								helperText={state.errors.nombre}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, nombre: v } }))}
							/>
							<InputMaterial
								id="telefono"
								readOnly={isConsulta || readOnly || lockAllExceptRouting}
								className={roClass(isConsulta || readOnly || lockAllExceptRouting)}
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
								className={roClass(isConsulta || readOnly || lockAllExceptRouting || ocultarDatosSensibles)}
								label="Correo electrónico"
								value={ocultarDatosSensibles ? "" : state.form.correo}
								error={!!state.errors.correo}
								helperText={state.errors.correo}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, correo: v } }))}
							/>
						</Grid>


						<Grid width gap="inherit">
							<SearchSelectMaterial
								id="tipoIngreso"
								readOnly={isConsulta || readOnly || lockAllExceptRouting}
								className={roClass(isConsulta || readOnly || lockAllExceptRouting)}
								label="Tipo de Ingreso"
								onKeyDown={(e) => { e.preventDefault(); }}
								error={!!tipoIngresoSelect.error}
								helperText={tipoIngresoSelect.loading ?? tipoIngresoSelect.error}
								value={safeSelectValue(tipoIngresoSelect.selected, tipoIngresoSelect.options)}
								options={tipoIngresoSelect.options}
								freeSolo={false}
								inputReadOnly={true}
								onChange={(selected = {}) => {
									setTipoIngresoSelect(o => ({ ...o, selected, origen: "option", error: null }));
									setState(o => ({
										...o,
										form: {
											...o.form,
											denunciaTipoIngresoId: Number(selected?.value || 0),
											tipoIngresoDescripcion: selected?.label || "",
										},
										errors: { ...o.errors, tipoIngreso: "" },
									}));
									onChange({ denunciaTipoIngresoId: Number(selected?.value || 0), tipoIngresoDescripcion: selected?.label || "" });
								}}
								onTextChange={(buscar) => setTipoIngresoSelect(o => ({ ...o, buscar, origen: "text" }))}
							/>
							<SearchSelectMaterial
								id="situacion"
								readOnly={readOnly || lockAllExceptRouting || ocultarDatosSensibles}
								className={roClass(readOnly || lockAllExceptRouting || ocultarDatosSensibles)}
								label="Situación"
								onKeyDown={(e) => { e.preventDefault(); }}
								error={!!situacionSelect.error}
								helperText={situacionSelect.loading ?? situacionSelect.error}
								value={ocultarDatosSensibles ? null : safeSelectValue(situacionSelect.selected, situacionSelect.options)}
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
									onChange({ denunciaSituacionId: Number(selected?.value || 0), situacionDescripcion: selected?.label || "" });
								}}
								onTextChange={(buscar) => setSituacionSelect(o => ({ ...o, buscar, origen: "text" }))}
							/>
							<InputMaterial
								id="ubicacion"
								readOnly={readOnly || lockAllExceptRouting || ocultarDatosSensibles}
								className={roClass(readOnly || lockAllExceptRouting || ocultarDatosSensibles)}
								label="Ubicación"
								value={ocultarDatosSensibles ? "" : state.form.ubicacion}
								error={!!state.errors.ubicacion}
								helperText={state.errors.ubicacion}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, ubicacion: v } }))}
							/>
						</Grid>

						<Grid gap="inherit">
							<Grid width="200px">
								<InputMaterial
									id="cuitEmpresa"
									readOnly={isConsulta || readOnly || lockAllExceptRouting}
									className={roClass(isConsulta || readOnly || lockAllExceptRouting)}
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
									className={roClass(readOnly || lockAllExceptRouting)}
									label="Razón Social Empleador"
									value={state.form.razonSocial}
									error={!!state.errors.razonSocial}
									helperText={state.errors.razonSocial}
									onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, razonSocial: v } }))}
								/>
							</Grid>
						</Grid>

						<Grid width>
							<InputMaterial
								id="detalleDenuncia"
								readOnly={readOnly || lockAllExceptRouting}
								className={roClass(readOnly || lockAllExceptRouting)}
								label="Detalle de la denuncia"
								multiline
								rows={6}
								value={state.form.texto}
								error={!!state.errors.texto}
								helperText={state.errors.texto}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, texto: v } }))}
							/>
						</Grid>

						<Grid width gap="inherit">

							<Grid grow>
								<SearchSelectMaterial
									readOnly={readOnly || mode === "A"}
									id="estado"
									label="Estado"
									onKeyDown={(e) => { e.preventDefault(); }}
									className={roClass(readOnly || mode === "A")}
									value={estadoSelect.selected}
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
										if (shouldResetDerivacion) {
											if (!lockedDelegacion) setDelegacionSelect((o) => ({ ...o, selected: null, error: null }));
											if (!lockedSeccional) setSeccionalSelect((o) => ({ ...o, selected: null, error: null }));
										}
										onChange({ estado: selected?.value, estadoDescripcion: selected?.label });
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
									className={roClass(readOnly || state.form.estado !== "Derivada" || lockDerivadaSelectByServer)}
									value={derivadaSelect.selected} options={derivadaAOptions}
									onChange={(selected = {}) => { setState((o) => ({ ...o, form: { ...o.form, derivadaA: selected?.value, derivadaADescripcion: selected?.label } })); onChange({ derivadaA: selected?.value, derivadaADescripcion: selected?.label }); }
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
									className={roClass(lockedDelegacion || !(state.form.derivadaA === "Delegacion" || state.form.derivadaA === "Seccional"))}
									error={!!delegacionSelect.error}
									helperText={delegacionSelect.loading ?? (delegacionSelect.selected?.value ? null : delegacionSelect.error)}
									value={safeSelectValue(delegacionSelect.selected, delegacionSelect.options)}
									readOnly={lockedDelegacion || !(state.form.derivadaA === "Delegacion" || state.form.derivadaA === "Seccional")}
									freeSolo={false}
									inputReadOnly={true}
									onChange={(selected) => {
										setDelegacionSelect((o) => ({ ...o, selected, error: null, loading: null }));
										if ((state.form?.derivadaA || "") === "Delegacion") {
											const selId = Number(selected?.value ?? selected?.record?.id ?? 0) || 0;
											setState(s => ({ ...s, form: { ...s.form, derivadoAId: selId } }));
											onChange({ derivadoAId: selId });
										}
									}}
									options={delegacionSelect.options}
									onTextChange={(buscar) => setDelegacionSelect((o) => ({ ...o, buscar }))}
								/>
							</Grid>
							<Grid grow>
								<SearchSelectMaterial
									id="seccionalSelect"
									label="Seccional"
									className={roClass(lockedSeccional || state.form.derivadaA !== "Seccional")}
									error={!!seccionalSelect.error}
									helperText={
										seccionalSelect.loading ??
										(seccionalSelect.selected?.value ? null : seccionalSelect.error)}
									value={safeSelectValue(seccionalSelect.selected, seccionalSelect.options)}
									readOnly={lockedSeccional || state.form.derivadaA !== "Seccional"}
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
															const selIdPut = Number(selected?.value ?? selected?.record?.id ?? 0) || 0;
															const delegacionNombre = String(
																delegacionSelect.selected?.record?.nombre ||
																delegacionSelect.selected?.label ||
																payload.derivadoDelegacion ||
																""
															).trim();
															const seccionalNombre = String(
																selected?.record?.descripcion ||
																(selected?.label || "").split(" - ").slice(1).join(" - ") ||
																""
															).trim();
															payload.derivadoAId = selIdPut;
															payload.derivadoDelegacion = delegacionNombre;
															payload.derivadoSeccional = seccionalNombre;
															payload.id = Number(id);
															putAppDenunciaById(
																id,
																payload,
																(okPut) => {
																	setState(s => ({ ...s, loading: null }));
																	prevDerivadaARef.current = 'Seccional';
																},
																(errPut) => {
																	setState(s => ({ ...s, loading: null, errors: { ...s.errors, persist: errPut?.toString() } }));
																}
															);
														} catch (e) {
															setState(s => ({ ...s, loading: null, errors: { ...s.errors, persist: e?.toString() } }));
														}
													},
													(errGet) => {
														setState(s => ({ ...s, loading: null, errors: { ...s.errors, persist: errGet?.toString() } }));
													}
												);
											}
										}
									}}
									options={seccionalSelect.options}
									onTextChange={(buscar) => setSeccionalSelect((o) => ({ ...o, buscar, origen: "text" }))}
								/>
							</Grid>
						</Grid>
						<Grid width>
							<InputMaterial
								id="observacionesRegistro"
								readOnly={readOnly}
								className={roClass(readOnly)}
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
				<div style={{ marginTop: 10 }}>
					{selectedTab === 0
						? FormularioPanel
						: selectedTab === 1
							? (
								<DenunciasFormDocumentaicon
									data={data}
									readOnly={readOnly}
									documentacionList={documentacionList}
									setDocumentacionList={setDocumentacionList}
									setState={setState}
									sendRequest={sendRequest}
									mapDocToPayload={mapDocToPayload}
									setSelectedTab={setSelectedTab}
								/>
							)
							: (
								<DenunciasFormNovedades
									mode={mode}
									estadosList={estadosList}
									docsByEstadoId={docsByEstadoId}
									documentacionList={documentacionList}
									setDocumentacionList={setDocumentacionList}
									selectedEstado={selectedEstado}
									setSelectedEstado={setSelectedEstado}
									overrideDocsPorNuevoEstado={overrideDocsPorNuevoEstado}
									setOverrideDocsPorNuevoEstado={setOverrideDocsPorNuevoEstado}
									loadDocumentacion={loadDocumentacion}
									loadDocumentacionCacheOnly={loadDocumentacionCacheOnly}
									sendRequest={sendRequest}
								/>
							)}
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
			const fromForm = Number(state.form?.derivadoAId || 0);
			if (fromForm) return fromForm;
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
		setSelectedTab(0);
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

				const rawId = ok?.id ?? ok?.Id ?? (Number.isFinite(ok) ? ok : null);
				const appId = rawId != null ? Number(rawId) : null;
				if (!appId) {
					setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: "No se devolvió Id de denuncia" } }));
					return;
				}

				setState((s) => ({ ...s, form: { ...s.form, id: appId } }));

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
				{selectedTab === 2 && selectedEstado && (
					<div className={classes.novedadesDetailPanel}>
						<Grid col gap="6px">
							<Grid className={classes.novedadesDetailTitle}>Detalle de la Novedad</Grid>
							<Grid grid="auto / 7fr 1fr" gap="20px" className={classes.novedadesDetailLayout}>
								{/* Observaciones a la izquierda */}
								<Grid col gap="4px">
									<div className={classes.novedadesObservacionesTitle}>Observaciones:</div>
									<div className={classes.novedadesObservacionesBody}>
										{selectedEstado?.observaciones ? String(selectedEstado.observaciones) : <i>Sin observaciones</i>}
									</div>
								</Grid>
								{/* Documentos a la derecha */}
								<Grid col gap="4px">
									<div className={classes.novedadesDocumentoTitle}>Documento:</div>
									<div className={classes.novedadesDocumentoBody}>
										{(() => {
											const doc = selectedEstado?._doc;
											const docs = doc ? [doc] : [];
											if (!docs.length) return <i>Sin documentos</i>;
											return (
												<ul className={classes.novedadesDocsList}>
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