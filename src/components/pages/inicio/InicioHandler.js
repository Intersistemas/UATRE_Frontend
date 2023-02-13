import React, {useState, useEffect} from 'react';
import useHttp from "../../hooks/useHttp";
import AuthContext from '../../../store/authContext';
import Inicio from './Inicio';

const InicioHandler = () => {

  const { isLoading, error, sendRequest: request} = useHttp();
  const [empresasRespuesta, setempresasRespuesta] = useState(null);

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
          <Inicio empresas={empresasRespuesta} />

    </div>
  )

};

export default InicioHandler;