import React, { useEffect } from "react";
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

  useEffect(() => {
    
  
  },[])


  const [selectValue, setSelectValue] = React.useState(props.entrySelected ?? '');
  const [entryValue, setEntryValue] = React.useState(props.entryValue ?? '');
  
  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
    selected: [props.afiliadoSeleccionado?.id],
    style: {
      backgroundColor: "#EEC85E",
      color: "black",
      fontWeight: "bold",
    },
    onSelect: (row, isSelect, rowIndex, e) => props.onSelected(row, isSelect, rowIndex, e),
	  //onSelectAll: (isSelect, rows, e) => {},
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
    props.accionBuscar('','',null);
  };
  
  const getSelectorIndex=(id,all)=>{
    for(let i=0; i<all.length; i++){
      if (all[i].id === id){
        return i;
      }
    }
    return "";
  }

  return (

    <div className={classes.tabla}>
      {props.selectoresBuscar &&
       <Box sx={{ maxWidth: 700}} style={{display:'flex', float: 'right', width: '-webkit-fill-available', 'column-gap': '1rem'}}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Busca</InputLabel>
          <Select
            style={{position: 'unset'}}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={props.selectoresBuscar[getSelectorIndex(selectValue.id, props.selectoresBuscar)]}
            label="Buscar por:"
            onChange={handleChangeSearchSelect}
          >
            {props.selectoresBuscar.map((valores)=>{
                  return <MenuItem key={valores.id} value={valores}>{valores.text}</MenuItem>
                  })
            }
          </Select>
        </FormControl>
        <TextField 
            style={{width: '53rem'}}
            id="outlined-basic" label={selectValue?.text?.includes('Fecha') ? '':`Ingrese ${selectValue.text ?? ''}`} 
            variant="outlined" onChange={handleChangeSearchEntry}
            type={selectValue.dataType}
            value={entryValue}
            onKeyPress={(ev) => {
              if (ev.key === 'Enter' && entryValue) {
                props.accionBuscar(selectValue.dataField,entryValue,selectValue)
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
              botonBorder
              className="botonAmarillo"
              width={70}
              onClick={()=>props.accionBuscar(selectValue.dataField, entryValue, selectValue)}
              disabled={!entryValue ?? true}
        >Busca</Button>
        <Button
              botonBorder
              className="botonAmarillo"
              //width={70}
              style={{'min-width': 'fit-content'}}
              onClick={()=>accionLimpiarFiltros()}
        >Limpia Busqueda</Button>
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
          //rowEvents = {rowEvents} //No es necesario a menos que se declare algo especial en rowEvents
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
