import ReactDOM from "react-dom/client";
import React, { createRef } from "react";
import PDF_SolicitudAfiliacionHandler from "./PDF_SolicitudAfiliacionHandler";

/**
 * Genera un PDF y devuelve el Base64, con opción de descargarlo.
 * 
 * @param {object} options
 * @param {object|array} options.datos - Objeto o array con los datos del PDF
 * @param {boolean} [options.descargar=false] - Si debe descargar el PDF automáticamente
 * @param {string} [options.nombreArchivo="SolicitudAfiliacion.pdf"] - Nombre del archivo si se descarga
 * 
 * @returns {Promise<string>} - Base64 del PDF generado
 */
export const PDF_SolicitudAfiliacion_Base64 = async ({
  datos,
  descargar = false,
  nombreArchivo = "SolicitudAfiliacion.pdf",
}) => {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const ref = createRef();
    const root = ReactDOM.createRoot(container);

    const handleBase64 = (base64) => {
      resolve(base64);

      // Desmontar el componente del DOM
      setTimeout(() => {
        root.unmount();
        container.remove();
      }, 0);
    };

    root.render(
      <PDF_SolicitudAfiliacionHandler
        ref={ref}
        datos={datos}
        descargar={descargar}
        onBase64={handleBase64}
      />
    );

    // Esperamos al siguiente ciclo del render para generar el PDF
    setTimeout(() => {
      ref.current?.generarPDF(nombreArchivo);
    }, 0);
  });
};