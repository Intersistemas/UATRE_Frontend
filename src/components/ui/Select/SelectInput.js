import React from "react";
import Select from "react-select";
import classes from './SelectInput.module.css'

const SelectInput = (props) => {
  //console.log("props", props);
  const handleChange = (e) => {
    console.log("value", e);
    props.onChange(e, props.id);
  };

  return (
    <div className={classes.input}>
      <label htmlFor={props.id}>{props.label}</label>
      <Select
        id={props.id}
        options={props.options}
        value={props.value}
        onChange={handleChange}
        isDisabled={props.disabled}
      />
    </div>
  );
};

export default SelectInput;
