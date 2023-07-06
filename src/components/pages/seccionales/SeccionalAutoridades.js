import React from "react";
import overlayFactory from "react-bootstrap-table2-overlay";
import Table from "../../ui/Table/Table";
import { FormControlLabel, Switch } from "@mui/material";
import SwitchCustom from "../../ui/Switch/SwitchCustom";
import classes from "./SeccionalAutoridades.module.css";

const SeccionalAutoridades = (props) => {
  const columns = [
    {
      headerTitle: (column, colIndex) => `Id`,
      dataField: "id",
      text: "Id",
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
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `VigenteHasta`,
      dataField: "fechaVigenciaHasta",
      text: "Vigencia Hasta",
      sort: true,
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
    // onSelect: (row, isSelect, rowIndex, e) =>
    //   props.onSeccionalSeleccionada(row),
  };

  const rowEvents = {
    // onClick: (e, row, rowIndex) => {
    //   //console.log(`row: ${row.cuit}`);
    //   props.onSeleccionRegistro(row);
    //   setIdPrimerRegistroDelGrid(row?.id);
    // },
  };

  const pagination = {
    size: 20,
  };

  const tableProps = {
    keyField: "id",
    data: props.seccionalAutoridades,
    columns: columns,
    //selectRow: selectRow,
    selection: selectRow,
    rowEvents: rowEvents,
    loading: props.isLoading,
    noDataIndication: <h4>No existen autoridades para la seccional.</h4>,
    overlay: overlayFactory({ spinner: true }),
    pagination: pagination,
  };

  return (
    <div className={classes.div}>
      <SwitchCustom
        onHandleChange={props.onSoloAutoridadesVigentes}
        label="Solo vigentes"
      />
      <Table {...tableProps} />
    </div>
  );
};

export default SeccionalAutoridades;
