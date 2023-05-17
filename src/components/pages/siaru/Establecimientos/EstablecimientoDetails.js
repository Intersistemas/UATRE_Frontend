import React from "react";
import styles from "./EstablecimientoDetails.module.css";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import { TextField } from "@mui/material";

const EstablecimientoDetails = ({
	data = {},
}) => {
	if (!data) data = {};
	
	const inputLabelStyles = { color: "#186090" };

	return (
		<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos del Establecimiento
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Nro. Sucursal"
					value={Formato.Entero(data.nroSucursal) ?? ""}
					style={{ width: "25%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Nombre"
					value={data.nombre ?? ""}
					style={{ width: "100%" }}
				/>
			</Grid>
			<Grid full="width">
				<Grid className={styles.grupo} col full>
					<Grid full="width">
						<Grid className={styles.titulo} grow>
							Domicilio
						</Grid>
					</Grid>
					<Grid full="width" gap="5px">
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Calle"
							value={data.domicilioCalle ?? ""}
							style={{ width: "100%" }}
						/>
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Nro"
							value={data.domicilioNumero ?? ""}
							style={{ width: "100%" }}
						/>
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Piso"
							value={data.domicilioPiso ?? ""}
							style={{ width: "100%" }}
						/>
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Dpto"
							value={data.domicilioDpto ?? ""}
							style={{ width: "100%" }}
						/>
					</Grid>
					<Grid full="width" gap="5px">
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Provincia"
							value={data.domicilioProvincia ?? ""}
							style={{ width: "100%" }}
						/>
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Localidad"
							value={data.domicilioLocalidad ?? ""}
							style={{ width: "100%" }}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default EstablecimientoDetails;
