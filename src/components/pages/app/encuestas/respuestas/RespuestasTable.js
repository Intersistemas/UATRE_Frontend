// import React from "react";
// import Table from "components/ui/Table/Table";
// import FormatearFecha from "../../../../helpers/FormatearFecha";
// import AuthContext from "../../../../../store/authContext";


// const RespuestasTable = ({ columns: columnsInit = [], data = [], ...x } = {}) => {
  
//   console.log("data respuestastable:", data);
 



//   // Transformamos los datos para extraer solo los valores requeridos
//   const formattedData = data.flatMap((encuesta) =>
//     encuesta.preguntas.map((pregunta) => ({
//       id: pregunta.id,
//     //   fecha: encuesta.fecha,
// 		fecha: pregunta.createdDate,
//       tema: encuesta.tema,
//       tipoPregunta: pregunta.tipoPregunta, // Extraemos el tipo de pregunta
//       enunciado: pregunta.enunciado, // Extraemos el enunciado de la pregunta
//       detalles: pregunta.detalles.map((detalle) => detalle.texto).join(", "), // Mostramos solo los textos separados por coma
//     //   totalPreguntas: pregunta.detalles.length, // Contamos las preguntas en detalles
//     const { usuario: Usuario } = useContext(AuthContext);
  
//     }))
//   );

//   const columns = [
    
//     {
//       headerTitle: (column, colIndex) => `Fecha`,
//       dataField: "fecha",
//       text: "Fecha",
//       sort: true,
//       headerStyle: () => ({ width: "7rem", textAlign: "center" }),
//       formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
//     },
//     {
//       headerTitle: (column, colIndex) => `Tema`,
//       dataField: "tema",
//       text: "Encuesta",
//       sort: true,
//       headerStyle: () => ({ width: "7rem", textAlign: "center" }),
//     },
// 	{
// 		headerTitle: (column, colIndex) => "Enunciado",
// 		dataField: "enunciado",
// 		text: "Enunciado",
// 		sort: true,
// 		headerStyle: () => ({ width: "7rem", textAlign: "center" }),
// 	  },
//     {
//       headerTitle: (column, colIndex) => "Tipo de Pregunta",
//       dataField: "tipoPregunta",
//       text: "Tipo de Pregunta",
//       sort: true,
//       headerStyle: () => ({ width: "7rem", textAlign: "center" }),
//     },

//     {
//       headerTitle: (column, colIndex) => "Detalles",
//       dataField: "detalles",
//       text: "Detalles (Respuestas)",
//       sort: true,
//       headerStyle: () => ({ width: "15rem", textAlign: "center" }),
//     },

//     //usuario actual
//     {
//       headerTitle: (column, colIndex) => "Usuario",
//       dataField: "usuario",
//       text: "Usuario",
//       sort: true,
//       headerStyle: () => ({ width: "7rem", textAlign: "center" }),
//     },
//   ];

//   return (
//     <Table
//       keyField="id"
//       columns={columns}
//       data={formattedData} // Usamos los datos transformados
//       {...x}
//     />
//   );
// };

// export default RespuestasTable;


import React from "react";
import Table from "components/ui/Table/Table"; 

const RespuestasTable = ({ columns: columnsInit = [], data = [], ...x } = {}) => {
  // Mostramos en consola los datos recibidos para depuración
  console.log("data respuestastable:", data);

  // Transformamos los datos recibidos para adaptarlos al formato esperado por la tabla
  const formattedData = data.flatMap((respuestas) => ({
      afiliadoNro: respuestas.afiliadoNro, // Número de afiliado
      afiliadoNombre: respuestas.afiliadoNombre, // Nombre del afiliado
      afiliadoCUIL: respuestas.afiliadoCUIL, // CUIL del afiliado
    }));
    

  // Definimos las columnas que se mostrarán en la tabla
  const columns = [
    {
      headerTitle: (column, colIndex) => "Afiliado Nro", // Título del encabezado al pasar el mouse
      dataField: "afiliadoNro", // Campo de los datos que se mostrará en esta columna
      text: "Afiliado Nro", // Texto visible en el encabezado de la columna
      sort: true, // Habilitamos la opción de ordenar por esta columna
      headerStyle: () => ({ width: "7rem", textAlign: "center" }), // Estilo del encabezado
    },
    {
      headerTitle: (column, colIndex) => "Afiliado Nombre", 
      dataField: "afiliadoNombre", 
      text: "Nombre", 
      sort: true,
      headerStyle: () => ({ width: "7rem", textAlign: "center" }), 
    },
    {
      headerTitle: (column, colIndex) => "Afiliado CUIL", 
      dataField: "afiliadoCUIL", 
      text: "CUIL", 
      sort: true,
      headerStyle: () => ({ width: "7rem", textAlign: "center" }), 
    },
  ];

  // Renderizamos el componente de tabla con los datos y columnas configurados
  return (
    <Table
      keyField="afiliadoNro" // Clave única para identificar cada fila (usamos el número de afiliado)
      columns={columns} // Pasamos las columnas configuradas
      data={formattedData} // Pasamos los datos transformados
      {...x} // Pasamos cualquier otra propiedad adicional recibida
    />
  );
};

export default RespuestasTable; // Exportamos el componente para que pueda ser utilizado en otros lugares