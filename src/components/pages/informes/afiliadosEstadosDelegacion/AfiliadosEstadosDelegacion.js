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

const AfiliadosEstadosDelegacion = ({ onClose = onCloseDef }) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetData": {
				return {
					config: {
						baseURL: "Estadisticas",
						endpoint: `/Afiliados/DelegacionAfiliadosEstados`,
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
		filtro: "",
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
				(changes.error = {
					message: `Error ${error.code}: "${error.data.message ?? error.type}"`,
				}),
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [list, pushQuery]);

	useEffect(() => {
		if (list.loading) return;
		setList((o) => ({
			...o,
			filtrado: o.data.filter(
				(r) =>
					[
						r.refDelegacionCodigo,
						r.refDelegacionNombre,
						r.estadoSolicitudDescripcion,
					].findIndex(
						(f) =>
							!o.filtro ||
							`${f ?? ""}`
								.toLowerCase()
								.includes(`${o.filtro ?? ""}`.toLowerCase())
					) > -1
			),
		}));
	}, [list.loading, list.filtro]);
	//#endregion

	const onCSV = () =>
		downloadjs(
			ArrayToCSV([
				["Cód. Delegación", "Nombre Delegación", "Estado", "Cantidad"],
				...list.filtrado.map((r) => [
					r.refDelegacionCodigo,
					r.refDelegacionNombre,
					r.estadoSolicitudDescripcion,
					r.total,
				]),
			]),
			"DelegacionesSolicitudes.csv",
			"text/csv"
		);

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="xl" centered show onHide={() => onClose()}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Estados de solicitudes por delegación
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<InputMaterial
						label="Filtro"
						value={list.filtro}
						onChange={(filtro) => setList((o) => ({ ...o, filtro }))}
					/>
					<Table
						keyField="id"
						data={list.filtrado}
						mostrarBuscar={false}
						pagination={{ size: 10 }}
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

export default AfiliadosEstadosDelegacion;
