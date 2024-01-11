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

	console.log('EmpresasForm_data:',data)
	console.log('EmpresasForm_errors:',errors)

	useEffect(() => {
		validarEmpresaCUITHandler();
	},[])

	useEffect(()=> {
				
		if (data?.cuit?.length !== 11) return;

		if (!ValidarCUIT(data?.cuit ?? 0)) {
			errors.cuit = 'CUIT Incorrecto';
			return;
		}

		validarEmpresaCUITHandler();

	},[data.cuit])

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
		provinciaSelected: {value: data?.domicilioProvinciasId ?? 0, label: data?.provinciaDescripcion}, 
		data: [], //TODAS LAS EMPRESAS
		options: [], //DEPENDE DEL CAMPO "BUSCAR", si tiene algo ese campo, voy filtrando las OPTIONS
		buscar: "",
		error: null,
	});

	const handlerOnTextChange = (event) => {

		console.log('event_handlerOnTextChange',event);
		
		setProvincias(...provincias, {provinciaSelected: {value:event.target.value}})
		setProvincias(...provincias, {buscar: event.target.value})
		
	  };



	useEffect(() => {

		if (!provincias.loading) return;
		const changes = {
			loading: null,
			provinciaSelected: {},
			data: [],
			options: [],
			buscar: "",
			error: null,
		};
		pushQuery({
			action: "GetProvincias",
			onOk: async (ok) => {
				console.log('provincias_data--:',ok)
				if (!Array.isArray(ok))
					return console.error("Se esperaba un arreglo", { GetProvincias: data });
				changes.data.push(...ok);
				changes.options.push(...ok.map((provincia) => getProvinciaOption(provincia))); //le doy formato al OPTION que voy a mostrar
				changes.provinciaSelected = {value: data?.domicilioProvinciasId ?? 0, label: ok.find((p)=> p.id === data?.domicilioProvinciasId)?.nombre}
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setProvincias((o) => ({ ...o, ...changes })),
		});
	}, [provincias, pushQuery]);
	//#endregion


	
	//#region Localidades
	const [localidades, setLocalidades] = useState({
		loading: "Cargando localidades...",
		localidadSelected: {value: data?.domicilioLocalidadesId ?? 0, label: data?.localidadDescripcion},
		data: [], //TODAS LAS localidades de la provincia
		options: [], //DEPENDE DEL CAMPO "BUSCAR", si tiene algo ese campo, voy filtrando las OPTIONS
		buscar: "",
		error: null,
	});

	useEffect(() => {

		if (!localidades.loading) return;
		if (!data?.domicilioProvinciasId || data?.domicilioProvinciasId === 0) return;

		const changes = {
			loading: null,
			localidadSelected: {},
			data: [],
			options: [],
			buscar: "",
			error: null,
		};
		pushQuery({
			action: "GetLocalidades",
			params: { ProvinciaId:  data?.domicilioProvinciasId, SoloActivos: true },
			onOk: async (ok) => {
				console.log('localidades_data:',ok)
				if (!Array.isArray(ok))
					return console.error("Se esperaba un arreglo", { GetLocalidades: ok });
				changes.data.push(...ok);
				changes.options.push(...ok.map((localidad) => getLocalidadOption(localidad))); //le doy formato al OPTION que voy a mostrar
				changes.localidadSelected = {value: data?.domicilioLocalidadesId ?? 0, label: ok?.find((p)=> p.id === data?.domicilioLocalidadesId)?.nombre}				
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
		if (data.actividadPrincipalId === actividadPrincipal.selected.value) return;
		const cambios = {
			actividadPrincipalId: actividadPrincipal.selected.value,
		};
		cambios.actividadPrincipalDescripcion =
			ciius.data.find((r) => r.ciiu === cambios.actividadPrincipalId)
				?.descripcion ?? "";
		onChange(cambios);
	}, [actividadPrincipal.selected, ciius, data.actividadPrincipalId, onChange]);
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
		if (data.ciiU1 === ciiu1.selected.value) return;

		const cambios = {
			ciiu1: ciiu1.selected.value,
		};
		cambios.ciiU1Descripcion =
			ciius.data.find((r) => r.ciiu === cambios.ciiu1)
				?.descripcion ?? "";
		onChange(cambios);

	}, [ciiu1.selected, ciius, data.ciiU1]);
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
	}, [ciiu2.selected, ciius, data.ciiU2]);
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
	}, [ciiu3.selected, ciius, data.ciiU3]);
	//#endregion

	//#endregion

	const [validacionCUIT, setValidacionCUIT] = useState({
		loading: false,
		validado: "Se creará la Empresa",
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
			domicilioProvinciasId: null,
			domicilioLocalidadesId: null,

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
					changes.datoAFIP = `Dato AFIP:  ${ok.domicilios[0]?.codigoPostal} ${ok.domicilios[0]?.localidad}`
					onChange({
						existe: true,
						cuit: ok.cuit,
						razonSocial: ok.razonSocial,

						actividadPrincipalId: ok.idActividadPrincipal,
						actividadPrincipalDescripcion: ok?.descripcionActividadPrincipal,

						domicilioProvinciasId: provincias?.data.find((p)=> p.idProvinciaAFIP === ok?.domicilios[0]?.idProvincia)?.id,
						domicilioCalle: ok.domicilios[0].direccion,
						domicilioNumero: ok.domicilios[0].numero,
						domicilioPiso: ok.domicilios[0].piso,
						domicilioDpto: ok.domicilios[0].oficinaDptoLocal,

						telefono: ok.telefono,
						email: ok.email,
						email2: ok.email2,

						ciiU1: ok.ciiU1,
						ciiU1Descripcion: ok.ciiU1Descripcion,

						ciiU2: ok.ciiU2,
						ciiU2Descripcion: ok.ciiU2Descripcion,

						ciiU3: ok.ciiU3,
						ciiU3Descripcion: ok.ciiU3Descripcion,

					});
					setProvincias((o) => ({ 
						...o,
						provinciaSelected: {value: provincias?.data?.find((p)=> p?.idProvinciaAFIP === ok?.domicilios[0].idProvincia)?.id, label:  provincias?.data?.find((p)=> p?.idProvinciaAFIP === ok?.domicilios[0]?.idProvincia)?.nombre }
					   }));

					setActividadPrincipal((o) => ({
						...o,
						selected:
							ciius.options.find((r) => r.value === ok.idActividadPrincipal) ??
							getCIIUOption({
								ciiu: ok.idActividadPrincipal,
								descripcion: ok.descripcionActividadPrincipal,
							}),
					}))

					setCIIU1((o) => ({
						...o,
						selected:
							ciius.options.find((r) => r.value === ok.ciiU1) ??
							getCIIUOption({
								ciiu: ok.ciiU1,
								descripcion: ok.ciiU1Descripcion,
							}),
					}))
					setCIIU2((o) => ({
						...o,
						selected:
							ciius.options.find((r) => r.value === ok.ciiU2) ??
							getCIIUOption({
								ciiu: ok.ciiU2,
								descripcion: ok.ciiU2Descripcion,
							}),
					}))
					setCIIU3((o) => ({
						...o,
						selected:
							ciius.options.find((r) => r.value === ok.ciiU3) ??
							getCIIUOption({
								ciiu: ok.ciiU3,
								descripcion: ok.ciiU3Descripcion,
							}),
					}))

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
				changes.validado = "Empresa existente (UATRE)";
				changes.datoAFIP = "";
				//provinciaSelected: {value: data?.domicilioProvinciasId ?? 0, label: data?.provinciaNombre}, setProvincias(...provincias, {provinciaSelected: {value:event.target.value}})

				onChange({
					existe: true,
					cuit: ok.cuit,
					razonSocial: ok.razonSocial,
					actividadPrincipalId: ok.actividadPrincipalId,
					actividadPrincipalDescripcion: ok?.actividadPrincipalDescripcion,

					domicilioProvinciasId: ok.domicilioProvinciasId,
					domicilioLocalidadesId: ok.domicilioLocalidadesId,

					domicilioCalle: ok.domicilioCalle,
					domicilioNumero: ok.domicilioNro,
					domicilioPiso: ok.domicilioPiso,
					domicilioDpto: ok.domicilioDpto,
					telefono: ok.telefono,
					email: ok.email,
					email2: ok.email2,
					
					ciiU1: ok.ciiU1,
					ciiU1Descripcion: ok.ciiU1Descripcion,

					ciiU2: ok.ciiU2,
					ciiU2Descripcion: ok.ciiU2Descripcion,

					ciiU3: ok.ciiU3,
					ciiU3Descripcion: ok.ciiU3Descripcion,
				});

				setProvincias((o) => ({ 
					 ...o,
					 provinciaSelected: {value: ok?.domicilioProvinciasId, label:  provincias?.data?.find((c) => c.id === ok?.domicilioProvinciasId)?.nombre }
					}));

				setActividadPrincipal((o) => ({
					...o,
					selected:
						ciius.options.find((r) => r.value === ok.actividadPrincipalId) ??
						getCIIUOption({
							ciiu: ok.actividadPrincipalId,
							descripcion: ok.actividadPrincipalDescripcion,
						}),
				}))
				setCIIU1((o) => ({
					...o,
					selected:
						ciius.options.find((r) => r.value === ok.ciiU1) ??
						getCIIUOption({
							ciiu: ok.ciiU1,
							descripcion: ok.ciiU1Descripcion,
						}),
				}))
				setCIIU2((o) => ({
					...o,
					selected:
						ciius.options.find((r) => r.value === ok.ciiU2) ??
						getCIIUOption({
							ciiu: ok.ciiU2,
							descripcion: ok.ciiU2Descripcion,
						}),
				}))
				setCIIU3((o) => ({
					...o,
					selected:
						ciius.options.find((r) => r.value === ok.ciiU3) ??
						getCIIUOption({
							ciiu: ok.ciiU3,
							descripcion: ok.ciiU3Descripcion,
						}),
				}))
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
						<Grid width="270px">
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
									//disabled={!(data?.cuit?.length === 11)}
									disabled={(data?.cuit?.length === 11) || (errors.cuit !== "")}
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
