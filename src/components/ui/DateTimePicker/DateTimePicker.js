import React from "react";
import { DateTimePicker as DTPicker, DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField } from "@mui/material";

const DateTimePicker = (props) => {
	const {
		type = "fechahora",
		views,
		value = "",
		renderInput = (p) => {
			p.size = "small";
			p.style = { ...p.style, width: "100%" };
			p.error = p.required && (p.InputProps.value ?? "") === "";
			return <TextField {...p} />;
		},
		...resto
	} = props;
	let pViews, Picker;
	switch (`${type}`.toLowerCase()) {
		case "datetime":
			pViews = "year_month_day_hours_minutes_seconds".split("_");
			Picker = DTPicker;
			break;
		case "date":
			pViews = "year_month_day".split("_");
			Picker = DatePicker;
			break;
		case "time":
			pViews = "hours_minutes_seconds".split("_");
			Picker = TimePicker;
			break;
		case "month":
			pViews = "year_month".split("_");
			Picker = DatePicker;
			break;
		case "datehours":
			pViews = "year_month_day_hours".split("_");
			Picker = DTPicker;
			break;
		case "dateminutes":
			pViews = "year_month_day_hours_minutes".split("_");
			Picker = DTPicker;
			break;
		case "hours":
			pViews = ["hours"];
			Picker = TimePicker;
			break;
		case "minutes":
			pViews = "hours_minutes".split("_");
			Picker = TimePicker;
			break;
		default:
			pViews = views;
			Picker = DTPicker;
			break;
	}
	console.log("pViews", pViews, "value", value);
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
