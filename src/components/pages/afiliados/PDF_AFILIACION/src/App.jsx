import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SolicitudAfiliacion from "./SolicitudAfiliacion";
import "./SolicitudAfiliacion.css";


const datosTrabajador = {
  cuil: "20-12345678-9",
  tipoDoc: "DNI",
  nroDoc: "12345678",
  nacionalidad: "Argentina",
  apellidos: "González",
  nombres: "Juan Carlos",
  nacimiento: "01/01/1990",
  estadoCivil: "Soltero",
  genero: "Masculino",
  domicilio: "Av. Siempre Viva 742",
  localidad: "Springfield",
  provincia: "Buenos Aires",
  oficio: "Electricista",
  actividad: "Instalaciones eléctricas",
  telefono: "3624-123456",
  email: "juan@example.com",
};


const App = () => {
  const pdfRef = useRef();

  const generarPDF = () => {
    const input = pdfRef.current;

    html2canvas(input, {
      scale: 2, // mejora resolución
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

      {/* Contenedor oculto con tamaño A4 exacto */}
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
          {/* <SolicitudAfiliacion /> */}
          <SolicitudAfiliacion datos={datosTrabajador} />
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
