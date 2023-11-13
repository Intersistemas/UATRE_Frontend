import Table from "components/ui/Table/Table";
import React from "react";
import Formato from "components/helpers/Formato";

const SeccionalesTable = ({
	columns: columnsInit = [],
	...x
} = {}) => {
		
	//#region declaracion de columnas
	const columns = [
		{
			headerTitle: (column, colIndex) => `Codigo Seccional`,
			dataField: "codigo",
			text: "Código",
			sort: true,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
		  },
		  {
			headerTitle: (column, colIndex) => `Nombre Seccional`,
			dataField: "descripcion",
			text: "Nombre",
			sort: true,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
		  },
		  {
			headerTitle: (column, colIndex) => `Estado`,
			dataField: "estado",
			text: "Estado",
			sort: true,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
			formatter: (value, row) => ( 
			  row.deletedDate ? `Baja - (${Formato.Fecha(row.deletedDate)})` : value
			),
		  },
		  {
			headerTitle: (column, colIndex) => `Dirección`,
			dataField: "domicilio",
			text: "Dirección",
			sort: true,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
		  },
		  {
			headerTitle: (column, colIndex) => `Localidad Seccional`,
			dataField: "localidadNombre",
			text: "Localidad",
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
			headerTitle: (column, colIndex) => `Id`,
			dataField: "deletedDate",
			text: "deletedDate",
			sort: true,
			hidden: true,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
		  },
		  {
			headerTitle: (column, colIndex) => `Delegación`,
			dataField: "refDelegacionDescripcion",
			text: "Delegación",
			sort: true,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
		  },
		...columnsInit
	];
	//#endregion

	return (
		<Table
			keyField="id"
			columns={columns}
			{...x}
		/>
	);
};

export default SeccionalesTable;