import React, { useEffect, useState } from "react";
import moment from "moment";
import {
	Dialog,
	DialogActions,
	DialogContent,
	Typography,
} from "@mui/material";
import { Modal } from "react-bootstrap";
import modalCss from "components/ui/Modal/Modal.module.css";
import useQueryQueue from "components/hooks/useQueryQueue";
import {
	AFILIADO_BAJA,
	AFILIADO_REACTIVADO,
} from "components/helpers/Mensajes";
import Formato from "components/helpers/Formato";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import Button from "components/ui/Button/Button";

const PantallaBajaReactivacion = (props) => {
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "PatchAfiliado": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado`,
						method: "PATCH",
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
	const [dialogTexto, setDialogTexto] = useState("");
	const [fecha, setFecha] = useState(moment(new Date()).format("yyyy-MM-DD"));
	const [observaciones, setObservaciones] = useState("");
	const [refMotivoBajaId, setRefMotivoBajaId] = useState(
		(props.accion === "Baja" ? props.refMotivoBajaId : null) ?? 0
	);
	const [
		resolverSolicitudAfiliadoResponse,
		setResolverSolicitudAfiliadoResponse,
	] = useState(0);
	const [errors, setErrors] = useState({});

	//#region declaracion carga motivosBaja
	const [motivosBaja, setMotivosBaja] = useState({
		loading: props.accion === "Baja" ? "Cargando..." : null,
		params: { tipo: "A" },
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!motivosBaja.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetMotivosBaja",
			params: motivosBaja.params,
			onOk: async (ok) => {
				if (!Array.isArray(ok))
					return console.error(
						`Se esperaba un arreglo en "GetMotivosBaja"`,
						ok
					);
				changes.data.push(
					...ok
						.filter((r) => r.deletedDate == null)
						.map(({ id: value, descripcion: label }) => ({ value, label }))
				);
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setMotivosBaja((o) => ({ ...o, ...changes })),
		});
	}, [motivosBaja]);
	//#endregion

	const handleCloseDialog = () => {
		if ([AFILIADO_BAJA, AFILIADO_REACTIVADO].includes(dialogTexto)) {
			//ENVIO TODA LA DATA, PREVIAMENTE MODIFICO EL ESTADO DEL AFILIADO.
			const regUpdated =
				dialogTexto == AFILIADO_BAJA
					? { ...props.afiliado, estadoSolicitud: "No Activo" }
					: { ...props.afiliado, estadoSolicitud: "Activo" };
			//SI SE ACTUALIZO EL AFILIADO, PASO EL OBJETO ENTRO  para poder seleccionarlo en la grilla luego del refresh.
			props.onClose(regUpdated ?? false);
		} else {
			setDialogTexto("");
		}
	};

	const handleInputChange = (value, id) => {
		switch (id) {
			case "fecha":
				setFecha(moment(value).format("yyyy-MM-DD"));
				break;
			case "observaciones":
				setObservaciones(value);
				break;
			case "refMotivoBajaId":
				setRefMotivoBajaId(value);
				break;
			default:
				break;
		}
	};

	const handleConfirmar = (event) => {
		event.preventDefault();

		//Validaciones
		const errors = {};
		if (observaciones === "")
			errors.observaciones = "Se deben indicar las Observaciones";
		if (props.accion === "Baja" && !refMotivoBajaId)
			errors.refMotivoBajaId = "Se debe indicar el motivo de baja";
		setErrors(errors);
		if (Object.keys(errors).length) {
			setDialogTexto(
				Object.values(errors)
					.filter((r) => r)
					.map((r) => <div>{r}</div>)
			);
			return;
		}

		const estadoSolicitudId = props.accion === "Baja" ? 3 : 2;
		const body = [
			{ path: "EstadoSolicitudId", op: "replace", value: estadoSolicitudId },
			{ path: "FechaIngreso", op: "replace", value: null },
			{ path: "NroAfiliado", op: "replace", value: "0" },
			{
				path: "EstadoSolicitudObservaciones",
				op: "replace",
				value: observaciones,
			},
			{
				path: "FechaEgreso",
				op: "replace",
				value: moment(fecha).format("yyyy-MM-DD"),
			},
			{ path: "refMotivoBajaId", op: "replace", value: refMotivoBajaId },
		];
		pushQuery({
			action: "PatchAfiliado",
			params: { id: props.afiliado?.id },
			config: { body },
			onOk: async (ok) => {
				if (ok) {
					setDialogTexto(
						props.accion === "Baja" ? AFILIADO_BAJA : AFILIADO_REACTIVADO
					);
					setResolverSolicitudAfiliadoResponse(ok);
				}
			},
			onError: async (error) =>
				setDialogTexto(
					`Error actualizando afiliado: "${error?.message ?? "Desconocido"}"`
				),
		});
	};

	return (
		<>
			<div>
				<Dialog onClose={handleCloseDialog} open={!!dialogTexto}>
					<DialogContent dividers>
						<Typography gutterBottom>{dialogTexto}</Typography>
					</DialogContent>
					<DialogActions dividers>
						<Button className="botonAmarillo" onClick={handleCloseDialog}>
							Cerrar
						</Button>
					</DialogActions>
				</Dialog>
			</div>
			<Modal size="lg" centered show onHide={props.onClose}>
				<Modal.Header className={modalCss.modalCabecera}>
					<Grid col width="full">
						<Grid width="full" justify="center">
							<h4>
								{[
									props.accion === "Baja" ? "Baja" : "Reactiva",
									"Afiliado:",
									Formato.Cuit(props.afiliado?.cuil),
									props.afiliado?.nombre,
								]
									.filter((r) => r)
									.join(" ")}
							</h4>
						</Grid>
						<Grid width="full" justify="center">
							<h5>
								Estado Solicitud del Afiliado: {props.afiliado?.estadoSolicitud}
							</h5>
						</Grid>
						<Grid width="full" justify="center">
							<h5>
								{[
									`Fecha de Ingreso: ${Formato.Fecha(
										props.afiliado?.fechaIngreso
									)}`,
									`Nro Afiliado: ${props.afiliado.nroAfiliado}`,
								].join(" - ")}
							</h5>
						</Grid>
					</Grid>
				</Modal.Header>
				<Modal.Body>
					<Grid col full gap="5px">
						<Grid width="full" gap="inherit">
							<Grid width="25">
								<InputMaterial
									id="fecha"
									value={fecha}
									label={
										props.accion === "Baja"
											? "Fecha de Baja"
											: "Fecha de Reactivación"
									}
									type="date"
									onChange={handleInputChange}
								/>
							</Grid>
							<Grid width="full">
								<InputMaterial
									id="observaciones"
									value={observaciones}
									label="Observaciones"
									error={!!errors.observaciones}
									helperText={errors.observaciones}
									onChange={handleInputChange}
								/>
							</Grid>
						</Grid>
						{props.accion !== "Baja" ? null : (
							<Grid width="full">
								<SelectMaterial
									id="refMotivoBajaId"
									value={refMotivoBajaId}
									options={motivosBaja.data}
									label="Motivo de baja"
									error={motivosBaja.loading ?? errors.refMotivoBajaId}
									onChange={(v) => handleInputChange(v, "refMotivoBajaId")}
								/>
							</Grid>
						)}
					</Grid>
				</Modal.Body>
				<Modal.Footer>
					<Grid justify="end" gap="15px">
						<Grid>
							<Button
								className="botonAmarillo"
								onClick={handleConfirmar}
								disabled={resolverSolicitudAfiliadoResponse !== 0}
							>
								{props.accion === "Baja"
									? "Baja Afiliado"
									: "Reactiva Afiliado"}
							</Button>
						</Grid>
						<Grid>
							<Button
								className="botonAmarillo"
								onClick={() => props.onClose(false)}
							>
								Cierra
							</Button>
						</Grid>
					</Grid>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default PantallaBajaReactivacion;
