import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Inicio from "./Inicio";
import { handleModuloSeleccionar } from "../../../redux/actions";

const InicioHandler = () => {
  
    const dispatch = useDispatch();
    dispatch(handleModuloSeleccionar(""));

    //Obtengo los modulos del usuario logueado  
    const usuarioLogueado = useSelector(
      (state) => state.usuarioLogueado
    );
    
    let modulos = [];
    let tareas = usuarioLogueado?.modulosTareas;
    usuarioLogueado?.modulosTareas.forEach((mod) => {
      if (modulos.includes(mod.nombreModulo)) return;
      modulos.push(mod.nombreModulo);
    });
    
    return (
      <div>
        {console.log('**modulos del usuario**',modulos)}
        <Inicio modulos={modulos} tareas={tareas} />
      </div>
    );
};

export default InicioHandler;
