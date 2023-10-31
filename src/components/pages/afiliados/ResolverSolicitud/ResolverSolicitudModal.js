import React, { useEffect, useState } from "react";
import moment from "moment";
import useQueryQueue from "components/hooks/useQueryQueue";
import Formato from "components/helpers/Formato";
import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import DeclaracionesJuradas from "../declaracionesJuradas/DeclaracionesJuradas";
import AfiliadosUltimaDDJJ from "../declaracionesJuradas/AfiliadosUltimaDDJJ";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import Button from "components/ui/Button/Button";

const ResolverSolicitudModal = ({
	afiliado = {},
	onClose = (cambios = null) => {},
}) => {
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/GetEmpresaSpecs`,
						method: "GET",
					},
				};
			}
			case "GetEstadosSolicitud": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/EstadoSolicitud`,
						method: "GET",
					},
				};
			}
			case "UpdateAfiliado": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado`,
						method: "PATCH",
					},
				};
			}
			default:
				return null;
		}
	});

	console.log({afiliado})

	//#region declaracion y carga datos empleador
	const [empleador, setEmpleador] = useState({
		loading: "Cargando datos del empleador...",
		data: {},
		error: {},
		params: { cuit: afiliado.empresaCUIT },
	});
	useEffect(() => {
		if (!empleador.loading) return;
		pushQuery({
			action: "GetEmpresa",
			params: empleador.params,
			onOk: async (res) =>
				setEmpleador((old) => ({
					...old,
					loading: null,
					data: res,
					error: null,
				})),
			onError: async (err) =>
				setEmpleador((old) => ({
					...old,
					loading: null,
					data: null,
					error: err,
				})),
		});
	}, [pushQuery, empleador]);

	let empleadorRender;
	if (empleador.loading) empleadorRender = empleador.loading;
	else if (empleador.error) empleadorRender = empleador.error.message;
	else
		empleadorRender = (
			<Grid gap="10px">
				<InputMaterial
					id="CIIU1"
					value={[empleador.data.ciiU1, empleador.data.ciiU1Descripcion]
						.filter((r) => r)
						.join(" - ")}
					label="Actividad Principal"
					disabled={true}
					showToolTip={true}
				/>
				<InputMaterial
					id="CIIU2"
					value={[empleador.data.ciiU2, empleador.data.ciiU2Descripcion]
						.filter((r) => r)
						.join(" - ")}
					label="Actividad Secundaria"
					disabled={true}
					showToolTip={true}
				/>
				<InputMaterial
					id="CIIU3"
					value={[empleador.data.ciiU3, empleador.data.ciiU3Descripcion]
						.filter((r) => r)
						.join(" - ")}
					label="Actividad Terciaria"
					disabled={true}
					showToolTip={true}
				/>
			</Grid>
		);
	//#endregion

	//#region declaracion y carga de estadosSolicitud
	const [estadosSolicitud, setEstadosSolicitud] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: {},
	});
	useEffect(() => {
		if (!estadosSolicitud.loading) return;
		pushQuery({
			action: "GetEstadosSolicitud",
			params: estadosSolicitud.params,
			onOk: async (res) =>
				setEstadosSolicitud((old) => ({
					...old,
					loading: null,
					data: res
						.map((r) => ({ value: r.id, label: r.descripcion }))
						.filter((r) =>
							["Pendiente", "Activo", "Rechazado"].includes(r.label)
						)
						.sort((a, b) => a.value - b.value),
				})),
			onError: async (err) =>
				setEstadosSolicitud((old) => ({
					...old,
					loading: null,
					data: null,
					error: err,
				})),
		});
	}, [pushQuery, estadosSolicitud]);
	//#endregion

	const [datos, setDatos] = useState({
		estadoSolicitudId: afiliado.estadoSolicitudId ?? 0,
		fechaIngreso: afiliado.fechaIngreso ?? "",
		estadoSolicitudObservaciones: afiliado.estadoSolicitudObservaciones ?? "",
	});
	const [errores, setErrores] = useState({
		estadoSolicitudId: null,
		fechaIngreso: null,
		estadoSolicitudObservaciones: null,
	});

	return (
		<Modal onClose={() => onClose()}>
			<Grid col className={modalCss.modalCabecera}>
				<Grid justify="center">
					<h3>{`Resuelve solicitud de ${Formato.Cuit(afiliado.cuil)} ${
						afiliado.nombre
					}`}</h3>
				</Grid>
				<Grid justify="center">
					<h4>
						{(() => {
							switch (afiliado.cuilValidado ?? 0) {
								case 0:
									return "CUIL no validado";
								case afiliado.cuil:
									return "CUIL validado";
								default:
									return `Diferencia en CUIL validado ${Formato.Cuit(
										afiliado.cuilValidado
									)}`;
							}
						})()}
					</h4>
				</Grid>
			</Grid>
			<Grid col gap="10px">
				<Grid col width="full">
					<h4>DDJJ UATRE</h4>
					<DeclaracionesJuradas
						cuil={afiliado.cuil}
						infoCompleta={true}
						mostrarBuscar={false}
						registros={1}
					/>
				</Grid>
				<Grid col width="full">
					<h4>Actividades del Empleador</h4>
					{empleadorRender}
				</Grid>
				<Grid col width="full">
					<h4>Afiliados en ultima DDJJ del Empleador</h4>
					<AfiliadosUltimaDDJJ
						cuit={afiliado.empresaCUIT}
						mostrarBuscar={false}
					/>
				</Grid>
				<Grid gap="10px">
					<SelectMaterial
						name="estadoSolicitud"
						label="Estado Solicitud"
						width={25}
						value={datos.estadoSolicitudId}
						options={estadosSolicitud.data ?? []}
						error={
							estadosSolicitud.loading ||
							estadosSolicitud.error?.message ||
							errores.estadoSolicitudId
						}
						onChange={(value) =>
							setDatos((old) => ({
								...old,
								estadoSolicitudId: value,
								fechaIngreso:
									value === 2 ? moment(new Date()).format("yyyy-MM-DD") : "",
							}))
						}
					/>
					<InputMaterial
						id="ingresoFecha"
						value={datos.fechaIngreso}
						label="Fecha Ingreso"
						type="date"
						error={!!errores.fechaIngreso}
						helperText={errores.fechaIngreso}
						width={25}
						onChange={(value) =>
							setDatos((old) => ({
								...old,
								fechaIngreso: moment(value).format("yyyy-MM-DD"),
							}))
						}
						disabled={true}
					/>
					<InputMaterial
						id="observaciones"
						value={datos.estadoSolicitudObservaciones}
						label="Observaciones"
						error={!!errores.estadoSolicitudObservaciones}
						helperText={errores.estadoSolicitudObservaciones}
						width={100}
						onChange={(value) =>
							setDatos((old) => ({
								...old,
								estadoSolicitudObservaciones: value,
							}))
						}
					/>
				</Grid>
				<Grid width="full" justify="evenly">
					<Grid width="300px">
						<Button
							className="botonAzul"
							onClick={() => {
								const newErrores = {};

								// validaciones
								if (datos.estadoSolicitudId === afiliado.estadoSolicitudId) {
									newErrores.estadoSolicitudId = "Requiere modificar";
								} else if (
									[4, 5].includes(datos.estadoSolicitudId) &&
									!datos.estadoSolicitudObservaciones
								) {
									newErrores.estadoSolicitudObservaciones =
										"Requerido para el estado seleccionado";
								}

								setErrores(newErrores);
								if (Object.keys(newErrores).length) return;

								pushQuery({
									action: "UpdateAfiliado",
									params: { id: afiliado.id },
									config: {
										headers: {
											"Content-Type": "application/json-patch+json",
										},
										body: [
											{
												op: "replace",
												path: "EstadoSolicitudId",
												value: datos.estadoSolicitudId,
											},
											{ op: "replace", path: "FechaIngreso", value: null },
											{ op: "replace", path: "NroAfiliado", value: "0" },
											{
												op: "replace",
												path: "EstadoSolicitudObservaciones",
												value: datos.estadoSolicitudObservaciones,
											},
											{ op: "replace", path: "FechaEgreso", value: null },
										],
									},
									onOk: async (_res) =>
										onClose({
											...datos,
											estadoSolicitud: estadosSolicitud.data?.find(
												(r) => r.value === datos.estadoSolicitudId
											)?.label,
										}),
									onError: async (err) => alert(err.message),
								});
							}}
						>
							Resuelve Solicitud
						</Button>
					</Grid>
					<Grid width="300px">
						<Button className="botonAmarillo" onClick={() => onClose()}>
							Cancela
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default ResolverSolicitudModal;
