
import React from "react";
import Table from "components/ui/Table/Table"; 
import FormatearFecha from "../../../../helpers/FormatearFecha";

const RespuestasTable = ({ columns: columnsInit = [], data = [], ...x } = {}) => {
  console.log("data respuestastable:", data);

  const formattedData = data.flatMap((respuestas) => ({
    afiliadoNro: respuestas.afiliadoNro,
    afiliadoNombre: respuestas.afiliadoNombre,
    afiliadoCUIL: respuestas.afiliadoCUIL,
    fecha: respuestas.fecha || null, 
  }));

  const columns = [
    {
      headerTitle: () => "Afiliado Nro",
      dataField: "afiliadoNro",
      text: "Afiliado Nro",
      sort: true,
      headerStyle: () => ({ width: "7rem", textAlign: "center" }),
    },
    {
      headerTitle: () => "Afiliado Nombre",
      dataField: "afiliadoNombre",
      text: "Nombre",
      sort: true,
      headerStyle: () => ({ width: "7rem", textAlign: "center" }),
    },
    {
      headerTitle: () => "Afiliado CUIL",
      dataField: "afiliadoCUIL",
      text: "CUIL",
      sort: true,
      headerStyle: () => ({ width: "7rem", textAlign: "center" }),
    },
    {
      
      headerTitle: () => "Fecha",
      dataField: "fecha",
      text: "Fecha respuesta",
      sort: true,
      formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
      headerStyle: () => ({ width: "10rem", textAlign: "center" }),
    },
  ];

  return (
    <Table
      keyField="afiliadoNro"
      columns={columns}
      data={formattedData}
      mostrarBuscar={false}
      {...x}
    />
  );
};

export default RespuestasTable;
