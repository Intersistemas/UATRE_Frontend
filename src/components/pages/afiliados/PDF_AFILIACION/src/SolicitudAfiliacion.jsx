import React from "react";
import "./SolicitudAfiliacion.css";
import logo1 from "./image/Logo1_sidebar.png";
import logo2 from "./image/CGT_RA.png";

const SolicitudAfiliacion = ({ datos }) => {
  return (
    <div className="body">
      {/* <header className="containerPrincipalArriba">
        <div>
          <img className="logo" src={logo1} alt="Logo 1" />
          <img className="logo" src={logo2} alt="Logo 2" />
        </div>
        <div className="contenedorTextoPrincipal">
          <p className="TextPrincipal">SOLICITUD DE</p>
          <p className="TextPrincipal">AFILIACIÓN</p>
        </div>
      </header> */}
       <div className="pdf-header">
          <div className="header-left">
            <div className="logo-section">
              <img src={logo1} alt="UATRE Logo" className="logo-uatre" />
              <div className="uatre-text">
                <h1 className="uatre-title">UATRE</h1>
                <div className="uatre-subtitle">
                  <p>Unión Argentina de</p>
                  <p>Trabajadores Rurales</p>
                  <p>y Estibadores</p>
                </div>
              </div>
              <img src={logo2} alt="CGT Logo" className="logo-cgt" />
            </div>
            <p className="legal-text">
              Personería Gremial Nº 155 - Adherida a la C.G.T - Reconquista 630 Cap. Fed.
            </p>
          </div>
          <div className="header-center">
            <h2 className="document-title">SOLICITUD DE </h2>
            <h2 className="document-title">AFILIACIÓN</h2>
          </div>
        </div>
        {/* //////////////////////////////////////////////// */}

      <div className="campo1">
        <div className="subtitulo3">Numero de afiliado a completar una vez aprobada la solicitud</div>
        <div className="centerNAfiliado">
          <span className="negrita">AFILIADO Nº :</span> <span className="containerCuad"></span>
        </div>
      </div>

      <div className="centerSeccional">
       <div className="centerNAfiliado">
          <span className="negrita">SECCIONAL Nº-</span><span className="containerCuad"></span>
        </div>
        <div> FECHA: _____ / _____ / _____</div>
      </div>

      <div className="campo3">
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

      <div className="campo4">
        <span className="subtitulo3">DATOS DEL TRABAJADOR</span>
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">CUIL:</span> <span className="autoPunto">{datos.cuil}</span>
        </div>
        <div className="campo"> 
          <span className="inputTextoIngresado">TIPO Y Nº DE DOC:</span><span className="autoPunto">{datos.tipoDoc} {datos.nroDoc}</span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">NACIONALIDAD:</span><span className="autoPunto">{datos.nacionalidad}</span>
        </div>
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado"> APELLIDOS:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">NOMBRES:</span><span className="autoPunto"></span>
        </div>
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">FECHA DE NACIMIENTO:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">ESTADO CIVIL:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">SEXO / GÉNERO:</span><span className="autoPunto"></span>
        </div> 
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">DOMICILIO REAL:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">LOCALIDAD:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">PROVINCIA:</span><span className="autoPunto"></span>
        </div> 
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">OFICIO / CATEGORÍA:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">ACTIVIDAD QUE DESARROLLA:</span><span className="autoPunto"></span>
        </div>
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">TELÉFONO O CELULAR:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado" >EMAIL:</span><span className="autoPunto"></span>
        </div>
      </div>

      <div className="firma">
        <span className="autoPuntoFirma"></span>
        <div className="firma">FIRMA DEL TRABAJADOR</div>
      </div>

      <div className="campo4">
        <span className="subtitulo3">DATOS DEL EMPLEADOR</span>
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">CUIT:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">NOMBRE O RAZÓN SOCIAL:</span><span className="autoPunto"></span>
        </div>
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">DOMICILIO:</span><span className="autoPunto"></span>
        </div>
        <div className="campo"> 
          <span className="inputTextoIngresado">LOCALIDAD:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">PROVINCIA:</span><span className="autoPunto"></span>
        </div>
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">ACTIVIDAD:</span><span className="autoPunto"></span>
        </div>
      </div>

      <div className="centerInput">
        <div className="campo">
          <span className="inputTextoIngresado">TELÉFONO O CELULAR:</span><span className="autoPunto"></span>
        </div>
        <div className="campo">
          <span className="inputTextoIngresado">EMAIL:</span><span className="autoPunto"></span>
        </div>
      </div>

      <div className="campo4">
        <span className="subtitulo3">
          SE DEBERÁ ADJUNTAR FOTOCOPIA DEL RECIBO DE SUELDO (O Alta Temprana) Y DNI DEL TRABAJADOR
        </span>
      </div>

      <div className="campo3">
        <p>
          En mi rol de secretario general manifiesto en carácter de declaración jurada que los datos del trabajador
          son verdaderos y la solicitud fue efectuada por el mismo y en forma voluntaria. Expido la presente solicitud
          dando mi consentimiento al pedido requerido por el trabajador.
        </p>
      </div>

      <div className="firmaInferior">
        <div>Se extendió carnet el día: ............ / ............/ ...........</div>

        <div className="firmaCenter">
          <span className="autoPunto"></span>
          <p className="tamañoFirma">SECRETARIO GENERAL DE SECCIONAL</p>
          <p className="tamañoFirma2">FIRMA Y ACLARACIÓN</p>
        </div>
      </div>

      <div className="nota">
        <span className="negritaNOTA">NOTA: </span>A LOS EFECTOS DE LA VALIDEZ LEGAL DE LA PRESENTE SOLICITUD, LA MISMA DEBE SER ACOMPAÑADA OBLIGATORIAMENTE
        CON FOTOCOPIA DEL DNI Y DEL ÚLTIMO RECIBO DE COBRO DEL SOLICITANTE, CASO CONTRARIO NO SERÁ ACEPTADA POR LAS
        AUTORIDADES DE LA U.A.T.R.E. LA COPIA DEBE SER REMITIDA POR LA SECCIONAL, LA CUAL SERÁ DEVUELTA FIRMADA
        POR LAS AUTORIDADES DE LA U.A.T.R.E. PARA ARCHIVO DE SECCIONAL.
      </div>
    </div>
  );
};

export default SolicitudAfiliacion; 
