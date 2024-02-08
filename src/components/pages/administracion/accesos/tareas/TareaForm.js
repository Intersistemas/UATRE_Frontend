import React, { useEffect,useState } from "react";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal} from 'react-bootstrap';
import UseKeyPress from "components/helpers/UseKeyPress";
import InputMaterial from "components/ui/Input/InputMaterial";
import useHttp from "../../../../hooks/useHttp";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import useTareasUsuario from "components/hooks/useTareasUsuario";

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

}) => {
	data ??= {}; 
	console.log('Form_tarea_data:',data)
	 //console.log('data_tarea:',data)
	 //console.log('delegaciones_tarea:',delegaciones)
	//console.log('Form_tarea_errors:',errors)
	
	disabled ??= {};
	hide ??= {};
	errors ??= {};
	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	const [modulosOptions, setModulosOptions] = useState([]); //LISTA DE TODOS LOS MODULOS  
	const [tareasOptions, setTareasOptions] = useState([]); //LISTA DE TODAS LAS TAREAS
	
	const [tareaExiste, setTareaExiste] = useState(0); //LISTA DE TODAS LAS TAREAS

	const { isLoading, error, sendRequest: request } = useHttp();	
	
	const selectModulo = (moduloId) =>{
		const modulo = modulosOptions.find((c) => c.id === moduloId)
		return modulo;
	}

	const tareaCheck = useTareasUsuario()

	const selectTarea = (tareasId) =>{
		
		const tarea = tareasOptions.find((c) => c.id === tareasId)

		return tarea;
	}

	//#region TRAIGO TODOS LOS MODULOS DE UNA VEZ
	useEffect(() => {
		
		const processModulos = async (moduloObj) => {
			
			const modulos = moduloObj.map((modulo) => {
			return { value: modulo.id, label: modulo.nombre };
			});
			//console.log('modulos',modulos);
			setModulosOptions(modulos);
		};

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


	//#region TRAIGO TODOS LOS MODULOS DE UNA VEZ
	useEffect(() => {

		const processTareas = async (tareasObj) => {
			
			const tareas = tareasObj.map((tarea) => {
				return { value: tarea.id, label: tarea.nombre };
			});
			//console.log('modulos',modulos);
			setTareasOptions(tareas);
		};
		
		request(
			{
			baseURL: "Seguridad",
			endpoint: `/Tareas?ModulosId=${data.moduloId}`,
			method: "GET",
			},
			async (ok) => (processTareas(ok)),
			async (error) => ((console.log('GetTareas?ModulosId_error',error))),
			async () => (console.log('GetTareas?ModulosId_vacio')),
		);

	},[data.moduloId]);
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
				<Modal.Header className={modalCss.modalCabecera} closeButton><h3>{title}</h3></Modal.Header>
				<Modal.Body>
					<Grid col full gap="15px">
						<Grid width="full" gap="inherit">
							<Grid width="50%">
								<SelectMaterial
									id="moduloId"
									name="moduloId"
									label="Modulo"
									error={!!errors.moduloId} 
									helperText={errors.moduloId ?? ""}
									value={selectModulo(data.moduloId)?.value}
									disabled={disabled.moduloId ?? false}
									onChange={(value) => (
											onChange({ tareasId: ''}),
											onChange({ moduloId: value})
										)									
									}
									//defaultValue="Afilia"
									options={modulosOptions}
									required
								/>     
							</Grid>
							<Grid width="50%">
								<SelectMaterial
									id="tareasId"
									name="tareasId"
									label="Tarea"
									error={!!errors.tareasId} 
									helperText={errors.tareasId ?? ""}
									value={selectTarea(data.tareasId)?.value}
									disabled={disabled.tareasId ?? false}
									onChange={(value) =>
										(onChange({ tareasId: value}),
											//console.log('tarea',tarea)
											console.log('selectTarea(data.tareasId)',()=>(selectTarea(data.tareasId)?.label)),
										setTareaExiste(tareaCheck.hasTarea(selectTarea(data.tareasId)?.label)))
									}
									//defaultValue="Afilia"
									options={tareasOptions}
									required
								/>     
							</Grid>
						</Grid>
					
					{!hide.deletedObs && (
						<Grid width gap="inherit" col>
							<Grid width gap="inherit">
								<Grid width="50%">
									<InputMaterial
									id="deletedDate"
									label="Fecha Baja"
									error={!!errors.deletedDate}
									helperText={errors.deletedDate ?? ""}
									value={data.deletedDate}
									disabled={disabled.deletedDate ?? false}
									onChange={(value, _id) => onChange({ deletedDate: value })}
									/>
								</Grid>
								<Grid width="50%">
									<InputMaterial
									id="deletedBy"
									label="Usuario Baja"
									error={!!errors.deletedBy}
									helperText={errors.deletedBy ?? ""}
									value={data.deletedBy}
									disabled={disabled.deletedBy ?? false}
									onChange={(value, _id) => onChange({ deletedBy: value })}
									/>
								</Grid>
							</Grid>
							<Grid width="full" gap="inherit">
								<InputMaterial 
								id="deletedObs"
								label="Observaciones Baja"
								error={!!errors.deletedObs}
								helperText={errors.deletedObs ?? ""}
								value={data.deletedObs}
								disabled={disabled.deletedObs ?? false}
								onChange={(value, _id) => onChange({ deletedObs: value })}
								/>
							</Grid>
						</Grid>
						)}
					</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Button
					className="botonAzul"
					width={25}
					onClick={() => (onClose(true))}
					disable ={tareaExiste}
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
