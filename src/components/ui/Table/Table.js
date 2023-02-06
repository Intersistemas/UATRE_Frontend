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
    style: {
       backgroundColor: '#82C3ED70', 
       color: '#186090',
       fontWeight: 'bold',
  }

};

const rowStyle = { 
  backgroundColor: '#82C3ED15', 
  border: '1.5px solid #3595D2', 
  color: '#727272',

};


  return (
    <div>
            <BootstrapTable keyField='cuit'
            data={ props.products }
            columns={ props.columns }          
            selectRow={selectRow}
            rowStyle ={rowStyle}
            />
    </div>

  );
};

export default Table;
