import React from 'react';
import classes from './Table.module.css';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';



const Table = (props) => {
  console.log('props.width',props);

 /* --color3: #82C3ED;
  --color4: rgb(13 110 253 / 50%); /*focus*/

  const selectRow = {
    mode: 'radio',
    clickToSelect: true,
    hideSelectColumn: true,
    style: {
       backgroundColor: 'rgb(194 194 194 / 80%)',//'#ffffff',//'#82C3ED70', 
       color: '#555555',//'#186090',
       fontWeight: 'bold',
  }
};

const rowEvents = {
  onClick: (e, row, rowIndex) => {
    console.log('row ',row);
    props.onSelected(row);
  },
};

const headerStyle = {
  color: 'white',
  backgroundColor: 'rgb(85 85 85 / 90%)',
};

const rowStyle = { 
  /*backgroundColor: '#82C3ED15', */
  backgroundColor: '#ffffffcc',
  border: '1.5px solid #3595D2', 
  color: '#727272',

};


  return (
    <div>
            <BootstrapTable keyField='cuit'
            data={ props.data }
            columns={ props.columns }          
            selectRow={selectRow}
            rowStyle = {rowStyle}
            headerClasses= {classes.headerClass}
            rowEvents = {rowEvents}
            
            />
    </div>

  );
};

export default Table;
