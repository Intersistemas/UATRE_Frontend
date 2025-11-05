/**
 * Funciones para filtrar denuncias según el ámbito del usuario
 * Considera derivadoATipo (seccional/delegacion) y derivadoAId
 */

import useQueryQueue from "components/hooks/useQueryQueue";

// Hook para obtener seccionales de una delegación
export const useSeccionales = () => {
  const pushQuery = useQueryQueue((action, params) => {
    switch (action) {
      case "GetSeccionales":
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: "/Seccional",
            method: "GET",
          },
        };
      default:
        return null;
    }
  });

  const getSeccionales = async () => {
    return new Promise((resolve, reject) => {
      pushQuery({
        action: "GetSeccionales",
        onOk: async (response) => {
          const data = Array.isArray(response) ? response : response?.data || [];
          resolve(data);
        },
        onError: async (error) => {
          console.error("Error obteniendo seccionales:", error);
          reject(error);
        },
      });
    });
  };

  return { getSeccionales };
};

// Cache para seccionales para evitar llamadas repetidas
let seccionalesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene todas las seccionales y las cachea temporalmente
 * En desarrollo usar la URL completa, en producción esto se debe hacer mediante baseURL
 */
export const obtenerSeccionales = async () => {
  const now = Date.now();
  
  // Usar cache si está disponible y no ha expirado
  if (seccionalesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log("🔄 Usando seccionales desde cache");
    return seccionalesCache;
  }

  try {
    // Para desarrollo: usar URL completa (luego cambiar por useQueryQueue en producción)
    console.log("🌐 Cargando seccionales desde API...");
    const response = await fetch('http://uatretest.intersistemas.net:8200/api/Seccional');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Normalizar respuesta (puede ser array directo o objeto con data)
    seccionalesCache = Array.isArray(data) ? data : data?.data || data?.items || [];
    cacheTimestamp = now;
    
    console.log(`📊 Seccionales cargadas: ${seccionalesCache.length} registros`);
    console.log("🔍 Primeras 3 seccionales:", seccionalesCache.slice(0, 3).map(s => 
      `${s.codigo} - ${s.descripcion} (Deleg: ${s.refDelegacionId})`
    ));
    
    return seccionalesCache;
  } catch (error) {
    console.error("❌ Error obteniendo seccionales:", error.message);
    // En caso de error, devolver array vacío
    seccionalesCache = [];
    cacheTimestamp = now;
    return [];
  }
};

/**
 * Filtra denuncias según el ámbito del usuario
 * @param {Array} denuncias - Array de denuncias desde la API
 * @param {Object} usuarioAmbito - Objeto con tipo y id del ámbito del usuario
 * @param {string} usuarioAmbito.tipo - "seccional" | "delegacion"
 * @param {number} usuarioAmbito.id - ID de la seccional o delegación
 * @returns {Promise<Array>} - Denuncias filtradas
 */
