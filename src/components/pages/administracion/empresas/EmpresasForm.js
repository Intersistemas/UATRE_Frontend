import React, { useEffect, useState } from "react";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import InputMaterial from "components/ui/Input/InputMaterial";
// import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import InputMask from "react-input-mask";

import useHttp from "components/hooks/useHttp";
import CIIULookup from "components/ciiu/CIIULookup";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const EmpresasForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
	loading = {},
	// delegaciones = [],
}) => {
	data ??= {};
	// delegaciones ??= [];

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;

	onClose ??= onCloseDef;

	const { isLoading, error, sendRequest: request } = useHttp();
	const [modal, setModal] = useState(null);

	//#region Buscar Aactividades
	const [actividadesTodas, setActividadesTodas] = useState([]);
	const [actividadBuscar, setActividadBuscar] = useState("");
	// const [actividadesOptions, setActividadesOptions] = useState([""]); //LISTA DE TODAS LAS LOCALIDADES
	// const [actividadEmpresa, setActividadEmpresa] = useState({
	// 	value: data?.actividadPrincipalId ?? 0,
	// 	label: data?.actividadPrincipalDescripcion,
	// });

	const [cuitLoading, setCUITLoading] = useState(false);
	const [cuitValidado, setCuitValidado] = useState("");

	//#region Buscar Localidades
	// const [localidadesTodas, setLocalidadesTodas] = useState([]);
	// const [localidadBuscar, setLocalidadBuscar] = useState("");
	// const [localidadesOptions, setLocalidadesOptions] = useState([""]); //LISTA DE TODAS LAS LOCALIDADES
	// //const localidadInicio = {value: data?.refLocalidadesId ?? 0, label: data?.localidadNombre}
	// const [localidadSeccional, setLocalidadSeccional] = useState({
	// 	value: data?.refLocalidadesId ?? 0,
	// 	label: data?.localidadNombre,
	// });

	// const selectedDelegacion = (delegacionId) => {
	// 	const delegacion = delegaciones.find((c) => c.value === delegacionId);
	// 	return delegacion;
	// };

	//TRAIGO TODAS LAS LOCALIDADES una vez
	useEffect(() => {
		disabled.estado && onChange({ estado: data.estado });

		const processAactividades = async (actividadesObj) => {
			console.log("actividadesObj", actividadesObj);
			setActividadesTodas(actividadesObj);
		};

		request(
			{
				baseURL: "Comunes",
				endpoint: "/RefCIIU",
				method: "GET",
			},
			processAactividades
		);
	}, []);

	const validarEmpresaCUITHandler = () => {
		setCUITLoading(true);
		setCuitValidado(0);
		onChange({ existe: false });
		errors.cuit = "";

		onChange({ razonSocial: null });
		onChange({ actividadPrincipalDescripcion: null });
		//onChange({ domicilioCalle: padronObj.domicilios[0]?.direccion}); este es de AFIP CONSULTA
		onChange({ domicilioCalle: null });
		onChange({ telefono: null });
		onChange({ email: null });
		onChange({ ciiU1Descripcion: null });
		onChange({ ciiU2Descripcion: null });
		onChange({ ciiU3Descripcion: null });

		const processConsultaPadron = async (padronObj) => {
			console.log("padronObj", padronObj);
			setCuitValidado(1);
			onChange({ existe: true });
			//setPadronEmpresaRespuesta(padronObj);

			onChange({ cuit: padronObj.cuit });
			onChange({ razonSocial: padronObj.razonSocial });
			onChange({
				actividadPrincipalDescripcion: padronObj.actividadPrincipalDescripcion,
			});
			//onChange({ domicilioCalle: padronObj.domicilios[0]?.direccion}); este es de AFIP CONSULTA
			onChange({
				domicilioCalle:
					padronObj.domicilioCalle + " " + padronObj.domicilioNumero,
			});
			onChange({ telefono: padronObj.telefono });
			onChange({ email: padronObj.email });
			onChange({ ciiU1Descripcion: padronObj.ciiU1Descripcion });
			onChange({ ciiU2Descripcion: padronObj.ciiU2Descripcion });
			onChange({ ciiU3Descripcion: padronObj.ciiU3Descripcion });
		};
		setCUITLoading(false);

		request(
			{
				baseURL: "Comunes",
				//endpoint: `/AFIPConsulta?CUIT=${data.cuit}&VerificarHistorico=${true}`,
				endpoint: `/Empresas/GetEmpresaSpecs?CUIT=${
					data.cuit
				}&SoloActivos=${true}`,
				method: "GET",
			},
			processConsultaPadron
		);
	};
	//#endregion

	useEffect(() => {
		console.log("actividadBuscar", actividadBuscar);
		if (actividadBuscar.length > 2) {
			const actividadesSelect = actividadesTodas
				.filter((actividad) =>
					actividad.descripcion
						.toUpperCase()
						.includes(actividadBuscar.toUpperCase())
				)
				.map((actividad) => {
					return { value: actividad.id, label: actividad.descripcion };
				});
			//console.log("actividadesSelect", actividadesSelect, actividades);
			// setActividadesOptions(actividadesSelect);
		}

		if (actividadBuscar === "") {
			// setActividadesOptions([]);
			setActividadBuscar("");
		}
	}, [actividadesTodas, actividadBuscar]);

	// const handlerOnTextChange = (event) => {
	// 	//console.log("text change", event.target.value);

	// 	setActividadEmpresa({ ...actividadEmpresa, label: event.target.value });
	// 	setActividadBuscar(event.target.value);
	// };
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
											: cuitValidado
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
									disabled={!(data?.cuit?.length == 11)}
									onClick={validarEmpresaCUITHandler}
									loading={cuitLoading}
								>
									<h6>{!cuitLoading ? `Valida` : `...`}</h6>
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
								onChange={(value, _id) => onChange({ razonSocial: value })}
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
					{/* <Grid width="full" gap="inherit">
						<Grid width="250px">
							<SearchSelectMaterial
								id="actividadPrincipal"
								name="actividadPrincipal"
								label="Actividad"
								error={
									!!errors.actividadPrincipalId ||
									data.actividadPrincipalDescripcion != actividadEmpresa.label
								}
								helperText={errors.actividadPrincipalId ?? ""}
								value={actividadEmpresa}
								disabled={disabled.actividadPrincipalId ?? false}
								onChange={(value, _id) => (
									onChange({ actividadPrincipalId: value.value }),
									onChange({ actividadPrincipalDescripcion: value.label }),
									setActividadEmpresa({
										...actividadEmpresa,
										label: value.label,
									})
								)}
								options={actividadesOptions}
								onTextChange={handlerOnTextChange}
								required
							/>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="domicilioCalle"
								label="Dirección"
								error={!!errors.domicilioCalle}
								helperText={errors.domicilioCalle ?? ""}
								value={data.domicilioCalle}
								disabled={disabled.domicilioCalle ?? false}
								onChange={(value, _id) => onChange({ domicilioCalle: value })}
							/>
						</Grid>
					</Grid> */}
					<Grid width="full" gap="inherit">
						<InputMaterial
							id="domicilioCalle"
							label="Dirección"
							error={!!errors.domicilioCalle}
							helperText={errors.domicilioCalle ?? ""}
							value={data.domicilioCalle}
							disabled={disabled.domicilioCalle ?? false}
							onChange={(value, _id) => onChange({ domicilioCalle: value })}
						/>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="250px">
							<Grid width="full">
								<InputMaterial
									id="actividadPrincipalId"
									name="actividadPrincipalId"
									label="Actividad Ppal. - Código"
									error={!!errors.actividadPrincipalId}
									helperText={errors.actividadPrincipalId ?? ""}
									value={data.actividadPrincipalId}
									disabled={disabled.actividadPrincipalId}
									/>
							</Grid>
							<Grid col width="40px" style={{ margin: "5px 0px 5px 5px" }}>
								<Button
									className="botonAmarillo"
									style={{ padding: 0 }}
									disabled={disabled.actividadPrincipalId}
									onClick={() =>
										setModal(
											<CIIULookup
												title="Elige Actividad Principal"
												data={actividadesTodas}
												onClose={(selected) => {
													if (selected) {
														onChange({
															actividadPrincipalId: selected.ciiu,
															actividadPrincipalDescripcion: selected.descripcion,
														});
													}
													setModal(null);
												}}
											/>
										)
									}
								>
									...
								</Button>
							</Grid>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="actividadPrincipalDescripcion"
								name="actividadPrincipalDescripcion"
								label="Actividad Ppal. - Descripción"
								error={!!errors.actividadPrincipalDescripcion}
								helperText={errors.actividadPrincipalDescripcion ?? ""}
								value={data.actividadPrincipalDescripcion}
								disabled={disabled.actividadPrincipalId}
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
								onChange={(value, _id) => onChange({ telefono: value })}
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
								onChange={(value) => onChange({ email: value })}
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="250px">
							<Grid width="full">
								<InputMaterial
									id="ciiU1"
									name="ciiU1"
									label="CIIU 1 - Código"
									error={!!errors.ciiU1}
									helperText={errors.ciiU1 ?? ""}
									value={data.ciiU1}
									disabled={disabled.ciiU1}
									/>
							</Grid>
							<Grid col width="40px" style={{ margin: "5px 0px 5px 5px" }}>
								<Button
									className="botonAmarillo"
									style={{ padding: 0 }}
									disabled={disabled.ciiU1}
									onClick={() =>
										setModal(
											<CIIULookup
												title="Elige CIIU 1"
												data={actividadesTodas}
												onClose={(selected) => {
													if (selected) {
														onChange({
															ciiU1: selected.ciiu,
															ciiU1Descripcion: selected.descripcion,
														});
													}
													setModal(null);
												}}
											/>
										)
									}
								>
									...
								</Button>
							</Grid>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="ciiU1Descripcion"
								name="ciiU1Descripcion"
								label="CIIU 1 - Descripción"
								error={!!errors.ciiU1Descripcion}
								helperText={errors.ciiU1Descripcion ?? ""}
								value={data.ciiU1Descripcion}
								disabled={disabled.ciiU1}
								/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="250px">
							<Grid width="full">
								<InputMaterial
									id="ciiU2"
									name="ciiU2"
									label="CIIU 2 - Código"
									error={!!errors.ciiU2}
									helperText={errors.ciiU2 ?? ""}
									value={data.ciiU2}
									disabled={disabled.ciiU2}
									/>
							</Grid>
							<Grid col width="40px" style={{ margin: "5px 0px 5px 5px" }}>
								<Button
									className="botonAmarillo"
									style={{ padding: 0 }}
									disabled={disabled.ciiU2}
									onClick={() =>
										setModal(
											<CIIULookup
												title="Elige CIIU 2"
												data={actividadesTodas}
												onClose={(selected) => {
													if (selected) {
														onChange({
															ciiU2: selected.ciiu,
															ciiU2Descripcion: selected.descripcion,
														});
													}
													setModal(null);
												}}
											/>
										)
									}
								>
									...
								</Button>
							</Grid>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="ciiU2Descripcion"
								name="ciiU2Descripcion"
								label="CIIU 2 - Descripción"
								error={!!errors.ciiU2Descripcion}
								helperText={errors.ciiU2Descripcion ?? ""}
								value={data.ciiU2Descripcion}
								disabled={disabled.ciiU2}
								/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="250px">
							<Grid width="full">
								<InputMaterial
									id="ciiU3"
									name="ciiU3"
									label="CIIU 3 - Código"
									error={!!errors.ciiU3}
									helperText={errors.ciiU3 ?? ""}
									value={data.ciiU3}
									disabled={disabled.ciiU3}
									/>
							</Grid>
							<Grid col width="40px" style={{ margin: "5px 0px 5px 5px" }}>
								<Button
									className="botonAmarillo"
									style={{ padding: 0 }}
									disabled={disabled.ciiU3}
									onClick={() =>
										setModal(
											<CIIULookup
												title="Elige CIIU 3"
												data={actividadesTodas}
												onClose={(selected) => {
													if (selected) {
														onChange({
															ciiU3: selected.ciiu,
															ciiU3Descripcion: selected.descripcion,
														});
													}
													setModal(null);
												}}
											/>
										)
									}
								>
									...
								</Button>
							</Grid>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="ciiU3Descripcion"
								name="ciiU3Descripcion"
								label="CIIU 3 - Descripción"
								error={!!errors.ciiU3Descripcion}
								helperText={errors.ciiU3Descripcion ?? ""}
								value={data.ciiU3Descripcion}
								disabled={disabled.ciiU3}
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
									onChange={(value, _id) => onChange({ deletedDate: value })}
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
									onChange={(value, _id) => onChange({ deletedBy: value })}
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
									onChange={(value, _id) => onChange({ deletedObs: value })}
								/>
							</Grid>
						</Grid>
					)}
					{modal}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Button
					className="botonAzul"
					loading={loading}
					width={25}
					onClick={() => onClose(true)} //</Modal.Footer>handlerOnConfirmaClick}
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
