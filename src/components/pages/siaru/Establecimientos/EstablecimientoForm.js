import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Alert, AlertTitle, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import ValidarEmail from "components/validators/ValidarEmail";
import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import styles from "./EstablecimientoForm.module.css";

const onConfirmDef = (_request, _record) => {};
const onCancelDef = (_request) => {};

const Form = ({
	request = "C", //"A" = Alta, "B" = Baja, "M" = Modificacion, "C" = Consulta
	record = {}, // Registro de establecimiento a realizar baja/modificaicon/consulta. Si es alta, se toman estos datos como iniciales.
	disabled: disabledInit = {}, // Controles deshabilitados. Cada uno debe tener el mismo nombre del campo al que refiere.
	hide = {}, // Controles ocultos. Cada uno debe tener el mismo nombre del campo al que refiere.
	onConfirm = onConfirmDef, // Acción a realizar al confirmar
	onCancel = onCancelDef, // Accion a realizar al cancelar
}) => {
	record ??= {};
	disabledInit ??= {};
	hide ??= {};
	onConfirm ??= onConfirmDef;
	onCancel ??= onCancelDef;
	record = { ...record };
	if (request === "A") record.id = 0;

	const [establecimiento, setEstablecimiento] = useState(record);
	disabledInit.deletedObs = !establecimiento.refMotivosBajaId;
	disabledInit.domicilioLocalidadesId = !establecimiento.domicilioProvinciasId;
	if (request === "B") {
		disabledInit = {
			...disabledInit,
			nombre: true,
			telefono: true,
			email: true,
			domicilioCalle: true,
			domicilioNumero: true,
			domicilioPiso: true,
			domicilioDpto: true,
		};
	}
	const [disabled, setDisabled] = useState(disabledInit);

	hide.domicilio ??=
		!!hide.domicilioCalle &&
		!!hide.domicilioNumero &&
		!!hide.domicilioPiso &&
		!!hide.domicilioDpto &&
		!!hide.domicilioProvinciasId &&
		!!hide.domicilioLocalidadesId;
	hide.refMotivosBajaId ??= (request !== "B" && !(record.refMotivosBajaId || record.deletedObs));
	hide.deletedObs ??= (request !== "B" && !(record.refMotivosBajaId || record.deletedObs));

	const [errores, setErrores] = useState({});
	const [alerts, setAlerts] = useState([]);

	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetMotivosBaja":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefMotivoBaja/GetByTipo`,
						method: "GET",
					},
				};
			case "CreateEmpresaEstablecimientos":
				return {
					config: {
						baseURL: "Comunes",
						method: "POST",
						endpoint: `/EmpresaEstablecimientos`,
					},
				};
			case "UpdateEmpresaEstablecimientos":
				return {
					config: {
						baseURL: "Comunes",
						method: "PUT",
						endpoint: `/EmpresaEstablecimientos`,
					},
				};
			case "GetProvincias":
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/Provincia`,
					},
				};
			case "GetLocalidades":
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/RefLocalidad`,
					},
				};
			default:
				return null;
		}
	});

	//#region Carga de motivos de baja
	const [motivosBaja, setMotivosBaja] = useState({
		data: [],
		loading: "Cargando...",
		error: {},
	});
	useEffect(() => {
		pushQuery({
			action: "GetMotivosBaja",
			params: { tipo: "E" },
			onOk: async (res) =>
				setMotivosBaja({
					data: res.map((r) => ({ label: r.descripcion, value: r.id })),
				}),
			onError: async (err) => setMotivosBaja({ data: [], error: err }),
		});
	}, [pushQuery]);
	//#endregion

	//#region Carga de provincias
	const [provincias, setProvincias] = useState({
		data: [],
		loading: "Cargando...",
		error: {},
	});
	useEffect(() => {
		pushQuery({
			action: "GetProvincias",
			onOk: async (res) =>
				setProvincias({
					data: [...res]
						.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
						.map((r) => ({ label: r.nombre, value: r.id })),
				}),
			onError: async (err) => setProvincias({ data: [], error: err }),
		});
	}, [pushQuery]);
	//#endregion

	//#region Carga de localidades
	const [localidades, setLocalidades] = useState({
		data: [],
		loading: "Cargando...",
		error: {},
	});
	useEffect(() => {
		if (!establecimiento.domicilioProvinciasId) {
			setLocalidades({
				data: [],
				error: { message: "Debe seleccionar una provincia." },
			});
			return;
		}
		pushQuery({
			action: "GetLocalidades",
			params: { provinciaId: establecimiento.domicilioProvinciasId },
			onOk: async (res) =>
				setLocalidades({
					data: [...res]
						.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
						.map((r) => ({ label: r.nombre, value: r.id })),
				}),
			onError: async (err) => setLocalidades({ data: [], error: err }),
		});
	}, [pushQuery, establecimiento.domicilioProvinciasId]);
	//#endregion

	let actionMsg;
	switch (request) {
		case "A":
			actionMsg = "Agregando";
			break;
		case "B":
			actionMsg = "Realizando baja";
			break;
		case "M":
			actionMsg = "Modificando";
			break;
		default:
			actionMsg = "Consultando";
			break;
	}

	const validar = () => {
		//validaciones
		let noValida = false;
		const newErrores = {};
		const newAlerts = [];

		if (["A", "M"].includes(request)) {
			// Alta / Modificacion
			if (establecimiento.empresaId) {
				newErrores.empresaId = "";
			} else {
				noValida = true;
				newErrores.empresaId = "Dato requerido";
			}

			if (establecimiento.nombre) {
				newErrores.nombre = "";
			} else {
				noValida = true;
				newErrores.nombre = "Dato requerido";
			}

			if (!!establecimiento.email && !ValidarEmail(establecimiento.email)) {
				noValida = true;
				newErrores.email = "El correo ingresado tiene un formato incorrecto.";
			} else {
				newErrores.email = "";
			}
		} else if (request === "B") {
			// Baja
			if (establecimiento.refMotivosBajaId) {
				newErrores.refMotivosBajaId = "";
			} else {
				noValida = true;
				newErrores.refMotivosBajaId = "Dato requerido";
			}
		} else {
			// No se reconoce request
			onCancel(request);
			return;
		}

		setErrores((old) => ({ ...old, ...newErrores }));
		setAlerts((old) => [...old, ...newAlerts]);
		if (noValida) return;

		const query = {
			onOk: async (res) => onConfirm(request, res),
			onError: async (err) => {
				setAlerts((old) => [
					...old,
					{ severity: "error", title: err.type, message: err.message },
				]);
			},
		};
		switch (request) {
			case "A":
				query.action = "CreateEmpresaEstablecimientos";
				break;
			case "M":
				query.action = "UpdateEmpresaEstablecimientos";
				break;
			case "B":
				query.action = "UpdateEmpresaEstablecimientos";
				establecimiento.deletedDate = dayjs().format("YYYY-MM-DDTHH:mm:ss");
				break;
			default:
				break;
		}
		query.config = { body: establecimiento };
		pushQuery(query);
	};

	const gap = 15;

	let alertsRender = null;
	if (alerts.length > 0) {
		alertsRender = (
			<Grid gap="inherit" full="width">
				<Grid col grow>
					{alerts?.map((r, ix) => (
						<Collapse key={ix} in={true} style={{ width: "100%" }}>
							<Alert
								severity={r.severity}
								action={
									<IconButton
										aria-label="close"
										color="inherit"
										size="small"
										onClick={() => {
											const newAlerts = [...alerts];
											newAlerts.splice(ix, 1);
											setAlerts(newAlerts);
										}}
									>
										<CloseIcon fontSize="inherit" />
									</IconButton>
								}
								sx={{ mb: 2 }}
								style={{ marginBottom: "0" }}
							>
								<AlertTitle>{r.title}</AlertTitle>
								{r.message}
							</Alert>
						</Collapse>
					))}
				</Grid>
			</Grid>
		);
	}

	return (
		<Modal onClose={() => onCancel(request)}>
			<Grid col full gap={`${gap}px`}>
				<Grid className={modalCss.modalCabecera} full="width" justify="center">
					<h3>{actionMsg} Establecimiento</h3>
					{/* 
					<Grid style={{ color: "transparent" }}>
						<h3>[empresaId: {establecimiento.empresaId ?? ""}]</h3>
					</Grid>
					<Grid style={{ color: "transparent" }}>
						<h3>{establecimiento.id ?? ""}</h3>
					</Grid>
					*/}
				</Grid>
				<Grid full="width" gap="inherit">
					<Grid width="25%">
						<InputMaterial
							type="number"
							label="Nro. de Estab."
							error={!!errores.nroSucursal}
							helperText={errores.nroSucursal ?? ""}
							value={establecimiento.nroSucursal}
							disabled
							onChange={(value, _id) =>
								setEstablecimiento((old) => ({
									...old,
									nroSucursal: Formato.Entero(value),
								}))
							}
						/>
					</Grid>
					<Grid width="75%">
						<InputMaterial
							label="Nombre"
							error={!!errores.nombre}
							helperText={errores.nombre ?? ""}
							value={establecimiento.nombre}
							disabled={disabled.nombre ?? false}
							onChange={(value, _id) =>
								setEstablecimiento((old) => ({
									...old,
									nombre: `${value}`,
								}))
							}
						/>
					</Grid>
				</Grid>
				<Grid full="width" gap="inherit">
					<Grid width="50%">
						{hide.telefono ? null : (
							<InputMaterial
								label="Teléfono"
								value={establecimiento.telefono}
								disabled={disabled.telefono ?? false}
								onChange={(value, _id) =>
									setEstablecimiento((old) => ({
										...old,
										telefono: `${value}`,
									}))
								}
							/>
						)}
					</Grid>
					<Grid width="50%">
						{hide.email ? null : (
							<InputMaterial
								label="Correo"
								value={establecimiento.email}
								error={!!errores.email}
								helperText={errores.email ?? ""}
								disabled={disabled.email ?? false}
								onChange={(value, _id) =>
									setEstablecimiento((old) => ({
										...old,
										email: `${value}`,
									}))
								}
							/>
						)}
					</Grid>
				</Grid>
				{hide.domicilio ? null : (
					<Grid
						col
						full="width"
						style={{
							border: "solid 1px #cccccc",
							borderRadius: `${gap}px`,
							padding: `${gap}px`,
						}}
						gap="inherit"
					>
						<Grid grow style={{ borderBottom: "dashed 1px #cccccc" }}>
							<h4>Domicilio</h4>
						</Grid>
						<Grid full="width">
							{hide.domicilioCalle ? null : (
								<InputMaterial
									label="Calle"
									value={establecimiento.domicilioCalle}
									disabled={disabled.domicilioCalle ?? false}
									onChange={(value, _id) =>
										setEstablecimiento((old) => ({
											...old,
											domicilioCalle: `${value}`,
										}))
									}
								/>
							)}
						</Grid>
						<Grid full="width">
							{hide.domicilioNumero ? null : (
								<InputMaterial
									label="Número"
									value={establecimiento.domicilioNumero}
									disabled={disabled.domicilioNumero ?? false}
									onChange={(value, _id) =>
										setEstablecimiento((old) => ({
											...old,
											domicilioNumero: `${value}`,
										}))
									}
								/>
							)}
						</Grid>
						<Grid full="width" gap="inherit">
							<Grid block basis="180px" className={styles.label}>
								{hide.domicilioPiso ? null : (
									<InputMaterial
										label="Piso"
										value={establecimiento.domicilioPiso}
										disabled={disabled.domicilioPiso ?? false}
										onChange={(value, _id) =>
											setEstablecimiento((old) => ({
												...old,
												domicilioPiso: `${value}`,
											}))
										}
									/>
								)}
							</Grid>
							<Grid block basis="calc(100% - 180px)" className={styles.data}>
								{hide.domicilioDpto ? null : (
									<InputMaterial
										label="Dpto"
										value={establecimiento.domicilioDpto}
										disabled={disabled.domicilioDpto ?? false}
										onChange={(value, _id) =>
											setEstablecimiento((old) => ({
												...old,
												domicilioDpto: `${value}`,
											}))
										}
									/>
								)}
							</Grid>
						</Grid>
						<Grid width="full" gap="inherit">
							<Grid width="50%">
								{hide.domicilioProvinciasId ? null : (
									<SelectMaterial
										name="domicilioProvinciasId"
										label="Provincia"
										value={establecimiento.domicilioProvinciasId ?? 0}
										error={
											provincias.loading ??
											provincias.error?.message ??
											errores.domicilioProvinciasId ??
											""
										}
										disabled={disabled.domicilioProvinciasId ?? false}
										options={provincias.data}
										onChange={(value, _id) => {
											const cambios = { domicilioProvinciasId: value };
											if (establecimiento.domicilioProvinciasId !== value) {
												cambios.domicilioLocalidadesId = 0;
												setLocalidades({ data: [], loading: "Cargando..." });
											}
											setEstablecimiento((old) => ({ ...old, ...cambios }));
											setDisabled((old) => ({
												...old,
												domicilioLocalidadesId: value === 0,
											}));
										}}
									/>
								)}
							</Grid>
							<Grid width="50%">
								{hide.domicilioLocalidadesId ? null : (
									<SelectMaterial
										name="domicilioLocalidadesId"
										label="Localidad"
										value={establecimiento.domicilioLocalidadesId ?? 0}
										error={
											localidades.loading ??
											localidades.error?.message ??
											errores.domicilioLocalidadesId ??
											""
										}
										disabled={disabled.domicilioLocalidadesId ?? false}
										options={localidades.data}
										onChange={(value, _id) => {
											setEstablecimiento((old) => ({
												...old,
												domicilioLocalidadesId: value,
											}));
										}}
									/>
								)}
							</Grid>
						</Grid>
					</Grid>
				)}
				{hide.refMotivosBajaId ? null : (
					<Grid col full="width" gap="inherit">
						<SelectMaterial
							name="refMotivosBajaId"
							label="Motivo de baja"
							value={establecimiento.refMotivosBajaId ?? 0}
							error={
								motivosBaja.loading ??
								motivosBaja.error?.message ??
								errores.refMotivosBajaId ??
								""
							}
							disabled={disabled.refMotivosBajaId ?? false}
							options={motivosBaja.data}
							onChange={(value, _id) => {
								setEstablecimiento((old) => ({
									...old,
									refMotivosBajaId: value,
								}));
								setDisabled((old) => ({
									...old,
									deletedObs: value === 0,
								}));
							}}
						/>
					</Grid>
				)}
				{hide.deletedObs ? null : (
					<Grid col full="width" gap="inherit">
						<InputMaterial
							label="Observaciones de baja"
							value={establecimiento.deletedObs}
							disabled={disabled.deletedObs ?? false}
							onChange={(value, _id) =>
								setEstablecimiento((old) => ({
									...old,
									deletedObs: `${value}`,
								}))
							}
						/>
					</Grid>
				)}
				<Grid width="full" justify="evenly">
					<Grid width="150px">
						{["A", "B", "M"].includes(request) ? (
							<Button className="botonAzul" onClick={validar}>
								Confirma
							</Button>
						) : null}
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={() => onCancel(request)}>Cancela</Button>
					</Grid>
				</Grid>
				{alertsRender}
			</Grid>
		</Modal>
	);
};

export default Form;
