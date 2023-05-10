import React from "react";
import classes from "./TableRemote.module.css";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import filterFactory from "react-bootstrap-table2-filter";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from "../Button/Button";

const TableRemote = (props) => {

  const [selectValue, setSelectValue] = React.useState('');
  const [entryValue, setEntryValue] = React.useState('');
console.log('**propsIndex**',props.rowSelectedIndex)
  
  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
    selected: props.rowSelectedIndex ?? null,
    style: {
      backgroundColor: "rgb(194 194 194 / 70%)",
      color: "black",
      fontWeight: "bold",
    },
  };

  const rowEvents = {
    onClick: (e, row) => {
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
    setEntryValue(event.target.value);
      //props.handleSelectFilter(event.target.value);
  };

  const accionLimpiarFiltros = () =>{
    props.accionBuscar('','');
  };
  
  return (

    <div className={classes.tabla}>
      {props.selectoresBuscar &&
       <Box sx={{ maxWidth: 600}} style={{display:'flex', float: 'right', width: 'auto' }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Buscar </InputLabel>
          <Select
          
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectValue.dataField}
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

        onKeyPress={(ev) => {
          
          if (ev.key === 'Enter' && entryValue) {
            props.accionBuscar(selectValue.dataField,entryValue)
            ev.preventDefault();
          }
        }}

        /*helperText={
          props.error
            ? "Error buscando datos"
            : ""
        }*/
        error={props.error}
        />
        <Button
              width={80}
              onClick={()=>props.accionBuscar(selectValue.dataField,entryValue)}
              disabled={!entryValue ?? true}
        >BUSCAR</Button>
        <Button
              width={40}
              onClick={()=>accionLimpiarFiltros()}
        >Limpiar</Button>
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
