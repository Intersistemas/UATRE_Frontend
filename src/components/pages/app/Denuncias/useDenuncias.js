// import React, { useCallback, useEffect, useState } from "react";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import JoinOjects from "components/helpers/JoinObjects";
// import AsArray from "components/helpers/AsArray";
// import dayjs from "dayjs";
// import LocalidadesForm from "./DenunciasForm";
// import DenunciasTable from "./DenunciasTable";

// const selectionDef = {
// 	action: "",
// 	request: "",
// 	index: null,
// 	record: null,
// 	edit: null,
// 	errors: null,
// };

// export const onLoadSelectFirst = ({ data, multi, record }) => {
// 	const dataArray = AsArray(data);
// 	if (multi) {
// 		record = AsArray(record);
// 		let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
// 		if (retorno.length === 0) retorno = [dataArray.at(0)].filter((r) => r);
// 		return retorno.length ? retorno : null;
// 	}
// 	return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
// };

// export const onLoadSelectSame = ({ data, multi, record }) => {
// 	const dataArray = AsArray(data);
// 	if (multi) {
// 		record = AsArray(record);
// 		let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
// 		return retorno.length ? retorno : null;
// 	}
// 	return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
// };

// export const onLoadSelectKeep = ({ record }) => record;

// export const onLoadSelectKeepOrFirst = ({ data, multi, record }) =>
// 	record ? record : onLoadSelectFirst({ data, multi, record });

// export const onDataChangeDef = (data = []) => {};

// const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) =>
// 	true;
// const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
// const onEditCompleteDef = ({
// 	edit = {},
// 	response = null,
// 	request = "",
// } = {}) => {};

// const useDenuncias = ({
// 	remote: remoteInit = true,
// 	data: dataInit = [],
// 	loading,
// 	error,
// 	multi: multiInit = false,
// 	pagination: paginationInit = { index: 1, size: 15 },
// 	onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
// 	onDataChange: onDataChangeInit = onDataChangeDef,
// 	onEditChange: onEditChangeInit = onEditChangeDef,
// 	onEditValidate: onEditValidateInit = onEditValidateDef,
// 	onEditComplete: onEditCompleteInit = onEditCompleteDef,
// 	columns,
// 	hideSelectColumn = true,
// 	mostrarBuscar = false,
// } = {}) => {
// 	//#region Trato queries a APIs
// 	const pushQuery = useQueryQueue((action) => {
// 		switch (action) {
// 			case "GetList": {
// 				return {
// 					config: {
// 						baseURL: "App",
// 						method: "GET",
// 						endpoint: "/AppDenuncias",
// 					},
// 				};
// 			}
// 			default:
// 				return null;
// 		}
// 	});
	

// 	//#region declaracion y carga list y selected
// 	const [list, setList] = useState({
// 		loading: null,
// 		remote: remoteInit,
// 		loadingOverride: loading,
// 		params: { sortBy: "nombre" },
// 		pagination: { index: 1, size: 15, ...paginationInit },
// 		data: [...AsArray(dataInit, true)],
// 		error,
// 		selection: {
// 			...selectionDef,
// 			multi: multiInit,
// 		},
// 		onLoadSelect:
// 			onLoadSelectInit === onLoadSelectFirst && multiInit
// 				? onLoadSelectSame
// 				: onLoadSelectInit,
// 		onDataChange: onDataChangeInit ?? onDataChangeDef,
// 		onEditChange: onEditChangeInit ?? onEditChangeDef,
// 		onEditValidate: onEditValidateInit ?? onEditValidateDef,
// 		onEditComplete: onEditCompleteInit ?? onEditCompleteDef,
// 	});

// 	useEffect(() => {
// 		if (!list.loading) return;
// 		const changes = { loading: null, error: null };
// 		if (!list.remote) {
// 			const data = list.data;
// 			const error = list.error;
// 			const multi = list.selection.multi;
// 			const record = list.selection.record;
// 			changes.data = data;
// 			changes.error = error;
// 			changes.selection = {
// 				...list.selection,
// 				...selectionDef,
// 				record: list.onLoadSelect({ data, multi, record }),
// 			};

// 			changes.selection.index = multi
// 				? changes.selection.record?.map((r) => changes.data.indexOf(r))
// 				: changes.data.indexOf(changes.selection.record);
// 			setList((o) => ({ ...o, ...changes }));
// 			return;
// 		}
// 		changes.data = [];
// 		pushQuery({
// 			action: "GetList",
// 			params: {
// 				...list.params,
// 				pageIndex: list.pagination.index,
// 				pageSize: list.pagination.size,
// 			},
// 			onOk: async ({ index, size, count, data }) => {
// 				if (!Array.isArray(data))
// 					return console.error("Se esperaba un arreglo", data);
// 				changes.data = data;
// 				const multi = list.selection.multi;
// 				const record = list.selection.record;
// 				changes.pagination = { index, size, count };
// 				changes.selection = {
// 					...list.selection,
// 					...selectionDef,
// 					record: list.onLoadSelect({ data, multi, record }),
// 				};

// 				changes.selection.index = multi
// 					? changes.selection.record?.map((r) => changes.data.indexOf(r))
// 					: changes.data.indexOf(changes.selection.record);

// 				list.onDataChange(changes.data);
// 			},
// 			onError: async (error) => {
// 				if (error.code === 404) return;
// 				changes.error = error;
// 				changes.selection = { ...list.selection, ...selectionDef };
// 			},
// 			onFinally: async () => setList((o) => ({ ...o, ...changes })),
// 		});
// 	}, [pushQuery, list]);
// 	//#endregion

