import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import UsuariosTable from "./UsuariosTable";
import UsuariosForm from "./UsuariosForm";
import AsArray from "components/helpers/AsArray";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	apply: [],
	errors: null,
};

const useUsuarios = ({
	onLoadSelect = ({ data, record }) => AsArray(data)?.find((r) => r?.id === record?.id) ?? AsArray(data)?.at(0),
	remote: remoteInit = true,
} = {}) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/Usuario/GetAll`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/Usuario/registrar`,
						method: "POST",
					},
				};
			}
			case "Update": {
				
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/Usuario`,
						method: "PATCH",
					}
				};
			}
			case "DarDeBaja": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/Usuario/DarDeBaja`,
						method: "PUT",
					},
					params: otherParams,
				};
			}
			case "Reactivar": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/Usuario/Reactivar`,
						method: "PUT",
					},
					params: otherParams,
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
		data: [],
		pagination: { index: 1, size: 15 },
		error: null,
		selection: { ...selectionDef },
		remote: remoteInit,
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
			(console.log('usuarios_Data',data),
				setList((o) => {
					const selection = {
						...selectionDef,
						record:
							onLoadSelect({ data, record: o.selection.record }),
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
				})
			),
			onError: async (err) =>
				setList((o) => ({
					...o,
					loading: null,
					data: [],
					error: err.code === 404 ? null : err,
					selection: { ...selectionDef },
				})),
		});
	}, [pushQuery, list.loading, list.params]);
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
						selection: { ...selectionDef },
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
	if (list.selection.edit) {
		form = (
			<UsuariosForm
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								
								nombre: true,
								cuit: true,
								userName: true,
								email: true,
								emailConfirmed: true,
								phoneNumber: true,
								password: true,
								confirmPassword: true,

						  };
					if (list.selection.request !== "B") r.deletedObs = true;
					return r;
				})()}
				hide={(()=>{
					
					const h = ["A", "M"].includes(list.selection.request) ?
						{ deletedObs: true }
						: 
						{}

					if (!["A"].includes(list.selection.request)) {
						h.password= true
						h.confirmPassword= true
					}
					return h
				})()
					
				}
				onChange={(changes) =>
					setList((o) => ({
						...o,
						selection: {
							...o.selection,
							edit: {
								...o.selection.edit,
								...changes,
							},
						},
					}))
				}
				onClose={(confirm) => {
					if (!["A", "B", "M","R"].includes(list.selection.request))
						confirm = false;
					if (!confirm) {
						setList((o) => ({
							...o,
							selection: {
								...selectionDef,
								index: o.selection.index,
								record:
									o.selection.index > -1
										? o.data.at(o.selection.index)
										: o.selection.record,
							},
						}));
						return;
					}

					const record = list.selection.edit;
					//Validaciones
					const errors = {};
					if (list.selection.request === "B" || list.selection.request === "R") {
						 if (!record.deletedObs)
						 	errors.deletedObs = "Dato requerido";
					} else {

						if (!record.cuit) errors.cuit = "Dato requerido";
						if (!record.nombre) errors.nombre = "Dato requerido";
						if (!record.userName) errors.userName = "Dato requerido";
						if (!record.email) errors.email = "Dato requerido";

						if (list.selection.request === "A") {
							if (!record.password) errors.password = "Dato requerido";
							if (!record.confirmPassword) errors.confirmPassword = "Dato requerido";

							if (record.password !== record.confirmPassword){
								errors.password = "Las Claves deben ser idénticas";
								errors.confirmPassword = "Las Claves deben ser idénticas";
							} 
						}

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

					//ESTOS DELETE  DEBEN DESAPARECER CUANDO CIRO AGREGUE LOS CAMPOS DEL OBJ AL ENDPOINT
					delete record.confirmPassword;
		

					const query = {
						config: {},
						onOk: async (res) =>
							setList((old) => ({ ...old, loading: "Cargando..." })),
						onError: async (err) => alert(err.message),
					};

					switch (list.selection.request) {
						case "A":
							query.action = "Create";
							query.config.body = record;
							break;
						case "M":
							query.action = "Update";
							query.config.body = record;
							break;
						case "B":
							query.action = "DarDeBaja";
							//query.params = { id: record.id };
							query.config.body = {id: record.id, deletedObs: record.deletedObs};
							break;
						case "R":
							query.action = "Reactivar";
							//query.params = { id: record.id };
							query.config.body = { id: record.id };
							break;
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
			<UsuariosTable
				remote={true}
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
							pagination: { ...o.pagination, index, size },
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
			/>
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useUsuarios;
