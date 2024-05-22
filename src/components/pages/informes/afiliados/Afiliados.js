import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import downloadjs from "downloadjs";
import ArrayToCSV from "components/helpers/ArrayToCSV";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import useQueryState from "components/hooks/useQueryState";

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
const delegacionSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre }),
		filter: (r) => includeSearch(r, buscar),
		start: [delegacionSelectTodos],
		...x,
	});
//#endregion delegacionSelectOptions

//#region seccionalSelectOptions
const seccionalSelectTodos = { value: 0, label: "Todas" };
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion }),
		filter: (r) => includeSearch(r, buscar),
		start: [seccionalSelectTodos],
		...x,
	});
//#endregion seccionalSelectOptions

//#region motivosBajaSelectOptions
const motivosBajaSelectTodos = { value: 0, label: "Todos" };
const motivosBajaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion }),
		filter: (r) => includeSearch(r, buscar),
		start: [motivosBajaSelectTodos],
		...x,
	});
//#endregion motivosBajaSelectOptions

//#region estadoSelectOptions
const estadoSelectTodos = { value: 0, label: "Todos" };
const estadoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion }),
		filter: (r) => includeSearch(r, buscar),
		start: [estadoSelectTodos],
		...x,
	});
//#endregion estadoSelectOptions

//#region provinciaSelectOptions
const provinciaSelectTodos = { value: null, label: "Todas" };
const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre }),
		filter: (r) => includeSearch(r, buscar),
		start: [provinciaSelectTodos],
		...x,
	});
//#endregion provinciaSelectOptions

