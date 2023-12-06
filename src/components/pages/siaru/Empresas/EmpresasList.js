import React from "react";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const EmpresasList = ({
	data = [],
	...x
}) => {
	data ??= [];

	const columns = [

		{
			dataField: "id",
			text: "id",
			hidden: true,
		},
		{
			dataField: "cuitEmpresa",
			text: "CUIT",
			sort: true,
			formatter: Formato.Cuit,
      		headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
		},
		{
			dataField: "razonSocial",
			text: "Razon Social",
			sort: true,
			style: { textAlign: "left"}
		},
		{
			dataField: "localidadDescripcion",
			text: "Localidad",
			sort: true,
      headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: { textAlign: "left"}
		},
		{
			dataField: "provinciaDescripcion",
			text: "Provincia",
			sort: true,
      headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: { textAlign: "left"}
		},
	];

	return (
		<Table
			keyField="id"
			data={data}
			columns={columns}
			{...x}
		/>
	);
};

export default EmpresasList;
