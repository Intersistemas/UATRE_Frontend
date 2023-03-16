import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { Button } from "react-bootstrap";

const styles = StyleSheet.create({

  titulo: {
    marginTop: '15px',
    fontSize: "32px",
    fontWeight: "bold",
    color: "black",
    textAlign: 'center'

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
  subTitulo: {
    fontSize: "24px",
    fontWeight: "bold",
    gridColumn: "1/2",
    color: "#186090",
    textAlign: "start",
    padding: "8px",
    marginTop: "20px",
  },
  flex: {
    display: 'flex',
    justifyContent: 'center',
    margin: '0',
    alignItems: 'start',

  },
  label: {
    fontWeight: "bold",
    color: "#3595D2",
    textAlign: "start",
    width: '97%',
    margin: '0 auto'


  },
  datos: {
    border: "2px solid #3595D2",
    borderRadius: "5px",
    textAlign: "start",
    width: '97%',
    paddingLeft: '5px',
    margin: '0 auto',
  },
  dosDatos: {
    width: '48%',
    border: "2px solid #3595D2",
    borderRadius: "5px",
    textAlign: "start",
    paddingLeft: '5px',
    margin: '0 auto'
  },
  dosLabel: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: '0 5px 0 5px'

  },
  nombre2: {
    width: '48%',
    textAlign: "start",
    fontWeight: "bold",
    color: "#3595D2",
    margin: '0 5px 0 5px'

  },
  nombre10: {
    width: '9%',
    textAlign: "start",
    fontWeight: "bold",
    color: "#3595D2",
    marginLeft: '5px'
  },
  nombre40: {
    width: '36%',
    textAlign: "start",
    fontWeight: "bold",
    color: "#3595D2",
    marginLeft: '5px'
  },
  datos10: {
    width: '10%',
    border: "2px solid #3595D2",
    borderRadius: "5px",
    textAlign: "start",
    paddingLeft: '5px',
    marginLeft: '5px'
  },
  datos40: {
    width: '37.5%',
    border: "2px solid #3595D2",
    borderRadius: "5px",
    textAlign: "start",
    paddingLeft: '5px',
    marginLeft: '9px'
  }

});

