import React, { useEffect, useState } from "react";
import Formato from "../../helpers/Formato";
import Grid from "../../ui/Grid/Grid";
import styles from "./AfiliadoDetails.module.css";


import { styled } from '@mui/material/styles';
/*import TextField from '@material-ui/core/TextField';*/
import TextField from "@mui/material/TextField";

const useStyles = styled((theme) => ({
	root: {
	  '& > *': {
		margin: theme.spacing(1),
		width: '25ch',
	  },
	},
  }));

const AfiliadoDetails = (props) => {
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
						<Grid full="width" justify="evenly">
						<	TextField variant="standard" size="small" label="CUIL"
						InputLabelProps={{style: {color: '#186090' },}} value={Formato.Cuit(data.afipcuil) ?? " "} /> 													
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Tipo y Nro. Documento" value={`${data.afipTipoDocumento ?? " "} ${Formato.DNI(data.afipNumeroDocumento) ?? " "}`}/*{data.afipNumeroDocumento ?? " "}*/ />
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Nombre Real" value={data.afipApellido ?? " "} /*{data.afipNombre ?? " "} */ />
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Tipo Clave" value={data.afipTipoClave ?? " "} />	
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Estado Clave" value={data.afipEstadoClave ?? " "} />							
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Fecha Fallecimiento" value={data.afipFechaFallecimiento ?? " "} />
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Actividad Principal" value={data.afipActividadPrincipal ?? " "}/>
						</Grid>
						
						<Grid full="width" justify="evenly">
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Periodo Actividad" value={data.afipPeriodoActividadPrincipal ?? " "}/>
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Dirección" value={data.afipDomicilioDireccion ?? " "}/>	
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Localidad" value={data.afipDomicilioLocalidad ?? " "}/>
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Codigo Postal" value={data.afipDomicilioCodigoPostal ?? " "}/>
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Povincia" value={data.afipDomicilioProvincia ?? " "}/>
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Domicilio Adicional" value={data.afipDomicilioDatoAdicional ?? " "}/>
  							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Domicilio Tipo Adicional" value={data.afipDomicilioTipoDatoAdicional ?? " "}/>
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

				  <Grid full="width" justify="evenly">
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="CUIT" value={Formato.Cuit(empresa.cuit) ?? " "} />
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Razón Social" value={empresa.razonSocial ?? " "} />
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Localidad" value={empresa.localidad ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Provincia" value={empresa.provincia ?? " "}/>	
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="CIIU1" value={empresa.ciiU1Descripcion ?? " "}/>							
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="CIIU2" value={empresa.ciiU2Descripcion ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="CIIU2" value={empresa.ciiU3Descripcion ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Situación Rural" value={ddjj.condicionRural ?? " "}/>
				 	</Grid>
  

					<Grid full="width" justify="evenly">
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Código de Zona" value={ddjj.zona ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Zona" value={ddjj.zona ?? " "} />
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Cód.Modalidad de Contratación" value={ddjj.modalidad ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Modalidad de Contratación" value={ddjj.modalidad ?? " "}/>	
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Código de Actividad" value={ddjj.actividad ?? " "}/>							
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Actividad" value={ddjj.actividad ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Cód.Condición de CUIL" value={ddjj.cuilCondicion ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Condición de CUIL" value={ddjj.cuilCondicion ?? " "}/>
					</Grid>

					<Grid full="width" justify="evenly">
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Cód.Situación de CUIL" value={ddjj.cuilSituacion ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Situación de CUIL" value={" "} />
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Codigo de Siniestro" value={ddjj.siniestroCod ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Siniestro" value={" "}/>	
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Reducción" value={ddjj.reduccion?? " "}/>							
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Importes" value={" "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Cantidad Hs Extras" value={ddjj.hsExtrasCantidad ?? " "}/>
						<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Dias Trabajados" value={ddjj.diasTrabajados ?? " "}/>
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
