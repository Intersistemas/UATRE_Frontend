import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import downloadjs from "downloadjs";
import ArrayToCSV from "components/helpers/ArrayToCSV";
import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import InputMaterial from "components/ui/Input/InputMaterial";

const onCloseDef = () => {};

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
			default:
				return null;
		}
	});
	//#endregion

	const [filtros, setFiltros] = useState({});

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
			onError: async (error) =>
				(changes.error = `Error ${error.code}: "${
					error.data?.message ?? error.type
				}"`),
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
		<Modal size="xl" centered show onHide={() => onClose()}>
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
								value={Formato.Mascara(filtros?.periodo, "####-##-01") ?? ""}
								onChange={(periodo) =>
									setFiltros((o) => {
										console.log({ periodo });
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
							<InputMaterial
								label="Estado de solicitud"
								value={filtros.estadoSolicitudDescripcion}
								onChange={(estadoSolicitudDescripcion) =>
									setFiltros((o) => {
										const r = { ...o, estadoSolicitudDescripcion };
										if (!estadoSolicitudDescripcion)
											delete r.estadoSolicitudDescripcion;
										return r;
									})
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
											const k = Object.keys(filtros);
											const match = k.filter((k) =>
												`${r[k] ?? ""}`
													.toLowerCase()
													.includes(`${filtros[k] ?? ""}`.toLowerCase())
											);
											return k.length === match.length;
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