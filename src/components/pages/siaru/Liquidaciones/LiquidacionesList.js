import React from "react";
import paginationFactory from "react-bootstrap-table2-paginator";
import Formato from "../../../helpers/Formato";
import Table from "../../../ui/Table/Table";

const LiquidacionesList = (props) => {
	const config = { ...props.config };
	const data = [...config.data];
	const pagination = { ...config.pagination };
	const onSelect = config.onSelect ?? ((registro) => {});
	const onPaginationChange =
		config.onPaginationChange ?? ((pageIndex, pageSize) => {});
	const tiposLiquidacion = [
		{ codigo: 0, descripcion: "Periodo"},
		{ codigo: 1, descripcion: "Acta"},
	];

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "id",
			text: "Número",
			formatter: Formato.Entero,
			sort: true,
      headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs, textAlign: "right" },
		},
		{
			dataField: "periodo",
			text: "Periodo",
			formatter: Formato.Periodo,
			sort: true,
      headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
		{
			dataField: "tipoLiquidacion",
			text: "Tipo",
			sort: true,
			formatter: (v) => tiposLiquidacion.find(r => r.codigo === v)?.descripcion ?? "",
      headerStyle: (colum, colIndex) => ({ width: "80px" }),
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "empresasEstablecimientos_Nombre",
			text: "Establecimiento",
			sort: true,
			style: { ...cs, textAlign: "left" },
		},
		{
			dataField: "bajaFecha",
			text: "Baja fecha",
			formatter: Formato.Fecha,
			sort: true,
      headerStyle: (colum, colIndex) => ({ width: "120px" }),
			style: { ...cs },
		},
		{
			dataField: "refMotivosBaja_Descripcion",
			text: "Baja motivo",
			sort: true,
			style: { ...cs, textAlign: "left" },
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

export default LiquidacionesList;
