import { TextField, Tooltip } from "@mui/material";
import styles from "./InputMaterial.module.css";

const InputMaterial = (props) => {
  //Validaciones
  
  const handleChange = (event) => { 
    console.log("event", event)   
    switch (props.id) {
      case "cuil":   
      var reCUIL = /^[0-9\b]+$/;     
        if (event.target.value === "" || reCUIL.test(event.target.value)) {
          props.onChange(event.target.value, props.id);
        }
        break;
 
      case "cuit":
        const reCUIT = /^[0-9\b]+$/;
        if (event.target.value === "" || reCUIT.test(event.target.value)) {
          props.onChange(event.target.value, props.id);
        }
        break;

      default:
        props.onChange(event.target.value, props.id);
        break;
    }
  };

  const shrink = props.type === "date" || props.value !== '' ? true : false  
  //console.log("helperText", props.helperText)
  return (
    <Tooltip title={props.showToolTip ? props.value : false} arrow>
      <TextField
        variant={props.variant}
        size={props.size ? props.size : "small"}
        autoFocus={props.id === "cuil" ? true : false}
        id={props.id}
        //error={!props.isValid}
        label={props.label}
        className={styles.input}
        value={props.value || ""}
        onChange={handleChange}
        disabled={props.disabled}
        style={{ width: props.width != null ? `${props.width}%` : "100%", padding:`${props.padding}`}}
        type={props.type || "text"}
        inputFormat={props.type === "date" ? "DD/MM/YYYY" : null}
        InputLabelProps={{
          shrink: shrink,
        }}
        InputProps={{
          readOnly: props.readOnly || false,
        }}
        helperText={props.helperText ?? ""}
        error={props.error ?? false}
        color={props.color}
        focused={props.focused || false}
      />
    </Tooltip>
  );
};

export default InputMaterial;
