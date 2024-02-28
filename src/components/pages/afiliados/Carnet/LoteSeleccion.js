import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
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
import LotePDFViewer from "./LotePDFViewer";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import { comparator, range } from "components/helpers/Utils";

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
		dataField: "seccional",
		text: "Seccional",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
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
		style: { textAlign: "left" },
	},
	{
		dataField: "createdDate",
		text: "F. Carga",
		sort: true,
		headerTitle: () => "Fecha de Carga",
		headerStyle: { width: "7em", textAlign: "center" },
		formatter: (v) => Formato.Fecha(v),
		csvFormat: (v) => Formato.Fecha(v),
		style: { textAlign: "center" },
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
		style: { textAlign: "left" },
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
		map: (r) => ({ value: r.id, label: [r.codigo, r.descripcion].join(" - ") }),
		filter: (r) => includeSearch(r, buscar),
		start: [seccionalSelectTodos],
		...x,
	});
//#endregion seccionalSelectOptions

const LoteSeleccion = ({ onClose = onCloseDef }) => {
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

	//#region filtros seccionales

	//#region carga de seccionales
	const [seccionales, setSeccionales] = useState({
		reload: true,
		loading: null,
		params: { soloActivos: true },
		data: [],
		error: null,
	});

	useEffect(() => {
		if (!seccionales.reload) return;
		const changes = {
			reload: null,
			loading: "refDelegacionId" in seccionales.params ? "Cargando..." : null,
			data: [],
			error: null,
		};
		setSeccionales((o) => ({ ...o, ...changes }));
		if (!changes.loading) return;
		const query = {
			action: "GetSeccionales",
			config: {
				body: { ...seccionales.params, pageIndex: 1 },
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
			setSeccionales((o) => ({ ...o, ...changes }));
		};
		pushQuery(query);
	}, [seccionales, pushQuery]);
	//#endregion carga de seccionales

	//#region filtro seccional desde
	const [seccionalDesdeSelect, setSeccionalDesdeSelect] = useState({
		options: [],
		buscar: "",
		error: null,
		selected: seccionalSelectTodos,
	});
	// Buscador
	useEffect(() => {
		if (seccionales.reload) return;
		if (seccionales.loading) return;
		setSeccionalDesdeSelect((o) => ({
			...o,
			options: seccionalSelectOptions({
				data: seccionales.data,
				buscar: seccionalDesdeSelect.buscar,
			}),
		}));
	}, [
		seccionales.reload,
		seccionales.loading,
		seccionales.data,
		seccionalDesdeSelect.buscar,
	]);
	//#endregion filtro seccional desde

	//#region filtro seccional hasta
	const [seccionalHastaSelect, setSeccionalHastaSelect] = useState({
		options: [],
		buscar: "",
		error: null,
		selected: seccionalSelectTodos,
	});
	// Buscador
	useEffect(() => {
		if (seccionales.reload) return;
		if (seccionales.loading) return;
		setSeccionalHastaSelect((o) => ({
			...o,
			options: seccionalSelectOptions({
				data: seccionales.data,
				buscar: seccionalHastaSelect.buscar,
			}),
		}));
	}, [
		seccionales.reload,
		seccionales.loading,
		seccionales.data,
		seccionalHastaSelect.buscar,
	]);
	//#endregion filtro seccional hasta

	useEffect(() => {
		setSeccionalDesdeSelect((o) => ({ ...o, selected: seccionalSelectTodos }));
		setSeccionalHastaSelect((o) => ({ ...o, selected: seccionalSelectTodos }));
		setFiltros((o) => {
			const filtros = { ...o };
			delete filtros.ambitoSeccionales;
			return filtros;
		});
	}, [seccionales.data]);

	const handleSeccionalFiltro = (
		desde = seccionalSelectTodos,
		hasta = seccionalSelectTodos
	) =>
		setFiltros((o) => {
			const filtros = { ...o };
			if (desde === hasta) {
				if (desde === seccionalSelectTodos) {
					delete filtros.ambitoSeccionales;
				} else {
					filtros.ambitoSeccionales = { ids: [desde.value] };
				}
			} else if (desde === seccionalSelectTodos) {
				filtros.ambitoSeccionales = { ids: [hasta.value] };
			} else if (hasta === seccionalSelectTodos) {
				filtros.ambitoSeccionales = { ids: [desde.value] };
			} else {
				filtros.ambitoSeccionales = {
					ids: range(
						seccionales.data,
						seccionales.data.find((r) => r.id === desde.value),
						seccionales.data.find((r) => r.id === hasta.value),
						(a, b) => comparator(a.codigo ?? "", b.codigo ?? "")
					).map((r) => r.id),
				};
			}
			return filtros;
		});
	//#endregion filtros seccionales

	//#region filtro fecha de carga
	const [createdDateDesde, setCreatedDateDesde] = useState(null);
	const [createdDateHasta, setCreatedDateHasta] = useState(null);

	const handleCreatedDateFiltro = (desde = "", hasta = "") =>
		setFiltros((o) => {
			const filtros = { ...o };
			if (!desde && !hasta) {
				delete filtros.createdDateDesde;
				delete filtros.createdDateHasta;
			} else if (!desde) {
				filtros.createdDateDesde = hasta;
				filtros.createdDateHasta = hasta;
			} else if (!hasta) {
				filtros.createdDateDesde = desde;
				filtros.createdDateHasta = desde;
			} else {
				filtros.createdDateDesde = desde;
				filtros.createdDateHasta = hasta;
			}
			return filtros;
		});

	//#endregion filtro fecha de carga

	//#endregion filtros

	//#region list
	const [list, setList] = useState({
		reload: true,
		loading: null,
		pagination: { index: 1, size: 10 },
		sort: "nroAfiliadoDesc",
		params: {},
		data: [],
		selected: [],
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
					estadoSolicitudId: 2,
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

	//#region nueva seleccion
	const [newSelection, setNewSelection] = useState({
		reload: false,
		loading: null,
		params: {},
		error: null,
	});

	useEffect(() => {
		if (!newSelection.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando bloque 1...",
			error: null,
		};
		const query = {
			action: "GetData",
			config: {
				body: {
					...newSelection.params,
					estadoSolicitudId: 2,
					pageIndex: 1,
				},
				errorType: "response",
			},
		};
		query.onOk = async ({ index, pages, size, data }) => {
			if (Array.isArray(data)) {
				setList((o) => ({
					...o,
					selected: [...o.selected, ...data].filter(
						(v, i, a) => a.indexOf(a.find((r) => r.id === v.id)) === i
					),
				}));
			} else {
				console.error("Se esperaba un arreglo", data);
			}
			if (index < pages) {
				changes.loading = `Cargando bloque ${index + 1} de ${pages}...`;
				query.config = {
					body: {
						...newSelection.params,
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
		query.onFinally = async () =>
			setNewSelection((o) => ({ ...o, ...changes }));
		setNewSelection((o) => ({ ...o, ...changes }));
		pushQuery(query);
	}, [newSelection, pushQuery]);
	//#endregion nueva seleccion

	//#region print
	const [print, setPrint] = useState(null);
	//#endregion print

	const onImprime = () => {
		setPrint(
			<LotePDFViewer data={list.selected} onClose={() => setPrint(null)} />
		);
	};

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onImprime(), "AltKey");

	return (
		<>
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
									helperText={
										delegacionSelect.loading ?? delegacionSelect.error
									}
									value={delegacionSelect.selected}
									onChange={(selected) => {
										setDelegacionSelect((o) => ({ ...o, selected }));
										setSeccionales((o) => {
											const seccionales = { ...o, reload: true };
											if (selected === delegacionSelectTodos) {
												delete seccionales.params.refDelegacionId;
											} else {
												seccionales.params.refDelegacionId = selected.value;
											}
											return seccionales;
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
									id="seccionalDesdeSelect"
									label="Desde seccional"
									error={!!seccionalDesdeSelect.error}
									helperText={
										seccionales.loading ??
										seccionales.error ??
										seccionalDesdeSelect.error
									}
									value={seccionalDesdeSelect.selected}
									onChange={(selected) => {
										setSeccionalDesdeSelect((o) => ({ ...o, selected }));
										handleSeccionalFiltro(
											selected,
											seccionalHastaSelect.selected
										);
									}}
									options={seccionalDesdeSelect.options}
									onTextChange={(buscar) =>
										setSeccionalDesdeSelect((o) => ({ ...o, buscar }))
									}
								/>
							</Grid>
							<Grid grow>
								<SearchSelectMaterial
									id="seccionalHastaSelect"
									label="Hasta seccional"
									error={!!seccionalHastaSelect.error}
									helperText={
										seccionales.loading ??
										seccionales.error ??
										seccionalHastaSelect.error
									}
									value={seccionalHastaSelect.selected}
									onChange={(selected) => {
										setSeccionalHastaSelect((o) => ({ ...o, selected }));
										handleSeccionalFiltro(
											seccionalDesdeSelect.selected,
											selected
										);
									}}
									options={seccionalHastaSelect.options}
									onTextChange={(buscar) =>
										setSeccionalHastaSelect((o) => ({ ...o, buscar }))
									}
								/>
							</Grid>
						</Grid>
						<Grid width gap="inherit">
							<Grid width="200px">
								<DateTimePicker
									type="date"
									label="Desde fecha de carga"
									value={createdDateDesde}
									maxDate={createdDateHasta}
									onChange={(v) => {
										const createdDateDesde = v?.format("YYYY-MM-DD");
										setCreatedDateDesde(createdDateDesde);
										handleCreatedDateFiltro(createdDateDesde, createdDateHasta);
									}}
								/>
							</Grid>
							<Grid width="200px">
								<DateTimePicker
									type="date"
									label="Hasta fecha de carga"
									value={createdDateHasta}
									minDate={createdDateDesde}
									onChange={(v) => {
										const createdDateHasta = v?.format("YYYY-MM-DD");
										setCreatedDateHasta(createdDateHasta);
										handleCreatedDateFiltro(createdDateDesde, createdDateHasta);
									}}
								/>
							</Grid>
							<Grid grow />
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
										setSeccionalDesdeSelect((o) => ({
											...o,
											selected: seccionalSelectTodos,
										}));
										setSeccionalHastaSelect((o) => ({
											...o,
											selected: seccionalSelectTodos,
										}));
										setCreatedDateDesde(null);
										setCreatedDateHasta(null);
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
							baseProps={{
								style: { textAlign: "center", overflowX: "scroll" },
							}}
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
								mode: "checkbox",
								hideSelectColumn: false,
								selected: list.selected.map((r) => r.id),
								onSelect: (row, isSelect) => {
									if (!isSelect === !list.selected.find((r) => r.id === row.id))
										return;
									setList((o) => {
										const selected = o.selected.filter((r) => r.id !== row.id);
										if (isSelect) selected.push(row);
										return { ...o, selected };
									});
								},
								onSelectAll: (isSelect, rows) =>
									setList((o) => {
										const selected = o.selected.filter(
											(s) => !rows.find((r) => r.id === s.id)
										);
										if (isSelect) selected.push(...rows);
										return { ...o, selected };
									}),
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
					<Grid width col gap="5px">
						<Grid width gap="20px">
							<Grid width="200px">
								<Button
									className="botonAmarillo"
									onClick={() =>
										setNewSelection((o) => ({
											...o,
											params: filtros,
											reload: true,
										}))
									}
								>
									SELECCIONA TODO
								</Button>
							</Grid>
							<Grid width="200px">
								<Button
									className="botonAmarillo"
									disabled={list.selected.length === 0}
									onClick={() => setList((o) => ({ ...o, selected: [] }))}
								>
									LIMPIA SELECCION
								</Button>
							</Grid>
							<Grid col grow>
								<Grid justify="center">
									Afiliados seleccionados: {list.selected.length}
								</Grid>
								<Grid justify="center" style={{ color: "green" }}>
									{newSelection.loading}
								</Grid>
							</Grid>
							<Grid width="150px">
								<Button
									className="botonAmarillo"
									disabled={list.selected.length === 0}
									onClick={() => onImprime()}
								>
									IMPRIME
								</Button>
							</Grid>
							<Grid width="150px">
								<Button className="botonAmarillo" onClick={() => onClose()}>
									FINALIZA
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</Modal.Footer>
			</Modal>
			{print}
		</>
	);
};

export default LoteSeleccion;
