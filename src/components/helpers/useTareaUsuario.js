/*
import React from "react";
import {useEffect, useState} from 'react';
import { useSelector } from "react-redux";


  
const useTareaUsuario = (tarea = "") => {
	
	const usuarioLogueado = useSelector(
		(state) => state.usuarioLogueado
	  );
	  
    let tareasRedux = usuarioLogueado?.modulosTareas;

	console.log('TareaUsuario_usuarioLogueado1')

	const [tareas, setTareas] = useState(tareasRedux);
	
	
	useEffect(() => {
		setTareas(tareasRedux)
	  }, [tareasRedux])

	let encuentraTarea = tareas.find((t) => t.nombreTarea === tarea) ?? false

	console.log('TareaUsuario_usuarioLogueado2',usuarioLogueado)
		
	return  encuentraTarea;
}
export default useTareaUsuario;


export function Decimal(numero) {
	if (numero == null || numero === "") return numero;
	numero = `${numero}`;
	let r = parseFloat(numero);
	if (isNaN(r)) return Decimal(numero.slice(0, numero.length - 2));
	return r;
}

class _Formato {
	Mascara = Mascara;
	Numero = Numero;
	Porcentaje = Porcentaje;
	Unidad = Unidad;
	Moneda = Moneda;
	Booleano = Booleano;
	Fecha = Fecha;
	Hora = Hora;
	FechaHora = FechaHora;
	Periodo = Periodo;
	Cuit = Cuit;
	Entero = Entero;
	Decimal = Decimal;
	DNI = DNI;
}

const Formato = new _Formato();

export default Formato;*/
