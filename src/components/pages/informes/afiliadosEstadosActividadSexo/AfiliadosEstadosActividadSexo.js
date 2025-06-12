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
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";

const onCloseDef = () => {};

//#region actividadSelectOptions
// const actividadSelectTodos = { value: 0, label: "Todas" };
// const actividadSelectOptions = ({ data = [], buscar = "", ...x }) =>
// 	mapOptions({
// 		data,
// 		map: (r) => ({ value: r.id, label: r.descripcion }),
// 		filter: (r) => includeSearch(r, buscar),
// 		start: [actividadSelectTodos],
// 		...x,
// 	});
//#endregion actividadSelectOptions

//#region sexoSelectOptions
// const sexoSelectTodos = { value: 0, label: "Todas" };
// const sexoSelectOptions = ({ data = [], buscar = "", ...x }) =>
// 	mapOptions({
// 		data,
// 		map: (r) => ({ value: r.id, label: r.descripcion }),
// 		filter: (r) => includeSearch(r, buscar),
// 		start: [sexoSelectTodos],
// 		...x,
// 	});
//#endregion sexoSelectOptions

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

const AfiliadosEstadosActividadSexo = ({ onClose = onCloseDef }) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetData": {
				return {
					config: {
						baseURL: "Estadisticas",
						endpoint: `/Afiliados/ActividadSexoAfiliadosEstados`,
						method: "GET",
					},
				};
			}
			// case "GetActividades": {
			// 	return {
			// 		config: {
			// 			baseURL: "Afiliaciones",
			// 			endpoint: `/Actividad`,
			// 			method: "GET",
			// 		},
			// 	};
			// }
			// case "GetSexo": {
			// 	return {
			// 		config: {
			// 			baseURL: "Afiliaciones",
			// 			endpoint: `/Sexo`,
			// 			method: "GET",
			// 		},
			// 	};
			// }
			case "GetEstados": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/EstadoSolicitud`,
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

	//#region filtro actividad
	// const [actividadSelect, setActividadSelect] = useState({
	// 	reload: true,
	// 	loading: null,
	// 	params: { soloActivos: true },
	// 	data: [],
	// 	error: null,
	// 	buscar: "",
	// 	options: [],
	// 	selected: actividadSelectTodos,
	// });

	// useEffect(() => {
	// 	if (!actividadSelect.reload) return;
	// 	const changes = {
	// 		reload: null,
	// 		loading: "Cargando...",
	// 		data: [],
	// 		error: null,
	// 		buscar: "",
	// 		options: [],
	// 	};
	// 	setActividadSelect((o) => ({ ...o, ...changes }));
	// 	pushQuery({
	// 		action: "GetActividades",
	// 		params: { ...actividadSelect.params },
	// 		onOk: (data) => {
	// 			if (!Array.isArray(data))
	// 				return console.error("Se esperaba un arreglo", data);
	// 			changes.data = data;
	// 		},
	// 		onError: (error) => (changes.error = error.toString()),
	// 		onFinally: () =>
	// 			setActividadSelect((o) => ({ ...o, ...changes, loading: null })),
	// 	});
	// }, [actividadSelect, pushQuery]);
	// // Buscador
	// useEffect(() => {
	// 	if (actividadSelect.reload) return;
	// 	if (actividadSelect.loading) return;
	// 	setActividadSelect((o) => ({ ...o, options: actividadSelectOptions(o) }));
	// }, [actividadSelect.reload, actividadSelect.loading, actividadSelect.buscar]);
	//#endregion filtro actividad

	//#region filtro sexo
	// const [sexoSelect, setSexoSelect] = useState({
	// 	reload: true,
	// 	loading: null,
	// 	params: { soloActivos: true },
	// 	data: [],
	// 	error: null,
	// 	buscar: "",
	// 	options: [],
	// 	selected: sexoSelectTodos,
	// });

	// useEffect(() => {
	// 	if (!sexoSelect.reload) return;
	// 	const changes = {
	// 		reload: null,
	// 		loading: "Cargando...",
	// 		data: [],
	// 		error: null,
	// 		buscar: "",
	// 		options: [],
	// 	};
	// 	setSexoSelect((o) => ({ ...o, ...changes }));
	// 	pushQuery({
	// 		action: "GetSexo",
	// 		params: { ...sexoSelect.params },
	// 		onOk: (data) => {
	// 			if (!Array.isArray(data))
	// 				return console.error("Se esperaba un arreglo", data);
	// 			changes.data = data;
	// 		},
	// 		onError: (error) => (changes.error = error.toString()),
	// 		onFinally: () =>
	// 		setSexoSelect((o) => ({ ...o, ...changes, loading: null })),
	// 	});
	// }, [sexoSelect, pushQuery]);
	// // Buscador
	// useEffect(() => {
	// 	if (sexoSelect.reload) return;
	// 	if (sexoSelect.loading) return;
	// 	setSexoSelect((o) => ({ ...o, options: sexoSelectOptions(o) }));
	// }, [sexoSelect.reload, sexoSelect.loading, sexoSelect.buscar]);
	//#endregion filtro sexo

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
				changes.data = data.filter((estadoSolicitud) => estadoSolicitud?.tipo === "Afiliados");
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

	//#endregion filtros

	//#region list
	const [list, setList] = useState({
		loading: "Cargando...",
		pagination: { index: 1, size: 10 },
		filtros: {},
		params: {},
		data: [],
		error: null,
	});

	useEffect(() => {
		if (!list.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetData",
			params: {
				...list.params,
				...list.filtros,
				pageIndex: list.pagination.index,
				pageSize: list.pagination.size,
			},
			config: {
				errorType: "response",
			},
			onOk: async ({ data, ...pagination }) => {
				if (Array.isArray(data)) {
					changes.data = data;
					changes.pagination = pagination;
				} else {
					console.error("Se esperaba un arreglo", data);
				}
			},
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [list, pushQuery]);
	//#endregion

	//#region CSV
	const [csv, setCSV] = useState({
		reload: null,
		loading: null,
		filtros: {},
		params: {},
		data: [["Actividad", "Sexo", "Estado", "Cantidad"]],
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
			params: {
				...csv.params,
				...csv.filtros,
			},
			config: {
				errorType: "response",
			},
		};
		query.onOk = async ({ index, pages, size, data }) => {
			if (Array.isArray(data)) {
				changes.data.push(
					...AsArray(data).map((r) => [
						r.actividadDescripcion,
						r.sexoDescripcion,
						r.estadoSolicitudDescripcion,
						r.total,
					])
				);
			} else {
				console.error("Se esperaba un arreglo", data);
			}
			if (index < pages) {
				changes.loading = `Cargando bloque ${index + 1} de ${pages}...`;
				query.params = {
					...csv.params,
					...csv.filtros,
					pageIndex: index + 1,
					pageSize: size,
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
			downloadjs(
				ArrayToCSV(changes.data),
				"EstadosSolicitudesPuestosSexos.csv",
				"text/csv"
			);
		};
		setCSV((o) => ({ ...o, ...changes }));
		pushQuery(query);
	}, [csv, pushQuery]);
	//#endregion

	const onCSV = () => setCSV((o) => ({ ...o, reload: true }));

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Estados de solicitudes por actividad y sexo
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<Grid grow>
							{/* <SearchSelectMaterial
								id="actividadSelect"
								label="Actividad"
								error={!!actividadSelect.error}
								helperText={actividadSelect.loading ?? actividadSelect?.error}
								value={actividadSelect.selected}
								onChange={(selected) => {
									setActividadSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											actividadId: selected.value,
										};
										if (selected === actividadSelectTodos)
											delete filtros.actividadId;
										return filtros;
									});
								}}
								options={actividadSelect.options}
								onTextChange={(buscar) =>
									setActividadSelect((o) => ({ ...o, buscar }))
								}
							/> */}
							<InputMaterial
								label="Actividad"
								value={filtros.actividadDescripcion}
								onChange={(actividadDescripcion) =>
									setFiltros((o) => {
										const r = { ...o, actividadDescripcion };
										if (!actividadDescripcion) delete r.actividadDescripcion;
										return r;
									})
								}
							/>
						</Grid>
						<Grid grow>
							{/* <SearchSelectMaterial
								id="sexoSelect"
								label="Sexo"
								error={!!sexoSelect.error}
								helperText={sexoSelect.loading ?? sexoSelect?.error}
								value={sexoSelect.selected}
								onChange={(selected) => {
									setSexoSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											sexoId: selected.value,
										};
										if (selected === sexoSelectTodos)
											delete filtros.sexoId;
										return filtros;
									});
								}}
								options={sexoSelect.options}
								onTextChange={(buscar) =>
									setSexoSelect((o) => ({ ...o, buscar }))
								}
							/> */}
							<InputMaterial
								label="Sexo"
								value={filtros.sexoDescripcion}
								onChange={(sexoDescripcion) =>
									setFiltros((o) => {
										const r = { ...o, sexoDescripcion };
										if (!sexoDescripcion) delete r.sexoDescripcion;
										return r;
									})
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
						<Grid width="200px">
							<Button
								className="botonAzul"
								disabled={
									JSON.stringify(list.filtros) === JSON.stringify(filtros)
								}
								onClick={() => {
									setList((o) => ({
										...o,
										filtros,
										data: [],
										error: null,
										loading: "Cargando...",
										pagination: { ...o.pagination, index: 1 },
									}));
									setCSV((o) => ({ ...o, filtros }));
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
									// setActividadSelect((o) => ({
									// 	...o,
									// 	selected: actividadSelectTodos,
									// }));
									// setSexoSelect((o) => ({
									// 	...o,
									// 	selected: sexoSelectTodos,
									// }));
									setEstadoSelect((o) => ({
										...o,
										selected: estadoSelectTodos,
									}));
									setFiltros(filtros);
									if (JSON.stringify(list.filtros) === JSON.stringify(filtros))
										return;
									setList((o) => ({
										...o,
										filtros,
										data: [],
										error: null,
										loading: "Cargando...",
									}));
									setCSV((o) => ({ ...o, filtros }));
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
						pagination={{
							...list.pagination,
							onChange: (pagination) =>
								setList((o) => ({
									...o,
									loading: "Cargando...",
									pagination: { ...o.pagination, ...pagination },
									data: [],
									error: null,
								})),
						}}
						noDataIndication={
							list.loading || list.error || "No existen datos para mostrar "
						}
						columns={[
							{
								dataField: "actividadDescripcion",
								text: "Actividad",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "sexoDescripcion",
								text: "Sexo",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "estadoSolicitudDescripcion",
								text: "Estado",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "total",
								text: "Cantidad",
								formatter: (v) => Formato.Numero(v),
								style: { textAlign: "right" },
							},
						]}
						onTableChange={(type, { sortOrder, sortField }) => {
							switch (type) {
								case "sort": {
									const sortBy = `${
										sortOrder === "desc" ? "-" : "+"
									}${sortField}`;
									setList((o) => ({
										...o,
										loading: "Cargando...",
										params: { ...o.params, sortBy },
										data: [],
										error: null,
									}));
									setCSV((o) => ({ ...o, params: { ...o.params, sortBy } }));
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
								tarea="Informes_Afiliados_AfiliadosActividadSexo_CSV"
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

export default AfiliadosEstadosActividadSexo;
