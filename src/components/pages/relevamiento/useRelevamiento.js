import React, { useCallback, useEffect, useState, useContext } from "react";
import dayjs from "dayjs";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import { id, pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import AuthContext from "store/authContext";
import RelevamientoTable from "./RelevamientoTable";
import EncuestasForm from "./RelevamientoForm";
import RelevamientoDetails from "./detallesRelevamiento/RelevamientoDetails";

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
  edit: null,
  errors: null,
};

export const onLoadSelectFirst = ({ data, multi }) => {
  const dataArray = AsArray(data);
  if (multi) return dataArray.length ? [dataArray[0]] : null;
  return dataArray.length ? dataArray[0] : null;
};

export const onLoadSelectSame = ({ data, multi, record }) => {
  const dataArray = AsArray(data);
  if (multi) {
    record = AsArray(record);
    let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
    return retorno.length ? retorno : null;
  }
  return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};

export const onLoadSelectKeep = ({ record }) => record;
export const onLoadSelectKeepOrFirst = ({ data, multi, record }) =>
  record ?? onLoadSelectFirst({ data, multi, record });

export const onDataChangeDef = (data = []) => {};
const onEditChangeDef = ({ edit = {}, changes = {}, request = "" } = {}) => true;
const onEditValidateDef = ({ edit = {}, errors = {}, request = "" } = {}) => {};
const onEditCompleteDef = ({ edit = {}, response = null, request = "" } = {}) => {};

