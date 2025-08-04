

import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SolicitudAfiliacion from "./SolicitudAfiliacion";

const datosSolicitudAfiliacion = {
  afiliado_nro: "1234",
  seccional_nro: "S0113",
  fecha: "2025-07-01",
  trabajador: {
    cuil: "20-39609744-4",
    tipo_doc: "39609744",
    nro_doc: "39609744",
    nacionalidad: "Argentino",
    apellido: "Altamirano",
    nombres: "Gaston German Estanislado",
    fecha_nacimiento: "1996-12-23",
    estado_civil: "",
    sexo: "Masculino",
    domicilio_real: "Dorrego juan jose numero: 158 Dpto:1",
    localidad: "Dorrego 158 Dpto:1",
    provincia: "Cordoba",
    oficio_categoria: "Contrato Modalidad Promovida. Reducc.",
    actividad: "Ref: Actividad inexistente",
    telefono: "",
    email: "GastonGermanEstanislado99@gmail.com",
  },
  empleador: {
    cuit: "30-50859713-0",
    nombre_o_razon_social: "Empresa de limpieza y orden para instalaciones S.A.",
    domicilio: "12 de Octubre 18",
    localidad: "Hernando",
    provincia: "Cordoba",
    actividad: "Cultivo de Soja",
    telefono: "4364563456437",
    email: "limpiezadeinstalacionessa@gmail.com",
  },
  fecha_emision: "2025-07-01",
};

const App = () => {
  const pdfRef = useRef();

  const generarPDF = () => {
    const input = pdfRef.current;

    html2canvas(input, {
      scale: 2,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("SolicitudAfiliacion.pdf");
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Generador de Solicitud de Afiliación</h2>
      <button onClick={generarPDF}>Generar PDF</button>

      <div
        style={{
          position: "absolute",
          left: "-9999px",
          width: "794px",
          height: "1123px",
          backgroundColor: "white",
        }}
      >
        <div ref={pdfRef}>
          <SolicitudAfiliacion datos={datosSolicitudAfiliacion} />
        </div>
      </div>
    </div>
  );
};

export default App;


// import React from "react";

// import SolicitudAfiliacion from "./SolicitudAfiliacion";
// import "./SolicitudAfiliacion.css";


// const datosTrabajador = {
//   cuil: "20-12345678-9",
//   tipoDoc: "DNI",
//   nroDoc: "12345678",
//   nacionalidad: "Argentina",
//   apellidos: "González",
//   nombres: "Juan Carlos",
//   nacimiento: "01/01/1990",
//   estadoCivil: "Soltero",
//   genero: "Masculino",
//   domicilio: "Av. Siempre Viva 742",
//   localidad: "Springfield",
//   provincia: "Buenos Aires",
//   oficio: "Electricista",
//   actividad: "Instalaciones eléctricas",
//   telefono: "3624-123456",
//   email: "juan@example.com",
// };


// const App = () => {


//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Generador de Solicitud de Afiliación</h2>
//       <SolicitudAfiliacion datos={datosTrabajador} />
//     </div>
//   );

// };

// export default App;
