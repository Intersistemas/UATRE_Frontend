import React, { useEffect,useState } from "react";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import classes from "./SeccionalesForm.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal} from 'react-bootstrap';
import UseKeyPress from "components/helpers/UseKeyPress";
import InputMaterial, { CodSeccional } from "../../../ui/Input/InputMaterial";
import SearchSelectMaterial from "../../../ui/Select/SearchSelectMaterial";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import useHttp from "../../../hooks/useHttp";
import SelectMaterial from "components/ui/Select/SelectMaterial";

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
	delegaciones =[]
}) => {
	data ??= {}; 
	delegaciones ??= [];
	 console.log('Form_seccional_data:',data)
	 //console.log('data_seccional:',data)
	 //console.log('delegaciones_seccional:',delegaciones)
	// console.log('Form_seccional_errors:',errors)
	
	disabled ??= {};
	hide ??= {};
	errors ??= {};
	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	//	!!title.includes("Baja") && estados.push({value: "BAJA", label: "BAJA"});  REVISAR
	

	//#region Buscar Localidades
	const [localidadesTodas, setLocalidadesTodas] = useState([]);
	
	const [localidadBuscar, setLocalidadBuscar] = useState("");
	const [localidadesOptions, setLocalidadesOptions] = useState([""]); //LISTA DE TODAS LAS LOCALIDADES  
	const [localidadSeccional, setLocalidadSeccional] = useState({value: data?.refLocalidadesId ?? 0, label: data?.localidadNombre} );

	const [estadosOptions, setEstadosOptions] = useState([]);
			

	const { isLoading, error, sendRequest: request } = useHttp();
	
	const selectedDelegacion = (delegacionId) =>{
		const delegacion = delegaciones.find((c) => c.value === delegacionId)
		return delegacion;
	}

	//TRAIGO TODAS LAS LOCALIDADES una vez
	useEffect(() => {
		disabled.estado && onChange({ estado: data.estado });
		const processLocalidades = async (localidadesObj) => {
			setLocalidadesTodas(localidadesObj);
		};
		request(
			{
			baseURL: "Afiliaciones",
			endpoint: "/RefLocalidad",
			method: "GET",
			},
			processLocalidades
		);
	},[]);

	//#region TRAIGO TODOS LOS ESTADOS una vez
	useEffect(() => {
		const processEstados = async (estadosObj) => {
			const estados = estadosObj.map((e)=> ({value: e.id, label: e.descripcion}))
			console.log("estados",estados);
			setEstadosOptions(estados);
		};
		request(
			{
				baseURL: "Afiliaciones",
				endpoint: "/SeccionalEstado",
				method: "GET",
			},
			processEstados
		);
	},[]);
	//#endregion

	useEffect(() => {
		if (localidadBuscar.length > 2) {
		const localidadesSelect = localidadesTodas
			.filter((localidad) =>
			localidad.nombre.toUpperCase().includes(localidadBuscar.toUpperCase())
			)
			.map((localidad) => {
			return { value: localidad.id, label: localidad.nombre };
			});
			setLocalidadesOptions(localidadesSelect);
		}     
		if (localidadBuscar === ""){
			setLocalidadesOptions([])
			setLocalidadBuscar("")
		}    
	}, [localidadesTodas, localidadBuscar]);

	const handlerOnTextChange = (buscar) => {
		setLocalidadSeccional({...localidadSeccional, label: buscar});
		setLocalidadBuscar(buscar);
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
					<Grid col full gap="15px">
						<Grid  gap="inherit">
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
								onChange={(value, _id) => onChange({ codigo: value })}
							/>
						</Grid>
						<Grid width="full" gap="inherit">
							<SelectMaterial
								id="seccionalEstadoId"
								name="seccionalEstadoId"
								label="Estado"
								error={!!errors.seccionalEstadoId} 
								helperText={errors.seccionalEstadoId ?? ""}
								value={data.seccionalEstadoId}
								disabled={disabled.estado ?? false}
								onChange={(value) => onChange({ seccionalEstadoId: value })}
								defaultValue={0}
								options={estadosOptions}
								required
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
						
						<Grid width="full" gap="inherit">
							<SearchSelectMaterial
								id="refLocalidadesId"
								name="refLocalidadesId"
								label="Localidad"

								error={(!!errors.refLocalidadesId) || (data.localidadNombre != localidadSeccional.label)} 
								helperText={errors.refLocalidadesId ?? ""}
								value={localidadSeccional}
								disabled={disabled.refLocalidadesId ?? false}
								onChange={(value, _id) => (
									onChange({ refLocalidadesId: value.value }),
									onChange({ localidadNombre: value.label }),
									setLocalidadSeccional({...localidadSeccional,label: value.label})
									)}
								
								options={localidadesOptions}
						
								onTextChange={handlerOnTextChange}
								required
							/>

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
							
							<SelectMaterial
								id="refDelegacionId"
								name="refDelegacionId"
								label="Delegación"
								error={!!errors.refDelegacionId} 
								helperText={errors.refDelegacionId ?? ""}
								value={selectedDelegacion(data.refDelegacionId)?.value}
								disabled={disabled.refDelegacionId}
								onChange={(value) => onChange({ refDelegacionId: value })}
								
								options={delegaciones}
								required
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
			

						{!hide.deletedObs &&
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
						</>}
				</Grid>
			
			</Modal.Body>
			<Modal.Footer>
				<Button
				className="botonAzul"
				loading={loading}
				width={25}
				onClick={() => ( data.localidadNombre == localidadSeccional.label && onClose(true))
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

export default SeccionalesForm;
