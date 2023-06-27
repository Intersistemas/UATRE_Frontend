import { Input, TextField, Tooltip } from "@mui/material";
import styles from "./InputMaterial.module.css";
import { forwardRef, useState } from "react";
import { IMaskInput } from "react-imask";

const InputMaterialMask = (props) => {  
  const handleChange = (event) => {
    const chars = {
      '-': '',
      '.': '',
    };
    const cuil = event.target.value.replace(/[-.]/g, m => chars[m]);
    //console.log("cuil",cuil)
    if (cuil === props.value) {
      return
    }

    switch (props.id) {
      case "cuil":
      var reCUIL = /^[0-9\b]+$/;
        if (event.target.value === "" || reCUIL.test(cuil)) {
          props.onChange(cuil, props.id);
        }
        break;

      case "cuit":
        const reCUIT = /^[0-9\b]+$/;
        if (event.target.value === "" || reCUIT.test(cuil)) {
          props.onChange(cuil, props.id);
        }
        break;

      default:
        //props.onChange(event.target.value, props.id);
        break;
    }
  };

  // const handleOnFocus = (event) => {
  //   props.onFocus(props.id)
  // }

  const cuilMask = forwardRef(function cuilMask(props, ref) {
    const { ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="##-##.###.###-#"
        definitions={{
          "#": /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(value) =>
          handleChange({ target: { id: props.id, value: value } })
        }
      />
    );
  });

  const shrink = props.type === "date" || props.value !== "" ? true : false;

  return (
    <Tooltip title={props.showToolTip ? props.value : false} arrow>
      <TextField
        //ref={props.id}
        autoFocus={(props.id === "cuil" || props.id === "cuit") && props.value.length < 11 ? true : false}
        id={props.id}
        size="small"
        //error={!props.isValid}
        label={props.label}
        className={styles.input}
        value={props.value || ""}
        onChange={handleChange}
        disabled={props.disabled} 
        style={{...props.style, width: props.width != null ? `${props.width}%` : "100%" }}
        type={props.type || "text"}
        inputFormat={props.type === "date" ? "DD/MM/YYYY" : null}
        InputLabelProps={{
          shrink: shrink,
        }}
        InputProps={{
          readOnly: props.readOnly || false,
          inputComponent: cuilMask,
        }}
        helperText={props.helperText ?? ""}
        FormHelperTextProps={{ style: { marginTop: "0px", color: "red" } }}
        error={props.error ?? false}
        color={props.color}
        focused={props.focused || false}
        //onFocus={handleOnFocus}
        //onBlur={onBlur}
      />
    </Tooltip>
  );
};

export default InputMaterialMask;
