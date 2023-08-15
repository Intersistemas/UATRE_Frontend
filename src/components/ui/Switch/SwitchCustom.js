import { FormControlLabel, Switch } from "@mui/material";
import React from "react";

const SwitchCustom = (props) => {
  const [checked, setChecked] = React.useState(true);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    props.onHandleChange(event.target.checked);
  };

  return (
    <FormControlLabel
      control={
        <Switch checked={checked} onChange={handleChange} label={props.label} />
      }
      label="Solo vigentes"
    />
  );
};

export default SwitchCustom;
