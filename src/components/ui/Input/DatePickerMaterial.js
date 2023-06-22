import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import React from "react";
import styles from "./InputMaterial.module.css";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const DatePickerMaterial = (props) => {
  const handleChange = (event) => {};

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDatePicker
        className={styles.input}
        label={props.label}
        value={props.value}
        onChange={handleChange}
        defaultValue={dayjs("2022-04-17")}
      />
    </LocalizationProvider>
  );
};

export default DatePickerMaterial;
