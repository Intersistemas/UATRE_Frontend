import React, { useEffect,useState } from "react";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import classes from "./EmpresasForm.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal} from 'react-bootstrap';
import UseKeyPress from "components/helpers/UseKeyPress";
import InputMaterial from "../../../ui/Input/InputMaterial";
import SearchSelectMaterial from "../../../ui/Select/SearchSelectMaterial";
import InputMask from 'react-input-mask';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ValidarCUIT from "components/validators/ValidarCUIT";

import useHttp from "../../../hooks/useHttp";
import SelectMaterial from "components/ui/Select/SelectMaterial";

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
	onValidarEmpresaCUITHandler = {},
	delegaciones =[]
}) => {
	data ??= {}; 
	delegaciones ??= [];
	//console.log('Form_empresa_data:',data);
	
	// console.log('delegaciones_empresa:',delegaciones)
	console.log('Form_empresa_errors:',errors)
	
	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	
	onClose ??= onCloseDef;

	const { isLoading, error, sendRequest: request } = useHttp();




	//#region Buscar Aactividades
	const [actividadesTodas, setActividadesTodas] = useState([]);
	const [actividadBuscar, setActividadBuscar] = useState("");
	const [actividadesOptions, setActividadesOptions] = useState([""]); //LISTA DE TODAS LAS LOCALIDADES  
	const [actividadEmpresa, setActividadEmpresa] = useState({value: data?.actividadPrincipalId ?? 0, label: data?.actividadPrincipalDescripcion} );


	const [cuitLoading, setCUITLoading] = useState(false);
	const [cuitValidado, setCuitValidado] = useState("");

	
	
		//#region Buscar Localidades
		const [localidadesTodas, setLocalidadesTodas] = useState([]);
		const [localidadBuscar, setLocalidadBuscar] = useState("");
		const [localidadesOptions, setLocalidadesOptions] = useState([""]); //LISTA DE TODAS LAS LOCALIDADES  	
		//const localidadInicio = {value: data?.refLocalidadesId ?? 0, label: data?.localidadNombre}
		const [localidadSeccional, setLocalidadSeccional] = useState({value: data?.refLocalidadesId ?? 0, label: data?.localidadNombre} );


	const selectedDelegacion = (delegacionId) =>{
		const delegacion = delegaciones.find((c) => c.value === delegacionId)
		return delegacion;
	}

	//TRAIGO TODAS LAS LOCALIDADES una vez
	useEffect(() => {
		disabled.estado && onChange({ estado: data.estado });

		const processAactividades = async (actividadesObj) => {
			console.log('actividadesObj',actividadesObj);
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
	},[]);

	
	const validarEmpresaCUITHandler = () => {
		setCUITLoading(true);
		setCuitValidado(0);
		onChange({existe: false})
		errors.cuit = "";
		
		onChange({ razonSocial: null});
		onChange({ actividadPrincipalDescripcion: null});
		//onChange({ domicilioCalle: padronObj.domicilios[0]?.direccion}); este es de AFIP CONSULTA
		onChange({ domicilioCalle: null});
		onChange({ telefono: null});
		onChange({ email: null});
		onChange({ ciiU1Descripcion: null});
		onChange({ ciiU2Descripcion: null});
		onChange({ ciiU3Descripcion: null});

		const processConsultaPadron = async (padronObj) => {
			console.log('padronObj',padronObj);
		  setCuitValidado(1);
		  onChange({existe: true})
		  //setPadronEmpresaRespuesta(padronObj);
		 
		  onChange({ cuit: padronObj.cuit});
		  onChange({ razonSocial: padronObj.razonSocial});
		  onChange({ actividadPrincipalDescripcion: padronObj.actividadPrincipalDescripcion});
		  //onChange({ domicilioCalle: padronObj.domicilios[0]?.direccion}); este es de AFIP CONSULTA
		  onChange({ domicilioCalle: padronObj.domicilioCalle+" "+padronObj.domicilioNumero});
		  onChange({ telefono: padronObj.telefono});
		  onChange({ email: padronObj.email});
		  onChange({ ciiU1Descripcion: padronObj.ciiU1Descripcion});
		  onChange({ ciiU2Descripcion: padronObj.ciiU2Descripcion});
		  onChange({ ciiU3Descripcion: padronObj.ciiU3Descripcion});

		};
		setCUITLoading(false);
	
		request(
		  {
			baseURL: "Comunes",
			//endpoint: `/AFIPConsulta?CUIT=${data.cuit}&VerificarHistorico=${true}`,
			endpoint: `/Empresas/GetEmpresaSpecs?CUIT=${data.cuit}&SoloActivos=${true}`,
			method: "GET",
		  },
		  processConsultaPadron
		);
	  };
	  //#endregion

	useEffect(() => {
		console.log('actividadBuscar',actividadBuscar)
		if (actividadBuscar.length > 2) {
		const actividadesSelect = actividadesTodas
			.filter((actividad) =>
			actividad.descripcion.toUpperCase().includes(actividadBuscar.toUpperCase())
			)
			.map((actividad) => {
			return { value: actividad.id, label: actividad.descripcion };
			});
			//console.log("actividadesSelect", actividadesSelect, actividades);
			setActividadesOptions(actividadesSelect);
		}     

		if (actividadBuscar === ""){
			setActividadesOptions([])
			setActividadBuscar("")
		}    
	}, [actividadesTodas, actividadBuscar]);

	const handlerOnTextChange = (event) => {
		//console.log("text change", event.target.value);
				
		setActividadEmpresa({...actividadEmpresa, label: event.target.value});
		setActividadBuscar(event.target.value);
		
	  };
	//#endregion


	UseKeyPress(['Escape'], () => onClose());
	UseKeyPress(['Enter'], () => onClose(true), 'AltKey');
 
	return (
		<div>
			<Modal
			show
			onHide={() => onClose()}
			size="lg"
			centered
			>
				<Modal.Header closeButton><h3>{title}</h3></Modal.Header>
				<Modal.Body>
				<div className={classes.div}>
					<div className={classes.container}>
						
						<div className={classes.item1}>
							<FormControl>
								<Grid container>
									<InputMaterial
										id="cuitEmpresa"
										label="CUIT"
										as={InputMask}
										mask="99-99.999.999-9"
										required 
										error={!!errors.cuit}
										helperText={errors.cuit ? errors.cuit : cuitValidado ? "La Empresa ya existe!" : "Se creará la Empresa"}
										value={data.cuit}
										disabled={disabled.cuit}
										onChange={(value, _id) => onChange({ cuit: value.replace(/[^0-9]+/g, "")})}
									>
										
									</InputMaterial>

									<Button
										className="botonAzul"
										width={30}
										heigth={1}
										disabled={!(data?.cuit?.length == 11)}
										onClick={validarEmpresaCUITHandler}
										loading={cuitLoading}
										>
										<h6>{!cuitLoading ? `Valida` : `...`}</h6>
									</Button>	
									</Grid>
							</FormControl>		

								
						</div>

						<div className={classes.item2}>
							<InputMaterial
								id="razonSocial"
								label="Razon Social"
								error={!!errors.razonSocial} 
								helperText={errors.razonSocial ?? ""}
								value={data.razonSocial}
								disabled={disabled.razonSocial}
								onChange={(value, _id) => onChange({ razonSocial: value })} 
							/>
						</div> 

						<div className={classes.item1}>
							<InputMaterial
								id="provinciaDesc"
								label="Provincia"
								//error={!!errors.razonSocial} 
								//helperText={errors.razonSocial ?? ""}
								//value={data.razonSocial}
								//disabled={disabled.razonSocial}
								//onChange={(value, _id) => onChange({ razonSocial: value })}
							/>
						</div> 

						<div className={classes.item2}>
							<InputMaterial
								id="localidadDesc"
								label="Localidad"
								//error={!!errors.razonSocial} 
								//helperText={errors.razonSocial ?? ""}
								//value={data.Localidad}
								//disabled={disabled.razonSocial}
								//onChange={(value, _id) => onChange({ razonSocial: value })}
							/>
						</div> 

						<div className={classes.item3}>

							
							<InputMaterial
								id="actividadPrincipal"
								label="Actividad"
								error={!!errors.actividadPrincipalDescripcion} 
								helperText={errors.actividadPrincipalDescripcion ?? ""}
								value={data.actividadPrincipalDescripcion}
								disabled={disabled.actividadPrincipalDescripcion}
								onChange={(value, _id) => onChange({ actividadPrincipalDescripcion: value })}   
							/>
{/*
							<SearchSelectMaterial
								id="actividadPrincipal"
								name="actividadPrincipal"
								label="Actividad"

								error={(!!errors.actividadPrincipalId) || (data.actividadPrincipalDescripcion != actividadEmpresa.label)} 
								helperText={errors.actividadPrincipalId ?? ""}
								value={actividadEmpresa}
								disabled={disabled.actividadPrincipalId ?? false}
								onChange={(value, _id) => (
									onChange({ actividadPrincipalId: value.value }),
									onChange({ actividadPrincipalDescripcion: value.label }),
									setActividadEmpresa({...actividadEmpresa,label: value.label})
								)}
								options={actividadesOptions}
								onTextChange={handlerOnTextChange}
								required
							/>*/}
						</div> 


						



						{/*
						<div className={classes.item3}>
							<SearchSelectMaterial
							id="actividadPrincipalId"
							name="actividadPrincipalId"
							label="Actividad"

							error={(!!errors.actividadPrincipalId) || (data.actividadNombre != actividadEmpresa.label)} 
							helperText={errors.actividadPrincipalId ?? ""}
							value={actividadEmpresa}
							disabled={disabled.actividadPrincipalId ?? false}
							onChange={(value, _id) => (
								onChange({ actividadPrincipalId: value.value }),
								onChange({ actividadPrincipalId: value.label }),
								setAactividadEmpresa({...actividadEmpresa,label: value.label})
								)}
							
							options={actividadesOptions}
					
							onTextChange={handlerOnTextChange}
							required
							/>
						</div>*/}

						<div className={classes.item4}>
							<InputMaterial
							id="domicilioCalle"
							label="Dirección"
							error={!!errors.domicilioCalle}
							helperText={errors.domicilioCalle ?? ""}
							value={data.domicilioCalle} 
							disabled={disabled.domicilioCalle ?? false}
							onChange={(value, _id) => onChange({ domicilioCalle: value })} 
							/>
						</div>
						<div className={classes.item5}>
							 
							<InputMaterial
							id="telefono"
							label="Teléfono"
							error={!!errors.telefono}
							helperText={errors.telefono ?? ""}
							value={data.telefono} 
							disabled={disabled.telefono ?? false}
							onChange={(value, _id) => onChange({ telefono: value })}  
							/>   
						</div>  
						<div className={classes.item6}>
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
						</div>


						<div className={classes.item7}>
							<InputMaterial
								id="ciiU1Descripcion"
								name="ciiU1Descripcion"
								label="CIIU 1"
								error={!!errors.ciiU1Descripcion} 
								helperText={errors.ciiU1Descripcion ?? ""}
								value={data.ciiU1Descripcion}
								disabled={disabled.ciiU1Descripcion}
								onChange={(value) => onChange({ ciiU1Descripcion: value })}  
							/>  
						</div>
					
						<div className={classes.item8}>
							<InputMaterial
								id="ciiU2Descripcion"
								name="ciiU2Descripcion"
								label="CIIU 2"
								error={!!errors.ciiU2Descripcion} 
								helperText={errors.ciiU2Descripcion ?? ""}
								value={data.ciiU2Descripcion}
								disabled={disabled.ciiU2Descripcion}
								onChange={(value) => onChange({ ciiU2Descripcion: value })} 
							/>  
						</div>

						<div className={classes.item9}>
							<InputMaterial
								id="ciiU3Descripcion"
								name="ciiU3Descripcion"
								label="CIIU 3"
								error={!!errors.ciiU3Descripcion} 
								helperText={errors.ciiU3Descripcion ?? ""}
								value={data.ciiU3Descripcion}
								disabled={disabled.ciiU3Descripcion}
								onChange={(value) => onChange({ ciiU3Descripcion: value })}
							/>  
						</div>


						{!hide.deletedObs &&
						<>
						<div className={classes.item10}>
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
						<div className={classes.item11}>
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
						<div className={classes.item12}>
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
						</>}
					</div>
			
				</div>
			
			</Modal.Body>
			<Modal.Footer>
				<Button
				className="botonAzul"
				loading={loading}
				width={25}
				onClick={() => ( data.actividadNombre == actividadEmpresa.label && onClose(true))
				}//</Modal.Footer>handlerOnConfirmaClick}
				>
					CONFIRMA
				</Button>

				<Button className="botonAmarillo" width={25} onClick={()=>onClose()}>
					CIERRA
				</Button>
			</Modal.Footer>
		</Modal>
		</div>
	);
};

export default EmpresasForm;
