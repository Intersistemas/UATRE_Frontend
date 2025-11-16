/**
 * Script de prueba para verificar el filtrado de denuncias por ámbito
 * Ejecutar en consola del navegador para probar la lógica
 */

// Datos de prueba que simulan la respuesta de la API de denuncias
const denunciasPrueba = [
  {
    id: 1,
    nombre: "Juan Pérez",
    fecha: "2024-11-01",
    derivadoATipo: "seccional",
    derivadoAId: 104169, // Seccional específica
    estado: "Pendiente"
  },
  {
    id: 2,
    nombre: "María García",
    fecha: "2024-11-02", 
    derivadoATipo: "delegacion",
    derivadoAId: 194, // Delegación Trenque Lauquen
    estado: "En proceso"
  },
  {
    id: 3,
    nombre: "Carlos López",
    fecha: "2024-11-03",
    derivadoATipo: "seccional", 
    derivadoAId: 999999, // Otra seccional diferente
    estado: "Resuelto"
  },
  {
    id: 4,
    nombre: "Ana Martínez",
    fecha: "2024-11-04",
    derivadoATipo: "seccional",
    derivadoAId: 104169, // Misma seccional que la primera
    estado: "Pendiente"
  }
];

// Función de prueba del filtrado
const probarFiltrado = async () => {
  console.log("🧪 Iniciando pruebas de filtrado de denuncias por ámbito");
  console.log("📊 Datos originales:", denunciasPrueba);

  // Importar la función de filtrado (ajustar la ruta según sea necesario)
  const { applyAmbitoFilter } = await import('./filtroAmbitoDenuncias.js');

  // Prueba 1: Usuario de seccional específica
  console.log("\n--- PRUEBA 1: Usuario de Seccional 104169 ---");
  const usuarioSeccional = { tipo: "seccional", id: 104169 };
  const resultadoSeccional = await applyAmbitoFilter(denunciasPrueba, usuarioSeccional);
  console.log(`✅ Filtrado seccional: ${resultadoSeccional.length} de ${denunciasPrueba.length} denuncias`);
  console.log("📋 Denuncias filtradas:", resultadoSeccional.map(d => `ID ${d.id}: ${d.nombre}`));

  // Prueba 2: Usuario de delegación (incluye todas sus seccionales)
  console.log("\n--- PRUEBA 2: Usuario de Delegación 194 ---");
  const usuarioDelegacion = { tipo: "delegacion", id: 194 };
  const resultadoDelegacion = await applyAmbitoFilter(denunciasPrueba, usuarioDelegacion);
  console.log(`✅ Filtrado delegación: ${resultadoDelegacion.length} de ${denunciasPrueba.length} denuncias`);
  console.log("📋 Denuncias filtradas:", resultadoDelegacion.map(d => `ID ${d.id}: ${d.nombre} (${d.derivadoATipo})`));

  // Prueba 3: Sin filtro (admin o usuario con acceso completo)
  console.log("\n--- PRUEBA 3: Sin filtro (null) ---");
  const resultadoSinFiltro = await applyAmbitoFilter(denunciasPrueba, null);
  console.log(`✅ Sin filtro: ${resultadoSinFiltro.length} de ${denunciasPrueba.length} denuncias`);

  console.log("\n🎯 Pruebas completadas");
};

// Función para probar en consola del navegador
window.probarFiltroDenuncias = probarFiltrado;

console.log("🔧 Script de prueba cargado. Ejecuta: probarFiltroDenuncias()");

export { probarFiltrado, denunciasPrueba };