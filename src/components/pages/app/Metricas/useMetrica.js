import { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import MetricaTable from "./MetricaTable";

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
};

const useMetrica = () => {
  const pushQuery = useQueryQueue((action) => {
    if (action === "GetList") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/AppMetricas",
        },
      };
    }
    return null;
  });

  const [list, setList] = useState({
    loading: null,
    remote: true,
    pagination: { index: 1, size: 10, total: 0 }, // 10 fijo
    data: [],
    error: null,
    selection: { ...selectionDef },
  });

  useEffect(() => {
    if (!list.loading) return;

    const changes = { loading: null, error: null };

    pushQuery({
      action: "GetList",
      params: {
        // Si tu API es 0-based cambiar a: (list.pagination.index - 1)
        pageIndex: list.pagination.index,
        pageSize: list.pagination.size, // siempre 10
      },
      onOk: async ({ data, count, ..._rest }) => {
        if (!Array.isArray(data)) {
          console.error("Se esperaba un arreglo", data);
          return;
        }
        changes.data = data;
        changes.pagination = {
          ...list.pagination,
          total: Number(count ?? 0),
        };
      },
      onError: async (error) => {
        if (error.code !== 404) changes.error = error;
      },
      onFinally: async () => setList((o) => ({ ...o, ...changes })),
    });
  }, [list.loading, list.pagination.index, list.pagination.size, pushQuery]);

  const request = useCallback((type, payload = {}) => {
    if (type === "list") {
      setList((o) => ({
        ...o,
        loading: "Cargando...",
        pagination: {
          ...o.pagination,
          index: payload.pagination?.index ?? o.pagination.index,
          size: 20, // forzamos 10 por página
        },
        data: [],
      }));
    }
  }, []);

  const render = () => (
    <MetricaTable
      data={list.data}
      loading={!!list.loading}
      noDataIndication={
        list.loading ?? list.error?.message ?? "No existen datos para mostrar"
      }
      pagination={{
        ...list.pagination,
        onChange: ({ index /*, size */ }) =>
          request("list", {
            // ignoramos size para mantener 10 fijo
            pagination: { index, size: 10 },
            data: list.remote ? [] : list.data,
          }),
      }}
    />
  );

  return {
    render,
    request,
    selected: list.selection.record,
  };
};

export default useMetrica;
