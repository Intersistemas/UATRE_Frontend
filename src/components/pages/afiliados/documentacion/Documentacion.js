import { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import overlayFactory from "react-bootstrap-table2-overlay";
import FormatearFecha from "../../../helpers/FormatearFecha";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";
import styles from "./Documentacion.module.css";
import Formato from "../../../helpers/Formato";

const Documentacion = (props) => {
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
        dataField: "cuit",
        text: "CUIT",
        formatter: Formato.Cuit,
      },
      {
        dataField: "empresa",
        text: "Razón Social",
        headerStyle: (colum, colIndex) => {
          return { width: "20%", textAlign: "center" };
        }
      },
      {
        dataField: "periodo",
        text: "Periodo",
        sort: true,
        formatter: Formato.Periodo,
      },
      {
        dataField: "presentacionFecha",
        text: "Fecha Presentación",
        formatter: FormatearFecha,
      },
      {
        dataField: "procesoFecha",
        text: "Fecha Proceso",
        formatter: FormatearFecha,
      },
      {
        dataField: "remuneracionImponible",
        text: "Remuneración Imponible",
      },
      {
        dataField: "segurosepelio",
        text: "Seguro Sepelio",
      },
      {
        dataField: "version",
        text: "Versión",
      },
      {
        dataField: "codigodezona",
        text: "Código de Zona",
      },
      {
        dataField: "codigodemodalidadcontratacion",
        text: "Código de Modalidad de Contratación",
      },
      {
        dataField: "codigoactividad",
        text: "Código de Actividad",
      }
      
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
    promptBuscar:"Buscar en DDJJ:",
    keyField: "remuneracionImponible",
    data: ddJJUatreList,
    columns: columns,
    selectRow: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: <h4>No se registran Documentos del Afiliado: </h4>,
    overlay: overlayFactory({ spinner: true }),
    onSelected: props.onSeleccionRegistro
  }



  return (
    <div className={styles.container}>
      {/*<h4>Declaraciones Juradas</h4>*/}
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

export default Documentacion;