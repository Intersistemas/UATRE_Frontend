import React from "react";
import Table from "components/ui/Table/Table";

import SwitchCustom from "../../../../ui/Switch/SwitchCustom";
//import FormatearFecha from "../../../helpers/FormatearFecha";
import { handleModuloSeleccionar } from "../../../../../redux/actions";
import { FormControlLabel, Switch } from "@mui/material";
import FormatearFecha from "components/helpers/FormatearFecha";
import Formato from "components/helpers/Formato";

/*<FormControlLabel
				control={
				<Switch checked={true} onChange={handleChangeSwitch} label={props.label} />
				}
				label="Solo vigentes"
			/>
*/
 
const SeccionalLocalidadesTable  = ({
	columns: columnsInit = [],
	...x
} = {}) => {

	const columns = [
		{
			headerTitle: (column, colIndex) => `Id`,
			dataField: "id",
			text: "Id",
			sort: true,
			hidden: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Codigo`,
			dataField: "codigo",
			text: "Código",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Nombre Localidad`,
			dataField: "nombre",
			text: "Localidad",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Código Postal`,
			dataField: "codPostal",
			text: "Código Postal",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Provincia`,
			dataField: "litProvincia",
			text: "Provincia",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Fecha Baja`,
			dataField: "deletedDate",
			text: "Fecha Baja",
			sort: true,
			formatter:FormatearFecha,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
		},
	]

	return (
			<Table
				keyField="id"
				mostrarBuscar={true}
				columns={columns}
				{...x}
			/>
	);
};

export default SeccionalLocalidadesTable;
