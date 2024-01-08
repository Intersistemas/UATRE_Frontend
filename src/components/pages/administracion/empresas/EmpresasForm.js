import React, { useEffect, useState } from "react";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import InputMask from "react-input-mask";

import useQueryQueue from "components/hooks/useQueryQueue";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const getCIIULabel = (ciiu) =>
	[ciiu?.ciiu ?? "", ciiu?.descripcion ?? ""]
		.filter((r) => r !== null)
		.join(" - ");

const getCIIUOption = (ciiu) => ({
	value: ciiu?.ciiu,
	label: getCIIULabel(ciiu),
});

const EmpresasForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
	loading = {},
}) => {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;

	onClose ??= onCloseDef;

	//#region consultas API
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/Empresas/GetEmpresaSpecs",
						method: "GET",
					},
				};
			}
			case "GetCIIUs": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/RefCIIU",
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region declaracion y carga de actividades
	const [ciius, setCIIUs] = useState({
		loading: "Cargando actividades...",
		data: [],
		options: [],
		error: null,
	});
	useEffect(() => {
		if (!ciius.loading) return;
		const changes = {
			loading: null,
			data: [],
			options: [],
			error: null,
		};
		pushQuery({
			action: "GetCIIUs",
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", { GetCIIUs: data });
				changes.data.push(...data);
				changes.options.push(...data.map((ciiu) => getCIIUOption(ciiu)));
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setCIIUs((o) => ({ ...o, ...changes })),
		});
	}, [ciius, pushQuery]);
	//#endregion

	//#region Buscar Actividades

	//#region Actividad Ppal.
	const [actividadPrincipal, setActividadPrincipal] = useState({
		buscar: "",
		options: [],
		selected: getCIIUOption({
			ciiu: data?.actividadPrincipalId ?? 0,
			descripcion: data?.actividadPrincipalDescripcion ?? "",
		}),
	});
	// Buscador
	useEffect(() => {
		if (ciius.loading) return;
		const options = ciius.data
			.filter((r) =>
				actividadPrincipal.buscar !== ""
					? getCIIULabel(r)
							.toLocaleLowerCase()
							.includes(actividadPrincipal.buscar.toLocaleLowerCase())
					: true
			)
			.map((r) => getCIIUOption(r));
		setActividadPrincipal((o) => ({ ...o, options }));
	}, [ciius, actividadPrincipal.buscar]);
	// Refresca descripcion
	useEffect(() => {
		if (ciius.loading) return;
		const actividadPrincipalDescripcion =
			ciius.data.find((r) => r.ciiu === data.actividadPrincipalId)
				?.descripcion ?? "";
		if (data.actividadPrincipalDescripcion === actividadPrincipalDescripcion)
			return;
		onChange({ actividadPrincipalDescripcion });
	}, [
		ciius,
		data.actividadPrincipalId,
		data.actividadPrincipalDescripcion,
		onChange,
	]);
	//#endregion

	//#region ciiU1.
	const [ciiu1, setCIIU1] = useState({
		buscar: "",
		options: [],
		selected: getCIIUOption({
			ciiu: data?.ciiU1 ?? 0,
			descripcion: data?.ciiU1Descripcion ?? "",
		}),
	});
	// Buscador
	useEffect(() => {
		if (ciius.loading) return;
		const options = ciius.data
			.filter((r) =>
				ciiu1.buscar !== ""
					? getCIIULabel(r)
							.toLocaleLowerCase()
							.includes(ciiu1.buscar.toLocaleLowerCase())
					: true
			)
			.map((r) => getCIIUOption(r));
		setCIIU1((o) => ({ ...o, options }));
	}, [ciius, ciiu1.buscar]);
	// Refresca descripcion
	useEffect(() => {
		if (ciius.loading) return;
		const ciiU1Descripcion =
			ciius.data.find((r) => r.ciiu === data.ciiU1)?.descripcion ?? "";
		if (ciiU1Descripcion === data.ciiU1Descripcion) return;
		onChange({ ciiU1Descripcion });
	}, [ciius, data.ciiU1, data.ciiU1Descripcion, onChange]);
	//#endregion

	//#region ciiU2.
	const [ciiu2, setCIIU2] = useState({
		buscar: "",
		options: [],
		selected: getCIIUOption({
			ciiu: data?.ciiU2 ?? 0,
			descripcion: data?.ciiU2Descripcion ?? "",
		}),
	});
	// Buscador
	useEffect(() => {
		if (ciius.loading) return;
		const options = ciius.data
			.filter((r) =>
				ciiu2.buscar !== ""
					? getCIIULabel(r)
							.toLocaleLowerCase()
							.includes(ciiu2.buscar.toLocaleLowerCase())
					: true
			)
			.map((r) => getCIIUOption(r));
		setCIIU2((o) => ({ ...o, options }));
	}, [ciius, ciiu2.buscar]);
	// Refresca descripcion
	useEffect(() => {
		if (ciius.loading) return;
		const ciiU2Descripcion =
			ciius.data.find((r) => r.ciiu === data.ciiU2)?.descripcion ?? "";
		if (ciiU2Descripcion === data.ciiU2Descripcion) return;
		onChange({ ciiU2Descripcion });
	}, [ciius, data.ciiU2, data.ciiU2Descripcion, onChange]);
	//#endregion

	//#region ciiU3.
	const [ciiu3, setCIIU3] = useState({
		buscar: "",
		options: [],
		selected: getCIIUOption({
			ciiu: data?.ciiU3 ?? 0,
			descripcion: data?.ciiU3Descripcion ?? "",
		}),
	});
	// Buscador
	useEffect(() => {
		if (ciius.loading) return;
		const options = ciius.data
			.filter((r) =>
				ciiu3.buscar !== ""
					? getCIIULabel(r)
							.toLocaleLowerCase()
							.includes(ciiu3.buscar.toLocaleLowerCase())
					: true
			)
			.map((r) => getCIIUOption(r));
		setCIIU3((o) => ({ ...o, options }));
	}, [ciius, ciiu3.buscar]);
	// Refresca descripcion
	useEffect(() => {
		if (ciius.loading) return;
		const ciiU3Descripcion =
			ciius.data.find((r) => r.ciiu === data.ciiU3)?.descripcion ?? "";
		if (ciiU3Descripcion === data.ciiU3Descripcion) return;
		onChange({ ciiU3Descripcion });
	}, [ciius, data.ciiU3, data.ciiU3Descripcion, onChange]);
	//#endregion

	//#endregion

	const [validacionCUIT, setValidacionCUIT] = useState({
		loading: false,
		validado: "",
	});

	const validarEmpresaCUITHandler = () => {
		const changes = {
			loading: true,
			validado: 0,
		};
		setValidacionCUIT((o) => ({ ...o, ...changes }));

		errors.cuit = "";
		onChange({
			existe: false,
			razonSocial: null,
			actividadPrincipalId: null,
			domicilioCalle: null,
			domicilioNro: null,
			domicilioPiso: null,
			domicilioDpto: null,
			telefono: null,
			email: null,
			ciiU1: null,
			ciiU2: null,
			ciiU3: null,
		});
		pushQuery({
			action: "GetEmpresa",
			params: { cuit: data.cuit, soloActivos: true },
			onOk: async (ok) => {
				changes.validado = 1;
				onChange({
					existe: true,
					cuit: ok.cuit,
					razonSocial: ok.razonSocial,
					actividadPrincipalId: ok.actividadPrincipalId,
					domicilioCalle: ok.domicilioCalle,
					domicilioNro: ok.domicilioNro,
					domicilioPiso: ok.domicilioPiso,
					domicilioDpto: ok.domicilioDpto,
					telefono: ok.telefono,
					email: ok.email,
					ciiU1: ok.ciiU1,
					ciiU2: ok.ciiU2,
					ciiU3: ok.ciiU3,
				});
			},
			onFinally: async () => {
				changes.loading = false;
				setValidacionCUIT((o) => ({ ...o, ...changes }));
			},
		});
	};
	//#endregion

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal show onHide={() => onClose()} size="lg" centered>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				<h3>{title}</h3>
			</Modal.Header>
			<Modal.Body>
				<Grid col width="full" gap="15px">
					<Grid width="full" gap="inherit">
						<Grid width="250px">
							<Grid width="full">
								<InputMaterial
									id="cuitEmpresa"
									label="CUIT"
									as={InputMask}
									mask="99-99.999.999-9"
									required
									error={!!errors.cuit}
									helperText={
										errors.cuit
											? errors.cuit
											: validacionCUIT.validado
											? "La Empresa ya existe!"
											: "Se creará la Empresa"
									}
									value={data.cuit}
									disabled={disabled.cuit}
									onChange={(value, _id) =>
										onChange({ cuit: value.replace(/[^0-9]+/g, "") })
									}
								/>
							</Grid>
							<Grid col width="30%">
								<Button
									className="botonAzul"
									disabled={!(data?.cuit?.length === 11)}
									onClick={validarEmpresaCUITHandler}
									loading={validacionCUIT.loading}
								>
									<h6>{!validacionCUIT.loading ? `Valida` : `...`}</h6>
								</Button>
							</Grid>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="razonSocial"
								label="Razon Social"
								error={!!errors.razonSocial}
								helperText={errors.razonSocial ?? ""}
								value={data.razonSocial}
								disabled={disabled.razonSocial}
								onChange={(razonSocial) => onChange({ razonSocial })}
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="250px">
							<InputMaterial
								id="provinciaDesc"
								label="Provincia"
								//error={!!errors.razonSocial}
								//helperText={errors.razonSocial ?? ""}
								//value={data.razonSocial}
								//disabled={disabled.razonSocial}
								//onChange={(value, _id) => onChange({ razonSocial: value })}
							/>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="localidadDesc"
								label="Localidad"
								//error={!!errors.razonSocial}
								//helperText={errors.razonSocial ?? ""}
								//value={data.Localidad}
								//disabled={disabled.razonSocial}
								//onChange={(value, _id) => onChange({ razonSocial: value })}
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="full">
							<SearchSelectMaterial
								id="actividadPrincipalId"
								name="actividadPrincipalId"
								label="Actividad"
								error={!!errors.actividadPrincipalId}
								helperText={
									ciius.loading ??
									ciius.error?.message ??
									errors.actividadPrincipalId ??
									""
								}
								value={actividadPrincipal.selected}
								disabled={disabled.actividadPrincipalId ?? false}
								onChange={(selected) => {
									setActividadPrincipal((o) => ({ ...o, selected }));
									onChange({ actividadPrincipalId: selected?.value });
								}}
								options={actividadPrincipal.options}
								onTextChange={({ target }) =>
									setActividadPrincipal((o) => ({ ...o, buscar: target.value }))
								}
								required
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="full">
							<InputMaterial
								id="domicilioCalle"
								label="Dirección - Calle"
								error={!!errors.domicilioCalle}
								helperText={errors.domicilioCalle ?? ""}
								value={data.domicilioCalle}
								disabled={disabled.domicilioCalle ?? false}
								onChange={(domicilioCalle) => onChange({ domicilioCalle })}
							/>
						</Grid>
						<Grid width="full" gap="inherit">
							<InputMaterial
								id="domicilioNumero"
								label="Dir. - Nro."
								error={!!errors.domicilioNumero}
								helperText={errors.domicilioNumero ?? ""}
								value={data.domicilioNumero}
								disabled={disabled.domicilioNumero ?? false}
								onChange={(domicilioNumero) => onChange({ domicilioNumero })}
							/>
							<InputMaterial
								id="domicilioPiso"
								label="Dir. - Piso"
								error={!!errors.domicilioPiso}
								helperText={errors.domicilioPiso ?? ""}
								value={data.domicilioPiso}
								disabled={disabled.domicilioPiso ?? false}
								onChange={(domicilioPiso) => onChange({ domicilioPiso })}
							/>
							<InputMaterial
								id="domicilioDpto"
								label="Dir. - Dpto."
								error={!!errors.domicilioDpto}
								helperText={errors.domicilioDpto ?? ""}
								value={data.domicilioDpto}
								disabled={disabled.domicilioDpto ?? false}
								onChange={(domicilioDpto) => onChange({ domicilioDpto })}
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="250px">
							<InputMaterial
								id="telefono"
								label="Teléfono"
								error={!!errors.telefono}
								helperText={errors.telefono ?? ""}
								value={data.telefono}
								disabled={disabled.telefono ?? false}
								onChange={(telefono) => onChange({ telefono })}
							/>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="email"
								name="email"
								label="Email"
								error={!!errors.email}
								helperText={errors.email ?? ""}
								value={data.email}
								disabled={disabled.email}
								onChange={(email) => onChange({ email })}
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="full">
							<SearchSelectMaterial
								id="ciiU1"
								name="ciiU1"
								label="CIIU 1"
								error={!!errors.ciiU1}
								helperText={
									ciius.loading ?? ciius.error?.message ?? errors.ciiU1 ?? ""
								}
								value={ciiu1.selected}
								disabled={disabled.ciiU1 ?? false}
								onChange={(selected) => {
									setCIIU1((o) => ({ ...o, selected }));
									onChange({ ciiU1: selected?.value });
								}}
								options={ciiu1.options}
								onTextChange={({ target }) =>
									setCIIU1((o) => ({ ...o, buscar: target.value }))
								}
								required
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="full">
							<SearchSelectMaterial
								id="ciiU2"
								name="ciiU2"
								label="CIIU 2"
								error={!!errors.ciiU2}
								helperText={
									ciius.loading ?? ciius.error?.message ?? errors.ciiU1 ?? ""
								}
								value={ciiu2.selected}
								disabled={disabled.ciiU2 ?? false}
								onChange={(selected) => {
									setCIIU2((o) => ({ ...o, selected }));
									onChange({ ciiU2: selected?.value });
								}}
								options={ciiu2.options}
								onTextChange={({ target }) =>
									setCIIU2((o) => ({ ...o, buscar: target.value }))
								}
								required
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="full">
							<SearchSelectMaterial
								id="ciiU3"
								name="ciiU3"
								label="CIIU 3"
								error={!!errors.ciiU3}
								helperText={
									ciius.loading ?? ciius.error?.message ?? errors.ciiU3 ?? ""
								}
								value={ciiu3.selected}
								disabled={disabled.ciiU3 ?? false}
								onChange={(selected) => {
									setCIIU3((o) => ({ ...o, selected }));
									onChange({ ciiU3: selected?.value });
								}}
								options={ciiu3.options}
								onTextChange={({ target }) =>
									setCIIU3((o) => ({ ...o, buscar: target.value }))
								}
								required
							/>
						</Grid>
					</Grid>
					{hide.deletedObs ? null : (
						<Grid width="full" gap="inherit">
							<Grid width="full">
								<InputMaterial
									id="deletedDate"
									label="Fecha Baja"
									error={!!errors.deletedDate}
									helperText={errors.deletedDate ?? ""}
									value={data.deletedDate}
									disabled={disabled.deletedDate ?? false}
									onChange={(deletedDate) => onChange({ deletedDate })}
								/>
							</Grid>
							<Grid width="full">
								<InputMaterial
									id="deletedBy"
									label="Usuario Baja"
									error={!!errors.deletedBy}
									helperText={errors.deletedBy ?? ""}
									value={data.deletedBy}
									disabled={disabled.deletedBy ?? false}
									onChange={(deletedBy) => onChange({ deletedBy })}
								/>
							</Grid>
							<Grid width="full">
								<InputMaterial
									id="deletedObs"
									label="Observaciones Baja"
									error={!!errors.deletedObs}
									helperText={errors.deletedObs ?? ""}
									value={data.deletedObs}
									disabled={disabled.deletedObs ?? false}
									onChange={(deletedObs) => onChange({ deletedObs })}
								/>
							</Grid>
						</Grid>
					)}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Button
					className="botonAzul"
					loading={loading}
					width={25}
					onClick={() => onClose(true)}
				>
					CONFIRMA
				</Button>

				<Button className="botonAmarillo" width={25} onClick={() => onClose()}>
					CIERRA
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default EmpresasForm;
