import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import useHttp from "components/hooks/useHttp";
import { matchIsValidTel } from "mui-tel-input";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import JoinOjects from "components/helpers/JoinObjects";
import { pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import ValidarCUIT from "components/validators/ValidarCUIT";
import ValidarEmail from "components/validators/ValidarEmail";
import AfiliadoFormulariosAfiliacionTable from "./AfiliadoFormulariosAfiliacionTable";
import AfiliadoFormulariosAfiliacionIncorporacion from "./AfiliadoFormulariosAfiliacionIncorporacion";
import SolicitudAfiliacionForm from "./SolicitudAfiliacionForm";
import { handleModuloEjecutarAccion } from "../../../../redux/actions";
import AfiliadoAceptaSolicitud from "components/pages/afiliados/AfiliadoAgregar";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	apply: [],
	errors: null,
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

export const onDataChangeDef = (data = []) => {};

const useAfiliadoFormulariosAfiliacion = ({
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
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		console.log("action_useAfiliadoFormulario",action)
		switch (action) {
			
			case "GetList": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/AfiliadoFormulariosAfiliacion/GetAfiliadosFAWithSpec`,
						method: "POST",
					},
				};
			}
			case "Patch": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/AfiliadoFormulariosAfiliacion/ResuelveFormularioAfiliacion`,
						method: "PATCH",
					},
				};
			}
			case "Estados": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/EstadoSolicitud`,
						method: "GET",
					},
				};
			}
			/*case "Update": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactiva": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/Reactivar`,
						method: "PATCH",
					},
				};
			}*/
			default:
				return null;
		}
	});
	//#endregion

	//#region despachar Informar Modulo
	    const dispatch = useDispatch();
		const moduloAccion = useSelector((state) => state.moduloAccion);
	//#endregion

	  //#region Tablas para el form
	  const [estadosSolicitudes, setEstadosSolicitudes] = useState([
		{ value: 0, label: " Todos" },
	  ]);
	  //#endregion
	const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false);
	const [accionSeleccionada, setAccionSeleccionada] = useState("");

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		estados: [],
		loading: null,
		remote: remoteInit,
		loadingOverride: loading,
		params: { ...paramsInit },
		pagination: { index: 1, size: 5, ...paginationInit },
		data: [...AsArray(dataInit, true)],
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

	const { isLoading, error2, sendRequest: request2 } = useHttp();

	  //#endregion


	  
  useEffect(() => {
    const processEstadosSolicitudes = async (estadosSolicitudesObj) => {
      const estadosSolicitudesTable = estadosSolicitudesObj.map(
        (estadoSolicitud) => {
          return {
            value: estadoSolicitud.id,
            label: estadoSolicitud.descripcion,
          };
        }
      );
      const estadosSolicitudesOptions = estadosSolicitudesTable.filter(
        (estado) => estado.label !== "Sin Asignar" & estado.label !== "Observado"
      );

      estadosSolicitudesOptions.push({ value: 0, label: "Todos" });
      console.log("estadosSolicitudesOptions", estadosSolicitudesOptions);
      setEstadosSolicitudes(
        estadosSolicitudesOptions.sort((a, b) => (a.value > b.value ? 1 : -1))
      );
      //setEstadosSolicitudes(estadosSolicitudes);
    };

    request2(
      {
        baseURL: "Afiliaciones",
        endpoint: "/EstadoSolicitud",
        method: "GET",
      },
      processEstadosSolicitudes
    );
  }, []);

  //#endregion

	const onCloseAfiliadoAgregarHandler = (regUpdated, accion) => { //ESTA FUNCION CIERRA EL MODAL DE ALTA/MODIFICACION/RESUELVE.SOLICIT.
		
		console.log('onCloseAfiliadoAgregarHandler: ',regUpdated, accion);
			if (!regUpdated.id) {
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
			}else{
				if (regUpdated.id) 
				{ const query = {
					action: "Patch",
					config: {
							body: {
								id: list.selection.record.id,
								afiliadoIdAsignado: regUpdated.id
								//deletedObs: record.deletedObs,
							}
					},
					onOk: async (res) =>
						setList((old) => ({ ...old, loading: "Cargando..." })),
					onError: async (err) => alert(err.message),
					};
					pushQuery(query);
				}else{
					console.log('No es Agrega');
				}
				
			}
				/*
				(regUpdated.estadoSolicitud == "Activo") ? 
				  setPage(1)//El afiliado insertado tiene NroAfiliado y se agregó con estado ATIVO, Voy a la pagina 1
				  :
				  setPage(totalPageIndex)//El afiliado insertado no tiene NroAfiliado, voy a la ultima pagina de la grilla) 
				  */
			  }


		/*if(regUpdated){ //SI SE HIZO UNA ALTA // MODIFICACION ACTUALIZO EL OBJETO CON EL NUEVO ESTADO ...
			setRefresh(true); //Agrego el refresh para que se actualice el registro 
			setAfiliadoModificado(regUpdated)
  
			if (accion === "Resuelve"){
			  regUpdated.estadoSolicitud == "Activo" && setPage(1); //Si fue resuelto (tiene NroAfiliado) y no hay filtro, el registro va a parar a la primer pagina, entonces lo busco allí
			}else{
			  accion === "Agrega" ? 
			  (regUpdated.estadoSolicitud == "Activo") ? 
				setPage(1)//El afiliado insertado tiene NroAfiliado y se agregó con estado ATIVO, Voy a la pagina 1
				:
				setPage(totalPageIndex)//El afiliado insertado no tiene NroAfiliado, voy a la ultima pagina de la grilla) 
			  :
			  console.log('No es Agrega');
			}
		}*/
		
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
					body: {
					...list.params,
					pageIndex: list.pagination.index,
					pageSize: list.pagination.size,
				},
			},
			onOk: async ({ index, size, count, data }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
				const multi = list.selection.multi;
				const record = list.selection.record;
				changes.pagination = { index, size, count };
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

		pushQuery({
			action: "Estados",
			config: {
					body: {
					...list.params,
					pageIndex: list.pagination.index,
					pageSize: list.pagination.size,
				},
			},
			onOk: async ({ index, size, count, data }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
				const multi = list.selection.multi;
				const record = list.selection.record;
				changes.pagination = { index, size, count };
				changes.selection = {
					...list.selection,
					...selectionDef,
					record: list.onLoadSelect({ data, multi, record }),
				};

				changes.selection.index = multi
					? changes.selection.record?.map((r) => changes.data.indexOf(r))
					: changes.data.indexOf(changes.selection.record);

				list.estados.onDataChange(changes.data);
			},
			onError: async (error) => {
				if (error.code === 404) return;
				changes.error = error;
				changes.selection = { ...list.selection, ...selectionDef };
			},
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, list]);
	//#endregion

	const request = useCallback((type, payload = {}) => {
		switch (type) {
			case "selected": {
				return setList((o) => {
					const apply = [];
					if (payload.request !== "A") {
						apply.push(
							...AsArray(
								"record" in payload ? payload.record : o.selection.record,
								true
							)
								.map(({ id }) => id)
								.filter((r) => r)
						);
					}
					const edit = {
						...(payload.request === "A"
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
			default:
				return;
		}
	}, [pushQuery]);

	let form = null;
	if (list.selection.request == "A") {
		form = (
			<SolicitudAfiliacionForm 
				onClose={(confirm) => {
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
					}}}
			/>
		);
	}
	//if (afiliadoAgregarShow) {
	if (list.selection.request == "S") {
		form =   ( <AfiliadoAceptaSolicitud
			onClose={onCloseAfiliadoAgregarHandler}
			estadosSolicitudes={estadosSolicitudes}
			accion={"AceptaSolicitud"}
			cuil={list.selection.record?.cuil}
			afiliadoSeleccionado = {list.selection.record}
		/>
	)}

	const render = () => (
		<>
			<AfiliadoFormulariosAfiliacionTable
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
							let { sortField, sortOrder } = newState;
							sortField = { fecha: "Fecha" }[sortField] ?? sortField;
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
			{form}
		</>
	);

	return { render, request, selected: list.selection.record };
};

export default useAfiliadoFormulariosAfiliacion;
