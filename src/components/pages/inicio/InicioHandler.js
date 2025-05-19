import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Inicio from "./Inicio";
import { handleModuloSeleccionar } from "../../../redux/actions";
import AnuncioModal from "./AnuncioModal";
import AuthContext from "store/authContext";

const InicioHandler = () => {
  
    const dispatch = useDispatch();
    dispatch(handleModuloSeleccionar(""));
   

    //Obtengo los modulos del usuario logueado  
    const usuarioLogueado = useSelector(
      (state) => state.usuarioLogueado
    );
    
    const authContext = useContext(AuthContext)
    const Usuario = authContext.usuario;

    const [anuncio, setAnuncio] = React.useState(Usuario?.verAnuncio);

    let modulos = [];

    usuarioLogueado?.modulosTareas.forEach((mod) => {
      if (modulos.includes(mod.nombreModulo)) return;
      modulos.push(mod.nombreModulo);
    });

    
    return (
      <div>
        <Inicio modulos={modulos} tareas={usuarioLogueado?.modulosTareas} roles={usuarioLogueado?.roles}/>
        {anuncio && <AnuncioModal onClose={() => setAnuncio(false)}/>}
      </div>
    );
};

export default InicioHandler;
