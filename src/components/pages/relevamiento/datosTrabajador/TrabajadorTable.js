
import React from "react";
import Table from "components/ui/Table/Table"; 
import FormatearFecha from "../../../helpers/FormatearFecha";
import Formato from "components/helpers/Formato";

const TrabajadorTable = ({ columns: columnsInit = [], data = [], ...x } = {}) => {
  console.log(" [TrabajadorTable] Datos recibidos:", data);
  console.log(" [TrabajadorTable] Cantidad de registros:", data?.length);

  // Los datos ya están en el formato correcto, no necesitamos flatMap
  // Solo verificamos que sea un array válido
  const formattedData = Array.isArray(data) ? data : [];
  
  console.log(" [TrabajadorTable] Datos formateados:", formattedData);

  const columns = [
    {
      headerTitle: () => "DNI",
      dataField: "dni",
      text: "DNI",
      sort: true,
      formatter: (cell) => Formato.DNI(cell),
      headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
      
    },
    {
      headerTitle: () => "Nombre",
      dataField: "nombre",
      text: "Nombre",
      sort: true,
      headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
    },
    {
      headerTitle: () => "Apellido",
      dataField: "apellido",
      text: "Apellido",
      sort: true,
      headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
    },
    {
      headerTitle: () => "Inicio Actividad",
      dataField: "inicioActividad",
      text: "Inicio Actividad",
      sort: true,
      formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
      headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
    },
    {
      headerTitle: () => "Sexo",
      dataField: "sexo",
      text: "Sexo",
      sort: true,
     headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
      formatter: (cell) => cell === "M" ? "Masculino" : cell === "F" ? "Femenino" : cell,
    },
    {
      headerTitle: () => "Email",
      dataField: "email",
      text: "Email",
      sort: true,
     headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
    },
    {
      headerTitle: () => "Afiliado",
      dataField: "afiliado",
      text: "Afiliado",
      sort: true,
    headerStyle: (colum, colIndex) => {
				return { width: "7rem", textAlign: "center" };
			},
			style: (cell, row, rowIndex, colIndex) => {
				return { textAlign: "left" };
			},
      formatter: (cell) => cell === "S" ? "Sí" : "No",
    },
  ];

  console.log(" [TrabajadorTable] Renderizando tabla con:", {
    formattedData,
    columns: columns.map(c => c.dataField),
    propsRecibidas: { data, ...x }
  });

  return (
    <Table
      keyField="id" // Usar 'id' en lugar de 'afiliadoNro'
      columns={columns}
      data={formattedData}
      mostrarBuscar={false}
      {...x}
    />
  );
};

export default TrabajadorTable;
