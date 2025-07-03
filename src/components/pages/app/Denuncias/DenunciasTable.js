
import React from "react";
import AsArray from "components/helpers/AsArray";
import Table from "components/ui/Table/Table";
import FormatearFecha from "../../../helpers/FormatearFecha";
import download from "downloadjs";

const DenunciasTable = ({ columns, ...x } = {}) => {
  

  
  const handleDownload = async (imageBase64, rowIndex) => {
    if (!imageBase64) return;
  
    try {
      // Agregar encabezado si no existe
      const base64String = `data:image/jpeg;base64,${imageBase64}`;
  
      // Descargar la imagen
      download(base64String, `imagen_${rowIndex}.jpg`);
    } catch (error) {
      console.error("Error al descargar la imagen:", error);
    }
  };
  
  

  // Definimos las columnas de la tabla
  const columnsDef = [
    {
      dataField: "fecha",
      text: "Fecha",
      sort: true,
      formatter: (cell) => (cell ? FormatearFecha(cell) : "Fecha no disponible"),
    },
    {
      dataField: "nombre",
      text: "Nombre",
      sort: true,
    },
    {
      dataField: "correo",
      text: "Correo",
      sort: true,
    },
    {
      dataField: "provincia",
      text: "Provincia",
      sort: true,
    },
    {
      dataField: "localidad",
      text: "Localidad",
      sort: true,
    },
    {
      dataField: "foto",
      text: "Foto",
      sort: false,
      formatter: (cell, row, rowIndex) =>
        cell ? (
          <img
            src={`data:image/jpeg;base64,${cell}`} // Aseguramos el formato correcto
            alt=" "
            style={{
              width: 50,
              height: 50,
              borderRadius: 5,
              cursor: "pointer",
            }}
            onClick={() => handleDownload(cell, rowIndex)} // Descarga al hacer clic
          />
        ) : null,
      
    },
  ];

  return (
    <Table
      keyField="id"
      columns={
        typeof columns === "function"
          ? AsArray(columns(columnsDef.map((r) => ({ ...r }))), true)
          : Array.isArray(columns) && columns.length
          ? columns.map((r) => ({
              ...columnsDef.find((d) => d.dataField === r.dataField),
              ...r,
            }))
          : columnsDef
      }
      mostrarBuscar={false}
      {...x}
    />
  );
};

export default DenunciasTable;
