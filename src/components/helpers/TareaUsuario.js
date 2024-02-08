import React from "react";
import { useSelector } from "react-redux";

/**
 * Verifica si el usuario logueado posee determinada tarea
 * @deprecated usar useTareasUsuario en su lugar
 * @param {string} tarea tarea a verificar
 * @returns {boolean} true si el usuario posee la tarea
 */
export default function TareaUsuario(tarea) {

	const usuarioLogueado = useSelector(
		(state) => state.usuarioLogueado
	);

	//1_ Si el usuario tiene el ROL "Administrador", se concede el permiso:
	if (usuarioLogueado?.roles?.find((r) => r === "Administrador")) return true;

	//2_ Busco en las tareas del usuario
	let tareas = usuarioLogueado?.modulosTareas;
	let encuentraTarea = tareas.find((t) => t.nombreTarea === tarea) ? true : false

	return  encuentraTarea;
}

export function AsignarTareas(obj) {
	Object.keys(obj).forEach((k) => (obj[k] = TareaUsuario(k)));
}
