import { FormControl, Autocomplete, TextField } from "@mui/material";
import styles from "./SearchSelectMaterial.module.css";

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

const SearchSelectMaterial = (props) => {
  const handleChange = (event, newValue) => {   
    //console.log("event.target.name", event.target)
    props.onChange(newValue, props.name);
  };

  return (
    <FormControl
      size="small"
      style={{ width: props.width != null ? `${props.width}%` : "100%" }}
    >
      {/* <InputLabel id={props.label + "-label"}>{props.label}</InputLabel> */}
      <Autocomplete
        className={styles.select}
        disablePortal
        freeSolo
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.value}>
              {option.label}
            </li>
          );
        }}
        disabled={props.disabled}
        id={props.label + "-label"}
        options={props.options}
        //MenuProps={MenuProps}
        size="small"
        value={props.value}
        onChange={handleChange}
        getOptionLabel={(option) => option.label || ""}
        //defaultValue={props.defaultValue}
        renderInput={(params) => (
          <TextField
            {...params}
            label={props.label}
            key={props.value}
            onChange={props.onTextChange}
          />
        )}
      />
    </FormControl>
  );
};

export default SearchSelectMaterial;
