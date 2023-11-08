import React from "react";
import {
	Checkbox,
	FormControl,
	FormControlLabel,
	FormHelperText,
} from "@mui/material";

const onChangeDef = (value, id) => {};

const CheckboxMaterial = ({
	id = "",
	label = "",
	value,
	options: optInit = [],
	disabled = false,
	required = false,
	error = false,
	size = "small",
	helperText = "",
	formControlProps = {},
	formLabelProps = {},
	onChange = onChangeDef,
	...x
}) => {
	optInit = Array.isArray(optInit) ? optInit : [optInit];	// Si no es array, tomo esta opcion como valor verdadero
	const options = [];
	options.push(optInit.length > 0 ? optInit[0] : true);	// Si el array está vacio, tomo true como valor verdadero
	options.push(
		optInit.length > 1
			? optInit[1]	// Si el array tiene más de un valor, tomo el segundo como valor falso
			: options[0]
			? {	// Si la primer opcion es falseable, tomo el valor falso según el tipo de la primer opcion
					boolean: false,
					string: "",
					number: 0,
			  }[typeof options[0]] ?? null
			: options[0] === null
			? undefined	// Si la primer opcion es null, tomo undefined como valor falso
			: null
	);
	return (
		<FormControl required={required} error={error} {...formControlProps}>
			<FormControlLabel
				disabled={disabled}
				label={label}
				control={
					<Checkbox
						id={id}
						size={size}
						checked={value === options[0]}
						indeterminate={!options.includes(value)}
						onChange={(_, value) => onChange(options[value ? 0 : 1], id)}
						{...x}
					/>
				}
				{...formLabelProps}
			/>
			<FormHelperText>{helperText}</FormHelperText>
		</FormControl>
	);
};

export default CheckboxMaterial;
