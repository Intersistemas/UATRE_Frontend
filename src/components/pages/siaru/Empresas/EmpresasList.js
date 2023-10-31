import React from "react";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const EmpresasList = ({
	data = [],
	noData,
	...x
}) => {
	data ??= [];

	const columns = [
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
			keyField="cuitEmpresa"
			data={data}
			columns={columns}
			noDataIndication={noData}
			{...x}
		/>
	);
};

export default EmpresasList;
