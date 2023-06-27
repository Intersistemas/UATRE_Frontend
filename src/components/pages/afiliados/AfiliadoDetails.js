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
	console.log('props.config**',props.config);
	const config = props.config;
	const data = config.data ?? {};
	const tab = config.tab ?? 0;
	const ddjj = config.ddjj ?? 0;
	const empresa = config.empresa ?? {};
	const [hotField, setHotField] = useState();
	

	const classes = useStyles();

	useEffect(()=>
	{
		switch (tab) {
			//case 0: break;
			case 0:
				{//#region  Tab 0 AFILIADOS
				setHotField(<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
				<Grid full="width">
					<Grid className={styles.titulo} grow>
						Información Detallada del Afiliado: ({Formato.Cuit(data.cuil) ?? " "}) {data.nombre ?? " "} 
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
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CUIL"  value={Formato.Cuit(data.afipcuil) ?? " "} /> 													
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Tipo y Nro. Documento" value={`${data.afipTipoDocumento ?? " "} ${Formato.DNI(data.afipNumeroDocumento) ?? " "}`}/*{data.afipNumeroDocumento ?? " "}*/ />
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Nombre Real" value={data.afipApellido ?? " "} /*{data.afipNombre ?? " "} */ />
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Tipo Clave" value={data.afipTipoClave ?? " "} />	
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Estado Clave" value={data.afipEstadoClave ?? " "} />							
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Fecha Fallecimiento" value={ data.afipFechaFallecimiento=="0001-01-01T00:00:00" ? " " : data.afipFechaFallecimiento ?? " " } />
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Actividad Principal" value={data.afipActividadPrincipal ?? " "}/>
						</Grid>
						
						<Grid style={{ padding: "0rem 1rem"}}>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Periodo Actividad" value={data.afipPeriodoActividadPrincipal ?? " "}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Dirección" value={data.afipDomicilioDireccion ?? " "}/>	
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Localidad" value={data.afipDomicilioLocalidad ?? " "}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Codigo Postal" value={data.afipDomicilioCodigoPostal ?? " "}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Povincia" value={data.afipDomicilioProvincia ?? " "}/>
							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Domicilio Adicional" value={data.afipDomicilioDatoAdicional ?? " "}/>
  							<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Domicilio Tipo Adicional" value={data.afipDomicilioTipoDatoAdicional ?? " "}/>
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
				  Informacion Detallada de DDJJUatre - ({Formato.Cuit(data.cuil) ?? " "}) {data.nombre ?? " "} - Periodo: {ddjj.periodo}
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
						<InputMaterial padding="0rem 0.5rem"  width= "90"  variant="standard" size="small" label="CUIT" value={empresa.cuit ? Formato.Cuit(empresa.cuit) : " "} />
						<InputMaterial padding="0rem 0.5rem"  width= "150" variant="standard" size="small" label="Razón Social" value={empresa.razonSocial ?? " "} />
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Localidad" value={empresa.localidad ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Provincia" value={empresa.provincia ?? " "}/>	
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CIIU1" value={empresa.ciiU1Descripcion ?? " "}/>							
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CIIU2" value={empresa.ciiU2Descripcion ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="CIIU2" value={empresa.ciiU3Descripcion ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Situación Rural" value={ddjj.condicionRural ?? " "}/>
				 	</Grid>
  

					<Grid style={{ padding: "0rem 1rem"}}>
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Zona" value={ddjj.zona ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Zona" value={ddjj.zonaDescripcion ?? " "} />
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Mod.Contratación" value={ddjj.modalidad ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Modalidad de Contratación" value={ddjj.modalidadDescripcion ?? " "}/>	
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Actividad" value={ddjj.actividad ?? " "}/>							
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Actividad" value={ddjj.actividadDescripcion ?? " "}/>
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Cond.CUIL" value={ddjj.cuilCondicion ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Condición de CUIL" value={ddjj.cuilCondicion ?? " "}/>
					</Grid>

					<Grid style={{ padding: "0rem 1rem"}}>
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Situación de CUIL" value={ddjj.cuilSituacion ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Situación de CUIL" value={" "} />
						<InputMaterial padding="0rem 0.5rem" width= "50" variant="standard" size="small" label="Cód.Siniestro" value={ddjj.siniestroCod ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Siniestro" value={" "}/>	
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Reducción" value={ddjj.reduccion?? " "}/>							
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Importes" value={" "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Cantidad Hs Extras" value={ddjj.hsExtrasCantidad ?? " "}/>
						<InputMaterial padding="0rem 0.5rem"  variant="standard" size="small" label="Dias Trabajados" value={ddjj.diasTrabajados ?? " "}/>
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
		<div className={styles.contenedor}>
			{hotField}
		</div>

	);
};

export default AfiliadoDetails;
