import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import paginationFactory from "react-bootstrap-table2-paginator";
//import overlayFactory from "react-bootstrap-table2-overlay";
import styles from "./AfiliadosLista.module.css";
import Button from "../../ui/Button/Button";
import filterFactory, {
  textFilter,
  selectFilter,
  Comparator,
} from "react-bootstrap-table2-filter";
import FormatearFecha from "../../helpers/FormatearFecha";
import { useDispatch } from "react-redux";
import { handleAfiliadoSeleccionar } from "../../../redux/actions";
import { useState } from "react";
import { Tab, Tabs } from "@mui/material";
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";
import Table from "../../ui/Table/Table";
import Formato from "../../helpers/Formato";

const AfiliadosLista = (props) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);

  const afiliados = {
    data: props.afiliados.data,
    totalRegs: props.afiliados.count,
    page: props.afiliados.index,
    sizePerPage: props.afiliados.size,
  };


  const columns = [
    {
      dataField: "cuil",
      text: "CUIL",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "9%", textAlign: "center" };
      },
    },
    {
      dataField: "nroAfiliado",
      text: "Afiliado",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "6%", textAlign: "center" };
      },
    },
    {
      dataField: "fechaIngreso",
      text: "Fecha Ingreso",
      sort: true,
      formatter: FormatearFecha,
      headerStyle: (colum, colIndex) => {
        return { width: "9%", textAlign: "center" };
      },
    },
    {
      dataField: "nombre",
      text: "Nombre",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "auto", textAlign: "center" };
      },
    },
    {
      dataField: "actividad",
      text: "Actividad",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
    },
    {
      dataField: "seccional",
      text: "Seccional",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
    },
    {
      dataField: "puesto",
      text: "Puesto",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
    },
   { //ME GENERA ERROR CON EL SEARCH TAB
      dataField: "estadoSolicitud",
      text: "Estado",
      sort: true,
      //title: "Estado Solicitud",
      headerStyle: (colum, colIndex) => {
        return { width: "7%", textAlign: "center" };
      },
      formatter: (cell) => {
        switch (cell){
          case "Pendiente": 
            return (<div
              style={{backgroundColor: '#ffff64cc' }}
            >{cell}</div>)
            break;
          case "Baja": 
            return (<div
              style={{backgroundColor: '#ff6464cc', color: '#FFF'}}
              >{cell}</div>)
            break;
          case "Observado":
            return (<div
              style={{backgroundColor: '#6464ffcc',  color: '#FFF'}}
              >{cell}</div>)
            break;
          case "Rechazado":
            return (<div
              style={{backgroundColor: '#f08c32cc', color: '#FFF' }}
              >{cell}</div>)
            break;
          case "Activo":
              return (<div
                >{cell}</div>)
              break;  
          default:  
            break;
        }        
      },
      /*filter: selectFilter({
        comparator: Comparator.EQ,
        options: props.estadosSolicitud,
        defaultValue: props.estadoSolicitudActual,
        className: styles.filter,//"my-custom-text-filter",
        placeholder: "Seleccion Estado...",
        withoutEmptyOption: true,
      }),*/
    },
    {
      dataField: "empresa",
      text: "Empresa",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "15%", textAlign: "center" };
      },
    },
    {
      dataField: "documento",
      text: "Documento",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
    },
  ];
  //#endregion

  //#region eventos de la lista


  /*const rowEvents = {
    onClick: (e, row, rowIndex) => {
      console.log(`row: ${row}`);
      //handleSelectList(row);
      setAfiliadoSeleccionado(row);
      dispatch(handleAfiliadoSeleccionar(row));
    },
  };*/

  const rowEvents  = (row) => {
      console.log(`row: ${row}`);
      setAfiliadoSeleccionado(row);
      dispatch(handleAfiliadoSeleccionar(row));
      
  };


  const handleTableChange = (
    type,
    { page, sizePerPage, filters, sortField, sortOrder, cellEdit }
  ) => {
    //console.log(filters);
    setAfiliadoSeleccionado(null);
    const currentIndex = (page - 1) * sizePerPage;
    props.onFilterChange(filters);
  };

  const pagination = paginationFactory({
    page: afiliados.page,
    sizePerPage: afiliados.sizePerPage,
    paginationShowsTotal: false,
    totalSize: afiliados.totalRegs,
    lastPageText: ">>",
    firstPageText: "<<",
    nextPageText: ">",
    prePageText: "<",
    //showTotal: true,
    //alwaysShowAllBtns: true,
    hideSizePerPage: true,
    onPageChange: function (page, sizePerPage) {
      //console.log('page1', page);
      //console.log('sizePerPage1', sizePerPage);
      props.onPageChange(page, sizePerPage);
    },
    onSizePerPageChange: function (page, sizePerPage) {
      //console.log('page', page);
      //console.log('sizePerPage', sizePerPage);
      props.onSizePerPageChange(sizePerPage, page);
    },
  });

  const indication = () => {
    <h4>No hay informacion a mostrar</h4>;
  };
  //#endregion

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSeleccionDDJJ = (ddjj) => {};

  const tableProps = {
      remote: true,
      keyField: "id",
      loading: props.loading,
      data: afiliados.data,
      columns: columns,
      pagination: pagination,
      onTableChange: handleTableChange,
      filter: filterFactory(),
      noDataIndication: indication,
      onSelected: rowEvents,
  }

  const enDesarrollo = () => {
    alert("asd");
  } 

  return (
    <div className={styles.div}>
      <div className="detalles_card">
      {/*<Button className="botonBorder" width={20} onClick={props.onClickAfiliadoAgregar}>
        Agregar Afiliado
      </Button>
      <Button
      className="botonBorder"
        width={20}
        onClick={props.onResolverEstadoSolicitud}
        disabled={
          afiliadoSeleccionado?.estadoSolicitud === "Pendiente" ? false : true
        }
      >
        Resolver Solicitud
      </Button>*/}
      </div>
      <Tabs
        value={selectedTab}
        onChange={handleChangeTab}
        aria-label="basic tabs example"
      >
        <Tab  className={styles.tab} label="Afiliados" />
       
        <Tab className={styles.tab}
          /*label={`DDJJ UATRE ${
            afiliadoSeleccionado?.estadoSolicitud === "Activo"
              ? afiliadoSeleccionado?.nombre
              : ""
          }`}*/
          
          label= { afiliadoSeleccionado?.nombre ? `DDJJ UATRE ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "DDJJ UATRE"}
          style={{ width: "800px" }}
          //disabled={afiliadoSeleccionado?.cuil && afiliadoSeleccionado.estadoSolicitud === "Activo" ? false : true}
          disabled={afiliadoSeleccionado?.cuil ? false : true}
        />
      </Tabs>

      {selectedTab === 0 && (
      <Table {...tableProps} />
      
      //   <BootstrapTable
      //     bootstrap4
      //     remote
      //     keyField="id"
      //     loading={props.loading}
      //     data={afiliados.data}
      //     columns={columns}
      //     pagination={pagination}
      //     onTableChange={handleTableChange}
      //     filter={filterFactory()}
      //     striped
      //     hover
      //     condensed
      //     noDataIndication={indication}
      //     selectRow={selectRow}
      //     rowEvents={rowEvents}
      // />

      )}

      {selectedTab === 1 && (
        <DeclaracionesJuradas
          cuil={afiliadoSeleccionado.cuil}
          infoCompleta={true}
          onSeleccionRegistro={handleSeleccionDDJJ}
        />        
      )}
    </div>
  );
};

export default AfiliadosLista;
