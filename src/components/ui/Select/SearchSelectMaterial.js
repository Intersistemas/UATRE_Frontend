import { FormControl, Autocomplete, TextField } from "@mui/material";
import styles from "./SearchSelectMaterial.module.css";

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

const SearchSelectMaterial = (props) => {

  const handleChange = (event, newValue) => {   
    //console.log("SearchSelectMaterial_event.target", event.target)
    props.onChange(newValue, props.name);
    //props.onChange(event.target.value, event.target.name);
  };

  return (
    <FormControl
      size="small"
      style={{ width: props.width != null ? `${props.width}%` : "100%", backgroundColor: 'white' }}
    >
      {/* <InputLabel id={props.label + "-label"}>{props.label}</InputLabel> */}
      <Autocomplete
        listboxProps={{ style: { maxHeight: 50 } }}
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
        readOnly={props.readOnly}
        id={props.label + "-label"}
        options={props.options}
        //MenuProps={MenuProps}
        size="small"
        value={props.value || ""}
        onChange={handleChange}
        getOptionLabel={(option) => option.label || ""}
        //defaultValue={props.defaultValue}
        renderInput={(params) => (
          <TextField
            error={props.error}
            style={{'max-height': '40px'}}
            {...params}
            label={props.label}
            key={props.value}
            onChange={props.onTextChange}
            value={props.value || ""}
          />
        )}
      />
    </FormControl>
  );
};

export default SearchSelectMaterial;
