import { useEffect, useState } from "react";
import { Await, useParams } from "react-router-dom";
import {
  Document,
  Page,
  PDFViewer,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

import useHttp from "../../hooks/useHttp";
import FormatearFecha from "../../helpers/FormatearFecha";
import DocumentoPdf from "./DocumentoPdf";

const Afiliado = (props) => {
  const [empresa, setEmpresa] = useState({
    cuit: "",
    razonSocial: "",
    domicilioCalle: "",
    domicilioNumero: "",
    telefono: "",
    correo: "",
    lugarDeTrabajo: "",
    localidad: "",
    actividad: "",
    localidadDeTrabajo: "",
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
        const fetchEmpresa = (cuit) => {
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
            async (response) =>
              setEmpresa({
                cuit: response.cuit,
                razonSocial: response.razonSocial,
                domicilioCalle: response.domicilioCalle,
                domicilioNumero: response.domicilioNumero,
                telefono: response.telefono,
                correo: response.correo,
                lugarDeTrabajo: response.lugarDeTrabajo,
                localidad: response.localidad,
                actividad: response.actividad,
                localidadDeTrabajo: response.localidadDeTrabajo,
              })
          );
        };

        fetchEmpresa(cuit);
      });
  }, []);

  return (
    <>
      <PDFViewer style={{height:'90vh', width:'100%'}}>
        <DocumentoPdf afiliado={afiliado} empresa={empresa} />
      </PDFViewer>

     
    </>
  );
};

export default Afiliado;
