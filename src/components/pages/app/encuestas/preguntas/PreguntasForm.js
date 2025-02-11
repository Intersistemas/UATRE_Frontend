import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import moment from "moment";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CodSeccional } from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";

import { Dialog, DialogActions, DialogContent, Typography } from "@mui/material";


//#endregion delegacionSelect Options

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};



const PreguntasForm = ({
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

	console.log("Este console, es de hide, en el archivo PREGUNTASS_FORMM", hide)
	console.log("Este console, es de request, en el archivo PREGUNTASS_FORMM", request)
	console.log("Este console, es de Seccionales_Data, en el archivo PREGUNTASS_FORMM ",data);

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	const getValue = (v) => data[v] ?? "";

	useEffect(()=>{
		//format("YYYY-MM-DD")
		moment(getValue("fechaFinalizacion")).format("YYYY-MM-DD")
		onChange({fecha: moment(data.fecha).format("YYYY-MM-DD")});
		onChange({fechaFinalizacion: moment(data.fechaFinalizacion).format("YYYY-MM-DD")});
	},[]);

	//#region Alert
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogTexto, setDialogTexto] = useState("");


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

	//#endregion Carga inicial
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
						
						<Grid gap="inherit">
							<InputMaterial
								type="date"
								id="fecha"
								label="Fecha"

								value={moment(getValue("fecha")).format("YYYY-MM-DD")}
								error={!!errors.fecha}
								helperText={errors.fecha ?? ""}
								onChange={(fecha)=>onChange({fecha})}
								disabled={disabled.fecha ?? false}
								
							/>						
						</Grid>
						
						<Grid width="full" gap="inherit">
							<InputMaterial
					 			id="tipoPregunta"
					 			label="Tipo de Pregunta"
					 			error={!!errors.tipoPregunta}
					 			helperText={errors.tipoPregunta ?? ""}
					 			value={data.tipoPregunta}
					 			disabled={disabled.tipoPregunta ?? false}
					 			onChange={(value, _id) => onChange({ tipoPregunta: value })}
					 		/>
							
						</Grid>
						
						<Grid width="full" gap="inherit">
							<InputMaterial
					 			id="enunciado"
					 			label="Enunciado"
					 			error={!!errors.enunciado}
					 			helperText={errors.enunciado ?? ""}
					 			value={data.enunciado}
					 			disabled={disabled.enunciado ?? false}
					 			onChange={(value, _id) => onChange({ enunciado: value })}
					 		/>
							
						</Grid>
				
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

export default PreguntasForm;
