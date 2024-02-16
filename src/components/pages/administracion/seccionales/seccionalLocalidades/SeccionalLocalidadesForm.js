import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import CheckboxMaterial from "components/ui/Checkbox/CheckboxMaterial";
import UseKeyPress from "components/helpers/UseKeyPress";
import moment from "moment";
import classes from "./SeccionalLocalidadesForm.module.css";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import useHttp from "../../../../hooks/useHttp";


const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const SeccionalLocalidadesForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	loading = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	console.log('SeccionalLocalidadesForm_Data',data);
	console.log('SeccionalLocalidadesForm_errors',errors);
	
	
	const [localidadBuscar, setLocalidadBuscar] = useState("");
	const [localidadesOptions, setLocalidadesOptions] = useState([""]); //LISTA DE TODAS LAS LOCALIDADES  

	const [localidadSeccional, setLocalidadSeccional] = useState({});


//TRAIGO TODAS LAS LOCALIDADES una vez
	useEffect(() => {

		if (data?.refLocalidadId && data?.refLocalidadId >= 1){ 
			const localidad = data?.localidadesTodas?.find((localidad) =>
			localidad.id === data?.refLocalidadId)
			
			console.log('OBJ_localidad ',localidad)
			setLocalidadSeccional({...localidad, value: localidad?.id ?? 0, label: localidad?.nombre});

		}
	},[data?.refLocalidadId]);


	useEffect(() => {
		console.log('localidadBuscar',localidadBuscar)
		if (localidadBuscar.length > 2) {
		const localidadesSelect = data?.localidadesTodas
			.filter((localidad) =>
			localidad.nombre.toUpperCase().includes(localidadBuscar.toUpperCase())
			)
			.map((localidad) => {
			return { value: localidad.id, label: localidad.nombre };
			});
			//console.log("localidadesSelect", localidadesSelect, localidades);
			setLocalidadesOptions(localidadesSelect);
		}     

		if (localidadBuscar === ""){
			setLocalidadesOptions([])
			setLocalidadBuscar("")
		}    
	}, [data?.localidadesTodas, localidadBuscar]);

	
	const handlerOnTextChange = (buscar) => {
		console.log("text change_buscar", buscar);
		
		setLocalidadSeccional({...localidadSeccional, label: buscar});
		setLocalidadBuscar(buscar);
		
	};
	//#endregion


	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
			<Modal.Header closeButton>{title}</Modal.Header>
			<Modal.Body>
				<div className={classes.renglon}>
					<SearchSelectMaterial
						id="refLocalidadId"
						name="refLocalidadId"
						label="Localidad"

						error={(!!errors.refLocalidadId) || (data?.localidadNombre !== localidadSeccional.label)} 
						helperText={errors.refLocalidadId ?? ""}
						value={localidadSeccional}
						disabled={disabled.refLocalidadId ?? false}
						onChange={(value, _id) => (
							onChange({ refLocalidadId: value.value }),
							onChange({ localidadNombre: value.label })
							)}
						
						options={localidadesOptions}
				
						onTextChange={handlerOnTextChange}
						required
						/>
				</div>
				<div className={classes.renglon}>
					<div className={classes.input}>
						<InputMaterial
							id="codigoPostal"
							disabled={true}
							value={localidadSeccional?.codPostal}
							label="Código Postal"
							type="text"
						/>
					</div>
					<div className={classes.input}>
						<InputMaterial
							id="provincia"
							disabled={true}
							value={localidadSeccional?.provincia}
							label="Provincia"
							type="text"
						/>
					</div>
			
				</div>

				{!hide.deletedObs &&
					<>
					<div className={classes.renglon}>
						<div className={classes.item6}>
							<InputMaterial
							id="deletedDate"
							label="Fecha Baja"
							error={!!errors.deletedDate}
							helperText={errors.deletedDate ?? ""}
							value={data?.deletedDate}
							disabled={disabled.deletedDate ?? false}
							onChange={(value, _id) => onChange({ deletedDate: value })}
							/>
						</div>
						<div className={classes.item7}>
							<InputMaterial
							id="deletedBy"
							label="Usuario Baja"
							error={!!errors.deletedBy}
							helperText={errors.deletedBy ?? ""}
							value={data?.deletedBy}
							disabled={disabled.deletedBy ?? false}
							onChange={(value, _id) => onChange({ deletedBy: value })}
							/>
						</div>
					</div>
					<div className={classes.item8}>
						<InputMaterial 
						id="deletedObs"
						label="Observaciones Baja"
						error={!!errors.deletedObs}
						helperText={errors.deletedObs ?? ""}
						value={data?.deletedObs}
						disabled={disabled.deletedObs ?? false}
						onChange={(value, _id) => onChange({ deletedObs: value })}
						/>
					</div>
					</>
				}

			</Modal.Body>
			<Modal.Footer>
				<Button  width={25} loading={loading != null} className="botonAzul" onClick={() => onClose(true)}>
					CONFIRMA
				</Button>
				<Button width={25} className="botonAmarillo" onClick={() => onClose()}>
					CANCELA
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SeccionalLocalidadesForm;
