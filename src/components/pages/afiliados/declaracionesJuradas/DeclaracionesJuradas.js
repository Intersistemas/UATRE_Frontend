import { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import overlayFactory from "react-bootstrap-table2-overlay";
import FormatearFecha from "../../../helpers/FormatearFecha";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";
import styles from "./DeclaracionesJuradas.module.css";
import Formato from "../../../helpers/Formato";
import paginationFactory from "react-bootstrap-table2-paginator";

const DeclaracionesJuradas = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [ddJJUatreList, setDDJJUatreList] = useState([]);
  const { cuil, infoCompleta, mostrarBuscar, registros } = props.cuil === null ? 0 : props;

  useEffect(() => {
    //console.log("registros ddJJUatreObj",registros)
    if (cuil > 0) {

      const processDDJJUatre = async (ddJJUatreObj) => {
        setDDJJUatreList(ddJJUatreObj.data);
        props.onDeclaracionesGeneradas(ddJJUatreObj.data);
      };
      request(
        {
          baseURL: "DDJJ",
          endpoint: `/DDJJUatre/GetCUILUltimoAnio?CUIL=${cuil}&PageSize=1`,
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
        dataField: "id",
        text: "id",
        //hidden: true
      },

      {
        dataField: "cuit",
        text: "CUIT",
        formatter: Formato.Cuit,
        headerStyle: (colum, colIndex) => {
          return { width: "15%", textAlign: "center" };
        },
      },
      {
        dataField: "empresa",
        text: "Razón Social",
        headerStyle: (colum, colIndex) => {
          return { width: "20%", textAlign: "center" };
        },
      },
      {
        dataField: "periodo",
        text: "Periodo",
        sort: true,
        formatter: Formato.Periodo,
      },
      {
        headerTitle: (colum, colIndex) => `Fecha De Presentación`,
        dataField: "presentacionFecha",
        text: "F.Presentación",
        formatter: FormatearFecha,
      },
      {
        headerTitle: (colum, colIndex) => `Fecha De Proceso`,
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
      },

      {
        dataField: "obligacionSecuencia",
        text: "Sec.Obligación",
      },
      {
        headerTitle: (colum, colIndex) => `Código de Modalidad de Contratación`,
        dataField: "modalidad",
        text: "Cod.Mod.Contrat.",
      },
      {
        headerTitle: (colum, colIndex) => `Código de Actividad`,
        dataField: "actividad",
        text: "Cod.Actividad",
      },
      {
        headerTitle: (colum, colIndex) => `Código de Zona`,
        dataField: "zona",
        text: "Cod.Zona",
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
    //selected: 727172952,
    style: {
      backgroundColor: "rgb(194 194 194 / 70%)",
      color: "black",
      fontWeight: "bold",
    }
  };
  

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      //console.log(`row: ${row.cuit}`);
      props.onSeleccionRegistro(row);
    },
  };

  let pagination = {};
  if(registros){
      pagination = {
        size: registros,
      };
  }  
  console.log("registros", registros);
  let tableProps = {
    mostrarBuscar: mostrarBuscar ?? true,
    promptBuscar: "Buscar en DDJJ:",
    keyField: "id",
    data: ddJJUatreList,
    columns: columns,
    selectRow: selectRow,
    selection: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: (
      <h4>No existen DDJJ relacionadas al Afiliado seleccionado.</h4>
    ),
    overlay: overlayFactory({ spinner: true }),
    onSelected: props.onSeleccionRegistro,
    pagination: pagination,
  };

  return (
    <div className={styles.container}>
      <div className={styles.div}>
        <div className={styles.declaracion}>
          <Table {...tableProps}/>          
        </div>
      </div>
    </div>
  );
};

export default DeclaracionesJuradas;