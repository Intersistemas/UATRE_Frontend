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

	//#region data
	const [list, setList] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
	});

	useEffect(() => {
		if (!list.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetData",
			params: list.params,
			config: {
				errorType: "response",
			},
			onOk: async (data) => (changes.data = data),
			onError: async (error) =>
				(changes.error = {
					message: `Error ${error.code}: "${error.data.message ?? error.type}"`,
				}),
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [list, pushQuery]);
	//#endregion

	//#region CSV
	const [csv, setCSV] = useState({
		loading: null,
		params: {},
		data: [["Estado", "Total"]],
		error: null,
	});

	useEffect(() => {
		if (!csv.loading) return;
		const titulos = csv.data[0];
		const changes = {
			loading: null,
			data: [titulos],
			error: null,
		};
		pushQuery({
			action: "GetData",
			params: csv.params,
			config: {
				errorType: "response",
			},
			onOk: async (data) => {
				changes.data = [
					titulos,
					...AsArray(data).map((r) => [r.descripcion, r.total]),
				];
			},
			onError: async (error) =>
				(changes.error = {
					message: `Error ${error.code}: "${error.data.message ?? error.type}"`,
				}),
			onFinally: async () => {
				setCSV((o) => ({ ...o, ...changes }));
				if (changes.error) return;
				downloadjs(
					ArrayToCSV(changes.data),
					"EstadosSolicitudes.csv",
					"text/csv"
				);
			},
		});
	}, [csv, pushQuery]);
	//#endregion

	const onCSV = () => setCSV((o) => ({ ...o, loading: "Procesando..." }));

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="xl" centered show onHide={() => onClose()}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Estados de solicitudes
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<InputMaterial
						label="Filtro"
						value={list.params.descripcion}
						onChange={(descripcion) => {
							const params = { ...list.params };
							if (descripcion) params.descripcion = descripcion;
							else delete params.descripcion;

							setList((o) => ({
								...o,
								loading: "Cargando...",
								params: params,
							}));
							setCSV((o) => ({ ...o, params: params }));
						}}
					/>
					<Table
						keyField="estadoSolicitudId"
						data={list.data}
						mostrarBuscar={false}
						noDataIndication={
							list.loading ||
							((error) =>
								error == null
									? null
									: typeof list.error.message === "object"
									? Object.keys(list.error.message)
											.map((k) => `${k}: ${list.error.message[k]}`)
											.join("\n")
									: list.error.message)(list.error) ||
							"No existen datos para mostrar "
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
								text: "Total",
								// sort: true,
								formatter: (v) => Formato.Numero(v),
								style: { textAlign: "right" },
							},
						]}
					/>
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid col gap="5px">
					<Grid gap="20px" justify="end">
						<Grid width="150px">
							<Button
								className="botonAmarillo"
								loading={!!csv.loading}
								onClick={() => onCSV()}
							>
								CSV
							</Button>
						</Grid>
						<Grid width="150px">
							<Button className="botonAmarillo" onClick={() => onClose()}>
								FINALIZA
							</Button>
						</Grid>
					</Grid>
					{csv.error ? (
						<text style={{ color: "red" }}>
							{csv.error == null ? null : csv.error.message}
						</text>
					) : null}
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default AfiliadosEstados;
