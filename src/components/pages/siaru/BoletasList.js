import React from "react";
import paginationFactory from "react-bootstrap-table2-paginator";
import Table from "../../ui/Table/Table";

const BoletasList = (props) => {
	const config = { ...props.config };
	const data = [...config.data];
	const pagination = { ...config.pagination };
	const onSelect = config.onSelect ?? ((boleta) => {});
	const onPaginationChange =
		config.onPaginationChange ?? ((pageIndex, pageSize) => {});

	const columns = [
		{
			dataField: "periodo",
			text: "Periodo",
			sort: true,
		},
		{
			dataField: "fecha",
			text: "Fecha",
			sort: true,
		},
		{
			dataField: "cantidadTrabajadores",
			text: "Cant. trabajadores",
		},
		{
			dataField: "totalRemuneraciones",
			text: "Total remuneraciones",
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
			onPageChange: onPaginationChange,
			onSizePerPageChange: onPaginationChange,
		});
	}

	return (
		<Table
			remote
			keyField="id"
			loading={config.loading}
			data={data}
			columns={columns}
			pagination={bootstrapPagination}
			noDataIndication={<h4>No hay informacion a mostrar</h4>}
			onSelected={onSelect}
		/>
	);
};

export default BoletasList;
