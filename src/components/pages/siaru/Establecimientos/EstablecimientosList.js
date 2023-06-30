import React from "react";
import paginationFactory from "react-bootstrap-table2-paginator";
import Formato from "../../../helpers/Formato";
import Table from "../../../ui/Table/Table";

const EstablecimientosList = ({
	loading = false,
	data = [],
	pagination = {},
	onSelect = (_registro) => {},
	onPaginationChange = (_pageIndex, _pageSize) => {},
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
			keyField="id"
			loading={loading}
			data={data}
			columns={columns}
			pagination={bootstrapPagination}
			noDataIndication={<h4>No hay informacion a mostrar</h4>}
			onSelected={onSelect}
		/>
	);
};

export default EstablecimientosList;
