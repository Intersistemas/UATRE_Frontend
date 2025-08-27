import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";

import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import useGeneracionExcel from "components/hooks/useGeneracionExcel";

import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import Table from "components/ui/Table/Table";
import modalCss from "components/ui/Modal/Modal.module.css";

/* ================= columnas de la tabla (preview) ================= */
const columns = [
  { dataField: "codigo", text: "Código", sort: true, headerStyle: { width: "100px", textAlign: "center" } },
  { dataField: "descripcion", text: "Nombre", sort: true, headerStyle: { minWidth: "220px" } },
  { dataField: "seccionalEstadoDescripcion", text: "Estado", sort: true, headerStyle: { width: "140px", textAlign: "center" } },
  { dataField: "domicilio", text: "Dirección", headerStyle: { minWidth: "220px" }, style: { textAlign: "left" } },
  { dataField: "email", text: "Email", headerStyle: { minWidth: "200px" }, style: { textAlign: "left" } },
  { dataField: "localidadNombre", text: "Localidad", headerStyle: { minWidth: "160px" } },
  { dataField: "provinciaDescripcion", text: "Provincia", headerStyle: { minWidth: "160px" } },
  { dataField: "refDelegacionDescripcion", text: "Delegación", headerStyle: { minWidth: "200px" } },
].map(c => ({
  headerTitle: () => c.text,
  headerStyle: { textAlign: "center", ...c.headerStyle },
  style: (value, row) => (row.deletedDate ? { color: "red" } : undefined),
  ...c
}));

