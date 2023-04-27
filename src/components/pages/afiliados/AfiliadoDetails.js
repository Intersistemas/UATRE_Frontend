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
						<Grid full="width" gap="5px">
						<TextField variant="standard" size="small" label="CUIL"
						InputLabelProps={{style: {color: '#186090' },}} value={data.afipcuil ?? ""} />
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Tipo y Nro. Documento" value={data.afipTipoDocumento ?? ""} /*{data.afipNumeroDocumento ?? ""}*/ />
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Nombre Real" value={data.afipApellido ?? ""} /*{data.afipNombre ?? ""} */ />
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Tipo Clave" value={data.afipTipoClave ?? ""} />	
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Estado Clave" value={data.afipEstadoClave ?? ""} />							
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Fecha Fallecimiento" value={data.afipFechaFallecimiento ?? ""} />
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Actividad Principal" value={data.afipActividadPrincipal ?? ""}/>
						</Grid>

						<Grid full="width" gap="5px">
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Periodo Actividad" value={data.afipPeriodoActividadPrincipal ?? ""}/>
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Dirección" value={data.afipDomicilioDireccion ?? ""}/>	
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Localidad" value={data.afipDomicilioLocalidad ?? ""}/>
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Codigo Postal" value={data.afipDomicilioCodigoPostal ?? ""}/>
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Povincia" value={data.afipDomicilioProvincia ?? ""}/>
							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Domicilio Adicional" value={data.afipDomicilioDatoAdicional ?? ""}/>
  							<TextField InputLabelProps={{style: {color: '#186090' },}} variant="standard" size="small" label="Domicilio Tipo Adicional" value={data.afipDomicilioTipoDatoAdicional ?? ""}/>
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
				  Informacion Detallada de DDJJUatre - Periodo: {ddjj.periodo}
			  </Grid>
		  </Grid>
		  <Grid full="width" gap="5px">
			  <Grid block basis="051px" className={styles.label}>
				  CUIL:
			  </Grid>
			  <Grid block basis="130px" className={styles.data}>
				  {Formato.Cuit(data.cuil)}
			  </Grid>
			  <Grid block basis="310px" className={styles.label}>
				  Nombre y Apellido:
			  </Grid>
			  <Grid block basis="calc(100% - 286px)" className={styles.data}>
				  {data.nombre}
			  </Grid>
		  </Grid>
		  <Grid full="width">
			  <Grid className={styles.grupo} col full>
				  <Grid full="width">
					  <Grid className={styles.titulo} grow>
						  Empresa
					  </Grid>
				  </Grid>
				  <Grid full="width" gap="5px">
					  <Grid block basis='5%' className={styles.label}>
						  CUIT:
					  </Grid>
					  
					  <Grid block basis="8%" className={styles.data}>
						  {empresa.cuit ?? ""}
					  </Grid>
  
					  <Grid block basis="9%" className={styles.label}>
						  Razón Social:
					  </Grid>
					  <Grid block basis="15%" className={styles.data}>
						  {empresa.razonSocial ?? ""}
					  </Grid>
  
					  <Grid block basis="11%" className={styles.label}>
						  Localidad:
					  </Grid>
					  <Grid block basis="15%" className={styles.data}>
						  Descripcion Localidad
					  </Grid>
  
					  <Grid block basis="11%" className={styles.label}>
						  Provincia:
					  </Grid>
					  <Grid block basis="5%" className={styles.data}>
						  Descripción Provincia
					  </Grid>
  
					  <Grid block basis="7%" className={styles.label}>
						  CIIU1:
					  </Grid>
					  <Grid block basis="5%" className={styles.data}>
					  	{empresa.ciiU1Descripcion ?? "Descripcion CIIU1"}
					  </Grid>
					  
					  <Grid block basis="7%" className={styles.label}>
						  CIIU2:
					  </Grid>
					  <Grid block basis="5%" className={styles.data}>
					  	{empresa.ciiU2Descripcion ?? "Descripcion CIIU2"}
					  </Grid>

					  <Grid block basis="7%" className={styles.label}>
						  CIIU3:
					  </Grid>
					  <Grid block basis="5%" className={styles.data}>
					  	{empresa.ciiU3Descripcion ?? "Descripcion CIIU3"}
					  </Grid>
				  </Grid>
  
				  <Grid full="width" gap="5px">
					  <Grid block basis="8%" className={styles.label}>
						 Código de Zona:
					  </Grid>
					  <Grid block basis="4%" className={styles.data}>
					  	{ddjj.zona ?? " "}
					  </Grid>
					  <Grid block basis="5%" className={styles.label}>
						 Zona:
					  </Grid>
					  <Grid block basis="17%" className={styles.label}>
						 Cód.Modalidad de Contratación:
					  </Grid>
					  <Grid block basis="1%" className={styles.data}>
					  	{ddjj.modalidad ?? " "}
					  </Grid>
					  <Grid block basis="14%" className={styles.label}>
					  	  Modalidad de Contratación:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
						 Código de Actividad:
					  </Grid>
					  <Grid block basis="2%" className={styles.data}>
					  	{ddjj.actividad ?? " "}
					  </Grid>
					  <Grid block basis="6%" className={styles.label}>
						 Actividad:
					  </Grid>
					  <Grid block basis="12%" className={styles.label}>
						 Cód.Condición de CUIL:
					  </Grid>
					  <Grid block basis="2%" className={styles.data}>
					  	{ddjj.cuilCondicion ?? ""}
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Condición de CUIL:
					  </Grid>
				  </Grid>
  
				  <Grid full="width" gap="5px">
				  	  <Grid block basis="10%" className={styles.label}>
						 Cód.Situación de CUIL:
					  </Grid>
					  <Grid block basis="2%" className={styles.data}>
					  	{ddjj.cuilSituacion ?? ""}
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Situación de CUIL:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Codigo de Siniestro:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Siniestro:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Reducción:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	 Importes:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Cantidad Hs Extras:
					  </Grid>
					  <Grid block basis="2%" className={styles.data}>
					  	{ddjj.hsExtrasCantidad ?? " "}
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Dias Trabajados:
					  </Grid>
					  <Grid block basis="2%" className={styles.data}>
					  	{ddjj.diasTrabajados ?? " "}
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Situación Rural:
					  </Grid>


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
