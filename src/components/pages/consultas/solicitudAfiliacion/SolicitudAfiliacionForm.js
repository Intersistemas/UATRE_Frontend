import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import Formato from "components/helpers/Formato";
import { flatten } from "components/helpers/Utils";
import useAuditoriaProceso from "components/hooks/useAuditoriaProceso";
import useQueryState from "components/hooks/useQueryState";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, {
	CUITMask,
	DNIMask,
} from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	mapOptions,
	includeSearch,
} from "components/ui/Select/SearchSelectMaterial";
import ValidarCUIT from "components/validators/ValidarCUIT";
import ValidarEmail from "components/validators/ValidarEmail";
import useSolicitudAfiliacion from "./SolicitudAfiliacion";

const styles = {
	group: {
		padding: "5px",
		color: "#186090",
		textAlign: "left",
		border: "solid 1px",
		borderRadius: "20px",
	},
	titulo: {
		fontWeight: "bold",
		textAlign: "left",
		borderBottom: "dashed 1px",
	},
};

//#region options

//#region tipoDocumentoSelect Options
const tipoDocumentoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion tipoDocumentoSelect Options

//#region nacionalidadSelect Options
const nacionalidadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion nacionalidadSelect Options

//#region estadoCivilSelect Options
const estadoCivilSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion estadoCivilSelect Options

//#region sexoSelect Options
const sexoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion sexoSelect Options

//#region provinciaSelect Options
const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion provinciaSelect Options

//#region localidadSelect Options
const localidadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.codPostal, r.nombre].join(" - "),
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion localidadSelect Options

//#region ciiuSelect Options
const ciiuSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.ciiu, r.descripcion].join(" - "),
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion ciiuSelect Options

//#region oficioSelect Options
const oficioSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: r.cargo,
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion oficioSelect Options

//#region actividadSelect Options
const actividadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: r.descripcion,
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion actividadSelect Options

//#endregion options

