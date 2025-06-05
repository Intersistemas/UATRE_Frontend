import { useState } from "react";
import useQueryQueue from "../../../../hooks/useQueryQueue";

const useCrearSolicitudAfiliacion = () => {
  const [loading, setLoading] = useState(false);
  const pushQuery = useQueryQueue((action, params) => {
    if (action === "crearSolicitud") {
      return {
        config: {
          baseURL: "Afiliaciones",
          endpoint: "/SolicitudAfiliacionEmpresas",
          method: "POST",
          headers: {
            "Content-Type": "application/json" 
          },
          body: params,   // <-- esto es lo que envías
        },
      };
    }
    return null;
  });

  const crearSolicitud = (data) => {
    setLoading(true);
    pushQuery({
      action: "crearSolicitud",
      params: data,  // <-- mandamos el objeto JSON
      onOk: (response) => {
        console.log("Solicitud creada con éxito", response);
        alert("Solicitud enviada con éxito!");
      },
      onError: (error) => {
        console.error("Error al crear solicitud", error);
        alert("Error al enviar solicitud");
      },
      onFinally: () => {
        setLoading(false);
      },
    });
  };

  return { crearSolicitud, loading };
};

export default useCrearSolicitudAfiliacion;
