import React from "react";
import styles from "./EstablecimientoDetails.module.css";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import InputMaterial from "../../../ui/Input/InputMaterial";

const EstablecimientoDetails = ({ data = {} }) => {
	data ??= {};

	const im = {
		variant: "standard",
		padding: "0rem 0.5rem",
	};

	const valor = (valor) => (valor ? valor : " ");

	return (
		<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width" gap="5px">
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos del Establecimiento
				</Grid>
			</Grid>
			<Grid full="width" gap="inherit">
				<InputMaterial
					label="Nro. de Estab."
					value={valor(Formato.Entero(data.nroSucursal))}
					width="25"
					{...im}
				/>
				<InputMaterial
					label="Nombre"
					value={valor(data.nombre)}
					{...im}
				/>
			</Grid>
			<Grid full="width" gap="inherit">
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
			<Grid full="width">
				<Grid className={styles.grupo} col full>
					<Grid full="width">
						<Grid className={styles.titulo} grow>
							Domicilio
						</Grid>
					</Grid>
					<Grid full="width" gap="inherit">
						<InputMaterial
							label="Calle"
							value={valor(data.domicilioCalle)}
							{...im}
						/>
						<Grid full="width" gap="inherit">
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
					<Grid full="width" gap="inherit">
						<InputMaterial
							label="Localidad"
							value={valor(data.localidadDescripcion)}
							{...im}
						/>
						<InputMaterial
							label="Provincia"
							value={valor(data.provinciaDescripcion)}
							{...im}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default EstablecimientoDetails;
