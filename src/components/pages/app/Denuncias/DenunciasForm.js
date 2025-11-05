import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import Formato from "components/helpers/Formato";
import useAuditoriaProceso from "components/hooks/useAuditoriaProceso";
import useQueryState from "components/hooks/useQueryState";
import useHttp from "components/hooks/useHttp";
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

const DenunciasForm = ({ title = "Solicitud previa de afiliación", data = {}, readOnly = false, hidePrint = false, onClose = () => { }, initialTab = 0, mode = "A" }) => {

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

	// 2) Modificación de AppDenuncias (PUT /AppDenuncias/{id})
	const { setState: setUpdateAppDenunciaQuery } = useQueryState(
		() => ({
			config: { baseURL: "App", endpoint: "/AppDenuncias", method: "PUT" },
		}),
		{ query: { config: { errorType: "response" } } }
	);

	// Hook http directo (usar sendRequest para llamadas puntuales)
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
				if (!arr.length) return;
				// ordenar por fecha (por si vienen desordenados) y tomar el último
				const sorted = arr.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
				const last = sorted[sorted.length - 1] || arr[arr.length - 1];
				setState((s) => ({
					...s,
					form: {
						...s.form,
						estado: last.estado || s.form.estado,
						observacionesRegistro: last.observaciones || s.form.observacionesRegistro,
					},
				}));
			},
		}));
	}, [data?.id, setGetEstadosQuery]);

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
	}, [delegacionSelect.selected, seccionalSelect.data, seccionalSelect.buscar]);

	//#region selects trabajad





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
	}
	);

	// Trae seccionales por PROVINCIA (sin localidad) y setea la Delegación (texto)
	useEffect(() => {
		const provinciaId = trabPciaSelect?.selected?.value;
		if (!provinciaId) {
			// si se limpia provincia, también limpiamos seccional/delegación
			setSeccionalSelect(s => ({ ...s, data: [], options: [], selected: {} }));
			setState(s => ({ ...s, form: { ...s.form, delegacion: "", seccional: "" } }));
			return;
		}

		setSeccionalesQuery(o => ({
			...o,
			query: {
				...o.query,
				params: {
					...(o.query?.params || {}),
					soloActivos: true,
					provinciaId,                // <-- SOLO ProvinciaId
					// verSeccionalesLocalidades: false, // opcional
					// (NO enviar localidadId)
				},
			},
			onLoad: ({ ok, error }) => {
				const data = Array.isArray(ok) ? ok : [];

				// guardar dataset para el selector de seccionales
				setSeccionalSelect(s => ({
					...s,
					loading: null,
					data,
					error: error?.toString(),
					options: seccionalesSelectOptions({ data, buscar: s.buscar }),
				}));

				// tomar una delegación de referencia (primera coincidencia)
				const first = data[0] || {};
				const delegacionTexto =
					first.refDelegacionDescripcion ||
					(first.seccionalLocalidad?.[0]?.refDelegacionDescripcion) ||
					"";

				setState(s => ({
					...s,
					form: { ...s.form, delegacion: delegacionTexto },
				}));
			},
		}));
	}, [trabPciaSelect?.selected?.value, setSeccionalesQuery, setSeccionalSelect]);



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

	// Si abrimos en modo MODIFICAR o CONSULTA y la denuncia viene derivada a una entidad concreta,
	// prefill y bloquear Delegación o Seccional según corresponda.
	useEffect(() => {
		if (!(mode === "M" || mode === "C")) return;
		// derivado tipo y id pueden venir en state.form (prefill anterior) o en data
		const tipoRaw = (state.form?.derivadaADescripcion || state.form?.derivadaA || data?.derivadoATipo || data?.derivadaATipo || "");
		const tipo = tipoRaw === "Sin derivacion" ? "Sin datos" : tipoRaw;
		const destinoId = Number(state.form?.derivadoAId ?? data?.derivadoAId ?? 0);

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
						// seleccionar la primera coincidencia con el id
						const sel = n.optionsSrc.find((p) => Number(p.value) === Number(destinoId)) || n.optionsSrc[0] || {};
						n.selected = sel;
						n.selectedDef = sel;
						return n;
					});
					// actualizar texto en el form y bloquear delegación
					setState((s) => ({ ...s, form: { ...s.form, delegacion: (dataArr[0]?.nombre) || state.form.delegacion || "" } }));
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
					setState((s) => ({ ...s, form: { ...s.form, seccional: rec.descripcion || rec.seccional || state.form.seccional || "" } }));
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
								setState((s) => ({ ...s, form: { ...s.form, delegacion: (dataD[0]?.nombre) || state.form.delegacion || "" } }));
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

	}, [mode, data, state.form?.derivadaA, state.form?.derivadaADescripcion, state.form?.derivadoAId]);

	// En modo MODIFICAR: si el endpoint devuelve strings de provincia/localidad, mostrarlos de inmediato
	useEffect(() => {
		if (mode !== "M" || !data) return;

		// Debug: ver qué trae `data` al abrir en modo Modificar
		try { console.log('[DenunciasForm] MODIFICAR - data recibida:', data); } catch (e) { }

		// Provincia: usar label textual si existe (varios nombres posibles) y no hay selección real aún
		const provinciaLabel =
			data?.provincia || data?.provinciaNombre || data?.provinciaDescripcion || data?.provinciaNombreAfiliado;
		const provinciaId = data?.provinciaId ?? data?.provinciaID ?? null;

		if (provinciaLabel && (!trabPciaSelect.selected || !trabPciaSelect.selected.value)) {
			setTrabPciaSelect((o) => ({
				...o,
				selected: {
					value: Number.isFinite(Number(provinciaId)) ? Number(provinciaId) : 0,   // << no tmp string
					label: String(provinciaLabel || ""),
					record: { id: Number.isFinite(Number(provinciaId)) ? Number(provinciaId) : 0, nombre: provinciaLabel },
				},
				origen: "server",
			}));
		}

		// Localidad: similar
		const localidadLabel = (data && (data.localidad || data.nombreLocalidadAfiliado || data.nombreLocalidad || data.localidadNombre)) || (state && state.form && (state.form.nombreLocalidadAfiliado || state.form.localidad || state.form.nombreLocalidad));
		const locId = (data && (data.localidadId || data.refLocalidadIdAfiliado || data.refLocalidadIdEmpresa || data.localidadID)) || (state && state.form && (state.form.refLocalidadIdAfiliado || state.form.localidadId)) || null;
		if (localidadLabel && (!trabLocaSelect.selected || !trabLocaSelect.selected.value)) {
			setTrabLocaSelect((o) => ({
				...o,
				selected: {
					value: locId || `tmp-loc-${Date.now()}`,
					label: String(localidadLabel || ""),
					record: { id: locId, nombre: localidadLabel },
				},
				origen: "server",
			}));
		}

	}, [mode, data && (data.provincia || data.provinciaNombre || data.provinciaId || data.localidad || data.nombreLocalidadAfiliado || data.localidadId)]);

	// READONLY banderas
	const isRO = !!readOnly;
	const disTrab = isRO || !state.validado.trabajador;
	const disEmpl = isRO || !state.validado.empleador;

	// Si estamos en modo ALTA, fijar estado a Registrada (solo para UI, el payload ya cae a 'Registrada' por defecto)
	useEffect(() => {
		if (mode === "A") {
			setState((s) => ({ ...s, form: { ...s.form, estado: s.form?.estado || "Registrada" } }));
		}
	}, [mode]);

	const setSelectedById = (setter, optionsState, id, match = (opt) => opt.value === id) => {
		if (!id) return;
		setter((o) => {
			const hit = (o.options || optionsState.options || []).find(match) || {};
			return { ...o, selected: hit, origen: hit.value ? "option" : o.origen };
		});
	};

	// Prefill selects (duplicados originales)
	useEffect(() => { if (tipoDocumentoSelect.options?.length) setSelectedById(setTipoDocumentoSelect, tipoDocumentoSelect, data?.tipoDocumentoId); }, [tipoDocumentoSelect.options, data?.tipoDocumentoId]);
	useEffect(() => { if (tipoIngresoSelect.options?.length) setSelectedById(setTipoIngresoSelect, tipoIngresoSelect, state.form?.denunciaTipoIngresoId || data?.denunciaTipoIngresoId); }, [tipoIngresoSelect.options, state.form?.denunciaTipoIngresoId, data?.denunciaTipoIngresoId]);
	useEffect(() => { if (nacionalidadSelect.options?.length) setSelectedById(setNacionalidadSelect, nacionalidadSelect, data?.nacionalidadId); }, [nacionalidadSelect.options, data?.nacionalidadId]);
	useEffect(() => { if (estadoCivilSelect.options?.length) setSelectedById(setEstadoCivilSelect, estadoCivilSelect, data?.estadoCivilId); }, [estadoCivilSelect.options, data?.estadoCivilId]);
	useEffect(() => { if (sexoSelect.options?.length) setSelectedById(setSexoSelect, sexoSelect, data?.sexoId); }, [sexoSelect.options, data?.sexoId]);
	useEffect(() => { if (situacionSelect.options?.length) setSelectedById(setSituacionSelect, situacionSelect, state.form?.denunciaSituacionId || data?.denunciaSituacionId); }, [situacionSelect.options, state.form?.denunciaSituacionId, data?.denunciaSituacionId]);
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
			setLockedDelegacion(false);
			setLockedSeccional(false);
			setDelegacionSelect((o) => ({ ...o, selected: {} }));
			setSeccionalSelect((o) => ({ ...o, selected: {}, options: [] }));
			setState((o) => ({ ...o, form: { ...o.form, delegacion: "", seccional: "" } }));
			return;
		}
		if (derivada === "Delegacion") {
			// mantener delegacion, limpiar seccional
			setLockedSeccional(false);
			setLockedDelegacion(false); // por defecto; se marcará locked cuando procesemos el derivadoAId
			setSeccionalSelect((o) => ({ ...o, selected: {}, options: [] }));
			setState((o) => ({ ...o, form: { ...o.form, seccional: "" } }));
			return;
		}
		if (derivada === "Seccional") {
			// permitir ambos: no hacemos limpieza automática (usuario debe elegir)
			setLockedDelegacion(false);
			setLockedSeccional(false);
			return;
		}
	}, [state.form.derivadaA]);


	let content = null;
	{



		const FormularioPanel = (
			<Grid full col gap="10px">
				{/* ====== CABECERA (nueva UI: SIN Seccional y SIN Fecha) ====== */}
				<Grid width gap="inherit">
					{
						(mode === "M" || readOnly) ? (
							<InputMaterial
								id="provincia"
								label="Provincia"
								readOnly
								value={
									state.form?.provinciaNombre || data?.provincia || trabPciaSelect.selected?.label || ""
								}
							/>
						) : (
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
						)
					}
					{
						(mode === "M" || readOnly) ? (
							<InputMaterial
								id="localidad"
								label="Localidad"
								readOnly
								value={state.form?.nombreLocalidadAfiliado || data?.localidad || trabLocaSelect.selected?.label || ""}
							/>
						) : (
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
						)
					}
					<InputMaterial
						id="delegacion"
						label="Delegación"
						readOnly
						value={state.form.delegacion || data?.delegacion || ""}
					/>
				</Grid>

				{/* ====== BLOQUE PRINCIPAL ====== */}
				<Grid col width gap="inherit" style={styles.group}>
					<Grid width style={styles.titulo}>Carga de Datos</Grid>
					<Grid col gap="inherit">
			{/* Delegación (solo display) */ }
		{/* <Grid width gap="inherit">
              <InputMaterial
                id="delegacion"
                label="Delegación"
                readOnly
                value={state.form.delegacion || data?.delegacion || ""}
                onChange={() => {}}
              />
            </Grid> */}

		{/* Nombre Denunciante / Teléfono de contacto / Correo electrónico */ }
		<Grid width gap="inherit">
			<InputMaterial
				id="nombreDenunciante"
				readOnly={readOnly}
				label="Nombre Denunciante"
				value={state.form.nombreDenunciante}
				error={!!state.errors.nombreDenunciante}
				helperText={state.errors.nombreDenunciante}
				onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, nombreDenunciante: v } }))}
			/>
			<InputMaterial
				id="telefonoContacto"
				readOnly={readOnly}
				type="tel"
				label="Teléfono de contacto"
				value={state.form.telefonoContacto}
				error={!!state.errors.telefonoContacto}
				helperText={state.errors.telefonoContacto}
				onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, telefonoContacto: v } }))}
			/>
			<InputMaterial
				id="correoElectronico"
				readOnly={readOnly}
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

		{/* Tipo de Ingreso / Situación / Ubicacion */ }
		<Grid width gap="inherit">
			<SearchSelectMaterial
				id="tipoIngreso"
				readOnly={readOnly}
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
				readOnly={readOnly}
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
				readOnly={readOnly}
				label="Ubicación"
				value={state.form.ubicacion}
				error={!!state.errors.ubicacion}
				helperText={state.errors.ubicacion}
				onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, ubicacion: v } }))}
			/>
		</Grid>

		{/* CUIT Empleador  */ }
		<Grid gap="inherit">
			<Grid width="200px">
				<InputMaterial
					id="cuitEmpresa"
					readOnly={readOnly}
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
							// 1) Consulta a AFIP
							setPadronAFIPQuery((o) => ({
								...o,
								loading: "Empleador",
								query: { ...o.query, params: { ...o.query.params, cuit } },
								onLoad: ({ ok, error }) => {
									if (error) {
										changes.errors.cuitEmpresa = error.code === 404 ? "No existe en ARCA" : error.toString();
										apply();
										setPadronAFIPQuery((o) => ({ ...o, loading: null }));
									} else {
										changes.form.razonSocial = ok?.razonSocial || ok?.nombre || "";
										// 2) Consultar endpoint /api/Empresas/GetEmpresaSpecs para obtener empresaId (filtro por cuit)
										sendRequest(
											{
												baseURL: "Comunes",
												endpoint: `/Empresas/GetEmpresaSpecs`,
												method: "GET",
												params: { cuit },
												errorType: "response",
											},
											(okEmp) => {
												// okEmp puede ser un array o un objeto; normalizar
												const found = Array.isArray(okEmp) ? (okEmp[0] || null) : (okEmp || null);
												const empresaId = found ? (found.id ?? found.Id ?? 0) : 0;
												changes.form.empresaId = Number(empresaId || 0);
												apply();
												setPadronAFIPQuery((o) => ({ ...o, loading: null }));
											},
											(errEmp) => {
												// Si falla la consulta de empresas, asumir empresaId = 0 pero continuar
												console.error('Empresas/GetEmpresaSpecs error:', errEmp);
												changes.form.empresaId = 0;
												apply();
												setPadronAFIPQuery((o) => ({ ...o, loading: null }));
											}
										);
									}
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
					readOnly={readOnly}
					label="Razón Social Empleador"
					value={state.form.razonSocial}
					error={!!state.errors.razonSocial}
					helperText={state.errors.razonSocial}
					onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, razonSocial: v } }))}
				/>
			</Grid>
		</Grid>

		{/* Detalle de la denuncia (texto libre) */ }
		<Grid width>
			<InputMaterial
				id="detalleDenuncia"
				readOnly={readOnly}
				label="Detalle de la denuncia"
				multiline
				rows={6}
				value={state.form.detalleDenuncia}
				error={!!state.errors.detalleDenuncia}
				helperText={state.errors.detalleDenuncia}
				onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, detalleDenuncia: v } }))}
			/>
		</Grid>

		{/* Delegación y Seccional (desplegables) Estados y derivados a*/ }
						<Grid width gap="inherit">

							<Grid grow>
								<SearchSelectMaterial
									readOnly={readOnly || mode === "A"}
									id="estado"
									label="Estado"
									value={state.form.estado ? { value: state.form.estado, label: state.form.estado } : { value: "Registrada", label: "Registrada" }}
									options={[
										{ value: "Registrada", label: "Registrada" },
										{ value: "Completada", label: "Completada" },
										{ value: "Derivada", label: "Derivada" },
										{ value: "En Planificacion", label: "En Planificacion" },
										{ value: "Gestion con Empleador", label: "Gestion con Empleador" },
										{ value: "Inspeccionada", label: "Inspeccionada" },
										{ value: "Relevamiento App", label: "Relevamiento App" },
										{ value: "Finalizada", label: "Finalizada" },
									]}
									onChange={(selected = {}) => setState((o) => ({ ...o, form: { ...o.form, estado: selected?.value, estadoDescripcion: selected?.label } }))}
									onTextChange={() => { }}
								/>
							</Grid>

							<Grid grow>
								<SearchSelectMaterial
									readOnly={readOnly}
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
					readOnly={lockedDelegacion || !(state.form.derivadaA === "Delegacion" || state.form.derivadaA === "Seccional")}
					onChange={(selected) => {
						setDelegacionSelect((o) => ({ ...o, selected }));
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
					error={!!seccionalSelect.error}
					helperText={seccionalSelect.loading ?? seccionalSelect.error}
					value={seccionalSelect.selected}
					readOnly={lockedSeccional || state.form.derivadaA !== "Seccional"}
					onChange={(selected) => {
						setSeccionalSelect((o) => ({ ...o, selected }));
						setState((o) => ({ ...o, form: { ...o.form, seccional: selected.record?.descripcion || selected.label } }));
					}}
					options={seccionalSelect.options}
					onTextChange={(buscar) => setSeccionalSelect((o) => ({ ...o, buscar }))}
				/>
			</Grid>
						</Grid >

	{/* Observaciones del Registro (texto libre) */ }
	< Grid width >
		<InputMaterial
			id="observacionesRegistro"
			readOnly={readOnly}
			label="Observaciones del Registro"
			multiline
			rows={4}
			value={state.form.observacionesRegistro}
			error={!!state.errors.observacionesRegistro}
			helperText={state.errors.observacionesRegistro}
			onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, observacionesRegistro: v } }))}
		/>
						</Grid >
					</Grid >
				</Grid >
			</Grid >
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
				</Tabs >
				<div style={{ marginTop: 10 }}>
					{selectedTab === 0 ? FormularioPanel : DocumentacionPanel}
	</div>
			</>
		);
	}










