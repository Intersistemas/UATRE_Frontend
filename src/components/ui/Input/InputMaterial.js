import { TextField } from "@mui/material";
import styles from "./InputMaterial.module.css";
import { MuiTelInput } from "mui-tel-input";
import MaskedInput from "react-text-mask";

const onChangeDef = (value, id) => {};

export const CUITMask = Object.freeze([/\d/, /\d/, "-", /\d/, /\d/, ".", /\d/, /\d/, /\d/,".",/\d/,/\d/,/\d/,"-",/\d/]);

const InputMaterial = ({
	id,
	mask = null,
	type = "text",
	size = "small",
	readOnly = false,
	width = "100%",
	onChange = onChangeDef,
	...x
}) => {
	//console.log('InputMaterial_parametros ',x)
	const textFieldProps = {
		className: styles.input,
		id,
		size,
		...x,
		style: { width: isNaN(width) ? width : `${width}%`, ...x.style },
		InputLabelProps: { shrink: true, ...x.InputLabelProps },
		InputProps: { readOnly, ...x.InputProps },
		onChange: (v) => onChange(v, id),
	};
	textFieldProps.FormHelperTextProps ??= {};
	textFieldProps.FormHelperTextProps.style = {
		marginTop: "0px",
		...textFieldProps.FormHelperTextProps.style,
	};

	if (type === "tel")
		return <MuiTelInput {...textFieldProps} />;

	if (id === "cuil" && !("autoFocus" in textFieldProps))
		textFieldProps.autoFocus = true;

	if (type === "date") textFieldProps.inputFormat ??= "DD/MM/YYYY";

	textFieldProps.type = type;
	textFieldProps.onChange = ({ target }) => {
		switch (id) {
			case "cuit":
				const reCUIT = /^[0-9\b]+$/;
				if (target?.value === "" || reCUIT.test(target?.value)) {
					onChange(target?.value, id);
				}
				break;
			default:
				onChange(target?.value, id);
				break;
		}
	};

	textFieldProps.value ??= ""

	if (mask) {
		textFieldProps.mask = mask;
		return (
			<MaskedInput
				{...textFieldProps}
				render={(ref, props) => <TextField inputRef={ref} {...props} />}
			/>
		);
	}

	return <TextField {...textFieldProps} />;
};
export default InputMaterial;
