import React, { useState } from "react";
import classes from "./Table.module.css";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import ToolkitProvider, {
  Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
import "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import filterFactory, {
  textFilter,
  selectFilter,
  Comparator,
} from "react-bootstrap-table2-filter";
import paginationFactory, {
  PaginationProvider,
  SizePerPageDropdownStandalone,
  PaginationListStandalone,
} from "react-bootstrap-table2-paginator";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

const { SearchBar } = Search;

const Table = (props) => {
  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
    style: {
      backgroundColor: "rgb(194 194 194 / 70%)",
      color: "black",
      fontWeight: "bold",
    },
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      props.onSelected(row);
    },
  };

  /*const rowStyle = { 
backgroundColor: '#ffffffcc',
border: '1.5px solid #3595D2', 
color: '#727272',
};*/

  const rowStyle2 = (row, cell) => {
    //esta pensado como funcion para que cada componente envie su estilo, pensando en colores segun registros de una columna
    const rowStyle = {
      backgroundColor: "#ffffff99",
      border: "1.5px solid #3595D2",
      color: '#000080', //color: '#727272',
    };
    return rowStyle;

  };

	// Normalizo la paginación que pasa por props
	let pagination = { index: 1, size: 15 }; // Valores por defecto
	if (props.pagination) {
		if (props.pagination.index > 0) pagination.index = props.pagination.index; // Especifica index válido
		if (props.pagination.size > 0) pagination.size = props.pagination.size; // Especifica size válido
		if (props.pagination.onChange)
			pagination.onChange = props.pagination.onChange; // Especifica callback onChange
	}
	// Estado de paginación propio, por si no especifica mediante props
	const [myPagination, setMyPagination] = useState({
		// Usar valores especificados o por defecto
		...pagination,
		// Salvo el onChange que define el comportamiento por defecto
		onChange: (page) =>
			setMyPagination((oldData) => {
				const newData = {}; // Contendrá valores que cambian
				if (page.index !== oldData.index) newData.index = page.index; // Cambia index
				if (page.size !== oldData.size) newData.size = page.size; // Cambia size
				if (!Object.keys(newData).length) return oldData; // Sin cambios
				return { ...oldData, ...newData }; // Informa nuevo estado con valores cambiados
			}),
	});
	// Si no especifica onChange, utilizar mi paginación
	if (!pagination.onChange) pagination = myPagination;

  let MyGrid = (
    <PaginationProvider
      pagination={paginationFactory({
        custom: true,
        totalSize: props.data.length,
        page: pagination.index,
        sizePerPage: pagination.size,
				onPageChange: (page, sizePerPage) =>
					pagination.onChange({ index: page, size: sizePerPage }),
        paginationShowsTotal: false,
        hideSizePerPage: true,
        /*sizePerPageList: [
              {
                text: "10",
                value: 10
              },
              {
                text: "30",
                value: 30
              },
              {
                text: "50",
                value: 50
              },
              {
                text: "Todo",
                value: afiliados.data.length
              }
            ],*/
        //hideSizePerPage: props.data.length === 0
      })}
      keyField={props.keyField}
      columns={props.columns}
      data={props.data}
      condensed
    >
      {({ paginationProps, paginationTableProps }) => (
        <ToolkitProvider
          keyField={props.keyField}
          columns={props.columns}
          data={props.data}
          search
          condensed
        >
          {(toolkitprops) => (
            <div>
              {props.mostrarBuscar !== false ? (
                <div style={{ display: "flex", justifyContent: "right" }}>
                  <SearchBar
                    {...toolkitprops.searchProps}
                    srText=""
                    placeholder="Ingrese datos a buscar"
                  />
                </div>
              ) : null}
              <br />
              <div className={classes.tabla}>
                <BootstrapTable
                  {...toolkitprops.baseProps}
                  {...paginationTableProps}
                  selectRow={selectRow}
                  defaultSorted={props.defaultSorted ?? false}
                  defaultSortDirection="asc"
                  hover
                  bootstrap4
                  condensed
                  //remote = {false}
                  headerClasses={classes.headerClass}
                  loading={props.loading}
                  onTableChange={props.onTableChange}
                  filter={props.filter}
                  noDataIndication={
                    props.noDataIndication ?? "No existen datos para mostrar"
                  }
                  rowEvents={rowEvents}
                  overlay={props.overlay}
                  rowStyle={props.rowStyle ? props.rowStyle : rowStyle2}
                  {...props.baseProps}
                />
              </div>
              <SizePerPageDropdownStandalone {...paginationProps} />
              <PaginationListStandalone {...paginationProps} />
            </div>
          )}
        </ToolkitProvider>
      )}
    </PaginationProvider>
  );
  return (

    <div className={classes.tabla}>
          {MyGrid}
        {/*<BootstrapTable
          hover
          bootstrap4
          condensed  
          remote = {props.remote}
          keyField= {props.keyField}
          data={ props.data }
          columns={ props.columns }          
          headerClasses= {classes.headerClass}
          loading = {props.loading}
          pagination = {props.pagination}
          onTableChange= {props.onTableChange}
          filter = {props.filter}
          noDataIndication= {props.noDataIndication}
          rowEvents = {rowEvents}

          overlay = {props.overlay}
          selectRow={selectRow}
          rowStyle = {rowStyle}
      />*/}
    </div>
  );
};

export default Table;
