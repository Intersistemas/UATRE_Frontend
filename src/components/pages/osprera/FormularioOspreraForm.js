import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CUITMask, DNIMask } from "components/ui/Input/InputMaterial";
import CheckboxMaterial from "components/ui/Checkbox/CheckboxMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import useQueryState from "components/hooks/useQueryState";
import Documentacion from "components/documentacion/Documentacion";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {
  Dialog,
  DialogActions,
  DialogContent,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Formato from "components/helpers/Formato";
import SearchSelectMaterial, {
	mapOptions,
	includeSearch,
} from "components/ui/Select/SearchSelectMaterial";
import moment from "moment/moment";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

/**
 * Proceso a ejecutar posterior carga
 * @param {object} changes datos posterior carga
 * @param {array} changes.data datos obtenidos en la carga
 * @param {object} changes.error error durante la carga
 */


//#region sexoSelect Options
const sexoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion sexoSelect Options

//#region tipoDocumentoSelect Options
const tipoDocumentoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion tipoDocumentoSelect Options

//#region seccionalSelect Options
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion seccionalSelect Options

const FormularioOspreraForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
	loading = {},
	request = "",
}) => {
	data ??= {};
	request ??= {};
	disabled ??= {};
	hide ??= {};
	errors ??= {};
	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	const [selectedTab, setSelectedTab] = useState(0);
	const [mostrarAlertas, setMostrarAlertas] = useState(false);
	const [titular, setTitular] = useState({
		existeEn: "",
		cuil: "",
		tipoDocumentoId: 0,
		nombreyApellido: "",
		fechaNacimiento: "",
		sexoId: 0,
	})
	const [titularPaciente, setTitularPaciente] = useState(false);
	const [documentacionList, setDocumentacionList] = useState([]);
	

	//console.log("request,",request);
	console.log("data,",data);
	
	const { setState: setDocumentosQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/DocumentacionEntidad/GetBySpec?EntidadId=${data.id}&EntidadTipo=O`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	//#region Controlo cada vez que se modifican los datos del titular
	useEffect(()=>{
		if (titularPaciente) {
			handleDatosPaciente(true, titular)
		}
	},[titular, titularPaciente])
	//#endregion
	

	//#region Carga inicial Documentacion
	useEffect(() => {
		setDocumentosQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				console.log("ok_Documentacion:",ok)
				setDocumentacionList(data ?? []);
			},
		}));
	}, [setDocumentosQuery]);
	//#endregion Carga inicial Documentacion

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

	const { setState: setSeccionalesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional?SoloActivos=true&verSeccionalesLocalidades=false`,
				method: "GET", 
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	//#region Handle tab change
	const handleChangeTab = (event, newValue) => {
		setSelectedTab(newValue);		
	};
	  //#endregion

	//#region consultas API
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetAfiliado": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado/GetAfiliadoByCUIL`,
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
			default:
				return null;
		}
	});
	//#endregion

	//#region select tipodocumento
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
	
	//Carga inicial select tipo documento
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
	//select sexo

	//Carga inicial select sexo
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
			options: seccionalSelectOptions(o),
			selected: {value: data.seccionalId, label:  data.seccionalId}
		}));
		
	}, [seccionalSelect.buscar, seccionalSelect.data]);
	//#endregion select seccionales

	// Buscador
	useEffect(() => {
		setSeccionalSelect((o) => ({
			...o,
			selected: {value: data.seccionalId, label: seccionalSelect.options.find((r) => r.value === data.seccionalId)?.label},
		}));
		
	}, [seccionalSelect.options]);
	//#endregion select seccionales


	//#region Carga inicial select seccionales
	useEffect(() => {
		setSeccionalesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok.filter((r) => r.id !== 99999);
				setSeccionalSelect((o) => ({
					...o,
					loading: null,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setSeccionalesQuery]);
	//#endregion Carga inicial select seccionales

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

	const validarCUITHandler = () => {
		const changes = {
			loading: true,
			validado: "",
			datoAFIP: "",
		};
		setValidacionCUIT((o) => ({ ...o, ...changes }));

		errors.cuitTitular = "";
		onChange({
			existe: false,
			nombreyApellidoTitular: null,
			telefono: null,
			direccionesEmailDestino: null,
		});
		const validaAFIP = () => {
			pushQuery({
				action: "ConsultaAFIP",
				params: { cuit: data.cuitTitular, VerificarHistorico: false },
			
				onOk: async (ok) => {
					console.log("ok_ConsultaAFIP:",ok)
					changes.validado = "Titular NO registrado en UATRE";
					changes.datoAFIP = `Dato AFIP:  ${ok.domicilios[0]?.codigoPostal} ${ok.domicilios[0]?.localidad}`;

					 onChange({
						existe: true,
						cuitTitular: ok.cuit,
						nombreyApellidoTitular: `${ok.apellido} ${ok.nombre}`  ?? "",
						//tipoDocumento: puedo hacer un find en le tipoDocOptions
					});

					 setTitular(o => ({...o,
						existeEn: "AFIP",
						cuil: ok?.cuit,
						tipoDocumentoId: 0,
						sexoId: 0,
						nombreyApellido: `${ok?.apellido} ${ok?.nombre}`,
						fechaNacimiento: ok?.fechaNacimiento
					}));
					
				},
				onFinally: async () => {
					changes.loading = false;
					setValidacionCUIT((o) => ({ ...o, ...changes }));
				},
			});
		};

		pushQuery({
			action: "GetAfiliado",
			params: { CUIL: data.cuitTitular},
			onOk: async (ok) => {
				console.log("ok_GetAfiliado:",ok)
				changes.validado = "Titular Afiliado a UATRE";
				changes.datoAFIP = "";

				onChange({
					existe: true,
					cuitTitular: ok.cuil,
					nombreyApellidoTitular: ok.nombre ?? "",
					tipoDocumentoIdTitular: ok.tipoDocumentoId,
				});
				
				setTitular(o => ({...o,
					existeEn: "UATRE",
					cuil: ok?.cuil,
					tipoDocumentoId: ok?.tipoDocumentoId,
					nombreyApellido: `${ok?.nombre}`,
					sexoId: ok?.sexoId,
					seccionalId: ok?.seccionalId,
					fechaNacimiento: ok?.fechaNacimiento
				}));
			},
			onError: async (error) => validaAFIP(),
			onFinally: async () => {
				changes.loading = false;
				setValidacionCUIT((o) => ({ ...o, ...changes }));
			},
		});
	};
	//#endregion

	const handleDatosPaciente = (event) => {
		setTitularPaciente(event)
		if (event) { 
			console.log("handleDatosPaciente_titular",titular)

			const match = titular?.cuil ? titular?.cuil?.toString()?.match(/^(\d{2})(\d{8})(\d)$/) : null;
			titular?.nombreyApellido && onChange({nombreyApellido: titular?.nombreyApellido});
			titular?.cuil && match[2] && onChange({dniPaciente: match[2]});
			titular?.tipoDocumentoId && onChange({tipoDocumentoId: titular?.tipoDocumentoId});
			titular?.sexoId && onChange({sexoId: titular?.sexoId});
			titular?.fechaNacimiento && onChange({fechaNacimiento: titular?.fechaNacimiento});
			
		}else return; 
	};
	

	const handleMedioGestion = (event) => {
		onChange({medioGestion: event.target.value});
	};

	const hanlerEnviaEmail = () => {
			setMostrarAlertas(true);
	}

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal show /*onHide={() => onClose()}*/ size="lg" centered>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				<h3>{title}</h3>
			</Modal.Header>
			<Modal.Body>
				<Grid col height="60px">
					<Tabs
						value={selectedTab}
						onChange={handleChangeTab}
						aria-label="basic tabs example"
					>
						<Tab label="Datos Personales" />
						<Tab
							label="Documentacion"
						/>
					</Tabs>
				</Grid>
				
				{[
				<Grid col width="full" gap="15px">
					<Grid width="full" gap="inherit">
						<Grid width="full">
							<Grid width="30%">
								<InputMaterial
									id="cuitTitular"
									label="CUIL Titular"
									//mask="99-99.999.999-9"
									mask={CUITMask}
									required
									error={!!errors.cuitTitular}
									helperText={
										errors.cuitTitular ? errors.cuitTitular : validacionCUIT.validado
									}
									value={data.cuitTitular}
									disabled={disabled.cuitTitular}
									onChange={(value) =>
										onChange({ cuitTitular: value.replace(/[^0-9]+/g, "") })
									} 
								/>
							</Grid>
							<Grid col width="10%">
								<Button
									className="botonAzul"
									disabled={`${data.cuitTitular ?? ""}`.length !== 11 || errors.cuitTitular}
									onClick={validarCUITHandler}
									loading={validacionCUIT.loading}
								>
									<h6>{!validacionCUIT.loading ? `Valida` : ` `}</h6>
								</Button>
							</Grid>
							<Grid width="30%" float="right">
								{data?.nombreyApellidoTitular ?? ""}
							</Grid>
							<Grid width="30%" float="right">
								<SearchSelectMaterial
									id="seccionalId"
									label="Seccional"
									error={!!(seccionalSelect.error || errors.seccionalId)}
									helperText={
										seccionalSelect.loading ?? seccionalSelect.error ?? errors.seccionalId
									}
									value={seccionalSelect.selected}
									disabled={disabled.seccionalId ?? false}
									onChange={(selected = {}) => {
										setSeccionalSelect((o) => ({ ...o, selected, origen: "option" }));
										onChange({seccionalId: selected.value});
									}}
									options={seccionalSelect.options}
									onTextChange={(buscar) =>
										setSeccionalSelect((o) => ({ ...o, buscar, origen: "text" }))
									}
								/>		
							</Grid>
						</Grid>
					</Grid>
					<Grid>
						<CheckboxMaterial
							id="titularPaciente"
							label="El Paciente es El Titular"
							value={titularPaciente}
							onChange={(v) => handleDatosPaciente(v)}
						/>
					</Grid>
					<Grid width="full" gap="inherit">
						<Grid width="100px">
							<SearchSelectMaterial
								id="tipoDocumentoId"
								label="Tipo Doc."
								error={
									!!(
										tipoDocumentoSelect.error || errors.tipoDocumentoId
									)
								}
								helperText={
									tipoDocumentoSelect.loading ??
									tipoDocumentoSelect.error ??
									errors.tipoDocumentoId
								}
								value={tipoDocumentoSelect.selected}
								disabled={disabled.trabajador}
								onChange={(selected = {}) => {
									setTipoDocumentoSelect((o) => ({
										...o,
										selected,
										origen: "option",
									}));
									onChange({ tipoDocumentoId: selected.value });
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
						<Grid>
							<InputMaterial
								id="dniPaciente"
								mask={DNIMask}
								label="Número Doc."
								value={data.dniPaciente}
								error={!!errors.dniPaciente}
								helperText={errors.dniPaciente ?? ""}
								disabled={disabled.dniPaciente}
								onChange={(value) =>
									onChange({ dniPaciente: value})
								} 
							/>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="nombreyApellido"
								label="Nombre y Apellido"
								error={!!errors.nombreyApellido}
								helperText={errors.nombreyApellido ?? ""}
								value={data.nombreyApellido}
								disabled={disabled.nombreyApellido}
								onChange={(nombreyApellido) => onChange({ nombreyApellido })}
							/>
						</Grid>
					</Grid>
				
					<Grid width gap="inherit">
						<InputMaterial
							id="fechaNacimiento"
							type="date"
							label="Fecha de nacimiento"
							value={data.fechaNacimiento}
							maxDate={moment().format("YYYY-MM-DD")}
							error={errors.fechaNacimiento}
							disabled={disabled.fechaNacimiento ?? false}
							onChange={(fechaNacimiento) => onChange({fechaNacimiento})}							
						/>
						<SearchSelectMaterial
							id="sexoSelect"
							label="Sexo"
							error={!!(sexoSelect.error || errors.sexoId)}
							helperText={
								sexoSelect.loading ?? sexoSelect.error ?? errors.sexoId
							}
							value={sexoSelect.selected}
							disabled={disabled.sexo ?? false}
							onChange={(selected = {}) => {
								setSexoSelect((o) => ({ ...o, selected, origen: "option" }));
								onChange({sexoId: selected.value});
							}}
							options={sexoSelect.options}
							onTextChange={(buscar) =>
								setSexoSelect((o) => ({ ...o, buscar, origen: "text" }))
							}
						/>
					</Grid>
					<FormControl error={!!errors.medioGestion} component="fieldset" variant="standard">
						<FormLabel id="demo-row-radio-buttons-group-label">Medio de Gestión:</FormLabel>
						<RadioGroup
							row
							aria-labelledby="demo-row-radio-buttons-group-label"
							name="row-radio-buttons-group"
							value={data?.medioGestion}
							onChange={(medioGestion) => onChange({medioGestion: medioGestion.target.value})}
						>
							<FormControlLabel value="email" control={<Radio />} label="Email" />
							<FormControlLabel value="telefono" control={<Radio />} label="Teléfono" />
						</RadioGroup>
					</FormControl>
					<Grid width="full">
						<Grid width>
						{data.medioGestion === "email" &&
							
							<InputMaterial
								id="direccionesEmailDestino"
								name="email"
								label="Email"
								error={!!errors.direccionesEmailDestino}
								helperText={errors.direccionesEmailDestino ?? ""}
								value={data.direccionesEmailDestino}
								disabled={disabled.direccionesEmailDestino}
								onChange={(direccionesEmailDestino) => onChange({ direccionesEmailDestino })}
							/>
						||
						data.medioGestion === "telefono" &&
						<Grid width>
							<Grid width="350px">
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
							<Grid width="full">
								<InputMaterial
									label="Resultado de la llamada"
									error={!!errors.resultadoLlamada}
									helperText={errors.resultadoLlamada ?? ""}
									value={data.resultadoLlamada}
									disabled={disabled.resultadoLlamada ?? false}
									onChange={(resultadoLlamada) => onChange({ resultadoLlamada })}
								/>
							</Grid>
						</Grid>
						}
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
							<TextField
								fullWidth
								multiline
								maxRows={4}
								label="Observaciones"
								error={!!errors.texto}
								helperText={errors.texto ?? ""}
								value={data.texto}
								disabled={disabled.texto ?? false}
								onChange={(texto) => onChange({ texto: texto.target.value })}
							/>
						
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
				</Grid>,
				<Documentacion
					data={documentacionList}
					onChange={({ index, item }) => {
						const newDocList = [...documentacionList];
						if (index == null) {
							// Create
							newDocList.push(item);
						} else if (item == null) {
							// Delete
							newDocList.splice(index, 1);
						} else {
							// Update
							newDocList.splice(index, 1, item);
						}
						setDocumentacionList(newDocList);
						onChange({documentacion: newDocList})
					}}
				/>,
			][selectedTab]}
			</Modal.Body>
			<Modal.Footer>
				<Button
					className="botonAzul"
					loading={loading}
					width={25}
					onClick={request == "E" ? 
							() => hanlerEnviaEmail() 
							: 
							() => onClose(true)
						}
				>
					
					{request == "E" || data.medioGestion == "email" ? "CONFIRMA y ENVIA" : "CONFIRMA"}
				</Button>

				<Button className="botonAmarillo" width={25} onClick={() => onClose()}>
					CIERRA
				</Button>

				{mostrarAlertas &&
				<Stack sx={{ width: '100%' }} spacing={2}>
					<Alert variant="filled" severity="success">
						Correo enviado con éxito!.
					</Alert>
					<Alert variant="filled" severity="warning">
						Primero debe una dirección de EMAIL!
					</Alert>
					<Alert variant="filled" severity="error">
						Error al enviar el correo!.
					</Alert>
				</Stack>}
			</Modal.Footer>
		</Modal>
	);
};

export default FormularioOspreraForm;
