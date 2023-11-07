import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import ColaboradoresTable from "./ColaboradoresTable";
import ColaboradoresForm from "./ColaboradoresForm";
import ValidarCUIT from "components/validators/ValidarCUIT";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	errors: null,
};

const useColaboradores = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores/GetWithSpecs`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactivate": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DelegacionColaboradores/Reactivar`,
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
					const selection = {
						action: "",
						request: "",
						record:
							data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
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

	let form = null;
	if (list.selection.request) {
		form = (
			<ColaboradoresForm
				data={list.selection.record}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								afiliadoId: true,
								esAuxiliar: true,
						  };
					if (list.selection.request !== "B") r.deletedObs = true;
					return r;
				})()}
				hide={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {};
					if (list.selection.request !== "R") r.obs = true;
					return r;
				})()}
				onChange={(record) => {
					const changes = { record: { ...record }, errors: {} };
					const applyChanges = ({ record, errors } = changes) =>
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								record: { ...o.selection.record, ...record },
								errors: { ...o.selection.errors, ...errors },
							},
						}));
					if ("afiliadoCuil" in record) {
						changes.record.afiliadoId = 0;
						changes.record.afiliadoNombre = "";
						changes.errors.afiliadoCuil = "";
						if (`${record.afiliadoCuil}`.length !== 11) {
							changes.errors.afiliadoNombre = "";
						} else if (ValidarCUIT(record.afiliadoCuil)) {
							changes.errors.afiliadoNombre = "Cargando...";
						} else {
							changes.errors.afiliadoCuil = "CUIL incorrecto";
						}
						applyChanges();
						if (changes.errors.afiliadoNombre === "Cargando...") {
							pushQuery({
								action: "GetAfiliado",
								params: { cuil: record.afiliadoCuil },
								onOk: async (ok) => {
									changes.record.afiliadoId = ok.id;
									changes.record.afiliadoNombre = ok.nombre;
									changes.errors.afiliadoNombre = "";
								},
								onError: async (error) => {
									changes.errors.afiliadoNombre =
										error.message ?? "Error obteniendo datos del afiliado";
								},
								onFinally: async () => applyChanges(),
							});
						}
					} else {
						applyChanges();
					}
				}}
				onClose={(confirm) => {
					if (!["A", "B", "M", "R"].includes(list.selection.request))
						confirm = false;
					if (!confirm) {
						setList((o) => {
							const selection = {
								...o.selection,
								request: "",
								action: "",
								record: o.data.at(o.selection.index),
								errors: null,
							};
							if (selection.record) {
								selection.record = { ...selection.record };
							}
							return { ...o, selection };
						});
						return;
					}

					const record = { ...list.selection.record };

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						// if (!record.deletedObs)
						// 	errors.deletedObs = "Dato requerido";
					} else {
						if (!record.afiliadoId)
							errors.afiliadoCuil = "Debe ingresar un afiliado existente";
						if (record.esAuxiliar == null) errors.esAuxiliar = "Dato requerido";
					}
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

					const query = {
						config: {},
						onOk: async (res) =>
							setList((old) => ({ ...old, loading: "Cargando..." })),
						onError: async (err) => alert(err.message),
					};
					switch (list.selection.request) {
						case "A": {
							query.action = "Create";
							query.config.body = record;
							break;
						}
						case "M": {
							query.action = "Update";
							query.config.body = record;
							break;
						}
						case "B": {
							query.action = "Delete";
							query.config.body = {
								id: record.id,
								deletedObs: record.deletedObs,
							};
							break;
						}
						case "R": {
							query.action = "Reactivate";
							query.config.body = {
								id: record.id,
								obs: record.obs,
							};
							break;
						}
						default:
							break;
					}
					pushQuery(query);
				}}
			/>
		);
	}

	const render = () => (
		<>
			<ColaboradoresTable
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
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useColaboradores;