/* ================= componente ================= */
const ExcelDatos = ({ delegacion = {}, onClose = () => {} }) => {
  const { exportToExcel } = useGeneracionExcel();

  /* ====== API builder ====== */
  const pushQuery = useQueryQueue((action, params = {}) => {
    const build = ({ baseURL, endpoint, method, body }) => ({
      config: { baseURL, endpoint, method },
      ...(body ? { body } : {})
    });
    switch (action) {
      case "GetSeccionales":
        // Usa el spec con filtros por delegación
        return build({
          baseURL: "Afiliaciones",
          endpoint: "/Seccional/GetSeccionalesSpecs",
          method: "POST",
          body: params
        });
      default:
        return null;
    }
  });

  /* ===== Filtros UI ===== */
  const [soloActivos, setSoloActivos] = useState(false);

  /* ===== Estado de lista / paginado local ===== */
  const [list, setList] = useState({
    reload: true,
    loading: null,
    error: null,
    rawAll: [],
    data: [],
    sort: "+codigo",
    pagination: { index: 1, size: 10, count: 0 }
  });

  // Trae TODAS las páginas de seccionales de la delegación seleccionada
  useEffect(() => {
    if (!list.reload) return;
    if (!delegacion?.id) return;

    setList(o => ({ ...o, loading: "Cargando...", error: null }));

    const pageSize = 1000;
    const MAX_PAGES = 10000;
    const acumulado = [];

    const pedirPagina = (pageIndex) =>
      new Promise((resolve, reject) => {
        pushQuery({
          action: "GetSeccionales",
          config: {
            errorType: "response",
            body: {
              refDelegacionId: delegacion.id,
              soloActivos,         
              pageIndex,
              pageSize,
              sort: list.sort      
            }
          },
          onOk: ({ data = [] }) => {
            if (!Array.isArray(data)) {
              reject(new Error("Formato inesperado de datos"));
              return;
            }
            acumulado.push(...data);
            resolve(data.length > 0);
          },
          onError: (err) => reject(err)
        });
      });

    (async () => {
      try {
        for (let i = 1; i <= MAX_PAGES; i++) {
          const hayMas = await pedirPagina(i);
          if (!hayMas) break;
        }
        const count = acumulado.length;
        const start = 0;
        const end = Math.min(list.pagination.size, count);
        setList(o => ({
          ...o,
          loading: null,
          rawAll: acumulado,
          data: acumulado.slice(start, end),
          pagination: { ...o.pagination, index: 1, count },
          reload: false
        }));
      } catch (e) {
        setList(o => ({ ...o, loading: null, error: e?.toString?.() ?? String(e), reload: false }));
      }
    })();
  }, [list.reload, delegacion?.id, soloActivos, list.sort, pushQuery]);

  // Recalcular página al cambiar index/size
  useEffect(() => {
    if (list.loading) return;
    const { index, size } = list.pagination;
    const start = (index - 1) * size;
    const end = start + size;
    setList(o => ({ ...o, data: o.rawAll.slice(start, end) }));
  }, [list.pagination.index, list.pagination.size]); 

  const onPageChange = (pagination) =>
    setList(o => ({ ...o, pagination: { ...o.pagination, ...pagination } }));

  const onSort = (sortField, sortOrder) => {
    const sort = `${sortOrder === "desc" ? "-" : "+"}${sortField}`;
    setList(o => ({ ...o, sort, pagination: { ...o.pagination, index: 1 }, reload: true }));
  };

  /* ===== Exporta Excel ===== */
  const [exportLoading, setExportLoading] = useState(false);

  const onExportExcel = async () => {
    if (exportLoading) return;
    if (!delegacion?.id) return;

    setExportLoading(true);
    try {
      if (!list.rawAll.length) {
        alert("No hay datos para exportar.");
        setExportLoading(false);
        return;
      }

      const datos = list.rawAll.map((r) => ({
        "Código Seccional": r.codigo ?? "",
        "Nombre Seccional": r.descripcion ?? "",
        "Estado": r.seccionalEstadoDescripcion ?? "",
        "Dirección": r.domicilio ?? "",
        "Email": r.email ?? "",
        "Localidad": r.localidadNombre ?? "",
        "Provincia": r.provinciaDescripcion ?? "",
        "Delegación": r.refDelegacionDescripcion ?? "",
      }));

      const sheetName = `Seccionales_${delegacion?.nombre || delegacion?.descripcion || delegacion?.id}`;
      const fileName = `Seccionales_${(delegacion?.nombre || delegacion?.descripcion || `Deleg_${delegacion?.id || ""}`).replace(/\s+/g, "_")}`;

      await exportToExcel([{ sheetName, data: datos }], fileName);
    } catch (e) {
      alert(`Error al generar Excel: ${e?.message ?? e}`);
    } finally {
      setExportLoading(false);
    }
  };

  /* ===== Hotkeys ===== */
  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => onExportExcel(), "AltKey");

  /* ===== Render ===== */
  const tituloDeleg =
    delegacion?.nombre ||
    delegacion?.descripcion ||
    (delegacion?.codigo ? `${delegacion?.codigo}` : "");

  return (
    <Modal size="xl" centered show>
      <Modal.Header className={modalCss.modalCabecera} closeButton>
        Informe de Seccionales — Seccional: {tituloDeleg || "Delegación seleccionada"}
      </Modal.Header>

      <Modal.Body>
        <Grid col full gap="15px">
          

          <Table
            remote
            keyField="id"
            data={list.data}
            mostrarBuscar={false}
            baseProps={{ style: { overflowX: "scroll" } }}
            tableStyle={{ minWidth: "1400px", textAlign: "center" }}
            pagination={{ ...list.pagination, onChange: onPageChange }}
            noDataIndication={list.loading || list.error || "No existen datos para mostrar"}
            columns={columns}
            onTableChange={(type, { sortOrder, sortField }) => {
              if (type === "sort") onSort(sortField, sortOrder);
            }}
          />
        </Grid>
      </Modal.Body>

      <Modal.Footer>
        <Grid>
          <Grid width gap="20px">
            <Grid width="200px">
              <Button
                className="botonAmarillo"
                disabled={exportLoading || (list.pagination.count ?? 0) === 0}
                onClick={onExportExcel}
              >
                {exportLoading ? "Generando..." : "DESCARGA EXCEL"}
              </Button>
            </Grid>
            <Grid width="150px">
              <Button className="botonAmarillo" onClick={() => onClose()}>
                FINALIZA
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal.Footer>
    </Modal>
  );
};

export default ExcelDatos;

