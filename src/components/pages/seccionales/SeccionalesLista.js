import React from "react";
import overlayFactory from "react-bootstrap-table2-overlay";
import Table from "../../ui/Table/Table";
import SelectMaterial from "../../ui/Select/SelectMaterial";
import classes from './SeccionalesLista.module.css'

const SeccionalesLista = (props) => {
  //#region Tabla
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
      headerTitle: (column, colIndex) => `Codigo`,
      dataField: "codigo",
      text: "Código",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: (column, colIndex) => `Descripción`,
      dataField: "descripcion",
      text: "Descripción",
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
    onSelect: (row, isSelect, rowIndex, e) =>
      props.onSeccionalSeleccionada(row),
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
    data: props.seccionales,
    columns: columns,
    //selectRow: selectRow,
    selection: selectRow,
    rowEvents: rowEvents,
    loading: props.isLoading,
    noDataIndication: (
      <h4>No existen DDJJ relacionadas al Afiliado seleccionado.</h4>
    ),
    overlay: overlayFactory({ spinner: true }),
    pagination: pagination,
  };
  //#endregion

  //#region Buscadores
  const buscarPor = [
    { value: 0, label: "SELECCIONE UNA OPCION" },
    { value: 1, label: "POR PROVINCIA" }
  ]
  //#endregion
  return (
    <div>
      <div className={classes.div}>
        <SelectMaterial value={0} options={buscarPor} />
        {/* <InputMaterial /> */}
      </div>

      <Table {...tableProps} />
    </div>
  );
};

export default SeccionalesLista;
