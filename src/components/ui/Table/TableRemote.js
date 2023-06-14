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
  
  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
    selected: props.rowSelectedIndex ?? null,
    style: {
      backgroundColor: "#EEC85E",
      color: "black",
      fontWeight: "bold",
    }
  };

  const rowEvents = {
    onClick: (e, row) => {
      props.onSelected(row);
    },
  };


  const rowStyle = (row, cell) => {
    //esta pensado como funcion para que cada componente envie su estilo, pensando en colores segun registros de una columna
    const rowStyle = {
      backgroundColor: "#ffffff99",
      border: "1.5px solid #3595D2",
      color: '#000080', //color: '#727272',
    };
    return rowStyle;

  };

  const handleChangeSearchSelect = (event) => {
    console.log('Seleccionó:',event.target.value)
    setSelectValue(event.target.value);
    setEntryValue('');

  };

  const handleChangeSearchEntry = (event) => {
    setEntryValue(event.target.value);
  };

  const accionLimpiarFiltros = () =>{
    props.accionBuscar('','');
  };
  
  return (

    <div className={classes.tabla}>
      {props.selectoresBuscar &&
       <Box sx={{ maxWidth: 600}} style={{display:'flex', float: 'right', width: '-webkit-fill-available' }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Buscar </InputLabel>
          <Select
            style={{position: 'unset'}}
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
            fullWidth id="outlined-basic" label={selectValue?.text?.includes('Fecha') ? '':`Ingrese ${selectValue.text ?? ''}`} 
            variant="outlined"  onChange={handleChangeSearchEntry}
            type={selectValue?.text?.includes('Fecha') ? 'date':'text'}
            value={entryValue}
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
            className="botonBorder"
              width={70}
              onClick={()=>props.accionBuscar(selectValue.dataField,entryValue)}
              disabled={!entryValue ?? true}
        >Buscar</Button>
        <Button
              className="botonBorder"
              width={70}
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
          //defaultSortDirection={props.defaultSortDirection}
          overlay = {props.overlay}
          selectRow={selectRow}
          rowStyle={props.rowStyle ? props.rowStyle : rowStyle}
      />
    </div>
  );
};

export default TableRemote;
