import React, { useEffect,useState } from "react";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import classes from "./TareasForm.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal} from 'react-bootstrap';
import UseKeyPress from "components/helpers/UseKeyPress";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import InputMask from 'react-input-mask';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import useHttp from "../../../../hooks/useHttp";
import SelectMaterial from "components/ui/Select/SelectMaterial";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};
 

const TareasForm = ({
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
	console.log('Form_tarea_data:',data)
	 //console.log('data_tarea:',data)
	 //console.log('delegaciones_tarea:',delegaciones)
	// console.log('Form_tarea_errors:',errors)
	
	disabled ??= {};
	hide ??= {};
	errors ??= {};
	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	
	//#region Buscar Localidades

	const [modulosOptions, setModulosOptions] = useState([""]); //LISTA DE TODOS LOS MODULOS  

	const { isLoading, error, sendRequest: request } = useHttp();

	//const localidadInicio = {value: data?.refLocalidadesId ?? 0, label: data?.localidadNombre}
	
	

	const selectModulo = (moduloId) =>{
		const modulo = modulosOptions.find((c) => c.id === moduloId)
		return modulo;
	}

	//TRAIGO TODAS LAS LOCALIDADES una vez
	useEffect(() => {
		disabled.estado && onChange({ estado: data.estado });

		const processModulos = async (moduloObj) => {
			
			setModulosOptions(moduloObj);
		};
		console.log('moduloObj',modulosOptions);
	
		request(
			{
			baseURL: "Seguridad",
			endpoint: "/Modulos",
			method: "GET",
			},
			processModulos
		);
	},[]);

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
							
								<InputMaterial
									id="tarea"
									label="Nombre Tarea"
									as={InputMask}
									required 
									error={!!errors.tarea}
									helperText={errors.tarea ?? ""}
									value={data.tarea}
									disabled={disabled.tarea}
									onChange={(value, _id) => onChange({ tarea: value })}
								/>
							
						</div>
						<div className={classes.item2}>

							<SelectMaterial
								id="modulo"
								name="modulo"
								label="Modulo"
								error={!!errors.estado} 
								helperText={errors.estado ?? ""}
								value={selectModulo(data.refDelegacionId)?.value}
								disabled={disabled.estado ?? false}
								onChange={(value, id) => onChange({ estado: id })}
								//defaultValue="Afilia"
								options={modulosOptions}
								required
							/>     
						</div>

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
					</div>
			
				</div>
			
			</Modal.Body>
			<Modal.Footer>
				<Button
				className="botonAzul"
				loading={loading}
				width={25}
				onClick={() => (onClose(true))
				}
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

export default TareasForm;
