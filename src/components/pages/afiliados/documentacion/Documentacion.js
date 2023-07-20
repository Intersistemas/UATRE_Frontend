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
  const [documentacion, setDocumentacion] = useState([]);

  useEffect(() => {
    
      const processDocumentacion = async (documentacionObj) => {
        console.log('documentacionObj: ',documentacionObj)
        setDocumentacion([documentacionObj]);
      };
      request(
        {
          baseURL: "Comunes",
          endpoint: `/DocumentacionEntidad/GetBySpec?EntidadId=${props.idUsuario}&EntidadTipo=A`,
          method: "GET",
        },
        processDocumentacion
      );
    
  }, [request, props.idUsuario]);

  let columns = [
      {
        dataField: "id",
        text: "id",
        hidden: true
      },
      {
        dataField: "createdDate",
        text: "Fecha de Creación",
        formatter: (value)=>{
          return _.split(value, 'T', 1 );
        }
        
      },
      {
        dataField: "refTipoDocumentacion",
        text: "Tipo de Documentación",
      },
      {
        dataField: "nombreArchivo",
        text: "Nombre Archivo",
        formatter: (value)=>{
          return value ?? " "
        }
      },
      {
        dataField: "observaciones",
        text: "Observaciones",
      }
    ];
  
  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      props.onSeleccionRegistro(row);
    },
  };

  let pagination = {};

  const _ = require('lodash');

  let tableProps = {
   // mostrarBuscar: false,
    promptBuscar:"Buscar en Documentación:",
    keyField: "id",
    data: documentacion,
    columns: columns,
    selectRow: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: <h4>No se registran Documentos del Afiliado: </h4>,
    overlay: overlayFactory({ spinner: true }),
    //onSelected: props.onSeleccionRegistro
    pagination: pagination
  }

  return (
    <div className={styles.container}>
      {/*<h4>Declaraciones Juradas</h4>*/}
      <div className={styles.div}>
        <div className={styles.declaracion}>
          <Table {...tableProps}/>
        </div>
      </div>
    </div>
  );
};

export default Documentacion;