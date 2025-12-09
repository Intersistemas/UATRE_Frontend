import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Formato from "components/helpers/Formato";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import Viewer from "./Viewer";

const onCloseDef = () => {};

const columns = [
	{
		dataField: "nroAfiliado",
		text: "Nro. Afil.",
		sort: true,
		headerTitle: () => "Numero de Afiliado",
		headerStyle: { width: "6em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "cuil",
		text: "CUIL",
		sort: true,
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		formatter: (v, row) => (row.cuilValidado != 0 ? Formato.Cuit(row.cuilValidado) : Formato.Cuit(v)),
		//formatter: (v) => Formato.Cuit(v),
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "cuilValidado",
		text: "Val.",
		headerTitle: true,
		headerStyle: { width: "3em", textAlign: "center" },
		formatter: (v, { cuil }) => (v === 0 ? "N" : v === cuil ? "V" : "D"),
		csvFormat: (v, { cuil }) => (v === 0 ? "N" : v === cuil ? "V" : "D"),
		style: { textAlign: "center" },
	},
	{
		dataField: "documento",
		text: "Doc. Nro.",
		sort: true,
		headerTitle: () => "Documento número",
		headerStyle: { width: "7em", textAlign: "center" },
		formatter: (v) => Formato.DNI(v),
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "nombre",
		text: "Nombre",
		sort: true,
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "seccional",
		text: "Seccional",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "refDelegacionDescripcion",
		text: "Delegación",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
	},
	{
		dataField: "provincia",
		text: "Provincia",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "fechaIngreso",
		text: "F. Ingreso",
		sort: true,
		headerTitle: () => "Fecha de Ingreso",
		headerStyle: { width: "7em", textAlign: "center" },
		formatter: (v) => Formato.Fecha(v),
		csvFormat: (v) => Formato.Fecha(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "empresaCUIT",
		text: "CUIT",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		formatter: (v) => Formato.Cuit(v),
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "empresaDescripcion",
		text: "Empresa",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
];

const filtrosDef = { nroAfiliado: 1, nroAfiliadoHasta: 2147483647 };

//#region delegacionSelectOptions
const delegacionSelectTodos = { value: 0, label: "Todas" };
const delegacionSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: r.nombre, data: r }),
    filter: (r) => includeSearch(r, buscar),
    start: [delegacionSelectTodos],
    ...x,
  });
//#endregion delegacionSelectOptions

//#region seccionalSelectOptions
const seccionalSelectTodos = { value: 0, label: "Todas" };
const seccionalSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: [r.codigo, r.descripcion].join(" - ") }),
    filter: (r) => includeSearch(r, buscar),
    start: [seccionalSelectTodos],
    ...x,
  });
//#endregion seccionalSelectOptions

