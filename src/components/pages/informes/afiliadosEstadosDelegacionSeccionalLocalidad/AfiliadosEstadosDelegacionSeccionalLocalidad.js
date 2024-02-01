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

const onCloseDef = () => {};

const AfiliadosEstadosDelegacionSeccionalLocalidad = ({ onClose = onCloseDef }) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetData": {
				return {
					config: {
						baseURL: "Estadisticas",
						endpoint: `/Afiliados/DelegacionSeccionalLocalidadAfiliadosEstados`,
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
			onError: async (error) =>
				(changes.error = `Error ${error.code}: "${
					error.data.message ?? error.type
				}"`),
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
		data: [
			[
				"Cód. Delegación",
				"Nombre Delegación",
				"Cód. Seccional",
				"Nombre Seccional",
				"C.P. Localidad",
				"Nombre Localidad",
				"Estado",
				"Cantidad",
			],
		],
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
						r.refDelegacionCodigo,
						r.refDelegacionNombre,
						r.seccionalCodigo,
						r.seccionalDescripcion,
						r.refLocalidadCodPostal,
						r.refLocalidadNombreCompleto,
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
			changes.error = `Error ${error.code}: "${error.data?.message ?? error.type}"`;
		};
		query.onFinally = async () => {
			setCSV((o) => ({ ...o, ...changes }));
			if (changes.loading) return;
			if (changes.error) return;
			downloadjs(
				ArrayToCSV(changes.data),
				"EstadosSolicitudesDelegacionesSecionalesLocalidades.csv",
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
		<Modal size="xl" centered show onHide={() => onClose()}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Estados de solicitudes por delegación, seccional y localidad
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<Grid width="25%">
							<InputMaterial
								label="Código delegación"
								value={filtros.refDelegacionCodigo}
								onChange={(refDelegacionCodigo) =>
									setFiltros((o) => {
										const r = { ...o, refDelegacionCodigo };
										if (!refDelegacionCodigo) delete r.refDelegacionCodigo;
										return r;
									})
								}
							/>
						</Grid>
						<Grid width>
							<InputMaterial
								label="Nombre delegación"
								value={filtros.refDelegacionNombre}
								onChange={(refDelegacionNombre) =>
									setFiltros((o) => {
										const r = { ...o, refDelegacionNombre };
										if (!refDelegacionNombre) delete r.refDelegacionNombre;
										return r;
									})
								}
							/>
						</Grid>
					</Grid>
					<Grid width gap="inherit">
						<Grid width="25%">
							<InputMaterial
								label="Código seccional"
								value={filtros.seccionalCodigo}
								onChange={(seccionalCodigo) =>
									setFiltros((o) => {
										const r = { ...o, seccionalCodigo };
										if (!seccionalCodigo) delete r.seccionalCodigo;
										return r;
									})
								}
							/>
						</Grid>
						<Grid width>
							<InputMaterial
								label="Nombre seccional"
								value={filtros.seccionalNombre}
								onChange={(seccionalNombre) =>
									setFiltros((o) => {
										const r = { ...o, seccionalNombre };
										if (!seccionalNombre) delete r.seccionalNombre;
										return r;
									})
								}
							/>
						</Grid>
					</Grid>
					<Grid width gap="inherit">
						<Grid width="25%">
							<InputMaterial
								label="C.P. localidad"
								value={filtros.refLocalidadCP}
								onChange={(refLocalidadCP) =>
									setFiltros((o) => {
										const r = { ...o, refLocalidadCP };
										if (!refLocalidadCP) delete r.refLocalidadCP;
										return r;
									})
								}
							/>
						</Grid>
						<Grid width>
							<InputMaterial
								label="Nombre localidad"
								value={filtros.refLocalidadNombre}
								onChange={(refLocalidadNombre) =>
									setFiltros((o) => {
										const r = { ...o, refLocalidadNombre };
										if (!refLocalidadNombre) delete r.refLocalidadNombre;
										return r;
									})
								}
							/>
						</Grid>
					</Grid>
					<Grid width gap="inherit">
						<InputMaterial
							label="Estado de solicitud"
							value={filtros.estadoSolicitudDescripcion}
							onChange={(estadoSolicitudDescripcion) =>
								setFiltros((o) => {
									const r = { ...o, estadoSolicitudDescripcion };
									if (!estadoSolicitudDescripcion) delete r.estadoSolicitudDescripcion;
									return r;
								})
							}
						/>
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
										pagination: {...o.pagination, index: 1 },
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
								dataField: "refDelegacionCodigo",
								text: "Cód. Delegación",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "refDelegacionNombre",
								text: "Nombre Delegación",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "seccionalCodigo",
								text: "Cód. Seccional",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "seccionalDescripcion",
								text: "Nombre Seccional",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "refLocalidadCodPostal",
								text: "C.P. Localidad",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "refLocalidadNombreCompleto",
								text: "Nombre Localidad",
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
									sortField =
										{
											seccionalDescripcion: "seccionalNombre",
											refLocalidadCodPostal: "reflocalidadcp",
											refLocalidadNombreCompleto: "reflocalidadnombre",
										}[sortField] ?? sortField;
									const sortBy = `${sortOrder === "desc" ? "-" : "+"}${sortField}`;
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

export default AfiliadosEstadosDelegacionSeccionalLocalidad;
