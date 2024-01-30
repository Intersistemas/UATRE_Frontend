import { TextField, Tooltip } from "@mui/material";
import styles from "./InputMaterial.module.css";
import InputMask from 'react-input-mask';

const InputMaterial = (props) => {
  //Validaciones
	props = { ...props };
	props.onChange ??= ((_value, _id) => {});
 

  const handleChange = (event) => { 

    switch (props.id) {
 
      case "cuit":
        const reCUIT = /^[0-9\b]+$/;
        if (event.target.value === "" || reCUIT.test(event.target.value)) {
          props.onChange(event.target.value, props.id);
        }
        break;

      // case "numeroDocumento": 
      case "telefono":
        const reNumero = /^[0-9\b]+$/;
        if (event.target.value === "" || reNumero.test(event.target.value)) {
          props.onChange(event.target.value, props.id);
        }
        break;

      default:

        
        props.onChange(event.target.value, props.id);
        break;
    }
  };

  return (

    <InputMask
      mask={props.mask}
      className={styles.input}
      value={props.value || ""}
      onChange={handleChange}
      disabled={props.disabled} 
    >
    {() =>
        <TextField
          disabled={props.disabled}
          variant={props.variant}
          size={props.size ? props.size : "small"}
          autoFocus={props.id === "cuil" ? true : false}
          id={props.id}
          //error={!props.isValid}
          label={props.label}
          className={styles.input}
          value={props.value || ""}
          onChange={handleChange}
          style={{...props.style,
            width: props.width != null ? `${props.width}%` : "100%",
            padding: `${props.padding}`,
            //border: '1px solid red',
          }}
          type={props.type || "text"}
          inputFormat={props.type === "date" ? "DD/MM/YYYY" : null}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            readOnly: props.readOnly || false,          
          }}
          helperText={props.helperText ?? ""}
          FormHelperTextProps={{ style: { marginTop: "0px" } }}
          error={props.error || false}
          color={props.color}
          placeholder={props.placeholder}
          //focused={props.focused || false}  //ESTA PROP ME MATA LA PROP BORDER (COLOR) de los elementos(inputs/selects) seleccionados
          //onFocus={handleOnFocus}
        >
        </TextField>}
    </InputMask>
    
  );
};

export default InputMaterial;
