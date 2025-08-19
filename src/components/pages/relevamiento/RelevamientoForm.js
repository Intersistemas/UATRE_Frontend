
// //---------------------------------------------------------------------------------------------



import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import moment from "moment";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import classes from "./EncuestasForm.module.css";
import { Dialog,  DialogContent, Typography } from "@mui/material";
const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};


const RelevamientoForm = ({
	data = {},
	title = "",
	disabled = {},
	//el hide es para ocultar campos que no se usan en este formulario
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

	console.log("Este console, es de HIDE, en el archivo ENCUESTAS_FORM@@@@@@@@@@@@@@@@@|||||||||" , hide)
	console.log("Este console, es de request, en el archivo ENCUESTAS_FORM@@@@@@@@@@@@@@@@@|||||||||", request)
	console.log("Este console, es de Seccionales_Data, en el archivo ENCUESTAS_FORM@@@@@@@@@@@@@@@@@||||||||| ",data);

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	const getValue = (v) => data[v] ?? "";

	useEffect(()=>{
		//format("YYYY-MM-DD")
		moment(getValue("fechaFinalizacion")).format("YYYY-MM-DD")
		onChange({fecha: moment(data.fecha).format("YYYY-MM-DD")});
		// onChange({fechaFinalizacion: moment(data.fechaFinalizacion).format("YYYY-MM-DD")});
		onChange({fechaFinalizacion:  "2099-12-12" || moment(data.fechaFinalizacion).format("YYYY-MM-DD") })
	},[]);

	const [openDialog, setOpenDialog] = useState(false);
	const [dialogTexto, setDialogTexto] = useState("");
	const [procesando, setProcesando] = useState(loading);


		 useEffect(() => {

			setProcesando(loading);

			if (errors) {
			  setProcesando(null);
			  return;
			}    
		  }, [errors, loading]);

		
		// Estado para la fecha actual
		const [fechaActual, setFechaActual] = useState(moment().format("YYYY-MM-DD"));
		
		// Estado para la fecha seleccionada por el usuario (por defecto "2099-12-12" si no hay valor en data)
		const [fechaFinalizacion, setfechaFinalizacion] = useState(
			data.fechaFinalizacion ? moment(data.fechaFinalizacion).format("YYYY-MM-DD") : "2099-12-12"
		);

// Manejar cambios en la fecha
const handleFechaChange = (e) => {
	let nuevaFecha;
  
	// Validar si "e" es un evento o un valor directo
	if (e && e.target && e.target.value) {
	  nuevaFecha = e.target.value; // Si es un evento normal
	} else if (e && e.isValid && e.isValid()) {
	  nuevaFecha = e.format("YYYY-MM-DD"); // Si es un objeto moment
	} else {
	  console.error("Error: Evento no válido en handleFechaChange", e);
	  return;
	}
  
	// Validar si la fecha seleccionada es anterior a la actual
	if (moment(nuevaFecha).isBefore(moment().format("YYYY-MM-DD"))) {
	 console.error("Error: La fecha no puede ser anterior a la fecha actual.");
	  setfechaFinalizacion(fechaActual); // Restablece a la fecha actual
	  onChange({ fechaFinalizacion: fechaActual }); // Actualiza en el formulario
	} else {
	  setfechaFinalizacion(nuevaFecha); // Actualiza el estado con la nueva fecha
	  onChange({ fechaFinalizacion: nuevaFecha }); // Guarda la fecha modificada
	}
  };
  

	//___________________________________________________________________________
	return (
		<>
			<div>
				<Dialog onClose={()=>(setOpenDialog(false))} open={openDialog}>
					<DialogContent dividers>
						<Typography 
						gutterBottom
						style={{whiteSpace: 'pre-line'}}
						>{dialogTexto}</Typography>
			
					</DialogContent>
					
				</Dialog>
			</div>
			<Modal show onHide={() => onClose()} size="lg" centered>
				<Modal.Header className={modalCss.modalCabecera}>
					<h3>{title}</h3>
				</Modal.Header>
				<Modal.Body>
					{ 
					<Grid col full gap="15px">
						{/* -----------------------------------------------------
						ESTOS CAMBIOS SON PARA TODOS LOS FORMULARIOS 
						\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
						|||||||||||||||||||||||||||||||||||||||||||||||||||||||| */}
						<Grid gap="inherit">

							<InputMaterial
								type="date"
								id="fecha"
								label="Fecha Inicio"
								value={moment(getValue("fecha")).format("YYYY-MM-DD")}
								error={!!errors.fecha}
								helperText={errors.fecha ?? ""}
								onChange={(fecha)=>onChange({fecha})}
								disabled={disabled.fecha ?? false}
								
							/>						
						</Grid>
						<Grid gap="inherit">
							

								<InputMaterial
								type="date"
								id="fechaFinalizacion"
								label="Fecha Fin"
								value={fechaFinalizacion}  // Muestra la fecha seleccionada o la predeterminada
								error={!!errors.fechaFinalizacion}
								helperText={errors.fechaFinalizacion ?? ""}
								onChange={handleFechaChange} // Usa la función corregida
								disabled={disabled.fechaFinalizacion ?? false}
								
								/>
								{errors.fechaFinalizacion && (
									<div style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
										{errors.fechaFinalizacion}
									</div>
									)}

				
						</Grid>
						<Grid width="full" gap="inherit">
							<InputMaterial
					 			id="tema"
					 			label="Tema"
					 			error={!!errors.tema}
					 			helperText={errors.tema ?? ""}
					 			value={data.tema}
					 			disabled={disabled.tema ?? false}
					 			onChange={(value, _id) => onChange({ tema: value })}
					 		/>
							
						</Grid> 

						{/* -----------------------------------------------------
						\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
						|||||||||||||||||||||||||||||||||||||||||||||||||||||||| */}
						
					



						{/* esta condicion !hide.deletedObs, me permite ocultar el campo de observaciones de baja */}
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
						onClick={() => onClose(true)}
						disabled={procesando}
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

export default RelevamientoForm;


// //---------------------------------------------------------------------------------------------


