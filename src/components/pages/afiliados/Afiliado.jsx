import { useEffect, useState } from "react";
import {  Await, useParams } from "react-router-dom";
import {
  Document,
  Page,
  PDFViewer,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import useHttp from "../../hooks/useHttp";
import FormatearFecha from "../../helpers/FormatearFecha";
import DocumentoPdf from "./DocumentoPdf";

const Afiliado = (props) => {
  const [empresa, setEmpresa] = useState({
    cuit: '',
    razonSocial: '',
    domicilioCalle: '',
    domicilioNumero: '',
    telefono: '',
    correo: '',
    lugarDeTrabajo: '',
    localidad: '',
    actividad: '',
    localidadDeTrabajo: ''

  });
  const [afiliado, setAfiliado] = useState({
    afipNombre: "",
    afipApellido: "",
    nacionalidad: "",
    estadoCivil: "",
    sexo: "",
    afipFechaNacimiento: "",
    provincia: "",
    afipTipoDocumento: "",
    afipNumeroDocumento: "",
    afipcuil: "",
    telefono: "",
    correo: "",
    puesto: "",
    actividad: "",
    afipDomicilioDireccion: "",
    cuit: "",
  });
  
  const { sendRequest: request } = useHttp();
  const { id } = useParams();
  const styles = StyleSheet.create({
    page: {
      display: "grid",
      backgroundColor: "white",
      borderRadius: "5px",
      padding: "24px",
      gridTemplateColumns: "1fr 1fr",
      columnGap: "16px",
    },
    titulo: {
      fontSize: "32px",
      fontWeight: "bold",
      gridColumn: "1/3",
      color: "#186090",
    },
    contenedor: {
      display: "grid",
      backgroundColor: "white",
      borderRadius: "5px",
      padding: "24px",
      gridTemplateColumns: "1fr 1fr",
      columnGap: "15px",
      maxHeight: "95vh",
      overflow: "scroll",
    },
    completo: {
      fontWeight: "bold",
      width: "100%",
      gridColumn: "1/3",
      textAlign: "start",
      color: "#186090",
      margin: "0 0px",
    },
    input: {
      border: "2px solid #186090",
      borderRadius: "5px",
      textAlign: "start",
      padding: "0 5px",
      fontWeight: 'bold'
    },
    inputCompleto: {
      border: "2px solid #186090",
      borderRadius: "5px",
      gridColumn: "1/3",
      textAlign: "start",
      padding: "0 5px",
      fontWeight: 'bold'
    },
    dividir: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      columnGap: "16px",
    },
    derechaDivididos: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gridColumn: "2/3",
    },
    nombre: {
      fontWeight: "bold",
      color: "#186090",
      textAlign: "start",
      margin: "0 0px",
    },
    nombreDer: {
      fontWeight: "bold",
      color: "#186090",
      textAlign: "start",
      margin: "0 8px",
    },
    subTitulo: {
      fontSize: "24px",
      fontWeight: "bold",
      gridColumn: "1/2",
      color: "#186090",
      textAlign: "start",
      padding: "8px",
      marginTop: "32px",
    },
    izquierdaDivididos: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      columnGap: "16px",
      gridColumn: "1/2",
    },
    TresCuartos: {
      fontWeight: "bold",
      color: "#186090",
      textAlign: "start",
      margin: "0px",
      gridColumn: "2/4",
      
    },
    inputTresCuartos: {
      border: "2px solid #186090",
      borderRadius: "5px",
      gridColumn: "2/4",
      textAlign: "start",
      padding: "0 5px",
      fontWeight: 'bold'
    },
  });
  
  useEffect(() => {
    const url = "http://intersistemas.net:8200/api/Afiliado";
    fetch(url)
      .then((respuesta) => {
        return respuesta.json();
      })
      .then((resultado) => {
        const {
          afipNombre,
          afipApellido,
          nacionalidad,
          estadoCivil,
          sexo,
          afipFechaNacimiento,
          provincia,
          afipTipoDocumento,
          afipNumeroDocumento,
          afipcuil,
          telefono,
          correo,
          puesto,
          actividad,
          afipDomicilioDireccion,
          cuit,
        } = resultado.data[id];
        
        setAfiliado({
          afipNombre,
          afipApellido,
          nacionalidad,
          estadoCivil,
          sexo,
          afipFechaNacimiento,
          provincia,
          afipTipoDocumento,
          afipNumeroDocumento,
          afipcuil,
          telefono,
          correo,
          puesto,
          actividad,
          afipDomicilioDireccion,
          cuit,
        });
        const fetchEmpresa =  (cuit) => {
          if ((cuit ?? 0) == 0) {
            setEmpresa(null);
            return;
          }
          request(
            {
              baseURL: "SIARU",
              endpoint: `/Empresas/${cuit}`,
              method: "GET",
            },
            async (response) =>  setEmpresa({
              cuit: response.cuit,
    razonSocial: response.razonSocial,
    domicilioCalle: response.domicilioCalle,
    domicilioNumero: response.domicilioNumero,
    telefono: response.telefono,
    correo: response.correo,
    lugarDeTrabajo: response.lugarDeTrabajo,
    localidad: response.localidad,
    actividad: response.actividad,
    localidadDeTrabajo: response.localidadDeTrabajo
            })
           
          );
        };
        
      
      fetchEmpresa(cuit)
      
      
       
      });
  }, []);
 
  return (
    <> 
      
      
     <DocumentoPdf styles={styles} afiliado={afiliado} empresa={empresa} />
    </>
  );
};

export default Afiliado;
