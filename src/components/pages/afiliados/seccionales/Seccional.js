import { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import overlayFactory from "react-bootstrap-table2-overlay";
import FormatearFecha from "../../../helpers/FormatearFecha";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";
import styles from "./Seccional.module.css";
import Formato from "../../../helpers/Formato";

const Seccional = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [localidad, setLocalidad] = useState([]);
  const  localidadId  = props.localidadId  < 4 ? 4 : props.localidadId;
  console.log('localidadId',props.localidadId)


  useEffect(() => {
    if (localidadId > 0) {
    console.log('localidad_request:',localidad)
      const processLocalidad = async (localidad) => {
        setLocalidad(localidad);
      };

      request(
        {
          baseURL: "Afiliaciones",
          endpoint: `/Seccional/GetSeccionalesSpecs?LocalidadId=${localidadId}`,
          method: "GET",
        },
        processLocalidad
      );
    }
  }, [request, localidadId]);

  let columns = null
  if (localidadId) {
    columns = [
      
      {
        dataField: "id",
        text: "Id",
        hidden: true
      },
      {
        dataField: "codigo",
        text: "Código Seccional",
      },
      {
        dataField: "descripcion",
        text: "Nombre Seccional",
      },
      {
        dataField: "domicilio",
        text: "Domicilio",
        sort: true,
        formatter: ()=>{
          return 'Domicilio pendiente de carga'
        }
      },
      {
        dataField: "localidad",
        text: "Localidad",
        formatter: ()=>{
          return 'Localidad pendiente de carga'
        }

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
    promptBuscar:"Buscar en Seccional:",
    keyField: "id",
    data: localidad,
    columns: columns,
    selectRow: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: <h4>No se registran Seccionales: </h4>,
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

export default Seccional;