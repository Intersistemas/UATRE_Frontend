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
 
const AuoridadesTable  = ({
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
		headerTitle: (column, colIndex) => `Orden`,
		dataField: "ordenPregunta",
		text: "Orden",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
			},
		},
		{
		headerTitle: (column, colIndex) => `Tipo`,
		dataField: "tipoPregunta",
		text: "Tipo",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
			},
		},
		{
		headerTitle: (column, colIndex) => `Enunciado`,
		dataField: "enunciado",
		text: "Enunciado",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Observaciones`,
			dataField: "observaciones",
			text: "Observaciones",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
				},
		},
	]

	return (
			<Table
				keyField="id"
				mostrarBuscar={false}
				columns={columns}
				{...x}
			/>
	);
};

export default AuoridadesTable;
