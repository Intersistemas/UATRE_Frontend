import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import Formato from "components/helpers/Formato";
import useAuditoriaProceso from "components/hooks/useAuditoriaProceso";
import useQueryState from "components/hooks/useQueryState";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, {
	CUITMask,
	DNIMask,
} from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	mapOptions,
	includeSearch,
} from "components/ui/Select/SearchSelectMaterial";
import ValidarCUIT from "components/validators/ValidarCUIT";
import ValidarEmail from "components/validators/ValidarEmail";
import Table from "components/ui/Table/Table";

import { Tabs, Tab } from "@mui/material";
import Documentacion from "components/documentacion/Documentacion";

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

// Debug helper para inspeccionar payloads enviados
function debugSend(tag, payload) {
	try {
		if (console.groupCollapsed) {
			console.groupCollapsed(`[DEBUG] ${tag}`);
		} else {
			console.log(`[DEBUG] ${tag}`);
		}
		console.log(payload);
		if (console.groupEnd) console.groupEnd();
	} catch (e) {
		console.log(`[DEBUG] ${tag}`, payload);
	}
	return payload;
}

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

//#region tipoDocumentoSelect Options
const tipoDocumentoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion tipoDocumentoSelect Options

//#region nacionalidadSelect Options
const nacionalidadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion nacionalidadSelect Options

//#region estadoCivilSelect Options
const estadoCivilSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion estadoCivilSelect Options

//#region sexoSelect Options
const sexoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion sexoSelect Options

//#region provinciaSelect Options
const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: [r.id, r.nombre].join(" - "), record: r }),
		filter: (r) => includeSearch(r, buscar),
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

//#region oficioSelect Options
const oficioSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: r.descripcion,
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion oficioSelect Options

//#region actividadSelect Options
const actividadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: r.descripcion,
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion actividadSelect Options

//#endregion options

