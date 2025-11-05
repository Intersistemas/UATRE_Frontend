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
	const handleChangeTab = (_e, v) => {
		//"Novedades"
		if ((disableNovedades || mode === "A") && v === 2) return;
		setSelectedTab(v);
	};

	const [disableNovedades, setDisableNovedades] = useState(mode === "A");

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
	const [estadosList, setEstadosList] = useState([]);
	const [selectedEstado, setSelectedEstado] = useState(null);
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

	const loadDocumentacion = (entidadId) => {
		if (!entidadId) {
			setDocumentacionList([]);
			return;
		}
		setDocumentosQuery(o => ({
			...o,
			query: { ...o.query, params: { EntidadId: entidadId, EntidadTipo: "R" } },
			onLoad: ({ ok, error }) => {
				const arr = Array.isArray(ok) ? ok : [];
				setDocumentacionList(arr);
				if (error) console.error("DocumentacionEntidad/GetBySpec error:", error);
			}
		}));
	};

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
					if (mode === "M") {
						setDocumentacionList([]);
					} else {
						// cargar documentación con el id del Estado
						const estadoId = Number(last?.id ?? last?.Id ?? 0);
						loadDocumentacion(estadoId || entidadId);
					}
				} else {
					if (mode === "M") setDocumentacionList([]);
					else loadDocumentacion(entidadId);
				}
				if (error) console.error("DenunciasEstados GET error:", error);
			},


		}));
	}, [data?.id, setGetEstadosQuery]);
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
					const arr = Array.isArray(ok) ? ok : [];
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

	const NovedadesPanel = (
		<Grid full>
			<Table
				keyField="rowKey"
				data={novedadesRows}
				mostrarBuscar={false}
				pagination={{ size: 10 }}
				noDataIndication={novedadesRows.length === 0 ? "No existen novedades para mostrar" : null}
				selection={{
					mode: "radio",
					clickToSelect: true,
					hideSelectColumn: true,
					selected: selectedEstado ? [selectedEstado.rowKey] : [],
					onSelect: (row) => {
						setSelectedEstado(row);
						const entidadId = Number(row?.id ?? row?.Id ?? 0);
						if (entidadId) {
							loadDocumentacion(entidadId);
						}
					},
				}}
				columns={[
					{ dataField: "fecha", text: "Fecha", formatter: (v) => Formato.Fecha(v) },
					{ dataField: "estado", text: "Estado", sort: true, style: { textAlign: "left" } },
					{ dataField: "observaciones", text: "Observaciones", style: { textAlign: "left" } },

					{
						dataField: "documento",
						text: "Documento",
						isDummyField: true,
						formatter: (_c, row) => {
							const doc = row?._doc;
							if (!doc) return "";
							const nombre = doc?.nombreArchivo ?? doc?.fileName ?? "Documento";
							const b64 = doc?.archivo ?? doc?.archivoBase64 ?? doc?.contenido;
							const contentType = doc?.contentType || "application/octet-stream";
							const href = doc?.url ? doc.url : (b64 ? `data:${contentType};base64,${b64}` : null);
							return href ? (
								<a href={href} target="_blank" rel="noreferrer" download={nombre}>
									{nombre}
								</a>
							) : nombre;
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
		const entidadTipo = "R";
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
				sendRequest(
					{
						baseURL: "Comunes",
						endpoint: `/DocumentacionEntidad`,
						method: "PUT",
						body: payload,
						errorType: "response",
					},
					({ ok }) => {
						console.log(` Archivo actualizado: ${item.nombreArchivo}`, ok);
					},
					(err) => {
						console.error(` Error al actualizar archivo ${item.nombreArchivo}:`, err);
					}
				);
			} else {
				// Nuevo archivo
				sendRequest(
					{
						baseURL: "Comunes",
						endpoint: `/DocumentacionEntidad`,
						method: "POST",
						body: payload,
						errorType: "response",
					},
					({ ok }) => {
						console.log(`✅ Archivo creado: ${item.nombreArchivo}`, ok);
						if (ok?.id || ok?.Id) {
							const nuevo = [...lista];
							nuevo[i] = { ...item, id: ok.id ?? ok.Id };
							setDocumentacionList(nuevo);
							setState(s => ({ ...s, form: { ...s.form, documentacion: nuevo } }));
						}
					},
					(err) => {
						console.error(` Error al crear archivo ${item.nombreArchivo}:`, err);
					}
				);
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
			form: {
				...o.form,
				...data,
				// En modo "M" forzar observaciones vacías
				...(mode === "M" ? { observacionesRegistro: "" } : {}),
				fecha: data.fecha ? `${data.fecha}`.slice(0, 10) : o.form.fecha,
			},
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


		// Estados válidos según estado actual 
		const ALL = [
			"Registrada",
			"Completada",
			"Derivada",
			"En Planificacion",
			"Gestion con Empleador",
			"Inspeccionada",
			"Relevamiento App",
			"Finalizada",
		];
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
		// Derivada a: opciones válidas según lo que vino desde DB
		const derivadaPersistida = String(
			state.form?.derivadaADescripcion || state.form?.derivadaA || data?.derivadoATipo || data?.derivadaATipo || "Sin derivacion"
		).trim();
		const derivadaOptionsFor = (tipo) => {
			if (tipo === "Asesoria Letrada") return ["Asesoria Letrada"];
			if (tipo === "CNTA") return ["CNTA"];
			if (tipo === "Seccional") return ["Seccional"];
			if (tipo === "Delegacion") return ["Delegacion", "Seccional"]; // permitir pasar a Seccional
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

		const lockAllExceptRouting = !isRegistrada;     
		const canEditAll = !readOnly && isRegistrada;   
		const canEditRouting = !readOnly && !isRegistrada; 


		const FormularioPanel = (
			<Grid full col gap="10px">
				{/* ====== CABECERA (nueva UI: SIN Seccional y SIN Fecha) ====== */}
				<Grid width gap="inherit">
					{
						(mode === "M" || readOnly || lockAllExceptRouting) ? (
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
						(mode === "M" || readOnly || lockAllExceptRouting) ? (
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
								onKeyDown={(e) => { e.preventDefault(); }}
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
								id="nombreDenunciante"
								readOnly={readOnly || lockAllExceptRouting}
								label="Nombre Denunciante"
								value={state.form.nombreDenunciante}
								error={!!state.errors.nombreDenunciante}
								helperText={state.errors.nombreDenunciante}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, nombreDenunciante: v } }))}
							/>
							<InputMaterial
								id="telefonoContacto"
								readOnly={readOnly || lockAllExceptRouting}
								type="tel"
								label="Teléfono de contacto"
								value={state.form.telefonoContacto}
								error={!!state.errors.telefonoContacto}
								helperText={state.errors.telefonoContacto}
								onChange={(v) => setState((o) => ({ ...o, form: { ...o.form, telefonoContacto: v } }))}
							/>
							<InputMaterial
								id="correoElectronico"
								readOnly={readOnly || lockAllExceptRouting}
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
								readOnly={readOnly || lockAllExceptRouting}
								label="Tipo de Ingreso"
								onKeyDown={(e) => { e.preventDefault(); }}
								error={!!tipoIngresoSelect.error}
								helperText={tipoIngresoSelect.loading ?? tipoIngresoSelect.error}
								value={tipoIngresoSelect.selected}
								options={tipoIngresoSelect.options}
								freeSolo={false}
								inputReadOnly={true}
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
								readOnly={readOnly || lockAllExceptRouting}
								label="Situación"
								onKeyDown={(e) => { e.preventDefault(); }}
								error={!!situacionSelect.error}
								helperText={situacionSelect.loading ?? situacionSelect.error}
								value={situacionSelect.selected}
								options={situacionSelect.options}
								freeSolo={false}
								inputReadOnly={true}
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
								readOnly={readOnly || lockAllExceptRouting}
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
									readOnly={readOnly || lockAllExceptRouting}
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
										const changes = { form: {}, errors: { cuitEmpresa: "" } };
										const cuit = state.form.cuitEmpresa;
										const apply = (isOk = false) =>
											setState((o) => ({
												...o,
												form: { ...o.form, ...changes.form },
												errors: { ...o.errors, ...changes.errors },
												validado: { ...o.validado, empleador: isOk },
											}));
										if (cuit) {

											// 1) Buscar primero en /Empresas/GetEmpresaSpecs
											setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador" }));
											const cuitDigits = onlyDigits(cuit);
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
														// Relleno desde Empresas y corto
														changes.form.razonSocial = found.razonSocial || found.nombre || "";
														changes.form.empresaId = Number(found.id ?? found.Id ?? 0);
														apply(true);
														setPadronAFIPQuery((o) => ({ ...o, loading: null }));
														return;
													}
													// Fallback a AFIP si no encontró
													setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador (AFIP)" }));
													setPadronAFIPQuery((o) => ({
														...o,
														query: { ...o.query, params: { ...o.query.params, cuit: cuitDigits } },
														onLoad: ({ ok, error }) => {
															if (error) {
																changes.errors.cuitEmpresa = error.code === 404 ? "No existe en ARCA" : error.toString();
																apply(false);
																setPadronAFIPQuery((o) => ({ ...o, loading: null }));
																return;
															}
															changes.form.razonSocial = ok?.razonSocial || ok?.nombre || "";
															changes.form.empresaId = 0; // no existe en catálogo local
															apply(true);
															setPadronAFIPQuery((o) => ({ ...o, loading: null }));
														},
													}));
												},
												(errEmp) => {
													// Intentar AFIP igual
													console.error('Empresas/GetEmpresaSpecs error:', errEmp);
													setPadronAFIPQuery((o) => ({ ...o, loading: "Empleador (AFIP)" }));
													setPadronAFIPQuery((o) => ({
														...o,
														query: { ...o.query, params: { ...o.query.params, cuit: cuitDigits } },
														onLoad: ({ ok, error }) => {
															if (error) {
																changes.errors.cuitEmpresa = error.code === 404 ? "No existe en ARCA" : error.toString();
																apply(false);
																setPadronAFIPQuery((o) => ({ ...o, loading: null }));
																return;
															}
															changes.form.razonSocial = ok?.razonSocial || ok?.nombre || "";
															changes.form.empresaId = 0;
															apply(true);
															setPadronAFIPQuery((o) => ({ ...o, loading: null }));
														},
													}));
												}
											);
										} else {
											changes.errors.cuitEmpresa = "Dato requerido";
											apply();
										}
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
									readOnly={readOnly || mode === "A"}
									id="estado"
									label="Estado"
									onKeyDown={(e) => { e.preventDefault(); }}
									style={mode === "A" ? { backgroundColor: "#f5f5f5", opacity: 0.6 } : undefined}
									value={state.form.estado ? { value: state.form.estado, label: state.form.estado } : { value: "Registrada", label: "Registrada" }}
									options={estadoOptions}
									onChange={(selected = {}) => setState((o) => ({ ...o, form: { ...o.form, estado: selected?.value, estadoDescripcion: selected?.label } }))}
									freeSolo={false}
									inputReadOnly={true}
									onTextChange={() => { }}
								/>
							</Grid>

							<Grid grow>
								<SearchSelectMaterial
									readOnly={readOnly || state.form.estado !== "Derivada"}
									id="derivadaA"
									label="Derivada a"
									onKeyDown={(e) => { e.preventDefault(); }}
									style={mode === "A" ? { backgroundColor: "#f5f5f5", opacity: 0.6 } : undefined}
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
									onKeyDown={(e) => { e.preventDefault(); }}
									style={mode === "A" ? { backgroundColor: "#f5f5f5", opacity: 0.6 } : undefined}
									error={!!delegacionSelect.error}
									helperText={delegacionSelect.loading ?? delegacionSelect.error}
									value={delegacionSelect.selected}
									readOnly={lockedDelegacion || !(state.form.derivadaA === "Delegacion" || state.form.derivadaA === "Seccional")}
									freeSolo={false}
									inputReadOnly={true}
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
									onKeyDown={(e) => { e.preventDefault(); }}
									style={mode === "A" ? { backgroundColor: "#f5f5f5", opacity: 0.6 } : undefined}
									error={!!seccionalSelect.error}
									helperText={seccionalSelect.loading ?? seccionalSelect.error}
									value={seccionalSelect.selected}
									readOnly={lockedSeccional || state.form.derivadaA !== "Seccional"}
									freeSolo={false}
									inputReadOnly={true}
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
								readOnly={readOnly}
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
								console.log(' Guardado local - se enviará al servidor cuando se confirme el formulario');
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
									console.log('✅ Archivo creado exitosamente:', ok);
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
							sendRequest(
								{
									baseURL: "Comunes",
									endpoint: `/DocumentacionEntidad`,
									method: "DELETE",
									params: { id },
									errorType: "response",
								},
								() => {
									console.log(' Archivo eliminado del servidor exitosamente');
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
							console.log(' ACTUALIZANDO archivo:', current?.nombreArchivo);
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
									endpoint: `/DocumentacionEntidad`,
									method: "PUT",
									body: payload,
									errorType: "response",
								},
								() => {
									console.log(' Archivo actualizado exitosamente');
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
		content = (
			<>
				<Tabs value={selectedTab} onChange={handleChangeTab}>
					<Tab label="Datos" />
					<Tab label="Documentación" />
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


		// SOLO bloquear si se intenta pasar de Registrada -> Completada sin validar CUIT
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

		// Regla: Para pasar de Registrada -> Completada es obligatorio y validar el CUIL del empleador
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
			nombre: body.nombreDenunciante || "",
			correo: body.correoElectronico || "",
			telefono: body.telefonoContacto || "",
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
		setDisableNovedades(true);
		setSelectedTab(0); // quedarnos en la pestaña Datos
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
						(okEstado) => {
							const rawEstadoId = okEstado?.id ?? okEstado?.Id ?? (Number.isFinite(okEstado) ? okEstado : null);
							const estadoId = rawEstadoId != null ? Number(rawEstadoId) : null;
							const entidadParaDocumentacion = estadoId || id;

							// persistir documentación y cerrar
							Promise.resolve()
								.then(() => persistirDocumentacion(entidadParaDocumentacion))
								.finally(() => onClose(true));
						},
						(errEstado) => {
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