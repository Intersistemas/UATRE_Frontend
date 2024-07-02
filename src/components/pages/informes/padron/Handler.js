import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Formato from "components/helpers/Formato";
import useQueryState from "components/hooks/useQueryState";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import Table from "components/ui/Table/Table";
import PDFViewer from "./PDFViewer";

/** Imports
 * @typedef {import("components/hooks/useQueryState").onLoad} onLoad
 * @typedef {import("./PDF").SeccionalAfiliados} SeccionalAfiliados
 * @typedef {import("./PDF").Afiliado} Afiliado
 **/

const columns = [
	{
		dataField: "nroAfiliado",
		text: "Nro. Afil.",
		sort: true,
		headerTitle: () => "Numero de Afiliado",
		headerStyle: { width: "6em", textAlign: "center" },
		style: { textAlign: "center" },
	},
	{
		dataField: "cuil",
		text: "CUIL",
		sort: true,
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		formatter: (v) => Formato.Cuit(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "cuilValidado",
		text: "Val.",
		headerTitle: true,
		headerStyle: { width: "3em", textAlign: "center" },
		formatter: (v, { cuil }) => (v === 0 ? "N" : v === cuil ? "V" : "D"),
		style: { textAlign: "center" },
	},
	{
		dataField: "documento",
		text: "Doc. Nro.",
		sort: true,
		headerTitle: () => "Documento número",
		headerStyle: { width: "7em", textAlign: "center" },
		formatter: (v) => Formato.DNI(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "nombre",
		text: "Nombre",
		sort: true,
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		style: { textAlign: "left" },
	},
	{
		dataField: "estadoSolicitud",
		text: "Sit. Afi.",
		headerTitle: () => "Situación del Afiliado",
		headerStyle: { width: "6em", textAlign: "center" },
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
	},
	{
		dataField: "refDelegacionDescripcion",
		text: "Delegación",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
	},
	{
		dataField: "provincia",
		text: "Provincia",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
	},
	{
		dataField: "fechaIngreso",
		text: "F. Ingreso",
		sort: true,
		headerTitle: () => "Fecha de Ingreso",
		headerStyle: { width: "7em", textAlign: "center" },
		formatter: (v) => Formato.Fecha(v),
		style: { textAlign: "center" },
	},
	// {
	// 	dataField: "fechaEgreso",
	// 	text: "F. Egreso",
	// 	sort: true,
	// 	headerTitle: () => "Fecha de Egreso",
	// 	headerStyle: { width: "7em", textAlign: "center" },
	// 	formatter: (v) => Formato.Fecha(v),
	// 	style: { textAlign: "center" },
	// },
	{
		dataField: "puesto",
		text: "Puesto",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
	},
	{
		dataField: "empresaCUIT",
		text: "CUIT",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		formatter: (v) => Formato.Cuit(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "empresaDescripcion",
		text: "Empresa",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
	},
	{
		dataField: "actividad",
		text: "Actividad",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
	},
	{
		dataField: "ultimaDDJJPeriodo",
		text: "Período última DDJJ",
		headerTitle: true,
		headerStyle: { width: "12em", textAlign: "center" },
		formatter: (v) => Formato.Periodo(v),
	},
];

//#region delegacionesSelect Options
const delegacionSelectDef = { label: "Elige..." };
const delegacionesSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.codigoDelegacion, r.nombre].join(" - "),
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		start: [delegacionSelectDef],
		...x,
	});
//#endregion delegacionesSelect Options

//#region seccionalesSelect Options
const seccionalSelectDef = { label: "Todas" };
const seccionalesSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.codigo, r.descripcion].join(" - "),
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		start: [seccionalSelectDef],
		...x,
	});
//#endregion seccionalesSelect Options

