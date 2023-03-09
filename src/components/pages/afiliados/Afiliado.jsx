import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import styles from "./Afiliado.module.css";
import {
  Document,
  Page,
  PDFViewer,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { width } from "@mui/system";

const Afiliado = (props) => {
  const [afiliado, setAfiliado] = useState({
    nombre: "",
    apellido: "",
    cuit: "",
    fechaIngreso: "",
    nroAfiliado: "",
    actividad: "",
    seccional: "",
    puesto: "",
    estadoSolicitud: "",
    empresa: "",
    documento: "",
  });

  const { id } = useParams();

  const styles = StyleSheet.create({
    page: {
      display: "grid",
      backgroundColor: 'white',
      borderRadius: '5px',
      padding: '1.5rem',
      gridTemplateColumns: '1fr 1fr',
      columnGap: '1rem'
    },
    titulo: {
        fontSize: '2rem',
        fontWeight: 'bold',
        gridColumn: '1/3',
        color: 'var(--color1)'
    },
    contenedor: {
        display: "grid",
      backgroundColor: 'white',
      borderRadius: '5px',
      padding: '1.5rem',
      gridTemplateColumns: '1fr 1fr',
      columnGap: '1rem',
      maxHeight: '95vh',
      overflow: 'scroll'
    },
    completo: {
        fontWeight: 'bold',
        width: '100%',
        gridColumn: '1/3',
        textAlign: 'start',
        color: 'var(--color1)',
        margin: '0 0px'
    },
    input: {
        border: '2px solid var(--color1)',
        borderRadius: '5px',
        textAlign: 'start',
        padding: '0 5px'
    },
    inputCompleto: {
        border: '2px solid var(--color1)',
        borderRadius: '5px',
        gridColumn: '1/3',
        textAlign: 'start',
        padding: '0 5px'
        
    },
    dividir: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: '1rem'
    },
    derechaDivididos: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridColumn: '2/3',
        
    },
    nombre: {
        fontWeight: 'bold',
        color: 'var(--color1)',
        textAlign: 'start',
        margin: '0 0px'
    },
    subTitulo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        gridColumn: '1/2',
        color: 'var(--color1)',
        textAlign: 'start',
        padding: '0.5rem',
        marginTop: '2rem'
    },
    izquierdaDivididos:{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        columnGap: '1rem',
        gridColumn: '1/2',
    },
    TresCuartos: {
        fontWeight: 'bold',
        color: 'var(--color1)',
        textAlign: 'start',
        margin: '0 0px',
        gridColumn: '2/4',
    },
    inputTresCuartos: {
        border: '2px solid var(--color1)',
        borderRadius: '5px',
        gridColumn: '2/4'
    }
  });


  useEffect(() => {
    const url = "http://intersistemas.net:8200/api/Afiliado";
    fetch(url)
      .then((respuesta) => {
        return respuesta.json();
      })
      .then((resultado) => {
        console.log(resultado);
        const {
          afipNombre,
          afipApellido,
          afipcuil,
          fechaIngreso,
          nroAfiliado,
          actividad,
          estadoSolicitud,
          seccional,
          puesto,
          empresa,
          documento,
        } = resultado.data[id];

        setAfiliado({
          nombre: afipNombre,
          apellido: afipApellido,
          cuit: afipcuil,
          fechaIngreso: fechaIngreso,
          nroAfiliado: nroAfiliado,
          actividad: actividad,
          seccional: seccional,
          puesto: puesto,
          estadoSolicitud: estadoSolicitud,
          empresa: empresa,
          documento: documento,
        });
      });
  }, []);


  return (
    <>
      <div >
        {/* <nav>
                <Button className="botonBorder boton" width={20}>
                    <Link className={styles.boton} to={'/afiliaciones'}>Volver</Link>
                </Button>
            </nav>
          
            <PDFViewer style={{ width: "100%", height: "60vh", marginTop: "10px"}}>
            <Document className={styles.table}>
                    <Page style={{ display: 'flex', flexDirection: "row", width: "100vh"}}>
                    <View style={{width: "100%", textAlign:"center", fontSize: "20px"}}>
                            
                    <Text style={{ backgroundColor: "cornflowerblue" }}>Nombre</Text>
                                <Text>Apellido</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>CUIL</Text>
                                <Text>Fecha Ingreso</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>Numero Afiliado</Text>
                                <Text>Actividad</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>Seccional</Text>
                                <Text>Puesto</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>Estado Solicitud</Text>
                                <Text>Empresa</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>Documento</Text>
                                
                                </View>
                        <View style={{width: "100%", textAlign:"center", fontSize: "20px"}}>
                            
                                <Text style={{ backgroundColor: "cornflowerblue" }}>{afiliado.nombre ? afiliado.nombre : '-'}</Text>
                                <Text>{afiliado.apellido ? afiliado.apellido : '-'}</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>{afiliado.cuit ? afiliado.cuit : '-'}</Text>
                                <Text>{afiliado.fechaIngreso ? afiliado.fechaIngreso : '-'}</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>{afiliado.nroAfiliado ? afiliado.nroAfiliado : '-'}</Text>
                                <Text>{afiliado.actividad ? afiliado.actividad : '-'}</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>{afiliado.seccional ? afiliado.seccional : '-'}</Text>
                                <Text>{afiliado.puesto ? afiliado.puesto : '-'}</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>{afiliado.estadoSolicitud ? afiliado.estadoSolicitud : '-'}</Text>
                                <Text>{afiliado.empresa ? afiliado.empresa : '-'}</Text>
                                <Text style={{ backgroundColor: "cornflowerblue" }}>{afiliado.documento ? afiliado.documento : '-'}</Text>
                            
                        </View>
                        </Page>
                </Document>
                
            </PDFViewer> */}
      </div>

      <Document>
        <Page size="A4" style={styles.contenedor}>
        <Text style={styles.titulo} >Constancia de Afiliación</Text>
        <Text style={styles.subTitulo} >Datos Personales</Text>
          <Text style={styles.completo} >Nombre Completo</Text>
            <Text style={styles.input} >Nombre</Text>
            <Text style={styles.input} >Apellido</Text>
            <Text style={styles.nombre} >Nacionalidad</Text> 
            <View style={styles.derechaDivididos}>
            <Text style={styles.nombre} >Estado Civil</Text>
            <Text style={styles.nombre} >Genero</Text> 
            </View> 
            <Text style={styles.input} >Nacionalidad</Text>
            <View style={styles.dividir}>
            <Text style={styles.input} >Estado Civil</Text>
            <Text style={styles.input} >Genero</Text>
            </View>
            <Text style={styles.nombre} >Fecha de Nacimiento</Text>
            <Text style={styles.nombre} >Provincia</Text>
            <Text style={styles.input} >Fecha de Nacimiento</Text>
            <Text style={styles.input} >Provincia</Text>
            <View style={styles.izquierdaDivididos}>
            <Text style={styles.nombre} >Tipo</Text>
            <Text style={styles.TresCuartos} >Numero de Documento</Text>
            </View>
            <Text style={styles.nombre} >CUIL</Text>
            <View style={styles.izquierdaDivididos}>
            <Text style={styles.input} >Tipo</Text>
            <Text style={styles.inputTresCuartos} >Numero de Documento</Text>
            </View>
            <Text style={styles.input} >CUIL</Text>
            <Text style={styles.nombre} >Teléfono/Celular</Text>
            <Text style={styles.nombre} >Correo</Text>
            <Text style={styles.input} >Teléfono/Celular</Text>
            <Text style={styles.input} >Correo</Text>
            <Text style={styles.completo} >Oficio y especialidad</Text>
            <Text style={styles.inputCompleto} >Oficio y especialidad</Text>
            <Text style={styles.completo} >Actividad que desarrolla</Text>
            <Text style={styles.inputCompleto} >Actividad</Text>
            <Text style={styles.completo} >Domicilio real</Text>
            <Text style={styles.inputCompleto} >Domicilio</Text>
            <Text style={styles.subTitulo} >Empleador</Text>
            <Text style={styles.completo} >C.U.I.T</Text>
            <Text style={styles.input} >C.U.I.T</Text>
            <Text style={styles.completo} >Razón Social</Text>
            <Text style={styles.inputCompleto} >Razón Social</Text>
            <Text style={styles.nombre} >Domicilio</Text>
            <Text style={styles.nombre} >Localidad</Text>
            <Text style={styles.input} >Domicilio</Text>
            <Text style={styles.input} >Localidad</Text>

            <Text style={styles.nombre} >Telefono/Celular</Text>
            <Text style={styles.nombre} >Correo</Text>
            <Text style={styles.input} >Telefono/Celular</Text>
            <Text style={styles.input} >Correo</Text>

            <Text style={styles.nombre} >Lugar de Trabajo</Text>
            <Text style={styles.nombre} >Localidad</Text>
            <Text style={styles.input} >Lugar de Trabajo</Text>
            <Text style={styles.input} >Localidad</Text>

            <Text style={styles.completo} >Actividad</Text>
            <Text style={styles.inputCompleto} >Actividad</Text>
        </Page>
      </Document>
    </>
  );
};

export default Afiliado;
