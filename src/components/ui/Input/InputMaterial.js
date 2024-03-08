import MaskedInput from "react-text-mask";
import { TextField } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import { getType } from "components/helpers/Utils";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import styles from "./InputMaterial.module.css";

const onChangeDef = (value, id) => {};

export const CUITMask = Object.freeze([/\d/, /\d/, "-", /\d/, /\d/, ".", /\d/, /\d/, /\d/,".",/\d/,/\d/,/\d/,"-",/\d/]);
export const DNIMask = Object.freeze([/\d/, /\d/, ".", /\d/, /\d/, /\d/,".",/\d/,/\d/,/\d/]);
export const CodSeccional = Object.freeze(['S', "-",/\d/,/\d/,/\d/,/\d/]);

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
	
	let subtype = null;
	({ type, subtype } = getType(type));
	textFieldProps.type = subtype ?? type;

	switch (type) {
		case "tel": {
			return <MuiTelInput {...textFieldProps} />;
		}
		case "date":
		case "time":
		case "month":
		case "hours":
		case "minutes":
		case "datetime":
		case "datehours":
		case "dateminutes": {
			return <DateTimePicker {...textFieldProps} />;
		}
		default:
			break;
	}
	
	if (id === "cuil" && !("autoFocus" in textFieldProps))
		textFieldProps.autoFocus = true;

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
				guide={true}
				render={(ref, props) => <TextField inputRef={ref} {...props} />}
			/>
		);
	}

	return <TextField {...textFieldProps} />;
};
export default InputMaterial;
