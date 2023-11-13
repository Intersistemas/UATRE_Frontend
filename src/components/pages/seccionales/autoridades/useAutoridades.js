import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AutoridadesTable from "./AutoridadesTable";
import ColaboradoresForm from "./SeccionalAutoridadesForm";
import ValidarCUIT from "components/validators/ValidarCUIT";
import SeccionalesForm from "../SeccionalesForm";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	errors: null,
};

const useAutoridades = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetList": {
				const { id, soloActivos, ...otherParams } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalAutoridad/GetSeccionalAutoridadBySeccional`,
						//endpoint: `/SeccionalAutoridad/GetSeccionalAutoridadBySeccional?SeccionalId=${id}&SoloActivos=${soloActivos}`,
						method: "GET",
					},
					params: otherParams,
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalAutoridad`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalAutoridad`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalAutoridad/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactivate": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalAutoridad/Reactivar`,
						method: "PATCH",
					},
				};
			}
			case "GetAfiliado": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/Afiliado/GetAfiliadoByCUIL`,
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
		pagination: { index: 1, size: 5 },
		data: [],
		error: null,
		selection: {...selectionDef},
	});

	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: "GetList",
			params: {
				...list.params,
				pageIndex: list.pagination.index,
				pageSize: list.pagination.size,
			},
			onOk: async ({ index, size, count, data }) =>
				setList((o) => {
					console.log('data_autoridades:',data)
					const selection = {
						action: "",
						request: "",
						record:
							data?.find((r) => r.id === o.selection.record?.id) ?? data?.at(0),
					};
					if (selection.record) {
						selection.index = data.indexOf(selection.record);
						selection.record = { ...selection.record };
					}
					return {
						...o,
						loading: null,
						pagination: { index, size, count },
						data,
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
					selection: {...selectionDef},
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
						record: {
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
		<>
			<AutoridadesTable
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
								action: "",
								request: "",
								index,
								record,
							},
						})),
				}}
			/>
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useAutoridades;
