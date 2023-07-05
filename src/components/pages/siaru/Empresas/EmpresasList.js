import React from "react";
import Formato from "../../../helpers/Formato";
import Table from "../../../ui/Table/Table";

const EmpresasList = ({
	data = [],
	loading,
	noData,
	pagination = {},
	selection = {},
}) => {
	data ??= [];
	pagination ??= {};
	selection ??= {};

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "cuitEmpresa",
			text: "CUIT",
			sort: true,
			formatter: Formato.Cuit,
      headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			style: {...cs}
		},
		{
			dataField: "razonSocial",
			text: "Razon Social",
			sort: true,
			style: {...cs, textAlign: "left"}
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
			keyField="cuitEmpresa"
			loading={loading}
			data={data}
			columns={columns}
			pagination={pagination}
			selection={selection}
			noDataIndication={noData}
		/>
	);
};

export default EmpresasList;
