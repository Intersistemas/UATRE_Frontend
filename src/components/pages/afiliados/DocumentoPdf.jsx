import { Document, Page, Text, View } from '@react-pdf/renderer'
import React from 'react'
import FormatearFecha from '../../helpers/FormatearFecha'

const DocumentoPdf = (props) => {
const {styles, afiliado, empresa} = props

  return (
    <Document>
        <Page size="A4" style={styles.contenedor}>
          <Text style={styles.titulo}>Constancia de Afiliación</Text>
          <Text style={styles.subTitulo}>Datos Personales</Text>
          <Text style={styles.completo}>Nombre Completo</Text>
          <Text style={styles.input}>
            {afiliado.afipNombre ? afiliado.afipNombre : "-"}
          </Text>
          <Text style={styles.input}>
            {afiliado.afipApellido ? afiliado.afipApellido : "-"}
          </Text>
          <Text style={styles.nombre}>Nacionalidad</Text>
          <View style={styles.derechaDivididos}>
            <Text style={styles.nombre}>Estado Civil</Text>
            <Text style={styles.nombreDer}>Genero</Text>
          </View>
          <Text style={styles.input}>
            {afiliado.nacionalidad ? afiliado.nacionalidad : "."}
          </Text>
          <View style={styles.dividir}>
            <Text style={styles.input}>
              {afiliado.estadoCivil ? afiliado.estadoCivil : "-"}
            </Text>
            <Text style={styles.input}>
              {afiliado.sexo ? afiliado.sexo : "-"}
            </Text>
          </View>
          <Text style={styles.nombre}>Fecha de Nacimiento</Text>
          <Text style={styles.nombre}>Provincia</Text>
          <Text style={styles.input}>
            {afiliado.afipFechaNacimiento
              ? FormatearFecha(afiliado.afipFechaNacimiento)
              : "-"}
          </Text>
          <Text style={styles.input}>
            {afiliado.provincia ? afiliado.provincia : "-"}
          </Text>
          <View style={styles.izquierdaDivididos}>
            <Text style={styles.nombre}>Tipo</Text>
            <Text style={styles.TresCuartos}>Numero de Documento</Text>
          </View>
          <Text style={styles.nombre}>CUIL</Text>
          <View style={styles.izquierdaDivididos}>
            <Text style={styles.input}>
              {afiliado.afipTipoDocumento ? afiliado.afipTipoDocumento : "-"}
            </Text>
            <Text style={styles.inputTresCuartos}>
              {afiliado.afipNumeroDocumento
                ? afiliado.afipNumeroDocumento
                : "-"}
            </Text>
          </View>
          <Text style={styles.input}>
            {afiliado.afipcuil ? afiliado.afipcuil : "-"}
          </Text>
          <Text style={styles.nombre}>Teléfono/Celular</Text>
          <Text style={styles.nombre}>Correo</Text>
          <Text style={styles.input}>
            {afiliado.telefono ? afiliado.telefono : "-"}
          </Text>
          <Text style={styles.input}>
            {afiliado.correo ? afiliado.correo : "-"}
          </Text>
          <Text style={styles.completo}>Oficio y especialidad</Text>
          <Text style={styles.inputCompleto}>
            {afiliado.puesto ? afiliado.puesto : "-"}
          </Text>
          <Text style={styles.completo}>Actividad que desarrolla</Text>
          <Text style={styles.inputCompleto}>
            {afiliado.actividad ? afiliado.actividad : "-"}
          </Text>
          <Text style={styles.completo}>Domicilio real</Text>
          <Text style={styles.inputCompleto}>
            {afiliado.afipDomicilioDireccion
              ? afiliado.afipDomicilioDireccion
              : "-"}
          </Text>
          <Text style={styles.subTitulo}>Empleador</Text>
          <Text style={styles.completo}>C.U.I.T</Text>
          <Text style={styles.input}>{empresa.cuit ? empresa.cuit : '-'}</Text>
          <Text style={styles.completo}>Razón Social</Text>
          <Text style={styles.inputCompleto}>{empresa.razonSocial ? empresa.razonSocial : '-'}</Text>
          <Text style={styles.nombre}>Domicilio</Text>
          <Text style={styles.nombre}>Localidad</Text>
          <Text style={styles.input}>{empresa.domicilioCalle ? `${empresa.domicilioCalle} ${empresa.domicilioNumero} ` : '-'}</Text>
          <Text style={styles.input}>{empresa.localidad ? empresa.localidad : '-'}</Text>

          <Text style={styles.nombre}>Telefono/Celular</Text>
          <Text style={styles.nombre}>Correo</Text>
          <Text style={styles.input}>{empresa.telefono ? empresa.telefono : '-'}</Text>
          <Text style={styles.input}>{empresa.correo ? empresa.corre : '-'}</Text>

          <Text style={styles.nombre}>Lugar de Trabajo</Text>
          <Text style={styles.nombre}>Localidad</Text>
          <Text style={styles.input}>{empresa.lugarDeTrabajo ? empresa.lugarDeTrabajo : '-'}</Text>
          <Text style={styles.input}>{empresa.localidadDeTrabajo ? empresa.localidadDeTrabajo : '-'}</Text>

          <Text style={styles.completo}>Actividad</Text>
          <Text style={styles.inputCompleto}>{empresa.actividad ? empresa.actividad : '-'}</Text>
        </Page>
      </Document>
  )
}

export default DocumentoPdf