const Handler = ({ onClose = () => {} }) => {
	//#region APIs
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
				config: { errorType: "response" },
				params: { soloActivos: true },
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
			query: { config: { errorType: "response" }, body: { soloActivos: true } },
		}
	);
	const { setState: setAfiliacionesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Afiliado/GetAfiliadosWithSpec`,
				method: "POST",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	//#endregion APIs

	//#region selects
	const [filtros, setFiltros] = useState({});

	//#region select delegacion
	const [delegacionSelect, setDelegacionSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: delegacionSelectDef,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setDelegacionSelect((o) => ({
			...o,
			options: delegacionesSelectOptions(o),
		}));
	}, [delegacionSelect.buscar, delegacionSelect.data]);
	//#endregion select delegacion

	//#region select seccional
	const [seccionalSelect, setSeccionalSelect] = useState({
		loading: "",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: seccionalSelectDef,
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

	//#endregion selects

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

	//#region list
	const [list, setList] = useState({
		reload: false,
		loading: null,
		pagination: { index: 1, size: 10 },
		filtros: {},
		sort: "seccionalId,nombre",
		data: [],
		error: null,
	});
	//#endregion list

	//#region Carga list
	useEffect(() => {
		if (!list.reload) return;
		setAfiliacionesQuery((o) => ({
			...o,
			query: {
				...o.query,
				config: {
					body: {
						...list.filtros,
						estadoSolicitudId: 2,
						sort: list.sort,
						pageIndex: list.pagination.index,
						pageSize: list.pagination.size,
					},
				},
			},
			onPreLoad: () =>
				setList((o) => ({
					...o,
					reload: false,
					loading: "Cargando...",
					data: [],
				})),
			onLoad: ({ ok, error }) => {
				let data = [];
				let pagination = { ...list.pagination, count: data.length };
				if (Array.isArray(ok?.data)) {
					({ data, ...pagination } = ok);
				} else {
					console.error("Se esperaba un arreglo", ok?.data);
				}
				setList((o) => ({
					...o,
					loading: null,
					pagination,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setAfiliacionesQuery, list]);
	//#endregion Carga list

	//#region padron
	const [padron, setPadron] = useState({
		reload: null,
		loading: null,
		filtros: {},
		/** @type {SeccionalAfiliados[]} */
		data: [],
		error: null,
		seccionales: [],
		despliega: false,
	});
	//#endregion padron

	//#region Carga padron
	useEffect(() => {
		if (!padron.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			/** @type {SeccionalAfiliados[]} */
			data: [],
			error: null,
			despliega: false,
		};
		/** @type {onLoad} */
		const onLoad = ({ query, ok, error }) => {
			let pages = 0;
			let pageIndex = query.config.body.pageIndex;
			if (ok) {
				pages = ok.pages;
				const data = ok.data;
				if (Array.isArray(data)) {
					data.forEach((afiliado) => {
						const seccional = padron.seccionales.find(
							(s) => s.id === afiliado.seccionalId
						);
						if (seccional) {
							let seccionalAfiliados = changes.data.find(
								(a) => a.seccional === seccional
							);
							if (seccionalAfiliados == null) {
								seccionalAfiliados = { seccional, afiliados: [] };
								changes.data.push(seccionalAfiliados);
							}
							seccionalAfiliados.afiliados.push(afiliado);
						}
					});
				} else {
					console.error("Se esperaba un arreglo", data);
				}
			}
			if (error) changes.error = error.toString();
			if (pageIndex < pages) {
				pageIndex += 1;
				changes.loading = `Cargando bloque ${pageIndex} de ${pages}...`;
				setAfiliacionesQuery((o) => ({
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
				changes.despliega = true;
			}
			setPadron((o) => ({ ...o, ...changes }));
		};
		setAfiliacionesQuery((o) => ({
			...o,
			query: {
				...o.query,
				config: {
					...o.query.config,
					body: {
						...padron.filtros,
						estadoSolicitudId: 2,
						sort: "seccionalId,nombre",
						pageIndex: 1,
					},
				},
			},
			onPreLoad: () => setPadron((o) => ({ ...o, ...changes })),
			onLoad,
		}));
	}, [setAfiliacionesQuery, padron]);
	//#endregion Carga padron

	const onCargaPadron = () => {
		if (!filtros.ambitoDelegaciones) {
			setDelegacionSelect((o) => ({ ...o, error: "Dato requerido." }));
			return;
		} else {
			setDelegacionSelect((o) => ({ ...o, error: null }));
		}
		setPadron((o) => ({ ...o, reload: true }));
	};

	const padronRender = !padron.despliega ? null : (
		<PDFViewer
			data={padron.data}
			onClose={() => setPadron((o) => ({ ...o, despliega: false }))}
		/>
	);

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				Afiliados por seccional
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid grid="auto / 1fr 1fr 200px 200px" gap="inherit">
						<SearchSelectMaterial
							id="delegacionSelect"
							label="Delegacion"
							error={!!delegacionSelect.error}
							helperText={delegacionSelect.loading ?? delegacionSelect?.error}
							value={delegacionSelect.selected}
							onChange={(selected) => {
								setDelegacionSelect((o) => ({ ...o, selected }));
								const changes = {
									loading: "Cargando...",
									data: [],
									error: null,
									selected: seccionalSelectDef,
									buscar: "",
								};
								if (selected !== delegacionSelectDef) {
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
										ambitoDelegaciones: { ids: [selected.value] },
									};
									if (selected === delegacionSelectDef)
										delete filtros.ambitoDelegaciones;
									delete filtros.ambitoSeccionales;
									return filtros;
								});
							}}
							options={delegacionSelect.options}
							onTextChange={(buscar) =>
								setDelegacionSelect((o) => ({ ...o, buscar }))
							}
						/>
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
										ambitoSeccionales: { ids: [selected.value] },
									};
									if (selected === seccionalSelectDef)
										delete filtros.ambitoSeccionales;
									return filtros;
								});
							}}
							options={seccionalSelect.options}
							onTextChange={(buscar) =>
								setSeccionalSelect((o) => ({ ...o, buscar }))
							}
						/>
						<Button
							className="botonAzul"
							disabled={
								JSON.stringify(list.filtros) === JSON.stringify(filtros)
							}
							onClick={() => {
								if (!filtros.ambitoDelegaciones) {
									setDelegacionSelect((o) => ({
										...o,
										error: "Dato requerido.",
									}));
								} else {
									setDelegacionSelect((o) => ({ ...o, error: null }));
								}
								setList((o) => ({
									...o,
									filtros,
									reload: true,
									error: null,
									pagination: { ...o.pagination, index: 1 },
								}));
								setPadron((o) => ({
									...o,
									filtros,
									seccionales: seccionalSelect.data
										.map((s) => ({
											id: s.id,
											codigo: s.codigo,
											nombre: s.descripcion,
											provincia: s.provinciaDescripcion,
										}))
										.filter((s) => s?.id),
								}));
							}}
						>
							Aplica filtros
						</Button>
						<Button
							className="botonAzul"
							disabled={Object.keys(filtros).length === 0}
							onClick={() => {
								const filtros = {};
								setDelegacionSelect((o) => ({
									...o,
									selected: delegacionSelectDef,
								}));
								setSeccionalSelect((o) => ({
									...o,
									selected: seccionalSelectDef,
								}));
								setFiltros(filtros);
								if (JSON.stringify(list.filtros) === JSON.stringify(filtros))
									return;
								setList((o) => ({
									...o,
									filtros,
									error: null,
									reload: true,
								}));
								setPadron((o) => ({ ...o, filtros, seccionales: [] }));
							}}
						>
							Limpia filtros
						</Button>
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
									return;
								}
								default:
									return;
							}
						}}
					/>
					{padronRender}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid grid="auto / 1fr 150px 150px" width col gap="15px">
					<Grid width col>
						{padron.loading == null ? null : (
							<text style={{ color: "green" }}>{padron.loading}</text>
						)}
						{padron.error == null ? null : (
							<text style={{ color: "red" }}>{padron.error}</text>
						)}
					</Grid>
					<Button
						className="botonAmarillo"
						loading={!!padron.loading}
						onClick={() => onCargaPadron()}
					>
						IMPRIME
					</Button>
					<Button className="botonAmarillo" onClick={() => onClose()}>
						FINALIZA
					</Button>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default Handler;
