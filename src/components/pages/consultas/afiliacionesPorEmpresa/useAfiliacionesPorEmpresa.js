import React, { useCallback, useContext, useEffect, useState } from "react";
import AsArray from "components/helpers/AsArray";
import JoinOjects from "components/helpers/JoinObjects";
import { pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import ValidarCUIT from "components/validators/ValidarCUIT";
import AfiliacionesPorEmpresaTable from "./AfiliacionesPorEmpresaTable";
import FormularioOspreraForm from "./AfiliacionesPorEmpresaForm";
import moment from "moment/moment";
import AuthContext from "store/authContext"; 
import useAmbitos from 'components/hooks/useAmbitos';
import Grid from "components/ui/Grid/Grid";
import styles from "./AfiliacionesPorEmpresa.module.css";
import InputMaterial from "components/ui/Input/InputMaterial";
import SearchSelectMaterial, {
  includeSearch,
  mapOptions,
} from "components/ui/Select/SearchSelectMaterial";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	apply: [],
	errors: null,
};

const toLocalDateTimeString = (d, { endOfDay = false } = {}) => {
  if (!d) return undefined;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  const pad = (n, s = 2) => String(n).padStart(s, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const MM = pad(date.getMinutes());
  const SS = pad(date.getSeconds());
  const mmm = String(date.getMilliseconds()).padStart(3, "0");
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}.${mmm}`;
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

export const onLoadSelectKeepOrFirst = ({ data, multi, record }) => record ?? onLoadSelectFirst({ data, multi, record });

const mapGetListParams = (p = {}) => {
  const out = {};
  if (p.estadoSolicitudId != null) out.EstadoSolicitudId = p.estadoSolicitudId;
  if (p.seccionalId != null) out.SeccionalId = p.seccionalId;
  if (p.empresaCUIT) out.EmpresaCUIT = String(p.empresaCUIT);
  if (p.fechaDesde) out.FechaDesde = toLocalDateTimeString(p.fechaDesde, { endOfDay: false });
  if (p.fechaHasta) out.FechaHasta = toLocalDateTimeString(p.fechaHasta, { endOfDay: true });

  return out;
};

export const onDataChangeDef = (data = []) => {};

//#region estadoSelectOptions
const estadoSelectTodos = { value: 0, label: "Todos" };
const estadoSelectOptions = ({ data = [], buscar = "", ...x }) =>
  mapOptions({
	data,
	map: (r) => ({ value: r.id, label: r.descripcion }),
	filter: (r) => includeSearch(r, buscar),
	start: [estadoSelectTodos],
	...x,
  });
//#endregion estadoSelectOptions

const useAfiliacionesPorEmpresa = ({
	remote: remoteInit = true,
	data: dataInit = [],
	loading,
	error,
	params: paramsInit = {},
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 15 },
	onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
	onDataChange: onDataChangeInit = onDataChangeDef,
	columns,
	hideSelectColumn = true,
	mostrarBuscar = false,
} = {}) => {
	
	const { usuario } = useContext(AuthContext);
	const ambito = useAmbitos().ambitoUser();

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		console.log("useAfiliacionesPorEmpresa pushQuery", action, params);
		switch (action) {
			case "GetList": {
				const { filtro2, ...otherParams } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
            			endpoint: `/SolicitudAfiliacionEmpresas/GetSolicitudAfiliacionEmpresasSpecs`,
						method: "GET",
					},
					params: otherParams,
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

				// Obtener datos de la tabla principal
			case "PatchEstados": {
				return {
				config: {
					baseURL: "Afiliaciones",
					endpoint: `/SolicitudAfiliacionEmpresas/PatchSolicitud/${params.solicitudId}`,    
					method: "PATCH",
				},
				};
			}
			
			 // Obtener datos para el PDF
			case "dataPFDDesdeApi": {
				return {
				config: {
					baseURL: "DDJJ",
					endpoint: `/DDJJUatre/GetCUITPeriodosDesdeHasta`,
					method: "GET",
				},
				};
			}
			// Obtener datos totales desde la API
			case "dataTotalesDesdeApi": {
				return {
				config: {
					baseURL: "DDJJ",
					endpoint: `/DDJJUatre/GetVAfiliacionesPorEmpresaCUITPeriodos`,
					method: "GET",
				},
				};
			}
			case "GetDetallesBySolicitudId": {
				return {
				config: {
					baseURL: "Afiliaciones",
					endpoint: `/SolicitudAfiliacionEmpresas/GetaDetallesBySolicitudIdPaginationSpecs`,
					method: "GET",
				},
				};
			}

			default:
				return null;
			}
		});
		//#endregion

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		remote: remoteInit,
		loadingOverride: loading,
		params: { ...paramsInit },
		pagination: { index: 1, size: 5, ...paginationInit },
		data: [...AsArray(dataInit, true)],
		seccionales: [],
		error,
		selection: {
			...selectionDef,
			multi: multiInit,
		},
		onLoadSelect:
			onLoadSelectInit === onLoadSelectFirst && multiInit
				? onLoadSelectSame
				: onLoadSelectInit,
		onDataChange: onDataChangeInit ?? onDataChangeDef,
	});


	//#region filtro estado
	  const [estadoSelect, setEstadoSelect] = useState({
		reload: true,
		loading: null,
		params: { soloActivos: true },
		data: [],
		error: null,
		buscar: "",
		options: [],
		selected: estadoSelectTodos,
	  });
	
	  // Este useEffect se encarga de cargar las opciones del select de "estado" desde la API.
	  // Se ejecuta cada vez que cambia 'estadoSelect' o 'pushQuery'.
	  useEffect(() => {
		// Si no se requiere recargar (reload es falso), no hace nada.
		if (!estadoSelect.reload) return;
	
		// Prepara un objeto con los cambios iniciales: pone el loading, limpia datos previos, etc.
		const changes = {
		  reload: null, // Ya no se necesita recargar
		  loading: "Cargando...", // Muestra mensaje de carga
		  data: [], // Limpia datos anteriores
		  error: null, // Limpia errores anteriores
		  buscar: "", // Limpia búsqueda previa
		  options: [], // Limpia opciones previas
		};
	
		// Actualiza el estado para reflejar que está cargando
		setEstadoSelect((o) => ({ ...o, ...changes }));
	
		// Llama a la API para obtener los estados
		pushQuery({
		  action: "GetEstados", // Acción a ejecutar (ver configuración en pushQuery)
		  params: { ...estadoSelect.params }, // Parámetros para la consulta
		  onOk: (data) => {
			// Si la respuesta no es un array, muestra error en consola
			if (!Array.isArray(data))
			  return console.error("Se esperaba un arreglo", data);
			// Si es un array, guarda los datos en 'changes'
			changes.data = data.filter((d) => d.tipo == "Solicitudes"); // Filtra el estado "Todos" (id 0)
		  },
		  onError: (error) => (changes.error = error.toString()), // Guarda el error si ocurre
		  onFinally: () =>
			// Al finalizar, actualiza el estado con los cambios y quita el loading
			setEstadoSelect((o) => ({ ...o, ...changes, loading: null })),
		});
	  }, [estadoSelect, pushQuery]);
	
	  // Buscador
	  useEffect(() => {
		if (estadoSelect.reload) return;
		if (estadoSelect.loading) return;
		setEstadoSelect((o) => ({ ...o, options: estadoSelectOptions(o) }));
	  }, [estadoSelect.reload, estadoSelect.loading, estadoSelect.buscar]);
	  //#endregion filtro estado
	
					

	useEffect(() => {
		console.log("list",list)
		if (!list.loading) return;
		const changes = { loading: null, error: null };
		/*if (!list.remote) {
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
		}*/
		changes.data = [];


   pushQuery({
     action: "GetList",
   params: {
      pageIndex: list.pagination.index,
      pageSize: list.pagination.size,
      orderBy: list.params?.orderBy ?? "IdDesc",
      ...mapGetListParams(list.params), 
    },
     onOk: async ({ index, size, count, data }) => {
       if (!Array.isArray(data)) {
         console.error("Se esperaba un arreglo", data);
         return;
       }
       console.log("data de la solicitud modificada:", data);
       changes.data = data;
       const multi = list.selection.multi;
       const record = list.selection.record;
       changes.pagination = { index, size, count };
       changes.selection = {
         ...list.selection,
         ...selectionDef,
         record: list.onLoadSelect({ data, multi, record })
       };
       changes.selection.index = multi
         ? changes.selection.record?.map((r) => changes.data.indexOf(r))
         : changes.data.indexOf(changes.selection.record);
       list.onDataChange(changes.data);
     },
     onError: async (error) => {
       if (error.code === 404) {
         return;
       }
       changes.error = error;
       changes.selection = { ...list.selection, ...selectionDef };
     },
     onFinally: async () => {
       setList((o) => ({ ...o, ...changes }));
     }
   });
	}, [pushQuery, list]);
	//#endregion

	const request = useCallback((type, payload = {}) => {
		console.log("type y payload", type, payload);
		switch (type) {
			case "selected": {
				return setList((o) => {
					const apply = [];
					
					const edit = {
						...(payload.request === "N"
							? {}
							: JoinOjects(o.selection.record)),
						...JoinOjects(payload.record),
					};
					return {
						...o,
						selection: {
							...o.selection,
							request: payload.request,
							action: payload.action,
							edit,
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
						onLoadSelect:
							"onLoadSelect" in payload
								? payload.onLoadSelect
								: o.onLoadSelect,
						selection: {
							...o.selection,
							multi: "multi" in payload ? !!payload.multi : o.selection.multi,
						},
					};
					if (payload.params) {
						changes.params = {
							...pick(o.params, paramsInit),
							...payload.params
						};
					}
					if (payload.pagination)
						changes.pagination = { ...o.pagination, ...payload.pagination };
					if (payload.clear) {
						const data = changes.data;
						const multi = changes.selection.multi;
						const record = o.selection.record;
						changes.selection = {
							...changes.selection,
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
			case "patchEstados": {
				const query = {
					action: "PatchEstados",
					config: payload.config ?? {},
					params: payload.params,
					onOk: async (response) => {
						setList((old) => ({ ...old, loading: "Cargando..." }));
					},
					onError: async (err) => alert(err.message),
				};

				pushQuery(query);
				return setList((o) => ({ ...o, loading: "Cargando..." }));
			}

			default:
				return;
		}
	}, [pushQuery]);

	let form = null;
	if (list.selection.request) {
		form = (
			<FormularioOspreraForm
				estadosSolicitudes={estadoSelect.data}
				data={(() => { 
					const data =
					["A"].includes(list.selection.request) ?  //INIT PARA ALTA
						{
							seccionalId: list.selection.edit.seccionalId ?? usuario?.ambitoSeccionales?.ids[0] ?? 0,
						}
						:
						["B"].includes(list.selection.request) ? //INIT PARA BAJA
							{
								deletedDate: moment().format("YYYY-MM-DD"),
								deletedBy: usuario.nombre,
							}:
							{}
						return {...list.selection.edit, ...data}; //le paso el registro entero  y modifico los campos necesarios segun el request que se está haciendo
					})()
				}

				title={list.selection.action}
				errors={list.selection.errors}
				request={list.selection.request}
				// help={list.selection.help}
				loading={!!list.loading}
				disabled={(() => {
					const r = { //TODOS LOS CAMPOS DESHABILITADOS POR DEFECTO
								seccionalId: true,
							}
					
					r.seccionalId = ambito.tipo == "Todos" ? false : true; //si el ambito es todos, no se puede modificar la secc=onalId
					return r;
				})()}
				hide={
					["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {}
				}
				onChange={() => {
					
				}}
				

				onClose={() => {
					setList((old) => ({ ...old, loading: "Cargando..." }))
				}}
			/>
		);
	}

	const render = () => (
		<>
			<AfiliacionesPorEmpresaTable
				remote={list.remote}
				data={list.data}
				loading={!!list.loading || !!list.loadingOverride}
				noDataIndication={
					list.loading ??
					list.loadingOverride ??
					list.error?.message ??
					"No existen datos para mostrar"
				}
				columns={columns}
				mostrarBuscar={mostrarBuscar}
				pagination={{
					...list.pagination,
					onChange: ({ index, size }) =>
						setList((o) => ({
							...o,
							loading: "Cargando...",
							pagination: { index, size },
							data: o.remote ? [] : o.data,
						})),
				}}
				selection={{
					selected: [list.selection.record?.id].filter((r) => r),
					onSelect: (record, isSelect, index, e) =>
						setList((o) => ({
							...o,
							selection: {
								...selectionDef,
								index,
								record,
							},
						})),
				}}
				onTableChange={(type, newState) => {
					switch (type) {
						case "sort": {
							let { sortField, sortOrder } = newState;
							sortField = { cuitTitular: "CUIT" }[sortField] ?? sortField;
							return setList((o) => ({
								...o,
								loading: "Cargando...",
								params: {
									...o.params,
									orderBy: `${sortField}${sortOrder === "desc" ? "Desc" : ""}`,
								},
							}));
						}
						default:
							return;
					}
				}}
			/>
			<Grid className={`${styles.fondo} ${styles.grupo}`} col>
				<Grid className={`${styles.contenido} ${styles.titulo}`} gap="1rem">
					<Grid>Información Detallada de solicitud:</Grid>
				</Grid>
				<Grid className={styles.grupo} col full>
					<Grid className={styles.contenido} col>
						<Grid>
							<InputMaterial  label="Nombre de Seccional" width="87rem" value={list.selection?.record?.seccionalCodigo ? `${list.selection?.record?.seccionalCodigo}-${list.selection?.record?.seccional}` : "Sin Asignación"}/>
							<InputMaterial label="Estado Observaciones" value={list.selection?.record?.estadoSolicitudDescripcion}/>	
						</Grid>
					</Grid>
				</Grid>
			</Grid>
			{form}
		</>
	);

	return { render, request, selected: list.selection.record };
};

export default useAfiliacionesPorEmpresa;