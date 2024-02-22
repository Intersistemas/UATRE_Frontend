import React from "react";
import { FormControl, Autocomplete } from "@mui/material";
import InputMaterial from "../Input/InputMaterial";
import styles from "./SearchSelectMaterial.module.css";

const optionDef = { value: null, label: null };
const optionArray = [optionDef];

/**
 * @param {*} value
 * @param {number} index
 * @param {array} array
 */
const mapDef = (value, index, array) => ({ value, label: value });

/**
 * @param {optionDef} option
 */
const filterDef = (option) => !!option;

/**
 * Generador de opciones a partir de datos crudos
 * @param {object} config Configuración
 * @param {array} config.data Datos origen
 * @param {mapDef} config.map Funcion que convierte un dato a una opcion
 * @param {optionArray} config.start Opciones a agregar al inicio
 * @param {optionArray} config.end Opciones a agregar al final
 * @param {filterDef} config.filter Filtro a aplicar a las opciones
 * @returns Arreglo de opciones que cumplen con filter
 */
export const mapOptions = ({
	data,
	map = mapDef,
	start = [],
	end = [],
	filter = filterDef,
}) => [...start, ...data.map(map), ...end].filter(filter);

/**
 * Convierte value a minúsculas o mayúsculas dependiendo de casing
 * @param {string} value Valor a capitalizar
 * @param {number} casing
 * Si mayor a 0, convierte value a mayúsculas.
 * 
 * Si menor a 0, convierte value a minúsculas.
 * 
 * Si 0, no aplica conversión.
 * 
 * Por defecto es 0.
 * @returns Alteración de value según casing
 */
export const getCase = (value, casing = 0) =>
	casing < 0 ? value.toLowerCase() : casing > 0 ? value.toUpperCase() : value;

/**
 * Condición si option incluye search en su label
 * @param {optionDef} option Opcion a evaluar
 * @param {string} search Valor a buscar en label de option
 * @param {boolean} ignoreCase
 * Si debe o no considerar mayúsculas y minúsculas.
 * 
 * Por defecto no considera.
 * @returns true o false dependiendo de si search tiene valor y cumple la condición.
 */
export const includeSearch = (option, search, ignoreCase = true) =>
	!search ||
	getCase(option.label, ignoreCase).includes(getCase(search, ignoreCase));

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

const SearchSelectMaterial = (props) => {

  const handleChange = (event, newValue) => {   
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
						helperText={props.helperText}
						label={props.label}
						{...params}
						onChange={props.onTextChange}
					/>
				)}
      />
    </FormControl>
  );
};

export default SearchSelectMaterial;
