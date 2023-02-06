import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import styles from './AfiliadosLista.module.css'

const AfiliadosLista = (props) => {    
    const afiliados = { data: props.afiliados.data, totalRegs: props.afiliados.count, page: props.afiliados.index, sizePerPage: props.afiliados.size }
    
    console.log('afiliados', afiliados)
    const columns = [
        {
          dataField: "id",
          text: "Id",
        },
        {
          dataField: "cuil",
          text: "CUIL",
          sort: true
        },
        {
          dataField: "nombre",
          text: "Nombre"
        },
        {
            dataField: "actividad",
            text: "Actividad"
        },
        {
            dataField: "seccional",
            text: "Seccional"
        },
        {
            dataField: "puesto",
            text: "Puesto"
        }
      ];

     const handleTableChange = (type, { page, sizePerPage, filters, sortField, sortOrder, cellEdit }) => {
        const currentIndex = (page - 1) * sizePerPage;
      }
    
      const pagination = paginationFactory({
        page: afiliados.page,
        sizePerPage: afiliados.sizePerPage,
        totalSize: afiliados.totalRegs,
        lastPageText: '>>',
        firstPageText: '<<',
        nextPageText: '>',
        prePageText: '<',
        showTotal: true,
        alwaysShowAllBtns: true,
        //hideSizePerPage: true,
        onPageChange: function (page, sizePerPage) {
          console.log('page', page);
          console.log('sizePerPage', sizePerPage);
          props.onPageChange(page, sizePerPage)
        },
        onSizePerPageChange: function (page, sizePerPage) {
          console.log('page', page);
          console.log('sizePerPage', sizePerPage);
          props.onSizePerPageChange(sizePerPage, page)
        }
      });

    return (
        <div className={styles.div}> 
        <button onClick={props.onClickAfiliadoAgregar}>Nuevo Afiliado</button>       
        <BootstrapTable
            bootstrap4
            remote
            keyField="id"
            data={afiliados.data}
            columns={columns}
            pagination={pagination}
            onTableChange={ handleTableChange }
            //loading={props.loading}
            striped
            hover
            condensed
        />
        </div>
    )
}

export default AfiliadosLista;