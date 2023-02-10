import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import BootstrapTable from "react-bootstrap-table-next";
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
import { handleAfiliadoSeleccionar } from '../../../redux/actions';

const AfiliadosLista = (props) => {
  const dispatch = useDispatch();

  const afiliados = {
    data: props.afiliados.data,
    totalRegs: props.afiliados.count,
    page: props.afiliados.index,
    sizePerPage: props.afiliados.size,
  };

  //console.log('afiliados', afiliados)
  const columns = [
    {
      dataField: "cuil",
      text: "CUIL",
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
    },
    {
      dataField: "nroAfiliado",
      text: "Afiliado",
      headerStyle: (colum, colIndex) => {
        return { width: "5%", textAlign: "center" };
      },
    },
    {
      dataField: "fechaIngreso",
      text: "Fecha Ingreso",
      formatter: FormatearFecha,
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
    },
    {
      dataField: "nombre",
      text: "Nombre",
      headerStyle: (colum, colIndex) => {
        return { width: "15%", textAlign: "center" };
      },
    },
    {
      dataField: "actividad",
      text: "Actividad",
      headerStyle: (colum, colIndex) => {
        return { width: "15%", textAlign: "center" };
      },
    },
    {
      dataField: "seccional",
      text: "Seccional",
      headerStyle: (colum, colIndex) => {
        return { width: "15%", textAlign: "center" };
      },
    },
    {
      dataField: "puesto",
      text: "Puesto",
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
    },
    {
      dataField: "estadoSolicitud",
      Text: "Estado",
      //title: "Estado Solicitud",
      headerStyle: (colum, colIndex) => {
        return { width: "10%", textAlign: "center" };
      },
      filter: selectFilter({
        comparator: Comparator.EQ,
        options: props.estadosSolicitud,
        defaultValue: props.estadoSolicitudActual,
        className: "my-custom-text-filter",
        placeholder: "Seleccion Estado...",
        withoutEmptyOption: true,
      }),
    },
    {
      dataField: "empresa",
      text: "Empresa",
      headerStyle: (colum, colIndex) => {
        return { width: "15%", textAlign: "center" };
      },
    },
    {
      dataField: "documento",
      text: "Documento",
      headerStyle: (colum, colIndex) => {
        return { width: "8%", textAlign: "center" };
      },
    },
  ];

  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      console.log(`row: ${row}`);
      //handleSelectList(row);
      dispatch(handleAfiliadoSeleccionar(row));
    },
  };

  const handleTableChange = (
    type,
    { page, sizePerPage, filters, sortField, sortOrder, cellEdit }
  ) => {
    console.log(filters);
    const currentIndex = (page - 1) * sizePerPage;
    props.onFilterChange(filters);
  };

  const pagination = paginationFactory({
    page: afiliados.page,
    sizePerPage: afiliados.sizePerPage,
    totalSize: afiliados.totalRegs,
    lastPageText: ">>",
    firstPageText: "<<",
    nextPageText: ">",
    prePageText: "<",
    showTotal: true,
    alwaysShowAllBtns: true,
    hideSizePerPage: true,
    onPageChange: function (page, sizePerPage) {
      //console.log('page', page);
      //console.log('sizePerPage', sizePerPage);
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

  return (
    <div className={styles.div}>
      <Button width={20} onClick={props.onClickAfiliadoAgregar}>
        Agregar Afiliado
      </Button>
      <BootstrapTable
        bootstrap4
        remote
        keyField="id"
        loading={props.loading}
        data={afiliados.data}
        columns={columns}
        pagination={pagination}
        onTableChange={handleTableChange}
        filter={filterFactory()}
        striped
        hover
        condensed
        noDataIndication={indication}
        selectRow={selectRow}
        rowEvents={rowEvents}
      />
    </div>
  );
};

export default AfiliadosLista;