const Afiliado = (props) => {
  const navigate = useNavigate()
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

  });

  const { sendRequest: request } = useHttp();
  const { afiCuil } = useParams();

  const { nombre,
    nacionalidad,
    estadoCivil,
    sexo,
    afipFechaNacimiento,
    provincia,
    tipoDocumento,
    documento,
    cuil,
    telefono,
    correo,
    puesto,
    actividad,
    afipDomicilioDireccion,
    empresaCUIT, empresaId } = afiliado



  useEffect(async () => {
    const url = `http://svr-test:8200/api/Afiliado/GetAfiliadoByCUIL?CUIL=${afiCuil}`;
    const respuesta = await fetch(url)
    const data = await respuesta.json()
    const { nombre,
      nacionalidad,
      estadoCivil,
      sexo,
      afipFechaNacimiento,
      provincia,
      tipoDocumento,
      documento,
      cuil,
      telefono,
      correo,
      puesto,
      actividad,
      afipDomicilioDireccion,
      empresaCUIT, empresaId } = data
    setAfiliado({
      nombre,
      nacionalidad,
      estadoCivil,
      sexo,
      afipFechaNacimiento: FormatearFecha(afipFechaNacimiento),
      provincia,
      tipoDocumento,
      documento,
      cuil,
      telefono,
      correo,
      puesto,
      actividad,
      afipDomicilioDireccion,
      empresaCUIT
    })
    const respuestaEmpresa = await fetch(`http://svr-test:8202/api/Empresas/GetEmpresaById?id=${empresaId}`)
    const dataEmpresa = await respuestaEmpresa.json()
    console.log("empresa", dataEmpresa);
    const {
      cuit,
      razonSocialEmpr,
      domicilioCalleEmpr,
      domicilioNumeroEmpr,
      telefonoEmpr,
      correoEmpr,
      lugarDeTrabajoEmpr,
      localidadEmpr,
      actividadEmpr,
      localidadDeTrabajoEmpr,
    } = dataEmpresa
    setEmpresa({
      cuit: dataEmpresa.cuit,
      razonSocial: dataEmpresa.razonSocial,
      domicilioCalle: dataEmpresa.domicilioCalle,
      domicilioNumero: dataEmpresa.domicilioNumero,
      telefono: dataEmpresa.telefono,
      correo: dataEmpresa.correo,
      lugarDeTrabajo: dataEmpresa.lugarDeTrabajo,
      localidad: dataEmpresa.localidad,
      actividad: dataEmpresa.actividad,
      localidadDeTrabajo: dataEmpresa.localidadDeTrabajo,
    })
    return () => {
      console.log("exito");
    }
  }, [])


  const handleVolver = () => {
    navigate('/afiliaciones')
  }
  return (
    <>
      <PDFViewer style={{ height: '90vh', width: '100%' }}>
        <Document style={styles.flex}>
          <Page size="a4" >
            <Text style={styles.titulo}>Constancia de Afiliación</Text>

            <View>
              <Text style={styles.subTitulo}>Datos Personales</Text>
            </View>

            <View>
              <Text style={styles.label} >Nombre Completo</Text>
              <Text style={styles.datos}>
                {nombre ? nombre : "-"}
              </Text>
            </View>

            <View >
              <Text style={styles.label} >Nacionalidad</Text>
              <Text style={styles.datos}>
                {nacionalidad ? nacionalidad : "."}
              </Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.nombre2} >Estado Civil</Text>
              <Text style={styles.nombre2} >Género</Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.dosDatos}>
                {estadoCivil ? estadoCivil : "-"}
              </Text>
              <Text style={styles.dosDatos}>
                {sexo ? sexo : "-"}
              </Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.nombre2} >Fecha de Nacimiento</Text>
              <Text style={styles.nombre2} >Provincia</Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.dosDatos}>
                {afipFechaNacimiento ? afipFechaNacimiento : "-"}
              </Text>
              <Text style={styles.dosDatos}>
                {provincia ? provincia : "-"}
              </Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.nombre10} >Tipo</Text>
              <Text style={styles.nombre40} >Número de Documento</Text>
              <Text style={styles.nombre2} >CUIL</Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.datos10}>
                {tipoDocumento ? tipoDocumento : "-"}
              </Text>
              <Text style={styles.datos40}>
                {documento ? documento : "-"}
              </Text>
              <Text style={styles.dosDatos}>
                {cuil ? cuil : "-"}
              </Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.nombre2} >Telefono/Celular</Text>
              <Text style={styles.nombre2} >Correo</Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.dosDatos}>
                {telefono ? telefono : "-"}
              </Text>
              <Text style={styles.dosDatos}>
                {correo ? correo : "-"}
              </Text>
            </View>

            <View>
              <Text style={styles.label} >Oficio y Especialidad</Text>
              <Text style={styles.datos}>
                {puesto ? puesto : "-"}
              </Text>
            </View>

            <View>
              <Text style={styles.label} >Actividad que Desarrolla</Text>
              <Text style={styles.datos}>
                {actividad ? actividad : "-"}
              </Text>
            </View>

            <View>
              <Text style={styles.label} >Domicilio Real</Text>
              <Text style={styles.datos}>
                {afipDomicilioDireccion ? afipDomicilioDireccion : "-"}
              </Text>
            </View>

            <View>
              <Text style={styles.subTitulo}>Empleador</Text>
            </View>

            <View>
              <Text style={styles.label} >CUIT</Text>
              <Text style={styles.datos}>
                {empresaCUIT ? empresaCUIT : "-"}
              </Text>
            </View>
            <View>

              <Text style={styles.label} >Razón Social</Text>
              <Text style={styles.datos}>
                {empresa.razonSocial ? empresa.razonSocial : "-"}
              </Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.nombre2} >Domicilio</Text>
              <Text style={styles.nombre2} >Localidad</Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.dosDatos}>
                {empresa.domicilioCalle ? `${empresa.domicilioCalle} ${empresa.domicilioNumero}` : "-"}
              </Text>
              <Text style={styles.dosDatos}>
                {empresa.localidad ? empresa.localidad : "-"}
              </Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.nombre2} >Teléfono/Celular</Text>
              <Text style={styles.nombre2} >Correo</Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.dosDatos}>
                {empresa.telefono ? empresa.telefono : "-"}
              </Text>
              <Text style={styles.dosDatos}>
                {empresa.correo ? empresa.correo : "-"}
              </Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.nombre2} >Lugar de Trabajo</Text>
              <Text style={styles.nombre2} >Localidad</Text>
            </View>

            <View style={styles.dosLabel}>
              <Text style={styles.dosDatos}>
                {empresa.lugarDeTrabajo ? empresa.lugarDeTrabajo : "-"}
              </Text>
              <Text style={styles.dosDatos}>
                {empresa.localidad ? empresa.localidad : "-"}
              </Text>
            </View>

            <View>
              <Text style={styles.label} >Actividad</Text>
              <Text style={styles.datos}>
                {empresa.actividad ? empresa.actividad : "-"}
              </Text>
            </View>


          </Page>
        </Document>
      </PDFViewer>

      <Button onClick={handleVolver}>Volver</Button>
    </>
  );
};

export default Afiliado;
