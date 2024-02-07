import { useSelector } from "react-redux";

/**
 * Clase de ayuda para verificar tareas
 */
export class TareasManager {
	#esAdmin;
	#tareas;

	/**
	 * Crea la clase verificadora de tareas
	 * @param {boolean} esAdmin true si posee control total
	 * @param {Array<string>} tareas tareas permitidas
	 */
	constructor(esAdmin, tareas) {
		this.#esAdmin = esAdmin;
		this.#tareas = tareas;
	}

	/**
	 * 
	 * @param {string} tarea tarea a verificar
	 * @returns {boolean} true es Admin o posee la tarea
	 */
	hasTarea(tarea) {
		if (this.#esAdmin) return true;
		return this.#tareas.find((t) => t.nombreTarea === tarea) != null;
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
		usuarioLogueado?.modulosTareas ?? []
	);
}
