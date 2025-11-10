
import React, { useContext, useState, useEffect } from "react";
import AsArray from "components/helpers/AsArray";
import Table from "components/ui/Table/Table";
import FormatearFecha from "../../../helpers/FormatearFecha";
import AuthContext from "store/authContext";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import useQueryQueue from "components/hooks/useQueryQueue";

const DenunciasTable = ({ columns, ...x } = {}) => {
  const { usuario } = useContext(AuthContext);
  const tareasManager = useTareasUsuario();
  const pushQuery = useQueryQueue((action) => {
    if (action === "GetTipoDenuncia") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/DenunciaTipo", // Base endpoint, el ID se añadirá dinámicamente
        },
      };
    }
    return null;
  });

  // Estado para cachear los tipos de denuncia
  const [tiposDenuncia, setTiposDenuncia] = useState({});
  const [cargandoTipos, setCargandoTipos] = useState(false);

  // Verificar si el usuario puede ver todos los datos
  const puedeVerTodosLosDatos = React.useMemo(() => {
    if (!usuario) {
      console.log(" Sin usuario - permisos denegados");
      return false;
    }
    
    // Verificar si es Administrador
    const esAdministrador = usuario.roles?.includes("Administrador");
    
    // Verificar si tiene la tarea "Denuncias_Datos"
    const tieneTareaDenunciasDatos = tareasManager.hasTarea("Denuncias_Datos");
    
    const resultado = esAdministrador || tieneTareaDenunciasDatos;
    
    console.log(" Verificación de permisos para tabla (ACTUALIZADA):", {
      timestamp: new Date().toLocaleTimeString(),
      esAdministrador,
      tieneTareaDenunciasDatos,
      puedeVerTodos: resultado,
      usuarioRoles: usuario.roles,
      tareasUsuario: usuario.modulosTareas?.map(t => t.nombreTarea),
      usuarioId: usuario.id || usuario.userId,
      cambioDetectado: "Recalcular permisos",
      tareasManagerInfo: {
        esAdminEnTareasManager: tareasManager.hasTarea("ANY_TASK") // Test si es admin general
      }
    });
    
    return resultado;
  }, [usuario, tareasManager]);

  // Función para obtener el tipo de denuncia
  const obtenerTipoDenuncia = React.useCallback((tipoId) => {
    if (!tipoId || tiposDenuncia[tipoId]) {
      return;
    }

    if (cargandoTipos) return;

    setCargandoTipos(true);
    
    console.log("🔍 Obteniendo tipo de denuncia:", { tipoId });
    
    // 🔧 Crear configuración dinámica con el ID en el endpoint
    const configDinamica = {
      baseURL: "App",
      method: "GET",
      endpoint: `/DenunciaTipo/${tipoId}`, // Endpoint completo con ID
    };
    
    pushQuery({
      action: "GetTipoDenuncia",
      config: configDinamica, // Usar configuración dinámica
      onOk: (response) => {
        console.log(" Respuesta del tipo de denuncia:", { tipoId, response });
        const descripcion = response?.descripcion || "Tipo desconocido";
        setTiposDenuncia(prev => ({
          ...prev,
          [tipoId]: descripcion
        }));
        setCargandoTipos(false);
      },
      onError: (error) => {
        console.error(" Error al obtener tipo de denuncia:", { tipoId, error });
        
        // Fallback: usar el ID como descripción si hay error
        setTiposDenuncia(prev => ({
          ...prev,
          [tipoId]: `Tipo ${tipoId}`
        }));
        setCargandoTipos(false);
      }
    });
  }, [tiposDenuncia, cargandoTipos, pushQuery]);

  // Effect para precargar los tipos de denuncia cuando cambian las props
  useEffect(() => {
    if (x.data && Array.isArray(x.data)) {
      console.log(" Datos de denuncias recibidos para tipos:", {
        totalRegistros: x.data.length,
        primerosRegistros: x.data.slice(0, 2).map(item => ({
          id: item.id,
          denunciaTipoId: item.denunciaTipoId,
          denunciaTipoIngresoId: item.denunciaTipoIngresoId,
          tipoId: item.tipoId,
          tipo: item.tipo
        }))
      });
      
      const tiposUnicos = [...new Set(x.data
        .map(item => item.denunciaTipoId || item.denunciaTipoIngresoId || item.tipoId)
        .filter(Boolean)
      )];
      
      console.log(" Tipos únicos encontrados:", tiposUnicos);
      
      tiposUnicos.forEach(tipoId => {
        if (!tiposDenuncia[tipoId] && !cargandoTipos) {
          obtenerTipoDenuncia(tipoId);
        }
      });
    }
  }, [x.data, tiposDenuncia, obtenerTipoDenuncia, cargandoTipos]);

  // Construir las columnas finales según los permisos del usuario
  const columnsDef = React.useMemo(() => {
    // Función helper para estilos de estado
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
          backgroundColor: '#f3e5f5', 
          color: '#7b1fa2', 
          padding: '4px 8px', 
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        };
      } else if (estadoLower.includes('derivada')) {
        return { 
          backgroundColor: '#fff8e1', 
          color: '#f57f17', 
          padding: '4px 8px', 
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        };
      } else if (estadoLower.includes('planificacion')) {
        return { 
         backgroundColor: '#fff8e1', 
          color: '#f57f17', 
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
          backgroundColor: '#fff8e1', 
          color: '#f57f17', 
          padding: '4px 8px', 
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        };
      } else if (estadoLower.includes('relevamiento')) {
        return { 
          backgroundColor: '#fff8e1', 
          color: '#f57f17', 
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

    if (puedeVerTodosLosDatos) {
      // USUARIOS CON PERMISOS COMPLETOS (Administrador o Denuncias_Datos)
      // Tabla: fecha, nombre, correo, teléfono, provincia, localidad, estado (sin tipo temporalmente)
      console.log(" Usuario con permisos completos - Mostrando: fecha, nombre, correo, teléfono, provincia, localidad, estado");
      
      return [
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
          dataField: "telefono",
          text: "Teléfono",
          sort: true,
          formatter: (cell, row) => {
            console.log(" Formateando teléfono (PERMISOS COMPLETOS):", { 
              cell, 
              telefonoContacto: row.telefonoContacto,
              telefono: row.telefono,
              rowCompleta: row
            });
            
            const telefono = cell || row.telefonoContacto || row.telefono;
            return telefono || "Sin teléfono";
          },
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
        // {
        //   dataField: "denunciaTipoId",
        //   text: "Tipo",
        //   sort: true,
        //   headerStyle: { width: "150px" },
        //   formatter: (cell, row) => {
        //     // Buscar el tipoId en diferentes campos posibles
        //     const tipoId = cell || row.denunciaTipoIngresoId || row.denunciaTipoId || row.tipoId;
        //     
        //     console.log(" Formateando tipo (PERMISOS COMPLETOS):", { 
        //       cell, 
        //       denunciaTipoIngresoId: row.denunciaTipoIngresoId,
        //       denunciaTipoId: row.denunciaTipoId,
        //       tipoId: row.tipoId,
        //       tipoIdFinal: tipoId,
        //       enCache: !!tiposDenuncia[tipoId],
        //       valorCache: tiposDenuncia[tipoId],
        //       rowCompleta: row
        //     });
        //     
        //     // Si ya tenemos una descripción directa en los datos, usarla
        //     if (row.tipoDescripcion || row.denunciaTipoDescripcion) {
        //       return row.tipoDescripcion || row.denunciaTipoDescripcion;
        //     }
        //     
        //     if (!tipoId) return "Sin tipo";
        //     
        //     const descripcion = tiposDenuncia[tipoId];
        //     if (descripcion) {
        //       return descripcion;
        //     }
        //     
        //     // Si no está en caché, intentar obtenerlo
        //     obtenerTipoDenuncia(tipoId);
        //     return "Cargando...";
        //   },
        // },
        {
          dataField: "estado",
          text: "Estado",
          sort: true,
          headerStyle: { width: "150px" },
          style: { textAlign: "center" },
          formatter: (cell, row) => {
            const estado = cell || row.estado || "Sin datos";
            
            return (
              <span style={getEstadoStyle(estado)}>
                {estado}
              </span>
            );
          },
        }
      ];
    } else {
      // USUARIOS CON PERMISOS LIMITADOS (sin rol Administrador ni tarea Denuncias_Datos)
      // Tabla: fecha, teléfono, localidad, estado (sin tipo temporalmente)
      console.log(" Usuario con permisos limitados - Mostrando: fecha, teléfono, localidad, estado");
      
      return [
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
          dataField: "telefono",
          text: "Teléfono",
          sort: true,
          formatter: (cell, row) => {
            console.log(" Formateando teléfono (PERMISOS LIMITADOS):", { 
              cell, 
              telefonoContacto: row.telefonoContacto,
              telefono: row.telefono,
              rowCompleta: row
            });
            
            const telefono = cell || row.telefonoContacto || row.telefono;
            return telefono || "Sin teléfono";
          },
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
            const estado = cell || row.estado || "Sin datos";
            
            return (
              <span style={getEstadoStyle(estado)}>
                {estado}
              </span>
            );
          },
        }
      ];
    }
  }, [puedeVerTodosLosDatos]);

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
