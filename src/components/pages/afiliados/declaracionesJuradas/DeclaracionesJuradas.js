import { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import overlayFactory from "react-bootstrap-table2-overlay";
import FormatearFecha from "../../../helpers/FormatearFecha";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";
import styles from "./DeclaracionesJuradas.module.css";

const DeclaracionesJuradas = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [ddJJUatreList, setDDJJUatreList] = useState([]);
  const { cuil, infoCompleta } = props.cuil === null ? 0 : props;

  useEffect(() => {
    if (cuil > 0) {
      const processDDJJUatre = async (ddJJUatreObj) => {
        setDDJJUatreList(ddJJUatreObj);
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/DDJJUatre/GetDDJJUatreByCUIL?CUIL=${cuil}`,
          method: "GET",
        },
        processDDJJUatre
      );
    }
  }, [request, cuil]);

  let columns = null
  if (infoCompleta) {
    columns = [
      {
        dataField: "periodo",
        text: "Periodo",
        sort: true,
      },
      {
        dataField: "cuit",
        text: "CUIT",
      },
      {
        dataField: "empresa",
        text: "Empresa",
      },
      {
        dataField: "banco",
        text: "Banco",
      },
      {
        dataField: "remuneracionImponible",
        text: "Remuneracion Imponible",
      },
      {
        dataField: "rectificativa",
        text: "Rectificativa",
      },
      {
        dataField: "presentacionFecha",
        text: "Fecha Presentacion",
        formatter: FormatearFecha,
      },
      {
        dataField: "procesoFecha",
        text: "Fecha Proceso",
        formatter: FormatearFecha,
      },
    ];
  } else {
    columns = [
      {
        dataField: "periodo",
        text: "Periodo",
        sort: true,
      },
      {
        dataField: "cuit",
        text: "CUIT",
      },
      {
        dataField: "empresa",
        text: "Empresa",
      },
      {
        dataField: "remuneracionImponible",
        text: "Remuneracion Imponible",
      },
    ];
  }

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
    keyField: "id",
    data: ddJJUatreList,
    columns: columns,
    selectRow: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: <h4>No hay Declaraciones Juradas del Afiliado</h4>,
    overlay: overlayFactory({ spinner: true })
  }



  return (
    <div className={styles.container}>
      <h4>Declaraciones Juradas</h4>
      <div className={styles.div}>
        <div className={styles.declaracion}>
          <Table {...tableProps}/>
          
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

export default DeclaracionesJuradas;