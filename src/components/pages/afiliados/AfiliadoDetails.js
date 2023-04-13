import React, { useEffect, useState } from "react";
import Formato from "../../helpers/Formato";
import Grid from "../../ui/Grid/Grid";
import styles from "./AfiliadoDetails.module.css";

const AfiliadoDetails = (props) => {
	const config = props.config;
	const data = config.data ?? {};
	const tab = config.tab ?? 0;
	const ddjj = config.ddjj ?? 0;
	const empresa = config.empresa ?? {};
	const [hotFiel, setHotField] = useState();
	

	useEffect(()=>
	{
		switch (tab) {
			//case 0: break;
			case 0:
			  {//#region  Tab 0 AFILIADOS
				setHotField(<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
			  <Grid full="width">
				  <Grid className={styles.titulo} grow>
					  Informacion Detallada de
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
							  Datos AFIP:
						  </Grid>
					  </Grid>
					  <Grid full="width" gap="5px">
						  <Grid block basis='5%' className={styles.label}>
							  CUIL:
						  </Grid>
						  <Grid block basis="8%" className={styles.data}>
							  {data.afipcuil ?? ""}
						  </Grid>
  
						  <Grid block basis="12%" className={styles.label}>
							  Tipo y Nro. Documento:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipTipoDocumento ?? ""} {data.afipNumeroDocumento ?? ""}
						  </Grid>
  
						  <Grid block basis="7%" className={styles.label}>
							  Nombre Real:
						  </Grid>
						  <Grid block basis="20%" className={styles.data}>
							  {data.afipApellido ?? ""} {data.afipNombre ?? ""}
						  </Grid>
  
						  <Grid block basis="6%" className={styles.label}>
							  Tipo Clave:
						  </Grid>
						  <Grid block basis="5%" className={styles.data}>
							  {data.afipTipoClave ?? ""}
						  </Grid>
  
						  <Grid block basis="7%" className={styles.label}>
							  Estado Clave:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipEstadoClave ?? ""}
						  </Grid>
						  
					  </Grid>
  
					  <Grid full="width" gap="5px">
						  <Grid block basis="10%" className={styles.label}>
							  Fecha Fallecimiento:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipFechaFallecimiento ?? ""}
						  </Grid>  
						  <Grid block basis="10%" className={styles.label}>
						  Actividad Principal:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipActividadPrincipal ?? ""}
						  </Grid>
						  <Grid block basis="10%" className={styles.label}>
								  Periodo Actividad:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipPeriodoActividadPrincipal ?? ""}
						  </Grid>
					  </Grid>
  
					  <Grid full="width" gap="5px">
						  <Grid block basis="7%" className={styles.label}>
							  Dirección:
						  </Grid>
						  <Grid block basis="20%" className={styles.data}>
							  {data.afipDomicilioDireccion ?? ""}
						  </Grid>
  
						  <Grid block basis="7%" className={styles.label}>
							  Localidad:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipDomicilioLocalidad ?? ""}
						  </Grid>
  
						  <Grid block basis="10%" className={styles.label}>
							  Codigo Postal:
						  </Grid>
						  <Grid block basis="6%" className={styles.data}>
							  {data.afipDomicilioCodigoPostal ?? ""}
						  </Grid> 
						  <Grid block basis="7%" className={styles.label}>
							  Povincia:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipDomicilioProvincia ?? ""}
						  </Grid>
  
						  <Grid block basis="14%" className={styles.label}>
							  Domicilio Adicional:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipDomicilioDatoAdicional ?? ""}
						  </Grid>

						  <Grid block basis="17%" className={styles.label}>
							   Domicilio Tipo Adicional:
						  </Grid>
						  <Grid block basis="10%" className={styles.data}>
							  {data.afipDomicilioTipoDatoAdicional ?? ""}
						  </Grid>
  
					  </Grid>
				  </Grid>
			  </Grid>
		  </Grid>)
		  //#endregion}
			  }
			  break;
			  case 1:
				{//#region  Tab 0 AFILIADOS
				  setHotField(<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
				<Grid full="width">
					<Grid className={styles.titulo} grow>
						Informacion Detallada de
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
								Datos AFIP:
							</Grid>
						</Grid>
						<Grid full="width" gap="5px">
							<Grid block basis='5%' className={styles.label}>
								CUIL:
							</Grid>
							<Grid block basis="8%" className={styles.data}>
								{data.afipcuil ?? ""}
							</Grid>
	
							<Grid block basis="12%" className={styles.label}>
								Tipo y Nro. Documento:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipTipoDocumento ?? ""} {data.afipNumeroDocumento ?? ""}
							</Grid>
	
							<Grid block basis="7%" className={styles.label}>
								Nombre Real:
							</Grid>
							<Grid block basis="20%" className={styles.data}>
								{data.afipApellido ?? ""} {data.afipNombre ?? ""}
							</Grid>
	
							<Grid block basis="6%" className={styles.label}>
								Tipo Clave:
							</Grid>
							<Grid block basis="5%" className={styles.data}>
								{data.afipTipoClave ?? ""}
							</Grid>
	
							<Grid block basis="7%" className={styles.label}>
								Estado Clave:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipEstadoClave ?? ""}
							</Grid>
							
						</Grid>
	
						<Grid full="width" gap="5px">
							<Grid block basis="10%" className={styles.label}>
								Fecha Fallecimiento:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipFechaFallecimiento ?? ""}
							</Grid>  
							<Grid block basis="10%" className={styles.label}>
							Actividad Principal:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipActividadPrincipal ?? ""}
							</Grid>
							<Grid block basis="10%" className={styles.label}>
									Periodo Actividad:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipPeriodoActividadPrincipal ?? ""}
							</Grid>
						</Grid>
	
						<Grid full="width" gap="5px">
							<Grid block basis="7%" className={styles.label}>
								Dirección:
							</Grid>
							<Grid block basis="20%" className={styles.data}>
								{data.afipDomicilioDireccion ?? ""}
							</Grid>
	
							<Grid block basis="7%" className={styles.label}>
								Localidad:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipDomicilioLocalidad ?? ""}
							</Grid>
	
							<Grid block basis="10%" className={styles.label}>
								Codigo Postal:
							</Grid>
							<Grid block basis="6%" className={styles.data}>
								{data.afipDomicilioCodigoPostal ?? ""}
							</Grid> 
							<Grid block basis="7%" className={styles.label}>
								Povincia:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipDomicilioProvincia ?? ""}
							</Grid>
	
							<Grid block basis="14%" className={styles.label}>
								Domicilio Adicional:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipDomicilioDatoAdicional ?? ""}
							</Grid>
  
							<Grid block basis="17%" className={styles.label}>
								 Domicilio Tipo Adicional:
							</Grid>
							<Grid block basis="10%" className={styles.data}>
								{data.afipDomicilioTipoDatoAdicional ?? ""}
							</Grid>
	
						</Grid>
					</Grid>
				</Grid>
			</Grid>)
			//#endregion}
				}
				break;
			case 2:
			  {//#region  Tab 1 DDJJ UATRE
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
						  Empresa:
					  </Grid>
				  </Grid>
				  <Grid full="width" gap="5px">
					  <Grid block basis='5%' className={styles.label}>
						  CUIT:
					  </Grid>
					  
					  <Grid block basis="8%" className={styles.data}>
						  {empresa.cuit ?? ""}
					  </Grid>
  
					  <Grid block basis="7%" className={styles.label}>
						  Razón Social:
					  </Grid>
					  <Grid block basis="15%" className={styles.data}>
						  {empresa.razonSocial ?? ""}
					  </Grid>
  
					  <Grid block basis="7%" className={styles.label}>
						  Localidad Empleador:
					  </Grid>
					  <Grid block basis="20%" className={styles.data}>
						  Descripcion Localidad
					  </Grid>
  
					  <Grid block basis="6%" className={styles.label}>
						  Provincia Empleador:
					  </Grid>
					  <Grid block basis="5%" className={styles.data}>
						  Descripcion Provincia
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
					  <Grid block basis="10%" className={styles.label}>
						 Código de Zona:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
						 Zona:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
						 Código de Modalidad de Contratación:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Modalidad de Contratación:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
						 Código de Actividad:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
						 Actividad:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
						 Código de Condición de CUIL:
					  </Grid>
					  <Grid block basis="10%" className={styles.label}>
					  	Condición de CUIL:
					  </Grid>
				  </Grid>
  
				  <Grid full="width" gap="5px">
				  	  <Grid block basis="10%" className={styles.label}>
						 Código de Situación de CUIL:
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
					  <Grid block basis="10%" className={styles.label}>
					  	Dias Trabajados:
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

			  case 3:
					setHotField()
				break;
				case 4:
					setHotField()
				break;
				case 5:
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
			{hotFiel}
		</div>

	);
};

export default AfiliadoDetails;