const useRelevamiento = ({
  remote: remoteInit = true,
  data: dataInit = [],
  loading,
  error,
  multi: multiInit = false,
  params: paramsInit = {
    sort: "-id",
    soloActivos: false,
  },
  onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
  onDataChange: onDataChangeInit = onDataChangeDef,
  onEditChange: onEditChangeInit = onEditChangeDef,
  onEditValidate: onEditValidateInit = onEditValidateDef,
  onEditComplete: onEditCompleteInit = onEditCompleteDef,
  columns,
  hideSelectColumn = true,
  mostrarBuscar = false,
  filtroEstado = null,
  renderExtraActions = null,
} = {}) => {
  const Usuario = useContext(AuthContext).usuario;

  const pushQuery = useQueryQueue((action, params) => {
    const { id, ...otherParams } = params;
    switch (action) {
      case "GetList": {
        return {
          config: {
            baseURL: "App",
            endpoint: `/Fiscalizaciones`,
            method: "GET",
          },
        };
      }
      case "GetListSeccionales": {
        return {
          config: {
            baseURL: "Afiliaciones",
            endpoint: `/Seccional`,
            method: "GET",
          },
          params: otherParams,
        };
      }
      default:
        return null;
    }
  });

  const [list, setList] = useState({
    loading: null,
    remote: remoteInit,
    loadingOverride: loading,
    params: { ...paramsInit, filtro: "" },
    paramsDef: {
      ambitoTodos: Usuario.ambitoTodos,
      ambitoProvincias: Usuario.ambitoProvincias,
      ambitoDelegaciones: Usuario.ambitoDelegaciones,
      ambitoSeccionales: Usuario.ambitoSeccionales,
    },
    delegaciones: [],
    pagination: { index: 1, size: 15 },
    data: [...AsArray(dataInit, true)],
    error,
    selection: {
      ...selectionDef,
      multi: multiInit,
    },
    onLoadSelect: onLoadSelectInit === onLoadSelectFirst && multiInit ? onLoadSelectSame : onLoadSelectInit,
    onDataChange: onDataChangeInit ?? onDataChangeDef,
    onEditChange: onEditChangeInit ?? onEditChangeDef,
    onEditValidate: onEditValidateInit ?? onEditValidateDef,
    onEditComplete: onEditCompleteInit ?? onEditCompleteDef,
  });

  const [seccionales, setSeccionales] = useState({
    loading: false,
    data: [],
    error: null,
  });

  useEffect(() => {
    if (!list.loading) return;
    const changes = { loading: null, error: null };

    if (!list.remote) {
      const data = list.data;
      const error = list.error;
      const multi = list.selection.multi;
      const record = list.selection.record;
      changes.data = data;
      changes.error = error;
      changes.selection = {
        ...list.selection,
        ...selectionDef,
        record: list.onLoadSelect({ data, multi, record }),
      };
      changes.selection.index = multi
        ? changes.selection.record?.map((r) => changes.data.indexOf(r))
        : changes.data.indexOf(changes.selection.record);
      setList((o) => ({ ...o, ...changes }));
      return;
    }

    changes.data = [];
    pushQuery({
      action: "GetList",
      config: {
        params: {
          ...list.paramsDef,
          ...list.params,
          pageIndex: list.pagination.index,
          pageSize: list.pagination.size,
        },
      },
      onOk: async ({ data, total, ...pagination }) => {
        if (!Array.isArray(data))
          return console.error("Se esperaba un arreglo de encuestas en GetList", data);
        changes.data = data;
        const multi = list.selection.multi;
        const record = list.selection.record;
        changes.pagination = { ...pagination, total };
        changes.selection = {
          ...list.selection,
          ...selectionDef,
          record: list.onLoadSelect({ data, multi, record }),
        };
        changes.selection.index = multi
          ? changes.selection.record?.map((r) => changes.data.indexOf(r))
          : changes.data.indexOf(changes.selection.record);
        list.onDataChange(changes.data);
      },
      onError: async (error) => {
        if (error.code === 404) return;
        changes.error = error;
        changes.selection = { ...list.selection, ...selectionDef };
      },
      onFinally: async () => setList((o) => ({ ...o, ...changes })),
    });
  }, [pushQuery, list]);

  const cargarSeccionales = useCallback(() => {
    setSeccionales((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    pushQuery({
      action: "GetListSeccionales",
      params: {},
      onOk: (data) => {
        let seccionalesData = [];
        if (Array.isArray(data)) seccionalesData = data;
        else if (data && Array.isArray(data.data)) seccionalesData = data.data;
        else if (data && Array.isArray(data.seccionales)) seccionalesData = data.seccionales;
        else if (data && typeof data === "object") seccionalesData = [data];
        setSeccionales({
          loading: false,
          data: seccionalesData,
          error: null,
        });
      },
      onError: (error) => {
        setSeccionales({
          loading: false,
          data: [],
          error: error,
        });
      },
    });
  }, [pushQuery]);

  useEffect(() => {
    cargarSeccionales();
  }, [cargarSeccionales]);

  // ====== Datos visibles en la tabla ======
  const visibleData = React.useMemo(() => {
    const base = filtroEstado ? filtroEstado([...list.data]) : [...list.data];
    return base.sort((a, b) => b.id - a.id).slice(0, 15); // tu vista actual
  }, [list.data, filtroEstado]);

  // ====== Asegurar que el PRIMER visible quede seleccionado ======
  useEffect(() => {
    if (list.selection.multi) return; // solo para selección simple
    const currentId = list.selection.record?.id;
    const isCurrentVisible = currentId && visibleData.some((r) => r.id === currentId);
    const first = visibleData[0] ?? null;

    // Si no hay seleccionado, o lo seleccionado ya no está visible -> selecciono el primero visible
    if (!isCurrentVisible) {
      setList((o) => ({
        ...o,
        selection: {
          ...o.selection,
          ...selectionDef,
          index: first ? o.data.indexOf(first) : null,
          record: first,
        },
      }));
    }
  }, [visibleData, list.selection.multi, list.selection.record?.id]);

  // ================= RENDER =================
  // (igual que antes, pero usando visibleData para no recalcular)
  const request = useCallback((type, payload = {}) => {
    switch (type) {
      case "selected": {
        return setList((o) => {
          const apply = [];
          if (payload.request !== "A") {
            apply.push(
              ...AsArray("record" in payload ? payload.record : o.selection.record, true)
                .map(({ id }) => id)
                .filter((r) => r)
            );
          }
          return {
            ...o,
            selection: {
              ...o.selection,
              request: payload.request,
              action: payload.action,
              edit: {
                ...(payload.request === "A" ? {} : JoinOjects(o.selection.record)),
                ...JoinOjects(payload.record),
              },
              apply,
            },
          };
        });
      }
      case "list": {
        return setList((o) => {
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
            onLoadSelect: "onLoadSelect" in payload ? payload.onLoadSelect : o.onLoadSelect,
            selection: {
              ...o.selection,
              multi: "multi" in payload ? !!payload.multi : o.selection.multi,
            },
          };
          if (payload.params) {
            changes.params = {
              ...pick(o.params, paramsInit),
              ...payload.params,
            };
          }
          if (payload.pagination) changes.pagination = { ...o.pagination, ...payload.pagination };
          if (payload.clear) {
            const data = changes.data;
            const multi = changes.selection.multi;
            const record = o.selection.record;
            changes.selection = {
              ...o.selection,
              ...selectionDef,
              record: changes.onLoadSelect({ data, multi, record }),
            };
            changes.selection.index = multi
              ? changes.selection.record?.map((r) => changes.data.indexOf(r))
              : changes.data.indexOf(changes.selection.record);
          } else {
            changes.loading = "Cargando...";
          }
          return { ...o, ...changes };
        });
      }
      default:
        return;
    }
  }, []);

  let form = null;
  if (list.selection.edit) {
    form = (
      <EncuestasForm
        request={list.selection.request}
        data={(() => {
          var data =
            list.selection.request === "C"
              ? {
                  deletedDate: dayjs().format("DD-MM-YYYY"),
                  deletedBy: Usuario.nombre,
                }
              : {};
          return { ...list.selection.edit, ...data };
        })()}
        title={list.selection.action}
        errors={list.selection.errors}
        loading={!!list.loading}
        disabled={(() => {
          const r = ["C"].includes(list.selection.request)
            ? {
                deletedDate: dayjs().format("DD-MM-YYYY"),
                deletedBy: true,
                tema: true,
                fecha: true,
                fechaFinalizacion: true,
                observaciones: true,
              }
            : {};
          return r;
        })()}
        hide={
          list.selection.request === "C"
            ? {
                deletedObs: !list.selection.record?.deletedDate ? true : false,
                deletedBy: !list.selection.record?.deletedDate ? true : false,
                deletedDate: !list.selection.record?.deletedDate ? true : false,
              }
            : {}
        }
        onChange={(edit) => {
          if (
            !list.onEditChange({
              edit: { ...list.selection.edit },
              changes: edit,
              request: list.selection.request,
            })
          )
            return;
          const changes = { edit: { ...edit }, errors: {} };
          const applyChanges = ({ edit, errors } = changes) =>
            setList((o) => ({
              ...o,
              selection: {
                ...o.selection,
                edit: { ...o.selection.edit, ...edit },
                errors: { ...o.selection.errors, ...errors },
              },
            }));
          applyChanges();
        }}
        onClose={(confirm) => {
          if (!["C"].includes(list.selection.request)) {
            confirm = false;
          }
          if (!confirm) {
            setList((o) => ({
              ...o,
              selection: {
                ...o.selection,
                ...selectionDef,
                index: o.selection.index,
                record:
                  !o.selection.multi && o.selection.index > -1
                    ? o.data.at(o.selection.index)
                    : o.selection.record,
              },
            }));
            return;
          }
          const record = { ...list.selection.edit };
          const errors = {};
          list.onEditValidate({
            edit: record,
            errors,
            request: list.selection.request,
          });
          if (Object.keys(errors).length) {
            setList((o) => ({
              ...o,
              selection: {
                ...o.selection,
                errors,
              },
            }));
            return;
          }
          console.log("⚠️ Operación no soportada:", list.selection.request);
        }}
      />
    );
  }

  const render = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        gap: "20px",
        padding: "20px",
      }}
    >
      <div style={{ flex: "0 0 auto", minHeight: "0" }}>
        <RelevamientoTable
          remote={list.remote}
          data={visibleData}
          loading={!!list.loading}
          seccionales={seccionales.data}
          seccionalesLoading={seccionales.loading}
          seccionalesError={seccionales.error}
          noDataIndication={
            list.loading ?? list.loadingOverride ?? list.error?.message ?? "No existen datos para mostrar"
          }
          columns={columns}
          pagination={{
            ...list.pagination,
            total: Math.min(15, list.data.length),
            pageSize: 15,
            current: 1,
            showSizeChanger: false,
            hideOnSinglePage: true,
            onChange: () => {
              console.log("Paginación deshabilitada para 15 registros máximo");
            },
          }}
          selection={{
            mode: list.selection.multi ? "checkbox" : "radio",
            hideSelectColumn: hideSelectColumn,
            selected: AsArray(list.selection.record, !list.selection.multi)
              .filter((r) => r)
              .map((r) => r.id),
            onSelect: (record, isSelect, rowIndex, e) => {
              if (rowIndex == null) return;
              setList((o) => {
                let index = o.data.findIndex((r) => r.id === record.id);
                if (o.selection.multi) {
                  const newIndex = [];
                  const newRecord = [];
                  o.selection.record?.forEach((r, i) => {
                    if (!isSelect && r.id === record.id) return;
                    newIndex.push(o.selection.index[i]);
                    newRecord.push(r);
                  });
                  if (isSelect && !newIndex.includes(index)) {
                    newIndex.push(index);
                    newRecord.push(record);
                  }
                  if (newIndex.length) {
                    index = newIndex;
                    record = newRecord;
                  } else {
                    index = null;
                    record = null;
                  }
                }
                return {
                  ...o,
                  selection: {
                    ...o.selection,
                    ...selectionDef,
                    index,
                    record,
                  },
                };
              });
            },
            onSelectAll: (isSelect, rows, e) => {
              if (!list.selection.multi) return;
              setList((o) => {
                let index = [];
                let record = [];
                if (isSelect) {
                  o.data.forEach((r, i) => {
                    record.push(r);
                    index.push(i);
                  });
                } else {
                  index = null;
                  record = null;
                }
                return {
                  ...o,
                  selection: {
                    ...o.selection,
                    ...selectionDef,
                    index,
                    record,
                  },
                };
              });
            },
          }}
          onTableChange={(type, newState) => {
            switch (type) {
              case "sort": {
                const { sortField, sortOrder } = newState;
                return setList((o) => ({
                  ...o,
                  loading: "Cargando...",
                  params: {
                    ...o.params,
                    sort: `${sortOrder === "desc" ? "-" : "+"}${{ descripcion: "nombre" }[sortField] ?? sortField}`,
                  },
                }));
              }
              default:
                return;
            }
          }}
        />
      </div>

      {list.selection.record && !list.selection.edit && (
        <div
          style={{
            flex: "0 1 auto",
            maxHeight: "60vh",
            minHeight: "300px",
            overflow: "auto",
            borderTop: "1px solid #e0e0e0",
            paddingTop: "auto",
          }}
        >
          <RelevamientoDetails
            config={{
              data: list.selection.record,
              tab: 0,
            }}
            loading={!!list.loading}
          />
          {renderExtraActions && (
            <div style={{ padding: "15px", textAlign: "center", borderTop: "1px solid #e0e0e0" }}>
              {renderExtraActions()}
            </div>
          )}
        </div>
      )}

      {form && (
        <div style={{ flex: "1", minHeight: "0", overflow: "auto" }}>
          {form}
        </div>
      )}
    </div>
  );

  return {
    render,
    request,
    selected: list.selection.record,
    seccionales: seccionales.data,
    seccionalesLoading: seccionales.loading,
    seccionalesError: seccionales.error,
    cargarSeccionales,
    list,
  };
};

export default useRelevamiento;
