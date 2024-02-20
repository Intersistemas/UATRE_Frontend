import { TextField, Tooltip } from "@mui/material";
import styles from "./InputMaterial.module.css";
import InputMask from "react-input-mask";
import { MuiTelInput } from "mui-tel-input";
import { fontWeight } from "@mui/system";

const onChangeDef = (value, id) => {};

const InputMaterial = ({
	id,
	mask = "",
	type = "text",
	size = "small",
	readOnly = false,
	width = "100%",
	disabled = false,
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
		return <MuiTelInput disabled={disabled} {...textFieldProps} />;

	if (id === "cuil" && !"autoFocus" in textFieldProps)
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

	const inputMaskProps = {
		className: textFieldProps.className,
		mask,
		disabled,
		value: textFieldProps.value,
		onChange: textFieldProps.onChange,
	};
	if (textFieldProps.onFocus) {
		inputMaskProps.onFocus = textFieldProps.onFocus;
		delete textFieldProps.onFocus;
	}
	if (textFieldProps.as === InputMask) delete textFieldProps.as;

	return (
		<InputMask {...inputMaskProps}>
			{() => <TextField {...textFieldProps} />}
		</InputMask>
	);
};
export default InputMaterial;
