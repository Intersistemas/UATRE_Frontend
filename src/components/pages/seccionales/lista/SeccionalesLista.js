import React, {useEffect} from "react";
import overlayFactory from "react-bootstrap-table2-overlay";
import Table from "../../../ui/Table/Table";
import classes from "./SeccionalesLista.module.css";
import Formato from "components/helpers/Formato";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Button from "../../../ui/Button/Button";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "../../../../redux/actions";
 
const SeccionalesLista = (props) => {

const dispatch = useDispatch();

useEffect(()=>{
  //#region despachar Informar Modulo
  const moduloInfoDefault = {
    nombre: "Seccionales",
    acciones: [
      {
        id: 1,
        abm: "Alta",
        name: "Agrega Seccional",
        icon: "",
        disabled: false,
      },
      {
        id: 2,
        abm: "Modifica",
        name: "Modifica Seccional",
        icon: "",
        disabled: true,
      },
      {
        id: 3,
        abm: "Baja",
        name: "Baja Seccional",
        icon: "",
        disabled: true,
      }
    ],
  };
  dispatch(handleModuloSeleccionar(moduloInfoDefault));
  //#endregion
},[])

  //#region Tabla
  const columns = [
    
    {
      headerTitle: (column, colIndex) => `Codigo Seccional`,
      dataField: "codigo",
      text: "Código",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `Nombre Seccional`,
      dataField: "descripcion",
      text: "Nombre",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `Estado`,
      dataField: "estado",
      text: "Estado",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
      formatter: (value, row) => ( 
        row.deletedDate ? `${value} (${Formato.Fecha(row.deletedDate)})` : value
      ),
    },
    {
      headerTitle: (column, colIndex) => `Dirección`,
      dataField: "domicilio",
      text: "Dirección",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `Localidad Seccional`,
      dataField: "localidadNombre",
      text: "Localidad",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `Observaciones`,
      dataField: "observaciones",
      text: "Observaciones",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },

    {
      headerTitle: (column, colIndex) => `Id`,
      dataField: "id",
      text: "Id",
      sort: true,
      hidden: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `Id`,
      dataField: "deletedDate",
      text: "deletedDate",
      sort: true,
      hidden: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },

    
  ];
 
  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
    style: {
      backgroundColor: "#EEC85E",
      color: "black",
      fontWeight: "bold",
    },
    onSelect: (row, isSelect, rowIndex, e) =>{
      console.log('seccional_selected',row);
      props.onSeccionalSeleccionada(row)
      //modificar la descripcion de los botones de accion
      //#region despachar Informar Modulo
      const moduloInfoDefault = {
        nombre: "Seccionales",
        acciones: [
          {
            id: 1,
            abm: "Alta",
            name: "Agrega Seccional",
            icon: "",
            disabled: false,
          },
          {
            id: 2,
            abm: "Modifica",
            name: `Modifica Seccional ${row.codigo} - ${row.descripcion}`,
            icon: "",
            disabled: row.estado == "Baja" ? true : false,
          },
          {
            id: 3,
            abm: "Baja",
            name: `Baja Seccional ${row.codigo} - ${row.descripcion}`,
            icon: "",
            disabled: row.estado == "Baja" ? true : false,
          }
        ],
      };
      dispatch(handleModuloSeleccionar(moduloInfoDefault));
    }
      //#endregion
  };

  const rowEvents = {
    // onClick: (e, row, rowIndex) => {
    //   //console.log(`row: ${row.cuit}`);
    //   props.onSeleccionRegistro(row);
    //   setIdPrimerRegistroDelGrid(row?.id);
    // },
  };

  const pagination = {
    size: 15,
  };

  console.log("props.seccionales", props.seccionales);
  const tableProps = {
    keyField: "id",
    data: props.seccionales,
    columns: columns,
    //selectRow: selectRow,
    selection: selectRow,
    rowEvents: rowEvents,
    loading: props.isLoading,
    noDataIndication: <h4>No existen Seccionales.</h4>,
    overlay: overlayFactory({ spinner: true }),
    pagination: pagination,
    mostrarBuscar: false
  };
  //#endregion

  const handleChangeSelect = (event) => {
    console.log("Seleccionó:", event.target.value);
    props.onSelectorSelected(event.target.value);
  };

  const handleChangeSearchEntry = (event) => {
    props.onSelectorValor(event.target.value);
  };

  return (
    <div>
      <Box
        sx={{ maxWidth: 700 }}
        style={{
          display: "flex",
          float: "right",
          width: "-webkit-fill-available",
          "column-gap": "1rem",
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Busca </InputLabel>
          <InputLabel id="demo-simple-select-label">Busca </InputLabel>
          <Select
            style={{ position: "unset" }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={props.selector.value}
            label="Buscar por:"
            onChange={handleChangeSelect}
          >
            {props.selectores.map((valores) => {
              return (
                <MenuItem key={valores.id} value={valores}>
                  {valores.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <TextField
          style={{ width: "53rem" }}
          id="outlined-basic"
          label={
            props.selectorValor?.text?.includes("Fecha")
              ? ""
              : `Ingrese ${props.selectorValor?.text ?? ""}`
          }
          variant="outlined"
          onChange={handleChangeSearchEntry}
          // type={props.selectorValor.dataType}
          value={props.selectorValor}
          /*helperText={
              props.error
                ? "Error buscando datos"
                : ""
            }*/
          error={props.error}
        />
        <Button
          className="botonAmarillo"
          botonBorder
          width={70}
          onClick={props.onBuscarClick}
          disabled={!props.selectorValor ?? true}
        >
          Busca
        </Button>
        <Button
          className="botonAmarillo"
          botonBorder
          //width={70}
          style={{ "min-width": "fit-content" }}
          onClick={props.onLimpiarClick}
        >
          Limpia Busqueda
        </Button>
      </Box>

      <Table {...tableProps} />
    </div>
  );
};

export default SeccionalesLista;
