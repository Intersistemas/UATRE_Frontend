import React from "react";
import paginationFactory from "react-bootstrap-table2-paginator";
import Table from "../../ui/Table/Table";
import Formato from "../../helpers/Formato";

const BoletasList = (props) => {
	const config = { ...props.config };
	const data = [...config.data];
	const pagination = { ...config.pagination };
	const onSelect = config.onSelect ?? ((boleta) => {});
	const onPaginationChange =
		config.onPaginationChange ?? ((pageIndex, pageSize) => {});
	const tiposPagos = [
		{ id: 1, descripcion: "Sindical" },
		{ id: 2, descripcion: "Solidario" },
		{ id: 3, descripcion: "Sepelio" },
	];
	const tiposLiquidaciones = [
		{ id: 1, codigo: 0, descripcion: "Periodo" },
		{ id: 2, codigo: 1, descripcion: "Acta" },
	];

	const columns = [
		{
			dataField: "id",
			text: "Numero",
			sort: true,
		},
		{
			dataField: "tipoLiquidacion",
			text: "Tipo liquidacion",
			sort: true,
			formatter: v => tiposLiquidaciones.find(r => r.codigo === v)?.descripcion
		},
		{
			dataField: "tiposPagosId",
			text: "Tipo de pago",
			sort: true,
			formatter: v => tiposPagos.find(r => r.id === v)?.descripcion
		},
		{
			dataField: "periodo",
			text: "Periodo",
			sort: true,
			formatter: Formato.Periodo
		},
		{
			dataField: "fecha",
			text: "Fecha",
			sort: true,
			formatter: Formato.Fecha
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
    	paginationShowsTotal: false,
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
