import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import UseKeyPress from "components/helpers/UseKeyPress";
import modalCss from "components/ui/Modal/Modal.module.css";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";

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

	//#region select Localidad
	const [localidad, setLocalidad] = useState({
		buscar: "",
		options: [],
		selected: { value: 0, label: "" },
		inicio: true,
	});
	// Inicio
	useEffect(() => {
		if (localidades.loading) return;
		if (!localidad.inicio) return;
		const changes = {
			options: localidades.data,
			selected: localidades.data.find(
				({ value }) => value === data.domicilioLocalidadesId
			) ?? { value: 0, label: "" },
			inicio: false,
		};
		setLocalidad((o) => ({ ...o, ...changes }));
	}, [localidades, localidad, data.domicilioLocalidadesId]);
	// Buscador
	useEffect(() => {
		if (localidades.loading) return;
		if (localidad.inicio) return;
		const options = localidades.data.filter((r) =>
			localidad.buscar !== ""
				? r.label
						.toLocaleLowerCase()
						.includes(localidad.buscar.toLocaleLowerCase())
				: true
		);
		setLocalidad((o) => ({ ...o, options }));
	}, [localidades, localidad.buscar]);
	// Change
	useEffect(() => {
		if (localidades.loading) return;
		if (localidad.inicio) return;
		if ((localidad.selected?.value ?? 0) === (data.domicilioLocalidadesId ?? 0))
			return;
		onChange({ domicilioLocalidadesId: localidad.selected?.value ?? 0 });
	}, [localidades, localidad, data.domicilioLocalidadesId, onChange]);
	//#endregion

	//#region select Provincia
	const [provincia, setProvincia] = useState({
		buscar: "",
		options: [],
		selected: { value: 0, label: "" },
		inicio: true,
	});
	// Inicio
	useEffect(() => {
		if (provincias.loading) return;
		if (!provincia.inicio) return;
		const changes = {
			options: provincias.data,
			selected: provincias.data.find(
				({ value }) => value === data.domicilioProvinciasId
			) ?? { value: 0, label: "" },
			inicio: false,
		};
		setProvincia((o) => ({ ...o, ...changes }));
	}, [provincias, provincia, data.domicilioProvinciasId]);
	// Buscador
	useEffect(() => {
		if (provincias.loading) return;
		if (provincia.inicio) return;
		const options = provincias.data.filter((r) =>
			provincia.buscar !== ""
				? r.label
						.toLocaleLowerCase()
						.includes(provincia.buscar.toLocaleLowerCase())
				: true
		);
		setProvincia((o) => ({ ...o, options }));
	}, [provincias, provincia.buscar]);
	// Change
	useEffect(() => {
		if (provincias.loading) return;
		if (provincia.inicio) return;
		if ((provincia.selected?.value ?? 0) === (data.domicilioProvinciasId ?? 0))
			return;
		onChange({ domicilioProvinciasId: provincia.selected?.value ?? 0 });
		setLocalidad((o) => ({ ...o, selected: { value: 0, label: "" } }));
	}, [provincias, provincia, data.domicilioProvinciasId, onChange]);
	//#endregion

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show /*onHide={() => onClose()}*/>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				{title}
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="inherit">
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
										type="number"
										disabled={disabled.domicilioNumero}
										error={!!errors.domicilioNumero}
										helperText={errors.domicilioNumero ?? ""}
										value={getValue("domicilioNumero")}
										onChange={(domicilioNumero) =>
											onChange({ domicilioNumero })
										}
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
										<SearchSelectMaterial
											id="domicilioProvinciasId"
											name="domicilioProvinciasId"
											label="Provincia"
											error={!!errors.domicilioProvinciasId}
											helperText={
												provincias.loading ??
												provincias.error?.message ??
												errors.domicilioProvinciasId ??
												""
											}
											value={provincia.selected}
											disabled={disabled.domicilioProvinciasId ?? false}
											onChange={(selected) =>
												setProvincia((o) => ({ ...o, selected }))
											}
											options={provincia.options}
											onTextChange={( buscar ) =>
												setProvincia((o) => ({ ...o, buscar }))
											}
											required
										/>
									)}
								</Grid>
								<Grid width="50%">
									{hide.domicilioLocalidadesId ? null : (
										<SearchSelectMaterial
											id="domicilioLocalidadesId"
											name="domicilioLocalidadesId"
											label="Localidad"
											error={!!errors.domicilioLocalidadesId}
											helperText={
												localidades.loading ??
												localidades.error?.message ??
												errors.domicilioLocalidadesId ??
												""
											}
											value={localidad.selected}
											disabled={disabled.domicilioLocalidadesId ?? false}
											onChange={(selected) =>
												setLocalidad((o) => ({ ...o, selected }))
											}
											options={localidad.options}
											onTextChange={( buscar ) =>
												setLocalidad((o) => ({ ...o, buscar }))
											}
											required
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
