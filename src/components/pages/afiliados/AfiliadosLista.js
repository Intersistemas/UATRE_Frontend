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
  const [rowSelectedIndex, setRowSelectedIndex] = useState(null);
  //const [selectFilter, setSelectFilter] = React.useState('');

  const AndTabs = styled(Tabs)({
    '.MuiTabs-flexContainer': {

      alignItems: 'flex-end',
    },
  });
  

  const handleSelectFilter = async (select,entry) => {
    console.log('evento select y entry: ',select,entry);
    //BUSQUEDA Y FILTRO
   
    props.onPageChange(1, 12);

    switch (select){
      case 'CUIT':
        fetchEmpresa(entry,'Afiliados');
        //.then((res) => props.onFilter("EmpresaId",empresaSeleccionada.id))')
        break;
      default: props.onFilter(select,entry);
      break;
    }
  
    //setSelectFilter(event.target.value);

  };


  const afiliados = {
    data: props.afiliados.data,
    totalRegs: props.afiliados.count,
    page: props.afiliados.index,
    sizePerPage: props.afiliados.size,
  };


  /*const defaultSorted = [
    {
      dataField: "nroAfiliado",
      order: "asc"
    }
  ];*/

  const columns = [
    {
      headerTitle: (column, colIndex) => `Numero de Afiliado`,
      dataField: "nroAfiliado",
      text: "Nro.Afil.",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "6%", textAlign: "center" };
      },
    },
    {
      headerTitle: true,
      dataField: "cuil",
      text: "CUIL",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "12%", textAlign: "center" };
      },
      formatter: Formato.Cuit,
    },
    {
      headerTitle: (colum, colIndex) => (`Documento número`),
      dataField: "documento",
      text: "Doc.Nro.",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "9%", textAlign: "center" };
      },
      formatter: Formato.DNI,
    },
    {
      headerTitle: true,
      dataField: "nombre",
      text: "Nombre",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "20%", textAlign: "center" };
      },
    },
    {
      headerTitle: true,
      dataField: "sexo",
      text: "Sexo",
      headerStyle: (colum, colIndex) => {
        return { width: "7%", textAlign: "center" };
      },
    },
    
    {
      headerTitle: (column, colIndex) => `Estado Civil`,
      dataField: "estadoCivil",
      text: "Est.Civil",
      headerStyle: (colum, colIndex) => {
        return { width: "5%", textAlign: "center" };
      },
    },

    {

      headerTitle: true,
      dataField: "nacionalidad",
      text: "Nac.",
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
    },
    { //ME GENERA ERROR CON EL SEARCH TAB
      headerTitle: (colum, colIndex) => (`Situación del Afiliado`),
      dataField: "estadoSolicitud",
      //text: "Situación",
      //sort: true,
      //title: "Estado Solicitud",
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
      formatter: (cell) => {
        switch (cell){
          case "Pendiente": 
            return (<div
              style={{backgroundColor: '#ffff64cc' }}
            >{cell}</div>)
            break;
          case "No Activo": 
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
      
      filter: selectFilter({
        comparator: Comparator.EQ,
        options: props.estadosSolicitudes,
        defaultValue: props.estadoSolicitudActual,
        className: "my-custom-text-filter",
        placeholder: "Seleccion Estado...",
        withoutEmptyOption: true,
      }),
    },
    {
      headerTitle: true,
      dataField: "seccional",
      text: "Seccional",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
    },
    {
      headerTitle: true,
      dataField: "refDelegacionDescripcion",
      text: "Delegación",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
    },
    
    {
      headerTitle: true,
      dataField: "provincia",
      text: "Provincia",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
    },
    {
      headerTitle: (colum, colIndex) => (`Fecha de Ingreso`),
      dataField: "fechaIngreso",
      text: "F.Ingreso",
      sort: true,
      formatter: FormatearFecha,
      headerStyle: (colum, colIndex) => {
        return { width: "9%", textAlign: "center" };
      },
    },

    {
      headerTitle: (colum, colIndex) => (`Fecha de Egreso`),
      dataField: "fechaEgreso",
      text: "F.Egreso",
      sort: true,
      formatter: FormatearFecha,
      headerStyle: (colum, colIndex) => {
        return { width: "9%", textAlign: "center" };
      },
    },

    {
      headerTitle: true,
      dataField: "puesto",
      text: "Puesto",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7%", textAlign: "center" };
      },
    },
    {
      headerTitle: true,
      dataField: "empresaCUIT",
      text: "CUIT",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "12%", textAlign: "center" };
      },
      formatter: Formato.Cuit,
    },
    {
      headerTitle: true,
      dataField: "empresaDescripcion",
      text: "Empresa",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "12%", textAlign: "center" };
      },
    },
    {
      headerTitle: true,
      dataField: "actividad",
      text: "Actividad",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
    },
    
  ];
  

  const selectores = [
    {
      dataField: "NroAfiliado",
      text:"Nro.Afiliado"
    },{
      dataField: "CUIL",
      text:"CUIL"
    },{
      dataField: "Documento",
      text:"Documento"
    },{
      dataField: "Nombre",
      text:"Nombre"
    },{
      dataField: "CUIT",
      text:"CUIT Empresa"
    },{
      dataField: "Seccional.Descripcion",
      text:"Seccional"
    },{
      dataField: "FechaIngreso",
      text:"Fecha Ingreso"
    },{
      dataField: "FechaEgreso",
      text:"Fecha Egreso"
    },

    

  ]

  const columnsVacia = [
    {
      dataField: "nroAfiliado",
      text: "Nro.Afiliado",
      sort: true
    }
  ]

  //manejo la seleccion de cualquier registro de cualquiera de los TABs de AfiliadosLista
  const rowEvents  = (row) => {
  console.log('Afiliado_Seleccionado**:',row);
  setRowSelectedIndex([row.id]);
   switch(selectedTab){
     case 0:
        //setRowSelectedIndex(null);
        setAfiliadoSeleccionado(row);
        props.onAfiliadoSeleccionado(row);
        break;
     case 1:
          console.log('DDJJ Seleccionada**:',row)
          setddjjUatreSeleccionado(row);
         //consulto los datos de la empresa seleccionada
         fetchEmpresa(row.cuit, 'DDJJ')
         break;
    default: break;
   }

   dispatch(handleAfiliadoSeleccionar(row));
};

  const fetchEmpresa = (cuit,tab) => {
    console.log('fetchEmpresa:',cuit)
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
        console.log('GetEmpresa',response);
        setEmpresaSeleccionada(response)
        
       if (tab === 'Afiliados'){
          props.onFilter("EmpresaId",response.id)
        }
      }
		);
	};

  const handleTableChange = (
    type,
    { page, sizePerPage, filters, sortField, sortOrder, cellEdit}
  ) => {
    //console.log('SORT_TABLE_handleTableChange: ',page, sizePerPage, filters,sortField, sortOrder);
    //console.log('filters:',filters);
    //setAfiliadoSeleccionado(null);
    sortField&&props.onSort(sortField,sortOrder);
    props.onFilterChange(filters);
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
      keyField: "id",
      loading: props.loading,
      data: afiliados.data,
      columns: columns,
      pagination: pagination,
      onTableChange: handleTableChange,
      filter: filterFactory(),
      noDataIndication: indication,
      onSelected: rowEvents,
      error: props.errorRequest ? true : false,
      rowSelectedIndex: rowSelectedIndex,
  }


  const tablePropsVacia0 = {
    promptBuscar:"Buscar en Afiliados:",
    keyField: "nroAfiliado",
    data: [],
    columns: columnsVacia,
    noDataIndication: <h4>No existe documentación relacionada al Afiliado seleccionado.</h4>,
    filter: filterFactory(),
}

  const tablePropsVacia1 = {
      promptBuscar:"Buscar en Afiliados:",
      keyField: "nroAfiliado",
      data: [],
      columns: columnsVacia,
      noDataIndication: <h4>No se registran cambios de datos en el Afiliado seleccionado.</h4>,
      filter: filterFactory(),
  }

  return (
    <> 
        <div  className='titulo'>
          <h1>Afiliaciones</h1>  
        </div>

        <div className="contenido">

              <div style={{display: 'flex', color: '#186090', height: '1.5rem', paddingLeft: '1rem'}}>
                  <h5>{afiliadoSeleccionado?.nombre ? `${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : ''}</h5>
              </div>
              <div style={{margin: '0% 0% -0.6rem 0%'}}>
              <Tabs
                value={selectedTab}
                onChange={handleChangeTab}
                className={styles.tabs}
              >
                  <Tab  
                   className={styles.tab}
                   style={{backgroundColor: "#186090"}}
                   label= 'AFILIADOS'//{ afiliadoSeleccionado?.nombre ? `DDJJ UATRE ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "DDJJ UATRE"}
                  />
                  <Tab className={styles.tab}  
                    style={{backgroundColor: "#186090"}}        
                    label= 'DDJJ UATRE'//{ afiliadoSeleccionado?.nombre ? `DDJJ UATRE ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "DDJJ UATRE"}
                    //disabled={afiliadoSeleccionado?.cuil && afiliadoSeleccionado.estadoSolicitud === "Activo" ? false : true}
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />
                  
                  <Tab className={styles.tab}
                  style={{backgroundColor: "#186090"}}
                    label= 'Documentación'//{ afiliadoSeleccionado?.nombre ? `Documentación de ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "Documentación"}
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />

                  <Tab className={styles.tab}
                  style={{backgroundColor: "#186090"}}
                    label= 'Cambios de Datos'//{ afiliadoSeleccionado?.nombre ? `Instancias de Cambios de Datos de ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "Instancias de Cambios de Datos"}
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />

                  <Tab className={styles.tab}
                  style={{backgroundColor: "#186090"}}
                  label= 'Datos de la Seccional'//{ afiliadoSeleccionado?.nombre ? `Datos de la Seccional de ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "Datos de la Seccional"}
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />                 
              </Tabs>
              </div>
          {selectedTab === 0 && (
            <div>
              <TableSegmentado {...tableProps}/>
            </div> 
          )}

          {selectedTab === 1 && (
            <DeclaracionesJuradas
              cuil={afiliadoSeleccionado.cuil}
              infoCompleta={true}
              onSeleccionRegistro={rowEvents}
            />        
          )}
          {selectedTab === 2 && (
            
            <Table  {...tablePropsVacia0}/>
          )}

          {selectedTab === 3 && (
            <Table  {...tablePropsVacia1}/>
          )}

          {selectedTab === 4 && (
            <Seccional
              localidadId={afiliadoSeleccionado.refLocalidadId}
              //onSeleccionRegistro={rowEvents}
            />        
          )}

          <AfiliadoDetails config={{
            data: afiliadoSeleccionado,
            ddjj: ddjjUatreSeleccionado,
            empresa: empresaSeleccionada,
            tab: selectedTab
          }}/>
      </div>
    </>
  );
};

export default AfiliadosLista;
