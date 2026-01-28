// SolicitudAfiliacionFormDoc.js
import React, { useEffect, useState, useRef } from "react";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import Documentacion from "components/documentacion/Documentacion";
import useQueryState from "components/hooks/useQueryState";

const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj || {}).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );

const mapDocToPayload = (item, entidadId, entidadTipo) => {
  const payload = {
    id: item?.id,
    entidadId,
    entidadTipo,
    refTipoDocumentacionId: item?.refTipoDocumentacionId,
    refTipoDocumentacionDescripcion: item?.refTipoDocumentacionDescripcion,
    descripcion: item?.descripcion || item?.observaciones,
    observaciones: item?.observaciones,
    fechaVencimiento: item?.fechaVencimiento,
    nombreArchivo: item?.nombreArchivo ?? item?.fileName,
    archivo: item?.archivo,
    contentType: item?.contentType || "application/octet-stream",
    url: item?.url,
  };
  return compact(payload);
};

/**
 * Hook que encapsula TODA la lógica de Documentación del formulario.
 *
 * Params:
 *  - data: registro actual (para tomar data.id como EntidadId)
 *  - readOnly: si el form está solo lectura
 *  - setState: setState del estado principal del formulario
 *  - setSelectedTab: para poder volver a la pestaña "Formulario"
 *
 * Devuelve:
 *  - renderDocumentacionPanel(): JSX del panel de Documentación
 *  - persistirDocumentacion(entidadId): async, para usar en imprimir
 */
