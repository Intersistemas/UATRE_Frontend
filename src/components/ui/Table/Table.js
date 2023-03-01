import React from 'react';
import classes from './Table.module.css';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {
  textFilter,
  selectFilter,
  Comparator,
} from "react-bootstrap-table2-filter";


const { SearchBar } = Search;

const Table = (props) => {

  const selectRow = {
    mode: 'radio',
    clickToSelect: true,
    hideSelectColumn: true,
    style: {
       backgroundColor: 'rgb(194 194 194 / 80%)',
       color: 'black',
       fontWeight: 'bold',
  }
};

const rowEvents = {
  onClick: (e, row, rowIndex) => {
    props.onSelected(row);
  },
};

const pagination = props.pagination

const rowStyle = { 
  backgroundColor: '#ffffffcc',
  border: '1.5px solid #3595D2', 
  color: '#727272',
};

const rowStyle2 = (row, cell) => {
  const rowStyle = { 
    backgroundColor: '#ffffffcc',
    border: '1.5px solid #3595D2', 
    color: '#000',//color: '#727272',
  };
  return rowStyle;
};


let MyGrid = <ToolkitProvider
    keyField= {props.keyField}
    data={ props.data }
    columns={ props.columns }         
    search
    >{
        props => (
          <div>
            <div style = {{display: 'flex', justifyContent: 'center'}}>
              <h3>Buscar :</h3>
              <SearchBar 
                srText = ""
                placeholder = "Ingrese datos a buscar"
                { ...props.searchProps } 
              />
            </div>
            <hr />
            <div className={classes.tabla}>
            <BootstrapTable
            
            hover
            bootstrap4
            condensed  //NO FUNCIONA CON ToolkitProvider
            remote = {props.remote}      
            headerClasses= {classes.headerClass}
            loading = {props.loading}
            //pagination={pagination}
            onTableChange= {props.onTableChange}
            filter = {props.filter}
            noDataIndication= {props.noDataIndication}
            rowEvents = {rowEvents}
            overlay = {props.overlay}
            selectRow={selectRow}
            rowStyle = {(props.rowStyle ? props.rowStyle : rowStyle2)}
              { ...props.baseProps }
            />
            </div>
          </div>
        )
      }
</ToolkitProvider>


  return (
    <div>

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
