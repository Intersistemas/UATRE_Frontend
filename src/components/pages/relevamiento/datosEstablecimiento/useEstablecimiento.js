

import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import EstablecimientoTable from "./EstablecimientoTable";
import AuthContext from "../../../../store/authContext";
import EstablecimientoDetails from "./detallesEstablecimiento/EstablecimientoDetails";

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
};

const useEstablecimiento = (
  {
    relevamientoId = null, // id del relevamiento para traer sus establecimientos
  } = {}
) => {
  const { usuario: Usuario } = useContext(AuthContext);

  //#region Query builder
  const pushQuery = useQueryQueue((action, params) => {
    const { id, ...otherParams } = params ?? {};
    switch (action) {
      case "GetList":
        return {
          config: {
            baseURL: "App",
            endpoint: `/Fiscalizaciones/${relevamientoId || id}`, // usa relevamientoId
            method: "GET",
          },
          params: otherParams,
        };
      default:
        return null;
    }
  });
  //#endregion

  //#region State principal
  const [list, setList] = useState({
    loading: relevamientoId ? "Cargando..." : null,   // solo carga si hay relevamientoId
    params: { relevamientoId },
    pagination: { index: 1, size: 10 },
    data: [],
    error: null,
    selection: { ...selectionDef },
  });
  //#endregion

  //#region Carga de datos (cuando loading=true)
  useEffect(() => {
    if (!list.loading || !relevamientoId) return;

    pushQuery({
      action: "GetList",
      params: {
        ...list.params,
        id: relevamientoId,
        include: "establecimiento",
        deleted: false,
        pageIndex: list.pagination?.index || 1,
        pageSize: list.pagination?.size || 10,
      },
      onOk: async (data) => {
        setList((prev) => {
          // Normalizo posibles formas de respuesta
          let establecimientos = [];
          if (Array.isArray(data)) {
            establecimientos = data;
          } else if (data && Array.isArray(data.establecimientos)) {
            establecimientos = data.establecimientos;
          } else if (data && Array.isArray(data.data)) {
            establecimientos = data.data;
          } else if (data && typeof data === "object") {
            establecimientos = [data];
          }

          const record =
            establecimientos.find?.((r) => r.id === prev.selection.record?.id) ||
            establecimientos[0] ||
            null;

          const selection = { ...selectionDef, record };
          if (record && establecimientos.indexOf) {
            selection.index = establecimientos.indexOf(record);
          }

          return {
            ...prev,
            loading: null,
            data: establecimientos,
            error: null,
            selection,
            pagination: {
              ...prev.pagination,
              total: data?.total ?? establecimientos.length,
            },
          };
        });
      },
      onError: async (err) =>
        setList((prev) => ({
          ...prev,
          loading: null,
          data: [],
          error: err.code === 404 ? null : err,
          selection: { ...selectionDef },
        })),
    });
  }, [
    list.loading,
    pushQuery,
    list.params,
    list.pagination?.index,
    list.pagination?.size,
    relevamientoId,
  ]);
  //#endregion

  //#region React a cambios de relevamientoId
  useEffect(() => {
    if (relevamientoId) {
      setList((prev) => ({
        ...prev,
        loading: "Cargando...",
        params: { ...prev.params, relevamientoId },
        data: [],
        error: null,
        selection: { ...selectionDef },
      }));
    } else {
      // si no hay relevamientoId, limpio
      setList((prev) => ({
        ...prev,
        loading: null,
        data: [],
        error: null,
        selection: { ...selectionDef },
      }));
    }
  }, [relevamientoId]);
  //#endregion

  //#region API pública (requestChanges)
  const requestChanges = useCallback((type, payload = {}) => {
    switch (type) {
      case "selected": {
        // Solo actualizo el seleccionado (no hay edición ni formulario)
        const { record, action = "", request = "" } = payload;
        return setList((prev) => ({
          ...prev,
          selection: {
            ...selectionDef,
            action,
            request,
            index: record ? prev.data.findIndex((r) => r.id === record.id) : null,
            record: record || null,
          },
        }));
      }
      case "list": {
        // Recargar con nuevos params / paginado
        if (payload.clear) {
          return setList((prev) => ({
            ...prev,
            loading: null,
            data: [],
            error: null,
            selection: { ...selectionDef },
          }));
        }
        return setList((prev) => ({
          ...prev,
          loading: "Cargando...",
          params: { ...(payload.params ?? {}) },
          data: [],
        }));
      }
      default:
        return;
    }
  }, []);
  //#endregion

  //#region Render
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
      {/* Tabla */}
      <div style={{ flex: "0 0 auto", minHeight: "0" }}>
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          Identificación del Establecimiento
        </h3>

        <EstablecimientoTable
          data={list.data}
          loading={!!list.loading}
          noDataIndication={
            list.loading || list.error?.message || "No existen datos para mostrar"
          }
          pagination={{
            ...list.pagination,
            onChange: ({ index, size }) =>
              setList((prev) => ({
                ...prev,
                loading: "Cargando...",
                pagination: { index, size },
                data: [],
              })),
          }}
          selection={{
            selected: [list.selection.record?.id].filter(Boolean),
            onSelect: (record, isSelect, index) =>
              setList((prev) => ({
                ...prev,
                selection: { ...selectionDef, index, record },
              })),
          }}
        />
      </div>

      {/* Detalles */}
      {list.selection.record && (
        <div
          style={{
            flex: "0 1 auto",
            maxHeight: "60vh",
            minHeight: "300px",
            overflow: "auto",
            borderTop: "1px solid #e0e0e0",
            paddingTop: "10px",
          }}
        >
          <EstablecimientoDetails
            config={{
              data: list.selection.record,
              tab: 0,
            }}
            loading={!!list.loading}
          />
        </div>
      )}
    </div>
  );
  //#endregion

  // Devuelvo: render, requestChanges, y el record seleccionado
  return [render, requestChanges, list.selection.record];
};

export default useEstablecimiento;
