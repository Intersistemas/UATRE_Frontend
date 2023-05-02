import { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import overlayFactory from "react-bootstrap-table2-overlay";
import FormatearFecha from "../../../helpers/FormatearFecha";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";
import styles from "./DeclaracionesJuradas.module.css";
import Formato from "../../../helpers/Formato";

const DeclaracionesJuradas = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [ddJJUatreList, setDDJJUatreList] = useState([]);
  const { cuil, infoCompleta, mostrarBuscar, registros } = props.cuil === null ? 0 : props;

  useEffect(() => {
    //console.log("registros ddJJUatreObj",registros)
    if (cuil > 0) {

      const processDDJJUatre = async (ddJJUatreObj) => {
        setDDJJUatreList(ddJJUatreObj.data);
      };
      request(
        {
          baseURL: "DDJJ",
          endpoint: `/DDJJUatre/GetCUILUltimoAnio?CUIL=${cuil}`,
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
        headerTitle: (colum, colIndex) => (`Fecha De Presentación`),
        dataField: "presentacionFecha",
        text: "F.Presentación",
        formatter: FormatearFecha,
      },
      {
        headerTitle: (colum, colIndex) => (`Fecha De Proceso`),
        dataField: "procesoFecha",
        text: "F.Proceso",
        formatter: FormatearFecha,
      },
      // {
      //   dataField: "remuneracionImponible",
      //   text: "Remuneración Imponible",
      //   hidden: true
      // },
      // {
      //   dataField: "segurosepelio",
      //   text: "Seguro Sepelio",
      //   hidden: true,
      //   formatter: (cell,row) => {
      //     return (
      //       <span>$ {Math.floor(row.periodo/50)}</span>
      //     );
      //   } 
      // },
      {
        dataField: "rectificativa",
        text: "Versión",
        /*formatter: (cell,row) => {
          return (
            <span>{((row.obligacionNro).toString().substring(7))}</span>
          );
        } */
      },
      {
        dataField: "version",
        text: "Versión",
        hidden: true
        /*formatter: (cell,row) => {
          return (
            <span>{((row.obligacionNro).toString().substring(7))}</span>
          );
        } */
      },
      {
        headerTitle: (colum, colIndex) => (`Código de Zona`),
        dataField: "zona",
        text: "Cod.Zona",
        /*formatter: (cell,row) => {
          return (
            <span>{((row.obligacionNro).toString().substring(2,6))}</span>
          );
        }*/
      },
      {
        headerTitle: (colum, colIndex) => (`Código de Modalidad de Contratación`),
        dataField: "modalidad",
        text: "Cod.Mod.Contrat.",
        /*formatter: (cell,row) => {
          return (
            <span>{((row.obligacionNro).toString().substring(6,7))}</span>
          );
        } */
      },
      {
        headerTitle: (colum, colIndex) => (`Código de Actividad`),
        dataField: "actividad",
        text: "Cod.Actividad",
        /*formatter: (cell,row) => {
          return (
            <span>{((row.obligacionNro).toString().substring(1,4))}</span>
          );
        } */
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
      // {
      //   dataField: "remuneracionImponible",
      //   text: "Remuneracion Imponible",
      // },
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
    mostrarBuscar: mostrarBuscar ?? true,
    promptBuscar:"Buscar en DDJJ:",
    keyField: "id",
    data: ddJJUatreList,
    columns: columns,
    selectRow: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: <h4>No se registran Declaraciones Juradas del Afiliado </h4>,
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

export default DeclaracionesJuradas;