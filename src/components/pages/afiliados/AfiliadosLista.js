import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
	handleModuloSeleccionar,
	handleAfiliadoSeleccionar,
	handleModuloEjecutarAccion,
} from "redux/actions";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {
	selectFilter,
	Comparator,
} from "react-bootstrap-table2-filter";
import { Tab, Tabs } from "@mui/material";
import Action from "components/helpers/Action";
import Formato from "components/helpers/Formato";
import useHttp from "components/hooks/useHttp";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import Table from "components/ui/Table/Table";
import TableSegmentado from "components/ui/Table/TableRemote";
import AfiliadoDetails from "./AfiliadoDetails";
import AfiliadoEstados from "./AfiliadoEstados";
import AfiliadoHistorico from "./AfiliadoHistorico";
import AfiliadosDocumentaciones from "./AfiliadosDocumentaciones";
import AfiliadoSeccional from "./AfiliadosSeccionales";
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";

const AfiliadosLista = (props ) => {

  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(props.afiliadoSeleccionado);
  const [seccionalSeleccionada, setSeccionalSeleccionada] = useState({});
  const [ddjjUatreSeleccionado, setddjjUatreSeleccionado] = useState(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [afiliadosActions, setAfiliadosActions] = useState();
  const { sendRequest: request } = useHttp();
  const [rowSelectedIndex, setRowSelectedIndex] = useState([props.afiliadoSeleccionado?.id]);
  const [openImpresiones, setOpenImpresiones] = useState(false);
  

  const onLinkToGuiaAfiliaciones = () => {
		const link = document.createElement("a");
    link.target="_blank";
		link.href = "https://drive.google.com/file/d/12noBfSzK35joyhbE_taxcMOqw3xz8vkt/view?usp=sharing"; 
		link.click();
	  };
  
  const tareas = useTareasUsuario();

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

  useEffect(() => {

    console.log('selectedTab:',selectedTab);
    let actions = [];

    if (selectedTab == 0) {
      const createAction = ({ action, request, onExecute, ...x }) =>
        new Action({
          name: action,
          //request: request,
          onExecute: onExecute,//() =>  dispatch(handleModuloEjecutarAccion(request)),
          combination: "AltKey",
          ...x,
        });

      actions.push(
        createAction({
          action: `Agrega Afiliado`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("A")),//request: "A",
          tarea: "Afiliaciones_AfiliadoAgrega",
          keys: "a",
          underlineindex: 0,
        }),
      );

      const desc = "";//afiliadoSeleccionado?.nombre ;

      actions.push(
        createAction({
          action: `Modifica Afiliado ${desc}`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("M")),//request: "M",
          tarea: "Afiliaciones_AfiliadoModifica",
          ...(afiliadoSeleccionado?.estadoSolicitud === "No Activo" ? 
            {disabled:  true}
            :
            {
            disabled:  false,
            keys: "m",
            underlineindex: 0
            }
          )
        })
      );

      actions.push(
        createAction({
          action: `Resuelve Solicitud ${desc}`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("S")),//request: "S",
          tarea: "Afiliaciones_AfiliadoResuelve",
          ...(afiliadoSeleccionado?.estadoSolicitud !== "Pendiente" ? 
            {disabled:  true}
            :
            {
            disabled:  false,
            keys: "s",
            underlineindex: 9,
            }
          )
        })
      );

      actions.push(
        createAction({
          action: `Baja Afiliado ${desc}`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("B")),//request: "B",
          tarea: "Afiliaciones_AfiliadoBaja",

          ...(afiliadoSeleccionado?.estadoSolicitud !== "Activo" ? 
            {disabled:  true}
            :
            {
            disabled:  false,
            keys: "b",
            underlineindex: 0,
            }
          )
        })
      );

      actions.push(
        createAction({
          action: `Reactiva Afiliado ${desc}`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("R")),//request: "R",
          tarea: "Afiliaciones_AfiliadoReactiva",
          ...(afiliadoSeleccionado?.estadoSolicitud !== "No Activo" ? 
            {disabled:  true}
            :
            {
            disabled:  false,
            keys: "r",
            underlineindex: 0,
            }
          )
        })
      );

      actions.push(
        createAction({
          action: `Localiza Afiliado ${desc}`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("L")),//request: "L",
          tarea: "Afiliaciones_AfiliadoLocaliza",
          disabled:  false,
          keys: "l",
          underlineindex: 0,
        })
      );

      /*
      actions.push(
        createAction({
          action: `Imprime Carnet de Afiliación ${desc}`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("I")),//request: "I",
          tarea: "Afiliaciones_AfiliadoCarnet",

          ...(afiliadoSeleccionado?.estadoSolicitud !== "Activo" ? 
            {disabled:  true}
            :
            {
            disabled:  false,
            keys: "p",
            underlineindex: 2,
            }
          )
        })
      );

			actions.push(
				createAction({
					action: `Imprime Carnet de Afiliación en Lote`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("E")),//request: "E",
					tarea: "Afiliaciones_AfiliadoCarnet",
					disabled: false,
					keys: "e",
					underlineindex: 6,
				})
			);
*/

      actions.push(
        createAction({
          action: `Impresiones`,
          //onExecute: (e) => handleClickBtn(e),//request: "X",
          tarea: "Afiliaciones_Impresiones",
          keys: "p",
          underlineindex: 2,
          ariaHaspopu: true,
          ariaControls:'menu-impresiones',

          menuItems: [
            {
              label: `Carnet de Afiliación ${desc}`,
              onExecute: () => dispatch(handleModuloEjecutarAccion("I")),
              ...(afiliadoSeleccionado?.estadoSolicitud !== "Activo" || !tareas.hasTarea("Afiliaciones_AfiliadoCarnet")? 
              {disabled:  true}
              :
              {
              disabled:  false,}),
              keys: "e",
              underlineindex: 6,
            },
            {
              label: `Carnet de Afiliación en Lote`,
              onExecute: () => dispatch(handleModuloEjecutarAccion("E")),
              disabled: !tareas.hasTarea("Afiliaciones_AfiliadoCarnetLote"),
              keys: "l",
              underlineindex: 32,
              
            }
          ]
        }),
      );

      actions.push(
        createAction({
          action: `Instructivos`,
          //onExecute: (e) => handleClickBtn(e),//request: "X",
          tarea: "Afiliaciones_Instructvos",
          keys: "n",
          underlineindex: 1,
          ariaHaspopu: true,
          ariaControls:'menu-instructivos',

          menuItems: [
            {
              label: `Guia de Afiliaciones`,
              onExecute: onLinkToGuiaAfiliaciones,
              disabled: !tareas.hasTarea("Afiliaciones_AfiliadoGuia"),
              keys: "g",
              underlineindex: 0,
              //disabled: !tareas.hasTarea("Afiliaciones_Instrictivo1")
            }
          ]
        }),
      );

    }

    const acciones = actions;
		dispatch(handleModuloSeleccionar({ nombre: "Afiliados", acciones }));
    setAfiliadosActions(actions);
		 //cargo todas las acciones / botones
	}, [selectedTab, afiliadoSeleccionado]);



  //llamo para que se refresquen los datos del primer registro seleccionado
  useEffect(() => {
    console.log('props.afiliadoSeleccionado',props.afiliadoSeleccionado);
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
        return { width: "6rem", textAlign: "center" };
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
      formatter: (v) => Formato.Cuit(v),
    },
    {
      headerTitle: true,
      dataField: "cuilValidado",
      text: "Val.",
      headerStyle: (colum, colIndex) => {
        return { width: "3rem", textAlign: "center" };
      },
      formatter: (value, row) => ( 
        value == 0 ? "N" : (value == row.cuil) ? 'V' : 'D'
      ),
    },
    
    {
      headerTitle: (colum, colIndex) => (`Documento número`),
      dataField: "documento",
      text: "Doc.Nro.",
      sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "7rem", textAlign: "center" };
      },
      formatter: (v) => Formato.DNI(v),
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
      dataField: "seccionalCodigo",
      text: "Cod.Seccional",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "6%", textAlign: "center" };
      },
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
      formatter: (v) => Formato.Fecha(v),
      headerStyle: (colum, colIndex) => {
        return { width: "9%", textAlign: "center" };
      },
    },

    {
      headerTitle: (colum, colIndex) => (`Fecha de Egreso`),
      dataField: "fechaEgreso",
      text: "F.Egreso",
      sort: true,
      formatter: (v) => Formato.Fecha(v),
      headerStyle: (colum, colIndex) => {
        return { width: "9%", textAlign: "center" };
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
      formatter: (v) => Formato.Cuit(v),
    },
    {
      headerTitle: true,
      dataField: "empresaDescripcion",
      text: "Empresa",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "20%", textAlign: "center" };
      },
    },

     /*{
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
      dataField: "actividad",
      text: "Actividad",
      //sort: true,
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
    },*/
    
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
   console.log('_AfiliadosLista_rowEvents',row);
   setRowSelectedIndex([row?.id]);
   switch(selectedTab){
     case 0:
        setAfiliadoSeleccionado(row);
        setddjjUatreSeleccionado({}); //dejo vacia las ddjj al seleccionar un nuevo afiliado
        setEmpresaSeleccionada({}) //dejo vacia la empresa al seleccional el afiliado
        props.onAfiliadoSeleccionado(row);
        break;
     case 1:
         setddjjUatreSeleccionado(row);
         console.log('ddjj_UatreSeleccionado',row);
         //consulto los datos de la empresa seleccionada
         fetchEmpresa(row.cuit, 'DDJJ')
         break;
     case 4:
         setSeccionalSeleccionada(row);
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

  return (
		<Grid col height="100vh">
			<Grid full col>
				<Grid className="titulo">
					<h1>Afiliaciones</h1>
				</Grid>

				<Grid col className="tabs">
					<text>
						{afiliadoSeleccionado?.nombre ? (
							`${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${
								afiliadoSeleccionado?.nombre
							}`
						) : (
							<>&nbsp;</>
						)}
					</text>
					<Grid width>
						<Tabs
							value={selectedTab}
							onChange={handleChangeTab}
							variant="scrollable"
							scrollButtons
							allowScrollButtonsMobile
							style={{ width: "100%", position: "relative", zIndex: 1 }}
						>
							<Tab
								style={{ backgroundColor: "#186090" }}
								label="AFILIADOS"
							/>
							<Tab
								style={{ backgroundColor: "#186090" }}
								label="DDJJ UATRE"
								disabled={afiliadoSeleccionado?.cuil ? false : true}
							/>

							<Tab
								style={{ backgroundColor: "#186090" }}
								label="Documentación"
								disabled={afiliadoSeleccionado?.cuil ? false : true}
							/>

							<Tab
								style={{ backgroundColor: "#186090" }}
								label="Datos de la Seccional" //{ afiliadoSeleccionado?.nombre ? `Datos de la Seccional de ${Formato.Cuit(afiliadoSeleccionado?.cuil) ?? ""} ${afiliadoSeleccionado?.nombre}` : "Datos de la Seccional"}
								disabled={afiliadoSeleccionado?.cuil ? false : true}
							/>

							<Tab
								style={{ backgroundColor: "#186090" }}
								label="Estados del afiliado"
								disabled={afiliadoSeleccionado?.id ? false : true}
							/>

							<Tab
								style={{ backgroundColor: "#186090" }}
								label="Cambios de Datos"
								disabled={afiliadoSeleccionado?.cuil ? false : true}
							/>
						</Tabs>
						<Grid
							block
							shrink="0"
							basis={{ 0: "700px", 1: "25%", 2: "25%" }[selectedTab] ?? "0px"}
						/>
					</Grid>
				</Grid>

				<Grid className="contenido" col gap="10px">
					<Grid />
					<Grid col grow justify="between">
						{selectedTab === 0 && ( //AFILIADOS
							<>
								<TableSegmentado {...tableProps} />
								<KeyPress items={afiliadosActions} />
							</>
						)}

						{selectedTab === 1 && ( //DDJJ
							<DeclaracionesJuradas
								cuil={
									afiliadoSeleccionado.cuilValidado
										? afiliadoSeleccionado.cuilValidado
										: afiliadoSeleccionado.cuil
								}
								//cuit={afiliadoSeleccionado.empresaCUIT} // se comenta ya que debe mostrar todas las DDJJ del afiliado sin filtrar por CUIT.
								infoCompleta={true}
								onSeleccionRegistro={rowEvents}
								onDeclaracionesGeneradas={null}
							/>
						)}
						{selectedTab === 2 && (
							<AfiliadosDocumentaciones afiliado={afiliadoSeleccionado} />
						)}

						{selectedTab === 3 && (
							<AfiliadoSeccional
								afiliado={afiliadoSeleccionado}
								onSeleccionRegistro={rowEvents}
							/>
						)}

						{selectedTab === 4 && (
							<AfiliadoEstados afiliado={afiliadoSeleccionado} />
						)}

						{selectedTab === 5 && (
							<AfiliadoHistorico afiliado={afiliadoSeleccionado} />
						)}

						<AfiliadoDetails
							config={{
								data: afiliadoSeleccionado,
								ddjj: ddjjUatreSeleccionado,
								empresa: empresaSeleccionada,
								seccional: seccionalSeleccionada,
								tab: selectedTab,
							}}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default AfiliadosLista;
