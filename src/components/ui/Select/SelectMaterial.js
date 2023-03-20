import { MenuItem, Select, InputLabel, FormControl, FormHelperText } from "@mui/material";
import styles from "./SelectMaterial.module.css";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 9.2 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const SelectMaterial = (props) => {
  const handleChange = (event) => {
    //console.log(event)
    props.onChange(event.target.value, event.target.name);
  };

  return (
    <FormControl
      size="small"
      style={{ width: props.width != null ? `${props.width}%` : "100%" }}
      error={props.error ?? false}
    >
      <InputLabel id={props.label + "-label"}>{props.label}</InputLabel>
      <Select
        //className={styles.selectJurisdiccion}
        labelId={props.label + "-label"}
        name={props.name}
        label={props.label}
        value={props.value}
        defaultValue={props.defaultValue}
        onChange={handleChange}
        MenuProps={MenuProps}
        size="small"
        disabled={props.disabled}
        // InputLabelProps={{
        //   shrink: true,
        // }}       
      >        
        {props.options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectMaterial;
