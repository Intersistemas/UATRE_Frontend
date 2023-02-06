import React, { useRef, useState } from "react";
import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import Modal from "../../ui/Modal/Modal";
import classes from "./AfiliadoAgregar.module.css";

const AfiliadoAgregar = (props) => {
    const [formularioValidado, setFormularioValidado] = useState(true);
    const [puesto, setPuesto] = useState(null);
    const [actividad, setActividad] = useState(null);
    const { datosAfiliadoAFIP } = props.datosAfiliadoAFIP != null ? props.datosAfiliadoAFIP : undefined
    
    //REFS
    const cuilInputRef = useRef();

    const afiliadoAgregarHandler = () => {
        console.log('cuil',cuilInputRef.current.value)
        const nuevoAfiliado =
            {
                cuil: cuilInputRef.current.value,
                secuencia: 0,
                nroAfiliado: 0,
                nombre: `${datosAfiliadoAFIP?.apellidoField} ${datosAfiliadoAFIP?.nombreField}` ,
                puestoId: puesto.Id,
                fechaIngreso: "2023-02-03T19:44:15.823Z",
                fechaEgreso: "2023-02-03T19:44:15.823Z",
                nacionalidadId: 5,
                nombreAnexo: "string",
                cuit: 0,
                seccionalId: 1239,
                sexoId: 8,
                dni: 0,
                actividadId: 87,
                estadoSolicitudId: 1,
                afipcuil: 0,
                afipFechaNacimiento: "2023-02-03T19:44:15.823Z",
                afipNombre: "string",
                afipApellido: "string",
                afipRazonSocial: "string",
                afipTipoDocumento: "string",
                afipNumeroDocumento: 0,
                afipTipoPersona: "string",
                afipTipoClave: "string",
                afipEstadoClave: "string",
                afipClaveInactivaAsociada: 0,
                afipFechaFallecimiento: "2023-02-03T19:44:15.823Z",
                afipFormaJuridica: "string",
                afipActividadPrincipal: "string",
                afipIdActividadPrincipal: 0,
                afipPeriodoActividadPrincipal: 0,
                afipFechaContratoSocial: "2023-02-03T19:44:15.823Z",
                afipMesCierre: 0,
                afipDomicilioDireccion: "string",
                afipDomicilioCalle: "string",
                afipDomicilioNumero: 0,
                afipDomicilioPiso: "string",
                afipDomicilioDepto: "string",
                afipDomicilioSector: "string",
                afipDomicilioTorre: "string",
                afipDomicilioManzana: "string",
                afipDomicilioLocalidad: "string",
                afipDomicilioProvincia: "string",
                afipDomicilioIdProvincia: 0,
                afipDomicilioCodigoPostal: 0,
                afipDomicilioTipo: "string",
                afipDomicilioEstado: "string",
                afipDomicilioDatoAdicional: "string",
                afipDomicilioTipoDatoAdicional: "string"
            }
        console.log('nuevoAfiliado',nuevoAfiliado)
        props.onAfiliadoAgregar(nuevoAfiliado)
    };  

    const validarAfiliadoCUILHandler = () => {
        console.log('cuil',cuilInputRef.current.value)
        props.onValidarCUIL(cuilInputRef.current.value)
    }

    return (
        <Modal onClose={props.onClose}>
            <h4>Nuevo Afiliado</h4>
            <div>
                <Input 
                    ref={cuilInputRef}
                    label="CUIL:" 
                    input={{            
                        id: 'inputCUIL',
                        type: 'text',                    
                        defaultValue: '00000000000',
                        value: props.datosAfiliadoAFIP?.idPersonaField
                    }}
                    
                />
                {/* <Button onClick={validarAfiliadoCUILHandler}>
                    ValidarCUIL
                </Button>               */}
                <button onClick={validarAfiliadoCUILHandler}>Validar CUIL</button>                
            </div>
            <div>
                <label>Nombre: {props.datosAfiliadoAFIP?.apellidoField} {props.datosAfiliadoAFIP.nombreField}
            </label></div>
            
            <div>
                {formularioValidado && <button className={classes.button} onClick={afiliadoAgregarHandler}>Agregar</button>}
                <button onClick={props.onClose}>Cerrar</button>
            </div>
        </Modal>
    );
};

export default AfiliadoAgregar;