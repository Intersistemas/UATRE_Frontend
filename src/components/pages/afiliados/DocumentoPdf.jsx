import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import React from 'react'
import FormatearFecha from '../../helpers/FormatearFecha'

const DocumentoPdf = (props) => {
  const { afiliado, empresa } = props

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
    empresaCUIT } = afiliado

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
  return (
    <Document style={styles.flex}>
      <Page size="a4" >
        <Text style={styles.titulo}>Constancia de Afiliación</Text>

        <View>
          <Text style={styles.subTitulo}>Datos Personales</Text>
        </View>

        <View>
          <Text style={styles.label} >Nombre Completo</Text>
          <Text style={styles.datos}>
            {nombre ? `$nombre} ` : "-"}
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
            {afiliado.afipFechaNacimiento ? FormatearFecha(afiliado.afipFechaNacimiento) : "-"}
          </Text>
          <Text style={styles.dosDatos}>
            {afiliado.provincia ? afiliado.provincia : "-"}
          </Text>
        </View>

        <View style={styles.dosLabel}>
          <Text style={styles.nombre10} >Tipo</Text>
          <Text style={styles.nombre40} >Número de Documento</Text>
          <Text style={styles.nombre2} >CUIL</Text>
        </View>

        <View style={styles.dosLabel}>
          <Text style={styles.datos10}>
            {afiliado.afipTipoDocumento ? afiliado.afipTipoDocumento : "-"}
          </Text>
          <Text style={styles.datos40}>
            {afiliado.afipNumeroDocumento ? afiliado.afipNumeroDocumento : "-"}
          </Text>
          <Text style={styles.dosDatos}>
            {afiliado.afipcuil ? afiliado.afipcuil : "-"}
          </Text>
        </View>

        <View style={styles.dosLabel}>
          <Text style={styles.nombre2} >Telefono/Celular</Text>
          <Text style={styles.nombre2} >Correo</Text>
        </View>

        <View style={styles.dosLabel}>
          <Text style={styles.dosDatos}>
            {afiliado.telefono ? afiliado.telefono : "-"}
          </Text>
          <Text style={styles.dosDatos}>
            {afiliado.correo ? afiliado.correo : "-"}
          </Text>
        </View>

        <View>
          <Text style={styles.label} >Oficio y Especialidad</Text>
          <Text style={styles.datos}>
            {afiliado.puesto ? afiliado.puesto : "-"}
          </Text>
        </View>

        <View>
          <Text style={styles.label} >Actividad que Desarrolla</Text>
          <Text style={styles.datos}>
            {afiliado.actividad ? afiliado.actividad : "-"}
          </Text>
        </View>

        <View>
          <Text style={styles.label} >Domicilio Real</Text>
          <Text style={styles.datos}>
            {afiliado.afipDomicilioDireccion ? afiliado.afipDomicilioDireccion : "-"}
          </Text>
        </View>

        <View>
          <Text style={styles.subTitulo}>Empleador</Text>
        </View>

        <View>
          <Text style={styles.label} >CUIT</Text>
          <Text style={styles.datos}>
            {empresa.cuit ? empresa.cuit : "-"}
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
  )
}

export default DocumentoPdf