export const applyAmbitoFilter = async (denuncias, usuarioAmbito) => {
  if (!usuarioAmbito || !denuncias || !Array.isArray(denuncias)) {
    console.log("🚫 Sin filtro de ámbito - mostrando todas las denuncias");
    return denuncias;
  }

  const { tipo, id } = usuarioAmbito;
  
  console.log(`🔍 Aplicando filtro de ámbito: ${tipo} (ID: ${id}) sobre ${denuncias.length} denuncias`);

  try {
    if (tipo === "seccional") {
      // Para seccional: mostrar solo denuncias derivadas a esa seccional específica
      const denunciasFiltradas = denuncias.filter(denuncia => {
        // Probar diferentes formatos de campo
        const derivadoTipo = denuncia.derivadoATipo || denuncia.derivadoA_Tipo || denuncia.derivado_a_tipo;
        const derivadoId = denuncia.derivadoAId || denuncia.derivadoA_Id || denuncia.derivado_a_id;
        
        // Comparación case-insensitive - puede ser "Seccional", "seccional", "SECCIONAL", etc.
        const esParaSeccional = derivadoTipo && 
                               derivadoTipo.toLowerCase() === "seccional" && 
                               String(derivadoId) === String(id);
        
        if (esParaSeccional) {
          console.log(`✅ Denuncia ${denuncia.id} para seccional ${id}:`, {
            derivadoTipo,
            derivadoId,
            campoOriginal: {
              derivadoATipo: denuncia.derivadoATipo,
              derivadoAId: denuncia.derivadoAId
            }
          });
        }
        
        return esParaSeccional;
      });

      console.log(`🎯 Seccional ${id}: ${denunciasFiltradas.length} de ${denuncias.length} denuncias`);
      
      // Si no encontramos denuncias, mostrar todas las denuncias para debug
      if (denunciasFiltradas.length === 0) {
        console.log("⚠️ No se encontraron denuncias para la seccional. Campos disponibles:", 
          denuncias.slice(0, 5).map(d => Object.keys(d).filter(k => k.toLowerCase().includes('derivado')))
        );
      }
      
      return denunciasFiltradas;

    } else if (tipo === "delegacion") {
      // Para delegación: mostrar denuncias derivadas a la delegación + todas las de sus seccionales
      console.log(`🏛️ Filtrando por delegación ${id}...`);
      
      // 1. Denuncias derivadas directamente a la delegación
      const denunciasDelDelegacion = denuncias.filter(denuncia => {
        const derivadoTipo = denuncia.derivadoATipo || denuncia.derivadoA_Tipo || denuncia.derivado_a_tipo;
        const derivadoId = denuncia.derivadoAId || denuncia.derivadoA_Id || denuncia.derivado_a_id;
        
        return derivadoTipo && 
               derivadoTipo.toLowerCase() === "delegacion" && 
               String(derivadoId) === String(id);
      });

      // 2. Obtener todas las seccionales de esta delegación
      const todasLasSeccionales = await obtenerSeccionales();
      const seccionalesDeLaDelegacion = todasLasSeccionales.filter(seccional => 
        String(seccional.refDelegacionId) === String(id)
      );

      const idsSeccionalesDeLaDelegacion = seccionalesDeLaDelegacion.map(s => String(s.id));
      
      console.log(`🏢 Delegación ${id} tiene ${seccionalesDeLaDelegacion.length} seccionales`);

      // 3. Denuncias derivadas a cualquiera de las seccionales de esta delegación
      const denunciasDeLasSeccionales = denuncias.filter(denuncia => {
        const derivadoTipo = denuncia.derivadoATipo || denuncia.derivadoA_Tipo || denuncia.derivado_a_tipo;
        const derivadoId = denuncia.derivadoAId || denuncia.derivadoA_Id || denuncia.derivado_a_id;
        
        return derivadoTipo && 
               derivadoTipo.toLowerCase() === "seccional" && 
               idsSeccionalesDeLaDelegacion.includes(String(derivadoId));
      });

      // 4. Combinar ambos tipos de denuncias
      const todasLasDenuncias = [...denunciasDelDelegacion, ...denunciasDeLasSeccionales];
      
      // 5. Eliminar duplicados por ID
      const denunciasFiltradas = todasLasDenuncias.filter((denuncia, index, arr) => 
        arr.findIndex(d => d.id === denuncia.id) === index
      );

      console.log(`🎯 Delegación ${id}: ${denunciasFiltradas.length} denuncias (${denunciasDelDelegacion.length} directas + ${denunciasDeLasSeccionales.length} de seccionales)`);

      return denunciasFiltradas;
    } else {
      console.warn(`⚠️ Tipo de ámbito desconocido: ${tipo}`);
      return denuncias;
    }

  } catch (error) {
    console.error("❌ Error aplicando filtro de ámbito:", error);
    return denuncias; // En caso de error, devolver todas las denuncias
  }
};

/**
 * Función helper para limpiar el cache de seccionales
 */
export const limpiarCacheSeccionales = () => {
  seccionalesCache = null;
  cacheTimestamp = null;
  console.log("🗑️ Cache de seccionales limpiado");
};