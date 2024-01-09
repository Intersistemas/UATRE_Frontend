import React from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import UseKeyPress from "components/helpers/UseKeyPress";
import modalCss from "components/ui/Modal/Modal.module.css";
import SelectMaterial from "components/ui/Select/SelectMaterial";

const dependeciesDef = {
	motivosBaja: {
		loading: "",
		data: [{ label: "", value: 0 }],
		error: null,
	},
	provincias: {
		loading: "",
		data: [{ label: "", value: 0 }],
		error: null,
	},
	localidades: {
		loading: "",
		data: [{ label: "", value: 0 }],
		error: null,
	},
};
const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const EstablecimientosForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	dependecies = dependeciesDef,
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	dependecies ??= {};
	dependecies = dependecies === dependeciesDef ? {} : { ...dependecies };

	dependecies.motivosBaja ??= { data: [] };
	const motivosBaja = dependecies.motivosBaja;

	dependecies.provincias ??= { data: [] };
	const provincias = dependecies.provincias;

	dependecies.localidades ??= { data: [] };
	const localidades = dependecies.localidades;

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	const getValue = (v) => data[v] ?? "";

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="inherit">
						{/* <Grid width="25%">
							{hide.nroSucursal ? null : (
								<InputMaterial
									id="nroSucursal"
									label="Nro. de Estab."
									type="number"
									disabled={disabled.nroSucursal}
									error={!!errors.nroSucursal}
									helperText={errors.nroSucursal ?? ""}
									value={getValue("nroSucursal")}
									onChange={(nroSucursal) => onChange({ nroSucursal })}
								/>
							)}
						</Grid>
						<Grid width="75%"> */}
						<Grid width>
							{hide.nombre ? null : (
								<InputMaterial
									id="nombre"
									label="Nombre"
									disabled={disabled.nombre}
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={getValue("nombre")}
									onChange={(nombre) => onChange({ nombre })}
								/>
							)}
						</Grid>
					</Grid>
					{/* <Grid width="full" gap="inherit">
						<Grid width="50%">
							{hide.telefono ? null : (
								<InputMaterial
									id="telefono"
									label="Teléfono"
									disabled={disabled.telefono}
									error={!!errors.telefono}
									helperText={errors.telefono ?? ""}
									value={getValue("telefono")}
									onChange={(telefono) => onChange({ telefono })}
								/>
							)}
						</Grid>
						<Grid width="50%">
							{hide.email ? null : (
								<InputMaterial
									id="email"
									label="Correo"
									disabled={disabled.email}
									error={!!errors.email}
									helperText={errors.email ?? ""}
									value={getValue("email")}
									onChange={(email) => onChange({ email })}
								/>
							)}
						</Grid>
					</Grid> */}
					{hide.domicilio ? null : (
						<Grid
							col
							width="full"
							style={{
								border: "solid 1px #cccccc",
								borderRadius: `15px`,
								padding: `15px`,
							}}
							gap="inherit"
						>
							<Grid grow style={{ borderBottom: "dashed 1px #cccccc" }}>
								<h4>Domicilio</h4>
							</Grid>
							<Grid width="full">
								{hide.domicilioCalle ? null : (
									<InputMaterial
										id="domicilioCalle"
										label="Calle"
										disabled={disabled.domicilioCalle}
										error={!!errors.domicilioCalle}
										helperText={errors.domicilioCalle ?? ""}
										value={getValue("domicilioCalle")}
										onChange={(domicilioCalle) => onChange({ domicilioCalle })}
									/>
								)}
							</Grid>
							<Grid width="full" gap="inherit">
								{hide.domicilioNumero ? null : (
									<InputMaterial
										id="domicilioNumero"
										label="Número"
										disabled={disabled.domicilioNumero}
										error={!!errors.domicilioNumero}
										helperText={errors.domicilioNumero ?? ""}
										value={getValue("domicilioNumero")}
										onChange={(domicilioNumero) => onChange({ domicilioNumero })}
									/>
								)}
								{hide.domicilioPiso ? null : (
									<InputMaterial
										id="domicilioPiso"
										label="Piso"
										disabled={disabled.domicilioPiso}
										error={!!errors.domicilioPiso}
										helperText={errors.domicilioPiso ?? ""}
										value={getValue("domicilioPiso")}
										onChange={(domicilioPiso) => onChange({ domicilioPiso })}
									/>
								)}
								{hide.domicilioDpto ? null : (
									<InputMaterial
										id="domicilioDpto"
										label="Dpto."
										disabled={disabled.domicilioDpto}
										error={!!errors.domicilioDpto}
										helperText={errors.domicilioDpto ?? ""}
										value={getValue("domicilioDpto")}
										onChange={(domicilioDpto) => onChange({ domicilioDpto })}
									/>
								)}
							</Grid>
							<Grid width="full" gap="inherit">
								<Grid width="50%">
									{hide.domicilioProvinciasId ? null : (
										<SelectMaterial
											name="domicilioProvinciasId"
											label="Provincia"
											options={provincias.data}
											value={data.domicilioProvinciasId ?? 0}
											error={
												provincias.loading ??
												provincias.error?.message ??
												errors.domicilioProvinciasId ??
												""
											}
											disabled={disabled.domicilioProvinciasId}
											onChange={(domicilioProvinciasId) => onChange({ domicilioProvinciasId })}
										/>
									)}
								</Grid>
								<Grid width="50%">
									{hide.domicilioLocalidadesId ? null : (
										<SelectMaterial
											name="domicilioLocalidadesId"
											label="Localidad"
											options={localidades.data}
											value={data.domicilioLocalidadesId ?? 0}
											error={
												localidades.loading ??
												localidades.error?.message ??
												errors.domicilioLocalidadesId ??
												""
											}
											disabled={disabled.domicilioLocalidadesId}
											onChange={(domicilioLocalidadesId) => onChange({ domicilioLocalidadesId })}
										/>
									)}
								</Grid>
							</Grid>
						</Grid>
					)}
					{hide.refMotivosBajaId ? null : (
						<SelectMaterial
							name="refMotivosBajaId"
							label="Motivo de baja"
							options={motivosBaja.data}
							value={data.refMotivosBajaId ?? 0}
							error={
								motivosBaja.loading ??
								motivosBaja.error?.message ??
								errors.refMotivosBajaId ??
								""
							}
							disabled={disabled.refMotivosBajaId}
							onChange={(refMotivosBajaId) => onChange({ refMotivosBajaId })}
						/>
					)}
					{hide.deletedObs ? null : (
						<InputMaterial
							id="deletedObs"
							label="Observaciones de baja"
							disabled={disabled.deletedObs}
							error={!!errors.deletedObs}
							helperText={errors.deletedObs ?? ""}
							value={getValue("deletedObs")}
							onChange={(deletedObs) => onChange({ deletedObs })}
						/>
					)}
					{hide.obs ? null : (
						<InputMaterial
							id="obs"
							label="Observaciones de reactivación"
							disabled={disabled.obs}
							error={!!errors.obs}
							helperText={errors.obs ?? ""}
							value={getValue("obs")}
							onChange={(obs) => onChange({ obs })}
						/>
					)}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid gap="20px">
					<Grid width="150px">
						<Button className="botonAzul" onClick={() => onClose(true)}>
							CONFIRMA
						</Button>
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={() => onClose()}>
							CANCELA
						</Button>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default EstablecimientosForm;
