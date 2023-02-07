import React, {useState, useEffect} from 'react';
import useHttp from '../../hooks/useHttp';
import urlAPI from '../../api/apiSeguridad';
import AuthContext from '../../../store/authContext';
import Table from '../../ui/Table/Table';
import { Container } from "react-bootstrap";
import Button from '../../ui/Button/Button';
import classes from './Inicio.module.css'
import { useNavigate, NavLink  } from 'react-router-dom';


const Inicio = (props) => {
  const empresas = {props};

  console.log('empresas: ,',empresas)
  const navigate = useNavigate();

  const { isLoading, error, sendRequest: getEmpresas} = useHttp();
  const [data, setData] = useState([]);

  //const [empresas, setEmpresas] = useState();

//   useEffect(() => {     
//     const processEmpresas = async (empresasObj) => {   
//       console.log('empresasObj:',empresasObj)
//       setEmpresas(empresasObj);   
               
//     };

//     getEmpresas({
//         url: urlAPI +'PermisosUsuario',
//         headers: {
//             Authorization: "",
//         }  
//     },processEmpresas);
// },[getEmpresas]);


const products = [
  {
    cuit: '30-36.654.346-9',
    razonsocial: 'Grupo Agrario Rio Negro',
    localidad: 'Rio Negro',
    domicilio: 'Ruta 25 Km 9'
  },
  {
    cuit: '30-21.424.321-9',
    razonsocial: 'Agricola Colosal',
    localidad: 'Buenos Aires',
    domicilio: 'Lopez y Planes 2500'
  },
  {
    cuit: '30-34.523.64-9',
    razonsocial: 'Agricola Colosal2',
    localidad: 'Buenos Aires',
    domicilio: 'Lopez y Planes 2500'
  },
   {
    cuit: '30-52.234.321-9',
    razonsocial: 'Agricola Colosal3',
    localidad: 'Buenos Aires',
    domicilio: 'Lopez y Planes 2500'
  }

];
const columns = [
  {
    dataField: 'cuit',
    text: 'CUIT'
  }, {
    dataField: 'razonsocial',
    text: 'Razón Social',
    sort: true
  }, {
    dataField: 'localidad',
    text: 'Localidad'
  }, {
    dataField: 'domicilio',
    text: 'Domicilio'
  }];


  return (

    
    <div>
          Inicio
      
          <Table
            products={ products}                                                                    
            columns={ columns}
           />
           
           <Button  width={25} onClick={() => navigate("/afiliaciones")}>Afiliaciones</Button>
          
          <p/>
          <Button  width={25}  onClick={() => navigate('/siaru')}>SIARU</Button>

    </div>
  )
};

export default Inicio;