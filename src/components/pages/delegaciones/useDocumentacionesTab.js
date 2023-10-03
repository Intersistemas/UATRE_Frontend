import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import DocumentacionTable from "components/Documentacion/DocumentacionTable";
import DocumentacionForm from "components/Documentacion/DocumentacionModal";

const useDocumentacionesTab = ({ entidadId = 0, entidadTipo = "" }) => {
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
		pushQuery({
			action: "GetTipoList",
			onOk: async (res) =>
				setTipoDocumentacionList({
					data: res.map((r) => ({ value: r.id, label: r.descripcion })),
				}),
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
		data: [],
		error: {},
	});
	useEffect(() => {
		pushQuery({
			action: "GetList",
			params: { entidadId: entidadId, entidadTipo: entidadTipo },
			onOk: async (res) => setList({ data: res }),
			onError: async (err) => {
				const newList = { data: [] };
				if (err.code !== 404) newList.error = err;
				setList(newList);
			},
		});
	}, [pushQuery, list.loading]);

	const [selected, setSelected] = useState({
		record: null,
		index: null,
		action: "",
		request: "",
	});
	//#endregion

	const sidebarHandler = useCallback(
		(request, action) =>
			setSelected((old) => ({
				...old,
				request: request,
				action: action,
				record: action === "A" ? {} : old.record,
			})),
		[]
	);

	let form = null;
	if (selected.request) {
		form = (
			<DocumentacionForm
				data={selected.record}
				title={selected.action}
				errores={selected.errores}
				dependecies={{ tipoDocumentacionList: tipoDocumentacionList }}
				disabled={
					["A", "M"].includes(selected.request)
						? {}
						: {
								codigoDelegacion: true,
								nombre: true,
						  }
				}
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
					record.entidadId = entidadId;
					record.entidadTipo = entidadTipo;

					//Validaciones
					const errores = {};
					if (selected.request === "B") {
						// if (!record.bajaObservacion)
						// 	errores.bajaObservacion = "Dato requerido";
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
								let newSelected = {};
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
								return { data: data };
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

	return [render, sidebarHandler, selected.record];
};

export default useDocumentacionesTab;
