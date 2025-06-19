import { FormControl, Autocomplete, TextField } from "@mui/material";
import styles from "./SearchSelectMaterial.module.css";
import InputMaterial from "../Input/InputMaterial";

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

const SearchSelectMaterialNuevo = (props) => {

  const handleChange = (event, newValue) => {   
    //console.log("SearchSelectMaterial_event.target", event.target)
    
    console.log('newValue',newValue)
    console.log('handleChange_props',props)

    newValue !==null ? props.onChange(newValue, props.name) : props.onChange(props.options[0], props.name);

    //props.onChange(newValue, props.name)
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
          <InputMaterial
            error={props.error}
            //style={{'max-height': '40px'}}
            helperText={props.helperText}
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

export default SearchSelectMaterialNuevo;