// NUEVO: builder sin efectos secundarios
const buildPayloads = () => {
	const errors = {};
	const body = { ...state.form };

	//if (!trabPciaSelect?.selected?.value) errors.provincia = "Dato requerido";
	//if (!trabLocaSelect?.selected?.record?.id) errors.localidad = "Dato requerido";

	// Si no está seleccionado en los selects, usá lo que vino del servidor (data) en modo edición.
	// Usamos null/undefined checks en lugar de truthy para aceptar id = 0 cuando el servidor
	// devolvió solo el nombre (p. ej. en ediciones antiguas). Además, si existe el nombre
	// textual en `data` también lo consideramos suficiente.
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

	if (provinciaIdSel == null && !provinciaTieneNombre) errors.provincia = "Dato requerido";
	if (localidadIdSel == null && !localidadTieneNombre) errors.localidad = "Dato requerido";

	if (!body.nombreDenunciante) errors.nombreDenunciante = "Dato requerido";
	if (body.correoElectronico && !ValidarEmail(body.correoElectronico)) errors.correoElectronico = "Dato inválido";
	if (body.telefonoContacto && !isPossiblePhoneNumber(body.telefonoContacto)) errors.telefonoContacto = "Dato inválido";
	if (body.cuitEmpresa && !ValidarCUIT(body.cuitEmpresa)) errors.cuitEmpresa = "Dato inválido";
	if (body.cuitEmpresa && !body.razonSocial) errors.razonSocial = "Complete Razón Social";

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

	const appDenunciaPayload = {
		nombre: body.nombreDenunciante || "",
		correo: body.correoElectronico || "",
		//provincia: trabPciaSelect?.selected?.record?.nombre || "",
		//localidad: trabLocaSelect?.selected?.record?.nombre || "",

		provincia: trabPciaSelect?.selected?.record?.nombre || data?.provincia || "",
		localidad: trabLocaSelect?.selected?.record?.nombre || data?.localidad || "",

		texto: body.detalleDenuncia || "",
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
	const built = buildPayloads();
	if (!built) return;
	const { appDenunciaPayload, estadoPayload } = built;
	// Debug: ver qué payload se arma al crear
	try { console.log('[DenunciasForm] onAgregaDenuncia - payload:', appDenunciaPayload, 'estadoPayload:', estadoPayload, 'state.form:', state.form); } catch (e) { }

	setCreateAppDenunciaQuery((o) => ({
		...o,
		query: { ...o.query, config: { ...o.query?.config, body: appDenunciaPayload } },
		onPreLoad: () => setState((s) => ({ ...s, loading: "Guardando denuncia..." })),
		onLoad: ({ ok, error }) => {
			if (error) {
				setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: error.toString() } }));
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
				onLoad: ({ error: error2 }) => {
					Promise.resolve()
						.then(() => persistirDocumentacion(appId))
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


	// Debug: ver payload y id resuelto antes de enviar PUT
	try { console.log('[DenunciasForm] onGuardaCambios - built payload:', appDenunciaPayload, 'state.form.id:', state.form?.id, 'data.id:', data?.id, 'state.form:', state.form); } catch (e) { }

	const id = state.form?.id || data?.id;
	if (!id) {
		setState((s) => ({ ...s, errors: { ...s.errors, create: "Falta Id para editar" } }));
		return;
	}

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
					() => {
						// persistir documentación y cerrar
						Promise.resolve()
							.then(() => persistirDocumentacion(id))
							.finally(() => onClose(true));
					},
					(errEstado) => {
						// Si falla crear estado, mostrar error pero seguir con persistir documentación
						setState((s) => ({ ...s, loading: null, errors: { ...s.errors, create: errEstado?.toString() } }));
						Promise.resolve()
							.then(() => persistirDocumentacion(id))
							.finally(() => onClose(true));
					},
					() => { }
				);
			} else {
				// Si no hay estadoBody, sólo persistir documentación
				Promise.resolve()
					.then(() => persistirDocumentacion(id))
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
		<Modal.Body>{content}</Modal.Body>
		<Modal.Footer>
			<Grid grid="auto / 1fr 150px 150px" width col gap="20px">
<Grid width style={{ color: "red" }}>{state.errors.create}</Grid>
{
	!readOnly && selectedTab === 0 && (
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
	)
}


<Button className="botonAmarillo" onClick={() => onClose(true)}>
	FINALIZA
</Button>
				</Grid >
			</Modal.Footer >
		</Modal >
	);
};

export default DenunciasForm;