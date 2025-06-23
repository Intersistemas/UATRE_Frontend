// export default useDenuncias;
import { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AsArray from "components/helpers/AsArray";
import DenunciasTable from "./DenunciasTable";
import dayjs from "dayjs";

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
};

export const onLoadSelectFirst = ({ data, multi, record }) => {
  const dataArray = AsArray(data);
  if (multi) {
    record = AsArray(record);
    let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
    if (retorno.length === 0) retorno = [dataArray.at(0)].filter((r) => r);
    return retorno.length ? retorno : null;
  }
  return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};

export const onLoadSelectKeepOrFirst = ({ data, multi, record }) =>
  record ? record : onLoadSelectFirst({ data, multi, record });

const useDenuncias = ({
  remote = true,
  data: dataInit = [],
  loading,
  error,
  pagination: paginationInit = { index: 1, size: 15 },
  onLoadSelect = onLoadSelectFirst,
  columns,
  hideSelectColumn = true,
} = {}) => {
  const pushQuery = useQueryQueue((action) => {
    if (action === "GetList") {
      return {
        config: {
          baseURL: "App",
          method: "GET",
          endpoint: "/AppDenuncias",
        },
      };
    }
    return null;
  });

  const [dataOriginal, setDataOriginal] = useState([]);

  const [list, setList] = useState({
    loading: null,
    remote,
    loadingOverride: loading,
    params: { sortBy: "nombre" },
    pagination: { index: 1, size: 15, ...paginationInit },
    data: [...AsArray(dataInit, true)],
    error,
    selection: {
      ...selectionDef,
    },
    onLoadSelect,
  });

  useEffect(() => {
    if (!list.loading) return;
    const changes = { loading: null, error: null };

    if (!list.remote) {
      const data = list.data;
      const record = list.selection.record;
      changes.data = data;
      changes.selection = {
        ...list.selection,
        ...selectionDef,
        record: list.onLoadSelect({ data, multi: false, record }),
        index: data.indexOf(record),
      };
      setList((o) => ({ ...o, ...changes }));
      return;
    }

    changes.data = [];

    pushQuery({
      action: "GetList",
      params: {
        ...list.params,
        pageIndex: list.pagination.index,
        pageSize: list.pagination.size,
      },
    //   onOk: async ({ index, size, count, data }) => {
    //     if (!Array.isArray(data))
    //       return console.error("Se esperaba un arreglo", data);
    //     changes.data = data;
    //     changes.pagination = { index, size, count };
    //     const record = list.selection.record;
    //     changes.selection = {
    //       ...list.selection,
    //       ...selectionDef,
    //       record: list.onLoadSelect({ data, multi: false, record }),
    //     };
    //     changes.selection.index = data.indexOf(changes.selection.record);
    //   },
	onOk: async ({ index, size, count, data }) => {
  if (!Array.isArray(data))
    return console.error("Se esperaba un arreglo", data);

	setDataOriginal(data); // guardamos el original para futuros filtros
	let filteredData = data;

  const filtro = list.params?.filterByCPNombre?.toLowerCase?.().trim();

  if (filtro) {
	filteredData = dataOriginal.filter((item) => {
      const nombre = item.nombre?.toLowerCase?.() || "";
      const fechaYMD = item.fecha ? dayjs(item.fecha).format("YYYY-MM-DD") : "";
      const fechaDMY = item.fecha ? dayjs(item.fecha).format("DD/MM/YYYY") : "";
      return (
        nombre.includes(filtro) ||
        fechaYMD.includes(filtro) ||
        fechaDMY.includes(filtro)
      );
    });
  }

  changes.data = filteredData;
  changes.pagination = { index, size, count: filteredData.length };

  const record = list.selection.record;
  changes.selection = {
    ...list.selection,
    ...selectionDef,
    record: list.onLoadSelect({ data: filteredData, multi: false, record }),
  };
  changes.selection.index = filteredData.indexOf(changes.selection.record);
},

      onError: async (error) => {
        if (error.code !== 404) {
          changes.error = error;
        }
        changes.selection = { ...list.selection, ...selectionDef };
      },
      onFinally: async () => setList((o) => ({ ...o, ...changes })),
    });
  }, [pushQuery, list]);


  useEffect(() => {
  const filtro = list.params?.filterByCPNombre?.toLowerCase?.().trim();
  if (!dataOriginal.length) return;

  const filteredData = filtro
    ? dataOriginal.filter((item) => {
        const nombre = item.nombre?.toLowerCase?.() || "";
        const fechaYMD = item.fecha ? dayjs(item.fecha).format("YYYY-MM-DD") : "";
        const fechaDMY = item.fecha ? dayjs(item.fecha).format("DD/MM/YYYY") : "";
        return (
          nombre.includes(filtro) ||
          fechaYMD.includes(filtro) ||
          fechaDMY.includes(filtro)
        );
      })
    : [...dataOriginal]; // sin filtro, mostrar todo

  setList((o) => ({
    ...o,
    data: filteredData,
    pagination: { ...o.pagination, count: filteredData.length },
  }));
}, [list.params?.filterByCPNombre, dataOriginal]);



//------------------------------------------------
  const request = useCallback((type, payload = {}) => {
    if (type === "list") {
      setList((o) => {
        const changes = {
          loading: null,
          data:
            "data" in payload && Array.isArray(payload.data)
              ? [...payload.data]
              : payload.clear
              ? []
              : o.data,
          loadingOverride: payload.loading,
          error: payload.error,
          onLoadSelect:
            "onLoadSelect" in payload ? payload.onLoadSelect : o.onLoadSelect,
        };

        if (payload.params) changes.params = payload.params;
        if (payload.pagination)
          changes.pagination = { ...o.pagination, ...payload.pagination };

        if (payload.clear) {
          const data = changes.data;
          const record = o.selection.record;
          changes.selection = {
            ...o.selection,
            ...selectionDef,
            record: changes.onLoadSelect({ data, multi: false, record }),
          };
          changes.selection.index = data.indexOf(changes.selection.record);
        } else {
          changes.loading = "Cargando...";
        }

        return { ...o, ...changes };
      });
    }
  }, []);

  const render = () => (
    <DenunciasTable
      remote={list.remote}
      data={list.data}
      loading={!!list.loading}
      noDataIndication={
        list.loading ?? list.loadingOverride ?? list.error?.message ?? "No existen datos para mostrar"
      }
      pagination={{
        ...list.pagination,
        onChange: ({ index, size }) =>
          request("list", {
            pagination: { index, size },
            data: list.remote ? [] : list.data,
          }),
      }}
      selection={{
        mode: "radio",
        hideSelectColumn,
        selected: list.selection.record ? [list.selection.record.id] : [],
        onSelect: (record) => {
          const index = list.data.findIndex((r) => r.id === record.id);
          setList((o) => ({
            ...o,
            selection: {
              ...o.selection,
              ...selectionDef,
              index,
              record,
            },
          }));
        },
      }}
      onTableChange={(type, newState) => {
        if (type === "sort") {
          const { sortField, sortOrder } = newState;
          setList((o) => ({
            ...o,
            loading: "Cargando...",
            params: {
              ...o.params,
              sortBy: `${sortOrder === "desc" ? "-" : "+"}${sortField}`,
            },
          }));
        }
      }}
    />
  );

  return {
    render,
    request,
    selected: list.selection.record,
  };
};

export default useDenuncias;
