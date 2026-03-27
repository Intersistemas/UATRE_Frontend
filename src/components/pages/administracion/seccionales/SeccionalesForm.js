import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CodSeccional } from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import classes from "./SeccionalesForm.module.css";
import useQueryState from "components/hooks/useQueryState";
import { Dialog, DialogActions, DialogContent, Typography } from "@mui/material";

//#region estadoSelect Options
const estadoDefOption = {};
const estadoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion estadoSeccionalSelect Options

//#region provinciaSelect Options
const provinciaDefOption = {};
const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion provinciaSelect Options

//#region seccionalesSelect Options
const seccionalDefOption = {};
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: `${r.codigo}-${r.descripcion}`, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion seccionalesSelect Options

//#region localidadSelect Options
const localidadDefOption = {};
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

//#region delegacionSelect Options
const delegacionDefOption = {};
const delegacionSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion delegacionSelect Options

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

// Función auxiliar para validar diferencia de horarios
const calcularDiferenciaMinutos = (horaInicio, horaFin) => {
	if (!horaInicio || !horaFin) return 0;
	try {
		const [hInicio, mInicio] = horaInicio.split(':').map(Number);
		const [hFin, mFin] = horaFin.split(':').map(Number);
		const minInicio = hInicio * 60 + mInicio;
		const minFin = hFin * 60 + mFin;
		return minFin - minInicio;
	} catch {
		return 0;
	}
};

// Función para formatear automáticamente el horario HH:MM mientras se escribe
const formatTimeInput = (value) => {
	if (!value) return "";
	const digits = String(value).replace(/\D/g, ''); // Solo dígitos
	if (digits.length === 0) return "";
	if (digits.length === 1) return digits;
	if (digits.length === 2) return `${digits.slice(0, 2)}:`;
	if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
	return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
};

// Función para normalizar el horario a HH:MM con ceros
const normalizeTimeInput = (value) => {
	const raw = String(value || '').replace(/[^\d:]/g, '');
	const parts = raw.split(':');
	let horas = (parts[0] || '').replace(/\D/g, '').slice(0, 2);
	let minutos = (parts[1] || '').replace(/\D/g, '').slice(0, 2);
	if (horas.length === 0) horas = '00';
	if (horas.length === 1) horas = `0${horas}`;
	if (minutos.length === 0) minutos = '00';
	if (minutos.length === 1) minutos = `${minutos}0`;
	return `${horas}:${minutos}`;
};

// Convierte HH:MM:SS ó HH:MM en HH:MM (texto visible en el input)
const toHHMM = (value) => {
	const normalized = normalizeTimeInput(value);
	return /^[0-2]\d:[0-5]\d$/.test(normalized) ? normalized : '00:00';
};

const SeccionalesForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
	loading = {},
	request = {}
}) => {
	data ??= {};
	disabled ??= {};
	hide ??= {};
	errors ??= {};
	onChange ??= onChangeDef;
	onClose ??= onCloseDef;
	request ??= {};

	console.log("request",request)
	console.log("Seccionales_Data:",data);

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	

	//#region Alert
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogTexto, setDialogTexto] = useState("");
	//#endregion

	const [procesando, setProcesando] = useState(loading);
	const [validationErrors, setValidationErrors] = useState({});

	// Estados locales para los inputs de horario para permitir edición libre
	const [inputHorario1Desde, setInputHorario1Desde] = useState(toHHMM(data.horarioAtencion1Desde));
	const [inputHorario1Hasta, setInputHorario1Hasta] = useState(toHHMM(data.horarioAtencion1Hasta));
	const [inputHorario2Desde, setInputHorario2Desde] = useState(toHHMM(data.horarioAtencion2Desde));
	const [inputHorario2Hasta, setInputHorario2Hasta] = useState(toHHMM(data.horarioAtencion2Hasta));

	// Sincronizar estados locales cuando data cambia
	useEffect(() => {
		setInputHorario1Desde(toHHMM(data.horarioAtencion1Desde));
	}, [data.horarioAtencion1Desde]);

	useEffect(() => {
		setInputHorario1Hasta(toHHMM(data.horarioAtencion1Hasta));
	}, [data.horarioAtencion1Hasta]);

	useEffect(() => {
		setInputHorario2Desde(toHHMM(data.horarioAtencion2Desde));
	}, [data.horarioAtencion2Desde]);

	useEffect(() => {
		setInputHorario2Hasta(toHHMM(data.horarioAtencion2Hasta));
	}, [data.horarioAtencion2Hasta]);

	// Validar horarios de atención
	useEffect(() => {
		const horaDesde1 = data?.horarioAtencion1Desde || "";
		const horaHasta1 = data?.horarioAtencion1Hasta || "";
		const horaDesde2 = data?.horarioAtencion2Desde || "";
		const horaHasta2 = data?.horarioAtencion2Hasta || "";
		
		let newErrors = { ...validationErrors };
		delete newErrors.horarioAtencion1Desde; // Limpiar error previo
		delete newErrors.horarioAtencion2Desde; // Limpiar error previo
		
		// Validar Horario 1: Desde < Hasta
		if (horaDesde1 && horaHasta1) {
			const diferencia1 = calcularDiferenciaMinutos(horaDesde1, horaHasta1);
			if (diferencia1 < 0) {
				newErrors.horarioAtencion1Desde = "El Horario 1 Desde debe ser anterior al Horario 1 Hasta";
			}
		}
		
		// Validar Horario 2: Desde < Hasta
		if (horaDesde2 && horaHasta2) {
			const diferencia2 = calcularDiferenciaMinutos(horaDesde2, horaHasta2);
			if (diferencia2 < 0) {
				newErrors.horarioAtencion2Desde = "El Horario 2 Desde debe ser anterior al Horario 2 Hasta";
			}
		}
		
		setValidationErrors(newErrors);
	}, [data?.horarioAtencion1Desde, data?.horarioAtencion1Hasta, data?.horarioAtencion2Desde, data?.horarioAtencion2Hasta]);
	

	const { setState: setEstadosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/SeccionalEstado`,
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
	const { state: localidadQuery, setState: setLocalidadQuery } = useQueryState(
		(_, { id, ...params }) => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/RefLocalidad/${id}`,
				method: "GET",
			},
			params,
		}),
		{
			query: {
				config: { errorType: "response" },
				params: { id: data.refLocalidadesId },
			},
		}
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
	const { setState: setDelegacionesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/RefDelegacion/GetAll`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { setState: setSeccionalQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional?SoloActivos=true&verSeccionalesLocalidades=false`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	//#region Selects

	//#region Select estadoSeccional
	const [estadoSelect, setEstadoSelect] = useState({
		reload: true,
		loading: null,
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: { record: { id: data.seccionalEstadoId } },
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setEstadoSelect((o) => {
			const options = estadoSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? (o) => o.record.id === record.id
						: record.descripcion != null
						? (o) => includeSearch(o, record.descripcion)
						: null;
				selected = findFn ? options.find(findFn) : null;
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [estadoSelect.buscar, estadoSelect.data]);
	//#endregion Select estadoSeccional

	//#region Select provincia
	const [provinciaSelect, setProvinciaSelect] = useState({
		reload: true,
		loading: null,
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: provinciaDefOption,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setProvinciaSelect((o) => {
			const options = provinciaSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? (o) => o.record.id === record.id
						: record.nombre != null
						? (o) => includeSearch(o, record.nombre)
						: null ;
				selected = findFn ? options.find(findFn) : null;
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [provinciaSelect.buscar, provinciaSelect.data]);
	//#endregion Select provincia

	//#region Select localidad
	const [localidadSelect, setLocalidadSelect] = useState({
		loading: "",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: localidadDefOption,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setLocalidadSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? (o) => o.record.id === record.id
						: record.codPostal != null
						? (o) => o.record.codPostal === record.codPostal
						: record.nombre != null
						? (o) => includeSearch(o, record.nombre)
						: null;
				selected = findFn ? options.find(findFn) : null;
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [localidadSelect.buscar, localidadSelect.data]);
	//#endregion Select localidad

	//#region Select delegacionSelect
	const [delegacionSelect, setDelegacionSelect] = useState({
		reload: true,
		loading: null,
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: { record: { id: data.refDelegacionId } },
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setDelegacionSelect((o) => {
			const options = delegacionSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? (o) => o.record.id === record.id
						: record.nombre != null
						? (o) => includeSearch(o, record.nombre)
						: null;
				selected = findFn ? options.find(findFn) : null;
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [delegacionSelect.buscar, delegacionSelect.data]);
	//#endregion Select delegacionSelect

	//#region Select seccional
	const [seccionalSelect, setSeccionalSelect] = useState({
		reload: true,
		loading: null,
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: { record: { id: data.id } },
		origen: "",
	});

	// Buscador
	useEffect(() => {
		if (request != "X")  return;
		setSeccionalSelect((o) => {
			const options = seccionalSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? (o) => o.record.id === record.id
						: record.descripcion != null
						? (o) => includeSearch(o, `${record.codigo}-${record.descripcion}`)
						: null ;
				selected = findFn ? options.find(findFn) : null;
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [seccionalSelect.buscar, seccionalSelect.data]);
	//#endregion Select seccional

	//#endregion Selects

	//#region Carga inicial

	//#region Carga inicial select estado seccional
	useEffect(() => {
		if (!estadoSelect.reload) return;
		setEstadoSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
		}));
		setEstadosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)){
					request == "B" ||  request == "C"?
					data = ok
					:
					data = ok.filter(e => e.descripcion != 'BAJA' && e.descripcion != 'ABSORBIDA');
				} 
				console.log("data_estados:",data)
				setEstadoSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [estadoSelect, setEstadosQuery]);
	//#endregion Carga inicial select estado seccional

	//#region Carga inicial select provincias
	useEffect(() => {
		if (!provinciaSelect.reload) return;
		setProvinciaSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
		}));
		setProvinciasQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				const applyPcia = (p = {}) =>
					setProvinciaSelect((o) => ({
						...o,
						data,
						loading: null,
						error: error?.toString(),
						...p,
					}));
				if (!localidadQuery.query.params.id) return applyPcia();
				setLocalidadQuery((o) => ({
					...o,
					onLoad: ({ ok }) => {
						if (!ok) return applyPcia();
						const pcia = data.find((r) => r.id === ok.provinciaId);
						if (!pcia) return applyPcia();
						applyPcia({
							selected: { record: pcia },
							origen: "option",
						});
						const record = ok;
						setLocalidadesQuery((o) => ({
							...o,
							query: {
								...o.query,
								params: {
									...o.query.params,
									provinciaId: pcia.id,
								},
							},
							onPreLoad: () =>
								setLocalidadSelect((o) => ({
									...o,
									selected: localidadDefOption,
									loading: "Cargando...",
								})),
							onLoad: ({ ok, error }) =>
								setLocalidadSelect((o) => ({
									...o,
									data: Array.isArray(ok) ? ok : [],
									loading: null,
									error: error?.toString(),
									selected: error ? localidadDefOption : { record },
									origen: "option",
								})),
						}));
					},
				}));
			},
		}));
	}, [
		provinciaSelect,
		setProvinciasQuery,
		setLocalidadQuery,
		localidadQuery,
		setLocalidadesQuery,
	]);
	//#endregion Carga inicial select provincias

	//#region Carga inicial select seccional
	useEffect(() => {
		if (!seccionalSelect.reload || request != "X") return;
		setSeccionalSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
		}));
		setSeccionalQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				console.log("setSeccionalQuery_ok",ok)
				let dataSec = [];
				if (Array.isArray(ok)){
					//data = ok.filter((secc)=> secc.seccionalEstadoId === 1 );
					dataSec = ok.filter((secc)=> (secc.seccionalEstadoDescripcion == "NORMALIZADA" || secc.seccionalEstadoDescripcion == "TRANSITORIA") && secc.refDelegacionId ==  data.refDelegacionId);
				} 
				setSeccionalSelect((o) => ({
					...o,
					loading: null,
					data: dataSec,
					error: error?.toString() ?? dataSec.length == 0 ? "la delegacion no dispone de seccionales absorbentes" : "",
				}));
			},
		}));
	}, [seccionalSelect, setSeccionalQuery]);
	//#endregion Carga inicial select seccional

	//#region Carga inicial select delegacion
	useEffect(() => {
		if (!delegacionSelect.reload) return;
		setDelegacionSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
		}));
		setDelegacionesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setDelegacionSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [delegacionSelect, setDelegacionesQuery]);
	//#endregion Carga inicial select delegacion

	//#endregion Carga inicial

	const aceptaAbsorcion = () =>{
		onClose(true)
		setProcesando("Cargando...")
	}

	return (
		<>
			<div>
				<Dialog onClose={()=>(setOpenDialog(false))} open={openDialog}>
					<DialogContent dividers>
						<Typography 
						gutterBottom
						style={{whiteSpace: 'pre-line'}}
						>{dialogTexto}</Typography>
					<div>
						{console.log("seccionalSelect*",seccionalSelect)}
						<Typography gutterBottom> {`La seccional ${data.codigo}-${data.descripcion}-${data.provinciaDescripcion} será ABSORBIDA por la seccional ${seccionalSelect.selected.label}, está seguro?`}</Typography>
					</div>
					</DialogContent>
					<DialogActions>
						<Button className="botonAmarillo" onClick={()=>(setDialogTexto(""), setOpenDialog(false), aceptaAbsorcion())}>
							ACEPTA
						</Button>
						<Button className="botonAmarillo" onClick={()=>(setDialogTexto(""), setOpenDialog(false))}>
							CANCELA
						</Button>
					</DialogActions>
				</Dialog>
			</div>
			<Modal show onHide={() => onClose()} size="lg" centered>
				<Modal.Header className={modalCss.modalCabecera}>
					<h3>{title}</h3>
				</Modal.Header>
				<Modal.Body>
					{ request == "X" ?
					<Grid  full gap="15px">
							<InputMaterial
								id="seccionalAbsorbida"
								label="Seccional ABSORBIDA"
								helperText={
									`se absorberán (${data.seccionalLocalidad.length}) localidades de esta seccional`
								}
								error={true}
								value={`${data.codigo}-${data.descripcion}-${data.provinciaDescripcion}`}
								disabled={true}

							/>

							<SearchSelectMaterial
								id="seccionalAbsorbente"
								label="Seccional ABSORBENTE"
								error={!!(seccionalSelect.error || errors.id || errors.seccionalIdAbsorbente)}
								helperText={
									seccionalSelect.loading ??
									seccionalSelect.error ??
									errors.id ??
									errors.seccionalIdAbsorbente 
								}
								disabled={!!disabled.id}
								value={seccionalSelect.selected}
								onChange={(selected = seccionalDefOption) => {
									setSeccionalSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									onChange({ seccionalIdAbsorbente: selected.value });
								}}
								options={seccionalSelect.options}
								onTextChange={(buscar) =>
									setSeccionalSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
					</Grid>
						
					:
					<Grid col full gap="15px">
						<Grid gap="inherit">
							<InputMaterial
									id="codigo"
									label="Código"
									placeholder="S____"   
									required
									error={!!errors.codigo}
									helperText={errors.codigo ?? ""}
									value={(data.codigo ?? "").replace(/-/g, "").toUpperCase()}
									disabled={disabled.codigo}
									onChange={(codigo) => {
										let clean = (codigo ?? "")
											.toUpperCase()
											.replace(/[^0-9S]/g, "");    

										
										if (!clean.startsWith("S")) {
											clean = "S" + clean.replace(/S/g, "");
										}

										
										clean = clean.slice(0, 5);

										onChange({ codigo: clean });
									}}
									inputProps={{ maxLength: 5, pattern: "S[0-9]{4}" }} 
								/>
						</Grid>
						<Grid width="full" gap="inherit">
							<SearchSelectMaterial
								label="Estado"
								error={!!(estadoSelect.error || errors.seccionalEstadoId)}
								helperText={
									estadoSelect.loading ??
									estadoSelect.error ??
									errors.seccionalEstadoId
								}
								disabled={!!disabled.seccionalEstadoId}
								value={estadoSelect.selected}
								onChange={(selected = estadoDefOption) => {
									setEstadoSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									onChange({ seccionalEstadoId: selected.value });
								}}
								options={estadoSelect.options}
								onTextChange={(buscar) =>
									setEstadoSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
							<InputMaterial
								id="descripcion"
								label="Nombre"
								error={!!errors.descripcion}
								helperText={errors.descripcion ?? ""}
								value={data.descripcion}
								disabled={disabled.descripcion}
								onChange={(value, _id) => onChange({ descripcion: value })}
							/>
						</Grid>
						<Grid width gap="inherit">
							<SearchSelectMaterial
								label="Provincia"
								error={!!provinciaSelect.error}
								helperText={provinciaSelect.loading ?? provinciaSelect.error}
								disabled={!!disabled.refLocalidadesId}
								value={provinciaSelect.selected}
								onChange={(selected = provinciaDefOption) => {
									setProvinciaSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									setLocalidadSelect((o) => ({
										...o,
										selected: localidadDefOption,
										buscar: "",
									}));
									onChange({ refLocalidadesId: 0 });
									if (selected === provinciaDefOption) return;
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
											setLocalidadSelect((o) => ({
												...o,
												loading: "Cargando...",
											})),
										onLoad: ({ ok, error }) =>
											setLocalidadSelect((o) => ({
												...o,
												data: Array.isArray(ok) ? ok : [],
												loading: null,
												error: error?.toString(),
												origen: "option",
											})),
									}));
								}}
								options={provinciaSelect.options}
								onTextChange={(buscar) =>
									setProvinciaSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
							<SearchSelectMaterial
								label="Localidad"
								error={!!(localidadSelect.error || errors.refLocalidadesId)}
								helperText={
									localidadSelect.loading ??
									localidadSelect.error ??
									errors.refLocalidadesId
								}
								disabled={!!disabled.refLocalidadesId}
								value={localidadSelect.selected}
								onChange={(selected = localidadDefOption) => {
									setLocalidadSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									onChange({ refLocalidadesId: selected.value });
								}}
								options={localidadSelect.options}
								onTextChange={(buscar) =>
									setLocalidadSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
						</Grid>
						<Grid width="full" gap="inherit">
							<InputMaterial
								id="domicilio"
								label="Dirección"
								error={!!errors.domicilio}
								helperText={errors.domicilio ?? ""}
								value={data.domicilio}
								disabled={disabled.domicilio ?? false}
								onChange={(value, _id) => onChange({ domicilio: value })}
							/>
						</Grid>
						<Grid width="full" gap="inherit">
							<SearchSelectMaterial
								label="Delegación"
								error={!!(delegacionSelect.error || errors.refDelegacionId)}
								helperText={
									delegacionSelect.loading ??
									delegacionSelect.error ??
									errors.refDelegacionId
								}
								disabled={!!disabled.refDelegacionId}
								value={delegacionSelect.selected}
								onChange={(selected = delegacionDefOption) => {
									setDelegacionSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									onChange({ refDelegacionId: selected.value });
								}}
								options={delegacionSelect.options}
								onTextChange={(buscar) =>
									setDelegacionSelect((o) => ({ ...o, buscar, origen: "text" }))
								}
							/>
							<InputMaterial
								id="email"
								type="email"
								label="Email"
								error={!!errors.email}
								helperText={errors.email ?? ""}
								value={data.email}
								disabled={disabled.email ?? false}
								onChange={(value, _id) => onChange({ email: value })}
							/>
						</Grid>
						<Grid width="full" gap="inherit">
							<InputMaterial
								id="telefono"
								type="tel"
								label="Teléfono"
								error={!!errors.telefono}
								helperText={errors.telefono ?? ""}
								value={data.telefono ?? ""}
								disabled={disabled.telefono ?? false}
								onChange={(value, _id) => onChange({ telefono: value })}
							/>
							<InputMaterial
								id="telefonoSecretarioGeneral"
								type="tel"
								label="Teléfono Secretario General"
								error={!!errors.telefonoSecretarioGeneral}
								helperText={errors.telefonoSecretarioGeneral ?? ""}
								value={data.telefonoSecretarioGeneral ?? ""}
								disabled={disabled.telefonoSecretarioGeneral ?? false}
								onChange={(value, _id) => onChange({ telefonoSecretarioGeneral: value })}
							/>
						</Grid>
						<Grid width="full" gap="inherit">
							<InputMaterial
								id="horarioAtencion1Desde"
								type="text"
								label="Horario Atención 1 - Desde (HH:MM)"
								placeholder="HH:MM"
								error={!!(errors.horarioAtencion1Desde || validationErrors.horarioAtencion1Desde)}
								helperText={(errors.horarioAtencion1Desde || validationErrors.horarioAtencion1Desde) ?? ""}
								value={inputHorario1Desde}
								disabled={disabled.horarioAtencion1Desde ?? false}
								onChange={(value, _id) => setInputHorario1Desde(formatTimeInput(value))}
								onFocus={(e) => e.target.select()}
								onBlur={(e) => {
									const normalized = normalizeTimeInput(e?.target?.value);
									setInputHorario1Desde(normalized);
									onChange({ horarioAtencion1Desde: normalized });
								}}
								inputProps={{ maxLength: 5 }}
							/>
							<InputMaterial
								id="horarioAtencion1Hasta"
								type="text"
								label="Horario Atención 1 - Hasta (HH:MM)"
								placeholder="HH:MM"
								error={!!errors.horarioAtencion1Hasta}
								helperText={errors.horarioAtencion1Hasta ?? ""}
								value={inputHorario1Hasta}
								disabled={disabled.horarioAtencion1Hasta ?? false}
								onChange={(value, _id) => setInputHorario1Hasta(formatTimeInput(value))}
								onFocus={(e) => e.target.select()}
								onBlur={(e) => {
									const normalized = normalizeTimeInput(e?.target?.value);
									setInputHorario1Hasta(normalized);
									onChange({ horarioAtencion1Hasta: normalized });
								}}
								inputProps={{ maxLength: 5 }}
							/>
						</Grid>
						<Grid width="full" gap="inherit">
							<InputMaterial
								id="horarioAtencion2Desde"
								type="text"
								label="Horario Atención 2 - Desde (HH:MM)"
								placeholder="HH:MM"
								error={!!(errors.horarioAtencion2Desde || validationErrors.horarioAtencion2Desde)}
								helperText={(errors.horarioAtencion2Desde || validationErrors.horarioAtencion2Desde) ?? ""}
								value={inputHorario2Desde}
								disabled={disabled.horarioAtencion2Desde ?? false}
								onChange={(value, _id) => setInputHorario2Desde(formatTimeInput(value))}
								onFocus={(e) => e.target.select()}
								onBlur={(e) => {
									const normalized = normalizeTimeInput(e?.target?.value);
									setInputHorario2Desde(normalized);
									onChange({ horarioAtencion2Desde: normalized });
								}}
								inputProps={{ maxLength: 5 }}
							/>
							<InputMaterial
								id="horarioAtencion2Hasta"
								type="text"
								label="Horario Atención 2 - Hasta (HH:MM)"
								placeholder="HH:MM"
								error={!!errors.horarioAtencion2Hasta}
								helperText={errors.horarioAtencion2Hasta ?? ""}
								value={inputHorario2Hasta}
								disabled={disabled.horarioAtencion2Hasta ?? false}
								onChange={(value, _id) => setInputHorario2Hasta(formatTimeInput(value))}
								onFocus={(e) => e.target.select()}
								onBlur={(e) => {
									const normalized = normalizeTimeInput(e?.target?.value);
									setInputHorario2Hasta(normalized);
									onChange({ horarioAtencion2Hasta: normalized });
								}}
								inputProps={{ maxLength: 5 }}
							/>
						</Grid>
						
						{!hide.deletedObs && (
							<>
								<div className={classes.item7}>
									<InputMaterial
										id="deletedDate"
										label="Fecha Baja"
										error={!!errors.deletedDate}
										helperText={errors.deletedDate ?? ""}
										value={data.deletedDate}
										disabled={disabled.deletedDate ?? false}
										onChange={(value, _id) => onChange({ deletedDate: value })}
									/>
								</div>
								<div className={classes.item8}>

									{/* Mauricio pidio no ver mas este campo 26-03-26
									<InputMaterial
										id="deletedBy"
										label="Usuario Baja"
										error={!!errors.deletedBy}
										helperText={errors.deletedBy ?? ""}
										value={data.deletedBy}
										disabled={disabled.deletedBy ?? false}
										onChange={(value, _id) => onChange({ deletedBy: value })}
									/>
									*/}
								</div>

								<InputMaterial
									id="observaciones"
									label="Observaciones"
									error={!!errors.observaciones}
									helperText={errors.observaciones ?? ""}
									value={data.observaciones}
									disabled={disabled.observaciones ?? false}
									onChange={(value, _id) => onChange({ observaciones: value })}
								/>
								
								{/* Mauricio pidio no ver mas este campo 26-03-26
								
								<div className={classes.item9}>
									<InputMaterial
										id="deletedObs"
										label="Observaciones Baja"
										error={!!errors.deletedObs}
										helperText={errors.deletedObs ?? ""}
										value={data.deletedObs}
										disabled={disabled.deletedObs ?? false}
										onChange={(value, _id) => onChange({ deletedObs: value })}
									/>
								</div>
								*/}
								
							</>
						)}
					</Grid>
				}
				</Modal.Body>
				<Modal.Footer>
					<Button
						className="botonAzul"
						loading={procesando}
						width={25}
						onClick={() => request != "X" ? (
								 onClose(true),
								 setProcesando("Cargando...")
								)
								: 
								(setOpenDialog(true))
							}
						disabled={(request == "X" && seccionalSelect.selected.value == data.id) || procesando}
					>
						CONFIRMA
					</Button>
					<Button className="botonAmarillo" width={25} onClick={() => onClose()}>
						CIERRA
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default SeccionalesForm;