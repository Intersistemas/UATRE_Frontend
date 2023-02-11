import { MenuItem, Select as MuiSelect, InputLabel, FormControl } from "@mui/material";

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

const Select = (props) => {
	const handleChange = (event) => {
		//console.log(event)
		props.onChange(event.target.value, event.target.name);
	};

	return (
		<FormControl
			size="small"
			style={{ width: props.width != null ? `${props.width}%` : "100%" }}
		>
			<InputLabel id={props.label + "-label"}>{props.label}</InputLabel>
			<MuiSelect
				labelId={props.label + "-label"}
				name={props.name}
				label={props.label}
				value={(props.value ?? 0) === 0 ? "" : props.value}
				defaultValue={props.defaultValue}
				onChange={handleChange}
				MenuProps={MenuProps}
				size="small"
				disabled={props.disabled}
				InputLabelProps={{
					shrink: true,
				}}
			>
				{props.options.map((option, ix) => (
					<MenuItem key={ix + 1} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</MuiSelect>
		</FormControl>
	);
};

export default Select;
