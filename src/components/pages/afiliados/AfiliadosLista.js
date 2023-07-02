import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";

//import overlayFactory from "react-bootstrap-table2-overlay";
import React, { useEffect } from "react";
import paginationFactory from "react-bootstrap-table2-paginator";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import styles from "./AfiliadosLista.module.css";
import AfiliadoDetails from './AfiliadoDetails';
import filterFactory, {
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
import Seccional from "./seccional/Seccional";
import useHttp from "../../hooks/useHttp";
import { styled } from '@mui/material/styles';


const AfiliadosLista = (props ) => {

  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(props.afiliadoSeleccionado);
  const [ddjjUatreSeleccionado, setddjjUatreSeleccionado] = useState(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const {isLoading, error, sendRequest: request } = useHttp();
  const [rowSelectedIndex, setRowSelectedIndex] = useState([props.afiliadoSeleccionado?.id]);

  const handleSelectFilter = async (select,entry,obj) => {
    console.log('evento select y entry: ',select,entry,obj);
    //BUSQUEDA Y FILTRO

    props.setEntrySelected(obj);
    props.setEntryValue(entry);
    
    switch (select){
      case 'CUIT':
        fetchEmpresa(entry,'Afiliados');
        break;
      default: props.onFilter(select,entry);
      break;
    }

  };

  //llamo para que se refresquen los datos del primer registro seleccionado
  useEffect(() => {
    rowEvents(props.afiliadoSeleccionado);
  }, [props.afiliadoSeleccionado]);
  
  const afiliados = {
    data: props.afiliados.data,
    totalRegs: props.afiliados.count,
    page: props.afiliados.index,
    sizePerPage: props.afiliados.size,
  };

  const columns = [
    {
      headerTitle: (column, colIndex) => `Numero de Afiliado`,
      dataField: "nroAfiliado",
      text: "Nro.Afil.",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
    },
    {
      headerTitle: true,
      dataField: "cuil",
      text: "CUIL",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10rem", textAlign: "center" };
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
      style: (colum, colIndex) => {
        return { textAlign: "left" };
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
          case "No Activo": 
            return (<div
              style={{backgroundColor: '#ff6464cc', color: '#FFF'}}
              >{cell}</div>)
          /*case "Observado":
            return (<div
              style={{backgroundColor: '#6464ffcc',  color: '#FFF'}}
              >{cell}</div>)*/
          case "Rechazado":
            return (<div
              style={{backgroundColor: '#f08c32cc', color: '#FFF' }}
              >{cell}</div>)
          case "Activo":
              return (<div
                >{cell}</div>) 
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
        return { width: "10rem", textAlign: "center" };
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
      id: 1,
      dataField: "NroAfiliado",
      text:"Nro.Afiliado",
      dataType: "number"
    },{
      id: 2,
      dataField: "CUIL",
      text:"CUIL",
      dataType: "number"
    },{
      id: 3,
      dataField: "Documento",
      text:"Documento",
      dataType: "number"
    },{
      id: 4,
      dataField: "Nombre",
      text:"Nombre",
      dataType: "text"
    },{
      id: 5,
      dataField: "CUIT",
      text:"CUIT Empresa",
      dataType: "number"
    },{
      id: 6,
      dataField: "Seccional",
      text:"Seccional",
      dataType: "text"
    },{
      id: 7,
      dataField: "FechaIngreso",
      text:"Fecha Ingreso",
      dataType: "date"
    },{
      id: 8,
      dataField: "FechaEgreso",
      text:"Fecha Egreso",
      dataType: "date"
    }
  ]

  const columnsVacia = [
    {
      dataField: "nroAfiliado",
      text: "Nro.Afiliado",
      sort: true
    }
  ]

  //manejo la seleccion de cualquier registro de cualquiera de los TABs de AfiliadosLista
  const rowEvents  = (row, isSelect) => {
  setRowSelectedIndex([row?.id]);
   switch(selectedTab){
     case 0:
        setAfiliadoSeleccionado(row);
        props.onAfiliadoSeleccionado(row);
        break;
     case 1:
        
         setddjjUatreSeleccionado(row);
         //consulto los datos de la empresa seleccionada
         fetchEmpresa(row.cuit, 'DDJJ')
         break;
    default: break;
   }

   dispatch(handleAfiliadoSeleccionar(row));
};


  const fetchEmpresa = (cuit,tab) => {
   
		if ((cuit ?? 0) === 0) {
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
      rowEvents: rowEvents,
      onSelected: rowEvents,
      error: props.errorRequest ? true : false,
      rowSelectedIndex: rowSelectedIndex,
      afiliadoSeleccionado: props.afiliadoSeleccionado,

      entrySelected: props.entrySelected,
      entryValue: props.entryValue,
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
        <div>
          <h1 className='titulo'>Afiliaciones</h1>  
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
                   label= 'AFILIADOS'
                  />
                  <Tab className={styles.tab}  
                    style={{backgroundColor: "#186090"}}        
                    label= 'DDJJ UATRE'
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />
                  
                  <Tab className={styles.tab}
                  style={{backgroundColor: "#186090"}}
                    label= 'Documentación'
                    disabled={afiliadoSeleccionado?.cuil ? false : true}
                  />

                  <Tab className={styles.tab}
                  style={{backgroundColor: "#186090"}}
                    label= 'Cambios de Datos'
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
              onDeclaracionesGeneradas={null}
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
