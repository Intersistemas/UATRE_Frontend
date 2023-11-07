import { useEffect, useState } from "react";
import overlayFactory from "react-bootstrap-table2-overlay";
import FormatearFecha from "../../../helpers/FormatearFecha";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";
import styles from "./DeclaracionesJuradas.module.css";
import Formato from "../../../helpers/Formato";

const DeclaracionesJuradas = (props) => {
  const { isLoading, error, sendRequest: request } = useHttp();
  const [ddJJUatreList, setDDJJUatreList] = useState([]);
  const [idPrimerRegistroDelGrid, setIdPrimerRegistroDelGrid] = useState(0);
  const { cuil, cuit, infoCompleta, mostrarBuscar, registros } = props.cuil && props;

  console.log('DeclaracionesJuradas_props',props);

  useEffect(() => {
    if (cuil > 0) {
      console.log('DeclaracionesJuradas_cuil',cuil);
      const processDDJJUatre = async (ddJJUatreObj) => {
        setIdPrimerRegistroDelGrid(ddJJUatreObj[0]?.id ?? 0);
        props.onSeleccionRegistro(ddJJUatreObj[0]);
        setDDJJUatreList(ddJJUatreObj);
        props.onDeclaracionesGeneradas&&props.onDeclaracionesGeneradas(ddJJUatreObj);
      };
      request(
        {
          baseURL: "DDJJ",
          endpoint: `/DDJJUatre/GetCUILUltimoAnio?CUIL=${+cuil}`,
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
        hidden: true
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
        style: (colum, colIndex) => {
          return { textAlign: "left" };
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
        dataField: "modalidadDescripcion",
        text: "Mod.Contrat.",
      },
      {
        headerTitle: (colum, colIndex) => `Código de Actividad`,
        dataField: "actividadDescripcion",
        text: "Actividad",
      },
      {
        headerTitle: (colum, colIndex) => `Código de Zona`,
        dataField: "zonaDescripcion",
        text: "Zona",
      },
      {
        dataField: "remuneracionImponible",
        text: "Remuneración",
        formatter: (value, row) => (
         
          row.esEmpresaRural == "No" ? Formato.Moneda(value) :
          " "
        ),
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
         text: "Remuneración",
       },
    ];
  }

  const selectRow = {
    
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
    style: {
      backgroundColor: "#EEC85E",
      color: "black",
      fontWeight: "bold",
    },
    onSelect: (row, isSelect, rowIndex, e) => props.onSeleccionRegistro(row, isSelect, rowIndex, e),
    selected: [idPrimerRegistroDelGrid],
  };
  

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      //console.log(`row: ${row.cuit}`);
      props.onSeleccionRegistro(row);
      setIdPrimerRegistroDelGrid(row?.id);
    },
  };

  let pagination = {};
  if(registros){
      pagination = {
        size: registros,
      };
  }  

  let tableProps = {
    mostrarBuscar: mostrarBuscar ?? true,
    promptBuscar: "Buscar en DDJJ:",
    keyField: "id",
    data: ddJJUatreList,
    columns: columns,
    //selectRow: selectRow,
    selection: selectRow,
    rowEvents: rowEvents,
    loading: isLoading,
    noDataIndication: (
      <h4>No existen DDJJ relacionadas al Afiliado seleccionado.</h4>
    ),
    overlay: overlayFactory({ spinner: true }),
    //onSelected: props.onSeleccionRegistro,
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