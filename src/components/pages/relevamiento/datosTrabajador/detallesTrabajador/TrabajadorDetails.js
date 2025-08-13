import React, { useEffect, useState } from "react";
import Formato from "components/helpers/Formato";
import Grid from "components/ui/Grid/Grid";
import IM from "components/ui/Input/InputMaterial";
import styles from "./TrabajadorDetails.module.css";

/** @type {IM} */
const InputMaterial = (p) => <IM variant="standard" size="small" {...p} />;

const TrabajadorDetails = (props) => {

	console.log("config",props.config)
	const config = props.config;
	const data = config.data ?? {};
	const tab = config.tab ?? 0;
	const [hotField, setHotField] = useState();


	const _ = require('lodash');
 
	const validar = (value) =>{

		
		if (value === "Empresa no existente") return "EMPRESA NO REGISTRADA";

		if (!value) return "";

		if (_.includes(value, "-") && _.includes(value, ":")){ //SI ES UNA FECHA
			return Formato.Fecha(value);
		}

		if (_.isString(value)){
			if (value.trim() === "") {
				return " ";
			} else return value;
		} 
 
		return value;

	}

	useEffect(() => {
		switch (tab) {
			case 0:
				//#region  Tab 0 AFILIADOS
				setHotField(
					<Grid className={`${styles.fondo} ${styles.grupo}`} col>
						<Grid className={`${styles.contenido} ${styles.titulo}`} gap="1rem">
							<Grid>Condicion Laboral:</Grid>
							
						</Grid>
						<Grid className={styles.grupo} col full>
							<Grid className={styles.contenido} gap="1rem">
							
								<Grid width>
									
									<InputMaterial label="Registrado"  value={validar(data.registrado === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Categorizado"  value={validar(data.bienCategorizado === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Equipamiento"  value={validar(data.equipamiento === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Indumentaria"  value={validar(data.indumentariaTrab === "S" ? "SI" : "NO")}/> 
									{/* <InputMaterial label="Fecha de carga" width="8rem" value={validar(data.createdDate)}/> */}
									<InputMaterial label="Jornada Horario"  value={validar(data.jornadaHorarioDescripcion)}/>
									<InputMaterial label="Observaciones"   value={validar(!data.observacionCondicionLaboral ? "-" : data.observacionCondicionLaboral)}/>

								</Grid>		
							</Grid>
						</Grid>
						{/* ----------------------------------------- */}
						<Grid className={`${styles.contenido} ${styles.titulo}`} gap="1rem">
							<Grid>Condiciones Habitacionales del Trabajador:</Grid>
							
						</Grid>
						<Grid className={styles.grupo} col full>
							<Grid className={styles.contenido} gap="1rem"> 
							
								<Grid width> 
									
									<InputMaterial label="EstadoVivienda"  value={validar(data.estadoVivienda === "B" ? "BUENA" : data.estadoVivienda === "M" ? "MALA" : "ACEPTABLE")}/>
									<InputMaterial label="CantidadIntegrantes"  value={validar(data.cantidadIntegrantesVivienda === "S" ? "SI" : "NO" === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Electricidad"  value={validar(data.serviciosElectricidad === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Gas"  value={validar(data.serviciosGas === "S" ? "SI" : "NO")}/> 
									{/* <InputMaterial label="Fecha de carga" width="8rem" value={validar(data.createdDate)}/> */}
									<InputMaterial label="Agua Potable"  value={validar(data.serviciosAguaPotable === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Internet"   value={validar(data.serviciosInternet === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Hijos"   value={validar(data.hijos === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Mayores"   value={validar(data.hijosMayores === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Trabaja"   value={validar(data.hijosMayoresTrabaja === "S" ? "SI" : "NO")}/>
									<InputMaterial label="IdentificarCondicionLaboral"   value={validar(data.hijosMayoresTrabajanIr === "S" ? "SI" : "NO")}/>
									<InputMaterial label="Obserbaciones"   value={validar(!data.observacionesCondicionHabitacional ? "-" : data.observacionesCondicionHabitacional)}/>

								</Grid>		
							</Grid>
						</Grid>
						
					</Grid>
				);
				//#endregion
				break;
	
			default:
				setHotField()
			  break;
		}
	}, [config ]);

	
	return (
		<>
			{hotField}
		</>

	);
};

export default TrabajadorDetails;
