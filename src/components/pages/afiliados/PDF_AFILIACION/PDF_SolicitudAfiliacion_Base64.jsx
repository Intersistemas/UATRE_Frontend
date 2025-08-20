import ReactDOM from "react-dom/client";
import React, { createRef, useState } from "react";
import PDF_SolicitudAfiliacionHandler from "./PDF_SolicitudAfiliacionHandler";

export const PDF_SolicitudAfiliacion_Base64 = async ({
  datos,
  descargar = false,
  nombreArchivo = "SolicitudAfiliacion.pdf",
  setBloqueActual = 1, // nuevo
  setTotalPaginas = 1, // nuevo
}) => {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const ref = createRef();
    const root = ReactDOM.createRoot(container);

    const handleBase64 = (base64) => {
      resolve(base64);

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
        setBloqueActual={setBloqueActual} // prop de progreso
        setTotalPaginas={setTotalPaginas} // prop de progreso
      />
    );

    const tryGenerate = () => {
      if (ref.current && typeof ref.current.generarPDF === "function") {
        ref.current
          .generarPDF(nombreArchivo)
          .catch((err) => reject(err));
      } else {
        setTimeout(tryGenerate, 50);
      }
    };

    tryGenerate();
  });
};
