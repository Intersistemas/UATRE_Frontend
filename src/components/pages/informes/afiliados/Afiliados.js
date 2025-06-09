import React, { useContext, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import downloadjs from "downloadjs";
import ArrayToCSV from "components/helpers/ArrayToCSV";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import useQueryState from "components/hooks/useQueryState";
import AuthContext from "store/authContext";
import useTareasUsuario from 'components/hooks/useTareasUsuario';
import useAmbitos from 'components/hooks/useAmbitos';


/** Imports
 * @typedef {import("components/hooks/useQueryState").onLoad} onLoad
 **/

const onCloseDef = () => {};

const columns = [
	{
		dataField: "nroAfiliado",
		text: "Nro. Afil.",
		sort: true,
		headerTitle: () => "Numero de Afiliado",
		headerStyle: { width: "6em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "cuil",
		text: "CUIL",
		sort: true,
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		formatter: (v) => Formato.Cuit(v),
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "cuilValidado",
		text: "Val.",
		headerTitle: true,
		headerStyle: { width: "3em", textAlign: "center" },
		formatter: (v, { cuil }) => (v === 0 ? "N" : v === cuil ? "V" : "D"),
		csvFormat: (v, { cuil }) => (v === 0 ? "N" : v === cuil ? "V" : "D"),
		style: { textAlign: "center" },
	},
	{
		dataField: "documento",
		text: "Doc. Nro.",
		sort: true,
		headerTitle: () => "Documento número",
		headerStyle: { width: "7em", textAlign: "center" },
		formatter: (v) => Formato.DNI(v),
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "nombre",
		text: "Nombre",
		sort: true,
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "estadoSolicitud",
		text: "Sit. Afi.",
		headerTitle: () => "Situación del Afiliado",
		headerStyle: { width: "6em", textAlign: "center" },
		csvFormat: (v) => v,
		style: (v) => {
			const style = { textAlign: "center" };
			switch (v) {
				case "Pendiente": {
					style.background = "#ffff64cc";
					break;
				}
				case "No Activo": {
					style.background = "#ff6464cc";
					style.color = "#FFF";
					break;
				}
				case "Rechazado": {
					style.background = "#f08c32cc";
					style.color = "#FFF";
					break;
				}
				default:
					break;
			}
			return style;
		},
	},
	{
		dataField: "seccional",
		text: "Seccional",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
	},
	{
		dataField: "refDelegacionDescripcion",
		text: "Delegación",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
	},
	{
		dataField: "provincia",
		text: "Provincia",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
	},
	{
		dataField: "fechaIngreso",
		text: "F. Ingreso",
		sort: true,
		headerTitle: () => "Fecha de Ingreso",
		headerStyle: { width: "7em", textAlign: "center" },
		formatter: (v) => Formato.Fecha(v),
		csvFormat: (v) => Formato.Fecha(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "fechaEgreso",
		text: "F. Egreso",
		sort: true,
		headerTitle: () => "Fecha de Egreso",
		headerStyle: { width: "7em", textAlign: "center" },
		formatter: (v) => Formato.Fecha(v),
		csvFormat: (v) => Formato.Fecha(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "puesto",
		text: "Puesto",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
	},
	{
		dataField: "empresaCUIT",
		text: "CUIT",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		formatter: (v) => Formato.Cuit(v),
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "empresaDescripcion",
		text: "Empresa",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
	},
	{
		dataField: "actividad",
		text: "Actividad",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
	},
	{
		dataField: "refMotivoBajaDescripcion",
		text: "Motivo de baja",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
	},
	{
		dataField: "ultimaDDJJPeriodo",
		text: "Período última DDJJ",
		headerTitle: true,
		headerStyle: { width: "12em", textAlign: "center" },
		formatter: (v) => Formato.Periodo(v),
		csvFormat: (v) => v,
	},
];

//#region delegacionSelectOptions
const delegacionSelectTodos = { value: 0, label: "Todas" };
const delegacionSelectOptions = ({ data = [], ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre }),
		start: data.length === 1 ? [] : [delegacionSelectTodos],
		...x,
	});
//#endregion delegacionSelectOptions

//#region seccionalSelectOptions
const seccionalSelectTodos = { value: 0, label: "Todas" };
const seccionalSelectOptions = ({ data = [], ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion }),
		start: data.length === 1 ? [] : [seccionalSelectTodos],
		...x,
	});
