
import { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AsArray from "components/helpers/AsArray";
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
    pagination: { index: 1, size: 10 },
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
        pageIndex: list.pagination.index,
        pageSize: list.pagination.size,
      },
      onOk: async ({ data, count, ...pagination }) => {
        if (!Array.isArray(data)) {
          console.error("Se esperaba un arreglo", data);
          return;
        }

        changes.data = data;
        changes.pagination = { ...pagination, total: count };
      },
      onError: async (error) => {
        if (error.code !== 404) {
          changes.error = error;
        }
      },
      onFinally: async () => setList((o) => ({ ...o, ...changes })),
    });
  }, [list.loading]);

  const request = useCallback((type, payload = {}) => {
    if (type === "list") {
      setList((o) => ({
        ...o,
        loading: "Cargando...",
        pagination: {
          ...o.pagination,
          ...payload.pagination,
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
        list.loading ??
        list.error?.message ??
        "No existen datos para mostrar"
      }
				pagination={{
					...list.pagination,
					onChange: ({ index, size }) =>
						request("list", {
							pagination: { index, size },
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
