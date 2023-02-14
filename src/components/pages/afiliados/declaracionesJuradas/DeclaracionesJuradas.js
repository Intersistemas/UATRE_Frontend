import BootstrapTable from "react-bootstrap-table-next";
import styles from "./DeclaracionesJuradas.module.css";

const DeclaracionesJuradas = (props) => {
  const { ddJJUatreList } = props;
  const columns = [    
    {
      dataField: "periodo",
      text: "Periodo",
      sort: true,
    },
    {
      dataField: "cuit",
      text: "CUIT",
    },
  ];

  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      //console.log(`row: ${row.cuit}`);
      props.onSeleccionRegistro(row);
    },
  };

  /*let tableProps = {
    keyField: "id",
    data: ddJJUatreList,
    columns: columns,
    selectRow: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: <h4>No hay DDJJ</h4>,
    overlay:  overlayFactory({ spinner: true })
  }*/

  return (
    <div className={styles.container}>
      <h4>Declaraciones Juradas</h4>
      <div className={styles.div}>
        <div className={styles.declaracion}>
          <BootstrapTable
            keyField="id"
            data={ddJJUatreList}
            columns={columns}
            selectRow={selectRow}
            rowEvents={rowEvents}
            striped
            hover
            condensed
          />
        </div>
      </div>
    </div>
  );
};

export default DeclaracionesJuradas;
