import React, {useState, useEffect,useContext} from 'react';
import useHttp from "../../hooks/useHttp";
import AuthContext from '../../../store/authContext';
import Inicio from './Inicio';
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from '../../../redux/actions';


const InicioHandler = () => {

  
  const dispatch = useDispatch();
  dispatch(handleModuloSeleccionar(""));

  const { isLoading, error, sendRequest: request} = useHttp();
  const [empresasRespuesta, setempresasRespuesta] = useState(null);
  const [usuario, setUsuario] = useState({});

  const authContext = useContext(AuthContext);
  
  useEffect(() => {

    setUsuario(authContext.usuario);
  
  },[]);

  useEffect(() => { 
    const processEmpresas = async (empresasObj) => {
        //console.log('empresasObj', empresasObj)
        setempresasRespuesta(empresasObj);              
    };

    request({ 
        baseURL: 'Seguridad',
        endpoint: "/PermisosUsuario",
        headers: {
          Authorization: true,
        },  
        method: 'GET',               
    },processEmpresas);
}, [request])

  /*
  const { isLoading, error, sendRequest: getEmpresas} = useHttp();
  const [data, setData] = useState([]);

  const [empresas, setEmpresas] = useState();

  useEffect(() => {     
    const processEmpresas = async (empresasObj) => {   
      console.log('empresasObj:',empresasObj)
      setEmpresas(empresasObj);   
               
    };

    getEmpresas({
        url: urlAPI +'getEmpre',
        headers: {
            Authorization: "",
        }  
    },processEmpresas);
},[getEmpresas]);*/


  return (

    <div>
          <Inicio usuario={usuario} empresas={empresasRespuesta} />

    </div>
  )

};

export default InicioHandler;