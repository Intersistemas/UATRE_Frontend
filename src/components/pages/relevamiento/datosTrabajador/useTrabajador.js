import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import TrabajadorTable from "./TrabajadorTable";
import TrabajadorDetails from "./detallesTrabajador/TrabajadorDetails";

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
};

const useTrabajador = ({ relevamientoId = null } = {}) => {
  /* ================= Query builder ================= */
  const pushQuery = useQueryQueue((action, params) => {
    const otherParams = params ?? {};
    switch (action) {
      case "GetList":
        return {
          config: {
            baseURL: "App",
            endpoint: `/FiscalizacionesTrabajador`,
            method: "GET",
          },
          params: otherParams,
        };
      default:
        return null;
    }
  });

  /* ================= State ================= */
  const [list, setList] = useState({
    loading: relevamientoId ? "Cargando..." : null, // solo carga si hay relevamientoId
    params: {}, // limpio params
    pagination: { index: 1, size: 10 },
    data: [],
    error: null,
    selection: { ...selectionDef },
  });

  /* ================= Efecto: carga datos ================= */
  useEffect(() => {
    if (!list.loading || !relevamientoId) return;

    const queryParams = {
      fiscalizacionesId: relevamientoId,
      include: "fiscalizacionesId",
      deleted: false,
      pageIndex: list.pagination?.index || 1,
      pageSize: list.pagination?.size || 10,
    };

    pushQuery({
      action: "GetList",
      params: queryParams,
      onOk: async (data) => {
        setList((prev) => {
          // Normalizo posibles formatos de respuesta
          let trabajadores = [];
          if (Array.isArray(data)) {
            trabajadores = data;
          } else if (data && Array.isArray(data.data)) {
            trabajadores = data.data;
          } else if (data && Array.isArray(data.fiscalizacionesId)) {
            trabajadores = data.fiscalizacionesId;
          } else if (data && typeof data === "object") {
            trabajadores = [data];
          }

          const record =
            trabajadores.find?.((r) => r.id === prev.selection.record?.id) ||
            trabajadores[0] ||
            null;

          const selection = { ...selectionDef, record };
          if (record && trabajadores.indexOf) {
            selection.index = trabajadores.indexOf(record);
          }

          return {
            ...prev,
            loading: null,
            data: trabajadores,
            error: null,
            selection,
            pagination: {
              ...prev.pagination,
              total: data?.total ?? trabajadores.length,
            },
          };
        });
      },
      onError: async (err) =>
        setList((prev) => ({
          ...prev,
          loading: null,
          data: [],
          error: err?.code === 404 ? null : err,
          selection: { ...selectionDef },
        })),
    });
  }, [
    list.loading,
    pushQuery,
    list.pagination?.index,
    list.pagination?.size,
    relevamientoId,
  ]);

  /* ================= Efecto: cambia relevamientoId ================= */
  useEffect(() => {
    if (relevamientoId) {
      setList((prev) => ({
        ...prev,
        loading: "Cargando...",
        params: {}, // limpio params para no arrastrar filtros previos
        data: [],
        error: null,
        selection: { ...selectionDef },
      }));
    } else {
      // sin relevamientoId, limpio todo
      setList((prev) => ({
        ...prev,
        loading: null,
        data: [],
        error: null,
        selection: { ...selectionDef },
      }));
    }
  }, [relevamientoId]);

  /* ================= API pública ================= */
  const requestChanges = useCallback((type, payload = {}) => {
    switch (type) {
      case "selected": {
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

  /* ================= Render ================= */
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
          Identificación del Trabajador
        </h3>

        <TrabajadorTable
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
          <TrabajadorDetails
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

  return [render, requestChanges, list.selection.record];
};

export default useTrabajador;
