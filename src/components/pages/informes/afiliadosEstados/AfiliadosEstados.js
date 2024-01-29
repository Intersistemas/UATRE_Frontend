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

const onCloseDef = () => {};

const AfiliadosEstados = ({ onClose = onCloseDef }) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetData": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/View_AfiliadosEstados`,
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
	const [data, setData] = useState({
		loading: "Cargando...",
		data: [],
		error: null,
	});

	useEffect(() => {
		if (!data.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetData",
			onOk: async (data) => (changes.data = data),
			onError: async (error) => (changes.error = error),
			onFinally: async () => setData((o) => ({ ...o, ...changes })),
		});
	}, [data, pushQuery]);
	//#endregion

	//#region CSV
	const [csv, setCSV] = useState({
		loading: null,
		data: [],
		error: null,
	});

	useEffect(() => {
		if (!csv.loading) return;
		const changes = { loading: null, data: [["Estado", "Cantidad"]], error: null }
		pushQuery({
			action: "GetData",
			onOk: async (data) => {
				changes.data = AsArray(data).map((r) => ({
					"Estado": r.estadoSolicitudDescripcion,
					"Cantidad": r.total,
				}));
			},
			onError: async (error) => changes.error = error,
			onFinally: async () => {
				setCSV((o) => ({...o, ...changes}));
				if (changes.error) return;
				downloadjs(ArrayToCSV(changes.data), "EstadosSolicitudes.csv", "text/csv");
			}
		})
	}, [csv, pushQuery]);
	//#endregion

	const onCSV = () => setCSV((o) => ({ ...o, loading: "Procesando..." }));

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onCSV(), "AltKey");

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Estados de solicitudes
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Table
						keyField="estadoSolicitudId"
						mostrarBuscar={false}
						noDataIndication={
							data.loading ||
							((error) =>
								error == null
									? null
									: typeof data.error.message === "object"
									? Object.keys(data.error.message)
											.map((k) => `${k}: ${data.error.message[k]}`)
											.join("\n")
									: data.error.message)(data.error) ||
							"No existen datos para mostrar "
						}
						columns={[
							{
								dataField: "estadoSolicitudDescripcion",
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
				<Grid gap="20px">
					<Grid col width="150px">
						<Button
							className="botonAmarillo"
							loading={!!csv.loading}
							onClick={() => onCSV()}
						>
							CSV
						</Button>
						<text style={{color: "red"}}>{csv.error == null ? null : csv.error.message}</text>
					</Grid>
					<Grid col width="150px">
						<Button className="botonAmarillo" onClick={() => onClose()}>
							FINALIZA
						</Button>
						<Grid/>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default AfiliadosEstados;
