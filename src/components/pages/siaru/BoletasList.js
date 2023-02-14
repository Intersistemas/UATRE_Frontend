import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import styles from "./BoletasList.module.css";

const BoletasList = (props) => {
	const config = { ...props.config };
	const data = [...config.data];
	const pagination = { ...config.pagination };
	const onSelect = config.onSelect ?? ((ix) => {});
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

	const selectRow = {
		mode: "radio",
		clickToSelect: true,
		style: {
			backgroundColor: "rgb(194 194 194 / 80%)",
			color: "#555555",
			fontWeight: "bold",
		},
		onSelect: (row, isSelect, rowIndex, e) => onSelect(rowIndex),
	};

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
			showTotal: true,
			alwaysShowAllBtns: true,
			hideSizePerPage: true,
			onPageChange: (page, sizePerPage) =>
				onPaginationChange(page, sizePerPage),
			onSizePerPageChange: (page, sizePerPage) =>
				onPaginationChange(page, sizePerPage),
		});
	}

	return (
		<div className={styles.div}>
			<BootstrapTable
				bootstrap4
				remote
				keyField="id"
				data={data}
				columns={columns}
				selectRow={selectRow}
				rowStyle={{
					backgroundColor: "#ffffffcc",
					border: "1.5px solid #3595D2",
					color: "#727272",
				}}
				headerClasses={styles.tableHeader}
				pagination={bootstrapPagination}
				striped
				hover
				condensed
			/>
		</div>
	);
};

export default BoletasList;
