import React from "react";
import styles from "./EmpresaDetails.module.css";
import Formato from "../../../helpers/Formato";
import Grid from "../../../ui/Grid/Grid";
import InputMaterial from "../../../ui/Input/InputMaterial";

const EmpresaDetails = ({ data }) => {
	data ??= {};

	const im = {
		variant: "standard",
		padding: "0rem 0.5rem",
	};

	const valor = (valor) => valor ? valor : " ";

	const ciiu = (cod, desc) => {
		let ret = `${cod ?? ""}`;
		if (desc) {
			if (ret) ret = `${ret} - `;
			ret = `${ret}${desc}`;
		}
		return ret;
	};

	return (
		<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos de la empresa
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<InputMaterial
					label="CUIT"
					value={valor(Formato.Cuit(data.cuit))}
					width="25"
					{...im}
				/>
				<InputMaterial
					label="Razon Social"
					value={valor(data.razonSocial)}
					{...im}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<InputMaterial
					label="Telefono"
					value={valor(data.telefono)}
					{...im}
				/>
				<InputMaterial
					label="Correo"
					value={valor(data.email)}
					{...im}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<InputMaterial
					label="Actividad principal"
					value={valor(ciiu(
						data.actividadPrincipalId,
						data.actividadPrincipalPeriodo
					))}
					{...im}
				/>
				<InputMaterial
					label="CIIU 1"
					value={valor(ciiu(data.ciiU1, data.ciiU1Descripcion))}
					{...im}
				/>
				<InputMaterial
					label="CIIU 2"
					value={valor(ciiu(data.ciiU2, data.ciiU2Descripcion))}
					{...im}
				/>
				<InputMaterial
					label="CIIU 3"
					value={valor(ciiu(data.ciiU3, data.ciiU3Descripcion))}
					{...im}
				/>
			</Grid>
			<Grid full="width">
				<Grid className={styles.grupo} col full>
					<Grid full="width">
						<Grid className={styles.titulo} grow>
							Domicilio administrativo
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<InputMaterial
							label="Calle"
							value={valor(data.domicilioCalle)}
							{...im}
						/>
						<Grid full="width" gap="5px">
							<InputMaterial
								label="Nro"
								value={valor(data.domicilioNumero)}
								{...im}
							/>
							<InputMaterial
								label="Piso"
								value={valor(data.domicilioPiso)}
								{...im}
							/>
							<InputMaterial
								label="Dpto"
								value={valor(data.domicilioDpto)}
								{...im}
							/>
							<InputMaterial
								label="Sector"
								value={valor(data.domicilioSector)}
								{...im}
							/>
							<InputMaterial
								label="Torre"
								value={valor(data.domicilioTorre)}
								{...im}
							/>
							<InputMaterial
								label="Manzana"
								value={valor(data.domicilioManzana)}
								{...im}
							/>
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<InputMaterial
							label="Localidad"
							value={valor(data.domicilioLocalidad)}
							{...im}
						/>
						<InputMaterial
							label="Provincia"
							value={valor(data.domicilioProvincia)}
							{...im}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default EmpresaDetails;
