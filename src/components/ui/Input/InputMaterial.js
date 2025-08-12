import { useMemo } from "react";
import styles from "./InputMaterial.module.css";
import { MuiTelInput } from "mui-tel-input";
import { TextField } from "@mui/material";
import { deepFreeze, getType } from "components/helpers/Utils";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import { MaskTextField } from "./MaskTextField";
import { v4 as uuidv4 } from "uuid";

const onChangeDef = (value, id) => { };

/**
 * @typedef {{
 * 	mask: string,
 * 	lazy: boolean,
 *	unmask: boolean,
 * 	blocks: {
 * 		d: {
 * 			mask: NumberConstructor,
 * 			thousandsSeparator: string,
 * 			radix: string,
 * 			mapToRadix: string[],
 * 			expose: boolean
 * 		}
 * 	}
 * }} AmountMask
 */
/**
 * Genera máscara numérica.
 * @param {object} config Configuraciones
 * @param {string} config.prefix Simbolo antecedente.
 * @param {string} config.suffix Simbolo posterior.
 * @param {number} config.scale Cantidad de decimales.
 * @returns {{
 * 	mask: string,
 * 	lazy: false,
 * 	unmask: true,
 * 	blocks: {
 * 		d: {
 * 			mask: NumberConstructor,
 * 			thousandsSeparator: ".",
 * 			radix: ",",
 * 			mapToRadix: ["."],
 * 			expose: true
 * 		}
 * 	}
 * }}
 */
export const CantidadMask = ({ prefix = "", suffix = "", scale } = { prefix: "", suffix: ""}) => {
	const d = { mask: Number, thousandsSeparator: ".", radix: ",", mapToRadix: ["."], unmask: "typed", expose: true };
	if (typeof scale === "number") d.scale = scale;
	return { mask: [prefix, "d", suffix].filter(e => e).join(" "), lazy: false, unmask: true, blocks: { d } };
};
/** @type {AmountMask} */
export const EnteroMask = deepFreeze(CantidadMask({ scale: 0 }));
/** @type {AmountMask} */
export const PesosMask = deepFreeze(CantidadMask({ prefix: "$", scale: 2 }));
/** @type {AmountMask} */
export const InteresesMask = deepFreeze(CantidadMask({ prefix: "$", scale: 4 }));
/** @type {AmountMask} */
export const PorcentajeMask = deepFreeze(CantidadMask({ suffix: "%", scale: 6 }));
/** @type {{ mask: "00-00.000.000-0", unmask: true }} */
export const CUITMask = deepFreeze({ mask: "00-00.000.000-0", unmask: true });
/** @type {{ mask: Number, unmask: "typed", scale: 0, thousandsSeparator: ".", min: 0, max: 99999999 }} */
export const DNIMask = deepFreeze({ mask: Number, unmask: "typed", scale: 0, thousandsSeparator: ".", min: 0, max: 99999999 });
/** @type {{ mask: "S-0000", unmask: false }} */
export const CodSeccional = deepFreeze({ mask: "S-0000", unmask: false });

const InputMaterial = ({
	id,
	mask = null,
	type = "text",
	size = "small",
	readOnly = false,
	width = "100%",
	onChange = onChangeDef,
	...x
}) => {
	const state = useMemo(() => ({ id: id ?? `UUID${uuidv4()}` }), [id]);
	const handleOnChange = (value) => {
		switch (state.id) {
			case "cuit":
				const reCUIT = /^[0-9\b]+$/;
				if (value !== "" && !reCUIT.test(value)) return;
				break;
			default:
				break;
		}
		onChange(value, state?.id);
	}
	
	const textFieldProps = {
		...state,
		className: styles.input,
		size,
		...x,
		style: { width: isNaN(width) ? width : `${width}%`, ...x.style },
		InputLabelProps: { shrink: true, ...x.InputLabelProps },
		InputProps: { readOnly, ...x.InputProps },
		onChange: handleOnChange,
	};	
	textFieldProps.FormHelperTextProps ??= {};
	textFieldProps.FormHelperTextProps.style = {
		marginTop: "0px",
		...textFieldProps.FormHelperTextProps.style,
	};	

	let subtype = null;
	({ type, subtype } = getType(type));
	textFieldProps.type = subtype ?? type;
	textFieldProps.name ??= state.id;

	switch (type) {
		case "tel": {
			return <MuiTelInput {...textFieldProps} />;
		}
		case "date":
		case "time":
		case "month":
		case "hours":
		case "minutes":
		case "datetime":
		case "datehours":
		case "dateminutes": {
			return <DateTimePicker {...textFieldProps} />;
		}
		default:
			break;
	}

	if (state.id === "cuil" && !("autoFocus" in textFieldProps))
		textFieldProps.autoFocus = true;

	textFieldProps.value ??= ""
	if (mask) {
		const { onChange, ...mtfProps } = { ...mask, ...textFieldProps };
		mtfProps.onAccept = (value, mask) => {
			const exposeBlock = mask?.masked?.exposeBlock;
			if (exposeBlock) {
				switch (exposeBlock.unmask) {
					case "typed": value = exposeBlock.typedValue; break;
					case true: value = exposeBlock.unmaskedValue; break;
					default: value = exposeBlock.value; break;
				}
			}
			if (value === x.value) return;
			onChange(value);
		};
		mtfProps.value = `${textFieldProps.value}`; // value debe ser string
		// console.log("mtfProps", mtfProps);
		return <MaskTextField {...mtfProps} />;
	}

	textFieldProps.onChange = ({ target }) => handleOnChange(target?.value);

	return <TextField {...textFieldProps} />;
};
export default InputMaterial;
