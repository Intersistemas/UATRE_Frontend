import React from "react";
import classes from "./TableRemote.module.css";
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
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from "../Button/Button";

const { SearchBar } = Search;

const TableRemote = (props) => {

  const [selectValue, setSelectValue] = React.useState('');
  const [entryValue, setEntryValue] = React.useState('');

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


  const rowStyle2 = (row, cell) => {
    //esta pensado como funcion para que cada componente envie su estilo, pensando en colores segun registros de una columna
    const rowStyle = {
      backgroundColor: "#ffffff99",
      border: "1.5px solid #3595D2",
      color: '#000080', //color: '#727272',
    };
    return rowStyle;

  };

  const handleChangeSearchSelect = (event) => {
    setSelectValue(event.target.value);
    //props.handleSelectFilter(event.target.value);
  };

const handleChangeSearchEntry = (event) => {
    console.log('event',event.target.value);
    setEntryValue(event.target.value);
      //props.handleSelectFilter(event.target.value);
    };
  
  return (

    <div className={classes.tabla}>
      {props.selectoresBuscar &&
       <Box sx={{ maxWidth: 600}} style={{display:'flex', float: 'right', width: '30%' }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Buscar </InputLabel>
          <Select
          
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectValue}
            label="Buscar por:"
            onChange={handleChangeSearchSelect}
            
          >
            {props.selectoresBuscar.map((valores)=>{
                  return <MenuItem value={valores}>{valores.text}</MenuItem>
                  })
            }
          </Select>
        </FormControl>
        <TextField 
        fullWidth id="outlined-basic" label={`Ingrese ${selectValue.text ?? ''}`} variant="outlined"  onChange={handleChangeSearchEntry}
        helperText={
          props.error
            ? "Error buscando datos"
            : ""
        }
        error={props.error}
        />
        <Button
              width={80}
              onClick={()=>props.accionBuscar(selectValue.text,entryValue)}
              disabled={!entryValue ?? true}
        >BUSCAR</Button>
      </Box>
    
      }

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
          filter={filterFactory()}
          noDataIndication={
            props.noDataIndication ?? "No existen datos para mostrar"
          }
          rowEvents = {rowEvents}
          defaultSorted={props.defaultSorted ?? false}
          //defaultSortDirection="asc"
          overlay = {props.overlay}
          selectRow={selectRow}
          rowStyle={props.rowStyle ? props.rowStyle : rowStyle2}
      />
    </div>
  );
};

export default TableRemote;
