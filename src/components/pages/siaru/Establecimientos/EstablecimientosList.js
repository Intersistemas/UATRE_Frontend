import React from "react";
import Formato from "../../../helpers/Formato";
import Table from "../../../ui/Table/Table";

const EstablecimientosList = ({
	loading = false,
	data = [],
	pagination = {},
	selection = {},
}) => {
	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "nroSucursal",
			text: "Nro.",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "80px" }),
			formatter: Formato.Entero,
			style: { ...cs },
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "localidadDescripcion",
			text: "Localidad",
			sort: true,
      headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: {...cs, textAlign: "left"}
		},
		{
			dataField: "provinciaDescripcion",
			text: "Provincia",
			sort: true,
      headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: {...cs, textAlign: "left"}
		},
	];

	return (
		<Table
			remote
			keyField="id"
			loading={loading}
			data={data}
			columns={columns}
			pagination={pagination}
			selection={selection}
			noDataIndication={<h4>No hay informacion a mostrar</h4>}
		/>
	);
};

export default EstablecimientosList;
