import React from 'react';
import classes from './Table.module.css';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';



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


const rowStyle = { 
  backgroundColor: '#ffffffcc',
  border: '1.5px solid #3595D2', 
  color: '#727272',
};


  return (
    <div>
            <BootstrapTable
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
            />
    </div>

  );
};

export default Table;
