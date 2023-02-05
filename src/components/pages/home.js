import React, {useState, useEffect} from 'react';
import useHttp from '../hooks/useHttp';
import urlAPI from '../api/apiSeguridad';
import AuthContext from '../../store/authContext';
import BootstrapTable from 'react-bootstrap-table-next';
import { Container,Button } from "react-bootstrap";


const Home = () => {
  const { isLoading, error, sendRequest: getEmpresas} = useHttp();
  const [data, setData] = useState([]);

  const [empresas, setEmpresas] = useState();

  useEffect(() => {     
    const processEmpresas = async (empresasObj) => {   
      console.log('empresasObj:',empresasObj)
      setEmpresas(empresasObj);   
               
    };

    getEmpresas({
        url: urlAPI +'PermisosUsuario',
        headers: {
            Authorization: "",
        }  
    },processEmpresas);
},[getEmpresas]);


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
  }


];
const columns = [
  {
    dataField: 'cuit',
    text: 'CUIT'
  }, {
    dataField: 'razonsocial',
    text: 'Razón Social'
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
      
          <BootstrapTable keyField='id'
           data={ products }
           columns={ columns }
           striped
            hover
            condensed
           />

          <Button>Afiliaciones</Button>
          <Button>SIARU</Button>

    </div>
  )
};

export default Home;