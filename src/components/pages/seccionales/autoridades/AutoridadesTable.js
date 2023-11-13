import React from "react";
import Table from "components/ui/Table/Table";

import SwitchCustom from "../../../ui/Switch/SwitchCustom";
//import FormatearFecha from "../../../helpers/FormatearFecha";
import { handleModuloSeleccionar } from "../../../../redux/actions";
import { FormControlLabel, Switch } from "@mui/material";

/*<FormControlLabel
				control={
				<Switch checked={true} onChange={handleChangeSwitch} label={props.label} />
				}
				label="Solo vigentes"
			/>
*/

const AuoridadesTable = ({ columns = [], ...x }) => {
	return (
			
			<Table
				remote
				keyField="id"
				mostrarBuscar={false}
				columns = {[
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
					headerTitle: (column, colIndex) => `VigenteDesde`,
					dataField: "fechaVigenciaDesde",
					text: "Vigencia Desde",
					sort: true,
					//formatter: FormatearFecha,
					headerStyle: (colum, colIndex) => {
						return { width: "7rem", textAlign: "center" };
					},
					},
					{
					headerTitle: (column, colIndex) => `VigenteHasta`,
					dataField: "fechaVigenciaHasta",
					text: "Vigencia Hasta",
					sort: true,
					//formatter: FormatearFecha,
					headerStyle: (colum, colIndex) => {
						return { width: "7rem", textAlign: "center" };
					},
					},
				
				]}
				{...x}
			/>
	);
};

export default AuoridadesTable;
