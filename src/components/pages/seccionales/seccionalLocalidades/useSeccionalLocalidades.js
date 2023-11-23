import React, { useCallback, useEffect, useState,useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import SeccionalLocalidadesTable from "./SeccionalLocalidadesTable";
import AutoridadesForm from "./SeccionalLocalidadesForm";
import AuthContext from "../../../../store/authContext";
import moment from "moment";
import FormatearFecha from "components/helpers/FormatearFecha";
import SeccionalLocalidadesForm from "./SeccionalLocalidadesForm";


const vigenteHasta = new Date(2099, 11, 31);
const vigenteDesde = new Date();

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	errors: null,
};
 
const useSeccionalLocalidades = () => {

	const Usuario = useContext(AuthContext).usuario;


	//#region Trato queries a APIs

	const pushQuery = useQueryQueue((action, params) => {
		console.log('pushQuery_action_useSeccionalLocalidades',action," & ",params);
		
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalLocalidad/GetSeccionalLocalidadBySeccionalId`,
						method: "GET",
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalLocalidad`,
						method: "PUT",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalLocalidad`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalLocalidad/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactiva": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/SeccionalLocalidad/Reactivar`,
						method: "PATCH",
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
		//pagination: { index: 1, size: 5 },
		data: [],
		localidadesTodas: [],
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
				//pageIndex: list.pagination.index,
				//pageSize: list.pagination.size,
			},
			onOk: async (data) =>
				setList((o) => {
					//console.log('data_UseAutoridades:',data)
					const selection = {
						...selectionDef,
						record:
							data?.find((r) => r.id === o.selection.record?.id) ?? data?.at(0),
					};
					if (selection.record)
						selection.index = data.indexOf(selection.record);
					return {
						...o,
						loading: null,
						//pagination: { index, size, count },
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
		console.log('useSeccionalLocalidades Type:',type, " & payload:",payload)
		switch (type) {
			case "selected": {
				return setList((o) => ({
					...o,
					localidadesTodas: payload.localidades,
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
					localidadesTodas: payload.localidades,
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
			<SeccionalLocalidadesForm
				
				data={(() => { 
					//console.log('list.selection',list.selection)
					//INIT DE DATOS DEL FORM
					const data =
					//seccionalId = list.selection.edit.refSeccionalId,
						
						["B"].includes(list.selection.request) ? //INIT PARA BAJA
							{
								deletedDate: moment(vigenteDesde).format("YYYY-MM-DD"),
								deletedBy: Usuario.nombre,
								localidadesTodas: list.localidadesTodas,
							}:
							{localidadesTodas: list.localidadesTodas}

						return {...list.selection.edit, ...data}; //le paso el registro entero  y modifico los campos necesarios segun el request que se está haciendo
					})()
				}
				cargos={list.cargos}
				title={list.selection.action}
				loading={list.loading}
				errors={list.selection.errors}
				disabled={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? { }
						: {
							nombre: true,
							refLocalidadId	: true,
						  };
					if (list.selection.request !== "B")
					
						r.deletedObs = true;
						r.deletedBy=true;
						r.deletedDate=true;

					return r;

				})()}
				hide={(() => {
					const r = ["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {};
					if (list.selection.request !== "R") r.obs = true;
					return r;
				})()}
				onChange={(edit) => { //solo entra el campo que se está editando
					const changes = { edit: { ...edit }, errors: {} };
					console.log('useSeccionalLocs_onChange:',changes);
					const applyChanges = ({ edit, errors } = changes) =>
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								edit: { ...o.selection.edit, ...edit },
								errors: { ...o.selection.errors, ...errors },
							},
						}));
						//VALIDO EL NRO DEL AFILIADO
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

					console.log('record',record);
					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						if (!record.deletedObs)
						 	errors.deletedObs = "Dato requerido";
					} else {
						if (!record.refLocalidadId || record.refLocalidadId == 0) errors.refLocalidadId = "Dato requerido";
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
						onOk: (res) =>
							setList((old) => ({ ...old, loading: "Cargando..." })),
						onError: (err) => alert(err.message),
					};


					switch (list.selection.request) {
						case "A":
							query.action = "Create";
							query.config.body = {
								seccionalId: record.seccionalId,
								seccionalLocalidad: [{
									refLocalidadId: record.refLocalidadId
								}]
							};
							break;
						case "M":
							query.action = "Update";
							//query.params = { id: record.id };
							query.config.body = {
								id: record.id,
							}	
							break;
						case "B":
							query.action = "Delete";
							//query.params = { id: record.id };
							query.config.body = { id: record.id, deletedObs: record.deletedObs };
							break;
						case "R":
							query.action = "Reactiva";
							//query.params = { id: record.id };
							query.config.body = { id: record.id }
							break;
						default:
							break;
					}

					console.log('query',query);
					pushQuery(query);

				}}
			/>
		);
	}

	const render = () => (
		<>
			<SeccionalLocalidadesTable
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
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useSeccionalLocalidades;
