import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import styles from "./EstablecimientosList.module.css";

const EstablecimientosList = (props) => {
	let config = props.config;
	let establecimientos = [...config.data];
	const onSelect = config.onSelect ?? ((ix) => {});

	const columns = [
		{
			dataField: "id",
			text: "Id",
		},
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
			cantTrabajadores: "cantTrabajadores",
			text: "Cant. trabajadores",
		},
		{
			dataField: "domicilioCalle",
			text: "Domicilio calle",
		},
		{
			dataField: "domicilioNumero",
			text: "Domicilio Nro.",
		},
	];

	const selectRow = {
		mode: "radio",
		clickToSelect: true,
		onSelect: (row, isSelect, rowIndex, e) => onSelect(rowIndex),
	};

	// const handleTableChange = (
	// 	type,
	// 	{ page, sizePerPage, filters, sortField, sortOrder, cellEdit }
	// ) => {
	// 	const currentIndex = (page - 1) * sizePerPage;
	// };

	return (
		<div className={styles.div}>
			<BootstrapTable
				bootstrap4
				remote
				keyField="id"
				data={establecimientos}
				columns={columns}
				selectRow={selectRow}
				// pagination={pagination}
				// onTableChange={handleTableChange}
				// loading={loading}
				striped
				hover
				condensed
			/>
		</div>
	);
};

export default EstablecimientosList;
