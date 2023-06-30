import React from "react";
import paginationFactory from "react-bootstrap-table2-paginator";
import Formato from "../../../helpers/Formato";
import Table from "../../../ui/Table/Table";

const EmpresasList = ({
	data = [],
	loading,
	noData,
	pagination = {},
	onPaginationChange = ((_pageIndex, _pageSize) => {}),
	onSelect = (_registro) => {},
}) => {
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
			dataField: "domicilioLocalidad",
			text: "Localidad",
			sort: true,
      headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: {...cs, textAlign: "left"}
		},
		{
			dataField: "domicilioProvincia",
			text: "Provincia",
			sort: true,
      headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: {...cs, textAlign: "left"}
		},
	];

	let bootstrapPagination;
	if (pagination) {
		bootstrapPagination = paginationFactory({
			page: pagination.index,
			sizePerPage: pagination.size,
			totalSize: pagination.count,
			lastPageText: ">>",
			firstPageText: "<<",
			nextPageText: ">",
			prePageText: "<",
			hideSizePerPage: true,
			paginationShowsTotal: false,
			onPageChange: onPaginationChange,
			onSizePerPageChange: onPaginationChange,
		});
	}

	return (
		<Table
			remote
			keyField="cuitEmpresa"
			loading={loading}
			data={data}
			columns={columns}
			pagination={bootstrapPagination}
			noDataIndication={noData}
			onSelected={onSelect}
		/>
	);
};

export default EmpresasList;