// 	const request = useCallback((type, payload = {}) => {
// 		switch (type) {
// 			case "selected": {
// 				return setList((o) => {
// 					const apply = [];
// 					if (payload.request !== "A") {
// 						apply.push(
// 							...AsArray(
// 								"record" in payload ? payload.record : o.selection.record,
// 								true
// 							)
// 								.map(({ id }) => id)
// 								.filter((r) => r)
// 						);
// 					}
// 					return {
// 						...o,
// 						selection: {
// 							...o.selection,
// 							request: payload.request,
// 							action: payload.action,
// 							edit: {
// 								...(payload.request === "A"
// 									? {}
// 									: JoinOjects(o.selection.record)),
// 								...JoinOjects(payload.record),
// 							},
// 							apply,
// 						},
// 					};
// 				});
// 			}
// 			case "list": {
// 				return setList((o) => {
// 					const changes = {
// 						loading: null,
// 						data:
// 							"data" in payload && Array.isArray(payload.data)
// 								? [...payload.data]
// 								: payload.clear
// 								? []
// 								: o.data,
// 						loadingOverride: payload.loading,
// 						error: payload.error,
// 						onLoadSelect:
// 							"onLoadSelect" in payload ? payload.onLoadSelect : o.onLoadSelect,
// 						selection: {
// 							...o.selection,
// 							multi: "multi" in payload ? !!payload.multi : o.selection.multi,
// 						},
// 					};
// 					if (payload.params) changes.params = payload.params;
// 					if (payload.pagination)
// 						changes.pagination = { ...o.pagination, ...payload.pagination };
// 					if (payload.clear) {
// 						const data = changes.data;
// 						const multi = changes.selection.multi;
// 						const record = o.selection.record;
// 						changes.selection = {
// 							...o.selection,
// 							...selectionDef,
// 							record: changes.onLoadSelect({ data, multi, record }),
// 						};
// 						changes.selection.index = multi
// 							? changes.selection.record?.map((r) => changes.data.indexOf(r))
// 							: changes.data.indexOf(changes.selection.record);
// 					} else {
// 						changes.loading = "Cargando...";
// 					}
// 					return { ...o, ...changes };
// 				});
// 			}
// 			default:
// 				return;
// 		}
// 	}, []);



// 	const render = () => (
// 		<>
// 			<DenunciasTable
// 				remote={list.remote}
// 				data={list.data}
// 				loading={!!list.loading}
// 				noDataIndication={
// 					list.loading ??
// 					list.loadingOverride ??
// 					list.error?.message ??
// 					"No existen datos para mostrar"
// 				}
				
				
// 				pagination={{
// 					...list.pagination,
// 					onChange: ({ index, size }) =>
// 						request("list", {
// 							pagination: { index, size },
// 							data: list.remote ? [] : list.data,
// 						}),
// 				}}
// 				selection={{
// 					mode: list.selection.multi ? "checkbox" : "radio",
// 					hideSelectColumn: hideSelectColumn,
// 					selected: AsArray(list.selection.record, !list.selection.multi)
// 						.filter((r) => r)
// 						.map((r) => r.id),
// 					onSelect: (record, isSelect, rowIndex, e) => {
// 						if (rowIndex == null) return;
// 						setList((o) => {
// 							let index = o.data.findIndex((r) => r.id === record.id);
// 							if (o.selection.multi) {
// 								const newIndex = [];
// 								const newRecord = [];
// 								o.selection.record?.forEach((r, i) => {
// 									if (!isSelect && r.id === record.id) return;
// 									newIndex.push(o.selection.index[i]);
// 									newRecord.push(r);
// 								});
// 								if (isSelect && !newIndex.includes(index)) {
// 									newIndex.push(index);
// 									newRecord.push(record);
// 								}
// 								if (newIndex.length) {
// 									index = newIndex;
// 									record = newRecord;
// 								} else {
// 									index = null;
// 									record = null;
// 								}
// 							}
// 							return {
// 								...o,
// 								selection: {
// 									...o.selection,
// 									...selectionDef,
// 									index,
// 									record,
// 								},
// 							};
// 						});
// 					},
// 					onSelectAll: (isSelect, rows, e) => {
// 						if (!list.selection.multi) return;
// 						setList((o) => {
// 							let index = [];
// 							let record = [];
// 							if (isSelect) {
// 								o.data.forEach((r, i) => {
// 									record.push(r);
// 									index.push(i);
// 								});
// 							} else {
// 								index = null;
// 								record = null;
// 							}
// 							return {
// 								...o,
// 								selection: {
// 									...o.selection,
// 									...selectionDef,
// 									index,
// 									record,
// 								},
// 							};
// 						});
// 					},
// 				}}
// 				onTableChange={(type, newState) => {
// 					switch (type) {
// 						case "sort": {
// 							const { sortField, sortOrder } = newState;
// 							return setList((o) => ({
// 								...o,
// 								loading: "Cargando...",
// 								params: {
// 									...o.params,
// 									sortBy: `${sortOrder === "desc" ? "-" : "+"}${sortField}`,
// 								},
// 							}));
// 						}
// 						default:
// 							return;
// 					}
// 				}}
// 			/>
		
// 		</>
// 	);
// 	return { render, request, selected: list.selection.record };
// };

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
