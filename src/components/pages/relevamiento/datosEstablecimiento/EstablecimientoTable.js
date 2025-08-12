

import React from "react";
import Table from "components/ui/Table/Table";
import Formato from "components/helpers/Formato"; 


const PreguntasTable = ({

	

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
			headerTitle: (column, colIndex) => `Razon Social`,
			dataField: "establecimientoRazonSocial",
			text: "Razon Social",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
		},

		{
			headerTitle: (column, colIndex) => `Cuit`,
			dataField: "establecimientoCUIT",
			text: "Cuit",
			sort: true,
			formatter: (cell) => Formato.Cuit(cell),
			headerStyle: () => ({ textAlign: "center", width: "10rem" }),
		},

		{
			headerTitle: (column, colIndex) => `Sector`,
			dataField: "establecimientoSector",
			text: "Sector",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Actividad`,
			dataField: "establecimientoActividad",
			text: "Actividad",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
		},
		{
			headerTitle: (column, colIndex) => `GeoUbicación`,
			dataField: "establecimientoLugar",
			text: "GeoUbicación",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
		},
		{
			headerTitle: (column, colIndex) => `QuienRecibe`,
			dataField: "establecimientoResponsable",
			text: "QuienRecibe",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Dni`,
			dataField: "establecimientoResponsableDNI",
			text: "Dni",
			sort: true,
			formatter: (cell) => Formato.DNI(cell),
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Celular`,
			dataField: "establecimientoContactoCelular",
			text: "Celular",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
		},
		{
			headerTitle: (column, colIndex) => `Mail`,
			dataField: "establecimientoContactoEmail",
			text: "Mail",
			sort: true,
			headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
		},
	];

	return (
		<Table
			keyField="id"
			mostrarBuscar={false}
			columns={columns}
			{...x}
		/>
	);
};

export default PreguntasTable;
