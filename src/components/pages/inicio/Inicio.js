import React, {useState, useEffect} from 'react';
import useHttp from '../../hooks/useHttp';
import urlAPI from '../../api/apiSeguridad';
import AuthContext from '../../../store/authContext';
import Table from '../../ui/Table/Table';
import { Container } from "react-bootstrap";
import Button from '../../ui/Button/Button';
import classes from './Inicio.module.css'
import { useNavigate, NavLink  } from 'react-router-dom';
import { isAccordionItemSelected } from 'react-bootstrap/esm/AccordionContext';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { FaSignature } from 'react-icons/fa';
import  AfiliadosHandler from '../afiliados/AfiliadosHandler';
import Formato from '../../helpers/Formato';


const Inicio = (props) => {
  const empresas2 = props.empresas;

  const navigate = useNavigate();

  const { isLoading, error, sendRequest: getEmpresas} = useHttp();
  const [empresasSelected, setEmpresasSelected] = useState();

  
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


const empresas = [
  {
    cuit: 34618764356,
    razonsocial: 'HUAYRA SCA',
    localidad: 'Rio Negro',
    domicilio: 'AVELEYRA 338'
  },
  {
    cuit: 34617797587,
    razonsocial: 'LUISITO SA',
    localidad: 'Buenos Aires',
    domicilio: 'JUJUY 766'
  },
  {
    cuit: 34610675923,
    razonsocial: 'TAPE S.A.',
    localidad: 'Buenos Aires',
    domicilio: 'RODRIGUEZ PEÑA 616'
  },
   {
    cuit: 34560268019,
    razonsocial: 'ASOC COOP DE LA EEA MZA-I',
    localidad: 'Corrientes',
    domicilio: 'SAN MARTIN 3853'
  }
];


const columns2 = 
[
  {
    dataField: 'id',
    text: 'id',
    hide: true
  },
  {
    dataField: 'cuitEmpresa',
    text: 'CUIT'
  },
  {
    dataField: 'razonSocial',
    text: 'Razón Social'
  }, 
  {
    dataField: 'email',
    text: 'Email'
  }, 
  {
    dataField: 'telefono',
    text: 'Telefono'
  }, 
  {
    dataField: 'domicilio',
    text: 'Localidad'
  }
];

const columns3 = [
  {
    dataField: 'cuitEmpresa',
    text: 'CUIT'
  }, 
  {
    dataField: 'domicilio',
    text: 'Domicilio'
  }, 
  {
    dataField: 'email',
    text: 'Email'
  }, 
  {
    dataField: 'id',
    text: 'id',
    hide: true
  },
  {
    dataField: 'razonSocial',
    text: 'Razón Social'
  },

  {
    dataField: 'telefono',
    text: 'Telefono'
  }
];


const columns = [
  {
    dataField: 'cuit',
    text: 'CUIT',
		formatter: Formato.Cuit,
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

  const handleSeleccionEmpresa = (row) => {
    console.log('row_inicio: ', row);
    setEmpresasSelected(row);
  };

  let props2 = {
    keyField: "cuit",
    data: empresas,                                                                    
    columns: columns,
    onSelected: handleSeleccionEmpresa
  }


  const siaru = () =>{
    //<AfiliadosHandler/>
    navigate("/siaru")
  }
  
  return (

    
    <div>
          <h1 className='titulo'>Sistema Integral de UATRE</h1>
      
          <Table
                {...props2}
           />
           
           <Button  width={100} onClick={() => (navigate("/afiliaciones"))}>Afiliaciones</Button>
          
          <p/>
          <Button  width={100}  onClick={() => navigate('/siaru', {state: {cuit: empresasSelected?.cuit}})}>Sistema de Aportes Rurales de *{empresasSelected?.razonsocial}*</Button>

    </div>
  )
};

export default Inicio;