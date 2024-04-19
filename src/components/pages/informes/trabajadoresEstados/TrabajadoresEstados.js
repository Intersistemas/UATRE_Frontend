import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import downloadjs from "downloadjs";
import ArrayToCSV from "components/helpers/ArrayToCSV";
import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, { includeSearch, mapOptions } from "components/ui/Select/SearchSelectMaterial";
import Table from "components/ui/Table/Table";

const onCloseDef = () => {};

//#region estadoSelect Options
const estadoSelectTodos = { value: 0, label: "Todas" };
const estadoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		start: [estadoSelectTodos],
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion estadoSelect Options

const TrabajadoresEstados = ({ onClose = onCloseDef }) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetData": {
				return {
					config: {
						baseURL: "Estadisticas",
						endpoint: `/Afiliados/DDJJ12MesesAfiliadosEstados`,
						method: "GET",
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
			default:
				return null;
		}
	});
	//#endregion

	const [filtros, setFiltros] = useState({});

	//#region select estado
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

	// Buscador
	useEffect(() => {
		setEstadoSelect((o) => ({
			...o,
			options: estadoSelectOptions(o),
		}));
	}, [estadoSelect.buscar, estadoSelect.data]);
	
	// Recarga
	useEffect(() => {
		if (!estadoSelect.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: [],
			error: null,
		}
		setEstadoSelect((o) => {
			pushQuery({
				action: "GetEstados",
				params: { ...o.params },
				onOk: (data) => {
					if (!Array.isArray(data))
						return console.error("Se esperaba un arreglo", data);
					changes.data = data;
				},
				onError: (error) => (changes.error = error.toString()),
				onFinally: () =>
					setEstadoSelect((o) => ({ ...o, ...changes, loading: null })),
			});
			return { ...o, ...changes };
		});
	}, [estadoSelect.reload, pushQuery]);
	//#endregion select estado

	//#region list
	const [list, setList] = useState({
		loading: "Cargando...",
		filtros: {},
		data: [],
		filtrado: [],
		error: null,
	});

	useEffect(() => {
		if (!list.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetData",
			config: {
				errorType: "response",
			},
			onOk: async (data) => {
				changes.data = data;
				changes.filtrado = changes.data;
			},
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [list, pushQuery]);
	//#endregion

	const onCSV = () =>
		downloadjs(
			ArrayToCSV([
				["Periodo", "Estado", "Cantidad"],
				...list.filtrado.map((r) => [
					r.periodo,
					r.estadoSolicitudDescripcion,
					r.cuiles,
				]),
			]),
			"TrabajadoresSolicitudes.csv",
			"text/csv"
		);

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="xl" centered show >
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Trabajadores declarados
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<Grid width="200px">
							<DateTimePicker
								label="Período"
								type="month"
								minDate={dayjs().subtract(12, "month").format("YYYY-MM-DD")}
								maxDate={dayjs().subtract(1, "month").format("YYYY-MM-DD")}
								value={Formato.Mascara(filtros?.periodo, "####-##-01") ?? ""}
								onChange={(periodo) =>
									setFiltros((o) => {
										console.log({
											periodo,
											minDate: dayjs().subtract(12, "month").format("YYYY-MM-DD"),
											maxDate: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
										});
										const r = {
											...o,
											periodo: Formato.Entero(periodo?.format("YYYYMM")),
										};
										if (!periodo) delete r.periodo;
										return r;
									})
								}
							/>
						</Grid>
						<Grid grow>
							<SearchSelectMaterial
								label="Estado de solicitud"
								error={!!estadoSelect.error}
								helperText={estadoSelect.loading ?? estadoSelect.error}
								value={estadoSelect.selected}
								onChange={(selected) => {
									setEstadoSelect((o) => ({ ...o, selected }));
									setFiltros((o) => {
										const filtros = {
											...o,
											estadoSolicitudId: selected,
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
										filtrado: o.data.filter((r) => {
											const filters = Object.entries(filtros);
											const match = filters.filter(([k, v]) =>
												typeof v === "object"
													? r[k] === v.value
													: `${r[k] ?? ""}`
															.toLowerCase()
															.includes(`${v ?? ""}`.toLowerCase())
											);
											return filters.length === match.length;
										}),
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
									setEstadoSelect((o) => ({
										...o,
										selected: estadoSelectTodos,
										buscar: "",
									}));
									setFiltros(filtros);
									if (JSON.stringify(list.filtros) === JSON.stringify(filtros))
										return;
									setList((o) => ({ ...o, filtros, filtrado: [...o.data] }));
								}}
							>
								Limpia filtros
							</Button>
						</Grid>
					</Grid>
					<Table
						keyField="id"
						data={list.filtrado}
						mostrarBuscar={false}
						pagination={{ size: 10 }}
						noDataIndication={
							list.loading || list.error || "No existen datos para mostrar "
						}
						columns={[
							{
								dataField: "periodo",
								text: "Período",
								sort: true,
								formatter: (v) => Formato.Periodo(v),
								style: { textAlign: "right" },
							},
							{
								dataField: "estadoSolicitudDescripcion",
								text: "Estado",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "cuiles",
								text: "Cantidad",
								formatter: (v) => Formato.Numero(v),
								style: { textAlign: "right" },
							},
						]}
					/>
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid gap="20px" justify="end">
					<Grid width="250px">
						<Button className="botonAmarillo" onClick={() => onCSV()}>
							GENERA ARCHIVO CSV
						</Button>
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={() => onClose()}>
							FINALIZA
						</Button>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default TrabajadoresEstados;
