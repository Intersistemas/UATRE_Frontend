import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import downloadjs from "downloadjs";
import ArrayToCSV from "components/helpers/ArrayToCSV";
import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import InputMaterial from "components/ui/Input/InputMaterial";

const onCloseDef = () => {};

const AfiliadosEstados = ({ onClose = onCloseDef }) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetData": {
				return {
					config: {
						baseURL: "Estadisticas",
						endpoint: `/Afiliados/EstadosSolicitudes`,
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
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [list, pushQuery]);
	//#endregion

	const onCSV = () =>
		downloadjs(
			ArrayToCSV([
				["Estado", "Cantidad"],
				...list.filtrado.map((r) => [r.descripcion, r.total]),
			]),
			"EstadosSolicitudes.csv",
			"text/csv"
		);

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="xl" centered show >
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Estados de solicitudes
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<Grid grow>
							<InputMaterial
								label="Estado de solicitud"
								value={filtros.descripcion}
								onChange={(descripcion) =>
									setFiltros((o) => {
										const r = { ...o, descripcion };
										if (!descripcion)
											delete r.descripcion;
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
						keyField="estadoSolicitudId"
						data={list.filtrado}
						mostrarBuscar={false}
						pagination={{ size: 10 }}
						noDataIndication={
							list.loading || list.error || "No existen datos para mostrar "
						}
						columns={[
							{
								dataField: "descripcion",
								text: "Estado",
								sort: true,
								style: { textAlign: "left" },
							},
							{
								dataField: "total",
								text: "Cantidad",
								// sort: true,
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

export default AfiliadosEstados;
