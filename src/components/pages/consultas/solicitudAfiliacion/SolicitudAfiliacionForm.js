import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import Formato from "components/helpers/Formato";
import { and } from "components/helpers/Utils";
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

//#region seccionalesSelect Options
const seccionalSelectDef = {};
const seccionalesSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: [r.codigo, r.descripcion].join(" - "), record: r }),
		filter: (r) => includeSearch(r, buscar),
		start: [seccionalSelectDef],
		...x,
	});
//#endregion seccionalesSelect Options

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
		map: (r) => ({ value: r.id, label: [r.id, r.nombre].join(" - "), record: r }),
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
			label: r.descripcion,
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
	const { setState: setSeccionalesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" }, params: { soloActivos: true } } }
	);
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
				baseURL: "Afiliaciones",
				endpoint: `/Puesto`,
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
	const { setState: setCreateFormQuery } =
		useQueryState(
			() => ({
				config: {
					baseURL: "Afiliaciones",
					endpoint: `/AfiliadoFormulariosAfiliacion`,
					method: "POST",
				},
			}),
			{ query: { config: { errorType: "response" } } }
		);
	//#endregion APIs

	const [state, setState] = useState({
		form: {
			fecha: dayjs().format("YYYY-MM-DD"),
		},
		validado: {
			seccionalId: false,
			fecha: true,
			trabajador: false,
			empleador: false,
		},
		errors: {},
		loading: null,
		base64: null,
	});

	const { audit } = useAuditoriaProceso();

	//#region selects

	//#region select seccional
	const [seccionalSelect, setSeccionalSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setSeccionalSelect((o) => ({
			...o,
			options: seccionalesSelectOptions(o),
		}));
	}, [seccionalSelect.buscar, seccionalSelect.data]);
	//#endregion select seccional

	//#region selects trabajador

	//#region select tipo documento
	const [tipoDocumentoSelect, setTipoDocumentoSelect] = useState({
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: {},
		origen: "",
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
		origen: "",
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
		origen: "",
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
		origen: "",
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
		origen: "",
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
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setTrabLocaSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn = record.codPostal
					? (o) => o.record.codPostal === record.codPostal
					: (o) => includeSearch(o, record.nombre);
				selected = options.find(findFn);
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
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
		origen: "",
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
		origen: "",
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
		origen: "",
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
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEmplLocaSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn = record.codPostal
					? (o) => o.record.codPostal === record.codPostal
					: (o) => includeSearch(o, record.nombre);
				selected = options.find(findFn);
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
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
		origen: "",
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
	
	//#region Carga inicial select seccional
	useEffect(() => {
		setSeccionalesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setSeccionalSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setSeccionalesQuery]);
	//#endregion Carga inicial select seccional

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
						<SearchSelectMaterial
							id="seccionalId"
							autoFocus
							label="Seccional"
							error={
								!!(
									seccionalSelect.error || state.errors.seccionalId
								)
							}
							helperText={
								seccionalSelect.loading ??
								seccionalSelect.error ??
								state.errors.seccionalId
							}
							value={seccionalSelect.selected}
							onChange={(selected = {}) => {
								setSeccionalSelect((o) => ({
									...o,
									selected,
									origen: "option",
								}));
								setState((o) => ({
									...o,
									form: {
										...o.form,
										seccionalId: selected.record?.id,
										seccional: selected.record?.nombre,
									},
									validado: {
										...o.validado,
										seccionalId: !!selected.record?.id
									},
									errors: {
										...o.errors,
										seccionalId: selected.record?.id ? "" : "Dato requerido"
									}
								}));
							}}
							options={seccionalSelect.options}
							onTextChange={(buscar) => {
								setSeccionalSelect((o) => ({
									...o,
									buscar,
									origen: "text",
								}));
								setState((o) => ({
									...o,
									validado: {
										...o.validado,
										seccionalId: !!buscar
									},
									errors: {
										...o.errors,
										seccionalId: buscar ? "" : "Dato requerido"
									}
								}))
							}}
						/>
					</Grid>
					<Grid width>
						<InputMaterial
							id="fecha"
							type="date"
							label="Fecha"
							value={state.form.fecha}
							error={state.errors.fecha}
							onChange={(v) =>
								setState((o) => ({
									...o,
									form: { ...o.form, fecha: v?.format("YYYY-MM-DD") },
									validado: {
										...o.validado,
										fecha: !!v
									},
									errors: {
										...o.errors,
										fecha: v ? "" : "Dato requerido"
									}
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
									id="cuil"
									autoFocus={false}
									mask={CUITMask}
									label="CUIL"
									value={state.form.cuil}
									error={!!state.errors.cuil}
									helperText={state.errors.cuil}
									onChange={(v) =>
										setState((o) => ({
											...o,
											form: {
												...o.form,
												cuil: v.replace(/[^0-9]+/g, ""),
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
											form: {},
											errors: { cuil: "" },
										};
										const cuit = state.form.cuil;
										const apply = () =>
											setState((o) => {
												const state = {
													...o,
													form: {
														...o.form,
														...changes.form,
													},
													errors: {
														...o.errors,
														...changes.errors,
													},
												};
												state.validado = {
													...o.validado,
													trabajador: true//!state.errors.cuil,
												};
												return state;
											});
										if (cuit) {
											setPadronAFIPQuery((o) => ({
												...o,
												loading: "Trabajador",
												query: {
													...o.query,
													params: { ...o.query.params, cuit },
												},
												onLoad: ({ query, ok, error }) => {
													if (error) {
														if (error.code === 404) {
															changes.errors.cuil = "No existe en ARCA";
														} else {
															changes.errors.cuil = error.toString();
															audit({
																modulo: "Consultas",
																proceso: "SolicitudPreviaAfiliacion",
																parametros: { ...query.params, ingreso: "trabajador" },
																observaciones: `Error consulta AFIP: ${error.toString()}`,
															});
														}
													} else {
														changes.form.apellido = ok.apellido;
														changes.form.nombre = ok.nombre;
														changes.form.fechaNacimiento =
															`${ok.fechaNacimiento}`.slice(0, 10);
														setTipoDocumentoSelect((o) => ({
															...o,
															selected:
																o.options.find(
																	(r) => r.label === ok.tipoDocumento
																) ?? {},
														}));
														changes.form.documento = ok.numeroDocumento;
														if (ok.domicilios?.length) {
															const domicilio =
																ok.domicilios.find(
																	(r) => r.tipoDomicilio === "LEGAL/REAL"
																) ?? ok.domicilios[0];
															changes.form.domicilio = domicilio.direccion;
															const pcia = trabPciaSelect.options.find(
																(r) =>
																	r.record.idProvinciaAFIP ===
																	domicilio.idProvincia
															);
															setTrabPciaSelect((o) => ({
																...o,
																selected: pcia,
																origen: "option",
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
																		buscar: domicilio.localidad,
																		selected: {
																			record: { nombre: domicilio.localidad },
																		},
																		origen: "text",
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
									id="tipoDocumentoId"
									label="Tipo Doc."
									error={
										!!(
											tipoDocumentoSelect.error || state.errors.tipoDocumentoId
										)
									}
									helperText={
										tipoDocumentoSelect.loading ??
										tipoDocumentoSelect.error ??
										state.errors.tipoDocumentoId
									}
									value={tipoDocumentoSelect.selected}
									disabled={!state.validado.trabajador}
									onChange={(selected = {}) => {
										setTipoDocumentoSelect((o) => ({
											...o,
											selected,
											origen: "option",
										}));
										setState((o) => ({
											...o,
											form: {
												...o.form,
												tipoDocumentoId: selected.value,
												tipoDocumentoDescripcion: selected.label,
											},
										}));
									}}
									options={tipoDocumentoSelect.options}
									onTextChange={(buscar) =>
										setTipoDocumentoSelect((o) => ({
											...o,
											buscar,
											origen: "text",
										}))
									}
								/>
							</Grid>
							<Grid width="200px">
								<InputMaterial
									id="documento"
									mask={DNIMask}
									label="Número Doc."
									value={state.form.documento}
									error={!!state.errors.documento}
									helperText={state.errors.documento}
									disabled={!state.validado.trabajador}
									onChange={(v) =>
										setState((o) => ({
											...o,
											form: {
												...o.form,
												documento: v.replace(/[^0-9]+/g, ""),
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
										!!(nacionalidadSelect.error || state.errors.nacionalidadId)
									}
									helperText={
										nacionalidadSelect.loading ??
										nacionalidadSelect.error ??
										state.errors.nacionalidadId
									}
									value={nacionalidadSelect.selected}
									disabled={!state.validado.trabajador}
									onChange={(selected = {}) => {
										setNacionalidadSelect((o) => ({
											...o,
											selected,
											origen: "option",
										}));
										setState((o) => ({
											...o,
											form: {
												...o.form,
												nacionalidadId: selected.value,
												nacionalidad: selected.label,
											},
										}));
									}}
									options={nacionalidadSelect.options}
									onTextChange={(buscar) =>
										setNacionalidadSelect((o) => ({
											...o,
											buscar,
											origen: "text",
										}))
									}
								/>
							</Grid>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								id="apellido"
								label="Apellidos"
								value={state.form.apellido}
								error={!!state.errors.apellido}
								helperText={state.errors.apellido}
								disabled={!state.validado.trabajador}
								onChange={(apellido) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											apellido,
										},
									}))
								}
							/>
							<InputMaterial
								id="nombre"
								label="Nombres"
								value={state.form.nombre}
								error={!!state.errors.nombre}
								helperText={state.errors.nombre}
								disabled={!state.validado.trabajador}
								onChange={(nombre) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											nombre,
										},
									}))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								id="fechaNacimiento"
								type="date"
								label="Fecha de nacimiento"
								value={state.form.fechaNacimiento}
								error={state.errors.fechaNacimiento}
								disabled={!state.validado.trabajador}
								onChange={(v) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											fechaNacimiento: v?.format("YYYY-MM-DD"),
										},
									}))
								}
							/>
							<SearchSelectMaterial
								id="estadoCivilSelect"
								label="Estado civil"
								error={
									!!(estadoCivilSelect.error || state.errors.estadoCivilId)
								}
								helperText={
									estadoCivilSelect.loading ??
									estadoCivilSelect.error ??
									state.errors.estadoCivil
								}
								value={estadoCivilSelect.selected}
								disabled={!state.validado.trabajador}
								onChange={(selected = {}) => {
									setEstadoCivilSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											estadoCivilId: selected.value,
											estadoCivil: selected.label,
										},
									}));
								}}
								options={estadoCivilSelect.options}
								onTextChange={(buscar) =>
									setEstadoCivilSelect((o) => ({
										...o,
										buscar,
										origen: "text",
									}))
								}
							/>
							<SearchSelectMaterial
								id="sexoSelect"
								label="Sexo"
								error={!!(sexoSelect.error || state.errors.sexoId)}
								helperText={
									sexoSelect.loading ?? sexoSelect.error ?? state.errors.sexoId
								}
								value={sexoSelect.selected}
								disabled={!state.validado.trabajador}
								onChange={(selected = {}) => {
									setSexoSelect((o) => ({ ...o, selected, origen: "option" }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											sexoId: selected.value,
											sexoDescripcion: selected.label,
										},
									}));
								}}
								options={sexoSelect.options}
								onTextChange={(buscar) =>
									setSexoSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								id="domicilio"
								label="Domicilio real"
								value={state.form.domicilio}
								error={!!state.errors.domicilio}
								helperText={state.errors.domicilio}
								disabled={!state.validado.trabajador}
								onChange={(domicilio) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											domicilio,
										},
									}))
								}
							/>
							<SearchSelectMaterial
								id="trabPciaSelect"
								label="Provincia"
								error={!!(trabPciaSelect.error || state.errors.provinciaId)}
								helperText={
									trabPciaSelect.loading ??
									trabPciaSelect.error ??
									state.errors.provinciaId
								}
								value={trabPciaSelect.selected}
								disabled={!state.validado.trabajador}
								onChange={(selected = {}) => {
									setTrabPciaSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));

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
												origen: "option",
											})),
									}));

									setState((o) => ({
										...o,
										form: {
											...o.form,
											provinciaId: selected.value,
											provinciaNombre: selected.record?.nombre,
											refLocalidadIdAfiliado: 0,
											reflocalidadNombreAfiliado: "",
										},
									}));
								}}
								options={trabPciaSelect.options}
								onTextChange={(buscar) =>
									setTrabPciaSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
							<SearchSelectMaterial
								id="trabLocaSelect"
								label="Localidad"
								error={
									!!(
										trabLocaSelect.error || state.errors.refLocalidadIdAfiliado
									)
								}
								helperText={
									trabLocaSelect.loading ??
									trabLocaSelect.error ??
									state.errors.localidad
								}
								value={trabLocaSelect.selected}
								disabled={!state.validado.trabajador}
								onChange={(selected = {}) => {
									setTrabLocaSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											refLocalidadIdAfiliado: selected.record?.id,
											refLocalidadNombreAfiliado: selected.record?.nombre,
										},
									}));
								}}
								options={trabLocaSelect.options}
								onTextChange={(buscar) =>
									setTrabLocaSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<SearchSelectMaterial
								id="oficioSelect"
								label="Oficio"
								error={!!(oficioSelect.error || state.errors.oficioId)}
								helperText={
									oficioSelect.loading ??
									oficioSelect.error ??
									state.errors.oficioId
								}
								value={oficioSelect.selected}
								disabled={!state.validado.trabajador}
								onChange={(selected = {}) => {
									setOficioSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											oficioId: selected.value,
											oficio: selected.label,
										},
									}));
								}}
								options={oficioSelect.options}
								onTextChange={(buscar) =>
									setOficioSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
							<SearchSelectMaterial
								id="actividadSelect"
								label="Actividad que desarrolla"
								error={
									!!(actividadSelect.error || state.errors.actividadIdAfiliado)
								}
								helperText={
									actividadSelect.loading ??
									actividadSelect.error ??
									state.errors.actividadIdAfiliado
								}
								value={actividadSelect.selected}
								disabled={!state.validado.trabajador}
								onChange={(selected = {}) => {
									setActividadSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											actividadIdAfiliado: selected.value,
											actividadAfiliado: selected.label,
										},
									}));
								}}
								options={actividadSelect.options}
								onTextChange={(buscar) =>
									setActividadSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								id="telefono"
								type="tel"
								label="Teléfono"
								value={state.form.telefono}
								error={!!state.errors.telefono}
								helperText={state.errors.telefono}
								disabled={!state.validado.trabajador}
								onChange={(telefono) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											telefono,
										},
									}))
								}
							/>
							<InputMaterial
								id="celular"
								type="tel"
								label="Celular"
								value={state.form.celular}
								error={!!state.errors.celular}
								helperText={state.errors.celular}
								disabled={!state.validado.trabajador}
								onChange={(celular) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											celular,
										},
									}))
								}
							/>
							<InputMaterial
								id="email"
								label="Correo"
								value={state.form.email}
								error={!!state.errors.email}
								helperText={state.errors.email}
								disabled={!state.validado.trabajador}
								onChange={(email) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											email,
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
									id="cuitEmpresa"
									mask={CUITMask}
									label="CUIT"
									value={state.form.cuitEmpresa}
									error={!!state.errors.cuitEmpresa}
									helperText={state.errors.cuitEmpresa}
									onChange={(v) =>
										setState((o) => ({
											...o,
											form: {
												...o.form,
												cuitEmpresa: v.replace(/[^0-9]+/g, ""),
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
											form: {},
											errors: { cuitEmpresa: "" },
										};
										const cuit = state.form.cuitEmpresa;
										const apply = () =>
											setState((o) => {
												const state = {
													...o,
													form: {
														...o.form,
														...changes.form,
													},
													errors: {
														...o.errors,
														...changes.errors,
													},
												};
												state.validado = {
													...o.validado,
													empleador: true//!state.errors.cuitEmpresa,
												};
												return state;
											});
										if (cuit) {
											setPadronAFIPQuery((o) => ({
												...o,
												loading: "Empleador",
												query: {
													...o.query,
													params: { ...o.query.params, cuit },
												},
												onLoad: ({ query, ok, error }) => {
													if (error) {
														if (error.code === 404) {
															changes.errors.cuitEmpresa = "No existe en ARCA";
														} else {
															changes.errors.cuitEmpresa = error.toString();
															audit({
																modulo: "Consultas",
																proceso: "SolicitudPreviaAfiliacion",
																parametros: { ...query.params, ingreso: "empleador" },
																observaciones: `Error consulta AFIP: ${error.toString()}`,
															});
														}
													} else {
														changes.form.razonSocial =
															ok.razonSocial || ok.nombre;
														if (ok.domicilios?.length) {
															const domicilio =
																ok.domicilios.find(
																	(r) => r.tipoDomicilio === "LEGAL/REAL"
																) ?? ok.domicilios[0];
															changes.form.domicilioEmpresa =
																domicilio.direccion;
															const pcia = emplPciaSelect.options.find(
																(r) =>
																	r.record.idProvinciaAFIP ===
																	domicilio.idProvincia
															);
															setEmplPciaSelect((o) => ({
																...o,
																selected: pcia,
																origen: "option",
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
																		buscar: domicilio.localidad,
																		selected: {
																			record: { nombre: domicilio.localidad },
																		},
																		origen: "text",
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
											changes.errors.cuitEmpresa = "Dato requerido";
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
									id="razonSocial"
									label="Razon Social"
									value={state.form.razonSocial}
									error={!!state.errors.razonSocial}
									helperText={state.errors.razonSocial}
									disabled={!state.validado.empleador}
									onChange={(razonSocial) =>
										setState((o) => ({
											...o,
											form: {
												...o.form,
												razonSocial,
											},
										}))
									}
								/>
							</Grid>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								id="domicilioEmpresa"
								label="Domicilio real"
								value={state.form.domicilioEmpresa}
								error={!!state.errors.domicilioEmpresa}
								helperText={state.errors.domicilioEmpresa}
								disabled={!state.validado.empleador}
								onChange={(domicilioEmpresa) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											domicilioEmpresa,
										},
									}))
								}
							/>
							<SearchSelectMaterial
								id="emplPciaSelect"
								label="Provincia"
								error={
									!!(emplPciaSelect.error || state.errors.provinciaidEmpresa)
								}
								helperText={
									emplPciaSelect.loading ??
									emplPciaSelect.error ??
									state.errors.provinciaidEmpresa
								}
								value={emplPciaSelect.selected}
								disabled={!state.validado.empleador}
								onChange={(selected = {}) => {
									setEmplPciaSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));

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
												origen: "option",
											})),
									}));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											provinciaidEmpresa: selected.value,
											provinciaNombreEmpresa: selected.label,
											refLocalidadIdEmpresa: 0,
											nombreLocalidadEmpresa: "",
										},
									}));
								}}
								options={emplPciaSelect.options}
								onTextChange={(buscar) =>
									setEmplPciaSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
							<SearchSelectMaterial
								id="emplLocaSelect"
								label="Localidad"
								error={
									!!(emplLocaSelect.error || state.errors.refLocalidadIdEmpresa)
								}
								helperText={
									emplLocaSelect.loading ??
									emplLocaSelect.error ??
									state.errors.refLocalidadIdEmpresa
								}
								value={emplLocaSelect.selected}
								disabled={!state.validado.empleador}
								onChange={(selected = {}) => {
									setEmplLocaSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											refLocalidadIdEmpresa: selected.record?.id,
											nombreLocalidadEmpresa: selected.record?.nombre,
										},
									}));
								}}
								options={emplLocaSelect.options}
								onTextChange={(buscar) =>
									setEmplLocaSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<SearchSelectMaterial
								id="ciiuSelect"
								label="Actividad"
								error={!!(ciiuSelect.error || state.errors.actividadIdEmpresa)}
								helperText={
									ciiuSelect.loading ??
									ciiuSelect.error ??
									state.errors.actividadIdEmpresa
								}
								value={ciiuSelect.selected}
								disabled={!state.validado.empleador}
								onChange={(selected = {}) => {
									setCiiuSelect((o) => ({ ...o, selected, origen: "option" }));
									setState((o) => ({
										...o,
										form: {
											...o.form,
											actividadIdEmpresa: selected.value,
											actividadEmpresa: selected.label,
										},
									}));
								}}
								options={ciiuSelect.options}
								onTextChange={(buscar) =>
									setCiiuSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
						</Grid>
						<Grid width gap="inherit">
							<InputMaterial
								id="telefonoEmpresa"
								type="tel"
								label="Teléfono"
								value={state.form.telefonoEmpresa}
								error={!!state.errors.telefonoEmpresa}
								helperText={state.errors.telefonoEmpresa}
								disabled={!state.validado.empleador}
								onChange={(telefonoEmpresa) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											telefonoEmpresa,
										},
									}))
								}
							/>
							<InputMaterial
								id="celularEmpresa"
								type="tel"
								label="Celular"
								value={state.form.celularEmpresa}
								error={!!state.errors.celularEmpresa}
								helperText={state.errors.celularEmpresa}
								disabled={!state.validado.empleador}
								onChange={(celularEmpresa) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											celularEmpresa,
										},
									}))
								}
							/>
							<InputMaterial
								id="emailEmpresa"
								label="Correo"
								value={state.form.emailEmpresa}
								error={!!state.errors.emailEmpresa}
								helperText={state.errors.emailEmpresa}
								disabled={!state.validado.empleador}
								onChange={(emailEmpresa) =>
									setState((o) => ({
										...o,
										form: {
											...o.form,
											emailEmpresa,
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
		const errors = {};
		const body = state.form;

		//#region general
		if (seccionalSelect.origen === "text") {
			body.seccionalId = 0;
			body.seccional = seccionalSelect.buscar;
			errors.seccionalId = "Debe elegir una seccional"
		} else {
			body.seccionalId = seccionalSelect.selected.record?.id;
			body.seccional = seccionalSelect.selected.record?.descripcion;
			body.seccionalCodigo = seccionalSelect.selected.record?.codigo;
		}
		if (!body.seccional) errors.seccionalId = "Dato requerido";

		if (!body.fecha) errors.fecha = "Dato requerido";
		//#endregion general

		//#region trabajador
		if (!body.cuil) {
			errors.cuil = "Dato requerido";
		} else if (!ValidarCUIT(body.cuil)) {
			errors.cuil = "Dato inválido";
		}

		if (tipoDocumentoSelect.origen === "text") {
			body.tipoDocumentoId = 0;
			body.tipoDocumentoDescripcion = tipoDocumentoSelect.buscar;
		} else {
			body.tipoDocumentoId = tipoDocumentoSelect.selected.record?.id;
			body.tipoDocumentoDescripcion =
				tipoDocumentoSelect.selected.record?.descripcion;
		}
		if (!body.tipoDocumentoDescripcion)
			errors.tipoDocumentoId = "Dato requerido";

		if (!body.documento) errors.documento = "Dato requerido";

		if (nacionalidadSelect.origen === "text") {
			body.nacionalidadId = 0;
			body.nacionalidad = nacionalidadSelect.buscar;
		} else {
			body.nacionalidadId = nacionalidadSelect.selected.record?.id;
			body.nacionalidad = nacionalidadSelect.selected.record?.descripcion;
		}
		if (!body.nacionalidad) errors.nacionalidadId = "Dato requerido";

		if (!(body.apellido || body.nombre)) errors.nombre = "Dato requerido";
		if (!body.fechaNacimiento) errors.fechaNacimiento = "Dato requerido";

		if (estadoCivilSelect.origen === "text") {
			body.estadoCivilId = 0;
			body.estadoCivil = estadoCivilSelect.buscar;
		} else {
			body.estadoCivilId = estadoCivilSelect.selected.record?.id;
			body.estadoCivil = estadoCivilSelect.selected.record?.descripcion;
		}
		if (!body.estadoCivil) errors.estadoCivilId = "Dato requerido";

		if (sexoSelect.origen === "text") {
			body.sexoId = 0;
			body.sexoDescripcion = sexoSelect.buscar;
		} else {
			body.sexoId = sexoSelect.selected.record?.id;
			body.sexoDescripcion = sexoSelect.selected.record?.descripcion;
		}
		if (!body.sexoDescripcion) errors.sexoId = "Dato requerido";

		if (!body.domicilio) errors.domicilio = "Dato requerido";

		if (trabPciaSelect.origen === "text") {
			body.provinciaId = 0;
			body.provinciaNombre = trabPciaSelect.buscar;
		} else {
			body.provinciaId = trabPciaSelect.selected.record?.id;
			body.provinciaNombre = trabPciaSelect.selected.record?.nombre;
		}
		if (!body.provinciaNombre) errors.provinciaId = "Dato requerido";

		if (trabLocaSelect.origen === "text") {
			body.refLocalidadIdAfiliado = 0;
			body.nombreLocalidadAfiliado = trabLocaSelect.buscar;
		} else {
			body.refLocalidadIdAfiliado = trabLocaSelect.selected.record?.id;
			body.nombreLocalidadAfiliado = trabLocaSelect.selected.record?.nombre;
		}
		if (!body.nombreLocalidadAfiliado)
			errors.refLocalidadIdAfiliado = "Dato requerido";

		if (oficioSelect.origen === "text") {
			body.oficioId = 0;
			body.oficio = oficioSelect.buscar;
		} else {
			body.oficioId = oficioSelect.selected.record?.id;
			body.oficio = oficioSelect.selected.record?.descripcion;
		}
		if (!body.oficio) errors.oficioId = "Dato requerido";

		if (actividadSelect.origen === "text") {
			body.actividadIdAfiliado = 0;
			body.actividadAfiliado = actividadSelect.buscar;
		} else {
			body.actividadIdAfiliado = actividadSelect.selected.record?.id;
			body.actividadAfiliado = actividadSelect.selected.record?.descripcion;
		}
		if (!body.actividadAfiliado) errors.actividadIdAfiliado = "Dato requerido";
		if (body.telefono && !isPossiblePhoneNumber(body.telefono))
			errors.telefono = "Dato inválido";
		if (body.celular && !isPossiblePhoneNumber(body.celular))
			errors.celular = "Dato inválido";
		if (body.email && !ValidarEmail(body.email)) errors.email = "Dato inválido";

		//#endregion trabajador

		//#region empleador

		if (!body.cuitEmpresa) {
			errors.cuitEmpresa = "Dato requerido";
		} else if (!ValidarCUIT(body.cuitEmpresa)) {
			errors.cuitEmpresa = "Dato inválido";
		}

		if (!body.razonSocial) errors.razonSocial = "Dato requerido";

		if (!body.domicilioEmpresa) errors.domicilioEmpresa = "Dato requerido";

		if (emplPciaSelect.origen === "text") {
			body.provinciaidEmpresa = 0;
			body.provinciaNombreEmpresa = emplPciaSelect.buscar;
		} else {
			body.provinciaidEmpresa = emplPciaSelect.selected.record?.id;
			body.provinciaNombreEmpresa = emplPciaSelect.selected.record?.nombre;
		}
		if (!body.provinciaNombreEmpresa)
			errors.provinciaidEmpresa = "Dato requerido";

		if (emplLocaSelect.origen === "text") {
			body.refLocalidadIdEmpresa = 0;
			body.nombreLocalidadEmpresa = emplLocaSelect.buscar;
		} else {
			body.refLocalidadIdEmpresa = emplLocaSelect.selected.record?.id;
			body.nombreLocalidadEmpresa = emplLocaSelect.selected.record?.nombre;
		}
		if (!body.nombreLocalidadEmpresa)
			errors.refLocalidadIdEmpresa = "Dato requerido";

		if (ciiuSelect.origen === "text") {
			body.actividadIdEmpresa = 0;
			body.actividadEmpresa = ciiuSelect.buscar;
		} else {
			body.actividadIdEmpresa = ciiuSelect.selected.record?.id;
			body.actividadEmpresa = ciiuSelect.selected.record?.descripcion;
		}
		if (!body.actividadEmpresa) errors.actividadIdEmpresa = "Dato requerido";
		if (body.telefonoEmpresa && !isPossiblePhoneNumber(body.telefonoEmpresa))
			errors.telefonoEmpresa = "Dato inválido";
		if (body.celularEmpresa && !isPossiblePhoneNumber(body.celularEmpresa))
			errors.celularEmpresa = "Dato inválido";
		if (body.emailEmpresa && !ValidarEmail(body.emailEmpresa))
			errors.emailEmpresa = "Dato inválido";

		//#endregion empleador

		if (Object.values(errors).filter((r) => r).length) {
			setState((o) => ({ ...o, errors }));
			return;
		}

		const despliega = () => {
			const data = {
				"seccional.codigo": body.seccionalCodigo,
				...Object.fromEntries(
					`${body.fecha || ""}`
						.split("-")
						.map((v, i) => [`fecha.${["anio", "mes", "dia"][i]}`, v])
				),
				...Object.fromEntries(
					`${Formato.Cuit(body.cuil)}`
						.split("-")
						.map((v, i) => [
							`trabajador.cuil.${["tipo", "id", "verificador"][i]}`,
							v,
						])
				),
				"trabajador.documento": [
					body.tipoDocumentoDescripcion,
					body.documento,
				].join(" "),
				"trabajador.nacionalidad": body.nacionalidad,
				"trabajador.apellidos": body.apellido,
				"trabajador.nombres": body.nombre,
				"trabajador.nacimiento.fecha": Formato.Fecha(body.fechaNacimiento),
				"trabajador.estado_civil": body.estadoCivil,
				"trabajador.sexo": body.sexoDescripcion,
				"trabajador.domicilio": body.domicilio,
				"trabajador.localidad": body.nombreLocalidadAfiliado,
				"trabajador.provincia": body.provinciaNombre,
				"trabajador.oficio": body.oficio,
				"trabajador.actividad": body.actividadAfiliado,
				"trabajador.telefono": [body.telefono, body.celular]
					.filter((r) => r)
					.join(", "),
				"trabajador.correo": body.email,

				...Object.fromEntries(
					`${Formato.Cuit(body.cuitEmpresa)}`
						.split("-")
						.map((v, i) => [
							`empleador.cuit.${["tipo", "id", "verificador"][i]}`,
							v,
						])
				),
				"empleador.razon_social": body.razonSocial,
				"empleador.domicilio": body.domicilioEmpresa,
				"empleador.localidad": body.nombreLocalidadEmpresa,
				"empleador.provincia": body.provinciaNombreEmpresa,
				"empleador.actividad": body.actividadEmpresa,
				"empleador.telefono": [body.telefonoEmpresa, body.celularEmpresa]
					.filter((r) => r)
					.join(", "),
				"empleador.correo": body.emailEmpresa,
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
				params: { ...o.query.params, cuit: body.cuil },
			},
			onPreLoad: () =>
				setState((o) => ({ ...o, loading: "Validando trabajador..." })),
			onLoad: ({ query, error }) => {
				setPadronAFIPQuery((o) => ({ ...o, loading: null }));
				if (error) {
					if (error.code === 404) {
						errors.cuil = error.toString();
						setState((o) => ({ ...o, errors, loading: null }));
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
						params: { ...o.query.params, cuit: body.cuitEmpresa },
					},
					onPreLoad: () =>
						setState((o) => ({ ...o, loading: "Validando empleador..." })),
					onLoad: ({ query, error }) => {
						setPadronAFIPQuery((o) => ({ ...o, loading: null }));
						if (error) {
							if (error.code === 404) {
								errors.cuitEmpresa = error.toString();
								setState((o) => ({ ...o, errors, loading: null }));
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
						setCreateFormQuery((o) => ({
							...o,
							query: { ...o.query, config: { ...o.query.config, body } },
							onPreLoad: () =>
								setState((o) => ({ ...o, loading: "Enviando formulario..." })),
							onLoad: ({ error }) => {
								const changes = { loading: null }
								if (error) {
									changes.errors = { create: error.toString() }
								} else {
									despliega();
								}
								setState((o) => ({ ...o, ...changes }));
							},
						}));
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
				<Grid grid="auto / 1fr 150px 150px" width col gap="20px">
					<Grid width style={{ color: "red" }}>
						{state.errors.create}
					</Grid>
					{state.base64 ? (
						<div />
					) : (
						<Button
							className="botonAmarillo"
							onClick={onImprimie}
							loading={!!state.loading}
							disabled={!and(...Object.values(state.validado))}
						>
							IMPRIME
						</Button>
					)}
					<Button className="botonAmarillo" onClick={() => onClose()}>
						FINALIZA
					</Button>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default SolicitudAfiliacionForm;
