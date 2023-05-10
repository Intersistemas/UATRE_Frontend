import React from "react";
import styles from "./DDJJForm.module.css";
import Grid from "../../../../../ui/Grid/Grid";
import Select from "../../../../../ui/Select/Select";
import Formato from "../../../../../helpers/Formato";
import { TextField } from "@mui/material";

const DDJJForm = ({
	data = {},
	establecimientos = [],
	disabled = false,
	onChange = (_record) => {},
}) => {
	const establecimientosOptions = [{ label: "Sin establecimiento", value: 0 }];
	establecimientos?.forEach((est) =>
		establecimientosOptions.push({ label: est.nombre, value: est.id })
	);
	const condicionesRural = [
		{ label: "Rural", value: "RU" },
		{ label: "No Rural", value: "NR" },
	];
	const inputLabelStyles = { color: "#186090" };
	if (disabled) onChange = (_) => {};

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
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="CUIL"
					value={Formato.Cuit(data.cuil) ?? ""}
					style={{ width: "10%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Nombre"
					value={data.nombre ?? ""}
					style={{ width: "80%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Remuneración imponible"
					value={Formato.Moneda(data.remuneracionImponible) ?? ""}
					style={{ width: "10%" }}
				/>
			</Grid>
			<Grid full="width" gap="10px">
				<Grid width="50%">
					<Select
						name="establecimiento"
						label="Establecimiento"
						value={data.empresaEstablecimientoId}
						options={establecimientosOptions}
						onChange={(v) => {
							const estab = establecimientosOptions.find((r) => r.value === v);
							const estabData = {
								empresaEstablecimientoId: estab.value,
								empresaEstablecimiento_Nombre: estab.label,
							};
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