//#endregion seccionalSelectOptions

//#region motivosBajaSelectOptions
const motivosBajaSelectTodos = { value: 0, label: "Todos" };
const motivosBajaSelectOptions = ({ data = [], ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion }),
		start: data.length === 1 ? [] : [motivosBajaSelectTodos],
		...x,
	});
//#endregion motivosBajaSelectOptions

//#region estadoSelectOptions
const estadoSelectTodos = { value: 0, label: "Todos" };
const estadoSelectOptions = ({ data = [], ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion }),
		start: data.length === 1 ? [] : [estadoSelectTodos],
		...x,
	});
//#endregion estadoSelectOptions

//#region provinciaSelectOptions
const provinciaSelectTodos = { value: null, label: "Todas" };
const provinciaSelectOptions = ({ data = [], ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre }),
		start: data.length === 1 ? [] : [provinciaSelectTodos],
		...x,
	});
//#endregion provinciaSelectOptions

const Afiliados = ({ onClose = onCloseDef }) => {

	const tareas = useTareasUsuario();
	const ambito = useAmbitos().ambitoUser();
	//#region Trato queries a APIs
	const { setState: setAfiliadosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Afiliado/GetAfiliadosWithSpec`,
				method: "POST",
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
		{
			query: {
				params: { soloActivos: true },
				config: { errorType: "response" },
			},
		}
	);
	const { setState: setSeccionalesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional/GetSeccionalesSpecs`,
				method: "POST",
			},
		}),
		{
			query: {
				params: { soloActivos: true },
				config: { errorType: "response" },
			},
		}
	);
	const { setState: setSeccionalQuery } = useQueryState(
		(_, { id, ...params }) => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional/${id}`,
				method: "GET",
			},
			params,
		}),
		{
			query: { config: { errorType: "response" } },
		}
	);
	const { setState: setMotivosBajaQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/RefMotivoBaja/GetByTipo`,
				method: "GET",
			},
		}),
		{ query: { params: { tipo: "A" }, config: { errorType: "response" } } }
	);
	const { setState: setEstadosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/EstadoSolicitud`,
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
	//#endregion

	const { usuario } = useContext(AuthContext);
	const [init, setInit] = useState({
		pending: true,
		filtros: {},
		wait: { delegaciones: true, seccionales: true, provincias: true },
		usuario,
	});

	//#region filtros
	const [filtros, setFiltros] = useState({ ...init.filtros });

	//#region filtro delegacion
	const [delegacionSelect, setDelegacionSelect] = useState({
		reload: false,
		loading: "Cargando...",
		buscar: "",
		params: { soloActivos: true },
		data: [],
		error: null,
		optionsSrc: [],
		options: [],
		selected: delegacionSelectTodos,
		selectedDef: delegacionSelectTodos,
		origen: "",
		/** @type array */
		ambito: null,
	});
	// Buscador
	useEffect(() => {
		setDelegacionSelect((o) => ({
			...o,
			options: o.optionsSrc.filter((r) => includeSearch(r, o.buscar)),
		}));
	}, [delegacionSelect.buscar, delegacionSelect.optionsSrc]);
	//#endregion filtro delegacion

	//#region filtro seccional
	const [seccionalSelect, setSeccionalSelect] = useState({
		reload: false,
		loading: null,
		buscar: "",
		data: [],
		error: null,
		optionsSrc: [],
		options: [],
		selected: seccionalSelectTodos,
		selectedDef: seccionalSelectTodos,
		origen: "",
		refDelegacionId: 0,
		/** @type array */
		ambito: null,
	});
	// Buscador
	useEffect(() => {
		setSeccionalSelect((o) => ({
			...o,
			options: o.optionsSrc.filter((r) => includeSearch(r, o.buscar)),
		}));
	}, [seccionalSelect.buscar, seccionalSelect.optionsSrc]);
	//#endregion filtro seccional

	//#region filtro motivosBaja
	const [motivosBajaSelect, setMotivosBajaSelect] = useState({
		reload: true,
		loading: "Cargando...",
		buscar: "",
		params: { tipo: "A" },
		data: [],
		error: null,
		optionsSrc: [],
		options: [],
		selected: motivosBajaSelectTodos,
		selectedDef: motivosBajaSelectTodos,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setMotivosBajaSelect((o) => ({
			...o,
			options: o.optionsSrc.filter((r) => includeSearch(r, o.buscar)),
		}));
	}, [motivosBajaSelect.buscar, motivosBajaSelect.optionsSrc]);
	//#endregion filtro motivos baja

	//#region filtro estado
	const [estadoSelect, setEstadoSelect] = useState({
		reload: true,
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		optionsSrc: [],
		options: [],
		selected: estadoSelectTodos,
		selectedDef: estadoSelectTodos,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEstadoSelect((o) => ({
			...o,
			options: o.optionsSrc.filter((r) => includeSearch(r, o.buscar)),
		}));
	}, [estadoSelect.buscar, estadoSelect.optionsSrc]);
	//#endregion filtro estado

	//#region filtro provincia
	const [provinciaSelect, setProvinciaSelect] = useState({
		reload: false,
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		optionsSrc: [],
		options: [],
		selected: provinciaSelectTodos,
		selectedDef: provinciaSelectTodos,
		origen: "",
		/** @type array */
		ambito: null,
	});
	// Buscador
	useEffect(() => {
		setProvinciaSelect((o) => ({
			...o,
			options: o.optionsSrc.filter((r) => includeSearch(r, o.buscar)),
		}));
	}, [provinciaSelect.buscar, provinciaSelect.optionsSrc]);
	//#endregion filtro provincia

	//#endregion filtros

	//#region list
	const [list, setList] = useState({
		reload: false,
		loading: "Cargando...",
		pagination: { index: 1, size: 10 },
		sort: "nroAfiliadoDesc",
		params: {},
		data: [],
		error: null,
	});
	//#endregion

	//#region CSV
	const [csv, setCSV] = useState({
		reload: false,
		loading: null,
		sort: list.sort,
		params: list.params,
		data: [columns.map((r) => r.text)],
		formatters: columns.map(({ dataField, csvFormat }) => ({
			dataField,
			csvFormat,
		})),
		error: null,
	});
	//#endregion

	//#region Carga inicial

	//#region Carga inicial select delegacion
	useEffect(() => {
		if (!delegacionSelect.reload) return;
		setDelegacionSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
			data: [],
			options: [],
			optionsSrc: [],
			selected: delegacionSelectTodos,
			selectedDef: delegacionSelectTodos,
			buscar: "",
		}));
		setDelegacionesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setDelegacionSelect((o) => {
					const n = {
						...o,
						loading: null,
						data: o.ambito ? data.filter((r) => o.ambito.includes(r.id)) : data,
						error: error?.toString(),
					};
					n.optionsSrc = delegacionSelectOptions(n);
					n.selectedDef =
						n.optionsSrc.length === 1 ? n.optionsSrc[0] : delegacionSelectTodos;
					n.selected = n.selectedDef;
					return n;
				});
			},
		}));
	}, [delegacionSelect, setDelegacionesQuery]);
	//#endregion Carga inicial select delegacion

	//#region Carga inicial select seccional
	useEffect(() => {
		if (!seccionalSelect.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			error: null,
			options: [],
			optionsSrc: [],
			selected: seccionalSelectTodos,
			selectedDef: seccionalSelectTodos,
			buscar: "",
		};
		const data = [];
		if (seccionalSelect.refDelegacionId) {
			setSeccionalSelect((o) => ({ ...o, ...changes }));
		} else {
			changes.loading = null;
			changes.data = data;
			setSeccionalSelect((o) => ({ ...o, ...changes }));
			return;
		}
		/** @type {onLoad} */
		const onLoad = ({ query, ok, error }) => {
			let pages = 0;
			let pageIndex = query.config.body.pageIndex;
			if (ok) {
				pages = ok.pages;
				if (Array.isArray(ok.data)) {
					data.push(...ok.data);
				} else {
					console.error("Se esperaba un arreglo", ok.data);
				}
			}
			if (error) changes.error = error.toString();
			if (pageIndex < pages) {
				pageIndex += 1;
				changes.loading = `Cargando bloque ${pageIndex} de ${pages}...`;
				setSeccionalesQuery((o) => ({
					...o,
					query: {
						...o.query,
						config: {
							...o.query.config,
							body: {
								...o.query.config.body,
								pageIndex,
							},
						},
					},
					onLoad,
				}));
			} else {
				changes.loading = null;
				const ambito = seccionalSelect.ambito;
				changes.data = ambito
					? data.filter((r) => ambito.includes(r.id))
					: data;
				changes.optionsSrc = seccionalSelectOptions(changes);
				changes.selectedDef =
					changes.optionsSrc.length === 1
						? changes.optionsSrc[0]
						: seccionalSelectTodos;
				changes.selected = changes.selectedDef;
			}
			setSeccionalSelect((o) => ({ ...o, ...changes }));
		};
		setSeccionalesQuery((o) => ({
			...o,
			query: {
				...o.query,
				config: {
					...o.query.config,
					body: {
						...o.query.params,
						refDelegacionId: seccionalSelect.refDelegacionId,
						pageIndex: 1,
					},
				},
			},
			onLoad,
		}));
	}, [seccionalSelect, setSeccionalesQuery]);
	//#endregion Carga inicial select seccional

	//#region Carga inicial select motivosBaja
	useEffect(() => {
		if (!motivosBajaSelect.reload) return;
		setMotivosBajaSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
			data: [],
			options: [],
			optionsSrc: [],
			selected: motivosBajaSelectTodos,
			selectedDef: motivosBajaSelectTodos,
			buscar: "",
		}));
		setMotivosBajaQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setMotivosBajaSelect((o) => {
					const n = {
						...o,
						loading: null,
						data,
						error: error?.toString(),
					};
					n.optionsSrc = motivosBajaSelectOptions(n);
					n.selectedDef =
						n.optionsSrc.length === 1
							? n.optionsSrc[0]
							: motivosBajaSelectTodos;
					n.selected = n.selectedDef;
					return n;
				});
			},
		}));
	}, [motivosBajaSelect, setMotivosBajaQuery]);
	//#endregion Carga inicial select motivosBaja

	//#region Carga inicial select estados
	useEffect(() => {
		if (!estadoSelect.reload) return;
		setEstadoSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
			data: [],
			options: [],
			optionsSrc: [],
			selected: estadoSelectTodos,
			selectedDef: estadoSelectTodos,
			buscar: "",
		}));
		setEstadosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				console.log("data estados:", data);
				setEstadoSelect((o) => {
					const n = {
						...o,
						loading: null,
						data,
						error: error?.toString(),
					};
					n.optionsSrc = estadoSelectOptions(n);
					n.selectedDef =
						n.optionsSrc.length === 1 ? n.optionsSrc[0] : estadoSelectTodos;
					n.selected =  n.selectedDef;
					return n;
				});
			},
		}));
	}, [estadoSelect, setEstadosQuery]);
	//#endregion Carga inicial select estados

	//#region Carga inicial select provincias
	useEffect(() => {
		if (!provinciaSelect.reload) return;
		setProvinciaSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
			data: [],
			options: [],
			optionsSrc: [],
			selected: provinciaSelectTodos,
			selectedDef: provinciaSelectTodos,
			buscar: "",
		}));
		setProvinciasQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setProvinciaSelect((o) => {
					const n = {
						...o,
						loading: null,
						data: o.ambito ? data.filter((r) => o.ambito.includes(r.id)) : data,
						error: error?.toString(),
					};
					n.optionsSrc = provinciaSelectOptions(n);
					n.selectedDef =
						n.optionsSrc.length === 1 ? n.optionsSrc[0] : provinciaSelectTodos;
					n.selected = n.selectedDef;
					return n;
				});
			},
		}));
	}, [provinciaSelect, setProvinciasQuery]);
	//#endregion Carga inicial select provincias

	//#endregion Carga inicial

	//#region Cambia select delegación
	useEffect(() => {
		if (delegacionSelect.loading) return;
		const finalizaInit = () =>
			setInit((o) => {
				if (!o.wait || !("delegaciones" in o.wait)) return o;
				const init = { ...o };
				const wait = { ...init.wait };
				delete wait.delegaciones;
				init.wait = wait;
				return init;
			});
		const selected = delegacionSelect.selected;
		setSeccionalSelect((o) => {
			const n = {
				...o,
				reload: true,
				refDelegacionId:
					selected === delegacionSelectTodos ? 0 : selected?.value,
				selected: o.selectedDef,
			};
			if (!n.refDelegacionId) {
				setFiltros((o) => {
					const filtros = { ...o };
					delete filtros.ambitoDelegaciones;
					return filtros;
				});
			} else {
				setFiltros((o) => ({
					...o,
					ambitoDelegaciones: { ids: [selected?.value] },
				}));
			}
			finalizaInit();
			return n;
		});
	}, [delegacionSelect.loading, delegacionSelect.selected]);
	//#endregion Cambia select delegación

	//#region Cambia select seccional
	useEffect(() => {
		if (seccionalSelect.loading) return;
		const finalizaInit = () => {
			setInit((o) => {
				if (!o.wait || !("seccionales" in o.wait)) return o;
				const init = { ...o };
				const wait = { ...init.wait };
				delete wait.seccionales;
				init.wait = wait;
				return init;
			});
		};
		const selected = seccionalSelect.selected;
		if (selected === seccionalSelectTodos) {
			setFiltros((o) => {
				const filtros = { ...o };
				delete filtros.ambitoSeccionales;
				return filtros;
			});
			finalizaInit();
			return;
		}
		setFiltros((o) => ({
			...o,
			ambitoSeccionales: { ids: [selected?.value] },
		}));
		finalizaInit();
	}, [seccionalSelect.loading, seccionalSelect.selected]);
	//#endregion Cambia select seccional

	//#region Cambia select motivosBaja
	useEffect(() => {
		if (motivosBajaSelect.loading) return;
		const selected = motivosBajaSelect.selected;
		if (selected === motivosBajaSelectTodos) {
			setFiltros((o) => {
				const filtros = { ...o };
				delete filtros.refMotivoBajaId;
				return filtros;
			});
			return;
		}
		setFiltros((o) => ({
			...o,
			refMotivoBajaId: selected?.value,
		}));
	}, [motivosBajaSelect.loading, motivosBajaSelect.selected]);
	//#endregion Cambia select motivosBaja

	//#region Cambia select estado
	useEffect(() => {
		if (estadoSelect.loading) return;
		const selected = estadoSelect.selected;
		if (selected === estadoSelectTodos) {
			setFiltros((o) => {
				const filtros = { ...o };
				delete filtros.estadoSolicitudId;
				return filtros;
			});
			return;
		}
		setFiltros((o) => ({
			...o,
			estadoSolicitudId: selected?.value,
		}));
	}, [estadoSelect.loading, estadoSelect.selected]);
	//#endregion Cambia select estado

	//#region Cambia select provincia
	useEffect(() => {
		if (provinciaSelect.loading) return;
		const finalizaInit = () => {
			setInit((o) => {
				if (!o.wait || !("provincias" in o.wait)) return o;
				const init = { ...o };
				const wait = { ...init.wait };
				delete wait.provincias;
				init.wait = wait;
				return init;
			});
		};
		const selected = provinciaSelect.selected;
		if (selected === provinciaSelectTodos) {
			setFiltros((o) => {
				const filtros = { ...o };
				delete filtros.ambitoProvincias;
				return filtros;
			});
			finalizaInit();
			return;
		}
		setFiltros((o) => ({
			...o,
			ambitoProvincias: { ids: [selected?.value] },
		}));
		finalizaInit();
	}, [provinciaSelect.loading, provinciaSelect.selected]);
	//#endregion Cambia select provincia

	//#region Recarga

	//#region Recarga list
	useEffect(() => {
		if (!list.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: [],
			error: null,
		};
		setList((o) => ({ ...o, ...changes }));
		setAfiliadosQuery((o) => ({
			...o,
			query: {
				...o.query,
				config: {
					...o.query.config,
					body: {
						...list.params,
						sort: list.sort,
						pageIndex: list.pagination.index,
						pageSize: list.pagination.size,
					},
				},
			},
			onLoad: ({ ok, error }) => {
				let data = [];
				let pagination = {};
				if (ok) {
					if (!Array.isArray(ok.data))
						console.error("Se esperaba un arreglo", data);
					else ({ data, ...pagination } = ok);
				}
				setList((o) => ({
					...o,
					loading: null,
					data,
					pagination: { ...o.pagination, ...pagination },
					error: error?.toString(),
				}));
			},
		}));
	}, [list, setAfiliadosQuery]);
	//#endregion Recarga list

	//#region Recarga csv
	useEffect(() => {
		if (!csv.reload) return;
		const titulos = csv.data[0];
		const changes = {
			reload: null,
			loading: "Cargando bloque 1...",
			data: [titulos],
			error: null,
		};
		setCSV((o) => ({ ...o, ...changes }));
		/** @type {onLoad} */
		const onLoad = ({ query, ok, error }) => {
			if (ok) {
				let { data, index, pages, size } = ok;
				if (Array.isArray(data)) {
					changes.data.push(
						...data.map((r) =>
							csv.formatters.map((f) => f.csvFormat(r[f.dataField], r))
						)
					);
				} else console.error("Se esperaba un arreglo", data);
				if (index < pages) {
					changes.loading = `Cargando bloque ${index + 1} de ${pages}...`;
					setAfiliadosQuery((o) => ({
						...o,
						query: {
							...query,
							config: {
								...query.config,
								body: {
									...query.config.body,
									pageIndex: index + 1,
									pageSize: size,
								},
							},
						},
						onLoad,
					}));
				} else {
					changes.loading = null;
				}
			} else if (error) {
				changes.loading = null;
				changes.error = error?.toString();
			}
			setCSV((o) => ({
				...o,
				...changes,
			}));
			if (!changes.loading)
				downloadjs(ArrayToCSV(changes.data), "Afiliados.csv", "text/csv");
		};
		setAfiliadosQuery((o) => ({
			...o,
			query: {
				...o.query,
				config: { ...o.query.config, body: { ...csv.params, sort: csv.sort } },
			},
			onLoad,
		}));
	}, [csv, setAfiliadosQuery]);
	//#endregion Recarga csv

	//#endregion Recarga

	const onAplicaFiltros = () => {
		setList((o) => ({
			...o,
			reload: true,
			params: filtros,
			data: [],
			error: null,
			pagination: { ...o.pagination, index: 1, count: 0 },
		}));
		setCSV((o) => ({ ...o, params: filtros }));
	};

	const onLimpiaFiltros = () => {
		const filtros = { ...init.filtros };
		setDelegacionSelect((o) => ({ ...o, selected: o.selectedDef }));
		setSeccionalSelect((o) => ({ ...o, selected: o.selectedDef }));
		setMotivosBajaSelect((o) => ({ ...o, selected: o.selectedDef }));
		setEstadoSelect((o) => ({ ...o, selected: o.selectedDef }));
		setProvinciaSelect((o) => ({ ...o, selected: o.selectedDef }));
		setFiltros(filtros);
		if (JSON.stringify(list.params) === JSON.stringify(filtros)) return;
		setList((o) => ({
			...o,
			reload: true,
			params: filtros,
			data: [],
			error: null,
		}));
		setCSV((o) => ({ ...o, params: filtros }));
	};

	const onCSV = () => setCSV((o) => ({ ...o, reload: true }));

	//#region activa init
	useEffect(() => {
		if (!init.pending) return;
		setInit((o) => ({ ...o, pending: false }));
		const ambito = {
			delegaciones: [...AsArray(init.usuario.ambitoDelegaciones?.ids)],
			seccionales: [...AsArray(init.usuario.ambitoSeccionales?.ids)],
			provincias: [...AsArray(init.usuario.ambitoProvincias?.ids)],
		};
		const finalizaCarga = () => {
			setInit((o) => {
				const init = { ...o };
				const filtros = init.filtros;
				if (ambito.seccionales.length)
					filtros.ambitoSeccionales = { ids: [...ambito.seccionales] };
				if (ambito.delegaciones.length)
					filtros.ambitoDelegaciones = { ids: [...ambito.delegaciones] };
				if (ambito.provincias.length)
					filtros.ambitoProvincias = { ids: [...ambito.provincias] };
				return init;
			});
			if (ambito.seccionales.length)
				setSeccionalSelect((o) => ({ ...o, ambito: ambito.seccionales }));
			const delegaciones = {};
			if (ambito.delegaciones.length) delegaciones.ambito = ambito.delegaciones;
			setDelegacionSelect((o) => ({
				...o,
				reload: true,
				loading: "Cargando...",
				...delegaciones,
			}));
			const provincias = {};
			if (ambito.provincias.length) provincias.ambito = ambito.provincias;
			setProvinciaSelect((o) => ({
				...o,
				reload: true,
				loading: "Cargando...",
				...provincias,
			}));
		};
		if (ambito.seccionales.length && !ambito.delegaciones.length) {
			const seccionales = [...ambito.seccionales].filter((r) => r);
			/** @type {onLoad} */
			const onLoad = ({ ok }) => {
				const refDelegacionId = ok?.refDelegacionId;
				if (refDelegacionId && !ambito.delegaciones.includes(refDelegacionId))
					ambito.delegaciones.push(refDelegacionId);
				let seccional = seccionales.shift();
				if (seccional) {
					setSeccionalQuery((o) => ({
						...o,
						query: {
							...o.query,
							params: { id: seccional },
						},
						onLoad,
					}));
				} else {
					finalizaCarga();
				}
			};
			onLoad({});
		} else {
			finalizaCarga();
		}
	}, [init, setSeccionalQuery]);

	useEffect(() => {
		if (init.pending) return;
		if (init.wait == null) return;
		if (Object.keys(init.wait).length) return;
		setInit((o) => ({ ...o, wait: null }));
		onLimpiaFiltros();
	}, [init, onLimpiaFiltros]);
	//#endregion activa init

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				Afiliados
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<Grid grow>
							<SearchSelectMaterial
								id="delegacionSelect"
								label="Delegación"
								error={!!delegacionSelect.error}
								helperText={delegacionSelect.loading ?? delegacionSelect.error}
								value={delegacionSelect.selected}
								onChange={(selected) =>
									setDelegacionSelect((o) => ({ ...o, selected }))
								}
								options={delegacionSelect.options}
								onTextChange={(buscar) =>
									setDelegacionSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid grow>
							<SearchSelectMaterial
								id="seccionalSelect"
								label="Seccional"
								error={!!seccionalSelect.error}
								helperText={seccionalSelect.loading ?? seccionalSelect?.error}
								value={seccionalSelect.selected}
								onChange={(selected) =>
									setSeccionalSelect((o) => ({ ...o, selected }))
								}
								options={seccionalSelect.options}
								onTextChange={(buscar) =>
									setSeccionalSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid grow>
							<SearchSelectMaterial
								id="motivosBajaSelect"
								label="Motivo de baja"
								error={!!motivosBajaSelect.error}
								helperText={
									motivosBajaSelect.loading ?? motivosBajaSelect.error
								}
								value={motivosBajaSelect.selected}
								onChange={(selected) =>
									setMotivosBajaSelect((o) => ({ ...o, selected }))
								}
								options={motivosBajaSelect.options}
								onTextChange={(buscar) =>
									setMotivosBajaSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
					</Grid>
					<Grid width gap="inherit">
						<Grid grow>
							<SearchSelectMaterial
								id="estadoSelect"
								label="Estado"
								error={!!estadoSelect.error}
								helperText={estadoSelect.loading ?? estadoSelect?.error}
								value={estadoSelect.selected}
								onChange={(selected) =>
									setEstadoSelect((o) => ({ ...o, selected }))
								}
								options={estadoSelect.options}
								onTextChange={(buscar) =>
									setEstadoSelect((o) => ({ ...o, buscar }))
								}
								//disabled={ambito.tipo == "Delegaciones" ? true : false}
							/>
						</Grid>
						<Grid grow>
							<SearchSelectMaterial
								id="provinciaSelect"
								label="Provincia"
								error={!!provinciaSelect.error}
								helperText={provinciaSelect.loading ?? provinciaSelect?.error}
								value={provinciaSelect?.selected}
								onChange={(selected) =>
									setProvinciaSelect((o) => ({ ...o, selected }))
								}
								options={provinciaSelect.options}
								onTextChange={(buscar) =>
									setProvinciaSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid width="200px">
							<Button
								className="botonAzul"
								disabled={
									JSON.stringify(list.params) === JSON.stringify(filtros)
								}
								onClick={onAplicaFiltros}
							>
								Aplica filtros
							</Button>
						</Grid>
						<Grid width="200px">
							<Button
								className="botonAzul"
								disabled={
									JSON.stringify(filtros) === JSON.stringify(init.filtros)
								}
								onClick={onLimpiaFiltros}
							>
								Limpia filtros
							</Button>
						</Grid>
					</Grid>
					<Table
						remote
						keyField="id"
						data={list.data}
						mostrarBuscar={false}
						baseProps={{ style: { overflowX: "scroll" } }}
						pagination={{
							...list.pagination,
							onChange: (pagination) =>
								setList((o) => ({
									...o,
									reload: true,
									pagination: { ...o.pagination, ...pagination },
									data: [],
									error: null,
								})),
						}}
						noDataIndication={
							list.loading || list.error || "No existen datos para mostrar "
						}
						columns={columns}
						onTableChange={(type, { sortOrder, sortField }) => {
							switch (type) {
								case "sort": {
									sortField = { cuil: "CUIL" }[sortField] ?? sortField;
									const sort = `${sortField}${
										sortOrder === "desc" ? "Desc" : ""
									}`;
									setList((o) => ({
										...o,
										reload: true,
										sort,
										data: [],
										error: null,
										pagination: { ...o.pagination, count: 0 },
									}));
									setCSV((o) => ({ ...o, params: { ...o.params, sort } }));
									return;
								}
								default:
									return;
							}
						}}
					/>
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid col gap="5px">
					<Grid gap="20px" justify="end">
						<Grid width="250px">
							<Button
								className="botonAmarillo"
								loading={!!csv.loading}
								onClick={() => onCSV()}
								tarea="Informes_Afiliados_Afiliados_CSV"
							>
								GENERA ARCHIVO CSV
							</Button>
						</Grid>
						<Grid width="150px">
							<Button className="botonAmarillo" onClick={() => onClose()}>
								FINALIZA
							</Button>
						</Grid>
					</Grid>
					{csv.loading == null ? null : (
						<text style={{ color: "green" }}>{csv.loading}</text>
					)}
					{csv.error == null ? null : (
						<text style={{ color: "red" }}>{csv.error}</text>
					)}
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default Afiliados;