const Afiliados = ({ onClose = onCloseDef }) => {
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
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetData": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado/GetAfiliadosWithSpec`,
						method: "POST",
					},
				};
			}
			case "GetEstados": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/EstadoSolicitud`,
						method: "GET",
					},
				};
			}
			case "GetProvincias": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Provincia`,
						method: "GET",
					},
				};
			}
			case "GetDelegaciones": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefDelegacion/GetAll`,
						method: "GET",
					},
				};
			}
			case "GetSeccionales": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/GetSeccionalesSpecs`,
						method: "POST",
					},
				};
			}
			case "GetMotivosBaja": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefMotivoBaja/GetByTipo`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region filtros
	const [filtros, setFiltros] = useState({});

	//#region filtro delegacion
	const [delegacionSelect, setDelegacionSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		params: { soloActivos: true },
		data: [],
		error: null,
		options: [],
		selected: delegacionSelectTodos,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setDelegacionSelect((o) => ({
			...o,
			options: delegacionSelectOptions(o),
		}));
	}, [delegacionSelect.buscar, delegacionSelect.data]);
	//#endregion filtro delegacion

	//#region filtro seccional
	const [seccionalSelect, setSeccionalSelect] = useState({
		loading: null,
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: seccionalSelectTodos,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setSeccionalSelect((o) => ({
			...o,
			options: seccionalSelectOptions(o),
		}));
	}, [seccionalSelect.buscar, seccionalSelect.data]);
	//#endregion filtro seccional

	//#region filtro motivosBaja
	const [motivosBajaSelect, setMotivosBajaSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		params: { tipo: "A" },
		data: [],
		error: null,
		options: [],
		selected: motivosBajaSelectTodos,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setMotivosBajaSelect((o) => ({
			...o,
			options: motivosBajaSelectOptions(o),
		}));
	}, [motivosBajaSelect.buscar, motivosBajaSelect.data]);
	//#endregion filtro motivos baja

	//#region filtro estado
	const [estadoSelect, setEstadoSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: estadoSelectTodos,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEstadoSelect((o) => ({
			...o,
			options: estadoSelectOptions(o),
		}));
	}, [estadoSelect.buscar, estadoSelect.data]);
	//#endregion filtro estado

	//#region filtro provincia
	const [provinciaSelect, setProvinciaSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: provinciaSelectTodos,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setProvinciaSelect((o) => ({
			...o,
			options: provinciaSelectOptions(o),
		}));
	}, [provinciaSelect.buscar, provinciaSelect.data]);
	//#endregion filtro provincia

	//#endregion filtros

	//#region list
	const [list, setList] = useState({
		reload: true,
		loading: null,
		pagination: { index: 1, size: 10 },
		sort: "nroAfiliadoDesc",
		params: {},
		data: [],
		error: null,
	});

	useEffect(() => {
		if (!list.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: [],
			error: null,
		};
		setList((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetData",
			config: {
				body: {
					...list.params,
					sort: list.sort,
					pageIndex: list.pagination.index,
					pageSize: list.pagination.size,
				},
				errorType: "response",
			},
			onOk: async ({ data, ...pagination }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
				changes.pagination = pagination;
			},
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () =>
				setList((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [list, pushQuery]);
	//#endregion

	//#region CSV
	const [csv, setCSV] = useState({
		reload: null,
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

	useEffect(() => {
		if (!csv.reload) return;
		const titulos = csv.data[0];
		const changes = {
			reload: null,
			loading: "Cargando bloque 1...",
			data: [titulos],
			error: null,
		};
		const query = {
			action: "GetData",
			config: {
				body: { ...csv.params, sort: csv.sort },
				errorType: "response",
			},
		};
		query.onOk = async ({ index, pages, size, data }) => {
			if (Array.isArray(data)) {
				changes.data.push(
					...AsArray(data).map((r) =>
						csv.formatters.map((f) => f.csvFormat(r[f.dataField], r))
					)
				);
			} else {
				console.error("Se esperaba un arreglo", data);
			}
			if (index < pages) {
				changes.loading = `Cargando bloque ${index + 1} de ${pages}...`;
				query.config = {
					body: {
						...query.config.body,
						pageIndex: index + 1,
						pageSize: size,
					},
					errorType: "response",
				};
				pushQuery({ ...query });
			} else {
				changes.loading = null;
			}
		};
		query.onError = async (error) => {
			changes.loading = null;
			changes.error = error.toString();
		};
		query.onFinally = async () => {
			setCSV((o) => ({ ...o, ...changes }));
			if (changes.loading) return;
			if (changes.error) return;
			downloadjs(ArrayToCSV(changes.data), "Afiliados.csv", "text/csv");
		};
		setCSV((o) => ({ ...o, ...changes }));
		pushQuery(query);
	}, [csv, pushQuery]);
	//#endregion

	//#region Carga inicial

	//#region Carga inicial select delegacion
	useEffect(() => {
		setDelegacionesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setDelegacionSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setDelegacionesQuery]);
	//#endregion Carga inicial select delegacion

	//#region Carga inicial select motivosBaja
	useEffect(() => {
		setMotivosBajaQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setMotivosBajaSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setMotivosBajaQuery]);
	//#endregion Carga inicial select motivosBaja

	//#region Carga inicial select estados
	useEffect(() => {
		setEstadosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setEstadoSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setEstadosQuery]);
	//#endregion Carga inicial select estados

	//#region Carga inicial select provincias
	useEffect(() => {
		setProvinciasQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setProvinciaSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setProvinciasQuery]);
	//#endregion Carga inicial select provincias

	//#endregion Carga inicial

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
	}, [list, setAfiliadosQuery]);
	//#endregion Recarga csv

	//#endregion Recarga

	const onCSV = () => setCSV((o) => ({ ...o, reload: true }));

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
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
								onChange={(selected) => {
									setDelegacionSelect((o) => ({ ...o, selected }));
									const changes = {
										loading: null,
										data: [],
										error: null,
										selected: seccionalSelectTodos,
										buscar: "",
										origen: "option",
									};
									if (selected !== delegacionSelectTodos) {
										/** @type {onLoad} */
										const onLoad = ({ query, ok, error }) => {
											let pages = 0;
											let pageIndex = query.config.body.pageIndex;
											if (ok) {
												pages = ok.pages;
												if (Array.isArray(ok.data)) {
													changes.data.push(...ok.data);
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
											}
											setSeccionalSelect((o) => ({
												...o,
												...changes,
												data: [...changes.data],
											}));
										};
										setSeccionalesQuery((o) => ({
											...o,
											query: {
												...o.query,
												config: {
													...o.query.config,
													body: {
														...o.query.params,
														refDelegacionId: selected.value,
														pageIndex: 1,
													},
												},
											},
											onLoad,
										}));
									}
									setSeccionalSelect((o) => ({ ...o, ...changes }));
									setFiltros((o) => {
										const filtros = {
											...o,
											ambitoDelegaciones: { ids: [selected?.value] },
										};
										if (selected === delegacionSelectTodos)
											delete filtros.ambitoDelegaciones;
										return filtros;
									});
								}}
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
								onChange={(selected) => {
									setSeccionalSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											ambitoSeccionales: { ids: [selected?.value] },
										};
										if (selected === seccionalSelectTodos)
											delete filtros.ambitoSeccionales;
										return filtros;
									});
								}}
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
								onChange={(selected) => {
									setMotivosBajaSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											refMotivoBajaId: selected.value,
										};
										if (selected === motivosBajaSelectTodos)
											delete filtros.refMotivoBajaId;
										return filtros;
									});
								}}
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
								onChange={(selected) => {
									setEstadoSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											estadoSolicitudId: selected.value,
										};
										if (selected === estadoSelectTodos)
											delete filtros.estadoSolicitudId;
										return filtros;
									});
								}}
								options={estadoSelect.options}
								onTextChange={(buscar) =>
									setEstadoSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid grow>
							<SearchSelectMaterial
								id="provinciaSelect"
								label="Provincia"
								error={!!provinciaSelect.error}
								helperText={provinciaSelect.loading ?? provinciaSelect?.error}
								value={provinciaSelect?.selected}
								onChange={(selected) => {
									setProvinciaSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											ambitoProvincias: { ids: [selected?.value] },
										};
										if (selected === provinciaSelectTodos)
											delete filtros.ambitoProvincias;
										return filtros;
									});
								}}
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
								onClick={() => {
									setList((o) => ({
										...o,
										reload: true,
										params: filtros,
										data: [],
										error: null,
										pagination: { ...o.pagination, index: 1, count: 0 },
									}));
									setCSV((o) => ({ ...o, params: filtros }));
								}}
							>
								Aplica filtros
							</Button>
						</Grid>
						<Grid width="200px">
							<Button
								className="botonAzul"
								disabled={Object.keys(filtros).length === 0}
								onClick={() => {
									const filtros = {};
									setDelegacionSelect((o) => ({
										...o,
										selected: delegacionSelectTodos,
									}));
									setSeccionalSelect((o) => ({
										...o,
										selected: seccionalSelectTodos,
									}));
									setEstadoSelect((o) => ({
										...o,
										selected: estadoSelectTodos,
									}));
									setProvinciaSelect((o) => ({
										...o,
										selected: provinciaSelectTodos,
									}));
									setFiltros(filtros);
									if (JSON.stringify(list.params) === JSON.stringify(filtros))
										return;
									setList((o) => ({
										...o,
										reload: true,
										params: filtros,
										data: [],
										error: null,
									}));
									setCSV((o) => ({ ...o, params: filtros }));
								}}
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
