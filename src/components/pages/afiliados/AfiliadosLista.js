import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";

//import overlayFactory from "react-bootstrap-table2-overlay";
import * as React from 'react';
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import paginationFactory, {
  PaginationProvider,
  SizePerPageDropdownStandalone,
  PaginationListStandalone
} from "react-bootstrap-table2-paginator";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import styles from "./AfiliadosLista.module.css";
import Button from "../../ui/Button/Button";
import AfiliadoDetails from './AfiliadoDetails';
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
import TableSegmentado from "../../ui/Table/TableRemote";
import Formato from "../../helpers/Formato";
import { Height } from "@mui/icons-material";
import Seccional from "./seccional/Seccional";
import useHttp from "../../hooks/useHttp";
import { styled } from '@mui/material/styles';

const { SearchBar } = Search;

const AfiliadosLista = (props) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [ddjjUatreSeleccionado, setddjjUatreSeleccionado] = useState(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null)
  const { isLoading, error, sendRequest: request } = useHttp();

  const [selectFilter, setSelectFilter] = React.useState('');

  const AndTabs = styled(Tabs)({
    '.MuiTabs-flexContainer': {

      alignItems: 'flex-end',
    },
  });

  const handleSelectFilter = (select,entry) => {
    console.log('evento: ',select,entry)
    //BUSQUEDA Y FILTRO
    props.onSearch(select,entry);
    //setSelectFilter(event.target.value);

  };


  const afiliados = {
    data: props.afiliados.data,
    totalRegs: props.afiliados.count,
    page: props.afiliados.index,
    sizePerPage: props.afiliados.size,
  };


  const defaultSorted = [
    {
      dataField: "nroAfiliado",
      order: "asc"
    }
  ];

  const columns = [
    {
      dataField: "nroAfiliado",
      text: "Nro.Afiliado",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7%", textAlign: "center" };
      },
      /*headerEvents: {
        onClick: (e, column, columnIndex) => console.log('e, column, columnIndex',e, column, columnIndex)
      }*/
    },
    {
      dataField: "cuil",
      text: "CUIL",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
      formatter: Formato.Cuit,
    },
    {
      dataField: "documento",
      text: "Documento",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
      formatter: Formato.DNI,
    },
    {
      dataField: "nombre",
      text: "Nombre",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "20%", textAlign: "center" };
      },
    },
    {
      dataField: "sexo",
      text: "Sexo",
      headerStyle: (colum, colIndex) => {
        return { width: "7%", textAlign: "center" };
      },
    },
    
    {
      dataField: "estadoCivil",
      text: "Estado Civil",
      headerStyle: (colum, colIndex) => {
        return { width: "7%", textAlign: "center" };
      },
    },

    {
      dataField: "nacionalidad",
      text: "Nacionalidad",
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
    },
    { //ME GENERA ERROR CON EL SEARCH TAB
      dataField: "estadoSolicitud",
      text: "Situación",
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
      dataField: "seccional",
      text: "Seccional",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
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
      dataField: "fechaEgreso",
      text: "Fecha Egreso",
      sort: true,
      formatter: FormatearFecha,
      headerStyle: (colum, colIndex) => {
        return { width: "9%", textAlign: "center" };
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
    {
      dataField: "empresaCUIT",
      text: "CUIT",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
      formatter: Formato.Cuit,
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
      dataField: "actividad",
      text: "Actividad",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
    },
    
  ];
  
  /*const selectores = columns.map((items)=>(
    {
      dataField:items.dataField,
      text: items.text
    }
  ));*/

  const selectores = [
    {
      dataField: "NroAfiliado",
      text:"NroAfiliado"
    },
    {
      dataField: "CUIL",
      text:"CUIL"
    },
    {
      dataField: "Documento",
      text:"Documento"
    },
    {
      dataField: "Nombre",
      text:"Nombre"
    }

  ]

  console.log('selectores',selectores);


  const columnsVacia = [
    {
      dataField: "nroAfiliado",
      text: "Nro.Afiliado",
      sort: true
    }
  ]

  const rowEvents  = (row) => {
    //console.log('Afiliado_Seleccionado:',row);
   switch(selectedTab){
     case 0:
       setAfiliadoSeleccionado(row);
       break;
     case 1:
        setAfiliadoSeleccionado(row);
        break;
       case 2:
         setddjjUatreSeleccionado(row);
         //consulto los datos de la empresa seleccionada
         fetchEmpresa(row.cuit)
         break;
       default: break;
   }

   dispatch(handleAfiliadoSeleccionar(row));
};

  const fetchEmpresa = (cuit) => {
    console.log('cuit',cuit)
		if ((cuit ?? 0) == 0) {
			setEmpresaSeleccionada(null);
			return;
		}
		request(
			{
				baseURL: "Comunes",
				endpoint: `/Empresas/GetEmpresaSpecs?CUIT=${cuit}`,
				method: "GET",
			},
			async (response) => {
      console.log('response_empresa:',response)
      setEmpresaSeleccionada(response)}
			
		);
	};

  const handleTableChange = (
    type,
    { page, sizePerPage, filters, sortField, sortOrder, cellEdit}
  ) => {
    //console.log('SORT_TABLE_handleTableChange: ',page, sizePerPage, filters,sortField, sortOrder);
    setAfiliadoSeleccionado(null);
    sortField&&props.onSort(sortField,sortOrder);

  };

  //#region  la paginacion la maneja el componente Table
  const pagination = paginationFactory({
    //custom: true,
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
      props.onPageChange(page, sizePerPage);
    },
    onSizePerPageChange: function (page, sizePerPage) {
      props.onSizePerPageChange(sizePerPage, page);
    },
  });
