import React from "react";
import Formato from "../../helpers/Formato";
import Grid from "../../ui/Grid/Grid";
import styles from "./AfiliadoDetails.module.css";

const AfiliadoDetails = (props) => {
	const config = props.config;
	const data = config.data ?? {};

	return (
		<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
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
							Id:
						</Grid>
						<Grid block basis="10%" className={styles.data}>
							{data.id ?? ""}
						</Grid>

						<Grid block basis="10%" className={styles.label}>
							Id ActividadPrincipal:
						</Grid>
						<Grid block basis="10%" className={styles.data}>
							{data.afipIdActividadPrincipal ?? ""}
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
							IdPovincia:
						</Grid>
						<Grid block basis="5%" className={styles.data}>
							{data.afipDomicilioIdProvincia ?? ""}
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
		</Grid>
	);
};

export default AfiliadoDetails;
