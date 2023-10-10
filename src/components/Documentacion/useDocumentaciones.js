import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import DocumentacionTable from "./DocumentacionTable";
import DocumentacionForm from "./DocumentacionModal";

const selectedDef = {
	record: null,
	index: null,
	action: "",
	request: "",
};

const useDocumentaciones = () => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetTipoList":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefTipoDocumentacion/GetAll`,
						method: "GET",
					},
				};
			case "GetList":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DocumentacionEntidad/GetBySpec`,
						method: "GET",
					},
				};
			case "Create":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/DocumentacionEntidad`,
						method: "POST",
					},
				};
			case "Update":
				return (() => {
					const { id, ...otherParams } = params;
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/DocumentacionEntidad/${id}`,
							method: "PUT",
						},
						params: otherParams,
					};
				})();
			case "Delete":
				return (() => {
					const { id, ...otherParams } = params;
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/DocumentacionEntidad/${id}`,
							method: "DELETE",
						},
						params: otherParams,
					};
				})();
			default:
				return null;
		}
	});
	//#endregion

	//#region declaracion y carga list tipos documentacion
	const [tipoDocumentacionList, setTipoDocumentacionList] = useState({
		loading: "Cargando..",
		data: [],
		error: {},
	});
	useEffect(() => {
		if (!tipoDocumentacionList.loading) return;
		pushQuery({
			action: "GetTipoList",
			onOk: async (res) => setTipoDocumentacionList({ data: res }),
			onError: async (err) => {
				const newList = { data: [] };
				if (err.code !== 404) newList.error = err;
				setTipoDocumentacionList(newList);
			},
		});
	}, [pushQuery, tipoDocumentacionList.loading]);
	//#endregion

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: "Cargando..",
		params: { entidadTipo: "", entidadId: 0 },
		data: [],
		error: {},
	});

	const [selected, setSelected] = useState({ ...selectedDef });

	useEffect(() => {
		if (!list.loading) return;
		if (!list.params.entidadTipo || !list.params.entidadId) {
			setList({ params: list.params, data: [] });
			return;
		}
		pushQuery({
			action: "GetList",
			params: list.params,
			onOk: async (res) => {
				const newData = [...res];
				setList({ params: list.params, data: newData });
				setSelected((old) => {
					const newSelected = { ...selectedDef };
					if (!newData.length) return newSelected;
					newSelected.index = newData.findIndex(r => r.id === old.record?.id)
					if (newSelected.index < 0) newSelected.index = 0;
					newSelected.record = { ...newData[newSelected.index] };
					return newSelected;
				});
			},
			onError: async (err) => {
				const newList = { params: list.params, data: [] };
				if (err.code !== 404) newList.error = err;
				setList(newList);
				setSelected({ ...selectedDef });
			},
		});
	}, [pushQuery, list.loading, list.params]);
	//#endregion

	const requestChanges = useCallback((changes) => {
		switch (changes.type) {
			case "selected":
				return setSelected((old) => ({
					...old,
					request: changes.request,
					action: changes.action,
					record: changes.request === "A" ? {} : old.record,
				}));
			case "list":
				return setList({
					loading: "Cargando...",
					params: { ...changes.params },
					data: [],
				});
			default:
				return;
		}
	}, []);

	let form = null;
	if (selected.request) {
		form = (
			<DocumentacionForm
				data={selected.record}
				title={selected.action}
				errores={selected.errores}
				dependecies={{ tipoDocumentacionList: tipoDocumentacionList.data }}
				disabled={(() => {
					const r = ["A", "M"].includes(selected.request)
						? {}
						: {
								refTipoDocumentacionId: true,
								archivo: true,
								observaciones: true,
						  };
					if (selected.request !== "B") r.deletedObs = true
					return r;
				})()}
				hide={["A", "M"].includes(selected.request) ? { deletedObs: true } : {}}
				onChange={(changes) =>
					setSelected((old) => ({
						...old,
						record: {
							...old.record,
							...changes,
						},
					}))
				}
				onClose={(confirm) => {
					if (!["A", "B", "M"].includes(selected.request)) confirm = false;
					if (!confirm) {
						setSelected({
							record: {
								...list.data[selected.index],
							},
							index: selected.index,
						});
						return;
					}

					const record = { ...selected.record };
					record.entidadId = list.params.entidadId;
					record.entidadTipo = list.params.entidadTipo;

					//Validaciones
					const errores = {};
					if (selected.request === "B") {
						// if (!record.deletedObs)
						// 	errores.deletedObs = "Dato requerido";
					} else {
						if (!record.refTipoDocumentacionId)
							errores.refTipoDocumentacionId = "Dato requerido";
						if (!record.archivo) errores.archivo = "Dato requerido";
					}
					if (Object.keys(errores).length) {
						setSelected((old) => ({
							...old,
							errores: errores,
						}));
						return;
					}

					const query = {
						config: {},
						onOk: async (res) =>
							setList((old) => {
								const newSelected = {};
								const data = [...old.data];
								switch (selected.request) {
									case "A":
										newSelected.index = data.length;
										newSelected.record = {
											...record,
											id: res,
										};
										data.push({ ...newSelected.record });
										break;
									case "M":
										newSelected.index = selected.index;
										newSelected.record = { ...record };
										data.splice(selected.index, 1, record);
										break;
									case "B":
										data.splice(selected.index, 1);
										break;
									default:
										break;
								}
								setSelected(newSelected);
								return { params: old.params, data: data };
							}),
						onError: async (err) => alert(err.message),
					};
					switch (selected.request) {
						case "A":
							query.action = "Create";
							query.config.body = record;
							break;
						case "M":
							query.action = "Update";
							query.params = { id: record.id };
							query.config.body = record;
							break;
						case "B":
							query.action = "Delete";
							query.params = { id: record.id };
							query.config.body = record.bajaObservacion;
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
			<DocumentacionTable
				tipoList={tipoDocumentacionList.data}
				data={list.data}
				loading={!!list.loading}
				noDataIndication={
					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
				}
				selection={{
					selected: selected.record ? [selected.record.id] : [],
					onSelect: (row, isSelect, rowIndex, e) => {
						setSelected({
							record: { ...row },
							index: rowIndex,
							request: "",
						});
					},
				}}
			/>
			{form}
		</>
	);

	return [render, requestChanges, selected.record];
};

export default useDocumentaciones;
