import { TextField, Tooltip } from "@mui/material";
import styles from "./InputMaterial.module.css";

const onChangeDef = (value, id) => {};

const InputMaterial = ({
	id,
	value = "",
	type = "text",
	size = "small",
	autoFocus = id === "cuil",
	showToolTip = false,
	toolTip = {
		title: showToolTip ? value : "",
		arrow: true,
	},
	width = "100",
	padding = "",
	style = {
		width: `${width}%`,
		padding: `${padding}`,
	},
	inputFormat = type === "date" ? "DD/MM/YYYY" : null,
	InputLabelProps = { shrink: true },
	readOnly = false,
	InputProps = { readOnly: readOnly },
	FormHelperTextProps = { style: { marginTop: "0px" } },
	onChange = onChangeDef,
	...x
}) => {
  //Validaciones
  const handleChange = (event) => {
		let regex = /^.*$/
    switch (id) {
			case "cuil":
			case "cuit":
			case "numeroDocumento":
			case "telefono": {
				regex = /^[0-9\b]+$/;
				break;
			}
			default:
				break;
		}
		if (event.target.value === "" || regex.test(event.target.value)) {
			onChange(event.target.value, id);
		}
  };
	
  return (
    <Tooltip {...toolTip}>
      <TextField
        className={styles.input}
        id={id}
        value={value}
        type={type}
        size={size}
        autoFocus={autoFocus}
        style={style}
        inputFormat={inputFormat}
        InputLabelProps={InputLabelProps}
        InputProps={InputProps}
        FormHelperTextProps={FormHelperTextProps}
        onChange={handleChange}
        {...x}
      />
    </Tooltip>
  );
};

export default InputMaterial;
