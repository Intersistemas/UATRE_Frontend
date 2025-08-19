import React, { useRef, forwardRef, useImperativeHandle } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDF_SolicitudAfiliacion from "./PDF_SolicitudAfiliacion";

const datosInit = {
  afiliado_nro: " ",
  seccional_nro: " ",
  fecha: " ... / ... / ...... ",
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
};

const PDF_SolicitudAfiliacionHandler = forwardRef(
  ({ datos, descargar = true, onBase64 = () => {}, setBloqueActual, setTotalPaginas }, ref) => {
    const refs = useRef([]);
    const listaDatos = Array.isArray(datos) ? datos : [datos];
    const chunkSize = 20; // tamaño de cada chunk para optimizar
    const datosNormalizados = listaDatos.map((item) => ({
      ...datosInit,
      ...item,
      trabajador: { ...datosInit.trabajador, ...(item?.trabajador || {}) },
      empleador: { ...datosInit.empleador, ...(item?.empleador || {}) },
    }));

    useImperativeHandle(ref, () => ({
      async generarPDF(nombreArchivo = "SolicitudAfiliacion.pdf") {
        try {
          const pdf = new jsPDF("p", "mm", "a4");

          const totalChunks = Math.ceil(datosNormalizados.length / chunkSize);
          if (setTotalPaginas) setTotalPaginas(totalChunks);
          if (setBloqueActual) setBloqueActual(0);

          for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const chunk = datosNormalizados.slice(
              chunkIndex * chunkSize,
              (chunkIndex + 1) * chunkSize
            );

            for (let i = 0; i < chunk.length; i++) {
              const index = chunkIndex * chunkSize + i;
              const element = refs.current[index];
              if (!element) continue;

              const canvas = await html2canvas(element, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: false,
              });

              const imgData = canvas.toDataURL("image/png");

              if (chunkIndex > 0 || i > 0) pdf.addPage();
              pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
            }

            // Actualizamos progreso
            if (setBloqueActual) setBloqueActual(chunkIndex + 1);

            // Pequeña pausa para que React refresque el estado y actualice el botón
            await new Promise((r) => setTimeout(r, 50));
          }

          const pdfOutput = pdf.output("datauristring");
          onBase64(pdfOutput);

          if (descargar) pdf.save(nombreArchivo);
        } catch (err) {
          console.error("Error generando PDF:", err);
          alert("No se generó correctamente el PDF.");
        }
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
  }
);

export default PDF_SolicitudAfiliacionHandler;