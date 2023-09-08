import React, { useEffect, useState } from "react";
import Formato from "../../helpers/Formato";
import Grid from "../../ui/Grid/Grid";
import styles from "./AfiliadoDetails.module.css";
import { styled } from '@mui/material/styles';
/*import InputMaterial from '@material-ui/core/InputMaterial';*/
/*import InputMaterial from "@mui/material/InputMaterial";*/
import InputMaterial from "../../ui/Input/InputMaterial";

const useStyles = styled((theme) => ({
	root: {
	  '& > *': {
		margin: theme.spacing(1),
		width: '25ch',
	  },
	},
  }));

const AfiliadoDetails = (props) => {
	console.log('AfiliadoDetails_Data:',props.config);
	const config = props.config;
	const data = config.data ?? {};
	const tab = config.tab ?? 0;
	const ddjj = config.ddjj ?? 0;
	const empresa = config.empresa ?? {};
	const [hotField, setHotField] = useState();
	

	const _ = require('lodash');

	const validar = (value) =>{

		if (_.includes(value, "-") && _.includes(value, ":")){ //SI ES UNA FECHA
			let ms = Date.parse(value)
			if (!isNaN(ms)) {
				if (ms < 0) {
					return " ";
				} else return _.split(value, 'T', 1 );
			}
		}

		if (_.isString(value)){
			if (value.trim() === "") {
				return " ";
			} else return value;
		} 
 
		return value;
		/*if (_.isDate(value)){

			if (value === "0001-01-01T00:00:00") {
				return " ";
			} else return value;
		} */
	}

	const classes = useStyles();

	useEffect(()=>
	{
		switch (tab) {
			//case 0: break;
			case 0:
				{//#region  Tab 0 AFILIADOS
				setHotField(
				<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
				<Grid full="width">
					<Grid className={styles.titulo} grow>
						Información Detallada del Afiliado: ({Formato.Cuit(data.cuil) ?? "-"}) {data.nombre ?? "-"} 
					</Grid>
				</Grid>
			
						<Grid className={styles.grupo} col full>
							
							<Grid className={styles.titulo} grow>
								Datos UATRE:
						
								<Grid style={{ padding: "0rem 1rem"}}>
									<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CUIL Validado"  value={data.cuilValidado == 0 ? " ":Formato.Cuit(data.cuilValidado)} /> 	
									<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Sexo"  value={validar(data.sexo)} /> 													
									<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Estado Civil" value={validar(data.estadoCivil)}/>
									<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Nacionalidad" value={validar(data.nacionalidad)}/>
								</Grid>		
							</Grid>
						</Grid>
				

				<Grid full="width">
					<Grid className={styles.grupo} col full>
						<Grid full="width">
							<Grid className={styles.titulo} grow>
								Datos AFIP:
							</Grid>
						</Grid>
						<Grid style={{ padding: "0rem 1rem"}}>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CUIL"  value={Formato.Cuit(data.afipcuil) ?? "-"} /> 													
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Tipo y Nro. Documento" value={`${data.afipTipoDocumento ?? " "} ${Formato.DNI(data.afipNumeroDocumento) ?? "-"}`}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Nombre Real" value={validar(data.afipApellido)}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Tipo Clave" value={validar(data.afipTipoClave)} />	
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Estado Clave" value={validar(data.afipEstadoClave)} />							
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Fecha Fallecimiento" value={validar(data.afipFechaFallecimiento)} />
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Actividad Principal" value={validar(data.afipActividadPrincipal)}/>
						</Grid>
						
						<Grid style={{ padding: "0rem 1rem"}}>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Periodo Actividad" value={validar(data.afipPeriodoActividadPrincipal)}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Dirección" value={validar(data.afipDomicilioDireccion)}/>	
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Localidad" value={validar(data.afipDomicilioLocalidad)}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Codigo Postal" value={validar(data.afipDomicilioCodigoPostal)}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Povincia" value={validar(data.afipDomicilioProvincia)}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Domicilio Adicional" value={validar(data.afipDomicilioDatoAdicional)}/>
  							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Domicilio Tipo Adicional" value={validar(data.afipDomicilioTipoDatoAdicional)}/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>)
			//#endregion}
				}
				break;
			case 1:
			  {//#region  Tab  DDJJ UATRE
		  setHotField(<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">

		  <Grid full="width">
			  <Grid className={styles.titulo} grow>
				  Informacion Detallada de DDJJUatre - ({validar(Formato.Cuit(data.cuil))}) {validar(data.nombre)} - Periodo: {ddjj.periodo}
			  </Grid>
		  </Grid>
		  <Grid full="width">
			  <Grid className={styles.grupo} col full>
				  <Grid full="width">
					  <Grid className={styles.titulo} grow>
						  Empresa
					  </Grid>
				  </Grid>

				  <Grid style={{ padding: "0rem 1rem"}}>
						<InputMaterial padding="0rem 0.5rem"  width= "90"  variant="standard" size="small" label="CUIT" value={validar(Formato.Cuit(ddjj.cuit))} />
						<InputMaterial padding="0rem 0.5rem"  width= "150" variant="standard" size="small" label="Razón Social" value={validar(ddjj.empresa)} />
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Localidad" value={validar(empresa.localidadDescripcion)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Provincia" value={validar(empresa.provinciaDescripcion)}/>	
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CIIU1" value={validar(empresa.ciiU1Descripcion)}/>							
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CIIU2" value={validar(empresa.ciiU2Descripcion)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CIIU2" value={validar(empresa.ciiU3Descripcion)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Situación Rural" value={validar(ddjj.condicionRural)}/>
				 	</Grid>
  

					<Grid style={{ padding: "0rem 1rem"}}>
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Zona" value={validar(ddjj.zona)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Zona" value={validar(ddjj.zonaDescripcion)} />
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Mod.Contratación" value={validar(ddjj.modalidad)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Modalidad de Contratación" value={validar(ddjj.modalidadDescripcion)}/>	
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Actividad" value={validar(ddjj.actividad)}/>							
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Actividad" value={validar(ddjj.actividadDescripcion)}/>
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Cond.CUIL" value={validar(ddjj.cuilCondicion)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Condición de CUIL" value={validar(ddjj.cuilCondicionDescripcion)}/>
					</Grid>

					<Grid style={{ padding: "0rem 1rem"}}>
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Situación de CUIL" value={validar(ddjj.cuilSituacion)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Situación de CUIL" value={validar(ddjj.cuilSituacionDescripcion)} />
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Siniestro" value={ddjj.siniestroCod == 1 ? "Activo" : "-"}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Siniestro" value={" "}/>	
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Reducción" value={validar(ddjj.reduccion)}/>							
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Importes" value={validar(ddjj.remuneracionImponible)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Cantidad Hs Extras" value={validar(ddjj.hsExtrasCantidad)}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Dias Trabajados" value={validar(ddjj.diasTrabajados)}/>
					</Grid>
			  </Grid>
		  </Grid>
	  </Grid>)
	  //#endregion}
			  }
			  break;
			case 2:
					setHotField()
				break;
			case 3:
					setHotField()
				break;
			case 4:
					{//#region  Tab 1 DDJJ UATRE
		  setHotField(<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
		  <Grid full="width">
			  <Grid className={styles.titulo} grow>
				  Seccional de
			  </Grid>
		  </Grid>
		  <Grid full="width" gap="5px">
			  <Grid block basis="051px" className={styles.label}>
				  CUIL:
			  </Grid>
			  <Grid block basis="140px" className={styles.data}>
				  {Formato.Cuit(data.cuil)}
			  </Grid>
			  <Grid block basis="200px" className={styles.label}>
				  Nombre y Apellido:
			  </Grid>
			  <Grid block basis="calc(100% - 286px)" className={styles.data}>
				  {data.nombre}
			  </Grid>
		  </Grid>
		  <Grid className={styles.grupo} col full>
				  <Grid full="width">
					  <Grid className={styles.titulo} grow>
						  Seccional:
					  </Grid>
				  </Grid>
				  <Grid full="width" gap="5px">
					  <Grid block basis='25%' className={styles.label}>
						  Telefono::
					  </Grid>
					  <Grid block basis="25%" className={styles.data}>
						  +54-113214578
					  </Grid>
					  <Grid block basis='25%' className={styles.label}>
						  Email:
					  </Grid>
					  <Grid block basis="25%" className={styles.data}>
						  seccionaluatre@uatre.com
					  </Grid>
				</Grid>
		 	</Grid>
	  	</Grid>)
	  //#endregion}
			  }
				break;
			default:
			  break;
		  }
	},[config])

	
	return (
		<div className={styles.afiliadoDetalle}>
			{hotField}
		</div>

	);
};

export default AfiliadoDetails;
