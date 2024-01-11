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
import ValidarCUIT from "components/validators/ValidarCUIT";

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

const getProvinciaOption = (provincia) => ({
	value: provincia?.id,
	label: provincia?.nombre,
});

const getLocalidadOption = (localidad) => ({
	value: localidad?.id,
	label: localidad?.nombre,
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

	console.log('EmpresasForm:',data)

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

			case "ConsultaAFIP":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/AFIPConsulta",
						method: "GET",
					},
				};

			case "GetProvincias":
				return{
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Provincia`,
						method: "GET",
					}
				};
			case "GetLocalidades":
				return{
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/RefLocalidad`,
						method: "GET",
					}
				}

			default:
				return null;
		}
	});
	//#endregion

	//#region Provincias
	const [provincias, setProvincias] = useState({
		loading: "Cargando provincias...",
		provinciaEmpresa: {value: data?.domicilioProvinciasId ?? 0, label: data?.provinciaNombre},
		data: [], //TODAS LAS EMPRESAS
		options: [], //DEPENDE DEL CAMPO "BUSCAR", si tiene algo ese campo, voy filtrando las OPTIONS
		buscar: "",
		error: null,
	});

	const handlerOnTextChange = (event) => {

		console.log('event_handlerOnTextChange',event);
		
		setProvincias(...provincias, {provinciaEmpresa: {value:event.target.value}})
		setProvincias(...provincias, {buscar:event.target.value})
		
	  };



	useEffect(() => {
		if (!provincias.loading) return;
		const changes = {
			loading: null,
			data: [],
			options: [],
			error: null,
		};
		pushQuery({
			action: "GetProvincias",
			onOk: async (data) => {
				console.log('provincias_data:',data)
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", { GetProvincias: data });
				changes.data.push(...data);
				changes.options.push(...data.map((provincia) => getProvinciaOption(provincia))); //le doy formato al OPTION que voy a mostrar
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setProvincias((o) => ({ ...o, ...changes })),
		});
	}, [provincias, pushQuery]);
	//#endregion


	
	//#region Localidades
	const [localidades, setLocalidades] = useState({
		loading: "Cargando localidades...",
		localidadEmpresa: {value: data?.domicilioLocalidadesId ?? 0, label: data?.localidadNombre},
		data: [], //TODAS LAS localidades de la provincia
		options: [], //DEPENDE DEL CAMPO "BUSCAR", si tiene algo ese campo, voy filtrando las OPTIONS
		buscar: "",
		error: null,
	});

	useEffect(() => {
		console.log('provincia Id', provincias.provinciaEmpresa)
		if (!localidades.loading) return;
		if (provincias?.provinciaEmpresa?.value === 0) return;
		const changes = {
			loading: null,
			data: [],
			options: [],
			error: null,
		};
		pushQuery({
			action: "GetLocalidades",
			params: { domicilioProvinciasId: provincias?.provinciaEmpresa?.value, SoloActivos: true },
			onOk: async (data) => {
				console.log('localidades_data:',data)
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", { GetLocalidades: data });
				changes.data.push(...data);
				changes.options.push(...data.map((localidad) => getLocalidadOption(localidad))); //le doy formato al OPTION que voy a mostrar
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setLocalidades((o) => ({ ...o, ...changes })),
		});
	}, [localidades, data?.domicilioProvinciasId, pushQuery]);



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
			validado: "",
			datoAFIP: "",
		};
		setValidacionCUIT((o) => ({ ...o, ...changes }));

		errors.cuit = "";
		onChange({
			existe: false,
			razonSocial: null,
			actividadPrincipalId: null,
			domicilioCalle: null,
			domicilioNumero: null,
			domicilioPiso: null,
			domicilioDpto: null,
			telefono: null,
			email: null,
			email2: null,
			ciiU1: null,
			ciiU2: null,
			ciiU3: null,
		});

		const validaAFIP = () => {
			console.log('validaAFIP...')
			pushQuery({
				action: "ConsultaAFIP",
				params: { cuit: data.cuit, VerificarHistorico: false },
				onOk: async (ok) => {
					changes.validado = "Se creará la Empresa";
					changes.datoAFIP = `Dato AFIP:  ${ok.domicilios[0]?.codigoPostal} ${ok.domicilios[0]?.localidad}`
					onChange({
						existe: true,
						cuit: ok.cuit,
						razonSocial: ok.razonSocial,
						actividadPrincipalId: ok.idActividadPrincipal,
						domicilioCalle: ok.domicilios[0].direccion,
						domicilioNumero: ok.domicilios[0].numero,
						domicilioPiso: ok.domicilios[0].piso,
						domicilioDpto: ok.domicilios[0].oficinaDptoLocal,
						telefono: ok.telefono,
						email: ok.email,
						email2: ok.email2,
						ciiU1: ok.ciiU1,
						ciiU2: ok.ciiU2,
						ciiU3: ok.ciiU3,
					});
				},
				onFinally: async () => {
					changes.loading = false;
					setValidacionCUIT((o) => ({ ...o, ...changes }));
				},
			})
		}


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
					domicilioNumero: ok.domicilioNro,
					domicilioPiso: ok.domicilioPiso,
					domicilioDpto: ok.domicilioDpto,
					telefono: ok.telefono,
					email: ok.email,
					email2: ok.email2,
					ciiU1: ok.ciiU1,
					ciiU2: ok.ciiU2,
					ciiU3: ok.ciiU3,
				});
			},
			onError: async (error) => (
				validaAFIP()
			),
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
									disabled={(data?.cuit?.length === 11) || (errors.cuit !== "")}
									onClick={validarEmpresaCUITHandler}
									loading={validacionCUIT.loading}
								>
									<h6>{!validacionCUIT.loading ? `Valida` : `Validando...`}</h6>
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

							<SearchSelectMaterial
							id="domicilioProvinciasId"
							name="domicilioProvinciasId"
							label="Provincia"
							error={(!!errors.domicilioProvinciasId)} 
							helperText={errors.domicilioProvinciasId ?? ""}
							value={provincias.provinciaSelected}
							
							disabled={disabled.domicilioProvinciasId ?? false}
							onChange={(value, _id) => (
								onChange({ domicilioProvinciasId: value?.value }),
								onChange({ provinciaNombre: value?.label }),
								setLocalidades((o) => ({ ...o, loading:"Cargando localidades..."})),//hago esto para que me filtre las localidades de la provincia seleccionada.
								setProvincias((o) => ({ ...o, provinciaSelected: value}))
								)}
							options={provincias.options}
							onTextChange={handlerOnTextChange}
							required
							/>
						</Grid>


						<Grid width="250px">
							<SearchSelectMaterial
							id="domicilioLocalidadesId"
							name="domicilioLocalidadesId"
							label="Localidad"

							error={(!!errors.domicilioLocalidadesId)} 
							helperText={errors.domicilioLocalidadesId ?? ""}							
							value={localidades.localidadSelected}
							disabled={disabled.domicilioLocalidadesId ?? false}
							onChange={(value, _id) => (
								onChange({ domicilioLocalidadesId: value.value }),
								onChange({ localidadNombre: value.label }),
								setLocalidades((o) => ({ ...o, localidadSelected: {label: value.label}}))
								)}
							
							options={localidades.options}
					
							onTextChange={handlerOnTextChange}
							required
							/>
							
						</Grid>
						<h7>{validacionCUIT.datoAFIP}</h7>
					</Grid>


			
					<Grid width="full" gap="inherit">
						<Grid width="250px">

							<SearchSelectMaterial
							id="domicilioProvinciasId"
							name="domicilioProvinciasId"
							label="Provincia"

							error={(!!errors.domicilioProvinciasId) || (data.provinciaNombre != provincias.provinciaEmpresa.label)} 
							helperText={errors.domicilioProvinciasId ?? ""}
							value={provincias.provinciaEmpresa}
							disabled={disabled.domicilioProvinciasId ?? false}
							onChange={(value, _id) => (
								onChange({ domicilioProvinciasId: value.value }),
								onChange({ provinciaNombre: value.label }),
								setProvincias(...provincias, {provinciaEmpresa: {label: value.label}})
								)}
							
							options={provincias.options}
					
							onTextChange={handlerOnTextChange}
							required
							/>
						</Grid>


						<Grid width="250px">
							<SearchSelectMaterial
							id="domicilioLocalidadesId"
							name="domicilioLocalidadesId"
							label="Localidad"

							error={(!!errors.domicilioLocalidadesId) || (data.localidadNombre != localidades.localidadEmpresa.label)} 
							helperText={errors.domicilioLocalidadesId ?? ""}
							value={localidades.localidadEmpresa}
							disabled={disabled.domicilioLocalidadesId ?? false}
							onChange={(value, _id) => (
								onChange({ domicilioLocalidadesId: value.value }),
								onChange({ localidadNombre: value.label }),
								setLocalidades(...localidades, {localidadEmpresa: {label: value.label}})
								)}
							
							options={localidades.options}
					
							onTextChange={handlerOnTextChange}
							required
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
						<Grid grow>
							<InputMaterial
								id="email2"
								name="email2"
								label="Email Secundario"
								error={!!errors.email2}
								helperText={errors.email2 ?? ""}
								value={data.email2}
								disabled={disabled.email2}
								onChange={(email2) => onChange({ email2 })}
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
