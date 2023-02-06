import React, {useState, useEffect} from 'react';
import useHttp from '../../hooks/useHttp';
import urlAPI from '../../api/apiSeguridad';
import AuthContext from '../../../store/authContext';
import Table from '../../ui/Table/Table';
import { Container } from "react-bootstrap";
import Button from '../../ui/Button/Button';
import classes from './Inicio.module.css'
import { useNavigate, NavLink  } from 'react-router-dom';
import Inicio from './Inicio'


const inicioHandler = () => {
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
          <Inicio/>

    </div>
  )
};

export default inicioHandler;