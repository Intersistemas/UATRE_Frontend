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

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};
 

const TareaUsuarioForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,

}) => {
	data ??= {}; 
	//console.log('Form_tarea_data:',data)
	 //console.log('data_tarea:',data)
	 //console.log('delegaciones_tarea:',delegaciones)
	//console.log('Form_tarea_errors:',errors)
	console.log('Form_tarea_disabled:',disabled)
	
	disabled ??= {};
	hide ??= {};
	errors ??= {};
	onChange ??= onChangeDef;
	onClose ??= onCloseDef;


	const [modulos, setModulos] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
		buscar: "",
		buscado: "",
		options: [],
		selected:  data.modulosId,
	});

	const [tareas, setTareas] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
		buscar: "",
		buscado: "",
		options: [],
		selected: data.tareasId,
	});
	

	const { isLoading, error, sendRequest: request } = useHttp();	

	//#region TRAIGO TODOS LOS MODULOS DE UNA VEZ
	useEffect(() => {
		
		const processModulos = async (moduloObj) => {
			
			const modulosTodos = moduloObj.map((modulo) => {
			return { value: modulo.id, label: modulo.nombre };
			});
			console.log('modulos',modulos);
			setModulos((o) => ({...o, options: modulosTodos}));
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


	//#region TRAIGO TODAS LAS TAREAS DEL MODULO
	useEffect(() => {

		const processTareas = async (tareasObj) => {
			const tareasModulo = tareasObj?.map((tarea) => {
				return { value: tarea.id, label: tarea.nombre };
			});
			console.log('tareasModulo',tareasModulo)
			setTareas((o)=>({...o,options:tareasModulo}))
		};
		request(
			{
			baseURL: "Seguridad",
			endpoint: `/Tareas?ModulosId=${data.modulosId}`,
			method: "GET",
			},
			async (ok) => (processTareas(ok)),
			async (error) => ((console.log('GetTareas?ModulosId_error',error))),
			async () => (console.log('GetTareas?ModulosId_vacio')),
		);
	},[data.modulosId]);
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
									id="modulosId"
									name="modulosId"
									label="Modulo"
									error={errors.modulosId} 
									helperText={errors.modulosId ?? ""}
									value={modulos.selected}
									disabled={disabled.modulosId ?? false}
									onChange={(selected) => (
								
											setTareas((o) => ({ ...o, selected:{} })),
											setModulos((o) => ({ ...o, selected })),
											onChange({modulosId: selected}),
											onChange({tareasId: ""})
										)									
									}
									//defaultValue="Afilia"
									options={modulos.options}
									required
								/>     
							</Grid>
							<Grid width="50%">
								<SelectMaterial
									id="tareasId"
									name="tareasId"
									label="Tarea"
									error={errors.tareasId} 
									helperText={errors.tareasId ?? ""}
									value={tareas.selected}
									disabled={disabled.tareasId ?? false}
									onChange={(selected) =>
										(
											setTareas((o) => ({ ...o, selected })),
											onChange({tareasId: selected})
										)
									}
									//defaultValue="Afilia"
									options={tareas.options}
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
					disabled ={errors?.tareaExiste}
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

export default TareaUsuarioForm;