const DenunciasForm = ({ title = "Solicitud previa de afiliación", data = {}, readOnly = false, hidePrint = false, onClose = () => { }, initialTab = 0 }) => {

	const [selectedTab, setSelectedTab] = useState(initialTab);
	const handleChangeTab = (_e, v) => setSelectedTab(v);

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
	const { setState: setTiposDocumentosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/TipoDocumento`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setNacionalidadesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Nacionalidad`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setEstadosCivilesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/EstadoCivil`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setSexosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Sexo`,
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
		{ query: { params: { soloActivos: true }, config: { errorType: "response" } } }
	);
	const { setState: setOficiosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Puesto`,
				method: "GET",
			},
		}),
		{
			query: {
				params: { soloActivos: true },
				config: { errorType: "response" },
			},
		}
	);
	// Catálogo: DenunciaTipo (para "Tipo de Ingreso")
	const { setState: setDenunciaTipoQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: `/DenunciaTipo`, method: "GET" },
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

	const { setState: setActividadesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Actividad`,
				method: "GET",
			},
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
	const { setState: setCIIUsQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/RefCIIU`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	// 1) Alta de AppDenuncias
	const { setState: setCreateAppDenunciaQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: `/AppDenuncias`, method: "POST" },
		}),
		{ query: { config: { errorType: "response" } } }
	);



	// 3) Alta de Estado de la denuncia
	const { setState: setCreateEstadoQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: "/DenunciasEstados", method: "POST" }
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const [documentacionList, setDocumentacionList] = useState([]);
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

	const { setState: createDocQuery } = useQueryState(
		() => ({
			config: { baseURL: "Comunes", endpoint: `/DocumentacionEntidad`, method: "POST" },
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const { setState: updateDocQuery } = useQueryState(
		() => ({
			config: { baseURL: "Comunes", endpoint: `/DocumentacionEntidad`, method: "PUT" },
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const { setState: deleteDocQuery } = useQueryState(
		() => ({
			config: { baseURL: "Comunes", endpoint: `/DocumentacionEntidad`, method: "DELETE" },
		}),
		{ query: { config: { errorType: "response" } } }
	);
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

	const { audit } = useAuditoriaProceso();

	useEffect(() => {
		const entidadId = data?.id ?? 0;
		if (!entidadId) {
			setDocumentacionList([]);
			return;
		}

		setDocumentosQuery(o => ({
			...o,
			query: { ...o.query, params: { EntidadId: entidadId, EntidadTipo: "F" } },
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : [];
				console.log(' DOCUMENTACIÓN CARGADA:', {
					archivosEncontrados: arr.length,
					archivos: arr.map(doc => ({
						id: doc.id,
						nombre: doc.nombreArchivo,
						tipo: doc.refTipoDocumentacionDescripcion
					}))
				});
				setDocumentacionList(arr);
				if (error) console.error("DocumentacionEntidad/GetBySpec error:", error);
			}
		}));
	}, [data?.id, setDocumentosQuery]);

	// === MAPEO DE DOCUMENTACIÓN: Convierte item del form al formato del API
	const compact = (obj) => Object.fromEntries(
		Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
	);

	const mapDocToPayload = (item, entidadId, entidadTipo) => {
		console.log(' MAPEANDO DOCUMENTO para API:', {
			itemOriginal: {
				id: item?.id,
				nombreArchivo: item?.nombreArchivo,
				tieneArchivo: !!(item?.archivo || item?.archivoBase64),
			},
			destino: { entidadId, entidadTipo }
		});

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

		


		const payload = {
			id: item?.id,
			entidadId,
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

		console.log(' DOCUMENTO MAPEADO:', {
			id: result.id,
			nombreArchivo: result.nombreArchivo,
			tipoDoc: result.refTipoDocumentacionId,
			tieneArchivo: !!result.archivo,
			tamañoBase64: result.archivo ? result.archivo.length + ' chars' : '0'
		});

		return result;
	};

	//#region selects

	const persistirDocumentacion = async (entidadId) => {
		const entidadTipo = "F";
		const lista = Array.isArray(documentacionList) ? documentacionList : [];

		console.log(' PERSISTIENDO DOCUMENTACIÓN:', {
			entidadId: entidadId,
			entidadTipo: entidadTipo,
			totalArchivos: lista.length,
			archivos: lista.map(doc => ({
				id: doc.id,
				nombre: doc.nombreArchivo,
				tipo: doc.refTipoDocumentacionDescripcion,
				tieneArchivo: !!doc.archivo
			}))
		});

		if (lista.length === 0) {
			console.log(' No hay documentación para persistir');
			return;
		}

		for (let i = 0; i < lista.length; i++) {
			const item = lista[i];
			const payload = mapDocToPayload(item, entidadId, entidadTipo);

			console.log(` Procesando archivo ${i + 1}/${lista.length}:`, {
				nombre: item.nombreArchivo,
				operacion: payload.id ? 'ACTUALIZAR' : 'CREAR',
				payloadId: payload.id
			});

			// Create vs Update según si trae id
			if (payload.id) {
				// ACTUALIZAR archivo existente
				updateDocQuery(o => ({
					...o,
					query: { ...o.query, config: { ...o.query?.config, body: payload } },
					onLoad: ({ ok, error }) => {
						if (error) {
							console.error(`❌ Error al actualizar archivo ${item.nombreArchivo}:`, error);
						} else {
							console.log(`✅ Archivo actualizado: ${item.nombreArchivo}`);
						}
					}
				}));
			} else {
				// CREAR nuevo archivo
				createDocQuery(o => ({
					...o,
					query: {
						...o.query,
						config: {
							...o.query?.config,
							headers: { 'Content-Type': 'application/json', ...(o.query?.config?.headers || {}) },
							body: payload
						}
					},
					onLoad: ({ ok, error }) => {
						if (error) {
							console.error(`❌ Error al crear archivo ${item.nombreArchivo}:`, error);
						} else {
							console.log(`✅ Archivo creado: ${item.nombreArchivo}`, ok);
							if (ok?.id || ok?.Id) {
								const nuevo = [...lista];
								nuevo[i] = { ...item, id: ok.id ?? ok.Id };
								setDocumentacionList(nuevo);
								setState(s => ({ ...s, form: { ...s.form, documentacion: nuevo } }));
							}
						}
					}
				}));
			}
		}

		console.log('✅ Proceso de persistencia de documentación completado');
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
	}, [delegacionSelect.selected, seccionalSelect.data, seccionalSelect.buscar]);

	//#region selects trabajador

	//#region select tipo documento
	const [tipoDocumentoSelect, setTipoDocumentoSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});


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
				const data = Array.isArray(ok) ? ok : [];
				setSituacionSelect(s => ({
					...s,
					loading: null,
					data,
					error: error?.toString(),
				}));
				// Prefill si ya viene un id
				const wantedId = state.form?.denunciaSituacionId ?? data?.denunciaSituacionId;
				if (wantedId) {
					const hit = data.find(d => d.id === wantedId);
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
	}, [setDenunciaSituacionQuery]);


	// Buscador
	useEffect(() => {
		setTipoDocumentoSelect((o) => ({
			...o,
			options: tipoDocumentoSelectOptions(o),
		}));
	}, [tipoDocumentoSelect.buscar, tipoDocumentoSelect.data]);
	//#endregion select tipo documento

	useEffect(() => {
		setDenunciaTipoQuery(o => ({
			...o,
			onLoad: ({ ok, error }) => {
				const data = Array.isArray(ok) ? ok : [];
				setTipoIngresoSelect(s => ({
					...s,
					loading: null,
					data,
					error: error?.toString(),
				}));
				// Prefill si ya viene un id desde `data`
				if (data?.length && (state.form?.denunciaTipoIngresoId || data?.denunciaTipoIngresoId)) {
					const wantedId = state.form?.denunciaTipoIngresoId || data?.denunciaTipoIngresoId;
					const hit = data.find(d => d.id === wantedId);
					if (hit) {
						setTipoIngresoSelect(s => ({
							...s,
							selected: { value: hit.id, label: hit.descripcion, record: hit },
							origen: "option",
						}));
					}
				}
			},
		}));
	}, [setDenunciaTipoQuery]);



	//#region select nacionalidad
	const [nacionalidadSelect, setNacionalidadSelect] = useState({
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
		setNacionalidadSelect((o) => ({
			...o,
			options: nacionalidadSelectOptions(o),
		}));
	}, [nacionalidadSelect.buscar, nacionalidadSelect.data]);
	//#endregion select nacionalidad

	//#region select estado civil
	const [estadoCivilSelect, setEstadoCivilSelect] = useState({
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
		setEstadoCivilSelect((o) => ({
			...o,
			options: estadoCivilSelectOptions(o),
		}));
	}, [estadoCivilSelect.buscar, estadoCivilSelect.data]);
	//#endregion select estado civil

	//#region select sexo
	const [sexoSelect, setSexoSelect] = useState({
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
		setSexoSelect((o) => ({
			...o,
			options: sexoSelectOptions(o),
		}));
	}, [sexoSelect.buscar, sexoSelect.data]);
	//#endregion select sexo

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
	});
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

	//#region select oficio
	const [oficioSelect, setOficioSelect] = useState({
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
		setOficioSelect((o) => ({
			...o,
			options: oficioSelectOptions(o),
		}));
	}, [oficioSelect.buscar, oficioSelect.data]);
	//#endregion select sexo

	//#region select actividad
	const [actividadSelect, setActividadSelect] = useState({
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
		setActividadSelect((o) => ({
			...o,
			options: actividadSelectOptions(o),
		}));
	}, [actividadSelect.buscar, actividadSelect.data]);
	//#endregion select actividad

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
	// PREFILL (data  readOnly)
	useEffect(() => {
		if (!data || Object.keys(data).length === 0) return;
		setState((o) => ({
			...o,
			form: { ...o.form, ...data, fecha: data.fecha ? `${data.fecha}`.slice(0, 10) : o.form.fecha },
			validado: readOnly ? { seccionalId: true, fecha: true, trabajador: true, empleador: true } : o.validado,
		}));
	}, [data, readOnly]);


	// Prefill selects
	useEffect(() => { if (tipoDocumentoSelect.options?.length) setSelectedById(setTipoDocumentoSelect, tipoDocumentoSelect, data?.tipoDocumentoId); }, [tipoDocumentoSelect.options, data?.tipoDocumentoId]);
	useEffect(() => { if (nacionalidadSelect.options?.length) setSelectedById(setNacionalidadSelect, nacionalidadSelect, data?.nacionalidadId); }, [nacionalidadSelect.options, data?.nacionalidadId]);
	useEffect(() => { if (estadoCivilSelect.options?.length) setSelectedById(setEstadoCivilSelect, estadoCivilSelect, data?.estadoCivilId); }, [estadoCivilSelect.options, data?.estadoCivilId]);
	useEffect(() => { if (sexoSelect.options?.length) setSelectedById(setSexoSelect, sexoSelect, data?.sexoId); }, [sexoSelect.options, data?.sexoId]);
	useEffect(() => {
		if (!trabPciaSelect.options?.length) return;
		setSelectedById(setTrabPciaSelect, trabPciaSelect, data?.provinciaId);
	}, [trabPciaSelect.options, data?.provinciaId]);
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
	useEffect(() => { if (oficioSelect.options?.length) setSelectedById(setOficioSelect, oficioSelect, data?.oficioId); }, [oficioSelect.options, data?.oficioId]);
	useEffect(() => { if (actividadSelect.options?.length) setSelectedById(setActividadSelect, actividadSelect, data?.actividadIdAfiliado); }, [actividadSelect.options, data?.actividadIdAfiliado]);
	useEffect(() => {
		if (!emplPciaSelect.options?.length) return;
		setSelectedById(setEmplPciaSelect, emplPciaSelect, data?.provinciaidEmpresa);
	}, [emplPciaSelect.options, data?.provinciaidEmpresa]);
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
	useEffect(() => { if (ciiuSelect.options?.length) setSelectedById(setCiiuSelect, ciiuSelect, data?.actividadIdEmpresa); }, [ciiuSelect.options, data?.actividadIdEmpresa]);

	// READONLY banderas
	const isRO = !!readOnly;
	const disTrab = isRO || !state.validado.trabajador;
	const disEmpl = isRO || !state.validado.empleador;


	// PREFILL (data  readOnly)
	useEffect(() => {
		if (!data || Object.keys(data).length === 0) return;
		setState((o) => ({
			...o,
			form: { ...o.form, ...data, fecha: data.fecha ? `${data.fecha}`.slice(0, 10) : o.form.fecha },
			validado: readOnly ? { seccionalId: true, fecha: true, trabajador: true, empleador: true } : o.validado,
		}));
	}, [data, readOnly]);

	const setSelectedById = (setter, optionsState, id, match = (opt) => opt.value === id) => {
		if (!id) return;
		setter((o) => {
			const hit = (o.options || optionsState.options || []).find(match) || {};
			return { ...o, selected: hit, origen: hit.value ? "option" : o.origen };
		});
	};

	// Prefill selects (duplicados originales)
	useEffect(() => { if (tipoDocumentoSelect.options?.length) setSelectedById(setTipoDocumentoSelect, tipoDocumentoSelect, data?.tipoDocumentoId); }, [tipoDocumentoSelect.options, data?.tipoDocumentoId]);
	useEffect(() => { if (nacionalidadSelect.options?.length) setSelectedById(setNacionalidadSelect, nacionalidadSelect, data?.nacionalidadId); }, [nacionalidadSelect.options, data?.nacionalidadId]);
	useEffect(() => { if (estadoCivilSelect.options?.length) setSelectedById(setEstadoCivilSelect, estadoCivilSelect, data?.estadoCivilId); }, [estadoCivilSelect.options, data?.estadoCivilId]);
	useEffect(() => { if (sexoSelect.options?.length) setSelectedById(setSexoSelect, sexoSelect, data?.sexoId); }, [sexoSelect.options, data?.sexoId]);
	useEffect(() => {
		if (!trabPciaSelect.options?.length) return;
		setSelectedById(setTrabPciaSelect, trabPciaSelect, data?.provinciaId);
	}, [trabPciaSelect.options, data?.provinciaId]);
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
	useEffect(() => { if (oficioSelect.options?.length) setSelectedById(setOficioSelect, oficioSelect, data?.oficioId); }, [oficioSelect.options, data?.oficioId]);
	useEffect(() => { if (actividadSelect.options?.length) setSelectedById(setActividadSelect, actividadSelect, data?.actividadIdAfiliado); }, [actividadSelect.options, data?.actividadIdAfiliado]);
	useEffect(() => {
		if (!emplPciaSelect.options?.length) return;
		setSelectedById(setEmplPciaSelect, emplPciaSelect, data?.provinciaidEmpresa);
	}, [emplPciaSelect.options, data?.provinciaidEmpresa]);
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
	useEffect(() => { if (ciiuSelect.options?.length) setSelectedById(setCiiuSelect, ciiuSelect, data?.actividadIdEmpresa); }, [ciiuSelect.options, data?.actividadIdEmpresa]);

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

	//#region Carga inicial select tipo documento
	useEffect(() => {
		setTiposDocumentosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setTipoDocumentoSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setTiposDocumentosQuery]);
	//#endregion Carga inicial select tipo documento

	//#region Carga inicial select nacionalidad
	useEffect(() => {
		setNacionalidadesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setNacionalidadSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setNacionalidadesQuery]);
	//#endregion Carga inicial select nacionalidad

	//#region Carga inicial select estado civil
	useEffect(() => {
		setEstadosCivilesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setEstadoCivilSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setEstadosCivilesQuery]);
	//#endregion Carga inicial select estado civil

	//#region Carga inicial select sexo
	useEffect(() => {
		setSexosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setSexoSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setSexosQuery]);
	//#endregion Carga inicial select sexo

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

	//#region Carga inicial selects oficios
	useEffect(() => {
		setOficiosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setOficioSelect((o) => ({
					...o,
					data,
					loading: null,
					error: error?.toString(),
				}));
			},
		}));
	}, [setOficiosQuery]);
	//#endregion Carga inicial selects oficios

	//#region Carga inicial selects actividades
	useEffect(() => {
		setActividadesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setActividadSelect((o) => ({
					...o,
					data,
					loading: null,
					error: error?.toString(),
				}));
			},
		}));
	}, [setActividadesQuery]);
	//#endregion Carga inicial selects actividades

	//#region Carga inicial select ciiu
	useEffect(() => {
		setCIIUsQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setCiiuSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setCIIUsQuery]);
	//#endregion Carga inicial select ciiu

	//#endregion inicializaciones

	// Habilitar/limpiar Delegacion/Seccional según "Derivada a"
	useEffect(() => {
		const derivada = state.form.derivadaA;
		// Si no está derivada (o es 'Sin derivacion') limpiar ambos campos
		if (!derivada || derivada === "Sin derivacion") {
			setDelegacionSelect((o) => ({ ...o, selected: {} }));
			setSeccionalSelect((o) => ({ ...o, selected: {}, options: [] }));
			setState((o) => ({ ...o, form: { ...o.form, delegacion: "", seccional: "" } }));
			return;
		}
		if (derivada === "Delegacion") {
			// mantener delegacion, limpiar seccional
			setSeccionalSelect((o) => ({ ...o, selected: {}, options: [] }));
			setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			return;
		}
		if (derivada === "Seccional") {
			// permitir ambos: no hacemos limpieza automática (usuario debe elegir)
			return;
		}
	}, [state.form.derivadaA]);


	let content = null;
	{



		const FormularioPanel = (
			<Grid full col gap="10px">
				{/* ====== CABECERA (nueva UI: SIN Seccional y SIN Fecha) ====== */}
				<Grid width gap="inherit">
					<SearchSelectMaterial
						id="provincia"
						label="Provincia"
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
					<SearchSelectMaterial
						id="localidad"
						label="Localidad"
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
						onTextChange={(buscar) => setTrabLocaSelect((o) => ({ ...o, buscar, origen: "text" }))}
					/>
					<Grid width style={styles.String}>Delegacion: XXXXXXXXXXXXXXXXXXXXXXXXXXXXX</Grid>
				</Grid>

				{/* ====== BLOQUE PRINCIPAL ====== */}
				<Grid col width gap="inherit" style={styles.group}>
					<Grid width style={styles.titulo}>Carga de Datos</Grid>
					<Grid col gap="inherit">
						{/* Delegación (solo display) */}
						{/* <Grid width gap="inherit">
              <InputMaterial
                id="delegacion"
                label="Delegación"
                readOnly
                value={state.form.delegacion || data?.delegacion || ""}
                onChange={() => {}}
              />
            </Grid> */}

						{/* Nombre Denunciante / Teléfono de contacto / Correo electrónico */}
						<Grid width gap="inherit">
							<InputMaterial
								id="nombreDenunciante"
								label="Nombre Denunciante"
								value={state.form.nombreDenunciante}
								error={!!state.errors.nombreDenunciante}
								helperText={state.errors.nombreDenunciante}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, nombreDenunciante: v } }))}
							/>
							<InputMaterial
								id="telefonoContacto"
								type="tel"
								label="Teléfono de contacto"
								value={state.form.telefonoContacto}
								error={!!state.errors.telefonoContacto}
								helperText={state.errors.telefonoContacto}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, telefonoContacto: v } }))}
							/>
							<InputMaterial
								id="correoElectronico"
								label="Correo electrónico"
								value={state.form.correoElectronico}
								error={!!state.errors.correoElectronico}
								helperText={state.errors.correoElectronico}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, correoElectronico: v } }))}
							/>
						</Grid>

						{/* Correo electrónico
						<Grid width>

						</Grid> */}

						{/* Tipo de Ingreso / Situación / Ubicacion */}
						<Grid width gap="inherit">
							<SearchSelectMaterial
								id="tipoIngreso"
								label="Tipo de Ingreso"
								error={!!tipoIngresoSelect.error}
								helperText={tipoIngresoSelect.loading ?? tipoIngresoSelect.error}
								value={tipoIngresoSelect.selected}
								options={tipoIngresoSelect.options}
								onChange={(selected = {}) => {
									setTipoIngresoSelect(o => ({ ...o, selected, origen: "option" }));
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
								label="Situación"
								error={!!situacionSelect.error}
								helperText={situacionSelect.loading ?? situacionSelect.error}
								value={situacionSelect.selected}
								options={situacionSelect.options}
								onChange={(selected = {}) => {
									setSituacionSelect(o => ({ ...o, selected, origen: "option" }));
									setState(o => ({
										...o,
										form: {
											...o.form,
											denunciaSituacionId: Number(selected?.value || 0),   // ← ID al backend
											situacionDescripcion: selected?.label || "",         // ← texto para UI
										},
										errors: { ...o.errors, situacion: "" },
									}));
								}}
								onTextChange={(buscar) => setSituacionSelect(o => ({ ...o, buscar, origen: "text" }))}
							/>

							<InputMaterial
								id="ubicacion"
								label="Ubicación"
								value={state.form.ubicacion}
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
									mask={CUITMask}
									label="CUIT Empleador"
									value={state.form.cuitEmpresa}
									error={!!state.errors.cuitEmpresa}
									helperText={state.errors.cuitEmpresa}
									onChange={(v) =>
										setState((o) => ({ ...o, form: { ...o.form, cuitEmpresa: (String(v || "").match(/\d/g) || []).join("") } }))
									}
								/>
							</Grid>
							<Grid col width="100px">
								<Button
									className="botonAzul"
									onClick={() => {
										const changes = { form: {}, errors: { cuitEmpresa: "" } };
										const cuit = state.form.cuitEmpresa;
										const apply = () =>
											setState((o) => ({
												...o,
												form: { ...o.form, ...changes.form },
												errors: { ...o.errors, ...changes.errors },
												validado: { ...o.validado, empleador: true },
											}));
										if (cuit) {
											setPadronAFIPQuery((o) => ({
												...o,
												loading: "Empleador",
												query: { ...o.query, params: { ...o.query.params, cuit } },
												onLoad: ({ ok, error }) => {
													if (error) {
														changes.errors.cuitEmpresa = error.code === 404 ? "No existe en ARCA" : error.toString();
													} else {
														changes.form.razonSocial = ok?.razonSocial || ok?.nombre || "";
														// IMPORTANTE: NO traemos domicilio/provincia/localidad porque el nuevo formulario NO los muestra.
													}
													apply();
													setPadronAFIPQuery((o) => ({ ...o, loading: null }));
												},
											}));
										} else {
											changes.errors.cuitEmpresa = "Dato requerido";
											apply();
										}
									}}
									loading={padronAFIPQuery.loading === "Empleador"}
								>
									Valida
								</Button>
							</Grid>
							<Grid grow>
								<InputMaterial
									id="razonSocial"
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
								label="Detalle de la denuncia"
								multiline
								rows={6}
								value={state.form.detalleDenuncia}
								error={!!state.errors.detalleDenuncia}
								helperText={state.errors.detalleDenuncia}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, detalleDenuncia: v } }))}
							/>
						</Grid>

						{/* Delegación y Seccional (desplegables) Estados y derivados a*/}
						<Grid width gap="inherit">

							<Grid grow>
								<SearchSelectMaterial
									id="estado"
									label="Estado"
									value={state.form.estado ? { value: state.form.estado, label: state.form.estado } : { value: "Registrada", label: "Registrada" }}
									options={[
										{ value: "Registrada", label: "Registrada" },
										{ value: "Completada", label: "Completada" },
										{ value: "Derivada", label: "Derivada" },
									]}
									onChange={(selected = {}) => setState((o) => ({ ...o, form: { ...o.form, estado: selected?.value, estadoDescripcion: selected?.label } }))}
									onTextChange={() => { }}
								/>
							</Grid>

							<Grid grow>
								<SearchSelectMaterial
									id="derivadaA"
									label="Derivada a"
									value={state.form.derivadaA ? { value: state.form.derivadaA, label: state.form.derivadaA } : {}}
									options={[
										{ value: "Sin derivacion", label: "Sin derivacion" },
										{ value: "Delegacion", label: "Delegacion" },
										{ value: "Seccional", label: "Seccional" },
										{ value: "CNTA", label: "CNTA" },
										{ value: "Asesoria Letrada", label: "Asesoria Letrada" },
									]}
									onChange={(selected = {}) =>
										setState((o) => ({ ...o, form: { ...o.form, derivadaA: selected?.value, derivadaADescripcion: selected?.label } }))
									}
									onTextChange={() => { }}
								/>
							</Grid>



							<Grid grow>
								<SearchSelectMaterial
									id="delegacionSelect"
									label="Delegación"
									error={!!delegacionSelect.error}
									helperText={delegacionSelect.loading ?? delegacionSelect.error}
									value={delegacionSelect.selected}
									readOnly={!(state.form.derivadaA === "Delegacion" || state.form.derivadaA === "Seccional")}
									onChange={(selected) => {
										setDelegacionSelect((o) => ({ ...o, selected }));
										setState((o) => ({ ...o, form: { ...o.form, delegacion: selected.record?.nombre || selected.label } }));
									}}
									options={delegacionSelect.options}
									onTextChange={(buscar) => setDelegacionSelect((o) => ({ ...o, buscar }))}
								/>
							</Grid>
							<Grid grow>
								<SearchSelectMaterial
									id="seccionalSelect"
									label="Seccional"
									error={!!seccionalSelect.error}
									helperText={seccionalSelect.loading ?? seccionalSelect.error}
									value={seccionalSelect.selected}
									readOnly={state.form.derivadaA !== "Seccional"}
									onChange={(selected) => {
										setSeccionalSelect((o) => ({ ...o, selected }));
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
		const entidadTipo = "F";

		const DocumentacionPanel = (
			<Grid full col gap="10px">



				<Documentacion
					data={documentacionList}
					tipoDocumentacion={[
						"Credencial",
						"Documento de Identidad",
						"Formulario",
						"Otros",
					]}
					disabled={readOnly}
					onChange={({ index, item }) => {
						// MANEJO DE ARCHIVOS: Esta función se ejecuta cuando se suben, modifican o eliminan archivos
						console.log(' Operación en documentación:', {
							tipo: index == null ? 'CREAR' : item == null ? 'ELIMINAR' : 'ACTUALIZAR',
							index: index,
							nombreArchivo: item?.nombreArchivo || 'N/A',
							tipoDocumento: item?.refTipoDocumentacionDescripcion || 'N/A',
							entidadId: entidadId,
							entidadTipo: entidadTipo
						});

						const prev = [...documentacionList];

						// === ALTA (CREAR NUEVO ARCHIVO)
						if (index == null && item != null) {
							console.log('CREANDO nuevo archivo:', item?.nombreArchivo);
							const payload = mapDocToPayload(item, entidadId, entidadTipo);

							// Actualización optimista (se ve inmediatamente en la UI)
							const temp = [...prev, { ...payload, id: item.id ?? 0 }];
							setDocumentacionList(temp);
							setState(s => ({ ...s, form: { ...s.form, documentacion: temp } }));

							// Si no hay EntidadId todavía, solo guardamos localmente
							if (!entidadId) {
								console.log('⏳ Guardado local - se enviará al servidor cuando se confirme el formulario');
								return;
							}

							// Enviar al servidor
							createDocQuery(o => ({
								...o,
								query: { ...o.query, config: { ...o.query?.config, body: payload } },
								onLoad: ({ ok, error }) => {
									if (error) {
										console.error('❌ Error al crear archivo:', error);
										// Rollback
										setDocumentacionList(prev);
										setState(s => ({ ...s, form: { ...s.form, documentacion: prev } }));
									} else {
										console.log('✅ Archivo creado exitosamente:', ok);
										// Actualizar con el ID real del servidor
										const newId = ok?.id ?? item.id;
										const next = [...temp];
										next[next.length - 1] = { ...next[next.length - 1], id: newId };
										setDocumentacionList(next);
										setState(s => ({ ...s, form: { ...s.form, documentacion: next } }));
									}
								}
							}));
							return;
						}

						// === BAJA (ELIMINAR ARCHIVO)
						if (index != null && item == null) {
							const current = prev[index];
							console.log(' ELIMINANDO archivo:', current?.nombreArchivo);
							const id = current?.id;

							if (!id) {
								// Si no hay id, solo eliminar localmente
								const next = prev.filter((_, i) => i !== index);
								setDocumentacionList(next);
								setState(s => ({ ...s, form: { ...s.form, documentacion: next } }));
								console.log(' Archivo eliminado localmente');
								return;
							}

							// Actualización optimista
							const next = prev.filter((_, i) => i !== index);
							setDocumentacionList(next);
							setState(s => ({ ...s, form: { ...s.form, documentacion: next } }));

							if (!entidadId) return;

							// Eliminar del servidor
							deleteDocQuery(o => ({
								...o,
								query: {
									...o.query,
									params: { ...(o.query?.params || {}), id },
									config: {
										...o.query?.config,
										headers: { 'Content-Type': 'application/json', ...(o.query?.config?.headers || {}) },
									}
								},
								onLoad: ({ error }) => {
									if (error) {
										console.error('❌ Error al eliminar archivo:', error);
										// Rollback
										setDocumentacionList(prev);
										setState(s => ({ ...s, form: { ...s.form, documentacion: prev } }));
									} else {
										console.log('✅ Archivo eliminado del servidor exitosamente');
									}
								}
							}));
							return;
						}

						// === MODIFICACIÓN (ACTUALIZAR ARCHIVO)
						if (index != null && item != null) {
							const current = prev[index] || {};
							console.log(' ACTUALIZANDO archivo:', current?.nombreArchivo);
							const payload = mapDocToPayload({ ...current, ...item }, entidadId, entidadTipo);

							// Actualización optimista
							const next = [...prev];
							next.splice(index, 1, { ...current, ...item });
							setDocumentacionList(next);
							setState(s => ({ ...s, form: { ...s.form, documentacion: next } }));

							if (!entidadId) return;

							// Actualizar en el servidor
							updateDocQuery(o => ({
								...o,
								query: { ...o.query, config: { ...o.query?.config, body: payload } },
								onLoad: ({ error }) => {
									if (error) {
										console.error('❌ Error al actualizar archivo:', error);
										// Rollback
										setDocumentacionList(prev);
										setState(s => ({ ...s, form: { ...s.form, documentacion: prev } }));
									} else {
										console.log('✅ Archivo actualizado exitosamente');
									}
								}
							}));
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

		const MostrarDocumentacion = (
			<Grid full col gap="10px">


				<Table
					keyField="id"
					data={Array.isArray(documentacionList) ? documentacionList : []}
					columns={[
						{
							dataField: "refTipoDocumentacionDescripcion",
							text: "Tipo Documentación",
							style: { textAlign: "left" },
						},
						{
							dataField: "nombreArchivo",
							text: "Nombre del Archivo",
							style: { textAlign: "left" },
							formatter: (cell, row) =>
								row?.url ? (
									<a href={row.url} target="_blank" rel="noreferrer">
										{cell || "(sin nombre)"}
									</a>
								) : (
									cell || "(sin nombre)"
								),
						},
					]}
					mostrarBuscar={true}
					pagination={false}
				/>
			</Grid>
		);

		content = (
			<>
				<Tabs value={selectedTab} onChange={handleChangeTab}>
					<Tab label="Datos" />
					<Tab label="Documentación" />
					<Tab label="Novedades" />
				</Tabs>
				<div style={{ marginTop: 10 }}>
					{selectedTab === 0 ? FormularioPanel : DocumentacionPanel}
				</div>
			</>
		);
	}

	const onAgregaDenuncia = () => {
		// === Validaciones (dejan igual lo que ya tenías) ===
		const errors = {};
		const body = { ...state.form };
		if (!trabPciaSelect?.selected?.value) errors.provincia = "Dato requerido";
		if (!trabLocaSelect?.selected?.record?.id) errors.localidad = "Dato requerido";
		if (!body.nombreDenunciante) errors.nombreDenunciante = "Dato requerido";
		if (body.correoElectronico && !ValidarEmail(body.correoElectronico)) errors.correoElectronico = "Dato inválido";
		if (body.telefonoContacto && !isPossiblePhoneNumber(body.telefonoContacto)) errors.telefonoContacto = "Dato inválido";
		if (body.cuitEmpresa && !ValidarCUIT(body.cuitEmpresa)) errors.cuitEmpresa = "Dato inválido";
		if (body.cuitEmpresa && !body.razonSocial) errors.razonSocial = "Complete Razón Social";
		if (Object.values(errors).some(Boolean)) {
			setState((o) => ({ ...o, errors }));
			return;
		}


		// 1) /api/AppDenuncias  (JSON exacto)
		// derivadoAId: calcular según la opción seleccionada en "Derivada a"
		const derivadoAIdValue = (() => {
			const selectedTipo = body.derivadaA || state.form?.derivadaA || "";
			if (!selectedTipo) return 0;
			if (selectedTipo === "Delegacion") return Number(delegacionSelect.selected?.value || 0);
			if (selectedTipo === "Seccional") return Number(seccionalSelect.selected?.value || 0);
			// CNTA, Asesoria Letrada u otros -> 0
			return 0;
		})();

		const _derivadoATipoRaw = body.derivadaADescripcion || body.derivadaA || state.form?.derivadaADescripcion || state.form?.derivadaA || "";
		const derivadoATipoValue = _derivadoATipoRaw === "Sin derivacion" ? "Sin datos" : _derivadoATipoRaw;

		const appDenunciaPayload = {
			nombre: body.nombreDenunciante || "",
			correo: body.correoElectronico || "",
			provincia: trabPciaSelect?.selected?.record?.nombre || "",
			localidad: trabLocaSelect?.selected?.record?.nombre || "",
			texto: body.detalleDenuncia || "",
			foto: "",                             // si no usás fotos, dejalo vacío
			localidadId: trabLocaSelect?.selected?.record?.id || 0,
			denunciaTipoIngresoId: Number(body.denunciaTipoIngresoId || 0),          // si más adelante guardás el ID, ponelo aquí
			denunciaTipoId: 0,                    // (si aplica en tu modelo)
			// derivadoATipo: enviar el texto seleccionado en el desplegable "Derivada a"
			derivadoATipo: derivadoATipoValue,
			derivadoAId: derivadoAIdValue,

			documentacionEntidadesId: 0,          // si luego guardás documentación vinculada por Id
			denunciaSituacionId: Number(body.denunciaSituacionId || 0),// si tenés ID; si no, dejalo en 0
			empleadorCUIT: Number(body.cuitEmpresa || 0),
			empleadorNombre: body.razonSocial || "",
			empresaId: 0,                         // si tenés empresaId, mapear
			ubicacion: body.ubicacion || ""
		};

		// // 2) /api/DenunciaTipoIngreso  (descripcion = string del select)
		// const tipoIngresoPayload = {
		// 	descripcion: body.tipoIngreso || ""    // "Mail" | "Web" | "AppDigital" | "Telefono"
		// };

		// 3) /api/DenunciasEstado
		const estadoPayload = (appDenunciasId) => ({
			appDenunciasId,
			// enviar el string seleccionado por el usuario en el formulario (fallback a 'Registrada')
			estado: body.estado || state.form?.estado || "Registrada",
			fechaAsociada: new Date().toISOString(),
			fecha: new Date().toISOString(),
			observaciones: body.observacionesRegistro || ""
		});

		// === SECUENCIA DE GUARDADO ===
		// 1) Crear AppDenuncias
		setCreateAppDenunciaQuery((o) => ({
			...o,
			query: { ...o.query, config: { ...o.query?.config, body: appDenunciaPayload } },
			onPreLoad: () => setState((s) => ({ ...s, loading: "Guardando denuncia..." })),
			onLoad: ({ ok, error }) => {
				if (error) {
					setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: error.toString() } }));
					return;
				}
				const appId = ok?.id ?? ok?.Id ?? (Number.isFinite(ok) ? ok : null);
				if (!appId) {
					setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: "No se devolvió Id de denuncia" } }));
					return;
				}
				// (opcional) actualizar form con el nuevo Id
				setState((s) => ({ ...s, form: { ...s.form, id: appId } }));

				// 2) Enviar Estado inicial de la denuncia
				try {
					const payloadEstado = estadoPayload(appId);
					// Loggear payload de estado para debug
					debugSend("DenunciasEstadoPayload", payloadEstado);
					setCreateEstadoQuery((o3) => ({
						...o3,
						query: { ...o3.query, config: { ...o3.query?.config, body: payloadEstado } },
						onLoad: ({ ok: ok2, error: error2 }) => {
							// Debug: response del endpoint DenunciasEstados
							debugSend("DenunciasEstadoResponse", { ok: ok2, error: error2 });
							setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: error2?.toString() } }));
						},
					}));
				} catch (e) {
					console.error('Error al enviar DenunciasEstados debug:', e);
				}

			}
		}));
	};

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				Carga de denuncias
			</Modal.Header>
			<Modal.Body>{content}</Modal.Body>
			<Modal.Footer>
				<Grid grid="auto / 1fr 150px 150px" width col gap="20px">
					<Grid width style={{ color: "red" }}>{state.errors.create}</Grid>
					{!readOnly && selectedTab === 0 && (
						<Button
							className="botonAmarillo"
							onClick={onAgregaDenuncia}
							loading={!!state.loading}
							disabled={!!state.loading}
						>
							AGREGA DENUNCIA
						</Button>
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