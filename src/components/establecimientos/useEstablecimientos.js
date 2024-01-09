import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import EstablecimientosTable from "./EstablecimientosTable";
import EstablecimientosForm from "./EstablecimientosForm";
import ValidarEmail from "components/validators/ValidarEmail";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};

const useEstablecimientos = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/EmpresaEstablecimientos`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/EmpresaEstablecimientos`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/EmpresaEstablecimientos/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactivate": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/EmpresaEstablecimientos/Reactivar`,
						method: "PATCH",
					},
				};
			}
			case "GetMotivosBaja":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefMotivoBaja/GetByTipo`,
						method: "GET",
					},
				};
			case "GetAfiliado": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/Afiliado/GetAfiliadoByCUIL`,
					},
				};
			}
			case "GetProvincias": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/Provincia`,
					},
				};
			}
			case "GetLocalidades": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/RefLocalidad`,
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region declaración y carga de dependencias

	//#region declaración y carga de motivosBaja
	const [motivosBaja, setMotivosBaja] = useState({
		loading: "Cargando...",
		params: { tipo: "E" },
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!motivosBaja.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetMotivosBaja",
			params: motivosBaja.params,
			onOk: async (data) =>
				changes.data.push(
					...data.map((r) => ({
						label: r.descripcion,
						value: r.id,
					}))
				),
			onError: async (error) => (changes.error = error),
			onFinally: async () => setMotivosBaja((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, motivosBaja]);
	//#endregion

	//#region declaración y carga de provincias
	const [provincias, setProvincias] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!provincias.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetProvincias",
			params: provincias.params,
			onOk: async (data) =>
				changes.data.push(
					...data
					.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
					.map((r) => ({ label: r.nombre, value: r.id }))
				),
			onError: async (error) => (changes.error = error),
			onFinally: async () => setProvincias((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, provincias]);
	//#endregion

	//#region declaración y carga de localidades
	const [localidades, setLocalidades] = useState({
		loading: null,
		params: { provinciaId: 0 },
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!localidades.loading) return;
		const changes = { loading: null, data: [], error: null };
		pushQuery({
			action: "GetLocalidades",
			params: localidades.params,
			onOk: async (data) =>
				changes.data.push(
					...data
						.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
						.map((r) => ({ label: r.nombre, value: r.id }))
				),
			onError: async (error) => (changes.error = error),
			onFinally: async () => setLocalidades((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, localidades]);
	//#endregion

	//#endregion

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		params: {},
		pagination: { index: 1, size: 5 }, 
		data: [],
		error: null,
		selection: { ...selectionDef },
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
						...selectionDef,
						record:
							data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
					};
					if (selection.record)
						selection.index = data.indexOf(selection.record);
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
					selection: { ...selectionDef },
				})),
		});
	}, [pushQuery, list]);
	//#endregion

	const requestChanges = useCallback((type, payload = {}) => {
		switch (type) {
			case "selected": {
				return setList((o) => {
					const newList = {
						...o,
						selection: {
							...o.selection,
							request: payload.request,
							action: payload.action,
							edit: {
								...(payload.request === "A" ? {} : o.selection.record),
								...payload.record,
							},
							errors: {},
						},
					};
					const newLocalidades = {
						loading: null,
						params: {},
						data: [],
						error: null,
					};
					const edit = newList.selection.edit;
					if (edit.domicilioProvinciasId) {
						newLocalidades.loading = "Cargando...";
						newLocalidades.params.provinciaId = edit.domicilioProvinciasId;
					}
					setLocalidades(newLocalidades);
					return newList;
				});
			}
			case "list": {
				if (payload.clear)
					return setList((o) => ({
						...o,
						loading: null,
						data: [],
						error: null,
						selection: { ...selectionDef },
					}));
				return setList((o) => ({
					...o,
					loading: "Cargando...",
					params: { ...payload.params },
					pagination: {
						...o.pagination,
						...payload.pagination,
					},
					data: [],
				}));
			}
			default:
				return;
		}
	}, []);

	let form = null;
	if (list.selection.edit) {
		form = (
			<EstablecimientosForm
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				dependecies={{ motivosBaja, provincias, localidades }}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								nroSucursal: true,
								nombre: true,
								telefono: true,
								email: true,
								domicilioCalle: true,
								domicilioNumero: true,
								domicilioPiso: true,
								domicilioDpto: true,
								domicilioProvinciasId: true,
								domicilioLocalidadesId: true,
						  };
					if (list.selection.request !== "B") {
						r.refMotivosBajaId = true;
						r.deletedObs = true;
					}
					return r;
				})()}
				hide={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? { refMotivosBajaId: true, deletedObs: true }
						: {};
					if (list.selection.request === "C") {
						if (!list.selection.record.deletedDate) {
							r.refMotivosBajaId = true;
							r.deletedObs = true;
						}
					}
					if (list.selection.request !== "R") r.obs = true;
					return r;
				})()}
				onChange={(edit) => {
					const changes = { edit: { ...edit }, errors: {} };
					const applyChanges = ({ edit, errors } = changes) =>
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								edit: { ...o.selection.edit, ...edit },
								errors: { ...o.selection.errors, ...errors },
							},
						}));
					if ("domicilioProvinciasId" in edit) {
						if (edit.domicilioProvinciasId) {
							setLocalidades((o) => ({
								...o,
								loading: "Cargando...",
								params: { provinciaId: edit.domicilioProvinciasId },
								data: [],
								error: null,
							}));
						} else {
							changes.errors.domicilioProvinciasId =
								"Debe seleccionar una provincia";
						}
					}
					applyChanges();
				}}
				onClose={(confirm) => {
					if (!["A", "B", "M", "R"].includes(list.selection.request))
						confirm = false;
					if (!confirm) {
						setList((o) => ({
							...o,
							selection: {
								...selectionDef,
								index: o.selection.index,
								record: o.data.at(o.selection.index),
							},
						}));
						return;
					}

					const record = list.selection.edit;

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						if (!record.refMotivosBajaId)
							errors.refMotivosBajaId = "Dato requerido";
					} else if (list.selection.request === "R") {
					} else {
						if (!record.empresaId) errors.empresaId = "Dato requerido";
						if (!record.nombre) errors.nombre = "Dato requerido";
						if (!!record.email && !ValidarEmail(record.email))
							errors.email = "El correo ingresado tiene un formato incorrecto.";
						if (!record.domicilioProvinciasId)
							errors.domicilioProvinciasId = "Dato requerido";
						if (!record.domicilioLocalidadesId)
							errors.domicilioLocalidadesId = "Dato requerido";
						if (!record.domicilioCalle)
							errors.domicilioCalle = "Dato requerido";
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
								refMotivosBajaId: record.refMotivosBajaId,
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
			<EstablecimientosTable
				data={list.data}
				loading={!!list.loading}
				mostrarBuscar={false}
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
				onTableChange={(type, newState) => {
					switch (type) {
						case "sort": {
							const { sortField, sortOrder } = newState;
							return setList((o) => ({
								...o,
								loading: "Cargando...",
								params: {
									...o.params,
									orderBy: `${sortField}.${sortOrder}`,
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
	return [render, requestChanges, list.selection.record];
};

export default useEstablecimientos;
