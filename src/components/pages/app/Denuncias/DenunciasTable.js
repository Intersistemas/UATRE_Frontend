
import React, { useMemo } from "react";
import AsArray from "components/helpers/AsArray";
import Table from "components/ui/Table/Table";
import FormatearFecha from "../../../helpers/FormatearFecha";

const DenunciasTable = ({ columns, ...x } = {}) => {
  // Memoizar la data para evitar re-renders innecesarios
  const memoizedData = useMemo(() => x.data || [], [x.data]);
  
  console.log("🔍 DenunciasTable props:", { 
    columns: !!columns, 
    xKeys: Object.keys(x), 
    dataLength: memoizedData.length
  });

  // Definimos las columnas de la tabla
  const columnsDef = [
    {
      dataField: "fecha",
      text: "Fecha",
      sort: true,
      headerStyle: { width: "120px" },
      style: { textAlign: "center" },
      formatter: (cell) => {
        if (!cell) return "Sin fecha";
        try {
          return FormatearFecha(cell);
        } catch (error) {
          console.warn("Error formateando fecha:", cell, error);
          return String(cell);
        }
      },
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
      dataField: "estado",
      text: "Estado",
      sort: true,
      headerStyle: { width: "150px" },
      style: { textAlign: "center" },
      formatter: (cell, row) => {
        // Usar directamente el estado que viene en los datos de la fila
        // Esto evita las consultas múltiples a la API
        const estado = cell || row.estado || "Sin datos";
        
        // Aplicamos estilos según el estado
        const getEstadoStyle = (estado) => {
          const estadoLower = String(estado).toLowerCase();
          
          // Estilo especial para "Sin datos"
          if (estadoLower === 'sin datos') {
            return { 
              backgroundColor: '#fafafa', 
              color: '#9e9e9e', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '400',
              fontStyle: 'italic'
            };
          }
          
          if (estadoLower.includes('registrada')) {
            return { 
              backgroundColor: '#e3f2fd', 
              color: '#1976d2', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            };
          } else if (estadoLower.includes('completada')) {
            return { 
              backgroundColor: '#fff3e0', 
              color: '#f57c00', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            };
          } else if (estadoLower.includes('derivada')) {
            return { 
              backgroundColor: '#f3e5f5', 
              color: '#7b1fa2', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            };
          } else if (estadoLower.includes('planificacion')) {
            return { 
              backgroundColor: '#e8f5e8', 
              color: '#388e3c', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            };
          } else if (estadoLower.includes('gestion') && estadoLower.includes('empleador')) {
            return { 
              backgroundColor: '#fff8e1', 
              color: '#f57f17', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            };
          } else if (estadoLower.includes('inspeccionada')) {
            return { 
              backgroundColor: '#e8f5e8', 
              color: '#2e7d32', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            };
          } else if (estadoLower.includes('relevamiento')) {
            return { 
              backgroundColor: '#e1f5fe', 
              color: '#0277bd', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            };
          } else if (estadoLower.includes('finalizada')) {
            return { 
              backgroundColor: '#e8f5e8', 
              color: '#1b5e20', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            };
          } else {
            return { 
              backgroundColor: '#f5f5f5', 
              color: '#666', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            };
          }
        };
        
        return (
          <span style={getEstadoStyle(estado)}>
            {estado}
          </span>
        );
      },
    }
    
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