const AfiliadosNotaPeriodica = ({ onClose = onCloseDef }) => {
  //#region Trato queries a APIs
  const pushQuery = useQueryQueue((action) => {
    switch (action) {
      case "GetData": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado/GetAfiliadosWithSpec`,
						method: "POST",
					},
				};
			}
			case "GetEstados": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/EstadoSolicitud`,
						method: "GET",
					},
				};
			}
			case "GetProvincias": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Provincia`,
						method: "GET",
					},
				};
			}
			case "GetDelegaciones": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefDelegacion/GetAll`,
						method: "GET",
					},
				};
			}
			case "GetSeccionales": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/GetSeccionalesSpecs`,
						method: "POST",
					},
				};
			}
			case "GetMotivosBaja": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefMotivoBaja/GetByTipo`,
						method: "GET",
					},
				};
			}
      default:
        return null;
    }
  });
  //#endregion

  //#region filtros
  const [filtros, setFiltros] = useState({ ...filtrosDef });

  //#region filtro delegacion
  const [delegacionSelect, setDelegacionSelect] = useState({
    reload: true,
    loading: null,
    params: { soloActivos: true },
    data: [],
    error: null,
    buscar: "",
    options: [],
    selected: delegacionSelectTodos,
  });

  useEffect(() => {
    if (!delegacionSelect.reload) return;
    const changes = {
      reload: null,
      loading: "Cargando...",
      data: [],
      error: null,
      buscar: "",
      options: [],
    };
    setDelegacionSelect((o) => ({ ...o, ...changes }));
    pushQuery({
      action: "GetDelegaciones",
      params: { ...delegacionSelect.params },
      onOk: (data) => {
        if (!Array.isArray(data)) 
			return console.error("Se esperaba un arreglo", data);
        changes.data = data;
      },
      onError: (error) => (changes.error = error.toString()),
      onFinally: () => 
		setDelegacionSelect((o) => ({ ...o, ...changes, loading: null })),
    });
  }, [delegacionSelect, pushQuery]);
  // Buscador
  useEffect(() => {
    if (delegacionSelect.reload) return;
    if (delegacionSelect.loading) return;
    setDelegacionSelect((o) => ({ ...o, options: delegacionSelectOptions(o) }));
  }, [
	delegacionSelect.reload, 
	delegacionSelect.loading, 
	delegacionSelect.buscar,
]);
  //#endregion filtro delegacion

  //#region filtro fecha de ingreso
  const [fechaIngresoDesde, setfechaIngresoDesde] = useState(null);
  const [fechaIngresoHasta, setfechaIngresoHasta] = useState(null);

  const handlefechaIngresoFiltro = (desde = "", hasta = "") =>
    setFiltros((o) => {
      const f = { ...o };
      if (!desde && !hasta) {
        delete f.fechaIngreso;
        delete f.fechaIngresoHasta;
      } else if (!desde) {
        f.fechaIngreso = hasta;
        f.fechaIngresoHasta = hasta;
      } else if (!hasta) {
        f.fechaIngreso = desde;
        f.fechaIngresoHasta = desde;
      } else {
        f.fechaIngreso = desde;
        f.fechaIngresoHasta = hasta;
      }
      return f;
    });
  //#endregion filtro fecha de ingreso

  //#endregion filtros

  //#region list
  const [list, setList] = useState({
    reload: true,
    loading: null,
    pagination: { index: 1, size: 10 },
    sort: "nombre",
    params: { ...filtrosDef },
    data: [],
    selected: [],
    error: null,
  });

  useEffect(() => {
    if (!list.reload) return;
    const changes = { 
		reload: false, 
		loading: "Cargando...", 
		data: [], 
		error: null,
	};
    setList((o) => ({ ...o, ...changes }));
    // console.log("BODY =>", { ...list.params, sort: list.sort, pageIndex: list.pagination.index, pageSize: list.pagination.size });
    pushQuery({
      action: "GetData",
      config: {
        body: {
          ...list.params,
          sort: list.sort,
          pageIndex: list.pagination.index,
          pageSize: list.pagination.size,
        },
        errorType: "response",
      },
      onOk: async ({ data, ...pagination }) => {
        if (!Array.isArray(data)) 
			return console.error("Se esperaba un arreglo", data);
        changes.data = data;
        changes.pagination = pagination;
      },
      onError: async (error) => (changes.error = error.toString()),
      onFinally: async () =>
		 setList((o) => ({ ...o, ...changes, loading: null })),
    });
  }, [list, pushQuery]);
  //#endregion

  //#region nueva seleccion
  const [newSelection, setNewSelection] = useState({
    reload: false,
    loading: null,
    params: {},
    error: null,
  });

  useEffect(() => {
    if (!newSelection.reload) return;
    const changes = { 
		reload: false, 
		loading: "Cargando bloque 1...",
		error: null,
	 };
    const query = {
      action: "GetData",
      config: { 
		body: {
			 ...newSelection.params, 
			 pageIndex: 1,
			}, 
			errorType: "response",
		},
    };
    query.onOk = async ({ index, pages, size, data }) => {
      if (Array.isArray(data)) {
        setList((o) => ({
          ...o,
          selected: [...o.selected, ...data].filter(
			(v, i, a) => a.findIndex((r) => r.id === v.id) === i
		),
        }));
      } else {
        console.error("Se esperaba un arreglo", data);
      }
      if (index < pages) {
        changes.loading = `Cargando bloque ${index + 1} de ${pages}...`;
        query.config = {
			 body: { 
				...newSelection.params,
				 pageIndex: index + 1,
				  pageSize: size,
				}, 
				  errorType: "response",
				};
        pushQuery({ ...query });
      } else {
        changes.loading = null;
      }
    };
    query.onError = async (error) => {
      changes.loading = null;
      changes.error = error.toString();
    };
    query.onFinally = async () => 
		setNewSelection((o) => ({ ...o, ...changes }));
    setNewSelection((o) => ({ ...o, ...changes }));
    pushQuery(query);
  }, [newSelection, pushQuery]);
  //#endregion nueva seleccion

  //#region print
  const [print, setPrint] = useState(null);
  //#endregion print

  const onImprime = () => {
    const delegacion = {
      codigo: delegacionSelect.selected.data?.codigoDelegacion,
      descripcion: delegacionSelect.selected.data?.nombre,
      desdeFecha: filtros.fechaIngreso,
      hastaFecha: filtros.fechaIngresoHasta,
      seccionales: [],
    };
    
    // Usar cuilValidado para el PDF (si es válido, pisa el campo cuil)
    const CUIL_LENGTH = 11;
    const afiliadosConCuilValidado = list.selected.map((afiliado) => {
      const val = afiliado?.cuilValidado;
      if (val != null) {
        const digits = String(val).replace(/\D/g, "");
        if (Number(val) !== 0 && digits.length === CUIL_LENGTH) {
          return { ...afiliado, cuil: val };
        }
      }
      return afiliado;
    });
    
    afiliadosConCuilValidado.forEach((afiliado) => {
      let seccional = delegacion.seccionales.find(
		(s) => s.codigo === afiliado.seccionalCodigo
	);
      if (seccional == null) {
        seccional = { 
			codigo: afiliado.seccionalCodigo, 
			descripcion: afiliado.seccional, 
			afiliados: [] 
		};
        delegacion.seccionales.push(seccional);
      }
      seccional.afiliados.push(afiliado);
    });
    setPrint(
	<Viewer 
	data={delegacion} 
	onClose={() => setPrint(null)} 
	/>
);
  };

  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => onImprime(), "AltKey");

  return (
    <>
      <Modal size="xl" centered show /*onHide={() => onClose()}*/>
        <Modal.Header className={modalCss.modalCabecera} closeButton>
          Notificacion de afiliaciones para delegados
        </Modal.Header>
        <Modal.Body>
          <Grid col full gap="15px">
            <Grid width gap="inherit">
              <SearchSelectMaterial
                id="delegacionSelect"
                label="Delegación"
                error={!!delegacionSelect.error}
                helperText={
					delegacionSelect.loading ?? delegacionSelect?.error
				}
                value={delegacionSelect.selected}
                onChange={(selected) => {
                  setDelegacionSelect((o) => ({ ...o, selected }));
                  setFiltros((o) => {
                    const f = { 
						...o,
					 };
                    const val = Number(selected?.value);
                    if (!selected || val === 0) {
                      delete f.ambitoDelegaciones; 
                    } else {
                      f.ambitoDelegaciones = { ids: [val] };
                    }
                    return f;
                  });
                }}
                options={delegacionSelect.options}
                onTextChange={(buscar) =>
					 setDelegacionSelect((o) => ({ ...o, buscar }))
					}
              />
            </Grid>
            <Grid width gap="inherit">
              <Grid width>
                <InputMaterial
                  type="date"
                  label="Desde fecha de ingreso"
                  value={fechaIngresoDesde}
                  maxDate={fechaIngresoHasta}
                  onChange={(v) => {
                    const fechaIngresoDesde = v?.format("YYYY-MM-DD");
                    setfechaIngresoDesde(fechaIngresoDesde);
                    handlefechaIngresoFiltro(fechaIngresoDesde, fechaIngresoHasta);
                  }}
                />
              </Grid>
              <Grid width>
                <InputMaterial
                  type="date"
                  label="Hasta fecha de ingreso"
                  value={fechaIngresoHasta}
                  minDate={fechaIngresoDesde}
                  onChange={(v) => {
                    const fechaIngresoHasta = v?.format("YYYY-MM-DD");
                    setfechaIngresoHasta(fechaIngresoHasta);
                    handlefechaIngresoFiltro(fechaIngresoDesde, fechaIngresoHasta);
                  }}
                />
              </Grid>
              <Grid width/>
              <Grid width gap="inherit" justify="end">
                <Grid width="200px">
                  <Button
                    className="botonAzul"
                    disabled={
						JSON.stringify(list.params) === JSON.stringify(filtros)
					}
                    onClick={() => {
                      // Armo los parámetros que realmente voy a mandar
                      const params = { ...filtros };
                      const selVal = Number(delegacionSelect.selected?.value);

                      // Si NO hay ambitoDelegaciones o quedó vacío,
                      // y la selección es "Todas", intento armar con todas las delegaciones conocidas
                      if (!params.ambitoDelegaciones || !params.ambitoDelegaciones.ids?.length) {
                        if (selVal === 0) {
                          const allIds = (delegacionSelect.data || [])
                            .map((d) => Number(d.id))
                            .filter(Boolean);
                          if (allIds.length) {
                            params.ambitoDelegaciones = { ids: allIds };
                          } else {
                            // Si todavía no cargaron, NO mando el campo
                            delete params.ambitoDelegaciones;
                          }
                        } else if (selVal > 0) {
                          params.ambitoDelegaciones = { ids: [selVal] };
                        }
                      }
                      // Mantengo filtros sincronizados para botones dependientes
                      setFiltros(params);
                      setList((o) => ({
                        ...o,
                        reload: true,
                        params,
                        data: [],
                        error: null,
                        selected: [],
                        pagination: { ...o.pagination, index: 1, count: 0 },
                      }));
                    }}
                  >
                    Aplica filtros
                  </Button>
                </Grid>
                <Grid width="200px">
                  <Button
                    className="botonAzul"
                    disabled={
                      Object.keys(filtros).filter(
						(k) => !Object.keys(filtrosDef).includes(k)
					).length === 0
                    }
                    onClick={() => {
                      const base = { ...filtrosDef };
                      // Si ya tengo delegaciones cargadas, dejo preparado "Todas"
                      const allIds = (delegacionSelect.data || [])
                        .map((d) => Number(d.id))
                        .filter(Boolean);
                      const filtrosLimpios = allIds.length
                        ? { ...base, ambitoDelegaciones: { ids: allIds } }
                        : base;
                      setDelegacionSelect((o) => ({ 
						...o,
						 selected: delegacionSelectTodos
						 }));
                      setfechaIngresoDesde(null);
                      setfechaIngresoHasta(null);
                      setFiltros(filtrosLimpios);
                      if (JSON.stringify(list.params) === JSON.stringify(filtrosLimpios)) 
						return;
                      setList((o) => ({
                        ...o,
                        reload: true,
                        params: filtrosLimpios,
                        data: [],
                        selected: [],
                        error: null,
                      }));
                    }}
                  >
                    Limpia filtros
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Table
              remote
              keyField="id"
              data={list.data}
              mostrarBuscar={false}
              baseProps={{
				 style: { textAlign: "center", overflowX: "scroll" }, 
				}}
              pagination={{
                ...list.pagination,
                onChange: (pagination) =>
                  setList((o) => ({
                    ...o,
                    reload: true,
                    pagination: { ...o.pagination, ...pagination },
                    data: [],
                    error: null,
                  })),
              }}
              noDataIndication={
				list.loading || list.error || "No existen datos para mostrar "
			}
              selection={{
                mode: "checkbox",
                hideSelectColumn: false,
                selected: list.selected.map((r) => r.id),
                onSelect: (row, isSelect) => {
                  if (!isSelect === !list.selected.find((r) => r.id === row.id)) 
					return;
                  setList((o) => {
                    const selected = o.selected.filter((r) => r.id !== row.id);
                    if (isSelect) selected.push(row);
                    return { ...o, selected };
                  });
                },
                onSelectAll: (isSelect, rows) =>
                  setList((o) => {
                    const selected = o.selected.filter(
						(s) => !rows.find((r) => r.id === s.id)
					);
                    if (isSelect) selected.push(...rows);
                    return { ...o, selected };
                  }),
              }}
              columns={columns}
              onTableChange={(type, { sortOrder, sortField }) => {
                if (type === "sort") {
                  sortField = { cuil: "CUIL" }[sortField] ?? sortField;
                  const sort = `${sortField}${
					sortOrder === "desc" ? "Desc" : ""
				}`;
                  setList((o) => ({
                    ...o,
                    reload: true,
                    sort,
                    data: [],
                    error: null,
                    pagination: { ...o.pagination, count: 0 },
                  }));
                }
              }}
            />
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <Grid width col gap="5px">
            <Grid width gap="20px">
              <Grid width="200px">
                <Button
                  className="botonAmarillo"
                  onClick={() =>
                    setNewSelection((o) => ({
                      ...o,
                      params: { 
						...filtros,
						 sort: list.sort 
						},
                      reload: true,
                    }))
                  }
                >
                  SELECCIONA TODO
                </Button>
              </Grid>
              <Grid width="200px">
                <Button
                  className="botonAmarillo"
                  disabled={list.selected.length === 0}
                  onClick={() => setList((o) => ({ ...o, selected: [] }))}
                >
                  LIMPIA SELECCION
                </Button>
              </Grid>
              <Grid col grow>
                <Grid justify="center">
					Afiliados seleccionados: {list.selected.length}
					</Grid>
                <Grid justify="center" style={{ color: "green" }}>
                  {newSelection.loading}
                </Grid>
                <Grid justify="center" style={{ color: "red" }}>
                  {newSelection.error}
                </Grid>
              </Grid>
              <Grid width="150px">
                <Button
                  className="botonAmarillo"
                  disabled={list.selected.length === 0 || !filtros.ambitoDelegaciones || !filtros.fechaIngreso }
                  onClick={() => onImprime()}
                  tarea="Informes_Afiliados_NotificacionAfiliacionesDelegados_Imprime"
                >
                  IMPRIME
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
      {print}
    </>
  );
};

export default AfiliadosNotaPeriodica;
