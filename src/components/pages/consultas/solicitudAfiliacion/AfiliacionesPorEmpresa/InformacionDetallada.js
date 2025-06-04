


import React, { useEffect, useState } from "react";
import Formato from "components/helpers/Formato";
import Grid from "components/ui/Grid/Grid";
import IM from "components/ui/Input/InputMaterial";
import styles from "./InformacionDetallada.module.css";
import dayjs from "dayjs";
import useTareasUsuario from "components/hooks/useTareasUsuario";

/** @type {IM} */
const InputMaterial = (p) => <IM variant="standard" size="small" {...p} />;

const InformacionDetallada = (props) => {

  console.log("config",props.config)
  const config = props.config;
  const data = config.data ?? {};
  const tab = config.tab ?? 0;
  const ddjj = config.ddjj ?? {};
  const empresa = config.empresa ?? {};
  const seccional = config.seccional ?? {};
  const [hotField, setHotField] = useState();
  const tareas = useTareasUsuario();

  const _ = require('lodash');
 
  const validar = (value) =>{

    
    if (value === "Empresa no existente") return "EMPRESA NO REGISTRADA";

    if (!value) return "";

    if (_.includes(value, "-") && _.includes(value, ":")){ //SI ES UNA FECHA
      return Formato.Fecha(value);
    }

    if (_.isString(value)){
      if (value.trim() === "") {
        return " ";
      } else return value;
    } 
 
    return value;
    /*if (_.isDate(value)){

      if (value === "0001-01-01T00:00:00") {
        return " ";
      } else return value;
    } */
  }

  useEffect(() => {
    switch (tab) {
      case 0:
        //#region  Tab 0 AFILIADOS
        setHotField(
          <Grid className={`${styles.fondo} ${styles.grupo}`} col>
            <Grid className={`${styles.contenido} ${styles.titulo}`} gap="1rem">
              <Grid>Información Detallada de solicitud:</Grid>
             
            </Grid>

            <Grid className={styles.grupo} col full>
              <Grid className={styles.contenido} col>
                {/* <Grid className={styles.titulo}>Datos AFIP:</Grid> */}
                <Grid>
                  {/* <InputMaterial label="CUIL"  value={Formato.Cuit(data.empresaCUIT) ?? "-"} />  */}
                   											
                  {/* <InputMaterial label="Razon Social Empresa" value={`${data.afipTipoDocumento ?? " "} ${Formato.DNI(data.afipNumeroDocumento) ?? "-"}`}/> */}
                  {/* <InputMaterial  label="Nombre de Seccional" width="87rem" value={validar(data.empresaRazonSocial)}/> */}
                   <InputMaterial  label="Nombre de Seccional" width="87rem" value={"-"}/>
                  <InputMaterial label="Estado Observaciones" value={validar(data.estadoSolicitudDescripcion)}/>		
                  {/* <InputMaterial label="Estado" value={validar(data.estadoSolicitudDescripcion)}/> */}
                  {/* <InputMaterial label="Tipo Clave" value={validar(data.afipTipoClave)} />	 */}
            
                </Grid>
                {/* <Grid>
                  <InputMaterial label="Estado Observaciones" value={validar(data.afipDomicilioDireccion)}/>
                  <InputMaterial label="Estado Fecha" value={validar(data.afipDomicilioDireccion)}/>	
                  <InputMaterial label="Localidad" value={validar(data.afipDomicilioLocalidad)}/>
                  <InputMaterial label="Estado Usuario" value={validar(data.afipDomicilioCodigoPostal)}/>
                  <InputMaterial label="Archivo PDF" value={validar(data.afipDomicilioProvincia)}/>
                  
                </Grid> */}
              </Grid>
            </Grid>
          </Grid>
        );
        //#endregion
        break;
      case 1:
        //#region  Tab  DDJJ UATRE
        setHotField(
          <Grid className={`${styles.fondo} ${styles.grupo}`} col>
            <Grid className={`${styles.contenido} ${styles.titulo}`} gap="1rem">
              <Grid>Informacion Detallada de DDJJUatre:</Grid>
              <Grid className={styles.data}>({validar(Formato.Cuit(data.cuil))}) {validar(data.nombre)} - Periodo: {Formato.Periodo(ddjj.periodo)}</Grid>
            </Grid>
            <Grid className={styles.grupo} col>
              <Grid className={styles.contenido} col>
                <Grid className={styles.titulo}>Empresa</Grid>
                <Grid> 
                  <InputMaterial label="CUIT" value={validar(Formato.Cuit(ddjj.cuit))}/>
                  <InputMaterial label="Razón Social" value={validar(ddjj.empresa)}/>
                  <InputMaterial label="Localidad" value={validar(empresa.localidadDescripcion)}/>
                  <InputMaterial label="Provincia" value={validar(empresa.provinciaDescripcion)}/>
                  <InputMaterial label="CIIU1" value={validar(empresa.ciiU1Descripcion)}/>
                  <InputMaterial label="CIIU2" value={validar(empresa.ciiU2Descripcion)}/>
                  <InputMaterial label="CIIU2" value={validar(empresa.ciiU3Descripcion)}/>
                  <InputMaterial label="Situación Rural" value={validar(ddjj.condicionRural)}/>
                </Grid>
                <Grid>
                  <InputMaterial label="Zona" value={validar(ddjj.zona)+" - "+validar(ddjj.zonaDescripcion)} />
                  <InputMaterial label="Modalidad de Contratación" value={validar(ddjj.modalidad)+" - "+validar(ddjj.modalidadDescripcion)}/>								
                  <InputMaterial label="Actividad" value={validar(ddjj.actividad) +" - "+validar(ddjj.actividadDescripcion)}/>
                  <InputMaterial label="Condición de CUIL" value={validar(ddjj.cuilCondicion)+" - "+validar(ddjj.cuilCondicionDescripcion)}/>
                </Grid>
                <Grid>
                  <InputMaterial label="Situación de CUIL" value={validar(ddjj.cuilSituacion)+" - "+validar(ddjj.cuilSituacionDescripcion)} />
                  <InputMaterial label="Siniestro" value={ddjj.siniestroCod == 1 ? "Activo" : "-"}/>	
                  <InputMaterial label="Reducción" value={validar(ddjj.reduccion)}/>							
                  { tareas.hasTarea("Afiliaciones_DDJJ_VerRemuneraciones") && <InputMaterial label="Importes" value={ddjj.esEmpresaRural == "No" || !ddjj.esEmpresaRural ? Formato.Moneda(validar(ddjj.remuneracionImponible)) : " "}/>}
                  <InputMaterial label="Cantidad Hs Extras" value={validar(ddjj.hsExtrasCantidad)}/>
                  <InputMaterial label="Dias Trabajados" value={validar(ddjj.diasTrabajados)}/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
        //#endregion}
        break;
      case 3:
        //#region  TAB 4 SECCIONAL
        setHotField(
          <Grid className={`${styles.fondo} ${styles.grupo}`} col width>
            <Grid className={styles.contenido} col width>
              <Grid className={styles.titulo}>Seccional de Afiliado: </Grid>
              <Grid width gap="15px">
                <Grid gap="10px">
                  <Grid className={styles.label}>CUIL:</Grid>
                  <Grid className={styles.data} width="9rem">{Formato.Cuit(data.cuil)}</Grid>
                </Grid>
                <Grid gap="10px" grow>
                  <Grid className={styles.label}>Nombre y Apellido:</Grid>
                  <Grid className={styles.data}>{data.nombre}</Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid className={styles.grupo} col>
              <Grid className={styles.contenido} col>
                <Grid className={styles.titulo}>Seccional:</Grid>
                <Grid width gap="5px">
                  <Grid className={styles.label} width="10rem">Código:</Grid>
                  <Grid className={styles.data}>{seccional.codigo}</Grid>
                  <Grid className={styles.label} width="10rem">Nombre:</Grid>
                  <Grid className={styles.data}>{seccional.descripcion}</Grid>
                  <Grid className={styles.label} width="10rem">Estado:</Grid>
                  <Grid className={styles.data}>{seccional.seccionalEstadoDescripcion}</Grid>
                </Grid>
                <Grid width gap="5px">
                  <Grid className={styles.label} width="10rem">Dirección:</Grid>
                  <Grid className={styles.data}>{seccional.domicilio}</Grid>
                  <Grid className={styles.label} width="10rem">Localidad:</Grid>
                  <Grid className={styles.data}>{seccional.localidadNombre}</Grid>
                  <Grid className={styles.label} width="10rem">Observaciones:</Grid>
                  <Grid className={styles.data}>{seccional.observaciones?.replace(/\*/g, " ")}</Grid>
                </Grid>
                <Grid width gap="5px">
                  <Grid className={styles.label} width="10rem">Delegación:</Grid>
                  <Grid className={styles.data}>{seccional.refDelegacionDescripcion}</Grid>
                  <Grid className={styles.label} width="10rem">Telefono:</Grid>
                  <Grid className={styles.data}>+54-113214578</Grid>
                  <Grid className={styles.label} width="10rem">Email:</Grid>
                  <Grid className={styles.data}>seccionaluatre@uatre.com</Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
        //#endregion
        break;
      default:
        setHotField()
        break;
    }
  }, [config ]);
/*, data, tab, ddjj, empresa*/
  
  return (
    <>
      {hotField}
    </>

  );
};

export default InformacionDetallada;
