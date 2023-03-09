import { useEffect, useState } from "react"
import { Button, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom"
import styles from './Afiliado.module.css'
import { Document, Page, PDFViewer, Text, View } from '@react-pdf/renderer'

const Afiliado = (props) => {

    const [afiliado, setAfiliado] = useState({
        nombre: '',
        apellido: '',
        cuit: '',
        fechaIngreso: '',
        nroAfiliado: '',
        actividad: '',
        seccional: '',
        puesto: '',
        estadoSolicitud: '',
        empresa: '',
        documento: ''
    })

    const { id } = useParams()


   


    useEffect(() => {
        const url = 'http://intersistemas.net:8200/api/Afiliado';
        fetch(url)
            .then((respuesta) => {
                return respuesta.json()
            })
            .then((resultado) => {


                console.log(resultado);
                const { afipNombre, afipApellido, afipcuil, fechaIngreso,
                    nroAfiliado, actividad, estadoSolicitud, seccional,
                    puesto, empresa, documento } = resultado.data[id]

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
                    documento: documento
                })

            })
    }, [])


    return (
        <>
            <nav>
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

            </PDFViewer>


        </>
    )
}

export default Afiliado