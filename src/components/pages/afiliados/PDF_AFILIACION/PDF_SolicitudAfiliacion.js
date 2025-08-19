import React from "react";
import styles from "./PDF_SolicitudAfiliacion.module.css";
import { Logo1_sidebar, LogoCGT } from "media/mediaEnBase64";

const PDF_SolicitudAfiliacion = ({ datos }) => {
  const { trabajador, empleador } = datos;

  return (
    <div className={styles.body}>
      <div className={styles["pdf-header"]}>
        <div className={styles["header-left"]}>
          <div className={styles["logo-section"]}>
            <img src={Logo1_sidebar} alt="UATRE Logo" className={styles["logo-uatre"]} />
            <div className={styles["uatre-text"]}>
              <h1 className={styles["uatre-title"]}>UATRE</h1>
              <div className={styles["uatre-subtitle"]}>
                <p>Unión Argentina de</p>
                <p>Trabajadores Rurales</p>
                <p>y Estibadores</p>
              </div>
            </div>
            <img src={LogoCGT} alt="CGT Logo" className={styles["logo-cgt"]} />
          </div>
          <p className={styles["legal-text"]}>
            Personería Gremial Nº 155 - Adherida a la C.G.T - Reconquista 630 Cap. Fed.
          </p>
        </div>
        <div className={styles["header-center"]}>
          <h2 className={styles["document-title"]}>SOLICITUD DE </h2>
          <h2 className={styles["document-title"]}>AFILIACIÓN</h2>
        </div>
      </div>

      <div className={styles.campo1}>
        <div className={styles.subtitulo3}>
          Número de afiliado a completar una vez aprobada la solicitud
        </div>
        <div className={styles.centerNAfiliado}>
          <span className={styles.negrita}>AFILIADO Nº :</span>
          <span className={styles.containerCuad}>{datos.afiliado_nro}</span>
        </div>
      </div>

      <div className={styles.centerSeccional}>
        <div className={styles.centerNAfiliado}>
          <span className={styles.negrita}>SECCIONAL Nº-</span>
          <span className={styles.containerCuad}>{datos.seccional_nro}</span>
        </div>
        <div>FECHA: {datos.fecha}</div>
      </div>

      <div className={styles.campo3}>
        <p>
          Siendo un trabajador de la actividad y estando en total acuerdo con
          los estatutos del gremio, solicito mi afiliación al mismo y autorizo
          por la presente para que de mis haberes, el empleador me practique la
          retención de la cuota sindical como afiliado y según los montos que
          resuelva el Congreso de la UATRE, como así también cualquier otro
          aporte a la Organización dispuesto por autoridad competente y/u
          órganos naturales de la Institución (Resol 9/98 y 200/16 CNTA). Presto
          juramento de ley en relación a la veracidad de los datos que a
          continuación denuncio:
        </p>
      </div>

      <div className={styles.campo4}>
        <span className={styles.subtitulo3}>DATOS DEL TRABAJADOR</span>
      </div>

      <div className={styles.centerInput}>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>CUIL:</span>
          <span className={styles.autoPunto}>{trabajador.cuil}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>TIPO Y Nº DE DOC:</span>
          <span className={styles.autoPunto}>
            {trabajador.tipo_doc} {trabajador.nro_doc}
          </span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>NACIONALIDAD:</span>
          <span className={styles.autoPunto}>{trabajador.nacionalidad}</span>
        </div>
      </div>

      <div className={styles.centerInput}>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>APELLIDOS:</span>
          <span className={styles.autoPunto}>{trabajador.apellido}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>NOMBRES:</span>
          <span className={styles.autoPunto}>{trabajador.nombres}</span>
        </div>
      </div>
 
      <div className={styles.centerInput}>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>FECHA DE NACIMIENTO:</span>
          <span className={styles.autoPunto}>{trabajador.fecha_nacimiento}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>ESTADO CIVIL:</span>
          <span className={styles.autoPunto}>{trabajador.estado_civil}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>SEXO / GÉNERO:</span>
          <span className={styles.autoPunto}>{trabajador.sexo}</span>
        </div>
      </div>

      <div className={styles.centerInput}>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>DOMICILIO:</span>
          <span className={styles.autoPunto}>{trabajador.domicilio_real}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>LOCALIDAD:</span>
          <span className={styles.autoPunto}>{trabajador.localidad}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>PROVINCIA:</span>
          <span className={styles.autoPunto}>{trabajador.provincia}</span>
        </div>
      </div>

      <div className={styles.fila}>
          <span className={styles.label}>OFICIO / CATEGORÍA:</span>
          <span className={styles.inputCorto}>{trabajador.oficio_categoria}</span>

          <span className={styles.spacer}></span>

          <span className={styles.label}>ACTIVIDAD QUE DESARROLLA:</span>
          <span className={styles.inputLargo}>{trabajador.actividad}</span>

      </div>

      <div className={styles.centerInput}>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>TELÉFONO O CELULAR:</span>
          <span className={styles.autoPunto}>{trabajador.telefono}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>EMAIL:</span>
          <span className={styles.autoPunto}>{trabajador.email}</span>
        </div>
      </div>

      <div className={styles.firma}>
        <span className={styles.autoPuntoFirma}></span>
        <div>FIRMA DEL TRABAJADOR</div>
      </div>

      <div className={styles.campo4}>
        <span className={styles.subtitulo3}>DATOS DEL EMPLEADOR</span>
      </div>

      <div className={styles.fila}>
          <span className={styles.label}>CUIT:</span>
          <span className={styles.inputCorto}>{empleador.cuit}</span>
          
          <span className={styles.spacer}></span>

          <span className={styles.label}>NOMBRE O RAZÓN SOCIAL:</span>
          <span className={styles.inputLargo}>{empleador.nombre_o_razon_social}</span>
      </div>

      <div className={styles.centerInput}>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>DOMICILIO:</span>
          <span className={styles.autoPunto}>{empleador.domicilio}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>LOCALIDAD:</span>
          <span className={styles.autoPunto}>{empleador.localidad}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>PROVINCIA:</span>
          <span className={styles.autoPunto}>{empleador.provincia}</span>
        </div>
      </div>

      <div className={styles.centerInput}>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>ACTIVIDAD:</span>
          <span className={styles.autoPunto}>{empleador.actividad}</span>
        </div>
      </div>

      <div className={styles.centerInput}>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>TELÉFONO O CELULAR:</span>
          <span className={styles.autoPunto}>{empleador.telefono}</span>
        </div>
        <div className={styles.campo}>
          <span className={styles.inputTextoIngresado}>EMAIL:</span>
          <span className={styles.autoPunto}>{empleador.email}</span>
        </div>
      </div>

      <div className={styles.campo4}>
        <span className={styles.subtitulo3}>
          SE DEBERÁ ADJUNTAR FOTOCOPIA DEL RECIBO DE SUELDO (O Alta Temprana) Y DNI DEL TRABAJADOR
        </span>
      </div>

      <div className={styles.campo3}>
        <p>
          En mi rol de secretario general manifiesto en carácter de declaración jurada que los datos del trabajador
          son verdaderos y la solicitud fue efectuada por él mismo y en forma voluntaria. Expido la presente solicitud
          dando mi consentimiento al pedido requerido por el trabajador.
        </p>
      </div>

      <div className={styles.firmaInferior}>
        <div>Se extendió carnet el día: ............ / ............/ ...........</div>
        <div className={styles.firmaCenter}>
          <span className={styles.autoPunto}></span>
          <p className={styles.tamañoFirma}>SECRETARIO GENERAL DE SECCIONAL</p>
          <p className={styles.tamañoFirma2}>FIRMA Y ACLARACIÓN</p>
        </div>
      </div>

      <div className={styles.nota}>
        <span className={styles.negritaNOTA}>NOTA: </span>A LOS EFECTOS DE LA VALIDEZ LEGAL DE LA PRESENTE SOLICITUD, LA MISMA DEBE SER ACOMPAÑADA OBLIGATORIAMENTE
        CON FOTOCOPIA DEL DNI Y DEL ÚLTIMO RECIBO DE COBRO DEL SOLICITANTE, CASO CONTRARIO NO SERÁ ACEPTADA POR LAS
        AUTORIDADES DE LA U.A.T.R.E. LA COPIA DEBE SER REMITIDA POR LA SECCIONAL, LA CUAL SERÁ DEVUELTA FIRMADA
        POR LAS AUTORIDADES DE LA U.A.T.R.E. PARA ARCHIVO DE SECCIONAL.
      </div>
    </div>
  );
};

export default PDF_SolicitudAfiliacion;
