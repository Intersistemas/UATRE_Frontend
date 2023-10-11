import React from "react";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const EstablecimientosList = ({
	data = [],
	...x
}) => {
	const columns = [
		{
			dataField: "nroSucursal",
			text: "Nro.",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "80px" }),
			formatter: Formato.Entero,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "localidadDescripcion",
			text: "Localidad",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: { textAlign: "left" },
		},
		{
			dataField: "provinciaDescripcion",
			text: "Provincia",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: { textAlign: "left" },
		},
		{
			dataField: "_bajaFecha",
			text: "Fecha de baja",
			isDummyField: true,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			formatter: (_cell, row, _rowIndex, _formatExtraDatas) => {
				const style = {};
				let valor = Formato.Fecha(row.deletedDate);
				if (row.refMotivosBajaId) {
					if (!valor) valor = <>&nbsp;</>;
					style.background = "#ff6464cc";
					style.color = "#FFF";
				}
				return <div style={style}>{valor}</div>;
			},
			style: { textAlign: "center" },
		},
	];

	return (
		<Table
			remote
			keyField="id"
			data={data}
			columns={columns}
			noDataIndication={<h4>No hay informacion a mostrar</h4>}
			{...x}
		/>
	);
};

export default EstablecimientosList;
