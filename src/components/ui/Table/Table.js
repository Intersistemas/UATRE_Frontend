import React, { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import ToolkitProvider, {
	Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
import "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import paginationFactory, {
	PaginationProvider,
	SizePerPageDropdownStandalone,
	PaginationListStandalone,
} from "react-bootstrap-table2-paginator";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import AsArray from "components/helpers/AsArray";
import classes from "./Table.module.css";

const { SearchBar } = Search;

const paginationDef = {
	index: 1,
	size: 12,
	count: 0,
	onChange: ({ index, size }) => {},
};

const onSelectedDef = (row) => {};

const selectionDef = {
	mode: "radio",
	clickToSelect: true,
	hideSelectColumn: true,
	style: {
		backgroundColor: "#EEC85E",
		color: "black",
		fontWeight: "bold",
	},
	onSelect: (row, isSelect, rowIndex, e) => onSelectedDef(row),
	onSelectAll: (isSelect, rows, e) => {},
};

const rowEventsDef = {
	onClick: (e, row, rowIndex) => selectionDef.onSelect(row),
};

const onTableChangeDef = (type, newState) => {};

//esta pensado como funcion para que cada componente envie su estilo, pensando en colores segun registros de una columna
const rowStyleDef = (_row, _cell) => ({
	backgroundColor: "#ffffff99",
	border: "1.5px solid #3595D2",
	color: "#000080", //color: '#727272',
});

const noDataIndicationDef = "No existen datos para mostrar";


const columnStyleDef = {
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
};

export const asColumnArray = (columns, def = []) => {
	switch (typeof columns) {
		case "function":
			return AsArray(columns(def.map((r) => ({ ...r }))), true);
		case "object":
			if (Array.isArray(columns) && columns.length)
				return columns.map((r) => ({
					...def.find((d) => d.dataField === r.dataField),
					...r,
				}));
			return def;
		default:
			return def;
	}
};

const Table = ({
	data = [],
	keyField = "",
	columns: myColumns,
	loading = false,
	pagination = { ...paginationDef },
	selection = { ...selectionDef },
	rowEvents = { ...rowEventsDef },
	onSelected = onSelectedDef, //** En desuso, utilizar "selection" = { ... onSelect } en su lugar */
	onTableChange = onTableChangeDef,
	rowStyle = rowStyleDef,
	mostrarBuscar = true,
	defaultSorted = false,
	noDataIndication = noDataIndicationDef,
	filter = undefined,
	overlay = undefined,
	baseProps = {},
	...x
}) => {
	data ??= [];
	keyField ??= "";
	const columns = asColumnArray(myColumns);
	columns.forEach((r) => {
		const style = r.style;
		r.style = (...a) => ({
			...columnStyleDef,
			...(typeof style === "function" ? style(...a) : style),
		});
	});
	onSelected ??= onSelectedDef;
	onTableChange ??= onTableChangeDef;
	rowStyle ??= rowStyleDef;
	mostrarBuscar ??= true;
	defaultSorted ??= false;
	noDataIndication ??= noDataIndicationDef;
	baseProps ??= {};

	// Normalizo la paginación que pasa por props
	if (pagination) {
		pagination = { ...paginationDef, ...pagination };
		if ((pagination.index ?? 1) < 1) pagination.index = paginationDef.index; // No especifica index válido
		if ((pagination.size ?? 1) < 1) pagination.size = paginationDef.size; // No especifica size válido
	} else {
		pagination = { ...paginationDef };
	}
	// Estado de paginación propio, por si no especifica mediante props
	const [myPagination, setMyPagination] = useState({
		// Usar valores especificados o por defecto
		...pagination,
		// Salvo el onChange que define el comportamiento por defecto
		onChange: ({ index, size }) =>
			setMyPagination((oldData) => {
				const newData = {}; // Contendrá valores que cambian
				if (index !== oldData.index) newData.index = index; // Cambia index
				if (size !== oldData.size) newData.size = size; // Cambia size
				if (!Object.keys(newData).length) return oldData; // Sin cambios
				return { ...oldData, ...newData }; // Informa nuevo estado con valores cambiados
			}),
	});
	// Si no especifica onChange, utilizar mi paginación
	if (pagination.onChange === paginationDef.onChange)
		pagination.onChange = undefined;
	if (!pagination.onChange) pagination = myPagination;
	// Si pagination.count es 0 o no especifica, tomar la cantidad de registros en data
	if ((pagination.count ?? 0) < 1) pagination.count = data.length;

	// Normalizo selectRow que pasa por props
	if (selection) {
		//console.log('selection:',selection);
		selection = { ...selectionDef, ...selection };
		const style = selection.style;
		selection.style = (...a) => ({
			...selectionDef.style,
			...(typeof style === "function" ? style(...a) : style),
		});
		if (selection.onSelect === selectionDef.onSelect)
			selection.onSelect = (row, isSelect, rowIndex, e) => onSelected(row);
	} else {
		selection = { ...selectionDef };
	}

	// Normalizo rowEvents que pasa por props
	if (rowEvents) {
		rowEvents = { ...rowEventsDef, ...rowEvents };
	} else {
		rowEvents = { ...rowEventsDef };
	}
	if (rowEvents.onClick === rowEventsDef.onClick)
		rowEvents.onClick = (e, row, rowIndex) => selection.onSelect(row);

	return (
		<div className={classes.tabla}>
			<PaginationProvider
				pagination={paginationFactory({
					custom: true,
					totalSize: pagination.count,
					page: pagination.index,
					sizePerPage: pagination.size,
					onPageChange: (page, sizePerPage) =>
						pagination.onChange({ index: page, size: sizePerPage }),
					paginationShowsTotal: false,
					hideSizePerPage: true,
				})}
				keyField={keyField}
				columns={columns}
				data={data}
				condensed
			>
				{({ paginationProps, paginationTableProps }) => (
					<ToolkitProvider
						keyField={keyField}
						columns={columns}
						data={data}
						search
						condensed
					>
						{(toolkitprops) => (
							<div>
								{!mostrarBuscar ? null : (
									<div className="position-absolute end-0 w-25" style={{ marginTop: '-2.5em'}}>
										<SearchBar
											{...toolkitprops.searchProps}
											srText=""
											placeholder="Ingrese datos de busqueda"
										/>
									</div>
								)}
								<div className={classes.tabla} {...baseProps}>
									<BootstrapTable
										{...toolkitprops.baseProps}
										{...paginationTableProps}
										selectRow={selection}
										defaultSorted={defaultSorted}
										defaultSortDirection="asc"
										hover
										bootstrap4
										condensed
										headerClasses={classes.headerClass}
										loading={loading}
										onTableChange={onTableChange}
										filter={filter}
										noDataIndication={noDataIndication}
										rowEvents={rowEvents}
										overlay={overlay}
										rowStyle={rowStyle}
										{...x}
									/>
								</div>
								<SizePerPageDropdownStandalone {...paginationProps} />
								<PaginationListStandalone {...paginationProps} />
							</div>
						)}
					</ToolkitProvider>
				)}
			</PaginationProvider>
		</div>
	);
};

export default Table;
