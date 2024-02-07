import { TextField, Tooltip } from "@mui/material";
import styles from "./InputMaterial.module.css";
import InputMask from 'react-input-mask';
import { MuiTelInput } from "mui-tel-input";

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
	const props = {
		className: styles.input,
		id,
		size,
		...x,
		style: { width: isNaN(width) ? width : `${width}%`, ...x.style },
		InputLabelProps: { shrink: true, ...x.InputLabelProps },
		InputProps: { readOnly, ...x.InputProps },
		onChange: (v) => onChange(v, id),
	};
	props.FormHelperTextProps ??= {};
	props.FormHelperTextProps.style = {
		marginTop: "0px",
		...props.FormHelperTextProps.style,
	};

	if (type === "tel") return <MuiTelInput disabled={disabled} {...props} />;

	if (id === "cuil" && !"autoFocus" in props) props.autoFocus = true;

	if (type === "date") props.inputFormat ??= "DD/MM/YYYY";

	props.type = type;
	props.onChange = ({ target }) => {
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

	return (
		<InputMask
			className={props.className}
			mask={mask}
			disabled={disabled}
			value={props.value}
			onChange={props.onChange}
		>
			{() => <TextField {...props} />}
		</InputMask>
	);
};
export default InputMaterial;
