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
			dataField: "deletedDate",
			text: "Fecha de baja",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			formatter: (value) => {
				const style = {};
				value = Formato.Fecha(value);
				if (value) {
					style.background = "#ff6464cc";
					style.color = "#FFF";
				}
				return <div style={style}>{value}</div>;
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
