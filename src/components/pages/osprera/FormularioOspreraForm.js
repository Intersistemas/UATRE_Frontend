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
import download from "downloadjs";
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
import useSolicitudAfiliacion from "../consultas/solicitudAfiliacion/SolicitudAfiliacion";
import { error } from "pdf-lib";

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
		existeEnUATRE: null,
		existeEnOSPRERA: null,
		existeEnAFIP: null,
		confirmado: request == "A" ? false : true,
		DDJJEmpresa: null,
		cuil: "",
		tipoDocumentoId: 0,
		fechaNacimiento: "",
		sexoId: 0,
	})
	const [titularPaciente, setTitularPaciente] = useState(false);
	const [documentacionList, setDocumentacionList] = useState([]);
	const { request: solicitudAfiliacion } = useSolicitudAfiliacion();
	//#region Alert
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogTexto, setDialogTexto] = useState("");
	//#endregion
		
	console.log("disabled",disabled)
	console.log("data,",data);
	//#region EMAIL
	//Se debe procesar el(envio de email)

	const sendEnviarEmailHandler = async () => {

		const adjuntos = (documentacionList || []).map((r) => ({
			fileName: r.nombreArchivo,
			contentType: "application/octet-stream", // o usa el real si lo tienes
			base64Data: r.archivo,
		}));

		pushQuery({
			action: "EnviarCorreo",
			config: {
				body: { to: [data?.direccionesEmailDestino] ?? [], attachments: adjuntos }
			},
			onOk: async (ok) => {
				setDialogTexto("Se ha enviado un email a la dirección ingresada.");
				setOpenDialog(true);
			},
			onError: async (error) => {
				setDialogTexto(error?.message || "Error al enviar el email.");
				setOpenDialog(true);
			},
			onFinally: async () => {
				loading = false;
				onClose(true)
			},
		});
	};
	//#endregion



	const onDownloadSolicitudAfiliacion = (conDatos) => {

		const dataFormulario = {
						"seccional.codigo": seccionalSelect?.selectedAditionalData?.codigo,
						...Object.fromEntries(
							`${data?.fecha || ""}`
								.split("-")
								.map((v, i) => [`fecha.${["anio", "mes", "dia"][i]}`, v])
						),
						...Object.fromEntries(
							`${Formato.Cuit(data?.cuitTitular)}`
								.split("-")
								.map((v, i) => [
									`trabajador.cuil.${["tipo", "id", "verificador"][i]}`,
									v,
								])
						),
						"trabajador.documento": [
							tipoDocumentoSelect?.selected?.label,
							data?.dniPaciente,
						].join(" "),
						"trabajador.nacionalidad": "",
						"trabajador.apellidos": data?.apellidoPaciente,
						"trabajador.nombres": data?.nombrePaciente,
						"trabajador.nacimiento.fecha": Formato.Fecha(data?.fechaNacimiento),
						"trabajador.estado_civil": "",
						"trabajador.sexo": sexoSelect?.selected?.label,
						"trabajador.domicilio": "",
						"trabajador.localidad": "",
						"trabajador.provincia": "",
						"trabajador.oficio": "",
						"trabajador.actividad": "",
						"trabajador.telefono": data?.telefonoContacto,
						"trabajador.correo": data?.emailContacto,
						"trabajador.cuil": data?.cuitTitular,
					};
		//if (request !== "A") return;
		conDatos ?
		solicitudAfiliacion({data: dataFormulario,
			onLoad: (base64) => download(base64, `SolicitudAfiliacion.pdf`),
		})
		:
		solicitudAfiliacion({
			onLoad: (base64) => download(base64, `SolicitudAfiliacion.pdf`),
		})
	};
	
	
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
			case "GetDDJJ": {
				return {
					config: {
						baseURL: "DDJJ",
						endpoint: `/DDJJUatre/GetCUILUltimoAnio`,
						method: "GET",
					},
				};
			}

			case "ConsultaAFIP": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/AFIPConsulta",
						method: "GET",
					},
				};
			}

			case "ConsultaOsprera": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/PadronOsprera/GetPadronOspreraSpecs",
						method: "GET",
					},
				};
			}

			case "EnviarCorreo":{
				return {
					config: {
						endpoint: `/Usuario/enviarCorreoConAdjuntoBase64`,
						baseURL: "Seguridad",
						method: "POST",
						headers: {
							Accept: "*/*",
						},
						/*body: JSON.stringify({
							to: to,
							attachments: attachments,
						}),*/
					},
				};
			}
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
	

	useEffect(() => {
		setTipoDocumentoSelect((o) => ({
			...o,
			selected: {value: data.tipoDocumentoId, label: tipoDocumentoSelect.options.find((r) => r.value === data.tipoDocumentoId)?.label},
		}));
		
	}, [tipoDocumentoSelect.options, data.tipoDocumentoId]);
	//#endregion select sexo

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

	// Buscador
	useEffect(() => {
		setSexoSelect((o) => ({
			...o,
			selected: {value: data.sexoId, label: sexoSelect.options.find((r) => r.value === data.sexoId)?.label},
		}));
		
	}, [sexoSelect.options]);
	//#endregion select sexo
	
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
		selectedAditionalData: {},
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
			selectedAditionalData: seccionalSelect?.options.find((r) => r.value === data?.seccionalId)?.record
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

	const confirmaTitularHandler = () => {
		setTitular((o) => ({ ...o, confirmado: true }));
	}



	const validarCUITHandler = () => {
		const changes = {
			loading: true,
			validado: "",
			datoAFIP: "",
		};

		setTitular(o => ({...o,
			existeEnOSPRERA: false,
			existeEnUATRE: false,
			existeEnAFIP: false,
			cuil: "",
			tipoDocumentoId: 0,
			sexoId: 0,
			fechaNacimiento: null,
		}));

		setValidacionCUIT((o) => ({ ...o, ...changes }));

		errors.cuitTitular = "";
		onChange({
			existe: false,
			apellidoTitular: null,
			nombreTitular: null,
			telefono: null,
			direccionesEmailDestino: null,
		});

		const validaOSPRERA = () => {
			const match = data?.cuitTitular?.toString()?.match(/^(\d{2})(\d{8})(\d)$/);
			pushQuery({
				action: "ConsultaOsprera",
				params: { documento: match[2]},
			
				onOk: async (ok) => {
					console.log("Padron OSPRERA", ok);
					changes.validado = "Titular en padrón OSPRERA";
					changes.datoAFIP = `Dato AFIP:  ${ok.nombre}`;
					const [apellidoTitularDes, nombreTitularDes] = ok.nombre.split(" ");
					onChange({
						existe: true,
						//cuitTitular: ok.cuit,
						apellidoTitular: apellidoTitularDes,
						nombreTitular: nombreTitularDes,
						tipoDocumentoId: tipoDocumentoSelect.options.find((r) => r.label == "DNI")?.value,
						//tipoDocumento: puedo hacer un find en le tipoDocOptions
					});
					if (ok.sexo == "F"){
						onChange({
							sexoId: sexoSelect.options.find((s) => s.label == "Femenino")?.value,
						});
					}

					if (ok.sexo == "M"){
						onChange({
							sexoId: sexoSelect.options.find((s) => s.label == "Masculino")?.value,
						});
					}
					
					setTitular(o => ({...o,
						existeEnOSPRERA: true,
						cuil: data?.cuitTitular,
						tipoDocumentoId: 0,
						sexoId: 0,
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

		const validaAFIP = () => {
			pushQuery({
				action: "ConsultaAFIP",
				params: { cuit: data.cuitTitular, VerificarHistorico: false },
			
				onOk: async (ok) => {
					changes.validado = "Titular datos en AFIP";
					changes.datoAFIP = `Dato AFIP:  ${ok.domicilios[0]?.codigoPostal} ${ok.domicilios[0]?.localidad}`;

					onChange({
						existe: true,
						cuitTitular: ok.cuit,
						apellidoTitular: ok.apellido,
						nombreTitular: ok.nombre,
						//tipoDocumento: puedo hacer un find en le tipoDocOptions
					});

					if (ok.tipoDocumento == "DNI"){
						onChange({
							tipoDocumentoId: tipoDocumentoSelect.options.find((r) => r.label == "DNI")?.value
						});
					}

					setTitular(o => ({...o,
						existeEnAFIP: true,
						cuil: ok?.cuit,
						tipoDocumentoId: 0,
						sexoId: 0,
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
				changes.validado = "Titular Afiliado a UATRE";
				changes.datoAFIP = "";
				const [apellidoTitular, nombreTitular] = ok.nombre.split(" ");
				onChange({
					existe: true,
					cuitTitular: ok.cuil,
					apellidoTitular: apellidoTitular,
					nombreTitular: nombreTitular,
					tipoDocumentoIdTitular: ok.tipoDocumentoId,
				});
				
				setTitular(o => ({...o,
					existeEnUATRE: true,
					cuil: ok?.cuil,
					tipoDocumentoId: ok?.tipoDocumentoId,
					sexoId: ok?.sexoId,
					seccionalId: ok?.seccionalId,
					fechaNacimiento: ok?.fechaNacimiento
				}));
			},
			onError: async (error) => validaOSPRERA(),
			onFinally: async () => {
				changes.loading = false;
				setValidacionCUIT((o) => ({ ...o, ...changes }));
			},
		});

		pushQuery({
			action: "GetDDJJ",
			params: { cuil: data.cuitTitular},
		
			onOk: async (ok) => {
				if (ok.length > 0) {
					console.log("Encontró DDJJ")
				}
			},
			onError: async (error) => {
				console.log("NO Encontró DDJJ")
			},
			onFinally: async () => {
				loading = false;
			},
		});
		
	};
	//#endregion

	const handleDatosPaciente = (event) => {

		//setTitularPaciente(event)
		onChange({elPacienteEsTitular: event});
		
		if (event) { 

			const match = titular?.cuil ? titular?.cuil?.toString()?.match(/^(\d{2})(\d{8})(\d)$/) : null;
			onChange({
				apellidoPaciente: data.apellidoTitular,
				nombrePaciente: data.nombreTitular,
			});
			titular?.cuil && match[2] && onChange({dniPaciente: match[2]});
			titular?.tipoDocumentoId && onChange({tipoDocumentoId: titular?.tipoDocumentoId});
			titular?.sexoId && onChange({sexoId: titular?.sexoId});
			titular?.fechaNacimiento && onChange({fechaNacimiento: titular?.fechaNacimiento});
			
		}else return; 
	};

	const hanlerEnviaEmail = () => {
			setMostrarAlertas(true);
	}

	const handleConfirma = () => {
		////onDownloadSolicitudAfiliacion(data)
		//if (data.medioGestion == "email") sendEnviarEmailHandler()

		if (request == "A" && errors.length == 0) {
			const cuilValidado = async() => validarCUITHandler()
			if (!titular.existeEnUATRE && !titular.existeEnOSPRERA && !titular.existeEnAFIP) {
				setDialogTexto("Debe confeccionar una ficha de Afiliación Manual de UATRE en el formato de Solicitud habitual.")
				setOpenDialog(true)
				onDownloadSolicitudAfiliacion(false)
				if (data.medioGestion == "email") sendEnviarEmailHandler()
			}else{
				onDownloadSolicitudAfiliacion(true)
				if (data.medioGestion == "email") sendEnviarEmailHandler()
			}
		}else{
			onClose(true)
		}
	}

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");


	return (
	<>

		<div>
			<Dialog onClose={()=>(setDialogTexto(""), setOpenDialog(false), onClose(true))} open={openDialog}>
				<DialogContent dividers>
					<Typography 
						gutterBottom
						style={{whiteSpace: 'pre-line'}}
						>{dialogTexto}
					</Typography>
					
				</DialogContent>
				<DialogActions>
					<Button className="botonAmarillo" onClick={()=>(setDialogTexto(""), setOpenDialog(false), onClose(true))}>
						Cierra
					</Button>
				</DialogActions>
			</Dialog>
		</div>
		<Modal show /*onHide={() => onClose()}*/ size="lg" centered>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				<h3>{title}</h3>
				<Grid width="40%" float="right" style={{display: "flex", alignItems: "center", paddingleft: "65%", marginLeft: "25%"}}>
					<div>
						Seccional:
					</div>
					<SearchSelectMaterial
						id="seccionalId"
						label=""
						error={!!(seccionalSelect.error || errors.seccionalId)}
						helperText={
							seccionalSelect.loading ?? seccionalSelect.error ?? errors.seccionalId
						}
						value={seccionalSelect.selected}
						disabled={disabled.seccionalId}
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
							disabled={!titular.confirmado}
						/>
					</Tabs>
				</Grid>
				
				{[
				<Grid col width="full" gap="15px"> 
					<Grid width="full" gap="inherit">
						<Grid>
							<Grid width="170px">
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
									disabled={disabled?.cuitTitular || titular?.confirmado}
									onChange={(value) =>
										onChange({ cuitTitular: value.replace(/[^0-9]+/g, "") })
									} 
								/>
							</Grid>
							<Grid col width="70px" >
								<Button
									className="botonAzul"
									disabled={`${data.cuitTitular ?? ""}`.length !== 11 || errors.cuitTitular || titular?.confirmado || disabled?.cuitTitular}
									onClick={validarCUITHandler}
									loading={validacionCUIT.loading}
								>
									<h6>{!validacionCUIT.loading ? `Valida` : ` `}</h6>
								</Button>
							</Grid>
							
						</Grid>
						<Grid>
							<Grid width="150px">
								<InputMaterial
									id="apellidoTitular"
									label="Apellido"
									error={!!errors.apellidoTitular}
									helperText={errors.apellidoTitular ?? ""}
									value={data.apellidoTitular}
									disabled={(titular.existeEnUATRE || titular.confirmado) || disabled?.apellidoTitular}
									onChange={(apellidoTitular) => onChange({ apellidoTitular })}
								/>
							</Grid>
							<Grid width="260px" >
								<InputMaterial
									id="nombreTitular"
									label="Nombre"
									error={!!errors.nombreTitular}
									helperText={errors.nombreTitular ?? ""}
									value={data.nombreTitular}
									disabled={(titular.existeEnUATRE || titular.confirmado) || disabled?.nombreTitular} //disabled.nombreTitular 
									onChange={(nombreTitular) => onChange({ nombreTitular })}
								/>
							</Grid>
							<Grid col width="116px">
								<Button
									className="botonAzul"
									onClick={confirmaTitularHandler}
									loading={validacionCUIT.loading}
									disabled={!titular?.existeEnUATRE && !titular?.existeEnAFIP && !titular?.existeEnOSPRERA || titular.confirmado}
								>
									<h6>{titular?.confirmado ? `Confirmado` : `Confirma Titular`}</h6>
								</Button>
							</Grid>
						</Grid>
					</Grid>
					<Grid>
						<CheckboxMaterial
							id="titularPaciente"
							label="El Paciente es El Titular"
							value={data?.elPacienteEsTitular}
							onChange={(v) => handleDatosPaciente(v)}
							disabled={!titular?.confirmado}
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
								disabled={!titular?.confirmado ?? disabled.dniPaciente}
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
						<Grid width="130px">
							<InputMaterial
								id="dniPaciente"
								mask={DNIMask}
								label="Número Doc."
								value={data.dniPaciente}
								error={!!errors.dniPaciente}
								helperText={errors.dniPaciente ?? ""}
								disabled={!titular?.confirmado ?? disabled.dniPaciente}
								onChange={(value) =>
									onChange({ dniPaciente: value})
								} 
							/>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="apellidoPaciente"
								label="Apellido"
								error={!!errors.apellidoPaciente}
								helperText={errors.apellidoPaciente ?? ""}
								value={data.apellidoPaciente}
								disabled={!titular?.confirmado ?? disabled.apellidoPaciente}
								onChange={(apellidoPaciente) => onChange({ apellidoPaciente })}
							/>
						</Grid>
						<Grid grow>
							<InputMaterial
								id="nombrePaciente"
								label="Nombre"
								error={!!errors.nombrePaciente}
								helperText={errors.nombrePaciente ?? ""}
								value={data.nombrePaciente}
								disabled={!titular?.confirmado ?? disabled.nombrePaciente}
								onChange={(nombrePaciente) => onChange({ nombrePaciente })}
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
							disabled={!titular?.confirmado ?? disabled.fechaNacimiento ?? false}
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
							disabled={!titular?.confirmado ?? disabled.sexo ?? false}
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
					<Grid  width="100%" gap="inherit">
						<Grid width="100%" gap="inherit">
							<InputMaterial
								id="telefonoContacto"
								label="Teléfono Contacto"
								type="tel"
								error={!!errors.telefonoContacto}
								helperText={errors.telefonoContacto ?? ""}
								value={data.telefonoContacto}
								disabled={!titular?.confirmado ?? disabled.telefonoContacto ?? false}
								onChange={(telefonoContacto) => onChange({ telefonoContacto })}
							/>
						
							<InputMaterial
								id="telefonoContacto2"
								label="Otro Teléfono Contacto"
								type="tel"
								error={!!errors.telefonoContacto2}
								helperText={errors.telefonoContacto2 ?? ""}
								value={data.telefonoContacto2}
								disabled={!titular?.confirmado ?? disabled.telefonoContacto2 ?? false}
								onChange={(telefonoContacto2) => onChange({ telefonoContacto2 })}
							/>
						</Grid>
					</Grid>
					<Grid  width="100%" gap="inherit">
						<Grid width="100%" gap="inherit">
							<InputMaterial
								id="emailContacto"
								name="email"
								label="Email Contacto"
								error={!!errors.emailContacto}
								helperText={errors.emailContacto ?? ""}
								value={data.emailContacto}
								disabled={!titular?.confirmado ?? disabled.emailContacto}
								onChange={(emailContacto) => onChange({ emailContacto })}
							/>
					
							<InputMaterial
								id="emailContacto2"
								name="email"
								label="Otro Email Contacto"
								error={!!errors.emailContacto2}
								helperText={errors.emailContacto2 ?? ""}
								value={data.emailContacto2}
								disabled={!titular?.confirmado ?? disabled.emailContacto2}
								onChange={(emailContacto2) => onChange({ emailContacto2 })}
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="inherit">
						<TextField
							fullWidth
							multiline
							maxRows={4}
							label="Detalle de la Gestión"
							error={!!errors.texto}
							helperText={errors.texto ?? ""}
							value={data.texto}
							disabled={!titular?.confirmado ?? disabled.texto ?? false}
							onChange={(texto) => onChange({ texto: texto.target.value })}
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
								disabled={!titular?.confirmado ?? disabled.direccionesEmailDestino}
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
									disabled={!titular?.confirmado ?? disabled.telefono ?? false}
									onChange={(telefono) => onChange({ telefono })}
								/>
							</Grid>
							<Grid width="full">
								<InputMaterial
									label="Resultado de la llamada"
									error={!!errors.resultadoLlamada}
									helperText={errors.resultadoLlamada ?? ""}
									value={data.resultadoLlamada}
									disabled={!titular?.confirmado ?? disabled.resultadoLlamada ?? false}
									onChange={(resultadoLlamada) => onChange({ resultadoLlamada })}
								/>
							</Grid>
						</Grid>
						}
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
					onClick={
						
						request == "E" ? 
							() => hanlerEnviaEmail() 
							: 
							() =>(handleConfirma())
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
	</>
	);
};

export default FormularioOspreraForm;
