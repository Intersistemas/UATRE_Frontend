import { useEffect, useState } from "react";
//import BootstrapTable from "react-bootstrap-table-next";
import overlayFactory from "react-bootstrap-table2-overlay";
import FormatearFecha from "../../../helpers/FormatearFecha";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";
import styles from "./DeclaracionesJuradas.module.css";
import Formato from "../../../helpers/Formato";

const AfiliadosUltimaDDJJ = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [ddJJUatreCUITList, setDDJJUatreCUITList] = useState([]);
  const { cuit } = props.cuit === null ? 0 : props;

  useEffect(() => {
    console.log("props", props.cuit)
    console.log("cuit", cuit);
    if (cuit) {
      const processDDJJUatreCUIT = async (ddJJUatreObj) => {
        setDDJJUatreCUITList(ddJJUatreObj.data);
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/DDJJUatre/GetDDJJUatreListBySpecs?CUIT=${cuit}&Sort=periodo&TakeRecords=1&PageSize=3`,
          method: "GET",
        },
        processDDJJUatreCUIT
      );
    }
  }, [request, cuit]);

  let columns = null;
  
    columns = [
      {
        dataField: "cuil",
        text: "CUIL",
        sort: true,
      },
      {
        dataField: "nombreAfiliado",
        text: "Nombre",
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

  let tableProps = {
    mostrarBuscar: false,
    promptBuscar: "Buscar en DDJJ:",
    keyField: "id",
    data: ddJJUatreCUITList,
    columns: columns,
    selectRow: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: (
      <h4>No se registran Declaraciones Juradas de la Empresa: </h4>
    ),
    overlay: overlayFactory({ spinner: true }),
    onSelected: props.onSeleccionRegistro,
  };

  return (
    <div className={styles.container}>
      {/*<h4>Declaraciones Juradas</h4>*/}
      <div className={styles.div}>
        <div className={styles.declaracion}>
          <Table {...tableProps} />

          {/*<BootstrapTable
            keyField="id"
            data={ddJJUatreList}
            columns={columns}
            selectRow={selectRow}
            rowEvents={rowEvents}
            loading={isLoading}
            striped
            hover
            condensed
            noDataIndication={<h4>No hay DDJJ</h4>}
            overlay={ overlayFactory({ spinner: true })}
          />*/}
        </div>
      </div>
    </div>
  );
};

export default AfiliadosUltimaDDJJ;
