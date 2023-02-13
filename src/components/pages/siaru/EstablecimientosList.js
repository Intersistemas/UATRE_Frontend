import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import styles from "./EstablecimientosList.module.css";

const EstablecimientosList = (props) => {
	const config = { ...props.config };
	const data = [...config.data].map((e) => {
		const r = { ...e };

		if (r.domicilioCalle == null) r.domicilioCalle = "";
		if (r.domicilioNumero == null) r.domicilioNumero = 0;
		if (r.domicilioPiso == null) r.domicilioPiso = "";
		if (r.domicilioDpto == null) r.domicilioDpto = "";
		if (r.domicilioSector == null) r.domicilioSector = "";
		if (r.domicilioTorre == null) r.domicilioTorre = "";
		if (r.domicilioManzana == null) r.domicilioManzana = "";

		r.domicilio = "";

		if (e.domicilioCalle !== 0) {
			if (r.domicilio) r.domicilio = `${r.domicilio} `;
			r.domicilio = `${r.domicilio} Calle ${e.domicilioCalle}`;
		}
		if (e.domicilioNumero !== 0) {
			if (r.domicilio) r.domicilio = `${r.domicilio} `;
			r.domicilio = `${r.domicilio} Nro ${e.domicilioNumero}`;
		}
		if (e.domicilioPiso !== "") {
			if (r.domicilio) r.domicilio = `${r.domicilio} `;
			r.domicilio = `${r.domicilio} Piso ${e.domicilioPiso}`;
		}
		if (e.domicilioDpto !== "") {
			if (r.domicilio) r.domicilio = `${r.domicilio} `;
			r.domicilio = `${r.domicilio} Dpto ${e.domicilioDpto}`;
		}

		return r;
	});
	const pagination = { ...config.pagination };
	const onSelect = config.onSelect ?? ((ix) => {});
	const onPaginationChange =
		config.onPaginationChange ?? ((pageIndex, pageSize) => {});

	const columns = [
		{
			dataField: "nroSucursal",
			text: "Nro. Sucursal",
			sort: true,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
		},
		{
			dataField: "cantTrabajadores",
			text: "Cant. trabajadores",
		},
		{
			dataField: "domicilio",
			text: "Domicilio",
		},
	];

	const selectRow = {
		mode: "radio",
		clickToSelect: true,
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
			//hideSizePerPage: true,
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
				pagination={bootstrapPagination}
				striped
				hover
				condensed
			/>
		</div>
	);
};

export default EstablecimientosList;
