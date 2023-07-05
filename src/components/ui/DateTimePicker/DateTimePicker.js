import React from "react";
import {
	DateTimePicker as DTPicker,
	DatePicker,
	TimePicker,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import styles from "../Input/InputMaterial.module.css";
import { TextField } from "@mui/material";

const DateTimePicker = ({
	type = "fechahora",
	value = "",
	placeholder = "",
	views,
	error,
	required,
	InputRenderProps = {},
	renderInput = (props) => {
		const renderProps = { ...props, ...InputRenderProps };
		renderProps.className = [renderProps.className, styles.input]
			.filter((e) => e)
			.join(" ");
		renderProps.size ??= "small";
		if (error) {
			renderProps.error = true;
			if (React.isValidElement(error) || typeof error === "string") {
				renderProps.helperText = error;
			}
		} else {
			renderProps.error = false;
		}
		renderProps.required = required ? required : renderProps.required;
		renderProps.style = {
			...renderProps.style,
			width: "100%",
		};

		const InputLabelProps = { ...renderProps.InputLabelProps };
		InputLabelProps.shrink ??= true;

		const InputProps = { ...renderProps.InputProps };
		InputProps.style = { ...InputProps.style, background: "white" };

		const inputProps = { ...renderProps.inputProps };
		if (placeholder) inputProps.placeholder = placeholder;

		return (
			<TextField
				{...renderProps}
				InputLabelProps={InputLabelProps}
				InputProps={InputProps}
				inputProps={inputProps}
			/>
		);
	},
	...resto
}) => {
	let pViews, Picker;
	switch (`${type}`.toLowerCase()) {
		case "datetime":
			pViews = "year_month_day_hours_minutes_seconds".split("_");
			Picker = DTPicker;
			if (!placeholder) placeholder = "dd/mm/aaaa hh:mm";
			break;
		case "date":
			pViews = "year_month_day".split("_");
			Picker = DatePicker;
			if (!placeholder) placeholder = "dd/mm/aaaa";
			break;
		case "time":
			pViews = "hours_minutes_seconds".split("_");
			Picker = TimePicker;
			if (!placeholder) placeholder = "hh:mm";
			break;
		case "month":
			pViews = "year_month".split("_");
			Picker = DatePicker;
			if (!placeholder) placeholder = "mmmm aaaa";
			break;
		case "datehours":
			pViews = "year_month_day_hours".split("_");
			Picker = DTPicker;
			if (!placeholder) placeholder = "dd/mm/aaaa hh:mm";
			break;
		case "dateminutes":
			pViews = "year_month_day_hours_minutes".split("_");
			Picker = DTPicker;
			if (!placeholder) placeholder = "dd/mm/aaaa hh:mm";
			break;
		case "hours":
			pViews = ["hours"];
			Picker = TimePicker;
			if (!placeholder) placeholder = "hh:mm";
			break;
		case "minutes":
			pViews = "hours_minutes".split("_");
			Picker = TimePicker;
			if (!placeholder) placeholder = "hh:mm";
			break;
		default:
			pViews = views;
			Picker = DTPicker;
			if (!placeholder) placeholder = "dd/mm/aaaa hh:mm";
			break;
	}
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"es-mx"}>
			<Picker
				views={pViews}
				value={dayjs(value)}
				renderInput={renderInput}
				{...resto}
			/>
		</LocalizationProvider>
	);
};

export default DateTimePicker;
