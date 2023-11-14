import React from "react";
import Table from "components/ui/Table/Table";

import SwitchCustom from "../../../ui/Switch/SwitchCustom";
//import FormatearFecha from "../../../helpers/FormatearFecha";
import { handleModuloSeleccionar } from "../../../../redux/actions";
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
		headerTitle: (column, colIndex) => `Cargo`,
		dataField: "refCargosDescripcion",
		text: "Cargo",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
		},
		},
		{
		headerTitle: (column, colIndex) => `Nombre`,
		dataField: "afiliadoNombre",
		text: "Nombre",
		sort: true,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
		},
		},
		{
		headerTitle: (column, colIndex) => `NroAfiliado`,
		dataField: "afiliadoNumero",
		text: "NroAfiliado",
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
		{
		headerTitle: (column, colIndex) => `VigenteDesde`,
		dataField: "fechaVigenciaDesde",
		text: "Vigencia Desde",
		sort: true,
		formatter:FormatearFecha,
		headerStyle: (colum, colIndex) => {
			return { width: "7rem", textAlign: "center" };
		},
		},
		{
		headerTitle: (column, colIndex) => `VigenteHasta`,
		dataField: "fechaVigenciaHasta",
		text: "Vigencia Hasta",
		sort: true,
		formatter: FormatearFecha,
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
				mostrarBuscar={false}
				columns={columns}
				{...x}
			/>
	);
};

export default AuoridadesTable;
