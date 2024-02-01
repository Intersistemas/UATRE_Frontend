import React from "react";
import { useSelector } from "react-redux";


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


