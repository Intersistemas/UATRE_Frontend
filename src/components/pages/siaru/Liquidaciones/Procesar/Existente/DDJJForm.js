import React from "react";
import styles from "./DDJJForm.module.css";
import Grid from "../../../../../ui/Grid/Grid";
import Select from "../../../../../ui/Select/Select";
import Formato from "../../../../../helpers/Formato";

const DDJJForm = ({ config }) => {
	const data = config.data ?? {};
	const establecimientos = config.establecimientos
		? [{ id: 0, nombre: "Sin establecimiento" }, ...config.establecimientos]
		: [{ id: 0, nombre: "Sin establecimiento" }];
	const onChange = config.onChange ?? ((r) => {});
	const condicionesRural = [
		{ label: "Rural", value: "RU" },
		{ label: "No Rural", value: "NR" },
	];

	return (
		<Grid
			className={`${styles.fondo} ${styles.grupo}`}
			col
			full="width"
			style={{ minWidth: "310px" }}
			gap="10px"
		>
			<Grid full="width">
				<Grid className={styles.cabecera} grow>
					DDJJ
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid block basis="051px" className={styles.label}>
					CUIL:
				</Grid>
				<Grid block basis="125px" className={styles.data}>
					{Formato.Cuit(data.cuil)}
				</Grid>
				<Grid block basis="110px" className={styles.label}>
					Nombre:
				</Grid>
				<Grid grow className={styles.data}>
					{data.nombre}
				</Grid>
				<Grid block basis="200px" className={styles.label}>
					Remuneración imponible:
				</Grid>
				<Grid block basis="125px" className={styles.data}>
					{Formato.Moneda(data.remuneracionImponible)}
				</Grid>
			</Grid>
			<Grid full="width" gap="10px">
				<Grid width="50%">
					<Select
						name="establecimiento"
						label="Establecimiento"
						value={data.empresasEstablecimientosId}
						options={establecimientos.map((r) => ({
							label: r.nombre,
							value: r.id,
						}))}
						onChange={(v) => {
							const estab = establecimientos.find((r) => r.id === v);
							const estabData = {
								empresasEstablecimientosId: 0,
								empresasEstablecimientos_Nombre: "Sin establecimiento",
							};
							if (estab) {
								estabData.empresasEstablecimientosId = estab.id;
								estabData.empresasEstablecimientos_Nombre = estab.nombre;
							}
							onChange({ ...data, ...estabData });
						}}
					/>
				</Grid>
				<Grid width="50%">
					<Select
						name="condicionRural"
						label="Condición Rural"
						value={data.condicionRural}
						options={condicionesRural}
						onChange={(v) => onChange({ ...data, condicionRural: v })}
					/>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default DDJJForm;
