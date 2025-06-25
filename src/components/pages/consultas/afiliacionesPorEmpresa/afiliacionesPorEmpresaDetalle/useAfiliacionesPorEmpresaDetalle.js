import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import FormatearFecha from "components/helpers/FormatearFecha";
import AfiliacionesPorEmpresaDetalleTable from "./AfiliacionesPorEmpresaDetalleTable";


const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};
 
const useAfiliacionesPorEmpresaDetalle = () => {

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		//console.log('pushQuery_action',action);
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SolicitudAfiliacionEmpresas/GetaDetallesBySolicitudIdPaginationSpecs`,
						method: "GET",
					},
				};
			}
			case "GetById": {
				return {
					config: {
						baseURL: "Afiliaciones",
						//endpoint: `/ById/${params.id}`,
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
		params: {},
		cargos: [],
		data: [],
		error: null,
		selection: {...selectionDef},
	});

	useEffect(() => {
		if (!list.loading) return;
		pushQuery(
			{
			action: "GetList",
			params: {
				...list.params,
				//pageIndex: list?.pagination?.index,
				//pageSize: list?.pagination?.size,
			},
			onOk: async (data) =>
				setList((o) => {
					console.log('data_UseAutoridades:',data)
					const selection = {
						...selectionDef,
						record:
							data?.data?.find((r) => r.id === o.selection.record?.id) ?? data?.data?.at(0),
					};
					if (selection.record)
						selection.index = data.data.indexOf(selection.record);
					return {
						...o,
						loading: null,
						//pagination: { index, size, count },
						data: data.data.sort((a,b)=> a.refCargoJerarquia - b.refCargoJerarquia),
						error: null,
						selection,
					};
				}),
			onError: async (err) =>
				setList((o) => ({
					...o,
					loading: null,
					data: [],
					error: err.code === 404 ? null : err,
					selection: { ...selectionDef },
				})),
		});
	}, [pushQuery, list]);
	//#endregion

	const requestChanges = useCallback((type, payload = {}) => {
		
		switch (type) {
			case "selected": {
				return setList((o) => ({
					...o,
					selection: {
						...o.selection,
						request: payload.request,
						action: payload.action,
						edit: {
							...(payload.request === "A" ? {} : o.selection.record),
							...payload.record,
						},
					},
				}));
			}
			case "list": {
				if (payload.clear)
					return setList((o) => ({
						...o,
						loading: null,
						data: [],
						error: null,
						selection: {...selectionDef},
					}));
				return setList((o) => ({
					...o,
					loading: "Cargando...",
					params: { ...payload.params },
					data: [],
				}));
			}
			default:
				return;
		}
	}, []);

	const render = () => (
		<div>
			<AfiliacionesPorEmpresaDetalleTable
				data={list.data}
				loading={!!list.loading}
				noDataIndication={
					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
				}
				pagination={{
					...list.pagination,
					onChange: ({ index, size }) =>
						setList((o) => ({
							...o,
							loading: "Cargando...",
							pagination: { index, size },
							data: [],
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
			/>
		</div>
	);

	return [render, requestChanges, list.selection.record];
};

export default useAfiliacionesPorEmpresaDetalle;
