import React from "react";
import styles from "./NominaDetailsAFIP.module.css";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";

const NominaDetailsAFIP = ({
	data = { cuit: 0, nombre: "", documento: "", domicilio: "" },
	loading,
	error,
}) => {
	return (
		<Grid
			className={`${styles.fondo} ${styles.grupo}`}
			col
			width="full"
			gap="inherit"
		>
			<Grid full="width">
				<Grid className={styles.titulo} grow>
					{[
						"Consulta AFIP",
						loading,
						error ? ["Error", error.code, error.message].join(" ") : "",
					]
						.filter((r) => r)
						.join(" - ")}
				</Grid>
			</Grid>
			<Grid full="width" gap="inherit">
				<InputMaterial readOnly label="Documento" value={data.documento} />
				<InputMaterial readOnly label="Nombre" value={data.nombre} />
			</Grid>
			<InputMaterial readOnly label="Domicilio" value={data.domicilio} />
		</Grid>
	);
};

export default NominaDetailsAFIP;
