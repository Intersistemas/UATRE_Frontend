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
		reload: true,
		loading: null,
		params: { soloActivos: true },
		data: [],
		error: null,
		buscar: "",
		options: [],
		selected: delegacionSelectTodos,
	});

	useEffect(() => {
		if (!delegacionSelect.reload) return;
		const changes = {
			reload: null,
			loading: "Cargando...",
			data: [],
			error: null,
			buscar: "",
			options: [],
		};
		setDelegacionSelect((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetDelegaciones",
			params: { ...delegacionSelect.params },
			onOk: (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
			},
			onError: (error) => (changes.error = error.toString()),
			onFinally: () =>
				setDelegacionSelect((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [delegacionSelect, pushQuery]);
	// Buscador
	useEffect(() => {
		if (delegacionSelect.reload) return;
		if (delegacionSelect.loading) return;
		setDelegacionSelect((o) => ({ ...o, options: delegacionSelectOptions(o) }));
	}, [
		delegacionSelect.reload,
		delegacionSelect.loading,
		delegacionSelect.buscar,
	]);
	//#endregion filtro delegacion

	//#region filtro seccional
	const [seccionalSelect, setSeccionalSelect] = useState({
		reload: true,
		loading: null,
		params: { soloActivos: true },
		data: [],
		error: null,
		buscar: "",
		options: [],
		selected: seccionalSelectTodos,
	});

	useEffect(() => {
		if (!seccionalSelect.reload) return;
		const changes = {
			reload: null,
			loading:
				"refDelegacionId" in seccionalSelect.params ? "Cargando..." : null,
			data: [],
			error: null,
			buscar: "",
			options: [],
		};
		setSeccionalSelect((o) => ({ ...o, ...changes }));
		if (!changes.loading) return;
		const query = {
			action: "GetSeccionales",
			config: {
				body: { ...seccionalSelect.params, pageIndex: 1 },
			},
		};
		query.onOk = ({ data, pages }) => {
			if (!Array.isArray(data))
				return console.error("Se esperaba un arreglo", data);
			changes.data.push(...data);
			if (query.config.body.pageIndex < pages) {
				query.config.body.pageIndex += 1;
				changes.loading = `Cargando bloque ${query.config.body.pageIndex} de ${pages}...`;
				return;
			} else {
				changes.loading = null;
			}
		};
		query.onError = (error) => {
			changes.loading = null;
			changes.error = error.toString();
		};
		query.onFinally = () => {
			if (changes.loading) {
				pushQuery({ ...query });
				return;
			}
			setSeccionalSelect((o) => ({ ...o, ...changes }));
		};
		pushQuery(query);
	}, [seccionalSelect, pushQuery]);
	// Buscador
	useEffect(() => {
		if (seccionalSelect.reload) return;
		if (seccionalSelect.loading) return;
		setSeccionalSelect((o) => ({ ...o, options: seccionalSelectOptions(o) }));
	}, [seccionalSelect.reload, seccionalSelect.loading, seccionalSelect.buscar]);
	//#endregion filtro seccional

	//#region filtro motivosBaja
	const [motivosBajaSelect, setMotivosBajaSelect] = useState({
		reload: true,
		loading: null,
		params: { tipo: "A" },
		data: [],
		error: null,
		buscar: "",
		options: [],
		selected: motivosBajaSelectTodos,
	});

	useEffect(() => {
		if (!motivosBajaSelect.reload) return;
		const changes = {
			reload: null,
			loading: "Cargando...",
			data: [],
			error: null,
			buscar: "",
			options: [],
		};
		setMotivosBajaSelect((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetMotivosBaja",
			params: { ...motivosBajaSelect.params },
			onOk: (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
			},
			onError: (error) => (changes.error = error.toString()),
			onFinally: () =>
				setMotivosBajaSelect((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [motivosBajaSelect, pushQuery]);
	// Buscador
	useEffect(() => {
		if (motivosBajaSelect.reload) return;
		if (motivosBajaSelect.loading) return;
		setMotivosBajaSelect((o) => ({
			...o,
			options: motivosBajaSelectOptions(o),
		}));
	}, [
		motivosBajaSelect.reload,
		motivosBajaSelect.loading,
		motivosBajaSelect.buscar,
	]);
	//#endregion filtro motivos baja

	//#region filtro estado
	const [estadoSelect, setEstadoSelect] = useState({
		reload: true,
		loading: null,
		params: { soloActivos: true },
		data: [],
		error: null,
		buscar: "",
		options: [],
		selected: estadoSelectTodos,
	});

	useEffect(() => {
		if (!estadoSelect.reload) return;
		const changes = {
			reload: null,
			loading: "Cargando...",
			data: [],
			error: null,
			buscar: "",
			options: [],
		};
		setEstadoSelect((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetEstados",
			params: { ...estadoSelect.params },
			onOk: (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
			},
			onError: (error) => (changes.error = error.toString()),
			onFinally: () =>
				setEstadoSelect((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [estadoSelect, pushQuery]);
	// Buscador
	useEffect(() => {
		if (estadoSelect.reload) return;
		if (estadoSelect.loading) return;
		setEstadoSelect((o) => ({ ...o, options: estadoSelectOptions(o) }));
	}, [estadoSelect.reload, estadoSelect.loading, estadoSelect.buscar]);
	//#endregion filtro estado

	//#region filtro provincia
	const [provinciaSelect, setProvinciaSelect] = useState({
		reload: true,
		loading: null,
		params: {},
		data: [],
		error: null,
		buscar: "",
		options: [],
		selected: provinciaSelectTodos,
	});

	useEffect(() => {
		if (!provinciaSelect.reload) return;
		const changes = {
			reload: null,
			loading: "Cargando...",
			data: [],
			error: null,
			buscar: "",
			options: [],
		};
		setProvinciaSelect((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetProvincias",
			params: { ...provinciaSelect.params },
			onOk: (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
			},
			onError: (error) => (changes.error = error.toString()),
			onFinally: () =>
				setProvinciaSelect((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [provinciaSelect, pushQuery]);
	// Buscador
	useEffect(() => {
		if (provinciaSelect.reload) return;
		if (provinciaSelect.loading) return;
		setProvinciaSelect((o) => ({ ...o, options: provinciaSelectOptions(o) }));
	}, [provinciaSelect.reload, provinciaSelect.loading, provinciaSelect.buscar]);
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
		params: {},
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
				body: { ...csv.params },
				errorType: "response",
			},
		};
		query.onOk = async ({ index, pages, size, data }) => {
			if (Array.isArray(data)) {
				console.log({ "csv.formatters": csv.formatters });
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
						...csv.params,
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

	const onCSV = () => setCSV((o) => ({ ...o, reload: true }));

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="xl" centered show onHide={() => onClose()}>
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
									setSeccionalSelect((o) => {
										const seccionalSelect = { ...o, reload: true };
										if (selected === delegacionSelectTodos) {
											delete seccionalSelect.params.refDelegacionId;
										} else {
											seccionalSelect.params.refDelegacionId = selected.value;
										}
										return seccionalSelect;
									});
									setFiltros((o) => {
										const filtros = {
											...o,
											ambitoDelegaciones: { ids: [selected.value] },
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
								helperText={seccionalSelect.loading ?? seccionalSelect.error}
								value={seccionalSelect.selected}
								onChange={(selected) => {
									setSeccionalSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											ambitoSeccionales: { ids: [selected.value] },
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
								helperText={estadoSelect.loading ?? estadoSelect.error}
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
								helperText={provinciaSelect.loading ?? provinciaSelect.error}
								value={provinciaSelect.selected}
								onChange={(selected) => {
									setProvinciaSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											ambitoProvincias: { ids: [selected.value] },
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
						selection={{
							onSelect: (row) => console.log({ row }),
						}}
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
