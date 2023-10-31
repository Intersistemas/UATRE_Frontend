import React from "react";
import { TextField } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Select from "components/ui/Select/Select";
import Formato from "components/helpers/Formato";
import styles from "./DDJJForm.module.css";

const DDJJForm = ({
	records = [],
	establecimientos = [],
	disabled = false,
	onChange = (_records, _changes) => {},
}) => {
	records = [...records];
	const joined =
		records.length === 0
			? {}
			: {
					cuil: null,
					nombre: null,
					remuneracionImponible: null,
					empresaEstablecimientoId: null,
					esRural: null,
			  };
	records.forEach((ddjj, ix) => {
		Object.keys(joined).forEach((k) => {
			if (joined[k] === undefined) return;
			if (ix === 0) {
				joined[k] = ddjj[k];
				return;
			}
			if (joined[k] === ddjj[k]) return;
			else joined[k] = undefined;
		});
	});
	const establecimientosOptions = [{ label: "Sin establecimiento", value: 0 }];
	establecimientos?.forEach((est) =>
		establecimientosOptions.push({ label: est.nombre, value: est.id })
	);
	if (disabled) onChange = (_records, _changes) => {};
	const opcionesRural = [
		{ label: "Rural", value: true },
		{ label: "No Rural", value: false },
	];
	const inputLabelStyles = { color: "#186090" };

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
					{`DDJJ seleccionadas: ${records.length}`}
				</Grid>
			</Grid>
			<Grid full="width" gap="5px">
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="CUIL"
					value={Formato.Cuit(joined.cuil) ?? ""}
					style={{ width: "10%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Nombre"
					value={joined.nombre ?? ""}
					style={{ width: "70%" }}
				/>
				<TextField
					InputLabelProps={{ style: inputLabelStyles }}
					variant="standard"
					size="small"
					label="Remuneración imponible"
					value={Formato.Moneda(joined.remuneracionImponible) ?? ""}
					style={{ width: "20%" }}
				/>
			</Grid>
			<Grid full="width" gap="10px">
				<Grid width="50%">
					<Select
						name="establecimiento"
						label="Establecimiento"
						value={joined.empresaEstablecimientoId}
						options={establecimientosOptions}
						onChange={(v) => {
							const estab = establecimientosOptions.find((r) => r.value === v);
							const estabData = {
								empresaEstablecimientoId: estab.value,
								empresaEstablecimiento_Nombre: estab.label,
							};
							onChange(records, { ...estabData });
						}}
					/>
				</Grid>
				<Grid width="50%">
					<Select
						name="esRural"
						label="Ruralidad"
						value={joined.esRural}
						options={opcionesRural}
						onChange={(v) => onChange(records, { esRural: v })}
					/>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default DDJJForm;
