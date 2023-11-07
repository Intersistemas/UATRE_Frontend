import React, { useEffect } from "react";
import overlayFactory from "react-bootstrap-table2-overlay";
import Table from "../../../ui/Table/Table";
import SwitchCustom from "../../../ui/Switch/SwitchCustom";
import classes from "./SeccionalAutoridades.module.css";
import FormatearFecha from "../../../helpers/FormatearFecha";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "../../../../redux/actions";
import { FormControlLabel, Switch } from "@mui/material";

const SeccionalAutoridades = (props) => { 
const dispatch = useDispatch();
const [checked, setChecked] = React.useState(true);

const handleChangeSwitch = (event) => {
  
  console.log('props.seccionalSeleccionada**',props.seccionalSeleccionada);
  console.log('event.target.checked',event.target.checked);

  setChecked(event.target.checked);
  props.handleSeccionalSeleccionada(props.seccionalSeleccionada, event.target.checked);  //actualizo la seccional selecciona para traer autoridades vigentes o no vigentes

};

useEffect(()=>{
   //#region despachar Informar Modulo
  const moduloInfoDefault = {
    nombre: "SeccionalAutoridades",
    acciones: [
      {
        id: 1,
        abm: "Alta",
        name: "Agrega Autoridad",
        icon: "",
        disabled: false,
      },
      {
        id: 2,
        abm: "Modifica",
        name: "Modifica Autoridad",
        icon: "",
        disabled: true,
      },
      {
        id: 3,
        abm: "baja",
        name: "Baja Autoridad",
        icon: "",
        disabled: true,
      }
    ],
  };
  dispatch(handleModuloSeleccionar(moduloInfoDefault));
  
//#endregion
},[])



  console.log("props.seccionalAutoridades", props.seccionalAutoridades);
  const columns = [
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
      headerTitle: (column, colIndex) => `Cargo`,
      dataField: "refCargosDescripcion",
      text: "Cargo",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `Nombre`,
      dataField: "afiliadoNombre",
      text: "Nombre",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `NroAfiliado`,
      dataField: "afiliadoNumero",
      text: "NroAfiliado",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `VigenteDesde`,
      dataField: "fechaVigenciaDesde",
      text: "Vigencia Desde",
      sort: true,
      formatter: FormatearFecha,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `VigenteHasta`,
      dataField: "fechaVigenciaHasta",
      text: "Vigencia Hasta",
      sort: true,
      formatter: FormatearFecha,
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
    onSelect: (row, isSelect, rowIndex, e) => {
      console.log("row",row)
      props.onSeleccionAutoridad(row)     
      
        //modificar la descripcion de los botones de accion
        //#region despachar Informar Modulo
        const moduloInfoDefault = {
          nombre: "SeccionalAutoridades",
          acciones: [
            {
              id: 1,
              abm: "Alta",
              name: "Agrega Autoridad",
              icon: "",
              disabled: false,
            },
            {
              id: 2,
              abm: "Modifica",
              name: `Modifica Autoridad ${row.afiliadoNombre}`,
              icon: "",
              disabled: row.estado == "Baja" ? true : false,
            },
            {
              id: 3,
              abm: "Baja",
              name: `Baja Autoridad ${row.afiliadoNombre}`,
              icon: "",
              disabled: row.estado == "Baja" ? true : false,
            }
          ],
        };

        dispatch(handleModuloSeleccionar(moduloInfoDefault));
    }
  };

  // const rowEvents = {
  //   onClick: (e, row, rowIndex) => {
  //     console.log('row', row);
  //     props.onSeleccionAutoridad(row);
  //   },
  // };

  const pagination = {
    size: 20,
  };

  const tableProps = {
    keyField: "id",
    data: props.seccionalAutoridades,
    columns: columns,
    selectRow: selectRow,
    //selection: selectRow,
    //rowEvents: rowEvents,
    loading: props.isLoading,
    noDataIndication: <h4>No existen autoridades para la seccional.</h4>,
    overlay: overlayFactory({ spinner: true }),
    pagination: pagination,
  };

  return (
    <div className={classes.div}>
      <FormControlLabel
        control={
          <Switch checked={checked} onChange={handleChangeSwitch} label={props.label} />
        }
        label="Solo vigentes"
      />

      <Table {...tableProps} />
    </div>
  );
};

export default SeccionalAutoridades;