//#endregion 

  const indication = () => {
    <h4>No hay informacion a mostrar</h4>;
  };

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const tableProps = {
      promptBuscar:"Buscar en Afiliados:",
      selectoresBuscar: selectores,
      accionBuscar: handleSelectFilter,
      //defaultSorted: defaultSorted,
      remote: true,
      keyField: "nroAfiliado",
      loading: props.loading,
      data: afiliados.data,
      columns: columns,
      pagination: pagination,
      onTableChange: handleTableChange,
      filter: filterFactory(),
      noDataIndication: indication,
      onSelected: rowEvents,
      error: props.errorRequest ? true : false,
  }

  const tablePropsVacia = {
      promptBuscar:"Buscar en Afiliados:",
      keyField: "nroAfiliado",
      data: [],
      columns: columnsVacia,
      noDataIndication: <h4>No se registran Declaraciones Juradas del Afiliado: </h4>,
      filter: filterFactory(),
  }

  const tablePropsVacia2 = {
    promptBuscar:"Buscar en Afiliados:",
    keyField: "nroAfiliado",
    data: [],
    columns: columnsVacia,
    noDataIndication: <h4>No se registran Cambios en el Afiliado: </h4>,
    filter: filterFactory(),
}

  return (
    <div className={styles.container}> 
        <h1 className='titulo'>Afiliaciones</h1>
        <div  className={styles.div}>    
            <div>
                <AndTabs
                  value={selectedTab}
                  onChange={handleChangeTab}
                  aria-label="basic tabs example"
                  className={styles.tabs}
                >
                 
                  <Tab  className={styles.tab} label="Afiliados"
                    style={{ width: "120px", height: "70px"  }}
                   />
                   
                   <Tab className={styles.tab}          
                    label= { afiliadoSeleccionado?.nombre ? `AFILIADO:    ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "AFILIADOS"}
                    style={{ minWidth: '950px', height: "80px", minHeight: '50px',
                    position: 'fixed',
                    fontWeight: 'bold',
                    fontSize: 'large',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start'
                  }}
                    //disabled={afiliadoSeleccionado?.cuil && afiliadoSeleccionado.estadoSolicitud === "Activo" ? false : true}
                   
                  />
                  <Tab className={styles.tab}          
                    label= 'DDJJ UATRE'//{ afiliadoSeleccionado?.nombre ? `DDJJ UATRE ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "DDJJ UATRE"}
                    style={{ width: "200px", height: "40px", minHeight: '40px'}}
                    //disabled={afiliadoSeleccionado?.cuil && afiliadoSeleccionado.estadoSolicitud === "Activo" ? false : true}
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />
                 
                  <Tab className={styles.tab}
                    label= 'Documentación'//{ afiliadoSeleccionado?.nombre ? `Documentación de ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "Documentación"}
                    style={{ width: "200px", height: "40px", minHeight: '40px'}}
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />

                  <Tab className={styles.tab}
                    label= 'Cambios de Datos'//{ afiliadoSeleccionado?.nombre ? `Instancias de Cambios de Datos de ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "Instancias de Cambios de Datos"}
                    style={{ width: "200px", height: "40px", minHeight: '40px'}}
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />

                  <Tab className={styles.tab}
                  label= 'Datos de la Seccional'//{ afiliadoSeleccionado?.nombre ? `Datos de la Seccional de ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "Datos de la Seccional"}
                  style={{ width: "230px", height: "40px", minHeight: '40px'}}
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />                 
                  
                </AndTabs>
            </div> 

              {selectedTab === 0 && (
                <div>
                  <TableSegmentado {...tableProps}/>
                </div> 
              )}

              {selectedTab === 1 && (
                <div>
                  <TableSegmentado {...tableProps}/>
                </div> 
              )}

              {selectedTab === 2 && (
                <DeclaracionesJuradas
                  cuil={afiliadoSeleccionado.cuil}
                  infoCompleta={true}
                  onSeleccionRegistro={rowEvents}
                />        
              )}
              {selectedTab === 3 && (
                
                <Table  {...tablePropsVacia}/>
              )}

              {selectedTab === 4 && (
               <Table  {...tablePropsVacia2}/>
              )}

              {selectedTab === 5 && (
                <Seccional
                  localidadId={afiliadoSeleccionado.refLocalidadId}
                  //onSeleccionRegistro={rowEvents}
                />        
              )}
        </div>

        <AfiliadoDetails config={{
          data: afiliadoSeleccionado,
          ddjj: ddjjUatreSeleccionado,
          empresa: empresaSeleccionada,
          tab: selectedTab
        }}/>
    </div>
  );
};

export default AfiliadosLista;
