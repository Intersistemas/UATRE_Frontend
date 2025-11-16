/**
 * Ejemplo de cómo usar useDenuncias con filtrado por ámbito
 * Este archivo muestra cómo importar y usar la funcionalidad
 */

import React, { useContext } from 'react';
import useDenuncias from './useDenuncias';
import { applyAmbitoFilter } from './filtroAmbitoDenuncias';
import AuthContext from 'store/authContext';

const DenunciasPage = () => {
  const Usuario = useContext(AuthContext).usuario;

  // Configurar el ámbito del usuario basado en sus permisos
  // Esto debería venir del contexto de autenticación o props
  const usuarioAmbito = {
    // Ejemplo para usuario de seccional:
    tipo: "seccional",
    id: 104169, // ID de la seccional específica

    // Ejemplo para usuario de delegación:
    // tipo: "delegacion", 
    // id: 194, // ID de la delegación (mostrará denuncias de todas sus seccionales)
  };

  // Usar el hook con la función de filtrado
  const { render, request, selected } = useDenuncias({
    remote: true,
    pagination: { index: 1, size: 10 },
    usuarioAmbito: usuarioAmbito,
    applyAmbitoFilter: applyAmbitoFilter,
    hideSelectColumn: false,
    columns: (defaultColumns) => [
      ...defaultColumns,
      {
        dataField: "derivadoATipo",
        text: "Derivado A Tipo",
        sort: true,
        formatter: (cell) => {
          return (
            <span style={{
              backgroundColor: cell === 'seccional' ? '#e3f2fd' : '#f3e5f5',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {cell?.toUpperCase() || 'N/A'}
            </span>
          );
        }
      },
      {
        dataField: "derivadoAId",
        text: "Derivado A ID",
        sort: true,
        headerStyle: { width: "100px" },
        style: { textAlign: "center" },
      }
    ]
  });

  return (
    <div>
      <h2>Denuncias - Ámbito: {usuarioAmbito.tipo} ({usuarioAmbito.id})</h2>
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {usuarioAmbito.tipo === 'seccional' && (
          <p>📍 Mostrando denuncias derivadas únicamente a la seccional {usuarioAmbito.id}</p>
        )}
        {usuarioAmbito.tipo === 'delegacion' && (
          <p>🏢 Mostrando denuncias derivadas a la delegación {usuarioAmbito.id} y todas sus seccionales</p>
        )}
      </div>
      {render()}
    </div>
  );
};

export default DenunciasPage;

/**
 * CONFIGURACIÓN ADICIONAL NECESARIA:
 * 
 * 1. En tu AuthContext o donde manejes la autenticación, asegúrate de tener:
 *    - usuario.ambitoTipo: "seccional" | "delegacion" 
 *    - usuario.ambitoId: número del ID correspondiente
 * 
 * 2. Ejemplo de configuración dinámica basada en el usuario:
 * 
 * const obtenerAmbitoUsuario = (usuario) => {
 *   if (usuario.esSeccional) {
 *     return { tipo: "seccional", id: usuario.seccionalId };
 *   } else if (usuario.esDelegacion) {
 *     return { tipo: "delegacion", id: usuario.delegacionId };
 *   }
 *   return null; // Usuario con acceso completo, sin filtro
 * };
 * 
 * 3. Usar en el componente:
 * 
 * const usuarioAmbito = obtenerAmbitoUsuario(Usuario);
 * 
 * const { render } = useDenuncias({
 *   usuarioAmbito,
 *   applyAmbitoFilter,
 *   // ... otras props
 * });
 */