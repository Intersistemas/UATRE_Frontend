import { useMemo } from "react";
import styles from "./InputMaterial.module.css";
import { MuiTelInput } from "mui-tel-input";
import { TextField } from "@mui/material";
import { deepFreeze, getType } from "components/helpers/Utils";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import { MaskTextField } from "./MaskTextField";

const onChangeDef = (value, id) => { };

export const CUITMask = deepFreeze({ mask: "00-00.000.000-0", unmask: true });
export const DNIMask = deepFreeze({ mask: Number, unmask: "typed", scale: 0, thousandsSeparator: ".", min: 0, max: 99999999 });
export const CodSeccional = deepFreeze({ mask: "S-0000", unmask: false });
export const PesosMask = deepFreeze({
	mask: "$ d",
	lazy: false,
	blocks: {
		d: {
			mask: Number,
			scale: 2,
			thousandsSeparator: ".",
			radix: ",",
			mapToRadix: ["."],
			expose: true,
		},
	},
	unmask: true,
});

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
	const state = useMemo(() => ({ id: id ?? `UUID${crypto.randomUUID()}` }), [id]);

	const handleOnChange = (value) => {
		switch (state.id) {
			case "cuit":
				const reCUIT = /^[0-9\b]+$/;
				if (value !== "" && !reCUIT.test(value)) return;
				break;
			default:
				break;
		}
		onChange(value, state.id);
	}

	const textFieldProps = {
		...state,
		className: styles.input,
		size,
		...x,
		style: { width: isNaN(width) ? width : `${width}%`, ...x.style },
		InputLabelProps: { shrink: true, ...x.InputLabelProps },
		InputProps: { readOnly, ...x.InputProps },
		onChange: handleOnChange,
	};
	textFieldProps.FormHelperTextProps ??= {};
	textFieldProps.FormHelperTextProps.style = {
		marginTop: "0px",
		...textFieldProps.FormHelperTextProps.style,
	};

	let subtype = null;
	({ type, subtype } = getType(type));
	textFieldProps.type = subtype ?? type;
	textFieldProps.name ??= state.id;

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

	if (state.id === "cuil" && !("autoFocus" in textFieldProps))
		textFieldProps.autoFocus = true;

	textFieldProps.value ??= ""

	if (mask) {
		const { onChange: onAccept, ...mtfProps } = { ...mask, ...textFieldProps };
		mtfProps.onAccept = onAccept;
		mtfProps.value = `${textFieldProps.value}`; // value debe ser string
		return <MaskTextField {...mtfProps} />;
	}

	textFieldProps.onChange = ({ target }) => handleOnChange(target?.value);

	return <TextField {...textFieldProps} />;
};
export default InputMaterial;