export const useSolicitudAfiliacionFormDoc = ({
  data,
  readOnly,
  setState,
  setSelectedTab,
}) => {
  //#region APIs documentación
  const { setState: setDocumentosQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Comunes",
        endpoint: `/DocumentacionEntidad/GetBySpec`,
        method: "GET",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  const { setState: createDocQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Comunes",
        endpoint: `/DocumentacionEntidad`,
        method: "POST",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  const { setState: updateDocQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Comunes",
        endpoint: `/DocumentacionEntidad`,
        method: "PUT",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );

  const { setState: deleteDocQuery } = useQueryState(
    () => ({
      config: {
        baseURL: "Comunes",
        endpoint: `/DocumentacionEntidad`,
        method: "DELETE",
      },
    }),
    { query: { config: { errorType: "response" } } }
  );
  //#endregion APIs documentación

  const [documentacionList, setDocumentacionList] = useState([]);

  // Carga inicial de documentación desde DocumentacionEntidad
  useEffect(() => {
    const entidadId = data?.id ?? 0;
    if (!entidadId) {
      setDocumentacionList([]);
      return;
    }

    setDocumentosQuery((o) => ({
      ...o,
      query: {
        ...o.query,
        params: { EntidadId: entidadId, EntidadTipo: "F" },
      },
      onLoad: ({ ok, error }) => {
        const arr = Array.isArray(ok) ? ok : [];
        setDocumentacionList(arr);
        if (error) {
          // Podés loguear si querés
        }
      },
    }));
  }, [data?.id, setDocumentosQuery]);

  // Guarda todos los registros de documentación (alta/modif) antes de imprimir
  const persistirDocumentacion = async (entidadId) => {
    const entidadTipo = "F";
    // Evitar múltiples persistencias simultáneas
    if (!persistirDocumentacion._running) persistirDocumentacion._running = { current: false };
    if (persistirDocumentacion._running.current) {
      console.warn("[persistirDocumentacion] llamado ignorado: ya está en curso");
      return;
    }
    persistirDocumentacion._running.current = true;

    let lista = Array.isArray(documentacionList) ? documentacionList : [];
    // Filtrar duplicados por id
    const seenIds = new Set();
    lista = lista.filter((d) => {
      if (d?.id) {
        if (seenIds.has(d.id)) return false;
        seenIds.add(d.id);
      }
      return true;
    });

    if (lista.length === 0) {
      persistirDocumentacion._running.current = false;
      return;
    }

    for (let i = 0; i < lista.length; i++) {
      const item = lista[i];
      const payload = mapDocToPayload(item, entidadId, entidadTipo);

      try {
        // UPDATE
        if (payload.id) {
          await new Promise((resolve, reject) => {
            updateDocQuery((o) => ({
              ...o,
              query: {
                ...o.query,
                config: {
                  ...(o.query?.config || {}),
                  body: payload,
                },
              },
              onLoad: (res) => {
                console.log(`[persistirDocumentacion] actualizado id=${payload.id} nombre=${item?.nombreArchivo}`);
                resolve(res);
              },
              onError: (err) => {
                console.error(`[persistirDocumentacion] error actualizando id=${payload.id} nombre=${item?.nombreArchivo}`, err);
                reject(err);
              },
            }));
          });
        } else {
          // CREATE
          await new Promise((resolve, reject) => {
            createDocQuery((o) => ({
              ...o,
              query: {
                ...o.query,
                config: {
                  ...(o.query?.config || {}),
                  body: payload,
                },
              },
              onLoad: (ok) => {
                if (ok?.id || ok?.Id) {
                  const newId = ok.id ?? ok.Id;
                  // Actualizar la lista global preservando items previos
                  setDocumentacionList((prev) => {
                    const full = Array.isArray(prev) ? prev.slice() : [];
                    // Intentar encontrar el item por id (si existe) o por nombreArchivo+descripcion para nuevos
                    const matchIndex = full.findIndex((d) => {
                      if (!d) return false;
                      if (d.id && item.id) return d.id === item.id;
                      if (!d.id && !item.id) return (
                        (d.nombreArchivo === item.nombreArchivo) &&
                        ((d.descripcion || "") === (item.descripcion || ""))
                      );
                      return false;
                    });
                    const updatedItem = { ...item, id: newId };
                    if (matchIndex === -1) {
                      full.push(updatedItem);
                    } else {
                      full[matchIndex] = { ...full[matchIndex], ...updatedItem };
                    }
                    setState((s) => ({ ...s, form: { ...s.form, documentacion: full } }));
                    return full;
                  });
                  console.log(`[persistirDocumentacion] creado id=${newId} nombre=${item?.nombreArchivo}`);
                }
                resolve(ok);
              },
              onError: (err) => {
                console.error(`[persistirDocumentacion] error creando nombre=${item?.nombreArchivo}`, err);
                reject(err);
              },
            }));
          });
        }
      } catch (e) {
        // error procesando archivo
      }
    }

    persistirDocumentacion._running.current = false;
  };

  const renderDocumentacionPanel = () => {
    const entidadId = data?.id ?? 0;
    const entidadTipo = "F";

    return (
      <Grid full col gap="10px">
        <Documentacion
          data={documentacionList}
          tipoDocumentacion={[
            "Credencial",
            "Documento de Identidad",
            "Formulario",
            "Otros",
          ]}
          disabled={readOnly}
          onChange={({ index, item }) => {
            const prev = Array.isArray(documentacionList)
              ? [...documentacionList]
              : [];

            // ALTA
            if (index == null && item != null) {
              const payload = mapDocToPayload(item, entidadId, entidadTipo);
              const temp = [...prev, { ...payload, id: item.id ?? 0 }];
              setDocumentacionList(temp);
              setState((s) => ({
                ...s,
                form: { ...s.form, documentacion: temp },
              }));

              if (!entidadId) return;

              createDocQuery((o) => ({
                ...o,
                query: {
                  ...o.query,
                  config: {
                    ...(o.query?.config || {}),
                    body: payload,
                  },
                },
                onLoad: ({ ok, error }) => {
                  if (error) {
                    setDocumentacionList(prev);
                    setState((s) => ({
                      ...s,
                      form: { ...s.form, documentacion: prev },
                    }));
                  } else {
                    const newId = ok?.id ?? item.id;
                    const next = [...temp];
                    next[next.length - 1] = {
                      ...next[next.length - 1],
                      id: newId,
                    };
                    setDocumentacionList(next);
                    setState((s) => ({
                      ...s,
                      form: { ...s.form, documentacion: next },
                    }));
                  }
                },
              }));
              return;
            }

            // BAJA
            if (index != null && item == null) {
              const current = prev[index];
              const id = current?.id;

              const next = prev.filter((_, i) => i !== index);
              setDocumentacionList(next);
              setState((s) => ({
                ...s,
                form: { ...s.form, documentacion: next },
              }));

              if (!id || !entidadId) return;

              deleteDocQuery((o) => ({
                ...o,
                query: {
                  ...(o.query || {}),
                  params: { ...(o.query?.params || {}), id },
                  config: {
                    ...(o.query?.config || {}),
                    headers: {
                      "Content-Type": "application/json",
                      ...(o.query?.config?.headers || {}),
                    },
                  },
                },
                onLoad: ({ error }) => {
                  if (error) {
                    setDocumentacionList(prev);
                    setState((s) => ({
                      ...s,
                      form: { ...s.form, documentacion: prev },
                    }));
                  }
                },
              }));
              return;
            }

            // MODIFICACIÓN
            if (index != null && item != null) {
              const current = prev[index] || {};
              const payload = mapDocToPayload(
                { ...current, ...item },
                entidadId,
                entidadTipo
              );
              const next = [...prev];
              next.splice(index, 1, { ...current, ...item });
              setDocumentacionList(next);
              setState((s) => ({
                ...s,
                form: { ...s.form, documentacion: next },
              }));

              if (!entidadId) return;

              updateDocQuery((o) => ({
                ...o,
                query: {
                  ...(o.query || {}),
                  config: {
                    ...(o.query?.config || {}),
                    body: payload,
                  },
                },
                onLoad: ({ error }) => {
                  if (error) {
                    setDocumentacionList(prev);
                    setState((s) => ({
                      ...s,
                      form: { ...s.form, documentacion: prev },
                    }));
                  }
                },
              }));
            }
          }}
        />
        {!readOnly && (
          <Button
            className="botonAmarillo"
            marginTop={3}
            width={50}
            onClick={() => setSelectedTab(0)}
          >
            CONFIRMA DOCUMENTACIÓN
          </Button>
        )}
      </Grid>
    );
  };

  return {
    renderDocumentacionPanel,
    persistirDocumentacion,
  };
};
