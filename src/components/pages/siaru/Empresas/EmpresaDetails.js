import { TextField } from "@mui/material";
import React from "react";
import Formato from "../../../helpers/Formato";
import Grid from "../../../ui/Grid/Grid";
import styles from "./EmpresaDetails.module.css";

const EmpresaDetails = ({ config }) => {
	const data = config.data ?? {};
	const inputLabelStyles = { color: "#186090" };

	return (
		<Grid className={`${styles.fondo} ${styles.grupo}`} col full="width">
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					Datos de la empresa
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="CUIT"
					value={Formato.Cuit(data.cuit) ?? ""}
					style={{ width: "25%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Razon Social"
					value={data.razonSocial ?? ""}
					style={{ width: "75%" }}
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
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Calle"
							value={data.domicilioCalle ?? ""}
							style={{ width: "25%" }}
						/>
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Nro"
							value={data.domicilioNumero ?? ""}
							style={{ width: "25%" }}
						/>
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Piso"
							value={data.domicilioPiso ?? ""}
							style={{ width: "25%" }}
						/>
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Dpto"
							value={data.domicilioDpto ?? ""}
							style={{ width: "25%" }}
						/>
					</Grid>
					<Grid full="width" gap="5px">
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Provincia"
							value={data.domicilioProvincia ?? ""}
							style={{ width: "50%" }}
						/>
						<TextField
							InputLabelProps={{ style: inputLabelStyles }}
							variant="standard"
							size="small"
							label="Localidad"
							value={data.domicilioLocalidad ?? ""}
							style={{ width: "50%" }}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default EmpresaDetails;
