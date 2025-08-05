import React, { useRef, forwardRef, useImperativeHandle } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDF_SolicitudAfiliacion from "./PDF_SolicitudAfiliacion";

/**
 * @param {object} props.datos Se espera recibir un objeto con los datos necesarios para generar el PDF de Solicitud de Afiliación.
 * @param {object} props.datos.trabajador Información del trabajador.
 * @param {object} props.datos.empleador Información del empleador.
 **/

// OBJ de EJEMPLO Para generar el PDF de Solicitud de Afiliación
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


// OBJ de EJEMPLO Para generar el PDF de Solicitud de Afiliación
const datosInit = {
  afiliado_nro: " ",
  seccional_nro: " ",
  fecha: " ",
  trabajador: {
    cuil: " ",
    tipo_doc: " ",
    nro_doc: " ",
    nacionalidad: " ",
    apellido: " ",
    nombres: " ",
    fecha_nacimiento: " ",
    estado_civil: " ",
    sexo: " ",
    domicilio_real: " ",
    localidad: " ",
    provincia: " ",
    oficio_categoria: " ",
    actividad: " ",
    telefono: " ",
    email: " ",
  },
  empleador: {
    cuit: " ",
    nombre_o_razon_social: " ",
    domicilio: " ",
    localidad: " ",
    provincia: " ",
    actividad: " ",
    telefono: " ",
    email: " ",
  },
  fecha_emision: " ",
};

const PDF_SolicitudAfiliacionHandler = forwardRef(({ datos }, ref) => {
  const refs = useRef([]);

  // Normalizamos siempre a un array
  const listaDatos = Array.isArray(datos) ? datos : [datos];

  // Aplicamos valores por defecto
  const datosNormalizados = listaDatos.map((item) => ({
    ...datosInit,
    ...item,
    trabajador: {
      ...datosInit.trabajador,
      ...(item?.trabajador || {}),
    },
    empleador: {
      ...datosInit.empleador,
      ...(item?.empleador || {}),
    },
  }));

  useImperativeHandle(ref, () => ({
    async generarPDF() {
      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < refs.current.length; i++) {
        const element = refs.current[i];
        if (!element) continue;

        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      }

      pdf.save("SolicitudAfiliacion.pdf");
    },
  }));

  return (
    <div style={{ position: "absolute", left: "-9999px" }}>
      {datosNormalizados.map((dato, index) => (
        <div
          key={index}
          ref={(el) => (refs.current[index] = el)}
          style={{
            width: "794px",
            height: "1123px",
            backgroundColor: "white",
            marginBottom: "20px",
          }}
        >
          <PDF_SolicitudAfiliacion datos={dato} />
        </div>
      ))}
    </div>
  );
});

export default PDF_SolicitudAfiliacionHandler;

