import { useSelector } from "react-redux";

/**
 * Clase de ayuda para verificar tareas
 */
export class TareasManager {
	#esAdmin;
	#tareas;
	#rolesAdmin;

	/**
	 * Crea la clase verificadora de tareas
	 * @param {boolean} esAdmin true si posee control total
	 * @param {Array<string>} tareas tareas permitidas
	 * @param {Array<string>} rolesAdmin Es administrador del modulo
	 */
	constructor(esAdmin, tareas, rolesAdmin) {
		this.#esAdmin = esAdmin;
		this.#tareas = tareas;
		this.#rolesAdmin = rolesAdmin;
	}

	/**
	 * 
	 * @param {string} tarea tarea a verificar
	 * @param {string} rol modulo sobre el cual verificar si es ADMIN
	 * @returns {boolean} true es Admin o posee la tarea
	 */
	hasTarea(tarea, rol) {


		if (this.#esAdmin) return true;

		if (rol && this.#rolesAdmin.find((t) => t.toUpperCase() === rol.toUpperCase())) return true;

		// Buscar la tarea por nombre (comparación robusta) y verificar que no esté marcada como eliminada
		return (
			this.#tareas.find((t) => {
				if (!t || !t.nombreTarea) return false;
				const nombre = String(t.nombreTarea).trim();
				const buscado = String(tarea).trim();
				const coincide = nombre.toLowerCase() === buscado.toLowerCase();
				const noEliminada = !t.deletedDate && !t.deletedBy && (t.deleted === undefined || t.deleted === false);
				return coincide && noEliminada;
			}) != null
		);
	}
}

/**
 * Hook para consulta de asignacion de tareas
 * @returns {TareasManager} objeto con el cual verificar si el usuario posee determinada tarea
 */
export default function useTareasUsuario() {
	const usuarioLogueado = useSelector((state) => state.usuarioLogueado);

	return new TareasManager(
		usuarioLogueado?.roles?.find((r) => r === "Administrador") ?? false,
		usuarioLogueado?.modulosTareas ?? [],
		usuarioLogueado?.roles,
	);
}
