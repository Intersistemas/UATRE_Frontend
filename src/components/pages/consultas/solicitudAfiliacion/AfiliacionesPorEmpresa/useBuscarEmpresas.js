import { useState } from "react";
import useQueryQueue from "../../../../hooks/useQueryQueue";

const useBuscarEmpresas = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const pushQuery = useQueryQueue((action, params) => {
    if (action === "buscarEmpresa") {
      return {
        config: {
          baseURL: "Comunes",
          endpoint: "/Empresas/GetEmpresasListSpecs",
          method: "GET",
        },
        params,
      };
    }
    return null;
  });

const buscarEmpresa = (busqueda) => {
  if (!busqueda) {
    setResultados([]);
    return;
  }

  setLoading(true);
  pushQuery({
    action: "buscarEmpresa",
    params: {}, // ahora sin filtros de cuit/razonSocial, traemos todo
    onOk: (response) => {
      const allResults = response.data || [];

      // Mejoro el filtro:
      const term = busqueda.toLowerCase().trim();

      let filtered;
      if (/^\d+$/.test(term)) {
        // Si es todo número --> buscar por CUIT exacto
        filtered = allResults.filter((item) => 
          item.cuit?.toString().includes(term)
        );
      } else {
        // Si es texto --> buscar por Razón Social
        filtered = allResults.filter((item) =>
          (item.razonSocial?.toLowerCase() ?? "").includes(term)
        );
      }

      setResultados(filtered);
    },
    onError: () => {
      setResultados([]);
    },
    onFinally: () => {
      setLoading(false);
    },
  });
};


  return { resultados, loading, buscarEmpresa };
};

export default useBuscarEmpresas;
