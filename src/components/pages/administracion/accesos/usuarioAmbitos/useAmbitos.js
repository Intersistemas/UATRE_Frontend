
import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AmbitosTable from "./AmbitosTable";
import AmbitoUsuarioForm from "./UsuarioAmbitoForm";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};
 
const useAmbitos = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuarioAmbitos`,
						method: "GET",
					},
				};
			}

			case "GetListByUsuarioId": {
				const { usuarioId , ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						method: "GET",
						endpoint: `/UsuariosAmbitos/${usuarioId}`,
					},
					params: otherParams,
				};
			}
			
			case "CreateUA": {
				//  Enviar body como data (axios) y header JSON
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos`,
						method: "POST",
						headers: { "Content-Type": "application/json" },
						data: params ?? {}, // <- ANTES no enviaba nada del body
					},
				};
			}
			case "UpdateUA": {
				//  Tomar todo lo que venga excepto id y enviarlo como data
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos`,
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						data: otherParams ?? {}, // <- ANTES no enviaba nada del body
					},
					params: { id },
				};
			}
			case "DeleteUA": {
				// PATCH para baja lógica: construir endpoint con id y devolver params vacío
				const { id } = params || {};
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuariosAmbitos/DarDeBaja/${id}`,
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						// body must be provided by caller in query.config.body to avoid duplication
					},
					// devolver params vacío para que useQueryQueue no agregue query string
					params: {},
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
		error: null,
		selection: { ...selectionDef },
	});

	useEffect(() => {
		if (!list.loading) return;
		const action = list.params.usuarioId ? "GetListByUsuarioId" : "GetList";
		pushQuery({
			action: action,
			params: { ...list.params },

			onOk: async (data) => {
				// Filtrar solo los datos que tengan deletedDate = null,
				// esto asegura que solo se muestren los ambitos activos
				// y no los que han sido eliminados.
				const filteredData = data.filter((item) => item.deletedDate === null);
				setList((o) => {
					const selection = {
						...selectionDef,
						record:
							filteredData.find((r) => r.id === o.selection.record?.id) ?? filteredData.at(0),
					};
					if (selection.record) selection.index = filteredData.indexOf(selection.record);
					return {
						...o,
						loading: null,
						data: filteredData,
						error: null,
						selection,
					};
				});
			},
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
			<AmbitoUsuarioForm
				loading={!!list.loading}
				data={list.selection.edit}
				title={list.selection.action}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? {}
						: {
								ambitoId: true,
								ambitoTipo: true,
								deletedDate: true,
								deletedBy: true
						  };
					if (list.selection.request !== "B") r.deletedBy = true;

					return r;
				})()}
				hide={
					["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {}
				}
				onChange={(changes) => {
					const errors = {};
					setList((old) => ({ ...old, loading: null }));
					// Validación de duplicados
					const existingItem = list?.data?.find((t) => t.ambitoId === changes?.ambitoId && t.ambitoTipo === list.selection?.edit?.ambitoTipo);
					if (existingItem != null && list.selection?.edit?.ambitoTipo !== "T") {
						errors.ambitoId = "El Usuario ya posee este Ambito";
						errors.ambitoExiste = true;
					}

					setList((o) => ({
						...o,
						selection: {
							...o.selection,
							errors,
							edit: {
								...o.selection.edit,
								...changes,
							},
						},
					}));
				}}
				


				
	onClose={(confirm) => {
		if (!["A", "B", "M"].includes(list.selection.request)) confirm = false;
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
		const errors = {};

		// Solo validar campos requeridos si NO es una eliminación
		if (list.selection.request !== "B") {
			if (!record.ambitoId && record.ambitoTipo !== "T") errors.ambitoId = "Dato requerido";
			if (!record.ambitoTipo) errors.ambitoTipo = "Dato requerido";
			// Solo validar duplicados en caso de agregar o modificar
			const duplicateT = list?.data?.find((t) => t.ambitoTipo === "T");
			if (duplicateT != null && list.selection.edit.ambitoTipo === "T") {
				errors.ambitoTipo = "El Usuario ya posee este Ambito";
				errors.ambitoExiste = true;
			}
		}

		// Validación específica para eliminación
		if (list.selection.request === "B") {
			if (!record.deletedObs) errors.deletedObs = "Dato requerido";
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
			onOk: async (res) => setList((old) => ({ ...old, loading: "Cargando..." })),
			onError: async (err) => alert(err.message),
		};

		switch (list.selection.request) {
			case "A":
				query.action = "CreateUA";
				query.config.body = record;
				break;
			case "M":
				query.action = "UpdateUA";
				query.params = { id: record.id };
				query.config.body = record;
				break;
			case "B":
				query.action = "DeleteUA";
				query.params = { id: record.id };
				query.config.body = {
					id: record.id,
					deletedDate: new Date().toISOString(),
					deletedBy: record.deletedBy,
					deletedObs: record.deletedObs,
				};
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
			<AmbitosTable
				data={list.data}
				loading={!!list.loading}
				noDataIndication={
					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
				}
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

export default useAmbitos;
