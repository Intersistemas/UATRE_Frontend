import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
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
import TableSegmentado from "components/ui/Table/TableRemote";
import AfiliadoDetails from "./AfiliadoDetails";
import AfiliadoEstados from "./AfiliadoEstados";
import AfiliadoHistorico from "./AfiliadoHistorico";
import AfiliadosDocumentaciones from "./AfiliadosDocumentaciones";
import AfiliadoSeccional from "./AfiliadosSeccionales";
import DeclaracionesJuradas from "./declaracionesJuradas/DeclaracionesJuradas";

const AfiliadosLista = (props) => {

  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(props.afiliadoSeleccionado);
  const [seccionalSeleccionada, setSeccionalSeleccionada] = useState({});
  const [ddjjUatreSeleccionado, setddjjUatreSeleccionado] = useState(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [afiliadosActions, setAfiliadosActions] = useState();
  const { sendRequest: request } = useHttp();
  const [rowSelectedIndex, setRowSelectedIndex] = useState([props.afiliadoSeleccionado?.id]);

  const onLinkToGuiaAfiliaciones = () => {
		const link = document.createElement("a");
    link.target="_blank";
		link.href = "https://drive.google.com/file/d/12noBfSzK35joyhbE_taxcMOqw3xz8vkt/view?usp=sharing"; 
		link.click();
	  };
  
  const tareas = useTareasUsuario();

  const handleSelectFilter = async (select,entry,obj) => {
    console.log('evento select y entry: ',select,entry,obj);

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

    if (selectedTab === 0) {
      const createAction = ({ action, request, onExecute, ...x }) =>
        new Action({
          name: action,
          onExecute: onExecute,
          combination: "AltKey",
          ...x,
        });

      actions.push(
        createAction({
          action: `Agrega Afiliado`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("A")),
          tarea: "Afiliaciones_AfiliadoAgrega",
          keys: "a",
          underlineindex: 0,
        }),
      );

      const desc = "";

      actions.push(
        createAction({
          action: `Modifica Afiliado ${desc}`,
          onExecute: () => dispatch(handleModuloEjecutarAccion("M")),
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
          onExecute: () => dispatch(handleModuloEjecutarAccion("S")),
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
          onExecute: () => dispatch(handleModuloEjecutarAccion("B")),
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
          onExecute: () => dispatch(handleModuloEjecutarAccion("R")),
          tarea: "Afiliaciones_AfiliadoReactiva",
          ...(afiliadoSeleccionado?.estadoSolicitud !== "No Activo" || (afiliadoSeleccionado?.refMotivoBajaNoPermitirReactivarAfiliado &&
             !tareas.hasTarea("Afiliaciones_ReactivaBajaEspecial")) ?
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
          onExecute: () => dispatch(handleModuloEjecutarAccion("L")),
          tarea: "Afiliaciones_AfiliadoLocaliza",
          disabled:  false,
          keys: "l",
          underlineindex: 0,
        })
      );

      actions.push(
        createAction({
          action: `Impresiones`,
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
            }
          ]
        }),
      );

    }

    const acciones = actions;
		dispatch(handleModuloSeleccionar({ nombre: "Afiliados", acciones }));
    setAfiliadosActions(actions);
	}, [selectedTab, afiliadoSeleccionado]);

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
			headerTitle: () => `Numero de Afiliado`,
			dataField: "nroAfiliado",
			text: "Nro.Afil.",
			sort: true,
			headerStyle: { width: "6rem", textAlign: "center" },
		},
		{
			headerTitle: true,
			dataField: "cuil",
			text: "CUIL",
			sort: true,
			headerStyle: { width: "10rem", textAlign: "center" },
      formatter: (v, row) => (row.cuilValidado != 0 ? Formato.Cuit(row.cuilValidado) : Formato.Cuit(v)),
			//formatter: (v) => Formato.Cuit(v),
		},
		{
			headerTitle: true,
			dataField: "cuilValidado",
			text: "Val.",
			headerStyle: { width: "3rem", textAlign: "center" },
			formatter: (value, row) => ( 
				console.log("value",value,row),
				value ? (value === row.cuil) ? 'V' : 'D' : "N" 
			),
		},
		{
			headerTitle: () => (`Documento número`),
			dataField: "documento",
			text: "Doc.Nro.",
			sort: true,
			headerStyle: { width: "7rem", textAlign: "center" },
			formatter: (v) => Formato.DNI(v),
		},
		{
			headerTitle: true,
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			headerStyle: { width: "20%", textAlign: "center" },
			style: { textAlign: "left" },
		},
		{
			headerTitle: () => (`Situación del Afiliado`),
			dataField: "estadoSolicitud",
			headerStyle: { width: "8%", textAlign: "center" },
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
				options: props.estadosSolicitudes || [{ value: 0, label: " Todos" }],
				defaultValue: props.estadoSolicitudActual || 0,
				className: "my-custom-text-filter",
				placeholder: "Seleccion Estado...",
				withoutEmptyOption: true,
			}),
		},
		{
			headerTitle: true,
			dataField: "seccionalCodigo",
			text: "Cod.Seccional",
			headerStyle: { width: "6%", textAlign: "center" },
		},
		{
			headerTitle: true,
			dataField: "seccional",
			text: "Seccional",
			headerStyle: { width: "10%", textAlign: "center" },
		},
		{
			headerTitle: true,
			dataField: "refDelegacionDescripcion",
			text: "Delegación",
			headerStyle: { width: "10%", textAlign: "center" },
		},
		{
			headerTitle: true,
			dataField: "provincia",
			text: "Provincia",
			headerStyle: { width: "10%", textAlign: "center" },
		},
		{
			headerTitle: () => (`Fecha de Ingreso`),
			dataField: "fechaIngreso",
			text: "F.Ingreso",
			sort: true,
			formatter: (v) => Formato.Fecha(v),
			headerStyle: { width: "10%", textAlign: "center" },
		},
		{
			headerTitle: () => (`Fecha de Egreso`),
			dataField: "fechaEgreso",
			text: "F.Egreso",
			sort: true,
			formatter: (v) => Formato.Fecha(v),
			headerStyle: { width: "9%", textAlign: "center" },
		},
		{
			headerTitle: true,
			dataField: "empresaCUIT",
			text: "CUIT",
			headerStyle: { width: "10rem", textAlign: "center" },
			formatter: (v) => Formato.Cuit(v),
		},
		{
			headerTitle: true,
			dataField: "empresaDescripcion",
			text: "Empresa",
			headerStyle: { width: "20%", textAlign: "center" },
		},
		 /*{
			headerTitle: true,
			dataField: "puesto",
			text: "Puesto",
			//sort: true,
			headerStyle: { width: "7%", textAlign: "center" },
		},
		{
			headerTitle: true,
			dataField: "actividad",
			text: "Actividad",
			//sort: true,
			headerStyle: { width: "10%", textAlign: "center" },
		},*/
	].map((column) => {
		const ogStyle = column.style;
		column.style = (cell, row, ...p) => {
			const base = {};
			const periodo = row.ultimaDDJJPeriodo || 101;
			const fecha = dayjs(Formato.Mascara(periodo, "####-##-01"));
			if (dayjs().diff(fecha, "months") > 9) base.backgroundColor = "#bfbfbf";
			const style = typeof ogStyle === "function" ? ogStyle(cell, row, ...p) : ogStyle;
			return { ...base, ...style };
		}
		return column;
	});
	
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

  //manejo la seleccion de cualquier registro de cualquiera de los TABs de AfiliadosLista
  const rowEvents  = (row, isSelect) => {
   console.log('_AfiliadosLista_rowEvents',row);
   setRowSelectedIndex([row?.id]);
   switch(selectedTab){
     case 0:
        setAfiliadoSeleccionado(row);
        setddjjUatreSeleccionado({});
        setEmpresaSeleccionada({})
        props.onAfiliadoSeleccionado(row);
        break;
     case 1:
         setddjjUatreSeleccionado(row);
         console.log('ddjj_UatreSeleccionado',row);
         fetchEmpresa(row.cuit, 'DDJJ')
         break;
     case 3:
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
    sortField&&props.onSort(sortField,sortOrder);
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
    hideSizePerPage: true,
    onPageChange: function (page, sizePerPage) {
      props.onPageChange(page, sizePerPage);
    },
    onSizePerPageChange: function (page, sizePerPage) {
    props.onSizePerPageChange(sizePerPage, page);
    },
  });

  const indication = <h4>No hay información a mostrar</h4>
      
  

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const tableProps = {
      promptBuscar:"Buscar en Afiliados:",
      selectoresBuscar: selectores,
      accionBuscar: handleSelectFilter,
      remote: true,
      keyField: "id",
      loading: props.loading,
      data: afiliados.data,
      columns,
      pagination: pagination,
      onTableChange: handleTableChange,
      filter: filterFactory(),
      noDataIndication: props.noDataMessage ?? indication,
      rowEvents: rowEvents,
      onSelected: rowEvents,
      error: props.errorRequest ? true : false,
      rowSelectedIndex: rowSelectedIndex,
      afiliadoSeleccionado: props.afiliadoSeleccionado,
        entrySelected: props.entrySelected,
        entryValue: props.entryValue,
        onEntryChange: props.setEntryValue,
        searchError: props.searchError,
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
							label="Datos de la Seccional"
							disabled={afiliadoSeleccionado?.cuil ? false : true}
							/>

							<Tab
								style={{ backgroundColor: "#186090" }}
								label="Estados del afiliado"
								disabled={afiliadoSeleccionado?.id && tareas.hasTarea("Afiliaciones_Tab_EstadosDelAfiiliado") ? false : true}
							/>

							<Tab
								style={{ backgroundColor: "#186090" }}
								label="Cambios de Datos"
								disabled={afiliadoSeleccionado?.cuil && tareas.hasTarea("Afiliaciones_Tab_CambioDeDatos") ? false : true}
							/>
						</Tabs>
            <Grid block shrink="0" basis={
								{ 0: "700px", 1: "25%", 2: "25%", 4: "25%" }
							}  flex="0 0 700px" />
						
					</Grid>
				</Grid>

				<Grid className="contenido" col gap="10px">
					
					<Grid col grow justify="between">
						{selectedTab === 0 && ( //AFILIADOS
							<>
								<TableSegmentado {...tableProps} />
								<KeyPress items={afiliadosActions} />
							</>
						)}

						{selectedTab === 1 && (
							<DeclaracionesJuradas
								cuil={
									afiliadoSeleccionado.cuilValidado
										? afiliadoSeleccionado.cuilValidado
										: afiliadoSeleccionado.cuil
								}
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

            {!props.noDataForCuil && (
              <AfiliadoDetails
                config={{
                  data: afiliadoSeleccionado,
                  ddjj: ddjjUatreSeleccionado,
                  empresa: empresaSeleccionada,
                  seccional: seccionalSeleccionada,
                  tab: selectedTab,
                }}
              />
            )}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default AfiliadosLista;
