import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import moment from "moment";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { CodSeccional } from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import classes from "./EncuestasForm.module.css";
import useQueryState from "components/hooks/useQueryState";
import { Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import FormatearFecha from "components/helpers/FormatearFecha";

//-------------------------------------------------------------------request
//#region estadoSelect Options
const estadoDefOption = {};
const estadoSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.descripcion, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion estadoSeccionalSelect Options

//#region provinciaSelect Options
const provinciaDefOption = {};
const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion provinciaSelect Options

//#region seccionalesSelect Options
const seccionalDefOption = {};
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: `${r.codigo}-${r.descripcion}`, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion seccionalesSelect Options

//#region localidadSelect Options
const localidadDefOption = {};
const localidadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.codPostal, r.nombre].join(" - "),
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion localidadSelect Options

//#region delegacionSelect Options
const delegacionDefOption = {};
const delegacionSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion delegacionSelect Options

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};
const fechaInicio = new Date();



const SeccionalesForm = ({
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

	console.log("Este console, es de hide, en el archivo ENCUESTAS_FORM", hide)
	console.log("Este console, es de request, en el archivo ENCUESTAS_FORM", request)
	console.log("Este console, es de Seccionales_Data, en el archivo ENCUESTAS_FORM ",data);

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
	//#endregion

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
								label="Fecha Ingreso"

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

								value={moment(getValue("fechaFinalizacion")).format("YYYY-MM-DD")}
								error={!!errors.fechaFinalizacion}
								helperText={errors.fechaFinalizacion ?? ""}
								onChange={(fechaFinalizacion)=>onChange({fechaFinalizacion})}
								disabled={disabled.fechaFinalizacion ?? false}
								
							/>		
													
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

export default SeccionalesForm;
