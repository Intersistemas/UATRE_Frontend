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
	if (!data) data = [];
	if (!pagination) pagination = {};
	if (!onSelect) onSelect = (_registro) => {};
	if (!onPaginationChange) onPaginationChange = (_pageIndex, _pageSize) => {};
	
	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { ...cs },
		},
		{
			dataField: "nroSucursal",
			text: "Nro. Sucursal",
			sort: true,
			formatter: Formato.Entero,
			style: { ...cs },
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
