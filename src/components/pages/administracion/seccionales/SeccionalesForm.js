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

		 //#region Capturo errores
		 useEffect(() => {

			setProcesando(loading);

			if (errors) {
			  setProcesando(null);
			  return;
			}    
		  }, [errors, loading]);
		//#endregion
	

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
								label="Codigo"
								mask={CodSeccional}
								placeholder={"S-____"}
								required
								error={!!errors.codigo}
								helperText={errors.codigo ?? ""}
								value={data.codigo}
								disabled={disabled.codigo}
								onChange={(codigo) => onChange({ codigo })}
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
						<InputMaterial
							id="observaciones"
							label="Observaciones"
							error={!!errors.observaciones}
							helperText={errors.observaciones ?? ""}
							value={data.observaciones}
							disabled={disabled.observaciones ?? false}
							onChange={(value, _id) => onChange({ observaciones: value })}
						/>
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
									<InputMaterial
										id="deletedBy"
										label="Usuario Baja"
										error={!!errors.deletedBy}
										helperText={errors.deletedBy ?? ""}
										value={data.deletedBy}
										disabled={disabled.deletedBy ?? false}
										onChange={(value, _id) => onChange({ deletedBy: value })}
									/>
								</div>
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