const SolicitudAfiliacionForm = ({ onClose = () => {} }) => {
	//#region APIs
	const { setState: setTiposDocumentosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/TipoDocumento`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setNacionalidadesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Nacionalidad`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setEstadosCivilesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/EstadoCivil`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setSexosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Sexo`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setProvinciasQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Provincia`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setLocalidadesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/RefLocalidad`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setOficiosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/RefCargo/GetAll`,
				method: "GET",
			},
		}),
		{
			query: {
				params: { soloActivos: true },
				config: { errorType: "response" },
			},
		}
	);
	const { setState: setActividadesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Actividad`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { state: padronAFIPQuery, setState: setPadronAFIPQuery } =
		useQueryState(
			() => ({
				config: {
					baseURL: "Comunes",
					endpoint: `/AFIPConsulta`,
					method: "GET",
				},
			}),
			{
				query: {
					params: { verificarHistorico: false },
					config: { errorType: "response" },
				},
			}
		);
	const { setState: setCIIUsQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/RefCIIU`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	//#endregion APIs

	const [state, setState] = useState({
		form: {
			fecha: dayjs().format("YYYY-MM-DD"),
			trabajador: {},
			empleador: {},
		},
		errors: {
			trabajador: {},
			empleador: {},
		},
		base64: null,
	});

	const { audit } = useAuditoriaProceso();

	//#region selects

	//#region selects trabajador

	//#region select tipo documento
	const [tipoDocumentoSelect, setTipoDocumentoSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});

	// Buscador
	useEffect(() => {
		setTipoDocumentoSelect((o) => ({
			...o,
			options: tipoDocumentoSelectOptions(o),
		}));
	}, [tipoDocumentoSelect.buscar, tipoDocumentoSelect.data]);
	//#endregion select tipo documento

	//#region select nacionalidad
	const [nacionalidadSelect, setNacionalidadSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});

	// Buscador
	useEffect(() => {
		setNacionalidadSelect((o) => ({
			...o,
			options: nacionalidadSelectOptions(o),
		}));
	}, [nacionalidadSelect.buscar, nacionalidadSelect.data]);
	//#endregion select nacionalidad

	//#region select estado civil
	const [estadoCivilSelect, setEstadoCivilSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setEstadoCivilSelect((o) => ({
			...o,
			options: estadoCivilSelectOptions(o),
		}));
	}, [estadoCivilSelect.buscar, estadoCivilSelect.data]);
	//#endregion select estado civil

	//#region select sexo
	const [sexoSelect, setSexoSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setSexoSelect((o) => ({
			...o,
			options: sexoSelectOptions(o),
		}));
	}, [sexoSelect.buscar, sexoSelect.data]);
	//#endregion select sexo

	//#region select provincia
	const [trabPciaSelect, setTrabPciaSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setTrabPciaSelect((o) => ({
			...o,
			options: provinciaSelectOptions(o),
		}));
	}, [trabPciaSelect.buscar, trabPciaSelect.data]);
	//#endregion select provincia

	//#region select localidad
	const [trabLocaSelect, setTrabLocaSelect] = useState({
		loading: "",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setTrabLocaSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn = record.codPostal
					? (o) => o.record.codPostal === record.codPostal
					: (o) => includeSearch(o, record.nombre);
				selected = options.find(findFn) ?? selected;
			}
			return { ...o, options, selected };
		});
	}, [trabLocaSelect.buscar, trabLocaSelect.data]);
	//#endregion select localidad

	//#region select oficio
	const [oficioSelect, setOficioSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setOficioSelect((o) => ({
			...o,
			options: oficioSelectOptions(o),
		}));
	}, [oficioSelect.buscar, oficioSelect.data]);
	//#endregion select sexo

	//#region select actividad
	const [actividadSelect, setActividadSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setActividadSelect((o) => ({
			...o,
			options: actividadSelectOptions(o),
		}));
	}, [actividadSelect.buscar, actividadSelect.data]);
	//#endregion select actividad

	//#endregion selects trabajador

	//#region selects empleador

	//#region select provincia
	const [emplPciaSelect, setEmplPciaSelect] = useState({
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setEmplPciaSelect((o) => ({
			...o,
			options: provinciaSelectOptions(o),
		}));
	}, [emplPciaSelect.buscar, emplPciaSelect.data]);
	//#endregion select provincia

	//#region select localidad
	const [emplLocaSelect, setEmplLocaSelect] = useState({
		loading: "",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setEmplLocaSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn = record.codPostal
					? (o) => o.record.codPostal === record.codPostal
					: (o) => includeSearch(o, record.nombre);
				selected = options.find(findFn) ?? selected;
			}
			return { ...o, options, selected };
		});
	}, [emplLocaSelect.buscar, emplLocaSelect.data]);
	//#endregion select localidad

	//#region select ciiu
	const [ciiuSelect, setCiiuSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
	});
	// Buscador
	useEffect(() => {
		setCiiuSelect((o) => ({
			...o,
			options: ciiuSelectOptions(o),
		}));
	}, [ciiuSelect.buscar, ciiuSelect.data]);
	//#endregion select ciiu

	//#endregion selects empleador

	//#endregion selects

	//#region inicializaciones

	//#region Carga inicial select tipo documento
	useEffect(() => {
		setTiposDocumentosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setTipoDocumentoSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setTiposDocumentosQuery]);
	//#endregion Carga inicial select tipo documento

	//#region Carga inicial select nacionalidad
	useEffect(() => {
		setNacionalidadesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setNacionalidadSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setNacionalidadesQuery]);
	//#endregion Carga inicial select nacionalidad

	//#region Carga inicial select estado civil
	useEffect(() => {
		setEstadosCivilesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setEstadoCivilSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setEstadosCivilesQuery]);
	//#endregion Carga inicial select estado civil

	//#region Carga inicial select sexo
	useEffect(() => {
		setSexosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setSexoSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setSexosQuery]);
	//#endregion Carga inicial select sexo

	//#region Carga inicial selects provincias
	useEffect(() => {
		setProvinciasQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				const changes = {
					data,
					loading: null,
					error: error?.toString(),
				};
				setTrabPciaSelect((o) => ({ ...o, ...changes }));
				setEmplPciaSelect((o) => ({ ...o, ...changes }));
			},
		}));
	}, [setProvinciasQuery]);
	//#endregion Carga inicial selects provincias

	//#region Carga inicial selects oficios
	useEffect(() => {
		setOficiosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setOficioSelect((o) => ({
					...o,
					data,
					loading: null,
					error: error?.toString(),
				}));
			},
		}));
	}, [setOficiosQuery]);
	//#endregion Carga inicial selects oficios

	//#region Carga inicial selects actividades
	useEffect(() => {
		setActividadesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setActividadSelect((o) => ({
					...o,
					data,
					loading: null,
					error: error?.toString(),
				}));
			},
		}));
	}, [setActividadesQuery]);
	//#endregion Carga inicial selects actividades

	//#region Carga inicial select ciiu
	useEffect(() => {
		setCIIUsQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setCiiuSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setCIIUsQuery]);
	//#endregion Carga inicial select ciiu

	//#endregion inicializaciones

	const { request: solicitudAfiliacion } = useSolicitudAfiliacion();

	let content = null;
	if (state.base64) {
		content = (
			<Grid
				full
				src={state.base64}
				style={{ minHeight: "70vh" }}
				render={(x) => <iframe title="SolicitudAfiliacion.pdf" {...x} />}
			/>
		);
	} else {
		content = (
			<Grid full col gap="10px">
				<Grid width gap="inherit">
					<Grid width>
						<InputMaterial
							type="number"
							label="Seccional Nro"
							value={state.form.seccionalNro}
							error={!!state.errors.seccionalNro}
							helperText={state.errors.seccionalNro}
							onChange={(seccionalNro) =>
								setState((o) => ({ ...o, form: { ...o.form, seccionalNro } }))
							}
						/>
					</Grid>
					<Grid width>
						<InputMaterial
							type="date"
							label="Fecha"
							value={state.form.fecha}
							error={state.errors.fecha}
							onChange={(v) =>
								setState((o) => ({
									...o,
									form: { ...o.form, fecha: v?.format("YYYY-MM-DD") },
								}))
							}
						/>
					</Grid>
				</Grid>
				<Grid col width gap="inherit" style={styles.group}>
					<Grid width style={styles.titulo}>
						Trabajador
					</Grid>
					<Grid col gap="inherit">
						<Grid gap="inherit">
							<Grid width="200px">
								<InputMaterial
									mask={CUITMask}
									label="CUIL"
									value={state.form.trabajador.cuil}
									error={!!state.errors.trabajador.cuil}
									helperText={state.errors.trabajador.cuil}
									onChange={(v) =>
										setState((o) => ({
											...o,
											form: {
												...o.form,
												trabajador: {
													...o.form.trabajador,
													cuil: v.replace(/[^0-9]+/g, ""),
												},
											},
										}))
									}
								/>
							</Grid>
							<Grid col width="100px">
								<Button
									className="botonAzul"
									onClick={() => {
										const changes = {
											trabajador: {},
											errors: {
												cuil: "",
											},
										};
										const cuit = state.form.trabajador.cuil;
										const apply = () =>
											setState((o) => ({
												...o,
												form: {
													...o.form,
													trabajador: {
														...o.form.trabajador,
														...changes.trabajador,
													},
												},
												errors: {
													...o.errors,
													trabajador: {
														...o.errors.trabajador,
														...changes.errors,
													},
												},
											}));
										if (cuit) {
											setPadronAFIPQuery((o) => ({
												...o,
												loading: "Trabajador",
												query: {
													...o.query,
													params: { ...o.query.params, cuit },
												},
												onLoad: ({ ok, error }) => {
													if (error) {
														if (error.code === 404) {
															changes.errors.cuil = "No existe en AFIP";
														} else {
															changes.errors.cuil = error.toString();
															//ToDo: Auditar
														}
													} else {
														//ToDo: Cargar datos AFIP
														changes.trabajador.apellidos = ok.apellido;
														changes.trabajador.nombres = ok.nombre;
														changes.trabajador.fechaNacimiento =
															`${ok.fechaNacimiento}`.slice(0, 10);
														setTipoDocumentoSelect((o) => ({
															...o,
															selected:
																o.options.find(
																	(r) => r.label === ok.tipoDocumento
																) ?? {},
														}));
														changes.trabajador.numeroDocumento =
															ok.numeroDocumento;
														if (ok.domicilios?.length) {
															const domicilio =
																ok.domicilios.find(
																	(r) => r.tipoDomicilio === "LEGAL/REAL"
																) ?? ok.domicilios[0];
															changes.trabajador.domicilio =
																domicilio.direccion;
															const pcia = trabPciaSelect.options.find(
																(r) =>
																	r.record.idProvinciaAFIP ===
																	domicilio.idProvincia
															);
															setTrabPciaSelect((o) => ({
																...o,
																selected: pcia,
															}));

															setLocalidadesQuery((o) => ({
																...o,
																query: {
																	...o.query,
																	params: {
																		...o.query.params,
																		provinciaId: pcia.value,
																	},
																},
																onPreLoad: () =>
																	setTrabLocaSelect((o) => ({
																		...o,
																		loading: "Cargando...",
																	})),
																onLoad: ({ ok, error }) =>
																	setTrabLocaSelect((o) => ({
																		...o,
																		data: Array.isArray(ok) ? ok : [],
																		loading: null,
																		error: error?.toString(),
																		selected: {
																			record: { nombre: domicilio.localidad },
																		},
																	})),
															}));
														}
													}
													apply();
													setPadronAFIPQuery((o) => ({ ...o, loading: null }));
												},
											}));
										} else {
											changes.errors.cuil = "Dato requerido";
											apply();
										}
									}}
									loading={padronAFIPQuery.loading === "Trabajador"}
								>
									Valida
								</Button>
							</Grid>
							<Grid width="200px">
								<SearchSelectMaterial
									id="tipoDocumentoSelect"
									label="Tipo Doc."
									error={
										!!(
											tipoDocumentoSelect.error ||
											state.errors.trabajador.tipoDocumento
										)
									}
									helperText={
										tipoDocumentoSelect.loading ??
										tipoDocumentoSelect.error ??
										state.errors.trabajador.tipoDocumento
									}
									value={tipoDocumentoSelect.selected}
									onChange={(selected) => {
										setTipoDocumentoSelect((o) => ({ ...o, selected }));
										setState((o) => ({
											...o,
											form: {
												...o.form,
												trabajador: {
													...o.form.trabajador,
													tipoDocumento: selected.label,
												},
											},
										}));
									}}
									options={tipoDocumentoSelect.options}
									onTextChange={(buscar) =>
										setTipoDocumentoSelect((o) => ({ ...o, buscar }))
									}
								/>
							</Grid>
							<Grid width="200px">
								<InputMaterial
									mask={DNIMask}
									label="Número Doc."
									value={state.form.trabajador.numeroDocumento}
									error={!!state.errors.trabajador.numeroDocumento}
									helperText={state.errors.trabajador.numeroDocumento}
									onChange={(v) =>
										setState((o) => ({
											...o,
											form: {
												...o.form,
												trabajador: {
													...o.form.trabajador,
													numeroDocumento: v.replace(/[^0-9]+/g, ""),
												},
											},
										}))
									}
								/>
							</Grid>
							<Grid grow>
								<SearchSelectMaterial
									id="nacionalidadSelect"
									label="Nacionalidad"
									error={
										!!(
											nacionalidadSelect.error ||
											state.errors.trabajador.nacionalidad
										)
									}
									helperText={
										nacionalidadSelect.loading ??
										nacionalidadSelect.error ??
										state.errors.trabajador.nacionalidad
									}
									value={nacionalidadSelect.selected}
									onChange={(selected) => {
										setNacionalidadSelect((o) => ({ ...o, selected }));
										setState((o) => ({
											...o,
											form: {
												...o.form,
												trabajador: {
													...o.form.trabajador,
													nacionalidad: selected.label,
												},
											},
										}));
									}}
									options={nacionalidadSelect.options}
									onTextChange={(buscar) =>
										setNacionalidadSelect((o) => ({ ...o, buscar }))
									}
								/>
							</Grid>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								label="Apellidos"
								value={state.form.trabajador.apellidos}
								error={!!state.errors.trabajador.apellidos}
								helperText={state.errors.trabajador.apellidos}
								onChange={(apellidos) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												apellidos,
											},
										},
									}))
								}
							/>
							<InputMaterial
								label="Nombres"
								value={state.form.trabajador.nombres}
								error={!!state.errors.trabajador.nombres}
								helperText={state.errors.trabajador.nombres}
								onChange={(nombres) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												nombres,
											},
										},
									}))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								type="date"
								label="Fecha de nacimiento"
								value={state.form.trabajador.fechaNacimiento}
								error={state.errors.trabajador.fechaNacimiento}
								onChange={(v) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												fechaNacimiento: v?.format("YYYY-MM-DD"),
											},
										},
									}))
								}
							/>
							<SearchSelectMaterial
								id="estadoCivilSelect"
								label="Estado civil"
								error={
									!!(
										estadoCivilSelect.error ||
										state.errors.trabajador.estadoCivil
									)
								}
								helperText={
									estadoCivilSelect.loading ??
									estadoCivilSelect.error ??
									state.errors.trabajador.estadoCivil
								}
								value={estadoCivilSelect.selected}
								onChange={(selected) => {
									setEstadoCivilSelect((o) => ({ ...o, selected }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												estadoCivil: selected.label,
											},
										},
									}));
								}}
								options={estadoCivilSelect.options}
								onTextChange={(buscar) =>
									setEstadoCivilSelect((o) => ({ ...o, buscar }))
								}
							/>
							<SearchSelectMaterial
								id="sexoSelect"
								label="Sexo"
								error={!!(sexoSelect.error || state.errors.trabajador.sexo)}
								helperText={
									sexoSelect.loading ??
									sexoSelect.error ??
									state.errors.trabajador.sexo
								}
								value={sexoSelect.selected}
								onChange={(selected) => {
									setSexoSelect((o) => ({ ...o, selected }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												sexo: selected.label,
											},
										},
									}));
								}}
								options={sexoSelect.options}
								onTextChange={(buscar) =>
									setSexoSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								label="Domicilio real"
								value={state.form.trabajador.domicilio}
								error={!!state.errors.trabajador.domicilio}
								helperText={state.errors.trabajador.domicilio}
								onChange={(domicilio) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												domicilio,
											},
										},
									}))
								}
							/>
							<SearchSelectMaterial
								id="trabPciaSelect"
								label="Provincia"
								error={
									!!(trabPciaSelect.error || state.errors.trabajador.provincia)
								}
								helperText={
									trabPciaSelect.loading ??
									trabPciaSelect.error ??
									state.errors.trabajador.provincia
								}
								value={trabPciaSelect.selected}
								onChange={(selected) => {
									setTrabPciaSelect((o) => ({ ...o, selected }));

									setLocalidadesQuery((o) => ({
										...o,
										query: {
											...o.query,
											params: {
												...o.query.params,
												provinciaId: selected.value,
											},
										},
										onPreLoad: () =>
											setTrabLocaSelect((o) => ({
												...o,
												selected: {},
												loading: "Cargando...",
											})),
										onLoad: ({ ok, error }) =>
											setTrabLocaSelect((o) => ({
												...o,
												data: Array.isArray(ok) ? ok : [],
												loading: null,
												error: error?.toString(),
												selected: { record: { codPostal: 99999 } },
											})),
									}));

									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												provincia: selected.label,
												localidad: "",
											},
										},
									}));
								}}
								options={trabPciaSelect.options}
								onTextChange={(buscar) =>
									setTrabPciaSelect((o) => ({ ...o, buscar }))
								}
							/>
							<SearchSelectMaterial
								id="trabLocaSelect"
								label="Localidad"
								error={
									!!(trabLocaSelect.error || state.errors.trabajador.localidad)
								}
								helperText={
									trabLocaSelect.loading ??
									trabLocaSelect.error ??
									state.errors.trabajador.localidad
								}
								value={trabLocaSelect.selected}
								onChange={(selected) => {
									setTrabLocaSelect((o) => ({ ...o, selected }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												localidad: selected.record?.nombre,
											},
										},
									}));
								}}
								options={trabLocaSelect.options}
								onTextChange={(buscar) =>
									setTrabLocaSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<SearchSelectMaterial
								id="oficioSelect"
								label="Oficio"
								error={!!(oficioSelect.error || state.errors.trabajador.oficio)}
								helperText={
									oficioSelect.loading ??
									oficioSelect.error ??
									state.errors.trabajador.oficio
								}
								value={oficioSelect.selected}
								onChange={(selected) => {
									setOficioSelect((o) => ({ ...o, selected }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												oficio: selected.label,
											},
										},
									}));
								}}
								options={oficioSelect.options}
								onTextChange={(buscar) =>
									setOficioSelect((o) => ({ ...o, buscar }))
								}
							/>
							<SearchSelectMaterial
								id="actividadSelect"
								label="Actividad que desarrolla"
								error={
									!!(actividadSelect.error || state.errors.trabajador.actividad)
								}
								helperText={
									actividadSelect.loading ??
									actividadSelect.error ??
									state.errors.trabajador.actividad
								}
								value={actividadSelect.selected}
								onChange={(selected) => {
									setActividadSelect((o) => ({ ...o, selected }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												actividad: selected.label,
											},
										},
									}));
								}}
								options={actividadSelect.options}
								onTextChange={(buscar) =>
									setActividadSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								type="tel"
								label="Teléfono"
								value={state.form.trabajador.telefono}
								error={!!state.errors.trabajador.telefono}
								helperText={state.errors.trabajador.telefono}
								onChange={(telefono) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												telefono,
											},
										},
									}))
								}
							/>
							<InputMaterial
								label="Correo"
								value={state.form.trabajador.correo}
								error={!!state.errors.trabajador.correo}
								helperText={state.errors.trabajador.correo}
								onChange={(correo) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												correo,
											},
										},
									}))
								}
							/>
						</Grid>
					</Grid>
				</Grid>
				<Grid col width gap="inherit" style={styles.group}>
					<Grid width style={styles.titulo}>
						Empleador
					</Grid>
					<Grid col gap="inherit">
						<Grid gap="inherit">
							<Grid width="200px">
								<InputMaterial
									mask={CUITMask}
									label="CUIT"
									value={state.form.empleador.cuit}
									error={!!state.errors.empleador.cuit}
									helperText={state.errors.empleador.cuit}
									onChange={(v) =>
										setState((o) => ({
											...o,
											form: {
												...o.form,
												empleador: {
													...o.form.empleador,
													cuit: v.replace(/[^0-9]+/g, ""),
												},
											},
										}))
									}
								/>
							</Grid>
							<Grid col width="100px">
								<Button
									className="botonAzul"
									onClick={() => {
										const changes = {
											empleador: {},
											errors: {
												cuit: "",
											},
										};
										const cuit = state.form.empleador.cuit;
										const apply = () =>
											setState((o) => ({
												...o,
												form: {
													...o.form,
													empleador: {
														...o.form.empleador,
														...changes.empleador,
													},
												},
												errors: {
													...o.errors,
													empleador: {
														...o.errors.empleador,
														...changes.errors,
													},
												},
											}));
										if (cuit) {
											setPadronAFIPQuery((o) => ({
												...o,
												loading: "Empleador",
												query: {
													...o.query,
													params: { ...o.query.params, cuit },
												},
												onLoad: ({ ok, error }) => {
													if (error) {
														if (error.code === 404) {
															changes.errors.cuit = "No existe en AFIP";
														} else {
															changes.errors.cuit = error.toString();
															//ToDo: Auditar
														}
													} else {
														//ToDo: Cargar datos AFIP
														changes.empleador.razonSocial =
															ok.razonSocial ?? ok.nombre;
														if (ok.domicilios?.length) {
															const domicilio =
																ok.domicilios.find(
																	(r) => r.tipoDomicilio === "LEGAL/REAL"
																) ?? ok.domicilios[0];
															changes.empleador.domicilio = domicilio.direccion;
															const pcia = emplPciaSelect.options.find(
																(r) =>
																	r.record.idProvinciaAFIP ===
																	domicilio.idProvincia
															);
															setEmplPciaSelect((o) => ({
																...o,
																selected: pcia,
															}));

															setLocalidadesQuery((o) => ({
																...o,
																query: {
																	...o.query,
																	params: {
																		...o.query.params,
																		provinciaId: pcia.value,
																	},
																},
																onPreLoad: () =>
																	setEmplLocaSelect((o) => ({
																		...o,
																		loading: "Cargando...",
																	})),
																onLoad: ({ ok, error }) =>
																	setEmplLocaSelect((o) => ({
																		...o,
																		data: Array.isArray(ok) ? ok : [],
																		loading: null,
																		error: error?.toString(),
																		selected: {
																			record: { nombre: domicilio.localidad },
																		},
																	})),
															}));
														}
														if (ok.idActividadPrincipal) {
															const actividad = ciiuSelect.options.find(
																(r) => r.record.ciiu === ok.idActividadPrincipal
															);
															setCiiuSelect((o) => ({
																...o,
																selected: actividad,
															}));
														}
													}
													apply();
													setPadronAFIPQuery((o) => ({ ...o, loading: null }));
												},
											}));
										} else {
											changes.errors.cuit = "Dato requerido";
											apply();
										}
									}}
									loading={padronAFIPQuery.loading === "Empleador"}
								>
									Valida
								</Button>
							</Grid>
							<Grid grow>
								<InputMaterial
									label="Razon Social"
									value={state.form.empleador.razonSocial}
									error={!!state.errors.empleador.razonSocial}
									helperText={state.errors.empleador.razonSocial}
									onChange={(razonSocial) =>
										setState((o) => ({
											...o,
											form: {
												...o.form,
												empleador: {
													...o.form.empleador,
													razonSocial,
												},
											},
										}))
									}
								/>
							</Grid>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								label="Domicilio real"
								value={state.form.empleador.domicilio}
								error={!!state.errors.empleador.domicilio}
								helperText={state.errors.empleador.domicilio}
								onChange={(domicilio) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											empleador: {
												...o.form.empleador,
												domicilio,
											},
										},
									}))
								}
							/>
							<SearchSelectMaterial
								id="emplPciaSelect"
								label="Provincia"
								error={
									!!(emplPciaSelect.error || state.errors.empleador.provincia)
								}
								helperText={
									emplPciaSelect.loading ??
									emplPciaSelect.error ??
									state.errors.empleador.provincia
								}
								value={emplPciaSelect.selected}
								onChange={(selected) => {
									setEmplPciaSelect((o) => ({ ...o, selected }));

									setLocalidadesQuery((o) => ({
										...o,
										query: {
											...o.query,
											params: {
												...o.query.params,
												provinciaId: selected.value,
											},
										},
										onPreLoad: () =>
											setEmplLocaSelect((o) => ({
												...o,
												selected: {},
												loading: "Cargando...",
											})),
										onLoad: ({ ok, error }) =>
											setEmplLocaSelect((o) => ({
												...o,
												data: Array.isArray(ok) ? ok : [],
												loading: null,
												error: error?.toString(),
												selected: { record: { codPostal: 99999 } },
											})),
									}));

									setState((o) => ({
										...o,
										form: {
											...o.form,
											empleador: {
												...o.form.empleador,
												provincia: selected.label,
												localidad: "",
											},
										},
									}));
								}}
								options={emplPciaSelect.options}
								onTextChange={(buscar) =>
									setEmplPciaSelect((o) => ({ ...o, buscar }))
								}
							/>
							<SearchSelectMaterial
								id="emplLocaSelect"
								label="Localidad"
								error={
									!!(emplLocaSelect.error || state.errors.empleador.localidad)
								}
								helperText={
									emplLocaSelect.loading ??
									emplLocaSelect.error ??
									state.errors.empleador.localidad
								}
								value={emplLocaSelect.selected}
								onChange={(selected) => {
									setEmplLocaSelect((o) => ({ ...o, selected }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											trabajador: {
												...o.form.trabajador,
												localidad: selected.record?.nombre,
											},
										},
									}));
								}}
								options={emplLocaSelect.options}
								onTextChange={(buscar) =>
									setEmplLocaSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<SearchSelectMaterial
								id="ciiuSelect"
								label="Actividad"
								error={!!(ciiuSelect.error || state.errors.empleador.ciiu)}
								helperText={
									ciiuSelect.loading ??
									ciiuSelect.error ??
									state.errors.empleador.ciiu
								}
								value={ciiuSelect.selected}
								onChange={(selected) => {
									setCiiuSelect((o) => ({ ...o, selected }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											empleador: {
												...o.form.empleador,
												ciiu: selected.label,
											},
										},
									}));
								}}
								options={ciiuSelect.options}
								onTextChange={(buscar) =>
									setCiiuSelect((o) => ({ ...o, buscar }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								type="tel"
								label="Teléfono"
								value={state.form.empleador.telefono}
								error={!!state.errors.empleador.telefono}
								helperText={state.errors.empleador.telefono}
								onChange={(telefono) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											empleador: {
												...o.form.empleador,
												telefono,
											},
										},
									}))
								}
							/>
							<InputMaterial
								label="Correo"
								value={state.form.empleador.correo}
								error={!!state.errors.empleador.correo}
								helperText={state.errors.empleador.correo}
								onChange={(correo) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											empleador: {
												...o.form.empleador,
												correo,
											},
										},
									}))
								}
							/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		);
	}

	const onImprimie = () => {
		// Validaciones simples primero
		const errors = { trabajador: {}, empleador: {} };
		const form = state.form;

		if (!form.seccionalNro) errors.seccionalNro = "Dato requerido";
		if (!form.fecha) errors.fecha = "Dato requerido";

		//#region trabajador
		if (!form.trabajador.cuil) {
			errors.trabajador.cuil = "Dato requerido";
		} else if (!ValidarCUIT(form.trabajador.cuil)) {
			errors.trabajador.cuil = "Dato inválido";
		}

		form.trabajador.tipoDocumento =
			tipoDocumentoSelect.selected.record?.descripcion ||
			tipoDocumentoSelect.buscar;
		if (!form.trabajador.tipoDocumento)
			errors.trabajador.tipoDocumento = "Dato requerido";

		if (!form.trabajador.numeroDocumento)
			errors.trabajador.numeroDocumento = "Dato requerido";

		form.trabajador.nacionalidad =
			nacionalidadSelect.selected.record?.descripcion ||
			nacionalidadSelect.buscar;
		if (!form.trabajador.nacionalidad)
			errors.trabajador.nacionalidad = "Dato requerido";

		if (!(form.trabajador.apellidos || form.trabajador.nombres))
			errors.trabajador.nombres = "Dato requerido";
		if (!form.trabajador.fechaNacimiento)
			errors.trabajador.fechaNacimiento = "Dato requerido";

		form.trabajador.estadoCivil =
			estadoCivilSelect.selected.record?.descripcion ||
			estadoCivilSelect.buscar;
		if (!form.trabajador.estadoCivil)
			errors.trabajador.estadoCivil = "Dato requerido";

		form.trabajador.sexo =
			sexoSelect.selected.record?.descripcion || sexoSelect.buscar;
		if (!form.trabajador.sexo) errors.trabajador.sexo = "Dato requerido";

		if (!form.trabajador.domicilio)
			errors.trabajador.domicilio = "Dato requerido";

		form.trabajador.provincia =
			trabPciaSelect.selected.record?.nombre || trabPciaSelect.buscar;
		if (!form.trabajador.provincia)
			errors.trabajador.provincia = "Dato requerido";

		form.trabajador.localidad =
			trabLocaSelect.selected.record?.nombre || trabLocaSelect.buscar;
		if (!form.trabajador.localidad)
			errors.trabajador.localidad = "Dato requerido";

		form.trabajador.oficio =
			oficioSelect.selected.record?.cargo || oficioSelect.buscar;
		if (!form.trabajador.oficio) errors.trabajador.oficio = "Dato requerido";

		form.trabajador.actividad =
			actividadSelect.selected.record?.descripcion || actividadSelect.buscar;
		if (!form.trabajador.actividad)
			errors.trabajador.actividad = "Dato requerido";
		if (
			form.trabajador.telefono &&
			!isPossiblePhoneNumber(form.trabajador.telefono)
		)
			errors.trabajador.telefono = "Dato inválido";
		if (form.trabajador.correo && !ValidarEmail(form.trabajador.correo))
			errors.trabajador.correo = "Dato inválido";

		//#endregion trabajador

		//#region empleador

		if (!form.empleador.cuit) {
			errors.empleador.cuit = "Dato requerido";
		} else if (!ValidarCUIT(form.empleador.cuit)) {
			errors.empleador.cuit = "Dato inválido";
		}

		if (!form.empleador.razonSocial)
			errors.empleador.razonSocial = "Dato requerido";

		if (!form.empleador.domicilio)
			errors.empleador.domicilio = "Dato requerido";

		form.empleador.provincia =
			emplPciaSelect.selected.record?.nombre || emplPciaSelect.buscar;
		if (!form.empleador.provincia)
			errors.empleador.provincia = "Dato requerido";

		form.empleador.localidad =
			emplLocaSelect.selected.record?.nombre || emplLocaSelect.buscar;
		if (!form.empleador.localidad)
			errors.empleador.localidad = "Dato requerido";

		form.empleador.ciiu =
			ciiuSelect.selected.record?.descripcion || ciiuSelect.buscar;
		if (!form.empleador.ciiu) errors.empleador.ciiu = "Dato requerido";
		if (
			form.empleador.telefono &&
			!isPossiblePhoneNumber(form.empleador.telefono)
		)
			errors.empleador.telefono = "Dato inválido";
		if (form.empleador.correo && !ValidarEmail(form.empleador.correo))
			errors.empleador.correo = "Dato inválido";

		//#endregion empleador

		if (Object.values(flatten({ value: errors })).filter((r) => r).length) {
			setState((o) => ({ ...o, errors }));
			return;
		}

		const despliega = () => {
			const data = {
				"seccional.codigo": form.seccionalNro,
				...Object.fromEntries(
					`${form.fecha || ""}`
						.split("-")
						.map((v, i) => [`fecha.${["anio", "mes", "dia"][i]}`, v])
				),
				...Object.fromEntries(
					`${Formato.Cuit(form.trabajador.cuil)}`
						.split("-")
						.map((v, i) => [
							`trabajador.cuil.${["tipo", "id", "verificador"][i]}`,
							v,
						])
				),
				"trabajador.documento": [
					form.trabajador.tipoDocumento,
					form.trabajador.numeroDocumento,
				].join(" "),
				"trabajador.nacionalidad": form.trabajador.nacionalidad,
				"trabajador.apellidos": form.trabajador.apellidos,
				"trabajador.nombres": form.trabajador.nombres,
				"trabajador.nacimiento.fecha": Formato.Fecha(
					form.trabajador.fechaNacimiento
				),
				"trabajador.estado_civil": form.trabajador.estadoCivil,
				"trabajador.sexo": form.trabajador.sexo,
				"trabajador.domicilio": form.trabajador.domicilio,
				"trabajador.localidad": form.trabajador.localidad,
				"trabajador.provincia": form.trabajador.provincia,
				"trabajador.oficio": form.trabajador.oficio,
				"trabajador.actividad": form.trabajador.actividad,
				"trabajador.telefono": form.trabajador.telefono,
				"trabajador.correo": form.trabajador.correo,
				...Object.fromEntries(
					`${Formato.Cuit(form.empleador.cuit)}`
						.split("-")
						.map((v, i) => [
							`empleador.cuit.${["tipo", "id", "verificador"][i]}`,
							v,
						])
				),
				"empleador.razon_social": form.empleador.razonSocial,
				"empleador.domicilio": form.empleador.domicilio,
				"empleador.localidad": form.empleador.localidad,
				"empleador.provincia": form.empleador.provincia,
				"empleador.actividad": form.empleador.ciiu,
				"empleador.telefono": form.empleador.telefono,
				"empleador.correo": form.empleador.correo,
			};
			audit({
				modulo: "Consultas",
				proceso: "SolicitudPreviaAfiliacion",
				parametros: data,
				observaciones: `Emite PDF`,
			});
			solicitudAfiliacion({
				data,
				onLoad: (base64) => setState((o) => ({ ...o, base64 })),
			});
		};

		//#region Validaciones AFIP
		setPadronAFIPQuery((o) => ({
			...o,
			query: {
				...o.query,
				params: { ...o.query.params, cuit: form.trabajador.cuil },
			},
			onPreLoad: () =>
				setPadronAFIPQuery((o) => ({ ...o, loading: "Validacion" })),
			onLoad: ({ query, error }) => {
				setPadronAFIPQuery((o) => ({ ...o, loading: null }));
				if (error) {
					if (error.code === 404) {
						errors.trabajador.cuil = error.toString();
						setState((o) => ({ ...o, errors }));
						return;
					} else {
						audit({
							modulo: "Consultas",
							proceso: "SolicitudPreviaAfiliacion",
							parametros: { ...query.params, valida: "trabajador" },
							observaciones: `Error consulta AFIP: ${error.toString()}`,
						});
					}
				}
				setPadronAFIPQuery((o) => ({
					...o,
					query: {
						...o.query,
						params: { ...o.query.params, cuit: form.empleador.cuit },
					},
					onPreLoad: () =>
						setPadronAFIPQuery((o) => ({ ...o, loading: "Validacion" })),
					onLoad: ({ query, error }) => {
						setPadronAFIPQuery((o) => ({ ...o, loading: null }));
						if (error) {
							if (error.code === 404) {
								errors.empleador.cuit = error.toString();
								setState((o) => ({ ...o, errors }));
								return;
							} else {
								audit({
									modulo: "Consultas",
									proceso: "SolicitudPreviaAfiliacion",
									parametros: { ...query.params, valida: "empleador" },
									observaciones: `Error consulta AFIP: ${error.toString()}`,
								});
							}
						}
						despliega();
					},
				}));
			},
		}));
		//#endregion Validaciones AFIP
	};

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				Solicitud previa de afiliación
			</Modal.Header>
			<Modal.Body>{content}</Modal.Body>
			<Modal.Footer>
				<Grid width col gap="5px">
					<Grid width gap="20px" justify="end">
						{state.base64 ? null : (
							<Grid width="150px">
								<Button
									className="botonAmarillo"
									onClick={onImprimie}
									loading={padronAFIPQuery.loading === "Validacion"}
								>
									IMPRIME
								</Button>
							</Grid>
						)}
						<Grid width="150px">
							<Button className="botonAmarillo" onClick={() => onClose()}>
								FINALIZA
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default SolicitudAfiliacionForm;
