import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CUITMask } from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

/**
 * Proceso a ejecutar posterior carga
 * @param {object} changes datos posterior carga
 * @param {array} changes.data datos obtenidos en la carga
 * @param {object} changes.error error durante la carga
 */
const onLoadedDef = ({ data, error }) => {};

const getCIIULabel = (ciiu) =>
	[ciiu?.ciiu ?? "", ciiu?.descripcion ?? ""]
		.filter((r) => r !== null)
		.join(" - ");

const getCIIUOption = (ciiu) =>
	ciiu
		? {
				value: ciiu.ciiu,
				label: getCIIULabel(ciiu),
		  }
		: null;

const getProvinciaOption = (provincia) =>
	provincia
		? {
				value: provincia.id,
				label: provincia.nombre,
		  }
		: null;

const getLocalidadOption = (localidad) =>
	localidad
		? {
				value: localidad.id,
				label: localidad.nombre,
		  }
		: null;

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

			case "ConsultaAFIP":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/AFIPConsulta",
						method: "GET",
					},
				};

			case "GetProvincias":
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Provincia`,
						method: "GET",
					},
				};
			case "GetLocalidades":
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/RefLocalidad`,
						method: "GET",
					},
				};

			default:
				return null;
		}
	});
	//#endregion

	//#region Provincias
	const [provincias, setProvincias] = useState({
		loading: "Cargando provincias...",
		data: [], //TODAS LAS EMPRESAS
		options: [], //DEPENDE DEL CAMPO "BUSCAR", si tiene algo ese campo, voy filtrando las OPTIONS
		buscar: "",
		error: null,
		selected: getProvinciaOption({
			id: data.domicilioProvinciasId ?? 0,
			nombre: data.provinciaDescripcion,
		}),
		onLoaded: onLoadedDef,
	});
	useEffect(() => {
		if (!provincias.loading) return;
		const changes = {
			loading: null,
			data: [],
			options: [],
			error: null,
			onLoaded: onLoadedDef,
		};
		pushQuery({
			action: "GetProvincias",
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", {
						GetProvincias: data,
					});
				changes.data = data;
				changes.options = data.map((r) => getProvinciaOption(r)); //le doy formato al OPTION que voy a mostrar
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => {
				provincias.onLoaded(changes);
				setProvincias((o) => ({ ...o, ...changes }));
			},
		});
	}, [provincias, pushQuery]);
	// Cambia data, refresca select
	useEffect(() => {
		if (provincias.loading) return;
		if ((data.domicilioProvinciasId ?? 0) === (provincias.selected.value ?? 0))
			return;
		setProvincias((o) => ({
			...o,
			selected: getProvinciaOption(
				o.data.find((r) => r.id === data.domicilioProvinciasId) ?? {
					id: data.domicilioProvinciasId ?? 0,
					nombre: data.provinciaDescripcion ?? "",
				}
			),
		}));
	}, [provincias, data.domicilioProvinciasId, data.provinciaDescripcion]);
	//#endregion

	//#region Localidades
	const [localidades, setLocalidades] = useState({
		loading: "Cargando localidades...",
		params: { provinciaId: data.domicilioProvinciasId },
		data: [], //TODAS LAS localidades de la provincia
		options: [], //DEPENDE DEL CAMPO "BUSCAR", si tiene algo ese campo, voy filtrando las OPTIONS
		buscar: "",
		error: null,
		selected: getLocalidadOption({
			id: data.domicilioLocalidadesId ?? 0,
			nombre: data.localidadDescripcion ?? "",
		}),
		onLoaded: onLoadedDef,
	});
	useEffect(() => {
		if (!localidades.loading) return;
		const changes = {
			loading: null,
			data: [],
			options: [],
			error: null,
			onLoaded: onLoadedDef,
		};
		pushQuery({
			action: "GetLocalidades",
			params: { ...localidades.params, SoloActivos: true },
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", {
						GetLocalidades: data,
					});
				changes.data = data;
				changes.options = data.map((r) => getLocalidadOption(r)); //le doy formato al OPTION que voy a mostrar
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => {
				localidades.onLoaded(changes);
				setLocalidades((o) => ({ ...o, ...changes }));
			},
		});
	}, [localidades, pushQuery]);
	// Cambia data, refresca select
	useEffect(() => {
		if (localidades.loading) return;
		if (
			(data.domicilioLocalidadesId ?? 0) === (localidades.selected.value ?? 0)
		)
			return;
		setLocalidades((o) => ({
			...o,
			selected: getLocalidadOption(
				o.data.find((r) => r.id === data.domicilioLocalidadesId) ?? {
					id: data.domicilioLocalidadesId ?? 0,
					nombre: data.localidadDescripcion ?? "",
				}
			),
		}));
	}, [localidades, data.domicilioLocalidadesId, data.localidadDescripcion]);
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
				changes.data = data.filter(
					(v, i, a) => a.indexOf(a.find((r) => r.ciiu === v.ciiu)) === i
				);
				changes.options = data.map((ciiu) => getCIIUOption(ciiu));
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
							.toLowerCase()
							.includes(actividadPrincipal.buscar.toLowerCase())
					: true
			)
			.map((r) => getCIIUOption(r));
		setActividadPrincipal((o) => ({ ...o, options }));
	}, [ciius, actividadPrincipal.buscar]);
	// Cambia data, refresca select
	useEffect(() => {
		if (ciius.loading) return;
		setActividadPrincipal((o) => ({
			...o,
			selected: getCIIUOption(
				ciius.data.find((r) => r.ciiu === data.actividadPrincipalId) ?? {
					ciiu: data.actividadPrincipalId ?? 0,
					descripcion: data.actividadPrincipalDescripcion ?? "",
				}
			),
		}));
	}, [ciius, data.actividadPrincipalId, data.actividadPrincipalDescripcion]);
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
					? getCIIULabel(r).toLowerCase().includes(ciiu1.buscar.toLowerCase())
					: true
			)
			.map((r) => getCIIUOption(r));
		setCIIU1((o) => ({ ...o, options }));
	}, [ciius, ciiu1.buscar]);
	// Cambia data, refresca select
	useEffect(() => {
		if (ciius.loading) return;
		setCIIU1((o) => ({
			...o,
			selected: getCIIUOption(
				ciius.data.find((r) => r.ciiu === data.ciiU1) ?? {
					ciiu: data.ciiU1 ?? 0,
					descripcion: data.ciiU1Descripcion ?? "",
				}
			),
		}));
	}, [ciius, data.ciiU1, data.ciiU1Descripcion]);
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
					? getCIIULabel(r).toLowerCase().includes(ciiu2.buscar.toLowerCase())
					: true
			)
			.map((r) => getCIIUOption(r));
		setCIIU2((o) => ({ ...o, options }));
	}, [ciius, ciiu2.buscar]);
	// Cambia data, refresca select
	useEffect(() => {
		if (ciius.loading) return;
		setCIIU2((o) => ({
			...o,
			selected: getCIIUOption(
				ciius.data.find((r) => r.ciiu === data.ciiU2) ?? {
					ciiu: data.ciiU2 ?? 0,
					descripcion: data.ciiU2Descripcion ?? "",
				}
			),
		}));
	}, [ciius, data.ciiU2, data.ciiU2Descripcion]);
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
					? getCIIULabel(r).toLowerCase().includes(ciiu3.buscar.toLowerCase())
					: true
			)
			.map((r) => getCIIUOption(r));
		setCIIU3((o) => ({ ...o, options }));
	}, [ciius, ciiu3.buscar]);
	// Cambia data, refresca select
	useEffect(() => {
		if (ciius.loading) return;
		setCIIU3((o) => ({
			...o,
			selected: getCIIUOption(
				ciius.data.find((r) => r.ciiu === data.ciiU3) ?? {
					ciiu: data.ciiU3 ?? 0,
					descripcion: data.ciiU3Descripcion ?? "",
				}
			),
		}));
	}, [ciius, data.ciiU3, data.ciiU3Descripcion]);
	//#endregion

	//#endregion

	useEffect(() => {
		const changes = {};
		if (data.telefono == null) changes.telefono = "+54 9"
		if (Object.entries(changes).length === 0) return;
		onChange(changes);
	}, [onChange, data])

	const [validacionCUIT, setValidacionCUIT] = useState({
		loading: false,
		validado: "",
		datoAFIP: "",
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
			pushQuery({
				action: "ConsultaAFIP",
				params: { cuit: data.cuit, VerificarHistorico: false },
				onOk: async (ok) => {
					changes.validado = "Se creará la Empresa";
					changes.datoAFIP = `Dato AFIP:  ${ok.domicilios[0]?.codigoPostal} ${ok.domicilios[0]?.localidad}`;
					const provincia = provincias.data.find(
						(p) => p.idProvinciaAFIP === ok?.domicilios[0]?.idProvincia
					);
					onChange({
						existe: true,
						cuit: ok.cuit,
						razonSocial: ok.razonSocial ?? "",

						actividadPrincipalId: ok.idActividadPrincipal ?? 0,
						actividadPrincipalDescripcion:
							ok.descripcionActividadPrincipal ?? "",

						domicilioCalle: ok.domicilios[0].direccion ?? "",
						domicilioNumero: ok.domicilios[0].numero ?? "",
						domicilioPiso: ok.domicilios[0].piso ?? "",
						domicilioDpto: ok.domicilios[0].oficinaDptoLocal ?? "",
						telefono: ok.telefono ?? "",
						email: ok.email ?? "",
						email2: ok.email2 ?? "",

						ciiU1: ok.ciiU1 ?? 0,
						ciiU1Descripcion: ok.ciiU1Descripcion ?? "",

						ciiU2: ok.ciiU2 ?? 0,
						ciiU2Descripcion: ok.ciiU2Descripcion ?? "",

						ciiU3: ok.ciiU3 ?? 0,
						ciiU3Descripcion: ok.ciiU3Descripcion ?? "",
					});
					setLocalidades((o) => ({
						...o,
						params: { provinciaId: provincia?.id },
						loading: "Cargando localidades...",
						onLoaded: ({ data }) => {
							const localidad = data.find(
								(r) => r.id === data.domicilioLocalidadesId
							);
							const changes = {
								domicilioProvinciasId: provincia?.id,
								provinciaDescripcion: provincia?.nombre,
							};
							if (!localidad) {
								changes.domicilioLocalidadesId = 0;
								changes.localidadDescripcion = "";
							}
							onChange(changes);
						},
					}));
				},
				onFinally: async () => {
					changes.loading = false;
					setValidacionCUIT((o) => ({ ...o, ...changes }));
				},
			});
		};

		pushQuery({
			action: "GetEmpresa",
			params: { cuit: data.cuit, soloActivos: true },
			onOk: async (ok) => {
				changes.validado = "Empresa existente (UATRE)";
				changes.datoAFIP = "";

				onChange({
					existe: true,
					cuit: ok.cuit,
					razonSocial: ok.razonSocial ?? "",
					actividadPrincipalId: ok.actividadPrincipalId ?? 0,
					domicilioCalle: ok.domicilioCalle ?? "",
					domicilioNumero: ok.domicilioNro ?? "",
					domicilioPiso: ok.domicilioPiso ?? "",
					domicilioDpto: ok.domicilioDpto ?? "",

					domicilioProvinciasId: ok.domicilioProvinciasId ?? 0,
					provinciaDescripcion: ok.provinciaDescripcion ?? "",

					domicilioLocalidadesId: ok.domicilioLocalidadesId ?? 0,
					localidadDescripcion: ok.localidadDescripcion ?? "",

					telefono: ok.telefono ?? "",
					email: ok.email ?? "",
					email2: ok.email2 ?? "",

					ciiU1: ok.ciiU1 ?? 0,
					ciiU1Descripcion: ok.ciiU1Descripcion ?? "",

					ciiU2: ok.ciiU2 ?? 0,
					ciiU2Descripcion: ok.ciiU2Descripcion ?? "",

					ciiU3: ok.ciiU3 ?? 0,
					ciiU3Descripcion: ok.ciiU3Descripcion ?? "",
				});
			},
			onError: async (error) => validaAFIP(),
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
		<Modal show /*onHide={() => onClose()}*/ size="lg" centered>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				<h3>{title}</h3>
			</Modal.Header>
			<Modal.Body>
				<Grid col width="full" gap="15px">
					<Grid width="full" gap="inherit">
						<Grid width="270px">
							<Grid width="full">
								<InputMaterial
									id="cuitEmpresa"
									label="CUIT"
									//mask="99-99.999.999-9"
									mask={CUITMask}
									required
									error={!!errors.cuit}
									helperText={
										errors.cuit ? errors.cuit : validacionCUIT.validado
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
									disabled={`${data.cuit ?? ""}`.length !== 11 || errors.cuit}
									onClick={validarEmpresaCUITHandler}
									loading={validacionCUIT.loading}
								>
									<h6>{!validacionCUIT.loading ? `Valida` : ` `}</h6>
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

					<Grid width gap="inherit">
						<Grid col width>
							<SearchSelectMaterial
								id="domicilioProvinciasId"
								name="domicilioProvinciasId"
								label="Provincia"
								error={!!errors.domicilioProvinciasId}
								helperText={errors.domicilioProvinciasId ?? ""}
								value={provincias.selected}
								disabled={disabled.domicilioProvinciasId ?? false}
								onChange={({ value, label }) => {
									if (value === data.domicilioProvinciasId) return;
									setLocalidades((o) => ({
										...o,
										loading: "Cargando localidades...",
										params: { provinciaId: value },
										onLoaded: ({ data }) => {
											const localidad = data.find(
												(r) => r.id === data.domicilioLocalidadesId
											);
											const changes = {
												domicilioProvinciasId: value,
												provinciaNombre: label,
											};
											if (!localidad) {
												changes.domicilioLocalidadesId = 0;
												changes.localidadDescripcion = "";
											}
											onChange(changes);
										},
									})); //hago esto para que me filtre las localidades de la provincia seleccionada.
								}}
								options={provincias.options}
								onTextChange={(buscar) =>
									setProvincias((o) => ({ ...o, buscar }))
								}
								required
							/>
						</Grid>

						<Grid width>
							<SearchSelectMaterial
								id="domicilioLocalidadesId"
								name="domicilioLocalidadesId"
								label="Localidad"
								error={!!errors.domicilioLocalidadesId}
								helperText={[
									errors.domicilioLocalidadesId,
									validacionCUIT.datoAFIP,
								]
									.filter((r) => r)
									.join("\n")}
								value={localidades.selected}
								disabled={disabled.domicilioLocalidadesId ?? false}
								onChange={({ value, label }) => {
									if (value === data.domicilioLocalidadesId) return;
									onChange({
										domicilioLocalidadesId: value,
										localidadNombre: label,
									});
								}}
								options={localidades.options}
								onTextChange={(buscar) =>
									setLocalidades((o) => ({ ...o, buscar }))
								}
								required
							/>
						</Grid>
						<Grid width>
							<InputMaterial
								id="telefono"
								label="Teléfono"
								type="tel"
								error={!!errors.telefono}
								helperText={errors.telefono ?? ""}
								value={data.telefono}
								disabled={disabled.telefono ?? false}
								onChange={(telefono) => onChange({ telefono })}
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width>
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
						<Grid width>
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
								onChange={({ value }) => {
									const ciiu = ciius.data.find((r) => r.ciiu === value);
									onChange({
										actividadPrincipalId: ciiu.ciiu,
										actividadPrincipalDescripcion: ciiu.descripcion,
									});
								}}
								options={actividadPrincipal.options}
								onTextChange={(buscar) =>
									setActividadPrincipal((o) => ({ ...o, buscar }))
								}
								required
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
								onChange={({ value }) => {
									const ciiu = ciius.data.find((r) => r.ciiu === value);
									onChange({
										ciiU1: ciiu.ciiu,
										ciiU1Descripcion: ciiu.descripcion,
									});
								}}
								options={ciiu1.options}
								onTextChange={(buscar) => setCIIU1((o) => ({ ...o, buscar }))}
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
									ciius.loading ?? ciius.error?.message ?? errors.ciiU2 ?? ""
								}
								value={ciiu2.selected}
								disabled={disabled.ciiU2 ?? false}
								onChange={({ value }) => {
									const ciiu = ciius.data.find((r) => r.ciiu === value);
									onChange({
										ciiU2: ciiu.ciiu,
										ciiU2Descripcion: ciiu.descripcion,
									});
								}}
								options={ciiu2.options}
								onTextChange={(buscar) => setCIIU2((o) => ({ ...o, buscar }))}
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
								onChange={({ value }) => {
									const ciiu = ciius.data.find((r) => r.ciiu === value);
									onChange({
										ciiU3: ciiu.ciiu,
										ciiU3Descripcion: ciiu.descripcion,
									});
								}}
								options={ciiu3.options}
								onTextChange={(buscar) => setCIIU3((o) => ({ ...o, buscar }))}
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
