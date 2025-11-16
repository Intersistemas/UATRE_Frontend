

import React from "react";
import AsArray from "components/helpers/AsArray";
import Table from "components/ui/Table/Table";
import FormatearFecha from "../../../helpers/FormatearFecha";

const MetricaTable = ({ columns, ...props } = {}) => {
  const defaultColumns = [
    {
      dataField: "fecha",
      text: "Fecha",
      sort: true,
      formatter: (cell) =>
        cell ? FormatearFecha(cell) : "Fecha no disponible",
    },
    {
      dataField: "afiliadoNombre",
      text: "Nombre",
      sort: true,
    },
    {
      dataField: "afiliadoCUIL",
      text: "CUIL",
      sort: true,
    },
    {
      dataField: "afiliadoId",
      text: "Nº Afiliado",
      sort: true,
    },
    {
      dataField: "appOpcionesDescripcion",
      text: "Opción",
      sort: true,
    },
  ];

  const processedColumns =
    typeof columns === "function"
      ? AsArray(columns(defaultColumns.map((c) => ({ ...c }))), true)
      : Array.isArray(columns) && columns.length
      ? columns.map((col) => ({
          ...defaultColumns.find((def) => def.dataField === col.dataField),
          ...col,
        }))
      : defaultColumns;

  return (
    <Table
      keyField="id"
      columns={processedColumns}
      mostrarBuscar={false}
      {...props}
    />
  );
};

export default MetricaTable;
