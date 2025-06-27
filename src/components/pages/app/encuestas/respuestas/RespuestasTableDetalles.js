
import React from "react";
import Table from "components/ui/Table/Table"; 

const RespuestasTableDetalles = ({ columns: columnsInit = [], data = [], ...x } = {}) => {
  console.log("data RespuestasTableDetalles:", data);



const formattedData = data.map((respuestas) => ({
  tipoPregunta: respuestas.pregunta?.tipoPregunta || "-",
  enunciado: respuestas.pregunta?.enunciado || "Pregunta no disponible",
  valor: respuestas.valor,
}));





  const columns = [
    {
      headerTitle: () => "Tipo",
      dataField: "tipoPregunta",
      text: "Tipo",
      sort: true,
      headerStyle: () => ({ width: "3rem", textAlign: "center" }),
    },
    {
      headerTitle: () => "Pregunta",
      dataField: "enunciado",
      text: "Pregunta",
      sort: true, 
      headerStyle: () => ({ width: "10rem", textAlign: "center" }),
    },
    {
      headerTitle: () => "Respuesta",
      dataField: "valor",
      text: "Respuesta",
      sort: true,
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

export default RespuestasTableDetalles;
